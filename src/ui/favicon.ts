export function createFaviconURL(url: string) {
  const favicon = new URL(chrome.runtime.getURL("/_favicon/"));
  favicon.searchParams.set("pageUrl", url);
  favicon.searchParams.set("size", "32");
  return favicon.toString();
}
