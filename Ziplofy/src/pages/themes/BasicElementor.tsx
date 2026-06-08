import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../../contexts/store.context";
import { useCustomThemes } from "../../contexts/custom-themes.context";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import "./CustomThemeBuilder.css"; /* Shared with Visual Elementor */
import "./BasicElementor.css";
import { applyResponsiveView, scheduleDesktopRetries } from "./elementorResponsiveness";

// Strip GrapesJS canvas CSS erroneously embedded in theme HTML (causes raw CSS display)
const stripGrapesJSCanvasCss = (html: string): string => {
  if (!html || typeof html !== 'string') return html;
  let h = html;
  const firstTag = h.search(/<[a-zA-Z][a-zA-Z0-9]*[\s>]/);
  if (firstTag > 0) {
    const leading = h.substring(0, firstTag);
    if (/body\s*\{/.test(leading) && /\.gjs-(?:dashed|selected|highlightable|selected-parent|plh-image)/.test(leading)) {
      h = h.substring(firstTag);
    }
  }
  h = h.replace(/<(div|pre|code|span)[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, content) => {
    const c = (content || '').trim();
    if (c.length > 80 && /body\s*\{/.test(c) && /\.gjs-(?:dashed|selected|highlightable|plh-image|grabbing)/.test(c)) {
      return '';
    }
    return match;
  });
  h = h.replace(/(?:^|>)\s*(body\s*\{[\s\S]*?\.gjs-dashed[\s\S]*\}\s*)(?=\s*<)/gi, '');
  return h;
};

// Preprocess HTML: add data-gjs-selectable, data-gjs-droppable, data-gjs-editable so EVERY element is selectable
const preprocessHtmlForSelectability = (html: string): string => {
  if (!html || typeof html !== 'string') return html;
  const SKIP_TAGS = ['script', 'style', 'link', 'meta', 'head', 'title', 'path', 'svg', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'];
  const CONTAINER_TAGS = ['div', 'section', 'main', 'article', 'header', 'footer', 'nav', 'aside', 'form', 'ul', 'ol', 'li', 'figure', 'figcaption'];
  const TEXT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup', 'blockquote', 'cite', 'img'];
  return html.replace(/<([a-z][a-z0-9]*)(\s[^>]*)?>/gi, (match: string, tagName: string, rest: string) => {
    const tag = (tagName || '').toLowerCase();
    if (SKIP_TAGS.includes(tag)) return match;
    const attrs = rest || '';
    if (attrs.includes('data-gjs-selectable')) return match;
    let toAdd = ` data-gjs-selectable="true"`;
    if (CONTAINER_TAGS.includes(tag)) toAdd += ` data-gjs-droppable="*"`;
    if (TEXT_TAGS.includes(tag) && !attrs.includes('data-gjs-editable')) toAdd += ` data-gjs-editable="true" data-gjs-type="text"`;
    return `<${tagName}${attrs}${toAdd}>`;
  });
};

// Preserve editing visuals without forcing a specific text color.
// Important: do NOT set `color: inherit !important` here, otherwise
// StyleManager changes (e.g. text color) will never show up.
const PRESERVE_TEXT_COLOR_CSS = `
  .gjs-selected,
  .gjs-selected *,
  .gjs-comp-selected,
  .gjs-comp-selected *,
  .gjs-editing,
  .gjs-editing *,
  .gjs-hovered,
  .gjs-hovered *,
  [contenteditable="true"],
  [contenteditable="true"] *,
  [data-gjs-type="text"],
  [data-gjs-editable="true"] {
    -webkit-text-fill-color: inherit !important;
    caret-color: currentColor !important;
    background-color: transparent !important;
  }
`;

/* Editor-only: hide non-active slider slides to prevent overlapping text (slider JS doesn't run in iframe) */
const SLIDER_FIX_CSS = `
  .swiper-slide:not(:first-child),
  .slick-slide:not(:first-child),
  .carousel-item:not(:first-child):not(.active),
  .slide:not(:first-child):not(.active),
  .hero-slide:not(:first-child),
  .slideshow__slide:not(:first-child),
  .hero__slide:not(:first-child),
  .splide__slide:not(:first-child),
  [class*="swiper-wrapper"] > *:not(:first-child),
  [class*="slick-track"] > *:not(:first-child),
  [class*="swiper"] [class*="slide"]:not(:first-of-type),
  [class*="slick"] [class*="slide"]:not(:first-of-type),
  .owl-item:not(:first-child) {
    display: none !important;
    visibility: hidden !important;
  }
`;

// Mount point for StyleManager - memoized so React won't clear manually-appended DOM
const StylePanelMountPoint = React.memo(() => (
  <div
    id="style-panel-wrapper"
    className="elementor-panel-card-body elementor-style-body"
    style={{ flex: 1, overflowY: 'auto', minHeight: 200, minWidth: 280 }}
  />
));

// Page interface for multi-page support
interface Page {
  id: string;
  name: string;
  html: string;
  css: string;
}

const DEFAULT_PAGE_CONTENT =
  '<section style="padding: 60px 20px; min-height: 400px; background: #ffffff; position: relative; border: 2px dashed #d1d5db; border-radius: 4px; max-width: 1200px; margin: 60px auto;">' +
  '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 12px; color: #6b7280; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;">' +
  '<div style="display: flex; gap: 12px; align-items: center;">' +
  '<span style="width: 40px; height: 40px; border-radius: 50%; background: #1e1e1e; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 18px;">+</span>' +
  '<span style="width: 40px; height: 40px; border-radius: 50%; background: #1e1e1e; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 18px;">📁</span>' +
  '</div>' +
  '<p style="margin: 0; font-size: 14px; font-weight: 500;">Start building your page</p>' +
  '<p style="margin: 0; font-size: 12px; opacity: 0.7;">Drag blocks from the sidebar or click to add content</p>' +
  '</div>' +
  '</section>';

// Mapping of sidebar item names to CSS selectors
const SECTION_SELECTORS: Record<string, string[]> = {
  "Header": [
    "header",
    ".header",
    "#header",
    "[class*='header']",
    "[id*='header']",
    "nav",
    ".navbar",
    ".navigation"
  ],
  "Hero section": [
    ".hero-section",
    ".hero",
    "[class*='hero']",
    "[id*='hero']",
    ".banner",
    "[class*='banner']",
    ".jumbotron",
    "[class*='jumbotron']"
  ],
  "Logo banner": [
    ".logo-banner",
    "[class*='logo-banner']",
    "[class*='logo']",
    ".banner",
    "[class*='banner']"
  ],
  "Collection list: Grid": [
    ".collection-grid",
    "[class*='collection'][class*='grid']",
    ".product-grid",
    "[class*='product-grid']",
    ".grid",
    "[class*='collection-list']"
  ],
  "Product highlight": [
    ".product-highlight",
    "[class*='product-highlight']",
    ".featured-product",
    "[class*='featured-product']",
    ".highlight"
  ],
  "Product card": [
    ".product-card",
    "[class*='product-card']",
    "[class*='productCard']",
    ".product-item",
    "[class*='product-item']",
    "[class*='productItem']",
    ".product",
    "[class*='product']:not([class*='product-grid']):not([class*='product-list'])",
    "[data-product]",
    ".card",
    "[class*='card']",
    "article",
    "[role='article']",
    ".item",
    "[class*='item']"
  ],
  "Featured collection": [
    ".featured-collection",
    "[class*='featured-collection']",
    ".featured-products",
    "[class*='featured-products']"
  ],
  "Collection list: Carousel": [
    ".collection-carousel",
    "[class*='carousel']",
    "[class*='slider']",
    ".product-carousel",
    "[class*='collection'][class*='carousel']"
  ],
  "Marquee": [
    ".marquee",
    "[class*='marquee']",
    ".scrolling-text",
    "[class*='scrolling']"
  ],
  "Footer": [
    "footer",
    ".footer",
    "#footer",
    "[class*='footer']",
    "[id*='footer']"
  ],
  "Logo": [
    ".logo",
    "[class*='logo']",
    "[id*='logo']",
    "img[alt*='logo' i]",
    "img[src*='logo' i]"
  ]
};

const BasicElementor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { createTheme, updateTheme } = useCustomThemes();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorInstance = useRef<any>(null);
  const stylePanelOpenAllowedRef = useRef<boolean>(false);
  const selectionFromStructureClickRef = useRef<boolean>(false);
  const originalThemeCssRef = useRef<string>(""); // Store original theme CSS
  const originalStylesheetLinksRef = useRef<string[]>([]); // Store original stylesheet links
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [themeName, setThemeName] = useState<string>("");
  const [currentDevice, setCurrentDevice] = useState<string>("desktop");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showStylePanel, setShowStylePanel] = useState<boolean>(false);
  const [showStructurePanel, setShowStructurePanel] = useState<boolean>(true);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    header: true,
    template: true,
    footer: true,
  });
  const [imagePanelData, setImagePanelData] = useState<{ component: any; src: string; alt: string } | null>(null);
  
  // Multi-page support
  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', name: 'Home', html: DEFAULT_PAGE_CONTENT, css: '' }
  ]);
  const pagesRef = useRef<Page[]>([
    { id: 'page-1', name: 'Home', html: DEFAULT_PAGE_CONTENT, css: '' }
  ]);
  const [currentPageId, setCurrentPageId] = useState<string>('page-1');

  const themeId = searchParams.get("id") || searchParams.get("themeId") || "";
  const themeType = searchParams.get("type") || "";

  // Helper function to discover and fetch multiple pages from a theme
  const discoverAndFetchPages = useCallback(async (
    baseUrl: string,
    mainHtml: string,
    mainCss: string,
    buildAuthHeaders: () => Record<string, string>
  ): Promise<Page[]> => {
    const discoveredPages: Page[] = [];
    
    try {
      // Parse HTML to discover page links
      const parser = new DOMParser();
      const doc = parser.parseFromString(mainHtml, 'text/html');
      
      // Discover pages from hyperlinks
      const pagePaths = new Set<string>();
      doc.querySelectorAll('a[href]').forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (!href) return;
        
        // Skip external links, anchors, mailto, tel, javascript
        if (/^(?:https?:|mailto:|tel:|javascript:|#|\/\/)/i.test(href)) return;
        
        // Extract page path (remove query params and hash)
        const cleanPath = href.split('?')[0].split('#')[0].trim();
        if (!cleanPath || cleanPath === 'index.html' || cleanPath === '/') return;
        
        // Normalize path (remove leading slash)
        const normalizedPath = cleanPath.replace(/^\/+/, '');
        if (normalizedPath && !pagePaths.has(normalizedPath)) {
          pagePaths.add(normalizedPath);
        }
      });
      
      console.log(`🔍 Discovered ${pagePaths.size} potential pages from hyperlinks:`, Array.from(pagePaths));
      
      // Helper to convert relative URLs to absolute
      const toAbsoluteUrl = (url: string): string => {
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
          return url.startsWith('//') ? 'https:' + url : url;
        }
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        if (url.startsWith('/')) {
          return `${normalizedBase}${url.replace(/^\/+/, '')}`;
        }
        try {
          return new URL(url, normalizedBase).href;
        } catch {
          return normalizedBase + url;
        }
      };
      
      // Fetch discovered pages
      const fetchPage = async (pagePath: string): Promise<Page | null> => {
        try {
          // Try different variations of the path
          const tryUrls = [];
          
          // If it already has .html, try as-is
          if (pagePath.toLowerCase().endsWith('.html')) {
            tryUrls.push(`${baseUrl}/${pagePath}?v=${Date.now()}`);
          } else {
            // Try as folder with index.html and as .html file
            tryUrls.push(`${baseUrl}/${pagePath}/index.html?v=${Date.now()}`);
            tryUrls.push(`${baseUrl}/${pagePath}.html?v=${Date.now()}`);
          }
          
          let pageHtml: string | null = null;
          let finalPageUrl = '';
          for (const url of tryUrls) {
            try {
              const pageRes = await fetch(url, {
                credentials: 'include',
                headers: buildAuthHeaders(),
              });
              if (pageRes.ok) {
                pageHtml = await pageRes.text();
                finalPageUrl = url;
                break;
              }
            } catch (e) {
              console.warn(`Failed to fetch page from ${url}:`, e);
            }
          }
          
          if (!pageHtml) {
            console.warn(`Could not fetch page: ${pagePath}`);
            return null;
          }
          
          // Parse the page HTML
          const pageDoc = parser.parseFromString(pageHtml, 'text/html');
          
          // Extract CSS for this page
          const extractPageStyles = async (doc: Document): Promise<string> => {
            const cssParts: string[] = [];
            
            // Fetch external stylesheets
            const linkPromises = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(async (link) => {
              const href = link.getAttribute('href');
              if (!href) return '';
              const absoluteUrl = toAbsoluteUrl(href);
              
              try {
                const cssResponse = await fetch(absoluteUrl, {
                  credentials: 'include',
                  headers: buildAuthHeaders(),
                });
                if (cssResponse.ok) {
                  return await cssResponse.text() || '';
                } else {
                  return `@import url('${absoluteUrl}');`;
                }
              } catch (err) {
                return `@import url('${absoluteUrl}');`;
              }
            });
            
            const fetchedCss = await Promise.all(linkPromises);
            cssParts.push(...fetchedCss.filter(css => css.trim()));
            
            // Add inline styles
            const inlineStyles = Array.from(doc.querySelectorAll('style'))
              .map((style) => style.textContent || '')
              .filter(style => style.trim());
            cssParts.push(...inlineStyles);
            
            return cssParts.join('\n\n').trim();
          };
          
          const pageSpecificCss = await extractPageStyles(pageDoc);
          const combinedPageCss = mainCss 
            ? (pageSpecificCss ? `${mainCss}\n\n/* Page-specific styles */\n${pageSpecificCss}` : mainCss)
            : pageSpecificCss;
          
          // Rewrite URLs in page (use page's base URL for relative paths)
          const pageBase = finalPageUrl ? finalPageUrl.replace(/\/[^/]*$/, '/') : baseUrl;
          const toAbsoluteUrlForPage = (url: string): string => {
            if (!url || /^(https?:|data:|mailto:|tel:|#)/i.test(url.trim())) return url;
            try {
              return new URL(url, pageBase).href;
            } catch {
              return pageBase + url.replace(/^\.\//, '');
            }
          };
          pageDoc.querySelectorAll('img[src]').forEach((el) => {
            const src = el.getAttribute('src');
            if (src) el.setAttribute('src', toAbsoluteUrlForPage(src));
          });
          pageDoc.querySelectorAll('a[href]').forEach((el) => {
            const href = el.getAttribute('href');
            if (href && !href.startsWith('#')) el.setAttribute('href', toAbsoluteUrlForPage(href));
          });
          pageDoc.querySelectorAll('[style*="url("]').forEach((el) => {
            const style = el.getAttribute('style');
            if (!style) return;
            const rewritten = style.replace(/url\((['"]?)([^'")]+)\1\)/gi, (m, q, path) => {
              const p = (path || '').trim();
              if (/^(https?:|data:|linear-gradient|radial-gradient|conic-gradient|none|initial)/i.test(p)) return m;
              return `url("${toAbsoluteUrlForPage(p)}")`;
            });
            el.setAttribute('style', rewritten);
          });
          
          // Remove style/link from body, strip GrapesJS CSS, preprocess for selectability
          pageDoc.body?.querySelectorAll('style').forEach((s) => s.remove());
          pageDoc.body?.querySelectorAll('link[rel="stylesheet"]').forEach((s) => s.remove());
          let pageBodyHtml = pageDoc.body ? pageDoc.body.innerHTML : pageHtml;
          pageBodyHtml = stripGrapesJSCanvasCss(pageBodyHtml);
          pageBodyHtml = preprocessHtmlForSelectability(pageBodyHtml);
          
          // Generate page ID and name from path
          const pageId = pagePath
            .replace(/\.html$/i, '')
            .replace(/\/index$/i, '')
            .replace(/\//g, '-')
            .replace(/[^a-z0-9-]/gi, '-')
            .toLowerCase() || `page-${Date.now()}`;
          
          const pageName = pagePath
            .replace(/\.html$/i, '')
            .replace(/\/index$/i, '')
            .split('/')
            .pop() || 'Page';
          
          // Capitalize first letter and replace hyphens with spaces
          const formattedName = pageName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return {
            id: pageId,
            name: formattedName,
            html: pageBodyHtml || DEFAULT_PAGE_CONTENT,
            css: combinedPageCss || '',
          };
        } catch (e) {
          console.error(`Error fetching page ${pagePath}:`, e);
          return null;
        }
      };
      
      // Fetch all discovered pages in parallel
      const pagePromises = Array.from(pagePaths).map(path => fetchPage(path));
      const fetchedPages = await Promise.all(pagePromises);
      
      // Filter out null results
      fetchedPages.forEach((page) => {
        if (page) {
          discoveredPages.push(page);
        }
      });
      
      console.log(`✅ Successfully discovered and fetched ${discoveredPages.length} additional pages`);
    } catch (err) {
      console.error('Error discovering pages:', err);
    }
    
    return discoveredPages;
  }, []);

  // Load theme HTML/CSS into GrapesJS - MUST be defined before useEffect that uses it
  const loadThemeIntoEditor = useCallback(async (editor: any) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const cacheBuster = `?v=${Date.now()}`;

      const getUserIdFromToken = (): string | null => {
        try {
          const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          if (!token) return null;
          const parts = token.split('.');
          if (parts.length < 2) return null;
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          return String(payload.uid || payload.userId || payload.id || '');
        } catch {
          return null;
        }
      };

      const buildAuthHeaders = (): Record<string, string> => {
        const headers: Record<string, string> = {};
        const token =
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken') ||
          localStorage.getItem('token') ||
          sessionStorage.getItem('token');
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
      };

      const userId = getUserIdFromToken();

      // Determine theme URL based on type parameter
      // Check if themeId is a valid ObjectId (custom theme) or installed theme
      const isValidObjectId = themeId && /^[0-9a-fA-F]{24}$/.test(themeId);
      let htmlUrl = '';
      
      // If type is "installed", use installed theme endpoint
      if (themeType === "installed") {
        const installedBase = activeStoreId
          ? `${apiBase}/themes/installed/${activeStoreId}/${themeId}/unzippedTheme`
          : (userId ? `${apiBase}/themes/installed/${userId}/${themeId}/unzippedTheme` : null);

        if (installedBase) {
          htmlUrl = `${installedBase}/index.html${cacheBuster}`;
          console.log('✓ Using installed theme:', htmlUrl);
        } else {
          throw new Error('Store ID or User ID required for installed themes');
        }
      } else if (isValidObjectId) {
        // For custom themes (valid ObjectId), use custom-themes endpoint
        htmlUrl = `${apiBase}/custom-themes/${themeId}/files/index.html${cacheBuster}`;
        console.log('✓ Using custom theme:', htmlUrl);
      } else {
        // Fallback: try preview endpoint
        htmlUrl = `${apiBase}/themes/preview/${themeId}${cacheBuster}`;
        console.log('✓ Using preview theme:', htmlUrl);
      }

      console.log('Fetching theme from:', htmlUrl);
      const htmlResponse = await fetch(htmlUrl, { 
        credentials: 'include',
        headers: buildAuthHeaders()
      });
      if (!htmlResponse.ok) {
        const errorText = await htmlResponse.text().catch(() => 'Unknown error');
        let errorMessage = `Failed to load theme HTML: ${htmlResponse.status} ${htmlResponse.statusText}. ${errorText}`;
        
        // Provide more helpful error messages
        if (htmlResponse.status === 404) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.includes('not found')) {
              errorMessage = `Theme not found. The theme with ID "${themeId}" does not exist in the database. Please create a new theme or use an existing theme ID.`;
            }
          } catch {
            // If error text is not JSON, use default message
          }
        } else if (htmlResponse.status === 401) {
          errorMessage = `Authentication failed. Please log in again and try loading the theme.`;
        }
        
        throw new Error(errorMessage);
      }
      
      let htmlContent = await htmlResponse.text();
      
      // Determine base URL for resolving relative CSS paths
      const baseUrl = htmlUrl.substring(0, htmlUrl.lastIndexOf('/') + 1);
      
      // Extract CSS from <style> tags
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      let cssContent = '';
      let match;
      while ((match = styleRegex.exec(htmlContent)) !== null) {
        cssContent += match[1] + '\n';
      }

      // Extract <link rel="stylesheet"> tags and their URLs
      const linkRegex = /<link[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi;
      const stylesheetLinks: string[] = [];
      let linkMatch;
      while ((linkMatch = linkRegex.exec(htmlContent)) !== null) {
        const linkTag = linkMatch[0];
        const hrefMatch = linkTag.match(/href\s*=\s*["']([^"']+)["']/i);
        if (hrefMatch && hrefMatch[1]) {
          let cssUrl = hrefMatch[1];
          // Resolve relative URLs
          if (cssUrl.startsWith('./') || cssUrl.startsWith('../') || !cssUrl.startsWith('http')) {
            if (cssUrl.startsWith('./')) {
              cssUrl = baseUrl + cssUrl.substring(2);
            } else if (cssUrl.startsWith('../')) {
              // Handle relative paths
              const parts = baseUrl.split('/').filter(p => p);
              const cssParts = cssUrl.split('/').filter(p => p);
              for (const part of cssParts) {
                if (part === '..') {
                  parts.pop();
                } else if (part !== '.') {
                  parts.push(part);
                }
              }
              cssUrl = parts.join('/');
              if (!cssUrl.startsWith('http')) {
                cssUrl = baseUrl.replace(/\/[^\/]*$/, '/') + cssUrl;
              }
            } else {
              cssUrl = baseUrl + cssUrl;
            }
          }
          stylesheetLinks.push(cssUrl);
        }
      }

      // Store original stylesheet links for later CSS extraction
      originalStylesheetLinksRef.current = stylesheetLinks;

      // Helper to check if URL is external CDN
      const isExternalCDN = (url: string): boolean => {
        try {
          const urlObj = new URL(url);
          const hostname = urlObj.hostname.toLowerCase();
          return hostname.includes('googleapis.com') ||
                 hostname.includes('cdnjs.cloudflare.com') ||
                 hostname.includes('stackpath.bootstrapcdn.com') ||
                 hostname.includes('cdn.jsdelivr.net') ||
                 hostname.includes('unpkg.com') ||
                 hostname.includes('fonts.googleapis.com') ||
                 hostname.includes('fonts.gstatic.com');
        } catch {
          return false;
        }
      };

      // Helper to convert relative URLs to absolute (used for HTML and CSS)
      const toAbsoluteUrl = (url: string): string => {
        if (!url || /^(https?:|data:|mailto:|tel:|javascript:|\/\/|#)/i.test((url || '').trim())) return url || '';
        try {
          return new URL(url, baseUrl).href;
        } catch {
          return baseUrl + url.replace(/^\.\//, '');
        }
      };

      // Helper to rewrite url() in CSS with correct base
      const rewriteCssUrls = (css: string, cssBaseUrl: string): string => {
        return css.replace(/url\((['"]?)([^'")]+)\1\)/gi, (m, _q, path) => {
          const p = (path || '').trim();
          if (/^(https?:|data:|linear-gradient|radial-gradient|conic-gradient|none|initial)/i.test(p)) return m;
          try {
            return `url("${new URL(p, cssBaseUrl).href}")`;
          } catch {
            return m;
          }
        });
      };

      // Rewrite inline CSS urls (base = page)
      let originalCssContent = rewriteCssUrls(cssContent || '', baseUrl);

      // Custom themes from CustomThemeBuilder: content is in ziplofy-pages-data JSON, not in body
      let extractedPagesFromCustomTheme: { html: string; css: string }[] | null = null;
      const pagesDataMatch = htmlContent.match(/<script id="ziplofy-pages-data"[^>]*>([\s\S]*?)<\/script>/i);
      if (pagesDataMatch && pagesDataMatch[1]) {
        try {
          const parsed = JSON.parse(pagesDataMatch[1].trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            extractedPagesFromCustomTheme = parsed.map((p: any) => ({
              html: p?.html || '',
              css: p?.css || ''
            }));
            console.log('✓ Loaded custom theme with', extractedPagesFromCustomTheme.length, 'page(s) from ziplofy-pages-data');
          }
        } catch (e) {
          console.warn('Failed to parse ziplofy-pages-data:', e);
        }
      }

      // Fetch and store original CSS content from external stylesheets
      const fetchStylesheetPromises = stylesheetLinks.map(async (cssUrl) => {
        const absoluteUrl = toAbsoluteUrl(cssUrl);
        
        // For external CDNs, use @import to avoid CORS issues
        if (isExternalCDN(absoluteUrl)) {
          console.log(`Using @import for external CDN: ${absoluteUrl}`);
          return `@import url('${absoluteUrl}');`;
        }
        
        // For internal resources, try to fetch with credentials and auth headers
        try {
          const cssResponse = await fetch(absoluteUrl, { 
            credentials: 'include',
            headers: buildAuthHeaders()
          });
          if (cssResponse.ok) {
            const cssText = await cssResponse.text();
            // Rewrite url() relative to this stylesheet's location
            const rewritten = rewriteCssUrls(cssText, absoluteUrl);
            console.log('✓ Fetched external CSS:', absoluteUrl, cssText.length, 'chars');
            return rewritten || '';
          } else {
            console.warn(`Failed to fetch CSS from ${absoluteUrl}:`, cssResponse.status);
            return `@import url('${absoluteUrl}');`;
          }
        } catch (err) {
          console.warn(`Error fetching CSS from ${absoluteUrl}, using @import:`, err);
          return `@import url('${absoluteUrl}');`;
        }
      });
      
      const fetchedCss = await Promise.all(fetchStylesheetPromises);
      const externalCss = fetchedCss.filter(css => css.trim()).join('\n\n');
      if (externalCss) {
        originalCssContent += '\n\n' + externalCss;
      }
      
      // Store original CSS for later use when saving
      originalThemeCssRef.current = originalCssContent;
      console.log('✓ Stored original theme CSS:', originalCssContent.length, 'chars');

      // Parse with DOMParser for proper handling and URL rewriting
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Rewrite relative URLs in HTML (images, links, background images)
      doc.querySelectorAll('img[src]').forEach((el) => {
        const src = el.getAttribute('src');
        if (src) el.setAttribute('src', toAbsoluteUrl(src));
      });
      doc.querySelectorAll('a[href]').forEach((el) => {
        const href = el.getAttribute('href');
        if (href && !href.startsWith('#')) el.setAttribute('href', toAbsoluteUrl(href));
      });
      doc.querySelectorAll('[style*="url("]').forEach((el) => {
        const style = el.getAttribute('style');
        if (!style) return;
        const rewritten = style.replace(/url\((['"]?)([^'")]+)\1\)/gi, (m, q, path) => {
          const p = (path || '').trim();
          if (/^(https?:|data:|linear-gradient|radial-gradient|conic-gradient|none|initial)/i.test(p)) return m;
          return `url("${toAbsoluteUrl(p)}")`;
        });
        el.setAttribute('style', rewritten);
      });
      
      // Remove scripts, style, link from body
      doc.querySelectorAll('script').forEach((s) => s.remove());
      doc.querySelectorAll('style').forEach((s) => s.remove());
      doc.querySelectorAll('link[rel="stylesheet"]').forEach((s) => s.remove());
      
      // Get body HTML: use ziplofy-pages-data first page if custom theme, else body innerHTML
      let bodyHtml: string;
      if (extractedPagesFromCustomTheme && extractedPagesFromCustomTheme.length > 0) {
        const rawPageHtml = extractedPagesFromCustomTheme[0].html || '';
        const pageDoc = new DOMParser().parseFromString(`<div>${rawPageHtml}</div>`, 'text/html');
        pageDoc.querySelectorAll('img[src]').forEach((el) => {
          const src = el.getAttribute('src');
          if (src) el.setAttribute('src', toAbsoluteUrl(src));
        });
        pageDoc.querySelectorAll('a[href]').forEach((el) => {
          const href = el.getAttribute('href');
          if (href && !href.startsWith('#')) el.setAttribute('href', toAbsoluteUrl(href));
        });
        pageDoc.querySelectorAll('[style*="url("]').forEach((el) => {
          const style = el.getAttribute('style');
          if (!style) return;
          const rewritten = style.replace(/url\((['"]?)([^'")]+)\1\)/gi, (m, q, path) => {
            const p = (path || '').trim();
            if (/^(https?:|data:|linear-gradient|radial-gradient|conic-gradient|none|initial)/i.test(p)) return m;
            return `url("${toAbsoluteUrl(p)}")`;
          });
          el.setAttribute('style', rewritten);
        });
        const wrapper = pageDoc.body?.querySelector('div');
        bodyHtml = wrapper ? wrapper.innerHTML : rawPageHtml;
        const pageCss = extractedPagesFromCustomTheme[0].css || '';
        if (pageCss.trim()) {
          const rewrittenPageCss = rewriteCssUrls(pageCss.trim(), baseUrl);
          originalCssContent = (originalCssContent || '').trim() + '\n\n' + rewrittenPageCss;
        }
      } else {
        bodyHtml = doc.body ? doc.body.innerHTML : htmlContent;
      }
      bodyHtml = stripGrapesJSCanvasCss(bodyHtml);
      bodyHtml = preprocessHtmlForSelectability(bodyHtml);
      
      const contentToUse = bodyHtml || DEFAULT_PAGE_CONTENT;

      // Discover and fetch additional pages
      const discoveredPages = await discoverAndFetchPages(
        baseUrl,
        htmlContent,
        originalCssContent,
        buildAuthHeaders
      );
      
      // Create main page (Home) from fetched HTML
      const mainPage: Page = {
        id: 'page-1',
        name: 'Home',
        html: contentToUse,
        css: originalCssContent
      };
      
      // Combine main page with discovered pages
      const allPages = [mainPage, ...discoveredPages];
      
      // Update pages state
      setPages(allPages);
      pagesRef.current = allPages;
      setCurrentPageId('page-1');
      
      console.log(`✅ Loaded ${allPages.length} pages:`, allPages.map(p => ({ id: p.id, name: p.name })));
      
      // Set HTML in editor (main page)
      editor.setComponents(contentToUse);
      
      // CRITICAL: Expand nested HTML and configure ALL components for full selectability (every element, smallest to largest)
      setTimeout(() => {
        try {
          const wrapper = editor.getWrapper();
          if (!wrapper) return;
          
          const expandComponentContent = (comp: any): boolean => {
            if (!comp) return false;
            let changed = false;
            const content = comp.get?.('content');
            const children = comp.components?.();
            const hasHtmlContent = typeof content === 'string' && /<[a-z][a-z0-9]*[\s>]/i.test(content);
            if (hasHtmlContent && (!children || children.length === 0)) {
              try {
                comp.set('content', '', { silent: true });
                const appended = comp.append?.(content);
                if (appended?.length) {
                  changed = true;
                } else {
                  comp.set('content', content, { silent: true });
                }
              } catch {
                comp.set('content', content, { silent: true });
              }
            }
            (comp.components?.() || []).forEach((c: any) => { if (expandComponentContent(c)) changed = true; });
            return changed;
          };
          wrapper.components?.().forEach((c: any) => expandComponentContent(c));
          
          const CONTAINER_TAGS = new Set(['div', 'section', 'main', 'article', 'header', 'footer', 'nav', 'aside', 'form', 'ul', 'ol', 'li', 'figure', 'figcaption']);
          const TEXT_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup', 'blockquote', 'cite', 'img']);
          const configureAllNested = (comp: any) => {
            if (!comp) return;
            try {
              const tagName = (comp.get?.('tagName') || '').toLowerCase();
              const attrs = comp.getAttributes?.() || {};
              const isDroppable = attrs['data-gjs-droppable'] === '*' || CONTAINER_TAGS.has(tagName);
              const hasText = typeof comp.get?.('content') === 'string' && (comp.get('content') || '').trim().length > 0;
              const isEditable = attrs['data-gjs-editable'] === 'true' || attrs['data-gjs-type'] === 'text' || TEXT_TAGS.has(tagName) || (hasText && (!comp.components?.() || comp.components().length === 0));
              comp.set({
                selectable: true,
                hoverable: true,
                draggable: true,
                stylable: true,
                droppable: isDroppable ? '*' : false,
                editable: isEditable,
              }, { silent: true });
              (comp.components?.() || []).forEach((c: any) => configureAllNested(c));
            } catch {}
          };
          wrapper.set({ droppable: true, selectable: true, editable: false, draggable: false, hoverable: true, stylable: true }, { silent: true });
          if (!wrapper.getClasses().includes('gjs-wrapper-body')) wrapper.addClass('gjs-wrapper-body');
          wrapper.components?.().forEach((c: any) => configureAllNested(c));
          if (wrapper.view?.render) wrapper.view.render();
          console.log('✓ Configured all elements for full selectability');
        } catch (e) {
          console.warn('Configure selectability:', e);
        }
      }, 100);
      
      // Function to inject CSS into canvas
      const injectCSS = () => {
        try {
          const canvas = editor.Canvas;
          if (!canvas) {
            console.warn('Canvas not available yet');
            return false;
          }
          
          const frame = canvas.getFrameEl();
          if (!frame || !frame.contentDocument) {
            console.warn('Frame or frame document not available');
            return false;
          }
          
          const doc = frame.contentDocument;
          const head = doc.head || doc.getElementsByTagName('head')[0];
          
          if (!head) {
            console.warn('Head element not found');
            return false;
          }
          
          // Remove existing theme styles and our preserve-color style
          const existingStyles = head.querySelectorAll('#ziplofy-theme-styles, #ziplofy-preserve-text-color, #ziplofy-slider-fix, style[data-ziplofy-theme], link[data-ziplofy-theme]');
          existingStyles.forEach((style: Element) => style.remove());
          
          // Inject preserve-text-color CSS first (so theme can override if needed, but we override GrapesJS black)
          const preserveEl = doc.createElement('style');
          preserveEl.id = 'ziplofy-preserve-text-color';
          preserveEl.setAttribute('data-ziplofy-basic-elementor', 'true');
          preserveEl.textContent = PRESERVE_TEXT_COLOR_CSS;
          head.appendChild(preserveEl);
          const sliderFixEl = doc.createElement('style');
          sliderFixEl.id = 'ziplofy-slider-fix';
          sliderFixEl.setAttribute('data-ziplofy-theme', 'true');
          sliderFixEl.textContent = SLIDER_FIX_CSS;
          head.appendChild(sliderFixEl);
          
          // Inject full combined CSS (inline + external) so theme loads completely
          const fullCss = (originalCssContent || cssContent || '').trim();
          if (fullCss) {
            const styleEl = doc.createElement('style');
            styleEl.id = 'ziplofy-theme-styles';
            styleEl.setAttribute('data-ziplofy-theme', 'true');
            styleEl.textContent = fullCss;
            head.appendChild(styleEl);
            console.log('✓ Injected theme CSS (combined:', fullCss.length, 'chars)');
          }
          
          // Inject external stylesheets
          stylesheetLinks.forEach((cssUrl, index) => {
            const linkEl = doc.createElement('link');
            linkEl.rel = 'stylesheet';
            linkEl.href = cssUrl;
            linkEl.setAttribute('data-ziplofy-theme', 'true');
            linkEl.crossOrigin = 'anonymous';
            linkEl.onerror = () => {
              console.warn(`Failed to load stylesheet: ${cssUrl}`);
            };
            linkEl.onload = () => {
              console.log(`✓ Loaded stylesheet: ${cssUrl}`);
            };
            head.appendChild(linkEl);
          });
          
          // Handle @import statements in CSS
          if (fullCss) {
            const importMatches = cssContent.matchAll(/@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?/gi);
            for (const match of importMatches) {
              let importUrl = match[1];
              // Resolve relative @import URLs
              if (!importUrl.startsWith('http') && !importUrl.startsWith('//')) {
                if (importUrl.startsWith('./') || importUrl.startsWith('../')) {
                  const parts = baseUrl.split('/').filter(p => p);
                  const importParts = importUrl.split('/').filter(p => p);
                  for (const part of importParts) {
                    if (part === '..') {
                      parts.pop();
                    } else if (part !== '.') {
                      parts.push(part);
                    }
                  }
                  importUrl = parts.join('/');
                  if (!importUrl.startsWith('http')) {
                    importUrl = baseUrl.replace(/\/[^\/]*$/, '/') + importUrl;
                  }
                } else {
                  importUrl = baseUrl + importUrl;
                }
              }
              
              const existingLink = Array.from(head.querySelectorAll('link[rel="stylesheet"]'))
                .find((link: any) => link.href === importUrl || link.href.endsWith(importUrl));
              if (!existingLink && importUrl) {
                const linkEl = doc.createElement('link');
                linkEl.rel = 'stylesheet';
                linkEl.href = importUrl;
                linkEl.setAttribute('data-ziplofy-theme', 'true');
                linkEl.crossOrigin = 'anonymous';
                head.appendChild(linkEl);
                console.log(`✓ Added @import stylesheet: ${importUrl}`);
              }
            }
          }
          
          return true;
        } catch (e) {
          console.error('Error injecting CSS:', e);
          return false;
        }
      };
      
      // Try to inject CSS with retries
      let retries = 0;
      const maxRetries = 15;
      const tryInject = () => {
        if (injectCSS()) {
          console.log('✓ CSS injection successful');
          return;
        }
        retries++;
        if (retries < maxRetries) {
          setTimeout(tryInject, 200);
        } else {
          console.error('Failed to inject CSS after multiple retries');
          // Fallback: use editor.setStyle with full combined CSS
          const fallbackCss = (originalCssContent || cssContent || '').trim();
          if (fallbackCss) {
            try {
              editor.setStyle(fallbackCss);
              console.log('✓ Applied CSS via editor.setStyle fallback');
            } catch (styleErr) {
              console.error('Failed to set CSS via editor.setStyle:', styleErr);
            }
          }
        }
      };
      
      // Start injection attempts - multiple attempts to catch canvas at different stages
      setTimeout(tryInject, 100);
      setTimeout(tryInject, 300);
      setTimeout(tryInject, 500);
      setTimeout(tryInject, 800);
      setTimeout(tryInject, 1200);
      setTimeout(tryInject, 2000);

      console.log('✓ Theme loaded into GrapesJS editor');
    } catch (e: any) {
      console.error('Failed to load theme:', e);
      setError(e?.message || 'Failed to load theme. Please check the console for details.');
      throw e;
    }
  }, [themeId, themeType, activeStoreId]);

  // Initialize GrapesJS editor
  useEffect(() => {
    if (!themeId) {
      setError("No theme ID provided. Please select a theme to edit.");
      setLoading(false);
      return;
    }

    const initEditor = async () => {
      // Wait for editorRef to be available
      let retries = 0;
      while (!editorRef.current && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (!editorRef.current) {
        setError('Editor container not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch theme name
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const buildAuthHeaders = (): Record<string, string> => {
          const headers: Record<string, string> = {};
          const token =
            localStorage.getItem('accessToken') ||
            sessionStorage.getItem('accessToken') ||
            localStorage.getItem('token') ||
            sessionStorage.getItem('token');
          if (token) headers.Authorization = `Bearer ${token}`;
          return headers;
        };
        
        try {
          // Check if themeId is a valid ObjectId (custom theme)
          const isValidObjectId = themeId && /^[0-9a-fA-F]{24}$/.test(themeId);
          let nameUrl = '';
          
          if (isValidObjectId && themeType !== 'installed') {
            // Custom theme endpoint
            nameUrl = `${apiBase}/custom-themes/${themeId}`;
          } else {
            // Installed/preview theme endpoint
            nameUrl = `${apiBase}/themes/${themeId}`;
          }
          
          const tRes = await fetch(nameUrl, { 
            credentials: 'include',
            headers: buildAuthHeaders()
          });
          if (tRes.ok) {
            const t = await tRes.json();
            const nm = (t?.data?.name) || (t?.name) || "Theme";
            setThemeName(nm);
          }
        } catch {}

        // Load preset (same as Visual Elementor) - required for StyleManager to work
        const presetWebpage = (await import('grapesjs-preset-webpage')).default;

        // Initialize GrapesJS - use preset like Visual Elementor so StyleManager renders correctly
        const editor = grapesjs.init({
          container: editorRef.current,
          height: '100%',
          width: '100%',
          fromElement: false,
          storageManager: false,
          avoidInlineStyle: false,
          plugins: [presetWebpage],
          pluginsOpts: { [presetWebpage as unknown as string]: {} },
          deviceManager: {
            default: 'Desktop',
            devices: [
              { id: 'Desktop', name: 'Desktop', width: '1280px' },
              { id: 'Tablet', name: 'Tablet', width: '768px', widthMedia: '992px' },
              { id: 'Mobile', name: 'Mobile', width: '375px', widthMedia: '768px' },
            ],
          },
          selectorManager: { 
            componentFirst: true,
          },
          colorPicker: {
            appendTo: 'body',
            showInput: true,
          },
          styleManager: {
            appendTo: '#style-panel-wrapper',
            sectors: [
              {
                name: 'Quick styles',
                open: true,
                properties: [
                  {
                    type: 'select',
                    property: 'text-align',
                    label: 'Text align',
                    options: [
                      { id: 'left', label: 'Left' },
                      { id: 'center', label: 'Center' },
                      { id: 'right', label: 'Right' },
                      { id: 'justify', label: 'Justify' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'font-weight',
                    label: 'Font weight',
                    options: [
                      { id: '300', label: 'Light' },
                      { id: '400', label: 'Normal' },
                      { id: '500', label: 'Medium' },
                      { id: '600', label: 'Semi bold' },
                      { id: '700', label: 'Bold' },
                      { id: '800', label: 'Extra bold' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'font-size',
                    label: 'Font size',
                    options: [
                      { id: '12px', label: '12px' },
                      { id: '14px', label: '14px' },
                      { id: '16px', label: '16px' },
                      { id: '18px', label: '18px' },
                      { id: '20px', label: '20px' },
                      { id: '24px', label: '24px' },
                      { id: '28px', label: '28px' },
                      { id: '32px', label: '32px' },
                      { id: '40px', label: '40px' },
                      { id: '48px', label: '48px' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'font-style',
                    label: 'Font style',
                    options: [
                      { id: 'normal', label: 'Normal' },
                      { id: 'italic', label: 'Italic' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'text-decoration',
                    label: 'Text decoration',
                    options: [
                      { id: 'none', label: 'None' },
                      { id: 'underline', label: 'Underline' },
                      { id: 'line-through', label: 'Line through' },
                      { id: 'overline', label: 'Overline' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'text-transform',
                    label: 'Text transform',
                    options: [
                      { id: 'none', label: 'None' },
                      { id: 'uppercase', label: 'Uppercase' },
                      { id: 'lowercase', label: 'Lowercase' },
                      { id: 'capitalize', label: 'Capitalize' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'line-height',
                    label: 'Line height',
                    options: [
                      { id: '1', label: '1' },
                      { id: '1.25', label: '1.25' },
                      { id: '1.5', label: '1.5' },
                      { id: '1.75', label: '1.75' },
                      { id: '2', label: '2' },
                      { id: 'normal', label: 'Normal' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'letter-spacing',
                    label: 'Letter spacing',
                    options: [
                      { id: 'normal', label: 'Normal' },
                      { id: '-0.5px', label: 'Tight' },
                      { id: '0.5px', label: 'Slightly wide' },
                      { id: '1px', label: 'Wide' },
                      { id: '2px', label: 'Wider' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'display',
                    label: 'Display',
                    options: [
                      { id: 'block', label: 'Block' },
                      { id: 'flex', label: 'Flex' },
                      { id: 'grid', label: 'Grid' },
                      { id: 'inline-block', label: 'Inline block' },
                      { id: 'inline', label: 'Inline' },
                      { id: 'inline-flex', label: 'Inline flex' },
                      { id: 'none', label: 'None' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'flex-direction',
                    label: 'Flex direction',
                    options: [
                      { id: 'row', label: 'Row' },
                      { id: 'row-reverse', label: 'Row reverse' },
                      { id: 'column', label: 'Column' },
                      { id: 'column-reverse', label: 'Column reverse' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'justify-content',
                    label: 'Justify content',
                    options: [
                      { id: 'flex-start', label: 'Start' },
                      { id: 'center', label: 'Center' },
                      { id: 'flex-end', label: 'End' },
                      { id: 'space-between', label: 'Space between' },
                      { id: 'space-around', label: 'Space around' },
                      { id: 'space-evenly', label: 'Space evenly' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'align-items',
                    label: 'Align items',
                    options: [
                      { id: 'flex-start', label: 'Start' },
                      { id: 'center', label: 'Center' },
                      { id: 'flex-end', label: 'End' },
                      { id: 'stretch', label: 'Stretch' },
                      { id: 'baseline', label: 'Baseline' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'gap',
                    label: 'Gap',
                    options: [
                      { id: '0', label: 'None' },
                      { id: '4px', label: '4px' },
                      { id: '8px', label: '8px' },
                      { id: '12px', label: '12px' },
                      { id: '16px', label: '16px' },
                      { id: '24px', label: '24px' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'position',
                    label: 'Position',
                    options: [
                      { id: 'static', label: 'Static' },
                      { id: 'relative', label: 'Relative' },
                      { id: 'absolute', label: 'Absolute' },
                      { id: 'fixed', label: 'Fixed' },
                      { id: 'sticky', label: 'Sticky' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'width',
                    label: 'Width',
                    options: [
                      { id: 'auto', label: 'Auto' },
                      { id: '100%', label: '100%' },
                      { id: '50%', label: '50%' },
                      { id: '33.33%', label: '33%' },
                      { id: '25%', label: '25%' },
                      { id: 'fit-content', label: 'Fit content' },
                      { id: 'max-content', label: 'Max content' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'padding',
                    label: 'Padding',
                    options: [
                      { id: '0', label: 'None' },
                      { id: '4px', label: '4px' },
                      { id: '8px', label: '8px' },
                      { id: '12px', label: '12px' },
                      { id: '16px', label: '16px' },
                      { id: '24px', label: '24px' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'margin',
                    label: 'Margin',
                    options: [
                      { id: '0', label: 'None' },
                      { id: '4px', label: '4px' },
                      { id: '8px', label: '8px' },
                      { id: '12px', label: '12px' },
                      { id: '16px', label: '16px' },
                      { id: '24px', label: '24px' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'border-radius',
                    label: 'Rounded corners',
                    options: [
                      { id: '0', label: 'None' },
                      { id: '4px', label: 'Small' },
                      { id: '8px', label: 'Medium' },
                      { id: '12px', label: 'Large' },
                      { id: '16px', label: 'X-Large' },
                      { id: '9999px', label: 'Pill' },
                      { id: '50%', label: 'Circle' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'overflow',
                    label: 'Overflow',
                    options: [
                      { id: 'visible', label: 'Visible' },
                      { id: 'hidden', label: 'Hidden' },
                      { id: 'scroll', label: 'Scroll' },
                      { id: 'auto', label: 'Auto' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'opacity',
                    label: 'Opacity',
                    options: [
                      { id: '1', label: '100%' },
                      { id: '0.9', label: '90%' },
                      { id: '0.75', label: '75%' },
                      { id: '0.5', label: '50%' },
                      { id: '0.25', label: '25%' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'cursor',
                    label: 'Cursor',
                    options: [
                      { id: 'default', label: 'Default' },
                      { id: 'pointer', label: 'Pointer' },
                      { id: 'text', label: 'Text' },
                      { id: 'not-allowed', label: 'Not allowed' },
                      { id: 'grab', label: 'Grab' },
                      { id: 'move', label: 'Move' },
                      { id: 'zoom-in', label: 'Zoom in' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'visibility',
                    label: 'Visibility',
                    options: [
                      { id: 'visible', label: 'Visible' },
                      { id: 'hidden', label: 'Hidden' },
                      { id: 'collapse', label: 'Collapse' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'vertical-align',
                    label: 'Vertical align',
                    options: [
                      { id: 'baseline', label: 'Baseline' },
                      { id: 'top', label: 'Top' },
                      { id: 'middle', label: 'Middle' },
                      { id: 'bottom', label: 'Bottom' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'white-space',
                    label: 'White space',
                    options: [
                      { id: 'normal', label: 'Normal' },
                      { id: 'nowrap', label: 'No wrap' },
                      { id: 'pre', label: 'Pre' },
                      { id: 'pre-wrap', label: 'Pre wrap' },
                      { id: 'pre-line', label: 'Pre line' },
                    ],
                  },
                ],
              },
              {
                name: 'Layout',
                open: true,
                buildProps: ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'padding', 'margin', 'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'overflow', 'overflow-x', 'overflow-y', 'box-sizing', 'float', 'clear'],
              },
              {
                name: 'Typography',
                open: true,
                buildProps: ['font-family', 'font-size', 'font-weight', 'font-style', 'font-variant', 'text-decoration', 'text-align', 'text-transform', 'text-indent', 'line-height', 'letter-spacing', 'word-spacing', 'white-space', 'color', 'text-shadow', 'text-overflow', 'word-wrap'],
              },
              {
                name: 'Background',
                open: true,
                buildProps: ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-size', 'background-attachment'],
              },
              {
                name: 'Border',
                open: true,
                buildProps: ['border', 'border-width', 'border-style', 'border-color', 'border-radius', 'border-top', 'border-right', 'border-bottom', 'border-left', 'box-shadow', 'outline', 'outline-width', 'outline-style', 'outline-color'],
              },
              {
                name: 'Flexbox',
                open: false,
                buildProps: ['flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'align-self', 'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'order', 'gap', 'row-gap', 'column-gap'],
              },
              {
                name: 'Grid',
                open: false,
                buildProps: ['grid-template-columns', 'grid-template-rows', 'gap', 'row-gap', 'column-gap', 'justify-items', 'align-items'],
              },
              {
                name: 'Spacing',
                open: false,
                buildProps: ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
              },
              {
                name: 'Effects',
                open: false,
                properties: [
                  {
                    type: 'select',
                    property: 'opacity',
                    label: 'Transparency',
                    options: [
                      { id: '1', label: '100% — Fully visible' },
                      { id: '0.9', label: '90%' },
                      { id: '0.75', label: '75%' },
                      { id: '0.5', label: '50% — Half visible' },
                      { id: '0.25', label: '25%' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'box-shadow',
                    label: 'Shadow',
                    options: [
                      { id: 'none', label: 'None' },
                      { id: '0 1px 3px rgba(0,0,0,0.1)', label: 'Subtle' },
                      { id: '0 4px 12px rgba(0,0,0,0.15)', label: 'Medium' },
                      { id: '0 8px 24px rgba(0,0,0,0.2)', label: 'Strong' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'transition',
                    label: 'Hover animation',
                    options: [
                      { id: 'none', label: 'None' },
                      { id: 'all 0.15s ease', label: 'Quick' },
                      { id: 'all 0.3s ease', label: 'Medium' },
                      { id: 'all 0.5s ease', label: 'Slow' },
                    ],
                  },
                  {
                    type: 'select',
                    property: 'filter',
                    label: 'Blur',
                    options: [
                      { id: 'none', label: 'None' },
                      { id: 'blur(2px)', label: 'Light' },
                      { id: 'blur(4px)', label: 'Medium' },
                      { id: 'blur(8px)', label: 'Heavy' },
                    ],
                  },
                ],
              },
              {
                name: 'List',
                open: false,
                buildProps: ['list-style', 'list-style-type', 'list-style-position'],
              },
            ],
            showComputed: true,
          },
          // Don't auto-render default panels - we'll render StyleManager manually
          panels: { defaults: [] },
          canvas: {
            styles: [
              'data:text/css;charset=utf-8,' + encodeURIComponent(PRESERVE_TEXT_COLOR_CSS),
            ],
          },
        });

        editorInstance.current = editor;

        // Set initial device and unified responsive view
        setTimeout(() => {
          if (editor && editor.setDevice) {
            const deviceNameMap: Record<string, string> = {
              'desktop': 'Desktop',
              'tablet': 'Tablet',
              'mobile': 'Mobile'
            };
            const capitalizedDevice = deviceNameMap[currentDevice] || currentDevice;
            editor.setDevice(capitalizedDevice);
            applyResponsiveView(editor, currentDevice);
            setTimeout(() => applyResponsiveView(editor, currentDevice), 100);
            setTimeout(() => applyResponsiveView(editor, currentDevice), 300);
          }
        }, 100);
        
        // Listen for GrapesJS device change - apply unified responsive view
        editor.on('change:device', () => {
          setTimeout(() => {
            const dev = (editor as any).getDevice?.() || editor.DeviceManager?.getSelected?.()?.get?.('id');
            applyResponsiveView(editor, dev || currentDevice);
          }, 50);
        });

        // CRITICAL: Configure StyleManager container after editor is ready
        // StyleManager needs the container element to exist before it can render
        setTimeout(() => {
          const stylePanelWrapper = document.querySelector('#style-panel-wrapper');
          if (stylePanelWrapper && editor.StyleManager) {
            try {
              // Get StyleManager's container configuration
              const sm = editor.StyleManager as any;
              
              // Set the container directly if possible
              if (sm.setContainer) {
                sm.setContainer(stylePanelWrapper);
              } else if (sm.container) {
                // Update container reference
                sm.container.el = stylePanelWrapper;
                sm.container = stylePanelWrapper;
              }
              
              console.log('✓ StyleManager container configured:', {
                wrapperExists: !!stylePanelWrapper,
                wrapperId: stylePanelWrapper.id,
                hasSetContainer: typeof sm.setContainer === 'function',
                hasContainer: !!sm.container
              });
            } catch (e) {
              console.warn('Could not update StyleManager container:', e);
            }
          }
          
          if (editor.StyleManager) {
            try {
              const sectors = editor.StyleManager.getSectors();
              console.log('✓ StyleManager available:', {
                sectors: sectors?.length || 0,
                sectorNames: sectors?.map((s: any) => (s.getName ? s.getName() : s.name || 'Unknown')) || [],
                wrapperExists: !!stylePanelWrapper
              });
            } catch (e) {
              console.warn('StyleManager initialization check:', e);
            }
          }
        }, 500);
        
        // Prevent StyleManager from applying black/default color when component had no explicit color.
        // Revert black only if applied within 200ms of target set (StyleManager init), not user choice.
        const styleTargetSetAtRef = { current: 0 };
        editor.on('style:target', () => { styleTargetSetAtRef.current = Date.now(); });
        editor.on('style:property:change', (property: any, value: any) => {
          try {
            const propName = property?.get?.('property') ?? property?.getName?.();
            if (propName !== 'color') return;
            const isBlack = (v: string) => !v || /^(rgb\(0,\s*0,\s*0\)|black|#000|#000000|rgba\(0,\s*0,\s*0)/i.test(String(v || '').trim());
            if (!value || !isBlack(String(value))) return;
            const comp = editor.getSelected();
            if (!comp) return;
            const setAt = styleTargetSetAtRef.current;
            const appliedWithinInit = Date.now() - setAt < 200;
            if (appliedWithinInit) {
              setTimeout(() => {
                try {
                  const current = comp.getStyle?.()?.color;
                  if (current && isBlack(String(current))) comp.removeStyle?.('color');
                } catch (_) {}
              }, 0);
            }
          } catch (_) {}
        });

        // Listen for style updates to ensure StyleManager refreshes
        editor.on('style:custom', () => {
          if (showStylePanel) {
            // StyleManager automatically updates when styles change
            // No need to manually re-render
          }
        });

        // Setup Undo/Redo
        const updateUndoRedoState = () => {
          const um = editor.UndoManager;
          if (um) {
            setCanUndo(um.hasUndo());
            setCanRedo(um.hasRedo());
          }
        };
        editor.on('update', updateUndoRedoState);
        editor.on('component:update', updateUndoRedoState);
        editor.on('style:update', updateUndoRedoState);

        // Disable dragging elements within the theme
        // Method 1: Disable drag on all components when they're added or updated
        const disableDragOnComponent = (component: any) => {
          try {
            if (component && component.set) {
              component.set('draggable', false);
              component.set('droppable', false);
              component.set('resizable', false);
            }
          } catch (e) {
            // Ignore errors for components that don't support these properties
          }
        };

        editor.on('component:add', (component: any) => {
          disableDragOnComponent(component);
          // Also disable on children
          if (component.components) {
            component.components().forEach((child: any) => {
              disableDragOnComponent(child);
            });
          }
        });

        // Prevent drag events
        editor.on('component:drag', (ev: any) => {
          if (ev && ev.stop) ev.stop();
          if (ev && ev.preventDefault) ev.preventDefault();
          return false;
        });

        editor.on('component:drag:start', (ev: any) => {
          if (ev && ev.stop) ev.stop();
          if (ev && ev.preventDefault) ev.preventDefault();
          return false;
        });

        // Disable drag via CSS in the canvas frame
        setTimeout(() => {
          const canvas = editor.Canvas;
          if (canvas) {
            const frame = canvas.getFrameEl();
            if (frame && frame.contentDocument) {
              const style = frame.contentDocument.createElement('style');
              style.setAttribute('data-ziplofy-disable-drag', 'true');
              style.textContent = `
                * {
                  -webkit-user-drag: none !important;
                  -moz-user-drag: none !important;
                  -ms-user-drag: none !important;
                  user-drag: none !important;
                }
                .gjs-selected {
                  cursor: default !important;
                }
                .gjs-dashed * {
                  cursor: default !important;
                }
              `;
              frame.contentDocument.head.appendChild(style);
            }
          }
        }, 500);

        // Disable drag on existing components after theme loads
        const disableDragOnAllComponents = () => {
          try {
            const wrapper = editor.getWrapper();
            if (wrapper) {
              const allComponents: any[] = [];
              const collectComponents = (comp: any) => {
                if (comp) {
                  allComponents.push(comp);
                  const children = comp.components ? comp.components() : [];
                  children.forEach((child: any) => collectComponents(child));
                }
              };
              collectComponents(wrapper);
              
              allComponents.forEach((comp: any) => {
                disableDragOnComponent(comp);
              });
              
              console.log(`✓ Disabled drag on ${allComponents.length} components`);
            }
          } catch (e) {
            console.warn('Error disabling drag on components:', e);
          }
        };

        // Disable drag after theme is loaded
        setTimeout(disableDragOnAllComponents, 1000);

        // Function to find which sidebar section a component belongs to
        const findComponentSection = (component: any): string | null => {
          if (!component) return null;
          
          const el = component.getEl();
          if (!el) return null;
          
          const tagName = el.tagName?.toLowerCase();
          const className = typeof el.className === 'string' ? el.className : (el.className?.baseVal || '');
          const id = el.id || '';
          
          // Normalize className for matching
          const classList = className.toLowerCase().split(/\s+/).filter((c: string) => c);
          
          // Check each section's selectors
          for (const [sectionName, selectors] of Object.entries(SECTION_SELECTORS)) {
            for (const selector of selectors) {
              try {
                const normalizedSelector = selector.toLowerCase().trim();
                
                // Exact tag match
                if (normalizedSelector === tagName) {
                  return sectionName;
                }
                
                // Class selector match
                if (normalizedSelector.startsWith('.')) {
                  const classToMatch = normalizedSelector.substring(1).toLowerCase();
                  if (classList.includes(classToMatch) || className.toLowerCase().includes(classToMatch)) {
                    return sectionName;
                  }
                }
                
                // ID selector match
                if (normalizedSelector.startsWith('#')) {
                  const idToMatch = normalizedSelector.substring(1).toLowerCase();
                  if (id.toLowerCase() === idToMatch) {
                    return sectionName;
                  }
                }
                
                // Attribute selector match
                if (normalizedSelector.includes('[')) {
                  try {
                    if (el.matches && el.matches(selector)) {
                      return sectionName;
                    }
                  } catch (e) {
                    // Continue
                  }
                }
                
                // Check if element is inside a matching parent (walk up the DOM tree)
                let currentEl: Element | null = el;
                let depth = 0;
                while (currentEl && depth < 5) {
                  try {
                    if (currentEl.matches && currentEl.matches(selector)) {
                      return sectionName;
                    }
                    // Also check tag/class/id
                    const currentTag = currentEl.tagName?.toLowerCase();
                    const currentClass = (currentEl.className || '').toString().toLowerCase();
                    const currentId = (currentEl.id || '').toLowerCase();
                    
                    if (normalizedSelector === currentTag ||
                        (normalizedSelector.startsWith('.') && currentClass.includes(normalizedSelector.substring(1))) ||
                        (normalizedSelector.startsWith('#') && currentId === normalizedSelector.substring(1))) {
                      return sectionName;
                    }
                    
                    currentEl = currentEl.parentElement;
                    depth++;
                  } catch (e) {
                    break;
                  }
                }
              } catch (e) {
                // Continue checking other selectors
              }
            }
          }
          
          // Fallback: check tag name and common patterns
          if (tagName === 'header' || classList.some((c: string) => c.includes('header'))) return 'Header';
          if (tagName === 'footer' || classList.some((c: string) => c.includes('footer'))) return 'Footer';
          if (tagName === 'nav' || classList.some((c: string) => c.includes('nav'))) return 'Header';
          if (classList.some((c: string) => c.includes('hero'))) return 'Hero section';
          if (classList.some((c: string) => c.includes('product') && c.includes('card'))) return 'Product card';
          if (classList.some((c: string) => c.includes('product') && c.includes('highlight'))) return 'Product highlight';
          
          return null;
        };

        // Open style panel when component is selected (selection itself must
        // NOT change the element's visual styles; only explicit edits via the
        // Style panel should do that). Only open when user has explicitly
        // selected (not during initial load when GrapesJS may auto-select).
        editor.on('component:selected', (component: any) => {
          if (!stylePanelOpenAllowedRef.current) return;
          // When user clicked structure item (not Edit), only show selection in theme; don't open style panel
          if (selectionFromStructureClickRef.current) {
            selectionFromStructureClickRef.current = false;
            return;
          }

          // Immediately strip any black inline color GrapesJS might have applied on select,
          // so the element keeps its original theme color until the user explicitly changes it.
          try {
            const el = component.getEl?.();
            const color = (component.getStyle?.()?.color) ?? (el?.style?.color);
            const isBlack =
              color === 'rgb(0, 0, 0)' ||
              color === 'black' ||
              color === '#000' ||
              color === '#000000' ||
              (typeof color === 'string' && /^rgb\(0,\s*0,\s*0\)$/i.test(color));
            if (isBlack) {
              if (el?.style) el.style.removeProperty('color');
              try { component.removeStyle?.('color'); } catch {}
            }
          } catch {}

          console.log('✓ Component selected:', component);
          
          // Find which section this component belongs to
          const sectionName = findComponentSection(component);
          const displayName = sectionName || component.getName() || component.get('tagName') || 'Selected Element';

          // Set state to show style panel
          setSelectedSection(displayName);
          setShowStylePanel(true);
          // Structure stays visible on left; Style opens on right

          // Detect image for Image panel (change src/alt)
          const tag = (component.get?.('tagName') || '').toLowerCase();
          const type = component.get?.('type') || '';
          let imgComp = tag === 'img' || type === 'image' ? component : null;
          if (!imgComp) {
            const children = component.components?.() || [];
            const imgChild = children.find((c: any) => (c.get?.('tagName') || '').toLowerCase() === 'img');
            if (imgChild) imgComp = imgChild;
            else {
              const el = component.getEl?.();
              const nestedImg = el?.querySelector?.('img');
              if (nestedImg) {
                const ec = editor.Components?.getComponent?.(nestedImg);
                if (ec) imgComp = ec;
              }
            }
          }
          if (imgComp) {
            const src = imgComp.get?.('src') || imgComp.getAttributes?.()?.src || imgComp.getEl?.()?.getAttribute?.('src') || '';
            const alt = imgComp.get?.('alt') || imgComp.getAttributes?.()?.alt || imgComp.getEl?.()?.getAttribute?.('alt') || '';
            setImagePanelData({ component: imgComp, src: src || '', alt: alt || '' });
          } else {
            setImagePanelData(null);
          }

          // Wait for React to render, then sync StyleManager
          const syncStyleManager = async () => {
            const reactWrapper = document.getElementById('style-panel-wrapper') as HTMLElement;
            
            if (!reactWrapper) {
              console.warn('⚠️ style-panel-wrapper not found, retrying...');
              setTimeout(syncStyleManager, 100);
              return;
            }
            
            if (!editor.StyleManager) {
              console.error('❌ StyleManager not available');
              return;
            }
            
            reactWrapper.style.display = 'block';
            reactWrapper.style.visibility = 'visible';
            reactWrapper.style.opacity = '1';
            reactWrapper.style.width = '100%';
            reactWrapper.style.height = '100%';
            
            // Clear StyleManager target first to prevent previous component's color
            // from being applied to the new selection (fixes "other text turns red")
            const sm = editor.StyleManager as any;
            if (sm?.setTarget) {
              try { sm.setTarget(null); } catch (_) {}
            }
            // Brief delay so StyleManager clears internal state before setting new target
            await new Promise(r => setTimeout(r, 0));

            // Update StyleManager to use React wrapper (in left panel)
            if (sm.container) {
              sm.container.el = reactWrapper;
            } else {
              sm.container = { el: reactWrapper };
            }
            if (sm.config) {
              sm.config.appendTo = reactWrapper;
            }
            if (sm.view && sm.view.container) {
              sm.view.container = reactWrapper;
            }
            
            // CRITICAL: Ensure component is selected and set as target before rendering
            editor.select(component);
            
            // Set component as StyleManager target if method exists
            if (sm.setTarget) {
              try {
                sm.setTarget(component);
                styleTargetSetAtRef.current = Date.now();
                console.log('✓ Set StyleManager target to component');
              } catch (e) {
                console.warn('setTarget not available, using default behavior');
              }
            }
            
            // Clear wrapper and render StyleManager (same pattern as Visual Elementor)
            reactWrapper.innerHTML = '';
            try {
              const smEl = sm.render();
              if (smEl) {
                const el = (smEl as any).el || smEl;
                if (el && el.nodeType === 1 && !reactWrapper.contains(el)) {
                  reactWrapper.appendChild(el);
                } else if (typeof smEl === 'object' && (smEl as any).nodeType === 1) {
                  reactWrapper.appendChild(smEl as Node);
                }
              }
              if (!reactWrapper.querySelector('.gjs-sm')) sm.render();
              console.log('✓ StyleManager rendered');
            } catch (e) {
              console.error('❌ Error rendering StyleManager:', e);
              try { sm.render(); } catch (_) {}
            }
            
            // At this point the StyleManager DOM is mounted inside #style-panel-wrapper.
            // Attach sector toggle handlers (Layout, Typography, etc. collapse like widgets)
            if (!(reactWrapper as any)._sectorToggleBound) {
              (reactWrapper as any)._sectorToggleBound = true;
              reactWrapper.addEventListener('click', (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                const sector = target.closest('.gjs-sm-sector');
                if (!sector) return;
                if (target.closest('.gjs-sm-sector-content') || target.closest('input') || target.closest('select')) return;
                e.preventDefault();
                e.stopPropagation();
                const isOpen = sector.classList.contains('gjs-sm-sector--open') || sector.classList.contains('gjs-sm-open') || !sector.classList.contains('gjs-sm-sector--closed');
                if (isOpen) {
                  sector.classList.remove('gjs-sm-sector--open', 'gjs-sm-open');
                  sector.classList.add('gjs-sm-sector--closed');
                } else {
                  sector.classList.remove('gjs-sm-sector--closed');
                  sector.classList.add('gjs-sm-sector--open', 'gjs-sm-open');
                }
              }, true);
            }
          };
          
          // Delay to ensure React has rendered the style panel
          requestAnimationFrame(() => {
            setTimeout(syncStyleManager, 100);
            setTimeout(syncStyleManager, 350);
          });
        });

        // Don't close style panel on component:deselected - it fires when switching to a nested
        // component (e.g. Header → Help Center link), causing the panel to flash and disappear.
        // Clean up black inline color on deselect - the previous element often gets black applied
        // when StyleManager switches targets, so we clear it immediately and again after a delay.
        const clearBlackInlineColor = (comp: any) => {
          if (!comp) return;
          try {
            const el = comp.getEl?.();
            const color = (comp.getStyle?.()?.color) ?? (el?.style?.color);
            const isBlack = color === 'rgb(0, 0, 0)' || color === 'black' || color === '#000' || color === '#000000' || (typeof color === 'string' && /^rgb\(0,\s*0,\s*0\)$/i.test(color));
            if (isBlack) {
              if (el?.style) el.style.removeProperty('color');
              try { comp.removeStyle?.('color'); } catch {}
            }
            (comp.components?.() || []).forEach((c: any) => clearBlackInlineColor(c));
          } catch {}
        };
        editor.on('component:deselected', (component: any) => {
          setImagePanelData(null);
          if (component) {
            clearBlackInlineColor(component);
            // StyleManager may add black to the previous element when switching targets; clear again after it settles
            setTimeout(() => clearBlackInlineColor(component), 50);
            setTimeout(() => clearBlackInlineColor(component), 250);
            setTimeout(() => clearBlackInlineColor(component), 500);
          }
        });
        
        // Also listen for canvas click to ensure components can be selected
        editor.on('canvas:click', (ev: any) => {
          // This event fires when clicking on the canvas
          // GrapesJS should automatically select components, but we log it for debugging
          console.log('Canvas clicked:', ev);
        });
        
        // Ensure component selection is enabled and StyleManager updates when component changes
        editor.on('component:update', () => {
          const selected = editor.getSelected();
          if (selected && showStylePanel) {
            // If a component is selected and style panel is open, ensure StyleManager is rendered
            console.log('Component updated, ensuring StyleManager is rendered');
            const stylePanelWrapper = document.querySelector('#style-panel-wrapper');
            if (stylePanelWrapper && editor.StyleManager) {
              try {
                editor.StyleManager.render();
              } catch (e) {
                console.warn('Error re-rendering StyleManager on component update:', e);
              }
            }
          }
        });

        // Listen for canvas frame load - re-apply responsive view (viewport + frame dimensions)
        editor.on('canvas:frame:load', () => {
          const dev = (editor as any).getDevice?.() || editor.DeviceManager?.getSelected?.()?.get?.('id') || currentDevice;
          applyResponsiveView(editor, dev);
          if (dev === 'Desktop' || dev === 'desktop') {
            scheduleDesktopRetries(editor);
          } else {
            setTimeout(() => applyResponsiveView(editor, dev), 50);
            setTimeout(() => applyResponsiveView(editor, dev), 200);
          }
        });

        editor.on('canvas:frame:load', () => {
          console.log('Canvas frame loaded, ensuring CSS is injected');
          setTimeout(() => {
            const canvas = editor.Canvas;
            if (canvas) {
              const frame = canvas.getFrameEl();
              if (frame && frame.contentDocument) {
                const doc = frame.contentDocument;
                const head = doc.head;
                if (head) {
                  // Check if CSS is already injected
                  const existingStyles = head.querySelectorAll('[data-ziplofy-theme]');
                  if (existingStyles.length === 0) {
                    console.log('No CSS found, triggering re-injection...');
                    // This will be handled by loadThemeIntoEditor's retry mechanism
                  }
                }
              }
            }
          }, 100);
        });

        // Load theme content
        try {
          await loadThemeIntoEditor(editor);
        } catch (loadError: any) {
          console.error('Failed to load theme:', loadError);
          setError(loadError?.message || "Failed to load theme. Please check if the theme exists and you have access to it.");
          setLoading(false);
          return;
        }

        setLoading(false);

        // Don't show style panel until user selects an element or clicks Edit.
        // Deselect any auto-selection from load, then allow style panel on future selections.
        setTimeout(() => {
          editor.select(null);
          stylePanelOpenAllowedRef.current = true;
        }, 500);
      } catch (e: any) {
        console.error('Failed to initialize editor:', e);
        setError(e?.message || "Failed to initialize editor");
        setLoading(false);
      }
    };

    initEditor();

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, [themeId, loadThemeIntoEditor]);

  // Strip GrapesJS black color from inline styles (fixes text turning black on select)
  const stripBlackColorFromHtml = useCallback((html: string): string => {
    if (!html || typeof html !== 'string') return html;
    return html.replace(/\s+style\s*=\s*["']([^"']*)["']/gi, (_, styleContent) => {
      let cleaned = styleContent
        .replace(/\s*color\s*:\s*(?:#000000|#000|black|rgb\s*\(\s*0\s*,\s*0\s*,\s*0\s*\))\s*;?/gi, '')
        .replace(/;\s*;/g, ';')
        .trim()
        .replace(/^;\s*|\s*;$/g, '');
      return cleaned ? ` style="${cleaned}"` : '';
    });
  }, []);

  // Commit current page changes to state before switching
  const commitCurrentPage = useCallback(() => {
    const editor = editorInstance.current;
    if (!editor || typeof editor.getHtml !== 'function') return;
    
    const rawHtml = editor.getHtml() || '';
    const currentHtml = stripBlackColorFromHtml(rawHtml);
    let currentCss = '';
    
    // Get CSS from editor
    if (editor.getCss) {
      currentCss = editor.getCss() || '';
    }
    
    // Update current page in pages array
    setPages(prevPages => {
      const updated = prevPages.map(page => {
        if (page.id === currentPageId) {
          return { ...page, html: currentHtml, css: currentCss };
        }
        return page;
      });
      pagesRef.current = updated;
      return updated;
    });
  }, [currentPageId, stripBlackColorFromHtml]);

  // Switch to a different page
  const switchPage = useCallback(async (pageId: string) => {
    if (pageId === currentPageId) return;
    
    const editor = editorInstance.current;
    if (!editor) return;
    
    // Commit current page changes before switching
    commitCurrentPage();
    
    // Find the page to switch to
    const targetPage = pagesRef.current.find(p => p.id === pageId);
    if (!targetPage) {
      console.warn(`Page ${pageId} not found`);
      return;
    }
    
    // Update current page ID
    setCurrentPageId(pageId);
    
    // Load page HTML/CSS into editor
    editor.setComponents(targetPage.html);
    
    // Configure all elements for selectability (same as initial load)
    setTimeout(() => {
      try {
        const wrapper = editor.getWrapper();
        if (!wrapper) return;
        const expandComponentContent = (comp: any): boolean => {
          if (!comp) return false;
          let changed = false;
          const content = comp.get?.('content');
          const children = comp.components?.();
          const hasHtmlContent = typeof content === 'string' && /<[a-z][a-z0-9]*[\s>]/i.test(content);
          if (hasHtmlContent && (!children || children.length === 0)) {
            try {
              comp.set('content', '', { silent: true });
              if (comp.append?.(content)?.length) changed = true;
            } catch {}
          }
          (comp.components?.() || []).forEach((c: any) => { if (expandComponentContent(c)) changed = true; });
          return changed;
        };
        wrapper.components?.().forEach((c: any) => expandComponentContent(c));
        const CONTAINER_TAGS = new Set(['div', 'section', 'main', 'article', 'header', 'footer', 'nav', 'aside', 'form', 'ul', 'ol', 'li', 'figure', 'figcaption']);
        const TEXT_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup', 'blockquote', 'cite', 'img']);
        const configureAllNested = (comp: any) => {
          if (!comp) return;
          try {
            const tagName = (comp.get?.('tagName') || '').toLowerCase();
            const attrs = comp.getAttributes?.() || {};
            const isDroppable = attrs['data-gjs-droppable'] === '*' || CONTAINER_TAGS.has(tagName);
            const hasText = typeof comp.get?.('content') === 'string' && (comp.get('content') || '').trim().length > 0;
            const isEditable = attrs['data-gjs-editable'] === 'true' || attrs['data-gjs-type'] === 'text' || TEXT_TAGS.has(tagName) || (hasText && (!comp.components?.() || comp.components().length === 0));
            comp.set({ selectable: true, hoverable: true, draggable: true, stylable: true, droppable: isDroppable ? '*' : false, editable: isEditable }, { silent: true });
            (comp.components?.() || []).forEach((c: any) => configureAllNested(c));
          } catch {}
        };
        wrapper.set({ droppable: true, selectable: true, editable: false }, { silent: true });
        wrapper.components?.().forEach((c: any) => configureAllNested(c));
      } catch {}
    }, 100);
    
    // Inject CSS
    if (targetPage.css) {
      try {
        const canvas = editor.Canvas;
        if (canvas) {
          const frame = canvas.getFrameEl();
          if (frame && frame.contentDocument) {
            const doc = frame.contentDocument;
            const head = doc.head || doc.getElementsByTagName('head')[0];
            
            if (head) {
              // Remove existing theme styles
              const existingStyles = head.querySelectorAll('#ziplofy-theme-styles, #ziplofy-preserve-text-color, #ziplofy-slider-fix, style[data-ziplofy-theme]');
              existingStyles.forEach((style: Element) => style.remove());
              
              // Re-inject preserve-text-color (persists across page switch)
              const preserveEl = doc.createElement('style');
              preserveEl.id = 'ziplofy-preserve-text-color';
              preserveEl.setAttribute('data-ziplofy-basic-elementor', 'true');
              preserveEl.textContent = PRESERVE_TEXT_COLOR_CSS;
              head.appendChild(preserveEl);
              const sliderFixEl = doc.createElement('style');
              sliderFixEl.id = 'ziplofy-slider-fix';
              sliderFixEl.setAttribute('data-ziplofy-theme', 'true');
              sliderFixEl.textContent = SLIDER_FIX_CSS;
              head.appendChild(sliderFixEl);
              
              // Inject page CSS
              const styleEl = doc.createElement('style');
              styleEl.id = 'ziplofy-theme-styles';
              styleEl.setAttribute('data-ziplofy-theme', 'true');
              styleEl.textContent = targetPage.css;
              head.appendChild(styleEl);
            }
          }
        }
      } catch (e) {
        console.error('Error injecting page CSS:', e);
      }
    }
    
    // Close style panel when switching pages
    setShowStylePanel(false);
    setShowStructurePanel(true);
    setSelectedSection(null);
    
    console.log(`✅ Switched to page: ${targetPage.name}`);
  }, [currentPageId, commitCurrentPage]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle section click - select component in GrapesJS and scroll to it (don't open styles panel)
  const handleSectionClick = (sectionName: string) => {
    const editor = editorInstance.current;
    if (!editor) return;

    setSelectedSection(sectionName);
    // Don't open styles panel on click - user needs to click edit button for that

    // Find component using selectors, select it in canvas, and scroll to it
    const selectors = SECTION_SELECTORS[sectionName] || [];
    const wrapper = editor.getWrapper();
    
    if (wrapper) {
      for (const selector of selectors) {
        try {
          const component = wrapper.find(selector)[0];
          if (component) {
            selectionFromStructureClickRef.current = true;
            // Select component so it shows highlighted in theme preview (no style panel)
            editor.select(component);
            // Scroll to component
            const view = editor.Canvas.getFrameEl();
            if (view && view.contentWindow) {
              const compEl = component.getEl();
              if (compEl && view.contentWindow.document.contains(compEl)) {
                compEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
  };

  // Handle edit button click - opens styles panel
  const handleEditSection = (sectionName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent section click
    const editor = editorInstance.current;
    if (!editor) return;

    setSelectedSection(sectionName);
    setShowStylePanel(true);
    // Structure stays visible on left; Style opens on right

    // Find component using selectors and select it
    const selectors = SECTION_SELECTORS[sectionName] || [];
    const wrapper = editor.getWrapper();
    
    if (wrapper) {
      for (const selector of selectors) {
        try {
          const component = wrapper.find(selector)[0];
          if (component) {
            editor.select(component);
            // Scroll to component
            const view = editor.Canvas.getFrameEl();
            if (view && view.contentWindow) {
              const compEl = component.getEl();
              if (compEl && view.contentWindow.document.contains(compEl)) {
                compEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
  };

  // Handle device change - Desktop: set explicit pixel width so frame isn't mobile-sized
  useEffect(() => {
    const editor = editorInstance.current;
    if (!editor) return;
    const deviceNameMap: Record<string, string> = {
      'desktop': 'Desktop',
      'tablet': 'Tablet',
      'mobile': 'Mobile'
    };
    const capitalizedDevice = deviceNameMap[currentDevice] || currentDevice;
    try {
      if (editor.setDevice) editor.setDevice(capitalizedDevice);
      editor.refresh?.();
      applyResponsiveView(editor, currentDevice);
      let clearRetries: (() => void) | undefined;
      if (currentDevice === 'desktop') {
        clearRetries = scheduleDesktopRetries(editor);
      } else {
        const t1 = setTimeout(() => applyResponsiveView(editor, currentDevice), 100);
        const t2 = setTimeout(() => applyResponsiveView(editor, currentDevice), 300);
        const t3 = setTimeout(() => applyResponsiveView(editor, currentDevice), 600);
        clearRetries = () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
      }
      const canvasHost = document.querySelector('.builder-center-panel') || document.querySelector('.basic-elementor-preview');
      const ro = canvasHost && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {
        const dev = (editor as any).getDevice?.() || editor.DeviceManager?.getSelected?.()?.get?.('id');
        if ((dev || '').toLowerCase() === currentDevice) applyResponsiveView(editor, currentDevice);
      }) : null;
      if (ro && canvasHost) ro.observe(canvasHost as Element);
      return () => {
        clearRetries?.();
        ro?.disconnect();
      };
    } catch (e) {
      console.warn('Device change error:', e);
    }
  }, [currentDevice]);

  // When the style panel is open, the StyleManager rendering is driven by the
  // `component:selected` handler above. We intentionally avoid extra polling
  // or forced re-renders here to keep the panel stable.
  useEffect(() => {
    if (!showStylePanel) return;
    const panel = document.querySelector('.style-editor-panel') as HTMLElement | null;
    if (panel) {
      panel.style.display = 'flex';
      panel.style.visibility = 'visible';
      panel.style.opacity = '1';
    }
  }, [showStylePanel]);

  const handleUndo = () => {
    const editor = editorInstance.current;
    if (editor) {
      editor.UndoManager.undo();
    }
  };

  const handleRedo = () => {
    const editor = editorInstance.current;
    if (editor) {
      editor.UndoManager.redo();
    }
  };

  // Generate default thumbnail for theme
  const generateDefaultThumbnail = useCallback((themeName: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        // Fallback: create a simple colored blob
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="800" height="600" fill="url(#grad)"/>
          <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">${themeName}</text>
          <text x="400" y="340" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.9)" text-anchor="middle">Custom Theme</text>
        </svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        resolve(blob);
        return;
      }

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some decorative circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(100, 100, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(700, 500, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(650, 100, 40, 0, Math.PI * 2);
      ctx.fill();

      // Add theme name text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const maxWidth = 700;
      let fontSize = 56;
      let textWidth = ctx.measureText(themeName).width;
      if (textWidth > maxWidth) {
        fontSize = (maxWidth / textWidth) * fontSize;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      }
      ctx.fillText(themeName, canvas.width / 2, canvas.height / 2 - 30);

      // Add subtitle
      ctx.font = '24px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('Custom Theme', canvas.width / 2, canvas.height / 2 + 40);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback SVG
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="800" height="600" fill="url(#grad)"/>
            <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">${themeName}</text>
            <text x="400" y="340" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.9)" text-anchor="middle">Custom Theme</text>
          </svg>`;
          resolve(new Blob([svg], { type: 'image/svg+xml' }));
        }
      }, 'image/png');
    });
  }, []);

  // Encode pages data for embedding in HTML
  const encodePagesData = useCallback((pagesData: Page[]): string => {
    try {
      const sanitized = pagesData.map(p => ({ ...p, html: stripBlackColorFromHtml(p.html || '') }));
      return JSON.stringify(sanitized)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
    } catch (e) {
      console.error('Error encoding pages data:', e);
      return '[]';
    }
  }, [stripBlackColorFromHtml]);

  // Build multi-page HTML document (like CustomThemeBuilder)
  const buildMultiPageHtmlDocument = useCallback((pagesData: Page[], themeName: string, globalCss: string): string => {
    const safeName = (themeName || 'Ziplofy Theme').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const pagesJson = encodePagesData(pagesData);
    const combinedCss = globalCss || '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName}</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e1e1e;
      background: #ffffff;
    }
    * {
      box-sizing: border-box;
    }
    .ziplofy-page {
      display: none;
      width: 100%;
      min-height: 100vh;
    }
    .ziplofy-page.active {
      display: block;
    }
    .ziplofy-page > .gjs-wrapper-body,
    .ziplofy-page.gjs-wrapper-body {
      width: 100%;
      min-height: 100vh;
    }
    ${combinedCss}
  </style>
</head>
<body>
  <div id="ziplofy-page-container"></div>
  <script id="ziplofy-pages-data" type="application/json">${pagesJson}</script>
  <script>
    (function() {
      try {
        const container = document.getElementById('ziplofy-page-container');
        const dataEl = document.getElementById('ziplofy-pages-data');
        if (!container || !dataEl) return;
        const pagesText = dataEl.textContent || dataEl.innerText || '[]';
        const pages = JSON.parse(pagesText);
        const normalizeId = function(value) {
          if (value === null || value === undefined) return '';
          return String(value).replace(/^#/, '').trim();
        };
        const idsMatch = function(a, b) {
          const na = normalizeId(a), nb = normalizeId(b);
          if (!na || !nb) return false;
          if (na === nb) return true;
          return na.replace(/^page-/, '') === nb.replace(/^page-/, '');
        };
        const normalizeExternalUrl = function(url) {
          if (!url) return '';
          const t = String(url).trim();
          if (!t) return '';
          const l = t.toLowerCase();
          if (l.startsWith('http://') || l.startsWith('https://') || l.startsWith('mailto:') || l.startsWith('tel:')) return t;
          if (t.startsWith('//')) return 'https:' + t;
          if (t.includes('://')) return t;
          return 'https://' + t;
        };
        const openExternal = function(url) {
          const u = normalizeExternalUrl(url);
          if (u) window.open(u, '_blank', 'noopener,noreferrer');
        };
        const renderPages = function() {
          container.innerHTML = '';
          pages.forEach(function(page, index) {
            const wrapper = document.createElement('div');
            wrapper.className = 'ziplofy-page gjs-wrapper-body' + (index === 0 ? ' active' : '');
            wrapper.setAttribute('data-page-id', page.id || ('page-' + (index + 1)));
            wrapper.style.display = index === 0 ? 'block' : 'none';
            wrapper.innerHTML = page.html || '';
            container.appendChild(wrapper);
          });
        };
        const showPage = function(pageId, updateHash) {
          const normalizedRequest = normalizeId(pageId);
          if (!normalizedRequest) return false;
          const pageEls = container.querySelectorAll('.ziplofy-page');
          let found = false;
          pageEls.forEach(function(pageEl) {
            const pageIdAttr = pageEl.getAttribute('data-page-id');
            if (idsMatch(pageIdAttr, normalizedRequest)) {
              pageEl.classList.add('active');
              pageEl.style.display = 'block';
              found = true;
            } else {
              pageEl.classList.remove('active');
              pageEl.style.display = 'none';
            }
          });
          if (found && updateHash) {
            const active = container.querySelector('.ziplofy-page.active');
            const actualId = active ? (active.getAttribute('data-page-id') || normalizedRequest) : normalizedRequest;
            window.location.hash = '#' + normalizeId(actualId);
          }
          return found;
        };
        const attachLinkHandlers = function() {
          container.querySelectorAll('a[data-page-link]').forEach(function(link) {
            const clone = link.cloneNode(true);
            if (link.parentNode) link.parentNode.replaceChild(clone, link);
          });
          container.querySelectorAll('button[data-page-link]').forEach(function(btn) {
            const clone = btn.cloneNode(true);
            if (btn.parentNode) btn.parentNode.replaceChild(clone, btn);
          });
          container.querySelectorAll('a[data-page-link]').forEach(function(link) {
            link.addEventListener('click', function(evt) {
              const targetPage = this.getAttribute('data-page-link');
              if (targetPage && targetPage.trim()) {
                evt.preventDefault();
                evt.stopPropagation();
                showPage(targetPage, true);
                return;
              }
              const href = this.getAttribute('href');
              if (href && href.startsWith('#')) {
                evt.preventDefault();
                evt.stopPropagation();
                showPage(href, true);
                return;
              }
              if (href && href.trim()) {
                evt.preventDefault();
                evt.stopPropagation();
                openExternal(href);
              }
            });
          });
          container.querySelectorAll('button[data-page-link]').forEach(function(button) {
            button.addEventListener('click', function(evt) {
              evt.preventDefault();
              evt.stopPropagation();
              const targetPage = this.getAttribute('data-page-link');
              const href = this.getAttribute('href');
              if (targetPage && targetPage.trim()) {
                showPage(targetPage, true);
                return;
              }
              if (href && href.startsWith('#')) {
                showPage(href, true);
                return;
              }
              if (href && (href.startsWith('http://') || href.startsWith('https://') || href.trim())) {
                openExternal(href);
              }
            });
          });
          container.querySelectorAll('button[href]').forEach(function(button) {
            const href = button.getAttribute('href');
            if (!button.hasAttribute('data-page-link') && href && (href.startsWith('http://') || href.startsWith('https://'))) {
              button.addEventListener('click', function(evt) {
                evt.preventDefault();
                window.open(href, '_blank', 'noopener,noreferrer');
              });
            }
          });
        };
        renderPages();
        attachLinkHandlers();
        let attachTimeout = null;
        const observer = new MutationObserver(function() {
          if (attachTimeout) clearTimeout(attachTimeout);
          attachTimeout = setTimeout(attachLinkHandlers, 300);
        });
        observer.observe(container, { childList: true, subtree: true });
        const hashChange = function() {
          const hash = window.location.hash.replace(/^#/, '');
          if (hash) {
            showPage(hash, false);
          } else {
            showPage(pages[0]?.id || 'page-1', false);
          }
        };
        window.addEventListener('hashchange', hashChange);
        hashChange();
      } catch (e) {
        console.error('Error initializing pages:', e);
      }
    })();
  </script>
</body>
</html>`;
  }, [encodePagesData]);

  // Build HTML document from GrapesJS content (single page)
  const buildHtmlDocument = useCallback((htmlContent: string, cssContent: string, themeName: string): string => {
    const safeName = (themeName || 'Ziplofy Theme').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Separate @import statements from regular CSS (imports must be at the top)
    const cssLines = cssContent.split('\n');
    const imports: string[] = [];
    const regularCss: string[] = [];
    
    cssLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('@import')) {
        imports.push(trimmed);
      } else {
        regularCss.push(line);
      }
    });
    
    // Combine imports at top, then regular CSS
    const combinedCss = imports.join('\n') + (imports.length > 0 ? '\n\n' : '') + regularCss.join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName}</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e1e1e;
      background: #ffffff;
    }
    * {
      box-sizing: border-box;
    }
    ${combinedCss}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  }, []);

  const saveTheme = useCallback(async (applyAfterSave: boolean) => {
    try {
      const editor = editorInstance.current;
      if (!editor) {
        alert('Editor not ready');
        return;
      }

      setSaving(true);

      // Wait for editor to finish any pending operations
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 150));

      // CRITICAL: Force editor to refresh/update before getting HTML/CSS
      // This ensures all pending changes are processed
      if (editor.trigger) {
        editor.trigger('update');
      }
      
      // Get wrapper to ensure we get all content
      const wrapper = editor.getWrapper();
      if (wrapper && wrapper.view) {
        wrapper.view.render?.();
      }

      // Get HTML from GrapesJS editor
      let htmlContent = '';
      try {
        if (wrapper) {
          // Try to get HTML with all styles included
          htmlContent = editor.getHtml({ component: wrapper }) || '';
          if (!htmlContent || htmlContent.trim().length === 0) {
            htmlContent = editor.getHtml() || '';
          }
        } else {
          htmlContent = editor.getHtml() || '';
        }
        
        if (!htmlContent || htmlContent.trim().length === 0) {
          console.warn('⚠️ No HTML from editor, using default');
          htmlContent = '<div>Empty Theme</div>';
        }
      } catch (e) {
        console.error('Error getting HTML from editor:', e);
        htmlContent = editor.getHtml() || '<div>Empty Theme</div>';
      }

      // Get CSS from editor - COMPREHENSIVE extraction matching CustomThemeBuilder
      // Use multiple methods and combine all results
      let cssContent = '';
      const cssFromMethods: string[] = [];
      
      // Method 1: Standard getCss() - gets generated CSS rules
      try {
        if (editor.getCss) {
          const standardCss = editor.getCss() || '';
          if (standardCss && standardCss.trim().length > 0) {
            cssFromMethods.push(standardCss);
            console.log('✅ Method 1 - Standard getCss():', standardCss.length, 'chars');
          }
        }
      } catch (e) {
        console.warn('Error getting CSS from editor.getCss():', e);
      }
      
      // Method 2: CssComposer for more complete CSS - includes all CSS rules
      try {
        if (editor.CssComposer) {
          const cssRules = editor.CssComposer.getAll();
          if (cssRules && cssRules.length > 0) {
            const composerCss = cssRules.map((rule: any) => {
              try {
                // Try toCSS first (most reliable)
                if (rule.toCSS) {
                  return rule.toCSS();
                }
                // Fallback to manual construction
                const selector = rule.selectorsToString ? rule.selectorsToString() : (rule.getSelectors ? rule.getSelectors().join(', ') : '');
                const style = rule.getStyle ? rule.getStyle() : {};
                if (selector && style && Object.keys(style).length > 0) {
                  const styleString = Object.entries(style)
                    .map(([prop, value]) => `  ${prop}: ${value};`)
                    .join('\n');
                  return `${selector} {\n${styleString}\n}`;
                }
                return '';
              } catch { return ''; }
            }).filter(Boolean).join('\n\n');
            
            if (composerCss && composerCss.trim().length > 0) {
              cssFromMethods.push(composerCss);
              console.log('✅ Method 2 - CssComposer:', composerCss.length, 'chars');
            }
          }
        }
      } catch (e) {
        console.warn('Failed to get CSS from CssComposer:', e);
      }
      
      // Combine CSS from methods 1 and 2
      cssContent = cssFromMethods.join('\n\n');
      
      // CRITICAL FIX: Replace wrapper ID selectors with class selectors
      // GrapesJS might generate #iiwl instead of .gjs-wrapper-body
      if (wrapper) {
        const wrapperId = wrapper.getId();
        if (wrapperId && cssContent.includes(`#${wrapperId}`)) {
          console.log(`🔧 Converting wrapper ID selector #${wrapperId} to class .gjs-wrapper-body`);
          const idSelectorPattern = new RegExp(`#${wrapperId}(?![a-zA-Z0-9_-])`, 'g');
          cssContent = cssContent.replace(idSelectorPattern, '.gjs-wrapper-body');
          console.log('✅ Converted wrapper selectors to class-based');
        }
      }
      
      // Method 3: ALWAYS extract wrapper styles (even if other CSS exists)
      // This ensures wrapper background images are captured
      try {
        if (wrapper) {
          const wrapperStyles = wrapper.getStyle ? wrapper.getStyle() : null;
          if (wrapperStyles && Object.keys(wrapperStyles).length > 0) {
            const styleEntries = Object.entries(wrapperStyles)
              .map(([prop, value]) => `  ${prop}: ${value};`)
              .join('\n');
            const wrapperCssRule = `.gjs-wrapper-body {\n${styleEntries}\n}`;
            
            // Always add wrapper styles, replacing if they exist
            if (cssContent.includes('.gjs-wrapper-body')) {
              // Replace existing wrapper rule
              cssContent = cssContent.replace(/\.gjs-wrapper-body\s*\{[^}]*\}/g, wrapperCssRule);
            } else {
              // Add new wrapper rule at the beginning
              cssContent = wrapperCssRule + '\n\n' + cssContent;
            }
            console.log('✅ Method 3 - Wrapper styles:', Object.keys(wrapperStyles).length, 'properties');
          }
        }
      } catch (e) {
        console.warn('Failed to extract wrapper styles:', e);
      }
      
      // Method 4: Extract styles from canvas frame (theme CSS) - COMPREHENSIVE
      try {
        const canvas = editor.Canvas;
        if (canvas) {
          const frame = canvas.getFrameEl();
          if (frame && frame.contentDocument) {
            const doc = frame.contentDocument;
            
            // Extract all <style> tags (excluding editor-only: ziplofy-preserve-text-color, ziplofy-slider-fix)
            const styles = doc.querySelectorAll('style');
            const styleTagCss: string[] = [];
            const EDITOR_ONLY_IDS = ['ziplofy-preserve-text-color', 'ziplofy-slider-fix'];
            styles.forEach((style: Element) => {
              const id = (style as HTMLElement).id;
              if (EDITOR_ONLY_IDS.includes(id || '')) return;
              if (style.textContent && style.textContent.trim()) {
                styleTagCss.push(style.textContent);
              }
            });
            if (styleTagCss.length > 0) {
              cssContent += '\n\n/* Canvas Frame Style Tags */\n' + styleTagCss.join('\n\n');
              console.log('✅ Method 4a - Canvas frame style tags:', styles.length);
            }
            
            // Extract CSS from <link rel="stylesheet"> tags by fetching their content
            const links = doc.querySelectorAll('link[rel="stylesheet"]');
            const buildAuthHeadersForFetch = (): Record<string, string> => {
              const headers: Record<string, string> = {};
              const token =
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('accessToken') ||
                localStorage.getItem('token') ||
                sessionStorage.getItem('token');
              if (token) headers.Authorization = `Bearer ${token}`;
              return headers;
            };
            
            const linkPromises = Array.from(links).map(async (link) => {
              const linkEl = link as HTMLLinkElement;
              const href = linkEl.href;
              if (href && !href.startsWith('data:')) {
                try {
                  const linkResponse = await fetch(href, { 
                    credentials: 'include',
                    headers: buildAuthHeadersForFetch()
                  });
                  if (linkResponse.ok) {
                    const linkCss = await linkResponse.text();
                    return linkCss || '';
                  }
                } catch (err) {
                  console.warn('Failed to fetch stylesheet:', href, err);
                  // Fallback to @import
                  return `@import url('${href}');`;
                }
              }
              return '';
            });
            
            const fetchedLinkCss = await Promise.all(linkPromises);
            const linkCssContent = fetchedLinkCss.filter(css => css.trim()).join('\n\n');
            if (linkCssContent) {
              cssContent += '\n\n/* Canvas Frame External Stylesheets */\n' + linkCssContent;
              console.log('✅ Method 4b - Canvas frame stylesheets:', links.length);
            }
            
            // Also extract CSS from computed styles of key elements (fallback)
            try {
              const body = doc.body;
              if (body) {
                // Get all style rules from stylesheets
                const styleSheets = Array.from(doc.styleSheets);
                const sheetCss: string[] = [];
                styleSheets.forEach((sheet: any) => {
                  try {
                    if (sheet.cssRules) {
                      Array.from(sheet.cssRules).forEach((rule: any) => {
                        if (rule.cssText) {
                          sheetCss.push(rule.cssText);
                        }
                      });
                    }
                  } catch (e) {
                    // Cross-origin stylesheets will throw, skip them
                  }
                });
                if (sheetCss.length > 0) {
                  cssContent += '\n\n/* Computed Stylesheet Rules */\n' + sheetCss.join('\n\n');
                  console.log('✅ Method 4c - Computed stylesheet rules:', sheetCss.length);
                }
              }
            } catch (e) {
              console.warn('Failed to extract computed stylesheet rules:', e);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to get CSS from canvas frame:', e);
      }

      // Method 4d: Extract styles from each component (effects panel: opacity, box-shadow, filter, transition)
      try {
        if (wrapper) {
          const allComponents: any[] = [];
          const collectComponents = (comp: any) => {
            if (comp) {
              allComponents.push(comp);
              const children = comp.components ? comp.components() : [];
              children.forEach((c: any) => collectComponents(c));
            }
          };
          collectComponents(wrapper);

          const componentStylesRules = allComponents
            .map((comp) => {
              const styles = comp.getStyle ? comp.getStyle() : null;
              if (!styles || Object.keys(styles).length === 0) return null;
              const compId = comp.getId && comp.getId();
              const classes = comp.getClasses ? comp.getClasses() : [];
              const selector = classes.length > 0 ? `.${classes.join('.')}` : compId ? `#${compId}` : null;
              if (!selector) return null;
              const styleString = Object.entries(styles)
                .map(([prop, value]) => `  ${prop}: ${value};`)
                .join('\n');
              return `${selector} {\n${styleString}\n}`;
            })
            .filter(Boolean)
            .join('\n\n');

          if (componentStylesRules) {
            cssContent += '\n\n/* Component effects (opacity, shadow, filter, transition) */\n' + componentStylesRules;
            console.log('✅ Method 4d - Component effects styles');
          }
        }
      } catch (e) {
        console.warn('Failed to extract component styles:', e);
      }

      // Method 5: Include original theme CSS (CRITICAL - this contains all the theme's original styles)
      // This MUST come BEFORE GrapesJS styles so original styles are preserved
      if (originalThemeCssRef.current && originalThemeCssRef.current.trim().length > 0) {
        // Separate @import from original CSS
        const originalCssLines = originalThemeCssRef.current.split('\n');
        const originalImports: string[] = [];
        const originalRegularCss: string[] = [];
        
        originalCssLines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('@import')) {
            originalImports.push(trimmed);
          } else {
            originalRegularCss.push(line);
          }
        });
        
        // Combine: original imports first, then original CSS
        const originalCssCombined = originalImports.join('\n') + 
          (originalImports.length > 0 ? '\n\n' : '') + 
          originalRegularCss.join('\n');
        
        // Prepend original CSS to ensure it's included first
        // Then GrapesJS styles can override if needed
        cssContent = originalCssCombined + '\n\n/* GrapesJS Editor Styles */\n' + cssContent;
        
        // Remove any default black color overrides that GrapesJS might have added
        // This ensures original theme colors are preserved
        cssContent = cssContent.replace(/color\s*:\s*#000000\s*;?/gi, '/* color removed - using original theme color */');
        cssContent = cssContent.replace(/color\s*:\s*black\s*;?/gi, '/* color removed - using original theme color */');
        cssContent = cssContent.replace(/color\s*:\s*rgb\(0,\s*0,\s*0\)\s*;?/gi, '/* color removed - using original theme color */');
        
        console.log('✅ Method 5 - Original theme CSS:', originalThemeCssRef.current.length, 'chars', {
          imports: originalImports.length,
          regularCss: originalRegularCss.length
        });
      }

      // Ensure we have some CSS
      if (!cssContent || cssContent.trim().length === 0) {
        console.warn('⚠️ WARNING: No CSS found! Using original theme CSS if available.');
        cssContent = originalThemeCssRef.current || '';
      }
      
      // Final validation and logging
      if (cssContent.trim().length === 0) {
        console.error('❌ ERROR: No CSS content to save!');
        throw new Error('No CSS content found. Cannot save theme without CSS.');
      }

      // Log detailed CSS information for debugging
      const cssStats = {
        totalLength: cssContent.length,
        hasOriginalCss: originalThemeCssRef.current && originalThemeCssRef.current.length > 0,
        originalCssLength: originalThemeCssRef.current?.length || 0,
        hasImports: cssContent.includes('@import'),
        hasWrapperStyles: cssContent.includes('.gjs-wrapper-body'),
        hasBackgroundImages: cssContent.includes('background-image') || cssContent.includes('background:'),
        lineCount: cssContent.split('\n').length,
        preview: cssContent.substring(0, 500)
      };
      
      console.log('📦 Final CSS Statistics:', cssStats);
      console.log('📦 Final CSS length:', cssContent.length, 'chars');
      
      // Warn if CSS seems incomplete
      if (cssContent.length < 100) {
        console.warn('⚠️ WARNING: CSS content is very short. Theme may not display correctly.');
      }

      // Extract image references from HTML and prepare them for ZIP inclusion
      const extractImageReferences = (html: string): string[] => {
        const images: string[] = [];
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
        const srcsetRegex = /srcset=["']([^"']+)["']/gi;
        const bgImageRegex = /background-image\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
        
        // Extract from img src
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
          const src = match[1];
          if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('#') && !src.startsWith('mailto:')) {
            images.push(src);
          }
        }
        
        // Extract from srcset
        while ((match = srcsetRegex.exec(html)) !== null) {
          const srcset = match[1];
          srcset.split(',').forEach(entry => {
            const url = entry.trim().split(/\s+/)[0];
            if (url && !url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('#')) {
              images.push(url);
            }
          });
        }
        
        // Extract from background-image
        while ((match = bgImageRegex.exec(html)) !== null) {
          const url = match[1];
          if (url && !url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('#')) {
            images.push(url);
          }
        }
        
        // Remove duplicates and normalize paths
        return [...new Set(images.map(img => {
          // Remove leading slash
          return img.startsWith('/') ? img.substring(1) : img;
        }))];
      };

      // Commit current page changes
      commitCurrentPage();
      
      // Get all pages with current page updated
      const allPages = pagesRef.current.map(page => {
        if (page.id === currentPageId) {
          return { ...page, html: htmlContent, css: cssContent };
        }
        return page;
      });
      
      // Combine CSS from all pages
      const combinedCss = allPages
        .map((page) => page.css || '')
        .filter(Boolean)
        .join('\n\n');
      
      // Build multi-page HTML document
      const exportHtml = buildMultiPageHtmlDocument(allPages, themeName || 'My Theme', combinedCss);

      // Validate that CSS is actually embedded in the HTML
      const cssInHtml = exportHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      const embeddedCssLength = cssInHtml ? cssInHtml[1].length : 0;
      
      console.log('📦 Built export HTML:', {
        htmlLength: exportHtml.length,
        cssLength: cssContent.length,
        embeddedCssLength: embeddedCssLength,
        cssEmbedded: embeddedCssLength > 0,
        htmlPreview: exportHtml.substring(0, 300),
        cssPreview: cssContent.substring(0, 200)
      });
      
      // Warn if CSS wasn't embedded properly
      if (embeddedCssLength === 0) {
        console.error('❌ ERROR: CSS was not embedded in HTML document!');
        throw new Error('CSS embedding failed. Cannot save theme without CSS.');
      }
      
      if (embeddedCssLength < cssContent.length * 0.9) {
        console.warn('⚠️ WARNING: CSS length mismatch. Some CSS may be missing from HTML.');
      }

      // Extract image references
      const imageRefs = extractImageReferences(exportHtml);
      console.log('📸 Found image references:', imageRefs);

      // Generate thumbnail
      const thumbnailBlob = await generateDefaultThumbnail(themeName || 'My Theme');

      // Check if we're editing an existing custom theme (not an installed theme)
      const isValidObjectId = themeId && /^[0-9a-fA-F]{24}$/.test(themeId);
      const isEditingInstalledTheme = themeType === 'installed';

      let savedThemeId: string = themeId || '';

      // Only try to update if we have a valid ObjectId and it's NOT an installed theme
      if (isValidObjectId && !isEditingInstalledTheme) {
        try {
          const updated = await updateTheme(themeId, themeName || 'My Theme', exportHtml, cssContent, thumbnailBlob);
          if (updated) {
            savedThemeId = updated._id;
          } else {
            // Fallback to create
            const created = await createTheme(themeName || 'My Theme', exportHtml, cssContent, thumbnailBlob);
            if (created) {
              savedThemeId = created._id;
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('id', savedThemeId);
              newUrl.searchParams.delete('type'); // Remove type since it's now a custom theme
              window.history.replaceState({}, '', newUrl.toString());
            }
          }
        } catch (err: any) {
          if (err?.response?.status === 404) {
            // Theme not found, create new one
            const created = await createTheme(themeName || 'My Theme', exportHtml, cssContent, thumbnailBlob);
            if (created) {
              savedThemeId = created._id;
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('id', savedThemeId);
              newUrl.searchParams.delete('type');
              window.history.replaceState({}, '', newUrl.toString());
            }
          } else {
            throw err;
          }
        }
      } else {
        // Create new theme (installed themes always create new custom themes)
        console.log('Creating new theme...', {
          name: themeName || 'My Theme',
          htmlLength: exportHtml.length,
          cssLength: cssContent.length,
          hasThumbnail: !!thumbnailBlob
        });
        
        const created = await createTheme(themeName || 'My Theme', exportHtml, cssContent, thumbnailBlob);
        if (!created) {
          // Check if there was an error response
          console.error('createTheme returned null - check console for error details');
          throw new Error('Failed to create theme. Check console for details.');
        }
        savedThemeId = created._id;
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', savedThemeId);
        newUrl.searchParams.delete('type');
        window.history.replaceState({}, '', newUrl.toString());
      }

      setSaving(false);

      if (applyAfterSave) {
        // Apply theme (publish)
        localStorage.setItem('ziplofy.appliedCustomThemeId', savedThemeId);
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 3000);
      }
    } catch (e: any) {
      setSaving(false);
      console.error('Error saving theme:', e);
      console.error('Error details:', {
        message: e?.message,
        response: e?.response,
        status: e?.response?.status,
        data: e?.response?.data,
        code: e?.code
      });
      
      let errorMessage = 'Failed to save theme';
      if (e?.code === 'ECONNABORTED' || e?.message?.includes('timeout')) {
        errorMessage = 'Upload timeout: The theme is very large. Please try again or reduce the theme size.';
      } else if (e?.response?.status === 400) {
        errorMessage = e?.response?.data?.message || 'Bad Request: Invalid theme data. Please check the console for details.';
        console.error('400 Bad Request details:', e?.response?.data);
      } else if (e?.response?.status === 500) {
        errorMessage = 'Server error: The theme might be too large or there was a server issue. Please try again or reduce the theme size.';
      } else if (e?.response?.status === 413 || e?.message?.includes('File too large') || e?.message?.includes('MulterError')) {
        errorMessage = 'Theme too large: The theme exceeds the maximum size limit (500MB). Please reduce the size of your theme content.';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      alert(errorMessage);
    }
  }, [themeId, themeType, themeName, createTheme, updateTheme, buildMultiPageHtmlDocument, generateDefaultThumbnail, commitCurrentPage, currentPageId]);

  const applyImageFromCard = useCallback((src: string) => {
    if (!imagePanelData || !src) return;
    const comp = imagePanelData.component;
    comp.addAttributes?.({ src });
    comp.set?.('src', src);
    const view = comp.getView?.();
    if (view?.el) {
      view.el.setAttribute('src', src);
      const imgEl = view.el.tagName === 'IMG' ? view.el : view.el.querySelector?.('img');
      if (imgEl) imgEl.setAttribute('src', src);
    }
    comp.trigger?.('change');
    setImagePanelData((d) => d ? { ...d, src } : null);
  }, [imagePanelData]);

  const applyAltFromCard = useCallback(() => {
    if (!imagePanelData) return;
    const comp = imagePanelData.component;
    const alt = (imagePanelData.alt || '').trim();
    comp.addAttributes?.({ alt });
    comp.set?.('alt', alt);
    const view = comp.getView?.();
    if (view?.el) {
      view.el.setAttribute('alt', alt);
      const imgEl = view.el.tagName === 'IMG' ? view.el : view.el.querySelector?.('img');
      if (imgEl) imgEl.setAttribute('alt', alt);
    }
    comp.trigger?.('change');
  }, [imagePanelData]);

  const handleSave = () => {
    saveTheme(false);
  };

  const handlePublish = () => {
    saveTheme(true);
  };

  const previewTheme = useCallback(async () => {
    try {
      const editor = editorInstance.current;
      if (!editor || typeof editor.getHtml !== 'function') {
        alert('Editor not ready');
        return;
      }

      // Force editor to refresh/update before getting HTML/CSS
      if (editor.trigger) {
        editor.trigger('update');
      }
      
      // Get wrapper to ensure we get all content
      const wrapper = editor.getWrapper();
      if (wrapper && wrapper.view) {
        wrapper.view.render?.();
      }

      // Get HTML from editor
      let htmlContent = '';
      try {
        if (wrapper) {
          htmlContent = editor.getHtml({ component: wrapper }) || '';
          if (!htmlContent || htmlContent.trim().length === 0) {
            htmlContent = editor.getHtml() || '';
          }
        } else {
          htmlContent = editor.getHtml() || '';
        }
        
        if (!htmlContent || htmlContent.trim().length === 0) {
          console.warn('⚠️ No HTML from editor, using default');
          htmlContent = '<div>Empty Theme</div>';
        }
      } catch (e) {
        console.error('Error getting HTML from editor:', e);
        htmlContent = editor.getHtml() || '<div>Empty Theme</div>';
      }

      // Get CSS from editor - use same comprehensive extraction as saveTheme
      let cssContent = '';
      const cssFromMethods: string[] = [];
      
      // Method 1: Standard getCss()
      try {
        if (editor.getCss) {
          const standardCss = editor.getCss() || '';
          if (standardCss && standardCss.trim().length > 0) {
            cssFromMethods.push(standardCss);
          }
        }
      } catch (e) {
        console.warn('Error getting CSS from editor.getCss():', e);
      }
      
      // Method 2: CssComposer
      try {
        if (editor.CssComposer) {
          const cssRules = editor.CssComposer.getAll();
          if (cssRules && cssRules.length > 0) {
            const composerCss = cssRules.map((rule: any) => {
              try {
                if (rule.toCSS) {
                  return rule.toCSS();
                }
                const selector = rule.selectorsToString ? rule.selectorsToString() : (rule.getSelectors ? rule.getSelectors().join(', ') : '');
                const style = rule.getStyle ? rule.getStyle() : {};
                if (selector && style && Object.keys(style).length > 0) {
                  const styleString = Object.entries(style)
                    .map(([prop, value]) => `  ${prop}: ${value};`)
                    .join('\n');
                  return `${selector} {\n${styleString}\n}`;
                }
                return '';
              } catch { return ''; }
            }).filter(Boolean).join('\n\n');
            
            if (composerCss && composerCss.trim().length > 0) {
              cssFromMethods.push(composerCss);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to get CSS from CssComposer:', e);
      }
      
      cssContent = cssFromMethods.join('\n\n');
      
      // Convert wrapper ID selectors to class selectors
      if (wrapper) {
        const wrapperId = wrapper.getId();
        if (wrapperId && cssContent.includes(`#${wrapperId}`)) {
          const idSelectorPattern = new RegExp(`#${wrapperId}(?![a-zA-Z0-9_-])`, 'g');
          cssContent = cssContent.replace(idSelectorPattern, '.gjs-wrapper-body');
        }
      }
      
      // Method 3: Get wrapper styles
      try {
        if (wrapper) {
          const wrapperStyles = wrapper.getStyle ? wrapper.getStyle() : null;
          if (wrapperStyles && Object.keys(wrapperStyles).length > 0) {
            const styleEntries = Object.entries(wrapperStyles)
              .map(([prop, value]) => `  ${prop}: ${value};`)
              .join('\n');
            const wrapperCssRule = `.gjs-wrapper-body {\n${styleEntries}\n}`;
            
            if (cssContent.includes('.gjs-wrapper-body')) {
              cssContent = cssContent.replace(/\.gjs-wrapper-body\s*\{[^}]*\}/g, wrapperCssRule);
            } else {
              cssContent = wrapperCssRule + '\n\n' + cssContent;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to extract wrapper styles:', e);
      }
      
      // Method 4: Extract styles from canvas frame
      try {
        const canvas = editor.Canvas;
        if (canvas) {
          const frame = canvas.getFrameEl();
          if (frame && frame.contentDocument) {
            const doc = frame.contentDocument;
            
            // Extract all <style> tags (excluding editor-only: ziplofy-preserve-text-color, ziplofy-slider-fix)
            const styles = doc.querySelectorAll('style');
            const styleTagCss: string[] = [];
            const EDITOR_ONLY_IDS = ['ziplofy-preserve-text-color', 'ziplofy-slider-fix'];
            styles.forEach((style: Element) => {
              const id = (style as HTMLElement).id;
              if (EDITOR_ONLY_IDS.includes(id || '')) return;
              if (style.textContent && style.textContent.trim()) {
                styleTagCss.push(style.textContent);
              }
            });
            if (styleTagCss.length > 0) {
              cssContent += '\n\n/* Canvas Frame Style Tags */\n' + styleTagCss.join('\n\n');
            }
            
            // Extract CSS from <link rel="stylesheet"> tags
            const links = doc.querySelectorAll('link[rel="stylesheet"]');
            const buildAuthHeadersForFetch = (): Record<string, string> => {
              const headers: Record<string, string> = {};
              const token =
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('accessToken') ||
                localStorage.getItem('token') ||
                sessionStorage.getItem('token');
              if (token) headers.Authorization = `Bearer ${token}`;
              return headers;
            };
            
            const linkPromises = Array.from(links).map(async (link) => {
              const linkEl = link as HTMLLinkElement;
              const href = linkEl.href;
              if (href && !href.startsWith('data:')) {
                try {
                  const linkResponse = await fetch(href, { 
                    credentials: 'include',
                    headers: buildAuthHeadersForFetch()
                  });
                  if (linkResponse.ok) {
                    const linkCss = await linkResponse.text();
                    return linkCss || '';
                  }
                } catch (err) {
                  console.warn('Failed to fetch stylesheet:', href, err);
                  return `@import url('${href}');`;
                }
              }
              return '';
            });
            
            const fetchedLinkCss = await Promise.all(linkPromises);
            const linkCssContent = fetchedLinkCss.filter(css => css.trim()).join('\n\n');
            if (linkCssContent) {
              cssContent += '\n\n/* Canvas Frame External Stylesheets */\n' + linkCssContent;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to get CSS from canvas frame:', e);
      }

      // Method 5: Extract styles from each component (effects panel: opacity, box-shadow, filter, transition)
      // GrapesJS StyleManager may store these in component.getStyle(); ensure they appear in preview
      try {
        if (wrapper) {
          const allComponents: any[] = [];
          const collectComponents = (comp: any) => {
            if (comp) {
              allComponents.push(comp);
              const children = comp.components ? comp.components() : [];
              children.forEach((c: any) => collectComponents(c));
            }
          };
          collectComponents(wrapper);

          const componentStylesRules = allComponents
            .map((comp) => {
              const styles = comp.getStyle ? comp.getStyle() : null;
              if (!styles || Object.keys(styles).length === 0) return null;
              const compId = comp.getId && comp.getId();
              const classes = comp.getClasses ? comp.getClasses() : [];
              const selector = classes.length > 0 ? `.${classes.join('.')}` : compId ? `#${compId}` : null;
              if (!selector) return null;
              const styleString = Object.entries(styles)
                .map(([prop, value]) => `  ${prop}: ${value};`)
                .join('\n');
              return `${selector} {\n${styleString}\n}`;
            })
            .filter(Boolean)
            .join('\n\n');

          if (componentStylesRules) {
            cssContent += '\n\n/* Component effects (opacity, shadow, filter, transition) */\n' + componentStylesRules;
          }
        }
      } catch (e) {
        console.warn('Failed to extract component styles:', e);
      }

      // Include original theme CSS
      if (originalThemeCssRef.current && originalThemeCssRef.current.trim().length > 0) {
        const originalCssLines = originalThemeCssRef.current.split('\n');
        const originalImports: string[] = [];
        const originalRegularCss: string[] = [];
        
        originalCssLines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('@import')) {
            originalImports.push(trimmed);
          } else {
            originalRegularCss.push(line);
          }
        });
        
        const originalCssCombined = originalImports.join('\n') + 
          (originalImports.length > 0 ? '\n\n' : '') + 
          originalRegularCss.join('\n');
        
        cssContent = originalCssCombined + '\n\n/* GrapesJS Editor Styles */\n' + cssContent;
      }

      // Ensure we have CSS
      if (!cssContent || cssContent.trim().length === 0) {
        cssContent = originalThemeCssRef.current || '';
      }

      // Commit current page changes
      commitCurrentPage();
      
      // Get all pages with current page updated
      const allPages = pagesRef.current.map(page => {
        if (page.id === currentPageId) {
          return { ...page, html: htmlContent, css: cssContent };
        }
        return page;
      });
      
      // Combine CSS from all pages
      const combinedCss = allPages
        .map((page) => page.css || '')
        .filter(Boolean)
        .join('\n\n');
      
      // Build multi-page HTML document
      const fullHtml = buildMultiPageHtmlDocument(allPages, themeName || 'Theme Preview', combinedCss);
      
      console.log('✅ Preview HTML built:', {
        htmlLength: fullHtml.length,
        cssLength: cssContent.length,
        containsCss: fullHtml.includes('<style>')
      });

      // Show preview modal
      setPreviewHtml('');
      setTimeout(() => {
        setPreviewHtml(fullHtml);
        setShowPreviewModal(true);
        
        // Force iframe content update
        setTimeout(() => {
          const iframe = document.getElementById('basic-elementor-preview-iframe') as HTMLIFrameElement;
          if (iframe && iframe.contentDocument && fullHtml) {
            iframe.contentDocument.open();
            iframe.contentDocument.write(fullHtml);
            iframe.contentDocument.close();
            console.log('✅ Forced iframe content update');
          }
        }, 100);
      }, 50);
    } catch (e) {
      console.error('Preview error:', e);
      alert('Failed to preview theme');
    }
  }, [themeName, buildMultiPageHtmlDocument, originalThemeCssRef, currentPageId, commitCurrentPage]);

  const templateSections = [
    "Hero section",
    "Logo banner",
    "Collection list: Grid",
    "Product highlight",
    "Product card",
    "Featured collection",
    "Collection list: Carousel",
    "Marquee"
  ];

  return (
    <div className="custom-theme-builder-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--builder-bg-light, #faf8fc)' }}>
      {/* Top Bar - Same as Visual Elementor */}
      <div className="elementor-top-bar">
        <div className="elementor-top-bar-left">
          <div className="elementor-top-bar-icon" onClick={() => navigate('/themes/all-themes')} title="Back to Themes">☰</div>
          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(0, 0, 0, 0.4)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Theme:</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#000' }}>{themeName || "Editing Theme"}</span>
          </div>
          {pages.length > 1 && (
            <div style={{ marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid rgba(0,0,0,0.1)' }}>
              <select
                value={currentPageId}
                onChange={(e) => switchPage(e.target.value)}
                style={{
                  padding: '5px 28px 5px 10px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: 'rgba(0,0,0,0.02)',
                  borderRadius: '6px',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                }}
                title="Select page"
              >
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>{page.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="elementor-top-bar-center">
          <div className="device-selector" style={{ display: 'flex', gap: 4, background: 'rgba(149, 117, 205, 0.08)', padding: 4, borderRadius: 6, border: '1px solid rgba(149, 117, 205, 0.2)' }}>
            <button
              className={`device-btn ${currentDevice === 'desktop' ? 'active' : ''}`}
              onClick={() => currentDevice !== 'desktop' && setCurrentDevice('desktop')}
              title="Desktop View"
              type="button"
              style={{ padding: '6px 8px', border: 'none', background: currentDevice === 'desktop' ? '#9575cd' : 'transparent', color: currentDevice === 'desktop' ? '#fff' : '#6b7280', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M5 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button
              className={`device-btn ${currentDevice === 'tablet' ? 'active' : ''}`}
              onClick={() => currentDevice !== 'tablet' && setCurrentDevice('tablet')}
              title="Tablet View"
              type="button"
              style={{ padding: '6px 8px', border: 'none', background: currentDevice === 'tablet' ? '#9575cd' : 'transparent', color: currentDevice === 'tablet' ? '#fff' : '#6b7280', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="2" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
            </button>
            <button
              className={`device-btn ${currentDevice === 'mobile' ? 'active' : ''}`}
              onClick={() => currentDevice !== 'mobile' && setCurrentDevice('mobile')}
              title="Mobile View"
              type="button"
              style={{ padding: '6px 8px', border: 'none', background: currentDevice === 'mobile' ? '#9575cd' : 'transparent', color: currentDevice === 'mobile' ? '#fff' : '#6b7280', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="5" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="8" cy="13" r="1" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
        <div className="elementor-top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={handleUndo} className="elementor-top-bar-icon" title="Undo" style={{ fontSize: 14 }} disabled={!canUndo}>↶</button>
          <button onClick={handleRedo} className="elementor-top-bar-icon" title="Redo" style={{ fontSize: 14 }} disabled={!canRedo}>↷</button>
          <button onClick={previewTheme} className="elementor-preview-btn" title="Preview Theme">Preview</button>
          <button onClick={handleSave} className="elementor-preview-btn" disabled={saving} style={{ marginRight: 0 }}>{saving ? 'Saving...' : 'Save'}</button>
          <button onClick={handlePublish} className="elementor-publish-btn" disabled={saving}>{saving ? (publishSuccess ? 'Published!' : 'Publishing...') : (publishSuccess ? 'Published!' : 'Publish')}</button>
          {publishSuccess && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, padding: '8px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: 8, fontSize: 13, whiteSpace: 'nowrap', zIndex: 1000, animation: 'slideDown 0.3s ease-out' }}>Theme published successfully!</div>
          )}
        </div>
      </div>

      <div className={`builder-main-editor device-${currentDevice}`} style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--builder-bg-canvas, #f6f6f7)' }}>
        {/* Left Sidebar - Same structure as Visual Elementor */}
        <div className="builder-left-panel" style={{ width: 320, minWidth: 320 }}>
          <div className="elementor-elements-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(149, 117, 205, 0.15)' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--builder-text)' }}>
              {showStylePanel ? `Styles${selectedSection ? `: ${selectedSection}` : ''}` : 'Structure'}
            </span>
            {showStylePanel && (
              <button
                onClick={() => {
                  setShowStylePanel(false);
                  setShowStructurePanel(true);
                  const editor = editorInstance.current;
                  if (editor) editor.select(null);
                }}
                style={{ padding: '6px 12px', border: '1px solid rgba(149, 117, 205, 0.2)', background: 'transparent', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--builder-primary)' }}
              >
                Back
              </button>
            )}
          </div>
          <div className="elementor-left-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {showStylePanel ? (
          <div className="basic-elementor-style-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
              {imagePanelData && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>🖼️ Change image</div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="url"
                      value={imagePanelData.src}
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => setImagePanelData((d) => d ? { ...d, src: e.target.value } : null)}
                      onKeyDown={(e) => e.key === 'Enter' && applyImageFromCard((e.target as HTMLInputElement).value.trim())}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={() => applyImageFromCard((imagePanelData?.src || '').trim())}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', background: '#5e72e4', color: '#fff', fontWeight: 600, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Apply
                    </button>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <input
                      id="basic-elementor-image-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file?.type?.startsWith('image/')) {
                          const r = new FileReader();
                          r.onload = () => { const s = r.result as string; if (s) applyImageFromCard(s); };
                          r.readAsDataURL(file);
                        }
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => (document.getElementById('basic-elementor-image-upload') as HTMLInputElement)?.click()}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px dashed #d1d5db', background: '#f9fafb', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}
                    >
                      Choose file to upload
                    </button>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>Alt text</label>
                    <input
                      type="text"
                      value={imagePanelData.alt}
                      placeholder="Describe the image"
                      onChange={(e) => setImagePanelData((d) => d ? { ...d, alt: e.target.value } : null)}
                      onBlur={() => applyAltFromCard()}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                    />
                  </div>
                </div>
              )}
              <StylePanelMountPoint />
            </div>
          </div>
        ) : showStructurePanel ? (
          <div className="basic-elementor-sidebar elementor-blocks-wrapper">
          <div className="sidebar-section">
            <div className="sidebar-title">Home page</div>
          </div>

          {/* Header Section */}
          <div className="sidebar-section">
            <div 
              className="sidebar-section-header"
              onClick={() => toggleSection('header')}
            >
              <span className="section-title">Header</span>
              <span className="section-toggle">{expandedSections.header ? '▼' : '▶'}</span>
            </div>
            {expandedSections.header && (
              <div className="sidebar-section-content">
                <div 
                  className={`section-item ${selectedSection === 'Header' ? 'selected' : ''}`}
                  onClick={() => handleSectionClick('Header')}
                >
                  <span>Header</span>
                  <button 
                    className="section-edit-btn"
                    onClick={(e) => handleEditSection('Header', e)}
                    title="Edit styles"
                  >
                    Edit
                  </button>
                </div>
                <button className="add-section-btn">Add section</button>
              </div>
            )}
          </div>

          {/* Template Section */}
          <div className="sidebar-section">
            <div 
              className="sidebar-section-header"
              onClick={() => toggleSection('template')}
            >
              <span className="section-title">Template</span>
              <span className="section-toggle">{expandedSections.template ? '▼' : '▶'}</span>
            </div>
            {expandedSections.template && (
              <div className="sidebar-section-content">
                {templateSections.map((section, index) => (
                  <div 
                    key={index} 
                    className={`section-item ${selectedSection === section ? 'selected' : ''}`}
                    onClick={() => handleSectionClick(section)}
                  >
                    <span>{section}</span>
                    <button 
                      className="section-edit-btn"
                      onClick={(e) => handleEditSection(section, e)}
                      title="Edit styles"
                    >
                      Edit
                    </button>
                  </div>
                ))}
                <button className="add-section-btn">Add section</button>
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="sidebar-section">
            <div 
              className="sidebar-section-header"
              onClick={() => toggleSection('footer')}
            >
              <span className="section-title">Footer</span>
              <span className="section-toggle">{expandedSections.footer ? '▼' : '▶'}</span>
            </div>
            {expandedSections.footer && (
              <div className="sidebar-section-content">
                <div 
                  className={`section-item ${selectedSection === 'Footer' ? 'selected' : ''}`}
                  onClick={() => handleSectionClick('Footer')}
                >
                  <span>Footer</span>
                  <button 
                    className="section-edit-btn"
                    onClick={(e) => handleEditSection('Footer', e)}
                    title="Edit styles"
                  >
                    Edit
                  </button>
                </div>
                <div 
                  className={`section-item ${selectedSection === 'Logo' ? 'selected' : ''}`}
                  onClick={() => handleSectionClick('Logo')}
                >
                  <span>Logo</span>
                  <button 
                    className="section-edit-btn"
                    onClick={(e) => handleEditSection('Logo', e)}
                    title="Edit styles"
                  >
                    Edit
                  </button>
                </div>
                <button className="add-section-btn">Add section</button>
              </div>
            )}
          </div>
          </div>
        ) : null}
          </div>
        </div>

        {/* Center - Canvas - Same as Visual Elementor */}
        <div className="builder-center-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--builder-bg-canvas, #f6f6f7)', position: 'relative' }}>
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: currentDevice === 'desktop' ? 'stretch' : 'center', padding: '20px', width: '100%' }}>
          <div className="elementor-canvas-header" style={{ width: '100%', maxWidth: currentDevice === 'desktop' ? '100%' : (currentDevice === 'mobile' ? '375px' : '768px'), marginBottom: 0 }}>
            <div className="elementor-canvas-site-name">{themeName || 'Ziplofy Theme'}</div>
            <div className="elementor-canvas-page-name">{pages.find(p => p.id === currentPageId)?.name || 'Home'}</div>
          </div>
        <div 
          className="basic-elementor-preview" 
          style={{ 
            width: currentDevice === 'desktop' ? '100%' : (currentDevice === 'mobile' ? '375px' : '768px'), 
            maxWidth: currentDevice === 'desktop' ? '100%' : (currentDevice === 'mobile' ? '375px' : '768px'), 
            flex: currentDevice === 'desktop' ? 1 : undefined,
            background: '#fff', 
            minHeight: '600px', 
            position: 'relative', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
        >
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div>Loading theme...</div>
            </div>
          )}
          {error && (
            <div className="error-overlay">
              <div>{error}</div>
            </div>
          )}
          <div 
            ref={editorRef} 
            id="gjs-editor-container"
            style={{ height: '100%', width: '100%', minHeight: 0, position: 'relative' }} 
          />
        </div>
        <div className="elementor-canvas-footer" style={{ width: '100%', maxWidth: currentDevice === 'desktop' ? '100%' : (currentDevice === 'mobile' ? '375px' : '768px'), marginTop: 0 }}>
          Copyright © {new Date().getFullYear()} {themeName || 'Ziplofy Theme'} | Powered by <a href="#" onClick={(e) => e.preventDefault()}>Ziplofy Theme Builder</a>
        </div>
        </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100000,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            style={{
              width: '95%',
              height: '95%',
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f9fafb',
                borderRadius: '8px 8px 0 0',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                Theme Preview
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5da',
                  background: '#fff',
                  color: '#111827',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Close
              </button>
            </div>

            {/* Preview Iframe */}
            <iframe
              id="basic-elementor-preview-iframe"
              key={`preview-${Date.now()}-${previewHtml.length}`}
              srcDoc={previewHtml}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#fff',
                flex: 1,
              }}
              title="Theme Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              onLoad={(e) => {
                // Force update iframe content when it loads
                const iframe = e.target as HTMLIFrameElement;
                if (iframe && iframe.contentDocument && previewHtml) {
                  iframe.contentDocument.open();
                  iframe.contentDocument.write(previewHtml);
                  iframe.contentDocument.close();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicElementor;

