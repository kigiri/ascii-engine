import { generateAtlas } from './font-atlas-generator.js'

export const makeCache = ({ charCount, lineCount, fontFamily, chars, height, width }) => {
  const font = generateAtlas({ fontFamily, chars, charCount, width })
  const fontSpaceWidth = font.width + font.letterSpacing
  const fontSpaceHeight = font.height + font.lineHeight
  const fontLeftClip = -font.letterSpacing / 2

  if (!lineCount) {
    lineCount = Math.ceil(height / font.height)
  }

  return Array(charCount * lineCount)
    .fill()
    .map((_, i) => [
      (i % charCount) * fontSpaceWidth - fontLeftClip,
      Math.floor(i / charCount) * fontSpaceHeight,
    ])
    .reduce((c, [x, y], i) => (c[i] = Object.assign(Object.create(null), {
      position: new Float32Array([
       x, y,
       x + font.width, y,
       x, y + font.height,
       x, y + font.height,
       x + font.width, y,
       x + font.width, y + font.height,
      ])
    }), c), Object.assign(Object.create(null), {
      max: charCount * lineCount,
      glyphs: font.glyphs,
      row: charCount,
      col: lineCount,
      canvas: font.canvas,
    }))
}
