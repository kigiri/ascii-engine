const loader = (urlKey, tag, typeKey, type) => {
  const toURL = el => el[urlKey]
  const loaded = url => [...document.body.getElementsByTagName(tag)]
    .map(toURL)
    .includes(url)

  return url => {
    if (loaded(url)) throw new Error(`${type} ${url} already injected`)
    const elem = document.createElement(tag)
    const p = new Promise((resolve, reject) => {
      elem.onerror = event => {
        const err = new Error(`Error loading ${type} ${url}`)
        err.event = event
        reject(err)
      }
      elem.onload = resolve
    })

    elem[typeKey] = type
    elem[urlKey] = url
    document.body.appendChild(elem)

    return p
  }
}

const modules = {}
const loaders = {
  css: loader('href', 'link', 'rel', 'stylesheet'),
  js: loader('src', 'script', 'type', 'text/javascript')
}

export const cdn = (url, { ext } = {}) => {
  if (modules[url]) return modules[url]
  ext || (ext = url.split(/\.([^\.]+)$/)[1] || 'js')
  if (!loaders[ext]) throw Error(`No loader found for file type .${ext}`)
  return modules[url] = loaders[ext](url)
}

cdn.all = arr => Promise.all(arr.map(cdn))
