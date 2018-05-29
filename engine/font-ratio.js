export const getFontRatio = fontFamily => {
  const div = document.createElement('span')
  div.style.fontFamily = fontFamily
  div.style.fontSize = `1024px`
  div.style.fontWeight = 900
  div.style.fontStyle = 'italic'
  div.textContent = 'M'
  document.documentElement.appendChild(div)
  const { width, height } = div.getBoundingClientRect()
  div.remove()
  return { width: width / 1024, height: height / 1024 }
}
