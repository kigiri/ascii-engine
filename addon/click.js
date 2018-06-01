import { ev } from '../helper/ev.js'
export const dependencies = [ 'responsive' ]
export const click = ({ canvas, size }) => {
  const event = ev()

  canvas.addEventListener('mousedown', e => {
    e.preventDefault()
    event.exec({
      y: Math.floor((e.y - size.rect.y) / size.height),
      x: Math.floor((e.x - size.rect.x) / size.width)
    })
  })

  return { click: event.sub }
}
