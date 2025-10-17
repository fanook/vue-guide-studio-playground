const isElement = (node) => node && node.nodeType === 1

const cleanToken = (token) => token.replace(/([:.])/g, '\\$1')

const buildClassToken = (classList) => {
  if (!classList || !classList.length) return ''
  const classes = Array.from(classList)
    .filter((name) => name && !name.startsWith('guide-'))
    .slice(0, 2)
  return classes.length ? `.${classes.map(cleanToken).join('.')}` : ''
}

export const getUniqueSelector = (element) => {
  if (!isElement(element)) return null

  if (element.id) {
    return `#${cleanToken(element.id)}`
  }

  const parts = []
  let current = element
  while (current && current !== document.body) {
    const tag = current.tagName ? current.tagName.toLowerCase() : ''
    if (!tag) break

    const classToken = buildClassToken(current.classList)
    let selector = `${tag}${classToken}`

    if (!current.id) {
      const siblings = Array.from(current.parentNode?.children || []).filter(
        (node) => node.tagName === current.tagName,
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        selector += `:nth-of-type(${index})`
      }
    }

    parts.unshift(selector)

    if (current.id) {
      parts[0] = `#${cleanToken(current.id)}`
      break
    }

    current = current.parentNode
  }

  return parts.join(' > ')
}
