const fs = require('fs');
const path = require('path');

function storeInformaticThemeConfigFilePath(storeId, themeId) {
  return path.join(
    process.cwd(),
    'uploads',
    'webpanel-stores',
    String(storeId),
    'informatic-themes',
    String(themeId),
    'store-theme-config.json'
  );
}

function readStoreInformaticThemeConfigFile(storeId, themeId) {
  const filePath = storeInformaticThemeConfigFilePath(storeId, themeId);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoreInformaticThemeConfigFile(storeId, themeId, config) {
  const filePath = storeInformaticThemeConfigFilePath(storeId, themeId);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
  return filePath;
}

function deleteStoreInformaticThemeConfigFile(storeId, themeId) {
  const filePath = storeInformaticThemeConfigFilePath(storeId, themeId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  readStoreInformaticThemeConfigFile,
  writeStoreInformaticThemeConfigFile,
  deleteStoreInformaticThemeConfigFile,
};
