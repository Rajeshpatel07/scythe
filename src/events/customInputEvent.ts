export function fireCustomInputEvent(
  e: KeyboardEvent,
  searchInput: HTMLInputElement,
) {
  if (searchInput && e.key.length === 1) {
    const start = searchInput.selectionStart;
    const end = searchInput.selectionEnd;
    const text = searchInput.value;

    if (start == null || end == null) return;

    searchInput.value = text.substring(0, start) + e.key + text.substring(end);
    searchInput.selectionStart = searchInput.selectionEnd = start + 1;

    searchInput.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true }),
    );
  } else if (searchInput && e.key === "Backspace") {
    const start = searchInput.selectionStart;
    const end = searchInput.selectionEnd;

    if (start == null || end == null) return;
    if (start === end && start > 0) {
      searchInput.value =
        searchInput.value.substring(0, start - 1) +
        searchInput.value.substring(end);
      searchInput.selectionStart = searchInput.selectionEnd = start - 1;
    } else {
      searchInput.value =
        searchInput.value.substring(0, start) +
        searchInput.value.substring(end);
      searchInput.selectionStart = searchInput.selectionEnd = start;
    }
    if (start !== 0 && end !== 0) {
      searchInput.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    }
  }
}
