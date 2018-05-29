import { makeCache } from './engine/font-cache.js'
import { initWebGL } from './engine/webgl.js'

const ASCII = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^'
  +'_`abcdefghijklmnopqrstuvwxyz{|}~'

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
    throw Error(`wrong canvas size w:${canvas.width} h:${canvas.height}`)
  }

  typeof into === 'string' && (into = document.querySelector(into))

  const cache = makeCache({ charCount, lineCount, fontFamily, chars, height, width })
  const { colorize, draw, clear } = initWebGL(canvas, cache.canvas)

  let color
  const setColor = (r, g, b) => {
    color = (r * 0xFF << 16) + (g * 0xFF << 8) + b * 0xFF
    colorize(r, g, b)
  }

  setColor.rgb = (r, g, b) => setColor(r / 0xFF, g / 0xFF, b / 0xFF)
  setColor.int = n => setColor.rgb(n >> 16 & 0xFF, n >> 8 & 0xFF, n & 0xFF)
  setColor.hex = hex => setColor.int(parseInt(hex.replace('#', ''), 16))

  let glyphs = cache.glyphs[0]
  const setMode = (mode = 0) => glyphs = cache.glyphs[mode]
  setMode.normal = () => setMode(0)
  setMode.bold = () => setMode(1)
  setMode.italic = () => setMode(2)
  setMode.boldItalic = () => setMode(3)

  const putCharAt = (letter, x, y) => {
    const c = cache[y*cache.row+x]
    if (!c) return
    const glyph = glyphs[letter]
    if (c.glyph === glyph && c.color === color) return

    c.glyph = glyph
    c.color = color

    draw(c)
  }

  let rendering
  const render = () => {
    clear()
    let i = -1, c
    while (++i < cache.max) {
      c = cache[i]
      if (c.color !== color) {
        setColor.int(c.color)
      }
      draw(c)
    }
    rendering = false
  }

  const requestRender = () =>
    rendering || (rendering = requestAnimationFrame(render))

  const putStr = (str, x = 0, y = 0) => {
    let i = -1, letter
    while (++i < str.length) {
      letter = str[i]
      if (letter === '\n') {
        x = 0
        y++
        continue
      }

      if (x > charCount) {
        y++
        x = 0
      }

      putCharAt(letter, x, y)
      x++
    }
  }

  clear()
  into && into.appendChild(canvas)

  return {
    cache,
    render: requestRender,
    canvas,
    clear,
    text: putStr,
    char: putCharAt,
    color: setColor,
    mode: setMode,
  }
}

export {
  init,
  ASCII,
}
