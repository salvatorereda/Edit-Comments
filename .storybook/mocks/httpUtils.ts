// HttpUtils.ts pulls in axios, Sentry and the app's error classes. CommentContent
// only needs replaceUrlsWithLinks, copied here unchanged from
// src/utils/HttpUtils.ts (same URL regex, same escaping).
import { GLOBAL_EMAIL_REGEX, isEmail } from '@/utils/EmailUtils';

const URL_REGEX = new RegExp(
  "((?:(http|https|Http|Https):\\/\\/(?:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)" +
    '\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,64}(?:\\:(?:[a-zA-Z0-9\\$\\-\\_' +
    "\\.\\+\\!\\*\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,25})?\\@)?)?" +
    '((?:(?:[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}\\.)+' +
    '(?:[a-zA-Z]+))' +
    '(?:\\:\\d{1,5})?))' +
    '(\\/(?:(?:[a-zA-Z0-9\\;\\/\\?\\:\\@\\&\\=\\#\\~' +
    "\\-\\.\\+\\!\\*\\'\\(\\)\\,\\_])|(?:\\%[a-fA-F0-9]{2}))*)?" +
    '(?:\\b|$)'
);

export function replaceUrlsWithLinks(text: string): string {
  const emailOrUrlRegexp = new RegExp(
    `(${GLOBAL_EMAIL_REGEX.source})|(${URL_REGEX.source})`,
    'g'
  );

  return text
    .replaceAll(/>/g, '&gt;')
    .replaceAll(/</g, '&lt;')
    .replaceAll(emailOrUrlRegexp, (emailOrUrl) => {
      if (isEmail(emailOrUrl)) {
        return `<a href="mailto:${emailOrUrl}">${emailOrUrl}</a>`;
      } else {
        const target = /^http(s)?:\/\//.test(emailOrUrl)
          ? emailOrUrl
          : `https://${emailOrUrl}`;
        return `<a href="${target}" target="_blank">${emailOrUrl}</a>`;
      }
    });
}
