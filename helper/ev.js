export const debounce = (fn, delay = 200) => {
  let lastcall = 0, timeout
  const cb = () => {
    timeout = undefined
    lastcall = Date.now()
    fn()
  }

  return () => {
    if (timeout) return
    const now = Date.now()
    const diff = now - lastcall
    if (diff > delay) {
      lastcall = now
      return fn()
    }

    timeout = setTimeout(cb, diff)
  }
}

export const ev = () => {
  const set = new Set
  const sub = fn => (set.add(fn), fn)
  const oncer = fn => {
    const ff = () => (fn(), set.delete(ff))
    return ff
  }
  sub.once = fn => sub(oncer(fn))
  sub.requester = (fn, notImmediate) => {
    fn = oncer(fn)
    notImmediate || sub(fn)
    return () => sub(fn)
  }
  sub.in = (fn, delay = 0) => setTimeout(sub.once, delay, fn)
  sub.delete = fn => (set.delete(fn), fn)
  function exec() {
    for (const f of set) {
      f.apply(this, arguments)
    }
  }
  return { sub, exec }
}

export const map = (event, fn) => {
  const mapped = ev()
  event(value => mapped.exec(fn(value)))
  return mapped.sub
}

export const merge = events => {
  const merged = ev()
  for (const e of events) {
    e(merged.exec)
  }
  return merged.sub
}

export const watch = obj => {
  const trigger = ev()
  const any = ev()
  any.sub.on = {}

  for (const key of Object.keys(obj)) {
    const e = ev()
    any.sub.on[key] = e.sub
    let prev = obj[key]
    trigger.sub(() => {
      const next = obj[key]
      if (prev === next) return
      e.exec(next, prev)
      any.exec(obj, key)
      prev = next
    })
  }

  any.check = trigger.exec

  return any
}
