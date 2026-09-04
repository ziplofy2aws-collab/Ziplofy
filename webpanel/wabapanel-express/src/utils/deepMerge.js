/** Deep-merge `source` into a clone of `target` (objects/arrays only; arrays replaced). */
function deepMerge(target, source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return source;
  }
  const out =
    target && typeof target === 'object' && !Array.isArray(target)
      ? { ...target }
      : {};
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === 'object' &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

module.exports = { deepMerge };
