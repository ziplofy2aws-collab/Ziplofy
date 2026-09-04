const axios = require('axios');
const s3Service = require('../services/s3Service');
const { patchInformaticEditorPack } = require('../utils/informaticRuntimeTemplates.util');

const CODIIC_API_BASE =
  (process.env.CODIIC_API_URL || process.env.CODIIC_SERVER_URL || 'http://127.0.0.1:5000/api').replace(
    /\/$/,
    ''
  );

function codiicClient() {
  return axios.create({
    baseURL: CODIIC_API_BASE,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });
}

function injectHtmlBaseHref(html, baseHref) {
  const base = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
  const baseTag = `<base href="${base}">`;
  let out = html;
  if (/<base\b[^>]*>/i.test(out)) {
    out = out.replace(/<base\b[^>]*>/i, baseTag);
  } else if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n    ${baseTag}`);
  } else {
    out = `${baseTag}\n${out}`;
  }
  out = out.replace(
    /\b(src|href|poster)=(["'])\/(?!\/)([^"']*)\2/gi,
    (_m, attr, q, p) => `${attr}=${q}${base}${p}${q}`
  );
  out = out.replace(
    /url\(\s*(['"]?)\/(?!\/)([^)"']+)\1\s*\)/gi,
    (_m, q, p) => `url(${q}${base}${p}${q})`
  );
  return out;
}

async function fetchCatalogThemeMeta(themeId) {
  const response = await codiicClient().get(`/informatic-themes/${themeId}`);
  const theme = response.data?.data;
  if (!theme || theme.isActive === false) {
    const err = new Error('Informatic theme not found');
    err.statusCode = 404;
    throw err;
  }
  const contentPrefix = theme.s3Assets?.contentRoot?.prefix;
  if (!contentPrefix) {
    const err = new Error('Theme preview not available — no static content uploaded');
    err.statusCode = 404;
    throw err;
  }
  return { theme, contentPrefix };
}

function contentRootPrefix(prefix) {
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
}

/** @GET /api/informatic-themes */
const listInformaticThemes = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const response = await codiicClient().get('/informatic-themes', {
      params: { search, page, limit },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json(
      err.response?.data || {
        success: false,
        message: err.message || 'Failed to fetch Informatic themes from catalog',
      }
    );
  }
};

/** @GET /api/informatic-themes/:id */
const getInformaticTheme = async (req, res) => {
  try {
    const response = await codiicClient().get(`/informatic-themes/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json(
      err.response?.data || {
        success: false,
        message: err.message || 'Failed to fetch Informatic theme',
      }
    );
  }
};

/** @GET /api/informatic-themes/:id/editor-pack */
const getInformaticThemeEditorPack = async (req, res) => {
  try {
    const response = await codiicClient().get(`/informatic-themes/${req.params.id}/editor-pack`);
    const body = response.data;
    if (body?.success && body?.data) {
      body.data = patchInformaticEditorPack(body.data);
    }
    res.status(response.status).json(body);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json(
      err.response?.data || {
        success: false,
        message: err.message || 'Failed to fetch Informatic theme editor pack',
      }
    );
  }
};

/** @GET /api/informatic-themes/preview/:id — static catalog demo (iframe-friendly HTML from S3) */
const getInformaticThemePreview = async (req, res) => {
  const sendPreviewHtml = (html) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *');
    res.status(200).send(html);
  };

  try {
    const { id } = req.params;
    const { contentPrefix } = await fetchCatalogThemeMeta(id);
    const root = contentRootPrefix(contentPrefix);
    const indexKey = `${root}index.html`;
    const htmlContent = await s3Service.readUtf8Object(indexKey);
    if (htmlContent) {
      const baseHref = s3Service.getPublicObjectUrl(root);
      return sendPreviewHtml(injectHtmlBaseHref(htmlContent, baseHref));
    }
  } catch (localErr) {
    if (localErr.statusCode && localErr.statusCode !== 404) {
      const status = localErr.statusCode;
      return res.status(status).json({ success: false, message: localErr.message });
    }
    /* fall through to codiic proxy */
  }

  try {
    const response = await codiicClient().get(`/informatic-themes/preview/${req.params.id}`, {
      responseType: 'text',
      transformResponse: [(data) => data],
      params: req.query,
    });
    return sendPreviewHtml(response.data);
  } catch (err) {
    const status = err.response?.status || err.statusCode || 502;
    const message =
      err.response?.data?.message ||
      (typeof err.response?.data === 'string' ? err.response.data : null) ||
      err.message ||
      'Failed to load Informatic theme preview';
    res.status(status).json({ success: false, message });
  }
};

/** @GET /api/informatic-themes/preview/:id/*path — redirect asset requests to public S3 URLs */
const getInformaticThemePreviewAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const rawPath = req.params.path;
    const filePath = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath || '');
    if (!filePath) {
      return res.status(400).json({ success: false, message: 'File path is required' });
    }

    const rel = filePath.replace(/^\/+/, '').replace(/\\/g, '/');
    if (!rel || rel.includes('..')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { contentPrefix } = await fetchCatalogThemeMeta(id);
    const root = contentRootPrefix(contentPrefix);
    const publicUrl = s3Service.getPublicObjectUrl(`${root}${rel}`);
    if (!publicUrl) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    return res.redirect(302, publicUrl);
  } catch (err) {
    const status = err.statusCode || err.response?.status || 502;
    res.status(status).json(
      err.response?.data || {
        success: false,
        message: err.message || 'Failed to load Informatic theme preview asset',
      }
    );
  }
};

module.exports = {
  listInformaticThemes,
  getInformaticTheme,
  getInformaticThemeEditorPack,
  getInformaticThemePreview,
  getInformaticThemePreviewAsset,
};
