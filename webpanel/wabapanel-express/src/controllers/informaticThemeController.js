const axios = require('axios');
const s3Service = require('../services/s3Service');
const { patchInformaticEditorPack } = require('../utils/informaticRuntimeTemplates.util');
const { themeMatchesIndustry } = require('../utils/informaticIndustryData.util');
const {
  requireCodiicCatalogApiBase,
  mapCodiicCatalogError,
} = require('../utils/codiicCatalogApi');

function codiicClient() {
  return axios.create({
    baseURL: requireCodiicCatalogApiBase(),
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });
}

function injectHtmlBaseHref(html, baseHref) {
  const base = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
  const baseTag = `<base href="${base}">`;
  let out = html;
  // Rewrite root-absolute asset paths first so the injected <base> tag's own
  // href is never touched by the attribute rewrites below.
  out = out.replace(
    /\b(src|href|poster)=(["'])\/(?!\/)([^"']*)\2/gi,
    (_m, attr, q, p) => `${attr}=${q}${base}${p}${q}`
  );
  out = out.replace(
    /url\(\s*(['"]?)\/(?!\/)([^)"']+)\1\s*\)/gi,
    (_m, q, p) => `url(${q}${base}${p}${q})`
  );
  if (/<base\b[^>]*>/i.test(out)) {
    out = out.replace(/<base\b[^>]*>/i, baseTag);
  } else if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n    ${baseTag}`);
  } else {
    out = `${baseTag}\n${out}`;
  }
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
    const body = response.data;
    // Industry-aware catalog: an explicit ?industry= (the active store's) wins;
    // otherwise fall back to the signed-in user's industry feature override.
    // Themes without industry-matching tags remain visible to everyone.
    const industry =
      req.query.industry !== undefined
        ? String(req.query.industry).trim()
        : String(req.user?.featureOverrides?.industry || '').trim();
    if (industry && body?.success && Array.isArray(body?.data)) {
      body.data = body.data.filter((theme) => themeMatchesIndustry(theme?.tags, industry));
      if (body.pagination && typeof body.pagination.total === 'number') {
        body.pagination = { ...body.pagination, total: body.data.length };
      }
    }
    res.status(response.status).json(body);
  } catch (err) {
    const mapped = mapCodiicCatalogError(err);
    if (!mapped.body.message) {
      mapped.body.message = 'Failed to fetch Informatic themes from catalog';
    }
    res.status(mapped.status).json(mapped.body);
  }
};

/** @GET /api/informatic-themes/:id */
const getInformaticTheme = async (req, res) => {
  try {
    const response = await codiicClient().get(`/informatic-themes/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    const mapped = mapCodiicCatalogError(err);
    if (!mapped.body.message) {
      mapped.body.message = 'Failed to fetch Informatic theme';
    }
    res.status(mapped.status).json(mapped.body);
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
    const mapped = mapCodiicCatalogError(err);
    if (!mapped.body.message) {
      mapped.body.message = 'Failed to fetch Informatic theme editor pack';
    }
    res.status(mapped.status).json(mapped.body);
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
      // S3 catalog objects are private — point relative assets at this API's
      // preview wildcard route, which streams them from S3.
      const baseHref = `/api/informatic-themes/preview/${id}/`;
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
    const mapped = mapCodiicCatalogError(err);
    const message =
      mapped.body?.message ||
      err.response?.data?.message ||
      (typeof err.response?.data === 'string' ? err.response.data : null) ||
      err.message ||
      'Failed to load Informatic theme preview';
    res.status(mapped.status).json({ success: false, message, code: mapped.body?.code });
  }
};

/** @GET /api/informatic-themes/preview/:id/*path — stream private S3 catalog assets */
const getInformaticThemePreviewAsset = async (req, res) => {
  const { id } = req.params;
  const rawPath = req.params.path;
  const filePath = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath || '');
  if (!filePath) {
    return res.status(400).json({ success: false, message: 'File path is required' });
  }

  const rel = filePath.replace(/^\/+/, '').replace(/\\/g, '/');
  if (!rel || rel.split('/').includes('..')) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    if (process.env.AWS_ACCESS_KEY_ID) {
      const { contentPrefix } = await fetchCatalogThemeMeta(id);
      const root = contentRootPrefix(contentPrefix);
      // Filenames may be stored raw or URL-encoded — try both.
      const keys = [
        `${root}${rel}`,
        `${root}${rel.split('/').map(encodeURIComponent).join('/')}`,
      ];
      let obj = null;
      for (const key of keys) {
        try {
          obj = await s3Service.getObjectBuffer(key);
          break;
        } catch (e) {
          const notFound = e?.name === 'NoSuchKey' || e?.statusCode === 404 || e?.$metadata?.httpStatusCode === 404;
          if (!notFound) throw e;
        }
      }
      if (!obj) {
        throw Object.assign(new Error('File not found'), { statusCode: 404 });
      }
      // HTML sub-pages get the same <base> injection as the index so internal
      // navigation keeps resolving through this private preview route.
      if (/\.html?$/i.test(rel)) {
        const patched = injectHtmlBaseHref(
          obj.buffer.toString('utf8'),
          `/api/informatic-themes/preview/${id}/`
        );
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', 'frame-ancestors *');
        return res.send(patched);
      }
      res.setHeader('Content-Type', obj.contentType);
      res.setHeader('Content-Length', String(obj.buffer.length));
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(obj.buffer);
    }
    throw Object.assign(new Error('S3 not configured'), { statusCode: 503 });
  } catch (localErr) {
    // Fallback: stream the asset through codiic-server's preview route —
    // used when this server has no S3 credentials (e.g. local dev).
    try {
      const encoded = rel.split('/').map(encodeURIComponent).join('/');
      const upstream = await codiicClient().get(
        `/informatic-themes/preview/${id}/${encoded}`,
        { responseType: 'stream' }
      );
      if (upstream.headers['content-type']) {
        res.setHeader('Content-Type', upstream.headers['content-type']);
      }
      if (upstream.headers['content-length']) {
        res.setHeader('Content-Length', upstream.headers['content-length']);
      }
      if (upstream.headers['cache-control']) {
        res.setHeader('Cache-Control', upstream.headers['cache-control']);
      }
      res.on('close', () => {
        if (!res.writableEnded) upstream.data.destroy();
      });
      upstream.data.on('error', () => {
        if (!res.writableEnded) res.end();
      });
      upstream.data.pipe(res);
      return;
    } catch (err) {
      const status = err.response?.status || err.statusCode || 502;
      const body =
        err.response?.data && typeof err.response.data.pipe !== 'function'
          ? err.response.data
          : {
              success: false,
              message: err.message || 'Failed to load Informatic theme preview asset',
            };
      res.status(status).json(body);
    }
  }
};

module.exports = {
  listInformaticThemes,
  getInformaticTheme,
  getInformaticThemeEditorPack,
  getInformaticThemePreview,
  getInformaticThemePreviewAsset,
};
