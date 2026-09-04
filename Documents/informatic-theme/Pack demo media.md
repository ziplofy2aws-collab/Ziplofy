# Pack demo media

Packs may ship demo media under `/remote-themes/{themeId}/assets/…` (and `public/assets/` in source) for catalog / marketing demos.

| Context | Pack demo assets | CMS / API media (articles, uploaded images) |
| --- | --- | --- |
| Theme editor | Hidden → same-size **placeholder** | Show normally |
| Live site | Hidden → placeholder | Show normally |
| Marketing demo | Opt-in: `?packDemoAssets=1` | Show normally |

Merchant-uploaded URLs render normally. **CMS / content API assets are not pack media** — never run them through pack placeholders.

Recommended helpers (same idea as catalog packs):

- `resolveRemoteThemeMediaUrl(configuredUrl, packDemoUrl)`
- `shouldShowRemoteThemePackDemoAssets()`
- `isRemoteThemePackDemoMediaUrl()`
- `remoteThemeMediaPlaceholderUrl()`

Folder context: [Files introduction.md](./Files%20introduction.md).

← Back to [Introduction.md](./Introduction.md)
