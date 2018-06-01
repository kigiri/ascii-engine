// construct colors from string
import * as dracula from '../theme/dracula.js'

const valsToRGB = (r, g, b) => [ r * 0xFF, g * 0xFF, b * 0xFF ]
const rgbToInt = (r, g, b) => (r << 16) + (g << 8) + b
const rgbToVals = (r, g, b) => [ r / 0xFF, g / 0xFF, b / 0xFF ]
const intToRGB = n => [ n >> 16 & 0xFF, n >> 8 & 0xFF, n & 0xFF ]
const intToHex = n => n.toString(16).padStart(6, 0)
const hexToInt = hex => parseInt(hex.replace('#', ''), 16)
const valsToInt = (r, g, b) => rgbToInt(...valsToRGB(r, g, b))
const hexToRGB = hex => intToRGB(hexToInt(hex))
const convert = {
  hex: {
    toInt: hexToInt,
    toRGB: hexToRGB,
    toVals: hex => rgbToVals(...hexToRGB(hex)),
  },
  int: {
    toRGB: intToRGB,
    toVals: n => rgbToVals(...intToRGB(n)),
    toHex: intToHex,
  },
  vals: {
    toRGB: valsToRGB,
    toInt: valsToInt,
    toHex: (...vals) => intToHex(valsToInt(...vals)),
  },
  rgb: {
    toInt: rgbToInt,
    toVals: rgbToVals,
    toHex: (...rgb) => intToHex(rgbToInt(...rgb)),
  }
}

const colorKeys = Object.keys(dracula)

export {
  convert
}
