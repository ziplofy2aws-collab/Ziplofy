/**
 * Pure ESM reimplementation of the `cookie` package surface that react-router uses.
 * Avoids Vite serving CJS `cookie` without named/default exports (`.parse` on undefined).
 *
 * Compatible with cookie@1.x `parse` / `serialize` used by react-router.
 */

type ParseOptions = {
  decode?: (value: string) => string;
};

type SerializeOptions = {
  encode?: (value: string) => string;
  maxAge?: number;
  domain?: string;
  path?: string;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  partitioned?: boolean;
  priority?: 'low' | 'medium' | 'high' | string;
  sameSite?: boolean | 'strict' | 'lax' | 'none' | 'Strict' | 'Lax' | 'None' | string;
};

const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
const domainValueRegExp =
  /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
const __toString = Object.prototype.toString;

const NullObject = /* @__PURE__ */ (() => {
  const C = function () {};
  C.prototype = Object.create(null);
  return C;
})();

function decode(str: string): string {
  if (str.indexOf('%') === -1) return str;
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function isDate(val: unknown): val is Date {
  return __toString.call(val) === '[object Date]';
}

function startIndex(str: string, index: number, max: number): number {
  do {
    const code = str.charCodeAt(index);
    if (code !== 0x20 && code !== 0x09) return index;
  } while (++index < max);
  return max;
}

function endIndex(str: string, index: number, min: number): number {
  while (index > min) {
    const code = str.charCodeAt(--index);
    if (code !== 0x20 && code !== 0x09) return index + 1;
  }
  return min;
}

export function parse(str: string, options?: ParseOptions): Record<string, string | undefined> {
  const obj = new (NullObject as new () => Record<string, string | undefined>)();
  const len = str.length;
  if (len < 2) return obj;

  const dec = options?.decode || decode;
  let index = 0;
  do {
    const eqIdx = str.indexOf('=', index);
    if (eqIdx === -1) break;
    const colonIdx = str.indexOf(';', index);
    const endIdx = colonIdx === -1 ? len : colonIdx;
    if (eqIdx > endIdx) {
      index = str.lastIndexOf(';', eqIdx - 1) + 1;
      continue;
    }
    const keyStartIdx = startIndex(str, index, eqIdx);
    const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
    const key = str.slice(keyStartIdx, keyEndIdx);
    if (obj[key] === undefined) {
      const valStartIdx = startIndex(str, eqIdx + 1, endIdx);
      const valEndIdx = endIndex(str, endIdx, valStartIdx);
      obj[key] = dec(str.slice(valStartIdx, valEndIdx));
    }
    index = endIdx + 1;
  } while (index < len);
  return obj;
}

export function serialize(name: string, val: string, options?: SerializeOptions): string {
  const enc = options?.encode || encodeURIComponent;
  if (!cookieNameRegExp.test(name)) {
    throw new TypeError(`argument name is invalid: ${name}`);
  }
  const value = enc(val);
  if (!cookieValueRegExp.test(value)) {
    throw new TypeError(`argument val is invalid: ${val}`);
  }
  let str = `${name}=${value}`;
  if (!options) return str;

  if (options.maxAge !== undefined) {
    if (!Number.isInteger(options.maxAge)) {
      throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
    }
    str += `; Max-Age=${options.maxAge}`;
  }
  if (options.domain) {
    if (!domainValueRegExp.test(options.domain)) {
      throw new TypeError(`option domain is invalid: ${options.domain}`);
    }
    str += `; Domain=${options.domain}`;
  }
  if (options.path) {
    if (!pathValueRegExp.test(options.path)) {
      throw new TypeError(`option path is invalid: ${options.path}`);
    }
    str += `; Path=${options.path}`;
  }
  if (options.expires) {
    if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
      throw new TypeError(`option expires is invalid: ${options.expires}`);
    }
    str += `; Expires=${options.expires.toUTCString()}`;
  }
  if (options.httpOnly) str += '; HttpOnly';
  if (options.secure) str += '; Secure';
  if (options.partitioned) str += '; Partitioned';
  if (options.priority) {
    const priority =
      typeof options.priority === 'string' ? options.priority.toLowerCase() : undefined;
    switch (priority) {
      case 'low':
        str += '; Priority=Low';
        break;
      case 'medium':
        str += '; Priority=Medium';
        break;
      case 'high':
        str += '; Priority=High';
        break;
      default:
        throw new TypeError(`option priority is invalid: ${options.priority}`);
    }
  }
  if (options.sameSite) {
    const sameSite =
      typeof options.sameSite === 'string' ? options.sameSite.toLowerCase() : options.sameSite;
    switch (sameSite) {
      case true:
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
    }
  }
  return str;
}

const cookie = { parse, serialize };
export default cookie;
