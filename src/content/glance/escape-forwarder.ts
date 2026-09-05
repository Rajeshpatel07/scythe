(() => {
  if (window.self === window.top) return;

  window.addEventListener(
    "keydown",
    (e: KeyboardEvent) => {
      if (e.key !== "Escape" && (e as KeyboardEvent).code !== "Escape") return;
      if (e.defaultPrevented) return;
      if (document.fullscreenElement) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        window.parent.postMessage({ type: "scythe:closeGlance" }, "*");
      } catch {}
      try {
        chrome.runtime.sendMessage({ action: "closeGlanceFromFrame" });
      } catch {}
    },
    { capture: true },
  );
})();
