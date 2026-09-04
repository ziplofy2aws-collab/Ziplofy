function slugifyHandle(raw, fallback = 'item') {
  const base = String(raw || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'item';
}

module.exports = { slugifyHandle };
