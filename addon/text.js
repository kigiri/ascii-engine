
export const text = ({ each, cache }) => {
  const { row } = cache

  const makeSetter = mode => {
    const glyphs = cache.glyphs[mode]
    const setter = (char, letter) => {
      char.glyph = glyphs[letter]
      char.letter = letter
      char.mode = mode
    }

    setter.color = (char, letter, color) => {
      setter(char, letter)
      char.color = color
    }

    return setter
  }

  const set = makeSetter(0)
  set.bold = makeSetter(1)
  set.italic = makeSetter(2)
  set.boldItalic = makeSetter(3)

  const makeGetter = level => {
    const getter = i => level[i]
    getter.xy = (x, y) => getter(y*row*x)
    return getter
  }

  const get = makeGetter(cache)
  get.bg = makeGetter(cache.background)
  get.fg = makeGetter(cache.foreground)
  get.ui = makeGetter(cache.ui)

  return { char: { get, set } }

  const putStr = (str, x = 0, y = 0) => {
    let i = -1, letter
    while (++i < str.length) {
      letter = str[i]
      if (letter === '\n') {
        x = 0
        y++
      } else {
        if (x > row) {
          y++
          x = 0
        }

        setLetter(letter, y*row+x)
        x++
      }
    }
  }
}
