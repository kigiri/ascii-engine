export const dependencies = [ 'loop' ]
import { debounce } from '../helper/ev.js'
export const responsive = ({ loop, into, canvas }) => {
  const [ main, sub ] = canvas.width > canvas.height
    ? [ 'width', 'height' ]
    : [ 'height', 'width' ]

  const ratio = canvas[sub] / canvas[main]

  let rect = {}
  const resize = () => {
    const r = into.getBoundingClientRect()
    if (rect.width === r.width && rect.height === r.height) return
    rect = r
    const size = Math.min(rect.height, rect.width)

    canvas.style[main] = `${size}px`
    canvas.style[sub] = `${size * ratio}px`
  }

  window.addEventListener('resize', debounce(loop.after.requester(resize)))

  return {
    get realWidth() { return rect.width },
    get realHeight() { return rect.height },
  }
}
