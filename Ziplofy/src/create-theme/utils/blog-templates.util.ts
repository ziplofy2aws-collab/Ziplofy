/** Alternate blog / blog-post templates under `config.templates` (`blogs.{slug}`, `blog-posts.{slug}`). */

export const BLOGS_TEMPLATE_ORDER_KEY = 'blogs_template_order';
/** blog urlHandle → stored themeTemplate (`default` | `blogs.{slug}`). */
export const BLOGS_TEMPLATE_ASSIGNMENTS_KEY = 'blogs_template_assignments';
export const BLOG_POSTS_TEMPLATE_ORDER_KEY = 'blog_posts_template_order';
/** `blogHandle/postHandle` → stored themeTemplate (`default` | `blog-posts.{slug}`). */
export const BLOG_POSTS_TEMPLATE_ASSIGNMENTS_KEY = 'blog_posts_template_assignments';
export const DEFAULT_BLOGS_TEMPLATE_ID = 'blogs';
export const DEFAULT_BLOG_POSTS_TEMPLATE_ID = 'blog-posts';

export type BlogTemplateEntry = {
  id: string;
  name: string;
  isDefault: boolean;
  basedOn?: string;
  assignedBlogCount: number;
};

export type BlogPostTemplateEntry = {
  id: string;
  name: string;
  isDefault: boolean;
  basedOn?: string;
  assignedBlogPostCount: number;
};

function templatesRecord(config: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const raw = config.templates;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as Record<string, Record<string, unknown>>;
}

function readTemplateName(tpl: Record<string, unknown> | undefined, fallback: string): string {
  const name = tpl?.name;
  return typeof name === 'string' && name.trim() ? name.trim() : fallback;
}

function slugifyTemplateName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 25);
}

/* ─── Blogs (listing) ─── */

export function isBlogsTemplateKey(templateId: string): boolean {
  return templateId === DEFAULT_BLOGS_TEMPLATE_ID || templateId.startsWith(`${DEFAULT_BLOGS_TEMPLATE_ID}.`);
}

export function blogsTemplateSlugFromKey(templateId: string): string | null {
  if (templateId === DEFAULT_BLOGS_TEMPLATE_ID) return null;
  if (!templateId.startsWith(`${DEFAULT_BLOGS_TEMPLATE_ID}.`)) return null;
  return templateId.slice(`${DEFAULT_BLOGS_TEMPLATE_ID}.`.length);
}

export function blogsTemplatePreviewPage(templateId: string): string {
  const slug = blogsTemplateSlugFromKey(templateId);
  return slug ? `${DEFAULT_BLOGS_TEMPLATE_ID}:${slug}` : DEFAULT_BLOGS_TEMPLATE_ID;
}

export function blogsTemplateIdFromPreviewPage(page: string): string | null {
  if (page === DEFAULT_BLOGS_TEMPLATE_ID) return DEFAULT_BLOGS_TEMPLATE_ID;
  if (page.startsWith(`${DEFAULT_BLOGS_TEMPLATE_ID}:`)) {
    const slug = page.slice(`${DEFAULT_BLOGS_TEMPLATE_ID}:`.length).trim();
    return slug ? `${DEFAULT_BLOGS_TEMPLATE_ID}.${slug}` : DEFAULT_BLOGS_TEMPLATE_ID;
  }
  return null;
}

export function isBlogsTemplatePreviewPage(page: string): boolean {
  return blogsTemplateIdFromPreviewPage(page) !== null;
}

/** Map stored themeTemplate (`default` / `blogs.foo`) to a config template key. */
export function blogsThemeTemplateToConfigId(themeTemplate?: string | null): string {
  const normalized = (themeTemplate ?? 'default').trim().toLowerCase();
  if (!normalized || normalized === 'default' || normalized === DEFAULT_BLOGS_TEMPLATE_ID) {
    return DEFAULT_BLOGS_TEMPLATE_ID;
  }
  if (normalized.startsWith(`${DEFAULT_BLOGS_TEMPLATE_ID}.`)) return normalized;
  return DEFAULT_BLOGS_TEMPLATE_ID;
}

/** Read blog urlHandle → themeTemplate assignments from theme JSON. */
export function readBlogsTemplateAssignments(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  if (!config) return {};
  const raw = config[BLOGS_TEMPLATE_ASSIGNMENTS_KEY];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const out: Record<string, string> = {};
  for (const [handle, value] of Object.entries(raw as Record<string, unknown>)) {
    const key = handle.trim().toLowerCase();
    if (!key || typeof value !== 'string') continue;
    const normalized = value.trim().toLowerCase();
    if (normalized) out[key] = normalized;
  }
  return out;
}

/** Replace blog assignments in theme JSON and refresh assignment counts. */
export function writeBlogsTemplateAssignments(
  config: Record<string, unknown>,
  assignments: Record<string, string>
): void {
  ensureBlogsTemplateRegistry(config);
  const cleaned: Record<string, string> = {};
  for (const [handle, value] of Object.entries(assignments)) {
    const key = handle.trim().toLowerCase();
    if (!key) continue;
    const normalized = (value ?? 'default').trim().toLowerCase() || 'default';
    cleaned[key] = normalized === DEFAULT_BLOGS_TEMPLATE_ID ? 'default' : normalized;
  }
  config[BLOGS_TEMPLATE_ASSIGNMENTS_KEY] = cleaned;

  const counts: Record<string, number> = {};
  for (const value of Object.values(cleaned)) {
    const id = blogsThemeTemplateToConfigId(value);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  const templates = templatesRecord(config);
  for (const id of listBlogsTemplateOrder(config)) {
    if (templates[id]) templates[id].assignedBlogCount = counts[id] ?? 0;
  }
}

/** Resolve a blog template locally from the already-loaded theme JSON. */
export function resolveBlogsTemplateIdFromThemeConfig(
  config: Record<string, unknown> | null | undefined,
  urlHandle?: string | null
): string {
  const handle = (urlHandle ?? '').trim().toLowerCase();
  if (!handle || handle === 'preview') return DEFAULT_BLOGS_TEMPLATE_ID;

  const assignments = readBlogsTemplateAssignments(config);
  const requested = blogsThemeTemplateToConfigId(assignments[handle]);
  const templates = templatesRecord(config ?? {});
  if (requested !== DEFAULT_BLOGS_TEMPLATE_ID && templates[requested]) return requested;
  return DEFAULT_BLOGS_TEMPLATE_ID;
}

export function listBlogsTemplateOrder(config: Record<string, unknown> | null): string[] {
  if (!config) return [DEFAULT_BLOGS_TEMPLATE_ID];
  const order = config[BLOGS_TEMPLATE_ORDER_KEY];
  const templates = templatesRecord(config);
  const ids = Array.isArray(order)
    ? (order as string[]).filter((id) => isBlogsTemplateKey(id) && templates[id])
    : [];
  if (!ids.includes(DEFAULT_BLOGS_TEMPLATE_ID) && templates[DEFAULT_BLOGS_TEMPLATE_ID]) {
    ids.unshift(DEFAULT_BLOGS_TEMPLATE_ID);
  }
  if (!ids.length && templates[DEFAULT_BLOGS_TEMPLATE_ID]) {
    return [DEFAULT_BLOGS_TEMPLATE_ID];
  }
  return ids.length ? ids : [DEFAULT_BLOGS_TEMPLATE_ID];
}

export function listBlogsTemplates(config: Record<string, unknown> | null): BlogTemplateEntry[] {
  const templates = templatesRecord(config ?? {});
  return listBlogsTemplateOrder(config).map((id) => {
    const tpl = templates[id];
    const isDefault = id === DEFAULT_BLOGS_TEMPLATE_ID;
    const fallbackName = isDefault ? 'Default blog' : id.replace(/^blogs\./, '');
    const n = tpl?.assignedBlogCount;
    return {
      id,
      name: readTemplateName(tpl, fallbackName),
      isDefault,
      basedOn: typeof tpl?.basedOn === 'string' ? tpl.basedOn : undefined,
      assignedBlogCount:
        typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0,
    };
  });
}

export function blogsTemplateDisplayName(
  config: Record<string, unknown> | null,
  previewPage: string
): string | null {
  const templateId = blogsTemplateIdFromPreviewPage(previewPage);
  if (!templateId) return null;
  return listBlogsTemplates(config).find((t) => t.id === templateId)?.name ?? null;
}

export function blogsTemplateKeyFromName(name: string): string {
  const slug = slugifyTemplateName(name);
  return slug ? `${DEFAULT_BLOGS_TEMPLATE_ID}.${slug}` : '';
}

export function ensureBlogsTemplateRegistry(config: Record<string, unknown>): void {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  if (!templates[DEFAULT_BLOGS_TEMPLATE_ID]) {
    templates[DEFAULT_BLOGS_TEMPLATE_ID] = {
      name: 'Default blog',
      sections: {},
      section_order: [],
    };
  } else if (!templates[DEFAULT_BLOGS_TEMPLATE_ID].name) {
    templates[DEFAULT_BLOGS_TEMPLATE_ID].name = 'Default blog';
  }

  const order = listBlogsTemplateOrder(config);
  for (const id of Object.keys(templates)) {
    if (isBlogsTemplateKey(id) && !order.includes(id)) order.push(id);
  }
  config[BLOGS_TEMPLATE_ORDER_KEY] = order;

  if (
    !config[BLOGS_TEMPLATE_ASSIGNMENTS_KEY] ||
    typeof config[BLOGS_TEMPLATE_ASSIGNMENTS_KEY] !== 'object' ||
    Array.isArray(config[BLOGS_TEMPLATE_ASSIGNMENTS_KEY])
  ) {
    config[BLOGS_TEMPLATE_ASSIGNMENTS_KEY] = {};
  }
}

export type CreateBlogTemplateResult =
  | { ok: true; templateId: string; previewPage: string }
  | { ok: false; error: string };

export function createBlogsTemplateInConfig(
  config: Record<string, unknown>,
  name: string,
  basedOnTemplateId: string
): CreateBlogTemplateResult {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: 'Name is required' };
  if (trimmed.length > 25) return { ok: false, error: 'Name must be 25 characters or less' };

  const templateKey = blogsTemplateKeyFromName(trimmed);
  if (!templateKey) return { ok: false, error: 'Enter a valid template name' };

  ensureBlogsTemplateRegistry(config);
  const templates = templatesRecord(config);
  if (templates[templateKey]) {
    return { ok: false, error: 'A template with this name already exists' };
  }

  const sourceId = isBlogsTemplateKey(basedOnTemplateId)
    ? basedOnTemplateId
    : DEFAULT_BLOGS_TEMPLATE_ID;
  const source = templates[sourceId];
  if (!source) return { ok: false, error: 'Base template not found' };

  templates[templateKey] = {
    ...JSON.parse(JSON.stringify(source)),
    name: trimmed,
    basedOn: sourceId,
    assignedBlogCount: 0,
  };

  const order = listBlogsTemplateOrder(config);
  if (!order.includes(templateKey)) order.push(templateKey);
  config[BLOGS_TEMPLATE_ORDER_KEY] = order;

  return {
    ok: true,
    templateId: templateKey,
    previewPage: blogsTemplatePreviewPage(templateKey),
  };
}

/* ─── Blog posts (article detail) ─── */

export function isBlogPostsTemplateKey(templateId: string): boolean {
  return (
    templateId === DEFAULT_BLOG_POSTS_TEMPLATE_ID ||
    templateId.startsWith(`${DEFAULT_BLOG_POSTS_TEMPLATE_ID}.`)
  );
}

export function blogPostsTemplateSlugFromKey(templateId: string): string | null {
  if (templateId === DEFAULT_BLOG_POSTS_TEMPLATE_ID) return null;
  if (!templateId.startsWith(`${DEFAULT_BLOG_POSTS_TEMPLATE_ID}.`)) return null;
  return templateId.slice(`${DEFAULT_BLOG_POSTS_TEMPLATE_ID}.`.length);
}

export function blogPostsTemplatePreviewPage(templateId: string): string {
  const slug = blogPostsTemplateSlugFromKey(templateId);
  return slug ? `${DEFAULT_BLOG_POSTS_TEMPLATE_ID}:${slug}` : DEFAULT_BLOG_POSTS_TEMPLATE_ID;
}

export function blogPostsTemplateIdFromPreviewPage(page: string): string | null {
  if (page === DEFAULT_BLOG_POSTS_TEMPLATE_ID) return DEFAULT_BLOG_POSTS_TEMPLATE_ID;
  if (page.startsWith(`${DEFAULT_BLOG_POSTS_TEMPLATE_ID}:`)) {
    const slug = page.slice(`${DEFAULT_BLOG_POSTS_TEMPLATE_ID}:`.length).trim();
    return slug ? `${DEFAULT_BLOG_POSTS_TEMPLATE_ID}.${slug}` : DEFAULT_BLOG_POSTS_TEMPLATE_ID;
  }
  return null;
}

export function isBlogPostsTemplatePreviewPage(page: string): boolean {
  return blogPostsTemplateIdFromPreviewPage(page) !== null;
}

/** Stable assignment key for nested storefront blog-post routes. */
export function blogPostTemplateAssignmentKey(
  blogHandle?: string | null,
  postHandle?: string | null
): string {
  const blog = (blogHandle ?? '').trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  const post = (postHandle ?? '').trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  return blog && post ? `${blog}/${post}` : '';
}

/** Map stored themeTemplate (`default` / `blog-posts.foo`) to a config key. */
export function blogPostsThemeTemplateToConfigId(themeTemplate?: string | null): string {
  const normalized = (themeTemplate ?? 'default').trim().toLowerCase();
  if (
    !normalized ||
    normalized === 'default' ||
    normalized === DEFAULT_BLOG_POSTS_TEMPLATE_ID
  ) {
    return DEFAULT_BLOG_POSTS_TEMPLATE_ID;
  }
  if (normalized.startsWith(`${DEFAULT_BLOG_POSTS_TEMPLATE_ID}.`)) return normalized;
  return DEFAULT_BLOG_POSTS_TEMPLATE_ID;
}

/** Read `blogHandle/postHandle` → themeTemplate assignments from theme JSON. */
export function readBlogPostsTemplateAssignments(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  if (!config) return {};
  const raw = config[BLOG_POSTS_TEMPLATE_ASSIGNMENTS_KEY];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const out: Record<string, string> = {};
  for (const [path, value] of Object.entries(raw as Record<string, unknown>)) {
    const [blogHandle, postHandle] = path.split('/');
    const key = blogPostTemplateAssignmentKey(blogHandle, postHandle);
    if (!key || typeof value !== 'string') continue;
    const normalized = value.trim().toLowerCase();
    if (normalized) out[key] = normalized;
  }
  return out;
}

/** Replace blog-post assignments in theme JSON and refresh assignment counts. */
export function writeBlogPostsTemplateAssignments(
  config: Record<string, unknown>,
  assignments: Record<string, string>
): void {
  ensureBlogPostsTemplateRegistry(config);
  const cleaned: Record<string, string> = {};
  for (const [path, value] of Object.entries(assignments)) {
    const [blogHandle, postHandle] = path.split('/');
    const key = blogPostTemplateAssignmentKey(blogHandle, postHandle);
    if (!key) continue;
    const normalized = (value ?? 'default').trim().toLowerCase() || 'default';
    cleaned[key] = normalized === DEFAULT_BLOG_POSTS_TEMPLATE_ID ? 'default' : normalized;
  }
  config[BLOG_POSTS_TEMPLATE_ASSIGNMENTS_KEY] = cleaned;

  const counts: Record<string, number> = {};
  for (const value of Object.values(cleaned)) {
    const id = blogPostsThemeTemplateToConfigId(value);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  const templates = templatesRecord(config);
  for (const id of listBlogPostsTemplateOrder(config)) {
    if (templates[id]) templates[id].assignedBlogPostCount = counts[id] ?? 0;
  }
}

/** Resolve a blog-post template locally from the already-loaded theme JSON. */
export function resolveBlogPostTemplateIdFromThemeConfig(
  config: Record<string, unknown> | null | undefined,
  blogHandle?: string | null,
  postHandle?: string | null
): string {
  const key = blogPostTemplateAssignmentKey(blogHandle, postHandle);
  if (!key || key === 'preview/preview') return DEFAULT_BLOG_POSTS_TEMPLATE_ID;

  const assignments = readBlogPostsTemplateAssignments(config);
  const requested = blogPostsThemeTemplateToConfigId(assignments[key]);
  const templates = templatesRecord(config ?? {});
  if (requested !== DEFAULT_BLOG_POSTS_TEMPLATE_ID && templates[requested]) return requested;
  return DEFAULT_BLOG_POSTS_TEMPLATE_ID;
}

export function listBlogPostsTemplateOrder(config: Record<string, unknown> | null): string[] {
  if (!config) return [DEFAULT_BLOG_POSTS_TEMPLATE_ID];
  const order = config[BLOG_POSTS_TEMPLATE_ORDER_KEY];
  const templates = templatesRecord(config);
  const ids = Array.isArray(order)
    ? (order as string[]).filter((id) => isBlogPostsTemplateKey(id) && templates[id])
    : [];
  if (!ids.includes(DEFAULT_BLOG_POSTS_TEMPLATE_ID) && templates[DEFAULT_BLOG_POSTS_TEMPLATE_ID]) {
    ids.unshift(DEFAULT_BLOG_POSTS_TEMPLATE_ID);
  }
  if (!ids.length && templates[DEFAULT_BLOG_POSTS_TEMPLATE_ID]) {
    return [DEFAULT_BLOG_POSTS_TEMPLATE_ID];
  }
  return ids.length ? ids : [DEFAULT_BLOG_POSTS_TEMPLATE_ID];
}

export function listBlogPostsTemplates(
  config: Record<string, unknown> | null
): BlogPostTemplateEntry[] {
  const templates = templatesRecord(config ?? {});
  return listBlogPostsTemplateOrder(config).map((id) => {
    const tpl = templates[id];
    const isDefault = id === DEFAULT_BLOG_POSTS_TEMPLATE_ID;
    const fallbackName = isDefault ? 'Default blog post' : id.replace(/^blog-posts\./, '');
    const n = tpl?.assignedBlogPostCount;
    return {
      id,
      name: readTemplateName(tpl, fallbackName),
      isDefault,
      basedOn: typeof tpl?.basedOn === 'string' ? tpl.basedOn : undefined,
      assignedBlogPostCount:
        typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0,
    };
  });
}

export function blogPostsTemplateDisplayName(
  config: Record<string, unknown> | null,
  previewPage: string
): string | null {
  const templateId = blogPostsTemplateIdFromPreviewPage(previewPage);
  if (!templateId) return null;
  return listBlogPostsTemplates(config).find((t) => t.id === templateId)?.name ?? null;
}

export function blogPostsTemplateKeyFromName(name: string): string {
  const slug = slugifyTemplateName(name);
  return slug ? `${DEFAULT_BLOG_POSTS_TEMPLATE_ID}.${slug}` : '';
}

export function ensureBlogPostsTemplateRegistry(config: Record<string, unknown>): void {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  if (!templates[DEFAULT_BLOG_POSTS_TEMPLATE_ID]) {
    templates[DEFAULT_BLOG_POSTS_TEMPLATE_ID] = {
      name: 'Default blog post',
      sections: {},
      section_order: [],
    };
  } else if (!templates[DEFAULT_BLOG_POSTS_TEMPLATE_ID].name) {
    templates[DEFAULT_BLOG_POSTS_TEMPLATE_ID].name = 'Default blog post';
  }

  const order = listBlogPostsTemplateOrder(config);
  for (const id of Object.keys(templates)) {
    if (isBlogPostsTemplateKey(id) && !order.includes(id)) order.push(id);
  }
  config[BLOG_POSTS_TEMPLATE_ORDER_KEY] = order;

  if (
    !config[BLOG_POSTS_TEMPLATE_ASSIGNMENTS_KEY] ||
    typeof config[BLOG_POSTS_TEMPLATE_ASSIGNMENTS_KEY] !== 'object' ||
    Array.isArray(config[BLOG_POSTS_TEMPLATE_ASSIGNMENTS_KEY])
  ) {
    config[BLOG_POSTS_TEMPLATE_ASSIGNMENTS_KEY] = {};
  }
}

export function createBlogPostsTemplateInConfig(
  config: Record<string, unknown>,
  name: string,
  basedOnTemplateId: string
): CreateBlogTemplateResult {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: 'Name is required' };
  if (trimmed.length > 25) return { ok: false, error: 'Name must be 25 characters or less' };

  const templateKey = blogPostsTemplateKeyFromName(trimmed);
  if (!templateKey) return { ok: false, error: 'Enter a valid template name' };

  ensureBlogPostsTemplateRegistry(config);
  const templates = templatesRecord(config);
  if (templates[templateKey]) {
    return { ok: false, error: 'A template with this name already exists' };
  }

  const sourceId = isBlogPostsTemplateKey(basedOnTemplateId)
    ? basedOnTemplateId
    : DEFAULT_BLOG_POSTS_TEMPLATE_ID;
  const source = templates[sourceId];
  if (!source) return { ok: false, error: 'Base template not found' };

  templates[templateKey] = {
    ...JSON.parse(JSON.stringify(source)),
    name: trimmed,
    basedOn: sourceId,
    assignedBlogPostCount: 0,
  };

  const order = listBlogPostsTemplateOrder(config);
  if (!order.includes(templateKey)) order.push(templateKey);
  config[BLOG_POSTS_TEMPLATE_ORDER_KEY] = order;

  return {
    ok: true,
    templateId: templateKey,
    previewPage: blogPostsTemplatePreviewPage(templateKey),
  };
}
