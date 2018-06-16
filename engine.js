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

  const cache = makeCache({ charCount, fontFamily, chars, height, width })
  const { row, max, positions, background, foreground, ui } = cache
  const { colorize, draw, clear } = initWebGL(canvas, cache.canvas, max)

  let color = 0
  const setColor = n => {
    color = n
    colorize((n >> 16 & 0xFF) / 0xFF, (n >> 8 & 0xFF) / 0xFF, (n & 0xFF) / 0xFF)
  }

  const drawChar = (c, position) => {
    if (!c.glyph) return
    c.color === color || setColor(c.color)
    draw(c.glyph, position)
  }

  const render = () => {
    clear()
    draw(foreground, positions, max)
  }

  const each = fn => {
    let i = -1
    while (++i < max) {
      fn(cache[i])
    }
  }

  clear()

  into.appendChild(canvas)

  const engine = {
    ...rest,
    into,
    each,
    cache,
    canvas,
    render,
    addons: new WeakSet,
    addon: list => loadAddonList(engine, list),
  }

  return engine
}

export {
  init,
  ASCII,
}
