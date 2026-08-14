/**
 * Pure ESM surface for `set-cookie-parser` used by react-router.
 * Avoids Vite serving raw CJS without named exports (`splitCookiesString`).
 */

export function splitCookiesString(cookiesString: string | string[]): string[] {
  if (Array.isArray(cookiesString)) {
    return cookiesString;
  }
  if (typeof cookiesString !== 'string') {
    return [];
  }

  const cookiesStrings: string[] = [];
  let pos = 0;
  let start: number;
  let ch: string;
  let lastComma: number;
  let nextStart: number;
  let cookiesSeparatorFound: boolean;

  function skipWhitespace(): boolean {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  }

  function notSpecialChar(): boolean {
    ch = cookiesString.charAt(pos);
    return ch !== '=' && ch !== ';' && ch !== ',';
  }

  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;

    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ',') {
        lastComma = pos;
        pos += 1;

        skipWhitespace();
        nextStart = pos;

        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }

        if (pos < cookiesString.length && cookiesString.charAt(pos) === '=') {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.substring(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }

    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
    }
  }

  return cookiesStrings;
}

/** Stubs kept so accidental named imports do not crash; react-router only needs splitCookiesString. */
export function parse(): never {
  throw new Error('set-cookie-parser shim: parse is not implemented');
}

export function parseString(): never {
  throw new Error('set-cookie-parser shim: parseString is not implemented');
}

const setCookieParser = { splitCookiesString, parse, parseString };
export default setCookieParser;
