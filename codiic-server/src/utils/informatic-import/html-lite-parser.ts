/**
 * Minimal HTML parser for theme import — produces a lightweight node tree.
 * Not a full DOM: enough to locate sections, headings, images, links, cards.
 * Tolerates malformed markup by auto-closing mismatched tags.
 */

export interface LiteNode {
  tag: string;
  attrs: Record<string, string>;
  children: LiteNode[];
  /** Text content for `#text` nodes. */
  text: string;
  parent: LiteNode | null;
}

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const RAW_TEXT_TAGS = new Set(['script', 'style', 'textarea', 'title', 'noscript']);

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&copy;/gi, '©')
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCodePoint(parseInt(n, 16)));
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([\w:@.-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|[^\s"'>]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const name = m[1].toLowerCase();
    const value = m[3] ?? m[4] ?? (m[2] !== undefined ? m[2].trim() : '');
    attrs[name] = decodeEntities(value);
  }
  return attrs;
}

function makeNode(tag: string): LiteNode {
  return { tag, attrs: {}, children: [], text: '', parent: null };
}

/**
 * Parse an HTML document into a LiteNode tree rooted at `#document`.
 * `script`/`style` bodies are dropped (never needed for import extraction).
 */
export function parseHtml(html: string): LiteNode {
  const root = makeNode('#document');
  const stack: LiteNode[] = [root];
  const top = () => stack[stack.length - 1];

  // Strip comments up-front so they can't confuse tag matching.
  const src = String(html || '').replace(/<!--[\s\S]*?-->/g, '');

  let i = 0;
  const n = src.length;
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt < 0) {
      pushText(top(), src.slice(i));
      break;
    }
    if (lt > i) pushText(top(), src.slice(i, lt));

    // Closing tag
    if (src.startsWith('</', lt)) {
      const end = src.indexOf('>', lt);
      if (end < 0) break;
      const name = src.slice(lt + 2, end).trim().split(/\s+/)[0]?.toLowerCase() || '';
      // Pop until matching open tag; ignore unmatched closers.
      for (let d = stack.length - 1; d > 0; d--) {
        if (stack[d].tag === name) {
          stack.length = d;
          break;
        }
      }
      i = end + 1;
      continue;
    }

    // Doctype / processing instruction / declaration
    if (src.startsWith('<!', lt) || src.startsWith('<?', lt)) {
      const end = src.indexOf('>', lt);
      i = end < 0 ? n : end + 1;
      continue;
    }

    // Opening tag
    const tagMatch = /^<\s*([a-zA-Z][\w:-]*)/.exec(src.slice(lt, lt + 64));
    if (!tagMatch) {
      pushText(top(), '<');
      i = lt + 1;
      continue;
    }
    const tag = tagMatch[1].toLowerCase();

    // Raw-text elements: consume until matching close tag.
    if (RAW_TEXT_TAGS.has(tag)) {
      const closeRe = new RegExp(`</\\s*${tag}\\s*>`, 'i');
      const after = src.slice(lt + 1);
      const gtRel = after.indexOf('>');
      if (gtRel < 0) break;
      const contentStart = lt + 1 + gtRel + 1;
      const rest = src.slice(contentStart);
      const closeM = closeRe.exec(rest);
      const rawText = closeM ? rest.slice(0, closeM.index) : rest;
      if (tag === 'title' || tag === 'textarea') {
        const node = makeNode(tag);
        node.parent = top();
        top().children.push(node);
        pushText(node, rawText);
      }
      i = closeM ? contentStart + closeM.index + closeM[0].length : n;
      continue;
    }

    // Find the tag end (respect quoted '>' inside attrs)
    let j = lt + tagMatch[0].length;
    let inQuote: string | null = null;
    while (j < n) {
      const c = src[j];
      if (inQuote) {
        if (c === inQuote) inQuote = null;
      } else if (c === '"' || c === "'") {
        inQuote = c;
      } else if (c === '>') {
        break;
      }
      j++;
    }
    const attrSrc = src.slice(lt + tagMatch[0].length, j);
    const selfClosing = /\/\s*$/.test(attrSrc);
    const node = makeNode(tag);
    node.attrs = parseAttrs(attrSrc.replace(/\/\s*$/, ''));
    node.parent = top();
    top().children.push(node);
    if (!selfClosing && !VOID_TAGS.has(tag)) {
      stack.push(node);
    }
    i = j + 1;
  }

  return root;
}

function pushText(parent: LiteNode, raw: string): void {
  const decoded = decodeEntities(raw);
  if (!decoded.trim()) return;
  const node = makeNode('#text');
  node.text = decoded;
  node.parent = parent;
  parent.children.push(node);
}

export function textContent(node: LiteNode | null | undefined): string {
  if (!node) return '';
  if (node.tag === '#text') return node.text;
  return node.children.map(textContent).join(' ');
}

export function normalizedText(node: LiteNode | null | undefined): string {
  return textContent(node).replace(/\s+/g, ' ').trim();
}

export function findAll(node: LiteNode, pred: (n: LiteNode) => boolean, out: LiteNode[] = []): LiteNode[] {
  for (const child of node.children) {
    if (pred(child)) out.push(child);
    findAll(child, pred, out);
  }
  return out;
}

export function find(node: LiteNode, pred: (n: LiteNode) => boolean): LiteNode | null {
  for (const child of node.children) {
    if (pred(child)) return child;
    const deep = find(child, pred);
    if (deep) return deep;
  }
  return null;
}

export function byTag(tag: string): (n: LiteNode) => boolean {
  return (n) => n.tag === tag;
}

export function classTokens(node: LiteNode): string[] {
  return String(node.attrs.class || '')
    .split(/\s+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** True when any class token or the id matches the pattern. */
export function classOrIdMatches(node: LiteNode, re: RegExp): boolean {
  if (re.test(String(node.attrs.id || '').toLowerCase())) return true;
  return classTokens(node).some((c) => re.test(c));
}

/** Deepest class/id string for debugging/labels. */
export function descriptor(node: LiteNode): string {
  const id = node.attrs.id ? `#${node.attrs.id}` : '';
  const cls = String(node.attrs.class || '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
  return `${node.tag}${id}${cls ? `.${cls}` : ''}`;
}
