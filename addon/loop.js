import { ev } from '../helper/ev.js'

export const loop = ({ render }) => {
  const after = ev()
  const before = ev()

  requestAnimationFrame(function next() {
    before.exec()
    render()
    setTimeout(after.exec)
    requestAnimationFrame(next)
  })

  return {
    loop: {
      before: before.sub,
      after: after.sub,
    }
  }
}
