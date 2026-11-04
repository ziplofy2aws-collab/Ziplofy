/**
 * Resolve the external Codiic Informatic catalog API base URL.
 *
 * Important: CRM Backend itself listens on :5000. Falling back to
 * http://127.0.0.1:5000/api makes the CRM call itself without catalog
 * auth and can surface spurious 401s to the frontend.
 */
function resolveCodiicCatalogApiBase() {
  const raw = process.env.CODIIC_API_URL || process.env.CODIIC_SERVER_URL;
  if (!raw || !String(raw).trim()) {
    return null;
  }
  return String(raw).trim().replace(/\/+$/, '');
}

function missingCodiicCatalogConfigError() {
  const err = new Error(
    'CODIIC_API_URL (or CODIIC_SERVER_URL) is not configured. Set it to the external Codiic catalog API, not crm-backend.codiic.com.'
  );
  err.statusCode = 503;
  err.code = 'CODIIC_CATALOG_NOT_CONFIGURED';
  return err;
}

function requireCodiicCatalogApiBase() {
  const base = resolveCodiicCatalogApiBase();
  if (!base) throw missingCodiicCatalogConfigError();
  return base;
}

/**
 * Map axios / catalog failures to safe CRM response statuses.
 * Upstream 401/403 become 502 so the CRM frontend does not treat them as session expiry.
 */
function mapCodiicCatalogError(err) {
  if (err?.statusCode === 503 || err?.code === 'CODIIC_CATALOG_NOT_CONFIGURED') {
    return {
      status: 503,
      body: {
        success: false,
        code: 'CODIIC_CATALOG_NOT_CONFIGURED',
        message: err.message,
      },
    };
  }

  const upstream = err?.response?.status;
  if (upstream === 401 || upstream === 403) {
    return {
      status: 502,
      body: {
        success: false,
        code: 'CODIIC_CATALOG_AUTH_FAILED',
        message:
          err.response?.data?.message ||
          'Codiic catalog rejected the request (upstream auth). Check CODIIC_API_URL and catalog credentials.',
      },
    };
  }

  if (err?.statusCode && err.statusCode >= 400 && err.statusCode < 600) {
    return {
      status: err.statusCode,
      body: {
        success: false,
        message: err.message || 'Codiic catalog request failed',
      },
    };
  }

  return {
    status: upstream && upstream >= 400 ? upstream : 502,
    body:
      err?.response?.data && typeof err.response.data === 'object'
        ? err.response.data
        : {
            success: false,
            message: err?.message || 'Failed to reach Codiic catalog',
          },
  };
}

module.exports = {
  resolveCodiicCatalogApiBase,
  requireCodiicCatalogApiBase,
  missingCodiicCatalogConfigError,
  mapCodiicCatalogError,
};
