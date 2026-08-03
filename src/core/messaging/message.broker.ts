import type {
  MessagePayload,
  MessageResponseType,
  MessageAction,
} from "./message.types";

export const MessageBroker = {
  send<T extends MessageAction>(
    payload: MessagePayload & { action: T },
  ): Promise<MessageResponseType<T>> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(payload, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  },
};
