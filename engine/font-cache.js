import { generateAtlas } from './font-atlas-generator.js'

const makeChar = (x, y, i) => {
  const c = Object.create(null)
  c.x = x
  c.y = y
  c.i = i
  c.color = undefined
  c.glyph = undefined
  return c
}

export const makeCache = engine => {
  const font = generateAtlas(engine)
  const { charCount: row, height } = engine
  const fontSpaceWidth = font.width + font.letterSpacing
  const fontSpaceHeight = font.height + font.lineHeight
  const fontLeftClip = -font.letterSpacing / 2
  const col = engine.lineCount || Math.ceil(height / font.height)

  return [ ...Array(row * col).keys() ]
    .map(i => [
      (i % row) * fontSpaceWidth - fontLeftClip,
      Math.floor(i / row) * fontSpaceHeight,
    ])
    .reduce((c, [x, y], i) => {
      c.background[i] = makeChar(x, y, i)
      c.foreground[i] = makeChar(x, y, i)
      c.ui[i] = makeChar(x, y, i)
      c.positions[i] = new Float32Array([
        x, y,
        x + font.width, y,
        x, y + font.height,
        x, y + font.height,
        x + font.width, y,
        x + font.width, y + font.height
      ])
      return c
    }, {
      max: row * col,
      glyphs: font.glyphs,
      row,
      col,
      positions: Object.create(null),
      background: Object.create(null),
      foreground: Object.create(null),
      ui: Object.create(null),
      canvas: font.canvas
    })
}
