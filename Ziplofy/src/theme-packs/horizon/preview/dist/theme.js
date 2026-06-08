import { jsx as o, jsxs as m, Fragment as ne } from "react/jsx-runtime";
import { useState as Z, useMemo as F, useEffect as ue, useRef as ot, useCallback as qe } from "react";
import { getThemeConfigValue as K, useThemeConfig as j, useStorefrontAuth as Ze, useStorefrontCart as xt, useStorefront as it, useStorefrontProducts as ht, formatINR as Ye, useThemeEditorPreview as rt, usePreviewHighlightNodeId as fi, layoutBlockIdFromHighlightNodeId as bi, useStorefrontOrder as yi, useStorefrontProductVariants as xi } from "@render-store/sdk";
import { useLocation as $i, Link as I, useNavigate as $t, useParams as ki } from "react-router-dom";
function l(e, t, i = "") {
  const n = K(e, t);
  return n == null || n === "" ? i : String(n);
}
function U(e, t, i = !1) {
  const n = K(e, t);
  return n == null ? i : !!n;
}
function y(e, t, i) {
  const n = K(e, t);
  if (n == null || n === "") return i;
  const s = Number(n);
  return Number.isFinite(s) ? s : i;
}
function vi(e, t) {
  const i = K(e, t);
  return Array.isArray(i) ? i.filter((n) => n != null && typeof n == "object").map((n) => ({
    label: String(n.label ?? ""),
    href: String(n.href ?? "/")
  })).filter((n) => n.label) : [];
}
const Si = {
  "scheme-1": { background: "#ffffff", color: "#111827", border: "#e5e7eb" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", border: "#e2e8f0" },
  "scheme-3": { background: "#fff7ed", color: "#431407", border: "#fed7aa" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", border: "#ddd6fe" }
};
function wi(e, t, i) {
  const n = l(e, `${t}.colorScheme`, "scheme-1");
  return Si[n] ?? i;
}
function jo(e, t) {
  return l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function _i(e, t) {
  return Math.max(0, y(e, `${t}.gap`, 20));
}
function Ci(e, t) {
  return {
    paddingTop: y(e, `${t}.paddingTop`, 30),
    paddingBottom: y(e, `${t}.paddingBottom`, 30)
  };
}
function Do(e, t) {
  const i = t.trim();
  if (!i) return "";
  const n = `[data-ziplofy-section="${e}"]`;
  return i.replace(/:root/g, n).replace(/&/g, n);
}
const bt = {
  "heading-1": { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  "heading-2": { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  "heading-3": { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  "heading-4": { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
}, Pt = {
  ...bt,
  paragraph: { fontSize: 15, fontWeight: 400, lineHeight: 1.5 }
};
function zi(e, t, i, n, s) {
  const u = U(e, `${t}.inheritColorScheme`, !0), d = u ? i : {
    background: s.background,
    color: s.text,
    border: "rgba(17, 24, 39, 0.12)"
  }, a = l(e, `${t}.headingTypographyPreset`, "heading-3"), r = bt[a] ?? bt["heading-3"], p = l(e, `${t}.inputTypographyPreset`, "paragraph"), c = Pt[p] ?? Pt.paragraph, h = l(e, `${t}.inputBorder`, "all"), g = Math.max(0, y(e, `${t}.inputBorderThickness`, 1)), $ = Math.max(0, y(e, `${t}.inputCornerRadius`, 100));
  return {
    blockWidth: l(e, `${t}.blockWidth`, "fill") === "custom" ? "custom" : "fill",
    inheritColorScheme: u,
    colors: d,
    heading: {
      fontFamily: n.fontHeading,
      fontSize: r.fontSize,
      fontWeight: r.fontWeight,
      lineHeight: r.lineHeight,
      color: d.color,
      margin: "0 0 16px"
    },
    input: {
      fontFamily: n.fontBody,
      fontSize: c.fontSize,
      fontWeight: c.fontWeight,
      lineHeight: c.lineHeight,
      color: d.color,
      background: d.background,
      borderStyle: h === "none" ? "none" : "all",
      borderWidth: g,
      borderColor: d.border,
      borderRadius: $
    },
    submit: {
      style: l(e, `${t}.submitStyle`, "link") === "button" ? "button" : "link",
      display: l(e, `${t}.submitDisplay`) === "text" ? "text" : "arrow",
      integrated: U(e, `${t}.submitIntegratedButton`, !0)
    },
    padding: {
      top: y(e, `${t}.paddingTop`, 0),
      right: y(e, `${t}.paddingRight`, 0),
      bottom: y(e, `${t}.paddingBottom`, 0),
      left: y(e, `${t}.paddingLeft`, 0)
    }
  };
}
function G({ sectionId: e, label: t, style: i, children: n, editorNodeId: s }) {
  const u = s ?? `layout:${e}`;
  return /* @__PURE__ */ o(
    "section",
    {
      "data-ziplofy-section": e,
      "data-section-id": e,
      "data-ziplofy-node": u,
      "data-ziplofy-label": t ?? e,
      "data-ziplofy-kind": "section",
      style: i,
      children: n
    }
  );
}
function E({ nodeId: e, label: t, style: i, children: n }) {
  return /* @__PURE__ */ o(
    "div",
    {
      "data-ziplofy-node": e,
      "data-ziplofy-label": t,
      "data-ziplofy-kind": "block",
      style: i,
      children: n
    }
  );
}
function k({ fieldPath: e, label: t, as: i = "span", style: n, children: s }) {
  return /* @__PURE__ */ o(
    i,
    {
      "data-ziplofy-node": `field:${e}`,
      "data-ziplofy-label": t,
      "data-ziplofy-kind": "field",
      style: n,
      children: s
    }
  );
}
function X() {
  const e = j(), t = String(K(e, "settings.colors.primary") ?? "#111827"), i = String(K(e, "settings.colors.background") ?? "#ffffff"), n = String(K(e, "settings.colors.text") ?? "#111827"), s = String(
    K(e, "settings.typography.fontFamily") ?? "Georgia, serif"
  ), u = String(
    K(e, "settings.typography.fontFamilyBody") ?? "system-ui, sans-serif"
  );
  return { primary: t, background: i, text: n, fontHeading: s, fontBody: u };
}
const L = {
  maxWidth: 1200,
  padX: 24,
  line: "rgba(17, 24, 39, 0.12)"
}, We = {
  fontSize: 15,
  padding: "12px 14px",
  border: `1px solid ${L.line}`,
  borderRadius: 8,
  width: "100%",
  boxSizing: "border-box"
};
function Tt({
  label: e,
  display: t,
  style: i,
  colors: n,
  fontFamily: s,
  borderRadius: u
}) {
  const d = t === "arrow" ? "→" : e;
  return i === "link" ? /* @__PURE__ */ o(
    "button",
    {
      type: "submit",
      "aria-label": t === "arrow" ? e : void 0,
      style: {
        flexShrink: 0,
        border: "none",
        background: "transparent",
        color: n.color,
        fontFamily: s,
        fontSize: t === "arrow" ? 20 : 15,
        fontWeight: 600,
        cursor: "pointer",
        padding: "8px 14px",
        textDecoration: t === "text" ? "underline" : "none",
        lineHeight: 1
      },
      children: d
    }
  ) : /* @__PURE__ */ o(
    "button",
    {
      type: "submit",
      "aria-label": t === "arrow" ? e : void 0,
      style: {
        flexShrink: 0,
        border: "none",
        borderRadius: u,
        background: n.color,
        color: n.background,
        fontFamily: s,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        padding: "12px 24px",
        lineHeight: 1,
        whiteSpace: "nowrap"
      },
      children: d
    }
  );
}
function Bo({ sectionId: e = "footer" }) {
  const t = j(), { fontHeading: i, fontBody: n, text: s, background: u, primary: d } = X(), [a, r] = Z(""), p = `sections.${e}.settings`, c = `sections.${e}.blocks.newsletter.settings`, h = F(() => {
    const O = wi(t, p, {
      background: "#f6f6f7",
      color: "#111827",
      border: "#e5e7eb"
    }), N = jo(t, p), D = _i(t, p), { paddingTop: V, paddingBottom: te } = Ci(t, p), B = l(t, `${p}.customCss`, "");
    return {
      scheme: O,
      widthMode: N,
      gap: D,
      paddingTop: V,
      paddingBottom: te,
      customCss: B
    };
  }, [t, p]), g = F(
    () => zi(
      t,
      c,
      h.scheme,
      { fontHeading: i, fontBody: n },
      { text: s, background: u }
    ),
    [t, c, h.scheme, i, n, s, u, d]
  ), $ = l(t, `${c}.title`), b = l(t, `${c}.subtitle`), v = l(t, `${c}.placeholder`), x = l(t, `${c}.buttonLabel`), z = (O) => {
    O.preventDefault(), r("");
  }, S = h.widthMode === "full" ? "100%" : L.maxWidth, _ = h.widthMode === "full" ? 24 : L.padX, H = g.input.borderRadius, w = "rgba(55, 65, 81, 0.9)", R = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 32,
    width: "100%",
    flexWrap: "wrap"
  }, T = {
    flex: "1 1 260px",
    minWidth: 0
  }, W = {
    flex: "0 1 440px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 280,
    width: "100%",
    maxWidth: 440
  }, P = {
    flex: 1,
    minWidth: 0,
    fontFamily: g.input.fontFamily,
    fontSize: g.input.fontSize,
    fontWeight: g.input.fontWeight,
    lineHeight: g.input.lineHeight,
    color: g.input.color,
    background: "transparent",
    border: "none",
    outline: "none",
    padding: "12px 20px",
    width: "100%",
    boxSizing: "border-box"
  }, C = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    border: g.input.borderStyle === "none" ? "none" : `${g.input.borderWidth}px solid ${g.input.borderColor}`,
    borderRadius: H,
    background: "#ffffff"
  }, M = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
    border: g.input.borderStyle === "none" ? "none" : `${g.input.borderWidth}px solid ${g.input.borderColor}`,
    borderRadius: H,
    background: "#ffffff"
  }, f = !!($.trim() || b.trim());
  return /* @__PURE__ */ m(
    G,
    {
      sectionId: e,
      label: "Footer",
      style: {
        marginTop: 64,
        background: h.scheme.background || "#f6f6f7",
        color: h.scheme.color,
        borderTop: `1px solid ${h.scheme.border}`,
        fontFamily: n,
        paddingTop: h.paddingTop,
        paddingBottom: h.paddingBottom,
        paddingLeft: _,
        paddingRight: _,
        boxSizing: "border-box"
      },
      children: [
        h.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Do(e, h.customCss) } }) : null,
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              maxWidth: S,
              margin: "0 auto",
              width: "100%"
            },
            children: /* @__PURE__ */ o(E, { nodeId: `layout:${e}:block:newsletter`, label: "Email signup", children: /* @__PURE__ */ m("div", { style: R, children: [
              f ? /* @__PURE__ */ m("div", { style: T, children: [
                $.trim() ? /* @__PURE__ */ o(
                  k,
                  {
                    fieldPath: `${c}.title`,
                    label: "Heading",
                    as: "h2",
                    style: {
                      margin: 0,
                      fontFamily: g.heading.fontFamily,
                      fontSize: g.heading.fontSize,
                      fontWeight: g.heading.fontWeight,
                      lineHeight: g.heading.lineHeight,
                      color: g.heading.color
                    },
                    children: $
                  }
                ) : null,
                b.trim() ? /* @__PURE__ */ o(
                  k,
                  {
                    fieldPath: `${c}.subtitle`,
                    label: "Subtext",
                    as: "p",
                    style: {
                      margin: $.trim() ? "8px 0 0" : 0,
                      fontFamily: n,
                      fontSize: 15,
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: w,
                      maxWidth: 360
                    },
                    children: b
                  }
                ) : null
              ] }) : null,
              /* @__PURE__ */ o(
                "form",
                {
                  onSubmit: z,
                  style: {
                    ...W,
                    ...f ? {} : { flex: "1 1 100%", maxWidth: "100%" }
                  },
                  children: g.submit.integrated ? /* @__PURE__ */ o(k, { fieldPath: `${c}.placeholder`, label: "Email placeholder", as: "span", children: /* @__PURE__ */ m("div", { style: M, children: [
                    /* @__PURE__ */ o(
                      "input",
                      {
                        type: "email",
                        value: a,
                        onChange: (O) => r(O.target.value),
                        placeholder: v,
                        style: P,
                        "aria-label": v
                      }
                    ),
                    /* @__PURE__ */ o(k, { fieldPath: `${c}.buttonLabel`, label: "Button label", children: /* @__PURE__ */ o(
                      Tt,
                      {
                        label: x,
                        display: g.submit.display,
                        style: g.submit.style,
                        colors: g.colors,
                        fontFamily: n,
                        borderRadius: H
                      }
                    ) })
                  ] }) }) : /* @__PURE__ */ m(ne, { children: [
                    /* @__PURE__ */ o(k, { fieldPath: `${c}.placeholder`, label: "Email placeholder", as: "span", children: /* @__PURE__ */ o("div", { style: C, children: /* @__PURE__ */ o(
                      "input",
                      {
                        type: "email",
                        value: a,
                        onChange: (O) => r(O.target.value),
                        placeholder: v,
                        style: P,
                        "aria-label": v
                      }
                    ) }) }),
                    /* @__PURE__ */ o(k, { fieldPath: `${c}.buttonLabel`, label: "Button label", children: /* @__PURE__ */ o(
                      Tt,
                      {
                        label: x,
                        display: g.submit.display,
                        style: g.submit.style,
                        colors: {
                          color: "#111827",
                          background: "#ffffff",
                          border: h.scheme.border
                        },
                        fontFamily: n,
                        borderRadius: H
                      }
                    ) })
                  ] })
                }
              )
            ] }) })
          }
        )
      ]
    }
  );
}
const Wi = {
  "scheme-1": { background: "#ffffff", color: "#111827", border: "#e5e7eb" },
  "scheme-2": { background: "#1e3a5f", color: "#eff6ff", border: "#334155" },
  "scheme-3": { background: "#431407", color: "#fff7ed", border: "#7c2d12" },
  "scheme-4": { background: "#4c1d95", color: "#f5f3ff", border: "#6d28d9" }
};
function Pi(e, t, i) {
  const n = l(e, `${t}.colorScheme`, "scheme-1");
  return Wi[n] ?? i;
}
function Ti(e, t) {
  return l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function Hi(e, t) {
  return l(e, `${t}.headerHeight`) === "compact" ? { paddingY: 10, minHeight: 52 } : { paddingY: 16, minHeight: 64 };
}
function Ri(e, t) {
  return Math.max(0, y(e, `${t}.borderThickness`, 0));
}
function Li(e, t) {
  const i = l(e, `${t}.stickyMode`, "");
  return i === "always" || i === "on-scroll-up" || i === "never" ? i : U(e, `${t}.sticky`, !1) ? "always" : "never";
}
function Mi(e, t) {
  return U(e, `${t}.searchIcon`, !1) ? !0 : U(e, `${t}.showSearch`, !1);
}
function Fi(e, t) {
  const i = t.trim();
  if (!i) return "";
  const n = `[data-ziplofy-section="${e}"]`;
  return i.replace(/:root/g, n).replace(/&/g, n);
}
function et(e) {
  return e === "center" ? "center" : e === "right" ? "flex-end" : "flex-start";
}
function lt(e, t, i, n) {
  const s = K(e, t);
  if (Array.isArray(s) && s.length > 0)
    return s.map((d) => String(d));
  const u = K(e, i);
  return u != null && typeof u == "object" && !Array.isArray(u) ? Object.keys(u) : n;
}
function Ei(e, t, i) {
  const n = K(e, `templates.${t}.sections`), s = n != null && typeof n == "object" && !Array.isArray(n) ? new Set(Object.keys(n)) : /* @__PURE__ */ new Set(), u = K(e, `templates.${t}.section_order`);
  return Array.isArray(u) ? u.map((d) => String(d)).filter((d) => s.has(d)) : s.size > 0 ? lt(
    e,
    `templates.${t}.section_order`,
    `templates.${t}.sections`,
    i
  ).filter((a) => s.has(a)) : i.filter((d) => s.has(d));
}
function Pe(e, t, i) {
  const n = lt(
    e,
    `sections.${t}.block_order`,
    `sections.${t}.blocks`,
    i
  ), s = K(e, `sections.${t}.blocks`), u = s != null && typeof s == "object" && !Array.isArray(s) ? s : {};
  return n.filter((d) => u[d]?.enabled !== !1);
}
function Le(e, t, i, n) {
  const s = lt(
    e,
    `templates.${t}.sections.${i}.block_order`,
    `templates.${t}.sections.${i}.blocks`,
    n
  ), u = K(e, `templates.${t}.sections.${i}.blocks`), d = u != null && typeof u == "object" && !Array.isArray(u) ? u : {};
  return s.filter((a) => d[a]?.enabled !== !1);
}
function Xo({ sectionId: e = "header" }) {
  const t = j(), { pathname: i } = $i(), n = X(), { fontHeading: s, fontBody: u, primary: d, background: a } = n, { user: r, logout: p } = Ze(), { getAllItems: c } = xt(), h = c().reduce((se, Ne) => se + Ne.quantity, 0), g = `sections.${e}`, $ = `${g}.settings`, b = `${g}.blocks.logo.settings`, v = `${g}.blocks.menu.settings`, x = F(() => ({
    scheme: Pi(t, $, {
      background: a,
      color: n.text,
      border: L.line
    }),
    widthMode: Ti(t, $),
    height: Hi(t, $),
    borderPx: Ri(t, $),
    stickyMode: Li(t, $),
    customCss: l(t, `${$}.customCss`, ""),
    logoText: l(t, `${b}.text`),
    tagline: l(t, `${b}.tagline`, ""),
    logoUrl: l(t, `${$}.defaultLogoUrl`, "").trim(),
    logoPosition: l(t, `${b}.position`, "left"),
    hideLogoOnHomePage: U(t, `${b}.hideLogoOnHomePage`, !1),
    logoPaddingTop: Math.max(0, y(t, `${b}.paddingTop`, 0)),
    logoPaddingBottom: Math.max(0, y(t, `${b}.paddingBottom`, 0)),
    menuPosition: l(t, `${v}.position`, "left"),
    menuRow: l(t, `${v}.row`, "top"),
    menuItems: vi(t, `${v}.items`),
    menuStyle: l(t, `${$}.menuStyle`, "icons"),
    searchOn: Mi(t, $),
    searchPosition: l(t, `${$}.searchPosition`, "right"),
    searchRow: l(t, `${$}.searchRow`, "top"),
    searchPlaceholder: l(t, `${$}.searchPlaceholder`),
    cartLabel: l(t, `${$}.cartLabel`),
    showAccount: l(t, `${$}.customerAccountMenu`, "customer-account") !== "none",
    showCountry: U(t, `${$}.countryRegionEnabled`, !1),
    showFlag: U(t, `${$}.showFlag`, !1),
    showLanguage: U(t, `${$}.languageSelectorEnabled`, !1),
    locFont: l(t, `${$}.localizationFont`, "heading"),
    locSize: l(t, `${$}.localizationSize`, "14px"),
    countryRegionLabel: l(t, `${$}.countryRegionLabel`),
    languageLabel: l(t, `${$}.languageLabel`)
  }), [t, e, $, b, v, a, n.text]), {
    scheme: z,
    widthMode: S,
    height: { paddingY: _, minHeight: H },
    borderPx: w,
    stickyMode: R,
    customCss: T,
    logoText: W,
    tagline: P,
    logoUrl: C,
    logoPosition: M,
    hideLogoOnHomePage: f,
    logoPaddingTop: O,
    logoPaddingBottom: N,
    menuPosition: D,
    menuRow: V,
    menuItems: te,
    menuStyle: B,
    searchOn: de,
    searchPosition: ce,
    searchRow: ye,
    searchPlaceholder: Oe,
    cartLabel: Ue,
    showAccount: je,
    showCountry: xe,
    showFlag: Me,
    showLanguage: ke,
    locFont: Fe,
    locSize: Ie,
    countryRegionLabel: ge,
    languageLabel: Te
  } = x, { text: He, background: Ve, border: Qe } = z, A = Fi(e, T), [J, Q] = Z(!1);
  ue(() => {
    if (R !== "on-scroll-up") return;
    const se = () => Q(window.scrollY > 8);
    return se(), window.addEventListener("scroll", se, { passive: !0 }), () => window.removeEventListener("scroll", se);
  }, [R]);
  const q = R === "always" || R === "on-scroll-up" && J, ve = f && (i === "/" || i === "") && !q, Y = {
    fontSize: Ie,
    fontFamily: Fe === "heading" ? s : u,
    opacity: 0.85
  }, Se = {
    logo: ve ? null : /* @__PURE__ */ o(E, { nodeId: `layout:${e}:block:logo`, label: "Logo", children: /* @__PURE__ */ m(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: et(M),
          gap: 2,
          flex: M === "center" ? 1 : void 0,
          paddingTop: O,
          paddingBottom: N
        },
        children: [
          C ? /* @__PURE__ */ o(I, { to: "/", style: { textDecoration: "none" }, children: /* @__PURE__ */ o("img", { src: C, alt: W, style: { maxHeight: 40, display: "block" } }) }) : /* @__PURE__ */ o(I, { to: "/", style: { textDecoration: "none", color: He }, children: /* @__PURE__ */ o(
            k,
            {
              fieldPath: `${b}.text`,
              label: "Store name",
              as: "span",
              style: { fontFamily: s, fontSize: 26, fontWeight: 600, display: "inline-block" },
              children: W
            }
          ) }),
          P && !C ? /* @__PURE__ */ o(
            k,
            {
              fieldPath: `${b}.tagline`,
              label: "Tagline",
              as: "span",
              style: { display: "block", fontSize: 11, opacity: 0.65, lineHeight: 1.3 },
              children: P
            }
          ) : null
        ]
      }
    ) }),
    menu: /* @__PURE__ */ o(
      E,
      {
        nodeId: `layout:${e}:block:menu`,
        label: "Menu",
        style: {
          display: "flex",
          flexDirection: V === "bottom" ? "column-reverse" : "column",
          alignItems: et(D),
          gap: 8,
          flex: D === "center" ? 1 : void 0
        },
        children: /* @__PURE__ */ o("nav", { style: { display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: et(D) }, children: te.map((se, Ne) => {
          const Ke = ["link_shop", "link_collections", "link_about", "link_account"][Ne] ?? `link_${Ne}`, ie = `${v}.items.${Ne}.label`, pe = `${v}.items.${Ne}.href`;
          return /* @__PURE__ */ o(
            E,
            {
              nodeId: `layout:${e}:block:menu:nested:${Ke}`,
              label: se.label,
              children: /* @__PURE__ */ o(k, { fieldPath: ie, label: "Label", children: /* @__PURE__ */ o(I, { to: se.href, style: { color: He, textDecoration: "none", fontSize: 14 }, children: se.label }) })
            },
            pe
          );
        }) })
      }
    )
  }, le = S === "full" ? "100%" : L.maxWidth, he = de ? /* @__PURE__ */ o("span", { style: { ...Y, fontSize: 16 }, title: Oe, "aria-hidden": !0, children: "⌕" }) : null, oe = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap",
    width: "100%"
  }, re = {
    display: "flex",
    flex: M === "center" ? "1 1 100%" : "0 0 auto",
    justifyContent: M === "center" ? "center" : M === "right" ? "flex-end" : "flex-start",
    order: M === "right" ? 2 : 0,
    width: M === "center" ? "100%" : void 0
  }, ae = {
    display: "flex",
    flex: 1,
    justifyContent: et(D),
    order: 1,
    minWidth: 0
  }, Ge = /* @__PURE__ */ m("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginLeft: "auto",
    order: 3
  }, children: [
    ye === "top" && ce === "left" ? he : null,
    xe && ge ? /* @__PURE__ */ m("span", { style: Y, children: [
      Me ? "🇮🇳 " : "",
      ge
    ] }) : null,
    ke && Te ? /* @__PURE__ */ o("span", { style: Y, children: Te }) : null,
    ye === "top" && ce === "right" ? he : null,
    ye !== "top" && ce === "left" ? he : null,
    /* @__PURE__ */ o(
      I,
      {
        to: "/cart",
        style: {
          fontSize: 13,
          padding: "8px 12px",
          borderRadius: 8,
          border: `1px solid ${Qe}`,
          textDecoration: "none",
          color: He
        },
        children: B === "text" ? `${Ue} (${h})` : `🛒 ${h}`
      }
    ),
    je ? r ? /* @__PURE__ */ o(
      "button",
      {
        type: "button",
        onClick: () => {
          p();
        },
        style: {
          fontSize: 13,
          padding: "8px 14px",
          borderRadius: 8,
          border: "none",
          background: d,
          color: a,
          cursor: "pointer"
        },
        children: B === "text" ? "Sign out" : "⎋"
      }
    ) : /* @__PURE__ */ o(I, { to: "/auth/login", style: { color: d, fontWeight: 600, fontSize: 14, textDecoration: "none" }, children: B === "text" ? "Sign in" : "👤" }) : null,
    ye !== "top" && ce === "right" ? he : null
  ] });
  return /* @__PURE__ */ m(ne, { children: [
    A ? /* @__PURE__ */ o("style", { children: A }) : null,
    /* @__PURE__ */ o(
      G,
      {
        sectionId: e,
        label: "Header",
        style: {
          position: q ? "sticky" : "relative",
          top: q ? 0 : void 0,
          zIndex: 50,
          background: Ve,
          borderBottom: w > 0 ? `${w}px solid ${Qe}` : void 0,
          fontFamily: u,
          color: He,
          minHeight: H
        },
        children: /* @__PURE__ */ m(
          "div",
          {
            style: {
              maxWidth: le,
              margin: "0 auto",
              padding: `${_}px ${L.padX}px`,
              display: "flex",
              flexDirection: "column",
              gap: 10
            },
            children: [
              V === "top" ? /* @__PURE__ */ o("div", { style: { ...oe, justifyContent: et(D) }, children: Se.menu }) : null,
              /* @__PURE__ */ m("div", { style: oe, children: [
                /* @__PURE__ */ o("div", { style: re, children: Se.logo }),
                V !== "top" && V !== "bottom" ? /* @__PURE__ */ o("div", { style: ae, children: Se.menu }) : null,
                Ge
              ] }),
              V === "bottom" ? /* @__PURE__ */ o("div", { style: { ...oe, justifyContent: et(D) }, children: Se.menu }) : null
            ]
          }
        )
      }
    )
  ] });
}
const tt = "preview-store", Ce = "2026-01-15T12:00:00.000Z", Xe = {
  _id: "preview-customer",
  storeId: tt,
  firstName: "Alex",
  lastName: "Morgan",
  language: "en",
  email: "alex.morgan@example.com",
  phoneNumber: "+1 555 010 2244",
  isVerified: !0,
  agreedToMarketingEmails: !0,
  agreedToSmsMarketing: !1,
  collectTax: "collect",
  tagIds: [],
  createdAt: Ce,
  updatedAt: Ce
}, Ht = (e, t, i) => ({
  _id: e,
  productId: "preview-product",
  optionValues: { Size: "M" },
  sku: t,
  barcode: null,
  price: i,
  chargeTax: !0,
  images: [],
  createdAt: Ce,
  updatedAt: Ce
}), Ai = [
  {
    _id: "preview_cart_1",
    storeId: tt,
    productVariantId: Ht("preview-variant-1", "Bloom Serum — 30ml", 1299),
    quantity: 1,
    createdAt: Ce
  },
  {
    _id: "preview_cart_2",
    storeId: tt,
    productVariantId: Ht("preview-variant-2", "Velvet Lip Tint — Rose", 899),
    quantity: 2,
    createdAt: Ce
  }
], Rt = {
  _id: Xe._id,
  storeId: tt,
  firstName: Xe.firstName,
  lastName: Xe.lastName,
  language: "en",
  email: Xe.email,
  phoneNumber: Xe.phoneNumber,
  agreedToMarketingEmails: !0,
  agreedToSmsMarketing: !1,
  collectTax: "collect",
  tagIds: [],
  createdAt: Ce,
  updatedAt: Ce
}, Lt = {
  _id: "preview-address",
  customerId: Xe._id,
  country: "United States",
  firstName: "Alex",
  lastName: "Morgan",
  address: "128 Bloom Street",
  city: "San Francisco",
  state: "CA",
  pinCode: "94102",
  phoneNumber: "+1 555 010 2244",
  addressType: "shipping",
  createdAt: Ce,
  updatedAt: Ce
}, Ui = [
  {
    _id: "preview-order-2401",
    storeId: tt,
    customerId: Rt,
    shippingAddressId: Lt,
    orderDate: "2026-01-10",
    status: "delivered",
    paymentStatus: "paid",
    subtotal: 3497,
    tax: 280,
    shippingCost: 0,
    total: 3777,
    createdAt: Ce,
    updatedAt: Ce,
    items: []
  },
  {
    _id: "preview-order-2398",
    storeId: tt,
    customerId: Rt,
    shippingAddressId: Lt,
    orderDate: "2025-12-28",
    status: "shipped",
    paymentStatus: "paid",
    subtotal: 1299,
    tax: 104,
    shippingCost: 99,
    total: 1502,
    createdAt: Ce,
    updatedAt: Ce,
    items: []
  }
];
function qo(e) {
  const t = e?.sections;
  return new Set(t ? Object.keys(t) : []);
}
function Ni(e) {
  const t = qo(e), i = K(e, "layout_order.header");
  if (Array.isArray(i))
    return i.map((u) => String(u)).filter((u) => t.has(u));
  if (!t.size) return ["announcement_bar", "header"];
  const n = [...t].filter((u) => u === "announcement_bar" || u.startsWith("announcement_bar_")), s = t.has("header") ? ["header"] : [...t].filter((u) => u === "header" || u.startsWith("header_"));
  return [...n, ...s];
}
function Oi(e) {
  const t = qo(e), i = K(e, "layout_order.footer");
  if (Array.isArray(i))
    return i.map((s) => String(s)).filter((s) => t.has(s));
  if (!t.size) return ["footer", "footer_utilities"];
  const n = [];
  return t.has("footer") && n.push("footer"), t.has("footer_utilities") && n.push("footer_utilities"), n.length ? n : ["footer"];
}
function Mt(e, t) {
  if (!e) return !0;
  if (t === "announcement_bar" || t.startsWith("announcement_bar_"))
    return K(e, `sections.${t}.settings.enabled`) !== !1;
  const i = K(e, `sections.${t}.enabled`);
  return i == null ? !0 : i !== !1;
}
function Gi(e, t, i) {
  if (!e) return !0;
  const n = K(
    e,
    `templates.${t}.sections.${i}.enabled`
  );
  return n == null ? !0 : n !== !1;
}
function ji(e, t, i, n, s) {
  const d = l(e, `${t}.buttonStyle`, i) === "primary" ? "primary" : "secondary", a = l(e, `${t}.desktopWidth`, "fit"), r = d === "primary";
  return !!s?.onImageHero && r ? {
    variant: d,
    width: a === "custom" ? "auto" : "fit-content",
    minWidth: a === "custom" ? "140px" : void 0,
    padding: "12px 28px",
    borderRadius: 9999,
    fontSize: 15,
    fontWeight: 500,
    background: "transparent",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.85)",
    openInNewTab: U(e, `${t}.openInNewTab`, !1)
  } : {
    variant: d,
    width: a === "custom" ? "auto" : "fit-content",
    minWidth: a === "custom" ? "140px" : void 0,
    padding: r ? "14px 28px" : "14px 24px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    background: r ? n.primary : "transparent",
    color: r ? n.background : n.text,
    border: r ? "none" : `1px solid ${n.line}`,
    openInNewTab: U(e, `${t}.openInNewTab`, !1)
  };
}
const Ft = {
  "heading-1": { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  "heading-2": { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  "heading-3": { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  "heading-4": { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
}, Et = {
  narrow: "480px",
  normal: "640px",
  wide: "960px",
  none: void 0
};
function Di(e, t, i, n) {
  const s = l(e, `${t}.headingTypographyPreset`, "heading-2"), u = Ft[s] ?? Ft["heading-2"], d = l(e, `${t}.headingWidth`, "fit"), a = l(e, `${t}.headingMaxWidth`), r = l(e, `${t}.headingColor`, "heading"), p = r === "heading" ? n.heading : r === "accent" ? n.accent : n.text, c = U(e, `${t}.headingBackgroundEnabled`, !1);
  return {
    width: d === "fill" ? "100%" : "fit-content",
    maxWidth: Et[a] ?? Et.normal,
    fontFamily: i,
    fontSize: u.fontSize,
    fontWeight: u.fontWeight,
    lineHeight: u.lineHeight,
    color: p,
    background: c ? "rgba(255,255,255,0.08)" : void 0,
    paddingTop: y(e, `${t}.headingPaddingTop`, 0),
    paddingBottom: y(e, `${t}.headingPaddingBottom`, 0),
    paddingLeft: y(e, `${t}.headingPaddingLeft`, 0),
    paddingRight: y(e, `${t}.headingPaddingRight`, 0),
    borderRadius: c ? 6 : 0
  };
}
const Bi = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", muted: "#64748b" },
  "scheme-3": { background: "#fff7ed", color: "#431407", muted: "#9a3412" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", muted: "#6d28d9" },
  "scheme-5": { background: "#ecfdf5", color: "#064e3b", muted: "#047857" },
  "scheme-6": { background: "#1f2937", color: "#f9fafb", muted: "#9ca3af" }
}, At = {
  small: 400,
  medium: 520,
  large: 680,
  full: 900
};
function Xi(e, t, i) {
  const n = l(e, `${t}.colorScheme`, "scheme-6"), s = Bi[n] ?? i, u = l(e, `${t}.textAlign`, ""), d = l(
    e,
    `${t}.layoutAlignment`,
    u || "center"
  ), a = d === "left" ? "left" : d === "right" ? "right" : "center", r = U(e, `${t}.fullWidth`, !1), p = l(
    e,
    `${t}.sectionWidth`,
    r ? "full" : "page"
  ), c = l(e, `${t}.height`, ""), h = y(e, `${t}.minHeight`, 0), g = At[c] ?? (h > 0 ? h : At.medium), $ = l(e, `${t}.position`, "bottom"), b = $ === "top" ? "flex-start" : $ === "center" || $ === "space-between" ? "center" : "flex-end", v = a === "left" ? "flex-start" : a === "right" ? "flex-end" : "center", z = l(e, `${t}.direction`, "vertical") === "horizontal" ? "row" : "column";
  return {
    scheme: s,
    minHeight: g,
    maxWidth: p === "full" ? "100%" : 1200,
    paddingTop: y(e, `${t}.paddingTop`, 100),
    paddingBottom: y(e, `${t}.paddingBottom`, 72),
    paddingX: 24,
    direction: z,
    alignItems: b,
    justifyContent: v,
    textAlign: a,
    gap: y(e, `${t}.layoutGap`, 24),
    media1Url: l(e, `${t}.media1ImageUrl`, ""),
    media2Url: l(e, `${t}.media2ImageUrl`, ""),
    mobileImageUrl: l(e, `${t}.mobileImageUrl`, ""),
    mobileStackMedia: U(e, `${t}.mobileStackMedia`, !1),
    mobileDifferentMedia: U(e, `${t}.mobileDifferentMedia`, !1),
    mediaOverlay: U(e, `${t}.mediaOverlay`, !0),
    overlayColor: l(e, `${t}.overlayColor`, "#12121266"),
    overlayStyle: l(e, `${t}.overlayStyle`, "solid") === "gradient" ? "gradient" : "solid",
    overlayGradientDirection: l(e, `${t}.overlayGradientDirection`, "up") === "down" ? "down" : "up",
    blurredReflection: U(e, `${t}.blurredReflection`, !1),
    sectionLink: l(e, `${t}.sectionLink`, ""),
    sectionLinkNewTab: U(e, `${t}.sectionLinkNewTab`, !1),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function qi(e, t) {
  const i = t.trim();
  return i ? i.split(`
`).map((n) => `[data-ziplofy-section="${e}"] ${n}`).join(`
`) : "";
}
function Ii(e, t) {
  if (!t) return "";
  const i = `[data-ziplofy-section="${e}"] .split-showcase-grid`, n = `[data-ziplofy-section="${e}"] .split-showcase-tile`;
  return `@media (max-width: 749px) { ${i} { flex-direction: column !important; } ${n} { flex: 1 1 auto !important; width: 100% !important; min-height: 320px; } }`;
}
function Vi(e, t, i) {
  if (!t && !i) return "";
  const n = `[data-ziplofy-section="${e}"] .hero-media-grid`;
  let s = "";
  return t && (s += `@media (max-width: 749px) { ${n} { flex-direction: column !important; } }`), i && (s += `@media (max-width: 749px) { ${n} .hero-media-1 { display: none; } ${n} .hero-media-2 { display: none; } ${n} .hero-media-mobile { display: block !important; flex: 1; min-height: 200px; } }`), s;
}
const Ki = "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1600&q=85", Yi = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85";
function dt() {
  return /* @__PURE__ */ o(
    "div",
    {
      "aria-hidden": !0,
      style: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, #e8b89a 0%, #c9a07a 18%, #8fb8a8 42%, #4a8f9c 68%, #2d6478 100%)"
      },
      children: /* @__PURE__ */ m(
        "svg",
        {
          viewBox: "0 0 1200 600",
          preserveAspectRatio: "xMidYMid slice",
          style: { position: "absolute", inset: 0, width: "100%", height: "100%" },
          children: [
            /* @__PURE__ */ o("rect", { width: "1200", height: "600", fill: "#e8b89a" }),
            /* @__PURE__ */ o("ellipse", { cx: "600", cy: "120", rx: "280", ry: "80", fill: "#f5d4b8", opacity: "0.9" }),
            /* @__PURE__ */ o("circle", { cx: "180", cy: "90", r: "36", fill: "#fff8f0", opacity: "0.85" }),
            /* @__PURE__ */ o(
              "path",
              {
                d: "M0 380 L120 320 L240 360 L400 280 L560 340 L720 260 L880 300 L1040 240 L1200 280 L1200 600 L0 600 Z",
                fill: "#3d6b5a"
              }
            ),
            /* @__PURE__ */ o(
              "path",
              {
                d: "M0 400 L200 360 L380 390 L520 330 L680 370 L860 310 L1000 350 L1200 320 L1200 600 L0 600 Z",
                fill: "#2d8a7a"
              }
            ),
            /* @__PURE__ */ o("path", { d: "M0 420 Q600 380 1200 420 L1200 600 L0 600 Z", fill: "#3a9e8c" }),
            /* @__PURE__ */ o("ellipse", { cx: "420", cy: "430", rx: "200", ry: "28", fill: "#1f5f6e", opacity: "0.35" }),
            /* @__PURE__ */ o("ellipse", { cx: "340", cy: "518", rx: "88", ry: "52", fill: "#3d2f28", opacity: "0.92" }),
            /* @__PURE__ */ o("ellipse", { cx: "395", cy: "505", rx: "36", ry: "34", fill: "#4a382f", opacity: "0.95" }),
            /* @__PURE__ */ o("ellipse", { cx: "520", cy: "522", rx: "78", ry: "48", fill: "#352820", opacity: "0.9" }),
            /* @__PURE__ */ o("ellipse", { cx: "565", cy: "508", rx: "32", ry: "30", fill: "#45352c", opacity: "0.95" }),
            /* @__PURE__ */ o("path", { d: "M310 560 Q360 520 420 540 Q480 520 530 555", fill: "none", stroke: "#2d6478", strokeWidth: "2", opacity: "0.25" })
          ]
        }
      )
    }
  );
}
function Zi(e, t, i) {
  return t === "layout" ? `sections.${e}.settings` : `templates.${i}.sections.${e}.settings`;
}
function Qi(e, t, i) {
  return t === "layout" ? `sections.${e}.blocks` : `templates.${i}.sections.${e}.blocks`;
}
function Io(e, t, i) {
  return t === "layout" ? `layout:${e}` : `template:${i}:${e}`;
}
function Be(e, t, i, n) {
  return `${Io(e, t, i)}:block:${n}`;
}
function ft({
  blockId: e,
  fallbackVariant: t,
  colors: i,
  blocksBase: n,
  sectionNodePrefix: s,
  onImageHero: u = !1
}) {
  const d = j(), a = `${n}.${e}.settings`, r = l(d, `${a}.label`, ""), p = l(d, `${a}.href`, "/"), c = F(
    () => ji(d, a, t, i, { onImageHero: u }),
    [d, a, t, i, u]
  );
  return r.trim() ? /* @__PURE__ */ o(E, { nodeId: `${s}:block:${e}`, label: "Button", children: /* @__PURE__ */ o(
    I,
    {
      to: p,
      target: c.openInNewTab ? "_blank" : void 0,
      rel: c.openInNewTab ? "noopener noreferrer" : void 0,
      style: {
        display: "inline-block",
        width: c.width,
        minWidth: c.minWidth,
        padding: c.padding,
        borderRadius: c.borderRadius,
        background: c.background,
        color: c.color,
        border: c.border,
        textDecoration: "none",
        fontWeight: c.fontWeight,
        fontSize: c.fontSize,
        boxSizing: "border-box"
      },
      children: /* @__PURE__ */ o(k, { fieldPath: `${a}.label`, label: "Label", children: r })
    }
  ) }) : null;
}
function Ji({
  blockId: e,
  blocksBase: t,
  sectionNodePrefix: i
}) {
  const n = j(), s = `${t}.${e}.settings`, u = l(n, `${s}.label`, ""), d = l(n, `${s}.href`);
  return u.trim() ? /* @__PURE__ */ o(E, { nodeId: `${i}:block:${e}`, label: "Button", children: /* @__PURE__ */ o(
    I,
    {
      to: d,
      target: U(n, `${s}.openInNewTab`, !1) ? "_blank" : void 0,
      rel: U(n, `${s}.openInNewTab`, !1) ? "noopener noreferrer" : void 0,
      style: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: 500,
        textDecoration: "underline",
        textUnderlineOffset: "3px",
        textDecorationColor: "rgba(255,255,255,0.9)"
      },
      children: /* @__PURE__ */ o(k, { fieldPath: `${s}.label`, label: "Label", children: u })
    }
  ) }) : null;
}
function kt({
  sectionId: e = "hero_main",
  placement: t = "template",
  templateId: i = "index"
}) {
  const n = j(), s = X(), { text: u, background: d, primary: a, fontHeading: r, fontBody: p } = s, c = Zi(e, t, i), h = Qi(e, t, i), g = Io(e, t, i), $ = l(n, `${c}.catalogVariant`, ""), b = $ === "hero-bottom-aligned", v = $ === "hero-marquee", x = $ === "large-logo", z = $ === "split-showcase", S = b || v || x || z, _ = !S && !b, H = l(
    n,
    `${c}.marqueeText`,
    l(n, `${c}.subtitle`)
  ), w = l(
    n,
    `${h}.text_right.settings.text`,
    l(n, `${c}.splitRightTitle`)
  ), R = b ? {
    textIntro: `${h}.content_group.blocks.heading_group.blocks.text_intro.settings.text`,
    headingMain: `${h}.content_group.blocks.heading_group.blocks.heading_main.settings.text`,
    textBody: `${h}.content_group.blocks.text_body.settings.text`
  } : null, T = l(
    n,
    R?.textIntro ?? `${c}.eyebrow`,
    ""
  ), W = l(
    n,
    R?.headingMain ?? `${c}.title`,
    "Welcome"
  ), P = l(n, `${c}.subtitle`, ""), C = l(
    n,
    R?.textBody ?? `${h}.text_2.settings.text`,
    ""
  ) || P, M = (A) => A === "text_body" ? `${g}:block:content_group:nested:text_body` : `${g}:block:content_group:nested:heading_group:nested:${A}`, f = F(
    () => Xi(n, c, {
      background: d,
      color: u,
      muted: "#9ca3af"
    }),
    [n, c, d, u]
  ), O = F(
    () => Di(n, c, r, {
      text: f.scheme.color,
      heading: f.scheme.color,
      accent: a
    }),
    [n, c, r, f.scheme.color, a]
  ), N = F(
    () => ({
      primary: a,
      background: d,
      text: f.scheme.color,
      line: L.line
    }),
    [a, d, f.scheme.color]
  ), D = b ? ["content_group"] : v ? ["primary_button"] : x ? ["text_2"] : z ? ["heading", "text_right", "primary_button", "secondary_button"] : ["heading", "primary_button"], V = t === "layout" ? Pe(n, e, D) : Le(n, i, e, D), te = qi(e, f.customCss), B = Vi(e, f.mobileStackMedia, f.mobileDifferentMedia), de = f.overlayStyle === "gradient" ? f.overlayGradientDirection === "down" ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : `linear-gradient(180deg, ${f.overlayColor} 0%, transparent 100%)` : f.overlayColor, ce = !!(f.media1Url || f.media2Url), ye = {
    primary_button: /* @__PURE__ */ o(
      ft,
      {
        blockId: "primary_button",
        fallbackVariant: "primary",
        colors: N,
        blocksBase: h,
        sectionNodePrefix: g,
        onImageHero: _ || v
      }
    ),
    secondary_button: /* @__PURE__ */ o(
      ft,
      {
        blockId: "secondary_button",
        fallbackVariant: "secondary",
        colors: N,
        blocksBase: h,
        sectionNodePrefix: g,
        onImageHero: _
      }
    )
  }, Oe = (A, J = !1) => {
    if (A === "heading" || A.startsWith("heading_")) {
      const q = `${h}.${A}.settings.heading`, ee = l(n, q, A === "heading" ? W : "");
      return ee.trim() ? /* @__PURE__ */ o(E, { nodeId: Be(e, t, i, A), label: "Heading", children: /* @__PURE__ */ o(
        k,
        {
          fieldPath: q,
          label: "Text",
          as: "h1",
          style: J ? {
            margin: 0,
            width: "100%",
            maxWidth: 720,
            fontFamily: r,
            fontSize: "clamp(2.4rem, 5.2vw, 3.5rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textAlign: "center"
          } : {
            margin: 0,
            width: O.width,
            maxWidth: O.maxWidth,
            fontFamily: O.fontFamily,
            fontSize: O.fontSize,
            fontWeight: O.fontWeight,
            lineHeight: O.lineHeight,
            color: O.color,
            background: O.background,
            paddingTop: O.paddingTop,
            paddingBottom: O.paddingBottom,
            paddingLeft: O.paddingLeft,
            paddingRight: O.paddingRight,
            borderRadius: O.borderRadius,
            boxSizing: "border-box"
          },
          children: ee
        }
      ) }) : null;
    }
    if (A === "text_2" || A.startsWith("text_") && A !== "heading") {
      const q = l(n, `${h}.${A}.settings.text`, "") || (A === "text_2" ? P : "");
      return q.trim() ? /* @__PURE__ */ o(E, { nodeId: Be(e, t, i, A), label: "Text", children: /* @__PURE__ */ o(
        k,
        {
          fieldPath: `${h}.${A}.settings.text`,
          label: "Text",
          as: "p",
          style: J ? {
            margin: 0,
            fontSize: "clamp(1rem, 2vw, 1.125rem)",
            lineHeight: 1.55,
            maxWidth: 620,
            fontWeight: 400,
            color: "#ffffff",
            textAlign: "center"
          } : {
            fontSize: 18,
            lineHeight: 1.65,
            maxWidth: 560,
            margin: 0,
            opacity: 0.85,
            color: f.scheme.color
          },
          children: q
        }
      ) }) : null;
    }
    if (A === "primary_button" || A === "secondary_button") {
      const q = ye[A];
      return q ? /* @__PURE__ */ o("span", { children: q }, A) : null;
    }
    const Q = l(n, `${h}.${A}.type`, "");
    if (Q === "image" || Q === "video") {
      const q = l(n, `${h}.${A}.settings.url`, "").trim();
      if (!q) return null;
      const ee = Q === "video";
      return /* @__PURE__ */ o(E, { nodeId: Be(e, t, i, A), label: ee ? "Video" : "Image", children: ee ? /* @__PURE__ */ o(
        "video",
        {
          src: q,
          controls: !0,
          muted: U(n, `${h}.${A}.settings.muted`, !0),
          autoPlay: U(n, `${h}.${A}.settings.autoplay`, !1),
          style: { width: "100%", maxWidth: 520, borderRadius: 10 }
        }
      ) : /* @__PURE__ */ o("img", { src: q, alt: "", style: { width: "100%", maxWidth: 520, borderRadius: 10, display: "block" } }) });
    }
    if (Q === "logo") {
      const q = l(n, `${h}.${A}.settings.imageUrl`, "").trim(), ee = l(n, `${h}.${A}.settings.text`, "").trim();
      return !q && !ee ? null : /* @__PURE__ */ o(E, { nodeId: Be(e, t, i, A), label: "Logo", children: q ? /* @__PURE__ */ o("img", { src: q, alt: ee || "Logo", style: { maxHeight: 72, width: "auto", display: "block" } }) : /* @__PURE__ */ o("p", { style: { margin: 0, fontSize: 20, fontWeight: 700, color: f.scheme.color }, children: ee }) });
    }
    if (Q === "icon") {
      const q = l(n, `${h}.${A}.settings.icon`, "star").trim(), ee = l(n, `${h}.${A}.settings.label`, "").trim();
      return /* @__PURE__ */ o(E, { nodeId: Be(e, t, i, A), label: "Icon", children: /* @__PURE__ */ m("div", { style: { display: "inline-flex", alignItems: "center", gap: 8, color: f.scheme.color }, children: [
        /* @__PURE__ */ o("span", { style: { fontSize: 20, lineHeight: 1 }, children: q === "heart" ? "♥" : q === "check" ? "✓" : "★" }),
        ee ? /* @__PURE__ */ o("span", { style: { fontSize: 14 }, children: ee }) : null
      ] }) });
    }
    if (Q === "page") {
      const q = l(n, `${h}.${A}.settings.title`, "").trim(), ee = l(n, `${h}.${A}.settings.href`, "/").trim();
      return q ? /* @__PURE__ */ o(E, { nodeId: Be(e, t, i, A), label: "Page", children: /* @__PURE__ */ o(I, { to: ee, style: { color: f.scheme.color, textDecoration: "underline", textUnderlineOffset: 3 }, children: q }) }) : null;
    }
    return Q === "button" || A.endsWith("_button") ? /* @__PURE__ */ o("span", { children: /* @__PURE__ */ o(
      ft,
      {
        blockId: A,
        fallbackVariant: A === "secondary_button" ? "secondary" : "primary",
        colors: N,
        blocksBase: h,
        sectionNodePrefix: g,
        onImageHero: _ || v
      }
    ) }, A) : null;
  }, Ue = (A = !1) => V.map((J) => /* @__PURE__ */ o("span", { style: { display: "contents" }, children: Oe(J, A) }, J)), je = Math.max(200, f.minHeight - f.paddingTop - f.paddingBottom), xe = typeof f.maxWidth == "number" ? f.maxWidth : f.maxWidth === "100%" ? "100%" : 1200, Me = "#ffffff", ke = () => {
    if (!R) return null;
    const A = typeof f.maxWidth == "number" ? f.maxWidth : 1400;
    return /* @__PURE__ */ m(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: Math.max(f.gap, 32),
          width: "100%",
          maxWidth: A,
          margin: "0 auto",
          boxSizing: "border-box"
        },
        children: [
          /* @__PURE__ */ m("div", { style: { flex: "1 1 50%", minWidth: 0, textAlign: "left" }, children: [
            T.trim() ? /* @__PURE__ */ o(E, { nodeId: M("text_intro"), label: "Text", children: /* @__PURE__ */ o(
              k,
              {
                fieldPath: R.textIntro,
                label: "Text",
                as: "p",
                style: {
                  margin: 0,
                  fontSize: 14,
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  lineHeight: 1.4,
                  color: Me
                },
                children: T
              }
            ) }) : null,
            W.trim() ? /* @__PURE__ */ o(E, { nodeId: M("heading_main"), label: "Heading", children: /* @__PURE__ */ o(
              k,
              {
                fieldPath: R.headingMain,
                label: "Text",
                as: "h1",
                style: {
                  margin: T.trim() ? "8px 0 0" : 0,
                  fontFamily: r,
                  fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
                  fontWeight: 400,
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  color: Me
                },
                children: W
              }
            ) }) : null
          ] }),
          C.trim() ? /* @__PURE__ */ o(
            "div",
            {
              style: {
                flex: "0 1 42%",
                maxWidth: 440,
                textAlign: "right",
                alignSelf: "flex-end"
              },
              children: /* @__PURE__ */ o(E, { nodeId: M("text_body"), label: "Text", children: /* @__PURE__ */ o(
                k,
                {
                  fieldPath: R.textBody,
                  label: "Text",
                  as: "p",
                  style: {
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: Me
                  },
                  children: C
                }
              ) })
            }
          ) : null
        ]
      }
    );
  }, Fe = /* @__PURE__ */ m(
    "div",
    {
      style: {
        position: "relative",
        zIndex: 2,
        flex: f.direction === "row" ? "0 0 42%" : void 0,
        maxWidth: f.direction === "column" ? xe : void 0,
        width: f.direction === "column" ? "100%" : void 0,
        margin: f.direction === "column" ? "0 auto" : void 0,
        textAlign: f.textAlign,
        display: "flex",
        flexDirection: "column",
        alignItems: f.textAlign === "left" ? "flex-start" : f.textAlign === "right" ? "flex-end" : "center",
        gap: f.gap
      },
      children: [
        T ? /* @__PURE__ */ o(
          k,
          {
            fieldPath: `${c}.eyebrow`,
            label: "Eyebrow",
            as: "p",
            style: {
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
              opacity: 0.7,
              color: f.scheme.color
            },
            children: T
          }
        ) : null,
        Ue()
      ]
    }
  ), Ie = () => /* @__PURE__ */ o(
    "div",
    {
      "aria-hidden": !0,
      style: {
        position: "absolute",
        inset: 0,
        zIndex: 3,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        pointerEvents: "none"
      },
      children: /* @__PURE__ */ m(
        "div",
        {
          className: `hero-marquee-track-${e}`,
          style: {
            display: "flex",
            width: "max-content",
            whiteSpace: "nowrap",
            fontFamily: r,
            fontSize: "clamp(2.25rem, 6vw, 4.25rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textShadow: "0 2px 24px rgba(0,0,0,0.25)",
            animation: `hero-marquee-${e} 22s linear infinite`
          },
          children: [
            /* @__PURE__ */ m(
              k,
              {
                fieldPath: `${c}.marqueeText`,
                label: "Marquee",
                as: "span",
                style: { padding: "0 0.35em", display: "inline" },
                children: [
                  H,
                  " "
                ]
              }
            ),
            /* @__PURE__ */ m("span", { style: { padding: "0 0.35em" }, "aria-hidden": !0, children: [
              H,
              " "
            ] })
          ]
        }
      )
    }
  ), ge = b ? ke() : Fe, Te = (A, J, Q) => A ? /* @__PURE__ */ o(
    "div",
    {
      className: J,
      style: {
        flex: 1,
        minHeight: f.direction === "row" ? "100%" : 240,
        background: `center/cover url(${A}) no-repeat`,
        filter: Q ? "blur(12px)" : void 0,
        transform: Q ? "scale(1.05)" : void 0
      }
    }
  ) : /* @__PURE__ */ o(
    "div",
    {
      className: J,
      style: {
        flex: 1,
        minHeight: f.direction === "row" ? "100%" : 200,
        background: `linear-gradient(135deg, ${f.scheme.muted}33, ${f.scheme.background})`
      }
    }
  ), He = !ce, Ve = /* @__PURE__ */ o(
    "div",
    {
      className: "hero-media-grid",
      style: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: S && !z ? "column" : f.direction,
        alignItems: b || z ? "stretch" : f.alignItems,
        justifyContent: b ? "flex-end" : v ? "center" : f.justifyContent,
        gap: f.gap,
        minHeight: je,
        width: "100%",
        maxWidth: typeof f.maxWidth == "number" ? f.maxWidth : void 0,
        margin: "0 auto",
        padding: S ? 0 : `0 ${f.paddingX}px`,
        boxSizing: "border-box"
      },
      children: v ? ge : ce && f.direction === "row" ? /* @__PURE__ */ m(ne, { children: [
        Te(f.media1Url, "hero-media-1", f.blurredReflection),
        ge,
        f.media2Url ? Te(f.media2Url, "hero-media-2", f.blurredReflection) : null
      ] }) : /* @__PURE__ */ m(ne, { children: [
        ce ? /* @__PURE__ */ m("div", { style: { display: "flex", gap: f.gap, width: "100%" }, children: [
          Te(f.media1Url, "hero-media-1", f.blurredReflection),
          f.media2Url ? Te(f.media2Url, "hero-media-2", f.blurredReflection) : null,
          f.mobileDifferentMedia && f.mobileImageUrl ? /* @__PURE__ */ o(
            "div",
            {
              className: "hero-media-mobile",
              style: {
                display: "none",
                flex: 1,
                minHeight: 200,
                background: `center/cover url(${f.mobileImageUrl}) no-repeat`
              }
            }
          ) : null
        ] }) : null,
        ge
      ] })
    }
  ), Qe = f.sectionLink ? /* @__PURE__ */ o(
    I,
    {
      to: f.sectionLink,
      target: f.sectionLinkNewTab ? "_blank" : void 0,
      rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
      style: { textDecoration: "none", color: "inherit", display: "block" },
      children: Ve
    }
  ) : Ve;
  if (b) {
    const A = f.media1Url.trim(), J = f.minHeight, Q = Math.max(f.paddingX, 40), q = Math.max(f.paddingBottom, 48), ee = f.paddingTop > 0 ? f.paddingTop : 0, ve = f.mediaOverlay && (A || !ce) ? de : void 0, Y = /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: J,
          width: "100%",
          padding: `${ee}px ${Q}px ${q}px`,
          boxSizing: "border-box"
        },
        children: ke()
      }
    ), Se = f.sectionLink ? /* @__PURE__ */ o(
      I,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: Y
      }
    ) : Y;
    return /* @__PURE__ */ m(ne, { children: [
      te ? /* @__PURE__ */ o("style", { children: te }) : null,
      B ? /* @__PURE__ */ o("style", { children: B }) : null,
      /* @__PURE__ */ m(
        G,
        {
          sectionId: e,
          editorNodeId: g,
          label: "Hero: Bottom aligned",
          style: {
            position: "relative",
            overflow: "hidden",
            width: "100%",
            minHeight: J,
            padding: 0,
            background: "#2d6478",
            fontFamily: p,
            color: Me,
            boxSizing: "border-box"
          },
          children: [
            A ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: `center/cover url(${A}) no-repeat`
                }
              }
            ) : /* @__PURE__ */ o(dt, {}),
            ve ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: ve,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            Se
          ]
        }
      )
    ] });
  }
  if (v) {
    const A = f.media1Url.trim(), J = f.minHeight, Q = Math.max(f.paddingBottom, 48), q = f.mediaOverlay && (A || !ce) ? de : void 0, ee = /* @__PURE__ */ m(
      "div",
      {
        style: {
          position: "relative",
          minHeight: J,
          width: "100%",
          boxSizing: "border-box"
        },
        children: [
          Ie(),
          /* @__PURE__ */ o(
            "div",
            {
              style: {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: Q,
                zIndex: 4,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "auto"
              },
              children: ye.primary_button ? /* @__PURE__ */ o("span", { style: { display: "inline-flex" }, children: ye.primary_button }) : null
            }
          ),
          /* @__PURE__ */ o("style", { children: `
          @keyframes hero-marquee-${e} {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        ` })
        ]
      }
    ), ve = f.sectionLink ? /* @__PURE__ */ o(
      I,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: ee
      }
    ) : ee;
    return /* @__PURE__ */ m(ne, { children: [
      te ? /* @__PURE__ */ o("style", { children: te }) : null,
      B ? /* @__PURE__ */ o("style", { children: B }) : null,
      /* @__PURE__ */ m(
        G,
        {
          sectionId: e,
          editorNodeId: g,
          label: "Hero: Marquee",
          style: {
            position: "relative",
            overflow: "hidden",
            width: "100%",
            minHeight: J,
            padding: 0,
            background: "#2d6478",
            fontFamily: p,
            color: "#ffffff",
            boxSizing: "border-box"
          },
          children: [
            A ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: `center/cover url(${A}) no-repeat`
                }
              }
            ) : /* @__PURE__ */ o(dt, {}),
            q ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: q,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            ve
          ]
        }
      )
    ] });
  }
  if (x) {
    const A = l(n, `${h}.text_2.settings.text`, "") || P || C, J = W.trim() || "My Store", Q = Math.max(f.paddingTop, 40), q = Math.max(f.paddingBottom, 48), ee = 40, ve = f.minHeight, Y = l(n, `${c}.backgroundMedia`, "none"), Se = l(n, `${c}.backgroundImageUrl`, ""), le = Y === "image" && !!Se.trim(), he = l(n, `${c}.borderStyle`, "none"), oe = y(n, `${c}.cornerRadius`, 0), re = l(n, `${c}.defaultLogoUrl`, ""), ae = he === "solid" ? `1px solid ${f.scheme.muted}55` : void 0, De = f.mediaOverlay && le ? f.overlayStyle === "gradient" ? f.overlayGradientDirection === "down" ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : `linear-gradient(180deg, ${f.overlayColor} 0%, transparent 100%)` : f.overlayColor : void 0, Ge = /* @__PURE__ */ m(
      "div",
      {
        style: {
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: typeof f.maxWidth == "number" ? f.maxWidth : void 0,
          margin: "0 auto",
          minHeight: ve,
          padding: `${Q}px ${ee}px ${q}px`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          borderRadius: oe > 0 ? oe : void 0,
          border: ae,
          overflow: oe > 0 ? "hidden" : void 0
        },
        children: [
          A.trim() ? /* @__PURE__ */ o(E, { nodeId: Be(e, t, i, "text_2"), label: "Text", children: /* @__PURE__ */ o(
            k,
            {
              fieldPath: `${h}.text_2.settings.text`,
              label: "Text",
              as: "p",
              style: {
                margin: 0,
                maxWidth: 300,
                fontSize: 15,
                lineHeight: 1.5,
                color: "#111827",
                alignSelf: "flex-start"
              },
              children: A
            }
          ) }) : null,
          /* @__PURE__ */ o(
            "div",
            {
              style: {
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 32,
                paddingBottom: 24,
                minHeight: 280,
                width: "100%"
              },
              children: re.trim() ? /* @__PURE__ */ o(k, { fieldPath: `${c}.defaultLogoUrl`, label: "Default logo", as: "div", children: /* @__PURE__ */ o(
                "img",
                {
                  src: re,
                  alt: J,
                  style: {
                    display: "block",
                    maxWidth: "min(92%, 1200px)",
                    maxHeight: "min(42vh, 520px)",
                    width: "auto",
                    height: "auto",
                    margin: "0 auto",
                    objectFit: "contain"
                  }
                }
              ) }) : /* @__PURE__ */ o(
                k,
                {
                  fieldPath: `${c}.title`,
                  label: "Text",
                  as: "h1",
                  style: {
                    margin: 0,
                    fontFamily: r,
                    fontSize: "clamp(4rem, 18vw, 11rem)",
                    fontWeight: 800,
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    color: "#000000",
                    textAlign: "center"
                  },
                  children: J
                }
              )
            }
          )
        ]
      }
    ), se = f.sectionLink ? /* @__PURE__ */ o(
      I,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: Ge
      }
    ) : Ge;
    return /* @__PURE__ */ m(ne, { children: [
      te ? /* @__PURE__ */ o("style", { children: te }) : null,
      B ? /* @__PURE__ */ o("style", { children: B }) : null,
      /* @__PURE__ */ m(
        G,
        {
          sectionId: e,
          editorNodeId: g,
          label: "Large logo",
          style: {
            position: "relative",
            overflow: "hidden",
            width: "100%",
            minHeight: ve,
            padding: 0,
            background: le ? f.scheme.background : f.scheme.background || "#f0f1ed",
            fontFamily: p,
            color: "#111827",
            boxSizing: "border-box"
          },
          children: [
            le ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: `center/cover url(${Se}) no-repeat`
                }
              }
            ) : null,
            De ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: De,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            se
          ]
        }
      )
    ] });
  }
  if (z) {
    const A = f.media1Url.trim() || Ki, J = f.media2Url.trim() || Yi, Q = f.minHeight, q = U(n, `${c}.verticalOnMobile`, !0), ee = l(n, `${c}.backgroundMedia`, "none"), ve = l(n, `${c}.backgroundImageUrl`, ""), Y = ee === "image" && !!ve.trim(), Se = l(n, `${c}.borderStyle`, "none"), le = y(n, `${c}.cornerRadius`, 0), he = Se === "solid" ? `1px solid ${f.scheme.muted}55` : void 0, oe = Ii(e, q), re = f.mediaOverlay && A ? f.overlayStyle === "gradient" ? f.overlayGradientDirection === "down" ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : `linear-gradient(180deg, ${f.overlayColor} 0%, transparent 100%)` : f.overlayColor : void 0, ae = f.mediaOverlay && Y ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : void 0, De = {
      margin: 0,
      fontFamily: r,
      fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
      fontWeight: 700,
      lineHeight: 1.1,
      color: "#ffffff",
      textAlign: "center",
      textShadow: "0 2px 16px rgba(0,0,0,0.35)"
    }, Ge = (at, Ke, ie, pe, nt) => /* @__PURE__ */ m(
      "div",
      {
        className: "split-showcase-tile",
        style: {
          flex: "1 1 50%",
          position: "relative",
          minHeight: Q,
          overflow: "hidden"
        },
        children: [
          /* @__PURE__ */ o(
            "div",
            {
              "aria-hidden": !0,
              style: {
                position: "absolute",
                inset: 0,
                background: `center/cover url(${at}) no-repeat`
              }
            }
          ),
          re ? /* @__PURE__ */ o(
            "div",
            {
              "aria-hidden": !0,
              style: {
                position: "absolute",
                inset: 0,
                background: re,
                zIndex: 1,
                pointerEvents: "none"
              }
            }
          ) : null,
          /* @__PURE__ */ m(
            "div",
            {
              style: {
                position: "relative",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: Q,
                padding: "48px 28px 40px",
                boxSizing: "border-box",
                textAlign: "center"
              },
              children: [
                /* @__PURE__ */ o(
                  "div",
                  {
                    style: {
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%"
                    },
                    children: Ke.trim() ? pe ? /* @__PURE__ */ o(
                      E,
                      {
                        nodeId: Be(e, t, i, pe),
                        label: "Text",
                        children: /* @__PURE__ */ o(k, { fieldPath: ie, label: "Text", as: "h2", style: De, children: Ke })
                      }
                    ) : /* @__PURE__ */ o(k, { fieldPath: ie, label: "Text", as: "h2", style: De, children: Ke }) : null
                  }
                ),
                /* @__PURE__ */ o("div", { style: { flexShrink: 0, paddingTop: 8 }, children: /* @__PURE__ */ o(
                  Ji,
                  {
                    blockId: nt,
                    blocksBase: h,
                    sectionNodePrefix: g
                  }
                ) })
              ]
            }
          )
        ]
      }
    ), se = /* @__PURE__ */ m(
      "div",
      {
        className: "split-showcase-grid",
        style: {
          display: "flex",
          flexDirection: f.direction,
          gap: f.gap,
          width: "100%",
          minHeight: Q,
          boxSizing: "border-box"
        },
        children: [
          Ge(
            A,
            W,
            `${c}.title`,
            "heading",
            "primary_button"
          ),
          Ge(
            J,
            w,
            `${h}.text_right.settings.text`,
            "text_right",
            "secondary_button"
          )
        ]
      }
    ), Ne = f.sectionLink ? /* @__PURE__ */ o(
      I,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: se
      }
    ) : se;
    return /* @__PURE__ */ m(ne, { children: [
      te ? /* @__PURE__ */ o("style", { children: te }) : null,
      oe ? /* @__PURE__ */ o("style", { children: oe }) : null,
      /* @__PURE__ */ m(
        G,
        {
          sectionId: e,
          editorNodeId: g,
          label: "Split showcase",
          style: {
            position: "relative",
            overflow: "hidden",
            width: "100%",
            maxWidth: typeof f.maxWidth == "number" ? f.maxWidth : void 0,
            margin: "0 auto",
            minHeight: Q,
            paddingTop: f.paddingTop,
            paddingBottom: f.paddingBottom,
            background: f.scheme.background,
            borderRadius: le > 0 ? le : void 0,
            border: he,
            fontFamily: p,
            color: "#ffffff",
            boxSizing: "border-box"
          },
          children: [
            Y ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: `center/cover url(${ve}) no-repeat`
                }
              }
            ) : null,
            ae ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: ae,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            /* @__PURE__ */ o("div", { style: { position: "relative", zIndex: 2 }, children: Ne })
          ]
        }
      )
    ] });
  }
  if (_) {
    const A = f.media1Url.trim(), J = f.minHeight, Q = f.mediaOverlay ? f.overlayStyle === "gradient" ? f.overlayGradientDirection === "down" ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : `linear-gradient(180deg, ${f.overlayColor} 0%, transparent 100%)` : f.overlayColor : void 0, q = /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          minHeight: J,
          width: "100%",
          padding: `${f.paddingTop}px 24px ${f.paddingBottom}px`,
          boxSizing: "border-box",
          gap: Math.min(f.gap, 20)
        },
        children: Ue(!0)
      }
    ), ee = f.sectionLink ? /* @__PURE__ */ o(
      I,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: q
      }
    ) : q;
    return /* @__PURE__ */ m(ne, { children: [
      te ? /* @__PURE__ */ o("style", { children: te }) : null,
      B ? /* @__PURE__ */ o("style", { children: B }) : null,
      /* @__PURE__ */ m(
        G,
        {
          sectionId: e,
          editorNodeId: g,
          label: "Hero",
          style: {
            position: "relative",
            overflow: "hidden",
            width: "100%",
            minHeight: J,
            padding: 0,
            background: "#1a3a4a",
            fontFamily: p,
            color: "#ffffff",
            boxSizing: "border-box"
          },
          children: [
            A ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: `center/cover url(${A}) no-repeat`
                }
              }
            ) : /* @__PURE__ */ o(dt, {}),
            Q ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: Q,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            ee
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ m(ne, { children: [
    te ? /* @__PURE__ */ o("style", { children: te }) : null,
    B ? /* @__PURE__ */ o("style", { children: B }) : null,
    /* @__PURE__ */ m(
      G,
      {
        sectionId: e,
        editorNodeId: g,
        label: b ? "Hero: Bottom aligned" : v ? "Hero: Marquee" : x ? "Large logo" : z ? "Split showcase" : "Hero",
        style: {
          position: "relative",
          overflow: "hidden",
          minHeight: f.minHeight,
          paddingTop: x ? 0 : f.paddingTop,
          paddingBottom: x ? 0 : f.paddingBottom,
          background: x ? "#f3f0ea" : ce ? void 0 : f.scheme.background,
          fontFamily: p,
          color: f.scheme.color,
          boxSizing: "border-box"
        },
        children: [
          He && !x ? /* @__PURE__ */ o(dt, {}) : null,
          (!ce || f.direction === "column") && f.media1Url ? /* @__PURE__ */ o(
            "div",
            {
              "aria-hidden": !0,
              style: {
                position: "absolute",
                inset: 0,
                background: `center/cover url(${f.media1Url}) no-repeat`,
                filter: f.blurredReflection ? "blur(16px)" : void 0,
                transform: f.blurredReflection ? "scale(1.08)" : void 0
              }
            }
          ) : null,
          f.mediaOverlay && (ce || He) ? /* @__PURE__ */ o(
            "div",
            {
              "aria-hidden": !0,
              style: {
                position: "absolute",
                inset: 0,
                background: de,
                zIndex: 1,
                pointerEvents: "none"
              }
            }
          ) : null,
          Qe
        ]
      }
    )
  ] });
}
const Ut = {
  "scheme-1": {
    background: "#f0f4f8",
    color: "#111827",
    border: "#d1d5db",
    inputBg: "#ffffff",
    inputBorder: "#d1d5db",
    buttonBg: "#111827",
    buttonColor: "#ffffff"
  },
  "scheme-2": {
    background: "#eff6ff",
    color: "#0f172a",
    border: "#bfdbfe",
    inputBg: "#ffffff",
    inputBorder: "#93c5fd",
    buttonBg: "#1e3a5f",
    buttonColor: "#ffffff"
  },
  "scheme-3": {
    background: "#fff7ed",
    color: "#431407",
    border: "#fed7aa",
    inputBg: "#ffffff",
    inputBorder: "#fdba74",
    buttonBg: "#431407",
    buttonColor: "#ffffff"
  },
  "scheme-4": {
    background: "#f5f3ff",
    color: "#1e1b4b",
    border: "#ddd6fe",
    inputBg: "#ffffff",
    inputBorder: "#c4b5fd",
    buttonBg: "#4c1d95",
    buttonColor: "#ffffff"
  }
}, en = {
  auto: void 0,
  small: 320,
  medium: 480,
  large: 640
};
function tn(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.height`, "auto"), s = l(e, `${t}.direction`, "vertical"), u = l(e, `${t}.layoutAlignment`, "center");
  return {
    direction: s === "horizontal" ? "horizontal" : "vertical",
    alignment: u === "left" || u === "right" ? u : "center",
    position: ["top", "bottom"].includes(l(e, `${t}.position`, "center")) ? l(e, `${t}.position`, "center") : "center",
    gap: y(e, `${t}.layoutGap`, 32),
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: n,
    minHeight: en[n],
    colorScheme: Ut[i] ?? Ut["scheme-1"],
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none") === "image" ? "image" : "none",
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none") === "solid" ? "solid" : "none",
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: U(e, `${t}.backgroundOverlay`, !1),
    paddingTop: y(e, `${t}.paddingTop`, 32),
    paddingBottom: y(e, `${t}.paddingBottom`, 32),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function on(e, t) {
  const i = t.trim();
  return i ? i.replace(/:root/g, `[data-ziplofy-section="${e}"]`) : "";
}
function Vo({
  sectionId: e = "contact_form",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), [d, a] = Z(""), [r, p] = Z(""), [c, h] = Z(""), [g, $] = Z(""), b = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, v = i === "template" ? `template:${t}:${e}` : `layout:${e}`, x = F(() => tn(n, b), [n, b]), z = l(n, `${b}.title`), S = l(n, `${b}.namePlaceholder`), _ = l(n, `${b}.emailPlaceholder`), H = l(n, `${b}.phonePlaceholder`), w = l(n, `${b}.commentPlaceholder`), R = l(n, `${b}.submitLabel`), T = x.colorScheme, W = x.sectionWidth === "full" ? "100%" : L.maxWidth, P = x.sectionWidth === "full" ? 24 : L.padX, C = x.alignment === "left" ? "left" : x.alignment === "right" ? "right" : "center", M = x.position === "top" ? "flex-start" : x.position === "bottom" ? "flex-end" : "center", f = Math.max(x.cornerRadius > 0 ? x.cornerRadius : 8, 0), O = {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: s,
    fontSize: 15,
    lineHeight: 1.4,
    color: T.color,
    background: T.inputBg,
    border: `1px solid ${T.inputBorder}`,
    borderRadius: f,
    padding: "12px 14px",
    outline: "none"
  }, N = (B) => {
    B.preventDefault(), a(""), p(""), h(""), $("");
  }, D = {
    position: "relative",
    background: T.background,
    color: T.color,
    fontFamily: s,
    paddingTop: x.paddingTop,
    paddingBottom: x.paddingBottom,
    paddingLeft: P,
    paddingRight: P,
    boxSizing: "border-box",
    border: x.borderStyle === "solid" ? `1px solid ${T.border}` : void 0,
    borderRadius: x.cornerRadius > 0 ? x.cornerRadius : void 0,
    overflow: "hidden",
    ...x.minHeight != null ? { minHeight: x.minHeight } : {}
  }, V = {
    maxWidth: W,
    margin: "0 auto",
    width: "100%",
    minHeight: x.minHeight != null ? x.minHeight - x.paddingTop - x.paddingBottom : void 0,
    display: "flex",
    flexDirection: x.direction === "horizontal" ? "row" : "column",
    alignItems: x.direction === "horizontal" ? "center" : void 0,
    justifyContent: M,
    gap: x.gap,
    textAlign: C
  }, te = {
    maxWidth: 520,
    width: "100%",
    margin: x.alignment === "center" ? "0 auto" : void 0,
    marginLeft: x.alignment === "right" ? "auto" : void 0,
    marginRight: x.alignment === "left" ? "auto" : void 0,
    flex: x.direction === "horizontal" ? "1 1 320px" : void 0
  };
  return /* @__PURE__ */ m(G, { sectionId: e, editorNodeId: v, label: "Contact form", style: D, children: [
    x.backgroundMedia === "image" && x.backgroundImageUrl ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${x.backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    x.backgroundOverlay && x.backgroundMedia === "image" ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          zIndex: 1
        }
      }
    ) : null,
    x.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: on(e, x.customCss) } }) : null,
    /* @__PURE__ */ m("div", { style: { ...V, position: "relative", zIndex: 2 }, children: [
      /* @__PURE__ */ o(
        k,
        {
          fieldPath: `${b}.title`,
          label: "Heading",
          as: "h2",
          style: {
            margin: 0,
            flex: x.direction === "horizontal" ? "0 0 auto" : void 0,
            fontFamily: u,
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.2,
            color: T.color,
            textAlign: C
          },
          children: z
        }
      ),
      /* @__PURE__ */ m("form", { onSubmit: N, style: te, children: [
        /* @__PURE__ */ m(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              marginBottom: 12
            },
            children: [
              /* @__PURE__ */ o(k, { fieldPath: `${b}.namePlaceholder`, label: "Name placeholder", as: "span", children: /* @__PURE__ */ o(
                "input",
                {
                  type: "text",
                  value: d,
                  onChange: (B) => a(B.target.value),
                  placeholder: S,
                  style: O,
                  "aria-label": S
                }
              ) }),
              /* @__PURE__ */ o(k, { fieldPath: `${b}.emailPlaceholder`, label: "Email placeholder", as: "span", children: /* @__PURE__ */ o(
                "input",
                {
                  type: "email",
                  value: r,
                  onChange: (B) => p(B.target.value),
                  placeholder: _,
                  style: O,
                  "aria-label": _
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ o("div", { style: { marginBottom: 12 }, children: /* @__PURE__ */ o(k, { fieldPath: `${b}.phonePlaceholder`, label: "Phone placeholder", as: "span", children: /* @__PURE__ */ o(
          "input",
          {
            type: "tel",
            value: c,
            onChange: (B) => h(B.target.value),
            placeholder: H,
            style: O,
            "aria-label": H
          }
        ) }) }),
        /* @__PURE__ */ o("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ o(k, { fieldPath: `${b}.commentPlaceholder`, label: "Comment placeholder", as: "span", children: /* @__PURE__ */ o(
          "textarea",
          {
            value: g,
            onChange: (B) => $(B.target.value),
            placeholder: w,
            rows: 5,
            style: { ...O, resize: "vertical", minHeight: 120 },
            "aria-label": w
          }
        ) }) }),
        /* @__PURE__ */ o(k, { fieldPath: `${b}.submitLabel`, label: "Submit button", children: /* @__PURE__ */ o(
          "button",
          {
            type: "submit",
            style: {
              fontFamily: s,
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1,
              color: T.buttonColor,
              background: T.buttonBg,
              border: "none",
              borderRadius: 9999,
              padding: "14px 28px",
              cursor: "pointer"
            },
            children: R
          }
        ) })
      ] })
    ] })
  ] });
}
const Nt = {
  "scheme-1": {
    background: "#f6f6f7",
    color: "#111827",
    border: "#d1d5db",
    muted: "#6b7280",
    inputBg: "#ffffff",
    inputBorder: "#d1d5db",
    buttonColor: "#111827"
  },
  "scheme-2": {
    background: "#eff6ff",
    color: "#0f172a",
    border: "#93c5fd",
    muted: "#475569",
    inputBg: "#ffffff",
    inputBorder: "#93c5fd",
    buttonColor: "#1e3a5f"
  },
  "scheme-3": {
    background: "#fff7ed",
    color: "#431407",
    border: "#fdba74",
    muted: "#9a3412",
    inputBg: "#ffffff",
    inputBorder: "#fdba74",
    buttonColor: "#431407"
  },
  "scheme-4": {
    background: "#f5f3ff",
    color: "#1e1b4b",
    border: "#c4b5fd",
    muted: "#5b21b6",
    inputBg: "#ffffff",
    inputBorder: "#c4b5fd",
    buttonColor: "#4c1d95"
  }
}, nn = {
  auto: void 0,
  small: 280,
  medium: 400,
  large: 520
};
function ln(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.height`, "auto"), s = l(e, `${t}.direction`, "vertical"), u = l(e, `${t}.layoutAlignment`, "center");
  return {
    direction: s === "horizontal" ? "horizontal" : "vertical",
    alignment: u === "left" || u === "right" ? u : "center",
    position: ["top", "bottom"].includes(l(e, `${t}.position`, "center")) ? l(e, `${t}.position`, "center") : "center",
    gap: y(e, `${t}.layoutGap`, 16),
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: n,
    minHeight: nn[n],
    colorScheme: Nt[i] ?? Nt["scheme-1"],
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none") === "image" ? "image" : "none",
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none") === "solid" ? "solid" : "none",
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: U(e, `${t}.backgroundOverlay`, !1),
    paddingTop: y(e, `${t}.paddingTop`, 40),
    paddingBottom: y(e, `${t}.paddingBottom`, 40),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function rn(e, t) {
  const i = t.trim();
  return i ? i.replace(/:root/g, `[data-ziplofy-section="${e}"]`) : "";
}
function Ko({
  sectionId: e = "email_signup",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), [d, a] = Z(""), r = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, p = i === "template" ? `template:${t}:${e}` : `layout:${e}`, c = F(() => ln(n, r), [n, r]), h = l(n, `${r}.title`), g = l(n, `${r}.subtitle`), $ = l(n, `${r}.placeholder`), b = l(n, `${r}.buttonLabel`), v = c.colorScheme, x = c.sectionWidth === "full" ? "100%" : L.maxWidth, z = c.sectionWidth === "full" ? 24 : L.padX, S = c.alignment === "left" ? "left" : c.alignment === "right" ? "right" : "center", _ = c.position === "top" ? "flex-start" : c.position === "bottom" ? "flex-end" : "center", H = 100, w = (f) => {
    f.preventDefault(), a("");
  }, R = {
    position: "relative",
    background: v.background,
    color: v.color,
    fontFamily: s,
    paddingTop: c.paddingTop,
    paddingBottom: c.paddingBottom,
    paddingLeft: z,
    paddingRight: z,
    boxSizing: "border-box",
    border: c.borderStyle === "solid" ? `1px solid ${v.border}` : void 0,
    borderRadius: c.cornerRadius > 0 ? c.cornerRadius : void 0,
    overflow: "hidden",
    ...c.minHeight != null ? { minHeight: c.minHeight } : {}
  }, T = {
    maxWidth: x,
    margin: "0 auto",
    width: "100%",
    minHeight: c.minHeight != null ? c.minHeight - c.paddingTop - c.paddingBottom : void 0,
    display: "flex",
    flexDirection: c.direction === "horizontal" ? "row" : "column",
    alignItems: c.direction === "horizontal" ? "center" : void 0,
    justifyContent: _,
    gap: c.gap,
    textAlign: S
  }, W = {
    flex: c.direction === "horizontal" ? "1 1 280px" : void 0,
    minWidth: 0,
    marginLeft: c.alignment === "right" && c.direction === "vertical" ? "auto" : void 0,
    marginRight: c.alignment === "left" && c.direction === "vertical" ? "auto" : void 0,
    maxWidth: c.direction === "vertical" ? 520 : void 0,
    width: c.direction === "vertical" ? "100%" : void 0
  }, P = {
    flex: c.direction === "horizontal" ? "1 1 320px" : void 0,
    minWidth: 0,
    width: c.direction === "vertical" ? "100%" : void 0,
    maxWidth: 420,
    marginLeft: c.direction === "vertical" && c.alignment === "center" || c.direction === "vertical" && c.alignment === "right" ? "auto" : void 0,
    marginRight: c.direction === "vertical" && c.alignment === "center" || c.direction === "vertical" && c.alignment === "left" ? "auto" : void 0
  }, C = {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    overflow: "hidden",
    border: `1px solid ${v.inputBorder}`,
    borderRadius: H,
    background: v.inputBg
  }, M = {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: s,
    fontSize: 15,
    lineHeight: 1.4,
    color: v.color,
    padding: "12px 16px",
    boxSizing: "border-box"
  };
  return /* @__PURE__ */ m(G, { sectionId: e, editorNodeId: p, label: "Email signup", style: R, children: [
    c.backgroundMedia === "image" && c.backgroundImageUrl ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${c.backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    c.backgroundOverlay && c.backgroundMedia === "image" ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          zIndex: 1
        }
      }
    ) : null,
    c.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: rn(e, c.customCss) } }) : null,
    /* @__PURE__ */ m("div", { style: { ...T, position: "relative", zIndex: 2 }, children: [
      h.trim() || g.trim() ? /* @__PURE__ */ m("div", { style: W, children: [
        h.trim() ? /* @__PURE__ */ o(
          k,
          {
            fieldPath: `${r}.title`,
            label: "Heading",
            as: "h2",
            style: {
              margin: c.direction === "horizontal" ? 0 : "0 0 12px",
              fontFamily: u,
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.2,
              color: v.color,
              textAlign: S
            },
            children: h
          }
        ) : null,
        g.trim() ? /* @__PURE__ */ o(
          k,
          {
            fieldPath: `${r}.subtitle`,
            label: "Subtext",
            as: "p",
            style: {
              margin: c.direction === "horizontal" ? 0 : "0 0 28px",
              fontSize: 15,
              lineHeight: 1.5,
              color: v.muted,
              textAlign: S
            },
            children: g
          }
        ) : null
      ] }) : null,
      /* @__PURE__ */ o("form", { onSubmit: w, style: P, children: /* @__PURE__ */ o(k, { fieldPath: `${r}.placeholder`, label: "Email placeholder", as: "span", children: /* @__PURE__ */ m("div", { style: C, children: [
        /* @__PURE__ */ o(
          "input",
          {
            type: "email",
            value: d,
            onChange: (f) => a(f.target.value),
            placeholder: $,
            style: M,
            "aria-label": $
          }
        ),
        /* @__PURE__ */ o(
          "button",
          {
            type: "submit",
            "aria-label": b || $ || "Submit",
            style: {
              flexShrink: 0,
              border: "none",
              background: "transparent",
              color: v.buttonColor,
              fontFamily: s,
              fontSize: 20,
              fontWeight: 600,
              cursor: "pointer",
              padding: "8px 14px",
              lineHeight: 1
            },
            children: "→"
          }
        )
      ] }) }) })
    ] })
  ] });
}
const Ot = {
  "scheme-1": { background: "#ffffff", color: "#111827", border: "#d1d5db" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", border: "#93c5fd" },
  "scheme-3": { background: "#fff7ed", color: "#431407", border: "#fdba74" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", border: "#c4b5fd" }
}, Gt = {
  auto: 120,
  small: 280,
  medium: 480,
  large: 640
};
function an(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.height`, "small"), s = l(e, `${t}.direction`, "vertical"), u = l(e, `${t}.layoutAlignment`, "left"), d = y(e, `${t}.minHeight`, 0), a = Gt[n];
  return {
    direction: s === "horizontal" ? "horizontal" : "vertical",
    alignment: u === "left" || u === "right" ? u : "center",
    position: ["top", "bottom"].includes(l(e, `${t}.position`, "center")) ? l(e, `${t}.position`, "center") : "center",
    gap: y(e, `${t}.layoutGap`, 12),
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: n,
    minHeight: a ?? (d > 0 ? d : Gt.small),
    colorScheme: Ot[i] ?? Ot["scheme-1"],
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none") === "image" ? "image" : "none",
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none") === "solid" ? "solid" : "none",
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: U(e, `${t}.backgroundOverlay`, !1),
    paddingTop: y(e, `${t}.paddingTop`, 0),
    paddingBottom: y(e, `${t}.paddingBottom`, 0),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function dn(e, t) {
  const i = t.trim();
  return i ? i.replace(/:root/g, `[data-ziplofy-section="${e}"]`) : "";
}
function vt({ sectionId: e, placement: t = "template", templateId: i = "index" }) {
  const n = j(), { fontBody: s } = X(), u = t === "template" ? `templates.${i}.sections.${e}.settings` : `sections.${e}.settings`, d = t === "template" ? `template:${i}:${e}` : `layout:${e}`, a = F(() => an(n, u), [n, u]), r = a.colorScheme, p = a.sectionWidth === "full" ? "100%" : L.maxWidth, c = a.sectionWidth === "full" ? 24 : L.padX, h = a.alignment === "left" ? "left" : a.alignment === "right" ? "right" : "center", g = a.position === "top" ? "flex-start" : a.position === "bottom" ? "flex-end" : "center", $ = {
    position: "relative",
    background: r.background,
    color: r.color,
    fontFamily: s,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: c,
    paddingRight: c,
    boxSizing: "border-box",
    border: a.borderStyle === "solid" ? `1px solid ${r.border}` : void 0,
    borderRadius: a.cornerRadius > 0 ? a.cornerRadius : void 0,
    overflow: "hidden",
    minHeight: a.minHeight
  }, b = {
    maxWidth: p,
    margin: "0 auto",
    width: "100%",
    minHeight: Math.max(a.minHeight - a.paddingTop - a.paddingBottom, 80),
    display: "flex",
    flexDirection: a.direction === "horizontal" ? "row" : "column",
    alignItems: a.direction === "horizontal" ? "center" : void 0,
    justifyContent: g,
    gap: a.gap,
    textAlign: h
  }, v = {
    flex: 1,
    width: "100%",
    minHeight: 80,
    marginLeft: a.alignment === "right" ? "auto" : void 0,
    marginRight: a.alignment === "left" ? "auto" : void 0,
    maxWidth: a.alignment === "center" ? "100%" : void 0
  };
  return /* @__PURE__ */ m(G, { sectionId: e, editorNodeId: d, label: "Custom section", style: $, children: [
    a.backgroundMedia === "image" && a.backgroundImageUrl ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${a.backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    a.backgroundOverlay && a.backgroundMedia === "image" ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          zIndex: 1
        }
      }
    ) : null,
    a.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: dn(e, a.customCss) } }) : null,
    /* @__PURE__ */ o("div", { style: { ...b, position: "relative", zIndex: 2 }, children: /* @__PURE__ */ o("div", { style: v, "aria-hidden": !0 }) })
  ] });
}
function St() {
  return /* @__PURE__ */ m("div", { className: "relative mx-auto h-[120px] w-[140px]", "aria-hidden": !0, children: [
    [0, 1, 2].map((e) => /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          left: "50%",
          borderRadius: 4,
          background: "#4a9a9a",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          width: `${88 - e * 10}px`,
          height: `${28 - e * 3}px`,
          bottom: `${e * 22}px`,
          transform: `translateX(-50%) rotate(${-5 + e * 5}deg) skewX(-8deg)`,
          clipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)",
          opacity: 1 - e * 0.1
        }
      },
      e
    )),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          left: "58%",
          bottom: "38px",
          width: 14,
          height: 10,
          borderRadius: 2,
          background: "rgba(255,255,255,0.35)",
          transform: "rotate(-8deg)"
        }
      }
    )
  ] });
}
function Yo() {
  return /* @__PURE__ */ o(
    "div",
    {
      style: {
        position: "relative",
        width: 160,
        height: 180,
        margin: "0 auto",
        background: "#ffffff",
        borderRadius: 4,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
      },
      "aria-hidden": !0,
      children: /* @__PURE__ */ m(
        "div",
        {
          style: {
            position: "absolute",
            left: "50%",
            bottom: 8,
            transform: "translateX(-50%)",
            width: 120,
            height: 140,
            borderRadius: "8px 8px 4px 4px",
            background: "#c45c4a",
            boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.06)"
          },
          children: [
            /* @__PURE__ */ o(
              "div",
              {
                style: {
                  position: "absolute",
                  left: 8,
                  right: 8,
                  top: 0,
                  height: 14,
                  borderRadius: "0 0 6px 6px",
                  background: "#e8c547"
                }
              }
            ),
            /* @__PURE__ */ o(
              "div",
              {
                style: {
                  position: "absolute",
                  left: 0,
                  top: "32%",
                  width: 6,
                  height: "42%",
                  background: "#e8c547",
                  borderRadius: "0 4px 4px 0"
                }
              }
            ),
            /* @__PURE__ */ o(
              "div",
              {
                style: {
                  position: "absolute",
                  right: 0,
                  top: "32%",
                  width: 6,
                  height: "42%",
                  background: "#e8c547",
                  borderRadius: "4px 0 0 4px"
                }
              }
            )
          ]
        }
      )
    }
  );
}
const jt = {
  "scheme-1": {
    background: "#ffffff",
    color: "#111827",
    muted: "#6b7280",
    panelLeft: "#ececec",
    panelRight: "#f7f5f0"
  },
  "scheme-2": {
    background: "#f8fafc",
    color: "#0f172a",
    muted: "#64748b",
    panelLeft: "#e2e8f0",
    panelRight: "#f1f5f9"
  },
  "scheme-3": {
    background: "#fff7ed",
    color: "#431407",
    muted: "#9a3412",
    panelLeft: "#ffedd5",
    panelRight: "#fff7ed"
  },
  "scheme-4": {
    background: "#f5f3ff",
    color: "#1e1b4b",
    muted: "#5b21b6",
    panelLeft: "#ede9fe",
    panelRight: "#f5f3ff"
  }
};
function Zo(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1");
  return {
    scheme: jt[i] ?? jt["scheme-1"],
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    paddingTop: y(e, `${t}.paddingTop`, 0),
    paddingBottom: y(e, `${t}.paddingBottom`, 0),
    layoutGap: y(e, `${t}.layoutGap`, 48),
    equalColumns: U(e, `${t}.equalColumns`, !0),
    limitProductDetailsWidth: U(e, `${t}.limitProductDetailsWidth`, !1),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function Qo(e, t) {
  const i = t.trim();
  return i ? i.replace(/:root/g, `[data-ziplofy-section="${e}"]`) : "";
}
function cn({ rating: e, reviewCount: t, color: i, muted: n }) {
  const s = Math.floor(e), u = e - s >= 0.5, d = [];
  for (let a = 0; a < 5; a += 1)
    a < s ? d.push("★") : a === s && u ? d.push("⯨") : d.push("☆");
  return /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12 }, children: [
    /* @__PURE__ */ o("span", { style: { color: "#111827", fontSize: 14, letterSpacing: 1 }, "aria-hidden": !0, children: d.join("") }),
    /* @__PURE__ */ m("span", { style: { fontSize: 13, color: n }, children: [
      t,
      " ",
      t === 1 ? "review" : "reviews"
    ] })
  ] });
}
function sn({
  sectionId: e = "product_highlight",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), { storeFrontMeta: d } = it(), { products: a, fetchProductsByStoreId: r, fetchProductById: p, productDetail: c } = ht(), h = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, g = i === "template" ? `template:${t}:${e}` : `layout:${e}`, $ = F(() => Zo(n, h), [n, h]), b = l(n, `${h}.productId`, ""), v = l(n, `${h}.productTitle`), x = l(n, `${h}.price`), z = l(n, `${h}.productImageUrl`, ""), S = l(n, `${h}.mediaPosition`, "left"), _ = U(n, `${h}.showRating`, !0), H = y(n, `${h}.rating`, 4.5), w = y(n, `${h}.reviewCount`, 3), R = U(n, `${h}.showTaxNote`, !0), T = l(n, `${h}.taxNote`), W = l(n, `${h}.buttonLabel`), P = U(n, `${h}.soldOut`, !0), C = d?.storeId ?? "";
  ue(() => {
    C && r({ storeId: C, page: 1, limit: 24 });
  }, [C, r]), ue(() => {
    if (!b) return;
    a.some((Te) => Te._id === b) || p(b);
  }, [b, a, p]);
  const M = F(() => b ? c?._id === b ? c : a.find((ge) => ge._id === b) ?? null : null, [b, c, a]), f = M?.title ?? v, O = M ? Ye(M.price) : x, N = M?.imageUrls?.[0] ?? z, D = $.scheme, V = S !== "right", te = $.sectionWidth === "full" ? "100%" : L.maxWidth, B = $.sectionWidth === "full" ? 24 : L.padX, de = $.equalColumns ? "1fr 1fr" : "1.05fr 0.95fr", ce = {
    background: D.background,
    color: D.color,
    fontFamily: s,
    paddingTop: $.paddingTop,
    paddingBottom: $.paddingBottom,
    paddingLeft: B,
    paddingRight: B,
    boxSizing: "border-box"
  }, ye = {
    maxWidth: te,
    margin: "0 auto",
    width: "100%"
  }, Oe = {
    display: "grid",
    gridTemplateColumns: de,
    gap: $.layoutGap,
    alignItems: "stretch",
    width: "100%"
  }, Ue = {
    background: D.panelLeft,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 360,
    padding: "40px 32px",
    order: V ? 0 : 1,
    borderRadius: 0
  }, je = {
    background: D.panelRight,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "40px 48px",
    order: V ? 1 : 0,
    maxWidth: $.limitProductDetailsWidth ? 420 : void 0,
    width: "100%",
    boxSizing: "border-box"
  }, xe = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    width: "100%"
  }, Me = {
    margin: 0,
    fontFamily: u,
    fontSize: 28,
    fontWeight: 400,
    lineHeight: 1.25,
    color: D.color,
    flex: 1,
    minWidth: 0
  }, ke = {
    margin: 0,
    fontSize: 16,
    fontWeight: 400,
    color: D.color,
    whiteSpace: "nowrap"
  }, Fe = {
    margin: "6px 0 0",
    fontSize: 13,
    color: D.muted
  }, Ie = {
    marginTop: 24,
    width: "100%",
    maxWidth: 360,
    padding: "14px 24px",
    border: "none",
    borderRadius: 999,
    background: P ? "#6b7280" : "#111827",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 500,
    cursor: P ? "not-allowed" : "pointer",
    fontFamily: s
  };
  return /* @__PURE__ */ m(G, { nodeId: g, label: "Featured product", style: ce, children: [
    $.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Qo(e, $.customCss) } }) : null,
    /* @__PURE__ */ o("div", { style: ye, "data-ziplofy-section": e, children: /* @__PURE__ */ m("div", { style: Oe, children: [
      /* @__PURE__ */ o("div", { style: Ue, children: N ? /* @__PURE__ */ o(
        "img",
        {
          src: N,
          alt: "",
          style: { maxWidth: "100%", maxHeight: 320, objectFit: "contain", display: "block" }
        }
      ) : /* @__PURE__ */ o(Yo, {}) }),
      /* @__PURE__ */ m("div", { style: je, children: [
        /* @__PURE__ */ m("div", { style: xe, children: [
          /* @__PURE__ */ o(
            k,
            {
              nodeId: g,
              fieldPath: `${h}.productTitle`,
              label: "Product title",
              as: "h2",
              style: Me,
              children: f
            }
          ),
          /* @__PURE__ */ o(
            k,
            {
              nodeId: g,
              fieldPath: `${h}.price`,
              label: "Price",
              as: "span",
              style: ke,
              children: O
            }
          )
        ] }),
        R ? /* @__PURE__ */ o(k, { nodeId: g, fieldPath: `${h}.taxNote`, label: "Tax note", as: "p", style: Fe, children: T }) : null,
        _ ? /* @__PURE__ */ o(cn, { rating: H, reviewCount: w, color: D.color, muted: D.muted }) : null,
        /* @__PURE__ */ o(k, { nodeId: g, fieldPath: `${h}.buttonLabel`, label: "Button", as: "span", children: /* @__PURE__ */ o("button", { type: "button", disabled: P, style: Ie, children: W }) })
      ] })
    ] }) })
  ] });
}
function Jo({
  sectionId: e = "product_highlight",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), { storeFrontMeta: d } = it(), { products: a, fetchProductsByStoreId: r, fetchProductById: p, productDetail: c } = ht(), h = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, g = i === "template" ? `template:${t}:${e}` : `layout:${e}`;
  if (l(n, `${h}.catalogVariant`, "") === "featured-product")
    return /* @__PURE__ */ o(
      sn,
      {
        sectionId: e,
        templateId: t,
        placement: i
      }
    );
  const b = F(() => Zo(n, h), [n, h]), v = l(n, `${h}.productId`, ""), x = l(n, `${h}.productTitle`), z = l(n, `${h}.price`), S = l(n, `${h}.productImageUrl`, ""), _ = l(n, `${h}.mediaPosition`, "left"), H = d?.storeId ?? "";
  ue(() => {
    H && r({ storeId: H, page: 1, limit: 24 });
  }, [H, r]), ue(() => {
    if (!v) return;
    a.some((Oe) => Oe._id === v) || p(v);
  }, [v, a, p]);
  const w = F(() => v ? c?._id === v ? c : a.find((ye) => ye._id === v) ?? null : null, [v, c, a]), R = w?.title ?? x, T = w ? Ye(w.price) : z, W = w?.imageUrls?.[0] ?? S, P = b.scheme, C = L.maxWidth, M = L.padX, f = _ !== "right", O = {
    background: P.background,
    color: P.color,
    fontFamily: s,
    paddingTop: b.paddingTop,
    paddingBottom: b.paddingBottom,
    paddingLeft: M,
    paddingRight: M,
    boxSizing: "border-box"
  }, N = {
    maxWidth: C,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: 320,
    width: "100%",
    overflow: "hidden"
  }, D = {
    background: P.panelLeft,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    minHeight: 280,
    order: f ? 0 : 1
  }, V = {
    background: P.panelRight,
    display: "flex",
    flexDirection: "column",
    padding: "28px 32px",
    minHeight: 280,
    position: "relative",
    order: f ? 1 : 0
  }, te = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    width: "100%"
  }, B = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 8
  }, de = /* @__PURE__ */ o("div", { style: D, children: /* @__PURE__ */ o(St, {}) }), ce = /* @__PURE__ */ m("div", { style: V, children: [
    /* @__PURE__ */ m("div", { style: te, children: [
      /* @__PURE__ */ o(
        k,
        {
          fieldPath: `${h}.productTitle`,
          label: "Product title",
          as: "h2",
          style: {
            margin: 0,
            fontFamily: u,
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.3,
            color: P.color,
            flex: 1,
            minWidth: 0
          },
          children: R
        }
      ),
      /* @__PURE__ */ o(
        k,
        {
          fieldPath: `${h}.price`,
          label: "Price",
          as: "span",
          style: {
            margin: 0,
            fontSize: 16,
            fontWeight: 400,
            color: P.color,
            whiteSpace: "nowrap"
          },
          children: T
        }
      )
    ] }),
    /* @__PURE__ */ o("div", { style: B, children: /* @__PURE__ */ o(k, { fieldPath: `${h}.productImageUrl`, label: "Product image", as: "span", children: W ? /* @__PURE__ */ o(
      "img",
      {
        src: W,
        alt: "",
        style: {
          maxWidth: "100%",
          maxHeight: 200,
          objectFit: "contain",
          display: "block"
        }
      }
    ) : /* @__PURE__ */ o(Yo, {}) }) })
  ] });
  return /* @__PURE__ */ m(G, { sectionId: e, editorNodeId: g, label: "Product highlight", style: O, children: [
    b.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Qo(e, b.customCss) } }) : null,
    /* @__PURE__ */ m("div", { style: N, children: [
      de,
      ce
    ] })
  ] });
}
function un({ sectionId: e }) {
  return /* @__PURE__ */ o(Jo, { sectionId: e, placement: "layout" });
}
function hn() {
  return /* @__PURE__ */ m(
    "div",
    {
      style: {
        position: "relative",
        width: 88,
        height: 96
      },
      "aria-hidden": !0,
      children: [
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              left: "50%",
              bottom: 0,
              width: 72,
              height: 64,
              transform: "translateX(-50%) skewX(-10deg)",
              borderRadius: 4,
              background: "#4a9a9a",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              clipPath: "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)"
            }
          }
        ),
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              left: "62%",
              bottom: 28,
              width: 16,
              height: 12,
              borderRadius: 2,
              background: "rgba(255,255,255,0.35)",
              transform: "rotate(-12deg)"
            }
          }
        )
      ]
    }
  );
}
const Dt = {
  "scheme-1": {
    background: "#ffffff",
    color: "#111827",
    muted: "#4b5563",
    mediaPanel: "#e5e7eb",
    contentPanel: "#e8f0f5"
  },
  "scheme-2": {
    background: "#f8fafc",
    color: "#0f172a",
    muted: "#64748b",
    mediaPanel: "#e2e8f0",
    contentPanel: "#f1f5f9"
  },
  "scheme-3": {
    background: "#fff7ed",
    color: "#431407",
    muted: "#9a3412",
    mediaPanel: "#ffedd5",
    contentPanel: "#fff7ed"
  },
  "scheme-4": {
    background: "#f5f3ff",
    color: "#1e1b4b",
    muted: "#5b21b6",
    mediaPanel: "#ede9fe",
    contentPanel: "#f5f3ff"
  }
}, Bt = {
  small: ["2fr", "3fr"],
  medium: ["1fr", "1fr"],
  large: ["3fr", "2fr"]
}, Xt = {
  small: 240,
  medium: 320,
  large: 400
};
function pn(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-4"), n = l(e, `${t}.mediaWidth`, "medium"), s = l(e, `${t}.mediaHeight`, "medium"), u = n === "small" || n === "large" ? n : "medium", d = s === "small" || s === "large" ? s : "medium";
  return {
    scheme: Dt[i] ?? Dt["scheme-4"],
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    mediaWidth: u,
    mediaHeight: d,
    paddingTop: y(e, `${t}.paddingTop`, 0),
    paddingBottom: y(e, `${t}.paddingBottom`, 0),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function mn(e) {
  const [t, i] = Bt[e] ?? Bt.medium;
  return `${t} ${i}`;
}
function gn(e) {
  return Xt[e] ?? Xt.medium;
}
function fn(e, t) {
  const i = t.trim();
  return i ? i.replace(/:root/g, `[data-ziplofy-section="${e}"]`) : "";
}
function ei({
  sectionId: e = "editorial",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(() => pn(n, d), [n, d]), p = l(n, `${d}.imageUrl`, ""), c = l(n, `${d}.subheading`), h = l(n, `${d}.heading`), g = l(
    n,
    `${d}.description`,
    "Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations."
  ), $ = l(n, `${d}.linkLabel`), b = l(n, `${d}.linkUrl`), v = l(n, `${d}.mediaPosition`, "left"), x = r.scheme, z = v !== "right", S = gn(r.mediaHeight), _ = r.sectionWidth === "full" ? 24 : L.padX, H = r.sectionWidth === "full" ? "100%" : L.maxWidth;
  let w = mn(r.mediaWidth);
  if (!z) {
    const V = w.split(" ");
    V.length === 2 && (w = `${V[1]} ${V[0]}`);
  }
  const R = {
    background: x.background,
    color: x.color,
    fontFamily: s,
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    paddingLeft: _,
    paddingRight: _,
    boxSizing: "border-box"
  }, T = {
    maxWidth: H,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: w,
    minHeight: S,
    width: "100%",
    overflow: "hidden"
  }, W = {
    background: x.mediaPanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    minHeight: S
  }, P = {
    background: x.contentPanel,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    textAlign: "left",
    padding: "40px 48px",
    minHeight: S
  }, C = {
    margin: 0,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "0.02em",
    color: x.muted,
    textTransform: "none"
  }, M = {
    margin: "12px 0 0",
    fontFamily: u,
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.15,
    color: x.color
  }, f = {
    margin: "16px 0 0",
    fontSize: 15,
    lineHeight: 1.55,
    color: x.muted,
    maxWidth: 420
  }, O = {
    marginTop: 24,
    fontSize: 15,
    fontWeight: 500,
    color: x.color,
    textDecoration: "underline",
    textUnderlineOffset: 3
  }, N = /* @__PURE__ */ o("div", { style: W, children: /* @__PURE__ */ o(k, { fieldPath: `${d}.imageUrl`, label: "Image", as: "span", children: p ? /* @__PURE__ */ o(
    "img",
    {
      src: p,
      alt: "",
      style: { maxWidth: "100%", maxHeight: 280, objectFit: "contain", display: "block" }
    }
  ) : /* @__PURE__ */ o(hn, {}) }) }), D = /* @__PURE__ */ m("div", { style: P, children: [
    /* @__PURE__ */ o(k, { fieldPath: `${d}.subheading`, label: "Subheading", as: "p", style: C, children: c }),
    /* @__PURE__ */ o(k, { fieldPath: `${d}.heading`, label: "Heading", as: "h2", style: M, children: h }),
    /* @__PURE__ */ o(k, { fieldPath: `${d}.description`, label: "Description", as: "p", style: f, children: g }),
    /* @__PURE__ */ o(k, { fieldPath: `${d}.linkLabel`, label: "Link label", as: "span", children: b ? /* @__PURE__ */ o(I, { to: b, style: O, children: $ }) : /* @__PURE__ */ o("span", { style: O, children: $ }) })
  ] });
  return /* @__PURE__ */ m(G, { sectionId: e, editorNodeId: a, label: "Editorial", style: R, children: [
    r.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: fn(e, r.customCss) } }) : null,
    /* @__PURE__ */ m("div", { style: T, children: [
      N,
      D
    ] })
  ] });
}
function bn({ sectionId: e }) {
  return /* @__PURE__ */ o(ei, { sectionId: e, placement: "layout" });
}
const qt = {
  "scheme-1": {
    background: "#ffffff",
    color: "#111827",
    textPanel: "#f6f6f7",
    mediaPanel: "#ececec"
  },
  "scheme-2": {
    background: "#f8fafc",
    color: "#0f172a",
    textPanel: "#f1f5f9",
    mediaPanel: "#e2e8f0"
  },
  "scheme-3": {
    background: "#fff7ed",
    color: "#431407",
    textPanel: "#fff7ed",
    mediaPanel: "#ffedd5"
  },
  "scheme-4": {
    background: "#f5f3ff",
    color: "#1e1b4b",
    textPanel: "#fafafa",
    mediaPanel: "#ececec"
  }
}, It = {
  small: ["2fr", "3fr"],
  medium: ["12fr", "13fr"],
  large: ["2fr", "3fr"]
}, Vt = {
  small: 200,
  medium: 280,
  large: 360
};
function yn(e, t) {
  const i = l(e, `${t}.mediaWidth`, "");
  if (i === "small" || i === "large") return i;
  if (i === "medium") return "medium";
  const n = l(e, `${t}.textWidth`, "medium");
  return n === "small" || n === "large" ? n : "medium";
}
function xn(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-4"), n = l(e, `${t}.mediaHeight`, "medium"), s = n === "small" || n === "large" ? n : "medium";
  return {
    scheme: qt[i] ?? qt["scheme-4"],
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    mediaWidth: yn(e, t),
    mediaHeight: s,
    paddingTop: y(e, `${t}.paddingTop`, 0),
    paddingBottom: y(e, `${t}.paddingBottom`, 0),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function $n(e) {
  const [t, i] = It[e] ?? It.medium;
  return `${t} ${i}`;
}
function kn(e) {
  return Vt[e] ?? Vt.medium;
}
function vn(e, t) {
  const i = t.trim();
  return i ? i.replace(/:root/g, `[data-ziplofy-section="${e}"]`) : "";
}
function Sn(e) {
  const t = e.trim();
  return t ? t.includes(`
`) ? t.split(`
`).map((i) => i.trim()).filter(Boolean) : t.split(/\s+/).filter(Boolean) : ["UP", "THE", "ANTE"];
}
function wn(e, t) {
  const i = l(e, `${t}.mediaPosition`, "");
  return i === "left" || i === "right" ? i : l(e, `${t}.textPosition`, "left") === "left" ? "right" : "left";
}
function ti({
  sectionId: e = "editorial_jumbo",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(() => xn(n, d), [n, d]), p = l(n, `${d}.headline`), c = l(n, `${d}.imageUrl`, ""), h = wn(n, d), g = Sn(p), $ = r.scheme, b = h !== "right", v = kn(r.mediaHeight), x = r.sectionWidth === "full" ? 24 : L.padX, z = r.sectionWidth === "full" ? "100%" : L.maxWidth;
  let S = $n(r.mediaWidth);
  if (!b) {
    const C = S.split(" ");
    C.length === 2 && (S = `${C[1]} ${C[0]}`);
  }
  const _ = {
    background: $.background,
    color: $.color,
    fontFamily: s,
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    paddingLeft: x,
    paddingRight: x,
    boxSizing: "border-box"
  }, H = {
    maxWidth: z,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: S,
    minHeight: v,
    width: "100%",
    overflow: "hidden"
  }, w = {
    background: $.textPanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "32px 40px 32px 32px",
    minHeight: v,
    boxSizing: "border-box"
  }, R = {
    background: $.mediaPanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    minHeight: v,
    boxSizing: "border-box"
  }, T = {
    margin: 0,
    fontFamily: u,
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    fontWeight: 700,
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
    textAlign: "right",
    textTransform: "uppercase",
    color: $.color,
    maxWidth: "100%"
  }, W = /* @__PURE__ */ o("div", { style: w, children: /* @__PURE__ */ o(k, { fieldPath: `${d}.headline`, label: "Headline", as: "div", style: T, children: g.map((C, M) => /* @__PURE__ */ o("span", { style: { display: "block" }, children: C }, `${C}-${M}`)) }) }), P = /* @__PURE__ */ o("div", { style: R, children: /* @__PURE__ */ o(k, { fieldPath: `${d}.imageUrl`, label: "Image", as: "span", children: c ? /* @__PURE__ */ o(
    "img",
    {
      src: c,
      alt: "",
      style: { maxWidth: "100%", maxHeight: v - 64, objectFit: "contain", display: "block" }
    }
  ) : /* @__PURE__ */ o(St, {}) }) });
  return /* @__PURE__ */ m(G, { sectionId: e, editorNodeId: a, label: "Editorial: Jumbo text", style: _, children: [
    r.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: vn(e, r.customCss) } }) : null,
    /* @__PURE__ */ o("div", { style: H, children: b ? /* @__PURE__ */ m(ne, { children: [
      P,
      W
    ] }) : /* @__PURE__ */ m(ne, { children: [
      W,
      P
    ] }) })
  ] });
}
function _n({ sectionId: e }) {
  return /* @__PURE__ */ o(ti, { sectionId: e, placement: "layout" });
}
function Cn() {
  return /* @__PURE__ */ m("svg", { viewBox: "0 0 200 240", width: "100%", height: "100%", "aria-hidden": !0, style: { display: "block" }, children: [
    /* @__PURE__ */ o("rect", { x: "0", y: "0", width: "200", height: "240", fill: "#f4f4f4" }),
    /* @__PURE__ */ o(
      "path",
      {
        d: "M48 78 L100 58 L152 78 L152 210 L48 210 Z",
        fill: "#e76f51",
        stroke: "#c45a3f",
        strokeWidth: "2"
      }
    ),
    /* @__PURE__ */ o("path", { d: "M48 78 Q100 98 152 78", fill: "none", stroke: "#d4a017", strokeWidth: "5" }),
    /* @__PURE__ */ o("ellipse", { cx: "100", cy: "72", rx: "28", ry: "10", fill: "#d4a017" }),
    /* @__PURE__ */ o("path", { d: "M62 95 L138 95", stroke: "#c45a3f", strokeWidth: "1.5", opacity: "0.35" })
  ] });
}
function zn() {
  return /* @__PURE__ */ m("svg", { viewBox: "0 0 200 240", width: "100%", height: "100%", "aria-hidden": !0, style: { display: "block" }, children: [
    /* @__PURE__ */ o("rect", { x: "0", y: "0", width: "200", height: "240", fill: "#f4f4f4" }),
    /* @__PURE__ */ o(
      "path",
      {
        d: "M48 78 L100 58 L152 78 L152 210 L48 210 Z",
        fill: "#2a6b6b",
        stroke: "#1f5252",
        strokeWidth: "2"
      }
    ),
    /* @__PURE__ */ o("rect", { x: "118", y: "118", width: "28", height: "22", rx: "3", fill: "#1f5252", opacity: "0.85" }),
    /* @__PURE__ */ o("path", { d: "M48 155 L152 155 L152 210 L48 210 Z", fill: "#1f5252", opacity: "0.55" }),
    /* @__PURE__ */ o("path", { d: "M48 170 L152 170", stroke: "#163d3d", strokeWidth: "2", opacity: "0.5" }),
    /* @__PURE__ */ o("path", { d: "M48 188 L152 188", stroke: "#163d3d", strokeWidth: "2", opacity: "0.5" }),
    /* @__PURE__ */ o("ellipse", { cx: "100", cy: "72", rx: "28", ry: "10", fill: "#1f5252" })
  ] });
}
function Wn({ beforeUrl: e, afterUrl: t, minHeight: i = 320 }) {
  const [n, s] = Z(50), u = ot(null), d = qe((x) => {
    const z = u.current;
    if (!z) return;
    const S = z.getBoundingClientRect(), _ = Math.min(Math.max(x - S.left, 0), S.width);
    s(_ / S.width * 100);
  }, []), a = (x) => {
    x.currentTarget.setPointerCapture(x.pointerId), d(x.clientX);
  }, r = (x) => {
    x.currentTarget.hasPointerCapture(x.pointerId) && d(x.clientX);
  }, p = (x) => {
    x.currentTarget.releasePointerCapture(x.pointerId);
  }, c = {
    position: "relative",
    width: "100%",
    maxWidth: 520,
    margin: "0 auto",
    minHeight: i,
    borderRadius: 4,
    overflow: "hidden",
    background: "#f4f4f4",
    touchAction: "none",
    userSelect: "none"
  }, h = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 32px",
    boxSizing: "border-box"
  }, g = {
    width: "100%",
    maxWidth: 280,
    height: "100%",
    maxHeight: i - 48
  }, $ = {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: `${n}%`,
    transform: "translateX(-50%)",
    width: 3,
    background: "#ffffff",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
    zIndex: 4,
    cursor: "ew-resize"
  }, b = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 600,
    letterSpacing: -2
  }, v = {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: 14,
    height: 8,
    background: "#ffffff",
    borderRadius: "0 0 2px 2px"
  };
  return /* @__PURE__ */ m(
    "div",
    {
      ref: u,
      style: c,
      onPointerDown: a,
      onPointerMove: r,
      onPointerUp: p,
      onPointerCancel: p,
      role: "slider",
      "aria-valuenow": Math.round(n),
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-label": "Compare images",
      children: [
        /* @__PURE__ */ o("div", { style: h, children: /* @__PURE__ */ o("div", { style: g, children: t ? /* @__PURE__ */ o("img", { src: t, alt: "", style: { width: "100%", height: "100%", objectFit: "contain" } }) : /* @__PURE__ */ o(zn, {}) }) }),
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              ...h,
              clipPath: `inset(0 ${100 - n}% 0 0)`,
              zIndex: 2
            },
            children: /* @__PURE__ */ o("div", { style: g, children: e ? /* @__PURE__ */ o("img", { src: e, alt: "", style: { width: "100%", height: "100%", objectFit: "contain" } }) : /* @__PURE__ */ o(Cn, {}) })
          }
        ),
        /* @__PURE__ */ m("div", { style: $, children: [
          /* @__PURE__ */ o("div", { style: v }),
          /* @__PURE__ */ o("div", { style: b, children: /* @__PURE__ */ o("span", { "aria-hidden": !0, children: "‹›" }) })
        ] })
      ]
    }
  );
}
const Kt = {
  "scheme-1": {
    background: "#ffffff",
    color: "#111827",
    muted: "#4b5563",
    contentPanel: "#ffffff",
    comparePanel: "#f4f4f4"
  },
  "scheme-2": {
    background: "#f8fafc",
    color: "#0f172a",
    muted: "#64748b",
    contentPanel: "#f8fafc",
    comparePanel: "#e2e8f0"
  },
  "scheme-3": {
    background: "#eef6fb",
    color: "#0f172a",
    muted: "#475569",
    contentPanel: "#eef6fb",
    comparePanel: "#f4f4f4"
  },
  "scheme-4": {
    background: "#f5f3ff",
    color: "#1e1b4b",
    muted: "#5b21b6",
    contentPanel: "#f5f3ff",
    comparePanel: "#ececec"
  }
}, Yt = {
  auto: 280,
  small: 260,
  medium: 320,
  large: 400
};
function Pn(e, t) {
  const i = l(e, `${t}.height`, "");
  if (i === "auto" || i === "small" || i === "medium" || i === "large") return i;
  const n = l(e, `${t}.mediaHeight`, "small");
  return n === "auto" || n === "medium" || n === "large" ? n : "small";
}
function Tn(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.direction`, ""), s = n === "vertical" ? "vertical" : "horizontal";
  let u = !1;
  n || (u = l(e, `${t}.mediaPosition`, "right") === "left");
  const d = l(e, `${t}.verticalOnMobile`, "false") === "true", a = l(e, `${t}.layoutAlignment`, "space-between"), r = l(e, `${t}.position`, "center"), p = y(e, `${t}.layoutGap`, 46);
  return {
    scheme: Kt[i] ?? Kt["scheme-1"],
    direction: s,
    verticalOnMobile: d,
    layoutAlignment: a,
    position: r,
    layoutGap: p,
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: Pn(e, t),
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none"),
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: l(e, `${t}.backgroundOverlay`, "false") === "true",
    paddingTop: y(e, `${t}.paddingTop`, 40),
    paddingBottom: y(e, `${t}.paddingBottom`, 40),
    customCss: l(e, `${t}.customCss`, ""),
    compareFirst: u
  };
}
function Hn(e) {
  return Yt[e] ?? Yt.small;
}
function Rn(e) {
  return e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function Ln(e) {
  return e === "space-between" ? "space-between" : e === "right" ? "flex-end" : e === "center" ? "center" : "flex-start";
}
function Mn(e, t) {
  const i = t.trim();
  return i ? i.replace(/:root/g, `[data-ziplofy-section="${e}"]`) : "";
}
const ct = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 22px",
  borderRadius: 999,
  border: "1px solid currentColor",
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  whiteSpace: "nowrap"
};
function oi({
  sectionId: e = "image_compare",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(() => Tn(n, d), [n, d]), p = l(n, `${d}.heading`), c = l(n, `${d}.subheading`), h = l(n, `${d}.button1Label`), g = l(n, `${d}.button1Url`), $ = l(n, `${d}.button2Label`), b = l(n, `${d}.button2Url`), v = l(n, `${d}.imageBeforeUrl`, ""), x = l(n, `${d}.imageAfterUrl`, ""), z = r.scheme, S = Hn(r.height), _ = r.sectionWidth === "full" ? 24 : L.padX, H = r.sectionWidth === "full" ? "100%" : L.maxWidth, w = r.direction === "horizontal", R = {
    position: "relative",
    background: z.background,
    color: z.color,
    fontFamily: s,
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    paddingLeft: _,
    paddingRight: _,
    boxSizing: "border-box",
    border: r.borderStyle === "solid" ? `1px solid ${z.muted}33` : void 0,
    borderRadius: r.cornerRadius > 0 ? r.cornerRadius : void 0,
    overflow: "hidden"
  }, T = {
    maxWidth: H,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: w ? "1fr 1fr" : "1fr",
    gridTemplateRows: w ? void 0 : "auto auto",
    gap: r.layoutGap,
    minHeight: S,
    width: "100%",
    alignItems: Rn(r.position),
    justifyContent: Ln(r.layoutAlignment)
  }, W = r.verticalOnMobile && w ? `ziplofy-image-compare-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}` : "", P = {
    background: z.contentPanel,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    textAlign: "left",
    padding: "48px 56px",
    minHeight: w ? S : void 0,
    boxSizing: "border-box"
  }, C = {
    background: z.comparePanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    minHeight: w ? S : 280,
    boxSizing: "border-box"
  }, M = {
    margin: 0,
    fontFamily: u,
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    color: z.color
  }, f = {
    margin: "14px 0 0",
    fontSize: 16,
    lineHeight: 1.5,
    color: z.muted,
    maxWidth: 400
  }, O = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 28
  }, N = /* @__PURE__ */ m("div", { style: P, children: [
    /* @__PURE__ */ o(k, { fieldPath: `${d}.heading`, label: "Heading", as: "h2", style: M, children: p }),
    /* @__PURE__ */ o(k, { fieldPath: `${d}.subheading`, label: "Subheading", as: "p", style: f, children: c }),
    /* @__PURE__ */ m("div", { style: O, children: [
      /* @__PURE__ */ o(k, { fieldPath: `${d}.button1Label`, label: "Button", as: "span", children: g ? /* @__PURE__ */ o(I, { to: g, style: ct, children: h }) : /* @__PURE__ */ o("span", { style: ct, children: h }) }),
      /* @__PURE__ */ o(k, { fieldPath: `${d}.button2Label`, label: "Button", as: "span", children: b ? /* @__PURE__ */ o(I, { to: b, style: ct, children: $ }) : /* @__PURE__ */ o("span", { style: ct, children: $ }) })
    ] })
  ] }), D = /* @__PURE__ */ o("div", { style: C, children: /* @__PURE__ */ o("div", { style: { width: "100%" }, children: /* @__PURE__ */ o(
    Wn,
    {
      beforeUrl: v || void 0,
      afterUrl: x || void 0,
      minHeight: S - 64
    }
  ) }) }), V = r.backgroundMedia === "image" && r.backgroundImageUrl ? r.backgroundImageUrl : null;
  return /* @__PURE__ */ m(G, { sectionId: e, editorNodeId: a, label: "Image compare", style: R, children: [
    V ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${V})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
          pointerEvents: "none"
        }
      }
    ) : null,
    r.backgroundOverlay ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.12)",
          pointerEvents: "none"
        }
      }
    ) : null,
    r.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Mn(e, r.customCss) } }) : null,
    W ? /* @__PURE__ */ o("style", { children: `
          @media (max-width: 749px) {
            .${W} {
              grid-template-columns: 1fr !important;
              grid-template-rows: auto auto !important;
            }
          }
        ` }) : null,
    /* @__PURE__ */ o("div", { className: W || void 0, style: { ...T, position: "relative", zIndex: 1 }, children: r.compareFirst ? /* @__PURE__ */ m(ne, { children: [
      D,
      N
    ] }) : /* @__PURE__ */ m(ne, { children: [
      N,
      D
    ] }) })
  ] });
}
function Fn({ sectionId: e }) {
  return /* @__PURE__ */ o(oi, { sectionId: e, placement: "layout" });
}
const Zt = {
  "scheme-1": {
    background: "#ffffff",
    color: "#111827",
    muted: "#4b5563",
    imagePanel: "#f0f0f0",
    contentPanel: "#ffffff"
  },
  "scheme-2": {
    background: "#f8fafc",
    color: "#0f172a",
    muted: "#64748b",
    imagePanel: "#e2e8f0",
    contentPanel: "#f8fafc"
  },
  "scheme-3": {
    background: "#eef6fb",
    color: "#0f172a",
    muted: "#475569",
    imagePanel: "#f0f0f0",
    contentPanel: "#ffffff"
  },
  "scheme-4": {
    background: "#f5f3ff",
    color: "#1e1b4b",
    muted: "#5b21b6",
    imagePanel: "#ede9fe",
    contentPanel: "#f5f3ff"
  }
}, En = {
  auto: 0,
  small: 260,
  medium: 320,
  large: 400
};
function An(e, t) {
  const i = l(e, `${t}.height`, "");
  if (i === "auto" || i === "small" || i === "medium" || i === "large") return i;
  const n = l(e, `${t}.mediaHeight`, "medium");
  return n === "auto" || n === "small" || n === "large" ? n : "medium";
}
function Un(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.direction`, ""), s = n === "vertical" ? "vertical" : "horizontal";
  let u = !0;
  n || (u = l(e, `${t}.mediaPosition`, "left") !== "right");
  const d = l(e, `${t}.verticalOnMobile`, "false") === "true", a = l(e, `${t}.layoutAlignment`, "left"), r = l(e, `${t}.position`, "center"), p = y(e, `${t}.layoutGap`, 32);
  return {
    scheme: Zt[i] ?? Zt["scheme-1"],
    direction: s,
    verticalOnMobile: d,
    layoutAlignment: a,
    position: r,
    layoutGap: p,
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: An(e, t),
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none"),
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: l(e, `${t}.backgroundOverlay`, "false") === "true",
    paddingTop: y(e, `${t}.paddingTop`, 40),
    paddingBottom: y(e, `${t}.paddingBottom`, 40),
    customCss: l(e, `${t}.customCss`, ""),
    imageFirst: u
  };
}
function Nn(e) {
  const t = En[e];
  return t && t > 0 ? t : void 0;
}
function On(e) {
  return e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function Gn(e) {
  return e === "right" ? "flex-end" : e === "center" ? "center" : "flex-start";
}
function jn(e, t) {
  const i = t.trim();
  return i ? i.replace(/:root/g, `[data-ziplofy-section="${e}"]`) : "";
}
const Qt = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 28px",
  borderRadius: 999,
  background: "#111827",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 500,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  marginTop: 28
};
function ii({
  sectionId: e = "image_with_text",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(() => Un(n, d), [n, d]), p = l(n, `${d}.imageUrl`, ""), c = l(n, `${d}.heading`), h = l(
    n,
    `${d}.description`,
    "Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations."
  ), g = l(
    n,
    `${d}.buttonLabel`,
    l(n, `${d}.linkLabel`)
  ), $ = l(
    n,
    `${d}.buttonUrl`,
    l(n, `${d}.linkUrl`)
  ), b = r.scheme, v = Nn(r.height), x = r.sectionWidth === "full" ? 24 : L.padX, z = r.sectionWidth === "full" ? "100%" : L.maxWidth, S = r.direction === "horizontal", _ = {
    position: "relative",
    background: b.background,
    color: b.color,
    fontFamily: s,
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    paddingLeft: x,
    paddingRight: x,
    boxSizing: "border-box",
    border: r.borderStyle === "solid" ? `1px solid ${b.muted}33` : void 0,
    borderRadius: r.cornerRadius > 0 ? r.cornerRadius : void 0,
    overflow: "hidden"
  }, H = {
    maxWidth: z,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: S ? "1fr 1fr" : "1fr",
    gridTemplateRows: S ? void 0 : "auto auto",
    gap: r.layoutGap,
    minHeight: v,
    width: "100%",
    alignItems: On(r.position),
    justifyContent: Gn(r.layoutAlignment)
  }, w = r.verticalOnMobile && S ? `ziplofy-image-with-text-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}` : "", R = {
    background: b.imagePanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    minHeight: S ? v : 280,
    boxSizing: "border-box"
  }, T = {
    background: b.contentPanel,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    textAlign: "left",
    padding: "48px 56px",
    minHeight: S ? v : void 0,
    boxSizing: "border-box"
  }, W = {
    margin: 0,
    fontFamily: u,
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    color: b.color
  }, P = {
    margin: "16px 0 0",
    fontSize: 15,
    lineHeight: 1.55,
    color: b.muted,
    maxWidth: 420
  }, C = /* @__PURE__ */ o("div", { style: R, children: /* @__PURE__ */ o(k, { fieldPath: `${d}.imageUrl`, label: "Image", as: "span", children: p ? /* @__PURE__ */ o(
    "img",
    {
      src: p,
      alt: "",
      style: { maxWidth: "100%", maxHeight: 300, objectFit: "contain", display: "block" }
    }
  ) : /* @__PURE__ */ o(St, {}) }) }), M = /* @__PURE__ */ m("div", { style: T, children: [
    /* @__PURE__ */ o(k, { fieldPath: `${d}.heading`, label: "Heading", as: "h2", style: W, children: c }),
    /* @__PURE__ */ o(k, { fieldPath: `${d}.description`, label: "Description", as: "p", style: P, children: h }),
    /* @__PURE__ */ o(k, { fieldPath: `${d}.buttonLabel`, label: "Button", as: "span", children: $ ? /* @__PURE__ */ o(I, { to: $, style: Qt, children: g }) : /* @__PURE__ */ o("span", { style: Qt, children: g }) })
  ] }), f = r.backgroundMedia === "image" && r.backgroundImageUrl ? r.backgroundImageUrl : null;
  return /* @__PURE__ */ m(G, { sectionId: e, editorNodeId: a, label: "Image with text", style: _, children: [
    f ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${f})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
          pointerEvents: "none"
        }
      }
    ) : null,
    r.backgroundOverlay ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.12)",
          pointerEvents: "none"
        }
      }
    ) : null,
    r.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: jn(e, r.customCss) } }) : null,
    w ? /* @__PURE__ */ o("style", { children: `
          @media (max-width: 749px) {
            .${w} {
              grid-template-columns: 1fr !important;
              grid-template-rows: auto auto !important;
            }
          }
        ` }) : null,
    /* @__PURE__ */ o("div", { className: w || void 0, style: { ...H, position: "relative", zIndex: 1 }, children: r.imageFirst ? /* @__PURE__ */ m(ne, { children: [
      C,
      M
    ] }) : /* @__PURE__ */ m(ne, { children: [
      M,
      C
    ] }) })
  ] });
}
function Dn({ sectionId: e }) {
  return /* @__PURE__ */ o(ii, { sectionId: e, placement: "layout" });
}
const Jt = {
  "scheme-1": { background: "#f6f6f7", color: "#111827", border: "#d1d5db" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", border: "#cbd5e1" },
  "scheme-3": { background: "#fff7ed", color: "#431407", border: "#fdba74" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", border: "#c4b5fd" }
};
function Bn(e, t, i) {
  const n = l(e, `${t}.colorScheme`, "scheme-1");
  return {
    scheme: Jt[n] ?? Jt["scheme-1"],
    widthMode: jo(e, t),
    thickness: Math.max(0, y(e, `${t}.thickness`, 1)),
    lengthPercent: Math.min(100, Math.max(10, y(e, `${t}.length`, 100))),
    paddingTop: y(e, `${t}.paddingTop`, 16),
    paddingBottom: y(e, `${t}.paddingBottom`, 16),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function Xn(e, t) {
  return Do(e, t);
}
function wt({ sectionId: e, placement: t = "layout", templateId: i = "index" }) {
  const n = j(), { fontBody: s } = X(), u = t === "template" ? `templates.${i}.sections.${e}.settings` : `sections.${e}.settings`, d = t === "template" ? `template:${i}:${e}` : `layout:${e}`, a = F(() => Bn(n, u), [n, u]), r = a.widthMode === "full" ? "100%" : L.maxWidth, p = a.widthMode === "full" ? 24 : L.padX, c = Math.max(a.thickness, 1), h = {
    background: a.scheme.background,
    color: a.scheme.color,
    fontFamily: s,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: p,
    paddingRight: p,
    boxSizing: "border-box"
  }, g = {
    maxWidth: r,
    margin: "0 auto",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: c
  };
  return /* @__PURE__ */ m(G, { sectionId: e, editorNodeId: d, label: "Divider", style: h, children: [
    a.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Xn(e, a.customCss) } }) : null,
    /* @__PURE__ */ o("div", { style: g, children: /* @__PURE__ */ o(
      "hr",
      {
        "aria-hidden": !0,
        style: {
          width: `${a.lengthPercent}%`,
          maxWidth: "100%",
          margin: 0,
          border: "none",
          borderTop: `${c}px solid ${a.scheme.border}`,
          flexShrink: 0
        }
      }
    ) })
  ] });
}
const eo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#4b5563", border: "#e5e7eb" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#4b5563", border: "#e5e7eb" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569", border: "#cbd5e1" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6", border: "#ddd6fe" }
}, qn = {
  auto: 0,
  small: 260,
  medium: 320,
  large: 400
};
function In(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.direction`, "vertical"), s = l(e, `${t}.layoutAlignment`, "") || l(e, `${t}.headingAlignment`, "left"), u = l(e, `${t}.height`, "auto");
  return {
    scheme: eo[i] ?? eo["scheme-1"],
    direction: n === "horizontal" ? "horizontal" : "vertical",
    layoutAlignment: s === "center" || s === "right" ? s : "left",
    position: l(e, `${t}.position`, "center"),
    layoutGap: y(e, `${t}.layoutGap`, 32),
    openFirstItem: U(e, `${t}.openFirstItem`, !1),
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: u,
    minHeightPx: qn[u] ?? 0,
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none"),
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: U(e, `${t}.backgroundOverlay`, !1),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function Vn(e, t, i, n) {
  const u = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, d = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), a = K(e, u);
  return !a || typeof a != "object" ? [] : (d.length ? d : Object.keys(a)).map((p) => {
    const c = a[p];
    if (!c) return null;
    const h = c.settings ?? {}, g = String(h.question ?? "").trim();
    return g ? {
      id: p,
      question: g,
      answer: String(h.answer ?? "")
    } : null;
  }).filter((p) => p != null);
}
function Kn(e, t) {
  const i = `.ziplofy-faq-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function Yn({ open: e }) {
  return /* @__PURE__ */ o(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": !0,
      style: {
        flexShrink: 0,
        transform: e ? "rotate(180deg)" : "none",
        transition: "transform 0.2s ease"
      },
      children: /* @__PURE__ */ o(
        "path",
        {
          d: "M4 6l4 4 4-4",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function ni({
  sectionId: e = "faq_section",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), s = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, u = i === "template" ? `template:${t}:${e}` : `layout:${e}`, d = F(() => In(n, s), [n, s]), a = F(
    () => Vn(n, t, e, i),
    [n, t, e, i]
  ), r = l(n, `${s}.heading`), [p, c] = Z(() => d.openFirstItem && a[0] ? /* @__PURE__ */ new Set([a[0].id]) : /* @__PURE__ */ new Set()), h = d.scheme, g = d.sectionWidth === "full" ? 24 : L.padX, $ = d.sectionWidth === "full" ? "100%" : L.maxWidth, b = `ziplofy-faq-${e.replace(/[^a-z0-9_-]/gi, "-")}`, v = d.layoutAlignment, x = {
    position: "relative",
    background: (d.backgroundMedia === "image" && d.backgroundImageUrl, h.background),
    color: h.color,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: g,
    paddingRight: g,
    boxSizing: "border-box",
    minHeight: d.minHeightPx > 0 ? d.minHeightPx : void 0,
    border: d.borderStyle === "solid" ? `1px solid ${h.border}` : void 0,
    borderRadius: d.cornerRadius > 0 ? d.cornerRadius : void 0,
    overflow: d.cornerRadius > 0 ? "hidden" : void 0
  }, z = d.backgroundMedia === "image" && d.backgroundImageUrl ? d.backgroundImageUrl : null, S = {
    maxWidth: $,
    margin: "0 auto",
    width: "100%",
    display: "flex",
    flexDirection: d.direction === "horizontal" ? "row" : "column",
    alignItems: d.position === "top" ? "flex-start" : d.position === "bottom" ? "flex-end" : "center",
    gap: d.layoutGap
  }, _ = {
    margin: 0,
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    textAlign: v,
    marginBottom: d.direction === "horizontal" ? 0 : d.layoutGap,
    flex: d.direction === "horizontal" ? "0 0 38%" : void 0
  }, H = {
    flex: 1,
    width: "100%"
  }, w = (T) => {
    c((W) => {
      const P = new Set(W);
      return P.has(T) ? P.delete(T) : P.add(T), P;
    });
  }, R = Kn(e, d.customCss);
  return /* @__PURE__ */ m(G, { sectionId: e, label: "FAQ", editorNodeId: u, style: x, children: [
    R ? /* @__PURE__ */ o("style", { children: R }) : null,
    z ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${z})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    d.backgroundOverlay && z ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 1
        }
      }
    ) : null,
    /* @__PURE__ */ m("div", { className: b, style: { ...S, position: "relative", zIndex: 2 }, children: [
      /* @__PURE__ */ o(k, { fieldPath: `${s}.heading`, label: "Heading", as: "h2", style: _, children: r }),
      /* @__PURE__ */ o(
        "div",
        {
          role: "list",
          style: {
            ...H,
            borderTop: `1px solid ${h.border}`
          },
          children: a.map((T) => {
            const W = p.has(T.id), P = i === "template" ? `template:${t}:${e}:block:${T.id}` : `layout:${e}:block:${T.id}`, C = `${s.replace(/\.settings$/, "")}.blocks.${T.id}.settings.question`, M = `${s.replace(/\.settings$/, "")}.blocks.${T.id}.settings.answer`;
            return /* @__PURE__ */ m(
              "div",
              {
                role: "listitem",
                "data-ziplofy-node": P,
                "data-ziplofy-label": T.question,
                "data-ziplofy-kind": "block",
                style: { borderBottom: `1px solid ${h.border}` },
                children: [
                  /* @__PURE__ */ m(
                    "button",
                    {
                      type: "button",
                      onClick: () => w(T.id),
                      "aria-expanded": W,
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        width: "100%",
                        padding: "20px 0",
                        border: "none",
                        background: "transparent",
                        color: "inherit",
                        cursor: "pointer",
                        textAlign: "left",
                        font: "inherit"
                      },
                      children: [
                        /* @__PURE__ */ o(
                          k,
                          {
                            fieldPath: C,
                            label: "Question",
                            as: "span",
                            style: {
                              fontSize: "1rem",
                              fontWeight: 400,
                              lineHeight: 1.4,
                              flex: 1
                            },
                            children: T.question
                          }
                        ),
                        /* @__PURE__ */ o(Yn, { open: W })
                      ]
                    }
                  ),
                  W ? /* @__PURE__ */ o(
                    "div",
                    {
                      style: {
                        paddingBottom: 20,
                        paddingRight: 32,
                        color: h.muted,
                        fontSize: "0.9375rem",
                        lineHeight: 1.6
                      },
                      children: /* @__PURE__ */ o(k, { fieldPath: M, label: "Answer", as: "div", children: T.answer || "Add an answer in the sidebar." })
                    }
                  ) : null
                ]
              },
              T.id
            );
          })
        }
      )
    ] })
  ] });
}
function Zn({ icon: e, style: t, className: i }) {
  const n = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": !0,
    style: t,
    className: i
  };
  switch (e) {
    case "heart":
      return /* @__PURE__ */ o("svg", { ...n, children: /* @__PURE__ */ o(
        "path",
        {
          d: "M12 20.5s-7-4.5-7-9.5a4.5 4.5 0 0 1 7.5-3.3A4.5 4.5 0 0 1 19 11c0 5-7 9.5-7 9.5Z",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinejoin: "round"
        }
      ) });
    case "person":
      return /* @__PURE__ */ m("svg", { ...n, children: [
        /* @__PURE__ */ o("circle", { cx: "12", cy: "8", r: "3.5", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ o(
          "path",
          {
            d: "M6 20c0-3.5 2.7-6 6-6s6 2.5 6 6",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round"
          }
        )
      ] });
    case "leaf":
      return /* @__PURE__ */ m("svg", { ...n, children: [
        /* @__PURE__ */ o(
          "path",
          {
            d: "M12 3c-4 6-4 10 0 18 4-8 4-12 0-18Z",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ o("path", { d: "M12 3v18", stroke: "currentColor", strokeWidth: "1.5" })
      ] });
    case "truck":
      return /* @__PURE__ */ m("svg", { ...n, children: [
        /* @__PURE__ */ o(
          "path",
          {
            d: "M3 8h11v8H3V8Zm11 2h4l2 3v3h-6v-6Z",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ o("circle", { cx: "7", cy: "17", r: "1.5", fill: "currentColor" }),
        /* @__PURE__ */ o("circle", { cx: "17", cy: "17", r: "1.5", fill: "currentColor" })
      ] });
    case "shield":
      return /* @__PURE__ */ o("svg", { ...n, children: /* @__PURE__ */ o(
        "path",
        {
          d: "M12 3 5 6v6c0 4.5 3.5 7.5 7 9 3.5-1.5 7-4.5 7-9V6l-7-3Z",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinejoin: "round"
        }
      ) });
    case "star":
      return /* @__PURE__ */ o("svg", { ...n, children: /* @__PURE__ */ o(
        "path",
        {
          d: "M12 4l2.2 5 5.5.5-4.2 3.5 1.3 5.5-4.8-3-4.8 3 1.3-5.5-4.2-3.5 5.5-.5L12 4Z",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinejoin: "round"
        }
      ) });
    case "gift":
      return /* @__PURE__ */ m("svg", { ...n, children: [
        /* @__PURE__ */ o("rect", { x: "4", y: "10", width: "16", height: "10", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ o("path", { d: "M12 10V20M4 10h16M8 10c0-2 1.5-4 4-4s4 2 4 4", stroke: "currentColor", strokeWidth: "1.5" })
      ] });
    default:
      return /* @__PURE__ */ m("svg", { ...n, children: [
        /* @__PURE__ */ o(
          "path",
          {
            d: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ o("circle", { cx: "12", cy: "12", r: "2.5", stroke: "currentColor", strokeWidth: "1.5" })
      ] });
  }
}
const to = {
  "scheme-1": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6" }
};
function Qn(e) {
  return e === "right" ? "end" : e === "center" ? "center" : "start";
}
function Jn(e) {
  return e === "top" ? "start" : e === "bottom" ? "end" : "center";
}
function el(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.direction`, "horizontal"), s = l(e, `${t}.layoutAlignment`, "left"), u = y(e, `${t}.columns`, 3);
  return {
    scheme: to[i] ?? to["scheme-1"],
    direction: n === "vertical" ? "vertical" : "horizontal",
    verticalOnMobile: U(e, `${t}.verticalOnMobile`, !1),
    layoutAlignment: s === "left" || s === "right" ? s : "center",
    position: l(e, `${t}.position`, "center"),
    columns: Math.min(4, Math.max(2, u)),
    layoutGap: y(e, `${t}.layoutGap`, 16),
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: l(e, `${t}.height`, "auto"),
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none"),
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: U(e, `${t}.backgroundOverlay`, !1),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function tl(e, t, i, n) {
  const u = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, d = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), a = K(e, u);
  return !a || typeof a != "object" ? [] : (d.length ? d : Object.keys(a)).map((p) => {
    const c = a[p];
    if (!c) return null;
    const h = c.settings ?? {}, g = String(h.heading ?? h.title ?? "").trim();
    return g ? {
      id: p,
      icon: String(h.icon ?? "eye"),
      heading: g,
      text: String(h.text ?? "")
    } : null;
  }).filter((p) => p != null);
}
function ol(e, t) {
  const i = `.ziplofy-icons-with-text-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function il(e) {
  return `@media (max-width: 749px) { ${`.ziplofy-icons-with-text-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}`} { grid-template-columns: 1fr !important; } }`;
}
function li({
  sectionId: e = "icons_with_text",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), s = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, u = i === "template" ? `template:${t}:${e}` : `layout:${e}`, d = F(
    () => el(n, s),
    [n, s]
  ), a = F(
    () => tl(n, t, e, i),
    [n, t, e, i]
  ), r = d.scheme, p = d.sectionWidth === "full" ? 24 : L.padX, c = d.sectionWidth === "full" ? "100%" : L.maxWidth, h = `ziplofy-icons-with-text-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = Math.max(a.length, d.columns), $ = d.direction === "horizontal", b = d.verticalOnMobile && $ ? `ziplofy-icons-with-text-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}` : "", v = {
    position: "relative",
    background: r.background,
    color: r.color,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: p,
    paddingRight: p,
    boxSizing: "border-box",
    border: d.borderStyle === "solid" ? `1px solid ${r.muted}33` : void 0,
    borderRadius: d.cornerRadius > 0 ? d.cornerRadius : void 0,
    overflow: d.cornerRadius > 0 ? "hidden" : void 0
  }, x = d.backgroundMedia === "image" && d.backgroundImageUrl ? d.backgroundImageUrl : null, z = {
    display: "grid",
    gridTemplateColumns: $ ? `repeat(${g}, minmax(0, 1fr))` : "1fr",
    gap: d.layoutGap,
    width: "100%",
    justifyItems: Qn(d.layoutAlignment),
    alignContent: Jn(d.position),
    minHeight: void 0
  }, S = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 12
  }, _ = {
    margin: 0,
    fontSize: "1.0625rem",
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.01em"
  }, H = {
    margin: 0,
    fontSize: "0.9375rem",
    lineHeight: 1.5,
    color: r.muted,
    maxWidth: 280
  }, w = ol(e, d.customCss), R = b ? il(e) : "", T = s.replace(/\.settings$/, "");
  return /* @__PURE__ */ m(G, { sectionId: e, label: "Icons with text", editorNodeId: u, style: v, children: [
    w ? /* @__PURE__ */ o("style", { children: w }) : null,
    R ? /* @__PURE__ */ o("style", { children: R }) : null,
    x ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${x})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    d.backgroundOverlay && x ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 1
        }
      }
    ) : null,
    /* @__PURE__ */ o(
      "div",
      {
        className: h,
        style: {
          maxWidth: c,
          margin: "0 auto",
          width: "100%",
          position: "relative",
          zIndex: 2
        },
        children: /* @__PURE__ */ o("div", { className: b || void 0, style: z, children: a.map((W) => {
          const P = i === "template" ? `template:${t}:${e}:block:${W.id}` : `layout:${e}:block:${W.id}`;
          return /* @__PURE__ */ m(
            "div",
            {
              "data-ziplofy-node": P,
              "data-ziplofy-label": W.heading,
              "data-ziplofy-kind": "block",
              style: S,
              children: [
                /* @__PURE__ */ o(Zn, { icon: W.icon, style: { color: "inherit" } }),
                /* @__PURE__ */ o(
                  k,
                  {
                    fieldPath: `${T}.blocks.${W.id}.settings.heading`,
                    label: "Heading",
                    as: "h3",
                    style: _,
                    children: W.heading
                  }
                ),
                /* @__PURE__ */ o(
                  k,
                  {
                    fieldPath: `${T}.blocks.${W.id}.settings.text`,
                    label: "Description",
                    as: "p",
                    style: H,
                    children: W.text || "Add a description in the sidebar."
                  }
                )
              ]
            },
            W.id
          );
        }) })
      }
    )
  ] });
}
const oo = {
  "scheme-1": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6" }
};
function nl(e) {
  return e === "right" ? "end" : e === "center" ? "center" : "start";
}
function ll(e) {
  return e === "top" ? "start" : e === "bottom" ? "end" : "center";
}
function rl(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.direction`, "horizontal"), s = l(e, `${t}.layoutAlignment`, "left"), u = y(e, `${t}.columns`, 3);
  return {
    scheme: oo[i] ?? oo["scheme-1"],
    direction: n === "vertical" ? "vertical" : "horizontal",
    verticalOnMobile: U(e, `${t}.verticalOnMobile`, !0),
    layoutAlignment: s === "left" || s === "right" ? s : "center",
    position: l(e, `${t}.position`, "top"),
    columns: Math.min(4, Math.max(2, u)),
    layoutGap: y(e, `${t}.layoutGap`, 16),
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: l(e, `${t}.height`, "auto"),
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none"),
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: U(e, `${t}.backgroundOverlay`, !1),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function al(e, t, i, n) {
  const u = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, d = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), a = K(e, u);
  return !a || typeof a != "object" ? [] : (d.length ? d : Object.keys(a)).map((p) => {
    const c = a[p];
    if (!c) return null;
    const h = c.settings ?? {}, g = String(h.heading ?? h.title ?? "").trim();
    return g ? {
      id: p,
      heading: g,
      text: String(h.text ?? "")
    } : null;
  }).filter((p) => p != null);
}
function dl(e, t) {
  const i = `.ziplofy-multicolumn-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function cl(e) {
  return `@media (max-width: 749px) { ${`.ziplofy-multicolumn-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}`} { grid-template-columns: 1fr !important; } }`;
}
function ri({
  sectionId: e = "multicolumn_section",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), s = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, u = i === "template" ? `template:${t}:${e}` : `layout:${e}`, d = F(() => rl(n, s), [n, s]), a = F(
    () => al(n, t, e, i),
    [n, t, e, i]
  ), r = d.scheme, p = d.sectionWidth === "full" ? 24 : L.padX, c = d.sectionWidth === "full" ? "100%" : L.maxWidth, h = `ziplofy-multicolumn-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = Math.max(a.length, d.columns), $ = d.direction === "horizontal", b = d.verticalOnMobile && $ ? `ziplofy-multicolumn-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}` : "", v = {
    position: "relative",
    background: r.background,
    color: r.color,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: p,
    paddingRight: p,
    boxSizing: "border-box",
    border: d.borderStyle === "solid" ? `1px solid ${r.muted}33` : void 0,
    borderRadius: d.cornerRadius > 0 ? d.cornerRadius : void 0,
    overflow: d.cornerRadius > 0 ? "hidden" : void 0
  }, x = d.backgroundMedia === "image" && d.backgroundImageUrl ? d.backgroundImageUrl : null, z = {
    display: "grid",
    gridTemplateColumns: $ ? `repeat(${g}, minmax(0, 1fr))` : "1fr",
    gap: d.layoutGap,
    width: "100%",
    justifyItems: nl(d.layoutAlignment),
    alignContent: ll(d.position)
  }, S = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 16
  }, _ = {
    margin: 0,
    fontSize: "1.0625rem",
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.01em"
  }, H = {
    margin: 0,
    fontSize: "0.9375rem",
    lineHeight: 1.55,
    color: r.muted,
    maxWidth: 320
  }, w = dl(e, d.customCss), R = b ? cl(e) : "", T = s.replace(/\.settings$/, "");
  return /* @__PURE__ */ m(G, { sectionId: e, label: "Multicolumn", editorNodeId: u, style: v, children: [
    w ? /* @__PURE__ */ o("style", { children: w }) : null,
    R ? /* @__PURE__ */ o("style", { children: R }) : null,
    x ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${x})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    d.backgroundOverlay && x ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 1
        }
      }
    ) : null,
    /* @__PURE__ */ o(
      "div",
      {
        className: h,
        style: {
          maxWidth: c,
          margin: "0 auto",
          width: "100%",
          position: "relative",
          zIndex: 2
        },
        children: /* @__PURE__ */ o("div", { className: b || void 0, style: z, children: a.map((W) => {
          const P = i === "template" ? `template:${t}:${e}:block:${W.id}` : `layout:${e}:block:${W.id}`;
          return /* @__PURE__ */ m(
            "div",
            {
              "data-ziplofy-node": P,
              "data-ziplofy-label": W.heading,
              "data-ziplofy-kind": "block",
              style: S,
              children: [
                /* @__PURE__ */ o(
                  k,
                  {
                    fieldPath: `${T}.blocks.${W.id}.settings.heading`,
                    label: "Heading",
                    as: "h3",
                    style: _,
                    children: W.heading
                  }
                ),
                /* @__PURE__ */ o(
                  k,
                  {
                    fieldPath: `${T}.blocks.${W.id}.settings.text`,
                    label: "Description",
                    as: "p",
                    style: H,
                    children: W.text || "Add a description in the sidebar."
                  }
                )
              ]
            },
            W.id
          );
        }) })
      }
    )
  ] });
}
const io = {
  "scheme-1": { background: "#f6f6f7", color: "#111827", muted: "#4b5563" },
  "scheme-2": { background: "#ffffff", color: "#111827", muted: "#4b5563" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6" }
}, sl = {
  auto: 0,
  small: 200,
  medium: 280,
  large: 360
};
function ul(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.layoutAlignment`, "center"), s = l(e, `${t}.height`, "auto"), u = l(e, `${t}.direction`, "vertical");
  return {
    scheme: io[i] ?? io["scheme-1"],
    direction: u === "horizontal" ? "horizontal" : "vertical",
    layoutAlignment: n === "left" || n === "right" ? n : "center",
    position: l(e, `${t}.position`, "center"),
    layoutGap: y(e, `${t}.layoutGap`, 16),
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: s,
    minHeightPx: sl[s] ?? 0,
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none"),
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: U(e, `${t}.backgroundOverlay`, !1),
    paddingTop: y(e, `${t}.paddingTop`, 64),
    paddingBottom: y(e, `${t}.paddingBottom`, 64),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function hl(e, t) {
  const i = `.ziplofy-pull-quote-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function _t(e) {
  return e === "left" ? "left" : e === "right" ? "right" : "center";
}
function ut(e) {
  return e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function ai({
  sectionId: e = "pull_quote_section",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontHeading: s } = X(), u = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, d = i === "template" ? `template:${t}:${e}` : `layout:${e}`, a = F(() => ul(n, u), [n, u]), r = l(n, `${u}.quote`), p = l(n, `${u}.linkLabel`), c = l(n, `${u}.linkUrl`), h = a.scheme, g = _t(a.layoutAlignment), $ = a.sectionWidth === "full" ? 24 : L.padX, b = a.sectionWidth === "full" ? "100%" : L.maxWidth, v = `ziplofy-pull-quote-${e.replace(/[^a-z0-9_-]/gi, "-")}`, x = {
    position: "relative",
    background: h.background,
    color: h.color,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: $,
    paddingRight: $,
    boxSizing: "border-box",
    minHeight: a.minHeightPx > 0 ? a.minHeightPx : void 0,
    border: a.borderStyle === "solid" ? `1px solid ${h.muted}33` : void 0,
    borderRadius: a.cornerRadius > 0 ? a.cornerRadius : void 0,
    overflow: a.cornerRadius > 0 ? "hidden" : void 0
  }, z = a.backgroundMedia === "image" && a.backgroundImageUrl ? a.backgroundImageUrl : null, S = a.direction === "horizontal", _ = {
    maxWidth: b,
    margin: "0 auto",
    width: "100%",
    minHeight: a.minHeightPx > 0 ? a.minHeightPx - a.paddingTop - a.paddingBottom : void 0,
    display: "flex",
    flexDirection: S ? "row" : "column",
    flexWrap: S ? "wrap" : void 0,
    alignItems: S ? ut(a.position) : g === "center" ? "center" : g === "right" ? "flex-end" : "flex-start",
    justifyContent: S ? g === "center" ? "center" : g === "right" ? "flex-end" : "flex-start" : ut(a.position),
    gap: a.layoutGap,
    textAlign: g,
    position: "relative",
    zIndex: 2
  }, H = {
    margin: 0,
    fontFamily: s,
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
    maxWidth: 720
  }, w = {
    fontSize: "1rem",
    fontWeight: 500,
    color: "inherit",
    textDecoration: "underline",
    textUnderlineOffset: 3
  }, R = hl(e, a.customCss);
  return /* @__PURE__ */ m(G, { sectionId: e, label: "Pull quote", editorNodeId: d, style: x, children: [
    R ? /* @__PURE__ */ o("style", { children: R }) : null,
    z ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${z})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    a.backgroundOverlay && z ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 1
        }
      }
    ) : null,
    /* @__PURE__ */ m("div", { className: v, style: _, children: [
      /* @__PURE__ */ o(k, { fieldPath: `${u}.quote`, label: "Quote", as: "p", style: H, children: r }),
      p ? /* @__PURE__ */ o(k, { fieldPath: `${u}.linkLabel`, label: "Link label", as: "span", children: /* @__PURE__ */ o(I, { to: c || "#", style: w, children: p }) }) : null
    ] })
  ] });
}
const no = {
  "scheme-1": { background: "#f6f6f7", color: "#111827", muted: "#4b5563" },
  "scheme-2": { background: "#ffffff", color: "#111827", muted: "#4b5563" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6" }
}, pl = {
  auto: 0,
  small: 200,
  medium: 280,
  large: 360
};
function ml(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.layoutAlignment`, "center"), s = l(e, `${t}.height`, "auto"), u = l(e, `${t}.direction`, "vertical");
  return {
    scheme: no[i] ?? no["scheme-1"],
    direction: u === "horizontal" ? "horizontal" : "vertical",
    layoutAlignment: _t(n),
    position: l(e, `${t}.position`, "center"),
    layoutGap: y(e, `${t}.layoutGap`, 16),
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: s,
    minHeightPx: pl[s] ?? 0,
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none"),
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: U(e, `${t}.backgroundOverlay`, !1),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function gl(e, t) {
  const i = `.ziplofy-rich-text-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function di({
  sectionId: e = "rich_text_section",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontHeading: s, fontBody: u } = X(), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(() => ml(n, d), [n, d]), p = l(n, `${d}.heading`), c = l(n, `${d}.text`), h = l(n, `${d}.buttonLabel`), g = l(n, `${d}.buttonUrl`), $ = r.scheme, b = _t(r.layoutAlignment), v = r.sectionWidth === "full" ? 24 : L.padX, x = r.sectionWidth === "full" ? "100%" : L.maxWidth, z = `ziplofy-rich-text-${e.replace(/[^a-z0-9_-]/gi, "-")}`, S = r.direction === "horizontal", _ = {
    position: "relative",
    background: $.background,
    color: $.color,
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    paddingLeft: v,
    paddingRight: v,
    boxSizing: "border-box",
    minHeight: r.minHeightPx > 0 ? r.minHeightPx : void 0,
    border: r.borderStyle === "solid" ? `1px solid ${$.muted}33` : void 0,
    borderRadius: r.cornerRadius > 0 ? r.cornerRadius : void 0,
    overflow: r.cornerRadius > 0 ? "hidden" : void 0
  }, H = r.backgroundMedia === "image" && r.backgroundImageUrl ? r.backgroundImageUrl : null, w = {
    maxWidth: x,
    margin: "0 auto",
    width: "100%",
    minHeight: r.minHeightPx > 0 ? r.minHeightPx - r.paddingTop - r.paddingBottom : void 0,
    display: "flex",
    flexDirection: S ? "row" : "column",
    flexWrap: S ? "wrap" : void 0,
    alignItems: S ? ut(r.position) : b === "center" ? "center" : b === "right" ? "flex-end" : "flex-start",
    justifyContent: S ? b === "center" ? "center" : b === "right" ? "flex-end" : "flex-start" : ut(r.position),
    gap: r.layoutGap,
    textAlign: b,
    position: "relative",
    zIndex: 2
  }, R = {
    margin: 0,
    fontFamily: s,
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.02em"
  }, T = {
    margin: 0,
    fontFamily: u,
    fontSize: "1rem",
    lineHeight: 1.55,
    maxWidth: 520,
    color: $.muted
  }, W = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 28px",
    borderRadius: 9999,
    background: "#111827",
    color: "#ffffff",
    fontSize: "0.9375rem",
    fontWeight: 500,
    textDecoration: "none",
    border: "none",
    cursor: "pointer"
  }, P = gl(e, r.customCss);
  return /* @__PURE__ */ m(G, { sectionId: e, label: "Rich text", editorNodeId: a, style: _, children: [
    P ? /* @__PURE__ */ o("style", { children: P }) : null,
    H ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${H})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    r.backgroundOverlay && H ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 1
        }
      }
    ) : null,
    /* @__PURE__ */ m("div", { className: z, style: w, children: [
      p ? /* @__PURE__ */ o(k, { fieldPath: `${d}.heading`, label: "Heading", as: "h2", style: R, children: p }) : null,
      c ? /* @__PURE__ */ o(k, { fieldPath: `${d}.text`, label: "Text", as: "p", style: T, children: c }) : null,
      h ? /* @__PURE__ */ o(k, { fieldPath: `${d}.buttonLabel`, label: "Button label", as: "span", children: /* @__PURE__ */ o(I, { to: g || "#", style: W, children: h }) }) : null
    ] })
  ] });
}
const lo = {
  "scheme-1": { background: "#f6f6f7", color: "#111827" },
  "scheme-2": { background: "#ffffff", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function fl(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.motionDirection`, "forward");
  return {
    scheme: lo[i] ?? lo["scheme-1"],
    motionDirection: n === "reverse" ? "reverse" : "forward",
    paddingTop: y(e, `${t}.paddingTop`, 24),
    paddingBottom: y(e, `${t}.paddingBottom`, 24),
    layoutGap: y(e, `${t}.layoutGap`, 24),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function bl(e, t) {
  const i = `.ziplofy-text-marquee-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function ci({
  sectionId: e = "text_marquee_section",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s } = X(), u = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, d = i === "template" ? `template:${t}:${e}` : `layout:${e}`, a = F(() => fl(n, u), [n, u]), r = l(n, `${u}.text`), p = `ziplofy-text-marquee-${e.replace(/[^a-z0-9_-]/gi, "-")}`, c = a.motionDirection === "reverse" ? "ziplofy-marquee-reverse" : "ziplofy-marquee-forward", h = {
    position: "relative",
    background: a.scheme.background,
    color: a.scheme.color,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: L.padX,
    paddingRight: L.padX,
    boxSizing: "border-box",
    overflow: "hidden"
  }, g = {
    display: "flex",
    width: "max-content",
    animation: `${c} 28s linear infinite`,
    gap: a.layoutGap,
    fontFamily: s,
    fontSize: "1.125rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap"
  }, $ = {
    flexShrink: 0,
    paddingRight: a.layoutGap
  }, b = /* @__PURE__ */ o("span", { style: $, children: /* @__PURE__ */ o(k, { nodeId: d, fieldPath: `${u}.text`, label: "Text", children: r }) });
  return /* @__PURE__ */ o(G, { nodeId: d, label: "Marquee", children: /* @__PURE__ */ m("section", { className: p, style: h, "data-section-type": "text-marquee", children: [
    /* @__PURE__ */ o("style", { children: `
            @keyframes ziplofy-marquee-forward {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @keyframes ziplofy-marquee-reverse {
              from { transform: translateX(-50%); }
              to { transform: translateX(0); }
            }
            ${bl(e, a.customCss)}
          ` }),
    /* @__PURE__ */ o("div", { className: `${p}__viewport`, style: { overflow: "hidden", width: "100%" }, children: /* @__PURE__ */ m("div", { className: `${p}__track`, style: g, children: [
      b,
      /* @__PURE__ */ o("span", { style: $, "aria-hidden": !0, children: r })
    ] }) })
  ] }) });
}
const ro = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function yl(e, t) {
  const i = l(e, `${t}.sizeUnit`, "");
  return i === "pixel" || i === "percent" ? i : "pixel";
}
function xl(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = ro[i] ?? ro["scheme-1"], s = l(e, `${t}.sectionWidth`, "page"), u = l(e, `${t}.layoutAlignment`, "center"), d = l(e, `${t}.logoFont`, "heading");
  let a = y(e, `${t}.pixelHeight`, 0);
  if (a <= 0) {
    const r = l(e, `${t}.height`, "");
    a = r === "small" ? 32 : r === "large" ? 64 : r === "auto" ? 40 : 48;
  }
  return {
    scheme: n,
    logoFont: d === "body" || d === "subheading" || d === "accent" ? d : "heading",
    sizeUnit: yl(e, t),
    pixelHeight: a,
    percentWidth: y(e, `${t}.percentWidth`, 100),
    customMobileSize: U(e, `${t}.customMobileSize`, !1),
    mobileSizeUnit: l(e, `${t}.mobileSizeUnit`) === "pixel" ? "pixel" : "percent",
    mobilePixelHeight: y(e, `${t}.mobilePixelHeight`, 120),
    mobilePercentWidth: y(e, `${t}.mobilePercentWidth`, 100),
    sectionWidth: s === "full" ? "full" : "page",
    layoutAlignment: u === "left" || u === "right" ? u : "center",
    paddingTop: y(e, `${t}.paddingTop`, 32),
    paddingBottom: y(e, `${t}.paddingBottom`, 32),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function $l(e) {
  return e === "left" ? "flex-start" : e === "right" ? "flex-end" : "center";
}
function kl(e) {
  const t = e.sizeUnit === "pixel" ? `${e.pixelHeight}px` : void 0, i = e.sizeUnit === "percent" ? `${e.percentWidth}%` : void 0, n = e.customMobileSize ? e.mobileSizeUnit === "pixel" ? `${e.mobilePixelHeight}px` : void 0 : t, s = e.customMobileSize && e.mobileSizeUnit === "percent" ? `${e.mobilePercentWidth}%` : i;
  return {
    ...t ? { "--logo-height": t } : {},
    ...i ? { "--logo-width": i } : {},
    ...n ? { "--logo-height-mobile": n } : {},
    ...s ? { "--logo-width-mobile": s } : {}
  };
}
function vl(e, t) {
  const i = `.ziplofy-storytelling-logo-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function Sl(e, t) {
  return e === "body" || e === "subheading" ? t.fontBody : t.fontHeading;
}
function wl(e) {
  return e === "accent" ? { fontStyle: "italic" } : e === "subheading" ? { fontWeight: 600 } : e === "body" ? { fontWeight: 400 } : { fontWeight: 700 };
}
function si({
  sectionId: e = "storytelling_logo",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontHeading: s, fontBody: u } = X(), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(
    () => xl(n, d),
    [n, d]
  ), p = l(n, `${d}.logoText`), c = l(n, `${d}.logoImageUrl`, ""), h = l(n, `${d}.logoLinkUrl`, "/"), g = r.scheme, $ = r.sectionWidth === "full" ? 24 : L.padX, b = r.sectionWidth === "full" ? "100%" : L.maxWidth, v = `ziplofy-storytelling-logo-${e.replace(/[^a-z0-9_-]/gi, "-")}`, x = kl(r), z = $l(r.layoutAlignment), S = {
    position: "relative",
    background: g.background,
    color: g.color,
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    paddingLeft: $,
    paddingRight: $,
    boxSizing: "border-box",
    ...x
  }, _ = {
    maxWidth: b,
    margin: "0 auto",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: z,
    textAlign: r.layoutAlignment,
    boxSizing: "border-box"
  }, H = {
    width: r.sizeUnit === "percent" ? `var(--logo-width, ${r.percentWidth}%)` : "auto",
    maxWidth: "100%",
    maxHeight: r.sizeUnit === "pixel" ? `calc(var(--logo-height, ${r.pixelHeight}px) + 0px)` : void 0,
    fontSize: r.sizeUnit === "pixel" ? `var(--logo-height, ${r.pixelHeight}px)` : void 0,
    lineHeight: 1.05,
    fontFamily: Sl(r.logoFont, { fontHeading: s, fontBody: u }),
    ...wl(r.logoFont),
    color: g.color
  }, w = c ? /* @__PURE__ */ o(k, { fieldPath: `${d}.logoImageUrl`, label: "Logo image", as: "span", style: H, children: /* @__PURE__ */ o(
    "img",
    {
      src: c,
      alt: p || "Store logo",
      style: {
        display: "block",
        width: r.sizeUnit === "percent" ? "100%" : "auto",
        maxWidth: "100%",
        maxHeight: r.sizeUnit === "pixel" ? r.pixelHeight : 120,
        objectFit: "contain"
      }
    }
  ) }) : /* @__PURE__ */ o(k, { fieldPath: `${d}.logoText`, label: "Logo text", as: "span", style: H, children: p }), R = h && h !== "#" ? /* @__PURE__ */ o(I, { to: h, style: { display: "inline-flex", textDecoration: "none", color: "inherit" }, children: w }) : w, T = vl(e, r.customCss);
  return /* @__PURE__ */ o(G, { nodeId: a, label: "Logo", children: /* @__PURE__ */ m("section", { className: v, style: S, "data-section-type": "storytelling-logo", children: [
    T ? /* @__PURE__ */ o("style", { children: T }) : null,
    /* @__PURE__ */ o("div", { style: _, children: R })
  ] }) });
}
function _l() {
  return /* @__PURE__ */ m("div", { className: "flex items-end justify-center gap-3", "aria-hidden": !0, children: [
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          width: 88,
          height: 72,
          borderRadius: "10px 10px 4px 4px",
          background: "#e8c547",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "relative",
          width: 96,
          height: 88,
          borderRadius: "10px 10px 4px 4px",
          background: "#4a9a9a",
          boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
        },
        children: /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              left: "50%",
              top: "28%",
              transform: "translateX(-50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(180deg, #f5d76e 0%, #e8a838 55%, #c45c4a 100%)",
              opacity: 0.9
            }
          }
        )
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          width: 80,
          height: 64,
          borderRadius: "10px 10px 4px 4px",
          background: "#8b6914",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
        }
      }
    )
  ] });
}
const ao = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#4b5563", mediaPanel: "#f0f0f0" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#4b5563", mediaPanel: "#ececec" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569", mediaPanel: "#e8eef2" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6", mediaPanel: "#ede9fe" }
}, Cl = {
  auto: 0,
  small: 320,
  medium: 420,
  large: 520
};
function zl(e, t) {
  const i = l(e, `${t}.height`, "");
  return i === "auto" || i === "small" || i === "medium" || i === "large" ? i : "auto";
}
function Wl(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.direction`, ""), s = n === "horizontal" ? "horizontal" : "vertical";
  let u = !0;
  return n ? s === "horizontal" && (u = l(e, `${t}.layoutAlignment`, "left") === "right") : u = l(e, `${t}.mediaPosition`, "right") !== "left", {
    scheme: ao[i] ?? ao["scheme-1"],
    direction: s,
    layoutAlignment: l(e, `${t}.layoutAlignment`, "left"),
    position: l(e, `${t}.position`, "center"),
    layoutGap: y(e, `${t}.layoutGap`, 16),
    sectionWidth: l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: zl(e, t),
    backgroundMedia: l(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: l(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: l(e, `${t}.borderStyle`, "none"),
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: U(e, `${t}.backgroundOverlay`, !1),
    paddingTop: y(e, `${t}.paddingTop`, 32),
    paddingBottom: y(e, `${t}.paddingBottom`, 32),
    customCss: l(e, `${t}.customCss`, ""),
    videoOnRight: u
  };
}
function Pl(e) {
  const t = Cl[e] ?? 0;
  return t > 0 ? t : void 0;
}
function co(e) {
  return e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function Tl(e) {
  return e === "right" ? "flex-end" : e === "center" ? "center" : "flex-start";
}
function Hl(e, t) {
  const i = `.ziplofy-storytelling-video-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
const so = {
  fontSize: 15,
  fontWeight: 500,
  color: "inherit",
  textDecoration: "none",
  whiteSpace: "nowrap"
}, Rl = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.45,
  color: "inherit",
  maxWidth: "min(100%, 520px)"
};
function Ll() {
  return /* @__PURE__ */ o(
    "span",
    {
      "aria-hidden": !0,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        pointerEvents: "none"
      },
      children: /* @__PURE__ */ o(
        "span",
        {
          style: {
            marginLeft: 4,
            width: 0,
            height: 0,
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderLeft: "16px solid #111827"
          }
        }
      )
    }
  );
}
function ui({
  sectionId: e = "storytelling_video",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s } = X(), u = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, d = i === "template" ? `template:${t}:${e}` : `layout:${e}`, a = F(
    () => Wl(n, u),
    [n, u]
  ), r = l(n, `${u}.videoSource`, "url"), p = l(n, `${u}.videoUrl`, ""), c = l(n, `${u}.coverImageUrl`, ""), h = l(
    n,
    `${u}.caption`,
    "Take a look behind the scenes of our latest product launch."
  ), g = l(n, `${u}.linkLabel`), $ = l(n, `${u}.linkUrl`), b = a.scheme, v = Pl(a.height), x = a.sectionWidth === "full" ? 24 : L.padX, z = a.sectionWidth === "full" ? "100%" : L.maxWidth, S = a.videoOnRight, _ = a.direction === "horizontal", H = `ziplofy-storytelling-video-${e.replace(/[^a-z0-9_-]/gi, "-")}`, w = {
    position: "relative",
    background: b.background,
    color: b.color,
    fontFamily: s,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: x,
    paddingRight: x,
    boxSizing: "border-box",
    overflow: "hidden",
    border: a.borderStyle === "solid" ? `1px solid ${b.muted}33` : void 0,
    borderRadius: a.cornerRadius > 0 ? a.cornerRadius : void 0
  }, R = {
    maxWidth: z,
    margin: "0 auto",
    width: "100%",
    minHeight: v ?? (_ ? 360 : 400),
    display: "flex",
    flexDirection: _ ? "row" : "column",
    gap: a.layoutGap,
    alignItems: _ ? co(a.position) : "stretch",
    justifyContent: _ ? Tl(a.layoutAlignment) : "flex-start",
    boxSizing: "border-box",
    position: "relative"
  }, T = {
    position: "relative",
    flex: _ ? "1 1 66%" : "1 1 auto",
    minHeight: _ ? void 0 : Math.max((v ?? 400) - 88, 260),
    width: _ ? void 0 : "100%",
    order: _ && !S ? 0 : _ ? 1 : 0
  }, W = {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: _ ? "100%" : "66%",
    ...S || _ ? { right: 0 } : { left: 0 },
    background: b.mediaPanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    clipPath: S || _ ? "polygon(14% 0, 100% 0, 100% 100%, 0 100%)" : "polygon(0 0, 100% 0, 86% 100%, 0 100%)"
  }, P = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    ...S || _ ? { left: "12%" } : { right: "12%" }
  }, C = {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 24,
    paddingTop: _ ? 0 : 24,
    paddingBottom: 4,
    width: "100%",
    flex: _ ? "0 0 auto" : void 0,
    alignSelf: _ ? co(a.position) : void 0,
    boxSizing: "border-box",
    position: "relative",
    zIndex: 3,
    order: _ && !S ? 1 : _ ? 0 : 1,
    maxWidth: _ ? "34%" : "100%"
  }, M = c && r !== "uploaded" ? /* @__PURE__ */ o(
    "img",
    {
      src: c,
      alt: "",
      style: { width: "100%", height: "100%", objectFit: "cover", display: "block" }
    }
  ) : p ? /* @__PURE__ */ o(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${b.mediaPanel} 0%, #d8d8d8 100%)`
      }
    }
  ) : /* @__PURE__ */ o(_l, {}), f = Hl(e, a.customCss);
  return /* @__PURE__ */ o(G, { nodeId: d, label: "Video", children: /* @__PURE__ */ m("section", { className: H, style: w, "data-section-type": "storytelling-video", children: [
    a.backgroundOverlay ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.12)",
          pointerEvents: "none",
          zIndex: 1
        }
      }
    ) : null,
    f ? /* @__PURE__ */ o("style", { children: f }) : null,
    /* @__PURE__ */ m("div", { style: R, children: [
      /* @__PURE__ */ o("div", { style: T, children: /* @__PURE__ */ m(k, { fieldPath: `${u}.coverImageUrl`, label: "Cover image", as: "div", style: W, children: [
        M,
        /* @__PURE__ */ o("div", { style: P, children: /* @__PURE__ */ o(Ll, {}) })
      ] }) }),
      /* @__PURE__ */ m("div", { style: C, children: [
        /* @__PURE__ */ o(k, { fieldPath: `${u}.caption`, label: "Caption", as: "p", style: Rl, children: h }),
        /* @__PURE__ */ o(k, { fieldPath: `${u}.linkLabel`, label: "Link", as: "span", children: $ ? /* @__PURE__ */ o(I, { to: $, style: so, children: g }) : /* @__PURE__ */ o("span", { style: so, children: g }) })
      ] })
    ] })
  ] }) });
}
function hi(e, t) {
  const i = l(e, `${t}.textCase`, "default");
  return {
    fontSize: l(e, `${t}.fontSize`, "12px"),
    textTransform: i === "uppercase" ? "uppercase" : "none"
  };
}
function Ml(e, t) {
  const n = l(e, `${t}.text`, "").replace(/^©\s*\d{4}\s*/i, "").replace(/\s*\.\s*All rights reserved\.?$/i, "").trim();
  return {
    ...hi(e, t),
    showPoweredBy: U(e, `${t}.showPoweredBy`, !1),
    poweredByLabel: l(e, `${t}.poweredByLabel`),
    storeLabel: n
  };
}
function Fl(e, t = (/* @__PURE__ */ new Date()).getFullYear()) {
  const i = e.storeLabel ? `© ${t} ${e.storeLabel}` : `© ${t}`;
  return !e.showPoweredBy || !e.poweredByLabel.trim() ? i : `${i}, ${e.poweredByLabel.trim()}`;
}
const El = {
  "scheme-1": { background: "#f3f4f6", color: "#111827", muted: "#6b7280", border: "#e5e7eb" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", muted: "#64748b", border: "#e2e8f0" },
  "scheme-3": { background: "#fff7ed", color: "#431407", muted: "#9a3412", border: "#fed7aa" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", muted: "#6d28d9", border: "#ddd6fe" }
};
function Al(e, t, i) {
  const n = l(e, `${t}.colorScheme`, "scheme-1");
  return El[n] ?? i;
}
function Ul(e, t) {
  return l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function Nl(e, t) {
  return Math.max(0, y(e, `${t}.gap`, 24));
}
function Ol(e, t) {
  return Math.max(0, y(e, `${t}.dividerThickness`, 0));
}
function Gl(e, t) {
  return {
    paddingTop: y(e, `${t}.paddingTop`, 20),
    paddingBottom: y(e, `${t}.paddingBottom`, 48)
  };
}
function jl(e, t) {
  return U(e, `${t}.paymentIcons`, !1);
}
function Dl(e, t) {
  const i = t.trim();
  if (!i) return "";
  const n = `[data-ziplofy-section="${e}"]`;
  return i.replace(/:root/g, n).replace(/&/g, n);
}
const Bl = [
  { id: "facebook", label: "Facebook", settingKey: "facebookUrl" },
  { id: "instagram", label: "Instagram", settingKey: "instagramUrl" },
  { id: "youtube", label: "YouTube", settingKey: "youtubeUrl" },
  { id: "tiktok", label: "TikTok", settingKey: "tiktokUrl" },
  { id: "twitter", label: "X (Twitter)", settingKey: "twitterUrl" },
  { id: "threads", label: "Threads", settingKey: "threadsUrl" },
  { id: "linkedin", label: "LinkedIn", settingKey: "linkedinUrl" },
  { id: "bluesky", label: "Bluesky", settingKey: "blueskyUrl" },
  { id: "snapchat", label: "Snapchat", settingKey: "snapchatUrl" },
  { id: "pinterest", label: "Pinterest", settingKey: "pinterestUrl" },
  { id: "tumblr", label: "Tumblr", settingKey: "tumblrUrl" },
  { id: "vimeo", label: "Vimeo", settingKey: "vimeoUrl" },
  { id: "custom", label: "Custom link", settingKey: "customUrl" }
];
function Xl(e, t, i, n) {
  const s = l(e, `${t}.${i}`, "").trim();
  return s || (n ? l(e, `${t}.${n}`, "").trim() : "");
}
function ql(e, t) {
  return l(e, `${t}.catalogVariant`, "");
}
function Il({ sectionId: e = "footer_utilities" }) {
  const t = j(), { text: i, fontBody: n } = X(), s = `sections.${e}.settings`, u = `sections.${e}.blocks`, a = ql(t, s) === "policies-links", r = F(() => ({
    scheme: Al(t, s, {
      background: "#f3f4f6",
      color: i,
      muted: "#6b7280",
      border: L.line
    }),
    widthMode: Ul(t, s),
    gap: Nl(t, s),
    dividerPx: Ol(t, s),
    ...Gl(t, s),
    showPaymentIcons: jl(t, s),
    customCss: l(t, `${s}.customCss`, "")
  }), [t, s, i]), p = `${u}.copyright.settings`, c = `${u}.policy_links.settings`, h = F(() => Ml(t, p), [t, p]), g = F(() => Fl(h), [h]), $ = F(
    () => hi(t, c),
    [t, c]
  ), b = l(t, `${c}.privacyLabel`), v = l(t, `${c}.privacyHref`, "#"), x = l(t, `${c}.termsLabel`), z = l(t, `${c}.termsHref`, "#"), S = {
    color: r.scheme.muted,
    textDecoration: "underline",
    fontSize: $.fontSize,
    textTransform: $.textTransform
  }, _ = `${u}.social.settings`, w = Pe(t, e, a ? ["copyright", "policy_links"] : ["copyright", "policy_links", "social"]), R = {
    copyright: /* @__PURE__ */ o(E, { nodeId: `layout:${e}:block:copyright`, label: "Copyright", children: /* @__PURE__ */ o(k, { fieldPath: `${p}.showPoweredBy`, label: 'Show "Powered by" badge', children: /* @__PURE__ */ o(
      "span",
      {
        style: {
          color: r.scheme.muted,
          fontSize: h.fontSize,
          textTransform: h.textTransform
        },
        children: g
      }
    ) }) }),
    policy_links: /* @__PURE__ */ m(
      E,
      {
        nodeId: `layout:${e}:block:policy_links`,
        label: "Policy links",
        style: { display: "flex", gap: 16 },
        children: [
          /* @__PURE__ */ o(k, { fieldPath: `${c}.fontSize`, label: "Size", children: /* @__PURE__ */ o(I, { to: v, style: S, children: b }) }),
          /* @__PURE__ */ o(
            "span",
            {
              "data-ziplofy-node": `field:${c}.privacyHref`,
              "data-ziplofy-label": "Privacy link",
              "data-ziplofy-kind": "field",
              hidden: !0,
              children: v
            }
          ),
          /* @__PURE__ */ o(k, { fieldPath: `${c}.termsLabel`, label: "Terms", children: /* @__PURE__ */ o(I, { to: z, style: S, children: x }) }),
          /* @__PURE__ */ o(
            "span",
            {
              "data-ziplofy-node": `field:${c}.termsHref`,
              "data-ziplofy-label": "Terms link",
              "data-ziplofy-kind": "field",
              hidden: !0,
              children: z
            }
          )
        ]
      }
    ),
    social: /* @__PURE__ */ o(
      E,
      {
        nodeId: `layout:${e}:block:social`,
        label: "Social media links",
        style: { display: "flex", flexWrap: "wrap", gap: 12 },
        children: Bl.map((P) => {
          const C = Xl(t, _, P.settingKey, P.id === "instagram" || P.id === "facebook" ? P.id : void 0);
          return /* @__PURE__ */ o(
            k,
            {
              fieldPath: `${_}.${P.settingKey}`,
              label: P.label,
              children: C ? /* @__PURE__ */ o(
                "a",
                {
                  href: C,
                  target: "_blank",
                  rel: "noreferrer",
                  style: { color: r.scheme.muted, textDecoration: "underline", fontSize: 13 },
                  children: P.label
                }
              ) : /* @__PURE__ */ o("span", { style: { color: r.scheme.muted, opacity: 0.45, fontSize: 13 }, children: P.label })
            },
            P.id
          );
        })
      }
    )
  }, T = r.widthMode === "full" ? "100%" : L.maxWidth, W = r.widthMode === "full" ? 0 : L.padX;
  return /* @__PURE__ */ m(
    G,
    {
      sectionId: e,
      label: a ? "Policies and links" : "Utilities",
      style: {
        background: r.scheme.background,
        borderTop: a ? `1px solid ${r.scheme.border}` : `${r.dividerPx}px solid ${r.scheme.border}`,
        fontFamily: n,
        fontSize: 13,
        color: r.scheme.color,
        paddingTop: r.paddingTop,
        paddingBottom: r.paddingBottom,
        paddingLeft: W,
        paddingRight: W,
        boxSizing: "border-box"
      },
      children: [
        r.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Dl(e, r.customCss) } }) : null,
        /* @__PURE__ */ m(
          "div",
          {
            style: {
              maxWidth: T,
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: r.gap
            },
            children: [
              w.map((P) => {
                const C = R[P];
                return C ? /* @__PURE__ */ o("span", { children: C }, P) : null;
              }),
              !a && r.showPaymentIcons ? /* @__PURE__ */ o(
                "span",
                {
                  style: {
                    display: "inline-flex",
                    gap: 6,
                    opacity: 0.7,
                    fontSize: 11,
                    letterSpacing: 0.04
                  },
                  "aria-hidden": !0,
                  children: "VISA MC AMEX"
                }
              ) : null
            ]
          }
        )
      ]
    }
  );
}
function pi(e) {
  return e === "footer_utilities" || /^footer_utilities_\d+$/.test(e);
}
function Vl(e) {
  return pi(e) ? !1 : e === "footer" || /^footer_\d+$/.test(e);
}
function Kl({ sectionId: e }) {
  return pi(e) ? /* @__PURE__ */ o(Il, { sectionId: e }) : Vl(e) ? /* @__PURE__ */ o(Bo, { sectionId: e }) : e === "divider" || e.startsWith("divider_") ? /* @__PURE__ */ o(wt, { sectionId: e, placement: "layout" }) : e === "custom_section" || e.startsWith("custom_section_") ? /* @__PURE__ */ o(vt, { sectionId: e, placement: "layout" }) : e === "hero_main" || e.startsWith("hero_main_") ? /* @__PURE__ */ o(kt, { sectionId: e, placement: "layout" }) : e === "product_highlight" || e.startsWith("product_highlight_") ? /* @__PURE__ */ o(un, { sectionId: e }) : e === "image_compare" || e.startsWith("image_compare_") ? /* @__PURE__ */ o(Fn, { sectionId: e }) : e === "image_with_text" || e.startsWith("image_with_text_") ? /* @__PURE__ */ o(Dn, { sectionId: e }) : e === "editorial_jumbo" || e.startsWith("editorial_jumbo_") ? /* @__PURE__ */ o(_n, { sectionId: e }) : e === "editorial" || e.startsWith("editorial_") ? /* @__PURE__ */ o(bn, { sectionId: e }) : e === "faq_section" || e.startsWith("faq_section_") ? /* @__PURE__ */ o(ni, { sectionId: e, placement: "layout" }) : e === "icons_with_text" || e.startsWith("icons_with_text_") ? /* @__PURE__ */ o(li, { sectionId: e, placement: "layout" }) : e === "multicolumn_section" || e.startsWith("multicolumn_section_") ? /* @__PURE__ */ o(ri, { sectionId: e, placement: "layout" }) : e === "pull_quote_section" || e.startsWith("pull_quote_section_") ? /* @__PURE__ */ o(ai, { sectionId: e, placement: "layout" }) : e === "rich_text_section" || e.startsWith("rich_text_section_") ? /* @__PURE__ */ o(di, { sectionId: e, placement: "layout" }) : e === "text_marquee_section" || e.startsWith("text_marquee_section") ? /* @__PURE__ */ o(ci, { sectionId: e, placement: "layout" }) : e === "contact_form" || e.startsWith("contact_form") ? /* @__PURE__ */ o(Vo, { sectionId: e, placement: "layout" }) : e === "email_signup" || e.startsWith("email_signup") ? /* @__PURE__ */ o(Ko, { sectionId: e, placement: "layout" }) : e === "storytelling_logo" || e.startsWith("storytelling_logo") ? /* @__PURE__ */ o(si, { sectionId: e, placement: "layout" }) : e === "storytelling_video" || e.startsWith("storytelling_video") ? /* @__PURE__ */ o(ui, { sectionId: e, placement: "layout" }) : null;
}
const Yl = {
  "scheme-1": { background: "#111827", color: "#f9fafb", linkColor: "#93c5fd" },
  "scheme-2": { background: "#1e3a5f", color: "#eff6ff", linkColor: "#bfdbfe" },
  "scheme-3": { background: "#431407", color: "#fff7ed", linkColor: "#fdba74" },
  "scheme-4": { background: "#4c1d95", color: "#f5f3ff", linkColor: "#ddd6fe" }
};
function Zl(e, t, i) {
  const n = l(e, `${t}.colorScheme`, "scheme-4");
  return Yl[n] ?? i;
}
function Ql(e, t) {
  return l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function Jl(e, t) {
  return {
    paddingTop: y(e, `${t}.paddingTop`, 15),
    paddingBottom: y(e, `${t}.paddingBottom`, 15)
  };
}
function er(e, t) {
  return Math.max(0, y(e, `${t}.dividerThickness`, 0));
}
function tr(e, t) {
  const i = y(e, `${t}.timeToNext`, 5);
  return !Number.isFinite(i) || i <= 0 ? 0 : i;
}
function or(e, t) {
  const i = t.trim();
  if (!i) return "";
  const n = `[data-ziplofy-section="${e}"]`;
  return i.replace(/:root/g, n).replace(/&/g, n);
}
function uo(e, t, i) {
  const n = l(e, `${t}.font`, "subheading"), s = l(e, `${t}.fontSize`, "12px"), u = l(e, `${t}.fontWeight`, "default"), d = l(e, `${t}.letterSpacing`), a = l(e, `${t}.textCase`, "default"), r = n === "heading" ? i.fontHeading : i.fontBody, p = d === "tight" ? "-0.02em" : d === "wide" ? "0.08em" : "normal", c = u === "default" ? void 0 : Number.isFinite(Number(u)) ? Number(u) : void 0;
  return {
    fontFamily: r,
    fontSize: s,
    fontWeight: c,
    letterSpacing: p,
    textTransform: a === "uppercase" ? "uppercase" : "none"
  };
}
function ir(e) {
  return {
    fontFamily: e.fontFamily,
    fontSize: e.fontSize,
    fontWeight: e.fontWeight,
    letterSpacing: e.letterSpacing,
    textTransform: e.textTransform
  };
}
function nr(e, t, i, n) {
  const s = [];
  for (const u of i) {
    const d = `${t}.blocks.${u}.settings`, a = l(e, `${d}.text`, "").trim();
    a && s.push({
      blockId: u,
      text: a,
      link: l(e, `${d}.link`, "").trim(),
      typography: uo(e, d, n)
    });
  }
  if (!s.length) {
    const u = l(e, `${t}.settings.message`, "").trim();
    u && s.push({
      blockId: "announcement",
      text: u,
      link: l(e, `${t}.settings.linkHref`, "").trim(),
      typography: uo(
        e,
        `${t}.blocks.announcement.settings`,
        n
      )
    });
  }
  return s;
}
function lr({ sectionId: e = "announcement_bar" }) {
  const t = j(), i = X(), n = rt(), s = fi(), u = bi(s, e), d = {
    background: i.primary,
    color: i.background,
    linkColor: i.background
  }, a = `sections.${e}`, r = `${a}.settings`, p = U(t, `${r}.enabled`, !0), c = Pe(t, e, ["announcement"]), h = F(
    () => nr(t, a, c, {
      fontHeading: i.fontHeading,
      fontBody: i.fontBody
    }),
    [t, a, c, i.fontHeading, i.fontBody]
  ), [g, $] = Z(0), b = tr(t, r);
  ue(() => {
    $(0);
  }, [e, h.map((C) => `${C.blockId}\0${C.text}`).join("")]), ue(() => {
    if (!u || !h.length) return;
    const C = h.findIndex((M) => M.blockId === u);
    C >= 0 && $(C);
  }, [u, h]), ue(() => {
    if (n || h.length <= 1 || b <= 0) return;
    const C = window.setInterval(() => {
      $((M) => (M + 1) % h.length);
    }, b * 1e3);
    return () => window.clearInterval(C);
  }, [n, h.length, b]);
  const v = F(() => {
    if (u) {
      const C = h.findIndex((M) => M.blockId === u);
      if (C >= 0) return C;
    }
    return g;
  }, [u, h, g]), x = h[v] ?? h[0];
  if (!p || !h.length || !x?.text) return null;
  const z = Zl(t, r, d), S = Ql(t, r), { paddingTop: _, paddingBottom: H } = Jl(t, r), w = er(t, r), R = l(t, `${r}.customCss`, ""), T = or(e, R), W = (C, M) => {
    const f = ir(C.typography), O = `${a}.blocks.${C.blockId}.settings.text`, N = `${a}.blocks.${C.blockId}.settings.link`, D = /* @__PURE__ */ o(k, { fieldPath: O, label: "Text", children: /* @__PURE__ */ o("span", { style: f, children: C.text }) }), V = C.link && C.link.startsWith("/") ? /* @__PURE__ */ m(I, { to: C.link, style: { color: z.color, textDecoration: "none" }, children: [
      D,
      /* @__PURE__ */ o(
        "span",
        {
          "data-ziplofy-node": `field:${N}`,
          "data-ziplofy-label": "Link",
          "data-ziplofy-kind": "field",
          hidden: !0,
          children: C.link
        }
      )
    ] }) : C.link ? /* @__PURE__ */ o("a", { href: C.link, style: { color: z.color, textDecoration: "none" }, children: D }) : D;
    return /* @__PURE__ */ o(
      "div",
      {
        style: {
          display: M ? "block" : "none"
        },
        "aria-hidden": !M,
        children: c.includes(C.blockId) ? /* @__PURE__ */ o(E, { nodeId: `layout:${e}:block:${C.blockId}`, label: "Announcement", children: V }) : /* @__PURE__ */ o(k, { fieldPath: `${r}.message`, label: "Announcement text", children: /* @__PURE__ */ o("span", { style: f, children: C.text }) })
      },
      C.blockId
    );
  }, P = n && h.length > 1;
  return /* @__PURE__ */ m(
    G,
    {
      sectionId: e,
      label: "Announcement bar",
      style: {
        background: z.background,
        color: z.color,
        fontFamily: i.fontBody,
        fontSize: 13,
        textAlign: "center",
        paddingTop: _,
        paddingBottom: H,
        borderBottom: w > 0 ? `${w}px solid rgba(0,0,0,0.15)` : void 0,
        width: "100%",
        boxSizing: "border-box"
      },
      children: [
        T ? /* @__PURE__ */ o("style", { children: T }) : null,
        /* @__PURE__ */ o(
          "div",
          {
            style: S === "page" ? { maxWidth: 1200, margin: "0 auto", paddingLeft: 16, paddingRight: 16 } : { width: "100%", paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" },
            children: P ? h.map(
              (C, M) => W(C, u ? C.blockId === u : M === v)
            ) : W(x, !0)
          }
        )
      ]
    }
  );
}
function rr({ sectionId: e }) {
  return e === "header" || e.startsWith("header_") ? /* @__PURE__ */ o(Xo, { sectionId: e }) : e === "announcement_bar" || e.startsWith("announcement_bar_") ? /* @__PURE__ */ o(lr, { sectionId: e }) : e === "divider" || e.startsWith("divider_") ? /* @__PURE__ */ o(wt, { sectionId: e, placement: "layout" }) : e === "custom_section" || e.startsWith("custom_section_") ? /* @__PURE__ */ o(vt, { sectionId: e, placement: "layout" }) : null;
}
function Ae({ children: e }) {
  const t = j(), { background: i, text: n } = X(), s = Ni(t), u = Oi(t);
  return /* @__PURE__ */ m("div", { style: { minHeight: "100vh", background: i, color: n }, children: [
    s.map(
      (d) => Mt(t, d) ? /* @__PURE__ */ o(rr, { sectionId: d }, d) : null
    ),
    /* @__PURE__ */ o("main", { children: e }),
    u.map(
      (d) => Mt(t, d) ? /* @__PURE__ */ o(Kl, { sectionId: d }, d) : null
    )
  ] });
}
const Re = "templates.cart.sections.cart_main";
function ho(e) {
  const t = e.productVariantId;
  return typeof t == "object" && t !== null && "_id" in t ? t : null;
}
function ar() {
  const e = j(), t = rt(), { text: i, background: n, primary: s, fontHeading: u, fontBody: d } = X(), { user: a, checkAuth: r } = Ze(), { getAllItems: p, getCartByCustomerId: c, updateCartEntry: h, deleteCartEntry: g, loading: $ } = xt(), [b, v] = Z({}), x = l(e, `${Re}.settings.title`), z = l(e, `${Re}.blocks.empty_state.blocks.empty_message.settings.emptyTitle`), S = l(e, `${Re}.blocks.empty_state.blocks.continue_link.settings.label`), _ = l(e, `${Re}.blocks.empty_state.blocks.continue_link.settings.href`), H = l(e, `${Re}.blocks.line_items.blocks.item_actions.settings.removeLabel`), w = l(e, `${Re}.blocks.line_items.blocks.item_actions.settings.loadingLabel`), R = l(e, `${Re}.blocks.cart_summary.blocks.subtotal.settings.label`);
  ue(() => {
    t || r();
  }, [r, t]), ue(() => {
    t || !a?._id || c(a._id);
  }, [c, t, a?._id]);
  const T = p(), W = F(() => T.length > 0 ? T : t ? Ai : [], [T, t]), P = F(() => {
    let f = 0;
    for (const O of W) {
      const N = ho(O);
      N && (f += N.price * O.quantity);
    }
    return f;
  }, [W]), C = !t && $ && W.length === 0, M = !C && W.length === 0;
  return /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ o(G, { sectionId: "cart_main", label: "Cart", style: { padding: `40px ${L.padX}px 64px`, fontFamily: d, color: i }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 880, margin: "0 auto" }, children: [
    /* @__PURE__ */ o(k, { fieldPath: `${Re}.settings.title`, label: "Page title", as: "h1", style: { fontFamily: u, fontSize: 32, marginTop: 0 }, children: x }),
    C ? /* @__PURE__ */ o(E, { nodeId: "template:cart:cart_main:block:line_items", label: "Line items", children: /* @__PURE__ */ o("p", { style: { opacity: 0.7 }, children: w }) }) : null,
    M ? /* @__PURE__ */ o(E, { nodeId: "template:cart:cart_main:block:empty_state", label: "Empty cart", children: /* @__PURE__ */ m("p", { style: { opacity: 0.7 }, children: [
      /* @__PURE__ */ o(k, { fieldPath: `${Re}.blocks.empty_state.blocks.empty_message.settings.emptyTitle`, label: "Empty cart text", as: "span", children: z }),
      " ",
      /* @__PURE__ */ o(I, { to: _, style: { color: s }, children: /* @__PURE__ */ o(k, { fieldPath: `${Re}.blocks.empty_state.blocks.continue_link.settings.label`, label: "Link label", as: "span", children: S }) })
    ] }) }) : null,
    W.length > 0 ? /* @__PURE__ */ m(ne, { children: [
      /* @__PURE__ */ o(E, { nodeId: "template:cart:cart_main:block:line_items", label: "Line items", children: /* @__PURE__ */ o("div", { style: { display: "grid", gap: 12, marginTop: 24 }, children: W.map((f) => {
        const O = ho(f);
        return /* @__PURE__ */ o("article", { style: { border: `1px solid ${L.line}`, borderRadius: 10, padding: 16, background: n }, children: /* @__PURE__ */ m("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ m("div", { children: [
            O ? /* @__PURE__ */ o(I, { to: `/products/${O.productId}`, style: { color: i, fontWeight: 600 }, onClick: (N) => t && N.preventDefault(), children: O.sku }) : /* @__PURE__ */ o("span", { children: "Item" }),
            /* @__PURE__ */ m("p", { style: { margin: "8px 0 0" }, children: [
              O ? Ye(O.price) : "—",
              " each"
            ] })
          ] }),
          /* @__PURE__ */ m("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }, children: [
            /* @__PURE__ */ o(
              "input",
              {
                type: "number",
                min: 1,
                value: b[f._id] ?? String(f.quantity),
                readOnly: t,
                onChange: (N) => v((D) => ({ ...D, [f._id]: N.target.value })),
                onBlur: () => {
                  if (t) return;
                  const N = Math.max(1, Math.floor(Number(b[f._id]) || f.quantity));
                  N !== f.quantity && h({ id: f._id, quantity: N });
                },
                style: { ...We, width: 72, fontFamily: d }
              }
            ),
            /* @__PURE__ */ o(E, { nodeId: "template:cart:cart_main:block:line_items:block:item_actions", label: "Item actions", children: /* @__PURE__ */ o(
              "button",
              {
                type: "button",
                onClick: () => {
                  t || g(f._id);
                },
                style: { background: "none", border: "none", color: s, cursor: t ? "default" : "pointer" },
                children: /* @__PURE__ */ o(k, { fieldPath: `${Re}.blocks.line_items.blocks.item_actions.settings.removeLabel`, label: "Remove button", as: "span", children: H })
              }
            ) })
          ] })
        ] }) }, f._id);
      }) }) }),
      /* @__PURE__ */ o(E, { nodeId: "template:cart:cart_main:block:cart_summary", label: "Summary", children: /* @__PURE__ */ m("p", { style: { marginTop: 24, fontSize: 20, fontWeight: 600 }, children: [
        /* @__PURE__ */ o(k, { fieldPath: `${Re}.blocks.cart_summary.blocks.subtotal.settings.label`, label: "Subtotal prefix", as: "span", children: R }),
        " ",
        Ye(P)
      ] }) })
    ] }) : null
  ] }) }) });
}
function dr({ sectionId: e = "custom_section", templateId: t = "index" }) {
  return /* @__PURE__ */ o(vt, { sectionId: e, placement: "template", templateId: t });
}
function Ct({ variant: e }) {
  return e === "thread" ? /* @__PURE__ */ m("div", { className: "flex items-end justify-center gap-1.5", "aria-hidden": !0, children: [
    /* @__PURE__ */ o("div", { style: { height: 40, width: 12, borderRadius: 999, background: "#e8c547" } }),
    /* @__PURE__ */ o("div", { style: { height: 48, width: 14, borderRadius: 999, background: "#d45454" } }),
    /* @__PURE__ */ o("div", { style: { height: 36, width: 12, borderRadius: 999, background: "#4a9a9a" } })
  ] }) : e === "sewing" ? /* @__PURE__ */ m("div", { style: { position: "relative", height: 48, width: 56 }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 0,
          left: "50%",
          height: 28,
          width: 40,
          transform: "translateX(-50%)",
          borderRadius: 4,
          background: "#6b7280"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 24,
          left: "50%",
          height: 8,
          width: 48,
          transform: "translateX(-50%)",
          borderRadius: 4,
          background: "#4b5563"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 28,
          right: 4,
          height: 16,
          width: 16,
          borderRadius: "50%",
          background: "#9ca3af"
        }
      }
    )
  ] }) : /* @__PURE__ */ m("div", { style: { position: "relative", height: 44, width: 48 }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 20,
          width: 24,
          borderRadius: 4,
          background: "#c4a574"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 4,
          left: 16,
          height: 24,
          width: 28,
          borderRadius: 4,
          background: "#a88b5c"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 0,
          right: 0,
          height: 16,
          width: 20,
          borderRadius: 4,
          background: "#8b6914"
        }
      }
    )
  ] });
}
const po = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function cr(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.navIcon`, "arrows"), s = l(e, `${t}.navIconBackground`, "circle"), u = l(e, `${t}.sectionWidth`, "page"), d = l(e, `${t}.mobileCardSize`, "1");
  return {
    scheme: po[i] ?? po["scheme-1"],
    heading: l(e, `${t}.heading`),
    postCount: y(e, `${t}.postCount`, 5),
    columns: y(e, `${t}.columns`, 3),
    mobileCardSize: d === "2" ? 2 : 1,
    horizontalGap: y(e, `${t}.horizontalGap`, 8),
    navIcon: n === "chevron" ? "chevron" : n === "none" ? "none" : "arrows",
    navIconBackground: s === "square" ? "square" : s === "none" ? "none" : "circle",
    sectionWidth: u === "full" ? "full" : "page",
    layoutGap: y(e, `${t}.layoutGap`, 12),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function sr(e) {
  return e === "thread" || e === "boxes" ? e : "sewing";
}
function zt(e, t, i, n, s) {
  const d = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, a = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), r = K(e, d);
  if (!r || typeof r != "object") return [];
  const p = a.length ? a : Object.keys(r), c = Math.max(1, Math.min(12, s));
  return p.slice(0, c).map((h) => {
    const g = r[h]?.settings ?? {};
    return {
      id: h,
      illustrationVariant: sr(String(g.illustrationVariant ?? "sewing")),
      title: String(g.title ?? ""),
      date: String(g.date ?? ""),
      author: String(g.author ?? ""),
      excerpt: String(g.excerpt ?? ""),
      imageUrl: String(g.imageUrl ?? "")
    };
  });
}
function ur(e, t) {
  const i = `.ziplofy-blog-posts-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function mo({
  label: e,
  onClick: t,
  background: i,
  shape: n
}) {
  return /* @__PURE__ */ o("button", { type: "button", "aria-label": e, onClick: t, style: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: i === "none" ? 32 : 36,
    height: i === "none" ? 32 : 36,
    border: "none",
    cursor: "pointer",
    background: i === "circle" || i === "square" ? "rgba(255,255,255,0.95)" : "transparent",
    borderRadius: i === "circle" ? "50%" : i === "square" ? 6 : 0,
    boxShadow: i !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
    color: "#111827",
    fontSize: n === "chevron" ? 18 : 20,
    lineHeight: 1
  }, children: n === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→" });
}
function hr({
  sectionId: e = "blog_posts_carousel",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s } = X(), u = ot(null), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(
    () => cr(n, d),
    [n, d]
  ), p = F(
    () => zt(n, t, e, i, r.postCount),
    [n, t, e, i, r.postCount]
  ), c = r.sectionWidth === "full" ? 24 : L.padX, h = r.sectionWidth === "full" ? "100%" : L.maxWidth, g = `ziplofy-blog-posts-${e.replace(/[^a-z0-9_-]/gi, "-")}`, $ = r.columns > 0 ? `calc((100% - ${(r.columns - 1) * r.horizontalGap}px) / ${r.columns})` : "280px", b = (C) => {
    const M = u.current;
    if (!M) return;
    const f = M.clientWidth * 0.85 * C;
    M.scrollBy({ left: f, behavior: "smooth" });
  }, v = {
    position: "relative",
    background: r.scheme.background,
    color: r.scheme.color,
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    paddingLeft: c,
    paddingRight: c,
    boxSizing: "border-box",
    fontFamily: s
  }, x = {
    maxWidth: h,
    margin: "0 auto",
    width: "100%"
  }, z = {
    margin: 0,
    marginBottom: r.layoutGap,
    fontSize: "1.5rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  }, S = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8
  }, _ = {
    display: "flex",
    gap: r.horizontalGap,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    flex: 1,
    paddingBottom: 4
  }, H = {
    flex: `0 0 ${$}`,
    minWidth: 0,
    scrollSnapAlign: "start"
  }, w = {
    aspectRatio: "4 / 3",
    borderRadius: 8,
    background: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12
  }, R = {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 700,
    lineHeight: 1.3
  }, T = {
    margin: "4px 0 0",
    fontSize: "0.8125rem",
    color: r.scheme.muted
  }, W = {
    margin: "8px 0 0",
    fontSize: "0.875rem",
    lineHeight: 1.45,
    color: r.scheme.color
  }, P = r.navIcon !== "none" && p.length > r.columns;
  return /* @__PURE__ */ o(G, { nodeId: a, label: "Blog posts: Carousel", children: /* @__PURE__ */ m(
    "section",
    {
      className: g,
      style: v,
      "data-section-type": "blog-posts-carousel",
      "data-mobile-cards": r.mobileCardSize,
      children: [
        /* @__PURE__ */ o("style", { children: `
            .${g} [data-carousel-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${g}[data-mobile-cards="1"] [data-blog-card] {
                flex: 0 0 calc(100% - 8px);
              }
              .${g}[data-mobile-cards="2"] [data-blog-card] {
                flex: 0 0 calc(50% - ${r.horizontalGap / 2}px);
              }
            }
            ${ur(e, r.customCss)}
          ` }),
        /* @__PURE__ */ m("div", { style: x, children: [
          /* @__PURE__ */ o("h2", { style: z, children: /* @__PURE__ */ o(
            k,
            {
              nodeId: a,
              fieldPath: `${d}.heading`,
              label: "Heading",
              children: r.heading
            }
          ) }),
          /* @__PURE__ */ m("div", { style: S, children: [
            P ? /* @__PURE__ */ o(
              mo,
              {
                label: "Previous",
                onClick: () => b(-1),
                background: r.navIconBackground,
                shape: r.navIcon
              }
            ) : null,
            /* @__PURE__ */ o("div", { ref: u, "data-carousel-track": !0, style: _, children: p.map((C) => {
              const M = i === "template" ? `templates.${t}.sections.${e}.blocks.${C.id}.settings` : `sections.${e}.blocks.${C.id}.settings`;
              return /* @__PURE__ */ m("article", { "data-blog-card": !0, style: H, children: [
                /* @__PURE__ */ o("div", { style: w, children: C.imageUrl ? /* @__PURE__ */ o(
                  "img",
                  {
                    src: C.imageUrl,
                    alt: "",
                    style: { width: "100%", height: "100%", objectFit: "cover" }
                  }
                ) : /* @__PURE__ */ o(Ct, { variant: C.illustrationVariant }) }),
                /* @__PURE__ */ o("h3", { style: R, children: /* @__PURE__ */ o(
                  k,
                  {
                    nodeId: `${a}:block:${C.id}`,
                    fieldPath: `${M}.title`,
                    label: "Title",
                    children: C.title
                  }
                ) }),
                /* @__PURE__ */ m("p", { style: T, children: [
                  /* @__PURE__ */ o(
                    k,
                    {
                      nodeId: `${a}:block:${C.id}`,
                      fieldPath: `${M}.date`,
                      label: "Date",
                      children: C.date
                    }
                  ),
                  " | ",
                  /* @__PURE__ */ o(
                    k,
                    {
                      nodeId: `${a}:block:${C.id}`,
                      fieldPath: `${M}.author`,
                      label: "Author",
                      children: C.author
                    }
                  )
                ] }),
                /* @__PURE__ */ o("p", { style: W, children: /* @__PURE__ */ o(
                  k,
                  {
                    nodeId: `${a}:block:${C.id}`,
                    fieldPath: `${M}.excerpt`,
                    label: "Excerpt",
                    children: C.excerpt
                  }
                ) })
              ] }, C.id);
            }) }),
            P ? /* @__PURE__ */ o(
              mo,
              {
                label: "Next",
                onClick: () => b(1),
                background: r.navIconBackground,
                shape: r.navIcon
              }
            ) : null
          ] })
        ] })
      ]
    }
  ) });
}
const go = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function pr(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.sectionWidth`, "page");
  return {
    scheme: go[i] ?? go["scheme-1"],
    heading: l(e, `${t}.heading`),
    postCount: y(e, `${t}.postCount`, 3),
    carouselOnMobile: U(e, `${t}.carouselOnMobile`, !1),
    sectionWidth: n === "full" ? "full" : "page",
    layoutGap: y(e, `${t}.layoutGap`, 64),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function mr(e, t) {
  const i = `.ziplofy-blog-posts-editorial-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function st({
  card: e,
  featured: t = !1,
  editorNodeId: i,
  blockBase: n,
  scheme: s,
  fontBody: u
}) {
  const d = {
    aspectRatio: t ? "16 / 9" : "4 / 3",
    borderRadius: 8,
    background: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: t ? 16 : 12
  }, a = {
    margin: 0,
    fontFamily: u,
    fontSize: t ? "1.125rem" : "1rem",
    fontWeight: 700,
    lineHeight: 1.3,
    color: s.color
  }, r = {
    margin: "4px 0 0",
    fontFamily: u,
    fontSize: "0.8125rem",
    color: s.muted
  }, p = {
    margin: "8px 0 0",
    fontFamily: u,
    fontSize: "0.875rem",
    lineHeight: 1.45,
    color: s.color
  };
  return /* @__PURE__ */ m("article", { "data-blog-card": !0, "data-featured": t ? "true" : "false", children: [
    /* @__PURE__ */ o("div", { style: d, children: e.imageUrl ? /* @__PURE__ */ o(
      "img",
      {
        src: e.imageUrl,
        alt: "",
        style: { width: "100%", height: "100%", objectFit: "cover" }
      }
    ) : /* @__PURE__ */ o(Ct, { variant: e.illustrationVariant }) }),
    /* @__PURE__ */ o("h3", { style: a, children: /* @__PURE__ */ o(k, { nodeId: `${i}:block:${e.id}`, fieldPath: `${n}.title`, label: "Title", children: e.title }) }),
    /* @__PURE__ */ m("p", { style: r, children: [
      /* @__PURE__ */ o(k, { nodeId: `${i}:block:${e.id}`, fieldPath: `${n}.date`, label: "Date", children: e.date }),
      " | ",
      /* @__PURE__ */ o(k, { nodeId: `${i}:block:${e.id}`, fieldPath: `${n}.author`, label: "Author", children: e.author })
    ] }),
    /* @__PURE__ */ o("p", { style: p, children: /* @__PURE__ */ o(k, { nodeId: `${i}:block:${e.id}`, fieldPath: `${n}.excerpt`, label: "Excerpt", children: e.excerpt }) })
  ] });
}
function gr({
  sectionId: e = "blog_posts_editorial",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s } = X(), u = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, d = i === "template" ? `template:${t}:${e}` : `layout:${e}`, a = F(
    () => pr(n, u),
    [n, u]
  ), r = F(
    () => zt(n, t, e, i, a.postCount),
    [n, t, e, i, a.postCount]
  ), p = a.sectionWidth === "full" ? 24 : L.padX, c = a.sectionWidth === "full" ? "100%" : L.maxWidth, h = `ziplofy-blog-posts-editorial-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = a.layoutGap, $ = r.length >= 2 ? r.slice(0, 2) : r.length === 1 ? [] : [], b = r.length >= 3 ? r[2] : r.length === 1 ? r[0] : null, v = r.length > 3 ? r.slice(3) : [], x = {
    position: "relative",
    background: a.scheme.background,
    color: a.scheme.color,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: p,
    paddingRight: p,
    boxSizing: "border-box",
    fontFamily: s
  }, z = {
    maxWidth: c,
    margin: "0 auto",
    width: "100%"
  }, S = {
    margin: 0,
    marginBottom: g,
    fontSize: "1.5rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  }, _ = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: g,
    marginBottom: b || v.length ? g : 0
  }, H = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: g,
    marginTop: b ? g : 0
  }, w = {
    display: "flex",
    gap: 16,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none"
  }, R = {
    flex: "0 0 min(85%, 320px)",
    scrollSnapAlign: "start"
  }, T = (P) => i === "template" ? `templates.${t}.sections.${e}.blocks.${P}.settings` : `sections.${e}.blocks.${P}.settings`, W = /* @__PURE__ */ m(ne, { children: [
    $.length > 0 ? /* @__PURE__ */ o("div", { style: _, children: $.map((P) => /* @__PURE__ */ o(
      st,
      {
        card: P,
        editorNodeId: d,
        blockBase: T(P.id),
        scheme: a.scheme,
        fontBody: s
      },
      P.id
    )) }) : null,
    b ? /* @__PURE__ */ o(
      st,
      {
        card: b,
        featured: !0,
        editorNodeId: d,
        blockBase: T(b.id),
        scheme: a.scheme,
        fontBody: s
      }
    ) : null,
    v.length > 0 ? /* @__PURE__ */ o("div", { style: H, children: v.map((P) => /* @__PURE__ */ o(
      st,
      {
        card: P,
        editorNodeId: d,
        blockBase: T(P.id),
        scheme: a.scheme,
        fontBody: s
      },
      P.id
    )) }) : null
  ] });
  return /* @__PURE__ */ o(G, { nodeId: d, label: "Blog posts: Editorial", children: /* @__PURE__ */ m(
    "section",
    {
      className: h,
      style: x,
      "data-section-type": "blog-posts-editorial",
      "data-carousel-mobile": a.carouselOnMobile ? "true" : "false",
      children: [
        /* @__PURE__ */ o("style", { children: `
            .${h} [data-mobile-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${h}[data-carousel-mobile="true"] [data-desktop-layout] { display: none !important; }
              .${h}[data-carousel-mobile="true"] [data-mobile-layout] { display: block !important; }
              .${h}[data-carousel-mobile="false"] [data-mobile-layout] { display: none !important; }
              .${h}[data-carousel-mobile="false"] [data-desktop-layout] {
                display: block !important;
              }
              .${h}[data-carousel-mobile="false"] [data-desktop-layout] > div:first-child {
                grid-template-columns: 1fr !important;
              }
            }
            @media (min-width: 750px) {
              .${h} [data-mobile-layout] { display: none !important; }
            }
            ${mr(e, a.customCss)}
          ` }),
        /* @__PURE__ */ m("div", { style: z, children: [
          /* @__PURE__ */ o("h2", { style: S, children: /* @__PURE__ */ o(k, { nodeId: d, fieldPath: `${u}.heading`, label: "Heading", children: a.heading }) }),
          /* @__PURE__ */ o("div", { "data-desktop-layout": !0, children: W }),
          /* @__PURE__ */ o("div", { "data-mobile-layout": !0, style: { display: "none" }, children: /* @__PURE__ */ o("div", { "data-mobile-track": !0, style: w, children: r.map((P) => /* @__PURE__ */ o("div", { style: R, children: /* @__PURE__ */ o(
            st,
            {
              card: P,
              editorNodeId: d,
              blockBase: T(P.id),
              scheme: a.scheme,
              fontBody: s
            }
          ) }, P.id)) }) })
        ] })
      ]
    }
  ) });
}
const fo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function fr(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.sectionWidth`, "page"), s = l(e, `${t}.mobileColumns`, "2");
  return {
    scheme: fo[i] ?? fo["scheme-1"],
    heading: l(e, `${t}.heading`),
    postCount: y(e, `${t}.postCount`, 3),
    columns: y(e, `${t}.columns`, 3),
    mobileColumns: s === "1" ? 1 : 2,
    horizontalGap: y(e, `${t}.horizontalGap`, 8),
    verticalGap: y(e, `${t}.verticalGap`, 8),
    carouselOnMobile: U(e, `${t}.carouselOnMobile`, !1),
    sectionWidth: n === "full" ? "full" : "page",
    layoutGap: y(e, `${t}.layoutGap`, 12),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function br(e, t) {
  const i = `.ziplofy-blog-posts-grid-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function bo({ card: e, editorNodeId: t, blockBase: i, scheme: n, fontBody: s }) {
  return /* @__PURE__ */ m("article", { "data-blog-card": !0, children: [
    /* @__PURE__ */ o("div", { style: {
      aspectRatio: "4 / 3",
      borderRadius: 8,
      background: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      marginBottom: 12
    }, children: e.imageUrl ? /* @__PURE__ */ o(
      "img",
      {
        src: e.imageUrl,
        alt: "",
        style: { width: "100%", height: "100%", objectFit: "cover" }
      }
    ) : /* @__PURE__ */ o(Ct, { variant: e.illustrationVariant }) }),
    /* @__PURE__ */ o(
      "h3",
      {
        style: {
          margin: 0,
          fontFamily: s,
          fontSize: "1rem",
          fontWeight: 700,
          lineHeight: 1.3,
          color: n.color
        },
        children: /* @__PURE__ */ o(k, { nodeId: `${t}:block:${e.id}`, fieldPath: `${i}.title`, label: "Title", children: e.title })
      }
    ),
    /* @__PURE__ */ m("p", { style: { margin: "4px 0 0", fontFamily: s, fontSize: "0.8125rem", color: n.muted }, children: [
      /* @__PURE__ */ o(k, { nodeId: `${t}:block:${e.id}`, fieldPath: `${i}.date`, label: "Date", children: e.date }),
      " | ",
      /* @__PURE__ */ o(k, { nodeId: `${t}:block:${e.id}`, fieldPath: `${i}.author`, label: "Author", children: e.author })
    ] }),
    /* @__PURE__ */ o(
      "p",
      {
        style: {
          margin: "8px 0 0",
          fontFamily: s,
          fontSize: "0.875rem",
          lineHeight: 1.45,
          color: n.color
        },
        children: /* @__PURE__ */ o(k, { nodeId: `${t}:block:${e.id}`, fieldPath: `${i}.excerpt`, label: "Excerpt", children: e.excerpt })
      }
    )
  ] });
}
function yr({
  sectionId: e = "blog_posts_grid",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s } = X(), u = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, d = i === "template" ? `template:${t}:${e}` : `layout:${e}`, a = F(() => fr(n, u), [n, u]), r = F(
    () => zt(n, t, e, i, a.postCount),
    [n, t, e, i, a.postCount]
  ), p = a.sectionWidth === "full" ? 24 : L.padX, c = a.sectionWidth === "full" ? "100%" : L.maxWidth, h = `ziplofy-blog-posts-grid-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = Math.max(1, Math.min(4, a.columns)), $ = {
    position: "relative",
    background: a.scheme.background,
    color: a.scheme.color,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: p,
    paddingRight: p,
    boxSizing: "border-box",
    fontFamily: s
  }, b = {
    maxWidth: c,
    margin: "0 auto",
    width: "100%"
  }, v = (S) => i === "template" ? `templates.${t}.sections.${e}.blocks.${S}.settings` : `sections.${e}.blocks.${S}.settings`, x = {
    display: "flex",
    gap: a.horizontalGap,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none"
  }, z = a.mobileColumns === 2 ? `calc(50% - ${a.horizontalGap / 2}px)` : `calc(100% - ${a.horizontalGap}px)`;
  return /* @__PURE__ */ o(G, { nodeId: d, label: "Blog posts: Grid", children: /* @__PURE__ */ m(
    "section",
    {
      className: h,
      style: $,
      "data-section-type": "blog-posts-grid",
      "data-carousel-mobile": a.carouselOnMobile ? "true" : "false",
      "data-mobile-columns": a.mobileColumns,
      children: [
        /* @__PURE__ */ o("style", { children: `
            .${h} [data-grid-desktop] {
              display: grid;
              grid-template-columns: repeat(${g}, minmax(0, 1fr));
              column-gap: ${a.horizontalGap}px;
              row-gap: ${a.verticalGap}px;
            }
            .${h} [data-mobile-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${h}[data-carousel-mobile="true"] [data-grid-desktop] { display: none !important; }
              .${h}[data-carousel-mobile="true"] [data-mobile-layout] { display: block !important; }
              .${h}[data-carousel-mobile="false"] [data-grid-desktop] {
                grid-template-columns: repeat(${a.mobileColumns}, minmax(0, 1fr)) !important;
              }
              .${h}[data-carousel-mobile="false"] [data-mobile-layout] { display: none !important; }
            }
            @media (min-width: 750px) {
              .${h} [data-mobile-layout] { display: none !important; }
            }
            ${br(e, a.customCss)}
          ` }),
        /* @__PURE__ */ m("div", { style: b, children: [
          /* @__PURE__ */ o(
            "h2",
            {
              style: {
                margin: 0,
                marginBottom: a.layoutGap,
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.02em"
              },
              children: /* @__PURE__ */ o(k, { nodeId: d, fieldPath: `${u}.heading`, label: "Heading", children: a.heading })
            }
          ),
          /* @__PURE__ */ o("div", { "data-grid-desktop": !0, children: r.map((S) => /* @__PURE__ */ o(
            bo,
            {
              card: S,
              editorNodeId: d,
              blockBase: v(S.id),
              scheme: a.scheme,
              fontBody: s
            },
            S.id
          )) }),
          /* @__PURE__ */ o("div", { "data-mobile-layout": !0, style: { display: "none" }, children: /* @__PURE__ */ o("div", { "data-mobile-track": !0, style: x, children: r.map((S) => /* @__PURE__ */ o(
            "div",
            {
              style: { flex: `0 0 ${z}`, minWidth: 0, scrollSnapAlign: "start" },
              children: /* @__PURE__ */ o(
                bo,
                {
                  card: S,
                  editorNodeId: d,
                  blockBase: v(S.id),
                  scheme: a.scheme,
                  fontBody: s
                }
              )
            },
            S.id
          )) }) })
        ] })
      ]
    }
  ) });
}
function xr() {
  return /* @__PURE__ */ o("div", { style: { position: "relative", height: 48, width: 44 }, "aria-hidden": !0, children: /* @__PURE__ */ o(
    "div",
    {
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 8,
        borderRadius: 4,
        background: "#4a9a9a",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)"
      }
    }
  ) });
}
const yo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function $r(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.navIcon`, "arrows"), s = l(e, `${t}.navIconBackground`, "none"), u = l(e, `${t}.sectionWidth`, "page"), d = l(e, `${t}.mobileColumns`, "1");
  return {
    scheme: yo[i] ?? yo["scheme-1"],
    heading: l(e, `${t}.heading`),
    columns: y(e, `${t}.columns`, 3),
    mobileColumns: d === "2" ? 2 : 1,
    sectionWidth: u === "full" ? "full" : "page",
    horizontalGap: y(e, `${t}.horizontalGap`, 12),
    navIcon: n === "chevron" ? "chevron" : n === "none" ? "none" : "arrows",
    navIconBackground: s === "circle" ? "circle" : s === "square" ? "square" : "none",
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function kr(e, t, i, n) {
  const u = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, d = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), a = K(e, u);
  if (!a || typeof a != "object") return [];
  const r = d.length ? d : Object.keys(a), p = "Made with care and unconditionally loved by our customers.";
  return r.map((c) => {
    const h = a[c]?.settings ?? {};
    return {
      id: c,
      title: String(h.title ?? ""),
      description: String(h.description ?? p),
      imageUrl: String(h.imageUrl ?? "")
    };
  });
}
function vr(e, t) {
  const i = `.ziplofy-storytelling-carousel-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function xo({
  label: e,
  onClick: t,
  background: i,
  shape: n
}) {
  return /* @__PURE__ */ o(
    "button",
    {
      type: "button",
      "aria-label": e,
      onClick: t,
      style: {
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: i === "none" ? 32 : 36,
        height: i === "none" ? 32 : 36,
        border: "none",
        cursor: "pointer",
        background: i === "circle" || i === "square" ? "rgba(255,255,255,0.95)" : "transparent",
        borderRadius: i === "circle" ? "50%" : i === "square" ? 6 : 0,
        boxShadow: i !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
        color: "#111827",
        fontSize: n === "chevron" ? 18 : 20,
        lineHeight: 1
      },
      children: n === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→"
    }
  );
}
function Sr({
  sectionId: e = "storytelling_carousel",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s } = X(), u = ot(null), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(
    () => $r(n, d),
    [n, d]
  ), p = F(
    () => kr(n, t, e, i),
    [n, t, e, i]
  ), c = r.sectionWidth === "full" ? 24 : L.padX, h = r.sectionWidth === "full" ? "100%" : L.maxWidth, g = `ziplofy-storytelling-carousel-${e.replace(/[^a-z0-9_-]/gi, "-")}`, $ = Math.max(1, Math.min(4, r.columns)), b = `calc((100% - ${($ - 1) * r.horizontalGap}px) / ${$})`, v = (w) => {
    const R = u.current;
    R && R.scrollBy({ left: R.clientWidth * 0.85 * w, behavior: "smooth" });
  }, x = r.navIcon !== "none" && p.length > $, z = {
    position: "relative",
    background: r.scheme.background,
    color: r.scheme.color,
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    paddingLeft: c,
    paddingRight: c,
    boxSizing: "border-box",
    fontFamily: s
  }, S = {
    maxWidth: h,
    margin: "0 auto",
    width: "100%"
  }, _ = {
    display: "flex",
    gap: r.horizontalGap,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    flex: 1
  }, H = {
    flex: `0 0 ${b}`,
    minWidth: 0,
    scrollSnapAlign: "start"
  };
  return /* @__PURE__ */ o(G, { nodeId: a, label: "Carousel", children: /* @__PURE__ */ m(
    "section",
    {
      className: g,
      style: z,
      "data-section-type": "storytelling-carousel",
      "data-mobile-columns": r.mobileColumns,
      children: [
        /* @__PURE__ */ o("style", { children: `
            .${g} [data-carousel-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${g}[data-mobile-columns="1"] [data-carousel-slide] {
                flex: 0 0 calc(100% - 8px);
              }
              .${g}[data-mobile-columns="2"] [data-carousel-slide] {
                flex: 0 0 calc(50% - ${r.horizontalGap / 2}px);
              }
            }
            ${vr(e, r.customCss)}
          ` }),
        /* @__PURE__ */ m("div", { style: S, children: [
          /* @__PURE__ */ o(
            "h2",
            {
              style: {
                margin: 0,
                marginBottom: 24,
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.02em"
              },
              children: /* @__PURE__ */ o(k, { nodeId: a, fieldPath: `${d}.heading`, label: "Heading", children: r.heading })
            }
          ),
          /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            x ? /* @__PURE__ */ o(
              xo,
              {
                label: "Previous",
                onClick: () => v(-1),
                background: r.navIconBackground,
                shape: r.navIcon
              }
            ) : null,
            /* @__PURE__ */ o("div", { ref: u, "data-carousel-track": !0, style: _, children: p.map((w) => {
              const R = i === "template" ? `templates.${t}.sections.${e}.blocks.${w.id}.settings` : `sections.${e}.blocks.${w.id}.settings`;
              return /* @__PURE__ */ m("article", { "data-carousel-slide": !0, style: H, children: [
                /* @__PURE__ */ o(
                  "div",
                  {
                    style: {
                      aspectRatio: "4 / 3",
                      borderRadius: 8,
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      marginBottom: 12
                    },
                    children: w.imageUrl ? /* @__PURE__ */ o(
                      "img",
                      {
                        src: w.imageUrl,
                        alt: "",
                        style: { width: "100%", height: "100%", objectFit: "cover" }
                      }
                    ) : /* @__PURE__ */ o(xr, {})
                  }
                ),
                /* @__PURE__ */ o(
                  "h3",
                  {
                    style: {
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: r.scheme.color
                    },
                    children: /* @__PURE__ */ o(
                      k,
                      {
                        nodeId: `${a}:block:${w.id}`,
                        fieldPath: `${R}.title`,
                        label: "Title",
                        children: w.title
                      }
                    )
                  }
                ),
                /* @__PURE__ */ o(
                  "p",
                  {
                    style: {
                      margin: "6px 0 0",
                      fontSize: "0.875rem",
                      lineHeight: 1.45,
                      color: r.scheme.muted
                    },
                    children: /* @__PURE__ */ o(
                      k,
                      {
                        nodeId: `${a}:block:${w.id}`,
                        fieldPath: `${R}.description`,
                        label: "Description",
                        children: w.description
                      }
                    )
                  }
                )
              ] }, w.id);
            }) }),
            x ? /* @__PURE__ */ o(
              xo,
              {
                label: "Next",
                onClick: () => v(1),
                background: r.navIconBackground,
                shape: r.navIcon
              }
            ) : null
          ] })
        ] })
      ]
    }
  ) });
}
const $o = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function wr(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.sectionWidth`, "page"), s = l(e, `${t}.sectionHeight`, "auto");
  return {
    scheme: $o[i] ?? $o["scheme-1"],
    heading: l(e, `${t}.heading`),
    imageUrl: l(e, `${t}.imageUrl`, ""),
    mediaOverlay: !!K(e, `${t}.mediaOverlay`),
    sectionWidth: n === "full" ? "full" : "page",
    sectionHeight: s === "small" || s === "medium" || s === "large" ? s : "auto",
    hotspotColor: l(e, `${t}.hotspotColor`, "#FFFFFF57"),
    innerColor: l(e, `${t}.innerColor`, "#FFFFFF"),
    popoverGap: y(e, `${t}.popoverGap`, 8),
    paddingTop: y(e, `${t}.paddingTop`, 40),
    paddingBottom: y(e, `${t}.paddingBottom`, 40),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function _r(e) {
  if (e === "small") return "320px";
  if (e === "medium") return "420px";
  if (e === "large") return "520px";
}
function Cr(e, t, i, n) {
  const u = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, d = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), a = K(e, u);
  return !a || typeof a != "object" ? [] : (d.length ? d : Object.keys(a)).map((p) => {
    const c = a[p]?.settings ?? {};
    return {
      id: p,
      positionX: Number(c.positionX ?? 50),
      positionY: Number(c.positionY ?? 50),
      productTitle: String(c.productTitle ?? ""),
      price: String(c.price ?? "")
    };
  });
}
function zr(e, t) {
  const i = `.ziplofy-product-hotspots-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function Wr() {
  return /* @__PURE__ */ m(ne, { children: [
    /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(244,162,97,0.9), rgba(231,111,81,0.8), rgba(38,70,83,0.95))"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "45%",
          background: "linear-gradient(to top, #1a3a4a, transparent)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "18%",
          height: 64,
          background: "rgba(45,90,74,0.6)",
          clipPath: "polygon(0% 100%, 8% 40%, 22% 70%, 38% 30%, 55% 55%, 72% 25%, 88% 50%, 100% 35%, 100% 100%)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          left: "18%",
          top: "52%",
          width: 56,
          height: 40,
          borderRadius: "999px 999px 0 0",
          background: "rgba(61,41,20,0.7)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          left: "22%",
          top: "48%",
          width: 40,
          height: 48,
          borderRadius: "999px 999px 0 0",
          background: "rgba(92,61,30,0.8)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          right: "20%",
          top: "50%",
          width: 44,
          height: 44,
          borderRadius: "999px 999px 0 0",
          background: "rgba(74,50,32,0.75)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          left: "50%",
          top: "8%",
          width: 56,
          height: 56,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)"
        }
      }
    )
  ] });
}
function Pr({
  sectionId: e = "product_hotspots",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), [d, a] = Z(null), r = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, p = i === "template" ? `template:${t}:${e}` : `layout:${e}`, c = F(
    () => wr(n, r),
    [n, r]
  ), h = F(
    () => Cr(n, t, e, i),
    [n, t, e, i]
  ), g = `ziplofy-product-hotspots-${e.replace(/[^a-z0-9_-]/gi, "-")}`, $ = zr(e, c.customCss), b = _r(c.sectionHeight), v = {
    paddingTop: c.paddingTop,
    paddingBottom: c.paddingBottom,
    background: c.scheme.background,
    color: c.scheme.color,
    fontFamily: s
  }, x = c.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 0, paddingRight: 0 } : { maxWidth: L.contentMaxWidth, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }, z = {
    position: "relative",
    width: "100%",
    aspectRatio: b ? void 0 : "4 / 3",
    minHeight: b,
    borderRadius: 12,
    overflow: "hidden",
    background: "#1e3a5f",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
  }, S = `${r}.heading`;
  return /* @__PURE__ */ m(G, { sectionId: e, label: "Product hotspots", editorNodeId: p, style: v, children: [
    $ ? /* @__PURE__ */ o("style", { children: $ }) : null,
    /* @__PURE__ */ m("div", { className: g, style: x, children: [
      /* @__PURE__ */ o(k, { fieldPath: S, label: "Heading", as: "h2", style: { margin: "0 0 20px", fontSize: 28, fontWeight: 700, fontFamily: u }, children: c.heading }),
      /* @__PURE__ */ m("div", { style: z, children: [
        c.imageUrl ? /* @__PURE__ */ o(
          "img",
          {
            src: c.imageUrl,
            alt: "",
            style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
          }
        ) : /* @__PURE__ */ o(Wr, {}),
        c.mediaOverlay ? /* @__PURE__ */ o(
          "div",
          {
            "aria-hidden": !0,
            style: {
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35))"
            }
          }
        ) : null,
        h.map((_) => {
          const H = i === "template" ? `template:${t}:${e}:block:${_.id}` : `layout:${e}:block:${_.id}`, w = d === _.id, R = {
            position: "relative",
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: `2px solid ${c.innerColor}`,
            background: c.hotspotColor,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 0 12px rgba(255,255,255,0.35)",
            cursor: "pointer",
            padding: 0
          }, T = {
            position: "absolute",
            left: "50%",
            top: "100%",
            transform: "translateX(-50%)",
            marginTop: c.popoverGap,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.96)",
            color: "#111827",
            boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
            whiteSpace: "nowrap",
            fontSize: 13,
            pointerEvents: "none"
          };
          return /* @__PURE__ */ o(
            E,
            {
              nodeId: H,
              label: "Hotspot",
              style: {
                position: "absolute",
                left: `${_.positionX}%`,
                top: `${_.positionY}%`,
                transform: "translate(-50%, -50%)",
                zIndex: w ? 12 : 10
              },
              children: /* @__PURE__ */ m(
                "button",
                {
                  type: "button",
                  "aria-label": _.productTitle,
                  style: R,
                  onMouseEnter: () => a(_.id),
                  onMouseLeave: () => a((W) => W === _.id ? null : W),
                  onFocus: () => a(_.id),
                  onBlur: () => a((W) => W === _.id ? null : W),
                  children: [
                    /* @__PURE__ */ o(
                      "span",
                      {
                        "aria-hidden": !0,
                        style: {
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          width: 8,
                          height: 8,
                          transform: "translate(-50%, -50%)",
                          borderRadius: "50%",
                          background: c.innerColor
                        }
                      }
                    ),
                    w ? /* @__PURE__ */ m("span", { style: T, children: [
                      /* @__PURE__ */ o("span", { style: { fontWeight: 600 }, children: _.productTitle }),
                      /* @__PURE__ */ o("span", { style: { color: "#6b7280", fontSize: 12 }, children: _.price })
                    ] }) : null
                  ]
                }
              )
            },
            _.id
          );
        })
      ] })
    ] })
  ] });
}
function Tr({
  shirtColor: e,
  withSun: t = !1
}) {
  return /* @__PURE__ */ o(
    "div",
    {
      style: {
        position: "relative",
        width: "72%",
        maxWidth: 120,
        aspectRatio: "1",
        margin: "0 auto",
        borderRadius: 8,
        background: "#f4f4f4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      "aria-hidden": !0,
      children: /* @__PURE__ */ m(
        "div",
        {
          style: {
            position: "relative",
            width: "58%",
            height: "68%",
            borderRadius: "8px 8px 4px 4px",
            background: e,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
          },
          children: [
            /* @__PURE__ */ o(
              "div",
              {
                style: {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: "14%",
                  background: "rgba(0,0,0,0.1)"
                }
              }
            ),
            t ? /* @__PURE__ */ o(
              "div",
              {
                style: {
                  position: "absolute",
                  right: "8%",
                  top: "12%",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#fbbf24"
                }
              }
            ) : null
          ]
        }
      )
    }
  );
}
const ko = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function Hr(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.cardStyle`, "grid"), s = l(e, `${t}.sectionWidth`, "page"), u = l(e, `${t}.mobileColumns`, "2");
  return {
    scheme: ko[i] ?? ko["scheme-1"],
    heading: l(e, `${t}.heading`),
    cardStyle: n === "carousel" ? "carousel" : "grid",
    carouselOnMobile: !!K(e, `${t}.carouselOnMobile`),
    productCount: y(e, `${t}.productCount`, 4),
    columns: y(e, `${t}.columns`, 4),
    mobileColumns: u === "1" ? 1 : 2,
    horizontalGap: y(e, `${t}.horizontalGap`, 12),
    verticalGap: y(e, `${t}.verticalGap`, 24),
    sectionWidth: s === "full" ? "full" : "page",
    layoutGap: y(e, `${t}.layoutGap`, 28),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function Rr(e, t, i, n, s) {
  const d = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, a = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), r = K(e, d);
  if (!r || typeof r != "object") return [];
  const p = a.length ? a : Object.keys(r), c = Math.max(1, Math.min(12, s));
  return p.slice(0, c).map((h) => {
    const g = r[h]?.settings ?? {};
    return {
      id: h,
      shirtColor: String(g.shirtColor ?? "#d45454"),
      withSun: !!g.withSun,
      productTitle: String(g.productTitle ?? ""),
      price: String(g.price ?? "")
    };
  });
}
function Lr(e, t) {
  const i = `.ziplofy-recommended-products-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function vo({
  label: e,
  onClick: t,
  background: i,
  shape: n
}) {
  return /* @__PURE__ */ o(
    "button",
    {
      type: "button",
      "aria-label": e,
      onClick: t,
      style: {
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: i === "none" ? 32 : 36,
        height: i === "none" ? 32 : 36,
        border: "none",
        cursor: "pointer",
        background: i === "circle" || i === "square" ? "rgba(255,255,255,0.95)" : "transparent",
        borderRadius: i === "circle" ? "50%" : i === "square" ? 6 : 0,
        boxShadow: i !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
        color: "#111827",
        fontSize: n === "chevron" ? 18 : 20,
        lineHeight: 1
      },
      children: n === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→"
    }
  );
}
function Mr({
  sectionId: e = "recommended_products",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), d = ot(null), a = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, r = i === "template" ? `template:${t}:${e}` : `layout:${e}`, p = F(
    () => Hr(n, a),
    [n, a]
  ), c = F(
    () => Rr(
      n,
      t,
      e,
      i,
      p.productCount
    ),
    [n, t, e, i, p.productCount]
  ), h = p.cardStyle === "carousel", g = `ziplofy-recommended-products-${e.replace(/[^a-z0-9_-]/gi, "-")}`, $ = Lr(e, p.customCss), b = F(
    () => `
[data-ziplofy-section="${e}"] .rp-product-grid {
  display: ${h ? "flex" : "grid"};
  ${h ? "flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;" : `grid-template-columns: repeat(${p.columns}, minmax(0, 1fr));`}
  column-gap: ${p.horizontalGap}px;
  row-gap: ${p.verticalGap}px;
}
[data-ziplofy-section="${e}"] .rp-product-grid::-webkit-scrollbar { display: none; }
[data-ziplofy-section="${e}"] .rp-product-grid > article {
  ${h ? `flex: 0 0 calc((100% - ${(p.columns - 1) * p.horizontalGap}px) / ${p.columns}); min-width: 0; scroll-snap-align: start;` : ""}
}
@media (max-width: 749px) {
  [data-ziplofy-section="${e}"] .rp-product-grid {
    ${p.carouselOnMobile || h ? "display: flex; flex-wrap: nowrap; overflow-x: auto; grid-template-columns: unset;" : `grid-template-columns: repeat(${p.mobileColumns}, minmax(0, 1fr));`}
  }
  [data-ziplofy-section="${e}"][data-mobile-columns="1"] .rp-product-grid > article {
    flex: 0 0 calc(100% - 8px);
  }
  [data-ziplofy-section="${e}"][data-mobile-columns="2"] .rp-product-grid > article {
    flex: 0 0 calc(50% - ${p.horizontalGap / 2}px);
  }
}
`,
    [
      e,
      h,
      p.columns,
      p.horizontalGap,
      p.verticalGap,
      p.mobileColumns,
      p.carouselOnMobile
    ]
  ), v = {
    paddingTop: p.paddingTop,
    paddingBottom: p.paddingBottom,
    background: p.scheme.background,
    color: p.scheme.color,
    fontFamily: s
  }, x = p.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 0, paddingRight: 0 } : {
    maxWidth: L.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, z = `${a}.heading`, S = (_) => {
    const H = d.current;
    H && H.scrollBy({ left: _ * H.clientWidth * 0.85, behavior: "smooth" });
  };
  return /* @__PURE__ */ m(
    G,
    {
      sectionId: e,
      label: "Recommended products",
      editorNodeId: r,
      style: v,
      children: [
        $ ? /* @__PURE__ */ o("style", { children: $ }) : null,
        /* @__PURE__ */ o("style", { children: b }),
        /* @__PURE__ */ m(
          "div",
          {
            className: g,
            style: x,
            "data-mobile-columns": String(p.mobileColumns),
            "data-rp-carousel": h || p.carouselOnMobile ? "true" : "false",
            children: [
              /* @__PURE__ */ o(
                k,
                {
                  fieldPath: z,
                  label: "Heading",
                  as: "h2",
                  style: {
                    margin: `0 0 ${p.layoutGap}px`,
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: u
                  },
                  children: p.heading
                }
              ),
              /* @__PURE__ */ m("div", { style: { position: "relative" }, children: [
                h ? /* @__PURE__ */ m(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      right: 0,
                      top: -52,
                      display: "flex",
                      gap: 8,
                      zIndex: 2
                    },
                    children: [
                      /* @__PURE__ */ o(vo, { label: "Previous", onClick: () => S(-1), background: "circle", shape: "arrows" }),
                      /* @__PURE__ */ o(vo, { label: "Next", onClick: () => S(1), background: "circle", shape: "arrows" })
                    ]
                  }
                ) : null,
                /* @__PURE__ */ o("div", { ref: d, className: "rp-product-grid", children: c.map((_) => {
                  const H = i === "template" ? `templates.${t}.sections.${e}.blocks.${_.id}.settings` : `sections.${e}.blocks.${_.id}.settings`, w = i === "template" ? `template:${t}:${e}:block:${_.id}` : `layout:${e}:block:${_.id}`;
                  return /* @__PURE__ */ o(E, { nodeId: w, label: "Product card", style: {
                    margin: 0,
                    minWidth: 0
                  }, children: /* @__PURE__ */ m("article", { children: [
                    /* @__PURE__ */ o(Tr, { shirtColor: _.shirtColor, withSun: _.withSun }),
                    /* @__PURE__ */ o(
                      "p",
                      {
                        style: {
                          margin: "10px 0 0",
                          fontSize: 14,
                          fontWeight: 500,
                          color: p.scheme.color,
                          textAlign: "center"
                        },
                        children: /* @__PURE__ */ o(k, { fieldPath: `${H}.productTitle`, label: "Product title", children: _.productTitle })
                      }
                    ),
                    /* @__PURE__ */ o(
                      "p",
                      {
                        style: {
                          margin: "2px 0 0",
                          fontSize: 13,
                          color: p.scheme.muted,
                          textAlign: "center"
                        },
                        children: /* @__PURE__ */ o(k, { fieldPath: `${H}.price`, label: "Price", children: _.price })
                      }
                    )
                  ] }) }, _.id);
                }) })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function Fr() {
  return /* @__PURE__ */ m("div", { style: { position: "relative", width: 118, height: 96, margin: "0 auto" }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          left: "6%",
          top: "20%",
          width: 50,
          height: 68,
          transform: "rotate(-8deg)",
          borderRadius: 4,
          background: "#5a9a6a",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          clipPath: "polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          left: "30%",
          top: "12%",
          width: 52,
          height: 72,
          transform: "rotate(4deg)",
          borderRadius: 4,
          background: "#e8c547",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          clipPath: "polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          right: "4%",
          top: "24%",
          width: 48,
          height: 66,
          transform: "rotate(10deg)",
          borderRadius: 4,
          background: "#d45454",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          clipPath: "polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)"
        }
      }
    )
  ] });
}
const So = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function Er(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.catalogVariant`, "collection-links-spotlight"), s = l(e, `${t}.layoutMode`, "spotlight"), u = n === "collection-links-text" || s === "text" ? "text" : "spotlight", d = l(e, `${t}.sectionWidth`, "page"), a = l(e, `${t}.alignment`, "left"), r = l(e, `${t}.imagePosition`, "right");
  return {
    scheme: So[i] ?? So["scheme-1"],
    layoutMode: u,
    sectionWidth: d === "full" ? "full" : "page",
    alignment: a === "center" ? "center" : a === "right" ? "right" : "left",
    imagePosition: r === "left" ? "left" : "right",
    imageUrl: l(e, `${t}.imageUrl`, ""),
    paddingTop: y(e, `${t}.paddingTop`, 40),
    paddingBottom: y(e, `${t}.paddingBottom`, 40),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function Ar(e, t, i, n) {
  const u = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, d = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), a = K(e, u);
  return !a || typeof a != "object" ? [] : (d.length ? d : Object.keys(a)).map((p) => {
    const c = a[p]?.settings ?? {};
    return {
      id: p,
      title: String(c.title ?? ""),
      productCount: Number(c.productCount ?? 5),
      href: String(c.href ?? "")
    };
  });
}
function Ur(e, t) {
  const i = `.ziplofy-collection-links-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function Nr(e) {
  return e === "center" ? "center" : e === "right" ? "right" : "left";
}
function wo({
  sectionId: e = "collection_links_spotlight",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s } = X(), u = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, d = i === "template" ? `template:${t}:${e}` : `layout:${e}`, a = F(
    () => Er(n, u),
    [n, u]
  ), r = l(n, `${u}.catalogVariant`, "collection-links-spotlight"), p = a.layoutMode === "text" || r === "collection-links-text" ? "Collection links: Text" : "Collection links: Spotlight", c = F(
    () => Ar(n, t, e, i),
    [n, t, e, i]
  ), h = `ziplofy-collection-links-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = Ur(e, a.customCss), $ = Nr(a.alignment), b = a.layoutMode === "text", v = {
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    background: a.scheme.background,
    color: a.scheme.color,
    fontFamily: s
  }, x = a.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 0, paddingRight: 0 } : {
    maxWidth: L.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, z = {
    margin: 0,
    fontSize: b ? 18 : 22,
    fontWeight: 500,
    lineHeight: 1.25,
    color: a.scheme.color,
    textDecoration: "none",
    textAlign: $
  }, S = /* @__PURE__ */ o(
    "div",
    {
      style: b ? {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        columnGap: 48,
        rowGap: 24,
        maxWidth: 560,
        margin: "0 auto",
        justifyItems: a.alignment === "center" ? "center" : a.alignment === "right" ? "end" : "start"
      } : {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 20,
        alignItems: a.alignment === "center" ? "center" : a.alignment === "right" ? "flex-end" : "flex-start"
      },
      children: c.map((w) => {
        const R = i === "template" ? `templates.${t}.sections.${e}.blocks.${w.id}.settings` : `sections.${e}.blocks.${w.id}.settings`, T = i === "template" ? `template:${t}:${e}:block:${w.id}` : `layout:${e}:block:${w.id}`;
        return /* @__PURE__ */ o(E, { nodeId: T, label: "Collection link", children: /* @__PURE__ */ m(I, { to: w.href, style: z, children: [
          /* @__PURE__ */ o(k, { fieldPath: `${R}.title`, label: "Title", children: w.title }),
          /* @__PURE__ */ o(
            "sup",
            {
              style: {
                marginLeft: 4,
                fontSize: "0.65em",
                fontWeight: 400,
                color: a.scheme.muted
              },
              children: /* @__PURE__ */ o(k, { fieldPath: `${R}.productCount`, label: "Product count", children: w.productCount })
            }
          )
        ] }) }, w.id);
      })
    }
  ), _ = /* @__PURE__ */ o(
    "div",
    {
      style: {
        flex: "1 1 52%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ececec",
        minHeight: 280,
        padding: 24
      },
      children: a.imageUrl ? /* @__PURE__ */ o(
        "img",
        {
          src: a.imageUrl,
          alt: "",
          style: { maxWidth: "100%", maxHeight: 240, objectFit: "contain" }
        }
      ) : /* @__PURE__ */ o(Fr, {})
    }
  ), H = /* @__PURE__ */ o(
    "div",
    {
      style: {
        flex: "1 1 48%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px 32px",
        borderRight: a.imagePosition === "right" ? "1px solid #f3f4f6" : void 0,
        borderLeft: a.imagePosition === "left" ? "1px solid #f3f4f6" : void 0
      },
      children: S
    }
  );
  return /* @__PURE__ */ m(
    G,
    {
      sectionId: e,
      label: p,
      editorNodeId: d,
      style: v,
      children: [
        g ? /* @__PURE__ */ o("style", { children: g }) : null,
        /* @__PURE__ */ o("div", { className: h, style: x, children: b ? S : /* @__PURE__ */ m(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: a.imagePosition === "left" ? "row-reverse" : "row",
              minHeight: 280,
              overflow: "hidden",
              borderRadius: 2
            },
            children: [
              H,
              _
            ]
          }
        ) })
      ]
    }
  );
}
function Or() {
  return /* @__PURE__ */ m("div", { style: { position: "relative", width: 64, height: 52, margin: "0 auto" }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          left: "4%",
          top: "18%",
          width: 28,
          height: 38,
          transform: "rotate(-8deg)",
          borderRadius: 4,
          background: "#5a9a6a",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          clipPath: "polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          left: "28%",
          top: "10%",
          width: 28,
          height: 40,
          transform: "rotate(4deg)",
          borderRadius: 4,
          background: "#e8c547",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          clipPath: "polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          right: "2%",
          top: "22%",
          width: 26,
          height: 36,
          transform: "rotate(10deg)",
          borderRadius: 4,
          background: "#d45454",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          clipPath: "polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)"
        }
      }
    )
  ] });
}
function Gr() {
  return /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6 }, "aria-hidden": !0, children: ["#6b7280", "#c44d4d", "#4a9a9a"].map((e, t) => /* @__PURE__ */ m("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" }, children: [
    /* @__PURE__ */ o("div", { style: { marginBottom: 2, width: 20, height: 2, borderRadius: 999, background: "#6b7280" } }),
    /* @__PURE__ */ o("div", { style: { width: 24, height: 36, borderRadius: "4px 4px 2px 2px", background: e } })
  ] }, t)) });
}
function jr() {
  return /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 8 }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o("div", { style: { width: 28, height: 44, borderRadius: "8px 8px 4px 4px", background: "#9ca3af" } }),
    /* @__PURE__ */ o("div", { style: { width: 28, height: 44, borderRadius: "8px 8px 4px 4px", background: "#e8c547" } }),
    /* @__PURE__ */ o("div", { style: { width: 28, height: 44, borderRadius: "8px 8px 4px 4px", background: "#5ba8a8" } })
  ] });
}
function Dr({ wide: e = !1 }) {
  return e ? /* @__PURE__ */ m("div", { style: { position: "relative", width: 128, height: 56, margin: "0 auto" }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o("div", { style: { position: "absolute", bottom: 12, left: 4, right: 4, height: 1, background: "#6b7280" } }),
    /* @__PURE__ */ o("div", { style: { position: "absolute", bottom: 12, left: "50%", width: 1, height: 36, transform: "translateX(-50%)", background: "#6b7280" } }),
    /* @__PURE__ */ o("div", { style: { position: "absolute", top: 8, left: 16, width: 16, height: 24, borderRadius: 4, background: "#d45454" } }),
    /* @__PURE__ */ o("div", { style: { position: "absolute", top: 8, left: "50%", width: 16, height: 24, transform: "translateX(-50%)", borderRadius: 4, background: "#e8c547" } }),
    /* @__PURE__ */ o("div", { style: { position: "absolute", top: 8, right: 16, width: 16, height: 24, borderRadius: 4, background: "#9ca3af" } })
  ] }) : /* @__PURE__ */ m("div", { style: { position: "relative", width: 56, height: 48, margin: "0 auto" }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o("div", { style: { position: "absolute", bottom: 8, left: 0, right: 0, height: 1, background: "#6b7280" } }),
    /* @__PURE__ */ o("div", { style: { position: "absolute", bottom: 8, left: "50%", width: 1, height: 32, transform: "translateX(-50%)", background: "#6b7280" } }),
    /* @__PURE__ */ o("div", { style: { position: "absolute", top: 4, left: 6, width: 12, height: 20, borderRadius: 4, background: "#d45454" } }),
    /* @__PURE__ */ o("div", { style: { position: "absolute", top: 4, left: "50%", width: 12, height: 20, transform: "translateX(-50%)", borderRadius: 4, background: "#e8c547" } }),
    /* @__PURE__ */ o("div", { style: { position: "absolute", top: 4, right: 6, width: 12, height: 20, borderRadius: 4, background: "#9ca3af" } })
  ] });
}
function pt({
  variant: e,
  wide: t = !1
}) {
  switch (e) {
    case "hanger-shirts":
      return /* @__PURE__ */ o(Gr, {});
    case "hanging-sweaters":
      return /* @__PURE__ */ o(jr, {});
    case "clothing-rack":
      return /* @__PURE__ */ o(Dr, { wide: t });
    default:
      return /* @__PURE__ */ o(Or, {});
  }
}
const _o = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function Br(e) {
  return e === "hanger-shirts" || e === "hanging-sweaters" || e === "clothing-rack" || e === "folded-shirts" ? e : "folded-shirts";
}
function Xr(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.cardsLayoutType`), s = l(e, `${t}.sectionWidth`, "page");
  return {
    scheme: _o[i] ?? _o["scheme-1"],
    heading: l(e, `${t}.heading`),
    cardsLayoutType: n === "carousel" || n === "editorial" || n === "grid" ? n : "bento",
    carouselOnMobile: !!K(e, `${t}.carouselOnMobile`),
    cardsGap: y(e, `${t}.cardsGap`, 8),
    sectionWidth: s === "full" ? "full" : "page",
    layoutGap: y(e, `${t}.layoutGap`, 12),
    paddingTop: y(e, `${t}.paddingTop`, 24),
    paddingBottom: y(e, `${t}.paddingBottom`, 24),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function mt(e, t, i, n) {
  const u = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, d = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), a = K(e, u);
  return !a || typeof a != "object" ? [] : (d.length ? d : Object.keys(a)).map((p) => {
    const c = a[p]?.settings ?? {}, h = Number(c.columnSpan ?? 1);
    return {
      id: p,
      title: String(c.title ?? ""),
      href: String(c.href ?? ""),
      illustrationVariant: Br(String(c.illustrationVariant ?? "folded-shirts")),
      columnSpan: h === 2 ? 2 : 1,
      imageUrl: String(c.imageUrl ?? "")
    };
  });
}
function qr(e, t) {
  const i = `.ziplofy-collection-list-bento-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function Ir({
  tile: e,
  gap: t,
  blockBase: i,
  blockNodeId: n,
  fontBody: s
}) {
  const u = e.columnSpan === 2 ? 2 : 1, d = {
    gridColumn: `span ${u}`,
    minHeight: u === 2 ? 120 : 140,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 8,
    background: "#ececec"
  };
  return /* @__PURE__ */ o(E, { nodeId: n, label: "Collection", style: d, children: /* @__PURE__ */ m(
    I,
    {
      to: e.href,
      style: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit"
      },
      children: [
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: t
            },
            children: e.imageUrl ? /* @__PURE__ */ o(
              "img",
              {
                src: e.imageUrl,
                alt: "",
                style: { width: "100%", height: "100%", objectFit: "cover" }
              }
            ) : /* @__PURE__ */ o(
              pt,
              {
                variant: e.illustrationVariant,
                wide: u === 2
              }
            )
          }
        ),
        /* @__PURE__ */ o(
          "p",
          {
            style: {
              margin: 0,
              padding: "10px 12px",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: s,
              color: "#111827"
            },
            children: /* @__PURE__ */ o(k, { fieldPath: `${i}.title`, label: "Title", children: e.title })
          }
        )
      ]
    }
  ) });
}
function Vr({
  sectionId: e = "collection_list_bento",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(
    () => Xr(n, d),
    [n, d]
  ), p = F(
    () => mt(n, t, e, i),
    [n, t, e, i]
  ), c = `ziplofy-collection-list-bento-${e.replace(/[^a-z0-9_-]/gi, "-")}`, h = qr(e, r.customCss), g = {
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    background: r.scheme.background,
    color: r.scheme.color,
    fontFamily: s
  }, $ = r.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 0, paddingRight: 0 } : {
    maxWidth: L.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, b = `${d}.heading`, v = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gridTemplateRows: "repeat(2, minmax(120px, auto))",
    gap: r.cardsGap
  };
  return /* @__PURE__ */ m(
    G,
    {
      sectionId: e,
      label: "Collection list: Bento",
      editorNodeId: a,
      style: g,
      children: [
        h ? /* @__PURE__ */ o("style", { children: h }) : null,
        /* @__PURE__ */ m("div", { className: c, style: $, children: [
          /* @__PURE__ */ o(
            k,
            {
              fieldPath: b,
              label: "Heading",
              as: "h2",
              style: {
                margin: `0 0 ${r.layoutGap}px`,
                fontSize: 28,
                fontWeight: 700,
                fontFamily: u
              },
              children: r.heading
            }
          ),
          /* @__PURE__ */ o("div", { style: v, children: p.map((x) => {
            const z = i === "template" ? `templates.${t}.sections.${e}.blocks.${x.id}.settings` : `sections.${e}.blocks.${x.id}.settings`, S = i === "template" ? `template:${t}:${e}:block:${x.id}` : `layout:${e}:block:${x.id}`;
            return /* @__PURE__ */ o(
              Ir,
              {
                tile: x,
                gap: r.cardsGap,
                blockBase: z,
                blockNodeId: S,
                fontBody: s
              },
              x.id
            );
          }) })
        ] })
      ]
    }
  );
}
const Co = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function Kr(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.navigationIcon`, "arrows"), s = l(e, `${t}.navigationIconBackground`, "circle"), u = l(e, `${t}.sectionWidth`, "page"), d = l(e, `${t}.mobileColumns`, "1");
  return {
    scheme: Co[i] ?? Co["scheme-1"],
    heading: l(e, `${t}.heading`),
    columns: Math.min(6, Math.max(1, y(e, `${t}.columns`, 3))),
    mobileColumns: d === "2" ? 2 : 1,
    horizontalGap: y(e, `${t}.horizontalGap`, 8),
    navigationIcon: n === "chevron" || n === "none" ? n : "arrows",
    navigationIconBackground: s === "square" || s === "none" ? s : "circle",
    sectionWidth: u === "full" ? "full" : "page",
    layoutGap: y(e, `${t}.layoutGap`, 12),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function Yr(e, t) {
  const i = `.ziplofy-collection-list-carousel-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function zo({
  label: e,
  onClick: t,
  background: i,
  shape: n
}) {
  return /* @__PURE__ */ o("button", { type: "button", "aria-label": e, onClick: t, style: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: i === "none" ? 32 : 36,
    height: i === "none" ? 32 : 36,
    border: "none",
    cursor: "pointer",
    background: i === "circle" || i === "square" ? "rgba(255,255,255,0.95)" : "transparent",
    borderRadius: i === "circle" ? "50%" : i === "square" ? 6 : 0,
    boxShadow: i !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
    color: "#111827",
    fontSize: n === "chevron" ? 18 : 20,
    lineHeight: 1
  }, children: n === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→" });
}
function Zr({
  sectionId: e = "collection_list_carousel",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), d = ot(null), a = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, r = i === "template" ? `template:${t}:${e}` : `layout:${e}`, p = F(
    () => Kr(n, a),
    [n, a]
  ), c = F(
    () => mt(n, t, e, i),
    [n, t, e, i]
  ), h = `ziplofy-collection-list-carousel-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = (p.sectionWidth === "full", 24), $ = p.sectionWidth === "full" ? "100%" : L.contentMaxWidth, b = p.columns > 0 ? `calc((100% - ${(p.columns - 1) * p.horizontalGap}px) / ${p.columns})` : "200px", v = (W) => {
    const P = d.current;
    P && P.scrollBy({ left: P.clientWidth * 0.85 * W, behavior: "smooth" });
  }, x = p.navigationIcon !== "none" && c.length > p.columns, z = {
    background: p.scheme.background,
    color: p.scheme.color,
    paddingTop: p.paddingTop,
    paddingBottom: p.paddingBottom,
    paddingLeft: g,
    paddingRight: g,
    fontFamily: s,
    boxSizing: "border-box"
  }, S = {
    maxWidth: $,
    margin: "0 auto",
    width: "100%"
  }, _ = {
    display: "flex",
    alignItems: "center",
    gap: 8
  }, H = {
    display: "flex",
    gap: p.horizontalGap,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    flex: 1,
    paddingBottom: 4
  }, w = {
    flex: `0 0 ${b}`,
    minWidth: 0,
    scrollSnapAlign: "start"
  }, R = {
    aspectRatio: "1",
    borderRadius: 8,
    background: "#ececec",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 10
  }, T = {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.3,
    color: "#111827"
  };
  return /* @__PURE__ */ o(G, { sectionId: e, label: "Collection list: Carousel", editorNodeId: r, style: z, children: /* @__PURE__ */ m("div", { className: h, style: S, "data-mobile-columns": p.mobileColumns, children: [
    /* @__PURE__ */ o("style", { children: `
            .${h} [data-carousel-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${h}[data-mobile-columns="1"] [data-collection-card] {
                flex: 0 0 calc(100% - 8px);
              }
              .${h}[data-mobile-columns="2"] [data-collection-card] {
                flex: 0 0 calc(50% - ${p.horizontalGap / 2}px);
              }
            }
            ${Yr(e, p.customCss)}
          ` }),
    /* @__PURE__ */ o(
      k,
      {
        fieldPath: `${a}.heading`,
        label: "Heading",
        as: "h2",
        style: {
          margin: `0 0 ${p.layoutGap}px`,
          fontSize: 28,
          fontWeight: 700,
          fontFamily: u
        },
        children: p.heading
      }
    ),
    /* @__PURE__ */ m("div", { style: _, children: [
      x ? /* @__PURE__ */ o(
        zo,
        {
          label: "Previous",
          onClick: () => v(-1),
          background: p.navigationIconBackground,
          shape: p.navigationIcon === "chevron" ? "chevron" : "arrows"
        }
      ) : null,
      /* @__PURE__ */ o("div", { ref: d, "data-carousel-track": !0, style: H, children: c.map((W) => {
        const P = i === "template" ? `templates.${t}.sections.${e}.blocks.${W.id}.settings` : `sections.${e}.blocks.${W.id}.settings`, C = i === "template" ? `template:${t}:${e}:block:${W.id}` : `layout:${e}:block:${W.id}`;
        return /* @__PURE__ */ o(E, { nodeId: C, label: "Collection", style: w, children: /* @__PURE__ */ o("div", { "data-collection-card": !0, children: /* @__PURE__ */ m(
          I,
          {
            to: W.href,
            style: { display: "block", textDecoration: "none", color: "inherit" },
            children: [
              /* @__PURE__ */ o("div", { style: R, children: W.imageUrl ? /* @__PURE__ */ o(
                "img",
                {
                  src: W.imageUrl,
                  alt: "",
                  style: { width: "100%", height: "100%", objectFit: "cover" }
                }
              ) : /* @__PURE__ */ o(
                pt,
                {
                  variant: W.illustrationVariant
                }
              ) }),
              /* @__PURE__ */ o("p", { style: T, children: /* @__PURE__ */ o(k, { fieldPath: `${P}.title`, label: "Title", children: W.title }) })
            ]
          }
        ) }) }, W.id);
      }) }),
      x ? /* @__PURE__ */ o(
        zo,
        {
          label: "Next",
          onClick: () => v(1),
          background: p.navigationIconBackground,
          shape: p.navigationIcon === "chevron" ? "chevron" : "arrows"
        }
      ) : null
    ] })
  ] }) });
}
const Wo = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function Qr(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.sectionWidth`, "page");
  return {
    scheme: Wo[i] ?? Wo["scheme-1"],
    heading: l(e, `${t}.heading`),
    collectionCount: Math.min(8, Math.max(1, y(e, `${t}.collectionCount`, 4))),
    carouselOnMobile: !!K(e, `${t}.carouselOnMobile`),
    sectionWidth: n === "full" ? "full" : "page",
    layoutGap: y(e, `${t}.layoutGap`, 64),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function Jr(e, t) {
  const i = `.ziplofy-collection-list-editorial-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function ea(e) {
  const t = e % 4;
  return t === 0 ? { gridColumn: "1", marginTop: 0, minHeight: 200, wideIllustration: !1 } : t === 1 ? { gridColumn: "2", marginTop: 56, minHeight: 200, wideIllustration: !1 } : { gridColumn: "1 / -1", marginTop: 0, minHeight: t === 2 ? 160 : 180, wideIllustration: !0 };
}
function ta({
  sectionId: e = "collection_list_editorial",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(
    () => Qr(n, d),
    [n, d]
  ), p = F(
    () => mt(n, t, e, i),
    [n, t, e, i]
  ), c = F(
    () => p.slice(0, r.collectionCount),
    [p, r.collectionCount]
  ), h = `ziplofy-collection-list-editorial-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = {
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    background: r.scheme.background,
    color: r.scheme.color,
    fontFamily: s
  }, $ = r.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 24, paddingRight: 24 } : {
    maxWidth: L.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, b = {
    display: "grid",
    gridTemplateColumns: "0.85fr 1.25fr",
    gap: r.layoutGap,
    alignItems: "start"
  }, v = r.carouselOnMobile;
  return /* @__PURE__ */ o(
    G,
    {
      sectionId: e,
      label: "Collection list: Editorial",
      editorNodeId: a,
      style: g,
      children: /* @__PURE__ */ m(
        "div",
        {
          className: h,
          style: $,
          "data-editorial-carousel": v ? "true" : "false",
          children: [
            /* @__PURE__ */ o("style", { children: `
            @media (max-width: 749px) {
              .${h}[data-editorial-carousel="true"] [data-editorial-grid] {
                display: flex;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                gap: 16px;
                padding-bottom: 4px;
              }
              .${h}[data-editorial-carousel="true"] [data-editorial-grid]::-webkit-scrollbar {
                display: none;
              }
              .${h}[data-editorial-carousel="true"] [data-editorial-tile] {
                flex: 0 0 78%;
                min-width: 0;
                scroll-snap-align: start;
                margin-top: 0 !important;
                grid-column: auto !important;
              }
            }
            ${Jr(e, r.customCss)}
          ` }),
            /* @__PURE__ */ o(
              k,
              {
                fieldPath: `${d}.heading`,
                label: "Heading",
                as: "h2",
                style: {
                  margin: `0 0 ${Math.min(r.layoutGap, 48)}px`,
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: u
                },
                children: r.heading
              }
            ),
            /* @__PURE__ */ o("div", { "data-editorial-grid": !0, style: b, children: c.map((x, z) => {
              const S = ea(z), _ = i === "template" ? `templates.${t}.sections.${e}.blocks.${x.id}.settings` : `sections.${e}.blocks.${x.id}.settings`, H = i === "template" ? `template:${t}:${e}:block:${x.id}` : `layout:${e}:block:${x.id}`, w = {
                gridColumn: S.gridColumn,
                marginTop: S.marginTop,
                minHeight: S.minHeight,
                display: "flex",
                flexDirection: "column",
                borderRadius: 8,
                background: "#ececec",
                overflow: "hidden"
              };
              return /* @__PURE__ */ o(E, { nodeId: H, label: "Collection", style: w, children: /* @__PURE__ */ o("div", { "data-editorial-tile": !0, children: /* @__PURE__ */ m(
                I,
                {
                  to: x.href,
                  style: {
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                    minHeight: S.minHeight
                  },
                  children: [
                    /* @__PURE__ */ o(
                      "div",
                      {
                        style: {
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 16
                        },
                        children: x.imageUrl ? /* @__PURE__ */ o(
                          "img",
                          {
                            src: x.imageUrl,
                            alt: "",
                            style: { width: "100%", height: "100%", objectFit: "cover" }
                          }
                        ) : /* @__PURE__ */ o(
                          pt,
                          {
                            variant: x.illustrationVariant,
                            wide: S.wideIllustration
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ o(
                      "p",
                      {
                        style: {
                          margin: 0,
                          padding: "10px 12px",
                          fontSize: 14,
                          fontWeight: 500,
                          fontFamily: s
                        },
                        children: /* @__PURE__ */ o(k, { fieldPath: `${_}.title`, label: "Title", children: x.title })
                      }
                    )
                  ]
                }
              ) }) }, x.id);
            }) })
          ]
        }
      )
    }
  );
}
const Po = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function oa(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.sectionWidth`, "page"), s = l(e, `${t}.mobileColumns`, "2");
  return {
    scheme: Po[i] ?? Po["scheme-1"],
    heading: l(e, `${t}.heading`),
    columns: Math.min(6, Math.max(1, y(e, `${t}.columns`, 3))),
    mobileColumns: s === "1" ? 1 : 2,
    horizontalGap: y(e, `${t}.horizontalGap`, 8),
    verticalGap: y(e, `${t}.verticalGap`, 8),
    carouselOnMobile: !!K(e, `${t}.carouselOnMobile`),
    sectionWidth: n === "full" ? "full" : "page",
    layoutGap: y(e, `${t}.layoutGap`, 12),
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function ia(e, t) {
  const i = `.ziplofy-collection-list-grid-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function na({
  sectionId: e = "collection_list_grid",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), d = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = i === "template" ? `template:${t}:${e}` : `layout:${e}`, r = F(
    () => oa(n, d),
    [n, d]
  ), p = F(
    () => mt(n, t, e, i),
    [n, t, e, i]
  ), c = `ziplofy-collection-list-grid-${e.replace(/[^a-z0-9_-]/gi, "-")}`, h = {
    paddingTop: r.paddingTop,
    paddingBottom: r.paddingBottom,
    background: r.scheme.background,
    color: r.scheme.color,
    fontFamily: s,
    boxSizing: "border-box"
  }, g = r.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 24, paddingRight: 24 } : {
    maxWidth: L.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, $ = {
    display: "grid",
    gridTemplateColumns: `repeat(${r.columns}, minmax(0, 1fr))`,
    columnGap: r.horizontalGap,
    rowGap: r.verticalGap
  }, b = {
    position: "relative",
    aspectRatio: "1",
    borderRadius: 8,
    background: "#ececec",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 10
  }, v = {
    position: "absolute",
    top: 10,
    left: 10,
    margin: 0,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.2,
    background: "#ffffff",
    borderRadius: 4,
    color: "#111827",
    fontFamily: s,
    zIndex: 1
  };
  return /* @__PURE__ */ o(
    G,
    {
      sectionId: e,
      label: "Collection list: Grid",
      editorNodeId: a,
      style: h,
      children: /* @__PURE__ */ m(
        "div",
        {
          className: c,
          style: g,
          "data-grid-columns": r.columns,
          "data-mobile-columns": r.mobileColumns,
          "data-carousel-mobile": r.carouselOnMobile ? "true" : "false",
          children: [
            /* @__PURE__ */ o("style", { children: `
            @media (max-width: 749px) {
              .${c}[data-carousel-mobile="false"] [data-grid-track] {
                grid-template-columns: repeat(${r.mobileColumns}, minmax(0, 1fr)) !important;
              }
              .${c}[data-carousel-mobile="true"] [data-grid-track] {
                display: flex !important;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                gap: ${r.horizontalGap}px;
                padding-bottom: 4px;
              }
              .${c}[data-carousel-mobile="true"] [data-grid-track]::-webkit-scrollbar {
                display: none;
              }
              .${c}[data-carousel-mobile="true"] [data-grid-tile] {
                flex: 0 0 calc(${r.mobileColumns === 1 ? "88" : "46"}% - 8px);
                scroll-snap-align: start;
              }
            }
            ${ia(e, r.customCss)}
          ` }),
            /* @__PURE__ */ o(
              k,
              {
                fieldPath: `${d}.heading`,
                label: "Heading",
                as: "h2",
                style: {
                  margin: `0 0 ${r.layoutGap}px`,
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: u
                },
                children: r.heading
              }
            ),
            /* @__PURE__ */ o("div", { "data-grid-track": !0, style: $, children: p.map((x) => {
              const z = i === "template" ? `templates.${t}.sections.${e}.blocks.${x.id}.settings` : `sections.${e}.blocks.${x.id}.settings`, S = i === "template" ? `template:${t}:${e}:block:${x.id}` : `layout:${e}:block:${x.id}`;
              return /* @__PURE__ */ o(E, { nodeId: S, label: "Collection", children: /* @__PURE__ */ o("div", { "data-grid-tile": !0, children: /* @__PURE__ */ o(
                I,
                {
                  to: x.href,
                  style: { display: "block", textDecoration: "none", color: "inherit" },
                  children: /* @__PURE__ */ m("div", { style: b, children: [
                    /* @__PURE__ */ o("span", { style: v, children: /* @__PURE__ */ o(k, { fieldPath: `${z}.title`, label: "Title", children: x.title }) }),
                    x.imageUrl ? /* @__PURE__ */ o(
                      "img",
                      {
                        src: x.imageUrl,
                        alt: "",
                        style: { width: "100%", height: "100%", objectFit: "cover" }
                      }
                    ) : /* @__PURE__ */ o(
                      pt,
                      {
                        variant: x.illustrationVariant
                      }
                    )
                  ] })
                }
              ) }) }, x.id);
            }) })
          ]
        }
      )
    }
  );
}
function la({ imageUrl: e, style: t }) {
  return e ? /* @__PURE__ */ o(
    "img",
    {
      src: e,
      alt: "",
      style: {
        ...t,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center bottom"
      }
    }
  ) : /* @__PURE__ */ m("div", { style: { position: "relative", width: "100%", height: "100%", ...t }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          left: "50%",
          top: "4%",
          width: "36%",
          height: "20%",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "#e8c4a8"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          left: "50%",
          top: "17%",
          width: "50%",
          height: "22%",
          transform: "translateX(-50%)",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          background: "#fff"
        }
      }
    ),
    /* @__PURE__ */ m(
      "div",
      {
        style: {
          position: "absolute",
          left: "50%",
          top: "23%",
          width: "94%",
          height: "77%",
          transform: "translateX(-50%)",
          overflow: "hidden",
          borderTopLeftRadius: "28%",
          borderTopRightRadius: "28%",
          background: "#4a7fc4"
        },
        children: [
          /* @__PURE__ */ o("div", { style: { position: "absolute", left: "9%", top: 0, width: "13%", height: "100%", background: "#3a6dad" } }),
          /* @__PURE__ */ o("div", { style: { position: "absolute", right: "9%", top: 0, width: "13%", height: "100%", background: "#3a6dad" } })
        ]
      }
    )
  ] });
}
function mi({ variant: e }) {
  return e === "landscape" ? /* @__PURE__ */ m(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #ebe6dc 0%, #e0d9ce 45%, #b8cdb0 100%)"
      },
      "aria-hidden": !0,
      children: [
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              left: "50%",
              top: "12%",
              width: 28,
              height: 28,
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
            }
          }
        ),
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "55%",
              background: "rgba(95,148,104,0.9)",
              clipPath: "polygon(0% 100%, 0% 55%, 35% 40%, 65% 60%, 100% 45%, 100% 100%)"
            }
          }
        ),
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "38%",
              background: "rgba(74,125,86,0.92)",
              clipPath: "polygon(0% 100%, 20% 65%, 50% 75%, 80% 55%, 100% 70%, 100% 100%)"
            }
          }
        )
      ]
    }
  ) : /* @__PURE__ */ m(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #f7f4ee 0%, #e8e2d6 100%)"
      },
      "aria-hidden": !0,
      children: [
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              right: "8%",
              top: "18%",
              width: "42%",
              height: "42%",
              borderRadius: "50%",
              background: "#fff",
              opacity: 0.9
            }
          }
        ),
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "#6b9e72",
              clipPath: "polygon(0 100%, 0 40%, 100% 55%, 100% 100%)"
            }
          }
        )
      ]
    }
  );
}
const To = {
  "scheme-1": { background: "#f3efe6", color: "#111827", muted: "#4b5563" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function ra(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.height`, "medium"), s = l(e, `${t}.sectionWidth`, "page");
  return {
    scheme: To[i] ?? To["scheme-1"],
    sectionWidth: s === "full" ? "full" : "page",
    height: n === "small" || n === "large" ? n : "medium",
    cornerRadius: y(e, `${t}.cornerRadius`, 0),
    borderThickness: y(e, `${t}.borderThickness`, 1),
    dropShadow: !!K(e, `${t}.dropShadow`),
    paddingTop: y(e, `${t}.paddingTop`, 40),
    paddingBottom: y(e, `${t}.paddingBottom`, 40),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function aa(e) {
  return e === "small" ? 360 : e === "large" ? 560 : 460;
}
function Wt(e, t, i, n) {
  const u = `${n === "template" ? `templates.${t}.sections.${i}` : `sections.${i}`}.blocks`, d = n === "template" ? Le(e, t, i, []) : Pe(e, i, []), a = K(e, u);
  return !a || typeof a != "object" ? [] : (d.length ? d : Object.keys(a)).map((p) => {
    const c = a[p]?.settings ?? {}, h = String(c.peekVariant ?? "figure");
    return {
      id: p,
      title: String(c.title ?? ""),
      body: String(
        c.body ?? "Introducing our latest products, made especially for the season. Shop your favorites before they're gone!"
      ),
      buttonLabel: String(c.buttonLabel ?? ""),
      buttonHref: String(c.buttonHref ?? ""),
      imageUrl: String(c.imageUrl ?? ""),
      peekVariant: h === "landscape" ? "landscape" : "figure"
    };
  });
}
function da(e, t) {
  const i = `.ziplofy-layered-slideshow-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function ca({
  sectionId: e = "layered_slideshow",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), [d, a] = Z(0), r = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, p = i === "template" ? `template:${t}:${e}` : `layout:${e}`, c = F(
    () => ra(n, r),
    [n, r]
  ), h = F(
    () => Wt(n, t, e, i),
    [n, t, e, i]
  ), g = Math.max(1, h.length), $ = (d % g + g) % g, b = h[$] ?? h[0], v = h[($ + 1) % g] ?? b, x = `ziplofy-layered-slideshow-${e.replace(/[^a-z0-9_-]/gi, "-")}`, z = da(e, c.customCss), S = aa(c.height), _ = {
    paddingTop: c.paddingTop,
    paddingBottom: c.paddingBottom,
    background: c.scheme.background,
    color: c.scheme.color,
    fontFamily: s,
    boxSizing: "border-box"
  }, H = c.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 24, paddingRight: 24 } : {
    maxWidth: L.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, w = {
    position: "relative",
    display: "flex",
    minHeight: S,
    overflow: "hidden",
    borderRadius: c.cornerRadius,
    border: c.borderThickness ? `${c.borderThickness}px solid rgba(0,0,0,0.08)` : "none",
    boxShadow: c.dropShadow ? "0 8px 28px rgba(0,0,0,0.12)" : void 0,
    background: c.scheme.background
  }, R = qe((T) => a(T), []);
  return b ? /* @__PURE__ */ m(G, { nodeId: p, label: "Layered slideshow", children: [
    z ? /* @__PURE__ */ o("style", { children: z }) : null,
    /* @__PURE__ */ o("section", { "data-ziplofy-section": e, className: x, style: _, children: /* @__PURE__ */ o("div", { style: H, children: /* @__PURE__ */ m("div", { style: w, children: [
      /* @__PURE__ */ o(
        "div",
        {
          style: {
            position: "relative",
            zIndex: 2,
            flex: "0 0 44%",
            maxWidth: "44%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 40px",
            boxSizing: "border-box"
          },
          children: /* @__PURE__ */ m(E, { nodeId: `${p}:${b.id}`, label: "Slide", children: [
            /* @__PURE__ */ o(
              k,
              {
                fieldPath: `${r.replace(".settings", "")}.blocks.${b.id}.settings.title`,
                label: "Heading",
                children: /* @__PURE__ */ o(
                  "h2",
                  {
                    style: {
                      margin: 0,
                      fontFamily: u,
                      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                      fontWeight: 700,
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em"
                    },
                    children: b.title
                  }
                )
              }
            ),
            /* @__PURE__ */ o(
              k,
              {
                fieldPath: `${r.replace(".settings", "")}.blocks.${b.id}.settings.body`,
                label: "Text",
                children: /* @__PURE__ */ o(
                  "p",
                  {
                    style: {
                      margin: "16px 0 0",
                      fontSize: "1rem",
                      lineHeight: 1.55,
                      color: c.scheme.muted,
                      maxWidth: 420
                    },
                    children: b.body
                  }
                )
              }
            ),
            /* @__PURE__ */ o(
              k,
              {
                fieldPath: `${r.replace(".settings", "")}.blocks.${b.id}.settings.buttonLabel`,
                label: "Button label",
                children: /* @__PURE__ */ o(
                  I,
                  {
                    to: b.buttonHref || "#",
                    style: {
                      display: "inline-flex",
                      marginTop: 28,
                      padding: "14px 28px",
                      borderRadius: 999,
                      background: "#111827",
                      color: "#fff",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      textDecoration: "none"
                    },
                    children: b.buttonLabel
                  }
                )
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ o(
        "div",
        {
          style: {
            position: "relative",
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingRight: "17%",
            paddingBottom: 24
          },
          children: /* @__PURE__ */ o("div", { style: { position: "relative", width: "72%", maxWidth: 340, height: "78%", minHeight: 280 }, children: /* @__PURE__ */ o(la, { imageUrl: b.imageUrl || void 0 }) })
        }
      ),
      /* @__PURE__ */ o(
        "div",
        {
          style: {
            position: "absolute",
            right: 0,
            top: 0,
            width: "17%",
            height: "100%",
            overflow: "hidden",
            borderLeft: "1px solid rgba(255,255,255,0.4)",
            boxShadow: "-4px 0 12px rgba(0,0,0,0.06)"
          },
          "aria-hidden": !0,
          children: /* @__PURE__ */ o(mi, { variant: v.peekVariant })
        }
      ),
      g > 1 ? /* @__PURE__ */ o(
        "div",
        {
          style: {
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            zIndex: 5
          },
          children: h.map((T, W) => /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              "aria-label": `Go to slide ${W + 1}`,
              onClick: () => R(W),
              style: {
                width: 8,
                height: 8,
                padding: 0,
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                background: W === $ ? "#111827" : "rgba(17,24,39,0.35)"
              }
            },
            T.id
          ))
        }
      ) : null
    ] }) }) })
  ] }) : null;
}
function gi({
  imageUrl: e,
  style: t
}) {
  return e ? /* @__PURE__ */ o(
    "img",
    {
      src: e,
      alt: "",
      style: {
        ...t,
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }
    }
  ) : /* @__PURE__ */ m("div", { style: { position: "absolute", inset: 0, ...t }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #ebe6dc 0%, #e0d9ce 45%, #c5d4b8 100%)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          left: "50%",
          top: "9%",
          width: 44,
          height: 44,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "48%",
          background: "rgba(95,148,104,0.88)",
          clipPath: "polygon(0% 100%, 0% 50%, 18% 58%, 38% 38%, 58% 52%, 78% 32%, 100% 48%, 100% 100%)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "32%",
          background: "rgba(74,125,86,0.92)",
          clipPath: "polygon(0% 100%, 12% 62%, 35% 72%, 55% 55%, 78% 68%, 100% 58%, 100% 100%)"
        }
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 0,
          left: "50%",
          display: "flex",
          height: "58%",
          width: "42%",
          transform: "translateX(-8%)",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ m("div", { style: { position: "relative", height: "100%", width: "100%" }, children: [
          /* @__PURE__ */ o(
            "div",
            {
              style: {
                position: "absolute",
                left: "50%",
                top: "4%",
                width: "36%",
                height: "20%",
                transform: "translateX(-50%)",
                borderRadius: "50%",
                background: "#e8c4a8"
              }
            }
          ),
          /* @__PURE__ */ o(
            "div",
            {
              style: {
                position: "absolute",
                left: "50%",
                top: "18%",
                width: "50%",
                height: "22%",
                transform: "translateX(-50%)",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                background: "#fff"
              }
            }
          ),
          /* @__PURE__ */ m(
            "div",
            {
              style: {
                position: "absolute",
                left: "50%",
                top: "24%",
                width: "94%",
                height: "76%",
                transform: "translateX(-50%)",
                overflow: "hidden",
                borderTopLeftRadius: "26%",
                borderTopRightRadius: "26%",
                background: "#4a7fc4"
              },
              children: [
                /* @__PURE__ */ o("div", { style: { position: "absolute", left: "9%", top: 0, width: "13%", height: "100%", background: "#3a6dad" } }),
                /* @__PURE__ */ o("div", { style: { position: "absolute", right: "9%", top: 0, width: "13%", height: "100%", background: "#3a6dad" } })
              ]
            }
          )
        ] })
      }
    )
  ] });
}
const Ho = {
  "scheme-1": { background: "#ddd6c8", color: "#ffffff", muted: "rgba(255,255,255,0.92)" },
  "scheme-2": { background: "#1e3a5f", color: "#ffffff", muted: "rgba(255,255,255,0.9)" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function sa(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.mediaHeight`, "medium"), s = l(e, `${t}.sectionWidth`, "full"), u = l(e, `${t}.contentPosition`, "on-media"), d = l(e, `${t}.navigationIcon`, "large-arrows"), a = l(
    e,
    `${t}.navigationIconBackground`,
    "none"
  ), r = l(e, `${t}.pagination`), p = a === "circle" || a === "square" ? a : "none";
  return {
    scheme: Ho[i] ?? Ho["scheme-1"],
    sectionWidth: s === "page" ? "page" : "full",
    mediaHeight: n === "small" || n === "large" ? n : "medium",
    contentPosition: u === "below-media" ? "below-media" : "on-media",
    navigationIcon: d === "arrows" || d === "chevron" || d === "none" ? d : "large-arrows",
    navigationIconBackground: p,
    pagination: r === "counter" || r === "none" ? r : "dots",
    autoRotate: !!K(e, `${t}.autoRotate`),
    paddingTop: y(e, `${t}.paddingTop`, 0),
    paddingBottom: y(e, `${t}.paddingBottom`, 0),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function ua(e) {
  return e === "small" ? 420 : e === "large" ? 640 : 520;
}
function ha(e, t, i, n) {
  return Wt(e, t, i, n);
}
function pa(e, t) {
  const i = `.ziplofy-slideshow-full-frame-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function Ro({
  label: e,
  onClick: t,
  background: i,
  size: n,
  shape: s
}) {
  const u = n === "large-arrows", d = i === "none" ? u ? 48 : 36 : u ? 52 : 40;
  return /* @__PURE__ */ o(
    "button",
    {
      type: "button",
      "aria-label": e,
      onClick: t,
      style: {
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: d,
        height: d,
        border: "none",
        cursor: "pointer",
        background: i === "circle" || i === "square" ? "rgba(255,255,255,0.95)" : "transparent",
        borderRadius: i === "circle" ? "50%" : i === "square" ? 8 : 0,
        boxShadow: i !== "none" ? "0 2px 8px rgba(0,0,0,0.15)" : void 0,
        color: "#fff",
        fontSize: s === "chevron" ? u ? 28 : 20 : u ? 28 : 22,
        lineHeight: 1,
        textShadow: i === "none" ? "0 1px 3px rgba(0,0,0,0.35)" : void 0
      },
      children: s === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→"
    }
  );
}
function ma({
  sectionId: e = "slideshow_full_frame",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), [d, a] = Z(0), r = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, p = i === "template" ? `template:${t}:${e}` : `layout:${e}`, c = F(
    () => sa(n, r),
    [n, r]
  ), h = F(
    () => ha(n, t, e, i),
    [n, t, e, i]
  ), g = Math.max(1, h.length), $ = (d % g + g) % g, b = h[$] ?? h[0], v = qe(() => a((D) => (D - 1 + g) % g), [g]), x = qe(() => a((D) => (D + 1) % g), [g]), z = qe((D) => a(D), []);
  ue(() => {
    if (!c.autoRotate || g < 2) return;
    const D = window.setInterval(() => a((V) => (V + 1) % g), 5e3);
    return () => window.clearInterval(D);
  }, [c.autoRotate, g]);
  const S = `ziplofy-slideshow-full-frame-${e.replace(/[^a-z0-9_-]/gi, "-")}`, _ = pa(e, c.customCss), H = ua(c.mediaHeight), w = c.contentPosition === "on-media", R = c.navigationIcon !== "none" && g > 1, T = c.navigationIcon === "chevron" ? "chevron" : "arrows", W = c.navigationIcon === "large-arrows" ? "large-arrows" : c.navigationIcon, P = {
    paddingTop: c.paddingTop,
    paddingBottom: c.paddingBottom,
    background: w ? c.scheme.background : "#fff",
    fontFamily: s,
    boxSizing: "border-box"
  }, C = c.sectionWidth === "full" ? { maxWidth: "100%" } : {
    maxWidth: L.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, M = {
    position: "relative",
    width: "100%",
    minHeight: H,
    overflow: "hidden",
    borderRadius: c.sectionWidth === "page" ? 12 : 0,
    background: c.scheme.background
  }, f = w ? "#fff" : c.scheme.color, O = w ? "rgba(255,255,255,0.92)" : c.scheme.muted;
  if (!b) return null;
  const N = r.replace(".settings", "");
  return /* @__PURE__ */ m(G, { nodeId: p, label: "Slideshow: Full frame", children: [
    _ ? /* @__PURE__ */ o("style", { children: _ }) : null,
    /* @__PURE__ */ o("section", { "data-ziplofy-section": e, className: S, style: P, children: /* @__PURE__ */ m("div", { style: C, children: [
      /* @__PURE__ */ m("div", { style: M, children: [
        /* @__PURE__ */ o(gi, { imageUrl: b.imageUrl || void 0 }),
        w ? /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "48px 80px",
              boxSizing: "border-box",
              zIndex: 2
            },
            children: /* @__PURE__ */ m(E, { nodeId: `${p}:${b.id}`, label: "Slide", children: [
              /* @__PURE__ */ o(k, { fieldPath: `${N}.blocks.${b.id}.settings.title`, label: "Heading", children: /* @__PURE__ */ o(
                "h2",
                {
                  style: {
                    margin: 0,
                    fontFamily: u,
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: f,
                    textShadow: "0 1px 4px rgba(0,0,0,0.2)"
                  },
                  children: b.title
                }
              ) }),
              /* @__PURE__ */ o(k, { path: `${N}.blocks.${b.id}.settings.body`, label: "Text", children: /* @__PURE__ */ o(
                "p",
                {
                  style: {
                    margin: "16px auto 0",
                    maxWidth: 520,
                    fontSize: "1.0625rem",
                    lineHeight: 1.55,
                    color: O
                  },
                  children: b.body
                }
              ) }),
              /* @__PURE__ */ o(
                k,
                {
                  fieldPath: `${N}.blocks.${b.id}.settings.buttonLabel`,
                  label: "Button label",
                  children: /* @__PURE__ */ o(
                    I,
                    {
                      to: b.buttonHref || "#",
                      style: {
                        display: "inline-flex",
                        marginTop: 28,
                        padding: "14px 32px",
                        borderRadius: 999,
                        background: "#fff",
                        color: "#111827",
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                      },
                      children: b.buttonLabel
                    }
                  )
                }
              )
            ] })
          }
        ) : null,
        R ? /* @__PURE__ */ m(ne, { children: [
          /* @__PURE__ */ o(
            "div",
            {
              style: {
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 4
              },
              children: /* @__PURE__ */ o(
                Ro,
                {
                  label: "Previous",
                  onClick: v,
                  background: c.navigationIconBackground,
                  size: W,
                  shape: T
                }
              )
            }
          ),
          /* @__PURE__ */ o(
            "div",
            {
              style: {
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 4
              },
              children: /* @__PURE__ */ o(
                Ro,
                {
                  label: "Next",
                  onClick: x,
                  background: c.navigationIconBackground,
                  size: W,
                  shape: T
                }
              )
            }
          )
        ] }) : null,
        c.pagination === "dots" && g > 1 ? /* @__PURE__ */ o(
          "div",
          {
            style: {
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 8,
              zIndex: 4
            },
            children: h.map((D, V) => /* @__PURE__ */ o(
              "button",
              {
                type: "button",
                "aria-label": `Go to slide ${V + 1}`,
                onClick: () => z(V),
                style: {
                  width: 8,
                  height: 8,
                  padding: 0,
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  background: V === $ ? "#fff" : "rgba(255,255,255,0.45)"
                }
              },
              D.id
            ))
          }
        ) : null,
        c.pagination === "counter" && g > 1 ? /* @__PURE__ */ m(
          "div",
          {
            style: {
              position: "absolute",
              bottom: 20,
              right: 24,
              zIndex: 4,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: w ? "#fff" : c.scheme.color
            },
            children: [
              $ + 1,
              " / ",
              g
            ]
          }
        ) : null
      ] }),
      w ? null : /* @__PURE__ */ m("div", { style: { padding: "32px 24px", textAlign: "center", color: c.scheme.color }, children: [
        /* @__PURE__ */ o("h2", { style: { margin: 0, fontFamily: u, fontSize: "2rem", fontWeight: 700 }, children: b.title }),
        /* @__PURE__ */ o("p", { style: { margin: "12px auto 0", maxWidth: 520, color: c.scheme.muted }, children: b.body }),
        /* @__PURE__ */ o(
          I,
          {
            to: b.buttonHref || "#",
            style: {
              display: "inline-flex",
              marginTop: 20,
              padding: "12px 28px",
              borderRadius: 999,
              background: "#111827",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600
            },
            children: b.buttonLabel
          }
        )
      ] })
    ] }) })
  ] });
}
const Lo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function ga(e, t) {
  const i = l(e, `${t}.colorScheme`, "scheme-1"), n = l(e, `${t}.mediaHeight`, "medium"), s = l(e, `${t}.contentPosition`), u = l(e, `${t}.navigationIcon`, "large-arrows"), d = l(
    e,
    `${t}.navigationIconBackground`,
    "none"
  ), a = l(e, `${t}.pagination`, "none"), r = d === "circle" || d === "square" ? d : "none";
  return {
    scheme: Lo[i] ?? Lo["scheme-1"],
    gap: y(e, `${t}.gap`, 18),
    cornerRadius: y(e, `${t}.cornerRadius`, 20),
    fullWidthOnMobile: !!K(e, `${t}.fullWidthOnMobile`),
    mediaHeight: n === "small" || n === "large" ? n : "medium",
    contentPosition: s === "on-media" ? "on-media" : "below-media",
    navigationIcon: u === "arrows" || u === "chevron" || u === "none" ? u : "large-arrows",
    navigationIconBackground: r,
    pagination: a === "dots" || a === "counter" ? a : "none",
    paddingTop: y(e, `${t}.paddingTop`, 0),
    paddingBottom: y(e, `${t}.paddingBottom`, 0),
    customCss: l(e, `${t}.customCss`, "")
  };
}
function fa(e) {
  return e === "small" ? 280 : e === "large" ? 440 : 360;
}
function ba(e, t, i, n) {
  return Wt(e, t, i, n);
}
function ya(e, t) {
  const i = `.ziplofy-slideshow-inset-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${i} { ${t} }` : "";
}
function Mo({
  label: e,
  onClick: t,
  background: i,
  size: n,
  shape: s
}) {
  const u = n === "large-arrows", d = i === "none" ? u ? 44 : 36 : u ? 48 : 40;
  return /* @__PURE__ */ o(
    "button",
    {
      type: "button",
      "aria-label": e,
      onClick: t,
      style: {
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: d,
        height: d,
        border: "none",
        cursor: "pointer",
        background: i === "circle" || i === "square" ? "rgba(255,255,255,0.95)" : "transparent",
        borderRadius: i === "circle" ? "50%" : i === "square" ? 8 : 0,
        boxShadow: i !== "none" ? "0 2px 8px rgba(0,0,0,0.12)" : void 0,
        color: "#111827",
        fontSize: s === "chevron" ? u ? 24 : 18 : u ? 24 : 20,
        lineHeight: 1
      },
      children: s === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→"
    }
  );
}
function xa({
  sectionId: e = "slideshow_inset",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), { fontBody: s, fontHeading: u } = X(), [d, a] = Z(0), r = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, p = i === "template" ? `template:${t}:${e}` : `layout:${e}`, c = F(
    () => ga(n, r),
    [n, r]
  ), h = F(
    () => ba(n, t, e, i),
    [n, t, e, i]
  ), g = Math.max(1, h.length), $ = (d % g + g) % g, b = h[$] ?? h[0], v = h[($ + 1) % g] ?? b, x = qe(() => a((B) => (B - 1 + g) % g), [g]), z = qe(() => a((B) => (B + 1) % g), [g]), S = qe((B) => a(B), []), _ = `ziplofy-slideshow-inset-${e.replace(/[^a-z0-9_-]/gi, "-")}`, H = ya(e, c.customCss), w = fa(c.mediaHeight), R = c.contentPosition === "below-media", T = c.navigationIcon !== "none" && g > 1, W = c.navigationIcon === "chevron" ? "chevron" : "arrows", P = c.navigationIcon === "large-arrows" ? "large-arrows" : c.navigationIcon === "chevron" ? "chevron" : "arrows", C = {
    paddingTop: c.paddingTop,
    paddingBottom: c.paddingBottom,
    background: c.scheme.background,
    color: c.scheme.color,
    fontFamily: s,
    boxSizing: "border-box"
  }, M = {
    maxWidth: L.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: c.fullWidthOnMobile ? 0 : 24,
    paddingRight: c.fullWidthOnMobile ? 0 : 24
  }, f = {
    display: "flex",
    flexDirection: "column",
    gap: R ? 24 : 0
  }, O = {
    position: "relative",
    display: "flex",
    gap: c.gap,
    overflow: "hidden",
    paddingLeft: 24,
    paddingRight: 24
  }, N = {
    position: "relative",
    flex: "1 1 auto",
    minWidth: 0,
    height: w,
    borderRadius: c.cornerRadius,
    overflow: "hidden",
    background: "#ddd6c8"
  }, D = {
    flex: `0 0 ${Math.max(48, c.gap + 32)}px`,
    width: Math.max(48, c.gap + 32),
    height: w,
    borderRadius: c.cornerRadius,
    overflow: "hidden",
    opacity: 0.95
  };
  if (!b) return null;
  const V = r.replace(".settings", ""), te = /* @__PURE__ */ m(E, { nodeId: `${p}:${b.id}`, label: "Slide", children: [
    /* @__PURE__ */ o(k, { fieldPath: `${V}.blocks.${b.id}.settings.title`, label: "Heading", children: /* @__PURE__ */ o(
      "h2",
      {
        style: {
          margin: 0,
          fontFamily: u,
          fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: R ? c.scheme.color : "#fff",
          textAlign: "center"
        },
        children: b.title
      }
    ) }),
    /* @__PURE__ */ o(k, { fieldPath: `${V}.blocks.${b.id}.settings.body`, label: "Text", children: /* @__PURE__ */ o(
      "p",
      {
        style: {
          margin: "12px auto 0",
          maxWidth: 520,
          fontSize: "1rem",
          lineHeight: 1.55,
          color: R ? c.scheme.muted : "rgba(255,255,255,0.92)",
          textAlign: "center"
        },
        children: b.body
      }
    ) }),
    /* @__PURE__ */ o(k, { fieldPath: `${V}.blocks.${b.id}.settings.buttonLabel`, label: "Button label", children: /* @__PURE__ */ o(
      I,
      {
        to: b.buttonHref || "#",
        style: {
          display: "inline-flex",
          marginTop: 20,
          padding: "14px 28px",
          borderRadius: 999,
          background: R ? "#111827" : "#fff",
          color: R ? "#fff" : "#111827",
          fontSize: "0.9375rem",
          fontWeight: 600,
          textDecoration: "none"
        },
        children: b.buttonLabel
      }
    ) })
  ] });
  return /* @__PURE__ */ m(G, { nodeId: p, label: "Slideshow: Inset", children: [
    H ? /* @__PURE__ */ o("style", { children: H }) : null,
    /* @__PURE__ */ o("section", { "data-ziplofy-section": e, className: _, style: C, children: /* @__PURE__ */ o("div", { style: M, children: /* @__PURE__ */ m("div", { style: f, children: [
      /* @__PURE__ */ m("div", { style: O, children: [
        /* @__PURE__ */ m("div", { style: N, children: [
          /* @__PURE__ */ o(gi, { imageUrl: b.imageUrl || void 0 }),
          R ? null : /* @__PURE__ */ o(
            "div",
            {
              style: {
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 64px",
                boxSizing: "border-box",
                zIndex: 2
              },
              children: te
            }
          ),
          T ? /* @__PURE__ */ m(ne, { children: [
            /* @__PURE__ */ o("div", { style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 4 }, children: /* @__PURE__ */ o(
              Mo,
              {
                label: "Previous",
                onClick: x,
                background: c.navigationIconBackground,
                size: P,
                shape: W
              }
            ) }),
            /* @__PURE__ */ o("div", { style: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 4 }, children: /* @__PURE__ */ o(
              Mo,
              {
                label: "Next",
                onClick: z,
                background: c.navigationIconBackground,
                size: P,
                shape: W
              }
            ) })
          ] }) : null,
          c.pagination === "dots" && g > 1 && !R ? /* @__PURE__ */ o(
            "div",
            {
              style: {
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 8,
                zIndex: 4
              },
              children: h.map((B, de) => /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  "aria-label": `Go to slide ${de + 1}`,
                  onClick: () => S(de),
                  style: {
                    width: 8,
                    height: 8,
                    padding: 0,
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    background: de === $ ? "#fff" : "rgba(255,255,255,0.45)"
                  }
                },
                B.id
              ))
            }
          ) : null
        ] }),
        g > 1 ? /* @__PURE__ */ o("div", { style: D, "aria-hidden": !0, children: /* @__PURE__ */ o(mi, { variant: v.peekVariant }) }) : null
      ] }),
      R ? /* @__PURE__ */ o("div", { style: { textAlign: "center", padding: "0 24px 8px" }, children: te }) : null,
      c.pagination === "dots" && g > 1 && R ? /* @__PURE__ */ o("div", { style: { display: "flex", justifyContent: "center", gap: 8, paddingBottom: 8 }, children: h.map((B, de) => /* @__PURE__ */ o(
        "button",
        {
          type: "button",
          "aria-label": `Go to slide ${de + 1}`,
          onClick: () => S(de),
          style: {
            width: 8,
            height: 8,
            padding: 0,
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            background: de === $ ? "#111827" : "rgba(17,24,39,0.25)"
          }
        },
        B.id
      )) }) : null,
      c.pagination === "counter" && g > 1 ? /* @__PURE__ */ m("p", { style: { textAlign: "center", margin: 0, fontSize: "0.875rem", fontWeight: 600 }, children: [
        $ + 1,
        " / ",
        g
      ] }) : null
    ] }) }) })
  ] });
}
function $a({ sectionId: e = "divider", templateId: t = "index" }) {
  return /* @__PURE__ */ o(wt, { sectionId: e, placement: "template", templateId: t });
}
function ka(e, t) {
  return e === "fit" ? "fit-content" : "100%";
}
function va(e, t) {
  return t ? "baseline" : e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function Sa(e, t, i, n) {
  const s = l(e, `${t}.direction`, "horizontal"), u = l(e, `${t}.layoutAlignment`, "space-between"), d = l(e, `${t}.position`, "bottom"), a = U(e, `${t}.alignTextBaseline`, !0), r = y(e, `${t}.layoutGap`, 12), p = l(e, `${t}.width`, "fill"), c = l(e, `${t}.height`, "fit"), h = U(e, `${t}.inheritColorScheme`, !0), g = l(e, `${t}.backgroundMedia`, "none"), $ = l(e, `${t}.backgroundImageUrl`, "").trim(), b = l(e, `${t}.borderStyle`, "none"), v = Math.max(0, y(e, `${t}.cornerRadius`, 0)), x = U(e, `${t}.verticalOnMobile`, !1), z = i.background, S = i.color;
  return {
    flexDirection: s === "vertical" ? "column" : "row",
    justifyContent: u,
    alignItems: va(d, a),
    gap: r,
    flexWrap: "wrap",
    width: ka(p),
    minHeight: c === "fit" ? "auto" : c === "fill" ? "100%" : "auto",
    paddingTop: y(e, `${t}.paddingTop`, 0),
    paddingBottom: y(e, `${t}.paddingBottom`, 0),
    paddingLeft: y(e, `${t}.paddingLeft`, 0),
    paddingRight: y(e, `${t}.paddingRight`, 0),
    borderRadius: v,
    border: b === "solid" ? `1px solid ${n}` : void 0,
    background: z,
    backgroundImage: g === "image" && $ ? `url(${$})` : void 0,
    color: S,
    mobileStack: x
  };
}
function wa(e, t, i) {
  const n = `[data-ziplofy-section="${e}"] [data-fc-collection-header]`;
  let s = "";
  return i && (s += `@media (max-width: 749px) { ${n} { flex-direction: column !important; align-items: stretch !important; } }`), t === "fit" ? s += `@media (max-width: 749px) { ${n} { width: fit-content !important; max-width: 100%; } }` : t === "fill" && (s += `@media (max-width: 749px) { ${n} { width: 100% !important; } }`), s;
}
const Fo = {
  "heading-1": { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  "heading-2": { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  "heading-3": { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  "heading-4": { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
}, Eo = {
  narrow: "480px",
  normal: "640px",
  wide: "960px",
  none: void 0
};
function _a(e, t, i, n) {
  const s = l(e, `${t}.titleTypographyPreset`, "heading-4"), u = Fo[s] ?? Fo["heading-4"], d = l(e, `${t}.titleWidth`, "fit"), a = l(e, `${t}.titleMaxWidth`), r = l(e, `${t}.titleColor`, "text"), p = r === "heading" ? n.heading : r === "accent" ? n.accent : n.text, c = U(e, `${t}.titleBackgroundEnabled`, !1);
  return {
    width: d === "fill" ? "100%" : "fit-content",
    maxWidth: Eo[a] ?? Eo.normal,
    fontFamily: i.heading,
    fontSize: u.fontSize,
    fontWeight: u.fontWeight,
    lineHeight: u.lineHeight,
    color: p,
    background: c ? "rgba(0,0,0,0.04)" : void 0,
    paddingTop: y(e, `${t}.titlePaddingTop`, 0),
    paddingBottom: y(e, `${t}.titlePaddingBottom`, 0),
    paddingLeft: y(e, `${t}.titlePaddingLeft`, 0),
    paddingRight: y(e, `${t}.titlePaddingRight`, 0),
    borderRadius: c ? 6 : 0
  };
}
const Ao = {
  auto: void 0,
  "1/1": "1 / 1",
  "4/5": "4 / 5",
  "3/4": "3 / 4",
  "16/9": "16 / 9",
  "2/3": "2 / 3"
};
function Ca(e, t, i) {
  const n = l(e, `${t}.mediaAspectRatio`, "auto"), s = l(e, `${t}.mediaBorderStyle`, "none"), u = y(e, `${t}.mediaCornerRadius`, 0);
  return {
    aspectRatio: Ao[n] ?? Ao["4/5"],
    border: s === "solid" ? `1px solid ${i}` : "none",
    borderRadius: u,
    paddingTop: y(e, `${t}.mediaPaddingTop`, 0),
    paddingBottom: y(e, `${t}.mediaPaddingBottom`, 0),
    paddingLeft: y(e, `${t}.mediaPaddingLeft`, 0),
    paddingRight: y(e, `${t}.mediaPaddingRight`, 0)
  };
}
function za(e, t, i, n) {
  const s = U(e, `${t}.inheritColorScheme`, !0), u = l(e, `${t}.borderStyle`, "none"), d = y(e, `${t}.cornerRadius`, 0);
  return {
    verticalGap: y(e, `${t}.verticalGap`, 4),
    background: i.background,
    color: i.color,
    border: u === "solid" ? `1px solid ${n}` : "none",
    borderRadius: d,
    paddingTop: y(e, `${t}.paddingTop`, 0),
    paddingBottom: y(e, `${t}.paddingBottom`, 0),
    paddingLeft: y(e, `${t}.paddingLeft`, 0),
    paddingRight: y(e, `${t}.paddingRight`, 0)
  };
}
const Uo = {
  default: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
  "heading-6": { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
  "heading-5": { fontSize: 16, fontWeight: 600, lineHeight: 1.35 },
  "heading-4": { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 }
};
function Wa(e, t, i, n) {
  const s = l(e, `${t}.priceTypographyPreset`), u = Uo[s] ?? Uo["heading-6"], d = l(e, `${t}.priceWidth`, "fill"), a = l(e, `${t}.priceAlignment`, "left"), r = l(e, `${t}.priceColor`, "text"), p = r === "heading" ? n.heading : r === "accent" ? n.accent : r === "muted" ? n.muted : n.text;
  return {
    width: d === "fill" ? "100%" : "fit-content",
    textAlign: a === "center" ? "center" : a === "right" ? "right" : "left",
    fontFamily: i,
    fontSize: u.fontSize,
    fontWeight: u.fontWeight,
    lineHeight: u.lineHeight,
    color: p,
    paddingTop: y(e, `${t}.pricePaddingTop`, 0),
    paddingBottom: y(e, `${t}.pricePaddingBottom`, 0),
    paddingLeft: y(e, `${t}.pricePaddingLeft`, 0),
    paddingRight: y(e, `${t}.pricePaddingRight`, 0),
    showSaleFirst: U(e, `${t}.priceShowSaleFirst`, !0),
    showInstallments: U(e, `${t}.priceInstallments`, !1),
    showTaxInfo: U(e, `${t}.priceTaxInfo`, !1)
  };
}
function Pa(e, t, i, n) {
  const s = t != null && t > e && Number.isFinite(t);
  return i.showSaleFirst && s ? { primary: n(e), compareAt: n(t) } : s && !i.showSaleFirst ? { primary: n(t), compareAt: n(e) } : { primary: n(e) };
}
const No = {
  default: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  "heading-1": { fontSize: 28, fontWeight: 700, lineHeight: 1.15 },
  "heading-2": { fontSize: 24, fontWeight: 600, lineHeight: 1.2 },
  "heading-3": { fontSize: 20, fontWeight: 600, lineHeight: 1.25 },
  "heading-4": { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
}, Oo = {
  narrow: "280px",
  normal: "100%",
  wide: "100%",
  none: void 0
};
function Ta(e, t, i, n) {
  const s = l(e, `${t}.productTitleTypographyPreset`, "default"), u = No[s] ?? No.default, d = l(e, `${t}.productTitleWidth`, "fill"), a = l(e, `${t}.productTitleMaxWidth`), r = l(e, `${t}.productTitleAlignment`, "left"), p = U(e, `${t}.productTitleBackgroundEnabled`, !1), c = r === "center" ? "center" : r === "right" ? "right" : "left";
  return {
    width: d === "fill" ? "100%" : "fit-content",
    maxWidth: Oo[a] ?? Oo.normal,
    textAlign: c,
    fontFamily: i,
    fontSize: u.fontSize,
    fontWeight: u.fontWeight,
    lineHeight: u.lineHeight,
    color: n,
    background: p ? "rgba(0,0,0,0.04)" : void 0,
    paddingTop: y(e, `${t}.productTitlePaddingTop`, 0),
    paddingBottom: y(e, `${t}.productTitlePaddingBottom`, 0),
    paddingLeft: y(e, `${t}.productTitlePaddingLeft`, 0),
    paddingRight: y(e, `${t}.productTitlePaddingRight`, 0),
    borderRadius: p ? 6 : 0,
    marginBottom: 0
  };
}
const Ha = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", muted: "#64748b" },
  "scheme-3": { background: "#fff7ed", color: "#431407", muted: "#9a3412" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", muted: "#6d28d9" }
};
function Ra(e, t, i) {
  const n = l(e, `${t}.colorScheme`, "scheme-1");
  return Ha[n] ?? i;
}
function La(e, t) {
  return l(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function Ma(e, t) {
  return {
    paddingTop: y(e, `${t}.paddingTop`, 48),
    paddingBottom: y(e, `${t}.paddingBottom`, 48)
  };
}
function Fa(e, t) {
  const i = y(e, `${t}.gap`, 24);
  return {
    horizontal: y(e, `${t}.horizontalGap`, i > 0 ? Math.min(i, 48) : 8),
    vertical: y(e, `${t}.verticalGap`, 24),
    section: y(e, `${t}.sectionGap`, 28)
  };
}
function Ea(e, t) {
  const i = t.trim();
  if (!i) return "";
  const n = `[data-ziplofy-section="${e}"]`;
  return i.replace(/:root/g, n).replace(/&/g, n);
}
function Go({
  label: e,
  onClick: t,
  background: i,
  shape: n
}) {
  return /* @__PURE__ */ o("button", { type: "button", "aria-label": e, onClick: t, style: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: i === "none" ? 32 : 36,
    height: i === "none" ? 32 : 36,
    border: "none",
    cursor: "pointer",
    background: i === "circle" || i === "square" ? "rgba(255,255,255,0.95)" : "transparent",
    borderRadius: i === "circle" ? "50%" : i === "square" ? 6 : 0,
    boxShadow: i !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
    color: "#111827",
    fontSize: n === "chevron" ? 18 : 20,
    lineHeight: 1
  }, children: n === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→" });
}
function yt({
  sectionId: e = "featured_collection",
  templateId: t = "index",
  placement: i = "template"
}) {
  const n = j(), s = ot(null), u = i === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, d = i === "template" ? `templates.${t}.sections.${e}.blocks` : `sections.${e}.blocks`, a = `${d}.collection_header.settings`, r = `${d}.product_card.settings`, p = i === "template" ? `template:${t}:${e}` : `layout:${e}`, c = X(), { text: h, background: g, primary: $, fontHeading: b, fontBody: v } = c, { storeFrontMeta: x } = it(), { products: z, fetchProductsByStoreId: S } = ht(), _ = F(() => {
    const ie = Ra(n, u, {
      background: g,
      color: h,
      muted: "#6b7280"
    }), pe = Fa(n, u), { paddingTop: nt, paddingBottom: gt } = Ma(n, u), Je = l(n, `${u}.navIcon`, "arrows"), $e = l(n, `${u}.navIconBackground`, "circle");
    return {
      scheme: ie,
      gaps: pe,
      paddingTop: nt,
      paddingBottom: gt,
      widthMode: La(n, u),
      layoutType: l(n, `${u}.layoutType`, "grid"),
      carouselOnMobile: U(n, `${u}.carouselOnMobile`, !1),
      columns: Math.max(1, Math.min(6, y(n, `${u}.columns`, 4))),
      mobileColumns: Math.max(
        1,
        Math.min(2, Number(l(n, `${u}.mobileColumns`, "2")) || 2)
      ),
      limit: Math.max(1, y(n, `${u}.productsToShow`, 8)),
      customCss: l(n, `${u}.customCss`, ""),
      emptyMessage: l(n, `${u}.emptyMessage`),
      subtitle: l(n, `${u}.subtitle`, ""),
      title: l(n, `${d}.collection_header.settings.title`),
      viewAllLabel: l(n, `${d}.collection_header.settings.viewAllLabel`, ""),
      viewAllHref: l(n, `${d}.collection_header.settings.viewAllHref`),
      showMedia: U(n, `${d}.product_card.settings.showMedia`, !0),
      showTitle: U(n, `${d}.product_card.settings.showTitle`, !0),
      showPrice: U(n, `${d}.product_card.settings.showPrice`, !0),
      navIcon: Je === "none" || Je === "chevron" || Je === "arrows" ? Je : "arrows",
      navIconBackground: $e === "none" || $e === "circle" || $e === "square" ? $e : "circle"
    };
  }, [n, g, h, u, d]), {
    scheme: H,
    gaps: w,
    paddingTop: R,
    paddingBottom: T,
    widthMode: W,
    layoutType: P,
    carouselOnMobile: C,
    columns: M,
    mobileColumns: f,
    limit: O,
    customCss: N,
    emptyMessage: D,
    subtitle: V,
    title: te,
    viewAllLabel: B,
    viewAllHref: de,
    showMedia: ce,
    showTitle: ye,
    showPrice: Oe,
    navIcon: Ue,
    navIconBackground: je
  } = _, { color: xe, background: Me } = H, ke = P === "carousel", Fe = P === "editorial", Ie = P === "grid" && !ke && !Fe, ge = M >= 4, Te = ge ? 0.78 : M === 3 ? 0.9 : 1, He = ge ? 8 : 12, Ve = Ea(e, N), Qe = F(
    () => `
[data-ziplofy-section="${e}"] .fc-product-grid {
  display: flex;
  ${ke ? "flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;" : "flex-wrap: wrap;"}
  column-gap: ${w.horizontal}px;
  row-gap: ${w.vertical}px;
}
[data-ziplofy-section="${e}"] .fc-product-grid::-webkit-scrollbar { display: none; }
[data-ziplofy-section="${e}"] .fc-product-grid > article {
  ${ke ? `flex: 0 0 calc((100% - ${(M - 1) * w.horizontal}px) / ${M}); min-width: 0; max-width: calc((100% - ${(M - 1) * w.horizontal}px) / ${M}); scroll-snap-align: start;` : ge ? `flex: 0 0 min(calc((100% - ${(M - 1) * w.horizontal}px) / ${M}), 210px); max-width: min(calc((100% - ${(M - 1) * w.horizontal}px) / ${M}), 210px); min-width: 168px;` : `flex: 0 0 calc((100% - ${(M - 1) * w.horizontal}px) / ${M}); max-width: calc((100% - ${(M - 1) * w.horizontal}px) / ${M}); min-width: 220px;`}
}
[data-ziplofy-section="${e}"] .fc-editorial-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: ${w.horizontal}px;
  row-gap: ${w.section}px;
  align-items: start;
}
[data-ziplofy-section="${e}"] .fc-editorial-grid > article:nth-child(2) {
  margin-top: 3rem;
}
[data-ziplofy-section="${e}"] .fc-editorial-grid > article:nth-child(3) {
  margin-top: -1.25rem;
}
[data-ziplofy-section="${e}"] .fc-editorial-grid > article:nth-child(4) {
  margin-top: 2.5rem;
}
[data-ziplofy-section="${e}"] .fc-editorial-grid > article:nth-child(2) .fc-media-inner,
[data-ziplofy-section="${e}"] .fc-editorial-grid > article:nth-child(3) .fc-media-inner {
  aspect-ratio: 4 / 5;
  min-height: 200px;
}
@media (max-width: 749px) {
  [data-ziplofy-section="${e}"] .fc-product-grid {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  [data-ziplofy-section="${e}"][data-mobile-columns="1"] .fc-product-grid > article { flex: 0 0 calc(92% - 8px); max-width: calc(92% - 8px); scroll-snap-align: start; }
  [data-ziplofy-section="${e}"][data-mobile-columns="2"] .fc-product-grid > article { flex: 0 0 calc(50% - ${w.horizontal / 2}px); max-width: calc(50% - ${w.horizontal / 2}px); scroll-snap-align: start; }
  [data-ziplofy-section="${e}"][data-fc-mobile-carousel="true"] .fc-editorial-grid {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  [data-ziplofy-section="${e}"][data-fc-mobile-carousel="true"] .fc-editorial-grid > article {
    flex: 0 0 min(85%, 320px);
    margin-top: 0 !important;
    scroll-snap-align: start;
  }
  [data-ziplofy-section="${e}"][data-fc-mobile-carousel="true"] .fc-editorial-grid > article .fc-media-inner {
    aspect-ratio: 4 / 3;
    min-height: 140px;
  }
}
`,
    [
      ke,
      Fe,
      ge,
      e,
      M,
      f,
      C,
      w.horizontal,
      w.vertical,
      w.section
    ]
  ), A = (ie) => {
    const pe = s.current;
    pe && pe.scrollBy({ left: pe.clientWidth * 0.85 * ie, behavior: "smooth" });
  };
  ue(() => {
    x?.storeId && S({ storeId: x.storeId, page: 1, limit: O });
  }, [S, O, x?.storeId]);
  const J = z.slice(0, O), Q = ke && Ue !== "none" && J.length > M, q = W === "full" ? "100%" : L.maxWidth, ee = lt(
    n,
    `${d}.collection_header.nested_block_order`,
    `${d}.collection_header.blocks`,
    ["collection_title", "view_all_button"]
  ), ve = lt(
    n,
    `${d}.product_card.nested_block_order`,
    `${d}.product_card.blocks`,
    ["media", "product_title", "price"]
  ), Y = F(
    () => Sa(n, a, H, L.line),
    [n, H, a]
  ), Se = F(() => {
    const ie = l(n, `${a}.mobileWidth`, "fill"), pe = U(n, `${a}.verticalOnMobile`, !1);
    return wa(e, ie, pe);
  }, [n, a, e]), le = F(
    () => _a(
      n,
      a,
      { heading: b },
      { text: xe, heading: xe, accent: $ }
    ),
    [n, b, v, xe, $, Me]
  ), he = F(
    () => za(n, r, H, L.line),
    [n, H]
  ), oe = F(
    () => Ca(n, r, L.line),
    [n]
  ), re = F(
    () => Ta(n, r, b, xe),
    [n, b, xe]
  ), ae = F(
    () => Wa(n, r, v, {
      text: xe,
      heading: xe,
      accent: $,
      muted: H.muted
    }),
    [n, v, xe, $, H.muted]
  ), De = Le(n, t, e, [
    "collection_header",
    "product_card"
  ]), Ge = /* @__PURE__ */ o(
    E,
    {
      nodeId: `${p}:block:collection_header`,
      label: "Header",
      children: /* @__PURE__ */ m(
        "div",
        {
          "data-fc-collection-header": !0,
          style: {
            display: "flex",
            flexDirection: Y.flexDirection,
            flexWrap: Y.flexWrap,
            justifyContent: Y.justifyContent,
            alignItems: Y.alignItems,
            gap: Y.gap,
            width: Y.width,
            minHeight: Y.minHeight,
            marginBottom: w.section,
            paddingTop: Y.paddingTop,
            paddingBottom: Y.paddingBottom,
            paddingLeft: Y.paddingLeft,
            paddingRight: Y.paddingRight,
            borderRadius: Y.borderRadius,
            border: Y.border,
            background: Y.background,
            backgroundImage: Y.backgroundImage,
            backgroundSize: Y.backgroundImage ? "cover" : void 0,
            backgroundPosition: Y.backgroundImage ? "center" : void 0,
            color: Y.color,
            boxSizing: "border-box"
          },
          children: [
            ee.map((ie) => ie === "collection_title" ? /* @__PURE__ */ o(
              E,
              {
                nodeId: `${p}:block:collection_header:nested:collection_title`,
                label: "Collection title",
                children: /* @__PURE__ */ o(
                  k,
                  {
                    fieldPath: `${d}.collection_header.settings.title`,
                    nodeId: p,
                    label: "Text",
                    as: "h2",
                    style: {
                      margin: 0,
                      width: le.width,
                      maxWidth: le.maxWidth,
                      fontFamily: le.fontFamily,
                      fontSize: le.fontSize,
                      fontWeight: le.fontWeight,
                      lineHeight: le.lineHeight,
                      color: le.color,
                      background: le.background,
                      paddingTop: le.paddingTop,
                      paddingBottom: le.paddingBottom,
                      paddingLeft: le.paddingLeft,
                      paddingRight: le.paddingRight,
                      borderRadius: le.borderRadius,
                      boxSizing: "border-box"
                    },
                    children: te
                  }
                )
              },
              ie
            ) : ie === "view_all_button" && B.trim() ? /* @__PURE__ */ o(
              E,
              {
                nodeId: `${p}:block:collection_header:nested:view_all_button`,
                label: "View all button",
                children: /* @__PURE__ */ o(
                  k,
                  {
                    fieldPath: `${d}.collection_header.settings.viewAllLabel`,
                    nodeId: p,
                    label: "Label",
                    children: /* @__PURE__ */ o(
                      I,
                      {
                        to: de,
                        style: { color: c.primary, fontWeight: 600, textDecoration: "none", fontSize: 14 },
                        children: B
                      }
                    )
                  }
                )
              },
              ie
            ) : null),
            V ? /* @__PURE__ */ o("p", { style: { margin: 0, fontSize: 14, color: H.muted, maxWidth: 480 }, children: V }) : null
          ]
        }
      )
    }
  ), se = J.map((ie) => {
    const pe = ie.imageUrls?.[0], nt = ce ? /* @__PURE__ */ o(E, { nodeId: `${p}:block:product_card:nested:media`, label: "Media", children: /* @__PURE__ */ o(
      "div",
      {
        style: {
          border: oe.border,
          borderRadius: oe.borderRadius,
          paddingTop: oe.paddingTop,
          paddingBottom: oe.paddingBottom,
          paddingLeft: oe.paddingLeft,
          paddingRight: oe.paddingRight,
          boxSizing: "border-box"
        },
        children: /* @__PURE__ */ o(
          "div",
          {
            className: "fc-media-inner",
            style: {
              width: "100%",
              aspectRatio: ge ? "1 / 1" : oe.aspectRatio ?? "1 / 1",
              minHeight: ge ? 116 : oe.aspectRatio ? void 0 : 140,
              maxHeight: ge ? 160 : 280,
              overflow: "hidden",
              borderRadius: oe.borderRadius > 0 ? Math.max(
                0,
                oe.borderRadius - Math.max(
                  oe.paddingTop,
                  oe.paddingBottom,
                  oe.paddingLeft,
                  oe.paddingRight
                )
              ) : 0,
              background: pe ? `center / cover no-repeat url(${pe})` : "linear-gradient(135deg, #f3f4f6, #e5e7eb)"
            }
          }
        )
      }
    ) }) : null, gt = ye ? /* @__PURE__ */ o(E, { nodeId: `${p}:block:product_card:nested:product_title`, label: "Product title", children: /* @__PURE__ */ o(
      "h3",
      {
        style: {
          margin: 0,
          width: re.width,
          maxWidth: re.maxWidth,
          textAlign: re.textAlign,
          fontFamily: re.fontFamily,
          fontSize: Math.max(12, Math.round(re.fontSize * Te)),
          fontWeight: re.fontWeight,
          lineHeight: re.lineHeight,
          color: re.color,
          background: re.background,
          paddingTop: re.paddingTop,
          paddingBottom: re.paddingBottom,
          paddingLeft: re.paddingLeft,
          paddingRight: re.paddingRight,
          borderRadius: re.borderRadius,
          boxSizing: "border-box"
        },
        children: ie.title
      }
    ) }) : null, Je = Oe ? /* @__PURE__ */ o(E, { nodeId: `${p}:block:product_card:nested:price`, label: "Price", children: /* @__PURE__ */ m(
      "div",
      {
        style: {
          margin: 0,
          width: ae.width,
          textAlign: ae.textAlign,
          paddingTop: ae.paddingTop,
          paddingBottom: ae.paddingBottom,
          paddingLeft: ae.paddingLeft,
          paddingRight: ae.paddingRight,
          boxSizing: "border-box"
        },
        children: [
          /* @__PURE__ */ o(
            "p",
            {
              style: {
                margin: 0,
                fontFamily: ae.fontFamily,
                fontSize: Math.max(11, Math.round(ae.fontSize * Te)),
                fontWeight: ae.fontWeight,
                lineHeight: ae.lineHeight,
                color: ae.color
              },
              children: (() => {
                const $e = Pa(
                  ie.price,
                  ie.compareAtPrice,
                  ae,
                  Ye
                );
                return /* @__PURE__ */ m(ne, { children: [
                  /* @__PURE__ */ o("span", { children: $e.primary }),
                  $e.compareAt ? /* @__PURE__ */ o(
                    "span",
                    {
                      style: {
                        marginLeft: 8,
                        fontSize: ae.fontSize * 0.85,
                        fontWeight: 400,
                        color: H.muted,
                        textDecoration: "line-through"
                      },
                      children: $e.compareAt
                    }
                  ) : null
                ] });
              })()
            }
          ),
          ae.showInstallments ? /* @__PURE__ */ o("p", { style: { margin: "4px 0 0", fontSize: 12, color: H.muted }, children: "Pay in installments" }) : null,
          ae.showTaxInfo ? /* @__PURE__ */ o("p", { style: { margin: "2px 0 0", fontSize: 11, color: H.muted }, children: "Tax included" }) : null
        ]
      }
    ) }) : null;
    return /* @__PURE__ */ o(
      "article",
      {
        style: {
          border: he.border === "none" ? `1px solid ${L.line}` : he.border,
          borderRadius: he.borderRadius,
          overflow: "hidden",
          background: he.background,
          color: he.color,
          paddingTop: he.paddingTop,
          paddingBottom: he.paddingBottom,
          paddingLeft: he.paddingLeft,
          paddingRight: he.paddingRight,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box"
        },
        children: ve.map(($e) => $e === "media" ? /* @__PURE__ */ o("div", { children: nt }, $e) : $e === "product_title" ? /* @__PURE__ */ o(
          "div",
          {
            style: {
              padding: `${He}px ${He}px 0`
            },
            children: gt
          },
          $e
        ) : $e === "price" ? /* @__PURE__ */ o(
          "div",
          {
            style: {
              padding: `0 ${He}px ${He}px`
            },
            children: Je
          },
          $e
        ) : null)
      },
      ie._id
    );
  }), Ne = Fe ? /* @__PURE__ */ o(
    "div",
    {
      ref: C ? s : void 0,
      className: "fc-editorial-grid",
      "data-fc-mobile-carousel": C ? "true" : "false",
      children: se
    }
  ) : ke ? /* @__PURE__ */ m(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      },
      children: [
        Q ? /* @__PURE__ */ o(
          Go,
          {
            label: "Previous",
            onClick: () => A(-1),
            background: je,
            shape: Ue === "chevron" ? "chevron" : "arrows"
          }
        ) : null,
        /* @__PURE__ */ o("div", { ref: s, className: "fc-product-grid", style: { flex: 1, minWidth: 0 }, children: se }),
        Q ? /* @__PURE__ */ o(
          Go,
          {
            label: "Next",
            onClick: () => A(1),
            background: je,
            shape: Ue === "chevron" ? "chevron" : "arrows"
          }
        ) : null
      ]
    }
  ) : /* @__PURE__ */ o(
    "div",
    {
      ref: C ? s : void 0,
      className: "fc-product-grid",
      "data-mobile-columns": f,
      children: se
    }
  ), at = /* @__PURE__ */ o(E, { nodeId: `${p}:block:product_card`, label: "Product card", children: J.length === 0 ? /* @__PURE__ */ o("p", { style: { color: H.muted, fontSize: 14 }, children: D }) : Ne }), Ke = {
    collection_header: Ge,
    product_card: at
  };
  return /* @__PURE__ */ m(ne, { children: [
    Ve ? /* @__PURE__ */ o("style", { children: Ve }) : null,
    /* @__PURE__ */ o("style", { children: Qe }),
    Se ? /* @__PURE__ */ o("style", { children: Se }) : null,
    /* @__PURE__ */ o(
      G,
      {
        nodeId: p,
        label: Ie ? "Featured collection: Grid" : Fe ? "Featured collection: Editorial" : ke ? "Featured collection: Carousel" : "Featured collection",
        "data-ziplofy-section": e,
        "data-mobile-columns": f,
        "data-fc-mobile-carousel": Fe && C ? "true" : "false",
        style: {
          padding: `${R}px ${L.padX}px ${T}px`,
          fontFamily: v,
          color: xe,
          background: Me
        },
        children: /* @__PURE__ */ o("div", { style: { maxWidth: q, margin: "0 auto" }, children: De.map((ie) => {
          const pe = Ke[ie];
          return pe ? /* @__PURE__ */ o("div", { children: pe }, ie) : null;
        }) })
      }
    )
  ] });
}
const Aa = {
  hero_main: kt,
  featured_collection: yt,
  divider: $a,
  contact_form: Vo,
  email_signup: Ko,
  custom_section: dr,
  product_highlight: Jo,
  editorial: ei,
  editorial_jumbo: ti,
  image_compare: oi,
  image_with_text: ii,
  storytelling_logo: si,
  storytelling_video: ui,
  faq_section: ni,
  icons_with_text: li,
  multicolumn_section: ri,
  pull_quote_section: ai,
  rich_text_section: di,
  text_marquee_section: ci,
  blog_posts_carousel: hr,
  blog_posts_editorial: gr,
  blog_posts_grid: yr,
  storytelling_carousel: Sr,
  product_hotspots: Pr,
  recommended_products: Mr,
  collection_links_spotlight: wo,
  collection_links_text: wo,
  collection_list_bento: Vr,
  collection_list_carousel: Zr,
  collection_list_editorial: ta,
  collection_list_grid: na,
  layered_slideshow: ca,
  slideshow_full_frame: ma,
  slideshow_inset: xa
}, Ua = ["hero_main", "featured_collection"];
function Na() {
  const e = j(), t = Ei(e, "index", Ua);
  return /* @__PURE__ */ o(Ae, { children: t.map((i) => {
    if (!Gi(e, "index", i)) return null;
    let n = i;
    i.startsWith("divider") ? n = "divider" : i.startsWith("contact_form") ? n = "contact_form" : i.startsWith("email_signup") ? n = "email_signup" : i.startsWith("custom_section") ? n = "custom_section" : i.startsWith("product_highlight") ? n = "product_highlight" : i.startsWith("storytelling_video") ? n = "storytelling_video" : i.startsWith("faq_section") ? n = "faq_section" : i.startsWith("icons_with_text") ? n = "icons_with_text" : i.startsWith("multicolumn_section") ? n = "multicolumn_section" : i.startsWith("pull_quote_section") ? n = "pull_quote_section" : i.startsWith("rich_text_section") ? n = "rich_text_section" : i.startsWith("text_marquee_section") ? n = "text_marquee_section" : i.startsWith("blog_posts_carousel") ? n = "blog_posts_carousel" : i.startsWith("blog_posts_editorial") ? n = "blog_posts_editorial" : i.startsWith("blog_posts_grid") ? n = "blog_posts_grid" : i.startsWith("storytelling_carousel") ? n = "storytelling_carousel" : i.startsWith("product_hotspots") ? n = "product_hotspots" : i.startsWith("recommended_products") ? n = "recommended_products" : i.startsWith("collection_links_spotlight") ? n = "collection_links_spotlight" : i.startsWith("collection_links_text") ? n = "collection_links_text" : i.startsWith("collection_list_bento") ? n = "collection_list_bento" : i.startsWith("collection_list_carousel") ? n = "collection_list_carousel" : i.startsWith("collection_list_editorial") ? n = "collection_list_editorial" : i.startsWith("collection_list_grid") ? n = "collection_list_grid" : i.startsWith("layered_slideshow") ? n = "layered_slideshow" : i.startsWith("slideshow_full_frame") ? n = "slideshow_full_frame" : i.startsWith("slideshow_inset") ? n = "slideshow_inset" : i.startsWith("storytelling_logo") ? n = "storytelling_logo" : i.startsWith("image_with_text") ? n = "image_with_text" : i.startsWith("image_compare") ? n = "image_compare" : i.startsWith("editorial_jumbo") ? n = "editorial_jumbo" : i.startsWith("editorial") ? n = "editorial" : i.startsWith("featured_collection") && (n = "featured_collection");
    const s = Aa[n];
    return s ? /* @__PURE__ */ o(s, { sectionId: i, templateId: "index" }, i) : null;
  }) });
}
const me = "templates.login.sections.login_main";
function Oa() {
  const e = j(), { login: t, loading: i } = Ze(), { storeFrontMeta: n } = it(), s = $t(), { text: u, primary: d, fontHeading: a, fontBody: r } = X(), [p, c] = Z(""), [h, g] = Z(""), $ = l(e, `${me}.settings.eyebrow`, ""), b = l(e, `${me}.settings.title`), v = l(e, `${me}.settings.subtitle`, ""), x = l(e, `${me}.blocks.form_fields.blocks.email_field.settings.placeholder`), z = l(e, `${me}.blocks.form_fields.blocks.password_field.settings.placeholder`), S = l(e, `${me}.blocks.primary_button.settings.label`), _ = l(e, `${me}.blocks.primary_button.settings.loadingLabel`), H = l(e, `${me}.blocks.footer_link.blocks.signup_prompt.settings.text`), w = l(e, `${me}.blocks.footer_link.blocks.signup_link.settings.label`), R = l(e, `${me}.blocks.footer_link.blocks.signup_link.settings.href`), T = l(e, `${me}.blocks.forgot_password_link.settings.label`), W = l(e, `${me}.blocks.forgot_password_link.settings.href`), P = async (C) => {
    C.preventDefault(), n?.storeId && (await t({ storeId: n.storeId, email: p, password: h }), s("/"));
  };
  return /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ o(
    G,
    {
      sectionId: "login_main",
      label: "Login form",
      style: { padding: `48px ${L.padX}px 80px`, fontFamily: r, color: u },
      children: /* @__PURE__ */ m("div", { style: { maxWidth: 440, margin: "0 auto", border: `1px solid ${L.line}`, borderRadius: 12, padding: 40 }, children: [
        $ ? /* @__PURE__ */ o(k, { fieldPath: `${me}.settings.eyebrow`, label: "Eyebrow", as: "p", style: { fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.7, margin: "0 0 8px" }, children: $ }) : null,
        /* @__PURE__ */ o(k, { fieldPath: `${me}.settings.title`, label: "Heading", as: "h1", style: { fontFamily: a, fontSize: 28, marginTop: 0 }, children: b }),
        v ? /* @__PURE__ */ o(k, { fieldPath: `${me}.settings.subtitle`, label: "Subtext", as: "p", style: { lineHeight: 1.6, opacity: 0.85, margin: "12px 0 24px" }, children: v }) : null,
        /* @__PURE__ */ m("form", { onSubmit: (C) => {
          P(C);
        }, style: { display: "grid", gap: 16 }, children: [
          /* @__PURE__ */ m(E, { nodeId: "template:login:login_main:block:form_fields", label: "Form fields", children: [
            /* @__PURE__ */ o("input", { value: p, onChange: (C) => c(C.target.value), placeholder: x, style: We }),
            /* @__PURE__ */ o("input", { value: h, onChange: (C) => g(C.target.value), type: "password", placeholder: z, style: We })
          ] }),
          /* @__PURE__ */ o(E, { nodeId: "template:login:login_main:block:forgot_password_link", label: "Forgot password", children: /* @__PURE__ */ o("p", { style: { margin: 0, textAlign: "right" }, children: /* @__PURE__ */ o(I, { to: W, style: { color: d, fontSize: 13, fontWeight: 600 }, children: /* @__PURE__ */ o(k, { fieldPath: `${me}.blocks.forgot_password_link.settings.label`, label: "Link label", as: "span", children: T }) }) }) }),
          /* @__PURE__ */ o(E, { nodeId: "template:login:login_main:block:primary_button", label: "Submit button", children: /* @__PURE__ */ o(
            "button",
            {
              type: "submit",
              disabled: i,
              style: {
                marginTop: 8,
                background: d,
                color: "#fff",
                border: "none",
                padding: "14px 20px",
                borderRadius: 8,
                cursor: i ? "wait" : "pointer",
                fontWeight: 600,
                width: "100%"
              },
              children: i ? _ : S
            }
          ) })
        ] }),
        /* @__PURE__ */ o(E, { nodeId: "template:login:login_main:block:footer_link", label: "Sign up link", children: /* @__PURE__ */ m("p", { style: { marginTop: 20, fontSize: 14 }, children: [
          /* @__PURE__ */ m(k, { fieldPath: `${me}.blocks.footer_link.blocks.signup_prompt.settings.text`, label: "Prompt text", as: "span", children: [
            H,
            " "
          ] }),
          /* @__PURE__ */ o(I, { to: R, style: { color: d, fontWeight: 600 }, children: /* @__PURE__ */ o(k, { fieldPath: `${me}.blocks.footer_link.blocks.signup_link.settings.label`, label: "Link label", as: "span", children: w }) })
        ] }) })
      ] })
    }
  ) });
}
const we = "templates.orders.sections.orders_main";
function Ga() {
  const e = j(), t = rt(), { user: i, checkAuth: n } = Ze(), { orders: s, getOrdersByCustomerId: u, loading: d } = yi(), { text: a, fontHeading: r, fontBody: p } = X(), c = l(e, `${we}.settings.title`), h = l(e, `${we}.settings.subtitle`, ""), g = l(e, `${we}.blocks.loading_state.settings.message`), $ = l(e, `${we}.blocks.empty_state.settings.message`), b = l(e, `${we}.blocks.order_card.blocks.order_total_line.settings.label`), v = l(e, `${we}.blocks.order_card.blocks.order_date_line.settings.prefix`), x = l(e, `${we}.blocks.order_card.blocks.status_line.settings.prefix`);
  ue(() => {
    t || n();
  }, [n, t]), ue(() => {
    t || !i?._id || u(i._id);
  }, [u, t, i?._id]);
  const z = F(() => s.length > 0 ? s : t ? Ui : [], [t, s]), S = !t && d, _ = !S && z.length === 0;
  return /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ m(
    G,
    {
      sectionId: "orders_main",
      label: "Order history",
      style: { padding: `48px ${L.padX}px 80px`, maxWidth: 720, margin: "0 auto", fontFamily: p, color: a },
      children: [
        /* @__PURE__ */ o(k, { fieldPath: `${we}.settings.title`, label: "Heading", as: "h1", style: { fontFamily: r, fontSize: 32, marginTop: 0 }, children: c }),
        h ? /* @__PURE__ */ o(k, { fieldPath: `${we}.settings.subtitle`, label: "Subtext", as: "p", style: { opacity: 0.85, margin: "8px 0 24px" }, children: h }) : null,
        S ? /* @__PURE__ */ o(E, { nodeId: "template:orders:orders_main:block:loading_state", label: "Loading", children: /* @__PURE__ */ o(k, { fieldPath: `${we}.blocks.loading_state.settings.message`, label: "Loading message", as: "p", style: { opacity: 0.7 }, children: g }) }) : null,
        _ ? /* @__PURE__ */ o(E, { nodeId: "template:orders:orders_main:block:empty_state", label: "Empty orders", children: /* @__PURE__ */ o(k, { fieldPath: `${we}.blocks.empty_state.settings.message`, label: "Empty message", as: "p", style: { opacity: 0.7 }, children: $ }) }) : null,
        /* @__PURE__ */ o("div", { style: { display: "grid", gap: 16, marginTop: 24 }, children: z.map((H) => /* @__PURE__ */ o(E, { nodeId: "template:orders:orders_main:block:order_card", label: "Order card", children: /* @__PURE__ */ m("article", { style: { border: `1px solid ${L.line}`, borderRadius: 10, padding: 20 }, children: [
          /* @__PURE__ */ o(E, { nodeId: "template:orders:orders_main:block:order_card:block:order_total_line", label: "Order total", children: /* @__PURE__ */ m("p", { style: { margin: 0, fontWeight: 600 }, children: [
            /* @__PURE__ */ o(k, { fieldPath: `${we}.blocks.order_card.blocks.order_total_line.settings.label`, label: "Total label", as: "span", children: b }),
            ": ",
            Ye(H.total)
          ] }) }),
          /* @__PURE__ */ o("p", { style: { margin: "8px 0 0", fontSize: 13, opacity: 0.75, wordBreak: "break-all" }, children: H._id }),
          /* @__PURE__ */ o(E, { nodeId: "template:orders:orders_main:block:order_card:block:order_date_line", label: "Order date", children: /* @__PURE__ */ m("p", { style: { margin: "8px 0 0", fontSize: 13, opacity: 0.75 }, children: [
            /* @__PURE__ */ o(k, { fieldPath: `${we}.blocks.order_card.blocks.order_date_line.settings.prefix`, label: "Date prefix", as: "span", children: v }),
            ": ",
            H.orderDate
          ] }) }),
          /* @__PURE__ */ o(E, { nodeId: "template:orders:orders_main:block:order_card:block:status_line", label: "Status", children: /* @__PURE__ */ m("p", { style: { margin: "8px 0 0" }, children: [
            /* @__PURE__ */ o(k, { fieldPath: `${we}.blocks.order_card.blocks.status_line.settings.prefix`, label: "Status prefix", as: "span", children: x }),
            " ",
            H.status
          ] }) })
        ] }) }, H._id)) })
      ]
    }
  ) });
}
const _e = "templates.preferences.sections.preferences_main";
function ja() {
  const e = j(), t = rt(), { user: i, checkAuth: n, updateUser: s, loading: u } = Ze(), { text: d, primary: a, fontHeading: r, fontBody: p } = X(), [c, h] = Z("en"), [g, $] = Z(!1), [b, v] = Z(!1), x = i ?? (t ? Xe : null), z = l(e, `${_e}.settings.title`), S = l(e, `${_e}.settings.subtitle`, ""), _ = l(e, `${_e}.blocks.signed_out.settings.message`), H = l(e, `${_e}.blocks.marketing_options.blocks.email_marketing.settings.label`), w = l(e, `${_e}.blocks.marketing_options.blocks.sms_marketing.settings.label`), R = l(e, `${_e}.blocks.marketing_options.blocks.language_field.settings.label`), T = l(e, `${_e}.blocks.save_button.settings.label`), W = l(e, `${_e}.blocks.save_button.settings.savingLabel`);
  ue(() => {
    t || n();
  }, [n, t]), ue(() => {
    x && (h(x.language || "en"), $(!!x.agreedToMarketingEmails), v(!!x.agreedToSmsMarketing));
  }, [x]);
  const P = async (C) => {
    C.preventDefault(), !(t || !i?._id) && await s(i._id, { language: c, agreedToMarketingEmails: g, agreedToSmsMarketing: b });
  };
  return x ? /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ o(G, { sectionId: "preferences_main", label: "Preferences", style: { padding: `48px ${L.padX}px 80px`, fontFamily: p, color: d }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 520, margin: "0 auto", border: `1px solid ${L.line}`, borderRadius: 12, padding: 40 }, children: [
    /* @__PURE__ */ o(k, { fieldPath: `${_e}.settings.title`, label: "Heading", as: "h1", style: { fontFamily: r, fontSize: 28, marginTop: 0 }, children: z }),
    S ? /* @__PURE__ */ o(k, { fieldPath: `${_e}.settings.subtitle`, label: "Subtext", as: "p", style: { lineHeight: 1.6, opacity: 0.85, margin: "12px 0 24px" }, children: S }) : null,
    /* @__PURE__ */ m("form", { onSubmit: (C) => {
      P(C);
    }, style: { display: "grid", gap: 16 }, children: [
      /* @__PURE__ */ m(E, { nodeId: "template:preferences:preferences_main:block:marketing_options", label: "Marketing", children: [
        /* @__PURE__ */ m("label", { style: { display: "grid", gap: 8 }, children: [
          /* @__PURE__ */ o(k, { fieldPath: `${_e}.blocks.marketing_options.blocks.language_field.settings.label`, label: "Field label", as: "span", children: R }),
          /* @__PURE__ */ m(
            "select",
            {
              value: c,
              onChange: (C) => h(C.target.value),
              disabled: t,
              style: { ...We, cursor: t ? "default" : "pointer" },
              children: [
                /* @__PURE__ */ o("option", { value: "en", children: "English" }),
                /* @__PURE__ */ o("option", { value: "hi", children: "Hindi" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ m("label", { style: { display: "flex", gap: 10, alignItems: "center", marginTop: 12 }, children: [
          /* @__PURE__ */ o(
            "input",
            {
              type: "checkbox",
              checked: g,
              onChange: (C) => $(C.target.checked),
              disabled: t
            }
          ),
          /* @__PURE__ */ o(k, { fieldPath: `${_e}.blocks.marketing_options.blocks.email_marketing.settings.label`, label: "Checkbox label", as: "span", children: H })
        ] }),
        /* @__PURE__ */ m("label", { style: { display: "flex", gap: 10, alignItems: "center" }, children: [
          /* @__PURE__ */ o(
            "input",
            {
              type: "checkbox",
              checked: b,
              onChange: (C) => v(C.target.checked),
              disabled: t
            }
          ),
          /* @__PURE__ */ o(k, { fieldPath: `${_e}.blocks.marketing_options.blocks.sms_marketing.settings.label`, label: "Checkbox label", as: "span", children: w })
        ] })
      ] }),
      /* @__PURE__ */ o(E, { nodeId: "template:preferences:preferences_main:block:save_button", label: "Save button", children: /* @__PURE__ */ o("button", { type: "submit", disabled: !t && u, style: { background: a, color: "#fff", border: "none", padding: "14px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, width: "100%" }, children: !t && u ? W : T }) })
    ] })
  ] }) }) }) : /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ o(G, { sectionId: "preferences_main", label: "Preferences", style: { padding: `48px ${L.padX}px`, fontFamily: p, color: d }, children: /* @__PURE__ */ o(E, { nodeId: "template:preferences:preferences_main:block:signed_out", label: "Signed out", children: /* @__PURE__ */ o(k, { fieldPath: `${_e}.blocks.signed_out.settings.message`, label: "Message", as: "p", children: _ }) }) }) });
}
const Ee = "templates.product.sections.product_main";
function Da() {
  const { id: e } = ki(), t = j(), { text: i, background: n, primary: s, fontHeading: u, fontBody: d } = X(), { storeFrontMeta: a } = it(), { productDetail: r, fetchProductById: p } = ht(), { variants: c, fetchVariantsByProductId: h } = xi(), { createCartEntry: g } = xt(), [$, b] = Z(!1), v = U(t, `${Ee}.blocks.product_media.settings.showImage`, !0), x = U(t, `${Ee}.blocks.product_header.blocks.vendor_line.settings.showVendor`, !0), z = l(t, `${Ee}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`), S = l(t, `${Ee}.blocks.product_header.blocks.product_title.settings.loadingLabel`), _ = U(t, `${Ee}.blocks.product_content.blocks.description.settings.showDescription`, !0), H = l(t, `${Ee}.blocks.product_content.blocks.price_line.settings.priceFallback`, "—"), w = l(t, `${Ee}.blocks.buy_box.blocks.add_to_cart_button.settings.label`), R = l(t, `${Ee}.blocks.buy_box.blocks.add_to_cart_button.settings.addingLabel`);
  ue(() => {
    e && (p(e), h(e));
  }, [p, h, e]);
  const T = F(
    () => c[0] ?? r?.variantDetails?.[0],
    [r?.variantDetails, c]
  ), W = async () => {
    if (!(!a?.storeId || !T))
      try {
        b(!0), await g(
          { storeId: a.storeId, productVariantId: T._id, quantity: 1 },
          T
        );
      } finally {
        b(!1);
      }
  };
  if (!e) return null;
  const P = r?.imageUrls?.[0];
  return /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ o(G, { sectionId: "product_main", label: "Product details", style: { padding: `48px ${L.padX}px` }, children: /* @__PURE__ */ m(
    "div",
    {
      style: {
        maxWidth: L.maxWidth,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 40,
        fontFamily: d,
        color: i
      },
      children: [
        /* @__PURE__ */ o(E, { nodeId: "template:product:product_main:block:product_media", label: "Media", children: v ? /* @__PURE__ */ o(
          "div",
          {
            style: {
              aspectRatio: "3/4",
              borderRadius: 12,
              border: `1px solid ${L.line}`,
              background: P ? `center/cover url(${P}) no-repeat` : "linear-gradient(135deg, #f3f4f6, #e5e7eb)"
            }
          }
        ) : null }),
        /* @__PURE__ */ m("div", { children: [
          /* @__PURE__ */ m(E, { nodeId: "template:product:product_main:block:product_header", label: "Header", children: [
            x && r?.vendor?.name ? /* @__PURE__ */ o(E, { nodeId: "template:product:product_main:block:product_header:block:vendor_line", label: "Vendor", children: /* @__PURE__ */ m("p", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6 }, children: [
              /* @__PURE__ */ o(
                k,
                {
                  fieldPath: `${Ee}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`,
                  label: "Vendor prefix",
                  as: "span",
                  children: z
                }
              ),
              " ",
              r.vendor.name
            ] }) }) : null,
            /* @__PURE__ */ o(E, { nodeId: "template:product:product_main:block:product_header:block:product_title", label: "Product title", children: /* @__PURE__ */ o("h1", { style: { fontFamily: u, fontSize: 32, margin: "8px 0 16px", fontWeight: 600 }, children: r?.title ?? /* @__PURE__ */ o(
              k,
              {
                fieldPath: `${Ee}.blocks.product_header.blocks.product_title.settings.loadingLabel`,
                label: "Loading label",
                children: S
              }
            ) }) })
          ] }),
          /* @__PURE__ */ m(E, { nodeId: "template:product:product_main:block:product_content", label: "Content", children: [
            _ ? /* @__PURE__ */ o(E, { nodeId: "template:product:product_main:block:product_content:block:description", label: "Description", children: /* @__PURE__ */ o("p", { style: { lineHeight: 1.7, opacity: 0.85, marginBottom: 24 }, children: r?.description }) }) : null,
            /* @__PURE__ */ o(E, { nodeId: "template:product:product_main:block:product_content:block:price_line", label: "Price", children: /* @__PURE__ */ o("p", { style: { fontSize: 24, fontWeight: 600, marginBottom: 24 }, children: r ? Ye(r.price) : H }) })
          ] }),
          /* @__PURE__ */ o(E, { nodeId: "template:product:product_main:block:buy_box", label: "Buy box", children: /* @__PURE__ */ o(
            E,
            {
              nodeId: "template:product:product_main:block:buy_box:block:add_to_cart_button",
              label: "Add to cart button",
              children: /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  disabled: $ || !T,
                  onClick: () => {
                    W();
                  },
                  style: {
                    padding: "14px 28px",
                    borderRadius: 8,
                    border: "none",
                    background: s,
                    color: n,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: d
                  },
                  children: /* @__PURE__ */ o(
                    k,
                    {
                      fieldPath: `${Ee}.blocks.buy_box.blocks.add_to_cart_button.settings.label`,
                      label: "Button label",
                      as: "span",
                      children: $ ? R : w
                    }
                  )
                }
              )
            }
          ) })
        ] })
      ]
    }
  ) }) });
}
const be = "templates.profile.sections.profile_main";
function Ba() {
  const e = j(), t = rt(), { user: i, checkAuth: n, updateUser: s, loading: u } = Ze(), d = $t(), { text: a, primary: r, fontHeading: p, fontBody: c } = X(), [h, g] = Z(""), [$, b] = Z(""), [v, x] = Z(""), z = i ?? (t ? Xe : null), S = l(e, `${be}.settings.title`), _ = l(e, `${be}.settings.subtitle`, ""), H = l(e, `${be}.blocks.signed_out.blocks.empty_message.settings.text`), w = l(e, `${be}.blocks.signed_out.blocks.sign_in_button.settings.label`), R = l(e, `${be}.blocks.profile_form.blocks.email_field.settings.label`), T = l(e, `${be}.blocks.profile_form.blocks.email_field.settings.helperText`, ""), W = l(e, `${be}.blocks.profile_form.blocks.first_name_field.settings.placeholder`), P = l(e, `${be}.blocks.profile_form.blocks.last_name_field.settings.placeholder`), C = l(e, `${be}.blocks.profile_form.blocks.phone_field.settings.placeholder`), M = l(e, `${be}.blocks.save_button.settings.label`), f = l(e, `${be}.blocks.save_button.settings.savingLabel`);
  if (ue(() => {
    t || n();
  }, [n, t]), ue(() => {
    z && (g(z.firstName || ""), b(z.lastName || ""), x(z.phoneNumber || ""));
  }, [z]), !z)
    return /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ o(G, { sectionId: "profile_main", label: "Profile", style: { padding: `48px ${L.padX}px`, textAlign: "center", fontFamily: c, color: a }, children: /* @__PURE__ */ m(E, { nodeId: "template:profile:profile_main:block:signed_out", label: "Signed out", children: [
      /* @__PURE__ */ o(k, { fieldPath: `${be}.blocks.signed_out.blocks.empty_message.settings.text`, label: "Message", as: "p", children: H }),
      /* @__PURE__ */ o(E, { nodeId: "template:profile:profile_main:block:signed_out:block:sign_in_button", label: "Sign in button", children: /* @__PURE__ */ o("button", { type: "button", onClick: () => d("/auth/login"), style: { marginTop: 16, background: r, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, cursor: "pointer" }, children: w }) })
    ] }) }) });
  const O = async (N) => {
    N.preventDefault(), !(t || !i) && await s(i._id, { firstName: h, lastName: $, phoneNumber: v });
  };
  return /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ o(G, { sectionId: "profile_main", label: "Profile", style: { padding: `48px ${L.padX}px 80px`, fontFamily: c, color: a }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 480, margin: "0 auto", border: `1px solid ${L.line}`, borderRadius: 12, padding: 40 }, children: [
    /* @__PURE__ */ o(k, { fieldPath: `${be}.settings.title`, label: "Heading", as: "h1", style: { fontFamily: p, fontSize: 28, marginTop: 0 }, children: S }),
    _ ? /* @__PURE__ */ o(k, { fieldPath: `${be}.settings.subtitle`, label: "Subtext", as: "p", style: { lineHeight: 1.6, opacity: 0.85, margin: "12px 0 24px" }, children: _ }) : null,
    /* @__PURE__ */ m("form", { onSubmit: (N) => {
      O(N);
    }, style: { display: "grid", gap: 16 }, children: [
      /* @__PURE__ */ m(E, { nodeId: "template:profile:profile_main:block:profile_form", label: "Profile form", children: [
        /* @__PURE__ */ m("label", { style: { display: "grid", gap: 6 }, children: [
          /* @__PURE__ */ o(k, { fieldPath: `${be}.blocks.profile_form.blocks.email_field.settings.label`, label: "Email label", as: "span", style: { fontSize: 13, fontWeight: 600 }, children: R }),
          /* @__PURE__ */ o("input", { value: z.email, readOnly: !0, style: { ...We, opacity: 0.85 } }),
          T ? /* @__PURE__ */ o(k, { fieldPath: `${be}.blocks.profile_form.blocks.email_field.settings.helperText`, label: "Helper", as: "span", style: { fontSize: 12, opacity: 0.7 }, children: T }) : null
        ] }),
        /* @__PURE__ */ o("input", { value: h, onChange: (N) => g(N.target.value), placeholder: W, readOnly: t, style: We }),
        /* @__PURE__ */ o("input", { value: $, onChange: (N) => b(N.target.value), placeholder: P, readOnly: t, style: We }),
        /* @__PURE__ */ o("input", { value: v, onChange: (N) => x(N.target.value), placeholder: C, readOnly: t, style: We })
      ] }),
      /* @__PURE__ */ o(E, { nodeId: "template:profile:profile_main:block:save_button", label: "Save button", children: /* @__PURE__ */ o("button", { type: "submit", disabled: !t && u, style: { background: r, color: "#fff", border: "none", padding: "14px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, width: "100%" }, children: !t && u ? f : M }) })
    ] })
  ] }) }) });
}
const ze = "templates.forgot_password.sections.forgot_main";
function Xa() {
  const e = j(), { text: t, primary: i, fontHeading: n, fontBody: s } = X(), [u, d] = Z(""), [a, r] = Z(!1), p = l(e, `${ze}.settings.eyebrow`, ""), c = l(e, `${ze}.settings.title`), h = l(e, `${ze}.settings.subtitle`, ""), g = l(e, `${ze}.blocks.form_fields.blocks.email_field.settings.placeholder`), $ = l(e, `${ze}.blocks.primary_button.settings.label`), b = l(e, `${ze}.blocks.success_message.settings.text`), v = l(e, `${ze}.blocks.footer_link.blocks.back_link.settings.label`), x = l(e, `${ze}.blocks.footer_link.blocks.back_link.settings.href`), z = (S) => {
    S.preventDefault(), u.trim() && r(!0);
  };
  return /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ o(G, { sectionId: "forgot_main", label: "Reset password", style: { padding: `48px ${L.padX}px 80px`, fontFamily: s, color: t }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 440, margin: "0 auto", border: `1px solid ${L.line}`, borderRadius: 12, padding: 40 }, children: [
    p ? /* @__PURE__ */ o(k, { fieldPath: `${ze}.settings.eyebrow`, label: "Eyebrow", as: "p", style: { fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.7, margin: "0 0 8px" }, children: p }) : null,
    /* @__PURE__ */ o(k, { fieldPath: `${ze}.settings.title`, label: "Heading", as: "h1", style: { fontFamily: n, fontSize: 28, marginTop: 0 }, children: c }),
    /* @__PURE__ */ o(k, { fieldPath: `${ze}.settings.subtitle`, label: "Instructions", as: "p", style: { lineHeight: 1.6, opacity: 0.85, margin: "12px 0 24px" }, children: h }),
    a ? /* @__PURE__ */ o(E, { nodeId: "template:forgot_password:forgot_main:block:success_message", label: "Success message", children: /* @__PURE__ */ o(k, { fieldPath: `${ze}.blocks.success_message.settings.text`, label: "Confirmation text", as: "p", style: { marginTop: 16, fontSize: 14, color: i }, children: b }) }) : /* @__PURE__ */ m("form", { onSubmit: z, style: { display: "grid", gap: 16 }, children: [
      /* @__PURE__ */ o(E, { nodeId: "template:forgot_password:forgot_main:block:form_fields", label: "Form fields", children: /* @__PURE__ */ o("input", { value: u, onChange: (S) => d(S.target.value), placeholder: g, style: We }) }),
      /* @__PURE__ */ o(E, { nodeId: "template:forgot_password:forgot_main:block:primary_button", label: "Submit button", children: /* @__PURE__ */ o("button", { type: "submit", style: { background: i, color: "#fff", border: "none", padding: "14px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, width: "100%" }, children: $ }) })
    ] }),
    /* @__PURE__ */ o(E, { nodeId: "template:forgot_password:forgot_main:block:footer_link", label: "Back to login", children: /* @__PURE__ */ o("p", { style: { marginTop: 20, fontSize: 14 }, children: /* @__PURE__ */ o(I, { to: x, style: { color: i, fontWeight: 600 }, children: /* @__PURE__ */ o(k, { fieldPath: `${ze}.blocks.footer_link.blocks.back_link.settings.label`, label: "Link label", as: "span", children: v }) }) }) })
  ] }) }) });
}
const fe = "templates.signup.sections.signup_main";
function qa() {
  const e = j(), { signup: t, loading: i } = Ze(), { storeFrontMeta: n } = it(), s = $t(), { text: u, primary: d, fontHeading: a, fontBody: r } = X(), [p, c] = Z(""), [h, g] = Z(""), [$, b] = Z(""), [v, x] = Z(""), z = l(e, `${fe}.settings.eyebrow`, ""), S = l(e, `${fe}.settings.title`), _ = l(e, `${fe}.settings.subtitle`, ""), H = l(e, `${fe}.blocks.form_fields.blocks.first_name_field.settings.placeholder`), w = l(e, `${fe}.blocks.form_fields.blocks.last_name_field.settings.placeholder`), R = l(e, `${fe}.blocks.form_fields.blocks.email_field.settings.placeholder`), T = l(e, `${fe}.blocks.form_fields.blocks.password_field.settings.placeholder`), W = l(e, `${fe}.blocks.primary_button.settings.label`), P = l(e, `${fe}.blocks.primary_button.settings.loadingLabel`), C = l(e, `${fe}.blocks.footer_link.blocks.login_prompt.settings.text`), M = l(e, `${fe}.blocks.footer_link.blocks.login_link.settings.label`), f = l(e, `${fe}.blocks.footer_link.blocks.login_link.settings.href`), O = async (N) => {
    N.preventDefault(), n?.storeId && (await t({ storeId: n.storeId, firstName: p, lastName: h, email: $, password: v }), s("/"));
  };
  return /* @__PURE__ */ o(Ae, { children: /* @__PURE__ */ o(G, { sectionId: "signup_main", label: "Sign up form", style: { padding: `48px ${L.padX}px 80px`, fontFamily: r, color: u }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 440, margin: "0 auto", border: `1px solid ${L.line}`, borderRadius: 12, padding: 40 }, children: [
    z ? /* @__PURE__ */ o(k, { fieldPath: `${fe}.settings.eyebrow`, label: "Eyebrow", as: "p", style: { fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.7, margin: "0 0 8px" }, children: z }) : null,
    /* @__PURE__ */ o(k, { fieldPath: `${fe}.settings.title`, label: "Heading", as: "h1", style: { fontFamily: a, fontSize: 28, marginTop: 0 }, children: S }),
    _ ? /* @__PURE__ */ o(k, { fieldPath: `${fe}.settings.subtitle`, label: "Subtext", as: "p", style: { lineHeight: 1.6, opacity: 0.85, margin: "12px 0 24px" }, children: _ }) : null,
    /* @__PURE__ */ m("form", { onSubmit: (N) => {
      O(N);
    }, style: { display: "grid", gap: 16 }, children: [
      /* @__PURE__ */ m(E, { nodeId: "template:signup:signup_main:block:form_fields", label: "Form fields", children: [
        /* @__PURE__ */ o("input", { value: p, onChange: (N) => c(N.target.value), placeholder: H, style: We }),
        /* @__PURE__ */ o("input", { value: h, onChange: (N) => g(N.target.value), placeholder: w, style: We }),
        /* @__PURE__ */ o("input", { value: $, onChange: (N) => b(N.target.value), placeholder: R, style: We }),
        /* @__PURE__ */ o("input", { value: v, onChange: (N) => x(N.target.value), type: "password", placeholder: T, style: We })
      ] }),
      /* @__PURE__ */ o(E, { nodeId: "template:signup:signup_main:block:primary_button", label: "Submit button", children: /* @__PURE__ */ o("button", { type: "submit", disabled: i, style: { marginTop: 8, background: d, color: "#fff", border: "none", padding: "14px 20px", borderRadius: 8, cursor: i ? "wait" : "pointer", fontWeight: 600, width: "100%" }, children: i ? P : W }) })
    ] }),
    /* @__PURE__ */ o(E, { nodeId: "template:signup:signup_main:block:footer_link", label: "Sign in link", children: /* @__PURE__ */ m("p", { style: { marginTop: 20, fontSize: 14 }, children: [
      /* @__PURE__ */ m(k, { fieldPath: `${fe}.blocks.footer_link.blocks.login_prompt.settings.text`, label: "Prompt text", as: "span", children: [
        C,
        " "
      ] }),
      /* @__PURE__ */ o(I, { to: f, style: { color: d, fontWeight: 600 }, children: /* @__PURE__ */ o(k, { fieldPath: `${fe}.blocks.footer_link.blocks.login_link.settings.label`, label: "Link label", as: "span", children: M }) })
    ] }) })
  ] }) }) });
}
const Za = {
  id: "horizon",
  Header: Xo,
  Footer: Bo,
  HeroSection: kt,
  TestimonialsSection: yt,
  NewArrivalsSection: yt,
  HomePage: Na,
  ProductPage: Da,
  LoginPage: Oa,
  SignupPage: qa,
  ForgotPasswordPage: Xa,
  ProfilePage: Ba,
  OrdersPage: Ga,
  PreferencesPage: ja,
  CartPage: ar
};
export {
  Za as default,
  Za as horizonThemeContract
};
//# sourceMappingURL=theme.js.map
