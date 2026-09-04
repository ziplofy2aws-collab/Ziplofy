# Web Panel Store Renderer

Vite + React app that resolves **Informatic** store subdomains launched from the web panel and (next) renders their theme packs.

Mirrors the spine of `render-store` (Codiic), without ecommerce.

## Stack

- Vite 7 + React 19 + TypeScript
- Tailwind CSS 4
- Axios → `wabapanel-express` (`/api`)

## Local development

1. Start Express: `webpanel/wabapanel-express` on **:5001**
2. From this folder:

```bash
npm install
npm run dev
```

3. Open a store:

```
http://{subdomain}.localhost:3003
```

Or set `VITE_STORE_SUBDOMAIN` in `.env.development` and open `http://localhost:3003`.

## Storefront URL conventions

| Env | Pattern |
| --- | --- |
| Dev | `http://{sub}.localhost:3003` |
| Prod | `https://{sub}.crm-360.codiic.com` |

## Resolve flow

1. Read `window.location.hostname`
2. `GET /api/store-subdomain/check?subdomain=` or `?host=`
3. Gate UI → theme runtime (coming next)
