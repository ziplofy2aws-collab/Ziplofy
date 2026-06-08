"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorefrontLiquid = createStorefrontLiquid;
exports.renderLiquidThemePage = renderLiquidThemePage;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const liquidjs_1 = require("liquidjs");
const LAYOUT_LINE = /^\{%\s*layout\s+['"]([^'"]+)['"]\s*%\}\s*\n?/;
function formatInr(amount) {
    if (amount == null || amount === "")
        return "";
    const n = Number(amount);
    if (Number.isNaN(n))
        return String(amount);
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(n);
}
/**
 * Liquid engine scoped to one theme root with Ziplofy storefront tags/filters.
 */
function createStorefrontLiquid(themeRoot, assetBaseUrl) {
    const layoutsDir = path_1.default.join(themeRoot, "layouts");
    const sectionsDir = path_1.default.join(themeRoot, "sections");
    const componentsDir = path_1.default.join(themeRoot, "components");
    const templatesDir = path_1.default.join(themeRoot, "templates");
    const liquid = new liquidjs_1.Liquid({
        root: themeRoot,
        layouts: [layoutsDir],
        partials: [sectionsDir, componentsDir, templatesDir],
        extname: ".liquid",
        strictFilters: false,
        strictVariables: false,
        jsTruthy: true,
    });
    liquid.registerFilter("asset_url", (rel) => {
        if (rel == null || rel === "")
            return "";
        const clean = String(rel).replace(/^\//, "");
        const base = assetBaseUrl.replace(/\/$/, "");
        return `${base}/${clean}`;
    });
    liquid.registerFilter("money", (amount) => formatInr(amount));
    liquid.registerFilter("raw", (v) => v);
    liquid.registerTag("section", {
        parse(token) {
            const raw = token.args.trim();
            const m = raw.match(/^['"]([^'"]+)['"]/) || raw.match(/^(\w+)/);
            this.name = m ? m[1] : raw;
        },
        *render(ctx, emitter) {
            const name = this.name;
            const filePath = path_1.default.join(sectionsDir, `${name}.liquid`);
            if (!fs_1.default.existsSync(filePath)) {
                emitter.write(`<!-- missing section: ${name} -->`);
                return;
            }
            const source = fs_1.default.readFileSync(filePath, "utf8");
            const html = yield liquid.parseAndRender(source, ctx);
            emitter.write(html);
        },
    });
    return liquid;
}
/**
 * Render a template from `templates/{templateName}.liquid` with optional layout wrapper.
 */
async function renderLiquidThemePage(liquid, themeRoot, templateName, context) {
    const templatePath = path_1.default.join(themeRoot, "templates", `${templateName}.liquid`);
    if (!fs_1.default.existsSync(templatePath)) {
        throw new Error(`Template not found: templates/${templateName}.liquid`);
    }
    let source = fs_1.default.readFileSync(templatePath, "utf8");
    let layoutName = null;
    const layoutMatch = source.match(LAYOUT_LINE);
    if (layoutMatch) {
        layoutName = layoutMatch[1];
        source = source.slice(layoutMatch[0].length);
    }
    const innerTpl = liquid.parse(source, templatePath);
    const innerHtml = await liquid.render(innerTpl, context);
    if (!layoutName) {
        return innerHtml;
    }
    const layoutFile = path_1.default.join(themeRoot, "layouts", `${layoutName}.liquid`);
    if (!fs_1.default.existsSync(layoutFile)) {
        return innerHtml;
    }
    const layoutSource = fs_1.default.readFileSync(layoutFile, "utf8");
    const layoutTpl = liquid.parse(layoutSource, layoutFile);
    const fullContext = {
        ...context,
        content_for_layout: innerHtml,
        content_for_head: context.content_for_head ?? "",
        content_for_scripts: context.content_for_scripts ?? "",
    };
    return liquid.render(layoutTpl, fullContext);
}
