import { makeCache } from './engine/font-cache.js'
import { initWebGL } from './engine/webgl.js'

const ASCII = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^'
  +'_`abcdefghijklmnopqrstuvwxyz{|}~'

const loadAddonList = async (engine, list) =>
  (await Promise.all(list.map(addon => importAddon(engine, addon))))
    .reduce(loadAddon, engine)

const importAddon = async (engine, name) => {
  const addon = await import(`./addon/${name}.js`)
  if (addon[name] === undefined) {
    throw Error(`AddOn ${name} has no export ${name}`)
  }
  if (addon.dependencies && addon.dependencies.length) {
    await loadAddonList(engine, addon.dependencies
      .filter(name => !engine.addons.has(addon)))
  }
  return addon[name]
}

const loadAddon = (engine, addon) => {
  if (engine.addons.has(addon)) return engine
  const addonProps = addon(engine)
  if (!addonProps) return engine
  const entries = Object.entries(Object.getOwnPropertyDescriptors(addonProps))
  for (const [ key, descriptor ] of entries) {
    if (key in engine) {
      console.warn(`Property ${key} overriden by addon ${addon.name}`)
    }
    Object.defineProperty(engine, key, descriptor)
  }
  engine.addons.add(addon)
  return engine
}


const init = ({
  fontWeightBold = 900,
  fontFamily = 'monospace',
  charCount = 80,
  lineCount,
  chars = ASCII,
  canvas,
  height,
  width,
  into,
  ...rest
} = {}) => {
  if (!canvas && !height && !width) {
    canvas = document.getElementsByTagName('canvas')[0]
  }

  canvas || (canvas = document.createElement('canvas'))
  if (height && width) {
    canvas.height = height
    canvas.width = width
  } else {
    height = canvas.height
    width = canvas.width
  }

  if (!canvas.height || !canvas.width) {
    throw Error(`Wrong canvas size w:${canvas.width} h:${canvas.height}`)
  }

  if (typeof into === 'string') {
    const el = document.querySelector(into)
    if (el == null) throw Error(`Query ${into} didn't find any element`)
    into = el
  }

  if (!(into instanceof Node)) {
    throw Error('Option `into` must be a Node or a valid css query')
  }

  const cache = makeCache({
    charCount,
    lineCount,
    fontFamily,
    chars,
    height,
    width
  })
  const { row, max, positions, background, foreground, ui } = cache
  const { colorize, draw, clear } = initWebGL(canvas, cache.canvas)

  let color
  const setColor = n => {
    if (typeof n !== 'number') return
    color = n
    colorize((n >> 16 & 0xFF) / 0xFF, (n >> 8 & 0xFF) / 0xFF, (n & 0xFF) / 0xFF)
  }

  setColor.vals = (r, g, b) => {
    color = (r * 0xFF << 16) + (g * 0xFF << 8) + b * 0xFF
    colorize(r, g, b)
  }

  setColor.rgb = (r, g, b) => setColor(r / 0xFF, g / 0xFF, b / 0xFF)
  setColor.hex = hex => setColor(parseInt(hex.replace('#', ''), 16))

  let mode = 0
  let level = 1
  let glyphs = cache.glyphs[mode]
  let charCache = foreground
  const levels = [ background, foreground, ui ]
  const setMode = m => glyphs = cache.glyphs[mode = m]
  const setLevel = l => charCache = levels[l]
  setMode.normal = () => setMode(0)
  setMode.bold = () => setMode(1)
  setMode.italic = () => setMode(2)
  setMode.boldItalic = () => setMode(3)
  setLevel.background = () => charCache = background
  setLevel.foreground = () => charCache = foreground
  setLevel.ui = () => charCache = ui

  const putCharAt = (letter, x, y) => {
    const c = charCache[y*row+x]
    if (!c) return

    const glyph = glyphs[letter]
    if (c.glyph === glyph && c.color === color) return

    c.glyph = glyph
    c.color = color
    return c
  }

  const drawChar = (c, position) => {
    if (!c.glyph) return
    c.color === color || setColor(c.color)
    draw(c.glyph, position)
  }

  const render = () => {
    clear()
    let i = -1
    while (++i < max) { drawChar(background[i], positions[i]) }
    i = -1
    while (++i < max) { drawChar(foreground[i], positions[i]) }
    i = -1
    while (++i < max) { drawChar(ui[i], positions[i]) }
  }

  const putStr = (str, x = 0, y = 0) => {
    let i = -1, letter
    while (++i < str.length) {
      letter = str[i]
      if (letter === '\n') {
        x = 0
        y++
      } else {
        if (x > charCount) {
          y++
          x = 0
        }

        putCharAt(letter, x, y)
        x++
      }
    }
  }

  clear()

  into.appendChild(canvas)

  const engine = {
    ...rest,
    into,
    cache,
    canvas,
    charCount,
    lineCount,
    text: putStr,
    char: putCharAt,
    mode: setMode,
    level: setLevel,
    color: setColor,
    addons: new WeakSet,
    addon: list => loadAddonList(engine, list),
  }

  return engine
}

export {
  init,
  ASCII,
}
