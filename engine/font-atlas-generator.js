import { getFontRatio } from './font-ratio.js'

const calculateOptimalLength = (len, fontWidth, max) =>
  len * (len * fontWidth) < max
    ? calculateOptimalLength(len + 1, fontWidth, max)
    : len

export const generateAtlas = ({ fontFamily, chars, charCount, ...expected }) => {
  const range = chars.length
  const sqrt = Math.sqrt(range)
  const ratio = getFontRatio(fontFamily)
  const fontWidth = ratio.width * 1.5
  const len = calculateOptimalLength(1, fontWidth, range * 4 * ratio.height)
  const fontSize = expected.width / ratio.width / charCount
  const resolution = 2 ** Math.ceil(Math.log(fontSize * len) / Math.log(2))
  const lines = Math.ceil((range * 4) / len)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const width = resolution / len
  const height = resolution / lines
  const wPad = (width - ratio.width * fontSize) / 2
  const hPad = lines * ratio.height * fontSize
  const fonts = [
    `300 ${fontSize}px ${fontFamily}`,
    `900 ${fontSize}px ${fontFamily}`,
    `italic 300 ${fontSize}px ${fontFamily}`,
    `italic 900 ${fontSize}px ${fontFamily}`,
  ]

  canvas.height = canvas.width = resolution
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'white'

  const glyphs = Object.create(null)
  Array(4).fill().map((_, i) => glyphs[i] = Object.create(null))

  chars.repeat(4).split('').forEach((l, i) => {
    const typeIndex = Math.floor(i / range)
    ctx.font = fonts[typeIndex]

    const x = i % len
    const y = Math.floor(i / len)

    glyphs[typeIndex][l] = new Float32Array([
      x * width,         y * height,
      x * width + width, y * height,
      x * width,         y * height + height,
      x * width,         y * height + height,
      x * width + width, y * height,
      x * width + width, y * height + height,
    ].map(n => n / (resolution)))

    ctx.fillText(l, wPad + x * width, (y * height))
  })

  return {
    canvas,
    width,
    height,
    ratio,
    range,
    resolution,
    fontSize,
    glyphs,
    letterSpacing: fontSize * ratio.width - width,
    lineHeight: fontSize * ratio.height - height,
    length: len,
  }
}
