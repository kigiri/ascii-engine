import { watch, ev } from '../helper/ev.js'

const regular = {
  backspace: 8,
  tab: 9,
  enter: 13,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  '\'': 222,
}

const shifted = {
  ')': 48,
  '!': 49,
  '@': 50,
  '#': 51,
  '$': 52,
  '%': 53,
  '^': 54,
  '&': 55,
  '*': 56,
  '(': 57,
  ':': 186,
  '+': 187,
  '<': 188,
  '_': 189,
  '>': 190,
  '?': 191,
  '~': 192,
  '{': 219,
  '|': 220,
  '}': 221,
  '"': 222,
}

const modifiers = [ 'ctrl', 'shift', 'meta', 'alt' ]

export const dependencies = [ 'loop', 'responsive' ]
export const event = ({ loop, cache, canvas, size }) => {
  const { max } = cache
  const keys = Object.create(null)
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

  canvas.addEventListener('mouseup', e => mouse[mouseKeys[e.which]] = false)
  canvas.addEventListener('mousedown', e => {
    e.preventDefault()
    mouse[mouseKeys[e.which]] = true
  })

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


  const keyHandlers = Array(3).fill()
    .reduce(a => [ a, JSON.parse(JSON.stringify(a)) ], [{},{}])

  addEventListener('keyup', e => {
    const { which } = e
    keys[which] = undefined
    const handler = keyHandlers[+e.ctrlKey][+e.shiftKey][+e.metaKey][+e.altKey][which]
    handler && handler.exec()
  })

  addEventListener('keydown', (e) => {
    const { which } = e
    keys[which] = Date.now()
    const handler = keyHandlers[+e.ctrlKey][+e.shiftKey][+e.metaKey][+e.altKey][which]
    if (handler) {
      handler.keepDefault || e.preventDefault()
      handler.exec(keys[which])
    }
  })

  const proxyMod = (mods) => new Proxy({}, {
    get: (src, key) => {
      if (key === 'default') return proxyMod([ ...mods, 'default' ])
      if (modifiers.includes(key)) return proxyMod([ ...mods, key ])
      if (/[A-Z]/.test(key) || shifted[key]) {
        mods.push('shift')
      }
      const code = shifted[key] || regular[key] || key.toUpperCase().charCodeAt(0)
      const target = modifiers
        .reduce((acc, mod) => acc[Number(mods.includes(mod))], keyHandlers)

      const handler = target[code] || (target[code] = ev())
      modifiers.includes('default') && (handler.keepDefault = true)
      return handler.sub
    }
  })

  return { mouse, keys, event: { mouse: mouseEvent.sub, key: proxyMod([]) } }
}
