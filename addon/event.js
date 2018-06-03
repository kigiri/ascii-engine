import { watch } from '../helper/ev.js'

const regular = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: '\'',
}

const shifted = {
  ...regular,
  48: ')',
  49: '!',
  50: '@',
  51: '#',
  52: '$',
  53: '%',
  54: '^',
  55: '&',
  56: '*',
  57: '(',
  186: ':',
  187: '+',
  188: '<',
  189: '_',
  190: '>',
  191: '?',
  192: '~',
  219: '{',
  220: '|',
  221: '}',
  222: '"',
}

export const dependencies = [ 'loop', 'responsive' ]
export const event = ({ loop, cache, canvas, size }) => {
  const { max } = cache
  const mouse = Object.create(null)
  mouse.hover = undefined
  mouse.x = 0
  mouse.y = 0
  mouse.i = 0
  mouse.l = false
  mouse.m = false
  mouse.r = false

  const mouseKeys = Object.create(null)
  mouseKeys[1] = 'l'
  mouseKeys[2] = 'm'
  mouseKeys[3] = 'r'

  canvas.addEventListener('mousedown', e => {
    e.preventDefault()
    mouse[mouseKeys[e.which]] = true
  })

  canvas.addEventListener('mouseup', e => mouse[mouseKeys[e.which]] = false)
  canvas.addEventListener('mousemove', e => {
    mouse.x = Math.max(0, Math.floor((e.pageX - size.rect.x) / size.width)) || 0
    mouse.y = Math.max(0, Math.floor((e.pageY - size.rect.y) / size.height)) || 0
    mouse.i = Math.min(max - 1, Math.max(0, mouse.y * cache.row + mouse.x))
    mouse.hover = cache[mouse.i]
    if (!e.which) {
      mouse.l = false
      mouse.m = false
      mouse.r = false
    }
  })

  canvas.addEventListener('mouseleave', e => mouse.hover = undefined)

  const mouseEvent = watch(mouse)
  loop.before(mouseEvent.check)

  return { mouse, event: { mouse: mouseEvent.sub } }
}
