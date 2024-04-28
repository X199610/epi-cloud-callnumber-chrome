export function create(tagName: string, id: string, container?: Element | null): HTMLElement {
  const el = document.createElement(tagName)
  el.id = id || ''
  if (container) {
    container.appendChild(el)
  }
  return el
}
