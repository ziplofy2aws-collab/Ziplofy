# Footer social links

Every valid **Informatic** theme must expose **social profile links in the site footer**, editable from the theme editor — not buried in global theme settings.

---

## Requirement

| Rule | Detail |
| --- | --- |
| **Footer block** | Layout → **Footer** → **Social links** block is **required** |
| **Networks** | Facebook, X (Twitter), Instagram, LinkedIn, YouTube |
| **Editor** | Each network is a URL field in the footer block sidebar |
| **Runtime** | Only networks with a non-empty URL render as pill links in the footer |
| **Legacy** | Older configs may still read `settings.socialLinks.*`; migrate values into the footer block on editor load |

---

## Config paths

| Field | Path |
| --- | --- |
| Heading | `sections.footer.blocks.social.settings.heading` |
| Facebook | `sections.footer.blocks.social.settings.facebook` |
| X (Twitter) | `sections.footer.blocks.social.settings.twitter` |
| Instagram | `sections.footer.blocks.social.settings.instagram` |
| LinkedIn | `sections.footer.blocks.social.settings.linkedin` |
| YouTube | `sections.footer.blocks.social.settings.youtube` |

**Block order:** `sections.footer.block_order` must include `social` after `brand`, `menu`, and `legal`.

---

## Where merchants edit

1. Open the Informatic theme editor.
2. **Sections** tab → **Layout** → **Footer**.
3. Select **Social links**.
4. Paste profile URLs (full `https://…` links).

Social links are **not** edited under **Theme settings** (global settings). They live only on the footer block.

---

## Reference implementation

- Runtime: `remote-themes/informatic/src/layout/Footer.tsx`
- Schema: `layout.footer.blocks.social` in `theme.schema.json`
- Defaults: `sections.footer.blocks.social` in `theme.default-config.json`
- Editor ensure: `ensureInformaticFooterSocialBlock()` in webpanel `informatic-footer.util.ts`

---

## Invalid packs

- Footer with no **Social links** block in schema or default config
- Social URLs only in global settings with no footer block
- Hardcoded social URLs that cannot be changed in the editor

← Back to [Remote themes criteria.md](./Remote%20themes%20criteria.md)
