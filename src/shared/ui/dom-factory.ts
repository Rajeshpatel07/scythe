interface ElementOptions {
  id?: string;
  className?: string;
  text?: string;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
  children: HTMLElement[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.id !== undefined) node.id = options.id;
  if (options.className !== undefined) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  for (const child of children) {
    node.appendChild(child);
  }
  return node;
}
