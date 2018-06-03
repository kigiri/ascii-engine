import { generateAtlas } from './font-atlas-generator.js'

const makeChar = () => {
  const c = Object.create(null)
  c.color = undefined
  c.glyph = undefined
  c.letter = undefined
  c.mode = undefined
  return c
}

export const makeCache = engine => {
  const font = generateAtlas(engine)
  const { charCount: row, height } = engine
  const fontSpaceWidth = font.width + font.letterSpacing
  const fontSpaceHeight = font.height + font.lineHeight
  const fontLeftClip = -font.letterSpacing / 2
  const col = Math.ceil(height / fontSpaceHeight)

  return [ ...Array(row * col).keys() ]
    .map(i => [
      (i % row) * fontSpaceWidth - fontLeftClip,
      Math.floor(i / row) * fontSpaceHeight,
    ])
    .reduce((c, [x, y], i) => {
      c.background[i] = makeChar()
      c.foreground[i] = makeChar()
      c.ui[i] = makeChar()
      c.positions[i] = new Float32Array([
        x, y,
        x + font.width, y,
        x, y + font.height,
        x, y + font.height,
        x + font.width, y,
        x + font.width, y + font.height
      ])
      c[i] = {
        x,
        y,
        i,
        background: c.background[i],
        foreground: c.foreground[i],
        ui: c.ui[i],
        positions: c.positions[i],
      }
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
