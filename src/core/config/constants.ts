export const LOCALHOST_REGEX =
  /^(https?:\/\/)?localhost:\d+(\/.*)?(\?.*)?(#.*)?$/i;
export const LIKELY_URL_REGEX =
  /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/[^ ]*)?$/i;
export const IP_URL_REGEX =
  /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^ ]*)?$/i;
export const HAS_PROTOCOL_REGEX = /^https?:\/\//i;
export const WWW_REGEX = /^www\./i;
