import { jsx as o, jsxs as m, Fragment as Z } from "react/jsx-runtime";
import { useState as te, useMemo as M, useCallback as Me, useLayoutEffect as Rn, useEffect as le, useRef as Ke } from "react";
import { getThemeConfigValue as K, useThemeConfig as j, useStorefront as De, useStorefrontAuth as tt, useStorefrontCart as $t, useStorefrontProducts as lt, formatINR as Ge, useStorefrontPolicies as Mn, StorefrontPolicyLinks as Fn, useThemeEditorPreview as kt, usePreviewHighlightNodeId as An, layoutBlockIdFromHighlightNodeId as Nn, useStorefrontBlogs as En, useStorefrontCollections as at, useStorefrontProductVariants as Un } from "@render-store/sdk";
import { Link as D, useLocation as Io, useParams as On } from "react-router-dom";
import { createPortal as Gn } from "react-dom";
function r(e, t, n = "") {
  const i = K(e, t);
  return i == null || i === "" ? n : String(i);
}
function E(e, t, n = !1) {
  const i = K(e, t);
  return i == null ? n : !!i;
}
function x(e, t, n) {
  const i = K(e, t);
  if (i == null || i === "") return n;
  const c = Number(i);
  return Number.isFinite(c) ? c : n;
}
function Dn(e, t) {
  const n = K(e, t);
  return Array.isArray(n) ? n.filter((i) => i != null && typeof i == "object").map((i) => ({
    label: String(i.label ?? ""),
    href: String(i.href ?? "/")
  })).filter((i) => i.label) : [];
}
const jn = {
  "scheme-1": { background: "#ffffff", color: "#111827", border: "#e5e7eb" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", border: "#e2e8f0" },
  "scheme-3": { background: "#fff7ed", color: "#431407", border: "#fed7aa" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", border: "#ddd6fe" }
};
function Bn(e, t, n) {
  const i = r(e, `${t}.colorScheme`, "scheme-1");
  return jn[i] ?? n;
}
function Vo(e, t) {
  return r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function qn(e, t) {
  return Math.max(0, x(e, `${t}.gap`, 20));
}
function Xn(e, t) {
  return {
    paddingTop: x(e, `${t}.paddingTop`, 30),
    paddingBottom: x(e, `${t}.paddingBottom`, 30)
  };
}
function Ko(e, t) {
  const n = t.trim();
  if (!n) return "";
  const i = `[data-codiic-section="${e}"]`;
  return n.replace(/:root/g, i).replace(/&/g, i);
}
const mt = {
  "heading-1": { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  "heading-2": { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  "heading-3": { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  "heading-4": { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
}, Tt = {
  ...mt,
  paragraph: { fontSize: 15, fontWeight: 400, lineHeight: 1.5 }
};
function In(e, t, n, i, c) {
  const s = E(e, `${t}.inheritColorScheme`, !0), l = s ? n : {
    background: c.background,
    color: c.text,
    border: "rgba(17, 24, 39, 0.12)"
  }, a = r(e, `${t}.headingTypographyPreset`, "heading-3"), d = mt[a] ?? mt["heading-3"], h = r(e, `${t}.inputTypographyPreset`, "paragraph"), u = Tt[h] ?? Tt.paragraph, p = r(e, `${t}.inputBorder`, "all"), g = Math.max(0, x(e, `${t}.inputBorderThickness`, 1)), k = Math.max(0, x(e, `${t}.inputCornerRadius`, 100));
  return {
    blockWidth: r(e, `${t}.blockWidth`, "fill") === "custom" ? "custom" : "fill",
    inheritColorScheme: s,
    colors: l,
    heading: {
      fontFamily: i.fontHeading,
      fontSize: d.fontSize,
      fontWeight: d.fontWeight,
      lineHeight: d.lineHeight,
      color: l.color,
      margin: "0 0 16px"
    },
    input: {
      fontFamily: i.fontBody,
      fontSize: u.fontSize,
      fontWeight: u.fontWeight,
      lineHeight: u.lineHeight,
      color: l.color,
      background: l.background,
      borderStyle: p === "none" ? "none" : "all",
      borderWidth: g,
      borderColor: l.border,
      borderRadius: k
    },
    submit: {
      style: r(e, `${t}.submitStyle`, "link") === "button" ? "button" : "link",
      display: r(e, `${t}.submitDisplay`) === "text" ? "text" : "arrow",
      integrated: E(e, `${t}.submitIntegratedButton`, !0)
    },
    padding: {
      top: x(e, `${t}.paddingTop`, 0),
      right: x(e, `${t}.paddingRight`, 0),
      bottom: x(e, `${t}.paddingBottom`, 0),
      left: x(e, `${t}.paddingLeft`, 0)
    }
  };
}
function B({ sectionId: e, label: t, style: n, children: i, editorNodeId: c }) {
  const s = c ?? `layout:${e}`;
  return /* @__PURE__ */ o(
    "section",
    {
      "data-codiic-section": e,
      "data-section-id": e,
      "data-codiic-node": s,
      "data-codiic-label": t ?? e,
      "data-codiic-kind": "section",
      style: n,
      children: i
    }
  );
}
function N({ nodeId: e, label: t, style: n, children: i }) {
  return /* @__PURE__ */ o(
    "div",
    {
      "data-codiic-node": e,
      "data-codiic-label": t,
      "data-codiic-kind": "block",
      style: n,
      children: i
    }
  );
}
function S({ fieldPath: e, label: t, as: n = "span", style: i, children: c }) {
  return /* @__PURE__ */ o(
    n,
    {
      "data-codiic-node": `field:${e}`,
      "data-codiic-label": t,
      "data-codiic-kind": "field",
      style: i,
      children: c
    }
  );
}
function q() {
  const e = j(), t = String(K(e, "settings.colors.primary") ?? "#141414"), n = String(K(e, "settings.colors.background") ?? "#faf9f7"), i = String(K(e, "settings.colors.text") ?? "#141414"), c = "rgba(20, 20, 20, 0.58)", s = "#f0eeea", l = String(
    K(e, "settings.typography.fontFamily") ?? "'Cormorant Garamond', Georgia, serif"
  ), a = String(
    K(e, "settings.typography.fontFamilyBody") ?? "'DM Sans', system-ui, sans-serif"
  );
  return { primary: t, background: n, text: i, muted: c, surface: s, fontHeading: l, fontBody: a };
}
const R = {
  maxWidth: 1280,
  padX: 24,
  line: "rgba(20, 20, 20, 0.1)"
}, vt = {
  fontSize: 15,
  padding: "12px 14px",
  border: `1px solid ${R.line}`,
  borderRadius: 2,
  width: "100%",
  boxSizing: "border-box"
};
function Lt({
  label: e,
  display: t,
  style: n,
  colors: i,
  fontFamily: c,
  borderRadius: s
}) {
  const l = t === "arrow" ? "→" : e;
  return n === "link" ? /* @__PURE__ */ o(
    "button",
    {
      type: "submit",
      "aria-label": t === "arrow" ? e : void 0,
      style: {
        flexShrink: 0,
        border: "none",
        background: "transparent",
        color: i.color,
        fontFamily: c,
        fontSize: t === "arrow" ? 20 : 15,
        fontWeight: 600,
        cursor: "pointer",
        padding: "8px 14px",
        textDecoration: t === "text" ? "underline" : "none",
        lineHeight: 1
      },
      children: l
    }
  ) : /* @__PURE__ */ o(
    "button",
    {
      type: "submit",
      "aria-label": t === "arrow" ? e : void 0,
      style: {
        flexShrink: 0,
        border: "none",
        borderRadius: s,
        background: i.color,
        color: i.background,
        fontFamily: c,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        padding: "12px 24px",
        lineHeight: 1,
        whiteSpace: "nowrap"
      },
      children: l
    }
  );
}
function Yo({ sectionId: e = "footer" }) {
  const t = j(), { fontHeading: n, fontBody: i, text: c, background: s, primary: l } = q(), [a, d] = te(""), h = `sections.${e}.settings`, u = `sections.${e}.blocks.newsletter.settings`, p = M(() => {
    const U = Bn(t, h, {
      background: "#f6f6f7",
      color: "#111827",
      border: "#e5e7eb"
    }), X = Vo(t, h), O = qn(t, h), { paddingTop: Y, paddingBottom: J } = Xn(t, h), I = r(t, `${h}.customCss`, "");
    return {
      scheme: U,
      widthMode: X,
      gap: O,
      paddingTop: Y,
      paddingBottom: J,
      customCss: I
    };
  }, [t, h]), g = M(
    () => In(
      t,
      u,
      p.scheme,
      { fontHeading: n, fontBody: i },
      { text: c, background: s }
    ),
    [t, u, p.scheme, n, i, c, s, l]
  ), k = r(t, `${u}.title`), y = r(t, `${u}.subtitle`), v = r(t, `${u}.placeholder`), b = r(t, `${u}.buttonLabel`), _ = (U) => {
    U.preventDefault(), d("");
  }, $ = p.widthMode === "full" ? "100%" : R.maxWidth, w = p.widthMode === "full" ? 24 : R.padX, P = g.input.borderRadius, z = "rgba(55, 65, 81, 0.9)", L = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 32,
    width: "100%",
    flexWrap: "wrap"
  }, H = {
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
  }, T = {
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
    borderRadius: P,
    background: "#ffffff"
  }, F = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
    border: g.input.borderStyle === "none" ? "none" : `${g.input.borderWidth}px solid ${g.input.borderColor}`,
    borderRadius: P,
    background: "#ffffff"
  }, f = !!(k.trim() || y.trim());
  return /* @__PURE__ */ m(
    B,
    {
      sectionId: e,
      label: "Footer",
      style: {
        marginTop: 64,
        background: p.scheme.background || "#f6f6f7",
        color: p.scheme.color,
        borderTop: `1px solid ${p.scheme.border}`,
        fontFamily: i,
        paddingTop: p.paddingTop,
        paddingBottom: p.paddingBottom,
        paddingLeft: w,
        paddingRight: w,
        boxSizing: "border-box"
      },
      children: [
        p.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Ko(e, p.customCss) } }) : null,
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              maxWidth: $,
              margin: "0 auto",
              width: "100%"
            },
            children: /* @__PURE__ */ o(N, { nodeId: `layout:${e}:block:newsletter`, label: "Email signup", children: /* @__PURE__ */ m("div", { style: L, children: [
              f ? /* @__PURE__ */ m("div", { style: H, children: [
                k.trim() ? /* @__PURE__ */ o(
                  S,
                  {
                    fieldPath: `${u}.title`,
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
                    children: k
                  }
                ) : null,
                y.trim() ? /* @__PURE__ */ o(
                  S,
                  {
                    fieldPath: `${u}.subtitle`,
                    label: "Subtext",
                    as: "p",
                    style: {
                      margin: k.trim() ? "8px 0 0" : 0,
                      fontFamily: i,
                      fontSize: 15,
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: z,
                      maxWidth: 360
                    },
                    children: y
                  }
                ) : null
              ] }) : null,
              /* @__PURE__ */ o(
                "form",
                {
                  onSubmit: _,
                  style: {
                    ...W,
                    ...f ? {} : { flex: "1 1 100%", maxWidth: "100%" }
                  },
                  children: g.submit.integrated ? /* @__PURE__ */ o(S, { fieldPath: `${u}.placeholder`, label: "Email placeholder", as: "span", children: /* @__PURE__ */ m("div", { style: F, children: [
                    /* @__PURE__ */ o(
                      "input",
                      {
                        type: "email",
                        value: a,
                        onChange: (U) => d(U.target.value),
                        placeholder: v,
                        style: T,
                        "aria-label": v
                      }
                    ),
                    /* @__PURE__ */ o(S, { fieldPath: `${u}.buttonLabel`, label: "Button label", children: /* @__PURE__ */ o(
                      Lt,
                      {
                        label: b,
                        display: g.submit.display,
                        style: g.submit.style,
                        colors: g.colors,
                        fontFamily: i,
                        borderRadius: P
                      }
                    ) })
                  ] }) }) : /* @__PURE__ */ m(Z, { children: [
                    /* @__PURE__ */ o(S, { fieldPath: `${u}.placeholder`, label: "Email placeholder", as: "span", children: /* @__PURE__ */ o("div", { style: C, children: /* @__PURE__ */ o(
                      "input",
                      {
                        type: "email",
                        value: a,
                        onChange: (U) => d(U.target.value),
                        placeholder: v,
                        style: T,
                        "aria-label": v
                      }
                    ) }) }),
                    /* @__PURE__ */ o(S, { fieldPath: `${u}.buttonLabel`, label: "Button label", children: /* @__PURE__ */ o(
                      Lt,
                      {
                        label: b,
                        display: g.submit.display,
                        style: g.submit.style,
                        colors: {
                          color: "#111827",
                          background: "#ffffff",
                          border: p.scheme.border
                        },
                        fontFamily: i,
                        borderRadius: P
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
const Qo = {
  "scheme-1": { background: "#ffffff", color: "#111827", border: "#e5e7eb" },
  "scheme-2": { background: "#1e3a5f", color: "#eff6ff", border: "#334155" },
  "scheme-3": { background: "#431407", color: "#fff7ed", border: "#7c2d12" },
  "scheme-4": { background: "#4c1d95", color: "#f5f3ff", border: "#6d28d9" }
};
function Vn(e, t, n) {
  const i = r(e, `${t}.colorScheme`, "scheme-1");
  return Qo[i] ?? n;
}
function Kn(e, t, n) {
  const i = r(e, `${t}.colorScheme`, "scheme-1");
  return Qo[i] ?? n;
}
function Yn(e, t) {
  return r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function Qn(e, t) {
  return r(e, `${t}.headerHeight`) === "compact" ? { paddingY: 10, minHeight: 52 } : { paddingY: 16, minHeight: 64 };
}
function Zn(e, t) {
  return Math.max(0, x(e, `${t}.borderThickness`, 0));
}
function Jn(e, t) {
  const n = r(e, `${t}.stickyMode`, "");
  return n === "always" || n === "on-scroll-up" || n === "never" ? n : E(e, `${t}.sticky`, !1) ? "always" : "never";
}
function ei(e, t) {
  return E(e, `${t}.searchIcon`, !1) ? !0 : E(e, `${t}.showSearch`, !1);
}
function ti(e, t) {
  const n = t.trim();
  if (!n) return "";
  const i = `[data-codiic-section="${e}"]`;
  return n.replace(/:root/g, i).replace(/&/g, i);
}
const gt = 360;
function oi(e) {
  if (!e) return null;
  const t = e.getBoundingClientRect(), n = Math.min(Math.max(12, t.right - gt), window.innerWidth - gt - 12);
  return { top: t.bottom + 10, left: n };
}
const ut = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #dedede",
  background: "#ffffff",
  color: "#121212",
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  cursor: "pointer"
}, Rt = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 10,
  border: "1px solid #dedede",
  background: "#ffffff",
  fontSize: 15,
  color: "#121212",
  outline: "none"
};
function ni({ open: e, anchorRef: t, onClose: n, user: i, onSignOut: c }) {
  const { storeFrontMeta: s } = De(), { login: l, loading: a } = tt(), [d, h] = te(""), [u, p] = te(""), [g, k] = te(null), y = Me(() => {
    k(oi(t.current));
  }, [t]);
  Rn(() => {
    e && y();
  }, [e, y]), le(() => {
    if (!e) return;
    const $ = () => y();
    return window.addEventListener("resize", $), window.addEventListener("scroll", $, !0), () => {
      window.removeEventListener("resize", $), window.removeEventListener("scroll", $, !0);
    };
  }, [e, y]), le(() => {
    if (!e) return;
    const $ = (w) => {
      w.key === "Escape" && n();
    };
    return window.addEventListener("keydown", $), () => window.removeEventListener("keydown", $);
  }, [e, n]), le(() => {
    if (!e) return;
    const $ = (w) => {
      const P = w.target;
      t.current?.contains(P) || document.getElementById("codiic-header-account-panel")?.contains(P) || n();
    };
    return document.addEventListener("mousedown", $), () => document.removeEventListener("mousedown", $);
  }, [e, t, n]);
  const v = Me(
    async ($) => {
      if ($.preventDefault(), !(!s?.storeId || !d.trim() || !u))
        try {
          await l({
            storeId: s.storeId,
            email: d.trim(),
            password: u
          }), n();
        } catch {
        }
    },
    [d, l, n, u, s?.storeId]
  );
  if (!e || !g) return null;
  const b = {
    position: "fixed",
    top: g.top,
    left: g.left,
    width: gt,
    maxWidth: "calc(100vw - 24px)",
    zIndex: 6e3,
    fontFamily: "inherit",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    border: "1px solid rgba(0,0,0,0.08)"
  }, _ = /* @__PURE__ */ m("div", { style: { display: "flex", gap: 10, marginTop: 20 }, children: [
    /* @__PURE__ */ o(D, { to: "/my-orders", style: ut, onClick: n, children: "Orders" }),
    /* @__PURE__ */ o(D, { to: "/profile", style: ut, onClick: n, children: "Profile" }),
    /* @__PURE__ */ o(D, { to: "/preferences", style: ut, onClick: n, children: "Preferences" })
  ] });
  return Gn(
    /* @__PURE__ */ o(
      "div",
      {
        id: "codiic-header-account-panel",
        role: "dialog",
        "aria-label": i ? "Account menu" : "Sign in or create account",
        style: b,
        children: /* @__PURE__ */ m("div", { style: { padding: "20px 20px 18px" }, children: [
          /* @__PURE__ */ m("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 16 }, children: [
            /* @__PURE__ */ o("h2", { style: { margin: 0, fontSize: 18, fontWeight: 600 }, children: i ? "Account" : "Sign in or create account" }),
            /* @__PURE__ */ o("button", { type: "button", onClick: n, "aria-label": "Close", style: { border: "none", background: "#f1f1f1", borderRadius: 999, width: 32, height: 32, cursor: "pointer" }, children: "×" })
          ] }),
          i ? /* @__PURE__ */ m(Z, { children: [
            /* @__PURE__ */ m("p", { style: { margin: "0 0 8px", fontSize: 14, color: "#707070" }, children: [
              "Signed in as ",
              /* @__PURE__ */ o("strong", { children: i.email || "your account" })
            ] }),
            c ? /* @__PURE__ */ o("button", { type: "button", onClick: () => {
              n(), c();
            }, style: { border: "none", background: "transparent", color: "#005bd3", cursor: "pointer", textDecoration: "underline", padding: 0 }, children: "Sign out" }) : null,
            _
          ] }) : /* @__PURE__ */ m(Z, { children: [
            /* @__PURE__ */ m("form", { onSubmit: ($) => {
              v($);
            }, children: [
              /* @__PURE__ */ m("div", { style: { display: "grid", gap: 12 }, children: [
                /* @__PURE__ */ o("input", { type: "email", value: d, onChange: ($) => h($.target.value), placeholder: "Email", required: !0, style: Rt }),
                /* @__PURE__ */ o("input", { type: "password", value: u, onChange: ($) => p($.target.value), placeholder: "Password", required: !0, style: Rt })
              ] }),
              /* @__PURE__ */ o("button", { type: "submit", disabled: a, style: { width: "100%", marginTop: 14, padding: "13px 16px", borderRadius: 10, border: "none", background: "#005bd3", color: "#fff", fontWeight: 600, cursor: "pointer" }, children: a ? "Signing in…" : "Sign in" }),
              /* @__PURE__ */ o("p", { style: { margin: "14px 0 0", textAlign: "center", fontSize: 14 }, children: /* @__PURE__ */ o(D, { to: "/auth/signup", onClick: n, children: "Create account" }) })
            ] }),
            _
          ] })
        ] })
      }
    ),
    document.body
  );
}
const Ze = 1.75;
function ii({ color: e }) {
  return /* @__PURE__ */ m("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", "aria-hidden": !0, children: [
    /* @__PURE__ */ o("circle", { cx: "11", cy: "11", r: "6", stroke: e, strokeWidth: Ze }),
    /* @__PURE__ */ o("path", { d: "M16 16l4 4", stroke: e, strokeWidth: Ze, strokeLinecap: "round" })
  ] });
}
function Mt({ color: e }) {
  return /* @__PURE__ */ m("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", "aria-hidden": !0, children: [
    /* @__PURE__ */ o("circle", { cx: "12", cy: "8", r: "3.5", stroke: e, strokeWidth: Ze }),
    /* @__PURE__ */ o(
      "path",
      {
        d: "M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6",
        stroke: e,
        strokeWidth: Ze,
        strokeLinecap: "round"
      }
    )
  ] });
}
function ri({ color: e }) {
  return /* @__PURE__ */ m("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", "aria-hidden": !0, children: [
    /* @__PURE__ */ o(
      "path",
      {
        d: "M8 8V6a4 4 0 118 0v2",
        stroke: e,
        strokeWidth: Ze,
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ o(
      "path",
      {
        d: "M6 8h12l-1 12H7L6 8z",
        stroke: e,
        strokeWidth: Ze,
        strokeLinejoin: "round"
      }
    )
  ] });
}
function Zo({ sectionId: e = "header" }) {
  const t = j(), { pathname: n } = Io(), i = q(), { fontHeading: c, fontBody: s, primary: l, background: a } = i, { user: d, logout: h } = tt(), { getAllItems: u } = $t(), p = u().reduce((we, Qe) => we + Qe.quantity, 0), g = Ke(null), [k, y] = te(!1), v = `sections.${e}`, b = `${v}.settings`, _ = `${v}.blocks.logo.settings`, $ = `${v}.blocks.menu.settings`, w = M(() => ({
    scheme: Vn(t, b, {
      background: a,
      color: i.text,
      border: R.line
    }),
    widthMode: Yn(t, b),
    height: Qn(t, b),
    borderPx: Zn(t, b),
    stickyMode: Jn(t, b),
    customCss: r(t, `${b}.customCss`, ""),
    logoText: r(t, `${_}.text`, "My Store"),
    tagline: r(t, `${_}.tagline`, ""),
    logoUrl: r(t, `${b}.defaultLogoUrl`, "").trim(),
    hideLogoOnHomePage: E(t, `${_}.hideLogoOnHomePage`, !1),
    logoPaddingTop: Math.max(0, x(t, `${_}.paddingTop`, 0)),
    logoPaddingBottom: Math.max(0, x(t, `${_}.paddingBottom`, 0)),
    menuRow: r(t, `${$}.row`, ""),
    menuItems: Dn(t, `${$}.items`),
    menuScheme: Kn(t, $, {
      background: a,
      color: i.text,
      border: R.line
    }),
    topLevelSize: r(t, `${$}.topLevelSize`, "14px"),
    menuFont: r(t, `${$}.font`, "body"),
    menuTextCase: r(t, `${$}.textCase`, "default"),
    menuStyle: r(t, `${b}.menuStyle`, "icons"),
    searchOn: ei(t, b),
    searchPlaceholder: r(t, `${b}.searchPlaceholder`),
    cartLabel: r(t, `${b}.cartLabel`, "Cart"),
    showAccount: r(t, `${b}.customerAccountMenu`, "customer-account") !== "none",
    showCountry: E(t, `${b}.countryRegionEnabled`, !1),
    showFlag: E(t, `${b}.showFlag`, !1),
    showLanguage: E(t, `${b}.languageSelectorEnabled`, !1),
    locFont: r(t, `${b}.localizationFont`, "heading"),
    locSize: r(t, `${b}.localizationSize`, "14px"),
    countryRegionLabel: r(t, `${b}.countryRegionLabel`),
    languageLabel: r(t, `${b}.languageLabel`)
  }), [t, e, b, _, $, a, i.text, i]), {
    scheme: P,
    widthMode: z,
    height: { paddingY: L, minHeight: H },
    borderPx: W,
    stickyMode: T,
    customCss: C,
    logoText: F,
    tagline: f,
    logoUrl: U,
    hideLogoOnHomePage: X,
    logoPaddingTop: O,
    logoPaddingBottom: Y,
    menuRow: J,
    menuItems: I,
    menuScheme: ce,
    topLevelSize: pe,
    menuFont: be,
    menuTextCase: ve,
    menuStyle: Fe,
    searchOn: ge,
    searchPlaceholder: Ae,
    cartLabel: ue,
    showAccount: Se,
    showCountry: je,
    showFlag: ye,
    showLanguage: We,
    locFont: xe,
    locSize: Be,
    countryRegionLabel: qe,
    languageLabel: Xe
  } = w, { text: A, background: oe, border: ee } = P, V = ce.color, G = A, me = ti(e, C), re = {
    color: V || "#4b5563",
    textDecoration: "none",
    fontSize: pe,
    fontFamily: be === "heading" ? c : s,
    fontWeight: 400,
    textTransform: ve === "uppercase" ? "uppercase" : void 0,
    letterSpacing: ve === "uppercase" ? "0.06em" : void 0,
    whiteSpace: "nowrap"
  }, [de, ie] = te(!1);
  le(() => {
    if (T !== "on-scroll-up") return;
    const we = () => ie(window.scrollY > 8);
    return we(), window.addEventListener("scroll", we, { passive: !0 }), () => window.removeEventListener("scroll", we);
  }, [T]);
  const ze = T === "always" || T === "on-scroll-up" && de, Pe = X && (n === "/" || n === "") && !ze, Le = {
    fontSize: Be,
    fontFamily: xe === "heading" ? c : s,
    color: A,
    opacity: 0.85
  }, Ne = Pe ? null : /* @__PURE__ */ o(N, { nodeId: `layout:${e}:block:logo`, label: "Logo", children: /* @__PURE__ */ m(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        paddingTop: O,
        paddingBottom: Y
      },
      children: [
        U ? /* @__PURE__ */ o(D, { to: "/", style: { textDecoration: "none", display: "flex" }, children: /* @__PURE__ */ o("img", { src: U, alt: F, style: { maxHeight: 36, display: "block" } }) }) : /* @__PURE__ */ o(D, { to: "/", style: { textDecoration: "none", color: A }, children: /* @__PURE__ */ o(
          S,
          {
            fieldPath: `${_}.text`,
            label: "Store name",
            as: "span",
            style: {
              fontFamily: c,
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: A || "#111827",
              display: "inline-block"
            },
            children: F
          }
        ) }),
        f && !U ? /* @__PURE__ */ o(
          S,
          {
            fieldPath: `${_}.tagline`,
            label: "Tagline",
            as: "span",
            style: { marginLeft: 8, fontSize: 12, opacity: 0.65 },
            children: f
          }
        ) : null
      ]
    }
  ) }), Ye = /* @__PURE__ */ o(N, { nodeId: `layout:${e}:block:menu`, label: "Menu", children: /* @__PURE__ */ o(
    "nav",
    {
      style: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 24,
        margin: 0,
        padding: 0
      },
      "aria-label": "Main",
      children: I.map((we, Qe) => {
        const Hn = ["link_shop", "link_collections", "link_about", "link_account"][Qe] ?? `link_${Qe}`, Tn = `${$}.items.${Qe}.label`, Ln = `${$}.items.${Qe}.href`;
        return /* @__PURE__ */ o(
          N,
          {
            nodeId: `layout:${e}:block:menu:nested:${Hn}`,
            label: we.label,
            children: /* @__PURE__ */ o(S, { fieldPath: Tn, label: "Label", children: /* @__PURE__ */ o(D, { to: we.href, style: re, children: we.label }) })
          },
          Ln
        );
      })
    }
  ) }), Q = Fe !== "text", ae = /* @__PURE__ */ m(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: Q ? 20 : 12,
        flexShrink: 0
      },
      children: [
        je && qe ? /* @__PURE__ */ m("span", { style: Le, children: [
          ye ? "🇮🇳 " : "",
          qe
        ] }) : null,
        We && Xe ? /* @__PURE__ */ o("span", { style: Le, children: Xe }) : null,
        ge ? /* @__PURE__ */ o(
          D,
          {
            to: "/search",
            title: Ae,
            style: {
              display: "flex",
              alignItems: "center",
              color: G,
              textDecoration: "none",
              opacity: 0.9
            },
            "aria-label": Ae || "Search",
            children: Q ? /* @__PURE__ */ o(ii, { color: G }) : /* @__PURE__ */ o("span", { style: { fontSize: 14 }, children: "Search" })
          }
        ) : null,
        Se ? d ? /* @__PURE__ */ o(
          "button",
          {
            ref: g,
            type: "button",
            onClick: () => y((we) => !we),
            title: "Account",
            style: {
              display: "flex",
              alignItems: "center",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              color: G
            },
            "aria-label": "Account menu",
            children: Q ? /* @__PURE__ */ o(Mt, { color: G }) : /* @__PURE__ */ o("span", { style: { fontSize: 14, color: l }, children: "Account" })
          }
        ) : /* @__PURE__ */ o(
          "button",
          {
            ref: g,
            type: "button",
            onClick: () => y(!0),
            title: "Account",
            style: {
              display: "flex",
              alignItems: "center",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              color: G,
              textDecoration: "none"
            },
            "aria-label": "Account",
            children: Q ? /* @__PURE__ */ o(Mt, { color: G }) : /* @__PURE__ */ o("span", { style: { fontSize: 14, fontWeight: 600, color: l }, children: "Sign in" })
          }
        ) : null,
        /* @__PURE__ */ m(
          D,
          {
            to: "/cart",
            title: ue,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: G,
              textDecoration: "none",
              position: "relative"
            },
            "aria-label": ue,
            children: [
              Q ? /* @__PURE__ */ o(ri, { color: G }) : /* @__PURE__ */ m("span", { style: { fontSize: 13 }, children: [
                ue,
                " (",
                p,
                ")"
              ] }),
              Q && p > 0 ? /* @__PURE__ */ o(
                "span",
                {
                  style: {
                    position: "absolute",
                    top: -4,
                    right: -6,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    background: l,
                    color: a,
                    fontSize: 9,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px"
                  },
                  children: p > 9 ? "9+" : p
                }
              ) : null
            ]
          }
        )
      ]
    }
  ), Ue = /* @__PURE__ */ m(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 40,
        flex: "0 1 auto",
        minWidth: 0,
        flexWrap: "wrap"
      },
      children: [
        Ne,
        Ye
      ]
    }
  ), Ee = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 32,
    width: "100%"
  }, Re = z === "full" ? "100%" : R.maxWidth, se = J === "bottom", Pn = W > 0 ? `${W}px solid ${ee}` : `1px solid ${R.line}`;
  return /* @__PURE__ */ m(Z, { children: [
    me ? /* @__PURE__ */ o("style", { children: me }) : null,
    /* @__PURE__ */ o(
      B,
      {
        sectionId: e,
        label: "Header",
        style: {
          position: ze ? "sticky" : "relative",
          top: ze ? 0 : void 0,
          zIndex: 50,
          background: oe || "#ffffff",
          borderBottom: Pn,
          fontFamily: s,
          color: A,
          minHeight: H
        },
        children: /* @__PURE__ */ m(
          "div",
          {
            style: {
              maxWidth: Re,
              margin: "0 auto",
              padding: `${L}px ${Math.max(20, R.padX)}px`,
              display: "flex",
              flexDirection: "column",
              gap: se ? 12 : 0
            },
            children: [
              null,
              /* @__PURE__ */ o("div", { style: Ee, children: se ? /* @__PURE__ */ m(Z, { children: [
                /* @__PURE__ */ o("div", { style: { display: "flex", flex: 1, minWidth: 0 }, children: Ne }),
                ae
              ] }) : /* @__PURE__ */ m(Z, { children: [
                Ue,
                ae
              ] }) }),
              se ? /* @__PURE__ */ o("div", { style: { ...Ee, justifyContent: "flex-start" }, children: Ye }) : null
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ o(
      ni,
      {
        open: k,
        anchorRef: g,
        onClose: () => y(!1),
        user: d,
        onSignOut: () => {
          h();
        }
      }
    )
  ] });
}
const ft = "preview-store", Je = "2026-01-15T12:00:00.000Z", Ve = {
  _id: "preview-customer",
  storeId: ft,
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
  createdAt: Je,
  updatedAt: Je
}, Ft = (e, t, n) => ({
  _id: e,
  productId: "preview-product",
  optionValues: { Size: "M" },
  sku: t,
  barcode: null,
  price: n,
  chargeTax: !0,
  images: [],
  createdAt: Je,
  updatedAt: Je
}), li = [
  {
    _id: "preview_cart_1",
    storeId: ft,
    productVariantId: Ft("preview-variant-1", "Bloom Serum — 30ml", 1299),
    quantity: 1,
    createdAt: Je
  },
  {
    _id: "preview_cart_2",
    storeId: ft,
    productVariantId: Ft("preview-variant-2", "Velvet Lip Tint — Rose", 899),
    quantity: 2,
    createdAt: Je
  }
];
Ve._id, Ve.firstName, Ve.lastName, Ve.email, Ve.phoneNumber;
Ve._id;
function Jo(e) {
  const t = e?.sections;
  return new Set(t ? Object.keys(t) : []);
}
function ai(e) {
  const t = Jo(e), n = K(e, "layout_order.header");
  if (Array.isArray(n))
    return n.map((s) => String(s)).filter((s) => t.has(s));
  if (!t.size) return ["announcement_bar", "header"];
  const i = [...t].filter((s) => s === "announcement_bar" || s.startsWith("announcement_bar_")), c = t.has("header") ? ["header"] : [...t].filter((s) => s === "header" || s.startsWith("header_"));
  return [...i, ...c];
}
function di(e) {
  const t = Jo(e), n = K(e, "layout_order.footer");
  if (Array.isArray(n))
    return n.map((c) => String(c)).filter((c) => t.has(c));
  if (!t.size) return ["footer", "footer_utilities"];
  const i = [];
  return t.has("footer") && i.push("footer"), t.has("footer_utilities") && i.push("footer_utilities"), i.length ? i : ["footer"];
}
function At(e, t) {
  if (!e) return !0;
  if (t === "announcement_bar" || t.startsWith("announcement_bar_"))
    return K(e, `sections.${t}.settings.enabled`) !== !1;
  const n = K(e, `sections.${t}.enabled`);
  return n == null ? !0 : n !== !1;
}
function ci(e, t, n) {
  if (!e) return !0;
  const i = K(
    e,
    `templates.${t}.sections.${n}.enabled`
  );
  return i == null ? !0 : i !== !1;
}
function si(e, t, n, i, c) {
  const l = r(e, `${t}.buttonStyle`, n) === "primary" ? "primary" : "secondary", a = r(e, `${t}.desktopWidth`, "fit"), d = l === "primary";
  return !!c?.onImageHero && d ? {
    variant: l,
    width: a === "custom" ? "auto" : "fit-content",
    minWidth: a === "custom" ? "140px" : void 0,
    padding: "12px 28px",
    borderRadius: 9999,
    fontSize: 15,
    fontWeight: 500,
    background: "transparent",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.85)",
    openInNewTab: E(e, `${t}.openInNewTab`, !1)
  } : {
    variant: l,
    width: a === "custom" ? "auto" : "fit-content",
    minWidth: a === "custom" ? "140px" : void 0,
    padding: d ? "14px 28px" : "14px 24px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    background: d ? i.primary : "transparent",
    color: d ? i.background : i.text,
    border: d ? "none" : `1px solid ${i.line}`,
    openInNewTab: E(e, `${t}.openInNewTab`, !1)
  };
}
const Nt = {
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
function ui(e, t, n, i) {
  const c = r(e, `${t}.headingTypographyPreset`, "heading-2"), s = Nt[c] ?? Nt["heading-2"], l = r(e, `${t}.headingWidth`, "fit"), a = r(e, `${t}.headingMaxWidth`), d = r(e, `${t}.headingColor`, "heading"), h = d === "heading" ? i.heading : d === "accent" ? i.accent : i.text, u = E(e, `${t}.headingBackgroundEnabled`, !1);
  return {
    width: l === "fill" ? "100%" : "fit-content",
    maxWidth: Et[a] ?? Et.normal,
    fontFamily: n,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight,
    color: h,
    background: u ? "rgba(255,255,255,0.08)" : void 0,
    paddingTop: x(e, `${t}.headingPaddingTop`, 0),
    paddingBottom: x(e, `${t}.headingPaddingBottom`, 0),
    paddingLeft: x(e, `${t}.headingPaddingLeft`, 0),
    paddingRight: x(e, `${t}.headingPaddingRight`, 0),
    borderRadius: u ? 6 : 0
  };
}
const hi = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", muted: "#64748b" },
  "scheme-3": { background: "#fff7ed", color: "#431407", muted: "#9a3412" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", muted: "#6d28d9" },
  "scheme-5": { background: "#ecfdf5", color: "#064e3b", muted: "#047857" },
  "scheme-6": { background: "#1f2937", color: "#f9fafb", muted: "#9ca3af" }
}, Ut = {
  small: 400,
  medium: 520,
  large: 680,
  full: 900
};
function pi(e, t) {
  if (e === "transparent")
    return { background: "transparent", color: "#111827", muted: "#6b7280" };
  const n = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(e) ? e : "";
  if (n) {
    let i = n.slice(1);
    i.length === 3 && (i = i.split("").map((h) => h + h).join(""));
    const c = parseInt(i.slice(0, 2), 16), s = parseInt(i.slice(2, 4), 16), l = parseInt(i.slice(4, 6), 16), d = (0.299 * c + 0.587 * s + 0.114 * l) / 255 > 0.6;
    return {
      background: n,
      color: d ? "#111827" : "#ffffff",
      muted: d ? "#4b5563" : "rgba(255,255,255,0.72)"
    };
  }
  return hi[e] ?? t;
}
function mi(e, t, n) {
  const i = r(e, `${t}.colorScheme`, "scheme-6"), c = pi(i, n), s = r(e, `${t}.textAlign`, ""), l = r(
    e,
    `${t}.layoutAlignment`,
    s || "center"
  ), a = l === "left" ? "left" : l === "right" ? "right" : "center", d = E(e, `${t}.fullWidth`, !1), h = r(
    e,
    `${t}.sectionWidth`,
    d ? "full" : "page"
  ), u = r(e, `${t}.height`, ""), p = x(e, `${t}.minHeight`, 0), g = Ut[u] ?? (p > 0 ? p : Ut.medium), k = r(e, `${t}.position`, "bottom"), y = k === "top" ? "flex-start" : k === "center" || k === "space-between" ? "center" : "flex-end", v = a === "left" ? "flex-start" : a === "right" ? "flex-end" : "center", _ = r(e, `${t}.direction`, "vertical") === "horizontal" ? "row" : "column";
  return {
    scheme: c,
    minHeight: g,
    maxWidth: h === "full" ? "100%" : 1200,
    paddingTop: x(e, `${t}.paddingTop`, 100),
    paddingBottom: x(e, `${t}.paddingBottom`, 72),
    paddingX: 24,
    direction: _,
    alignItems: y,
    justifyContent: v,
    textAlign: a,
    gap: x(e, `${t}.layoutGap`, 24),
    media1Url: r(e, `${t}.media1ImageUrl`, ""),
    media2Url: r(e, `${t}.media2ImageUrl`, ""),
    mobileImageUrl: r(e, `${t}.mobileImageUrl`, ""),
    mobileStackMedia: E(e, `${t}.mobileStackMedia`, !1),
    mobileDifferentMedia: E(e, `${t}.mobileDifferentMedia`, !1),
    mediaOverlay: E(e, `${t}.mediaOverlay`, !0),
    overlayColor: r(e, `${t}.overlayColor`, "#12121266"),
    overlayStyle: r(e, `${t}.overlayStyle`, "solid") === "gradient" ? "gradient" : "solid",
    overlayGradientDirection: r(e, `${t}.overlayGradientDirection`, "up") === "down" ? "down" : "up",
    blurredReflection: E(e, `${t}.blurredReflection`, !1),
    sectionLink: r(e, `${t}.sectionLink`, ""),
    sectionLinkNewTab: E(e, `${t}.sectionLinkNewTab`, !1),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function gi(e, t) {
  const n = t.trim();
  return n ? n.split(`
`).map((i) => `[data-codiic-section="${e}"] ${i}`).join(`
`) : "";
}
function fi(e, t) {
  if (!t) return "";
  const n = `[data-codiic-section="${e}"] .split-showcase-grid`, i = `[data-codiic-section="${e}"] .split-showcase-tile`;
  return `@media (max-width: 749px) { ${n} { flex-direction: column !important; } ${i} { flex: 1 1 auto !important; width: 100% !important; min-height: 320px; } }`;
}
function bi(e, t, n) {
  if (!t && !n) return "";
  const i = `[data-codiic-section="${e}"] .hero-media-grid`;
  let c = "";
  return t && (c += `@media (max-width: 749px) { ${i} { flex-direction: column !important; } }`), n && (c += `@media (max-width: 749px) { ${i} .hero-media-1 { display: none; } ${i} .hero-media-2 { display: none; } ${i} .hero-media-mobile { display: block !important; flex: 1; min-height: 200px; } }`), c;
}
const yi = "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1600&q=85", xi = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85";
function et(e, t, n, i) {
  const c = K(e, t);
  if (Array.isArray(c) && c.length > 0)
    return c.map((l) => String(l));
  const s = K(e, n);
  return s != null && typeof s == "object" && !Array.isArray(s) ? Object.keys(s) : i;
}
function $i(e, t, n) {
  const i = K(e, `templates.${t}.sections`), c = i != null && typeof i == "object" && !Array.isArray(i) ? new Set(Object.keys(i)) : /* @__PURE__ */ new Set(), s = K(e, `templates.${t}.section_order`);
  return Array.isArray(s) ? s.map((l) => String(l)).filter((l) => c.has(l)) : c.size > 0 ? et(
    e,
    `templates.${t}.section_order`,
    `templates.${t}.sections`,
    n
  ).filter((a) => c.has(a)) : n.filter((l) => c.has(l));
}
function ke(e, t, n) {
  const i = et(
    e,
    `sections.${t}.block_order`,
    `sections.${t}.blocks`,
    n
  ), c = K(e, `sections.${t}.blocks`), s = c != null && typeof c == "object" && !Array.isArray(c) ? c : {};
  return i.filter((l) => s[l]?.enabled !== !1);
}
function _e(e, t, n, i) {
  const c = et(
    e,
    `templates.${t}.sections.${n}.block_order`,
    `templates.${t}.sections.${n}.blocks`,
    i
  ), s = K(e, `templates.${t}.sections.${n}.blocks`), l = s != null && typeof s == "object" && !Array.isArray(s) ? s : {};
  return c.filter((a) => l[a]?.enabled !== !1);
}
function ot() {
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
function ki(e, t, n) {
  return t === "layout" ? `sections.${e}.settings` : `templates.${n}.sections.${e}.settings`;
}
function vi(e, t, n) {
  return t === "layout" ? `sections.${e}.blocks` : `templates.${n}.sections.${e}.blocks`;
}
function en(e, t, n) {
  return t === "layout" ? `layout:${e}` : `template:${n}:${e}`;
}
function Oe(e, t, n, i) {
  return `${en(e, t, n)}:block:${i}`;
}
function ht({
  blockId: e,
  fallbackVariant: t,
  colors: n,
  blocksBase: i,
  sectionNodePrefix: c,
  onImageHero: s = !1
}) {
  const l = j(), a = `${i}.${e}.settings`, d = r(l, `${a}.label`, ""), h = r(l, `${a}.href`, "/"), u = M(
    () => si(l, a, t, n, { onImageHero: s }),
    [l, a, t, n, s]
  );
  return d.trim() ? /* @__PURE__ */ o(N, { nodeId: `${c}:block:${e}`, label: "Button", children: /* @__PURE__ */ o(
    D,
    {
      to: h,
      target: u.openInNewTab ? "_blank" : void 0,
      rel: u.openInNewTab ? "noopener noreferrer" : void 0,
      style: {
        display: "inline-block",
        width: u.width,
        minWidth: u.minWidth,
        padding: u.padding,
        borderRadius: u.borderRadius,
        background: u.background,
        color: u.color,
        border: u.border,
        textDecoration: "none",
        fontWeight: u.fontWeight,
        fontSize: u.fontSize,
        boxSizing: "border-box"
      },
      children: /* @__PURE__ */ o(S, { fieldPath: `${a}.label`, label: "Label", children: d })
    }
  ) }) : null;
}
function Si({
  blockId: e,
  blocksBase: t,
  sectionNodePrefix: n
}) {
  const i = j(), c = `${t}.${e}.settings`, s = r(i, `${c}.label`, ""), l = r(i, `${c}.href`);
  return s.trim() ? /* @__PURE__ */ o(N, { nodeId: `${n}:block:${e}`, label: "Button", children: /* @__PURE__ */ o(
    D,
    {
      to: l,
      target: E(i, `${c}.openInNewTab`, !1) ? "_blank" : void 0,
      rel: E(i, `${c}.openInNewTab`, !1) ? "noopener noreferrer" : void 0,
      style: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: 500,
        textDecoration: "underline",
        textUnderlineOffset: "3px",
        textDecorationColor: "rgba(255,255,255,0.9)"
      },
      children: /* @__PURE__ */ o(S, { fieldPath: `${c}.label`, label: "Label", children: s })
    }
  ) }) : null;
}
function St({
  sectionId: e = "hero_main",
  placement: t = "template",
  templateId: n = "index"
}) {
  const i = j(), c = q(), { text: s, background: l, primary: a, fontHeading: d, fontBody: h } = c, u = ki(e, t, n), p = vi(e, t, n), g = en(e, t, n), k = r(i, `${u}.catalogVariant`, ""), y = k === "hero-bottom-aligned", v = k === "hero-marquee", b = k === "large-logo", _ = k === "split-showcase", $ = y || v || b || _, w = !$ && !y, P = r(
    i,
    `${u}.marqueeText`,
    r(i, `${u}.subtitle`)
  ), z = r(
    i,
    `${p}.text_right.settings.text`,
    r(i, `${u}.splitRightTitle`)
  ), L = y ? {
    textIntro: `${p}.content_group.blocks.heading_group.blocks.text_intro.settings.text`,
    headingMain: `${p}.content_group.blocks.heading_group.blocks.heading_main.settings.text`,
    textBody: `${p}.content_group.blocks.text_body.settings.text`
  } : null, H = r(
    i,
    L?.textIntro ?? `${u}.eyebrow`,
    ""
  ), W = r(
    i,
    L?.headingMain ?? `${u}.title`,
    "Welcome"
  ), T = r(i, `${u}.subtitle`, ""), C = r(
    i,
    L?.textBody ?? `${p}.text_2.settings.text`,
    ""
  ) || T, F = (A) => A === "text_body" ? `${g}:block:content_group:nested:text_body` : `${g}:block:content_group:nested:heading_group:nested:${A}`, f = M(
    () => mi(i, u, {
      background: l,
      color: s,
      muted: "#9ca3af"
    }),
    [i, u, l, s]
  ), U = M(
    () => ui(i, u, d, {
      text: f.scheme.color,
      heading: f.scheme.color,
      accent: a
    }),
    [i, u, d, f.scheme.color, a]
  ), X = M(
    () => ({
      primary: a,
      background: l,
      text: f.scheme.color,
      line: R.line
    }),
    [a, l, f.scheme.color]
  ), O = y ? ["content_group"] : v ? ["primary_button"] : b ? ["text_2"] : _ ? ["heading", "text_right", "primary_button", "secondary_button"] : ["heading", "primary_button"], Y = t === "layout" ? ke(i, e, O) : _e(i, n, e, O), J = gi(e, f.customCss), I = bi(e, f.mobileStackMedia, f.mobileDifferentMedia), ce = f.overlayStyle === "gradient" ? f.overlayGradientDirection === "down" ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : `linear-gradient(180deg, ${f.overlayColor} 0%, transparent 100%)` : f.overlayColor, pe = !!(f.media1Url || f.media2Url), be = {
    primary_button: /* @__PURE__ */ o(
      ht,
      {
        blockId: "primary_button",
        fallbackVariant: "primary",
        colors: X,
        blocksBase: p,
        sectionNodePrefix: g,
        onImageHero: w || v
      }
    ),
    secondary_button: /* @__PURE__ */ o(
      ht,
      {
        blockId: "secondary_button",
        fallbackVariant: "secondary",
        colors: X,
        blocksBase: p,
        sectionNodePrefix: g,
        onImageHero: w
      }
    )
  }, ve = (A, oe = !1) => {
    if (A === "heading" || A.startsWith("heading_")) {
      const V = `${p}.${A}.settings.heading`, G = r(i, V, A === "heading" ? W : "");
      return G.trim() ? /* @__PURE__ */ o(N, { nodeId: Oe(e, t, n, A), label: "Heading", children: /* @__PURE__ */ o(
        S,
        {
          fieldPath: V,
          label: "Text",
          as: "h1",
          style: oe ? {
            margin: 0,
            width: "100%",
            maxWidth: 720,
            fontFamily: d,
            fontSize: "clamp(2.4rem, 5.2vw, 3.5rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textAlign: "center"
          } : {
            margin: 0,
            width: U.width,
            maxWidth: U.maxWidth,
            fontFamily: U.fontFamily,
            fontSize: U.fontSize,
            fontWeight: U.fontWeight,
            lineHeight: U.lineHeight,
            color: U.color,
            background: U.background,
            paddingTop: U.paddingTop,
            paddingBottom: U.paddingBottom,
            paddingLeft: U.paddingLeft,
            paddingRight: U.paddingRight,
            borderRadius: U.borderRadius,
            boxSizing: "border-box"
          },
          children: G
        }
      ) }) : null;
    }
    if (A === "text_2" || A.startsWith("text_") && A !== "heading") {
      const V = r(i, `${p}.${A}.settings.text`, "") || (A === "text_2" ? T : "");
      return V.trim() ? /* @__PURE__ */ o(N, { nodeId: Oe(e, t, n, A), label: "Text", children: /* @__PURE__ */ o(
        S,
        {
          fieldPath: `${p}.${A}.settings.text`,
          label: "Text",
          as: "p",
          style: oe ? {
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
          children: V
        }
      ) }) : null;
    }
    if (A === "primary_button" || A === "secondary_button") {
      const V = be[A];
      return V ? /* @__PURE__ */ o("span", { children: V }, A) : null;
    }
    const ee = r(i, `${p}.${A}.type`, "");
    if (ee === "image" || ee === "video") {
      const V = r(i, `${p}.${A}.settings.url`, "").trim();
      if (!V) return null;
      const G = ee === "video";
      return /* @__PURE__ */ o(N, { nodeId: Oe(e, t, n, A), label: G ? "Video" : "Image", children: G ? /* @__PURE__ */ o(
        "video",
        {
          src: V,
          controls: !0,
          muted: E(i, `${p}.${A}.settings.muted`, !0),
          autoPlay: E(i, `${p}.${A}.settings.autoplay`, !1),
          style: { width: "100%", maxWidth: 520, borderRadius: 10 }
        }
      ) : /* @__PURE__ */ o("img", { src: V, alt: "", style: { width: "100%", maxWidth: 520, borderRadius: 10, display: "block" } }) });
    }
    if (ee === "logo") {
      const V = r(i, `${p}.${A}.settings.imageUrl`, "").trim(), G = r(i, `${p}.${A}.settings.text`, "").trim();
      return !V && !G ? null : /* @__PURE__ */ o(N, { nodeId: Oe(e, t, n, A), label: "Logo", children: V ? /* @__PURE__ */ o("img", { src: V, alt: G || "Logo", style: { maxHeight: 72, width: "auto", display: "block" } }) : /* @__PURE__ */ o("p", { style: { margin: 0, fontSize: 20, fontWeight: 700, color: f.scheme.color }, children: G }) });
    }
    if (ee === "icon") {
      const V = r(i, `${p}.${A}.settings.icon`, "star").trim(), G = r(i, `${p}.${A}.settings.label`, "").trim();
      return /* @__PURE__ */ o(N, { nodeId: Oe(e, t, n, A), label: "Icon", children: /* @__PURE__ */ m("div", { style: { display: "inline-flex", alignItems: "center", gap: 8, color: f.scheme.color }, children: [
        /* @__PURE__ */ o("span", { style: { fontSize: 20, lineHeight: 1 }, children: V === "heart" ? "♥" : V === "check" ? "✓" : "★" }),
        G ? /* @__PURE__ */ o("span", { style: { fontSize: 14 }, children: G }) : null
      ] }) });
    }
    if (ee === "page") {
      const V = r(i, `${p}.${A}.settings.title`, "").trim(), G = r(i, `${p}.${A}.settings.href`, "/").trim();
      return V ? /* @__PURE__ */ o(N, { nodeId: Oe(e, t, n, A), label: "Page", children: /* @__PURE__ */ o(D, { to: G, style: { color: f.scheme.color, textDecoration: "underline", textUnderlineOffset: 3 }, children: V }) }) : null;
    }
    return ee === "button" || A.endsWith("_button") ? /* @__PURE__ */ o("span", { children: /* @__PURE__ */ o(
      ht,
      {
        blockId: A,
        fallbackVariant: A === "secondary_button" ? "secondary" : "primary",
        colors: X,
        blocksBase: p,
        sectionNodePrefix: g,
        onImageHero: w || v
      }
    ) }, A) : null;
  }, Fe = (A = !1) => Y.map((oe) => /* @__PURE__ */ o("span", { style: { display: "contents" }, children: ve(oe, A) }, oe)), ge = Math.max(200, f.minHeight - f.paddingTop - f.paddingBottom), Ae = typeof f.maxWidth == "number" ? f.maxWidth : f.maxWidth === "100%" ? "100%" : 1200, ue = "#ffffff", Se = () => {
    if (!L) return null;
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
            H.trim() ? /* @__PURE__ */ o(N, { nodeId: F("text_intro"), label: "Text", children: /* @__PURE__ */ o(
              S,
              {
                fieldPath: L.textIntro,
                label: "Text",
                as: "p",
                style: {
                  margin: 0,
                  fontSize: 14,
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  lineHeight: 1.4,
                  color: ue
                },
                children: H
              }
            ) }) : null,
            W.trim() ? /* @__PURE__ */ o(N, { nodeId: F("heading_main"), label: "Heading", children: /* @__PURE__ */ o(
              S,
              {
                fieldPath: L.headingMain,
                label: "Text",
                as: "h1",
                style: {
                  margin: H.trim() ? "8px 0 0" : 0,
                  fontFamily: d,
                  fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
                  fontWeight: 400,
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  color: ue
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
              children: /* @__PURE__ */ o(N, { nodeId: F("text_body"), label: "Text", children: /* @__PURE__ */ o(
                S,
                {
                  fieldPath: L.textBody,
                  label: "Text",
                  as: "p",
                  style: {
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: ue
                  },
                  children: C
                }
              ) })
            }
          ) : null
        ]
      }
    );
  }, je = /* @__PURE__ */ m(
    "div",
    {
      style: {
        position: "relative",
        zIndex: 2,
        flex: f.direction === "row" ? "0 0 42%" : void 0,
        maxWidth: f.direction === "column" ? Ae : void 0,
        width: f.direction === "column" ? "100%" : void 0,
        margin: f.direction === "column" ? "0 auto" : void 0,
        textAlign: f.textAlign,
        display: "flex",
        flexDirection: "column",
        alignItems: f.textAlign === "left" ? "flex-start" : f.textAlign === "right" ? "flex-end" : "center",
        gap: f.gap
      },
      children: [
        H ? /* @__PURE__ */ o(
          S,
          {
            fieldPath: `${u}.eyebrow`,
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
            children: H
          }
        ) : null,
        Fe()
      ]
    }
  ), ye = () => /* @__PURE__ */ o(
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
            fontFamily: d,
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
              S,
              {
                fieldPath: `${u}.marqueeText`,
                label: "Marquee",
                as: "span",
                style: { padding: "0 0.35em", display: "inline" },
                children: [
                  P,
                  " "
                ]
              }
            ),
            /* @__PURE__ */ m("span", { style: { padding: "0 0.35em" }, "aria-hidden": !0, children: [
              P,
              " "
            ] })
          ]
        }
      )
    }
  ), We = y ? Se() : je, xe = (A, oe, ee) => A ? /* @__PURE__ */ o(
    "div",
    {
      className: oe,
      style: {
        flex: 1,
        minHeight: f.direction === "row" ? "100%" : 240,
        background: `center/cover url(${A}) no-repeat`,
        filter: ee ? "blur(12px)" : void 0,
        transform: ee ? "scale(1.05)" : void 0
      }
    }
  ) : /* @__PURE__ */ o(
    "div",
    {
      className: oe,
      style: {
        flex: 1,
        minHeight: f.direction === "row" ? "100%" : 200,
        background: `linear-gradient(135deg, ${f.scheme.muted}33, ${f.scheme.background})`
      }
    }
  ), Be = !pe, qe = /* @__PURE__ */ o(
    "div",
    {
      className: "hero-media-grid",
      style: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: $ && !_ ? "column" : f.direction,
        alignItems: y || _ ? "stretch" : f.alignItems,
        justifyContent: y ? "flex-end" : v ? "center" : f.justifyContent,
        gap: f.gap,
        minHeight: ge,
        width: "100%",
        maxWidth: typeof f.maxWidth == "number" ? f.maxWidth : void 0,
        margin: "0 auto",
        padding: $ ? 0 : `0 ${f.paddingX}px`,
        boxSizing: "border-box"
      },
      children: v ? We : pe && f.direction === "row" ? /* @__PURE__ */ m(Z, { children: [
        xe(f.media1Url, "hero-media-1", f.blurredReflection),
        We,
        f.media2Url ? xe(f.media2Url, "hero-media-2", f.blurredReflection) : null
      ] }) : /* @__PURE__ */ m(Z, { children: [
        pe ? /* @__PURE__ */ m("div", { style: { display: "flex", gap: f.gap, width: "100%" }, children: [
          xe(f.media1Url, "hero-media-1", f.blurredReflection),
          f.media2Url ? xe(f.media2Url, "hero-media-2", f.blurredReflection) : null,
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
        We
      ] })
    }
  ), Xe = f.sectionLink ? /* @__PURE__ */ o(
    D,
    {
      to: f.sectionLink,
      target: f.sectionLinkNewTab ? "_blank" : void 0,
      rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
      style: { textDecoration: "none", color: "inherit", display: "block" },
      children: qe
    }
  ) : qe;
  if (y) {
    const A = f.media1Url.trim(), oe = f.minHeight, ee = Math.max(f.paddingX, 40), V = Math.max(f.paddingBottom, 48), G = f.paddingTop > 0 ? f.paddingTop : 0, me = f.mediaOverlay && (A || !pe) ? ce : void 0, ne = /* @__PURE__ */ o(
      "div",
      {
        style: {
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: oe,
          width: "100%",
          padding: `${G}px ${ee}px ${V}px`,
          boxSizing: "border-box"
        },
        children: Se()
      }
    ), he = f.sectionLink ? /* @__PURE__ */ o(
      D,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: ne
      }
    ) : ne;
    return /* @__PURE__ */ m(Z, { children: [
      J ? /* @__PURE__ */ o("style", { children: J }) : null,
      I ? /* @__PURE__ */ o("style", { children: I }) : null,
      /* @__PURE__ */ m(
        B,
        {
          sectionId: e,
          editorNodeId: g,
          label: "Hero: Bottom aligned",
          style: {
            position: "relative",
            overflow: "hidden",
            width: "100%",
            minHeight: oe,
            padding: 0,
            background: "#2d6478",
            fontFamily: h,
            color: ue,
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
            ) : /* @__PURE__ */ o(ot, {}),
            me ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: me,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            he
          ]
        }
      )
    ] });
  }
  if (v) {
    const A = f.media1Url.trim(), oe = f.minHeight, ee = Math.max(f.paddingBottom, 48), V = f.mediaOverlay && (A || !pe) ? ce : void 0, G = /* @__PURE__ */ m(
      "div",
      {
        style: {
          position: "relative",
          minHeight: oe,
          width: "100%",
          boxSizing: "border-box"
        },
        children: [
          ye(),
          /* @__PURE__ */ o(
            "div",
            {
              style: {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: ee,
                zIndex: 4,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "auto"
              },
              children: be.primary_button ? /* @__PURE__ */ o("span", { style: { display: "inline-flex" }, children: be.primary_button }) : null
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
    ), me = f.sectionLink ? /* @__PURE__ */ o(
      D,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: G
      }
    ) : G;
    return /* @__PURE__ */ m(Z, { children: [
      J ? /* @__PURE__ */ o("style", { children: J }) : null,
      I ? /* @__PURE__ */ o("style", { children: I }) : null,
      /* @__PURE__ */ m(
        B,
        {
          sectionId: e,
          editorNodeId: g,
          label: "Hero: Marquee",
          style: {
            position: "relative",
            overflow: "hidden",
            width: "100%",
            minHeight: oe,
            padding: 0,
            background: "#2d6478",
            fontFamily: h,
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
            ) : /* @__PURE__ */ o(ot, {}),
            V ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: V,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            me
          ]
        }
      )
    ] });
  }
  if (b) {
    const A = r(i, `${p}.text_2.settings.text`, "") || T || C, oe = W.trim() || "My Store", ee = Math.max(f.paddingTop, 40), V = Math.max(f.paddingBottom, 48), G = 40, me = f.minHeight, ne = r(i, `${u}.backgroundMedia`, "none"), he = r(i, `${u}.backgroundImageUrl`, ""), re = ne === "image" && !!he.trim(), de = r(i, `${u}.borderStyle`, "none"), ie = x(i, `${u}.cornerRadius`, 0), ze = r(i, `${u}.defaultLogoUrl`, ""), Ie = de === "solid" ? `1px solid ${f.scheme.muted}55` : void 0, Pe = f.mediaOverlay && re ? f.overlayStyle === "gradient" ? f.overlayGradientDirection === "down" ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : `linear-gradient(180deg, ${f.overlayColor} 0%, transparent 100%)` : f.overlayColor : void 0, Le = /* @__PURE__ */ m(
      "div",
      {
        style: {
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: typeof f.maxWidth == "number" ? f.maxWidth : void 0,
          margin: "0 auto",
          minHeight: me,
          padding: `${ee}px ${G}px ${V}px`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          borderRadius: ie > 0 ? ie : void 0,
          border: Ie,
          overflow: ie > 0 ? "hidden" : void 0
        },
        children: [
          A.trim() ? /* @__PURE__ */ o(N, { nodeId: Oe(e, t, n, "text_2"), label: "Text", children: /* @__PURE__ */ o(
            S,
            {
              fieldPath: `${p}.text_2.settings.text`,
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
              children: ze.trim() ? /* @__PURE__ */ o(S, { fieldPath: `${u}.defaultLogoUrl`, label: "Default logo", as: "div", children: /* @__PURE__ */ o(
                "img",
                {
                  src: ze,
                  alt: oe,
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
                S,
                {
                  fieldPath: `${u}.title`,
                  label: "Text",
                  as: "h1",
                  style: {
                    margin: 0,
                    fontFamily: d,
                    fontSize: "clamp(4rem, 18vw, 11rem)",
                    fontWeight: 800,
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    color: "#000000",
                    textAlign: "center"
                  },
                  children: oe
                }
              )
            }
          )
        ]
      }
    ), Ne = f.sectionLink ? /* @__PURE__ */ o(
      D,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: Le
      }
    ) : Le;
    return /* @__PURE__ */ m(Z, { children: [
      J ? /* @__PURE__ */ o("style", { children: J }) : null,
      I ? /* @__PURE__ */ o("style", { children: I }) : null,
      /* @__PURE__ */ m(
        B,
        {
          sectionId: e,
          editorNodeId: g,
          label: "Large logo",
          style: {
            position: "relative",
            overflow: "hidden",
            width: "100%",
            minHeight: me,
            padding: 0,
            background: re ? f.scheme.background : f.scheme.background || "#f0f1ed",
            fontFamily: h,
            color: "#111827",
            boxSizing: "border-box"
          },
          children: [
            re ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: `center/cover url(${he}) no-repeat`
                }
              }
            ) : null,
            Pe ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: Pe,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            Ne
          ]
        }
      )
    ] });
  }
  if (_) {
    const A = f.media1Url.trim() || yi, oe = f.media2Url.trim() || xi, ee = f.minHeight, V = E(i, `${u}.verticalOnMobile`, !0), G = r(i, `${u}.backgroundMedia`, "none"), me = r(i, `${u}.backgroundImageUrl`, ""), ne = G === "image" && !!me.trim(), he = r(i, `${u}.borderStyle`, "none"), re = x(i, `${u}.cornerRadius`, 0), de = he === "solid" ? `1px solid ${f.scheme.muted}55` : void 0, ie = fi(e, V), ze = f.mediaOverlay && A ? f.overlayStyle === "gradient" ? f.overlayGradientDirection === "down" ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : `linear-gradient(180deg, ${f.overlayColor} 0%, transparent 100%)` : f.overlayColor : void 0, Ie = f.mediaOverlay && ne ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : void 0, Pe = {
      margin: 0,
      fontFamily: d,
      fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
      fontWeight: 700,
      lineHeight: 1.1,
      color: "#ffffff",
      textAlign: "center",
      textShadow: "0 2px 16px rgba(0,0,0,0.35)"
    }, Le = (Q, ae, Ue, Ee, Re) => /* @__PURE__ */ m(
      "div",
      {
        className: "split-showcase-tile",
        style: {
          flex: "1 1 50%",
          position: "relative",
          minHeight: ee,
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
                background: `center/cover url(${Q}) no-repeat`
              }
            }
          ),
          ze ? /* @__PURE__ */ o(
            "div",
            {
              "aria-hidden": !0,
              style: {
                position: "absolute",
                inset: 0,
                background: ze,
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
                minHeight: ee,
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
                    children: ae.trim() ? Ee ? /* @__PURE__ */ o(
                      N,
                      {
                        nodeId: Oe(e, t, n, Ee),
                        label: "Text",
                        children: /* @__PURE__ */ o(S, { fieldPath: Ue, label: "Text", as: "h2", style: Pe, children: ae })
                      }
                    ) : /* @__PURE__ */ o(S, { fieldPath: Ue, label: "Text", as: "h2", style: Pe, children: ae }) : null
                  }
                ),
                /* @__PURE__ */ o("div", { style: { flexShrink: 0, paddingTop: 8 }, children: /* @__PURE__ */ o(
                  Si,
                  {
                    blockId: Re,
                    blocksBase: p,
                    sectionNodePrefix: g
                  }
                ) })
              ]
            }
          )
        ]
      }
    ), Ne = /* @__PURE__ */ m(
      "div",
      {
        className: "split-showcase-grid",
        style: {
          display: "flex",
          flexDirection: f.direction,
          gap: f.gap,
          width: "100%",
          minHeight: ee,
          boxSizing: "border-box"
        },
        children: [
          Le(
            A,
            W,
            `${u}.title`,
            "heading",
            "primary_button"
          ),
          Le(
            oe,
            z,
            `${p}.text_right.settings.text`,
            "text_right",
            "secondary_button"
          )
        ]
      }
    ), Ye = f.sectionLink ? /* @__PURE__ */ o(
      D,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: Ne
      }
    ) : Ne;
    return /* @__PURE__ */ m(Z, { children: [
      J ? /* @__PURE__ */ o("style", { children: J }) : null,
      ie ? /* @__PURE__ */ o("style", { children: ie }) : null,
      /* @__PURE__ */ m(
        B,
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
            minHeight: ee,
            paddingTop: f.paddingTop,
            paddingBottom: f.paddingBottom,
            background: f.scheme.background,
            borderRadius: re > 0 ? re : void 0,
            border: de,
            fontFamily: h,
            color: "#ffffff",
            boxSizing: "border-box"
          },
          children: [
            ne ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: `center/cover url(${me}) no-repeat`
                }
              }
            ) : null,
            Ie ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: Ie,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            /* @__PURE__ */ o("div", { style: { position: "relative", zIndex: 2 }, children: Ye })
          ]
        }
      )
    ] });
  }
  if (w) {
    const A = f.media1Url.trim(), oe = f.minHeight, ee = f.mediaOverlay ? f.overlayStyle === "gradient" ? f.overlayGradientDirection === "down" ? `linear-gradient(180deg, transparent 0%, ${f.overlayColor} 100%)` : `linear-gradient(180deg, ${f.overlayColor} 0%, transparent 100%)` : f.overlayColor : void 0, V = /* @__PURE__ */ o(
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
          minHeight: oe,
          width: "100%",
          padding: `${f.paddingTop}px 24px ${f.paddingBottom}px`,
          boxSizing: "border-box",
          gap: Math.min(f.gap, 20)
        },
        children: Fe(!0)
      }
    ), G = f.sectionLink ? /* @__PURE__ */ o(
      D,
      {
        to: f.sectionLink,
        target: f.sectionLinkNewTab ? "_blank" : void 0,
        rel: f.sectionLinkNewTab ? "noopener noreferrer" : void 0,
        style: { textDecoration: "none", color: "inherit", display: "block", width: "100%" },
        children: V
      }
    ) : V;
    return /* @__PURE__ */ m(Z, { children: [
      J ? /* @__PURE__ */ o("style", { children: J }) : null,
      I ? /* @__PURE__ */ o("style", { children: I }) : null,
      /* @__PURE__ */ m(
        B,
        {
          sectionId: e,
          editorNodeId: g,
          label: "Hero",
          style: {
            position: "relative",
            overflow: "hidden",
            width: "100%",
            minHeight: oe,
            padding: 0,
            background: "#1a3a4a",
            fontFamily: h,
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
            ) : /* @__PURE__ */ o(ot, {}),
            ee ? /* @__PURE__ */ o(
              "div",
              {
                "aria-hidden": !0,
                style: {
                  position: "absolute",
                  inset: 0,
                  background: ee,
                  zIndex: 1,
                  pointerEvents: "none"
                }
              }
            ) : null,
            G
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ m(Z, { children: [
    J ? /* @__PURE__ */ o("style", { children: J }) : null,
    I ? /* @__PURE__ */ o("style", { children: I }) : null,
    /* @__PURE__ */ m(
      B,
      {
        sectionId: e,
        editorNodeId: g,
        label: y ? "Hero: Bottom aligned" : v ? "Hero: Marquee" : b ? "Large logo" : _ ? "Split showcase" : "Hero",
        style: {
          position: "relative",
          overflow: "hidden",
          minHeight: f.minHeight,
          paddingTop: b ? 0 : f.paddingTop,
          paddingBottom: b ? 0 : f.paddingBottom,
          background: b ? "#f3f0ea" : pe ? void 0 : f.scheme.background,
          fontFamily: h,
          color: f.scheme.color,
          boxSizing: "border-box"
        },
        children: [
          Be && !b ? /* @__PURE__ */ o(ot, {}) : null,
          (!pe || f.direction === "column") && f.media1Url ? /* @__PURE__ */ o(
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
          f.mediaOverlay && (pe || Be) ? /* @__PURE__ */ o(
            "div",
            {
              "aria-hidden": !0,
              style: {
                position: "absolute",
                inset: 0,
                background: ce,
                zIndex: 1,
                pointerEvents: "none"
              }
            }
          ) : null,
          Xe
        ]
      }
    )
  ] });
}
const Ot = {
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
}, wi = {
  auto: void 0,
  small: 320,
  medium: 480,
  large: 640
};
function Ci(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.height`, "auto"), c = r(e, `${t}.direction`, "vertical"), s = r(e, `${t}.layoutAlignment`, "center");
  return {
    direction: c === "horizontal" ? "horizontal" : "vertical",
    alignment: s === "left" || s === "right" ? s : "center",
    position: ["top", "bottom"].includes(r(e, `${t}.position`, "center")) ? r(e, `${t}.position`, "center") : "center",
    gap: x(e, `${t}.layoutGap`, 32),
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: i,
    minHeight: wi[i],
    colorScheme: Ot[n] ?? Ot["scheme-1"],
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none") === "image" ? "image" : "none",
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none") === "solid" ? "solid" : "none",
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: E(e, `${t}.backgroundOverlay`, !1),
    paddingTop: x(e, `${t}.paddingTop`, 32),
    paddingBottom: x(e, `${t}.paddingBottom`, 32),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function _i(e, t) {
  const n = t.trim();
  return n ? n.replace(/:root/g, `[data-codiic-section="${e}"]`) : "";
}
function tn({
  sectionId: e = "contact_form",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), [l, a] = te(""), [d, h] = te(""), [u, p] = te(""), [g, k] = te(""), y = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, v = n === "template" ? `template:${t}:${e}` : `layout:${e}`, b = M(() => Ci(i, y), [i, y]), _ = r(i, `${y}.title`), $ = r(i, `${y}.namePlaceholder`), w = r(i, `${y}.emailPlaceholder`), P = r(i, `${y}.phonePlaceholder`), z = r(i, `${y}.commentPlaceholder`), L = r(i, `${y}.submitLabel`), H = b.colorScheme, W = b.sectionWidth === "full" ? "100%" : R.maxWidth, T = b.sectionWidth === "full" ? 24 : R.padX, C = b.alignment === "left" ? "left" : b.alignment === "right" ? "right" : "center", F = b.position === "top" ? "flex-start" : b.position === "bottom" ? "flex-end" : "center", f = Math.max(b.cornerRadius > 0 ? b.cornerRadius : 8, 0), U = {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: c,
    fontSize: 15,
    lineHeight: 1.4,
    color: H.color,
    background: H.inputBg,
    border: `1px solid ${H.inputBorder}`,
    borderRadius: f,
    padding: "12px 14px",
    outline: "none"
  }, X = (I) => {
    I.preventDefault(), a(""), h(""), p(""), k("");
  }, O = {
    position: "relative",
    background: H.background,
    color: H.color,
    fontFamily: c,
    paddingTop: b.paddingTop,
    paddingBottom: b.paddingBottom,
    paddingLeft: T,
    paddingRight: T,
    boxSizing: "border-box",
    border: b.borderStyle === "solid" ? `1px solid ${H.border}` : void 0,
    borderRadius: b.cornerRadius > 0 ? b.cornerRadius : void 0,
    overflow: "hidden",
    ...b.minHeight != null ? { minHeight: b.minHeight } : {}
  }, Y = {
    maxWidth: W,
    margin: "0 auto",
    width: "100%",
    minHeight: b.minHeight != null ? b.minHeight - b.paddingTop - b.paddingBottom : void 0,
    display: "flex",
    flexDirection: b.direction === "horizontal" ? "row" : "column",
    alignItems: b.direction === "horizontal" ? "center" : void 0,
    justifyContent: F,
    gap: b.gap,
    textAlign: C
  }, J = {
    maxWidth: 520,
    width: "100%",
    margin: b.alignment === "center" ? "0 auto" : void 0,
    marginLeft: b.alignment === "right" ? "auto" : void 0,
    marginRight: b.alignment === "left" ? "auto" : void 0,
    flex: b.direction === "horizontal" ? "1 1 320px" : void 0
  };
  return /* @__PURE__ */ m(B, { sectionId: e, editorNodeId: v, label: "Contact form", style: O, children: [
    b.backgroundMedia === "image" && b.backgroundImageUrl ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${b.backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    b.backgroundOverlay && b.backgroundMedia === "image" ? /* @__PURE__ */ o(
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
    b.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: _i(e, b.customCss) } }) : null,
    /* @__PURE__ */ m("div", { style: { ...Y, position: "relative", zIndex: 2 }, children: [
      /* @__PURE__ */ o(
        S,
        {
          fieldPath: `${y}.title`,
          label: "Heading",
          as: "h2",
          style: {
            margin: 0,
            flex: b.direction === "horizontal" ? "0 0 auto" : void 0,
            fontFamily: s,
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.2,
            color: H.color,
            textAlign: C
          },
          children: _
        }
      ),
      /* @__PURE__ */ m("form", { onSubmit: X, style: J, children: [
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
              /* @__PURE__ */ o(S, { fieldPath: `${y}.namePlaceholder`, label: "Name placeholder", as: "span", children: /* @__PURE__ */ o(
                "input",
                {
                  type: "text",
                  value: l,
                  onChange: (I) => a(I.target.value),
                  placeholder: $,
                  style: U,
                  "aria-label": $
                }
              ) }),
              /* @__PURE__ */ o(S, { fieldPath: `${y}.emailPlaceholder`, label: "Email placeholder", as: "span", children: /* @__PURE__ */ o(
                "input",
                {
                  type: "email",
                  value: d,
                  onChange: (I) => h(I.target.value),
                  placeholder: w,
                  style: U,
                  "aria-label": w
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ o("div", { style: { marginBottom: 12 }, children: /* @__PURE__ */ o(S, { fieldPath: `${y}.phonePlaceholder`, label: "Phone placeholder", as: "span", children: /* @__PURE__ */ o(
          "input",
          {
            type: "tel",
            value: u,
            onChange: (I) => p(I.target.value),
            placeholder: P,
            style: U,
            "aria-label": P
          }
        ) }) }),
        /* @__PURE__ */ o("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ o(S, { fieldPath: `${y}.commentPlaceholder`, label: "Comment placeholder", as: "span", children: /* @__PURE__ */ o(
          "textarea",
          {
            value: g,
            onChange: (I) => k(I.target.value),
            placeholder: z,
            rows: 5,
            style: { ...U, resize: "vertical", minHeight: 120 },
            "aria-label": z
          }
        ) }) }),
        /* @__PURE__ */ o(S, { fieldPath: `${y}.submitLabel`, label: "Submit button", children: /* @__PURE__ */ o(
          "button",
          {
            type: "submit",
            style: {
              fontFamily: c,
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1,
              color: H.buttonColor,
              background: H.buttonBg,
              border: "none",
              borderRadius: 9999,
              padding: "14px 28px",
              cursor: "pointer"
            },
            children: L
          }
        ) })
      ] })
    ] })
  ] });
}
const Gt = {
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
}, Wi = {
  auto: void 0,
  small: 280,
  medium: 400,
  large: 520
};
function zi(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.height`, "auto"), c = r(e, `${t}.direction`, "vertical"), s = r(e, `${t}.layoutAlignment`, "center");
  return {
    direction: c === "horizontal" ? "horizontal" : "vertical",
    alignment: s === "left" || s === "right" ? s : "center",
    position: ["top", "bottom"].includes(r(e, `${t}.position`, "center")) ? r(e, `${t}.position`, "center") : "center",
    gap: x(e, `${t}.layoutGap`, 16),
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: i,
    minHeight: Wi[i],
    colorScheme: Gt[n] ?? Gt["scheme-1"],
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none") === "image" ? "image" : "none",
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none") === "solid" ? "solid" : "none",
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: E(e, `${t}.backgroundOverlay`, !1),
    paddingTop: x(e, `${t}.paddingTop`, 40),
    paddingBottom: x(e, `${t}.paddingBottom`, 40),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Pi(e, t) {
  const n = t.trim();
  return n ? n.replace(/:root/g, `[data-codiic-section="${e}"]`) : "";
}
function on({
  sectionId: e = "email_signup",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), [l, a] = te(""), d = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, h = n === "template" ? `template:${t}:${e}` : `layout:${e}`, u = M(() => zi(i, d), [i, d]), p = r(i, `${d}.title`), g = r(i, `${d}.subtitle`), k = r(i, `${d}.placeholder`), y = r(i, `${d}.buttonLabel`), v = u.colorScheme, b = u.sectionWidth === "full" ? "100%" : R.maxWidth, _ = u.sectionWidth === "full" ? 24 : R.padX, $ = u.alignment === "left" ? "left" : u.alignment === "right" ? "right" : "center", w = u.position === "top" ? "flex-start" : u.position === "bottom" ? "flex-end" : "center", P = 100, z = (f) => {
    f.preventDefault(), a("");
  }, L = {
    position: "relative",
    background: v.background,
    color: v.color,
    fontFamily: c,
    paddingTop: u.paddingTop,
    paddingBottom: u.paddingBottom,
    paddingLeft: _,
    paddingRight: _,
    boxSizing: "border-box",
    border: u.borderStyle === "solid" ? `1px solid ${v.border}` : void 0,
    borderRadius: u.cornerRadius > 0 ? u.cornerRadius : void 0,
    overflow: "hidden",
    ...u.minHeight != null ? { minHeight: u.minHeight } : {}
  }, H = {
    maxWidth: b,
    margin: "0 auto",
    width: "100%",
    minHeight: u.minHeight != null ? u.minHeight - u.paddingTop - u.paddingBottom : void 0,
    display: "flex",
    flexDirection: u.direction === "horizontal" ? "row" : "column",
    alignItems: u.direction === "horizontal" ? "center" : void 0,
    justifyContent: w,
    gap: u.gap,
    textAlign: $
  }, W = {
    flex: u.direction === "horizontal" ? "1 1 280px" : void 0,
    minWidth: 0,
    marginLeft: u.alignment === "right" && u.direction === "vertical" ? "auto" : void 0,
    marginRight: u.alignment === "left" && u.direction === "vertical" ? "auto" : void 0,
    maxWidth: u.direction === "vertical" ? 520 : void 0,
    width: u.direction === "vertical" ? "100%" : void 0
  }, T = {
    flex: u.direction === "horizontal" ? "1 1 320px" : void 0,
    minWidth: 0,
    width: u.direction === "vertical" ? "100%" : void 0,
    maxWidth: 420,
    marginLeft: u.direction === "vertical" && u.alignment === "center" || u.direction === "vertical" && u.alignment === "right" ? "auto" : void 0,
    marginRight: u.direction === "vertical" && u.alignment === "center" || u.direction === "vertical" && u.alignment === "left" ? "auto" : void 0
  }, C = {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    overflow: "hidden",
    border: `1px solid ${v.inputBorder}`,
    borderRadius: P,
    background: v.inputBg
  }, F = {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: c,
    fontSize: 15,
    lineHeight: 1.4,
    color: v.color,
    padding: "12px 16px",
    boxSizing: "border-box"
  };
  return /* @__PURE__ */ m(B, { sectionId: e, editorNodeId: h, label: "Email signup", style: L, children: [
    u.backgroundMedia === "image" && u.backgroundImageUrl ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${u.backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    u.backgroundOverlay && u.backgroundMedia === "image" ? /* @__PURE__ */ o(
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
    u.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Pi(e, u.customCss) } }) : null,
    /* @__PURE__ */ m("div", { style: { ...H, position: "relative", zIndex: 2 }, children: [
      p.trim() || g.trim() ? /* @__PURE__ */ m("div", { style: W, children: [
        p.trim() ? /* @__PURE__ */ o(
          S,
          {
            fieldPath: `${d}.title`,
            label: "Heading",
            as: "h2",
            style: {
              margin: u.direction === "horizontal" ? 0 : "0 0 12px",
              fontFamily: s,
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.2,
              color: v.color,
              textAlign: $
            },
            children: p
          }
        ) : null,
        g.trim() ? /* @__PURE__ */ o(
          S,
          {
            fieldPath: `${d}.subtitle`,
            label: "Subtext",
            as: "p",
            style: {
              margin: u.direction === "horizontal" ? 0 : "0 0 28px",
              fontSize: 15,
              lineHeight: 1.5,
              color: v.muted,
              textAlign: $
            },
            children: g
          }
        ) : null
      ] }) : null,
      /* @__PURE__ */ o("form", { onSubmit: z, style: T, children: /* @__PURE__ */ o(S, { fieldPath: `${d}.placeholder`, label: "Email placeholder", as: "span", children: /* @__PURE__ */ m("div", { style: C, children: [
        /* @__PURE__ */ o(
          "input",
          {
            type: "email",
            value: l,
            onChange: (f) => a(f.target.value),
            placeholder: k,
            style: F,
            "aria-label": k
          }
        ),
        /* @__PURE__ */ o(
          "button",
          {
            type: "submit",
            "aria-label": y || k || "Submit",
            style: {
              flexShrink: 0,
              border: "none",
              background: "transparent",
              color: v.buttonColor,
              fontFamily: c,
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
const Dt = {
  "scheme-1": { background: "#ffffff", color: "#111827", border: "#d1d5db" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", border: "#93c5fd" },
  "scheme-3": { background: "#fff7ed", color: "#431407", border: "#fdba74" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", border: "#c4b5fd" }
}, jt = {
  auto: 120,
  small: 280,
  medium: 480,
  large: 640
};
function Hi(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.height`, "small"), c = r(e, `${t}.direction`, "vertical"), s = r(e, `${t}.layoutAlignment`, "left"), l = x(e, `${t}.minHeight`, 0), a = jt[i];
  return {
    direction: c === "horizontal" ? "horizontal" : "vertical",
    alignment: s === "left" || s === "right" ? s : "center",
    position: ["top", "bottom"].includes(r(e, `${t}.position`, "center")) ? r(e, `${t}.position`, "center") : "center",
    gap: x(e, `${t}.layoutGap`, 12),
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: i,
    minHeight: a ?? (l > 0 ? l : jt.small),
    colorScheme: Dt[n] ?? Dt["scheme-1"],
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none") === "image" ? "image" : "none",
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none") === "solid" ? "solid" : "none",
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: E(e, `${t}.backgroundOverlay`, !1),
    paddingTop: x(e, `${t}.paddingTop`, 0),
    paddingBottom: x(e, `${t}.paddingBottom`, 0),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Ti(e, t) {
  const n = t.trim();
  return n ? n.replace(/:root/g, `[data-codiic-section="${e}"]`) : "";
}
function wt({ sectionId: e, placement: t = "template", templateId: n = "index" }) {
  const i = j(), { fontBody: c } = q(), s = t === "template" ? `templates.${n}.sections.${e}.settings` : `sections.${e}.settings`, l = t === "template" ? `template:${n}:${e}` : `layout:${e}`, a = M(() => Hi(i, s), [i, s]), d = a.colorScheme, h = a.sectionWidth === "full" ? "100%" : R.maxWidth, u = a.sectionWidth === "full" ? 24 : R.padX, p = a.alignment === "left" ? "left" : a.alignment === "right" ? "right" : "center", g = a.position === "top" ? "flex-start" : a.position === "bottom" ? "flex-end" : "center", k = {
    position: "relative",
    background: d.background,
    color: d.color,
    fontFamily: c,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: u,
    paddingRight: u,
    boxSizing: "border-box",
    border: a.borderStyle === "solid" ? `1px solid ${d.border}` : void 0,
    borderRadius: a.cornerRadius > 0 ? a.cornerRadius : void 0,
    overflow: "hidden",
    minHeight: a.minHeight
  }, y = {
    maxWidth: h,
    margin: "0 auto",
    width: "100%",
    minHeight: Math.max(a.minHeight - a.paddingTop - a.paddingBottom, 80),
    display: "flex",
    flexDirection: a.direction === "horizontal" ? "row" : "column",
    alignItems: a.direction === "horizontal" ? "center" : void 0,
    justifyContent: g,
    gap: a.gap,
    textAlign: p
  }, v = {
    flex: 1,
    width: "100%",
    minHeight: 80,
    marginLeft: a.alignment === "right" ? "auto" : void 0,
    marginRight: a.alignment === "left" ? "auto" : void 0,
    maxWidth: a.alignment === "center" ? "100%" : void 0
  };
  return /* @__PURE__ */ m(B, { sectionId: e, editorNodeId: l, label: "Custom section", style: k, children: [
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
    a.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Ti(e, a.customCss) } }) : null,
    /* @__PURE__ */ o("div", { style: { ...y, position: "relative", zIndex: 2 }, children: /* @__PURE__ */ o("div", { style: v, "aria-hidden": !0 }) })
  ] });
}
function Ct() {
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
function nn() {
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
const Bt = {
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
function rn(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1");
  return {
    scheme: Bt[n] ?? Bt["scheme-1"],
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    paddingTop: x(e, `${t}.paddingTop`, 0),
    paddingBottom: x(e, `${t}.paddingBottom`, 0),
    layoutGap: x(e, `${t}.layoutGap`, 48),
    equalColumns: E(e, `${t}.equalColumns`, !0),
    limitProductDetailsWidth: E(e, `${t}.limitProductDetailsWidth`, !1),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function ln(e, t) {
  const n = t.trim();
  return n ? n.replace(/:root/g, `[data-codiic-section="${e}"]`) : "";
}
function Li({ rating: e, reviewCount: t, color: n, muted: i }) {
  const c = Math.floor(e), s = e - c >= 0.5, l = [];
  for (let a = 0; a < 5; a += 1)
    a < c ? l.push("★") : a === c && s ? l.push("⯨") : l.push("☆");
  return /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12 }, children: [
    /* @__PURE__ */ o("span", { style: { color: "#111827", fontSize: 14, letterSpacing: 1 }, "aria-hidden": !0, children: l.join("") }),
    /* @__PURE__ */ m("span", { style: { fontSize: 13, color: i }, children: [
      t,
      " ",
      t === 1 ? "review" : "reviews"
    ] })
  ] });
}
function Ri({
  sectionId: e = "product_highlight",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), { storeFrontMeta: l } = De(), { products: a, fetchProductsByStoreId: d, fetchProductById: h, productDetail: u } = lt(), p = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, g = n === "template" ? `template:${t}:${e}` : `layout:${e}`, k = M(() => rn(i, p), [i, p]), y = r(i, `${p}.productId`, ""), v = r(i, `${p}.productTitle`), b = r(i, `${p}.price`), _ = r(i, `${p}.productImageUrl`, ""), $ = r(i, `${p}.mediaPosition`, "left"), w = E(i, `${p}.showRating`, !0), P = x(i, `${p}.rating`, 4.5), z = x(i, `${p}.reviewCount`, 3), L = E(i, `${p}.showTaxNote`, !0), H = r(i, `${p}.taxNote`), W = r(i, `${p}.buttonLabel`), T = E(i, `${p}.soldOut`, !0), C = l?.storeId ?? "";
  le(() => {
    C && d({ storeId: C, page: 1, limit: 24 });
  }, [C, d]), le(() => {
    if (!y) return;
    a.some((xe) => xe._id === y) || h(y);
  }, [y, a, h]);
  const F = M(() => y ? u?._id === y ? u : a.find((We) => We._id === y) ?? null : null, [y, u, a]), f = F?.title ?? v, U = F ? Ge(F.price) : b, X = F?.imageUrls?.[0] ?? _, O = k.scheme, Y = $ !== "right", J = k.sectionWidth === "full" ? "100%" : R.maxWidth, I = k.sectionWidth === "full" ? 24 : R.padX, ce = k.equalColumns ? "1fr 1fr" : "1.05fr 0.95fr", pe = {
    background: O.background,
    color: O.color,
    fontFamily: c,
    paddingTop: k.paddingTop,
    paddingBottom: k.paddingBottom,
    paddingLeft: I,
    paddingRight: I,
    boxSizing: "border-box"
  }, be = {
    maxWidth: J,
    margin: "0 auto",
    width: "100%"
  }, ve = {
    display: "grid",
    gridTemplateColumns: ce,
    gap: k.layoutGap,
    alignItems: "stretch",
    width: "100%"
  }, Fe = {
    background: O.panelLeft,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 360,
    padding: "40px 32px",
    order: Y ? 0 : 1,
    borderRadius: 0
  }, ge = {
    background: O.panelRight,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "40px 48px",
    order: Y ? 1 : 0,
    maxWidth: k.limitProductDetailsWidth ? 420 : void 0,
    width: "100%",
    boxSizing: "border-box"
  }, Ae = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    width: "100%"
  }, ue = {
    margin: 0,
    fontFamily: s,
    fontSize: 28,
    fontWeight: 400,
    lineHeight: 1.25,
    color: O.color,
    flex: 1,
    minWidth: 0
  }, Se = {
    margin: 0,
    fontSize: 16,
    fontWeight: 400,
    color: O.color,
    whiteSpace: "nowrap"
  }, je = {
    margin: "6px 0 0",
    fontSize: 13,
    color: O.muted
  }, ye = {
    marginTop: 24,
    width: "100%",
    maxWidth: 360,
    padding: "14px 24px",
    border: "none",
    borderRadius: 999,
    background: T ? "#6b7280" : "#111827",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 500,
    cursor: T ? "not-allowed" : "pointer",
    fontFamily: c
  };
  return /* @__PURE__ */ m(B, { nodeId: g, label: "Featured product", style: pe, children: [
    k.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: ln(e, k.customCss) } }) : null,
    /* @__PURE__ */ o("div", { style: be, "data-codiic-section": e, children: /* @__PURE__ */ m("div", { style: ve, children: [
      /* @__PURE__ */ o("div", { style: Fe, children: X ? /* @__PURE__ */ o(
        "img",
        {
          src: X,
          alt: "",
          style: { maxWidth: "100%", maxHeight: 320, objectFit: "contain", display: "block" }
        }
      ) : /* @__PURE__ */ o(nn, {}) }),
      /* @__PURE__ */ m("div", { style: ge, children: [
        /* @__PURE__ */ m("div", { style: Ae, children: [
          /* @__PURE__ */ o(
            S,
            {
              nodeId: g,
              fieldPath: `${p}.productTitle`,
              label: "Product title",
              as: "h2",
              style: ue,
              children: f
            }
          ),
          /* @__PURE__ */ o(
            S,
            {
              nodeId: g,
              fieldPath: `${p}.price`,
              label: "Price",
              as: "span",
              style: Se,
              children: U
            }
          )
        ] }),
        L ? /* @__PURE__ */ o(S, { nodeId: g, fieldPath: `${p}.taxNote`, label: "Tax note", as: "p", style: je, children: H }) : null,
        w ? /* @__PURE__ */ o(Li, { rating: P, reviewCount: z, color: O.color, muted: O.muted }) : null,
        /* @__PURE__ */ o(S, { nodeId: g, fieldPath: `${p}.buttonLabel`, label: "Button", as: "span", children: /* @__PURE__ */ o("button", { type: "button", disabled: T, style: ye, children: W }) })
      ] })
    ] }) })
  ] });
}
function an({
  sectionId: e = "product_highlight",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), { storeFrontMeta: l } = De(), { products: a, fetchProductsByStoreId: d, fetchProductById: h, productDetail: u } = lt(), p = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, g = n === "template" ? `template:${t}:${e}` : `layout:${e}`;
  if (r(i, `${p}.catalogVariant`, "") === "featured-product")
    return /* @__PURE__ */ o(
      Ri,
      {
        sectionId: e,
        templateId: t,
        placement: n
      }
    );
  const y = M(() => rn(i, p), [i, p]), v = r(i, `${p}.productId`, ""), b = r(i, `${p}.productTitle`), _ = r(i, `${p}.price`), $ = r(i, `${p}.productImageUrl`, ""), w = r(i, `${p}.mediaPosition`, "left"), P = l?.storeId ?? "";
  le(() => {
    P && d({ storeId: P, page: 1, limit: 24 });
  }, [P, d]), le(() => {
    if (!v) return;
    a.some((ve) => ve._id === v) || h(v);
  }, [v, a, h]);
  const z = M(() => v ? u?._id === v ? u : a.find((be) => be._id === v) ?? null : null, [v, u, a]), L = z?.title ?? b, H = z ? Ge(z.price) : _, W = z?.imageUrls?.[0] ?? $, T = y.scheme, C = R.maxWidth, F = R.padX, f = w !== "right", U = {
    background: T.background,
    color: T.color,
    fontFamily: c,
    paddingTop: y.paddingTop,
    paddingBottom: y.paddingBottom,
    paddingLeft: F,
    paddingRight: F,
    boxSizing: "border-box"
  }, X = {
    maxWidth: C,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: 320,
    width: "100%",
    overflow: "hidden"
  }, O = {
    background: T.panelLeft,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    minHeight: 280,
    order: f ? 0 : 1
  }, Y = {
    background: T.panelRight,
    display: "flex",
    flexDirection: "column",
    padding: "28px 32px",
    minHeight: 280,
    position: "relative",
    order: f ? 1 : 0
  }, J = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    width: "100%"
  }, I = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 8
  }, ce = /* @__PURE__ */ o("div", { style: O, children: /* @__PURE__ */ o(Ct, {}) }), pe = /* @__PURE__ */ m("div", { style: Y, children: [
    /* @__PURE__ */ m("div", { style: J, children: [
      /* @__PURE__ */ o(
        S,
        {
          fieldPath: `${p}.productTitle`,
          label: "Product title",
          as: "h2",
          style: {
            margin: 0,
            fontFamily: s,
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.3,
            color: T.color,
            flex: 1,
            minWidth: 0
          },
          children: L
        }
      ),
      /* @__PURE__ */ o(
        S,
        {
          fieldPath: `${p}.price`,
          label: "Price",
          as: "span",
          style: {
            margin: 0,
            fontSize: 16,
            fontWeight: 400,
            color: T.color,
            whiteSpace: "nowrap"
          },
          children: H
        }
      )
    ] }),
    /* @__PURE__ */ o("div", { style: I, children: /* @__PURE__ */ o(S, { fieldPath: `${p}.productImageUrl`, label: "Product image", as: "span", children: W ? /* @__PURE__ */ o(
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
    ) : /* @__PURE__ */ o(nn, {}) }) })
  ] });
  return /* @__PURE__ */ m(B, { sectionId: e, editorNodeId: g, label: "Product highlight", style: U, children: [
    y.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: ln(e, y.customCss) } }) : null,
    /* @__PURE__ */ m("div", { style: X, children: [
      ce,
      pe
    ] })
  ] });
}
function Mi({ sectionId: e }) {
  return /* @__PURE__ */ o(an, { sectionId: e, placement: "layout" });
}
function Fi() {
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
const qt = {
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
}, Xt = {
  small: ["2fr", "3fr"],
  medium: ["1fr", "1fr"],
  large: ["3fr", "2fr"]
}, It = {
  small: 240,
  medium: 320,
  large: 400
};
function Ai(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-4"), i = r(e, `${t}.mediaWidth`, "medium"), c = r(e, `${t}.mediaHeight`, "medium"), s = i === "small" || i === "large" ? i : "medium", l = c === "small" || c === "large" ? c : "medium";
  return {
    scheme: qt[n] ?? qt["scheme-4"],
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    mediaWidth: s,
    mediaHeight: l,
    paddingTop: x(e, `${t}.paddingTop`, 0),
    paddingBottom: x(e, `${t}.paddingBottom`, 0),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Ni(e) {
  const [t, n] = Xt[e] ?? Xt.medium;
  return `${t} ${n}`;
}
function Ei(e) {
  return It[e] ?? It.medium;
}
function Ui(e, t) {
  const n = t.trim();
  return n ? n.replace(/:root/g, `[data-codiic-section="${e}"]`) : "";
}
function dn({
  sectionId: e = "editorial",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(() => Ai(i, l), [i, l]), h = r(i, `${l}.imageUrl`, ""), u = r(i, `${l}.subheading`), p = r(i, `${l}.heading`), g = r(
    i,
    `${l}.description`,
    "Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations."
  ), k = r(i, `${l}.linkLabel`), y = r(i, `${l}.linkUrl`), v = r(i, `${l}.mediaPosition`, "left"), b = d.scheme, _ = v !== "right", $ = Ei(d.mediaHeight), w = d.sectionWidth === "full" ? 24 : R.padX, P = d.sectionWidth === "full" ? "100%" : R.maxWidth;
  let z = Ni(d.mediaWidth);
  if (!_) {
    const Y = z.split(" ");
    Y.length === 2 && (z = `${Y[1]} ${Y[0]}`);
  }
  const L = {
    background: b.background,
    color: b.color,
    fontFamily: c,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: w,
    paddingRight: w,
    boxSizing: "border-box"
  }, H = {
    maxWidth: P,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: z,
    minHeight: $,
    width: "100%",
    overflow: "hidden"
  }, W = {
    background: b.mediaPanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    minHeight: $
  }, T = {
    background: b.contentPanel,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    textAlign: "left",
    padding: "40px 48px",
    minHeight: $
  }, C = {
    margin: 0,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "0.02em",
    color: b.muted,
    textTransform: "none"
  }, F = {
    margin: "12px 0 0",
    fontFamily: s,
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.15,
    color: b.color
  }, f = {
    margin: "16px 0 0",
    fontSize: 15,
    lineHeight: 1.55,
    color: b.muted,
    maxWidth: 420
  }, U = {
    marginTop: 24,
    fontSize: 15,
    fontWeight: 500,
    color: b.color,
    textDecoration: "underline",
    textUnderlineOffset: 3
  }, X = /* @__PURE__ */ o("div", { style: W, children: /* @__PURE__ */ o(S, { fieldPath: `${l}.imageUrl`, label: "Image", as: "span", children: h ? /* @__PURE__ */ o(
    "img",
    {
      src: h,
      alt: "",
      style: { maxWidth: "100%", maxHeight: 280, objectFit: "contain", display: "block" }
    }
  ) : /* @__PURE__ */ o(Fi, {}) }) }), O = /* @__PURE__ */ m("div", { style: T, children: [
    /* @__PURE__ */ o(S, { fieldPath: `${l}.subheading`, label: "Subheading", as: "p", style: C, children: u }),
    /* @__PURE__ */ o(S, { fieldPath: `${l}.heading`, label: "Heading", as: "h2", style: F, children: p }),
    /* @__PURE__ */ o(S, { fieldPath: `${l}.description`, label: "Description", as: "p", style: f, children: g }),
    /* @__PURE__ */ o(S, { fieldPath: `${l}.linkLabel`, label: "Link label", as: "span", children: y ? /* @__PURE__ */ o(D, { to: y, style: U, children: k }) : /* @__PURE__ */ o("span", { style: U, children: k }) })
  ] });
  return /* @__PURE__ */ m(B, { sectionId: e, editorNodeId: a, label: "Editorial", style: L, children: [
    d.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: Ui(e, d.customCss) } }) : null,
    /* @__PURE__ */ m("div", { style: H, children: [
      X,
      O
    ] })
  ] });
}
function Oi({ sectionId: e }) {
  return /* @__PURE__ */ o(dn, { sectionId: e, placement: "layout" });
}
const Vt = {
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
}, Kt = {
  small: ["2fr", "3fr"],
  medium: ["12fr", "13fr"],
  large: ["2fr", "3fr"]
}, Yt = {
  small: 200,
  medium: 280,
  large: 360
};
function Gi(e, t) {
  const n = r(e, `${t}.mediaWidth`, "");
  if (n === "small" || n === "large") return n;
  if (n === "medium") return "medium";
  const i = r(e, `${t}.textWidth`, "medium");
  return i === "small" || i === "large" ? i : "medium";
}
function Di(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-4"), i = r(e, `${t}.mediaHeight`, "medium"), c = i === "small" || i === "large" ? i : "medium";
  return {
    scheme: Vt[n] ?? Vt["scheme-4"],
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    mediaWidth: Gi(e, t),
    mediaHeight: c,
    paddingTop: x(e, `${t}.paddingTop`, 0),
    paddingBottom: x(e, `${t}.paddingBottom`, 0),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function ji(e) {
  const [t, n] = Kt[e] ?? Kt.medium;
  return `${t} ${n}`;
}
function Bi(e) {
  return Yt[e] ?? Yt.medium;
}
function qi(e, t) {
  const n = t.trim();
  return n ? n.replace(/:root/g, `[data-codiic-section="${e}"]`) : "";
}
function Xi(e) {
  const t = e.trim();
  return t ? t.includes(`
`) ? t.split(`
`).map((n) => n.trim()).filter(Boolean) : t.split(/\s+/).filter(Boolean) : ["UP", "THE", "ANTE"];
}
function Ii(e, t) {
  const n = r(e, `${t}.mediaPosition`, "");
  return n === "left" || n === "right" ? n : r(e, `${t}.textPosition`, "left") === "left" ? "right" : "left";
}
function cn({
  sectionId: e = "editorial_jumbo",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(() => Di(i, l), [i, l]), h = r(i, `${l}.headline`), u = r(i, `${l}.imageUrl`, ""), p = Ii(i, l), g = Xi(h), k = d.scheme, y = p !== "right", v = Bi(d.mediaHeight), b = d.sectionWidth === "full" ? 24 : R.padX, _ = d.sectionWidth === "full" ? "100%" : R.maxWidth;
  let $ = ji(d.mediaWidth);
  if (!y) {
    const C = $.split(" ");
    C.length === 2 && ($ = `${C[1]} ${C[0]}`);
  }
  const w = {
    background: k.background,
    color: k.color,
    fontFamily: c,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: b,
    paddingRight: b,
    boxSizing: "border-box"
  }, P = {
    maxWidth: _,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: $,
    minHeight: v,
    width: "100%",
    overflow: "hidden"
  }, z = {
    background: k.textPanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "32px 40px 32px 32px",
    minHeight: v,
    boxSizing: "border-box"
  }, L = {
    background: k.mediaPanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    minHeight: v,
    boxSizing: "border-box"
  }, H = {
    margin: 0,
    fontFamily: s,
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    fontWeight: 700,
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
    textAlign: "right",
    textTransform: "uppercase",
    color: k.color,
    maxWidth: "100%"
  }, W = /* @__PURE__ */ o("div", { style: z, children: /* @__PURE__ */ o(S, { fieldPath: `${l}.headline`, label: "Headline", as: "div", style: H, children: g.map((C, F) => /* @__PURE__ */ o("span", { style: { display: "block" }, children: C }, `${C}-${F}`)) }) }), T = /* @__PURE__ */ o("div", { style: L, children: /* @__PURE__ */ o(S, { fieldPath: `${l}.imageUrl`, label: "Image", as: "span", children: u ? /* @__PURE__ */ o(
    "img",
    {
      src: u,
      alt: "",
      style: { maxWidth: "100%", maxHeight: v - 64, objectFit: "contain", display: "block" }
    }
  ) : /* @__PURE__ */ o(Ct, {}) }) });
  return /* @__PURE__ */ m(B, { sectionId: e, editorNodeId: a, label: "Editorial: Jumbo text", style: w, children: [
    d.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: qi(e, d.customCss) } }) : null,
    /* @__PURE__ */ o("div", { style: P, children: y ? /* @__PURE__ */ m(Z, { children: [
      T,
      W
    ] }) : /* @__PURE__ */ m(Z, { children: [
      W,
      T
    ] }) })
  ] });
}
function Vi({ sectionId: e }) {
  return /* @__PURE__ */ o(cn, { sectionId: e, placement: "layout" });
}
function Ki() {
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
function Yi() {
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
function Qi({ beforeUrl: e, afterUrl: t, minHeight: n = 320 }) {
  const [i, c] = te(50), s = Ke(null), l = Me((b) => {
    const _ = s.current;
    if (!_) return;
    const $ = _.getBoundingClientRect(), w = Math.min(Math.max(b - $.left, 0), $.width);
    c(w / $.width * 100);
  }, []), a = (b) => {
    b.currentTarget.setPointerCapture(b.pointerId), l(b.clientX);
  }, d = (b) => {
    b.currentTarget.hasPointerCapture(b.pointerId) && l(b.clientX);
  }, h = (b) => {
    b.currentTarget.releasePointerCapture(b.pointerId);
  }, u = {
    position: "relative",
    width: "100%",
    maxWidth: 520,
    margin: "0 auto",
    minHeight: n,
    borderRadius: 4,
    overflow: "hidden",
    background: "#f4f4f4",
    touchAction: "none",
    userSelect: "none"
  }, p = {
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
    maxHeight: n - 48
  }, k = {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: `${i}%`,
    transform: "translateX(-50%)",
    width: 3,
    background: "#ffffff",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
    zIndex: 4,
    cursor: "ew-resize"
  }, y = {
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
      ref: s,
      style: u,
      onPointerDown: a,
      onPointerMove: d,
      onPointerUp: h,
      onPointerCancel: h,
      role: "slider",
      "aria-valuenow": Math.round(i),
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-label": "Compare images",
      children: [
        /* @__PURE__ */ o("div", { style: p, children: /* @__PURE__ */ o("div", { style: g, children: t ? /* @__PURE__ */ o("img", { src: t, alt: "", style: { width: "100%", height: "100%", objectFit: "contain" } }) : /* @__PURE__ */ o(Yi, {}) }) }),
        /* @__PURE__ */ o(
          "div",
          {
            style: {
              ...p,
              clipPath: `inset(0 ${100 - i}% 0 0)`,
              zIndex: 2
            },
            children: /* @__PURE__ */ o("div", { style: g, children: e ? /* @__PURE__ */ o("img", { src: e, alt: "", style: { width: "100%", height: "100%", objectFit: "contain" } }) : /* @__PURE__ */ o(Ki, {}) })
          }
        ),
        /* @__PURE__ */ m("div", { style: k, children: [
          /* @__PURE__ */ o("div", { style: v }),
          /* @__PURE__ */ o("div", { style: y, children: /* @__PURE__ */ o("span", { "aria-hidden": !0, children: "‹›" }) })
        ] })
      ]
    }
  );
}
const Qt = {
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
}, Zt = {
  auto: 280,
  small: 260,
  medium: 320,
  large: 400
};
function Zi(e, t) {
  const n = r(e, `${t}.height`, "");
  if (n === "auto" || n === "small" || n === "medium" || n === "large") return n;
  const i = r(e, `${t}.mediaHeight`, "small");
  return i === "auto" || i === "medium" || i === "large" ? i : "small";
}
function Ji(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.direction`, ""), c = i === "vertical" ? "vertical" : "horizontal";
  let s = !1;
  i || (s = r(e, `${t}.mediaPosition`, "right") === "left");
  const l = r(e, `${t}.verticalOnMobile`, "false") === "true", a = r(e, `${t}.layoutAlignment`, "space-between"), d = r(e, `${t}.position`, "center"), h = x(e, `${t}.layoutGap`, 46);
  return {
    scheme: Qt[n] ?? Qt["scheme-1"],
    direction: c,
    verticalOnMobile: l,
    layoutAlignment: a,
    position: d,
    layoutGap: h,
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: Zi(e, t),
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none"),
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: r(e, `${t}.backgroundOverlay`, "false") === "true",
    paddingTop: x(e, `${t}.paddingTop`, 40),
    paddingBottom: x(e, `${t}.paddingBottom`, 40),
    customCss: r(e, `${t}.customCss`, ""),
    compareFirst: s
  };
}
function er(e) {
  return Zt[e] ?? Zt.small;
}
function tr(e) {
  return e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function or(e) {
  return e === "space-between" ? "space-between" : e === "right" ? "flex-end" : e === "center" ? "center" : "flex-start";
}
function nr(e, t) {
  const n = t.trim();
  return n ? n.replace(/:root/g, `[data-codiic-section="${e}"]`) : "";
}
const nt = {
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
function sn({
  sectionId: e = "image_compare",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(() => Ji(i, l), [i, l]), h = r(i, `${l}.heading`), u = r(i, `${l}.subheading`), p = r(i, `${l}.button1Label`), g = r(i, `${l}.button1Url`), k = r(i, `${l}.button2Label`), y = r(i, `${l}.button2Url`), v = r(i, `${l}.imageBeforeUrl`, ""), b = r(i, `${l}.imageAfterUrl`, ""), _ = d.scheme, $ = er(d.height), w = d.sectionWidth === "full" ? 24 : R.padX, P = d.sectionWidth === "full" ? "100%" : R.maxWidth, z = d.direction === "horizontal", L = {
    position: "relative",
    background: _.background,
    color: _.color,
    fontFamily: c,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: w,
    paddingRight: w,
    boxSizing: "border-box",
    border: d.borderStyle === "solid" ? `1px solid ${_.muted}33` : void 0,
    borderRadius: d.cornerRadius > 0 ? d.cornerRadius : void 0,
    overflow: "hidden"
  }, H = {
    maxWidth: P,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: z ? "1fr 1fr" : "1fr",
    gridTemplateRows: z ? void 0 : "auto auto",
    gap: d.layoutGap,
    minHeight: $,
    width: "100%",
    alignItems: tr(d.position),
    justifyContent: or(d.layoutAlignment)
  }, W = d.verticalOnMobile && z ? `codiic-image-compare-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}` : "", T = {
    background: _.contentPanel,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    textAlign: "left",
    padding: "48px 56px",
    minHeight: z ? $ : void 0,
    boxSizing: "border-box"
  }, C = {
    background: _.comparePanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    minHeight: z ? $ : 280,
    boxSizing: "border-box"
  }, F = {
    margin: 0,
    fontFamily: s,
    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    color: _.color
  }, f = {
    margin: "14px 0 0",
    fontSize: 16,
    lineHeight: 1.5,
    color: _.muted,
    maxWidth: 400
  }, U = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 28
  }, X = /* @__PURE__ */ m("div", { style: T, children: [
    /* @__PURE__ */ o(S, { fieldPath: `${l}.heading`, label: "Heading", as: "h2", style: F, children: h }),
    /* @__PURE__ */ o(S, { fieldPath: `${l}.subheading`, label: "Subheading", as: "p", style: f, children: u }),
    /* @__PURE__ */ m("div", { style: U, children: [
      /* @__PURE__ */ o(S, { fieldPath: `${l}.button1Label`, label: "Button", as: "span", children: g ? /* @__PURE__ */ o(D, { to: g, style: nt, children: p }) : /* @__PURE__ */ o("span", { style: nt, children: p }) }),
      /* @__PURE__ */ o(S, { fieldPath: `${l}.button2Label`, label: "Button", as: "span", children: y ? /* @__PURE__ */ o(D, { to: y, style: nt, children: k }) : /* @__PURE__ */ o("span", { style: nt, children: k }) })
    ] })
  ] }), O = /* @__PURE__ */ o("div", { style: C, children: /* @__PURE__ */ o("div", { style: { width: "100%" }, children: /* @__PURE__ */ o(
    Qi,
    {
      beforeUrl: v || void 0,
      afterUrl: b || void 0,
      minHeight: $ - 64
    }
  ) }) }), Y = d.backgroundMedia === "image" && d.backgroundImageUrl ? d.backgroundImageUrl : null;
  return /* @__PURE__ */ m(B, { sectionId: e, editorNodeId: a, label: "Image compare", style: L, children: [
    Y ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${Y})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
          pointerEvents: "none"
        }
      }
    ) : null,
    d.backgroundOverlay ? /* @__PURE__ */ o(
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
    d.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: nr(e, d.customCss) } }) : null,
    W ? /* @__PURE__ */ o("style", { children: `
          @media (max-width: 749px) {
            .${W} {
              grid-template-columns: 1fr !important;
              grid-template-rows: auto auto !important;
            }
          }
        ` }) : null,
    /* @__PURE__ */ o("div", { className: W || void 0, style: { ...H, position: "relative", zIndex: 1 }, children: d.compareFirst ? /* @__PURE__ */ m(Z, { children: [
      O,
      X
    ] }) : /* @__PURE__ */ m(Z, { children: [
      X,
      O
    ] }) })
  ] });
}
function ir({ sectionId: e }) {
  return /* @__PURE__ */ o(sn, { sectionId: e, placement: "layout" });
}
const Jt = {
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
}, rr = {
  auto: 0,
  small: 260,
  medium: 320,
  large: 400
};
function lr(e, t) {
  const n = r(e, `${t}.height`, "");
  if (n === "auto" || n === "small" || n === "medium" || n === "large") return n;
  const i = r(e, `${t}.mediaHeight`, "medium");
  return i === "auto" || i === "small" || i === "large" ? i : "medium";
}
function ar(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.direction`, ""), c = i === "vertical" ? "vertical" : "horizontal";
  let s = !0;
  i || (s = r(e, `${t}.mediaPosition`, "left") !== "right");
  const l = r(e, `${t}.verticalOnMobile`, "false") === "true", a = r(e, `${t}.layoutAlignment`, "left"), d = r(e, `${t}.position`, "center"), h = x(e, `${t}.layoutGap`, 32);
  return {
    scheme: Jt[n] ?? Jt["scheme-1"],
    direction: c,
    verticalOnMobile: l,
    layoutAlignment: a,
    position: d,
    layoutGap: h,
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: lr(e, t),
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none"),
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: r(e, `${t}.backgroundOverlay`, "false") === "true",
    paddingTop: x(e, `${t}.paddingTop`, 40),
    paddingBottom: x(e, `${t}.paddingBottom`, 40),
    customCss: r(e, `${t}.customCss`, ""),
    imageFirst: s
  };
}
function dr(e) {
  const t = rr[e];
  return t && t > 0 ? t : void 0;
}
function cr(e) {
  return e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function sr(e) {
  return e === "right" ? "flex-end" : e === "center" ? "center" : "flex-start";
}
function ur(e, t) {
  const n = t.trim();
  return n ? n.replace(/:root/g, `[data-codiic-section="${e}"]`) : "";
}
const eo = {
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
function un({
  sectionId: e = "image_with_text",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(() => ar(i, l), [i, l]), h = r(i, `${l}.imageUrl`, ""), u = r(i, `${l}.heading`), p = r(
    i,
    `${l}.description`,
    "Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations."
  ), g = r(
    i,
    `${l}.buttonLabel`,
    r(i, `${l}.linkLabel`)
  ), k = r(
    i,
    `${l}.buttonUrl`,
    r(i, `${l}.linkUrl`)
  ), y = d.scheme, v = dr(d.height), b = d.sectionWidth === "full" ? 24 : R.padX, _ = d.sectionWidth === "full" ? "100%" : R.maxWidth, $ = d.direction === "horizontal", w = {
    position: "relative",
    background: y.background,
    color: y.color,
    fontFamily: c,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: b,
    paddingRight: b,
    boxSizing: "border-box",
    border: d.borderStyle === "solid" ? `1px solid ${y.muted}33` : void 0,
    borderRadius: d.cornerRadius > 0 ? d.cornerRadius : void 0,
    overflow: "hidden"
  }, P = {
    maxWidth: _,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: $ ? "1fr 1fr" : "1fr",
    gridTemplateRows: $ ? void 0 : "auto auto",
    gap: d.layoutGap,
    minHeight: v,
    width: "100%",
    alignItems: cr(d.position),
    justifyContent: sr(d.layoutAlignment)
  }, z = d.verticalOnMobile && $ ? `codiic-image-with-text-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}` : "", L = {
    background: y.imagePanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    minHeight: $ ? v : 280,
    boxSizing: "border-box"
  }, H = {
    background: y.contentPanel,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    textAlign: "left",
    padding: "48px 56px",
    minHeight: $ ? v : void 0,
    boxSizing: "border-box"
  }, W = {
    margin: 0,
    fontFamily: s,
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    color: y.color
  }, T = {
    margin: "16px 0 0",
    fontSize: 15,
    lineHeight: 1.55,
    color: y.muted,
    maxWidth: 420
  }, C = /* @__PURE__ */ o("div", { style: L, children: /* @__PURE__ */ o(S, { fieldPath: `${l}.imageUrl`, label: "Image", as: "span", children: h ? /* @__PURE__ */ o(
    "img",
    {
      src: h,
      alt: "",
      style: { maxWidth: "100%", maxHeight: 300, objectFit: "contain", display: "block" }
    }
  ) : /* @__PURE__ */ o(Ct, {}) }) }), F = /* @__PURE__ */ m("div", { style: H, children: [
    /* @__PURE__ */ o(S, { fieldPath: `${l}.heading`, label: "Heading", as: "h2", style: W, children: u }),
    /* @__PURE__ */ o(S, { fieldPath: `${l}.description`, label: "Description", as: "p", style: T, children: p }),
    /* @__PURE__ */ o(S, { fieldPath: `${l}.buttonLabel`, label: "Button", as: "span", children: k ? /* @__PURE__ */ o(D, { to: k, style: eo, children: g }) : /* @__PURE__ */ o("span", { style: eo, children: g }) })
  ] }), f = d.backgroundMedia === "image" && d.backgroundImageUrl ? d.backgroundImageUrl : null;
  return /* @__PURE__ */ m(B, { sectionId: e, editorNodeId: a, label: "Image with text", style: w, children: [
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
    d.backgroundOverlay ? /* @__PURE__ */ o(
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
    d.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: ur(e, d.customCss) } }) : null,
    z ? /* @__PURE__ */ o("style", { children: `
          @media (max-width: 749px) {
            .${z} {
              grid-template-columns: 1fr !important;
              grid-template-rows: auto auto !important;
            }
          }
        ` }) : null,
    /* @__PURE__ */ o("div", { className: z || void 0, style: { ...P, position: "relative", zIndex: 1 }, children: d.imageFirst ? /* @__PURE__ */ m(Z, { children: [
      C,
      F
    ] }) : /* @__PURE__ */ m(Z, { children: [
      F,
      C
    ] }) })
  ] });
}
function hr({ sectionId: e }) {
  return /* @__PURE__ */ o(un, { sectionId: e, placement: "layout" });
}
const to = {
  "scheme-1": { background: "#f6f6f7", color: "#111827", border: "#d1d5db" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", border: "#cbd5e1" },
  "scheme-3": { background: "#fff7ed", color: "#431407", border: "#fdba74" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", border: "#c4b5fd" }
};
function pr(e, t, n) {
  const i = r(e, `${t}.colorScheme`, "scheme-1");
  return {
    scheme: to[i] ?? to["scheme-1"],
    widthMode: Vo(e, t),
    thickness: Math.max(0, x(e, `${t}.thickness`, 1)),
    lengthPercent: Math.min(100, Math.max(10, x(e, `${t}.length`, 100))),
    paddingTop: x(e, `${t}.paddingTop`, 16),
    paddingBottom: x(e, `${t}.paddingBottom`, 16),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function mr(e, t) {
  return Ko(e, t);
}
function _t({ sectionId: e, placement: t = "layout", templateId: n = "index" }) {
  const i = j(), { fontBody: c } = q(), s = t === "template" ? `templates.${n}.sections.${e}.settings` : `sections.${e}.settings`, l = t === "template" ? `template:${n}:${e}` : `layout:${e}`, a = M(() => pr(i, s), [i, s]), d = a.widthMode === "full" ? "100%" : R.maxWidth, h = a.widthMode === "full" ? 24 : R.padX, u = Math.max(a.thickness, 1), p = {
    background: a.scheme.background,
    color: a.scheme.color,
    fontFamily: c,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: h,
    paddingRight: h,
    boxSizing: "border-box"
  }, g = {
    maxWidth: d,
    margin: "0 auto",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: u
  };
  return /* @__PURE__ */ m(B, { sectionId: e, editorNodeId: l, label: "Divider", style: p, children: [
    a.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: mr(e, a.customCss) } }) : null,
    /* @__PURE__ */ o("div", { style: g, children: /* @__PURE__ */ o(
      "hr",
      {
        "aria-hidden": !0,
        style: {
          width: `${a.lengthPercent}%`,
          maxWidth: "100%",
          margin: 0,
          border: "none",
          borderTop: `${u}px solid ${a.scheme.border}`,
          flexShrink: 0
        }
      }
    ) })
  ] });
}
const oo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#4b5563", border: "#e5e7eb" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#4b5563", border: "#e5e7eb" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569", border: "#cbd5e1" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6", border: "#ddd6fe" }
};
function gr(e) {
  const t = oo["scheme-1"], n = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(e) ? e : "";
  if (n) {
    let i = n.slice(1);
    i.length === 3 && (i = i.split("").map((h) => h + h).join(""));
    const c = parseInt(i.slice(0, 2), 16), s = parseInt(i.slice(2, 4), 16), l = parseInt(i.slice(4, 6), 16), d = (0.299 * c + 0.587 * s + 0.114 * l) / 255 > 0.6;
    return {
      background: n,
      color: d ? "#111827" : "#ffffff",
      muted: d ? "#4b5563" : "rgba(255,255,255,0.72)",
      border: d ? "#e5e7eb" : "rgba(255,255,255,0.2)"
    };
  }
  return oo[e] ?? t;
}
const fr = {
  auto: 0,
  small: 40,
  medium: 60,
  large: 80,
  "full-screen": 100
};
function br(e, t) {
  if (e === "custom") {
    const i = Math.min(Math.max(t, 0), 100);
    return i > 0 ? `${i}vh` : void 0;
  }
  const n = fr[e] ?? 0;
  return n > 0 ? `${n}vh` : void 0;
}
function yr(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.direction`, "vertical"), c = r(e, `${t}.layoutAlignment`, "") || r(e, `${t}.headingAlignment`, "left"), s = r(e, `${t}.height`, "auto"), l = x(e, `${t}.customHeight`, 50);
  return {
    scheme: gr(n),
    direction: i === "horizontal" ? "horizontal" : "vertical",
    layoutAlignment: c === "center" || c === "right" ? c : "left",
    position: r(e, `${t}.position`, "center"),
    layoutGap: x(e, `${t}.layoutGap`, 32),
    openFirstItem: E(e, `${t}.openFirstItem`, !1),
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: s,
    customHeight: l,
    minHeight: br(s, l),
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none"),
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: E(e, `${t}.backgroundOverlay`, !1),
    overlayColor: r(e, `${t}.overlayColor`, "#00000066"),
    overlayStyle: r(e, `${t}.overlayStyle`, "solid") === "gradient" ? "gradient" : "solid",
    overlayGradientDirection: r(e, `${t}.overlayGradientDirection`, "up") === "down" ? "down" : "up",
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function xr(e) {
  return e.overlayStyle === "gradient" ? e.overlayGradientDirection === "down" ? `linear-gradient(180deg, transparent 0%, ${e.overlayColor} 100%)` : `linear-gradient(180deg, ${e.overlayColor} 0%, transparent 100%)` : e.overlayColor;
}
function $r(e, t, n, i) {
  const s = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, l = i === "template" ? _e(e, t, n, []) : ke(e, n, []), a = K(e, s);
  return !a || typeof a != "object" ? [] : (l.length ? l : Object.keys(a)).map((h) => {
    const u = a[h];
    if (!u) return null;
    const p = u.settings ?? {}, g = String(p.question ?? "").trim();
    return g ? {
      id: h,
      question: g,
      answer: String(p.answer ?? "")
    } : null;
  }).filter((h) => h != null);
}
function kr(e, t) {
  const n = `.codiic-faq-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function vr({ open: e }) {
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
function hn({
  sectionId: e = "faq_section",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), c = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, s = n === "template" ? `template:${t}:${e}` : `layout:${e}`, l = M(() => yr(i, c), [i, c]), a = M(
    () => $r(i, t, e, n),
    [i, t, e, n]
  ), d = r(i, `${c}.heading`), [h, u] = te(() => l.openFirstItem && a[0] ? /* @__PURE__ */ new Set([a[0].id]) : /* @__PURE__ */ new Set()), p = l.scheme, g = l.sectionWidth === "full" ? 24 : R.padX, k = l.sectionWidth === "full" ? "100%" : R.maxWidth, y = `codiic-faq-${e.replace(/[^a-z0-9_-]/gi, "-")}`, v = l.layoutAlignment, b = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    background: (l.backgroundMedia === "image" && l.backgroundImageUrl, p.background),
    color: p.color,
    paddingTop: l.paddingTop,
    paddingBottom: l.paddingBottom,
    paddingLeft: g,
    paddingRight: g,
    boxSizing: "border-box",
    minHeight: l.minHeight,
    border: l.borderStyle === "solid" ? `1px solid ${p.border}` : void 0,
    borderRadius: l.cornerRadius > 0 ? l.cornerRadius : void 0,
    overflow: l.cornerRadius > 0 ? "hidden" : void 0
  }, _ = l.backgroundMedia === "image" && l.backgroundImageUrl ? l.backgroundImageUrl : null, $ = {
    maxWidth: k,
    margin: "0 auto",
    width: "100%",
    flex: l.minHeight ? "1 1 auto" : void 0,
    display: "flex",
    flexDirection: l.direction === "horizontal" ? "row" : "column",
    alignItems: l.position === "top" ? "flex-start" : l.position === "bottom" ? "flex-end" : "center",
    gap: l.layoutGap
  }, w = {
    margin: 0,
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    textAlign: v,
    marginBottom: l.direction === "horizontal" ? 0 : l.layoutGap,
    flex: l.direction === "horizontal" ? "0 0 38%" : void 0
  }, P = {
    flex: 1,
    width: "100%"
  }, z = (H) => {
    u((W) => {
      const T = new Set(W);
      return T.has(H) ? T.delete(H) : T.add(H), T;
    });
  }, L = kr(e, l.customCss);
  return /* @__PURE__ */ m(B, { sectionId: e, label: "FAQ", editorNodeId: s, style: b, children: [
    L ? /* @__PURE__ */ o("style", { children: L }) : null,
    _ ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${_})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    l.backgroundOverlay && _ ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          background: xr(l),
          zIndex: 1
        }
      }
    ) : null,
    /* @__PURE__ */ m("div", { className: y, style: { ...$, position: "relative", zIndex: 2 }, children: [
      /* @__PURE__ */ o(S, { fieldPath: `${c}.heading`, label: "Heading", as: "h2", style: w, children: d }),
      /* @__PURE__ */ o(
        "div",
        {
          role: "list",
          style: {
            ...P,
            borderTop: `1px solid ${p.border}`
          },
          children: a.map((H) => {
            const W = h.has(H.id), T = n === "template" ? `template:${t}:${e}:block:${H.id}` : `layout:${e}:block:${H.id}`, C = `${c.replace(/\.settings$/, "")}.blocks.${H.id}.settings.question`, F = `${c.replace(/\.settings$/, "")}.blocks.${H.id}.settings.answer`;
            return /* @__PURE__ */ m(
              "div",
              {
                role: "listitem",
                "data-codiic-node": T,
                "data-codiic-label": H.question,
                "data-codiic-kind": "block",
                style: { borderBottom: `1px solid ${p.border}` },
                children: [
                  /* @__PURE__ */ m(
                    "button",
                    {
                      type: "button",
                      onClick: () => z(H.id),
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
                          S,
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
                            children: H.question
                          }
                        ),
                        /* @__PURE__ */ o(vr, { open: W })
                      ]
                    }
                  ),
                  W ? /* @__PURE__ */ o(
                    "div",
                    {
                      style: {
                        paddingBottom: 20,
                        paddingRight: 32,
                        color: p.muted,
                        fontSize: "0.9375rem",
                        lineHeight: 1.6
                      },
                      children: /* @__PURE__ */ o(S, { fieldPath: F, label: "Answer", as: "div", children: H.answer || "Add an answer in the sidebar." })
                    }
                  ) : null
                ]
              },
              H.id
            );
          })
        }
      )
    ] })
  ] });
}
function Sr({ icon: e, style: t, className: n }) {
  const i = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": !0,
    style: t,
    className: n
  };
  switch (e) {
    case "heart":
      return /* @__PURE__ */ o("svg", { ...i, children: /* @__PURE__ */ o(
        "path",
        {
          d: "M12 20.5s-7-4.5-7-9.5a4.5 4.5 0 0 1 7.5-3.3A4.5 4.5 0 0 1 19 11c0 5-7 9.5-7 9.5Z",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinejoin: "round"
        }
      ) });
    case "person":
      return /* @__PURE__ */ m("svg", { ...i, children: [
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
      return /* @__PURE__ */ m("svg", { ...i, children: [
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
      return /* @__PURE__ */ m("svg", { ...i, children: [
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
      return /* @__PURE__ */ o("svg", { ...i, children: /* @__PURE__ */ o(
        "path",
        {
          d: "M12 3 5 6v6c0 4.5 3.5 7.5 7 9 3.5-1.5 7-4.5 7-9V6l-7-3Z",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinejoin: "round"
        }
      ) });
    case "star":
      return /* @__PURE__ */ o("svg", { ...i, children: /* @__PURE__ */ o(
        "path",
        {
          d: "M12 4l2.2 5 5.5.5-4.2 3.5 1.3 5.5-4.8-3-4.8 3 1.3-5.5-4.2-3.5 5.5-.5L12 4Z",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinejoin: "round"
        }
      ) });
    case "gift":
      return /* @__PURE__ */ m("svg", { ...i, children: [
        /* @__PURE__ */ o("rect", { x: "4", y: "10", width: "16", height: "10", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ o("path", { d: "M12 10V20M4 10h16M8 10c0-2 1.5-4 4-4s4 2 4 4", stroke: "currentColor", strokeWidth: "1.5" })
      ] });
    default:
      return /* @__PURE__ */ m("svg", { ...i, children: [
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
const no = {
  "scheme-1": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6" }
};
function wr(e) {
  return e === "right" ? "end" : e === "center" ? "center" : "start";
}
function Cr(e) {
  return e === "top" ? "start" : e === "bottom" ? "end" : "center";
}
function _r(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.direction`, "horizontal"), c = r(e, `${t}.layoutAlignment`, "left"), s = x(e, `${t}.columns`, 3);
  return {
    scheme: no[n] ?? no["scheme-1"],
    direction: i === "vertical" ? "vertical" : "horizontal",
    verticalOnMobile: E(e, `${t}.verticalOnMobile`, !1),
    layoutAlignment: c === "left" || c === "right" ? c : "center",
    position: r(e, `${t}.position`, "center"),
    columns: Math.min(4, Math.max(2, s)),
    layoutGap: x(e, `${t}.layoutGap`, 16),
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: r(e, `${t}.height`, "auto"),
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none"),
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: E(e, `${t}.backgroundOverlay`, !1),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Wr(e, t, n, i) {
  const s = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, l = i === "template" ? _e(e, t, n, []) : ke(e, n, []), a = K(e, s);
  return !a || typeof a != "object" ? [] : (l.length ? l : Object.keys(a)).map((h) => {
    const u = a[h];
    if (!u) return null;
    const p = u.settings ?? {}, g = String(p.heading ?? p.title ?? "").trim();
    return g ? {
      id: h,
      icon: String(p.icon ?? "eye"),
      heading: g,
      text: String(p.text ?? "")
    } : null;
  }).filter((h) => h != null);
}
function zr(e, t) {
  const n = `.codiic-icons-with-text-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function Pr(e) {
  return `@media (max-width: 749px) { ${`.codiic-icons-with-text-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}`} { grid-template-columns: 1fr !important; } }`;
}
function pn({
  sectionId: e = "icons_with_text",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), c = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, s = n === "template" ? `template:${t}:${e}` : `layout:${e}`, l = M(
    () => _r(i, c),
    [i, c]
  ), a = M(
    () => Wr(i, t, e, n),
    [i, t, e, n]
  ), d = l.scheme, h = l.sectionWidth === "full" ? 24 : R.padX, u = l.sectionWidth === "full" ? "100%" : R.maxWidth, p = `codiic-icons-with-text-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = Math.max(a.length, l.columns), k = l.direction === "horizontal", y = l.verticalOnMobile && k ? `codiic-icons-with-text-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}` : "", v = {
    position: "relative",
    background: d.background,
    color: d.color,
    paddingTop: l.paddingTop,
    paddingBottom: l.paddingBottom,
    paddingLeft: h,
    paddingRight: h,
    boxSizing: "border-box",
    border: l.borderStyle === "solid" ? `1px solid ${d.muted}33` : void 0,
    borderRadius: l.cornerRadius > 0 ? l.cornerRadius : void 0,
    overflow: l.cornerRadius > 0 ? "hidden" : void 0
  }, b = l.backgroundMedia === "image" && l.backgroundImageUrl ? l.backgroundImageUrl : null, _ = {
    display: "grid",
    gridTemplateColumns: k ? `repeat(${g}, minmax(0, 1fr))` : "1fr",
    gap: l.layoutGap,
    width: "100%",
    justifyItems: wr(l.layoutAlignment),
    alignContent: Cr(l.position),
    minHeight: void 0
  }, $ = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 12
  }, w = {
    margin: 0,
    fontSize: "1.0625rem",
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.01em"
  }, P = {
    margin: 0,
    fontSize: "0.9375rem",
    lineHeight: 1.5,
    color: d.muted,
    maxWidth: 280
  }, z = zr(e, l.customCss), L = y ? Pr(e) : "", H = c.replace(/\.settings$/, "");
  return /* @__PURE__ */ m(B, { sectionId: e, label: "Icons with text", editorNodeId: s, style: v, children: [
    z ? /* @__PURE__ */ o("style", { children: z }) : null,
    L ? /* @__PURE__ */ o("style", { children: L }) : null,
    b ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${b})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    l.backgroundOverlay && b ? /* @__PURE__ */ o(
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
        className: p,
        style: {
          maxWidth: u,
          margin: "0 auto",
          width: "100%",
          position: "relative",
          zIndex: 2
        },
        children: /* @__PURE__ */ o("div", { className: y || void 0, style: _, children: a.map((W) => {
          const T = n === "template" ? `template:${t}:${e}:block:${W.id}` : `layout:${e}:block:${W.id}`;
          return /* @__PURE__ */ m(
            "div",
            {
              "data-codiic-node": T,
              "data-codiic-label": W.heading,
              "data-codiic-kind": "block",
              style: $,
              children: [
                /* @__PURE__ */ o(Sr, { icon: W.icon, style: { color: "inherit" } }),
                /* @__PURE__ */ o(
                  S,
                  {
                    fieldPath: `${H}.blocks.${W.id}.settings.heading`,
                    label: "Heading",
                    as: "h3",
                    style: w,
                    children: W.heading
                  }
                ),
                /* @__PURE__ */ o(
                  S,
                  {
                    fieldPath: `${H}.blocks.${W.id}.settings.text`,
                    label: "Description",
                    as: "p",
                    style: P,
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
  "scheme-1": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6" }
};
function Hr(e) {
  return e === "right" ? "end" : e === "center" ? "center" : "start";
}
function Tr(e) {
  return e === "top" ? "start" : e === "bottom" ? "end" : "center";
}
function Lr(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.direction`, "horizontal"), c = r(e, `${t}.layoutAlignment`, "left"), s = x(e, `${t}.columns`, 3);
  return {
    scheme: io[n] ?? io["scheme-1"],
    direction: i === "vertical" ? "vertical" : "horizontal",
    verticalOnMobile: E(e, `${t}.verticalOnMobile`, !0),
    layoutAlignment: c === "left" || c === "right" ? c : "center",
    position: r(e, `${t}.position`, "top"),
    columns: Math.min(4, Math.max(2, s)),
    layoutGap: x(e, `${t}.layoutGap`, 16),
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: r(e, `${t}.height`, "auto"),
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none"),
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: E(e, `${t}.backgroundOverlay`, !1),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Rr(e, t, n, i) {
  const s = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, l = i === "template" ? _e(e, t, n, []) : ke(e, n, []), a = K(e, s);
  return !a || typeof a != "object" ? [] : (l.length ? l : Object.keys(a)).map((h) => {
    const u = a[h];
    if (!u) return null;
    const p = u.settings ?? {}, g = String(p.heading ?? p.title ?? "").trim();
    return g ? {
      id: h,
      heading: g,
      text: String(p.text ?? "")
    } : null;
  }).filter((h) => h != null);
}
function Mr(e, t) {
  const n = `.codiic-multicolumn-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function Fr(e) {
  return `@media (max-width: 749px) { ${`.codiic-multicolumn-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}`} { grid-template-columns: 1fr !important; } }`;
}
function mn({
  sectionId: e = "multicolumn_section",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), c = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, s = n === "template" ? `template:${t}:${e}` : `layout:${e}`, l = M(() => Lr(i, c), [i, c]), a = M(
    () => Rr(i, t, e, n),
    [i, t, e, n]
  ), d = l.scheme, h = l.sectionWidth === "full" ? 24 : R.padX, u = l.sectionWidth === "full" ? "100%" : R.maxWidth, p = `codiic-multicolumn-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = Math.max(a.length, l.columns), k = l.direction === "horizontal", y = l.verticalOnMobile && k ? `codiic-multicolumn-stack-${e.replace(/[^a-z0-9_-]/gi, "-")}` : "", v = {
    position: "relative",
    background: d.background,
    color: d.color,
    paddingTop: l.paddingTop,
    paddingBottom: l.paddingBottom,
    paddingLeft: h,
    paddingRight: h,
    boxSizing: "border-box",
    border: l.borderStyle === "solid" ? `1px solid ${d.muted}33` : void 0,
    borderRadius: l.cornerRadius > 0 ? l.cornerRadius : void 0,
    overflow: l.cornerRadius > 0 ? "hidden" : void 0
  }, b = l.backgroundMedia === "image" && l.backgroundImageUrl ? l.backgroundImageUrl : null, _ = {
    display: "grid",
    gridTemplateColumns: k ? `repeat(${g}, minmax(0, 1fr))` : "1fr",
    gap: l.layoutGap,
    width: "100%",
    justifyItems: Hr(l.layoutAlignment),
    alignContent: Tr(l.position)
  }, $ = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 16
  }, w = {
    margin: 0,
    fontSize: "1.0625rem",
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.01em"
  }, P = {
    margin: 0,
    fontSize: "0.9375rem",
    lineHeight: 1.55,
    color: d.muted,
    maxWidth: 320
  }, z = Mr(e, l.customCss), L = y ? Fr(e) : "", H = c.replace(/\.settings$/, "");
  return /* @__PURE__ */ m(B, { sectionId: e, label: "Multicolumn", editorNodeId: s, style: v, children: [
    z ? /* @__PURE__ */ o("style", { children: z }) : null,
    L ? /* @__PURE__ */ o("style", { children: L }) : null,
    b ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${b})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    l.backgroundOverlay && b ? /* @__PURE__ */ o(
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
        className: p,
        style: {
          maxWidth: u,
          margin: "0 auto",
          width: "100%",
          position: "relative",
          zIndex: 2
        },
        children: /* @__PURE__ */ o("div", { className: y || void 0, style: _, children: a.map((W) => {
          const T = n === "template" ? `template:${t}:${e}:block:${W.id}` : `layout:${e}:block:${W.id}`;
          return /* @__PURE__ */ m(
            "div",
            {
              "data-codiic-node": T,
              "data-codiic-label": W.heading,
              "data-codiic-kind": "block",
              style: $,
              children: [
                /* @__PURE__ */ o(
                  S,
                  {
                    fieldPath: `${H}.blocks.${W.id}.settings.heading`,
                    label: "Heading",
                    as: "h3",
                    style: w,
                    children: W.heading
                  }
                ),
                /* @__PURE__ */ o(
                  S,
                  {
                    fieldPath: `${H}.blocks.${W.id}.settings.text`,
                    label: "Description",
                    as: "p",
                    style: P,
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
const ro = {
  "scheme-1": { background: "#f6f6f7", color: "#111827", muted: "#4b5563" },
  "scheme-2": { background: "#ffffff", color: "#111827", muted: "#4b5563" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6" }
}, Ar = {
  auto: 0,
  small: 200,
  medium: 280,
  large: 360
};
function Nr(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.layoutAlignment`, "center"), c = r(e, `${t}.height`, "auto"), s = r(e, `${t}.direction`, "vertical");
  return {
    scheme: ro[n] ?? ro["scheme-1"],
    direction: s === "horizontal" ? "horizontal" : "vertical",
    layoutAlignment: i === "left" || i === "right" ? i : "center",
    position: r(e, `${t}.position`, "center"),
    layoutGap: x(e, `${t}.layoutGap`, 16),
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: c,
    minHeightPx: Ar[c] ?? 0,
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none"),
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: E(e, `${t}.backgroundOverlay`, !1),
    paddingTop: x(e, `${t}.paddingTop`, 64),
    paddingBottom: x(e, `${t}.paddingBottom`, 64),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Er(e, t) {
  const n = `.codiic-pull-quote-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function Wt(e) {
  return e === "left" ? "left" : e === "right" ? "right" : "center";
}
function rt(e) {
  return e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function gn({
  sectionId: e = "pull_quote_section",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontHeading: c } = q(), s = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, l = n === "template" ? `template:${t}:${e}` : `layout:${e}`, a = M(() => Nr(i, s), [i, s]), d = r(i, `${s}.quote`), h = r(i, `${s}.linkLabel`), u = r(i, `${s}.linkUrl`), p = a.scheme, g = Wt(a.layoutAlignment), k = a.sectionWidth === "full" ? 24 : R.padX, y = a.sectionWidth === "full" ? "100%" : R.maxWidth, v = `codiic-pull-quote-${e.replace(/[^a-z0-9_-]/gi, "-")}`, b = {
    position: "relative",
    background: p.background,
    color: p.color,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: k,
    paddingRight: k,
    boxSizing: "border-box",
    minHeight: a.minHeightPx > 0 ? a.minHeightPx : void 0,
    border: a.borderStyle === "solid" ? `1px solid ${p.muted}33` : void 0,
    borderRadius: a.cornerRadius > 0 ? a.cornerRadius : void 0,
    overflow: a.cornerRadius > 0 ? "hidden" : void 0
  }, _ = a.backgroundMedia === "image" && a.backgroundImageUrl ? a.backgroundImageUrl : null, $ = a.direction === "horizontal", w = {
    maxWidth: y,
    margin: "0 auto",
    width: "100%",
    minHeight: a.minHeightPx > 0 ? a.minHeightPx - a.paddingTop - a.paddingBottom : void 0,
    display: "flex",
    flexDirection: $ ? "row" : "column",
    flexWrap: $ ? "wrap" : void 0,
    alignItems: $ ? rt(a.position) : g === "center" ? "center" : g === "right" ? "flex-end" : "flex-start",
    justifyContent: $ ? g === "center" ? "center" : g === "right" ? "flex-end" : "flex-start" : rt(a.position),
    gap: a.layoutGap,
    textAlign: g,
    position: "relative",
    zIndex: 2
  }, P = {
    margin: 0,
    fontFamily: c,
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
    maxWidth: 720
  }, z = {
    fontSize: "1rem",
    fontWeight: 500,
    color: "inherit",
    textDecoration: "underline",
    textUnderlineOffset: 3
  }, L = Er(e, a.customCss);
  return /* @__PURE__ */ m(B, { sectionId: e, label: "Pull quote", editorNodeId: l, style: b, children: [
    L ? /* @__PURE__ */ o("style", { children: L }) : null,
    _ ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${_})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    a.backgroundOverlay && _ ? /* @__PURE__ */ o(
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
    /* @__PURE__ */ m("div", { className: v, style: w, children: [
      /* @__PURE__ */ o(S, { fieldPath: `${s}.quote`, label: "Quote", as: "p", style: P, children: d }),
      h ? /* @__PURE__ */ o(S, { fieldPath: `${s}.linkLabel`, label: "Link label", as: "span", children: /* @__PURE__ */ o(D, { to: u || "#", style: z, children: h }) }) : null
    ] })
  ] });
}
const lo = {
  "scheme-1": { background: "#f6f6f7", color: "#111827", muted: "#4b5563" },
  "scheme-2": { background: "#ffffff", color: "#111827", muted: "#4b5563" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6" }
}, Ur = {
  auto: 0,
  small: 200,
  medium: 280,
  large: 360
};
function Or(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.layoutAlignment`, "center"), c = r(e, `${t}.height`, "auto"), s = r(e, `${t}.direction`, "vertical");
  return {
    scheme: lo[n] ?? lo["scheme-1"],
    direction: s === "horizontal" ? "horizontal" : "vertical",
    layoutAlignment: Wt(i),
    position: r(e, `${t}.position`, "center"),
    layoutGap: x(e, `${t}.layoutGap`, 16),
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: c,
    minHeightPx: Ur[c] ?? 0,
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none"),
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: E(e, `${t}.backgroundOverlay`, !1),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Gr(e, t) {
  const n = `.codiic-rich-text-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function fn({
  sectionId: e = "rich_text_section",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontHeading: c, fontBody: s } = q(), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(() => Or(i, l), [i, l]), h = r(i, `${l}.heading`), u = r(i, `${l}.text`), p = r(i, `${l}.buttonLabel`), g = r(i, `${l}.buttonUrl`), k = d.scheme, y = Wt(d.layoutAlignment), v = d.sectionWidth === "full" ? 24 : R.padX, b = d.sectionWidth === "full" ? "100%" : R.maxWidth, _ = `codiic-rich-text-${e.replace(/[^a-z0-9_-]/gi, "-")}`, $ = d.direction === "horizontal", w = {
    position: "relative",
    background: k.background,
    color: k.color,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: v,
    paddingRight: v,
    boxSizing: "border-box",
    minHeight: d.minHeightPx > 0 ? d.minHeightPx : void 0,
    border: d.borderStyle === "solid" ? `1px solid ${k.muted}33` : void 0,
    borderRadius: d.cornerRadius > 0 ? d.cornerRadius : void 0,
    overflow: d.cornerRadius > 0 ? "hidden" : void 0
  }, P = d.backgroundMedia === "image" && d.backgroundImageUrl ? d.backgroundImageUrl : null, z = {
    maxWidth: b,
    margin: "0 auto",
    width: "100%",
    minHeight: d.minHeightPx > 0 ? d.minHeightPx - d.paddingTop - d.paddingBottom : void 0,
    display: "flex",
    flexDirection: $ ? "row" : "column",
    flexWrap: $ ? "wrap" : void 0,
    alignItems: $ ? rt(d.position) : y === "center" ? "center" : y === "right" ? "flex-end" : "flex-start",
    justifyContent: $ ? y === "center" ? "center" : y === "right" ? "flex-end" : "flex-start" : rt(d.position),
    gap: d.layoutGap,
    textAlign: y,
    position: "relative",
    zIndex: 2
  }, L = {
    margin: 0,
    fontFamily: c,
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.02em"
  }, H = {
    margin: 0,
    fontFamily: s,
    fontSize: "1rem",
    lineHeight: 1.55,
    maxWidth: 520,
    color: k.muted
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
  }, T = Gr(e, d.customCss);
  return /* @__PURE__ */ m(B, { sectionId: e, label: "Rich text", editorNodeId: a, style: w, children: [
    T ? /* @__PURE__ */ o("style", { children: T }) : null,
    P ? /* @__PURE__ */ o(
      "div",
      {
        "aria-hidden": !0,
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${P})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }
      }
    ) : null,
    d.backgroundOverlay && P ? /* @__PURE__ */ o(
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
    /* @__PURE__ */ m("div", { className: _, style: z, children: [
      h ? /* @__PURE__ */ o(S, { fieldPath: `${l}.heading`, label: "Heading", as: "h2", style: L, children: h }) : null,
      u ? /* @__PURE__ */ o(S, { fieldPath: `${l}.text`, label: "Text", as: "p", style: H, children: u }) : null,
      p ? /* @__PURE__ */ o(S, { fieldPath: `${l}.buttonLabel`, label: "Button label", as: "span", children: /* @__PURE__ */ o(D, { to: g || "#", style: W, children: p }) }) : null
    ] })
  ] });
}
const ao = {
  "scheme-1": { background: "#f6f6f7", color: "#111827" },
  "scheme-2": { background: "#ffffff", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function Dr(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.motionDirection`, "forward");
  return {
    scheme: ao[n] ?? ao["scheme-1"],
    motionDirection: i === "reverse" ? "reverse" : "forward",
    paddingTop: x(e, `${t}.paddingTop`, 24),
    paddingBottom: x(e, `${t}.paddingBottom`, 24),
    layoutGap: x(e, `${t}.layoutGap`, 24),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function jr(e, t) {
  const n = `.codiic-text-marquee-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function bn({
  sectionId: e = "text_marquee_section",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c } = q(), s = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, l = n === "template" ? `template:${t}:${e}` : `layout:${e}`, a = M(() => Dr(i, s), [i, s]), d = r(i, `${s}.text`), h = `codiic-text-marquee-${e.replace(/[^a-z0-9_-]/gi, "-")}`, u = a.motionDirection === "reverse" ? "codiic-marquee-reverse" : "codiic-marquee-forward", p = {
    position: "relative",
    background: a.scheme.background,
    color: a.scheme.color,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: R.padX,
    paddingRight: R.padX,
    boxSizing: "border-box",
    overflow: "hidden"
  }, g = {
    display: "flex",
    width: "max-content",
    animation: `${u} 28s linear infinite`,
    gap: a.layoutGap,
    fontFamily: c,
    fontSize: "1.125rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap"
  }, k = {
    flexShrink: 0,
    paddingRight: a.layoutGap
  }, y = /* @__PURE__ */ o("span", { style: k, children: /* @__PURE__ */ o(S, { nodeId: l, fieldPath: `${s}.text`, label: "Text", children: d }) });
  return /* @__PURE__ */ o(B, { nodeId: l, label: "Marquee", children: /* @__PURE__ */ m("section", { className: h, style: p, "data-section-type": "text-marquee", children: [
    /* @__PURE__ */ o("style", { children: `
            @keyframes codiic-marquee-forward {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @keyframes codiic-marquee-reverse {
              from { transform: translateX(-50%); }
              to { transform: translateX(0); }
            }
            ${jr(e, a.customCss)}
          ` }),
    /* @__PURE__ */ o("div", { className: `${h}__viewport`, style: { overflow: "hidden", width: "100%" }, children: /* @__PURE__ */ m("div", { className: `${h}__track`, style: g, children: [
      y,
      /* @__PURE__ */ o("span", { style: k, "aria-hidden": !0, children: d })
    ] }) })
  ] }) });
}
const co = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function Br(e, t) {
  const n = r(e, `${t}.sizeUnit`, "");
  return n === "pixel" || n === "percent" ? n : "pixel";
}
function qr(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = co[n] ?? co["scheme-1"], c = r(e, `${t}.sectionWidth`, "page"), s = r(e, `${t}.layoutAlignment`, "center"), l = r(e, `${t}.logoFont`, "heading");
  let a = x(e, `${t}.pixelHeight`, 0);
  if (a <= 0) {
    const d = r(e, `${t}.height`, "");
    a = d === "small" ? 32 : d === "large" ? 64 : d === "auto" ? 40 : 48;
  }
  return {
    scheme: i,
    logoFont: l === "body" || l === "subheading" || l === "accent" ? l : "heading",
    sizeUnit: Br(e, t),
    pixelHeight: a,
    percentWidth: x(e, `${t}.percentWidth`, 100),
    customMobileSize: E(e, `${t}.customMobileSize`, !1),
    mobileSizeUnit: r(e, `${t}.mobileSizeUnit`) === "pixel" ? "pixel" : "percent",
    mobilePixelHeight: x(e, `${t}.mobilePixelHeight`, 120),
    mobilePercentWidth: x(e, `${t}.mobilePercentWidth`, 100),
    sectionWidth: c === "full" ? "full" : "page",
    layoutAlignment: s === "left" || s === "right" ? s : "center",
    paddingTop: x(e, `${t}.paddingTop`, 32),
    paddingBottom: x(e, `${t}.paddingBottom`, 32),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Xr(e) {
  return e === "left" ? "flex-start" : e === "right" ? "flex-end" : "center";
}
function Ir(e) {
  const t = e.sizeUnit === "pixel" ? `${e.pixelHeight}px` : void 0, n = e.sizeUnit === "percent" ? `${e.percentWidth}%` : void 0, i = e.customMobileSize ? e.mobileSizeUnit === "pixel" ? `${e.mobilePixelHeight}px` : void 0 : t, c = e.customMobileSize && e.mobileSizeUnit === "percent" ? `${e.mobilePercentWidth}%` : n;
  return {
    ...t ? { "--logo-height": t } : {},
    ...n ? { "--logo-width": n } : {},
    ...i ? { "--logo-height-mobile": i } : {},
    ...c ? { "--logo-width-mobile": c } : {}
  };
}
function Vr(e, t) {
  const n = `.codiic-storytelling-logo-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function Kr(e, t) {
  return e === "body" || e === "subheading" ? t.fontBody : t.fontHeading;
}
function Yr(e) {
  return e === "accent" ? { fontStyle: "italic" } : e === "subheading" ? { fontWeight: 600 } : e === "body" ? { fontWeight: 400 } : { fontWeight: 700 };
}
function yn({
  sectionId: e = "storytelling_logo",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontHeading: c, fontBody: s } = q(), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(
    () => qr(i, l),
    [i, l]
  ), h = r(i, `${l}.logoText`), u = r(i, `${l}.logoImageUrl`, ""), p = r(i, `${l}.logoLinkUrl`, "/"), g = d.scheme, k = d.sectionWidth === "full" ? 24 : R.padX, y = d.sectionWidth === "full" ? "100%" : R.maxWidth, v = `codiic-storytelling-logo-${e.replace(/[^a-z0-9_-]/gi, "-")}`, b = Ir(d), _ = Xr(d.layoutAlignment), $ = {
    position: "relative",
    background: g.background,
    color: g.color,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: k,
    paddingRight: k,
    boxSizing: "border-box",
    ...b
  }, w = {
    maxWidth: y,
    margin: "0 auto",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: _,
    textAlign: d.layoutAlignment,
    boxSizing: "border-box"
  }, P = {
    width: d.sizeUnit === "percent" ? `var(--logo-width, ${d.percentWidth}%)` : "auto",
    maxWidth: "100%",
    maxHeight: d.sizeUnit === "pixel" ? `calc(var(--logo-height, ${d.pixelHeight}px) + 0px)` : void 0,
    fontSize: d.sizeUnit === "pixel" ? `var(--logo-height, ${d.pixelHeight}px)` : void 0,
    lineHeight: 1.05,
    fontFamily: Kr(d.logoFont, { fontHeading: c, fontBody: s }),
    ...Yr(d.logoFont),
    color: g.color
  }, z = u ? /* @__PURE__ */ o(S, { fieldPath: `${l}.logoImageUrl`, label: "Logo image", as: "span", style: P, children: /* @__PURE__ */ o(
    "img",
    {
      src: u,
      alt: h || "Store logo",
      style: {
        display: "block",
        width: d.sizeUnit === "percent" ? "100%" : "auto",
        maxWidth: "100%",
        maxHeight: d.sizeUnit === "pixel" ? d.pixelHeight : 120,
        objectFit: "contain"
      }
    }
  ) }) : /* @__PURE__ */ o(S, { fieldPath: `${l}.logoText`, label: "Logo text", as: "span", style: P, children: h }), L = p && p !== "#" ? /* @__PURE__ */ o(D, { to: p, style: { display: "inline-flex", textDecoration: "none", color: "inherit" }, children: z }) : z, H = Vr(e, d.customCss);
  return /* @__PURE__ */ o(B, { nodeId: a, label: "Logo", children: /* @__PURE__ */ m("section", { className: v, style: $, "data-section-type": "storytelling-logo", children: [
    H ? /* @__PURE__ */ o("style", { children: H }) : null,
    /* @__PURE__ */ o("div", { style: w, children: L })
  ] }) });
}
function Qr() {
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
const so = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#4b5563", mediaPanel: "#f0f0f0" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#4b5563", mediaPanel: "#ececec" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#475569", mediaPanel: "#e8eef2" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#5b21b6", mediaPanel: "#ede9fe" }
}, Zr = {
  auto: 0,
  small: 320,
  medium: 420,
  large: 520
};
function Jr(e, t) {
  const n = r(e, `${t}.height`, "");
  return n === "auto" || n === "small" || n === "medium" || n === "large" ? n : "auto";
}
function el(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.direction`, ""), c = i === "horizontal" ? "horizontal" : "vertical";
  let s = !0;
  return i ? c === "horizontal" && (s = r(e, `${t}.layoutAlignment`, "left") === "right") : s = r(e, `${t}.mediaPosition`, "right") !== "left", {
    scheme: so[n] ?? so["scheme-1"],
    direction: c,
    layoutAlignment: r(e, `${t}.layoutAlignment`, "left"),
    position: r(e, `${t}.position`, "center"),
    layoutGap: x(e, `${t}.layoutGap`, 16),
    sectionWidth: r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page",
    height: Jr(e, t),
    backgroundMedia: r(e, `${t}.backgroundMedia`, "none"),
    backgroundImageUrl: r(e, `${t}.backgroundImageUrl`, ""),
    borderStyle: r(e, `${t}.borderStyle`, "none"),
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    backgroundOverlay: E(e, `${t}.backgroundOverlay`, !1),
    paddingTop: x(e, `${t}.paddingTop`, 32),
    paddingBottom: x(e, `${t}.paddingBottom`, 32),
    customCss: r(e, `${t}.customCss`, ""),
    videoOnRight: s
  };
}
function tl(e) {
  const t = Zr[e] ?? 0;
  return t > 0 ? t : void 0;
}
function uo(e) {
  return e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function ol(e) {
  return e === "right" ? "flex-end" : e === "center" ? "center" : "flex-start";
}
function nl(e, t) {
  const n = `.codiic-storytelling-video-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
const ho = {
  fontSize: 15,
  fontWeight: 500,
  color: "inherit",
  textDecoration: "none",
  whiteSpace: "nowrap"
}, il = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.45,
  color: "inherit",
  maxWidth: "min(100%, 520px)"
};
function rl() {
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
function xn({
  sectionId: e = "storytelling_video",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c } = q(), s = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, l = n === "template" ? `template:${t}:${e}` : `layout:${e}`, a = M(
    () => el(i, s),
    [i, s]
  ), d = r(i, `${s}.videoSource`, "url"), h = r(i, `${s}.videoUrl`, ""), u = r(i, `${s}.coverImageUrl`, ""), p = r(
    i,
    `${s}.caption`,
    "Take a look behind the scenes of our latest product launch."
  ), g = r(i, `${s}.linkLabel`), k = r(i, `${s}.linkUrl`), y = a.scheme, v = tl(a.height), b = a.sectionWidth === "full" ? 24 : R.padX, _ = a.sectionWidth === "full" ? "100%" : R.maxWidth, $ = a.videoOnRight, w = a.direction === "horizontal", P = `codiic-storytelling-video-${e.replace(/[^a-z0-9_-]/gi, "-")}`, z = {
    position: "relative",
    background: y.background,
    color: y.color,
    fontFamily: c,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: b,
    paddingRight: b,
    boxSizing: "border-box",
    overflow: "hidden",
    border: a.borderStyle === "solid" ? `1px solid ${y.muted}33` : void 0,
    borderRadius: a.cornerRadius > 0 ? a.cornerRadius : void 0
  }, L = {
    maxWidth: _,
    margin: "0 auto",
    width: "100%",
    minHeight: v ?? (w ? 360 : 400),
    display: "flex",
    flexDirection: w ? "row" : "column",
    gap: a.layoutGap,
    alignItems: w ? uo(a.position) : "stretch",
    justifyContent: w ? ol(a.layoutAlignment) : "flex-start",
    boxSizing: "border-box",
    position: "relative"
  }, H = {
    position: "relative",
    flex: w ? "1 1 66%" : "1 1 auto",
    minHeight: w ? void 0 : Math.max((v ?? 400) - 88, 260),
    width: w ? void 0 : "100%",
    order: w && !$ ? 0 : w ? 1 : 0
  }, W = {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: w ? "100%" : "66%",
    ...$ || w ? { right: 0 } : { left: 0 },
    background: y.mediaPanel,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    clipPath: $ || w ? "polygon(14% 0, 100% 0, 100% 100%, 0 100%)" : "polygon(0 0, 100% 0, 86% 100%, 0 100%)"
  }, T = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    ...$ || w ? { left: "12%" } : { right: "12%" }
  }, C = {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 24,
    paddingTop: w ? 0 : 24,
    paddingBottom: 4,
    width: "100%",
    flex: w ? "0 0 auto" : void 0,
    alignSelf: w ? uo(a.position) : void 0,
    boxSizing: "border-box",
    position: "relative",
    zIndex: 3,
    order: w && !$ ? 1 : w ? 0 : 1,
    maxWidth: w ? "34%" : "100%"
  }, F = u && d !== "uploaded" ? /* @__PURE__ */ o(
    "img",
    {
      src: u,
      alt: "",
      style: { width: "100%", height: "100%", objectFit: "cover", display: "block" }
    }
  ) : h ? /* @__PURE__ */ o(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${y.mediaPanel} 0%, #d8d8d8 100%)`
      }
    }
  ) : /* @__PURE__ */ o(Qr, {}), f = nl(e, a.customCss);
  return /* @__PURE__ */ o(B, { nodeId: l, label: "Video", children: /* @__PURE__ */ m("section", { className: P, style: z, "data-section-type": "storytelling-video", children: [
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
    /* @__PURE__ */ m("div", { style: L, children: [
      /* @__PURE__ */ o("div", { style: H, children: /* @__PURE__ */ m(S, { fieldPath: `${s}.coverImageUrl`, label: "Cover image", as: "div", style: W, children: [
        F,
        /* @__PURE__ */ o("div", { style: T, children: /* @__PURE__ */ o(rl, {}) })
      ] }) }),
      /* @__PURE__ */ m("div", { style: C, children: [
        /* @__PURE__ */ o(S, { fieldPath: `${s}.caption`, label: "Caption", as: "p", style: il, children: p }),
        /* @__PURE__ */ o(S, { fieldPath: `${s}.linkLabel`, label: "Link", as: "span", children: k ? /* @__PURE__ */ o(D, { to: k, style: ho, children: g }) : /* @__PURE__ */ o("span", { style: ho, children: g }) })
      ] })
    ] })
  ] }) });
}
function $n(e, t) {
  const n = r(e, `${t}.textCase`, "default");
  return {
    fontSize: r(e, `${t}.fontSize`, "12px"),
    textTransform: n === "uppercase" ? "uppercase" : "none"
  };
}
function ll(e, t) {
  const i = r(e, `${t}.text`, "").replace(/^©\s*\d{4}\s*/i, "").replace(/\s*\.\s*All rights reserved\.?$/i, "").trim();
  return {
    ...$n(e, t),
    showPoweredBy: E(e, `${t}.showPoweredBy`, !1),
    poweredByLabel: r(e, `${t}.poweredByLabel`),
    storeLabel: i
  };
}
function al(e, t = (/* @__PURE__ */ new Date()).getFullYear()) {
  const n = e.storeLabel ? `© ${t} ${e.storeLabel}` : `© ${t}`;
  return !e.showPoweredBy || !e.poweredByLabel.trim() ? n : `${n}, ${e.poweredByLabel.trim()}`;
}
const dl = {
  "scheme-1": { background: "#f3f4f6", color: "#111827", muted: "#6b7280", border: "#e5e7eb" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", muted: "#64748b", border: "#e2e8f0" },
  "scheme-3": { background: "#fff7ed", color: "#431407", muted: "#9a3412", border: "#fed7aa" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", muted: "#6d28d9", border: "#ddd6fe" }
};
function cl(e, t, n) {
  const i = r(e, `${t}.colorScheme`, "scheme-1");
  return dl[i] ?? n;
}
function sl(e, t) {
  return r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function ul(e, t) {
  return Math.max(0, x(e, `${t}.gap`, 24));
}
function hl(e, t) {
  return Math.max(0, x(e, `${t}.dividerThickness`, 0));
}
function pl(e, t) {
  return {
    paddingTop: x(e, `${t}.paddingTop`, 20),
    paddingBottom: x(e, `${t}.paddingBottom`, 48)
  };
}
function ml(e, t) {
  return E(e, `${t}.paymentIcons`, !1);
}
function gl(e, t) {
  const n = t.trim();
  if (!n) return "";
  const i = `[data-codiic-section="${e}"]`;
  return n.replace(/:root/g, i).replace(/&/g, i);
}
const fl = [
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
function bl(e, t, n, i) {
  const c = r(e, `${t}.${n}`, "").trim();
  return c || (i ? r(e, `${t}.${i}`, "").trim() : "");
}
function yl(e, t) {
  return r(e, `${t}.catalogVariant`, "");
}
function xl({ sectionId: e = "footer_utilities" }) {
  const t = j(), { text: n, fontBody: i } = q(), { storeFrontMeta: c } = De(), { fetchByStoreId: s } = Mn();
  le(() => {
    c?.storeId && s(c.storeId);
  }, [s, c?.storeId]);
  const l = `sections.${e}.settings`, a = `sections.${e}.blocks`, h = yl(t, l) === "policies-links", u = M(() => ({
    scheme: cl(t, l, {
      background: "#f3f4f6",
      color: n,
      muted: "#6b7280",
      border: R.line
    }),
    widthMode: sl(t, l),
    gap: ul(t, l),
    dividerPx: hl(t, l),
    ...pl(t, l),
    showPaymentIcons: ml(t, l),
    customCss: r(t, `${l}.customCss`, "")
  }), [t, l, n]), p = `${a}.copyright.settings`, g = `${a}.policy_links.settings`, k = M(() => ll(t, p), [t, p]), y = M(() => al(k), [k]), v = M(
    () => $n(t, g),
    [t, g]
  ), b = r(t, `${g}.privacyLabel`), _ = r(t, `${g}.privacyHref`, "#"), $ = r(t, `${g}.termsLabel`), w = r(t, `${g}.termsHref`, "#");
  u.scheme.muted, v.fontSize, v.textTransform;
  const P = `${a}.social.settings`, L = ke(t, e, h ? ["copyright", "policy_links"] : ["copyright", "policy_links", "social"]), H = {
    copyright: /* @__PURE__ */ o(N, { nodeId: `layout:${e}:block:copyright`, label: "Copyright", children: /* @__PURE__ */ o(S, { fieldPath: `${p}.showPoweredBy`, label: 'Show "Powered by" badge', children: /* @__PURE__ */ o(
      "span",
      {
        style: {
          color: u.scheme.muted,
          fontSize: k.fontSize,
          textTransform: k.textTransform
        },
        children: y
      }
    ) }) }),
    policy_links: /* @__PURE__ */ m(
      N,
      {
        nodeId: `layout:${e}:block:policy_links`,
        label: "Policy links",
        style: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" },
        children: [
          /* @__PURE__ */ o(
            Fn,
            {
              storeId: c?.storeId,
              linkClassName: "",
              className: ""
            }
          ),
          /* @__PURE__ */ m("span", { style: { display: "none" }, "aria-hidden": !0, children: [
            /* @__PURE__ */ o(D, { to: _, children: b }),
            /* @__PURE__ */ o(D, { to: w, children: $ })
          ] })
        ]
      }
    ),
    social: /* @__PURE__ */ o(
      N,
      {
        nodeId: `layout:${e}:block:social`,
        label: "Social media links",
        style: { display: "flex", flexWrap: "wrap", gap: 12 },
        children: fl.map((C) => {
          const F = bl(t, P, C.settingKey, C.id === "instagram" || C.id === "facebook" ? C.id : void 0);
          return /* @__PURE__ */ o(
            S,
            {
              fieldPath: `${P}.${C.settingKey}`,
              label: C.label,
              children: F ? /* @__PURE__ */ o(
                "a",
                {
                  href: F,
                  target: "_blank",
                  rel: "noreferrer",
                  style: { color: u.scheme.muted, textDecoration: "underline", fontSize: 13 },
                  children: C.label
                }
              ) : /* @__PURE__ */ o("span", { style: { color: u.scheme.muted, opacity: 0.45, fontSize: 13 }, children: C.label })
            },
            C.id
          );
        })
      }
    )
  }, W = u.widthMode === "full" ? "100%" : R.maxWidth, T = u.widthMode === "full" ? 0 : R.padX;
  return /* @__PURE__ */ m(
    B,
    {
      sectionId: e,
      label: h ? "Policies and links" : "Utilities",
      style: {
        background: u.scheme.background,
        borderTop: h ? `1px solid ${u.scheme.border}` : `${u.dividerPx}px solid ${u.scheme.border}`,
        fontFamily: i,
        fontSize: 13,
        color: u.scheme.color,
        paddingTop: u.paddingTop,
        paddingBottom: u.paddingBottom,
        paddingLeft: T,
        paddingRight: T,
        boxSizing: "border-box"
      },
      children: [
        u.customCss ? /* @__PURE__ */ o("style", { dangerouslySetInnerHTML: { __html: gl(e, u.customCss) } }) : null,
        /* @__PURE__ */ m(
          "div",
          {
            style: {
              maxWidth: W,
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: u.gap
            },
            children: [
              L.map((C) => {
                const F = H[C];
                return F ? /* @__PURE__ */ o("span", { children: F }, C) : null;
              }),
              !h && u.showPaymentIcons ? /* @__PURE__ */ o(
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
function kn(e) {
  return e === "footer_utilities" || /^footer_utilities_\d+$/.test(e);
}
function $l(e) {
  return kn(e) ? !1 : e === "footer" || /^footer_\d+$/.test(e);
}
function kl({ sectionId: e }) {
  return kn(e) ? /* @__PURE__ */ o(xl, { sectionId: e }) : $l(e) ? /* @__PURE__ */ o(Yo, { sectionId: e }) : e === "divider" || e.startsWith("divider_") ? /* @__PURE__ */ o(_t, { sectionId: e, placement: "layout" }) : e === "custom_section" || e.startsWith("custom_section_") ? /* @__PURE__ */ o(wt, { sectionId: e, placement: "layout" }) : e === "hero_main" || e.startsWith("hero_main_") ? /* @__PURE__ */ o(St, { sectionId: e, placement: "layout" }) : e === "product_highlight" || e.startsWith("product_highlight_") ? /* @__PURE__ */ o(Mi, { sectionId: e }) : e === "image_compare" || e.startsWith("image_compare_") ? /* @__PURE__ */ o(ir, { sectionId: e }) : e === "image_with_text" || e.startsWith("image_with_text_") ? /* @__PURE__ */ o(hr, { sectionId: e }) : e === "editorial_jumbo" || e.startsWith("editorial_jumbo_") ? /* @__PURE__ */ o(Vi, { sectionId: e }) : e === "editorial" || e.startsWith("editorial_") ? /* @__PURE__ */ o(Oi, { sectionId: e }) : e === "faq_section" || e.startsWith("faq_section_") ? /* @__PURE__ */ o(hn, { sectionId: e, placement: "layout" }) : e === "icons_with_text" || e.startsWith("icons_with_text_") ? /* @__PURE__ */ o(pn, { sectionId: e, placement: "layout" }) : e === "multicolumn_section" || e.startsWith("multicolumn_section_") ? /* @__PURE__ */ o(mn, { sectionId: e, placement: "layout" }) : e === "pull_quote_section" || e.startsWith("pull_quote_section_") ? /* @__PURE__ */ o(gn, { sectionId: e, placement: "layout" }) : e === "rich_text_section" || e.startsWith("rich_text_section_") ? /* @__PURE__ */ o(fn, { sectionId: e, placement: "layout" }) : e === "text_marquee_section" || e.startsWith("text_marquee_section") ? /* @__PURE__ */ o(bn, { sectionId: e, placement: "layout" }) : e === "contact_form" || e.startsWith("contact_form") ? /* @__PURE__ */ o(tn, { sectionId: e, placement: "layout" }) : e === "email_signup" || e.startsWith("email_signup") ? /* @__PURE__ */ o(on, { sectionId: e, placement: "layout" }) : e === "storytelling_logo" || e.startsWith("storytelling_logo") ? /* @__PURE__ */ o(yn, { sectionId: e, placement: "layout" }) : e === "storytelling_video" || e.startsWith("storytelling_video") ? /* @__PURE__ */ o(xn, { sectionId: e, placement: "layout" }) : null;
}
const vl = {
  "scheme-1": { background: "#111827", color: "#f9fafb", linkColor: "#93c5fd" },
  "scheme-2": { background: "#1e3a5f", color: "#eff6ff", linkColor: "#bfdbfe" },
  "scheme-3": { background: "#431407", color: "#fff7ed", linkColor: "#fdba74" },
  "scheme-4": { background: "#4c1d95", color: "#f5f3ff", linkColor: "#ddd6fe" }
};
function Sl(e, t, n) {
  const i = r(e, `${t}.colorScheme`, "scheme-4");
  return vl[i] ?? n;
}
function wl(e, t) {
  return r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function Cl(e, t) {
  return {
    paddingTop: x(e, `${t}.paddingTop`, 15),
    paddingBottom: x(e, `${t}.paddingBottom`, 15)
  };
}
function _l(e, t) {
  return Math.max(0, x(e, `${t}.dividerThickness`, 0));
}
function Wl(e, t) {
  const n = x(e, `${t}.timeToNext`, 5);
  return !Number.isFinite(n) || n <= 0 ? 0 : n;
}
function zl(e, t) {
  const n = t.trim();
  if (!n) return "";
  const i = `[data-codiic-section="${e}"]`;
  return n.replace(/:root/g, i).replace(/&/g, i);
}
function po(e, t, n) {
  const i = r(e, `${t}.font`, "subheading"), c = r(e, `${t}.fontSize`, "12px"), s = r(e, `${t}.fontWeight`, "default"), l = r(e, `${t}.letterSpacing`), a = r(e, `${t}.textCase`, "default"), d = i === "heading" ? n.fontHeading : n.fontBody, h = l === "tight" ? "-0.02em" : l === "wide" ? "0.08em" : "normal", u = s === "default" ? void 0 : Number.isFinite(Number(s)) ? Number(s) : void 0;
  return {
    fontFamily: d,
    fontSize: c,
    fontWeight: u,
    letterSpacing: h,
    textTransform: a === "uppercase" ? "uppercase" : "none"
  };
}
function Pl(e) {
  return {
    fontFamily: e.fontFamily,
    fontSize: e.fontSize,
    fontWeight: e.fontWeight,
    letterSpacing: e.letterSpacing,
    textTransform: e.textTransform
  };
}
function Hl(e, t, n, i) {
  const c = [];
  for (const s of n) {
    const l = `${t}.blocks.${s}.settings`, a = r(e, `${l}.text`, "").trim();
    a && c.push({
      blockId: s,
      text: a,
      link: r(e, `${l}.link`, "").trim(),
      typography: po(e, l, i)
    });
  }
  if (!c.length) {
    const s = r(e, `${t}.settings.message`, "").trim();
    s && c.push({
      blockId: "announcement",
      text: s,
      link: r(e, `${t}.settings.linkHref`, "").trim(),
      typography: po(
        e,
        `${t}.blocks.announcement.settings`,
        i
      )
    });
  }
  return c;
}
function Tl({ sectionId: e = "announcement_bar" }) {
  const t = j(), n = q(), i = kt(), c = An(), s = Nn(c, e), l = {
    background: n.primary,
    color: n.background,
    linkColor: n.background
  }, a = `sections.${e}`, d = `${a}.settings`, h = E(t, `${d}.enabled`, !0), u = ke(t, e, ["announcement"]), p = M(
    () => Hl(t, a, u, {
      fontHeading: n.fontHeading,
      fontBody: n.fontBody
    }),
    [t, a, u, n.fontHeading, n.fontBody]
  ), [g, k] = te(0), y = Wl(t, d);
  le(() => {
    k(0);
  }, [e, p.map((C) => `${C.blockId}\0${C.text}`).join("")]), le(() => {
    if (!s || !p.length) return;
    const C = p.findIndex((F) => F.blockId === s);
    C >= 0 && k(C);
  }, [s, p]), le(() => {
    if (i || p.length <= 1 || y <= 0) return;
    const C = window.setInterval(() => {
      k((F) => (F + 1) % p.length);
    }, y * 1e3);
    return () => window.clearInterval(C);
  }, [i, p.length, y]);
  const v = M(() => {
    if (s) {
      const C = p.findIndex((F) => F.blockId === s);
      if (C >= 0) return C;
    }
    return g;
  }, [s, p, g]), b = p[v] ?? p[0];
  if (!h || !p.length || !b?.text) return null;
  const _ = Sl(t, d, l), $ = wl(t, d), { paddingTop: w, paddingBottom: P } = Cl(t, d), z = _l(t, d), L = r(t, `${d}.customCss`, ""), H = zl(e, L), W = (C, F) => {
    const f = Pl(C.typography), U = `${a}.blocks.${C.blockId}.settings.text`, X = `${a}.blocks.${C.blockId}.settings.link`, O = /* @__PURE__ */ o(S, { fieldPath: U, label: "Text", children: /* @__PURE__ */ o("span", { style: f, children: C.text }) }), Y = C.link && C.link.startsWith("/") ? /* @__PURE__ */ m(D, { to: C.link, style: { color: _.color, textDecoration: "none" }, children: [
      O,
      /* @__PURE__ */ o(
        "span",
        {
          "data-codiic-node": `field:${X}`,
          "data-codiic-label": "Link",
          "data-codiic-kind": "field",
          hidden: !0,
          children: C.link
        }
      )
    ] }) : C.link ? /* @__PURE__ */ o("a", { href: C.link, style: { color: _.color, textDecoration: "none" }, children: O }) : O;
    return /* @__PURE__ */ o(
      "div",
      {
        style: {
          display: F ? "block" : "none"
        },
        "aria-hidden": !F,
        children: u.includes(C.blockId) ? /* @__PURE__ */ o(N, { nodeId: `layout:${e}:block:${C.blockId}`, label: "Announcement", children: Y }) : /* @__PURE__ */ o(S, { fieldPath: `${d}.message`, label: "Announcement text", children: /* @__PURE__ */ o("span", { style: f, children: C.text }) })
      },
      C.blockId
    );
  }, T = i && p.length > 1;
  return /* @__PURE__ */ m(
    B,
    {
      sectionId: e,
      label: "Announcement bar",
      style: {
        background: _.background,
        color: _.color,
        fontFamily: n.fontBody,
        fontSize: 13,
        textAlign: "center",
        paddingTop: w,
        paddingBottom: P,
        borderBottom: z > 0 ? `${z}px solid rgba(0,0,0,0.15)` : void 0,
        width: "100%",
        boxSizing: "border-box"
      },
      children: [
        H ? /* @__PURE__ */ o("style", { children: H }) : null,
        /* @__PURE__ */ o(
          "div",
          {
            style: $ === "page" ? { maxWidth: 1200, margin: "0 auto", paddingLeft: 16, paddingRight: 16 } : { width: "100%", paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" },
            children: T ? p.map(
              (C, F) => W(C, s ? C.blockId === s : F === v)
            ) : W(b, !0)
          }
        )
      ]
    }
  );
}
function Ll({ sectionId: e }) {
  return e === "header" || e.startsWith("header_") ? /* @__PURE__ */ o(Zo, { sectionId: e }) : e === "announcement_bar" || e.startsWith("announcement_bar_") ? /* @__PURE__ */ o(Tl, { sectionId: e }) : e === "divider" || e.startsWith("divider_") ? /* @__PURE__ */ o(_t, { sectionId: e, placement: "layout" }) : e === "custom_section" || e.startsWith("custom_section_") ? /* @__PURE__ */ o(wt, { sectionId: e, placement: "layout" }) : null;
}
function Te({ children: e }) {
  const t = j(), { background: n, text: i, primary: c } = q(), s = ai(t), l = di(t);
  return /* @__PURE__ */ m(
    "div",
    {
      className: "hz-storefront",
      style: {
        minHeight: "100vh",
        background: n,
        color: i,
        "--hz-bg": n,
        "--hz-text": i,
        "--hz-primary": c,
        "--hz-on-primary": n
      },
      children: [
        s.map(
          (a) => At(t, a) ? /* @__PURE__ */ o(Ll, { sectionId: a }, a) : null
        ),
        /* @__PURE__ */ o("main", { children: e }),
        l.map(
          (a) => At(t, a) ? /* @__PURE__ */ o(kl, { sectionId: a }, a) : null
        )
      ]
    }
  );
}
const dt = {
  allProducts: "/collections/all"
};
function vn(e) {
  const t = e.trim();
  return t ? `/product/${encodeURIComponent(t)}` : dt.allProducts;
}
function Sn(e) {
  const t = e.trim().toLowerCase();
  return !t || t === "all" ? dt.allProducts : `/collection/${encodeURIComponent(t)}`;
}
const Ce = "templates.cart.sections.cart_main";
function mo(e) {
  const t = e.productVariantId;
  return typeof t == "object" && t !== null && "_id" in t ? t : null;
}
function Rl() {
  const e = j(), t = kt(), { text: n, background: i, primary: c, fontHeading: s, fontBody: l } = q(), { user: a, checkAuth: d } = tt(), { getAllItems: h, getCartByCustomerId: u, updateCartEntry: p, deleteCartEntry: g, loading: k } = $t(), [y, v] = te({}), b = r(e, `${Ce}.settings.title`), _ = r(e, `${Ce}.blocks.empty_state.blocks.empty_message.settings.emptyTitle`), $ = r(e, `${Ce}.blocks.empty_state.blocks.continue_link.settings.label`), w = r(e, `${Ce}.blocks.empty_state.blocks.continue_link.settings.href`), P = r(e, `${Ce}.blocks.line_items.blocks.item_actions.settings.removeLabel`), z = r(e, `${Ce}.blocks.line_items.blocks.item_actions.settings.loadingLabel`), L = r(e, `${Ce}.blocks.cart_summary.blocks.subtotal.settings.label`);
  le(() => {
    t || d();
  }, [d, t]), le(() => {
    t || !a?._id || u(a._id);
  }, [u, t, a?._id]);
  const H = h(), W = M(() => H.length > 0 ? H : t ? li : [], [H, t]), T = M(() => {
    let f = 0;
    for (const U of W) {
      const X = mo(U);
      X && (f += X.price * U.quantity);
    }
    return f;
  }, [W]), C = !t && k && W.length === 0, F = !C && W.length === 0;
  return /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o(B, { sectionId: "cart_main", label: "Cart", style: { padding: `clamp(48px, 6vw, 80px) ${R.padX}px`, fontFamily: l, color: n }, children: /* @__PURE__ */ m("div", { className: "hz-cart", children: [
    /* @__PURE__ */ o(S, { fieldPath: `${Ce}.settings.title`, label: "Page title", as: "h1", style: { fontFamily: s, fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 400, margin: "0 0 32px", letterSpacing: "-0.03em" }, children: b }),
    C ? /* @__PURE__ */ o(N, { nodeId: "template:cart:cart_main:block:line_items", label: "Line items", children: /* @__PURE__ */ o("p", { style: { opacity: 0.7 }, children: z }) }) : null,
    F ? /* @__PURE__ */ o(N, { nodeId: "template:cart:cart_main:block:empty_state", label: "Empty cart", children: /* @__PURE__ */ m("p", { style: { opacity: 0.7 }, children: [
      /* @__PURE__ */ o(S, { fieldPath: `${Ce}.blocks.empty_state.blocks.empty_message.settings.emptyTitle`, label: "Empty cart text", as: "span", children: _ }),
      " ",
      /* @__PURE__ */ o(D, { to: w, style: { color: c }, children: /* @__PURE__ */ o(S, { fieldPath: `${Ce}.blocks.empty_state.blocks.continue_link.settings.label`, label: "Link label", as: "span", children: $ }) })
    ] }) }) : null,
    W.length > 0 ? /* @__PURE__ */ m(Z, { children: [
      /* @__PURE__ */ o(N, { nodeId: "template:cart:cart_main:block:line_items", label: "Line items", children: /* @__PURE__ */ o("div", { style: { display: "grid", gap: 12, marginTop: 24 }, children: W.map((f) => {
        const U = mo(f);
        return /* @__PURE__ */ o("article", { className: "hz-cart__line", children: /* @__PURE__ */ m("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ m("div", { children: [
            U ? /* @__PURE__ */ o(D, { to: vn(String(U.productId)), style: { color: n, fontWeight: 500 }, onClick: (X) => t && X.preventDefault(), children: U.sku }) : /* @__PURE__ */ o("span", { children: "Item" }),
            /* @__PURE__ */ m("p", { style: { margin: "8px 0 0" }, children: [
              U ? Ge(U.price) : "—",
              " each"
            ] })
          ] }),
          /* @__PURE__ */ m("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }, children: [
            /* @__PURE__ */ o(
              "input",
              {
                type: "number",
                min: 1,
                value: y[f._id] ?? String(f.quantity),
                readOnly: t,
                onChange: (X) => v((O) => ({ ...O, [f._id]: X.target.value })),
                onBlur: () => {
                  if (t) return;
                  const X = Math.max(1, Math.floor(Number(y[f._id]) || f.quantity));
                  X !== f.quantity && p({ id: f._id, quantity: X });
                },
                style: { ...vt, width: 72, fontFamily: l }
              }
            ),
            /* @__PURE__ */ o(N, { nodeId: "template:cart:cart_main:block:line_items:block:item_actions", label: "Item actions", children: /* @__PURE__ */ o(
              "button",
              {
                type: "button",
                onClick: () => {
                  t || g(f._id);
                },
                style: { background: "none", border: "none", color: c, cursor: t ? "default" : "pointer" },
                children: /* @__PURE__ */ o(S, { fieldPath: `${Ce}.blocks.line_items.blocks.item_actions.settings.removeLabel`, label: "Remove button", as: "span", children: P })
              }
            ) })
          ] })
        ] }) }, f._id);
      }) }) }),
      /* @__PURE__ */ o(N, { nodeId: "template:cart:cart_main:block:cart_summary", label: "Summary", children: /* @__PURE__ */ m("div", { className: "hz-cart__summary", children: [
        /* @__PURE__ */ m("p", { style: { fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em" }, children: [
          /* @__PURE__ */ o(S, { fieldPath: `${Ce}.blocks.cart_summary.blocks.subtotal.settings.label`, label: "Subtotal prefix", as: "span", children: L }),
          " ",
          Ge(T)
        ] }),
        /* @__PURE__ */ o(
          D,
          {
            to: "/checkout",
            onClick: (f) => t && f.preventDefault(),
            className: "hz-btn hz-btn--primary",
            style: { marginTop: 20, textDecoration: "none", display: "inline-flex" },
            children: "Proceed to checkout"
          }
        )
      ] }) })
    ] }) : null
  ] }) }) });
}
function Ml({ sectionId: e = "custom_section", templateId: t = "index" }) {
  return /* @__PURE__ */ o(wt, { sectionId: e, placement: "template", templateId: t });
}
function zt({ variant: e }) {
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
const go = ["sewing", "thread", "boxes"];
function Fl(e) {
  return e === "thread" || e === "boxes" ? e : "sewing";
}
function Al(e) {
  if (!e) return "";
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? "" : t.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}
function Nl(e, t, n) {
  return e.slice(0, Math.max(1, t)).map((i, c) => ({
    id: i._id || `post-${c}`,
    illustrationVariant: go[c % go.length],
    title: i.title || "Untitled",
    date: Al(i.createdAt),
    author: i.author || "",
    excerpt: i.excerpt || "",
    imageUrl: i.featuredImageUrl || "",
    href: n && i.urlHandle ? `/blogs/${n}/${i.urlHandle}` : void 0
  }));
}
function El(e, t, n, i, c) {
  const l = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, a = i === "template" ? _e(e, t, n, []) : ke(e, n, []), d = K(e, l);
  if (!d || typeof d != "object") return [];
  const h = a.length ? a : Object.keys(d), u = Math.max(1, Math.min(12, c));
  return h.slice(0, u).map((p) => {
    const g = d[p]?.settings ?? {};
    return {
      id: p,
      illustrationVariant: Fl(String(g.illustrationVariant ?? "sewing")),
      title: String(g.title ?? "Title"),
      date: String(g.date ?? "Jan 12"),
      author: String(g.author ?? "Author"),
      excerpt: String(g.excerpt ?? "An excerpt of your blog post's content"),
      imageUrl: String(g.imageUrl ?? "")
    };
  });
}
function Pt(e, t, n, i, c) {
  const s = j(), { storeFrontMeta: l } = De(), { fetchVisiblePostsByBlogUrlHandle: a } = En(), [d, h] = te([]), u = r(s, `${i}.blogHandle`, "").trim(), p = l?.storeId ?? "", g = M(
    () => El(s, e, t, n, c),
    [s, e, t, n, c]
  );
  le(() => {
    let v = !1;
    if (!p || !u) {
      h([]);
      return;
    }
    return a(p, u, { page: 1, limit: 12 }).then((b) => {
      v || h(b);
    }).catch(() => {
      v || h([]);
    }), () => {
      v = !0;
    };
  }, [p, u, a]);
  const k = M(
    () => Nl(d, c, u),
    [d, c, u]
  ), y = k.length > 0;
  return { cards: y ? k : g, usingLive: y };
}
const fo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function Ul(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.navIcon`, "arrows"), c = r(e, `${t}.navIconBackground`, "circle"), s = r(e, `${t}.sectionWidth`, "page"), l = r(e, `${t}.mobileCardSize`, "1");
  return {
    scheme: fo[n] ?? fo["scheme-1"],
    heading: r(e, `${t}.heading`),
    postCount: x(e, `${t}.postCount`, 5),
    columns: x(e, `${t}.columns`, 3),
    mobileCardSize: l === "2" ? 2 : 1,
    horizontalGap: x(e, `${t}.horizontalGap`, 8),
    navIcon: i === "chevron" ? "chevron" : i === "none" ? "none" : "arrows",
    navIconBackground: c === "square" ? "square" : c === "none" ? "none" : "circle",
    sectionWidth: s === "full" ? "full" : "page",
    layoutGap: x(e, `${t}.layoutGap`, 12),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Ol(e, t) {
  const n = `.codiic-blog-posts-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function bo({
  label: e,
  onClick: t,
  background: n,
  shape: i
}) {
  return /* @__PURE__ */ o("button", { type: "button", "aria-label": e, onClick: t, style: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: n === "none" ? 32 : 36,
    height: n === "none" ? 32 : 36,
    border: "none",
    cursor: "pointer",
    background: n === "circle" || n === "square" ? "rgba(255,255,255,0.95)" : "transparent",
    borderRadius: n === "circle" ? "50%" : n === "square" ? 6 : 0,
    boxShadow: n !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
    color: "#111827",
    fontSize: i === "chevron" ? 18 : 20,
    lineHeight: 1
  }, children: i === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→" });
}
function Gl({
  sectionId: e = "blog_posts_carousel",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c } = q(), s = Ke(null), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(
    () => Ul(i, l),
    [i, l]
  ), { cards: h } = Pt(t, e, n, l, d.postCount), u = d.sectionWidth === "full" ? 24 : R.padX, p = d.sectionWidth === "full" ? "100%" : R.maxWidth, g = `codiic-blog-posts-${e.replace(/[^a-z0-9_-]/gi, "-")}`, k = d.columns > 0 ? `calc((100% - ${(d.columns - 1) * d.horizontalGap}px) / ${d.columns})` : "280px", y = (C) => {
    const F = s.current;
    if (!F) return;
    const f = F.clientWidth * 0.85 * C;
    F.scrollBy({ left: f, behavior: "smooth" });
  }, v = {
    position: "relative",
    background: d.scheme.background,
    color: d.scheme.color,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: u,
    paddingRight: u,
    boxSizing: "border-box",
    fontFamily: c
  }, b = {
    maxWidth: p,
    margin: "0 auto",
    width: "100%"
  }, _ = {
    margin: 0,
    marginBottom: d.layoutGap,
    fontSize: "1.5rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  }, $ = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8
  }, w = {
    display: "flex",
    gap: d.horizontalGap,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    flex: 1,
    paddingBottom: 4
  }, P = {
    flex: `0 0 ${k}`,
    minWidth: 0,
    scrollSnapAlign: "start"
  }, z = {
    aspectRatio: "4 / 3",
    borderRadius: 8,
    background: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12
  }, L = {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 700,
    lineHeight: 1.3
  }, H = {
    margin: "4px 0 0",
    fontSize: "0.8125rem",
    color: d.scheme.muted
  }, W = {
    margin: "8px 0 0",
    fontSize: "0.875rem",
    lineHeight: 1.45,
    color: d.scheme.color
  }, T = d.navIcon !== "none" && h.length > d.columns;
  return /* @__PURE__ */ o(B, { nodeId: a, label: "Blog posts: Carousel", children: /* @__PURE__ */ m(
    "section",
    {
      className: g,
      style: v,
      "data-section-type": "blog-posts-carousel",
      "data-mobile-cards": d.mobileCardSize,
      children: [
        /* @__PURE__ */ o("style", { children: `
            .${g} [data-carousel-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${g}[data-mobile-cards="1"] [data-blog-card] {
                flex: 0 0 calc(100% - 8px);
              }
              .${g}[data-mobile-cards="2"] [data-blog-card] {
                flex: 0 0 calc(50% - ${d.horizontalGap / 2}px);
              }
            }
            ${Ol(e, d.customCss)}
          ` }),
        /* @__PURE__ */ m("div", { style: b, children: [
          /* @__PURE__ */ o("h2", { style: _, children: /* @__PURE__ */ o(
            S,
            {
              nodeId: a,
              fieldPath: `${l}.heading`,
              label: "Heading",
              children: d.heading
            }
          ) }),
          /* @__PURE__ */ m("div", { style: $, children: [
            T ? /* @__PURE__ */ o(
              bo,
              {
                label: "Previous",
                onClick: () => y(-1),
                background: d.navIconBackground,
                shape: d.navIcon
              }
            ) : null,
            /* @__PURE__ */ o("div", { ref: s, "data-carousel-track": !0, style: w, children: h.map((C) => {
              const F = n === "template" ? `templates.${t}.sections.${e}.blocks.${C.id}.settings` : `sections.${e}.blocks.${C.id}.settings`;
              return /* @__PURE__ */ m("article", { "data-blog-card": !0, style: P, children: [
                /* @__PURE__ */ o("div", { style: z, children: C.imageUrl ? /* @__PURE__ */ o(
                  "img",
                  {
                    src: C.imageUrl,
                    alt: "",
                    style: { width: "100%", height: "100%", objectFit: "cover" }
                  }
                ) : /* @__PURE__ */ o(zt, { variant: C.illustrationVariant }) }),
                /* @__PURE__ */ o("h3", { style: L, children: /* @__PURE__ */ o(
                  S,
                  {
                    nodeId: `${a}:block:${C.id}`,
                    fieldPath: `${F}.title`,
                    label: "Title",
                    children: C.title
                  }
                ) }),
                /* @__PURE__ */ m("p", { style: H, children: [
                  /* @__PURE__ */ o(
                    S,
                    {
                      nodeId: `${a}:block:${C.id}`,
                      fieldPath: `${F}.date`,
                      label: "Date",
                      children: C.date
                    }
                  ),
                  " | ",
                  /* @__PURE__ */ o(
                    S,
                    {
                      nodeId: `${a}:block:${C.id}`,
                      fieldPath: `${F}.author`,
                      label: "Author",
                      children: C.author
                    }
                  )
                ] }),
                /* @__PURE__ */ o("p", { style: W, children: /* @__PURE__ */ o(
                  S,
                  {
                    nodeId: `${a}:block:${C.id}`,
                    fieldPath: `${F}.excerpt`,
                    label: "Excerpt",
                    children: C.excerpt
                  }
                ) })
              ] }, C.id);
            }) }),
            T ? /* @__PURE__ */ o(
              bo,
              {
                label: "Next",
                onClick: () => y(1),
                background: d.navIconBackground,
                shape: d.navIcon
              }
            ) : null
          ] })
        ] })
      ]
    }
  ) });
}
const yo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function Dl(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.sectionWidth`, "page");
  return {
    scheme: yo[n] ?? yo["scheme-1"],
    heading: r(e, `${t}.heading`),
    postCount: x(e, `${t}.postCount`, 3),
    carouselOnMobile: E(e, `${t}.carouselOnMobile`, !1),
    sectionWidth: i === "full" ? "full" : "page",
    layoutGap: x(e, `${t}.layoutGap`, 64),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function jl(e, t) {
  const n = `.codiic-blog-posts-editorial-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function it({
  card: e,
  featured: t = !1,
  editorNodeId: n,
  blockBase: i,
  scheme: c,
  fontBody: s
}) {
  const l = {
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
    fontFamily: s,
    fontSize: t ? "1.125rem" : "1rem",
    fontWeight: 700,
    lineHeight: 1.3,
    color: c.color
  }, d = {
    margin: "4px 0 0",
    fontFamily: s,
    fontSize: "0.8125rem",
    color: c.muted
  }, h = {
    margin: "8px 0 0",
    fontFamily: s,
    fontSize: "0.875rem",
    lineHeight: 1.45,
    color: c.color
  };
  return /* @__PURE__ */ m("article", { "data-blog-card": !0, "data-featured": t ? "true" : "false", children: [
    /* @__PURE__ */ o("div", { style: l, children: e.imageUrl ? /* @__PURE__ */ o(
      "img",
      {
        src: e.imageUrl,
        alt: "",
        style: { width: "100%", height: "100%", objectFit: "cover" }
      }
    ) : /* @__PURE__ */ o(zt, { variant: e.illustrationVariant }) }),
    /* @__PURE__ */ o("h3", { style: a, children: /* @__PURE__ */ o(S, { nodeId: `${n}:block:${e.id}`, fieldPath: `${i}.title`, label: "Title", children: e.title }) }),
    /* @__PURE__ */ m("p", { style: d, children: [
      /* @__PURE__ */ o(S, { nodeId: `${n}:block:${e.id}`, fieldPath: `${i}.date`, label: "Date", children: e.date }),
      " | ",
      /* @__PURE__ */ o(S, { nodeId: `${n}:block:${e.id}`, fieldPath: `${i}.author`, label: "Author", children: e.author })
    ] }),
    /* @__PURE__ */ o("p", { style: h, children: /* @__PURE__ */ o(S, { nodeId: `${n}:block:${e.id}`, fieldPath: `${i}.excerpt`, label: "Excerpt", children: e.excerpt }) })
  ] });
}
function Bl({
  sectionId: e = "blog_posts_editorial",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c } = q(), s = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, l = n === "template" ? `template:${t}:${e}` : `layout:${e}`, a = M(
    () => Dl(i, s),
    [i, s]
  ), { cards: d } = Pt(t, e, n, s, a.postCount), h = a.sectionWidth === "full" ? 24 : R.padX, u = a.sectionWidth === "full" ? "100%" : R.maxWidth, p = `codiic-blog-posts-editorial-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = a.layoutGap, k = d.length >= 2 ? d.slice(0, 2) : d.length === 1 ? [] : [], y = d.length >= 3 ? d[2] : d.length === 1 ? d[0] : null, v = d.length > 3 ? d.slice(3) : [], b = {
    position: "relative",
    background: a.scheme.background,
    color: a.scheme.color,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: h,
    paddingRight: h,
    boxSizing: "border-box",
    fontFamily: c
  }, _ = {
    maxWidth: u,
    margin: "0 auto",
    width: "100%"
  }, $ = {
    margin: 0,
    marginBottom: g,
    fontSize: "1.5rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  }, w = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: g,
    marginBottom: y || v.length ? g : 0
  }, P = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: g,
    marginTop: y ? g : 0
  }, z = {
    display: "flex",
    gap: 16,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none"
  }, L = {
    flex: "0 0 min(85%, 320px)",
    scrollSnapAlign: "start"
  }, H = (T) => n === "template" ? `templates.${t}.sections.${e}.blocks.${T}.settings` : `sections.${e}.blocks.${T}.settings`, W = /* @__PURE__ */ m(Z, { children: [
    k.length > 0 ? /* @__PURE__ */ o("div", { style: w, children: k.map((T) => /* @__PURE__ */ o(
      it,
      {
        card: T,
        editorNodeId: l,
        blockBase: H(T.id),
        scheme: a.scheme,
        fontBody: c
      },
      T.id
    )) }) : null,
    y ? /* @__PURE__ */ o(
      it,
      {
        card: y,
        featured: !0,
        editorNodeId: l,
        blockBase: H(y.id),
        scheme: a.scheme,
        fontBody: c
      }
    ) : null,
    v.length > 0 ? /* @__PURE__ */ o("div", { style: P, children: v.map((T) => /* @__PURE__ */ o(
      it,
      {
        card: T,
        editorNodeId: l,
        blockBase: H(T.id),
        scheme: a.scheme,
        fontBody: c
      },
      T.id
    )) }) : null
  ] });
  return /* @__PURE__ */ o(B, { nodeId: l, label: "Blog posts: Editorial", children: /* @__PURE__ */ m(
    "section",
    {
      className: p,
      style: b,
      "data-section-type": "blog-posts-editorial",
      "data-carousel-mobile": a.carouselOnMobile ? "true" : "false",
      children: [
        /* @__PURE__ */ o("style", { children: `
            .${p} [data-mobile-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${p}[data-carousel-mobile="true"] [data-desktop-layout] { display: none !important; }
              .${p}[data-carousel-mobile="true"] [data-mobile-layout] { display: block !important; }
              .${p}[data-carousel-mobile="false"] [data-mobile-layout] { display: none !important; }
              .${p}[data-carousel-mobile="false"] [data-desktop-layout] {
                display: block !important;
              }
              .${p}[data-carousel-mobile="false"] [data-desktop-layout] > div:first-child {
                grid-template-columns: 1fr !important;
              }
            }
            @media (min-width: 750px) {
              .${p} [data-mobile-layout] { display: none !important; }
            }
            ${jl(e, a.customCss)}
          ` }),
        /* @__PURE__ */ m("div", { style: _, children: [
          /* @__PURE__ */ o("h2", { style: $, children: /* @__PURE__ */ o(S, { nodeId: l, fieldPath: `${s}.heading`, label: "Heading", children: a.heading }) }),
          /* @__PURE__ */ o("div", { "data-desktop-layout": !0, children: W }),
          /* @__PURE__ */ o("div", { "data-mobile-layout": !0, style: { display: "none" }, children: /* @__PURE__ */ o("div", { "data-mobile-track": !0, style: z, children: d.map((T) => /* @__PURE__ */ o("div", { style: L, children: /* @__PURE__ */ o(
            it,
            {
              card: T,
              editorNodeId: l,
              blockBase: H(T.id),
              scheme: a.scheme,
              fontBody: c
            }
          ) }, T.id)) }) })
        ] })
      ]
    }
  ) });
}
const xo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function ql(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.sectionWidth`, "page"), c = r(e, `${t}.mobileColumns`, "2");
  return {
    scheme: xo[n] ?? xo["scheme-1"],
    heading: r(e, `${t}.heading`),
    postCount: x(e, `${t}.postCount`, 3),
    columns: x(e, `${t}.columns`, 3),
    mobileColumns: c === "1" ? 1 : 2,
    horizontalGap: x(e, `${t}.horizontalGap`, 8),
    verticalGap: x(e, `${t}.verticalGap`, 8),
    carouselOnMobile: E(e, `${t}.carouselOnMobile`, !1),
    sectionWidth: i === "full" ? "full" : "page",
    layoutGap: x(e, `${t}.layoutGap`, 12),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Xl(e, t) {
  const n = `.codiic-blog-posts-grid-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function $o({ card: e, editorNodeId: t, blockBase: n, scheme: i, fontBody: c }) {
  const l = /* @__PURE__ */ m(Z, { children: [
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
    ) : /* @__PURE__ */ o(zt, { variant: e.illustrationVariant }) }),
    /* @__PURE__ */ o(
      "h3",
      {
        style: {
          margin: 0,
          fontFamily: c,
          fontSize: "1rem",
          fontWeight: 700,
          lineHeight: 1.3,
          color: i.color
        },
        children: /* @__PURE__ */ o(S, { nodeId: `${t}:block:${e.id}`, fieldPath: `${n}.title`, label: "Title", children: e.title })
      }
    ),
    /* @__PURE__ */ m("p", { style: { margin: "4px 0 0", fontFamily: c, fontSize: "0.8125rem", color: i.muted }, children: [
      /* @__PURE__ */ o(S, { nodeId: `${t}:block:${e.id}`, fieldPath: `${n}.date`, label: "Date", children: e.date }),
      " | ",
      /* @__PURE__ */ o(S, { nodeId: `${t}:block:${e.id}`, fieldPath: `${n}.author`, label: "Author", children: e.author })
    ] }),
    /* @__PURE__ */ o(
      "p",
      {
        style: {
          margin: "8px 0 0",
          fontFamily: c,
          fontSize: "0.875rem",
          lineHeight: 1.45,
          color: i.color
        },
        children: /* @__PURE__ */ o(S, { nodeId: `${t}:block:${e.id}`, fieldPath: `${n}.excerpt`, label: "Excerpt", children: e.excerpt })
      }
    )
  ] });
  return /* @__PURE__ */ o("article", { "data-blog-card": !0, children: e.href ? /* @__PURE__ */ o(D, { to: e.href, style: { textDecoration: "none", color: "inherit", display: "block" }, children: l }) : l });
}
function Il({
  sectionId: e = "blog_posts_grid",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c } = q(), s = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, l = n === "template" ? `template:${t}:${e}` : `layout:${e}`, a = M(() => ql(i, s), [i, s]), { cards: d } = Pt(t, e, n, s, a.postCount), h = a.sectionWidth === "full" ? 24 : R.padX, u = a.sectionWidth === "full" ? "100%" : R.maxWidth, p = `codiic-blog-posts-grid-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = Math.max(1, Math.min(4, a.columns)), k = {
    position: "relative",
    background: a.scheme.background,
    color: a.scheme.color,
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    paddingLeft: h,
    paddingRight: h,
    boxSizing: "border-box",
    fontFamily: c
  }, y = {
    maxWidth: u,
    margin: "0 auto",
    width: "100%"
  }, v = ($) => n === "template" ? `templates.${t}.sections.${e}.blocks.${$}.settings` : `sections.${e}.blocks.${$}.settings`, b = {
    display: "flex",
    gap: a.horizontalGap,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none"
  }, _ = a.mobileColumns === 2 ? `calc(50% - ${a.horizontalGap / 2}px)` : `calc(100% - ${a.horizontalGap}px)`;
  return /* @__PURE__ */ o(B, { nodeId: l, label: "Blog posts: Grid", children: /* @__PURE__ */ m(
    "section",
    {
      className: p,
      style: k,
      "data-section-type": "blog-posts-grid",
      "data-carousel-mobile": a.carouselOnMobile ? "true" : "false",
      "data-mobile-columns": a.mobileColumns,
      children: [
        /* @__PURE__ */ o("style", { children: `
            .${p} [data-grid-desktop] {
              display: grid;
              grid-template-columns: repeat(${g}, minmax(0, 1fr));
              column-gap: ${a.horizontalGap}px;
              row-gap: ${a.verticalGap}px;
            }
            .${p} [data-mobile-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${p}[data-carousel-mobile="true"] [data-grid-desktop] { display: none !important; }
              .${p}[data-carousel-mobile="true"] [data-mobile-layout] { display: block !important; }
              .${p}[data-carousel-mobile="false"] [data-grid-desktop] {
                grid-template-columns: repeat(${a.mobileColumns}, minmax(0, 1fr)) !important;
              }
              .${p}[data-carousel-mobile="false"] [data-mobile-layout] { display: none !important; }
            }
            @media (min-width: 750px) {
              .${p} [data-mobile-layout] { display: none !important; }
            }
            ${Xl(e, a.customCss)}
          ` }),
        /* @__PURE__ */ m("div", { style: y, children: [
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
              children: /* @__PURE__ */ o(S, { nodeId: l, fieldPath: `${s}.heading`, label: "Heading", children: a.heading })
            }
          ),
          /* @__PURE__ */ o("div", { "data-grid-desktop": !0, children: d.map(($) => /* @__PURE__ */ o(
            $o,
            {
              card: $,
              editorNodeId: l,
              blockBase: v($.id),
              scheme: a.scheme,
              fontBody: c
            },
            $.id
          )) }),
          /* @__PURE__ */ o("div", { "data-mobile-layout": !0, style: { display: "none" }, children: /* @__PURE__ */ o("div", { "data-mobile-track": !0, style: b, children: d.map(($) => /* @__PURE__ */ o(
            "div",
            {
              style: { flex: `0 0 ${_}`, minWidth: 0, scrollSnapAlign: "start" },
              children: /* @__PURE__ */ o(
                $o,
                {
                  card: $,
                  editorNodeId: l,
                  blockBase: v($.id),
                  scheme: a.scheme,
                  fontBody: c
                }
              )
            },
            $.id
          )) }) })
        ] })
      ]
    }
  ) });
}
function Vl() {
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
const ko = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function Kl(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.navIcon`, "arrows"), c = r(e, `${t}.navIconBackground`, "none"), s = r(e, `${t}.sectionWidth`, "page"), l = r(e, `${t}.mobileColumns`, "1");
  return {
    scheme: ko[n] ?? ko["scheme-1"],
    heading: r(e, `${t}.heading`),
    columns: x(e, `${t}.columns`, 3),
    mobileColumns: l === "2" ? 2 : 1,
    sectionWidth: s === "full" ? "full" : "page",
    horizontalGap: x(e, `${t}.horizontalGap`, 12),
    navIcon: i === "chevron" ? "chevron" : i === "none" ? "none" : "arrows",
    navIconBackground: c === "circle" ? "circle" : c === "square" ? "square" : "none",
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Yl(e, t, n, i) {
  const s = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, l = i === "template" ? _e(e, t, n, []) : ke(e, n, []), a = K(e, s);
  if (!a || typeof a != "object") return [];
  const d = l.length ? l : Object.keys(a), h = "Made with care and unconditionally loved by our customers.";
  return d.map((u) => {
    const p = a[u]?.settings ?? {};
    return {
      id: u,
      title: String(p.title ?? ""),
      description: String(p.description ?? h),
      imageUrl: String(p.imageUrl ?? "")
    };
  });
}
function Ql(e, t) {
  const n = `.codiic-storytelling-carousel-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function vo({
  label: e,
  onClick: t,
  background: n,
  shape: i
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
        width: n === "none" ? 32 : 36,
        height: n === "none" ? 32 : 36,
        border: "none",
        cursor: "pointer",
        background: n === "circle" || n === "square" ? "rgba(255,255,255,0.95)" : "transparent",
        borderRadius: n === "circle" ? "50%" : n === "square" ? 6 : 0,
        boxShadow: n !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
        color: "#111827",
        fontSize: i === "chevron" ? 18 : 20,
        lineHeight: 1
      },
      children: i === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→"
    }
  );
}
function Zl({
  sectionId: e = "storytelling_carousel",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c } = q(), s = Ke(null), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(
    () => Kl(i, l),
    [i, l]
  ), h = M(
    () => Yl(i, t, e, n),
    [i, t, e, n]
  ), u = d.sectionWidth === "full" ? 24 : R.padX, p = d.sectionWidth === "full" ? "100%" : R.maxWidth, g = `codiic-storytelling-carousel-${e.replace(/[^a-z0-9_-]/gi, "-")}`, k = Math.max(1, Math.min(4, d.columns)), y = `calc((100% - ${(k - 1) * d.horizontalGap}px) / ${k})`, v = (z) => {
    const L = s.current;
    L && L.scrollBy({ left: L.clientWidth * 0.85 * z, behavior: "smooth" });
  }, b = d.navIcon !== "none" && h.length > k, _ = {
    position: "relative",
    background: d.scheme.background,
    color: d.scheme.color,
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    paddingLeft: u,
    paddingRight: u,
    boxSizing: "border-box",
    fontFamily: c
  }, $ = {
    maxWidth: p,
    margin: "0 auto",
    width: "100%"
  }, w = {
    display: "flex",
    gap: d.horizontalGap,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    flex: 1
  }, P = {
    flex: `0 0 ${y}`,
    minWidth: 0,
    scrollSnapAlign: "start"
  };
  return /* @__PURE__ */ o(B, { nodeId: a, label: "Carousel", children: /* @__PURE__ */ m(
    "section",
    {
      className: g,
      style: _,
      "data-section-type": "storytelling-carousel",
      "data-mobile-columns": d.mobileColumns,
      children: [
        /* @__PURE__ */ o("style", { children: `
            .${g} [data-carousel-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${g}[data-mobile-columns="1"] [data-carousel-slide] {
                flex: 0 0 calc(100% - 8px);
              }
              .${g}[data-mobile-columns="2"] [data-carousel-slide] {
                flex: 0 0 calc(50% - ${d.horizontalGap / 2}px);
              }
            }
            ${Ql(e, d.customCss)}
          ` }),
        /* @__PURE__ */ m("div", { style: $, children: [
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
              children: /* @__PURE__ */ o(S, { nodeId: a, fieldPath: `${l}.heading`, label: "Heading", children: d.heading })
            }
          ),
          /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            b ? /* @__PURE__ */ o(
              vo,
              {
                label: "Previous",
                onClick: () => v(-1),
                background: d.navIconBackground,
                shape: d.navIcon
              }
            ) : null,
            /* @__PURE__ */ o("div", { ref: s, "data-carousel-track": !0, style: w, children: h.map((z) => {
              const L = n === "template" ? `templates.${t}.sections.${e}.blocks.${z.id}.settings` : `sections.${e}.blocks.${z.id}.settings`;
              return /* @__PURE__ */ m("article", { "data-carousel-slide": !0, style: P, children: [
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
                    children: z.imageUrl ? /* @__PURE__ */ o(
                      "img",
                      {
                        src: z.imageUrl,
                        alt: "",
                        style: { width: "100%", height: "100%", objectFit: "cover" }
                      }
                    ) : /* @__PURE__ */ o(Vl, {})
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
                      color: d.scheme.color
                    },
                    children: /* @__PURE__ */ o(
                      S,
                      {
                        nodeId: `${a}:block:${z.id}`,
                        fieldPath: `${L}.title`,
                        label: "Title",
                        children: z.title
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
                      color: d.scheme.muted
                    },
                    children: /* @__PURE__ */ o(
                      S,
                      {
                        nodeId: `${a}:block:${z.id}`,
                        fieldPath: `${L}.description`,
                        label: "Description",
                        children: z.description
                      }
                    )
                  }
                )
              ] }, z.id);
            }) }),
            b ? /* @__PURE__ */ o(
              vo,
              {
                label: "Next",
                onClick: () => v(1),
                background: d.navIconBackground,
                shape: d.navIcon
              }
            ) : null
          ] })
        ] })
      ]
    }
  ) });
}
const So = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function Jl(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.sectionWidth`, "page"), c = r(e, `${t}.sectionHeight`, "auto");
  return {
    scheme: So[n] ?? So["scheme-1"],
    heading: r(e, `${t}.heading`),
    imageUrl: r(e, `${t}.imageUrl`, ""),
    mediaOverlay: !!K(e, `${t}.mediaOverlay`),
    sectionWidth: i === "full" ? "full" : "page",
    sectionHeight: c === "small" || c === "medium" || c === "large" ? c : "auto",
    hotspotColor: r(e, `${t}.hotspotColor`, "#FFFFFF57"),
    innerColor: r(e, `${t}.innerColor`, "#FFFFFF"),
    popoverGap: x(e, `${t}.popoverGap`, 8),
    paddingTop: x(e, `${t}.paddingTop`, 40),
    paddingBottom: x(e, `${t}.paddingBottom`, 40),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function ea(e) {
  if (e === "small") return "320px";
  if (e === "medium") return "420px";
  if (e === "large") return "520px";
}
function ta(e, t, n, i) {
  const s = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, l = i === "template" ? _e(e, t, n, []) : ke(e, n, []), a = K(e, s);
  return !a || typeof a != "object" ? [] : (l.length ? l : Object.keys(a)).map((h) => {
    const u = a[h]?.settings ?? {};
    return {
      id: h,
      positionX: Number(u.positionX ?? 50),
      positionY: Number(u.positionY ?? 50),
      productTitle: String(u.productTitle ?? ""),
      price: String(u.price ?? "")
    };
  });
}
function oa(e, t) {
  const n = `.codiic-product-hotspots-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function na() {
  return /* @__PURE__ */ m(Z, { children: [
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
function ia({
  sectionId: e = "product_hotspots",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), [l, a] = te(null), d = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, h = n === "template" ? `template:${t}:${e}` : `layout:${e}`, u = M(
    () => Jl(i, d),
    [i, d]
  ), p = M(
    () => ta(i, t, e, n),
    [i, t, e, n]
  ), g = `codiic-product-hotspots-${e.replace(/[^a-z0-9_-]/gi, "-")}`, k = oa(e, u.customCss), y = ea(u.sectionHeight), v = {
    paddingTop: u.paddingTop,
    paddingBottom: u.paddingBottom,
    background: u.scheme.background,
    color: u.scheme.color,
    fontFamily: c
  }, b = u.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 0, paddingRight: 0 } : { maxWidth: R.contentMaxWidth, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }, _ = {
    position: "relative",
    width: "100%",
    aspectRatio: y ? void 0 : "4 / 3",
    minHeight: y,
    borderRadius: 12,
    overflow: "hidden",
    background: "#1e3a5f",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
  }, $ = `${d}.heading`;
  return /* @__PURE__ */ m(B, { sectionId: e, label: "Product hotspots", editorNodeId: h, style: v, children: [
    k ? /* @__PURE__ */ o("style", { children: k }) : null,
    /* @__PURE__ */ m("div", { className: g, style: b, children: [
      /* @__PURE__ */ o(S, { fieldPath: $, label: "Heading", as: "h2", style: { margin: "0 0 20px", fontSize: 28, fontWeight: 700, fontFamily: s }, children: u.heading }),
      /* @__PURE__ */ m("div", { style: _, children: [
        u.imageUrl ? /* @__PURE__ */ o(
          "img",
          {
            src: u.imageUrl,
            alt: "",
            style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
          }
        ) : /* @__PURE__ */ o(na, {}),
        u.mediaOverlay ? /* @__PURE__ */ o(
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
        p.map((w) => {
          const P = n === "template" ? `template:${t}:${e}:block:${w.id}` : `layout:${e}:block:${w.id}`, z = l === w.id, L = {
            position: "relative",
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: `2px solid ${u.innerColor}`,
            background: u.hotspotColor,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 0 12px rgba(255,255,255,0.35)",
            cursor: "pointer",
            padding: 0
          }, H = {
            position: "absolute",
            left: "50%",
            top: "100%",
            transform: "translateX(-50%)",
            marginTop: u.popoverGap,
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
            N,
            {
              nodeId: P,
              label: "Hotspot",
              style: {
                position: "absolute",
                left: `${w.positionX}%`,
                top: `${w.positionY}%`,
                transform: "translate(-50%, -50%)",
                zIndex: z ? 12 : 10
              },
              children: /* @__PURE__ */ m(
                "button",
                {
                  type: "button",
                  "aria-label": w.productTitle,
                  style: L,
                  onMouseEnter: () => a(w.id),
                  onMouseLeave: () => a((W) => W === w.id ? null : W),
                  onFocus: () => a(w.id),
                  onBlur: () => a((W) => W === w.id ? null : W),
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
                          background: u.innerColor
                        }
                      }
                    ),
                    z ? /* @__PURE__ */ m("span", { style: H, children: [
                      /* @__PURE__ */ o("span", { style: { fontWeight: 600 }, children: w.productTitle }),
                      /* @__PURE__ */ o("span", { style: { color: "#6b7280", fontSize: 12 }, children: w.price })
                    ] }) : null
                  ]
                }
              )
            },
            w.id
          );
        })
      ] })
    ] })
  ] });
}
function ra({
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
const wo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function la(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.cardStyle`, "grid"), c = r(e, `${t}.sectionWidth`, "page"), s = r(e, `${t}.mobileColumns`, "2");
  return {
    scheme: wo[n] ?? wo["scheme-1"],
    heading: r(e, `${t}.heading`),
    cardStyle: i === "carousel" ? "carousel" : "grid",
    carouselOnMobile: !!K(e, `${t}.carouselOnMobile`),
    productCount: x(e, `${t}.productCount`, 4),
    columns: x(e, `${t}.columns`, 4),
    mobileColumns: s === "1" ? 1 : 2,
    horizontalGap: x(e, `${t}.horizontalGap`, 12),
    verticalGap: x(e, `${t}.verticalGap`, 24),
    sectionWidth: c === "full" ? "full" : "page",
    layoutGap: x(e, `${t}.layoutGap`, 28),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function aa(e, t, n, i, c) {
  const l = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, a = i === "template" ? _e(e, t, n, []) : ke(e, n, []), d = K(e, l);
  if (!d || typeof d != "object") return [];
  const h = a.length ? a : Object.keys(d), u = Math.max(1, Math.min(12, c));
  return h.slice(0, u).map((p) => {
    const g = d[p]?.settings ?? {};
    return {
      id: p,
      shirtColor: String(g.shirtColor ?? "#d45454"),
      withSun: !!g.withSun,
      productTitle: String(g.productTitle ?? ""),
      price: String(g.price ?? "")
    };
  });
}
function da(e, t) {
  const n = `.codiic-recommended-products-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function Co({
  label: e,
  onClick: t,
  background: n,
  shape: i
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
        width: n === "none" ? 32 : 36,
        height: n === "none" ? 32 : 36,
        border: "none",
        cursor: "pointer",
        background: n === "circle" || n === "square" ? "rgba(255,255,255,0.95)" : "transparent",
        borderRadius: n === "circle" ? "50%" : n === "square" ? 6 : 0,
        boxShadow: n !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
        color: "#111827",
        fontSize: i === "chevron" ? 18 : 20,
        lineHeight: 1
      },
      children: i === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→"
    }
  );
}
function ca({
  sectionId: e = "recommended_products",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), l = Ke(null), a = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, d = n === "template" ? `template:${t}:${e}` : `layout:${e}`, h = M(
    () => la(i, a),
    [i, a]
  ), u = M(
    () => aa(
      i,
      t,
      e,
      n,
      h.productCount
    ),
    [i, t, e, n, h.productCount]
  ), p = h.cardStyle === "carousel", g = `codiic-recommended-products-${e.replace(/[^a-z0-9_-]/gi, "-")}`, k = da(e, h.customCss), y = M(
    () => `
[data-codiic-section="${e}"] .rp-product-grid {
  display: ${p ? "flex" : "grid"};
  ${p ? "flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;" : `grid-template-columns: repeat(${h.columns}, minmax(0, 1fr));`}
  column-gap: ${h.horizontalGap}px;
  row-gap: ${h.verticalGap}px;
}
[data-codiic-section="${e}"] .rp-product-grid::-webkit-scrollbar { display: none; }
[data-codiic-section="${e}"] .rp-product-grid > article {
  ${p ? `flex: 0 0 calc((100% - ${(h.columns - 1) * h.horizontalGap}px) / ${h.columns}); min-width: 0; scroll-snap-align: start;` : ""}
}
@media (max-width: 749px) {
  [data-codiic-section="${e}"] .rp-product-grid {
    ${h.carouselOnMobile || p ? "display: flex; flex-wrap: nowrap; overflow-x: auto; grid-template-columns: unset;" : `grid-template-columns: repeat(${h.mobileColumns}, minmax(0, 1fr));`}
  }
  [data-codiic-section="${e}"][data-mobile-columns="1"] .rp-product-grid > article {
    flex: 0 0 calc(100% - 8px);
  }
  [data-codiic-section="${e}"][data-mobile-columns="2"] .rp-product-grid > article {
    flex: 0 0 calc(50% - ${h.horizontalGap / 2}px);
  }
}
`,
    [
      e,
      p,
      h.columns,
      h.horizontalGap,
      h.verticalGap,
      h.mobileColumns,
      h.carouselOnMobile
    ]
  ), v = {
    paddingTop: h.paddingTop,
    paddingBottom: h.paddingBottom,
    background: h.scheme.background,
    color: h.scheme.color,
    fontFamily: c
  }, b = h.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 0, paddingRight: 0 } : {
    maxWidth: R.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, _ = `${a}.heading`, $ = (w) => {
    const P = l.current;
    P && P.scrollBy({ left: w * P.clientWidth * 0.85, behavior: "smooth" });
  };
  return /* @__PURE__ */ m(
    B,
    {
      sectionId: e,
      label: "Recommended products",
      editorNodeId: d,
      style: v,
      children: [
        k ? /* @__PURE__ */ o("style", { children: k }) : null,
        /* @__PURE__ */ o("style", { children: y }),
        /* @__PURE__ */ m(
          "div",
          {
            className: g,
            style: b,
            "data-mobile-columns": String(h.mobileColumns),
            "data-rp-carousel": p || h.carouselOnMobile ? "true" : "false",
            children: [
              /* @__PURE__ */ o(
                S,
                {
                  fieldPath: _,
                  label: "Heading",
                  as: "h2",
                  style: {
                    margin: `0 0 ${h.layoutGap}px`,
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: s
                  },
                  children: h.heading
                }
              ),
              /* @__PURE__ */ m("div", { style: { position: "relative" }, children: [
                p ? /* @__PURE__ */ m(
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
                      /* @__PURE__ */ o(Co, { label: "Previous", onClick: () => $(-1), background: "circle", shape: "arrows" }),
                      /* @__PURE__ */ o(Co, { label: "Next", onClick: () => $(1), background: "circle", shape: "arrows" })
                    ]
                  }
                ) : null,
                /* @__PURE__ */ o("div", { ref: l, className: "rp-product-grid", children: u.map((w) => {
                  const P = n === "template" ? `templates.${t}.sections.${e}.blocks.${w.id}.settings` : `sections.${e}.blocks.${w.id}.settings`, z = n === "template" ? `template:${t}:${e}:block:${w.id}` : `layout:${e}:block:${w.id}`;
                  return /* @__PURE__ */ o(N, { nodeId: z, label: "Product card", style: {
                    margin: 0,
                    minWidth: 0
                  }, children: /* @__PURE__ */ m("article", { children: [
                    /* @__PURE__ */ o(ra, { shirtColor: w.shirtColor, withSun: w.withSun }),
                    /* @__PURE__ */ o(
                      "p",
                      {
                        style: {
                          margin: "10px 0 0",
                          fontSize: 14,
                          fontWeight: 500,
                          color: h.scheme.color,
                          textAlign: "center"
                        },
                        children: /* @__PURE__ */ o(S, { fieldPath: `${P}.productTitle`, label: "Product title", children: w.productTitle })
                      }
                    ),
                    /* @__PURE__ */ o(
                      "p",
                      {
                        style: {
                          margin: "2px 0 0",
                          fontSize: 13,
                          color: h.scheme.muted,
                          textAlign: "center"
                        },
                        children: /* @__PURE__ */ o(S, { fieldPath: `${P}.price`, label: "Price", children: w.price })
                      }
                    )
                  ] }) }, w.id);
                }) })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function sa() {
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
const _o = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function ua(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.catalogVariant`, "collection-links-spotlight"), c = r(e, `${t}.layoutMode`, "spotlight"), s = i === "collection-links-text" || c === "text" ? "text" : "spotlight", l = r(e, `${t}.sectionWidth`, "page"), a = r(e, `${t}.alignment`, "left"), d = r(e, `${t}.imagePosition`, "right");
  return {
    scheme: _o[n] ?? _o["scheme-1"],
    layoutMode: s,
    sectionWidth: l === "full" ? "full" : "page",
    alignment: a === "center" ? "center" : a === "right" ? "right" : "left",
    imagePosition: d === "left" ? "left" : "right",
    imageUrl: r(e, `${t}.imageUrl`, ""),
    paddingTop: x(e, `${t}.paddingTop`, 40),
    paddingBottom: x(e, `${t}.paddingBottom`, 40),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function ha(e, t, n, i) {
  const s = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, l = i === "template" ? _e(e, t, n, []) : ke(e, n, []), a = K(e, s);
  return !a || typeof a != "object" ? [] : (l.length ? l : Object.keys(a)).map((h) => {
    const u = a[h]?.settings ?? {};
    return {
      id: h,
      title: String(u.title ?? ""),
      productCount: Number(u.productCount ?? 5),
      href: String(u.href ?? "")
    };
  });
}
function pa(e, t) {
  const n = `.codiic-collection-links-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function ma(e) {
  return e === "center" ? "center" : e === "right" ? "right" : "left";
}
function Wo({
  sectionId: e = "collection_links_spotlight",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c } = q(), s = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, l = n === "template" ? `template:${t}:${e}` : `layout:${e}`, a = M(
    () => ua(i, s),
    [i, s]
  ), d = r(i, `${s}.catalogVariant`, "collection-links-spotlight"), h = a.layoutMode === "text" || d === "collection-links-text" ? "Collection links: Text" : "Collection links: Spotlight", u = M(
    () => ha(i, t, e, n),
    [i, t, e, n]
  ), p = `codiic-collection-links-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = pa(e, a.customCss), k = ma(a.alignment), y = a.layoutMode === "text", v = {
    paddingTop: a.paddingTop,
    paddingBottom: a.paddingBottom,
    background: a.scheme.background,
    color: a.scheme.color,
    fontFamily: c
  }, b = a.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 0, paddingRight: 0 } : {
    maxWidth: R.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, _ = {
    margin: 0,
    fontSize: y ? 18 : 22,
    fontWeight: 500,
    lineHeight: 1.25,
    color: a.scheme.color,
    textDecoration: "none",
    textAlign: k
  }, $ = /* @__PURE__ */ o(
    "div",
    {
      style: y ? {
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
      children: u.map((z) => {
        const L = n === "template" ? `templates.${t}.sections.${e}.blocks.${z.id}.settings` : `sections.${e}.blocks.${z.id}.settings`, H = n === "template" ? `template:${t}:${e}:block:${z.id}` : `layout:${e}:block:${z.id}`;
        return /* @__PURE__ */ o(N, { nodeId: H, label: "Collection link", children: /* @__PURE__ */ m(D, { to: z.href, style: _, children: [
          /* @__PURE__ */ o(S, { fieldPath: `${L}.title`, label: "Title", children: z.title }),
          /* @__PURE__ */ o(
            "sup",
            {
              style: {
                marginLeft: 4,
                fontSize: "0.65em",
                fontWeight: 400,
                color: a.scheme.muted
              },
              children: /* @__PURE__ */ o(S, { fieldPath: `${L}.productCount`, label: "Product count", children: z.productCount })
            }
          )
        ] }) }, z.id);
      })
    }
  ), w = /* @__PURE__ */ o(
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
      ) : /* @__PURE__ */ o(sa, {})
    }
  ), P = /* @__PURE__ */ o(
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
      children: $
    }
  );
  return /* @__PURE__ */ m(
    B,
    {
      sectionId: e,
      label: h,
      editorNodeId: l,
      style: v,
      children: [
        g ? /* @__PURE__ */ o("style", { children: g }) : null,
        /* @__PURE__ */ o("div", { className: p, style: b, children: y ? $ : /* @__PURE__ */ m(
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
              P,
              w
            ]
          }
        ) })
      ]
    }
  );
}
function ga() {
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
function fa() {
  return /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6 }, "aria-hidden": !0, children: ["#6b7280", "#c44d4d", "#4a9a9a"].map((e, t) => /* @__PURE__ */ m("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" }, children: [
    /* @__PURE__ */ o("div", { style: { marginBottom: 2, width: 20, height: 2, borderRadius: 999, background: "#6b7280" } }),
    /* @__PURE__ */ o("div", { style: { width: 24, height: 36, borderRadius: "4px 4px 2px 2px", background: e } })
  ] }, t)) });
}
function ba() {
  return /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 8 }, "aria-hidden": !0, children: [
    /* @__PURE__ */ o("div", { style: { width: 28, height: 44, borderRadius: "8px 8px 4px 4px", background: "#9ca3af" } }),
    /* @__PURE__ */ o("div", { style: { width: 28, height: 44, borderRadius: "8px 8px 4px 4px", background: "#e8c547" } }),
    /* @__PURE__ */ o("div", { style: { width: 28, height: 44, borderRadius: "8px 8px 4px 4px", background: "#5ba8a8" } })
  ] });
}
function ya({ wide: e = !1 }) {
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
function ct({
  variant: e,
  wide: t = !1
}) {
  switch (e) {
    case "hanger-shirts":
      return /* @__PURE__ */ o(fa, {});
    case "hanging-sweaters":
      return /* @__PURE__ */ o(ba, {});
    case "clothing-rack":
      return /* @__PURE__ */ o(ya, { wide: t });
    default:
      return /* @__PURE__ */ o(ga, {});
  }
}
const zo = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function xa(e) {
  return e === "hanger-shirts" || e === "hanging-sweaters" || e === "clothing-rack" || e === "folded-shirts" ? e : "folded-shirts";
}
function $a(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.cardsLayoutType`), c = r(e, `${t}.sectionWidth`, "page");
  return {
    scheme: zo[n] ?? zo["scheme-1"],
    heading: r(e, `${t}.heading`),
    cardsLayoutType: i === "carousel" || i === "editorial" || i === "grid" ? i : "bento",
    carouselOnMobile: !!K(e, `${t}.carouselOnMobile`),
    cardsGap: x(e, `${t}.cardsGap`, 8),
    sectionWidth: c === "full" ? "full" : "page",
    layoutGap: x(e, `${t}.layoutGap`, 12),
    paddingTop: x(e, `${t}.paddingTop`, 24),
    paddingBottom: x(e, `${t}.paddingBottom`, 24),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function ka(e, t, n, i) {
  const s = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, l = i === "template" ? _e(e, t, n, []) : ke(e, n, []), a = K(e, s);
  return !a || typeof a != "object" ? [] : (l.length ? l : Object.keys(a)).map((h) => {
    const u = a[h]?.settings ?? {}, p = Number(u.columnSpan ?? 1);
    return {
      id: h,
      title: String(u.title ?? ""),
      href: String(u.href ?? ""),
      illustrationVariant: xa(String(u.illustrationVariant ?? "folded-shirts")),
      columnSpan: p === 2 ? 2 : 1,
      imageUrl: String(u.imageUrl ?? "")
    };
  });
}
function va(e, t) {
  const n = `.codiic-collection-list-bento-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
const Po = [
  "folded-shirts",
  "hanger-shirts",
  "hanging-sweaters",
  "clothing-rack"
], Ho = [1, 2, 2, 1];
function Sa(e) {
  return e.trim() ? e.split(/[,\n]/).map((t) => t.trim().toLowerCase()).filter(Boolean) : [];
}
function wa(e, t, n, i) {
  const c = i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`;
  let s = e;
  for (const a of c.split(".")) {
    if (!s || typeof s != "object") return "collection-list-grid";
    s = s[a];
  }
  const l = s?.type;
  return typeof l == "string" ? l : "collection-list-grid";
}
function Ca(e, t) {
  const n = Sa(t);
  return n.length ? n.map((i) => e.find((c) => c.urlHandle === i)).filter((i) => !!i) : e;
}
function _a(e, t, n) {
  const i = new Map(
    n.map((c) => [c.href.replace(/^\/collections\//, "").replace(/^\/collection\//, ""), c])
  );
  return e.map((c, s) => {
    const l = c.urlHandle?.trim() || "", a = l ? Sn(l) : dt.allProducts, d = l ? i.get(l) : void 0, h = d?.id ?? `tile_${s + 1}`, u = t === "collection-list-bento" ? d?.columnSpan ?? Ho[s % Ho.length] : d?.columnSpan ?? 1;
    return {
      id: h,
      title: c.title?.trim() || d?.title || "Collection title",
      href: a,
      illustrationVariant: d?.illustrationVariant ?? Po[s % Po.length],
      columnSpan: u,
      imageUrl: c.imageUrl?.trim() || d?.imageUrl || ""
    };
  });
}
function st(e, t, n, i) {
  const c = j(), { storeFrontMeta: s } = De(), l = s?.storeId ?? "", { collections: a, fetchCollectionsByStoreId: d } = at();
  le(() => {
    l && d(l);
  }, [l, d]);
  const h = M(
    () => ka(c, e, t, n),
    [c, e, t, n]
  );
  return M(() => {
    const u = r(c, `${i}.collectionsPicker`, ""), p = wa(c, e, t, n), g = Ca(a, u);
    return g.length ? _a(g, p, h) : h;
  }, [a, c, h, n, t, i, e]);
}
function Wa({
  tile: e,
  gap: t,
  blockBase: n,
  blockNodeId: i,
  fontBody: c
}) {
  const s = e.columnSpan === 2 ? 2 : 1, l = {
    gridColumn: `span ${s}`,
    minHeight: s === 2 ? 120 : 140,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 8,
    background: "#ececec"
  };
  return /* @__PURE__ */ o(N, { nodeId: i, label: "Collection", style: l, children: /* @__PURE__ */ m(
    D,
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
              ct,
              {
                variant: e.illustrationVariant,
                wide: s === 2
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
              fontFamily: c,
              color: "#111827"
            },
            children: /* @__PURE__ */ o(S, { fieldPath: `${n}.title`, label: "Title", children: e.title })
          }
        )
      ]
    }
  ) });
}
function za({
  sectionId: e = "collection_list_bento",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(
    () => $a(i, l),
    [i, l]
  ), h = st(t, e, n, l), u = `codiic-collection-list-bento-${e.replace(/[^a-z0-9_-]/gi, "-")}`, p = va(e, d.customCss), g = {
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    background: d.scheme.background,
    color: d.scheme.color,
    fontFamily: c
  }, k = d.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 0, paddingRight: 0 } : {
    maxWidth: R.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, y = `${l}.heading`, v = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gridTemplateRows: "repeat(2, minmax(120px, auto))",
    gap: d.cardsGap
  };
  return /* @__PURE__ */ m(
    B,
    {
      sectionId: e,
      label: "Collection list: Bento",
      editorNodeId: a,
      style: g,
      children: [
        p ? /* @__PURE__ */ o("style", { children: p }) : null,
        /* @__PURE__ */ m("div", { className: u, style: k, children: [
          /* @__PURE__ */ o(
            S,
            {
              fieldPath: y,
              label: "Heading",
              as: "h2",
              style: {
                margin: `0 0 ${d.layoutGap}px`,
                fontSize: 28,
                fontWeight: 700,
                fontFamily: s
              },
              children: d.heading
            }
          ),
          /* @__PURE__ */ o("div", { style: v, children: h.map((b) => {
            const _ = n === "template" ? `templates.${t}.sections.${e}.blocks.${b.id}.settings` : `sections.${e}.blocks.${b.id}.settings`, $ = n === "template" ? `template:${t}:${e}:block:${b.id}` : `layout:${e}:block:${b.id}`;
            return /* @__PURE__ */ o(
              Wa,
              {
                tile: b,
                gap: d.cardsGap,
                blockBase: _,
                blockNodeId: $,
                fontBody: c
              },
              b.id
            );
          }) })
        ] })
      ]
    }
  );
}
const To = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function Pa(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.navigationIcon`, "arrows"), c = r(e, `${t}.navigationIconBackground`, "circle"), s = r(e, `${t}.sectionWidth`, "page"), l = r(e, `${t}.mobileColumns`, "1");
  return {
    scheme: To[n] ?? To["scheme-1"],
    heading: r(e, `${t}.heading`),
    columns: Math.min(6, Math.max(1, x(e, `${t}.columns`, 3))),
    mobileColumns: l === "2" ? 2 : 1,
    horizontalGap: x(e, `${t}.horizontalGap`, 8),
    navigationIcon: i === "chevron" || i === "none" ? i : "arrows",
    navigationIconBackground: c === "square" || c === "none" ? c : "circle",
    sectionWidth: s === "full" ? "full" : "page",
    layoutGap: x(e, `${t}.layoutGap`, 12),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Ha(e, t) {
  const n = `.codiic-collection-list-carousel-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function Lo({
  label: e,
  onClick: t,
  background: n,
  shape: i
}) {
  return /* @__PURE__ */ o("button", { type: "button", "aria-label": e, onClick: t, style: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: n === "none" ? 32 : 36,
    height: n === "none" ? 32 : 36,
    border: "none",
    cursor: "pointer",
    background: n === "circle" || n === "square" ? "rgba(255,255,255,0.95)" : "transparent",
    borderRadius: n === "circle" ? "50%" : n === "square" ? 6 : 0,
    boxShadow: n !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
    color: "#111827",
    fontSize: i === "chevron" ? 18 : 20,
    lineHeight: 1
  }, children: i === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→" });
}
function Ta({
  sectionId: e = "collection_list_carousel",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), l = Ke(null), a = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, d = n === "template" ? `template:${t}:${e}` : `layout:${e}`, h = M(
    () => Pa(i, a),
    [i, a]
  ), u = st(t, e, n, a), p = `codiic-collection-list-carousel-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = (h.sectionWidth === "full", 24), k = h.sectionWidth === "full" ? "100%" : R.contentMaxWidth, y = h.columns > 0 ? `calc((100% - ${(h.columns - 1) * h.horizontalGap}px) / ${h.columns})` : "200px", v = (W) => {
    const T = l.current;
    T && T.scrollBy({ left: T.clientWidth * 0.85 * W, behavior: "smooth" });
  }, b = h.navigationIcon !== "none" && u.length > h.columns, _ = {
    background: h.scheme.background,
    color: h.scheme.color,
    paddingTop: h.paddingTop,
    paddingBottom: h.paddingBottom,
    paddingLeft: g,
    paddingRight: g,
    fontFamily: c,
    boxSizing: "border-box"
  }, $ = {
    maxWidth: k,
    margin: "0 auto",
    width: "100%"
  }, w = {
    display: "flex",
    alignItems: "center",
    gap: 8
  }, P = {
    display: "flex",
    gap: h.horizontalGap,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    flex: 1,
    paddingBottom: 4
  }, z = {
    flex: `0 0 ${y}`,
    minWidth: 0,
    scrollSnapAlign: "start"
  }, L = {
    aspectRatio: "1",
    borderRadius: 8,
    background: "#ececec",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 10
  }, H = {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.3,
    color: "#111827"
  };
  return /* @__PURE__ */ o(B, { sectionId: e, label: "Collection list: Carousel", editorNodeId: d, style: _, children: /* @__PURE__ */ m("div", { className: p, style: $, "data-mobile-columns": h.mobileColumns, children: [
    /* @__PURE__ */ o("style", { children: `
            .${p} [data-carousel-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${p}[data-mobile-columns="1"] [data-collection-card] {
                flex: 0 0 calc(100% - 8px);
              }
              .${p}[data-mobile-columns="2"] [data-collection-card] {
                flex: 0 0 calc(50% - ${h.horizontalGap / 2}px);
              }
            }
            ${Ha(e, h.customCss)}
          ` }),
    /* @__PURE__ */ o(
      S,
      {
        fieldPath: `${a}.heading`,
        label: "Heading",
        as: "h2",
        style: {
          margin: `0 0 ${h.layoutGap}px`,
          fontSize: 28,
          fontWeight: 700,
          fontFamily: s
        },
        children: h.heading
      }
    ),
    /* @__PURE__ */ m("div", { style: w, children: [
      b ? /* @__PURE__ */ o(
        Lo,
        {
          label: "Previous",
          onClick: () => v(-1),
          background: h.navigationIconBackground,
          shape: h.navigationIcon === "chevron" ? "chevron" : "arrows"
        }
      ) : null,
      /* @__PURE__ */ o("div", { ref: l, "data-carousel-track": !0, style: P, children: u.map((W) => {
        const T = n === "template" ? `templates.${t}.sections.${e}.blocks.${W.id}.settings` : `sections.${e}.blocks.${W.id}.settings`, C = n === "template" ? `template:${t}:${e}:block:${W.id}` : `layout:${e}:block:${W.id}`;
        return /* @__PURE__ */ o(N, { nodeId: C, label: "Collection", style: z, children: /* @__PURE__ */ o("div", { "data-collection-card": !0, children: /* @__PURE__ */ m(
          D,
          {
            to: W.href,
            style: { display: "block", textDecoration: "none", color: "inherit" },
            children: [
              /* @__PURE__ */ o("div", { style: L, children: W.imageUrl ? /* @__PURE__ */ o(
                "img",
                {
                  src: W.imageUrl,
                  alt: "",
                  style: { width: "100%", height: "100%", objectFit: "cover" }
                }
              ) : /* @__PURE__ */ o(
                ct,
                {
                  variant: W.illustrationVariant
                }
              ) }),
              /* @__PURE__ */ o("p", { style: H, children: /* @__PURE__ */ o(S, { fieldPath: `${T}.title`, label: "Title", children: W.title }) })
            ]
          }
        ) }) }, W.id);
      }) }),
      b ? /* @__PURE__ */ o(
        Lo,
        {
          label: "Next",
          onClick: () => v(1),
          background: h.navigationIconBackground,
          shape: h.navigationIcon === "chevron" ? "chevron" : "arrows"
        }
      ) : null
    ] })
  ] }) });
}
const Ro = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function La(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.sectionWidth`, "page");
  return {
    scheme: Ro[n] ?? Ro["scheme-1"],
    heading: r(e, `${t}.heading`),
    collectionCount: Math.min(8, Math.max(1, x(e, `${t}.collectionCount`, 4))),
    carouselOnMobile: !!K(e, `${t}.carouselOnMobile`),
    sectionWidth: i === "full" ? "full" : "page",
    layoutGap: x(e, `${t}.layoutGap`, 64),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Ra(e, t) {
  const n = `.codiic-collection-list-editorial-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function Ma(e) {
  const t = e % 4;
  return t === 0 ? { gridColumn: "1", marginTop: 0, minHeight: 200, wideIllustration: !1 } : t === 1 ? { gridColumn: "2", marginTop: 56, minHeight: 200, wideIllustration: !1 } : { gridColumn: "1 / -1", marginTop: 0, minHeight: t === 2 ? 160 : 180, wideIllustration: !0 };
}
function Fa({
  sectionId: e = "collection_list_editorial",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(
    () => La(i, l),
    [i, l]
  ), h = st(t, e, n, l), u = M(
    () => h.slice(0, d.collectionCount),
    [h, d.collectionCount]
  ), p = `codiic-collection-list-editorial-${e.replace(/[^a-z0-9_-]/gi, "-")}`, g = {
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    background: d.scheme.background,
    color: d.scheme.color,
    fontFamily: c
  }, k = d.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 24, paddingRight: 24 } : {
    maxWidth: R.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, y = {
    display: "grid",
    gridTemplateColumns: "0.85fr 1.25fr",
    gap: d.layoutGap,
    alignItems: "start"
  }, v = d.carouselOnMobile;
  return /* @__PURE__ */ o(
    B,
    {
      sectionId: e,
      label: "Collection list: Editorial",
      editorNodeId: a,
      style: g,
      children: /* @__PURE__ */ m(
        "div",
        {
          className: p,
          style: k,
          "data-editorial-carousel": v ? "true" : "false",
          children: [
            /* @__PURE__ */ o("style", { children: `
            @media (max-width: 749px) {
              .${p}[data-editorial-carousel="true"] [data-editorial-grid] {
                display: flex;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                gap: 16px;
                padding-bottom: 4px;
              }
              .${p}[data-editorial-carousel="true"] [data-editorial-grid]::-webkit-scrollbar {
                display: none;
              }
              .${p}[data-editorial-carousel="true"] [data-editorial-tile] {
                flex: 0 0 78%;
                min-width: 0;
                scroll-snap-align: start;
                margin-top: 0 !important;
                grid-column: auto !important;
              }
            }
            ${Ra(e, d.customCss)}
          ` }),
            /* @__PURE__ */ o(
              S,
              {
                fieldPath: `${l}.heading`,
                label: "Heading",
                as: "h2",
                style: {
                  margin: `0 0 ${Math.min(d.layoutGap, 48)}px`,
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: s
                },
                children: d.heading
              }
            ),
            /* @__PURE__ */ o("div", { "data-editorial-grid": !0, style: y, children: u.map((b, _) => {
              const $ = Ma(_), w = n === "template" ? `templates.${t}.sections.${e}.blocks.${b.id}.settings` : `sections.${e}.blocks.${b.id}.settings`, P = n === "template" ? `template:${t}:${e}:block:${b.id}` : `layout:${e}:block:${b.id}`, z = {
                gridColumn: $.gridColumn,
                marginTop: $.marginTop,
                minHeight: $.minHeight,
                display: "flex",
                flexDirection: "column",
                borderRadius: 8,
                background: "#ececec",
                overflow: "hidden"
              };
              return /* @__PURE__ */ o(N, { nodeId: P, label: "Collection", style: z, children: /* @__PURE__ */ o("div", { "data-editorial-tile": !0, children: /* @__PURE__ */ m(
                D,
                {
                  to: b.href,
                  style: {
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                    minHeight: $.minHeight
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
                        children: b.imageUrl ? /* @__PURE__ */ o(
                          "img",
                          {
                            src: b.imageUrl,
                            alt: "",
                            style: { width: "100%", height: "100%", objectFit: "cover" }
                          }
                        ) : /* @__PURE__ */ o(
                          ct,
                          {
                            variant: b.illustrationVariant,
                            wide: $.wideIllustration
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
                          fontFamily: c
                        },
                        children: /* @__PURE__ */ o(S, { fieldPath: `${w}.title`, label: "Title", children: b.title })
                      }
                    )
                  ]
                }
              ) }) }, b.id);
            }) })
          ]
        }
      )
    }
  );
}
const Mo = {
  "scheme-1": { background: "#ffffff", color: "#111827" },
  "scheme-2": { background: "#f6f6f7", color: "#111827" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b" }
};
function Aa(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.sectionWidth`, "page"), c = r(e, `${t}.mobileColumns`, "2");
  return {
    scheme: Mo[n] ?? Mo["scheme-1"],
    heading: r(e, `${t}.heading`),
    columns: Math.min(6, Math.max(1, x(e, `${t}.columns`, 3))),
    mobileColumns: c === "1" ? 1 : 2,
    horizontalGap: x(e, `${t}.horizontalGap`, 8),
    verticalGap: x(e, `${t}.verticalGap`, 8),
    carouselOnMobile: !!K(e, `${t}.carouselOnMobile`),
    sectionWidth: i === "full" ? "full" : "page",
    layoutGap: x(e, `${t}.layoutGap`, 12),
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Na(e, t) {
  const n = `.codiic-collection-list-grid-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function Ea({
  sectionId: e = "collection_list_grid",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), l = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, a = n === "template" ? `template:${t}:${e}` : `layout:${e}`, d = M(
    () => Aa(i, l),
    [i, l]
  ), h = st(t, e, n, l), u = `codiic-collection-list-grid-${e.replace(/[^a-z0-9_-]/gi, "-")}`, p = {
    paddingTop: d.paddingTop,
    paddingBottom: d.paddingBottom,
    background: d.scheme.background,
    color: d.scheme.color,
    fontFamily: c,
    boxSizing: "border-box"
  }, g = d.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 24, paddingRight: 24 } : {
    maxWidth: R.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, k = {
    display: "grid",
    gridTemplateColumns: `repeat(${d.columns}, minmax(0, 1fr))`,
    columnGap: d.horizontalGap,
    rowGap: d.verticalGap
  }, y = {
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
    fontFamily: c,
    zIndex: 1
  };
  return /* @__PURE__ */ o(
    B,
    {
      sectionId: e,
      label: "Collection list: Grid",
      editorNodeId: a,
      style: p,
      children: /* @__PURE__ */ m(
        "div",
        {
          className: u,
          style: g,
          "data-grid-columns": d.columns,
          "data-mobile-columns": d.mobileColumns,
          "data-carousel-mobile": d.carouselOnMobile ? "true" : "false",
          children: [
            /* @__PURE__ */ o("style", { children: `
            @media (max-width: 749px) {
              .${u}[data-carousel-mobile="false"] [data-grid-track] {
                grid-template-columns: repeat(${d.mobileColumns}, minmax(0, 1fr)) !important;
              }
              .${u}[data-carousel-mobile="true"] [data-grid-track] {
                display: flex !important;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                gap: ${d.horizontalGap}px;
                padding-bottom: 4px;
              }
              .${u}[data-carousel-mobile="true"] [data-grid-track]::-webkit-scrollbar {
                display: none;
              }
              .${u}[data-carousel-mobile="true"] [data-grid-tile] {
                flex: 0 0 calc(${d.mobileColumns === 1 ? "88" : "46"}% - 8px);
                scroll-snap-align: start;
              }
            }
            ${Na(e, d.customCss)}
          ` }),
            /* @__PURE__ */ o(
              S,
              {
                fieldPath: `${l}.heading`,
                label: "Heading",
                as: "h2",
                style: {
                  margin: `0 0 ${d.layoutGap}px`,
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: s
                },
                children: d.heading
              }
            ),
            /* @__PURE__ */ o("div", { "data-grid-track": !0, style: k, children: h.map((b) => {
              const _ = n === "template" ? `templates.${t}.sections.${e}.blocks.${b.id}.settings` : `sections.${e}.blocks.${b.id}.settings`, $ = n === "template" ? `template:${t}:${e}:block:${b.id}` : `layout:${e}:block:${b.id}`;
              return /* @__PURE__ */ o(N, { nodeId: $, label: "Collection", children: /* @__PURE__ */ o("div", { "data-grid-tile": !0, children: /* @__PURE__ */ o(
                D,
                {
                  to: b.href,
                  style: { display: "block", textDecoration: "none", color: "inherit" },
                  children: /* @__PURE__ */ m("div", { style: y, children: [
                    /* @__PURE__ */ o("span", { style: v, children: /* @__PURE__ */ o(S, { fieldPath: `${_}.title`, label: "Title", children: b.title }) }),
                    b.imageUrl ? /* @__PURE__ */ o(
                      "img",
                      {
                        src: b.imageUrl,
                        alt: "",
                        style: { width: "100%", height: "100%", objectFit: "cover" }
                      }
                    ) : /* @__PURE__ */ o(
                      ct,
                      {
                        variant: b.illustrationVariant
                      }
                    )
                  ] })
                }
              ) }) }, b.id);
            }) })
          ]
        }
      )
    }
  );
}
function Ua({ imageUrl: e, style: t }) {
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
function wn({ variant: e }) {
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
const Fo = {
  "scheme-1": { background: "#f3efe6", color: "#111827", muted: "#4b5563" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function Oa(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.height`, "medium"), c = r(e, `${t}.sectionWidth`, "page");
  return {
    scheme: Fo[n] ?? Fo["scheme-1"],
    sectionWidth: c === "full" ? "full" : "page",
    height: i === "small" || i === "large" ? i : "medium",
    cornerRadius: x(e, `${t}.cornerRadius`, 0),
    borderThickness: x(e, `${t}.borderThickness`, 1),
    dropShadow: !!K(e, `${t}.dropShadow`),
    paddingTop: x(e, `${t}.paddingTop`, 40),
    paddingBottom: x(e, `${t}.paddingBottom`, 40),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Ga(e) {
  return e === "small" ? 360 : e === "large" ? 560 : 460;
}
function Ht(e, t, n, i) {
  const s = `${i === "template" ? `templates.${t}.sections.${n}` : `sections.${n}`}.blocks`, l = i === "template" ? _e(e, t, n, []) : ke(e, n, []), a = K(e, s);
  return !a || typeof a != "object" ? [] : (l.length ? l : Object.keys(a)).map((h) => {
    const u = a[h]?.settings ?? {}, p = String(u.peekVariant ?? "figure");
    return {
      id: h,
      title: String(u.title ?? ""),
      body: String(
        u.body ?? "Introducing our latest products, made especially for the season. Shop your favorites before they're gone!"
      ),
      buttonLabel: String(u.buttonLabel ?? ""),
      buttonHref: String(u.buttonHref ?? ""),
      imageUrl: String(u.imageUrl ?? ""),
      peekVariant: p === "landscape" ? "landscape" : "figure"
    };
  });
}
function Da(e, t) {
  const n = `.codiic-layered-slideshow-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function ja({
  sectionId: e = "layered_slideshow",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), [l, a] = te(0), d = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, h = n === "template" ? `template:${t}:${e}` : `layout:${e}`, u = M(
    () => Oa(i, d),
    [i, d]
  ), p = M(
    () => Ht(i, t, e, n),
    [i, t, e, n]
  ), g = Math.max(1, p.length), k = (l % g + g) % g, y = p[k] ?? p[0], v = p[(k + 1) % g] ?? y, b = `codiic-layered-slideshow-${e.replace(/[^a-z0-9_-]/gi, "-")}`, _ = Da(e, u.customCss), $ = Ga(u.height), w = {
    paddingTop: u.paddingTop,
    paddingBottom: u.paddingBottom,
    background: u.scheme.background,
    color: u.scheme.color,
    fontFamily: c,
    boxSizing: "border-box"
  }, P = u.sectionWidth === "full" ? { maxWidth: "100%", paddingLeft: 24, paddingRight: 24 } : {
    maxWidth: R.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, z = {
    position: "relative",
    display: "flex",
    minHeight: $,
    overflow: "hidden",
    borderRadius: u.cornerRadius,
    border: u.borderThickness ? `${u.borderThickness}px solid rgba(0,0,0,0.08)` : "none",
    boxShadow: u.dropShadow ? "0 8px 28px rgba(0,0,0,0.12)" : void 0,
    background: u.scheme.background
  }, L = Me((H) => a(H), []);
  return y ? /* @__PURE__ */ m(B, { nodeId: h, label: "Layered slideshow", children: [
    _ ? /* @__PURE__ */ o("style", { children: _ }) : null,
    /* @__PURE__ */ o("section", { "data-codiic-section": e, className: b, style: w, children: /* @__PURE__ */ o("div", { style: P, children: /* @__PURE__ */ m("div", { style: z, children: [
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
          children: /* @__PURE__ */ m(N, { nodeId: `${h}:${y.id}`, label: "Slide", children: [
            /* @__PURE__ */ o(
              S,
              {
                fieldPath: `${d.replace(".settings", "")}.blocks.${y.id}.settings.title`,
                label: "Heading",
                children: /* @__PURE__ */ o(
                  "h2",
                  {
                    style: {
                      margin: 0,
                      fontFamily: s,
                      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                      fontWeight: 700,
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em"
                    },
                    children: y.title
                  }
                )
              }
            ),
            /* @__PURE__ */ o(
              S,
              {
                fieldPath: `${d.replace(".settings", "")}.blocks.${y.id}.settings.body`,
                label: "Text",
                children: /* @__PURE__ */ o(
                  "p",
                  {
                    style: {
                      margin: "16px 0 0",
                      fontSize: "1rem",
                      lineHeight: 1.55,
                      color: u.scheme.muted,
                      maxWidth: 420
                    },
                    children: y.body
                  }
                )
              }
            ),
            /* @__PURE__ */ o(
              S,
              {
                fieldPath: `${d.replace(".settings", "")}.blocks.${y.id}.settings.buttonLabel`,
                label: "Button label",
                children: /* @__PURE__ */ o(
                  D,
                  {
                    to: y.buttonHref || "#",
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
                    children: y.buttonLabel
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
          children: /* @__PURE__ */ o("div", { style: { position: "relative", width: "72%", maxWidth: 340, height: "78%", minHeight: 280 }, children: /* @__PURE__ */ o(Ua, { imageUrl: y.imageUrl || void 0 }) })
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
          children: /* @__PURE__ */ o(wn, { variant: v.peekVariant })
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
          children: p.map((H, W) => /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              "aria-label": `Go to slide ${W + 1}`,
              onClick: () => L(W),
              style: {
                width: 8,
                height: 8,
                padding: 0,
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                background: W === k ? "#111827" : "rgba(17,24,39,0.35)"
              }
            },
            H.id
          ))
        }
      ) : null
    ] }) }) })
  ] }) : null;
}
function Cn({
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
const Ao = {
  "scheme-1": { background: "#ddd6c8", color: "#ffffff", muted: "rgba(255,255,255,0.92)" },
  "scheme-2": { background: "#1e3a5f", color: "#ffffff", muted: "rgba(255,255,255,0.9)" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function Ba(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.mediaHeight`, "medium"), c = r(e, `${t}.sectionWidth`, "full"), s = r(e, `${t}.contentPosition`, "on-media"), l = r(e, `${t}.navigationIcon`, "large-arrows"), a = r(
    e,
    `${t}.navigationIconBackground`,
    "none"
  ), d = r(e, `${t}.pagination`), h = a === "circle" || a === "square" ? a : "none";
  return {
    scheme: Ao[n] ?? Ao["scheme-1"],
    sectionWidth: c === "page" ? "page" : "full",
    mediaHeight: i === "small" || i === "large" ? i : "medium",
    contentPosition: s === "below-media" ? "below-media" : "on-media",
    navigationIcon: l === "arrows" || l === "chevron" || l === "none" ? l : "large-arrows",
    navigationIconBackground: h,
    pagination: d === "counter" || d === "none" ? d : "dots",
    autoRotate: !!K(e, `${t}.autoRotate`),
    paddingTop: x(e, `${t}.paddingTop`, 0),
    paddingBottom: x(e, `${t}.paddingBottom`, 0),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function qa(e) {
  return e === "small" ? 420 : e === "large" ? 640 : 520;
}
function Xa(e, t, n, i) {
  return Ht(e, t, n, i);
}
function Ia(e, t) {
  const n = `.codiic-slideshow-full-frame-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function No({
  label: e,
  onClick: t,
  background: n,
  size: i,
  shape: c
}) {
  const s = i === "large-arrows", l = n === "none" ? s ? 48 : 36 : s ? 52 : 40;
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
        width: l,
        height: l,
        border: "none",
        cursor: "pointer",
        background: n === "circle" || n === "square" ? "rgba(255,255,255,0.95)" : "transparent",
        borderRadius: n === "circle" ? "50%" : n === "square" ? 8 : 0,
        boxShadow: n !== "none" ? "0 2px 8px rgba(0,0,0,0.15)" : void 0,
        color: "#fff",
        fontSize: c === "chevron" ? s ? 28 : 20 : s ? 28 : 22,
        lineHeight: 1,
        textShadow: n === "none" ? "0 1px 3px rgba(0,0,0,0.35)" : void 0
      },
      children: c === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→"
    }
  );
}
function Va({
  sectionId: e = "slideshow_full_frame",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), [l, a] = te(0), d = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, h = n === "template" ? `template:${t}:${e}` : `layout:${e}`, u = M(
    () => Ba(i, d),
    [i, d]
  ), p = M(
    () => Xa(i, t, e, n),
    [i, t, e, n]
  ), g = Math.max(1, p.length), k = (l % g + g) % g, y = p[k] ?? p[0], v = Me(() => a((O) => (O - 1 + g) % g), [g]), b = Me(() => a((O) => (O + 1) % g), [g]), _ = Me((O) => a(O), []);
  le(() => {
    if (!u.autoRotate || g < 2) return;
    const O = window.setInterval(() => a((Y) => (Y + 1) % g), 5e3);
    return () => window.clearInterval(O);
  }, [u.autoRotate, g]);
  const $ = `codiic-slideshow-full-frame-${e.replace(/[^a-z0-9_-]/gi, "-")}`, w = Ia(e, u.customCss), P = qa(u.mediaHeight), z = u.contentPosition === "on-media", L = u.navigationIcon !== "none" && g > 1, H = u.navigationIcon === "chevron" ? "chevron" : "arrows", W = u.navigationIcon === "large-arrows" ? "large-arrows" : u.navigationIcon, T = {
    paddingTop: u.paddingTop,
    paddingBottom: u.paddingBottom,
    background: z ? u.scheme.background : "#fff",
    fontFamily: c,
    boxSizing: "border-box"
  }, C = u.sectionWidth === "full" ? { maxWidth: "100%" } : {
    maxWidth: R.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: 24,
    paddingRight: 24
  }, F = {
    position: "relative",
    width: "100%",
    minHeight: P,
    overflow: "hidden",
    borderRadius: u.sectionWidth === "page" ? 12 : 0,
    background: u.scheme.background
  }, f = z ? "#fff" : u.scheme.color, U = z ? "rgba(255,255,255,0.92)" : u.scheme.muted;
  if (!y) return null;
  const X = d.replace(".settings", "");
  return /* @__PURE__ */ m(B, { nodeId: h, label: "Slideshow: Full frame", children: [
    w ? /* @__PURE__ */ o("style", { children: w }) : null,
    /* @__PURE__ */ o("section", { "data-codiic-section": e, className: $, style: T, children: /* @__PURE__ */ m("div", { style: C, children: [
      /* @__PURE__ */ m("div", { style: F, children: [
        /* @__PURE__ */ o(Cn, { imageUrl: y.imageUrl || void 0 }),
        z ? /* @__PURE__ */ o(
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
            children: /* @__PURE__ */ m(N, { nodeId: `${h}:${y.id}`, label: "Slide", children: [
              /* @__PURE__ */ o(S, { fieldPath: `${X}.blocks.${y.id}.settings.title`, label: "Heading", children: /* @__PURE__ */ o(
                "h2",
                {
                  style: {
                    margin: 0,
                    fontFamily: s,
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: f,
                    textShadow: "0 1px 4px rgba(0,0,0,0.2)"
                  },
                  children: y.title
                }
              ) }),
              /* @__PURE__ */ o(S, { path: `${X}.blocks.${y.id}.settings.body`, label: "Text", children: /* @__PURE__ */ o(
                "p",
                {
                  style: {
                    margin: "16px auto 0",
                    maxWidth: 520,
                    fontSize: "1.0625rem",
                    lineHeight: 1.55,
                    color: U
                  },
                  children: y.body
                }
              ) }),
              /* @__PURE__ */ o(
                S,
                {
                  fieldPath: `${X}.blocks.${y.id}.settings.buttonLabel`,
                  label: "Button label",
                  children: /* @__PURE__ */ o(
                    D,
                    {
                      to: y.buttonHref || "#",
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
                      children: y.buttonLabel
                    }
                  )
                }
              )
            ] })
          }
        ) : null,
        L ? /* @__PURE__ */ m(Z, { children: [
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
                No,
                {
                  label: "Previous",
                  onClick: v,
                  background: u.navigationIconBackground,
                  size: W,
                  shape: H
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
                No,
                {
                  label: "Next",
                  onClick: b,
                  background: u.navigationIconBackground,
                  size: W,
                  shape: H
                }
              )
            }
          )
        ] }) : null,
        u.pagination === "dots" && g > 1 ? /* @__PURE__ */ o(
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
            children: p.map((O, Y) => /* @__PURE__ */ o(
              "button",
              {
                type: "button",
                "aria-label": `Go to slide ${Y + 1}`,
                onClick: () => _(Y),
                style: {
                  width: 8,
                  height: 8,
                  padding: 0,
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  background: Y === k ? "#fff" : "rgba(255,255,255,0.45)"
                }
              },
              O.id
            ))
          }
        ) : null,
        u.pagination === "counter" && g > 1 ? /* @__PURE__ */ m(
          "div",
          {
            style: {
              position: "absolute",
              bottom: 20,
              right: 24,
              zIndex: 4,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: z ? "#fff" : u.scheme.color
            },
            children: [
              k + 1,
              " / ",
              g
            ]
          }
        ) : null
      ] }),
      z ? null : /* @__PURE__ */ m("div", { style: { padding: "32px 24px", textAlign: "center", color: u.scheme.color }, children: [
        /* @__PURE__ */ o("h2", { style: { margin: 0, fontFamily: s, fontSize: "2rem", fontWeight: 700 }, children: y.title }),
        /* @__PURE__ */ o("p", { style: { margin: "12px auto 0", maxWidth: 520, color: u.scheme.muted }, children: y.body }),
        /* @__PURE__ */ o(
          D,
          {
            to: y.buttonHref || "#",
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
            children: y.buttonLabel
          }
        )
      ] })
    ] }) })
  ] });
}
const Eo = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f6f6f7", color: "#111827", muted: "#6b7280" },
  "scheme-3": { background: "#eef6fb", color: "#0f172a", muted: "#64748b" },
  "scheme-4": { background: "#f5f3ff", color: "#1e1b4b", muted: "#6b7280" }
};
function Ka(e, t) {
  const n = r(e, `${t}.colorScheme`, "scheme-1"), i = r(e, `${t}.mediaHeight`, "medium"), c = r(e, `${t}.contentPosition`), s = r(e, `${t}.navigationIcon`, "large-arrows"), l = r(
    e,
    `${t}.navigationIconBackground`,
    "none"
  ), a = r(e, `${t}.pagination`, "none"), d = l === "circle" || l === "square" ? l : "none";
  return {
    scheme: Eo[n] ?? Eo["scheme-1"],
    gap: x(e, `${t}.gap`, 18),
    cornerRadius: x(e, `${t}.cornerRadius`, 20),
    fullWidthOnMobile: !!K(e, `${t}.fullWidthOnMobile`),
    mediaHeight: i === "small" || i === "large" ? i : "medium",
    contentPosition: c === "on-media" ? "on-media" : "below-media",
    navigationIcon: s === "arrows" || s === "chevron" || s === "none" ? s : "large-arrows",
    navigationIconBackground: d,
    pagination: a === "dots" || a === "counter" ? a : "none",
    paddingTop: x(e, `${t}.paddingTop`, 0),
    paddingBottom: x(e, `${t}.paddingBottom`, 0),
    customCss: r(e, `${t}.customCss`, "")
  };
}
function Ya(e) {
  return e === "small" ? 280 : e === "large" ? 440 : 360;
}
function Qa(e, t, n, i) {
  return Ht(e, t, n, i);
}
function Za(e, t) {
  const n = `.codiic-slideshow-inset-${e.replace(/[^a-z0-9_-]/gi, "-")}`;
  return t.trim() ? `${n} { ${t} }` : "";
}
function Uo({
  label: e,
  onClick: t,
  background: n,
  size: i,
  shape: c
}) {
  const s = i === "large-arrows", l = n === "none" ? s ? 44 : 36 : s ? 48 : 40;
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
        width: l,
        height: l,
        border: "none",
        cursor: "pointer",
        background: n === "circle" || n === "square" ? "rgba(255,255,255,0.95)" : "transparent",
        borderRadius: n === "circle" ? "50%" : n === "square" ? 8 : 0,
        boxShadow: n !== "none" ? "0 2px 8px rgba(0,0,0,0.12)" : void 0,
        color: "#111827",
        fontSize: c === "chevron" ? s ? 24 : 18 : s ? 24 : 20,
        lineHeight: 1
      },
      children: c === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→"
    }
  );
}
function Ja({
  sectionId: e = "slideshow_inset",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), { fontBody: c, fontHeading: s } = q(), [l, a] = te(0), d = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, h = n === "template" ? `template:${t}:${e}` : `layout:${e}`, u = M(
    () => Ka(i, d),
    [i, d]
  ), p = M(
    () => Qa(i, t, e, n),
    [i, t, e, n]
  ), g = Math.max(1, p.length), k = (l % g + g) % g, y = p[k] ?? p[0], v = p[(k + 1) % g] ?? y, b = Me(() => a((I) => (I - 1 + g) % g), [g]), _ = Me(() => a((I) => (I + 1) % g), [g]), $ = Me((I) => a(I), []), w = `codiic-slideshow-inset-${e.replace(/[^a-z0-9_-]/gi, "-")}`, P = Za(e, u.customCss), z = Ya(u.mediaHeight), L = u.contentPosition === "below-media", H = u.navigationIcon !== "none" && g > 1, W = u.navigationIcon === "chevron" ? "chevron" : "arrows", T = u.navigationIcon === "large-arrows" ? "large-arrows" : u.navigationIcon === "chevron" ? "chevron" : "arrows", C = {
    paddingTop: u.paddingTop,
    paddingBottom: u.paddingBottom,
    background: u.scheme.background,
    color: u.scheme.color,
    fontFamily: c,
    boxSizing: "border-box"
  }, F = {
    maxWidth: R.contentMaxWidth,
    margin: "0 auto",
    paddingLeft: u.fullWidthOnMobile ? 0 : 24,
    paddingRight: u.fullWidthOnMobile ? 0 : 24
  }, f = {
    display: "flex",
    flexDirection: "column",
    gap: L ? 24 : 0
  }, U = {
    position: "relative",
    display: "flex",
    gap: u.gap,
    overflow: "hidden",
    paddingLeft: 24,
    paddingRight: 24
  }, X = {
    position: "relative",
    flex: "1 1 auto",
    minWidth: 0,
    height: z,
    borderRadius: u.cornerRadius,
    overflow: "hidden",
    background: "#ddd6c8"
  }, O = {
    flex: `0 0 ${Math.max(48, u.gap + 32)}px`,
    width: Math.max(48, u.gap + 32),
    height: z,
    borderRadius: u.cornerRadius,
    overflow: "hidden",
    opacity: 0.95
  };
  if (!y) return null;
  const Y = d.replace(".settings", ""), J = /* @__PURE__ */ m(N, { nodeId: `${h}:${y.id}`, label: "Slide", children: [
    /* @__PURE__ */ o(S, { fieldPath: `${Y}.blocks.${y.id}.settings.title`, label: "Heading", children: /* @__PURE__ */ o(
      "h2",
      {
        style: {
          margin: 0,
          fontFamily: s,
          fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: L ? u.scheme.color : "#fff",
          textAlign: "center"
        },
        children: y.title
      }
    ) }),
    /* @__PURE__ */ o(S, { fieldPath: `${Y}.blocks.${y.id}.settings.body`, label: "Text", children: /* @__PURE__ */ o(
      "p",
      {
        style: {
          margin: "12px auto 0",
          maxWidth: 520,
          fontSize: "1rem",
          lineHeight: 1.55,
          color: L ? u.scheme.muted : "rgba(255,255,255,0.92)",
          textAlign: "center"
        },
        children: y.body
      }
    ) }),
    /* @__PURE__ */ o(S, { fieldPath: `${Y}.blocks.${y.id}.settings.buttonLabel`, label: "Button label", children: /* @__PURE__ */ o(
      D,
      {
        to: y.buttonHref || "#",
        style: {
          display: "inline-flex",
          marginTop: 20,
          padding: "14px 28px",
          borderRadius: 999,
          background: L ? "#111827" : "#fff",
          color: L ? "#fff" : "#111827",
          fontSize: "0.9375rem",
          fontWeight: 600,
          textDecoration: "none"
        },
        children: y.buttonLabel
      }
    ) })
  ] });
  return /* @__PURE__ */ m(B, { nodeId: h, label: "Slideshow: Inset", children: [
    P ? /* @__PURE__ */ o("style", { children: P }) : null,
    /* @__PURE__ */ o("section", { "data-codiic-section": e, className: w, style: C, children: /* @__PURE__ */ o("div", { style: F, children: /* @__PURE__ */ m("div", { style: f, children: [
      /* @__PURE__ */ m("div", { style: U, children: [
        /* @__PURE__ */ m("div", { style: X, children: [
          /* @__PURE__ */ o(Cn, { imageUrl: y.imageUrl || void 0 }),
          L ? null : /* @__PURE__ */ o(
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
              children: J
            }
          ),
          H ? /* @__PURE__ */ m(Z, { children: [
            /* @__PURE__ */ o("div", { style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 4 }, children: /* @__PURE__ */ o(
              Uo,
              {
                label: "Previous",
                onClick: b,
                background: u.navigationIconBackground,
                size: T,
                shape: W
              }
            ) }),
            /* @__PURE__ */ o("div", { style: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 4 }, children: /* @__PURE__ */ o(
              Uo,
              {
                label: "Next",
                onClick: _,
                background: u.navigationIconBackground,
                size: T,
                shape: W
              }
            ) })
          ] }) : null,
          u.pagination === "dots" && g > 1 && !L ? /* @__PURE__ */ o(
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
              children: p.map((I, ce) => /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  "aria-label": `Go to slide ${ce + 1}`,
                  onClick: () => $(ce),
                  style: {
                    width: 8,
                    height: 8,
                    padding: 0,
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    background: ce === k ? "#fff" : "rgba(255,255,255,0.45)"
                  }
                },
                I.id
              ))
            }
          ) : null
        ] }),
        g > 1 ? /* @__PURE__ */ o("div", { style: O, "aria-hidden": !0, children: /* @__PURE__ */ o(wn, { variant: v.peekVariant }) }) : null
      ] }),
      L ? /* @__PURE__ */ o("div", { style: { textAlign: "center", padding: "0 24px 8px" }, children: J }) : null,
      u.pagination === "dots" && g > 1 && L ? /* @__PURE__ */ o("div", { style: { display: "flex", justifyContent: "center", gap: 8, paddingBottom: 8 }, children: p.map((I, ce) => /* @__PURE__ */ o(
        "button",
        {
          type: "button",
          "aria-label": `Go to slide ${ce + 1}`,
          onClick: () => $(ce),
          style: {
            width: 8,
            height: 8,
            padding: 0,
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            background: ce === k ? "#111827" : "rgba(17,24,39,0.25)"
          }
        },
        I.id
      )) }) : null,
      u.pagination === "counter" && g > 1 ? /* @__PURE__ */ m("p", { style: { textAlign: "center", margin: 0, fontSize: "0.875rem", fontWeight: 600 }, children: [
        k + 1,
        " / ",
        g
      ] }) : null
    ] }) }) })
  ] });
}
function ed({ sectionId: e = "divider", templateId: t = "index" }) {
  return /* @__PURE__ */ o(_t, { sectionId: e, placement: "template", templateId: t });
}
function td(e, t) {
  return e === "fit" ? "fit-content" : "100%";
}
function od(e, t) {
  return t ? "baseline" : e === "top" ? "flex-start" : e === "bottom" ? "flex-end" : "center";
}
function nd(e, t, n, i) {
  const c = r(e, `${t}.direction`, "horizontal"), s = r(e, `${t}.layoutAlignment`, "space-between"), l = r(e, `${t}.position`, "bottom"), a = E(e, `${t}.alignTextBaseline`, !0), d = x(e, `${t}.layoutGap`, 12), h = r(e, `${t}.width`, "fill"), u = r(e, `${t}.height`, "fit"), p = E(e, `${t}.inheritColorScheme`, !0), g = r(e, `${t}.backgroundMedia`, "none"), k = r(e, `${t}.backgroundImageUrl`, "").trim(), y = r(e, `${t}.borderStyle`, "none"), v = Math.max(0, x(e, `${t}.cornerRadius`, 0)), b = E(e, `${t}.verticalOnMobile`, !1), _ = n.background, $ = n.color;
  return {
    flexDirection: c === "vertical" ? "column" : "row",
    justifyContent: s,
    alignItems: od(l, a),
    gap: d,
    flexWrap: "wrap",
    width: td(h),
    minHeight: u === "fit" ? "auto" : u === "fill" ? "100%" : "auto",
    paddingTop: x(e, `${t}.paddingTop`, 0),
    paddingBottom: x(e, `${t}.paddingBottom`, 0),
    paddingLeft: x(e, `${t}.paddingLeft`, 0),
    paddingRight: x(e, `${t}.paddingRight`, 0),
    borderRadius: v,
    border: y === "solid" ? `1px solid ${i}` : void 0,
    background: _,
    backgroundImage: g === "image" && k ? `url(${k})` : void 0,
    color: $,
    mobileStack: b
  };
}
function id(e, t, n) {
  const i = `[data-codiic-section="${e}"] [data-fc-collection-header]`;
  let c = "";
  return n && (c += `@media (max-width: 749px) { ${i} { flex-direction: column !important; align-items: stretch !important; } }`), t === "fit" ? c += `@media (max-width: 749px) { ${i} { width: fit-content !important; max-width: 100%; } }` : t === "fill" && (c += `@media (max-width: 749px) { ${i} { width: 100% !important; } }`), c;
}
const Oo = {
  "heading-1": { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  "heading-2": { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  "heading-3": { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  "heading-4": { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
}, Go = {
  narrow: "480px",
  normal: "640px",
  wide: "960px",
  none: void 0
};
function rd(e) {
  const n = e?.settings?.colors?.palette;
  return Array.isArray(n) && n.length >= 2 ? n.filter((i) => typeof i == "string" && i.trim().length > 0) : ["#ffffff", "#111827"];
}
function ld(e, t, n) {
  if (t.startsWith("#")) return t;
  if (t === "palette" || /^palette:\d+$/.test(t)) {
    const i = rd(e), c = /^palette:(\d+)$/.exec(t), s = c ? Number(c[1]) : 1;
    return i[s] ?? n.text;
  }
  return t === "heading" ? n.heading : t === "accent" ? n.accent : n.text;
}
function ad(e, t, n, i) {
  const c = r(e, `${t}.titleTypographyPreset`, "heading-4"), s = Oo[c] ?? Oo["heading-4"], a = r(e, `${t}.titleWidth`, "fit") === "fill", d = r(e, `${t}.titleMaxWidth`, "normal"), h = Go[d] ?? Go.normal, u = r(e, `${t}.titleAlignment`, "left"), p = u === "right" ? "right" : u === "center" ? "center" : "left", g = r(e, `${t}.titleColor`, "text"), k = ld(e, g, i), y = E(e, `${t}.titleBackgroundEnabled`, !1), v = r(e, `${t}.titleBackgroundColor`, "#00000026"), b = x(e, `${t}.titleCornerRadius`, 0);
  return {
    flex: a ? "1 1 auto" : "0 0 auto",
    width: a ? "auto" : "fit-content",
    maxWidth: h,
    textAlign: a ? p : void 0,
    fontFamily: n.heading,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight,
    color: k,
    background: y ? v : void 0,
    paddingTop: x(e, `${t}.titlePaddingTop`, 0),
    paddingBottom: x(e, `${t}.titlePaddingBottom`, 0),
    paddingLeft: x(e, `${t}.titlePaddingLeft`, 0),
    paddingRight: x(e, `${t}.titlePaddingRight`, 0),
    borderRadius: y ? b : 0
  };
}
const Do = {
  auto: void 0,
  "1/1": "1 / 1",
  "4/5": "4 / 5",
  "3/4": "3 / 4",
  "16/9": "16 / 9",
  "2/3": "2 / 3"
};
function dd(e, t, n) {
  const i = r(e, `${t}.mediaAspectRatio`, "auto"), c = r(e, `${t}.mediaBorderStyle`, "none"), s = x(e, `${t}.mediaCornerRadius`, 0);
  return {
    aspectRatio: Do[i] ?? Do["4/5"],
    border: c === "solid" ? `1px solid ${n}` : "none",
    borderRadius: s,
    paddingTop: x(e, `${t}.mediaPaddingTop`, 0),
    paddingBottom: x(e, `${t}.mediaPaddingBottom`, 0),
    paddingLeft: x(e, `${t}.mediaPaddingLeft`, 0),
    paddingRight: x(e, `${t}.mediaPaddingRight`, 0)
  };
}
function cd(e, t, n, i) {
  const c = E(e, `${t}.inheritColorScheme`, !0), s = r(e, `${t}.borderStyle`, "none"), l = x(e, `${t}.cornerRadius`, 0);
  return {
    verticalGap: x(e, `${t}.verticalGap`, 4),
    background: n.background,
    color: n.color,
    border: s === "solid" ? `1px solid ${i}` : "none",
    borderRadius: l,
    paddingTop: x(e, `${t}.paddingTop`, 0),
    paddingBottom: x(e, `${t}.paddingBottom`, 0),
    paddingLeft: x(e, `${t}.paddingLeft`, 0),
    paddingRight: x(e, `${t}.paddingRight`, 0)
  };
}
function sd(e) {
  const n = e?.settings?.colors?.palette;
  return Array.isArray(n) && n.length >= 2 ? n.filter((i) => typeof i == "string" && i.trim().length > 0) : ["#ffffff", "#111827"];
}
function ud(e, t, n) {
  if (t === "" || t === "default" || t === "text") return n.text;
  if (t.startsWith("#")) return t;
  if (t === "palette" || /^palette:\d+$/.test(t)) {
    const i = sd(e), c = /^palette:(\d+)$/.exec(t), s = c ? Number(c[1]) : 1;
    return i[s] ?? n.text;
  }
  return t === "heading" ? n.heading : t === "accent" ? n.accent : t === "muted" ? n.muted : n.text;
}
const jo = {
  default: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
  "heading-6": { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
  "heading-5": { fontSize: 16, fontWeight: 600, lineHeight: 1.35 },
  "heading-4": { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 }
};
function hd(e, t, n, i) {
  const c = r(e, `${t}.priceTypographyPreset`), s = jo[c] ?? jo["heading-6"], l = r(e, `${t}.priceWidth`, "fill"), a = r(e, `${t}.priceAlignment`, "left"), d = r(e, `${t}.priceColor`, ""), h = ud(e, d, i);
  return {
    width: l === "fill" ? "100%" : "fit-content",
    textAlign: a === "center" ? "center" : a === "right" ? "right" : "left",
    fontFamily: n,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight,
    color: h,
    paddingTop: x(e, `${t}.pricePaddingTop`, 0),
    paddingBottom: x(e, `${t}.pricePaddingBottom`, 0),
    paddingLeft: x(e, `${t}.pricePaddingLeft`, 0),
    paddingRight: x(e, `${t}.pricePaddingRight`, 0),
    showSaleFirst: E(e, `${t}.priceShowSaleFirst`, !0),
    showInstallments: E(e, `${t}.priceInstallments`, !1),
    showTaxInfo: E(e, `${t}.priceTaxInfo`, !1)
  };
}
function pd(e, t, n, i) {
  const c = t != null && t > e && Number.isFinite(t);
  return n.showSaleFirst && c ? { primary: i(e), compareAt: i(t) } : c && !n.showSaleFirst ? { primary: i(t), compareAt: i(e) } : { primary: i(e) };
}
function md(e) {
  const n = e?.settings?.colors?.palette;
  return Array.isArray(n) && n.length >= 2 ? n.filter((i) => typeof i == "string" && i.trim().length > 0) : ["#ffffff", "#111827"];
}
function gd(e, t, n) {
  if (t === "" || t === "default") return n;
  if (t.startsWith("#")) return t;
  if (t === "palette" || /^palette:\d+$/.test(t)) {
    const i = md(e), c = /^palette:(\d+)$/.exec(t), s = c ? Number(c[1]) : 1;
    return i[s] ?? n;
  }
  return n;
}
const Bo = {
  default: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  "heading-1": { fontSize: 28, fontWeight: 700, lineHeight: 1.15 },
  "heading-2": { fontSize: 24, fontWeight: 600, lineHeight: 1.2 },
  "heading-3": { fontSize: 20, fontWeight: 600, lineHeight: 1.25 },
  "heading-4": { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 }
}, qo = {
  narrow: "280px",
  normal: "100%",
  wide: "100%",
  none: void 0
};
function fd(e, t, n, i) {
  const c = r(e, `${t}.productTitleTypographyPreset`, "default"), s = Bo[c] ?? Bo.default, l = r(e, `${t}.productTitleWidth`, "fill"), a = r(e, `${t}.productTitleMaxWidth`), d = r(e, `${t}.productTitleAlignment`, "left"), h = E(e, `${t}.productTitleBackgroundEnabled`, !1), u = r(e, `${t}.productTitleColor`, ""), p = gd(e, u, i), g = d === "center" ? "center" : d === "right" ? "right" : "left";
  return {
    width: l === "fill" ? "100%" : "fit-content",
    maxWidth: qo[a] ?? qo.normal,
    textAlign: g,
    fontFamily: n,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight,
    color: p,
    background: h ? "rgba(0,0,0,0.04)" : void 0,
    paddingTop: x(e, `${t}.productTitlePaddingTop`, 0),
    paddingBottom: x(e, `${t}.productTitlePaddingBottom`, 0),
    paddingLeft: x(e, `${t}.productTitlePaddingLeft`, 0),
    paddingRight: x(e, `${t}.productTitlePaddingRight`, 0),
    borderRadius: h ? 6 : 0,
    marginBottom: 0
  };
}
const bd = {
  "scheme-1": { background: "#ffffff", color: "#111827", muted: "#6b7280" },
  "scheme-2": { background: "#f8fafc", color: "#0f172a", muted: "#64748b" },
  "scheme-3": { background: "#fff7ed", color: "#431407", muted: "#9a3412" },
  "scheme-4": { background: "#f5f3ff", color: "#4c1d95", muted: "#6d28d9" }
};
function yd(e, t, n) {
  const i = r(e, `${t}.colorScheme`, "scheme-1");
  return bd[i] ?? n;
}
function xd(e, t) {
  return r(e, `${t}.sectionWidth`, "page") === "full" ? "full" : "page";
}
function $d(e, t) {
  return {
    paddingTop: x(e, `${t}.paddingTop`, 48),
    paddingBottom: x(e, `${t}.paddingBottom`, 48)
  };
}
function kd(e, t) {
  const n = x(e, `${t}.gap`, 24);
  return {
    horizontal: x(e, `${t}.horizontalGap`, n > 0 ? Math.min(n, 48) : 8),
    vertical: x(e, `${t}.verticalGap`, 24),
    section: x(e, `${t}.sectionGap`, 28)
  };
}
function vd(e, t) {
  const n = t.trim();
  if (!n) return "";
  const i = `[data-codiic-section="${e}"]`;
  return n.replace(/:root/g, i).replace(/&/g, i);
}
function Sd(e) {
  const t = e.trim().toLowerCase();
  return !t || t === "products" ? "" : t;
}
function wd({
  collectionHandle: e,
  limit: t
}) {
  const { storeFrontMeta: n } = De(), i = n?.storeId ?? "", c = Sd(e), { products: s, fetchProductsByStoreId: l } = lt(), { products: a, fetchProductsInCollectionByUrlHandle: d } = at();
  return le(() => {
    if (i) {
      if (c) {
        d(i, c, { page: 1, limit: t });
        return;
      }
      l({ storeId: i, page: 1, limit: t });
    }
  }, [
    i,
    c,
    t,
    l,
    d
  ]), M(() => (c ? a : s).slice(0, t), [c, a, s, t]);
}
function bt(e) {
  return /<(?:p|ol|ul|h[1-6]|div)\b/i.test(e);
}
function yt({ html: e, className: t = "", style: n }) {
  const i = e.trim();
  if (!i) return null;
  if (!bt(i) && !/<[a-z]/i.test(i))
    return /* @__PURE__ */ o("span", { className: t, style: n, children: i });
  const c = bt(i) ? "div" : "span";
  return /* @__PURE__ */ o(c, { className: t, style: n, dangerouslySetInnerHTML: { __html: i } });
}
function Xo({
  label: e,
  onClick: t,
  background: n,
  shape: i
}) {
  return /* @__PURE__ */ o("button", { type: "button", "aria-label": e, onClick: t, style: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: n === "none" ? 32 : 36,
    height: n === "none" ? 32 : 36,
    border: "none",
    cursor: "pointer",
    background: n === "circle" || n === "square" ? "rgba(255,255,255,0.95)" : "transparent",
    borderRadius: n === "circle" ? "50%" : n === "square" ? 6 : 0,
    boxShadow: n !== "none" ? "0 1px 4px rgba(0,0,0,0.12)" : void 0,
    color: "#111827",
    fontSize: i === "chevron" ? 18 : 20,
    lineHeight: 1
  }, children: i === "chevron" ? e === "Previous" ? "‹" : "›" : e === "Previous" ? "←" : "→" });
}
function xt({
  sectionId: e = "featured_collection",
  templateId: t = "index",
  placement: n = "template"
}) {
  const i = j(), c = Ke(null), s = n === "template" ? `templates.${t}.sections.${e}.settings` : `sections.${e}.settings`, l = n === "template" ? `templates.${t}.sections.${e}.blocks` : `sections.${e}.blocks`, a = `${l}.collection_header.settings`, d = `${l}.product_card.settings`, h = n === "template" ? `template:${t}:${e}` : `layout:${e}`, u = q(), { text: p, background: g, primary: k, fontHeading: y, fontBody: v } = u, b = r(i, `${s}.collectionHandle`, "products"), _ = wd({ collectionHandle: b, limit: f }), $ = M(() => {
    const Q = yd(i, s, {
      background: g,
      color: p,
      muted: "#6b7280"
    }), ae = kd(i, s), { paddingTop: Ue, paddingBottom: Ee } = $d(i, s), Re = r(i, `${s}.navIcon`, "arrows"), se = r(i, `${s}.navIconBackground`, "circle");
    return {
      scheme: Q,
      gaps: ae,
      paddingTop: Ue,
      paddingBottom: Ee,
      widthMode: xd(i, s),
      layoutType: r(i, `${s}.layoutType`, "grid"),
      carouselOnMobile: E(i, `${s}.carouselOnMobile`, !1),
      columns: Math.max(1, Math.min(6, x(i, `${s}.columns`, 4))),
      mobileColumns: Math.max(
        1,
        Math.min(2, Number(r(i, `${s}.mobileColumns`, "2")) || 2)
      ),
      limit: Math.max(1, x(i, `${s}.productsToShow`, 8)),
      customCss: r(i, `${s}.customCss`, ""),
      emptyMessage: r(i, `${s}.emptyMessage`),
      subtitle: r(i, `${s}.subtitle`, ""),
      title: r(i, `${l}.collection_header.settings.title`),
      viewAllLabel: r(i, `${l}.collection_header.settings.viewAllLabel`, ""),
      viewAllHref: r(i, `${l}.collection_header.settings.viewAllHref`),
      showMedia: E(i, `${l}.product_card.settings.showMedia`, !0),
      showTitle: E(i, `${l}.product_card.settings.showTitle`, !0),
      showPrice: E(i, `${l}.product_card.settings.showPrice`, !0),
      navIcon: Re === "none" || Re === "chevron" || Re === "arrows" ? Re : "arrows",
      navIconBackground: se === "none" || se === "circle" || se === "square" ? se : "circle"
    };
  }, [i, g, p, s, l]), {
    scheme: w,
    gaps: P,
    paddingTop: z,
    paddingBottom: L,
    widthMode: H,
    layoutType: W,
    carouselOnMobile: T,
    columns: C,
    mobileColumns: F,
    limit: f,
    customCss: U,
    emptyMessage: X,
    subtitle: O,
    title: Y,
    viewAllLabel: J,
    viewAllHref: I,
    showMedia: ce,
    showTitle: pe,
    showPrice: be,
    navIcon: ve,
    navIconBackground: Fe
  } = $, { color: ge, background: Ae } = w, ue = W === "carousel", Se = W === "editorial", je = W === "grid" && !ue && !Se, ye = C >= 4, We = ye ? 0.78 : C === 3 ? 0.9 : 1, xe = ye ? 8 : 12, Be = vd(e, U), qe = M(
    () => `
[data-codiic-section="${e}"] .fc-product-grid {
  display: flex;
  ${ue ? "flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;" : "flex-wrap: wrap;"}
  column-gap: ${P.horizontal}px;
  row-gap: ${P.vertical}px;
}
[data-codiic-section="${e}"] .fc-product-grid::-webkit-scrollbar { display: none; }
[data-codiic-section="${e}"] .fc-product-grid > article {
  ${ue ? `flex: 0 0 calc((100% - ${(C - 1) * P.horizontal}px) / ${C}); min-width: 0; max-width: calc((100% - ${(C - 1) * P.horizontal}px) / ${C}); scroll-snap-align: start;` : ye ? `flex: 0 0 min(calc((100% - ${(C - 1) * P.horizontal}px) / ${C}), 210px); max-width: min(calc((100% - ${(C - 1) * P.horizontal}px) / ${C}), 210px); min-width: 168px;` : `flex: 0 0 calc((100% - ${(C - 1) * P.horizontal}px) / ${C}); max-width: calc((100% - ${(C - 1) * P.horizontal}px) / ${C}); min-width: 220px;`}
}
[data-codiic-section="${e}"] .fc-editorial-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: ${P.horizontal}px;
  row-gap: ${P.section}px;
  align-items: start;
}
[data-codiic-section="${e}"] .fc-editorial-grid > article:nth-child(2) {
  margin-top: 3rem;
}
[data-codiic-section="${e}"] .fc-editorial-grid > article:nth-child(3) {
  margin-top: -1.25rem;
}
[data-codiic-section="${e}"] .fc-editorial-grid > article:nth-child(4) {
  margin-top: 2.5rem;
}
[data-codiic-section="${e}"] .fc-editorial-grid > article:nth-child(2) .fc-media-inner,
[data-codiic-section="${e}"] .fc-editorial-grid > article:nth-child(3) .fc-media-inner {
  aspect-ratio: 4 / 5;
  min-height: 200px;
}
@media (max-width: 749px) {
  [data-codiic-section="${e}"] .fc-product-grid {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  [data-codiic-section="${e}"][data-mobile-columns="1"] .fc-product-grid > article { flex: 0 0 calc(92% - 8px); max-width: calc(92% - 8px); scroll-snap-align: start; }
  [data-codiic-section="${e}"][data-mobile-columns="2"] .fc-product-grid > article { flex: 0 0 calc(50% - ${P.horizontal / 2}px); max-width: calc(50% - ${P.horizontal / 2}px); scroll-snap-align: start; }
  [data-codiic-section="${e}"][data-fc-mobile-carousel="true"] .fc-editorial-grid {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  [data-codiic-section="${e}"][data-fc-mobile-carousel="true"] .fc-editorial-grid > article {
    flex: 0 0 min(85%, 320px);
    margin-top: 0 !important;
    scroll-snap-align: start;
  }
  [data-codiic-section="${e}"][data-fc-mobile-carousel="true"] .fc-editorial-grid > article .fc-media-inner {
    aspect-ratio: 4 / 3;
    min-height: 140px;
  }
}
`,
    [
      ue,
      Se,
      ye,
      e,
      C,
      F,
      T,
      P.horizontal,
      P.vertical,
      P.section
    ]
  ), Xe = (Q) => {
    const ae = c.current;
    ae && ae.scrollBy({ left: ae.clientWidth * 0.85 * Q, behavior: "smooth" });
  }, A = ue && ve !== "none" && _.length > C, oe = H === "full" ? "100%" : R.maxWidth, ee = et(
    i,
    `${l}.collection_header.nested_block_order`,
    `${l}.collection_header.blocks`,
    ["collection_title", "view_all_button"]
  ), V = et(
    i,
    `${l}.product_card.nested_block_order`,
    `${l}.product_card.blocks`,
    ["media", "product_title", "price"]
  ), G = M(
    () => nd(i, a, w, R.line),
    [i, w, a]
  ), me = M(() => {
    const Q = r(i, `${a}.mobileWidth`, "fill"), ae = E(i, `${a}.verticalOnMobile`, !1);
    return id(e, Q, ae);
  }, [i, a, e]), ne = M(
    () => ad(
      i,
      a,
      { heading: y },
      { text: ge, heading: ge, accent: k }
    ),
    [i, y, v, ge, k, Ae]
  ), he = M(
    () => cd(i, d, w, R.line),
    [i, w]
  ), re = M(
    () => dd(i, d, R.line),
    [i]
  ), de = M(
    () => fd(i, d, y, ge),
    [i, y, ge]
  ), ie = M(
    () => hd(i, d, v, {
      text: ge,
      heading: ge,
      accent: k,
      muted: w.muted
    }),
    [i, v, ge, k, w.muted]
  ), ze = _e(i, t, e, [
    "collection_header",
    "product_card"
  ]), Ie = /* @__PURE__ */ o(
    N,
    {
      nodeId: `${h}:block:collection_header`,
      label: "Header",
      children: /* @__PURE__ */ m(
        "div",
        {
          "data-fc-collection-header": !0,
          style: {
            display: "flex",
            flexDirection: G.flexDirection,
            flexWrap: G.flexWrap,
            justifyContent: G.justifyContent,
            alignItems: G.alignItems,
            gap: G.gap,
            width: G.width,
            minHeight: G.minHeight,
            marginBottom: P.section,
            paddingTop: G.paddingTop,
            paddingBottom: G.paddingBottom,
            paddingLeft: G.paddingLeft,
            paddingRight: G.paddingRight,
            borderRadius: G.borderRadius,
            border: G.border,
            background: G.background,
            backgroundImage: G.backgroundImage,
            backgroundSize: G.backgroundImage ? "cover" : void 0,
            backgroundPosition: G.backgroundImage ? "center" : void 0,
            color: G.color,
            boxSizing: "border-box"
          },
          children: [
            ee.map((Q) => {
              if (Q === "collection_title") {
                const ae = bt(Y) ? "div" : "h2";
                return /* @__PURE__ */ o(
                  N,
                  {
                    nodeId: `${h}:block:collection_header:nested:collection_title`,
                    label: "Collection title",
                    style: {
                      flex: ne.flex,
                      minWidth: ne.flex ? 0 : void 0
                    },
                    children: /* @__PURE__ */ o(
                      S,
                      {
                        fieldPath: `${l}.collection_header.settings.title`,
                        nodeId: h,
                        label: "Text",
                        as: ae,
                        style: {
                          margin: 0,
                          width: ne.width,
                          maxWidth: ne.maxWidth,
                          textAlign: ne.textAlign,
                          color: ne.color,
                          background: ne.background,
                          paddingTop: ne.paddingTop,
                          paddingBottom: ne.paddingBottom,
                          paddingLeft: ne.paddingLeft,
                          paddingRight: ne.paddingRight,
                          borderRadius: ne.borderRadius,
                          boxSizing: "border-box"
                        },
                        children: /* @__PURE__ */ o(
                          yt,
                          {
                            html: Y,
                            style: {
                              fontFamily: ne.fontFamily,
                              fontSize: ne.fontSize,
                              fontWeight: ne.fontWeight,
                              lineHeight: ne.lineHeight,
                              color: ne.color
                            }
                          }
                        )
                      }
                    )
                  },
                  Q
                );
              }
              return Q === "view_all_button" && J.trim() ? /* @__PURE__ */ o(
                N,
                {
                  nodeId: `${h}:block:collection_header:nested:view_all_button`,
                  label: "View all button",
                  children: /* @__PURE__ */ o(
                    S,
                    {
                      fieldPath: `${l}.collection_header.settings.viewAllLabel`,
                      nodeId: h,
                      label: "Label",
                      children: /* @__PURE__ */ o(
                        D,
                        {
                          to: I,
                          style: { color: u.primary, fontWeight: 600, textDecoration: "none", fontSize: 14 },
                          children: J
                        }
                      )
                    }
                  )
                },
                Q
              ) : null;
            }),
            O ? /* @__PURE__ */ o("p", { style: { margin: 0, fontSize: 14, color: w.muted, maxWidth: 480 }, children: O }) : null
          ]
        }
      )
    }
  ), Pe = _.map((Q) => {
    const ae = Q.imageUrls?.[0], Ue = ce ? /* @__PURE__ */ o(N, { nodeId: `${h}:block:product_card:nested:media`, label: "Media", children: /* @__PURE__ */ o(
      "div",
      {
        style: {
          border: re.border,
          borderRadius: re.borderRadius,
          paddingTop: re.paddingTop,
          paddingBottom: re.paddingBottom,
          paddingLeft: re.paddingLeft,
          paddingRight: re.paddingRight,
          boxSizing: "border-box"
        },
        children: /* @__PURE__ */ o(
          "div",
          {
            className: "fc-media-inner",
            style: {
              width: "100%",
              aspectRatio: ye ? "1 / 1" : re.aspectRatio ?? "1 / 1",
              minHeight: ye ? 116 : re.aspectRatio ? void 0 : 140,
              maxHeight: ye ? 160 : 280,
              overflow: "hidden",
              borderRadius: re.borderRadius > 0 ? Math.max(
                0,
                re.borderRadius - Math.max(
                  re.paddingTop,
                  re.paddingBottom,
                  re.paddingLeft,
                  re.paddingRight
                )
              ) : 0,
              background: ae ? `center / cover no-repeat url(${ae})` : "linear-gradient(135deg, #f3f4f6, #e5e7eb)"
            }
          }
        )
      }
    ) }) : null, Ee = pe ? /* @__PURE__ */ o(N, { nodeId: `${h}:block:product_card:nested:product_title`, label: "Product title", children: /* @__PURE__ */ o(
      "h3",
      {
        style: {
          margin: 0,
          width: de.width,
          maxWidth: de.maxWidth,
          textAlign: de.textAlign,
          fontFamily: de.fontFamily,
          fontSize: Math.max(12, Math.round(de.fontSize * We)),
          fontWeight: de.fontWeight,
          lineHeight: de.lineHeight,
          color: de.color,
          background: de.background,
          paddingTop: de.paddingTop,
          paddingBottom: de.paddingBottom,
          paddingLeft: de.paddingLeft,
          paddingRight: de.paddingRight,
          borderRadius: de.borderRadius,
          boxSizing: "border-box"
        },
        children: Q.title
      }
    ) }) : null, Re = be ? /* @__PURE__ */ o(N, { nodeId: `${h}:block:product_card:nested:price`, label: "Price", children: /* @__PURE__ */ m(
      "div",
      {
        style: {
          margin: 0,
          width: ie.width,
          textAlign: ie.textAlign,
          paddingTop: ie.paddingTop,
          paddingBottom: ie.paddingBottom,
          paddingLeft: ie.paddingLeft,
          paddingRight: ie.paddingRight,
          boxSizing: "border-box"
        },
        children: [
          /* @__PURE__ */ o(
            "p",
            {
              style: {
                margin: 0,
                fontFamily: ie.fontFamily,
                fontSize: Math.max(11, Math.round(ie.fontSize * We)),
                fontWeight: ie.fontWeight,
                lineHeight: ie.lineHeight,
                color: ie.color
              },
              children: (() => {
                const se = pd(
                  Q.price,
                  Q.compareAtPrice,
                  ie,
                  Ge
                );
                return /* @__PURE__ */ m(Z, { children: [
                  /* @__PURE__ */ o("span", { children: se.primary }),
                  se.compareAt ? /* @__PURE__ */ o(
                    "span",
                    {
                      style: {
                        marginLeft: 8,
                        fontSize: ie.fontSize * 0.85,
                        fontWeight: 400,
                        color: w.muted,
                        textDecoration: "line-through"
                      },
                      children: se.compareAt
                    }
                  ) : null
                ] });
              })()
            }
          ),
          ie.showInstallments ? /* @__PURE__ */ o("p", { style: { margin: "4px 0 0", fontSize: 12, color: w.muted }, children: "Pay in installments" }) : null,
          ie.showTaxInfo ? /* @__PURE__ */ o("p", { style: { margin: "2px 0 0", fontSize: 11, color: w.muted }, children: "Tax included" }) : null
        ]
      }
    ) }) : null;
    return /* @__PURE__ */ o(
      D,
      {
        to: productPath(Q.urlHandle ?? Q._id),
        style: { textDecoration: "none", color: "inherit" },
        children: /* @__PURE__ */ o(
          "article",
          {
            style: {
              border: he.border === "none" ? `1px solid ${R.line}` : he.border,
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
            children: V.map((se) => se === "media" ? /* @__PURE__ */ o("div", { children: Ue }, se) : se === "product_title" ? /* @__PURE__ */ o(
              "div",
              {
                style: {
                  padding: `${xe}px ${xe}px 0`
                },
                children: Ee
              },
              se
            ) : se === "price" ? /* @__PURE__ */ o(
              "div",
              {
                style: {
                  padding: `0 ${xe}px ${xe}px`
                },
                children: Re
              },
              se
            ) : null)
          }
        )
      },
      Q._id
    );
  }), Le = Se ? /* @__PURE__ */ o(
    "div",
    {
      ref: T ? c : void 0,
      className: "fc-editorial-grid",
      "data-fc-mobile-carousel": T ? "true" : "false",
      children: Pe
    }
  ) : ue ? /* @__PURE__ */ m(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      },
      children: [
        A ? /* @__PURE__ */ o(
          Xo,
          {
            label: "Previous",
            onClick: () => Xe(-1),
            background: Fe,
            shape: ve === "chevron" ? "chevron" : "arrows"
          }
        ) : null,
        /* @__PURE__ */ o("div", { ref: c, className: "fc-product-grid", style: { flex: 1, minWidth: 0 }, children: Pe }),
        A ? /* @__PURE__ */ o(
          Xo,
          {
            label: "Next",
            onClick: () => Xe(1),
            background: Fe,
            shape: ve === "chevron" ? "chevron" : "arrows"
          }
        ) : null
      ]
    }
  ) : /* @__PURE__ */ o(
    "div",
    {
      ref: T ? c : void 0,
      className: "fc-product-grid",
      "data-mobile-columns": F,
      children: Pe
    }
  ), Ne = /* @__PURE__ */ o(N, { nodeId: `${h}:block:product_card`, label: "Product card", children: _.length === 0 ? /* @__PURE__ */ o("p", { style: { color: w.muted, fontSize: 14 }, children: X }) : Le }), Ye = {
    collection_header: Ie,
    product_card: Ne
  };
  return /* @__PURE__ */ m(Z, { children: [
    Be ? /* @__PURE__ */ o("style", { children: Be }) : null,
    /* @__PURE__ */ o("style", { children: qe }),
    me ? /* @__PURE__ */ o("style", { children: me }) : null,
    /* @__PURE__ */ o(
      B,
      {
        nodeId: h,
        label: je ? "Featured collection: Grid" : Se ? "Featured collection: Editorial" : ue ? "Featured collection: Carousel" : "Featured collection",
        "data-codiic-section": e,
        "data-mobile-columns": F,
        "data-fc-mobile-carousel": Se && T ? "true" : "false",
        style: {
          padding: `${z}px ${R.padX}px ${L}px`,
          fontFamily: v,
          color: ge,
          background: Ae
        },
        children: /* @__PURE__ */ o("div", { style: { maxWidth: oe, margin: "0 auto" }, children: ze.map((Q) => {
          const ae = Ye[Q];
          return ae ? /* @__PURE__ */ o("div", { children: ae }, Q) : null;
        }) })
      }
    )
  ] });
}
function Cd() {
  const { collections: e, loading: t } = at(), { text: n, muted: i, fontHeading: c, fontBody: s } = q(), l = e.filter(
    (a) => a.urlHandle?.trim() && a.urlHandle.trim().toLowerCase() !== "all"
  );
  return /* @__PURE__ */ o(
    "section",
    {
      className: "hz-collections-index",
      style: {
        padding: `clamp(48px, 8vw, 96px) ${R.padX}px`,
        fontFamily: s,
        color: n
      },
      children: /* @__PURE__ */ m("div", { style: { maxWidth: R.maxWidth, margin: "0 auto" }, children: [
        /* @__PURE__ */ m("header", { className: "hz-reveal", style: { marginBottom: "clamp(32px, 5vw, 56px)" }, children: [
          /* @__PURE__ */ o(
            "p",
            {
              className: "hz-eyebrow",
              style: { margin: "0 0 12px", color: i, letterSpacing: "0.22em", fontSize: 11 },
              children: "Explore"
            }
          ),
          /* @__PURE__ */ o(
            "h1",
            {
              style: {
                margin: 0,
                fontFamily: c,
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.03em"
              },
              children: "Collections"
            }
          ),
          /* @__PURE__ */ o("p", { style: { margin: "16px 0 0", maxWidth: 480, color: i, lineHeight: 1.7, fontSize: 15 }, children: "Curated edits, thoughtfully grouped. Choose a world to step into." })
        ] }),
        t && l.length === 0 ? /* @__PURE__ */ o("p", { style: { color: i, fontSize: 14 }, children: "Loading collections…" }) : null,
        !t && l.length === 0 ? /* @__PURE__ */ o("p", { style: { color: i, fontSize: 14 }, children: "No collections yet." }) : null,
        /* @__PURE__ */ m(
          "div",
          {
            className: "hz-collections-grid",
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "clamp(16px, 2.5vw, 28px)"
            },
            children: [
              /* @__PURE__ */ m(D, { to: dt.allProducts, className: "hz-collection-card hz-reveal", children: [
                /* @__PURE__ */ o("div", { className: "hz-collection-card__media hz-collection-card__media--all" }),
                /* @__PURE__ */ m("div", { className: "hz-collection-card__body", children: [
                  /* @__PURE__ */ o("span", { className: "hz-collection-card__label", children: "Everything" }),
                  /* @__PURE__ */ o("span", { className: "hz-collection-card__title", children: "All products" })
                ] })
              ] }),
              l.map((a, d) => {
                const h = a.urlHandle?.trim() ?? "", u = Sn(h), p = a.imageUrl?.trim();
                return /* @__PURE__ */ m(
                  D,
                  {
                    to: u,
                    className: "hz-collection-card hz-reveal",
                    style: { animationDelay: `${Math.min(d, 8) * 60}ms` },
                    children: [
                      /* @__PURE__ */ o(
                        "div",
                        {
                          className: "hz-collection-card__media",
                          style: p ? { backgroundImage: `url(${p})` } : { background: "linear-gradient(145deg, var(--hz-surface), var(--hz-surface-2))" }
                        }
                      ),
                      /* @__PURE__ */ m("div", { className: "hz-collection-card__body", children: [
                        /* @__PURE__ */ o("span", { className: "hz-collection-card__label", children: "Collection" }),
                        /* @__PURE__ */ o("span", { className: "hz-collection-card__title", children: a.title?.trim() || "Untitled" })
                      ] })
                    ]
                  },
                  a._id
                );
              })
            ]
          }
        )
      ] })
    }
  );
}
function _d(e) {
  const t = e.variants, n = Array.isArray(t) && t.length ? t[0] : null, i = typeof n?.price == "number" ? n.price : typeof e.price == "number" ? e.price : 0, c = typeof n?.compareAtPrice == "number" ? n.compareAtPrice : null, s = typeof n?.quantity == "number" ? n.quantity : null, l = Array.isArray(e.imageUrls) && e.imageUrls[0] || (typeof e.imageUrl == "string" ? e.imageUrl : "") || "";
  return {
    id: e._id,
    urlHandle: e.urlHandle?.trim() || e._id,
    title: e.title?.trim() || "Product title",
    price: i,
    compareAtPrice: c,
    imageUrl: l,
    soldOut: s !== null ? s <= 0 : !1
  };
}
function _n() {
  const { activeCollection: e, products: t, loading: n } = at(), i = t.map(_d);
  return {
    collection: e,
    products: i,
    loading: n,
    itemCount: i.length
  };
}
function Wd({
  sectionId: e = "collection_heading",
  templateId: t = "collection"
}) {
  const n = j(), { text: i, background: c, fontHeading: s, fontBody: l } = q(), { collection: a } = _n(), d = `templates.${t}.sections.${e}`, h = r(n, `${d}.blocks.title.settings.text`, ""), u = r(n, `${d}.blocks.description.settings.text`, ""), p = a?.title?.trim() || h || "Collection title", g = a?.description?.trim() || u;
  return /* @__PURE__ */ o(
    B,
    {
      sectionId: e,
      editorNodeId: `template:${t}:${e}`,
      label: "Collection heading",
      style: {
        background: c,
        color: i,
        fontFamily: l,
        padding: `32px ${R.padX}px 8px`
      },
      children: /* @__PURE__ */ m("div", { style: { maxWidth: R.maxWidth, margin: "0 auto" }, children: [
        /* @__PURE__ */ o(N, { nodeId: `template:${t}:${e}:block:title`, label: "Title", children: /* @__PURE__ */ o(
          "h1",
          {
            style: {
              margin: 0,
              fontFamily: s,
              fontSize: "2.25rem",
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.02em"
            },
            children: /* @__PURE__ */ o(S, { fieldPath: `${d}.blocks.title.settings.text`, label: "Title", children: /* @__PURE__ */ o(yt, { html: p }) })
          }
        ) }),
        g ? /* @__PURE__ */ o(N, { nodeId: `template:${t}:${e}:block:description`, label: "Description", children: /* @__PURE__ */ o("div", { style: { marginTop: 12, fontSize: "1rem", lineHeight: 1.55, opacity: 0.82 }, children: /* @__PURE__ */ o(yt, { html: g }) }) }) : null
      ] })
    }
  );
}
function pt({ label: e }) {
  return /* @__PURE__ */ m("span", { className: "hz-chip", role: "presentation", children: [
    e,
    /* @__PURE__ */ o("span", { style: { opacity: 0.45, fontSize: 10 }, children: "▾" })
  ] });
}
function zd({
  templateId: e,
  sectionId: t,
  title: n,
  price: i,
  imageUrl: c,
  soldOut: s,
  href: l
}) {
  const { text: a, muted: d } = q();
  return /* @__PURE__ */ o(D, { to: l, className: "hz-product-card", children: /* @__PURE__ */ m("article", { children: [
    /* @__PURE__ */ o(N, { nodeId: `template:${e}:${t}:block:product_card:nested:media`, label: "Media", children: /* @__PURE__ */ m("div", { className: "hz-product-card__media", style: { position: "relative" }, children: [
      c ? /* @__PURE__ */ o("img", { src: c, alt: "" }) : /* @__PURE__ */ o("div", { style: { aspectRatio: "4 / 5", background: "var(--hz-surface)" } }),
      s ? /* @__PURE__ */ o(
        "span",
        {
          style: {
            position: "absolute",
            top: 12,
            left: 12,
            background: "var(--hz-bg)",
            color: "var(--hz-muted)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "6px 10px"
          },
          children: "Sold out"
        }
      ) : null
    ] }) }),
    /* @__PURE__ */ m("div", { children: [
      /* @__PURE__ */ o(
        N,
        {
          nodeId: `template:${e}:${t}:block:product_card:nested:product_title`,
          label: "Product title",
          children: /* @__PURE__ */ o("div", { className: "hz-product-card__title", children: n })
        }
      ),
      /* @__PURE__ */ o(N, { nodeId: `template:${e}:${t}:block:product_card:nested:price`, label: "Price", children: /* @__PURE__ */ o("div", { className: "hz-product-card__price", children: Ge(i) }) })
    ] })
  ] }) });
}
function Pd({
  sectionId: e = "main_collection",
  templateId: t = "collection"
}) {
  const n = j(), { text: i, background: c, fontBody: s } = q(), { products: l, itemCount: a, loading: d } = _n(), h = `templates.${t}.sections.${e}`, u = x(n, `${h}.settings.columns`, 4), p = x(n, `${h}.settings.mobileColumns`, 2), g = x(n, `${h}.settings.horizontalGap`, 12), k = x(n, `${h}.settings.verticalGap`, 24), y = E(
    n,
    `${h}.blocks.filtering_and_sorting.settings.enableFiltering`,
    !0
  ), v = E(
    n,
    `${h}.blocks.filtering_and_sorting.settings.enableSorting`,
    !0
  ), b = M(
    () => ({
      display: "grid",
      gridTemplateColumns: `repeat(${Math.max(1, u)}, minmax(0, 1fr))`,
      gap: `${k}px ${g}px`
    }),
    [u, g, k]
  ), _ = l.length ? l : d ? [] : [
    { id: "p1", urlHandle: "p1", title: "Product title", price: 0, imageUrl: "", soldOut: !1 },
    { id: "p2", urlHandle: "p2", title: "Product title", price: 0, imageUrl: "", soldOut: !0 }
  ];
  return /* @__PURE__ */ o(
    B,
    {
      sectionId: e,
      editorNodeId: `template:${t}:${e}`,
      label: "Main collection",
      style: {
        background: c,
        color: i,
        fontFamily: s,
        padding: `8px ${R.padX}px 48px`
      },
      children: /* @__PURE__ */ m("div", { style: { maxWidth: R.maxWidth, margin: "0 auto" }, children: [
        (y || v) && /* @__PURE__ */ o(N, { nodeId: `template:${t}:${e}:block:filtering_and_sorting`, label: "Filters", children: /* @__PURE__ */ m("div", { className: "hz-collection-toolbar", children: [
          /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: y ? /* @__PURE__ */ m(Z, { children: [
            /* @__PURE__ */ o(pt, { label: "Availability" }),
            /* @__PURE__ */ o(pt, { label: "Price" })
          ] }) : null }),
          /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 16 }, children: [
            /* @__PURE__ */ m("span", { style: { fontSize: 14, opacity: 0.75 }, children: [
              a,
              " ",
              a === 1 ? "item" : "items"
            ] }),
            v ? /* @__PURE__ */ o(pt, { label: "Sort" }) : null
          ] })
        ] }) }),
        /* @__PURE__ */ o("div", { style: b, "data-mobile-columns": p, children: _.map(($) => /* @__PURE__ */ o(
          zd,
          {
            templateId: t,
            sectionId: e,
            title: $.title,
            price: $.price,
            imageUrl: $.imageUrl,
            soldOut: $.soldOut,
            href: vn($.urlHandle)
          },
          $.id
        )) })
      ] })
    }
  );
}
const Wn = {
  hero_main: St,
  featured_collection: xt,
  divider: ed,
  contact_form: tn,
  email_signup: on,
  custom_section: Ml,
  product_highlight: an,
  editorial: dn,
  editorial_jumbo: cn,
  image_compare: sn,
  image_with_text: un,
  storytelling_logo: yn,
  storytelling_video: xn,
  faq_section: hn,
  icons_with_text: pn,
  multicolumn_section: mn,
  pull_quote_section: gn,
  rich_text_section: fn,
  text_marquee_section: bn,
  blog_posts_carousel: Gl,
  blog_posts_editorial: Bl,
  blog_posts_grid: Il,
  storytelling_carousel: Zl,
  product_hotspots: ia,
  recommended_products: ca,
  collection_links_spotlight: Wo,
  collection_links_text: Wo,
  collection_list_bento: za,
  collection_list_carousel: Ta,
  collection_list_editorial: Fa,
  collection_list_grid: Ea,
  layered_slideshow: ja,
  slideshow_full_frame: Va,
  slideshow_inset: Ja
}, zn = {
  collection_heading: Wd,
  main_collection: Pd
}, Hd = ["hero_main", "featured_collection"], Td = ["collection_heading", "main_collection"];
function Ld(e, t) {
  return t === "collection" ? e.startsWith("collection_heading") ? "collection_heading" : e.startsWith("main_collection") ? "main_collection" : zn[e] ? e : null : e.startsWith("divider") ? "divider" : e.startsWith("contact_form") ? "contact_form" : e.startsWith("email_signup") ? "email_signup" : e.startsWith("custom_section") ? "custom_section" : e.startsWith("product_highlight") ? "product_highlight" : e.startsWith("storytelling_video") ? "storytelling_video" : e.startsWith("faq_section") ? "faq_section" : e.startsWith("icons_with_text") ? "icons_with_text" : e.startsWith("multicolumn_section") ? "multicolumn_section" : e.startsWith("pull_quote_section") ? "pull_quote_section" : e.startsWith("rich_text_section") ? "rich_text_section" : e.startsWith("text_marquee_section") ? "text_marquee_section" : e.startsWith("blog_posts_carousel") ? "blog_posts_carousel" : e.startsWith("blog_posts_editorial") ? "blog_posts_editorial" : e.startsWith("blog_posts_grid") ? "blog_posts_grid" : e.startsWith("storytelling_carousel") ? "storytelling_carousel" : e.startsWith("product_hotspots") ? "product_hotspots" : e.startsWith("recommended_products") ? "recommended_products" : e.startsWith("collection_links_spotlight") ? "collection_links_spotlight" : e.startsWith("collection_links_text") ? "collection_links_text" : e.startsWith("collection_list_bento") ? "collection_list_bento" : e.startsWith("collection_list_carousel") ? "collection_list_carousel" : e.startsWith("collection_list_editorial") ? "collection_list_editorial" : e.startsWith("collection_list_grid") ? "collection_list_grid" : e.startsWith("layered_slideshow") ? "layered_slideshow" : e.startsWith("slideshow_full_frame") ? "slideshow_full_frame" : e.startsWith("slideshow_inset") ? "slideshow_inset" : e.startsWith("storytelling_logo") ? "storytelling_logo" : e.startsWith("image_with_text") ? "image_with_text" : e.startsWith("image_compare") ? "image_compare" : e.startsWith("editorial_jumbo") ? "editorial_jumbo" : e.startsWith("editorial") ? "editorial" : e.startsWith("featured_collection") ? "featured_collection" : e.startsWith("hero_main") ? "hero_main" : Wn[e] ? e : null;
}
function Rd({ templateId: e }) {
  const t = j(), n = e === "collection" ? Td : Hd, i = e === "collection" ? zn : Wn, c = $i(t, e, n);
  return /* @__PURE__ */ o(Z, { children: c.map((s) => {
    if (!ci(t, e, s)) return null;
    const l = Ld(s, e);
    if (!l) return null;
    const a = i[l];
    return a ? /* @__PURE__ */ o(a, { sectionId: s, templateId: e }, s) : null;
  }) });
}
function Md() {
  const { pathname: e } = Io();
  if (e === "/collections")
    return /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o(Cd, {}) });
  const t = e === "/collections/all" || e.startsWith("/collection/") || e.startsWith("/collections/") && e !== "/collections" ? "collection" : "index";
  return /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o(Rd, { templateId: t }) });
}
function Fd() {
  const { fontHeading: e, fontBody: t, text: n, muted: i } = q();
  return /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o("section", { style: { padding: `72px ${R.padX}px`, fontFamily: t, color: n }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 420, margin: "0 auto" }, className: "hz-reveal", children: [
    /* @__PURE__ */ o("h1", { style: { fontFamily: e, fontSize: "2.5rem", fontWeight: 400, margin: "0 0 12px" }, children: "Sign in" }),
    /* @__PURE__ */ o("p", { style: { color: i, marginBottom: 32, lineHeight: 1.7 }, children: "Welcome back. Sign in to access your orders and saved details." }),
    /* @__PURE__ */ o(D, { to: "/auth/signup", className: "hz-btn hz-btn--ghost", style: { display: "inline-flex" }, children: "Create account" })
  ] }) }) });
}
function Ad() {
  const { fontHeading: e, fontBody: t, text: n, muted: i } = q();
  return /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o("section", { style: { padding: `72px ${R.padX}px`, fontFamily: t, color: n }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 640, margin: "0 auto" }, className: "hz-reveal", children: [
    /* @__PURE__ */ o("p", { className: "hz-eyebrow", style: { color: i, margin: "0 0 12px" }, children: "Account" }),
    /* @__PURE__ */ o("h1", { style: { fontFamily: e, fontSize: "2.5rem", fontWeight: 400, margin: "0 0 16px" }, children: "Orders" }),
    /* @__PURE__ */ o("p", { style: { color: i, lineHeight: 1.7, marginBottom: 24 }, children: "Your order history will appear here." }),
    /* @__PURE__ */ o(D, { to: "/collections/all", className: "hz-btn hz-btn--primary", children: "Continue shopping" })
  ] }) }) });
}
const fe = "templates.preferences.sections.preferences_main";
function Nd() {
  const e = j(), t = kt(), { user: n, checkAuth: i, updateUser: c, loading: s } = tt(), { text: l, primary: a, fontHeading: d, fontBody: h } = q(), [u, p] = te("en"), [g, k] = te(!1), [y, v] = te(!1), b = n ?? (t ? Ve : null), _ = r(e, `${fe}.settings.title`), $ = r(e, `${fe}.settings.subtitle`, ""), w = r(e, `${fe}.blocks.signed_out.settings.message`), P = r(e, `${fe}.blocks.marketing_options.blocks.email_marketing.settings.label`), z = r(e, `${fe}.blocks.marketing_options.blocks.sms_marketing.settings.label`), L = r(e, `${fe}.blocks.marketing_options.blocks.language_field.settings.label`), H = r(e, `${fe}.blocks.save_button.settings.label`), W = r(e, `${fe}.blocks.save_button.settings.savingLabel`);
  le(() => {
    t || i();
  }, [i, t]), le(() => {
    b && (p(b.language || "en"), k(!!b.agreedToMarketingEmails), v(!!b.agreedToSmsMarketing));
  }, [b]);
  const T = async (C) => {
    C.preventDefault(), !(t || !n?._id) && await c(n._id, { language: u, agreedToMarketingEmails: g, agreedToSmsMarketing: y });
  };
  return b ? /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o(B, { sectionId: "preferences_main", label: "Preferences", style: { padding: `48px ${R.padX}px 80px`, fontFamily: h, color: l }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 520, margin: "0 auto", border: `1px solid ${R.line}`, borderRadius: 12, padding: 40 }, children: [
    /* @__PURE__ */ o(S, { fieldPath: `${fe}.settings.title`, label: "Heading", as: "h1", style: { fontFamily: d, fontSize: 28, marginTop: 0 }, children: _ }),
    $ ? /* @__PURE__ */ o(S, { fieldPath: `${fe}.settings.subtitle`, label: "Subtext", as: "p", style: { lineHeight: 1.6, opacity: 0.85, margin: "12px 0 24px" }, children: $ }) : null,
    /* @__PURE__ */ m("form", { onSubmit: (C) => {
      T(C);
    }, style: { display: "grid", gap: 16 }, children: [
      /* @__PURE__ */ m(N, { nodeId: "template:preferences:preferences_main:block:marketing_options", label: "Marketing", children: [
        /* @__PURE__ */ m("label", { style: { display: "grid", gap: 8 }, children: [
          /* @__PURE__ */ o(S, { fieldPath: `${fe}.blocks.marketing_options.blocks.language_field.settings.label`, label: "Field label", as: "span", children: L }),
          /* @__PURE__ */ m(
            "select",
            {
              value: u,
              onChange: (C) => p(C.target.value),
              disabled: t,
              style: { ...vt, cursor: t ? "default" : "pointer" },
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
              onChange: (C) => k(C.target.checked),
              disabled: t
            }
          ),
          /* @__PURE__ */ o(S, { fieldPath: `${fe}.blocks.marketing_options.blocks.email_marketing.settings.label`, label: "Checkbox label", as: "span", children: P })
        ] }),
        /* @__PURE__ */ m("label", { style: { display: "flex", gap: 10, alignItems: "center" }, children: [
          /* @__PURE__ */ o(
            "input",
            {
              type: "checkbox",
              checked: y,
              onChange: (C) => v(C.target.checked),
              disabled: t
            }
          ),
          /* @__PURE__ */ o(S, { fieldPath: `${fe}.blocks.marketing_options.blocks.sms_marketing.settings.label`, label: "Checkbox label", as: "span", children: z })
        ] })
      ] }),
      /* @__PURE__ */ o(N, { nodeId: "template:preferences:preferences_main:block:save_button", label: "Save button", children: /* @__PURE__ */ o("button", { type: "submit", disabled: !t && s, style: { background: a, color: "#fff", border: "none", padding: "14px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, width: "100%" }, children: !t && s ? W : H }) })
    ] })
  ] }) }) }) : /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o(B, { sectionId: "preferences_main", label: "Preferences", style: { padding: `48px ${R.padX}px`, fontFamily: h, color: l }, children: /* @__PURE__ */ o(N, { nodeId: "template:preferences:preferences_main:block:signed_out", label: "Signed out", children: /* @__PURE__ */ o(S, { fieldPath: `${fe}.blocks.signed_out.settings.message`, label: "Message", as: "p", children: w }) }) }) });
}
const He = "templates.product.sections.product_main";
function Ed() {
  const { urlHandle: e } = On(), t = j(), { text: n, background: i, primary: c, muted: s, fontHeading: l, fontBody: a } = q(), { storeFrontMeta: d } = De(), { productDetail: h, fetchProductForRoute: u } = lt(), { variants: p, fetchVariantsByProductId: g } = Un(), { createCartEntry: k } = $t(), [y, v] = te(!1), [b, _] = te(1), [$, w] = te(null), P = E(t, `${He}.blocks.product_media.settings.showImage`, !0), z = E(t, `${He}.blocks.product_header.blocks.vendor_line.settings.showVendor`, !0), L = r(t, `${He}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`), H = r(t, `${He}.blocks.product_header.blocks.product_title.settings.loadingLabel`), W = E(t, `${He}.blocks.product_content.blocks.description.settings.showDescription`, !0), T = r(t, `${He}.blocks.product_content.blocks.price_line.settings.priceFallback`, "—"), C = r(t, `${He}.blocks.buy_box.blocks.add_to_cart_button.settings.label`), F = r(t, `${He}.blocks.buy_box.blocks.add_to_cart_button.settings.addingLabel`);
  le(() => {
    !e || !d?.storeId || u(d.storeId, e);
  }, [u, d?.storeId, e]), le(() => {
    h?._id && g(h._id);
  }, [g, h?._id]);
  const f = M(() => $ ? p.find((O) => O._id === $) ?? null : p[0] ?? h?.variantDetails?.[0] ?? null, [h?.variantDetails, $, p]);
  le(() => {
    p.length && !$ && w(p[0]._id);
  }, [p, $]);
  const U = async () => {
    if (!(!d?.storeId || !f))
      try {
        v(!0), await k(
          { storeId: d.storeId, productVariantId: f._id, quantity: b },
          f
        );
      } finally {
        v(!1);
      }
  };
  if (!e) return null;
  const X = h?.imageUrls?.[0];
  return /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o(
    B,
    {
      sectionId: "product_main",
      label: "Product details",
      style: { padding: `clamp(40px, 6vw, 72px) ${R.padX}px` },
      children: /* @__PURE__ */ m(
        "div",
        {
          className: "hz-product__grid",
          style: {
            maxWidth: R.maxWidth,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(32px, 5vw, 64px)",
            fontFamily: a,
            color: n,
            alignItems: "start"
          },
          children: [
            /* @__PURE__ */ o(N, { nodeId: "template:product:product_main:block:product_media", label: "Media", children: P ? /* @__PURE__ */ o(
              "div",
              {
                className: "hz-product__media",
                style: {
                  aspectRatio: "4 / 5",
                  borderRadius: 2,
                  background: X ? `center/cover url(${X}) no-repeat` : "linear-gradient(160deg, var(--hz-surface), var(--hz-surface-2))"
                }
              }
            ) : null }),
            /* @__PURE__ */ m("div", { className: "hz-product__details hz-reveal", children: [
              /* @__PURE__ */ m(N, { nodeId: "template:product:product_main:block:product_header", label: "Header", children: [
                z && h?.vendor?.name ? /* @__PURE__ */ o(N, { nodeId: "template:product:product_main:block:product_header:block:vendor_line", label: "Vendor", children: /* @__PURE__ */ m("p", { className: "hz-eyebrow", style: { margin: "0 0 12px", color: s }, children: [
                  /* @__PURE__ */ o(
                    S,
                    {
                      fieldPath: `${He}.blocks.product_header.blocks.vendor_line.settings.vendorPrefix`,
                      label: "Vendor prefix",
                      as: "span",
                      children: L
                    }
                  ),
                  " ",
                  h.vendor.name
                ] }) }) : null,
                /* @__PURE__ */ o(N, { nodeId: "template:product:product_main:block:product_header:block:product_title", label: "Product title", children: /* @__PURE__ */ o(
                  "h1",
                  {
                    style: {
                      fontFamily: l,
                      fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                      margin: "0 0 20px",
                      fontWeight: 400,
                      lineHeight: 1.1,
                      letterSpacing: "-0.03em"
                    },
                    children: h?.title ?? /* @__PURE__ */ o(
                      S,
                      {
                        fieldPath: `${He}.blocks.product_header.blocks.product_title.settings.loadingLabel`,
                        label: "Loading label",
                        children: H
                      }
                    )
                  }
                ) })
              ] }),
              /* @__PURE__ */ m(N, { nodeId: "template:product:product_main:block:product_content", label: "Content", children: [
                W ? /* @__PURE__ */ o(N, { nodeId: "template:product:product_main:block:product_content:block:description", label: "Description", children: /* @__PURE__ */ o("p", { style: { lineHeight: 1.8, color: s, marginBottom: 28, fontSize: 15 }, children: h?.description }) }) : null,
                /* @__PURE__ */ o(N, { nodeId: "template:product:product_main:block:product_content:block:price_line", label: "Price", children: /* @__PURE__ */ o("p", { style: { fontSize: "1.35rem", fontWeight: 500, marginBottom: 28, letterSpacing: "-0.02em" }, children: f ? Ge(f.price) : h ? Ge(h.price) : T }) })
              ] }),
              /* @__PURE__ */ m(N, { nodeId: "template:product:product_main:block:buy_box", label: "Buy box", children: [
                p.length > 1 ? /* @__PURE__ */ m("label", { style: { display: "block", marginBottom: 18 }, children: [
                  /* @__PURE__ */ o("span", { style: { display: "block", fontSize: 12, marginBottom: 8, color: s, letterSpacing: "0.08em", textTransform: "uppercase" }, children: "Variant" }),
                  /* @__PURE__ */ o(
                    "select",
                    {
                      value: f?._id ?? "",
                      onChange: (O) => w(O.target.value),
                      className: "hz-input",
                      style: { width: "100%", maxWidth: 300 },
                      children: p.map((O) => /* @__PURE__ */ o("option", { value: O._id, children: O.sku || O._id }, O._id))
                    }
                  )
                ] }) : null,
                /* @__PURE__ */ m("label", { style: { display: "block", marginBottom: 24 }, children: [
                  /* @__PURE__ */ o("span", { style: { display: "block", fontSize: 12, marginBottom: 8, color: s, letterSpacing: "0.08em", textTransform: "uppercase" }, children: "Quantity" }),
                  /* @__PURE__ */ o(
                    "input",
                    {
                      type: "number",
                      min: 1,
                      value: b,
                      onChange: (O) => _(Math.max(1, Number(O.target.value) || 1)),
                      className: "hz-input",
                      style: { width: 96 }
                    }
                  )
                ] }),
                /* @__PURE__ */ o(
                  N,
                  {
                    nodeId: "template:product:product_main:block:buy_box:block:add_to_cart_button",
                    label: "Add to cart button",
                    children: /* @__PURE__ */ o(
                      "button",
                      {
                        type: "button",
                        disabled: y || !f,
                        onClick: () => {
                          U();
                        },
                        className: "hz-btn hz-btn--primary",
                        style: { fontFamily: a },
                        children: /* @__PURE__ */ o(
                          S,
                          {
                            fieldPath: `${He}.blocks.buy_box.blocks.add_to_cart_button.settings.label`,
                            label: "Button label",
                            as: "span",
                            children: y ? F : C
                          }
                        )
                      }
                    )
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  ) });
}
function Ud() {
  const { user: e } = tt(), { fontHeading: t, fontBody: n, text: i, muted: c } = q();
  return /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o("section", { style: { padding: `72px ${R.padX}px`, fontFamily: n, color: i }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 520, margin: "0 auto" }, className: "hz-reveal", children: [
    /* @__PURE__ */ o("p", { className: "hz-eyebrow", style: { color: c, margin: "0 0 12px" }, children: "Account" }),
    /* @__PURE__ */ o("h1", { style: { fontFamily: t, fontSize: "2.5rem", fontWeight: 400, margin: "0 0 24px" }, children: e?.name?.trim() || e?.email || "Your profile" }),
    /* @__PURE__ */ m("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ o(D, { to: "/my-orders", className: "hz-btn hz-btn--primary", children: "Orders" }),
      /* @__PURE__ */ o(D, { to: "/preferences", className: "hz-btn hz-btn--ghost", children: "Preferences" })
    ] })
  ] }) }) });
}
const $e = "templates.forgot_password.sections.forgot_main";
function Od() {
  const e = j(), { text: t, primary: n, fontHeading: i, fontBody: c } = q(), [s, l] = te(""), [a, d] = te(!1), h = r(e, `${$e}.settings.eyebrow`, ""), u = r(e, `${$e}.settings.title`), p = r(e, `${$e}.settings.subtitle`, ""), g = r(e, `${$e}.blocks.form_fields.blocks.email_field.settings.placeholder`), k = r(e, `${$e}.blocks.primary_button.settings.label`), y = r(e, `${$e}.blocks.success_message.settings.text`), v = r(e, `${$e}.blocks.footer_link.blocks.back_link.settings.label`), b = r(e, `${$e}.blocks.footer_link.blocks.back_link.settings.href`), _ = ($) => {
    $.preventDefault(), s.trim() && d(!0);
  };
  return /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o(B, { sectionId: "forgot_main", label: "Reset password", style: { padding: `48px ${R.padX}px 80px`, fontFamily: c, color: t }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 440, margin: "0 auto", border: `1px solid ${R.line}`, borderRadius: 12, padding: 40 }, children: [
    h ? /* @__PURE__ */ o(S, { fieldPath: `${$e}.settings.eyebrow`, label: "Eyebrow", as: "p", style: { fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.7, margin: "0 0 8px" }, children: h }) : null,
    /* @__PURE__ */ o(S, { fieldPath: `${$e}.settings.title`, label: "Heading", as: "h1", style: { fontFamily: i, fontSize: 28, marginTop: 0 }, children: u }),
    /* @__PURE__ */ o(S, { fieldPath: `${$e}.settings.subtitle`, label: "Instructions", as: "p", style: { lineHeight: 1.6, opacity: 0.85, margin: "12px 0 24px" }, children: p }),
    a ? /* @__PURE__ */ o(N, { nodeId: "template:forgot_password:forgot_main:block:success_message", label: "Success message", children: /* @__PURE__ */ o(S, { fieldPath: `${$e}.blocks.success_message.settings.text`, label: "Confirmation text", as: "p", style: { marginTop: 16, fontSize: 14, color: n }, children: y }) }) : /* @__PURE__ */ m("form", { onSubmit: _, style: { display: "grid", gap: 16 }, children: [
      /* @__PURE__ */ o(N, { nodeId: "template:forgot_password:forgot_main:block:form_fields", label: "Form fields", children: /* @__PURE__ */ o("input", { value: s, onChange: ($) => l($.target.value), placeholder: g, style: vt }) }),
      /* @__PURE__ */ o(N, { nodeId: "template:forgot_password:forgot_main:block:primary_button", label: "Submit button", children: /* @__PURE__ */ o("button", { type: "submit", style: { background: n, color: "#fff", border: "none", padding: "14px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, width: "100%" }, children: k }) })
    ] }),
    /* @__PURE__ */ o(N, { nodeId: "template:forgot_password:forgot_main:block:footer_link", label: "Back to login", children: /* @__PURE__ */ o("p", { style: { marginTop: 20, fontSize: 14 }, children: /* @__PURE__ */ o(D, { to: b, style: { color: n, fontWeight: 600 }, children: /* @__PURE__ */ o(S, { fieldPath: `${$e}.blocks.footer_link.blocks.back_link.settings.label`, label: "Link label", as: "span", children: v }) }) }) })
  ] }) }) });
}
function Gd() {
  const { fontHeading: e, fontBody: t, text: n, muted: i } = q();
  return /* @__PURE__ */ o(Te, { children: /* @__PURE__ */ o("section", { style: { padding: `72px ${R.padX}px`, fontFamily: t, color: n }, children: /* @__PURE__ */ m("div", { style: { maxWidth: 420, margin: "0 auto" }, className: "hz-reveal", children: [
    /* @__PURE__ */ o("h1", { style: { fontFamily: e, fontSize: "2.5rem", fontWeight: 400, margin: "0 0 12px" }, children: "Create account" }),
    /* @__PURE__ */ o("p", { style: { color: i, marginBottom: 32, lineHeight: 1.7 }, children: "Join us for a seamless checkout and order history." }),
    /* @__PURE__ */ o(D, { to: "/auth/login", className: "hz-btn hz-btn--ghost", style: { display: "inline-flex" }, children: "Already have an account?" })
  ] }) }) });
}
const Vd = {
  id: "horizon",
  Header: Zo,
  Footer: Yo,
  HeroSection: St,
  TestimonialsSection: xt,
  NewArrivalsSection: xt,
  HomePage: Md,
  ProductPage: Ed,
  LoginPage: Fd,
  SignupPage: Gd,
  ForgotPasswordPage: Od,
  ProfilePage: Ud,
  OrdersPage: Ad,
  PreferencesPage: Nd,
  CartPage: Rl
};
export {
  Vd as default,
  Vd as horizonThemeContract
};
//# sourceMappingURL=theme.js.map
