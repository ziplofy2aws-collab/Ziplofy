import fs from "fs";
import path from "path";
import { Liquid, Emitter, Context, TagToken } from "liquidjs";

const LAYOUT_LINE = /^\{%\s*layout\s+['"]([^'"]+)['"]\s*%\}\s*\n?/;

function formatInr(amount: unknown): string {
  if (amount == null || amount === "") return "";
  const n = Number(amount);
  if (Number.isNaN(n)) return String(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Liquid engine scoped to one theme root with Ziplofy storefront tags/filters.
 */
export function createStorefrontLiquid(themeRoot: string, assetBaseUrl: string): Liquid {
  const layoutsDir = path.join(themeRoot, "layouts");
  const sectionsDir = path.join(themeRoot, "sections");
  const componentsDir = path.join(themeRoot, "components");
  const templatesDir = path.join(themeRoot, "templates");

  const liquid = new Liquid({
    root: themeRoot,
    layouts: [layoutsDir],
    partials: [sectionsDir, componentsDir, templatesDir],
    extname: ".liquid",
    strictFilters: false,
    strictVariables: false,
    jsTruthy: true,
  });

  liquid.registerFilter("asset_url", (rel: string) => {
    if (rel == null || rel === "") return "";
    const clean = String(rel).replace(/^\//, "");
    const base = assetBaseUrl.replace(/\/$/, "");
    return `${base}/${clean}`;
  });

  liquid.registerFilter("money", (amount: unknown) => formatInr(amount));

  liquid.registerFilter("raw", (v: unknown) => v as string);

  liquid.registerTag("section", {
    parse(this: { name: string }, token: TagToken) {
      const raw = token.args.trim();
      const m = raw.match(/^['"]([^'"]+)['"]/) || raw.match(/^(\w+)/);
      this.name = m ? m[1] : raw;
    },
    *render(this: { name: string }, ctx: Context, emitter: Emitter): Generator<unknown, void, unknown> {
      const name = this.name;
      const filePath = path.join(sectionsDir, `${name}.liquid`);
      if (!fs.existsSync(filePath)) {
        emitter.write(`<!-- missing section: ${name} -->`);
        return;
      }
      const source = fs.readFileSync(filePath, "utf8");
      const html = yield liquid.parseAndRender(source, ctx);
      emitter.write(html);
    },
  });

  return liquid;
}

export type LiquidRenderContext = Record<string, unknown>;

/**
 * Render a template from `templates/{templateName}.liquid` with optional layout wrapper.
 */
export async function renderLiquidThemePage(
  liquid: Liquid,
  themeRoot: string,
  templateName: string,
  context: LiquidRenderContext
): Promise<string> {
  const templatePath = path.join(themeRoot, "templates", `${templateName}.liquid`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: templates/${templateName}.liquid`);
  }

  let source = fs.readFileSync(templatePath, "utf8");
  let layoutName: string | null = null;
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

  const layoutFile = path.join(themeRoot, "layouts", `${layoutName}.liquid`);
  if (!fs.existsSync(layoutFile)) {
    return innerHtml;
  }

  const layoutSource = fs.readFileSync(layoutFile, "utf8");
  const layoutTpl = liquid.parse(layoutSource, layoutFile);
  const fullContext = {
    ...context,
    content_for_layout: innerHtml,
    content_for_head: context.content_for_head ?? "",
    content_for_scripts: context.content_for_scripts ?? "",
  };
  return liquid.render(layoutTpl, fullContext);
}
