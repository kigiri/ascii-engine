export const dependencies = [ 'loop' ]
import { debounce } from '../helper/ev.js'
export const responsive = ({ loop, into, canvas, cache: { row, col } }) => {
  const [ [ main, mainCount ], [ sub, subCount ] ] = canvas.width > canvas.height
    ? [ [ 'width', row ], [ 'height', col ] ]
    : [ [ 'height', col ], [ 'width', row ] ]

  console.log({ row, col, main, sub, mainCount, subCount })

  const ratio = canvas[sub] / canvas[main]

  const size = Object.create(null)
  const px = size.px = Object.create(null)
  size.width = null
  size.height = null
  size.rect = {}
  const resize = loop.after.requester(() => {
    const { height, width } = into.getBoundingClientRect()
    size.rect = canvas.getBoundingClientRect()
    const max = Math.min(height, width)
    if (max === px[main]) return
    px[main] = max
    px[sub] = max * ratio
    size[main] = max / mainCount
    size[sub] = px[sub] / subCount
    requestUpdate()
  })

  window.addEventListener('resize', resize)

  const requestUpdate = debounce(loop.before.requester(() => {
    canvas.style[main] = `${px[main]}px`
    canvas.style[sub] = `${px[sub]}px`
    resize()
  }))

  return { size }
}
