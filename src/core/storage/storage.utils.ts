export const storage = {
  local: {
    get<T>(keys: string | string[]): Promise<Record<string, T>> {
      return chrome.storage.local.get(keys) as Promise<Record<string, T>>;
    },
    set(items: Record<string, unknown>): Promise<void> {
      return chrome.storage.local.set(items);
    },
    remove(keys: string | string[]): Promise<void> {
      return chrome.storage.local.remove(keys);
    },
  },
  sync: {
    get<T>(keys: string | string[]): Promise<Record<string, T>> {
      return chrome.storage.sync.get(keys) as Promise<Record<string, T>>;
    },
    set(items: Record<string, unknown>): Promise<void> {
      return chrome.storage.sync.set(items);
    },
    remove(keys: string | string[]): Promise<void> {
      return chrome.storage.sync.remove(keys);
    },
  },
};
