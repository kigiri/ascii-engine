export const ev = () => {
  const set = new Set
  const sub = fn => (set.add(fn), fn)
  const oncer = fn => () => (fn(), set.remove(fn))
  sub.once = fn => sub(oncer(fn))
  sub.requester = (fn, notImmediate) => {
    const oncer = oncer(fn)
    notImmediate || sub(oncer)
    return () => sub(oncer)
  }
  sub.in = (fn, delay = 0) => setTimeout(sub.once, delay, fn)
  sub.remove = fn => (set.remove(fn), fn)
  function exec() {
    for (const f of set) {
      f.apply(this, arguments)
    }
  }
  return { sub, exec }
}
