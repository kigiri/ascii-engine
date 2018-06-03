export const clear = ({ cache }) => {
  const { max, row } = cache

  const clearCharLevel = c => {
    c.color = undefined
    c.glyph = undefined
    c.letter = undefined
    c.mode = undefined
  }

  const clearChar = c => {
    clearCharLevel(c.background)
    clearCharLevel(c.foreground)
    clearCharLevel(c.ui)
  }

  const clearCache = () => {
    let i = -1, c
    while (++i < max) {
      clearChar(cache[i])
    }
  }

  clearCache.char = (x, y) => {
    const c = cache[y*row+x]
    if (!c) return
    clearChar(c)
  }

  clearCache.line = y => {
    const r = y*row
    const end = r+row
    if (end > max) return
    let i = r - 1
    while (++i < end) {
      clearChar(cache[i])
    }
  }

  clearCache.line.vertical = x => {
    if (x > row) return
    let i = 0
    while (i < end) {
      clearChar(cache[i])
      i += row
    }
  }

  return { clear: clearCache }
}
