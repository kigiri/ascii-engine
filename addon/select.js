export const select = ({ cache }) => {
  const { max, row, col } = cache
  const last = max - 1

  const range = (start, end) => {
    if (start > end) {
      let tmp = end
      end = start
      start = tmp
    }
    start = Math.max(0, start)
    end = Math.min(end, last)
    const size = end - start + 1
    const ret = Array(size)
    let i = -1
    while (++i < size) {
      ret[i] = cache[start + i]
    }
    return ret
  }

  const area = (start, end) => {
    start = Math.max(0, start)
    end = Math.min(end, max)

    const x1 = start % row
    const y1 = Math.floor(start / row)
    const x2 = end % row
    const y2 = Math.floor(end / row)

    const xStart = Math.min(x1, x2)
    const yStart = Math.min(y1, y2)
    const xEnd = Math.max(x1, x2) + 1
    const yEnd = Math.max(y1, y2) + 1

    const width = xEnd - xStart
    const height = yEnd - yStart
    const size = width * height
    const top = row * yStart

    const ret = Array(size)

    let i = -1
    while (++i < size) {
      ret[i] = cache[top + Math.floor(i / width) * row + xStart + (i % width)]
    }
    return ret
  }

  return {
    select: {
      range,
      area,
    }
  }
}
