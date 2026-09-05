(() => {
  if (window.self === window.top) return;

  const stripFrameAncestorsMeta = () => {
    document
      .querySelectorAll<HTMLMetaElement>(
        'meta[http-equiv="Content-Security-Policy" i], meta[http-equiv="Content-Security-Policy-Report-Only" i]',
      )
      .forEach((meta) => {
        const content = meta.getAttribute("content") || "";
        if (/frame-ancestors/i.test(content)) {
          meta.remove();
        }
      });
  };

  stripFrameAncestorsMeta();

  const startObserving = () => {
    const target = document.documentElement;
    if (!target) return;

    const observer = new MutationObserver(stripFrameAncestorsMeta);
    observer.observe(target, { childList: true, subtree: true });
  };

  if (document.documentElement) {
    startObserving();
  } else {
    document.addEventListener("DOMContentLoaded", startObserving, {
      once: true,
    });

    // Fallback for very early document_start where documentElement not yet exists
    const readyCheck = setInterval(() => {
      if (document.documentElement) {
        clearInterval(readyCheck);
        startObserving();
      }
    }, 5);
    setTimeout(() => clearInterval(readyCheck), 1000);
  }
})();
