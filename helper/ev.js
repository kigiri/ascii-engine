export const debounce = (fn, delay = 200) => {
  let timeout
  const cb = () => console.log({ delay }) || fn(timeout = undefined)
  return () => timeout || (timeout = setTimeout(cb, delay))
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
