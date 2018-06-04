import { debounce } from '../helper/ev.js'

export const dependencies = [ 'loop' ]
export const responsive = ({ loop, into, canvas, cache: { row, col } }) => {
  const ratio = canvas.width / canvas.height
  const size = Object.create(null)
  const px = size.px = Object.create(null)
  size.width = null
  size.height = null
  size.rect = {}
  const resize = loop.after.requester(() => {
    const { height, width } = into.getBoundingClientRect()
    size.rect = canvas.getBoundingClientRect()
    px.width = width
    px.height = height
    size.width = size.rect.width / row
    size.height = size.rect.height / col
    requestUpdate()
  })

  window.addEventListener('resize', resize)

  const requestUpdate = debounce(loop.before.requester(() => {
    canvas.style.maxHeight = `${px.height}px`
    canvas.style.maxWidth = `${px.width}px`
    resize()
  }))

  return { size }
}
