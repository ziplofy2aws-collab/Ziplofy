import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCustomThemes } from '../../contexts/custom-themes.context';
import { useStore } from '../../contexts/store.context';
import ElementorTutorial from '../../components/ElementorTutorial';
import html2canvas from 'html2canvas';
import { safeLocalStorage } from '../../types/local-storage';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import './CustomThemeBuilder.css';
import { normalizeStyleManagerCSSValue, sanitizeComponentStylesFromGrapes } from './visualElementorThemeUtils';
import { injectThemeStylesIntoFrame } from './visualElementorStyleInjection';

/** StyleManager pushes computed layout on select; writing these to the model overrides theme flex/grid (collapsed header, hero gaps). */
const STYLE_MANAGER_LAYOUT_BLOCK = new Set([
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'float',
  'clear',
  'flex',
  'flex-direction',
  'flex-wrap',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'align-items',
  'align-content',
  'align-self',
  'justify-content',
  'justify-items',
  'justify-self',
  'gap',
  'row-gap',
  'column-gap',
  'grid',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-area',
  'grid-column',
  'grid-row',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'overflow',
  'overflow-x',
  'overflow-y',
  'box-sizing',
  'z-index',
  'vertical-align',
  'object-fit',
  'object-position',
  'transform',
  'transform-origin',
  'pointer-events',
  'cursor',
]);

function isStyleManagerLayoutNoise(propName: string): boolean {
  const k = String(propName)
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase();
  if (STYLE_MANAGER_LAYOUT_BLOCK.has(k)) return true;
  return /^margin-|^padding-|^flex-|^align-|^justify-|^grid-|^min-|^max-|^overflow-|^object-|^transform|^inset|^gap-|^row-|^column-/.test(k);
}

const CustomThemeBuilder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeStoreId: contextActiveStoreId } = useStore();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const rootContainerRef = useRef<HTMLDivElement | null>(null);
  const editorInstance = useRef<any>(null);
  const blocksRenderedRef = useRef<boolean>(false); // Track if blocks have been rendered
  const [loading, setLoading] = useState<boolean>(true);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>('My Theme');
  const [saving, setSaving] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [blockSearch, setBlockSearch] = useState<string>('');
  const [currentDevice, setCurrentDevice] = useState<string>('desktop');
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [activeSidebarSection, setActiveSidebarSection] = useState<'widgets' | 'links' | 'structure' | 'style'>('widgets');
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState<boolean>(false);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [showLinkManager, setShowLinkManager] = useState<boolean>(false);
  const [linksPanelData, setLinksPanelData] = useState<{ component: any; href: string; pageLink: string; linkType: string; tagName: string } | null>(null);
  const [imagePanelData, setImagePanelData] = useState<{ component: any; src: string; alt: string } | null>(null);
  const [imageCardMode, setImageCardMode] = useState<'upload' | 'url'>('upload');

  const applyImageFromCard = useCallback((src: string) => {
    if (!imagePanelData || !src) return;
    const comp = imagePanelData.component;
    const editor = editorInstance.current;
    const view = comp?.getView?.();
    const el = view?.el;
    const imgEl = el && (el.tagName === 'IMG' ? el : el.querySelector?.('img'));
    if (!imgEl) return;
    (imgEl as HTMLImageElement).setAttribute('src', src);
    const tag = (comp?.get?.('tagName') || '').toLowerCase();
    if (tag === 'img') { comp?.addAttributes?.({ src }); comp?.set?.('src', src); }
    else { const imgComp = editor?.Components?.getComponent?.(imgEl); if (imgComp) { imgComp.addAttributes?.({ src }); imgComp.set?.('src', src); } }
    comp?.trigger?.('change');
    setImagePanelData((d) => d ? { ...d, src } : null);
    setHasUnsavedChanges(true);
  }, [imagePanelData]);

  const applyAltFromCard = useCallback(() => {
    if (!imagePanelData) return;
    const comp = imagePanelData.component;
    const editor = editorInstance.current;
    const alt = (imagePanelData.alt || '').trim();
    const view = comp?.getView?.();
    const el = view?.el;
    const imgEl = el && (el.tagName === 'IMG' ? el : el.querySelector?.('img'));
    if (imgEl) {
      (imgEl as HTMLImageElement).setAttribute('alt', alt);
      const tag = (comp?.get?.('tagName') || '').toLowerCase();
      if (tag === 'img') { comp?.addAttributes?.({ alt }); comp?.set?.('alt', alt); }
      else { const imgComp = editor?.Components?.getComponent?.(imgEl); if (imgComp) { imgComp.addAttributes?.({ alt }); imgComp.set?.('alt', alt); } }
    }
    comp?.trigger?.('change');
    setHasUnsavedChanges(true);
  }, [imagePanelData]);
  const [linkManagerLinks, setLinkManagerLinks] = useState<Array<{ id: string; type: string; text: string; href?: string; pageLink?: string; component: any }>>([]);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<Array<{ id: string; content: string; createdAt: number }>>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const { createTheme, updateTheme, fetchAll: fetchCustomThemes } = useCustomThemes();

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('accessToken');
      if (tokenFromUrl) {
        safeLocalStorage.setItem('accessToken', tokenFromUrl);
        params.delete('accessToken');
        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);
      }
    } catch (err) {
      console.warn('Failed to persist access token from URL:', err);
    }
  }, []);
  
  // Multi-page management
  interface Page {
    id: string;
    name: string;
    html: string;
    css: string;
  }

  // Blank canvas - empty droppable container, no pre-loaded section or placeholders
  const DEFAULT_PAGE_CONTENT =
    '<div data-gjs-droppable="*" data-gjs-selectable="true" style="min-height: 100%; min-width: 100%;"></div>';

  const sanitizeExternalHref = (value: string): string => {
    if (!value) return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('mailto:') || lower.startsWith('tel:')) {
      return trimmed;
    }
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }
    if (trimmed.includes('://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const id = useMemo(() => {
    try {
      if (searchParams && typeof searchParams.get === 'function') {
        // Check both 'id' and 'themeId' parameters
        const fromHook = searchParams.get('id') || searchParams.get('themeId');
        if (fromHook) {
          // Validate theme ID format - only accept MongoDB ObjectIds (24 hex characters)
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(fromHook);
          if (isValidObjectId) {
            return fromHook as string;
          } else {
            // Invalid ID format (likely UUID from old system) - clear it from URL
            console.warn('Invalid theme ID format detected:', fromHook, '- Clearing from URL');
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('id');
            newUrl.searchParams.delete('themeId');
            window.history.replaceState({}, '', newUrl.toString());
            
            // Also clear any localStorage data for this invalid ID
            try {
              const oldKey = `ziplofy.builder.pages.${fromHook}`;
              localStorage.removeItem(oldKey);
            } catch (e) {
              console.warn('Failed to clear localStorage for invalid ID:', e);
            }
            return null;
          }
        }
      }
    } catch {}
    try {
      const params = new URLSearchParams(window.location.search);
      const fromWindow = params.get('id') || params.get('themeId');
      if (fromWindow) {
        // Validate theme ID format
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(fromWindow);
        if (isValidObjectId) {
          return fromWindow as string;
        } else {
          // Invalid ID - clear it
          console.warn('Invalid theme ID format detected:', fromWindow, '- Clearing from URL');
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('id');
          newUrl.searchParams.delete('themeId');
          window.history.replaceState({}, '', newUrl.toString());
          
          try {
            const oldKey = `ziplofy.builder.pages.${fromWindow}`;
            localStorage.removeItem(oldKey);
          } catch (e) {
            console.warn('Failed to clear localStorage for invalid ID:', e);
          }
          return null;
        }
      }
    } catch {}
    // Don't generate a UUID - return null if no valid ID is found
    // This ensures we create a new theme with a proper MongoDB ObjectId from the backend
    return null;
  }, [searchParams]);

  const isExistingTheme = useMemo(() => {
    return !!(id && /^[0-9a-fA-F]{24}$/.test(id));
  }, [id]);

  // Load notes from localStorage when theme ID changes
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(`ziplofy-theme-notes-${id || 'new'}`);
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        } else {
          // Legacy format - single string, convert to array
          setNotes(parsed ? [{ id: Date.now().toString(), content: parsed, createdAt: Date.now() }] : []);
        }
      } else {
        setNotes([]);
      }
    } catch (e) {
      console.warn('Failed to load notes:', e);
      setNotes([]);
    }
  }, [id]);

  // Auto-save notes when they change
  useEffect(() => {
    if (notes.length > 0 || editingNoteId !== null) {
      const saveTimeout = setTimeout(() => {
        try {
          localStorage.setItem(`ziplofy-theme-notes-${id || 'new'}`, JSON.stringify(notes));
        } catch (e) {
          console.warn('Failed to auto-save notes:', e);
        }
      }, 1000); // Auto-save after 1 second of no typing

      return () => clearTimeout(saveTimeout);
    }
  }, [notes, id, editingNoteId]);

  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      content: '',
      createdAt: Date.now()
    };
    setNotes([...notes, newNote]);
    setEditingNoteId(newNote.id);
  };

  const updateNote = (noteId: string, content: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, content } : note
    ));
  };

  const deleteNote = (noteId: string) => {
    if (confirm('Delete this note? This cannot be undone.')) {
      setNotes(notes.filter(note => note.id !== noteId));
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
      }
      try {
        const updatedNotes = notes.filter(note => note.id !== noteId);
        localStorage.setItem(`ziplofy-theme-notes-${id || 'new'}`, JSON.stringify(updatedNotes));
      } catch (e) {
        console.warn('Failed to save after delete:', e);
      }
    }
  };

  const storeIdParam = useMemo(() => {
    try {
      const fromHook = searchParams?.get?.('storeId');
      if (fromHook) {
        console.log('📌 Found storeId in URL via searchParams:', fromHook);
        return fromHook;
      }
    } catch (e) {
      console.warn('Error reading storeId from searchParams:', e);
    }
    try {
      const fromWindow = new URLSearchParams(window.location.search).get('storeId');
      if (fromWindow) {
        console.log('📌 Found storeId in URL via window.location:', fromWindow);
        return fromWindow;
      }
    } catch (e) {
      console.warn('Error reading storeId from window.location:', e);
    }
    console.log('⚠️ No storeId found in URL');
    return '';
  }, [searchParams]);

  const resolvedStoreId = useMemo(() => {
    // Priority 1: URL parameter
    if (storeIdParam) {
      console.log('📌 Using storeId from URL parameter:', storeIdParam);
      return storeIdParam;
    }
    // Priority 2: Store context (most reliable)
    if (contextActiveStoreId) {
      console.log('📌 Using activeStoreId from store context:', contextActiveStoreId);
      return contextActiveStoreId;
    }
    // Priority 3: localStorage/sessionStorage (fallback)
    try {
      const fromStorage = 
        localStorage.getItem('activeStoreId') ||
        sessionStorage.getItem('activeStoreId') ||
        localStorage.getItem('storeId') ||
        sessionStorage.getItem('storeId') ||
        '';
      if (fromStorage) {
        console.log('📌 Using storeId from localStorage/sessionStorage:', fromStorage);
      } else {
        console.warn('⚠️ No storeId found in URL, context, or storage');
      }
      return fromStorage;
    } catch {
      return '';
    }
  }, [storeIdParam, contextActiveStoreId]);

  // Log store ID resolution for debugging
  useEffect(() => {
    console.log('🔍 Store ID resolution:', {
      storeIdParam,
      contextActiveStoreId,
      resolvedStoreId,
      localStorageActiveStoreId: localStorage.getItem('activeStoreId'),
      localStorageStoreId: localStorage.getItem('storeId'),
      appliedCustomThemeId: localStorage.getItem('ziplofy.appliedCustomThemeId')
    });
  }, [storeIdParam, contextActiveStoreId, resolvedStoreId]);

  const isInstalledMode = useMemo(() => {
    try {
      // Check for type=installed parameter (new way)
      const typeParam = searchParams?.get?.('type');
      if (typeParam === 'installed') return true;
      // Check for installed/source parameters (legacy way)
      const mode = searchParams?.get?.('installed') || searchParams?.get?.('source');
      if (mode) {
        return mode.toLowerCase() === 'installed' || mode === 'true';
      }
    } catch {}
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('type') === 'installed') return true;
      const mode = params.get('installed') || params.get('source');
      if (mode) {
        return mode.toLowerCase() === 'installed' || mode === 'true';
      }
    } catch {
      return false;
    }
    return false;
  }, [searchParams]);

  const shouldLoadInstalledTheme = useMemo(() => {
    if (isInstalledMode) return true;
    if (!id) return false;
    return !/^[0-9a-fA-F]{24}$/.test(id);
  }, [isInstalledMode, id]);

  const extractUserIdFromToken = () => {
    try {
      const token =
        safeLocalStorage.getItem('accessToken') ||
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('token');
      if (!token) return '';
      const parts = token.split('.');
      if (parts.length < 2) return '';
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      return String(payload.uid || payload.userId || payload.id || '');
    } catch {
      return '';
    }
  };

  const buildAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    const token =
      safeLocalStorage.getItem('accessToken') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const fetchInstalledThemeFromFiles = async (force: boolean = false): Promise<{ html: string; css?: string; name?: string; pages?: Page[] } | null> => {
    console.log('🔍 fetchInstalledThemeFromFiles called:', { shouldLoadInstalledTheme, force, id, isInstalledMode });
    
    if ((!shouldLoadInstalledTheme && !force) || !id) {
      console.log('⏭️ Skipping installed theme fetch:', { shouldLoadInstalledTheme, force, id });
      return null;
    }
    try {
      if (typeof window === 'undefined') return null;
      
      const extractedUserId = extractUserIdFromToken();
      const ownerId = resolvedStoreId || extractedUserId;
      
      console.log('🔍 Store ID resolution:', {
        resolvedStoreId,
        extractedUserId,
        storeIdParam,
        finalOwnerId: ownerId,
        localStorageActiveStoreId: localStorage.getItem('activeStoreId'),
        sessionStorageActiveStoreId: sessionStorage.getItem('activeStoreId'),
        localStorageStoreId: localStorage.getItem('storeId'),
        sessionStorageStoreId: sessionStorage.getItem('storeId')
      });
      
      if (!ownerId) {
        console.error('❌ No store/user identifier provided for installed theme editing', {
          resolvedStoreId,
          extractedUserId,
          storeIdParam,
          localStorageActiveStoreId: localStorage.getItem('activeStoreId'),
          sessionStorageActiveStoreId: sessionStorage.getItem('activeStoreId'),
          contextActiveStoreId
        });
        setError('Unable to identify store or user. Please ensure you are logged in and have selected a store.');
        return null;
      }

      const apiBase =
        (import.meta.env.VITE_API_URL as string | undefined) ||
        `${window.location.origin}/api`;
      const cacheBust = Date.now();
      const basePath = `${apiBase}/themes/installed/${ownerId}/${id}/unzippedTheme`;
      const themeUrl = `${basePath}/index.html?v=${cacheBust}`;
      
      console.log('🔍 Fetching installed theme from:', themeUrl, {
        ownerId,
        themeId: id,
        apiBase,
        isInstalledMode,
        shouldLoadInstalledTheme,
        fullUrl: themeUrl
      });
      
      const authHeaders = buildAuthHeaders();
      console.log('🔐 Auth headers:', { hasToken: !!authHeaders.Authorization });
      
      const response = await fetch(themeUrl, {
        credentials: 'include',
        headers: authHeaders,
      });
      
      console.log('📡 Theme fetch response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: themeUrl
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        console.error('❌ Installed theme request failed:', {
          status: response.status,
          statusText: response.statusText,
          url: themeUrl,
          ownerId,
          themeId: id,
          errorBody: errorText.substring(0, 200)
        });
        if (response.status === 404) {
          setError(`Theme not found at ${themeUrl}. Please verify that theme ID "${id}" exists for store "${ownerId}" and you have permission to access it.`);
        } else if (response.status === 403) {
          setError('You do not have permission to access this theme.');
        } else {
          setError(`Failed to load theme: ${response.status} ${response.statusText}. Check console for details.`);
        }
        return null;
      }
      const rawHtml = await response.text();
      if (typeof DOMParser === 'undefined') {
        return { html: rawHtml || DEFAULT_PAGE_CONTENT, css: '', name: 'Installed Theme' };
      }
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      const toAbsoluteUrl = (value: string | null | undefined) => {
        if (!value) return '';
        const trimmed = value.trim();
        if (!trimmed) return '';
        if (/^(?:https?:|data:|mailto:|tel:|javascript:|\/\/)/i.test(trimmed)) return trimmed;
        if (trimmed.startsWith('#')) return trimmed;
        try {
          const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
          if (trimmed.startsWith('/')) {
            return `${normalizedBase}${trimmed.replace(/^\/+/, '')}`;
          }
          return new URL(trimmed, normalizedBase).href;
        } catch {
          return trimmed;
        }
      };

      const rewriteAttribute = (selector: string, attribute: string) => {
        doc.querySelectorAll(selector).forEach((node) => {
          const value = node.getAttribute(attribute);
          if (!value) return;
          if (/^(?:https?:|data:|mailto:|tel:|javascript:|\/\/)/i.test(value)) return;
          if (value.startsWith('#')) return;
          node.setAttribute(attribute, toAbsoluteUrl(value));
        });
      };

      rewriteAttribute('[src]', 'src');

      doc.querySelectorAll('img[srcset], source[srcset]').forEach((node) => {
        const srcset = node.getAttribute('srcset');
        if (!srcset) return;
        const rewritten = srcset
          .split(',')
          .map((entry) => {
            const [url, size] = entry.trim().split(/\s+/, 2);
            const abs = toAbsoluteUrl(url);
            return size ? `${abs} ${size}` : abs;
          })
          .join(', ');
        node.setAttribute('srcset', rewritten);
      });

      doc.querySelectorAll('[style]').forEach((node) => {
        const styleValue = node.getAttribute('style');
        if (!styleValue) return;
        const rewritten = styleValue.replace(/url\((['"]?)(?!https?:|data:|mailto:|tel:|javascript:|\/\/)([^'")]+)\1\)/gi, (_match, quote = '', path) => {
          const abs = toAbsoluteUrl(path);
          return `url(${quote}${abs}${quote})`;
        });
        node.setAttribute('style', rewritten);
      });

      // CRITICAL: Discover pages BEFORE rewriting links to absolute URLs
      // This ensures we can identify internal page links correctly
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
      
      // Now rewrite links to absolute URLs for display
      doc.querySelectorAll('a[href]').forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (!href) return;
        if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
        if (href.startsWith('#')) return;
        anchor.setAttribute('href', toAbsoluteUrl(href));
      });

      const extractHeadStyles = async () => {
        const cssParts: string[] = [];
        
        // Helper to check if URL is external CDN (not from our API)
      const isExternalCDN = (url: string): boolean => {
        try {
          const urlObj = new URL(url);
            const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || 
                           `${window.location.origin}/api`;
            const apiUrlObj = new URL(apiBase);
            // Check if it's from a known CDN or different origin
            const isCDN = urlObj.hostname.includes('cdnjs.cloudflare.com') ||
                         urlObj.hostname.includes('cdn.jsdelivr.net') ||
                         urlObj.hostname.includes('unpkg.com') ||
                         urlObj.hostname.includes('fonts.googleapis.com') ||
                         urlObj.hostname.includes('fonts.gstatic.com');
            const isDifferentOrigin = urlObj.origin !== apiUrlObj.origin && 
                                     urlObj.origin !== window.location.origin;
            return isCDN || isDifferentOrigin;
        } catch {
          return false;
        }
      };

        // Fetch and inline external stylesheets
        const linkPromises = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(async (link) => {
          const href = link.getAttribute('href');
          if (!href) return '';
          const absoluteUrl = toAbsoluteUrl(href);
          
          // For external CDNs, use @import directly to avoid CORS issues
        if (isExternalCDN(absoluteUrl)) {
            console.log(`Using @import for external CDN: ${absoluteUrl}`);
          return `@import url('${absoluteUrl}');`;
        }
          
          // For internal resources, try to fetch with credentials
        try {
          const cssResponse = await fetch(absoluteUrl, {
            credentials: 'include',
            headers: buildAuthHeaders(),
          });
          if (cssResponse.ok) {
            const cssText = await cssResponse.text();
              return cssText || '';
            } else {
              console.warn(`Failed to fetch CSS from ${absoluteUrl}:`, cssResponse.status);
              // Fallback to @import if fetch fails
              return `@import url('${absoluteUrl}');`;
            }
          } catch (err) {
            console.warn(`Error fetching CSS from ${absoluteUrl}, using @import:`, err);
            // Fallback to @import if fetch fails
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

      // CRITICAL: Extract scripts from head BEFORE processing body HTML
      // Scripts in head will be lost if we only use body.innerHTML
      const headScripts: Array<{ src?: string; content?: string; type?: string; async?: boolean; defer?: boolean }> = [];
      const bodyScripts: Array<{ src?: string; content?: string; type?: string; async?: boolean; defer?: boolean }> = [];
      
      // Extract scripts from head
      doc.head.querySelectorAll('script').forEach((script) => {
        const scriptData: any = {};
        if (script.src) {
          scriptData.src = toAbsoluteUrl(script.getAttribute('src') || '');
        }
        if (script.textContent) {
          scriptData.content = script.textContent;
        }
        if (script.type) {
          scriptData.type = script.type;
        }
        scriptData.async = script.async;
        scriptData.defer = script.defer;
        if (scriptData.src || scriptData.content) {
          headScripts.push(scriptData);
        }
      });
      
      // Extract scripts from body
      if (doc.body) {
        doc.body.querySelectorAll('script').forEach((script) => {
          const scriptData: any = {};
          if (script.src) {
            scriptData.src = toAbsoluteUrl(script.getAttribute('src') || '');
          }
          if (script.textContent) {
            scriptData.content = script.textContent;
          }
          if (script.type) {
            scriptData.type = script.type;
          }
          scriptData.async = script.async;
          scriptData.defer = script.defer;
          if (scriptData.src || scriptData.content) {
            bodyScripts.push(scriptData);
          }
        });
      }
      
      // Remove scripts from DOM before getting innerHTML (they'll be re-injected)
      doc.head.querySelectorAll('script').forEach(script => script.remove());
      if (doc.body) {
        doc.body.querySelectorAll('script').forEach(script => script.remove());
      }
      
      const processedHtml = doc.body ? doc.body.innerHTML : rawHtml;
      let css = await extractHeadStyles();
      
      // Store extracted scripts for later injection
      const allScripts = [...headScripts, ...bodyScripts];
      console.log(`📜 Extracted ${allScripts.length} scripts from installed theme (${headScripts.length} from head, ${bodyScripts.length} from body)`);
      
      // Store scripts in a way that applyPageToEditor can access them
      // We'll need to modify applyPageToEditor to accept scripts as a parameter
      // For now, we'll inject them into the HTML as a comment that can be parsed
      const scriptsData = JSON.stringify(allScripts);
      const scriptsMarker = `<!-- ZIPLOFY_SCRIPTS_DATA:${scriptsData} -->`;
      const htmlWithScriptsMarker = processedHtml + scriptsMarker;
      
      // CRITICAL: Rewrite relative URLs in CSS to absolute URLs
      // This ensures background images, fonts, and other resources load correctly
      if (css) {
        css = css.replace(/url\((['"]?)(?!https?:|data:|mailto:|tel:|javascript:|\/\/)([^'")]+)\1\)/gi, (match, quote = '', path) => {
          const abs = toAbsoluteUrl(path);
          return `url(${quote}${abs}${quote})`;
        });
      }

      // Discover additional pages from hyperlinks (pagePaths was already collected above)
      const discoveredPages: Page[] = [];
      
      console.log(`🔍 Discovered ${pagePaths.size} potential pages from hyperlinks:`, Array.from(pagePaths));
      
      // Fetch discovered pages
      const fetchPage = async (pagePath: string): Promise<Page | null> => {
        try {
          // Try different variations of the path
          const tryUrls = [];
          
          // If it already has .html, try as-is
          if (pagePath.toLowerCase().endsWith('.html')) {
            tryUrls.push(`${basePath}/${pagePath}?v=${cacheBust}`);
          } else {
            // Try as folder with index.html and as .html file
            tryUrls.push(`${basePath}/${pagePath}/index.html?v=${cacheBust}`);
            tryUrls.push(`${basePath}/${pagePath}.html?v=${cacheBust}`);
          }
          
          let pageHtml: string | null = null;
          let finalUrl = '';
          
          for (const url of tryUrls) {
            try {
              const pageRes = await fetch(url, {
                credentials: 'include',
                headers: buildAuthHeaders(),
              });
              if (pageRes.ok) {
                pageHtml = await pageRes.text();
                finalUrl = url;
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
          
          // CRITICAL: Rewrite relative URLs in the page HTML to absolute URLs
          // This ensures images, stylesheets, and other resources load correctly
          const rewritePageUrls = (doc: Document) => {
            // Rewrite image sources
            doc.querySelectorAll('img[src]').forEach((img) => {
              const src = img.getAttribute('src');
              if (!src) return;
              if (/^(data:|https?:|\/\/)/i.test(src)) return;
              img.setAttribute('src', toAbsoluteUrl(src));
            });
            
            // Rewrite background images in style attributes
            doc.querySelectorAll('[style*="background"]').forEach((node) => {
              const styleValue = node.getAttribute('style');
              if (!styleValue) return;
              const rewritten = styleValue.replace(/url\((['"]?)(?!https?:|data:|mailto:|tel:|javascript:|\/\/)([^'")]+)\1\)/gi, (_match, quote = '', path) => {
                const abs = toAbsoluteUrl(path);
                return `url(${quote}${abs}${quote})`;
              });
              node.setAttribute('style', rewritten);
            });
            
            // Rewrite link hrefs
            doc.querySelectorAll('a[href]').forEach((anchor) => {
              const href = anchor.getAttribute('href');
              if (!href) return;
              if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return;
              if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) return;
              anchor.setAttribute('href', toAbsoluteUrl(href));
            });
          };
          
          // Rewrite URLs in the page document
          rewritePageUrls(pageDoc);
          
          // Extract CSS for this specific page (similar to main page extraction)
          const extractPageStyles = async (doc: Document): Promise<string> => {
            const cssParts: string[] = [];
            
            // Helper to check if URL is external CDN
            const isExternalCDN = (url: string): boolean => {
              try {
                const urlObj = new URL(url);
                const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || 
                               `${window.location.origin}/api`;
                const apiUrlObj = new URL(apiBase);
                const isCDN = urlObj.hostname.includes('cdnjs.cloudflare.com') ||
                             urlObj.hostname.includes('cdn.jsdelivr.net') ||
                             urlObj.hostname.includes('unpkg.com') ||
                             urlObj.hostname.includes('fonts.googleapis.com') ||
                             urlObj.hostname.includes('fonts.gstatic.com');
                const isDifferentOrigin = urlObj.origin !== apiUrlObj.origin && 
                                         urlObj.origin !== window.location.origin;
                return isCDN || isDifferentOrigin;
              } catch {
                return false;
              }
            };
            
            // Fetch and inline external stylesheets from this page
            const linkPromises = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(async (link) => {
              const href = link.getAttribute('href');
              if (!href) return '';
              const absoluteUrl = toAbsoluteUrl(href);
              
              if (isExternalCDN(absoluteUrl)) {
                return `@import url('${absoluteUrl}');`;
              }
              
              try {
                const cssResponse = await fetch(absoluteUrl, {
                  credentials: 'include',
                  headers: buildAuthHeaders(),
                });
                if (cssResponse.ok) {
                  const cssText = await cssResponse.text();
                  return cssText || '';
                } else {
                  return `@import url('${absoluteUrl}');`;
                }
              } catch (err) {
                return `@import url('${absoluteUrl}');`;
              }
            });
            
            const fetchedCss = await Promise.all(linkPromises);
            cssParts.push(...fetchedCss.filter(css => css.trim()));
            
            // Add inline styles from this page
            const inlineStyles = Array.from(doc.querySelectorAll('style'))
              .map((style) => style.textContent || '')
              .filter(style => style.trim());
            cssParts.push(...inlineStyles);
            
            return cssParts.join('\n\n').trim();
          };
          
          // Extract page-specific CSS
          let pageSpecificCss = await extractPageStyles(pageDoc);
          
          // CRITICAL: Rewrite relative URLs in CSS to absolute URLs
          // This ensures background images, fonts, and other resources load correctly
          if (pageSpecificCss) {
            pageSpecificCss = pageSpecificCss.replace(/url\((['"]?)(?!https?:|data:|mailto:|tel:|javascript:|\/\/)([^'")]+)\1\)/gi, (match, quote = '', path) => {
              const abs = toAbsoluteUrl(path);
              return `url(${quote}${abs}${quote})`;
            });
          }
          
          // Combine main CSS with page-specific CSS
          // Main CSS comes first (base styles), then page-specific CSS (overrides)
          const combinedPageCss = css 
            ? (pageSpecificCss ? `${css}\n\n/* Page-specific styles */\n${pageSpecificCss}` : css)
            : pageSpecificCss;
          
          // Get page body content (after URL rewriting)
          const pageBodyHtml = pageDoc.body ? pageDoc.body.innerHTML : pageHtml;
          
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
      
      // Filter out null results and add to discovered pages
      fetchedPages.forEach((page) => {
        if (page) {
          discoveredPages.push(page);
        }
      });
      
      console.log(`✅ Successfully discovered and fetched ${discoveredPages.length} additional pages`);

      const result = {
        html: htmlWithScriptsMarker || processedHtml || DEFAULT_PAGE_CONTENT,
        css,
        name: doc.title || 'Installed Theme',
        pages: discoveredPages.length > 0 ? discoveredPages : undefined,
      };

      console.log('Successfully fetched installed theme:', {
        name: result.name,
        htmlLength: result.html.length,
        cssLength: result.css?.length || 0,
        discoveredPages: discoveredPages.length,
      });
      
      return result;
    } catch (err) {
      console.error('Failed to fetch installed theme files:', err);
      return null;
    }
  };

  const [pages, setPages] = useState<Page[]>([
    { id: 'page-1', name: 'Home', html: DEFAULT_PAGE_CONTENT, css: '' }
  ]);
  const pagesRef = useRef<Page[]>([
    { id: 'page-1', name: 'Home', html: DEFAULT_PAGE_CONTENT, css: '' }
  ]);
  const [currentPageId, setCurrentPageId] = useState<string>('page-1');
  const [showPageManager, setShowPageManager] = useState<boolean>(false);
  const LOCAL_STORAGE_PAGES_KEY = useMemo(() => (id ? `ziplofy.builder.pages.${id}` : null), [id]);
  const tabIdRef = useRef(`tab-${Math.random().toString(36).slice(2)}`);
  const skipPersistRef = useRef(false);
  const lastSyncedAtRef = useRef(0);
  const persistedInitialLoadRef = useRef(false);
  const restoredFromLocalRef = useRef(false);
  const initialPageHandledRef = useRef(false);

  const encodePagesData = (pagesData: Page[]): string => {
    try {
      return JSON.stringify(pagesData)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
    } catch {
      return '[]';
    }
  };

  // Warn when closing/navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleBackClick = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Do you really want to exit? Your progress may be lost.')) {
      return;
    }
    navigate('/themes/all-themes');
  }, [hasUnsavedChanges, navigate]);

  useEffect(() => {
    pagesRef.current = pages;
    
    // Update page options in all button/link traits when pages change
    const editor = editorInstance.current;
    if (editor && editor.Components) {
      const updateAllPageLinkTraits = () => {
        const allComponents = editor.Components.getAll();
        allComponents.forEach((component: any) => {
          const tagName = component?.get('tagName')?.toLowerCase();
          if (tagName === 'button' || tagName === 'a') {
            const traits = component.get('traits') || [];
            const pageLinkTrait = traits.find((t: any) => {
              if (typeof t === 'object') {
                return t.name === 'pageLink';
              }
              return false;
            });
            
            if (pageLinkTrait) {
              const options = [
                { id: '', value: '', name: '-- Select Page --' },
                ...pages.map((p) => ({ id: p.id, value: p.id, name: p.name }))
              ];
              pageLinkTrait.options = options;
              
              // If component is currently selected, update the trait manager
              const selected = editor.getSelected();
              if (selected && selected === component && editor.TraitManager) {
                const traitManager = editor.TraitManager as any;
                const trait = traitManager.getTrait(component, 'pageLink');
                if (trait && trait.set) {
                  trait.set('options', options);
                }
                // Re-render traits to show updated options
                setTimeout(() => {
                  if (typeof editor.TraitManager.render === 'function') {
                    editor.TraitManager.render();
                  }
                }, 50);
              }
            }
          }
        });
      };
      
      // Update after a short delay to ensure editor is ready
      setTimeout(updateAllPageLinkTraits, 100);
    }
  }, [pages]);

  const buildMultiPageHtmlDocument = (pagesData: Page[], themeName: string, globalCss: string): string => {
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
    /* CRITICAL: Ensure wrapper styles apply to page containers */
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
          const normalizedA = normalizeId(a);
          const normalizedB = normalizeId(b);
          if (!normalizedA || !normalizedB) return false;
          if (normalizedA === normalizedB) return true;
          const stripA = normalizedA.replace(/^page-/, '');
          const stripB = normalizedB.replace(/^page-/, '');
          return stripA === stripB;
        };
        const normalizeExternalUrl = function(url) {
          if (!url) return '';
          const trimmed = String(url).trim();
          if (!trimmed) return '';
          const lower = trimmed.toLowerCase();
          if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('mailto:') || lower.startsWith('tel:')) {
            return trimmed;
          }
          if (trimmed.startsWith('//')) {
            return 'https:' + trimmed;
          }
          if (trimmed.includes('://')) {
            return trimmed;
          }
          return 'https://' + trimmed;
        };
        const openExternal = function(url) {
          const finalUrl = normalizeExternalUrl(url);
          if (!finalUrl) return;
          window.open(finalUrl, '_blank', 'noopener,noreferrer');
        };
        const renderPages = function() {
          container.innerHTML = '';
          pages.forEach(function(page, index) {
            const wrapper = document.createElement('div');
            // CRITICAL: Add gjs-wrapper-body class so background images work
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
          
          const wrappers = container.querySelectorAll('.ziplofy-page');
          let found = false;
          
          wrappers.forEach(function(wrapper) {
            const wrapperPageId = wrapper.getAttribute('data-page-id') || '';
            
            if (idsMatch(wrapperPageId, normalizedRequest)) {
              wrapper.classList.add('active');
              wrapper.style.display = 'block';
              found = true;
            } else {
              wrapper.classList.remove('active');
              wrapper.style.display = 'none';
            }
          });
          
          if (found && updateHash) {
            const activeWrapper = container.querySelector('.ziplofy-page.active');
            const actualPageId = activeWrapper ? (activeWrapper.getAttribute('data-page-id') || normalizedRequest) : normalizedRequest;
            window.location.hash = '#' + normalizeId(actualPageId);
          }
          
          return found;
        };

        const attachLinkHandlers = function() {
          // Remove old handlers first for links
          const oldLinks = container.querySelectorAll('a[data-page-link]');
          oldLinks.forEach(function(link) {
            const newLink = link.cloneNode(true);
            if (link.parentNode) {
              link.parentNode.replaceChild(newLink, link);
            }
          });
          
          // Remove old handlers for buttons
          const oldButtons = container.querySelectorAll('button[data-page-link]');
          oldButtons.forEach(function(button) {
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
              button.parentNode.replaceChild(newButton, button);
            }
          });
          
          // Attach handlers to links
          const links = container.querySelectorAll('a[data-page-link]');
          links.forEach(function(link) {
            link.addEventListener('click', function(evt) {
              const targetPage = this.getAttribute('data-page-link');
              if (targetPage && targetPage.trim() !== '') {
                evt.preventDefault();
                evt.stopPropagation();
                if (!showPage(targetPage, true)) {
                  console.warn('Ziplofy: target page not found for link', targetPage);
                }
                return;
              }
              
              const href = this.getAttribute('href');
              if (href && href.startsWith('#')) {
                evt.preventDefault();
                evt.stopPropagation();
                if (!showPage(href, true)) {
                  console.warn('Ziplofy: target page not found for link href', href);
                }
                return;
              }
              
              if (href && href.trim() !== '') {
                evt.preventDefault();
                evt.stopPropagation();
                openExternal(href);
              }
            });
          });
          
          // Attach handlers to buttons
          const buttons = container.querySelectorAll('button[data-page-link]');
          buttons.forEach(function(button) {
            button.addEventListener('click', function(evt) {
              evt.preventDefault();
              evt.stopPropagation();
              
              const targetPage = this.getAttribute('data-page-link');
              const href = this.getAttribute('href');
              
              if (targetPage && targetPage.trim() !== '') {
                if (!showPage(targetPage, true)) {
                  console.warn('Ziplofy: target page not found for button', targetPage, 'Available pages:', Array.from(container.querySelectorAll('.ziplofy-page')).map(function(p) { return p.getAttribute('data-page-id'); }));
                }
                return;
              }
              
              if (href && href.startsWith('#')) {
                if (!showPage(href, true)) {
                  console.warn('Ziplofy: target page not found for button href', href);
                }
                return;
              }
              
              if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                openExternal(href);
                return;
              }
              
              if (href && href.trim() !== '') {
                openExternal(href);
              }
            });
          });
          
          // Also handle buttons with href attribute for external URLs
          const buttonsWithHref = container.querySelectorAll('button[href]');
          buttonsWithHref.forEach(function(button) {
            const href = button.getAttribute('href');
            const hasPageLink = button.hasAttribute('data-page-link');
            
            // Only add handler if it doesn't already have a page link handler
            if (!hasPageLink && href && (href.startsWith('http://') || href.startsWith('https://'))) {
              button.addEventListener('click', function(evt) {
                evt.preventDefault();
                window.open(href, '_blank', 'noopener,noreferrer');
              });
            }
          });
        };

        renderPages();
        attachLinkHandlers();
        
        // Re-attach handlers after any dynamic content changes (with debounce to prevent excessive calls)
        let attachTimeout = null;
        const observer = new MutationObserver(function() {
          if (attachTimeout) {
            clearTimeout(attachTimeout);
          }
          attachTimeout = setTimeout(function() {
            attachLinkHandlers();
          }, 300); // Debounce to 300ms
        });
        observer.observe(container, { childList: true, subtree: true });

        const handleHashChange = function() {
          const hash = window.location.hash.replace(/^#/, '');
          if (!hash) return;
          const clean = hash.replace(/^page-/, '');
          showPage(clean, false);
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
      } catch (err) {
        console.error('Ziplofy multipage preview error:', err);
      }

      // Initialize Countdown Timers
      function initCountdownTimers() {
        const timers = document.querySelectorAll('.ziplofy-countdown-timer');
        timers.forEach((timer) => {
          const daysEl = timer.querySelector('.countdown-days');
          const hoursEl = timer.querySelector('.countdown-hours');
          const minutesEl = timer.querySelector('.countdown-minutes');
          const secondsEl = timer.querySelector('.countdown-seconds');
          
          if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
          
          let days = parseInt(timer.getAttribute('data-countdown-days') || '0', 10);
          let hours = parseInt(timer.getAttribute('data-countdown-hours') || '0', 10);
          let minutes = parseInt(timer.getAttribute('data-countdown-minutes') || '0', 10);
          let seconds = parseInt(timer.getAttribute('data-countdown-seconds') || '0', 10);
          
          // Convert to total seconds
          let totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
          
          function updateTimer() {
            if (totalSeconds <= 0) {
              daysEl.textContent = '0';
              hoursEl.textContent = '0';
              minutesEl.textContent = '0';
              secondsEl.textContent = '0';
              return;
            }
            
            const d = Math.floor(totalSeconds / 86400);
            const h = Math.floor((totalSeconds % 86400) / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            
            daysEl.textContent = d.toString();
            hoursEl.textContent = h.toString().padStart(2, '0');
            minutesEl.textContent = m.toString().padStart(2, '0');
            secondsEl.textContent = s.toString().padStart(2, '0');
            
            totalSeconds--;
          }
          
          updateTimer();
          setInterval(updateTimer, 1000);
        });
      }
      
      // Initialize countdown timers when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCountdownTimers);
      } else {
        initCountdownTimers();
      }

      // Initialize Progress Bars - sync percentage text with bar width
      function initProgressBars() {
        const progressBars = document.querySelectorAll('.ziplofy-progress-bar');
        progressBars.forEach((bar) => {
          const percentageEl = bar.querySelector('.progress-percentage');
          const fillEl = bar.querySelector('.progress-bar-fill');
          
          if (!percentageEl || !fillEl) return;
          
          function updateProgressBar() {
            const text = percentageEl.textContent || percentageEl.innerText || '0%';
            const match = text.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              const percentage = parseFloat(match[1]);
              const clampedPercentage = Math.min(100, Math.max(0, percentage));
              fillEl.style.width = clampedPercentage + '%';
            }
          }
          
          // Initial update
          updateProgressBar();
          
          // Watch for changes using MutationObserver
          const observer = new MutationObserver(updateProgressBar);
          observer.observe(percentageEl, {
            childList: true,
            characterData: true,
            subtree: true
          });
        });
      }
      
      // Initialize progress bars when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProgressBars);
      } else {
        initProgressBars();
      }

      // Initialize Parallax Sections
      function initParallaxSections() {
        const parallaxSections = document.querySelectorAll('.ziplofy-parallax-section');
        
        if (parallaxSections.length === 0) return;
        
        function updateParallax() {
          parallaxSections.forEach((section) => {
            const background = section.querySelector('.parallax-background');
            const content = section.querySelector('.parallax-content');
            
            if (!background) return;
            
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            
            // Calculate parallax effect based on scroll position
            // Parallax: background moves slower than foreground, creating depth
            const scrolled = window.pageYOffset || document.documentElement.scrollTop;
            const sectionOffset = section.offsetTop;
            
            // Calculate how much the page has scrolled past the section start
            // This creates the parallax effect where background lags behind
            const scrollPastSection = scrolled - sectionOffset;
            
            // Parallax effect: background moves at 50% of scroll speed
            // This creates the illusion that background is further away (moves slower)
            const parallaxSpeed = 0.5;
            const backgroundY = scrollPastSection * parallaxSpeed;
            
            // Only apply parallax when section is in viewport
            if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
              // Apply transform to background (moves slower, creating parallax depth)
              background.style.transform = 'translate3d(0, ' + backgroundY + 'px, 0)';
              
              // Content moves even slower for subtle layered parallax effect
              if (content) {
                const contentSpeed = 0.15;
                const contentY = scrollPastSection * contentSpeed;
                content.style.transform = 'translate3d(0, ' + contentY + 'px, 0)';
              }
            } else {
              // Reset when out of viewport
              background.style.transform = 'translate3d(0, 0, 0)';
              if (content) {
                content.style.transform = 'translate3d(0, 0, 0)';
              }
            }
          });
        }
        
        // Throttle scroll events for better performance
        let ticking = false;
        function onScroll() {
          if (!ticking) {
            window.requestAnimationFrame(function() {
              updateParallax();
              ticking = false;
            });
            ticking = true;
          }
        }
        
        // Initial update
        updateParallax();
        
        // Listen to scroll events
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', updateParallax, { passive: true });
      }
      
      // Initialize parallax sections when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParallaxSections);
      } else {
        initParallaxSections();
      }
    })();
  </script>
</body>
</html>`;
  };

  const parsePagesFromStoredHtml = (htmlContent: string): Page[] | null => {
    if (!htmlContent) return null;
    const trimmed = htmlContent.trim();

    // Legacy JSON format
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        // fall through
      }
    }

    // Check for embedded JSON script tag
    const scriptMatch = htmlContent.match(/<script id="ziplofy-pages-data"[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch && scriptMatch[1]) {
      try {
        const jsonText = scriptMatch[1].trim();
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) {
          return parsed.map((page, index) => ({
            id: page?.id || `page-${index + 1}`,
            name: page?.name || `Page ${index + 1}`,
            html: page?.html || DEFAULT_PAGE_CONTENT,
            css: page?.css || ''
          }));
        }
      } catch (error) {
        console.warn('Failed to parse multipage JSON from stored HTML:', error);
      }
    }

    return null;
  };

  const getPagesSnapshotWithCurrent = useCallback(() => {
    const editor = editorInstance.current;
    if (!editor || typeof editor.getHtml !== 'function') {
      return { pagesSnapshot: pages, currentHtml: '', currentCss: '' };
    }
    const currentHtml = editor.getHtml() || '';
    
    // Try multiple methods to get CSS - ALWAYS try all methods and combine
    let currentCss = '';
    const cssFromMethods: string[] = [];
    
    // Method 1: Standard getCss() - gets generated CSS rules
    if (editor.getCss) {
      const standardCss = editor.getCss() || '';
      if (standardCss && standardCss.trim().length > 0) {
        cssFromMethods.push(standardCss);
        console.log('Method 1 - Standard getCss():', standardCss.length, 'characters');
      }
    }
    
    // Method 2: Get CSS from CssComposer - includes all CSS rules
    if (editor.CssComposer) {
      try {
        const cssRules = editor.CssComposer.getAll();
        if (cssRules && cssRules.length > 0) {
          const composerCss = cssRules.map((rule: any) => {
            try {
              // Try toCSS first (most reliable)
              if (rule.toCSS) {
                return rule.toCSS();
              }
              // Fallback to manual construction
              const selector = rule.selectorsToString ? rule.selectorsToString() : (rule.getSelectors ? rule.getSelectors() : '');
              const style = rule.getStyle ? rule.getStyle() : {};
              if (selector && style && Object.keys(style).length > 0) {
                const styleString = Object.entries(style)
                  .map(([prop, value]) => `  ${prop}: ${value};`)
                  .join('\n');
                return `${selector} {\n${styleString}\n}`;
              }
              return '';
            } catch {
              return '';
            }
          }).filter(Boolean).join('\n\n');
          
          if (composerCss && composerCss.trim().length > 0) {
            cssFromMethods.push(composerCss);
            console.log('Method 2 - CssComposer:', composerCss.length, 'characters');
          }
        }
      } catch (e) {
        console.warn('Failed to get CSS from CssComposer:', e);
      }
    }
    
    // Combine all CSS (remove duplicates)
    currentCss = cssFromMethods.join('\n\n');
    
    // CRITICAL FIX: Replace wrapper ID selectors with class selectors
    // GrapesJS might generate #iiwl instead of .gjs-wrapper-body
    if (editor.getWrapper) {
      const wrapper = editor.getWrapper();
      const wrapperId = wrapper.getId();
      
      if (wrapperId && currentCss.includes(`#${wrapperId}`)) {
        console.log(`🔧 Converting wrapper ID selector #${wrapperId} to class .gjs-wrapper-body`);
        
        // Replace all instances of #wrapperId with .gjs-wrapper-body
        const idSelectorPattern = new RegExp(`#${wrapperId}(?![a-zA-Z0-9_-])`, 'g');
        currentCss = currentCss.replace(idSelectorPattern, '.gjs-wrapper-body');
        
        console.log('✅ Converted wrapper selectors to class-based');
      }
    }
    
    // Method 3: ALWAYS extract wrapper styles (even if other CSS exists)
    // This ensures wrapper background images are captured
    try {
      const wrapper = editor.getWrapper();
      if (wrapper) {
        const wrapperStyles = wrapper.getStyle ? wrapper.getStyle() : null;
        if (wrapperStyles && Object.keys(wrapperStyles).length > 0) {
          // Build CSS rule for wrapper
          const styleEntries = Object.entries(wrapperStyles)
            .map(([prop, value]) => `  ${prop}: ${value};`)
            .join('\n');
          
          const wrapperCssRule = `.gjs-wrapper-body {\n${styleEntries}\n}`;
          
          // Check if this CSS is already in currentCss
          if (!currentCss.includes('.gjs-wrapper-body') && !currentCss.includes('background-image')) {
            currentCss = wrapperCssRule + '\n\n' + currentCss;
            console.log('✅ Method 3 - Added wrapper styles to CSS:', wrapperCssRule);
          } else {
            console.log('Method 3 - Wrapper styles already in CSS or detected');
          }
        }
      }
    } catch (e) {
      console.warn('Failed to extract wrapper styles:', e);
    }
    
    // Method 4: Extract CSS from ALL component styles as final fallback
    if ((!currentCss || currentCss.trim().length === 0) && editor.getWrapper) {
      try {
        const wrapper = editor.getWrapper();
        const allComponents: any[] = [];
        
        // Recursively collect all components
        const collectComponents = (component: any) => {
          if (component) {
            allComponents.push(component);
            const children = component.components ? component.components() : [];
            children.forEach((child: any) => collectComponents(child));
          }
        };
        
        collectComponents(wrapper);
        
        // Extract styles from all components
        const componentStyles = allComponents
          .map((comp) => {
            const styles = comp.getStyle ? comp.getStyle() : null;
            const classes = comp.getClasses ? comp.getClasses() : [];
            if (styles && Object.keys(styles).length > 0) {
              const selector = classes.length > 0 ? `.${classes.join('.')}` : `#${comp.getId()}`;
              const styleString = Object.entries(styles)
                .map(([prop, value]) => `  ${prop}: ${value};`)
                .join('\n');
              return `${selector} {\n${styleString}\n}`;
            }
            return null;
          })
          .filter(Boolean)
          .join('\n\n');
        
        if (componentStyles) {
          currentCss = componentStyles;
          console.log('✅ Method 4 - Extracted CSS from all component styles:', currentCss.length);
        }
      } catch (e) {
        console.warn('Failed to extract component styles:', e);
      }
    }

    // DEBUG: Log CSS retrieval with background image detection
    const hasBackgroundImage = currentCss.includes('background-image') || currentCss.includes('background:');
    console.log('📊 Getting pages snapshot - CSS info:', {
      currentPageId,
      currentCssLength: currentCss?.length || 0,
      hasCss: !!currentCss && currentCss.trim().length > 0,
      hasBackgroundImage,
      cssPreview: currentCss?.substring(0, 500),
      fullCss: currentCss // Full CSS for inspection
    });
    
    if (!hasBackgroundImage) {
      console.warn('⚠️ NO BACKGROUND IMAGE DETECTED IN CSS!');
      console.log('Checking wrapper element directly...');
      const wrapper = editor.getWrapper();
      if (wrapper) {
        const wrapperStyles = wrapper.getStyle();
        const wrapperClasses = wrapper.getClasses();
        const wrapperAttrs = wrapper.getAttributes();
        console.log('Wrapper details:', {
          styles: wrapperStyles,
          classes: wrapperClasses,
          attributes: wrapperAttrs,
          hasBackgroundImage: wrapperStyles && (wrapperStyles['background-image'] || wrapperStyles['background'])
        });
      }
    }
    
    // CRITICAL: Ensure CSS is preserved even if empty (use existing page CSS as fallback)
    const pagesSnapshot = pages.map((page) => {
      if (page.id === currentPageId) {
        // For current page, use extracted CSS or fall back to existing CSS
        const finalCss = currentCss && currentCss.trim().length > 0 
          ? currentCss 
          : (page.css || '');
        
        return { 
          ...page, 
          html: currentHtml || DEFAULT_PAGE_CONTENT, 
          css: finalCss 
        };
      }
      // For other pages, preserve their existing CSS
      return page;
    });
    
    const currentPageInSnapshot = pagesSnapshot.find(p => p.id === currentPageId);
    console.log('📋 Pages snapshot created:', {
      totalPages: pagesSnapshot.length,
      currentPageId,
      currentPageHasCss: (currentPageInSnapshot?.css?.length || 0) > 0,
      allPagesCss: pagesSnapshot.map(p => ({ id: p.id, cssLength: p.css?.length || 0 }))
    });
    
    return { pagesSnapshot, currentHtml, currentCss };
  }, [pages, currentPageId]);

  const applyPageToEditor = useCallback((htmlContent: string, cssContent?: string) => {
    const editor = editorInstance.current;
    if (!editor) {
      console.error('Cannot apply page: Editor instance is null');
      setError('Editor not initialized. Please refresh the page.');
      setLoading(false);
      return;
    }
    
    // Get theme ID for proper path resolution
    const themeId = searchParams.get('id') || searchParams.get('themeId');
    
    try {
      console.log('Applying page to editor:', { 
      hasHtml: !!htmlContent, 
      htmlLength: htmlContent?.length, 
      hasCss: !!cssContent, 
      cssLength: cssContent?.length,
      themeId: themeId || 'none'
    });
    
    // Extract script tags from HTML before loading (GrapesJS will strip them)
    const scriptTags: Array<{ src?: string; content?: string; type?: string; async?: boolean; defer?: boolean }> = [];
    
    // First, check for scripts stored in comment marker (from installed themes)
    if (htmlContent) {
      const scriptsMarkerMatch = htmlContent.match(/<!-- ZIPLOFY_SCRIPTS_DATA:(\[.*?\]) -->/);
      if (scriptsMarkerMatch && scriptsMarkerMatch[1]) {
        try {
          const storedScripts = JSON.parse(scriptsMarkerMatch[1]);
          if (Array.isArray(storedScripts)) {
            scriptTags.push(...storedScripts);
            console.log(`📜 Loaded ${storedScripts.length} scripts from comment marker`);
          }
        } catch (e) {
          console.warn('Failed to parse scripts from comment marker:', e);
        }
      }
    }
    
    // Also extract script tags directly from HTML (for custom themes or if marker not found)
    if (htmlContent && scriptTags.length === 0) {
      const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
      let match;
      while ((match = scriptRegex.exec(htmlContent)) !== null) {
        const attrs = match[1];
        const content = match[2].trim();
        
        // Skip our internal script tags (ziplofy-pages-data)
        if (attrs.includes('ziplofy-pages-data')) continue;
        
        const script: any = {};
        
        // Extract attributes
        const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
        if (srcMatch) {
          script.src = srcMatch[1];
        }
        
        if (content) {
          script.content = content;
        }
        
        const typeMatch = attrs.match(/type=["']([^"']+)["']/i);
        if (typeMatch) {
          script.type = typeMatch[1];
        }
        
        script.async = /async/i.test(attrs);
        script.defer = /defer/i.test(attrs);
        
        scriptTags.push(script);
      }
      
      console.log(`📜 Extracted ${scriptTags.length} script tags from HTML`);
    }
    
    // Remove script tags and comment markers from HTML before loading (GrapesJS will strip them anyway)
    let htmlWithoutScripts = htmlContent ? htmlContent.replace(/<script[\s\S]*?<\/script>/gi, '') : '';
    // Also remove the scripts comment marker
    htmlWithoutScripts = htmlWithoutScripts.replace(/<!-- ZIPLOFY_SCRIPTS_DATA:\[.*?\] -->/g, '');
    
    // Set HTML content (without scripts)
    editor.setComponents(htmlWithoutScripts || DEFAULT_PAGE_CONTENT);
    
    // CRITICAL FIX: Ensure wrapper is droppable after setting components
    setTimeout(() => {
      const wrapper = editor.getWrapper();
      if (wrapper) {
        console.log('🔧 Configuring wrapper for page...');
        
        // Make wrapper droppable and interactive
        wrapper.set({ 
          droppable: true,
          selectable: true,
          editable: false,
          draggable: false,
          hoverable: true,
          stylable: true,
          // CRITICAL: Accept all component types
          traits: []
        }, { silent: true });
        
        // Ensure wrapper has the class for CSS
        const classes = wrapper.getClasses();
        if (!classes.includes('gjs-wrapper-body')) {
          wrapper.addClass('gjs-wrapper-body');
        }
        
        // Ensure wrapper view is updated
        if (wrapper.view) {
          wrapper.view.render?.();
        }
        
        // Ensure ALL child components are also interactive
        const allComponents = wrapper.components();
        if (allComponents && allComponents.length > 0) {
          allComponents.forEach((comp: any) => {
            if (comp) {
              try {
                comp.set({
                  selectable: true,
                  hoverable: true,
                  draggable: true,
                  stylable: true
                }, { silent: true });
      } catch {}
            }
          });
        }
        
        // Force canvas to refresh and accept drops
        if (editor.Canvas) {
          const canvasEl = editor.Canvas.getElement();
          if (canvasEl) {
            canvasEl.style.pointerEvents = 'auto';
          }
          
          const frameEl = editor.Canvas.getFrameEl();
          if (frameEl && frameEl.contentWindow) {
            const frameBody = frameEl.contentWindow.document.body;
            if (frameBody) {
              frameBody.style.pointerEvents = 'auto';
            }
          }
        }
        
        console.log('✓ Wrapper configured as droppable. Wrapper has', allComponents?.length || 0, 'components');
        
        // Verify wrapper can accept drops
        const canAcceptDrop = wrapper.get('droppable');
        if (!canAcceptDrop) {
          console.error('❌ WRAPPER IS NOT DROPPABLE! Fixing...');
          wrapper.set('droppable', '*'); // Accept all types
          console.log('✓ Fixed: Wrapper droppable set to *');
        } else {
          console.log('✅ Wrapper is droppable:', canAcceptDrop);
        }
        
        // Set up periodic check to ensure wrapper stays droppable
        const checkInterval = setInterval(() => {
            const currentWrapper = editor.getWrapper();
            if (currentWrapper && !currentWrapper.get('droppable')) {
              console.warn('⚠️ Wrapper became non-droppable, restoring...');
              currentWrapper.set('droppable', '*');
          }
        }, 2000);
        
        // Clean up interval after 10 seconds
        setTimeout(() => clearInterval(checkInterval), 10000);
        
        // CRITICAL: Ensure widgets/blocks are visible and rendered after page is applied
        // This is especially important when editing existing themes
        setTimeout(() => {
          // Force widgets tab to be active
          setActiveSidebarSection('widgets');
          
          // Ensure blocks panel is visible
          const blocksPanel = document.getElementById('blocks-panel');
          const blocksWrapper = document.querySelector('.elementor-blocks-wrapper') as HTMLElement;
          
          if (blocksWrapper) {
            blocksWrapper.style.setProperty('display', 'block', 'important');
            blocksWrapper.style.setProperty('visibility', 'visible', 'important');
            blocksWrapper.style.setProperty('opacity', '1', 'important');
          }
          
          if (blocksPanel) {
            blocksPanel.style.setProperty('display', 'block', 'important');
            blocksPanel.style.setProperty('visibility', 'visible', 'important');
            blocksPanel.style.setProperty('opacity', '1', 'important');
            
            // Check if blocks exist, if not, render them
            const existingBlocks = blocksPanel.querySelectorAll('.gjs-block');
            const hasBlocksContainer = !!blocksPanel.querySelector('.gjs-blocks-c');
            
            if (existingBlocks.length === 0 || !hasBlocksContainer) {
              console.log('🔄 No blocks found after applying page, rendering blocks...');
              blocksPanel.innerHTML = '';
              
              if (editor.BlockManager && typeof editor.BlockManager.render === 'function') {
                editor.BlockManager.render();
          blocksRenderedRef.current = true;
                
                // Ensure blocks are visible after render
                setTimeout(() => {
                  const renderedBlocks = blocksPanel.querySelectorAll('.gjs-block');
                  renderedBlocks.forEach((block: any) => {
                    if (block) {
                      block.style.display = 'flex';
                      block.style.visibility = 'visible';
                      block.style.opacity = '1';
                      block.style.pointerEvents = 'auto';
                      block.style.cursor = 'grab';
                    }
                  });
                  
                  // Ensure categories are visible
                  const categories = blocksPanel.querySelectorAll('.gjs-block-category');
                  categories.forEach((cat: any) => {
                    if (cat) {
                      cat.style.display = 'block';
                      cat.style.visibility = 'visible';
                    }
                  });
                  
                  console.log(`✅ Rendered ${renderedBlocks.length} blocks after applying page`);
                }, 200);
              }
            } else {
              console.log(`✅ Found ${existingBlocks.length} existing blocks after applying page`);
              blocksRenderedRef.current = true;
            }
          }
        }, 300);
      } else {
        console.error('❌ No wrapper found after setComponents!');
      }
    }, 150);
    
    // Apply CSS
    if (cssContent && typeof cssContent === 'string' && cssContent.trim()) {
      console.log('🎨 Applying CSS to editor:', {
        cssLength: cssContent.length,
        cssPreview: cssContent.substring(0, 200)
      });
      
      try {
        // CRITICAL: Don't clear CSS completely - just update it
        // Clearing all CSS can cause styles to disappear
        // Instead, we'll inject new CSS and let it override old styles
        
        // Method 1: Try using editor.setStyle (GrapesJS method)
        if (typeof editor.setStyle === 'function') {
          try {
          editor.setStyle(cssContent);
            console.log('✅ CSS applied via editor.setStyle');
      } catch (e) {
            console.warn('Failed to apply CSS via editor.setStyle:', e);
          }
        }
        
        // Method 2: Also add via CssComposer to ensure it's stored
        if (editor.CssComposer) {
          try {
            // Add CSS rules from the content
            // Parse CSS and add rules (simplified - just add as a single rule for now)
            const cssRule = editor.CssComposer.add({
              selectors: ['body', '.gjs-wrapper-body'],
              style: {}
            });
            // Note: CssComposer.add might not work directly with CSS strings
            // So we rely on setStyle and iframe injection
          } catch (e) {
            // Ignore - we'll use iframe injection
          }
        }
        
        // Method 3: Full iframe injection (matches BasicElementor / loadThemeContentIntoEditor):
        // slider fix (hide non-first slides — JS often does not run in canvas), preserve text, selection, pointer-events, theme CSS
        const baseUrlForImports = themeId
          ? `${window.location.origin}/api/custom-themes/${encodeURIComponent(themeId)}/files/`
          : '';
        [100, 300, 500].forEach((delay) => {
          setTimeout(() => {
            try {
              const ok = injectThemeStylesIntoFrame(editor, {
                styleBlockContent: cssContent,
                stylesheetUrls: [],
                baseUrl: baseUrlForImports,
              });
              if (ok) {
                console.log(`✅ Theme + builder fixes injected into canvas iframe (${delay}ms)`);
              }
            } catch (iframeErr) {
              if (delay === 500) {
                console.warn('Failed to inject theme styles into iframe:', iframeErr);
              }
            }
          }, delay);
        });
      } catch (err) {
        console.error('Failed to apply CSS to editor:', err);
      }
    } else {
      console.log('No CSS content to apply');
    }
    
    // CRITICAL: Inject JavaScript scripts into iframe (scripts are stripped by GrapesJS)
    if (scriptTags.length > 0) {
      console.log(`📜 Injecting ${scriptTags.length} scripts into iframe`);
      
      // Helper function to resolve relative script paths
      const resolveScriptPath = (src: string): string => {
        // If it's already an absolute URL (http/https/data), return as-is
        if (/^(https?:|data:|mailto:|tel:|\/\/)/i.test(src)) {
          return src;
        }
        
        // For relative paths, resolve them using the theme file serving endpoint
        if (themeId) {
          // Remove leading slash if present
          const cleanPath = src.startsWith('/') ? src.substring(1) : src;
          // Use the custom theme file serving endpoint
          const baseUrl = `${window.location.origin}/api/custom-themes/${themeId}/files`;
          return `${baseUrl}/${cleanPath}`;
        }
        
        // For installed themes (no theme ID), scripts should already be absolute URLs
        // But if they're not, try to resolve them relative to the API base
        // Check if this looks like an installed theme script path
        const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || `${window.location.origin}/api`;
        if (src.includes('/themes/installed/')) {
          // Already an installed theme path, return as-is or make absolute
          if (!src.startsWith('http')) {
            return src.startsWith('/') ? `${window.location.origin}${src}` : `${apiBase}/${src}`;
          }
          return src;
        }
        
        // Fallback: if no theme ID, try root-relative
        if (src.startsWith('/')) {
          return window.location.origin + src;
        }
        
        // For relative paths without theme ID, try API base
        console.warn(`⚠️ Relative script path detected without theme ID: ${src}, trying API base`);
        return `${apiBase}/${src}`;
      };
      
      // Use multiple timeouts to ensure iframe is ready – but inject only ONCE to avoid
      // "Identifier 'engine' has already been declared" (scripts run again on re-inject)
      let scriptsInjected = false;
      [200, 500, 1000].forEach((delay) => {
        setTimeout(() => {
          if (scriptsInjected) return;
          try {
            const canvas = editor.Canvas;
            if (canvas) {
              const frame = canvas.getFrameEl();
              if (frame && frame.contentDocument) {
                const doc = frame.contentDocument;
                const head = doc.head || doc.getElementsByTagName('head')[0];
                const body = doc.body || doc.getElementsByTagName('body')[0];
                
                if (!head || !body) {
                  if (delay === 1000) {
                    console.warn('⚠️ Head or body not found in iframe for script injection');
                  }
                  return;
                }
                scriptsInjected = true;

                // Ensure base tag exists for relative path resolution
                let baseTag = head.querySelector('base[data-ziplofy-theme-base]');
                if (!baseTag) {
                  baseTag = doc.createElement('base');
                  baseTag.setAttribute('data-ziplofy-theme-base', 'true');
                  // Set base href to theme file serving endpoint if theme ID is available
                  if (themeId) {
                    (baseTag as HTMLBaseElement).href = `${window.location.origin}/api/custom-themes/${themeId}/files/`;
                  } else {
                    (baseTag as HTMLBaseElement).href = window.location.origin + '/';
                  }
                  head.insertBefore(baseTag, head.firstChild);
                } else if (themeId) {
                  // Update existing base tag if theme ID is available
                  (baseTag as HTMLBaseElement).href = `${window.location.origin}/api/custom-themes/${themeId}/files/`;
                }
                
                // Remove existing theme scripts to avoid duplicates
                const existingScripts = head.querySelectorAll('script[data-ziplofy-theme-script]');
                existingScripts.forEach((script: Element) => script.remove());
                
                // Also check body for scripts
                const existingBodyScripts = body.querySelectorAll('script[data-ziplofy-theme-script]');
                existingBodyScripts.forEach((script: Element) => script.remove());
                
                // Inject scripts sequentially to maintain order (important for dependencies)
                const injectScriptsSequentially = async () => {
                  for (let index = 0; index < scriptTags.length; index++) {
                    const scriptTag = scriptTags[index];
                    try {
                      const scriptEl = doc.createElement('script');
                      scriptEl.setAttribute('data-ziplofy-theme-script', 'true');
                      
                      if (scriptTag.type) {
                        scriptEl.type = scriptTag.type;
                      }
                      
                      if (scriptTag.src) {
                        // External script - resolve relative paths
                        const resolvedSrc = resolveScriptPath(scriptTag.src);
                        scriptEl.src = resolvedSrc;
                        
                        // Don't use async for scripts that need to load in order
                        // Only use async if explicitly set and it's safe
                        scriptEl.async = scriptTag.async || false;
                        scriptEl.defer = scriptTag.defer || false;
                        
                        // For external scripts, wait for them to load before loading the next one
                        // (unless async/defer is set)
                        if (!scriptTag.async && !scriptTag.defer) {
                          await new Promise<void>((resolve) => {
                            scriptEl.onload = () => {
                              console.log(`✅ Loaded external script: ${scriptTag.src}`);
                              resolve();
                            };
                            scriptEl.onerror = () => {
                              console.warn(`⚠️ Failed to load script: ${scriptTag.src} (resolved: ${resolvedSrc})`);
                              // Continue even if script fails to load
                              resolve();
                            };
                            // Timeout after 8 seconds – resolve to avoid blocking next script
                            setTimeout(() => {
                              console.warn(`⚠️ Script load timeout: ${scriptTag.src}`);
                              resolve();
                            }, 8000);
                          });
                        } else {
                          // For async/defer scripts, just log
                          scriptEl.onload = () => {
                            console.log(`✅ Loaded external script (async/defer): ${scriptTag.src}`);
                          };
                          scriptEl.onerror = () => {
                            console.warn(`⚠️ Failed to load script: ${scriptTag.src} (resolved: ${resolvedSrc})`);
                          };
                        }
                      } else if (scriptTag.content) {
                        // Inline script
                        scriptEl.textContent = scriptTag.content;
                      }
                      
                      // Append to head for external scripts, body for inline scripts
                      // (Most scripts should be in head, but some themes put them in body)
                      if (scriptTag.src) {
                        head.appendChild(scriptEl);
                      } else {
                        body.appendChild(scriptEl);
                      }
                      
                      console.log(`✅ Injected script ${index + 1}/${scriptTags.length}${scriptTag.src ? `: ${scriptTag.src}` : ' (inline)'}`);
                    } catch (scriptErr) {
                      console.warn(`⚠️ Failed to inject script ${index + 1}:`, scriptErr);
                    }
                  }
                  
                  // Function to check if dependencies are ready
                  const checkDependenciesReady = (win: any): boolean => {
                    // Check if PRODUCTS data is available
                    const hasProducts = typeof win.PRODUCTS !== 'undefined' && Array.isArray(win.PRODUCTS);
                    
                    // Check if LiquidJS is loaded
                    const hasLiquidJS = typeof win.liquidjs !== 'undefined' || typeof win.Liquid !== 'undefined';
                    
                    // Check if jQuery is loaded (some themes need it)
                    const hasJQuery = typeof win.jQuery !== 'undefined' || typeof win.$ !== 'undefined';
                    
                    return hasProducts && (hasLiquidJS || hasJQuery);
                  };
                  
                  // Function to re-execute product rendering and trigger events
                  const reExecuteProductRendering = () => {
                    try {
                      const win = frame.contentWindow as any;
                      if (!win) return;
                      
                      // Check if dependencies are ready
                      const depsReady = checkDependenciesReady(win);
                      if (!depsReady) {
                        console.log('⏳ Waiting for dependencies (PRODUCTS, LiquidJS)...');
                        // Retry after a delay if dependencies aren't ready
                        setTimeout(() => reExecuteProductRendering(), 500);
                        return;
                      }
                      
                      console.log('✅ Dependencies ready, executing product rendering...');
                      
                      // Trigger DOMContentLoaded event if scripts need it
                      if (doc.readyState === 'loading' || doc.readyState === 'interactive' || doc.readyState === 'complete') {
                        const domContentLoadedEvent = new Event('DOMContentLoaded', { bubbles: true });
                        doc.dispatchEvent(domContentLoadedEvent);
                        
                        // Also trigger window load event for scripts that wait for it
                        const loadEvent = new Event('load', { bubbles: true });
                        win.dispatchEvent(loadEvent);
                      }
                      
                      // CRITICAL: Re-execute product rendering functions after scripts are loaded
                      // Many themes have IIFEs that run immediately, but they might need DOM to be ready
                      
                      // Try to call common product rendering functions
                      if (typeof win.renderFeaturedProducts === 'function') {
                        console.log('🔄 Re-executing renderFeaturedProducts...');
                        try {
                          win.renderFeaturedProducts();
                        } catch (e) {
                          console.warn('Error calling renderFeaturedProducts:', e);
                        }
                      }
                      
                      if (typeof win.renderNewArrivals === 'function') {
                        console.log('🔄 Re-executing renderNewArrivals...');
                        try {
                          win.renderNewArrivals();
                        } catch (e) {
                          console.warn('Error calling renderNewArrivals:', e);
                        }
                      }
                      
                      if (typeof win.initProductRendering === 'function') {
                        console.log('🔄 Re-executing initProductRendering...');
                        try {
                          win.initProductRendering();
                        } catch (e) {
                          console.warn('Error calling initProductRendering:', e);
                        }
                      }
                      
                      if (typeof win.renderTrendingWithLiquid === 'function') {
                        console.log('🔄 Re-executing renderTrendingWithLiquid...');
                        try {
                          win.renderTrendingWithLiquid();
                        } catch (e) {
                          console.warn('Error calling renderTrendingWithLiquid:', e);
                        }
                      }
                      
                      // Check for renderProductGrid function (common in themes)
                      if (typeof win.renderProductGrid === 'function') {
                        console.log('🔄 Found renderProductGrid function');
                        // Try to find and render featured products
                        const featuredContainer = doc.getElementById('featured-products-grid') || 
                                                  doc.getElementById('unique-products') ||
                                                  doc.querySelector('[id*="featured"], [class*="featured-products"]');
                        if (featuredContainer) {
                          console.log('🔄 Attempting to render featured products grid...');
                          try {
                            win.renderProductGrid({
                              templateId: 'unique-products-template',
                              targetId: featuredContainer.id || 'unique-products',
                              pick: function(products: any[]) {
                                return (products || []).slice(0, 4);
                              }
                            });
                          } catch (e) {
                            console.warn('Error calling renderProductGrid:', e);
                          }
                        }
                      }
                      
                      // Also check for window.onload handlers
                      if (typeof win.onload === 'function') {
                        try {
                          win.onload({} as Event);
                        } catch (e) {
                          console.warn('Error calling window.onload:', e);
                        }
                      }
                      
                      // Trigger any custom initialization
                      if (typeof win.init === 'function') {
                        try {
                          win.init();
                        } catch (e) {
                          console.warn('Error calling init:', e);
                        }
                      }
                      
                      // Dispatch a custom event that themes might listen to
                      try {
                        const customLoadEvent = new CustomEvent('themeLoaded', { bubbles: true });
                        doc.dispatchEvent(customLoadEvent);
                        if (win.dispatchEvent) {
                          win.dispatchEvent(customLoadEvent);
                        }
                      } catch (e) {
                        console.warn('Error dispatching custom event:', e);
                      }
                    } catch (reExecErr) {
                      console.warn('Error re-executing product rendering:', reExecErr);
                    }
                  };
                  
                  // Wait for scripts to load and DOM to be ready, then re-execute
                  // Use multiple delays to ensure everything is loaded
                  [1000, 2000, 3000].forEach((execDelay) => {
                    setTimeout(() => {
                      reExecuteProductRendering();
                      console.log(`✅ Product rendering re-execution attempted at ${execDelay}ms (script injection delay: ${delay}ms)`);
                    }, execDelay);
                  });
                  
                  console.log(`✅ All scripts injected into iframe (attempt at ${delay}ms)`);
                };
                
                // Start injecting scripts
                injectScriptsSequentially().catch((err) => {
                  console.warn('Error during sequential script injection:', err);
                });
              }
            }
          } catch (scriptErr) {
            if (delay === 1000) {
              console.warn('Failed to inject scripts into iframe:', scriptErr);
            }
          }
        }, delay);
      });
    }
    
    // Make all components editable, draggable, and selectable
    setTimeout(() => {
      try {
        const wrapper = editor.getWrapper();
        if (wrapper) {
          const setAllInteractive = (comp: any) => {
            if (comp) {
              // Get component attributes to check if it should be droppable
              const attrs = comp.getAttributes?.() || {};
              const tagName = comp.get('tagName')?.toLowerCase();
              const compType = comp.get('type');
              
              // Determine if component should be droppable
              const isDroppable = attrs['data-gjs-droppable'] === '*' || 
                                 tagName === 'form' || 
                                 tagName === 'section' || 
                                 tagName === 'div' ||
                                 tagName === 'main' ||
                                 tagName === 'article' ||
                                 tagName === 'header' ||
                                 tagName === 'footer' ||
                                 tagName === 'nav' ||
                                 tagName === 'aside';
              
              // Determine if component should be editable
              // Make ALL text-containing elements editable for easier editing
              const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup'];
              const isTextElement = textTags.includes(tagName);
              const hasTextContent = comp.get('content') && typeof comp.get('content') === 'string' && comp.get('content').trim().length > 0;
              const shouldBeEditable = attrs['data-gjs-editable'] === 'true' || 
                                       compType === 'text' || 
                                       isTextElement ||
                                       (hasTextContent && !comp.components().length);
              
              // Set all interactive properties - make everything editable and stylable
              comp.set({ 
                stylable: true,  // Allow styling of all components
                selectable: true,  // Allow selection of all components
                hoverable: true,  // Show hover effects
                draggable: true,  // Allow dragging/reordering
                droppable: isDroppable ? '*' : false,  // Allow dropping into containers
                editable: shouldBeEditable,  // Make text elements editable
                resizable: tagName === 'img' || tagName === 'video' || tagName === 'iframe' || tagName === 'canvas'  // Allow resizing media elements
              }, { silent: true });  // Use silent to avoid triggering unnecessary updates
              
              // Ensure component is visible
              const el = comp.getEl?.();
              if (el && el.style) {
                try {
                  el.style.display = '';
                  el.style.visibility = 'visible';
                  el.style.opacity = '1';
                } catch (e) {
                  // Ignore errors setting style properties
                }
              }
              
              // Recursively set properties for all children
              const children = comp.components?.();
              if (children && children.length > 0) {
                children.forEach((child: any) => setAllInteractive(child));
              }
            }
          };
          setAllInteractive(wrapper);
          
          // Force layer manager to update ONLY if structure tab is active
          setTimeout(() => {
            if (editor.LayerManager && activeSidebarSection === 'structure') {
              const layersPanel = document.getElementById('layers-panel');
              if (layersPanel) {
                // Remove layer content from wrong locations
                const allLayerContent = document.querySelectorAll('.gjs-layers, .gjs-layer-item, .gjs-layer-item-title');
                allLayerContent.forEach((el: any) => {
                  const parent = el.closest('#layers-panel');
                  if (!parent) {
                    el.remove();
                  }
                });
                layersPanel.innerHTML = '';
                editor.LayerManager.render();
              }
            }
          }, 100);
        }
      } catch (err) {
        console.warn('Error making components interactive:', err);
      }
    }, 300);

    // CRITICAL: Ensure widgets tab is active and blocks panel is visible when applying theme
    // This is especially important when editing existing themes
    setActiveSidebarSection('widgets');

    // CRITICAL: Ensure blocks panel is re-rendered after applying theme/CSS
    // editor.setComponents() might trigger GrapesJS to clear the blocks panel
    // Run multiple checks to ensure blocks appear (regardless of blocksRenderedRef state)
    [500, 1000, 1500].forEach((delay) => {
      setTimeout(() => {
        try {
          const blocksPanel = document.getElementById('blocks-panel');
          const wrapper = document.querySelector('.elementor-blocks-wrapper') as HTMLElement;
          
          if (blocksPanel && editor.BlockManager) {
            // Ensure wrapper is visible FIRST
            if (wrapper) {
              wrapper.style.setProperty('display', 'block', 'important');
              wrapper.style.setProperty('visibility', 'visible', 'important');
              wrapper.style.setProperty('opacity', '1', 'important');
            }
            
            const existingBlocks = blocksPanel.querySelectorAll('.gjs-block');
            const isEmpty = blocksPanel.innerHTML.trim() === '';
            const hasBlocksContainer = !!blocksPanel.querySelector('.gjs-blocks-c');
            
            // Restore blocks if they're missing (always check, not just if blocksRenderedRef is true)
            if (existingBlocks.length === 0 && (isEmpty || !hasBlocksContainer)) {
              console.log(`[applyPageToEditor] Blocks missing at ${delay}ms, restoring...`);
              
              // Ensure panel is visible
              blocksPanel.style.setProperty('display', 'block', 'important');
              blocksPanel.style.setProperty('visibility', 'visible', 'important');
              blocksPanel.style.setProperty('opacity', '1', 'important');
              
              // Re-render blocks
              blocksPanel.innerHTML = '';
              editor.BlockManager.render();
              blocksRenderedRef.current = true;
              
              // Ensure blocks are visible after render
              setTimeout(() => {
                const restoredBlocks = blocksPanel.querySelectorAll('.gjs-block');
                if (restoredBlocks.length > 0) {
                  restoredBlocks.forEach((block: any) => {
                    if (block) {
                      block.style.display = 'flex';
                      block.style.visibility = 'visible';
                      block.style.opacity = '1';
                      block.style.pointerEvents = 'auto';
                      block.style.cursor = 'grab';
                      block.style.position = 'relative';
                      block.style.zIndex = '1';
                    }
                  });
                  
                  // Ensure categories are visible
                  const categories = blocksPanel.querySelectorAll('.gjs-block-category');
                  categories.forEach((cat: any) => {
                    if (cat) {
                      cat.style.display = 'block';
                      cat.style.visibility = 'visible';
                    }
                  });
                  
                  console.log(`[applyPageToEditor] Restored ${restoredBlocks.length} blocks at ${delay}ms`);
                } else {
                  console.warn(`[applyPageToEditor] No blocks found after render at ${delay}ms`);
                }
              }, 200);
            } else if (existingBlocks.length > 0) {
              // Blocks exist - mark as rendered
              blocksRenderedRef.current = true;
            }
          }
        } catch (err) {
          console.warn(`[applyPageToEditor] Error checking blocks at ${delay}ms:`, err);
        }
      }, delay);
    });
    } catch (error: any) {
      console.error('Error in applyPageToEditor:', error);
      setError(error?.message || 'Failed to apply page content');
      setLoading(false);
    }
  }, [searchParams]);

  const commitCurrentPage = useCallback(() => {
    const editor = editorInstance.current;
    if (!editor || typeof editor.getHtml !== 'function') {
      console.warn('⚠️ Cannot commit page: Editor not ready');
      return;
    }
    
    // Use getPagesSnapshotWithCurrent to get the most up-to-date CSS
    const { currentHtml, currentCss } = getPagesSnapshotWithCurrent();
    
    console.log('💾 Committing current page:', {
      currentPageId,
      htmlLength: currentHtml?.length || 0,
      cssLength: currentCss?.length || 0,
      htmlPreview: currentHtml?.substring(0, 100),
      cssPreview: currentCss?.substring(0, 100)
    });
    
    setPages(prev => {
      const updated = prev.map(page => {
        if (page.id === currentPageId) {
          // Preserve existing CSS if new CSS is empty
          const finalCss = currentCss && currentCss.trim().length > 0 
            ? currentCss 
            : (page.css || '');
          
          const finalHtml = currentHtml && currentHtml.trim().length > 0
            ? currentHtml
            : (page.html || DEFAULT_PAGE_CONTENT);
          
          const updatedPage = { 
            ...page, 
            html: finalHtml, 
            css: finalCss 
          };
          
          console.log(`✅ Committed page ${page.name}:`, {
            htmlLength: updatedPage.html?.length || 0,
            cssLength: updatedPage.css?.length || 0
          });
          
          return updatedPage;
        }
        return page;
      });
      
      // Also update the ref
      pagesRef.current = updated;
      
      return updated;
    });
  }, [currentPageId, getPagesSnapshotWithCurrent]); // Include getPagesSnapshotWithCurrent for better CSS extraction

  const switchPage = useCallback((pageId: string) => {
    if (!pageId || pageId === currentPageId) return;
    
    // CRITICAL: Save current page's changes before switching
    // This ensures all edits are persisted to the pages state
    const { pagesSnapshot } = getPagesSnapshotWithCurrent();
    
    // CRITICAL: Merge with existing pages to preserve all changes
    const mergedPages = pagesSnapshot.map(snapshotPage => {
      const existingPage = pages.find(p => p.id === snapshotPage.id);
      // Use snapshot if it has content, otherwise preserve existing
      return {
        ...snapshotPage,
        html: snapshotPage.html && snapshotPage.html.trim().length > 0 
          ? snapshotPage.html 
          : (existingPage?.html || DEFAULT_PAGE_CONTENT),
        css: snapshotPage.css && snapshotPage.css.trim().length > 0 
          ? snapshotPage.css 
          : (existingPage?.css || '')
      };
    });
    
    // Update pages state with merged changes
    setPages(mergedPages);
    pagesRef.current = mergedPages;
    
    // Find target page from the merged pages
    const targetPage = mergedPages.find((page) => page.id === pageId);
    
    // Switch to target page
    setCurrentPageId(pageId);
    
    // Apply target page to editor
    applyPageToEditor(targetPage?.html || DEFAULT_PAGE_CONTENT, targetPage?.css || '');
    
    console.log(`📄 Switched to page: ${targetPage?.name || pageId}`, {
      totalPages: mergedPages.length,
      currentPageId: pageId,
      hasHtml: !!targetPage?.html,
      hasCss: !!targetPage?.css,
      htmlLength: targetPage?.html?.length || 0,
      cssLength: targetPage?.css?.length || 0,
      allPages: mergedPages.map(p => ({ id: p.id, name: p.name, hasHtml: !!p.html, hasCss: !!p.css }))
    });
  }, [currentPageId, pages, getPagesSnapshotWithCurrent, applyPageToEditor]);

  const addPage = useCallback(() => {
    setHasUnsavedChanges(true);
    console.log('📄 Adding new page...');
    const { pagesSnapshot } = getPagesSnapshotWithCurrent();
    const newPageId = `page-${Date.now()}`;
    const newPage: Page = {
      id: newPageId,
      name: `Page ${pagesSnapshot.length + 1}`,
      html: DEFAULT_PAGE_CONTENT,
      css: ''
    };
    const nextPages = [...pagesSnapshot, newPage];
    setPages(nextPages);
    setCurrentPageId(newPageId);
    applyPageToEditor(newPage.html, newPage.css || '');
    
    // Additional check after applying page
    setTimeout(() => {
      const editor = editorInstance.current;
      if (editor) {
        const wrapper = editor.getWrapper();
        if (wrapper) {
          console.log('🔍 New page wrapper check - Droppable:', wrapper.get('droppable'));
          
          // Ensure droppable
          if (!wrapper.get('droppable')) {
            console.warn('⚠️ New page wrapper not droppable, fixing...');
            wrapper.set('droppable', '*');
          }
        }
      }
    }, 300);
  }, [getPagesSnapshotWithCurrent, applyPageToEditor]);

  const deletePage = useCallback((pageId: string) => {
    setHasUnsavedChanges(true);
    if (pages.length <= 1) {
      alert('Cannot delete the last page. A theme must have at least one page.');
      return;
    }
    const { pagesSnapshot } = getPagesSnapshotWithCurrent();
    const filtered = pagesSnapshot.filter((page) => page.id !== pageId);
    setPages(filtered);
    const nextCurrentPage = filtered[0];
    if (nextCurrentPage) {
      setCurrentPageId(nextCurrentPage.id);
      applyPageToEditor(nextCurrentPage.html, nextCurrentPage.css || '');
    }
  }, [pages.length, getPagesSnapshotWithCurrent, applyPageToEditor]);

  const renamePage = useCallback((pageId: string, newName: string) => {
    setPages((prev) => prev.map((page) => (page.id === pageId ? { ...page, name: newName || page.name } : page)));
    setHasUnsavedChanges(true);
  }, []);

  const sanitizePageHtml = (input: string): string => {
    if (!input) {
      return '<div style="padding:60px 20px; text-align:center; color:#6b7280;">This page does not have any content yet.</div>';
    }
    // Remove GrapesJS internal attributes but preserve:
    // - data-page-link for navigation
    // - data-countdown-* attributes for countdown timer functionality
    // - class attributes (including ziplofy-countdown-timer and countdown-* classes)
    let output = input.replace(/\s*data-gjs-[^=]*="[^"]*"/g, '');
    
    // CRITICAL: Ensure data-page-link attributes are preserved (they're not data-gjs-*)
    // The regex above only removes data-gjs-* attributes, so data-page-link should be safe
    
    // Remove IDs from the body/wrapper element to prevent ID-based selectors
    output = output.replace(/\s*id="([^"]*)"/g, (match, id) => {
      // Remove all IDs for now - we'll use classes instead
      return '';
    });
    
    // Preserve gjs-wrapper-body class and any user-added classes, only remove internal gjs classes
    let hasWrapperClass = false;
    output = output.replace(/\s*class="([^"]*)"/g, (match, classes) => {
      const classList = classes.split(/\s+/).filter((c: string) => 
        // Keep gjs-wrapper-body and any non-gjs classes
        c === 'gjs-wrapper-body' || !c.startsWith('gjs-')
      );
      if (classList.includes('gjs-wrapper-body')) {
        hasWrapperClass = true;
      }
      return classList.length > 0 ? ` class="${classList.join(' ')}"` : '';
    });
    
    // CRITICAL: If no wrapper class found, add it to the outermost element (body tag)
    if (!hasWrapperClass) {
      // Add class to the first <body> tag
      output = output.replace(/<body([^>]*)>/i, (match, attrs) => {
        // Check if class attribute exists
        if (attrs.includes('class=')) {
          // Add to existing class
          return match.replace(/class="([^"]*)"/, 'class="$1 gjs-wrapper-body"');
        } else {
          // Add new class attribute
          return `<body${attrs} class="gjs-wrapper-body">`;
        }
      });
    }
    
    output = output.replace(/\s*contenteditable="[^"]*"/g, '');
    return output;
  };

  const buildPagedHtmlDocument = (
    pagesList: Page[],
    combinedCss: string,
    themeTitle: string,
    options: { linkStylesheet?: boolean } = {}
  ): string => {
    const safePages = pagesList.length
      ? pagesList
      : [
          {
            id: 'page-1',
            name: 'Page 1',
            html: '',
            css: '',
          },
        ];

    const escapeHtml = (value: string) =>
      (value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const pageSections = safePages
      .map(
        (page, index) => {
          let pageHtml = sanitizePageHtml(page.html || '');
          
          // CRITICAL FIX: Ensure the outermost element has gjs-wrapper-body class
          // This ensures wrapper background images work in preview
          if (!pageHtml.includes('gjs-wrapper-body')) {
            // Add the class to the first HTML tag
            pageHtml = pageHtml.replace(/^(\s*)<([a-zA-Z][a-zA-Z0-9]*)([\s>])/, (match, ws, tag, rest) => {
              return `${ws}<${tag} class="gjs-wrapper-body"${rest}`;
            });
          }
          
          return `
  <section class="preview-page gjs-wrapper-body" data-page-id="${page.id}" id="page-${page.id}" style="display: ${index === 0 ? 'block' : 'none'};">
    ${pageHtml}
  </section>`;
        }
      )
      .join('\n');

    const pagesMeta = safePages.map(({ id, name: pageName }) => ({
      id,
      name: pageName,
    }));
    const pagesMetaJson = JSON.stringify(pagesMeta)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e');

    const initialPageId = safePages[0]?.id || '';
    const safeTitle = escapeHtml(themeTitle || 'Theme Preview');
    const linkStylesheetTag = options.linkStylesheet ? '  <link rel="stylesheet" href="style.css">\n' : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Preview</title>
${linkStylesheetTag}  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      min-height: 100%;
      height: auto !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #ffffff;
    }
    html {
      overflow-y: scroll !important;
      overflow-x: hidden !important;
    }
    body {
      overflow-x: hidden !important;
      overflow-y: auto !important;
    }
    .preview-page {
      width: 100%;
      min-height: 100vh;
      padding-bottom: 40px;
    }
    .preview-page[hidden] {
      display: none !important;
    }
    /* CRITICAL: Ensure wrapper styles apply to preview container */
    .preview-page > .gjs-wrapper-body,
    .preview-page.gjs-wrapper-body {
      width: 100%;
      min-height: 100vh;
    }
    a[data-page-link] {
      cursor: pointer;
    }
    ${combinedCss}
  </style>
</head>
<body data-active-page="">
  ${pageSections}
  <script>
    (function() {
      const pages = ${pagesMetaJson};
      const previewPages = Array.from(document.querySelectorAll('.preview-page'));

      function normalizePageId(pageId) {
        if (!pageId) return '';
        // Remove leading # and whitespace
        let normalized = String(pageId).replace(/^#/, '').trim();
        // Remove 'page-' prefix if present for comparison
        normalized = normalized.replace(/^page-/, '');
        return normalized;
      }

      function showPage(pageId) {
        if (!pageId) return false;
        
        const normalizedRequest = normalizePageId(pageId);
        if (!normalizedRequest) return false;
        
        let found = false;
        previewPages.forEach((page) => {
          const pageIdAttr = page.dataset.pageId || '';
          const normalizedPageId = normalizePageId(pageIdAttr);
          
          // Match with or without 'page-' prefix
          if (normalizedPageId === normalizedRequest || 
              pageIdAttr === pageId || 
              pageIdAttr === 'page-' + normalizedRequest ||
              'page-' + normalizedPageId === pageId) {
            page.style.display = 'block';
            page.removeAttribute('hidden');
            page.classList.add('active');
            found = true;
          } else {
            page.style.display = 'none';
            page.setAttribute('hidden', 'true');
            page.classList.remove('active');
          }
        });

        if (found) {
          const activePage = previewPages.find(p => p.classList.contains('active'));
          const actualPageId = activePage ? (activePage.dataset.pageId || normalizedRequest) : normalizedRequest;
          document.body.setAttribute('data-active-page', actualPageId);
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }

        return found;
      }

      function updateHash(pageId) {
        if (!pageId) return;
        const hash = '#page-' + pageId;
        if (history.replaceState) {
          history.replaceState(null, '', hash);
        } else {
          location.hash = hash;
        }
      }

      function handleLinkClick(event) {
        // Check for data-page-link attribute first
        const link = event.target.closest('[data-page-link]');
        if (link) {
        const targetPageId = link.getAttribute('data-page-link');
          if (targetPageId && targetPageId.trim() !== '') {
          event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
          const switched = showPage(targetPageId);
          if (switched) {
            updateHash(targetPageId);
            } else {
              console.warn('Page not found:', targetPageId, 'Available pages:', Array.from(previewPages).map(p => p.dataset.pageId));
            }
            return false;
          }
        }
        
        // Check for href with #page- prefix
        const hrefLink = event.target.closest('a[href^="#page-"], a[href^="#"]');
        if (hrefLink) {
          const href = hrefLink.getAttribute('href');
          if (href && href.startsWith('#')) {
            const pageId = href.replace(/^#/, '').trim();
            if (pageId) {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              const switched = showPage(pageId);
              if (switched) {
                updateHash(pageId);
        }
        return false;
            }
          }
        }
        
        // Check for button with data-page-link
        const button = event.target.closest('button[data-page-link]');
        if (button) {
          const targetPageId = button.getAttribute('data-page-link');
          if (targetPageId && targetPageId.trim() !== '') {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            const switched = showPage(targetPageId);
            if (switched) {
              updateHash(targetPageId);
            }
            return false;
          }
        }
      }

      function syncWithHash() {
        const hash = (window.location.hash || '').replace(/^#/, '');
        if (!hash) return false;
        
        // Try to find page by ID (with or without page- prefix)
        const normalizedHash = normalizePageId(hash);
        const matchingPage = pages.find((page) => {
          const normalizedPageId = normalizePageId(page.id);
          return normalizedPageId === normalizedHash || page.id === hash || page.id === 'page-' + normalizedHash;
        });
        
        if (matchingPage) {
          return showPage(matchingPage.id);
        }
        
        // If no exact match, try showing by hash directly
        return showPage(hash);
      }

      // Use capture phase to ensure we catch events before they bubble
      document.addEventListener('click', handleLinkClick, true);
      window.addEventListener('hashchange', syncWithHash);

      const defaultPageId = '${initialPageId}';
      if (!syncWithHash() && defaultPageId) {
        showPage(defaultPageId);
        updateHash(defaultPageId);
      }

      // Initialize Progress Bars - sync percentage text with bar width
      function initProgressBars() {
        const progressBars = document.querySelectorAll('.ziplofy-progress-bar');
        progressBars.forEach((bar) => {
          const percentageEl = bar.querySelector('.progress-percentage');
          const fillEl = bar.querySelector('.progress-bar-fill');
          
          if (!percentageEl || !fillEl) return;
          
          function updateProgressBar() {
            const text = percentageEl.textContent || percentageEl.innerText || '0%';
            const match = text.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              const percentage = parseFloat(match[1]);
              const clampedPercentage = Math.min(100, Math.max(0, percentage));
              fillEl.style.width = clampedPercentage + '%';
            }
          }
          
          // Initial update
          updateProgressBar();
          
          // Watch for changes using MutationObserver
          const observer = new MutationObserver(updateProgressBar);
          observer.observe(percentageEl, {
            childList: true,
            characterData: true,
            subtree: true
          });
        });
      }
      
      // Initialize progress bars when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProgressBars);
      } else {
        initProgressBars();
      }

      // Initialize Parallax Sections
      function initParallaxSections() {
        const parallaxSections = document.querySelectorAll('.ziplofy-parallax-section');
        
        if (parallaxSections.length === 0) return;
        
        function updateParallax() {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const windowHeight = window.innerHeight;
          
          parallaxSections.forEach((section) => {
            const background = section.querySelector('.parallax-background');
            const content = section.querySelector('.parallax-content');
            
            if (!background) return;
            
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            const sectionHeight = rect.height;
            const sectionOffset = section.offsetTop;
            
            // Check if section is in viewport
            const isInViewport = sectionTop < windowHeight && sectionBottom > 0;
            
            if (!isInViewport) {
              // Reset transform when out of viewport
              background.style.transform = 'translate3d(0, 0, 0)';
              if (content) {
                content.style.transform = 'translate3d(0, 0, 0)';
              }
              return;
            }
            
            // Calculate how far we've scrolled relative to the section
            // When section is at top of viewport: distance = 0
            // As we scroll down, distance increases
            const distanceFromTop = scrollTop - sectionOffset + windowHeight;
            
            // Parallax effect: background moves slower than the scroll
            // Speed of 0.5 means background moves at 50% of scroll speed (creates depth)
            const parallaxSpeed = 0.5;
            const backgroundY = distanceFromTop * parallaxSpeed;
            
            // Apply transform to background (moves slower, creating parallax depth effect)
            background.style.transform = 'translate3d(0, ' + backgroundY + 'px, 0)';
            
            // Content moves even slower for subtle parallax effect
            if (content) {
              const contentSpeed = 0.2;
              const contentY = distanceFromTop * contentSpeed;
              content.style.transform = 'translate3d(0, ' + contentY + 'px, 0)';
            }
          });
        }
        
        // Throttle scroll events for better performance
        let ticking = false;
        function onScroll() {
          if (!ticking) {
            window.requestAnimationFrame(function() {
              updateParallax();
              ticking = false;
            });
            ticking = true;
          }
        }
        
        // Initial update
        updateParallax();
        
        // Listen to scroll events
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', updateParallax, { passive: true });
        
        // Also update on page load/visibility change
        document.addEventListener('visibilitychange', function() {
          if (!document.hidden) {
            updateParallax();
          }
        });
      }
      
      // Initialize parallax sections when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParallaxSections);
      } else {
        initParallaxSections();
      }
    })();
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    if (!LOCAL_STORAGE_PAGES_KEY) {
      persistedInitialLoadRef.current = true;
      return;
    }
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PAGES_KEY);
      if (stored) {
        const payload = JSON.parse(stored);
        if (payload && Array.isArray(payload.pages) && payload.pages.length > 0) {
          restoredFromLocalRef.current = true;
          lastSyncedAtRef.current = payload.updatedAt || Date.now();
          skipPersistRef.current = true;
          const nextPages: Page[] = payload.pages;
          pagesRef.current = nextPages;
          setPages(nextPages);
          const nextPageId = payload.currentPageId || nextPages[0].id;
          if (nextPageId) {
            setCurrentPageId(nextPageId);
            const targetPage = nextPages.find((p) => p.id === nextPageId);
            if (targetPage) {
              applyPageToEditor(targetPage.html || DEFAULT_PAGE_CONTENT, targetPage.css || '');
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to restore builder state from storage:', err);
    } finally {
      if (!persistedInitialLoadRef.current) {
        persistedInitialLoadRef.current = true;
      }
    }
  }, [LOCAL_STORAGE_PAGES_KEY, applyPageToEditor]);

  useEffect(() => {
    if (!LOCAL_STORAGE_PAGES_KEY) return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LOCAL_STORAGE_PAGES_KEY || !event.newValue) return;
      try {
        const payload = JSON.parse(event.newValue);
        if (!payload || payload.source === tabIdRef.current) return;
        if (!Array.isArray(payload.pages) || payload.pages.length === 0) return;
        if (payload.updatedAt && payload.updatedAt <= lastSyncedAtRef.current) return;
        lastSyncedAtRef.current = payload.updatedAt || Date.now();
        skipPersistRef.current = true;
        const nextPages: Page[] = payload.pages;
        pagesRef.current = nextPages;
        setPages(nextPages);
        const nextPageId = payload.currentPageId || nextPages[0].id;
        if (nextPageId) {
          setCurrentPageId(nextPageId);
          const targetPage = nextPages.find((p) => p.id === nextPageId);
          if (targetPage) {
            applyPageToEditor(targetPage.html || DEFAULT_PAGE_CONTENT, targetPage.css || '');
          }
        }
      } catch (err) {
        // Suppress extension context errors
        if (err instanceof Error && err.message.includes('Extension context invalidated')) {
          return;
        }
        console.warn('Failed to process builder storage update:', err);
      }
    };
    try {
      window.addEventListener('storage', handleStorage);
    } catch (err) {
      // Suppress extension context errors
      if (err instanceof Error && err.message.includes('Extension context invalidated')) {
        return;
      }
    }
    return () => {
      try {
        window.removeEventListener('storage', handleStorage);
      } catch (err) {
        // Suppress extension context errors
        if (err instanceof Error && err.message.includes('Extension context invalidated')) {
          return;
        }
      }
    };
  }, [LOCAL_STORAGE_PAGES_KEY, applyPageToEditor]);

  // Helper function to clear old localStorage data when quota is exceeded
  const clearOldLocalStorageData = useCallback(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ziplofy.builder.pages.')) {
          keysToRemove.push(key);
        }
      }
      
      // Sort by key (which includes timestamp/ID) and remove oldest ones
      // Keep only the current one if it exists
      keysToRemove.sort();
      const currentKey = LOCAL_STORAGE_PAGES_KEY;
      
      // Remove all old builder states except current
      keysToRemove.forEach(key => {
        if (key !== currentKey) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn('Failed to remove old localStorage key:', key);
          }
        }
      });
      
      console.log(`Cleared ${keysToRemove.length} old builder states from localStorage`);
    } catch (e) {
      console.warn('Error clearing old localStorage data:', e);
    }
  }, [LOCAL_STORAGE_PAGES_KEY]);

  useEffect(() => {
    if (!LOCAL_STORAGE_PAGES_KEY) return;
    if (!persistedInitialLoadRef.current) return;
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    try {
      const { pagesSnapshot } = getPagesSnapshotWithCurrent();
      const payload = {
        pages: pagesSnapshot,
        currentPageId,
        updatedAt: Date.now(),
        source: tabIdRef.current,
      };
      lastSyncedAtRef.current = payload.updatedAt;
      localStorage.setItem(LOCAL_STORAGE_PAGES_KEY, JSON.stringify(payload));
    } catch (err: any) {
      // Handle QuotaExceededError by clearing old data and retrying
      if (err?.name === 'QuotaExceededError' || err?.message?.includes('quota')) {
        console.warn('LocalStorage quota exceeded. Clearing old builder states...');
        clearOldLocalStorageData();
        
        // Try again with a smaller payload (just essential data)
        try {
          const { pagesSnapshot } = getPagesSnapshotWithCurrent();
          // Reduce payload size by limiting CSS length
          const reducedPages = pagesSnapshot.map(page => ({
            ...page,
            css: page.css ? page.css.substring(0, 50000) : '', // Limit CSS to 50KB per page
          }));
          const payload = {
            pages: reducedPages,
            currentPageId,
            updatedAt: Date.now(),
            source: tabIdRef.current,
          };
          localStorage.setItem(LOCAL_STORAGE_PAGES_KEY, JSON.stringify(payload));
          console.log('Successfully persisted reduced builder state');
        } catch (retryErr) {
          console.warn('Failed to persist builder state even after clearing old data:', retryErr);
        }
      } else {
      console.warn('Failed to persist builder state:', err);
      }
    }
  }, [pages, currentPageId, getPagesSnapshotWithCurrent, LOCAL_STORAGE_PAGES_KEY]);

  const initialPageParam = useMemo(() => searchParams.get('page'), [searchParams]);

  useEffect(() => {
    if (initialPageHandledRef.current) return;
    if (!initialPageParam) {
      initialPageHandledRef.current = true;
      return;
    }
    const targetPage = pages.find((page) => page.id === initialPageParam);
    if (!targetPage) return;
    initialPageHandledRef.current = true;
    if (currentPageId !== targetPage.id) {
      setCurrentPageId(targetPage.id);
      applyPageToEditor(targetPage.html || DEFAULT_PAGE_CONTENT, targetPage.css || '');
    }
  }, [initialPageParam, pages, currentPageId, applyPageToEditor]);

  const loadSaved = useCallback(async () => {
    if (!id) return null;
    
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId) {
      console.warn('Invalid theme ID format (not a MongoDB ObjectId). This might be an old theme from localStorage. Creating new theme.');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('id');
      window.history.replaceState({}, '', newUrl.toString());
      return null;
    }
    
    try {
      const { axiosi } = await import('../../config/axios.config');
      const response = await axiosi.get(`/custom-themes/${id}`);
      if (response.data.success && response.data.data) {
        const themeData = response.data.data;
        const storedHtml: string = themeData.html || '';
        const storedCss: string = themeData.css || '';

        const parsedPages = parsePagesFromStoredHtml(storedHtml);
        if (parsedPages && parsedPages.length > 0) {
          console.log('📥 Loaded pages from saved theme:', {
            totalPages: parsedPages.length,
            pages: parsedPages.map(p => ({
              id: p.id,
              name: p.name,
              hasHtml: !!p.html && p.html.trim().length > 0,
              hasCss: !!p.css && p.css.trim().length > 0,
              htmlLength: p.html?.length || 0,
              cssLength: p.css?.length || 0
            }))
          });
          
          if (!restoredFromLocalRef.current) {
            console.log('🔄 Setting pages state from loaded theme:', {
              pagesCount: parsedPages.length,
              firstPage: {
                id: parsedPages[0].id,
                name: parsedPages[0].name,
                htmlLength: parsedPages[0].html?.length || 0,
                cssLength: parsedPages[0].css?.length || 0
              },
              allPages: parsedPages.map(p => ({
                id: p.id,
                name: p.name,
                htmlLength: p.html?.length || 0,
                cssLength: p.css?.length || 0
              }))
            });
            
            setPages(parsedPages);
            pagesRef.current = parsedPages;
            setCurrentPageId(parsedPages[0].id);
            
            // CRITICAL: Apply the first page to editor immediately
            // This ensures the page content is visible
            setTimeout(() => {
              const editor = editorInstance.current;
              if (editor && parsedPages[0]) {
                console.log('📄 Applying first page to editor after load:', {
                  pageId: parsedPages[0].id,
                  pageName: parsedPages[0].name,
                  htmlLength: parsedPages[0].html?.length || 0,
                  cssLength: parsedPages[0].css?.length || 0
                });
                applyPageToEditor(
                  parsedPages[0].html || DEFAULT_PAGE_CONTENT, 
                  parsedPages[0].css || ''
                );
              }
            }, 100);
          }
          persistedInitialLoadRef.current = true;
          return {
            ...themeData,
            html: parsedPages[0].html || DEFAULT_PAGE_CONTENT,
            css: storedCss,
          };
        }

        const singlePage: Page = {
          id: 'page-1',
          name: 'Home',
          html: storedHtml || DEFAULT_PAGE_CONTENT,
          css: storedCss || '',
        };
        if (!restoredFromLocalRef.current) {
          setPages([singlePage]);
          pagesRef.current = [singlePage];
          setCurrentPageId('page-1');
        }
        persistedInitialLoadRef.current = true;
        return {
          ...themeData,
          html: singlePage.html,
          css: storedCss,
        };
      }
      return null;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 400) {
        // Suppress 404 warning - theme might be installed, not custom
        // The editor.on('load') handler will try installed theme as fallback
        // console.warn('Theme not found or invalid ID. Creating new theme.');
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('id');
        window.history.replaceState({}, '', newUrl.toString());
        persistedInitialLoadRef.current = true;
      } else {
        console.error('Error loading custom theme:', error);
      }
      return null;
    }
  }, [id, parsePagesFromStoredHtml]);

  // Global error handler for extension context errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message && event.error.message.includes('Extension context invalidated')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      return true;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && event.reason.message.includes('Extension context invalidated')) {
        event.preventDefault();
        return false;
      }
      return true;
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (editorInstance.current) return;
    
    let destroyed = false;
    let editorForThisEffect: any = null;
    const cleanupFns: Array<() => void> = [];
    const registerCleanup = (fn: () => void) => {
      cleanupFns.push(fn);
    };
    
    // Force loading to false after 10 seconds as a safety measure
    const loadingTimeout = setTimeout(() => {
      if (!destroyed && loading) {
        console.warn('⚠️ Editor initialization timeout - forcing loading to false');
        setLoading(false);
        setError('Editor initialization is taking longer than expected. The editor may still be loading.');
      }
    }, 10000);
    
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // CRITICAL: Wait for editor container to be available (with retry)
        let retries = 0;
        const maxRetries = 10;
        while (!editorRef.current && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        if (!editorRef.current) {
          console.error('❌ Editor container not found after retries');
          setError('Editor container not found. Please refresh the page.');
          setLoading(false);
          clearTimeout(loadingTimeout);
          return;
        }
        
        console.log('✅ Editor container found, initializing GrapesJS...');

        console.log('📦 Loading GrapesJS dependencies...');
        const grapesjs = (await import('grapesjs')).default;
        console.log('✅ GrapesJS loaded');
        await import('grapesjs/dist/css/grapes.min.css');
        console.log('✅ GrapesJS CSS loaded');
        const presetWebpage = (await import('grapesjs-preset-webpage')).default;
        console.log('✅ GrapesJS preset-webpage loaded');

        console.log('🚀 Initializing GrapesJS editor...', {
          container: editorRef.current,
          hasContainer: !!editorRef.current,
          containerId: editorRef.current?.id,
          containerClasses: editorRef.current?.className
        });
        
        const editor = grapesjs.init({
          container: editorRef.current as HTMLElement,
          fromElement: false,
          height: 'calc(100vh - 60px)',
          width: '100%',
          noticeOnUnload: false,
          avoidInlineStyle: true, // CRITICAL: Force CSS rules instead of inline styles
          plugins: [presetWebpage],
          pluginsOpts: {
            // Disable preset blocks to prevent duplicates - we add all blocks ourselves
            [presetWebpage as unknown as string]: { blocks: [] },
          },
          deviceManager: {
            devices: [
              { id: 'desktop', name: 'Desktop', width: '' },
              { id: 'tablet', name: 'Tablet', width: '768px' },
              { id: 'mobile', name: 'Mobile', width: '375px' },
            ],
          },
          storageManager: { type: null as any },
          // Fix: Color picker must append to body so it's not clipped by overflow:hidden on style panel
          colorPicker: {
            appendTo: 'body',
            showInput: true,
            flat: false, // Use dropdown mode (not inline)
            disabled: false,
          },
          selectorManager: { 
            componentFirst: true,
            escapeName: (name: string) => {
              // Force class-based selectors by escaping IDs
              return name;
            },
            // Ensure components get proper selectors for CSS rules
            appendTo: '#style-panel'
          },
          styleManager: {
            appendTo: '#style-panel',
            sectors: [
              {
                name: 'Layout',
                open: true,
                buildProps: [
                  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
                  'padding', 'margin', 'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
                  'overflow', 'overflow-x', 'overflow-y', 'float', 'clear', 'vertical-align', 'box-sizing'
                ],
              },
              {
                name: 'Typography',
                open: true,
                buildProps: [
                  'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant',
                  'text-decoration', 'text-align', 'text-transform', 'text-indent',
                  'line-height', 'letter-spacing', 'word-spacing', 'white-space',
                  'color', 'text-shadow', 'text-overflow', 'word-wrap', 'word-break'
                ],
              },
              {
                name: 'Background',
                open: true,
                buildProps: [
                  'background-color', 'background-image', 'background-repeat',
                  'background-position', 'background-attachment', 'background-size',
                  'background-clip', 'background-origin', 'background-blend-mode'
                ],
              },
              {
                name: 'Border',
                open: true,
                buildProps: [
                  'border', 'border-width', 'border-style', 'border-color', 'border-radius',
                  'border-top', 'border-right', 'border-bottom', 'border-left',
                  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
                  'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
                  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
                  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
                  'box-shadow', 'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset'
                ],
              },
              {
                name: 'Flexbox',
                open: false,
                buildProps: [
                  'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'align-self',
                  'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'order', 'gap', 'row-gap', 'column-gap'
                ],
              },
              {
                name: 'Grid',
                open: false,
                buildProps: [
                  'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
                  'grid-column', 'grid-row', 'grid-column-start', 'grid-column-end',
                  'grid-row-start', 'grid-row-end', 'grid-area',
                  'grid-gap', 'grid-row-gap', 'grid-column-gap',
                  'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow',
                  'justify-items', 'align-items', 'place-items',
                  'justify-content', 'align-content', 'place-content'
                ],
              },
              {
                name: 'Effects',
                open: false,
                buildProps: [
                  'opacity', 'transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay',
                  'transform', 'transform-origin', 'transform-style', 'perspective', 'perspective-origin',
                  'filter', 'backdrop-filter', 'mix-blend-mode', 'isolation',
                  'box-shadow', 'text-shadow', 'clip-path', 'mask', 'mask-image'
                ],
              },
              {
                name: 'Spacing',
                open: false,
                buildProps: [
                  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                  'gap', 'row-gap', 'column-gap'
                ],
              },
              {
                name: 'Sizing',
                open: false,
                buildProps: [
                  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
                  'box-sizing', 'object-fit', 'object-position', 'aspect-ratio'
                ],
              },
              {
                name: 'List',
                open: false,
                buildProps: [
                  'list-style', 'list-style-type', 'list-style-position', 'list-style-image'
                ],
              },
              {
                name: 'Table',
                open: false,
                buildProps: [
                  'border-collapse', 'border-spacing', 'caption-side', 'empty-cells', 'table-layout'
                ],
              },
              {
                name: 'Cursor',
                open: false,
                buildProps: [
                  'cursor', 'pointer-events', 'user-select', 'touch-action'
                ],
              },
              {
                name: 'Animation',
                open: false,
                buildProps: [
                  'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
                  'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state'
                ],
              },
            ],
          },
          canvas: { styles: [] },
          blockManager: { appendTo: '#blocks-panel' },
          layerManager: { appendTo: '#layers-panel' },
          traitManager: {
            appendTo: '#traits-panel',
          },
        });

        editorInstance.current = editor;
        editorForThisEffect = editor;
        console.log('✅ Editor instance created and stored', {
          hasEditor: !!editor,
          hasComponents: !!editor.Components,
          hasBlockManager: !!editor.BlockManager
        });

        // Setup Undo/Redo functionality
        const updateUndoRedoState = () => {
          const um = editor.UndoManager;
          if (um) {
            setCanUndo(um.hasUndo());
            setCanRedo(um.hasRedo());
          }
        };

        // Listen to undo/redo events
        editor.on('update', updateUndoRedoState);
        editor.on('component:update', updateUndoRedoState);
        editor.on('style:update', updateUndoRedoState);

        // Update progress bars when percentage text changes
        editor.on('component:update', (component: any) => {
          try {
            const viewEl = component.getEl ? component.getEl() : null;
            if (!viewEl || viewEl.nodeType !== 1) return;
            
            const progressBar = viewEl.closest ? viewEl.closest('.ziplofy-progress-bar') : null;
            if (!progressBar) return;
            
            const percentageEl = progressBar.querySelector('.progress-percentage');
            const fillEl = progressBar.querySelector('.progress-bar-fill');
            
            if (!percentageEl || !fillEl) return;
            
            const text = percentageEl.textContent || percentageEl.innerText || '0%';
            const match = text.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              const percentage = parseFloat(match[1]);
              const clampedPercentage = Math.min(100, Math.max(0, percentage));
              fillEl.style.width = clampedPercentage + '%';
            }
          } catch (e) {
            // Silently ignore errors
          }
        });
        editor.on('storage:load', updateUndoRedoState);
        
        // CRITICAL: Re-execute product rendering when editor content updates
        // This ensures featured products are rendered after content changes
        const reExecuteProductRenderingInFrame = () => {
          try {
            const canvas = editor.Canvas;
            if (!canvas) return;
            
            const frame = canvas.getFrameEl();
            if (!frame || !frame.contentWindow || !frame.contentDocument) return;
            
            const win = frame.contentWindow as any;
            const doc = frame.contentDocument;
            
            // Try to call common product rendering functions
            if (typeof win.renderFeaturedProducts === 'function') {
              try {
                win.renderFeaturedProducts();
                console.log('🔄 Re-executed renderFeaturedProducts after editor update');
              } catch (e) {
                // Silently ignore - function might not be ready yet
              }
            }
            
            if (typeof win.renderNewArrivals === 'function') {
              try {
                win.renderNewArrivals();
              } catch (e) {}
            }
            
            if (typeof win.initProductRendering === 'function') {
              try {
                win.initProductRendering();
              } catch (e) {}
            }
            
            if (typeof win.renderTrendingWithLiquid === 'function') {
              try {
                win.renderTrendingWithLiquid();
              } catch (e) {}
            }
            
            // Check for renderProductGrid function
            if (typeof win.renderProductGrid === 'function') {
              const featuredContainer = doc.getElementById('featured-products-grid') || 
                                        doc.getElementById('unique-products') ||
                                        doc.querySelector('[id*="featured"], [class*="featured-products"]');
              if (featuredContainer) {
                try {
                  win.renderProductGrid({
                    templateId: 'unique-products-template',
                    targetId: featuredContainer.id || 'unique-products',
                    pick: function(products: any[]) {
                      return (products || []).slice(0, 4);
                    }
                  });
                } catch (e) {}
              }
            }
          } catch (err) {
            // Silently ignore errors - this is a best-effort attempt
          }
        };
        
        // CRITICAL: Ensure all newly added components are fully editable
        let productRenderingTimeout: NodeJS.Timeout | null = null;
        
        editor.on('component:add', (component: any) => {
          // Make the new component fully interactive
          setTimeout(() => {
            try {
              const setComponentInteractive = (comp: any) => {
                if (!comp) return;
                
                const tagName = comp.get('tagName')?.toLowerCase();
                const compType = comp.get('type');
                const attrs = comp.getAttributes?.() || {};
                
                // Determine if editable
                const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button', 'strong', 'em', 'b', 'i', 'u'];
                const isTextElement = textTags.includes(tagName);
                const shouldBeEditable = attrs['data-gjs-editable'] === 'true' || 
                                       compType === 'text' || 
                                       isTextElement;
                
                // Determine if droppable
                const isDroppable = attrs['data-gjs-droppable'] === '*' || 
                                   ['form', 'section', 'div', 'main', 'article', 'header', 'footer', 'nav', 'aside'].includes(tagName);
                
                comp.set({
                  stylable: true,
                  selectable: true,
                  hoverable: true,
                  draggable: true,
                  droppable: isDroppable ? '*' : false,
                  editable: shouldBeEditable,
                  resizable: ['img', 'video', 'iframe', 'canvas'].includes(tagName)
                }, { silent: true });
                
                // Recursively set for children
                const children = comp.components?.();
                if (children && children.length > 0) {
                  children.forEach((child: any) => setComponentInteractive(child));
                }
              };
              
              setComponentInteractive(component);
            } catch (e) {
              console.warn('Error making new component interactive:', e);
            }
            
            // Re-execute product rendering
            reExecuteProductRenderingInFrame();
          }, 100);
        });
        
        // Ensure components stay editable when updated
        editor.on('component:update', (component: any) => {
          // Debounce product rendering
          if (productRenderingTimeout) {
            clearTimeout(productRenderingTimeout);
          }
          productRenderingTimeout = setTimeout(() => {
            reExecuteProductRenderingInFrame();
          }, 1000);
          
          // Ensure component remains editable after update
          try {
            if (component) {
              const tagName = component.get('tagName')?.toLowerCase();
              const compType = component.get('type');
              const attrs = component.getAttributes?.() || {};
              
              const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button'];
              const isTextElement = textTags.includes(tagName);
              const shouldBeEditable = attrs['data-gjs-editable'] === 'true' || 
                                     compType === 'text' || 
                                     isTextElement;
              
              // Re-apply editable property if needed
              if (shouldBeEditable && !component.get('editable')) {
                component.set('editable', true, { silent: true });
              }
              
              // Ensure stylable is always true
              if (!component.get('stylable')) {
                component.set('stylable', true, { silent: true });
              }
            }
          } catch (e) {
            // Silently ignore errors
          }
        });
        
        // Initial state
        updateUndoRedoState();

        // Ensure widgets panel is visible and blocks are rendered when editor loads
        // This is critical when editing existing themes
        // Use a flag to prevent multiple executions
        let loadHandlerExecuted = false;
        const runIfEditorReady = (fn: () => void) => {
          editor.on('load', fn);
          // If GrapesJS is already ready (eg. StrictMode mount/unmount), run immediately
          try {
            const model = editor.getModel?.();
            const ready = Boolean(model?.get?.('ready'));
            if (ready) fn();
          } catch {}
        };

        // #region agent log
        // Probe color flips directly in iframe text nodes (independent from select handlers)
        try {
          const colorState = new Map<string, string>();
          const sampleHeroTextColors = () => {
            try {
              const frame = editor?.Canvas?.getFrameEl?.();
              const doc = frame?.contentDocument;
              if (!doc) return;
              const nodes = Array.from(
                doc.querySelectorAll('.hero-slider-container h1, .hero-slider-container h2, .hero-slider-container h3, .hero-slider-container p, .hero-slider-container a, .hero-slide-caption h1, .hero-slide-caption h2, .hero-slide-caption h3, .hero-slide-caption p, .hero-slide-caption a')
              ) as HTMLElement[];
              for (const el of nodes.slice(0, 40)) {
                const cs = doc.defaultView?.getComputedStyle(el);
                const color = cs?.color || '';
                const fill = cs?.getPropertyValue?.('-webkit-text-fill-color') || '';
                const key = `${el.tagName.toLowerCase()}#${el.id || ''}.${String(el.className || '').slice(0, 40)}`;
                const current = `${color}|${fill}`;
                const prev = colorState.get(key);
                colorState.set(key, current);
                const becameBlack =
                  prev !== current &&
                  (color === 'rgb(0, 0, 0)' || fill === 'rgb(0, 0, 0)') &&
                  prev !== 'rgb(0, 0, 0)|rgb(0, 0, 0)';
                if (becameBlack) {
                  const body = doc.body as HTMLElement | null;
                  const bodyCs = body ? doc.defaultView?.getComputedStyle(body) : null;
                  const selectedEl = doc.querySelector('.gjs-selected, .gjs-comp-selected') as HTMLElement | null;
                  const selCs = selectedEl ? doc.defaultView?.getComputedStyle(selectedEl) : null;
                  fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-3',hypothesisId:'H23',location:'CustomThemeBuilder.tsx:iframe:text-color-watch',message:'hero text color transitioned to black',data:{tag:el.tagName.toLowerCase(),className:(el.className||'').toString().slice(0,120),id:el.id||'',prevColor:prev||'',inlineColor:el.style?.color||'',inlineTextFill:el.style?.getPropertyValue?.('-webkit-text-fill-color')||'',computedColor:color,computedTextFill:fill,parentColor:el.parentElement ? doc.defaultView?.getComputedStyle(el.parentElement)?.color : ''},timestamp:Date.now()})}).catch(()=>{});
                  fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-4',hypothesisId:'H24',location:'CustomThemeBuilder.tsx:iframe:text-color-watch:context',message:'black transition context',data:{bodyClass:body?.className||'',bodyColor:bodyCs?.color||'',bodyTextFill:bodyCs?.getPropertyValue?.('-webkit-text-fill-color')||'',selectedTag:selectedEl?.tagName?.toLowerCase()||'',selectedClass:selectedEl?.className||'',selectedColor:selCs?.color||'',selectedTextFill:selCs?.getPropertyValue?.('-webkit-text-fill-color')||''},timestamp:Date.now()})}).catch(()=>{});
                }
              }
            } catch {}
          };
          const interval = window.setInterval(sampleHeroTextColors, 400);
          registerCleanup(() => window.clearInterval(interval));
        } catch {}
        // #endregion agent log

        runIfEditorReady(() => {
          if (loadHandlerExecuted || destroyed) return; // Prevent multiple executions
          loadHandlerExecuted = true;
          
          console.log('✅ Editor loaded - ensuring widgets panel is visible');
          
          // Use requestAnimationFrame to defer state updates and prevent reload loops to defer state updates and prevent reload loops
          requestAnimationFrame(() => {
            if (destroyed) return;
            
            // Ensure widgets tab is active (important when editing existing themes)
            // Only update if not already widgets to avoid unnecessary re-renders
            if (activeSidebarSection !== 'widgets') {
              setActiveSidebarSection('widgets');
            }
            
            // Force blocks panel visibility and render blocks
            const ensureWidgetsVisible = () => {
              if (destroyed) return;
              
              const blocksPanel = document.getElementById('blocks-panel');
              const wrapper = document.querySelector('.elementor-blocks-wrapper') as HTMLElement;
              
              if (blocksPanel && editor.BlockManager) {
                // Ensure wrapper is visible
                if (wrapper) {
                  wrapper.style.setProperty('display', 'block', 'important');
                  wrapper.style.setProperty('visibility', 'visible', 'important');
                  wrapper.style.setProperty('opacity', '1', 'important');
                }
                
                // Ensure panel is visible
                blocksPanel.style.setProperty('display', 'block', 'important');
                blocksPanel.style.setProperty('visibility', 'visible', 'important');
                blocksPanel.style.setProperty('opacity', '1', 'important');
                
                // Check if blocks exist
                const existingBlocks = blocksPanel.querySelectorAll('.gjs-block');
                const hasBlocksContainer = !!blocksPanel.querySelector('.gjs-blocks-c');
                
                if (existingBlocks.length === 0 || !hasBlocksContainer) {
                  console.log('No blocks found on editor load, rendering...');
                  blocksPanel.innerHTML = '';
                  editor.BlockManager.render();
                  blocksRenderedRef.current = true;
                  
                  // Ensure blocks are visible after render
                  requestAnimationFrame(() => {
                    if (destroyed) return;
                    const renderedBlocks = blocksPanel.querySelectorAll('.gjs-block');
                    renderedBlocks.forEach((block: any) => {
                      if (block) {
                        block.style.display = 'flex';
                        block.style.visibility = 'visible';
                        block.style.opacity = '1';
                        block.style.pointerEvents = 'auto';
                        block.style.cursor = 'grab';
                      }
                    });
                    
                    // Ensure categories are visible
                    const categories = blocksPanel.querySelectorAll('.gjs-block-category');
                    categories.forEach((cat: any) => {
                      if (cat) {
                        cat.style.display = 'block';
                        cat.style.visibility = 'visible';
                      }
                    });
                    
                    console.log(`✅ Rendered ${renderedBlocks.length} blocks on editor load`);
                  });
                } else {
                  console.log(`✅ Found ${existingBlocks.length} existing blocks on editor load`);
                  blocksRenderedRef.current = true;
                }
              } else if (!blocksPanel && !destroyed) {
                console.warn('blocks-panel not found, retrying...');
                requestAnimationFrame(() => {
                  if (!destroyed) ensureWidgetsVisible();
                });
              }
            };
            
            // Try immediately (only once)
            ensureWidgetsVisible();
          });
        });

        // Keyboard shortcuts for undo/redo
        // Copy/paste functionality - store component HTML/JSON for proper serialization
        const handleCopy = (e?: KeyboardEvent) => {
          try {
            // Prevent default browser copy behavior
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }

            const selected = editor.getSelected();
            if (selected && selected.get('type') !== 'wrapper') {
              // Serialize the component to JSON to preserve full structure
              const componentJson = selected.toJSON();
              
              // Also get the HTML representation
              const componentHtml = editor.getHtml({ component: selected });
              
              // Store both JSON and HTML in window for persistence
              (window as any).__ziplofyCopiedComponent = {
                json: componentJson,
                html: componentHtml,
                component: selected // Keep reference for cloning
              };
              
              console.log('Component copied:', selected.get('tagName'), componentJson);
              
              // Show visual feedback
              const el = selected.getEl?.();
              if (el) {
                el.style.outline = '2px dashed #5e72e4';
                  setTimeout(() => {
                  if (el && el.style) {
                    el.style.outline = '';
                  }
                }, 500);
              }
            } else {
              console.log('No component selected to copy');
            }
          } catch (e) {
            console.error('Error copying component:', e);
          }
        };

        const handlePaste = (e?: KeyboardEvent) => {
          try {
            // Prevent default browser paste behavior
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }

            const copiedData = (window as any).__ziplofyCopiedComponent;
            if (!copiedData) {
              console.log('No component copied');
              return;
            }

            const selected = editor.getSelected();
            // Determine target: if selected component is droppable, use it; otherwise use wrapper
            let target: any = editor.getWrapper();
            
            if (selected && selected.get('type') !== 'wrapper') {
              const isDroppable = selected.get('droppable') || 
                                 selected.getAttributes?.()?.['data-gjs-droppable'] === '*';
              if (isDroppable) {
                target = selected as any;
              } else {
                // If selected component is not droppable, paste into its parent
                try {
                  const parent = (selected as any).parent();
                  if (parent && parent.get && parent.get('type') !== 'wrapper') {
                    target = parent;
                  }
                } catch (e) {
                  // If parent() fails, use wrapper
                  console.warn('Could not get parent, using wrapper:', e);
                }
              }
            }
            
            if (!target) {
              console.log('No target to paste into');
              return;
            }

            // Use the stored component reference to clone, or recreate from JSON/HTML
            let cloned: any = null;
            
            if (copiedData.component) {
              // Clone using the stored component reference (most reliable)
              try {
                cloned = copiedData.component.clone();
              } catch (e) {
                console.warn('Error cloning from component reference:', e);
                // Fallback to HTML parsing
                if (copiedData.html) {
                  try {
                    const tempWrapper = editor.getWrapper();
                    if (tempWrapper) {
                      // Temporarily store current content
                      const currentContent = tempWrapper.get('content');
                      // Set the copied HTML
                      tempWrapper.set('content', copiedData.html);
                      const children = tempWrapper.components();
                      if (children && children.length > 0) {
                        const firstChild = children.at(0);
                        if (firstChild) {
                          cloned = firstChild;
                          // Remove from temp wrapper
                          tempWrapper.components().remove(cloned);
                        }
                      }
                      // Restore original content
                      tempWrapper.set('content', currentContent);
                    }
                  } catch (e2) {
                    console.error('Error parsing HTML:', e2);
                  }
                }
              }
            } else if (copiedData.html) {
              // Parse HTML by temporarily adding to wrapper
              try {
                const tempWrapper = editor.getWrapper();
                if (tempWrapper) {
                  // Temporarily store current content
                  const currentContent = tempWrapper.get('content');
                  // Set the copied HTML
                  tempWrapper.set('content', copiedData.html);
                  const children = tempWrapper.components();
                  if (children && children.length > 0) {
                    const firstChild = children.at(0);
                    if (firstChild) {
                      cloned = firstChild;
                      // Remove from temp wrapper
                      tempWrapper.components().remove(cloned);
                    }
                  }
                  // Restore original content
                  tempWrapper.set('content', currentContent);
                }
              } catch (e) {
                console.error('Error parsing HTML:', e);
              }
            } else if (copiedData.json) {
              // Last resort: try to recreate from JSON using wrapper
              try {
                const tempWrapper = editor.getWrapper();
                if (tempWrapper && copiedData.json && (copiedData.json as any).components) {
                  // Create a temporary component from JSON by setting wrapper content
                  const jsonWrapper = editor.Components.getWrapper();
                  if (jsonWrapper) {
                    const currentContent = jsonWrapper.get('content');
                    // Try to add component from JSON
                    const tempComp = jsonWrapper.components().add(copiedData.json as any);
                    if (tempComp) {
                      cloned = Array.isArray(tempComp) ? tempComp[0] : tempComp;
                      // Remove from temp location
                      if (cloned) {
                        jsonWrapper.components().remove(cloned);
                      }
                    }
                    jsonWrapper.set('content', currentContent);
                  }
                }
              } catch (e) {
                console.error('Error recreating from JSON:', e);
              }
            }

            if (!cloned) {
              console.error('Failed to clone component');
              return;
            }
            
            // Recursively configure cloned component and all nested children
            const configureComponent = (comp: any) => {
              try {
                const compAttrs = comp.getAttributes?.() || {};
                const compTagName = comp.get?.('tagName')?.toLowerCase?.() || '';
                const compType = comp.get('type');
                const compIsDroppable = compAttrs['data-gjs-droppable'] === '*' || 
                                       ['form', 'section', 'div', 'main', 'article', 'header', 'footer', 'nav', 'aside'].includes(compTagName);
                const shouldBeSelectable = compAttrs['data-gjs-selectable'] !== 'false';
                
                // Determine if editable - make all text elements editable
                const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button', 'strong', 'em', 'b', 'i', 'u'];
                const isTextElement = textTags.includes(compTagName);
                const shouldBeEditable = compAttrs['data-gjs-editable'] === 'true' || 
                                       compAttrs['data-gjs-type'] === 'text' || 
                                       compType === 'text' ||
                                       isTextElement;
                
                comp.set({
                  selectable: shouldBeSelectable,
                  hoverable: true,
                  draggable: true,
                  stylable: true,  // Always allow styling
                  droppable: compIsDroppable ? '*' : false,
                  editable: shouldBeEditable,  // Make text elements editable
                  resizable: ['img', 'video', 'iframe', 'canvas'].includes(compTagName)
                }, { silent: true });

                if (shouldBeEditable) {
                  comp.set({ editable: true, type: 'text' }, { silent: true });
                }

                // Ensure component has CSS class for style rules
                if (editor.CssComposer) {
                  const compId = comp.cid || comp.getId?.();
                  if (compId) {
                    const compClasses = comp.getClasses();
                    let compClass = compClasses.find((c: string) => c && !c.startsWith('gjs-'));
                    
                    if (!compClass) {
                      compClass = `gjs-comp-${compId}`;
                      comp.addClass(compClass);
                    }
                  }
                }

                // Recursively configure children
                const children = comp.components();
                if (children && children.length > 0) {
                  children.forEach((child: any) => {
                    configureComponent(child);
                  });
                }
              } catch (e) {
                console.warn('Error configuring pasted component:', e);
              }
            };

            // Configure the cloned component
            configureComponent(cloned);

            // Add to target using the proper GrapesJS API
            try {
              if (target.components) {
                target.components().add(cloned);
              } else {
                target.append(cloned);
              }
            } catch (e) {
              // Fallback: use wrapper's append method
              console.warn('Error adding to target, using wrapper:', e);
              const wrapper = editor.getWrapper();
              if (wrapper) {
                wrapper.append(cloned);
              }
            }

            // Select the pasted component
            setTimeout(() => {
              try {
                editor.select(cloned);
              } catch (e) {
                console.warn('Error selecting pasted component:', e);
                    }
                  }, 100);

            console.log('Component pasted successfully');
          } catch (e) {
            console.error('Error pasting component:', e);
          }
        };

        const handleUndoRedoKeyDown = (e: KeyboardEvent) => {
          // Check if we're in an input/textarea to avoid interfering with text editing
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
          }

          // Ctrl+C or Cmd+C for copy
          if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey) {
            handleCopy(e);
            return;
          }

          // Ctrl+V or Cmd+V for paste
          if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !e.shiftKey) {
            handlePaste(e);
            return;
          }

          // Ctrl+Z or Cmd+Z for undo
          if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (canUndo && editor.UndoManager) {
              editor.UndoManager.undo();
            }
          }
          
          // Ctrl+Shift+Z or Cmd+Shift+Z for redo
          if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
            e.preventDefault();
            if (canRedo && editor.UndoManager) {
              editor.UndoManager.redo();
            }
          }
          
          // Ctrl+Y or Cmd+Y for redo (alternative)
          if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            if (canRedo && editor.UndoManager) {
              editor.UndoManager.redo();
            }
          }
        };

        window.addEventListener('keydown', handleUndoRedoKeyDown);
        registerCleanup(() => {
          window.removeEventListener('keydown', handleUndoRedoKeyDown);
        });

        // Optimized MutationObserver - only watch essential changes
        let stylePanelObserver: MutationObserver | null = null;
        let stylePanelElement: HTMLElement | null = null;
        
        const setupStylePanelObserver = () => {
          stylePanelElement = document.getElementById('style-panel');
          if (!stylePanelElement) return;
          
          // Stop existing observer if any
          if (stylePanelObserver) {
            stylePanelObserver.disconnect();
          }
          
          // Debounce observer callback for performance
          let observerTimeout: ReturnType<typeof setTimeout> | null = null;
          
          stylePanelObserver = new MutationObserver(() => {
            // Debounce observer callbacks
            if (observerTimeout) clearTimeout(observerTimeout);
            observerTimeout = setTimeout(() => {
              if (!stylePanelElement) return;
              
              const computedStyle = window.getComputedStyle(stylePanelElement);
              
              // Only react if panel is actually hidden
              if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                requestAnimationFrame(() => {
                  if (stylePanelElement) {
                    stylePanelElement.style.display = 'block';
                    stylePanelElement.style.visibility = 'visible';
                    stylePanelElement.style.opacity = '1';
                  }
                  
                  const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement;
                  if (rightPanel) {
                    rightPanel.style.display = 'flex';
                    rightPanel.style.visibility = 'visible';
                    rightPanel.style.opacity = '1';
                  }
                });
              }
            }, 50);
          });
          
          // Only observe style attribute changes on the panel itself (not subtree for performance)
          stylePanelObserver.observe(stylePanelElement, {
            attributes: true,
            attributeFilter: ['style'],
            childList: false, // Don't watch child changes - too expensive
            subtree: false // Don't watch subtree - major performance improvement
          });
        };
        
        // Setup observer immediately (no delay)
        requestAnimationFrame(() => {
          if (!destroyed) {
            const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement;
            if (rightPanel) {
              rightPanel.style.display = 'flex';
              rightPanel.style.visibility = 'visible';
              rightPanel.style.opacity = '1';
              rightPanel.style.width = '300px';
              rightPanel.style.flexShrink = '0';
            }
            setupStylePanelObserver();
          }
        });

        // Optimized Style Manager initialization - use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
          if (destroyed || !editor.StyleManager) return;
          
          try {
              // Ensure right panel is visible
            const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement;
            if (rightPanel) {
              rightPanel.style.display = 'flex';
              rightPanel.style.visibility = 'visible';
              rightPanel.style.opacity = '1';
              rightPanel.style.width = '300px';
              rightPanel.style.flexShrink = '0';
            }
              
            // Select wrapper for initial render
            const wrapper = editor.getWrapper();
            if (wrapper) {
              editor.select(wrapper);
              wrapper.set({ stylable: true });
              editor.runCommand('open-sm');
            }
              const stylePanel = document.getElementById('style-panel');
            if (!stylePanel || typeof editor.StyleManager.render !== 'function') return;
            
            // Set basic styles once
                stylePanel.style.display = 'block';
                stylePanel.style.visibility = 'visible';
                stylePanel.style.opacity = '1';
                stylePanel.style.width = '100%';
                stylePanel.style.height = '100%';
                stylePanel.style.minHeight = '300px';
                stylePanel.style.background = '#ffffff';
                
            // Render Style Manager
            // CRITICAL: Only render if style tab is active
            if (activeSidebarSection === 'style') {
                stylePanel.innerHTML = '';
                editor.StyleManager.render();
            }

            // Attach sector toggle handlers (Layout, Typography, etc. collapse like widgets)
            if (!(stylePanel as any)._sectorToggleBound) {
              (stylePanel as any)._sectorToggleBound = true;
              stylePanel.addEventListener('click', (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                // Click on header area (not on inputs inside content) - support both title class and any click in sector excluding content
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
          } catch (e) {
            console.warn('Error initializing Style Manager:', e);
          }
        });

        // Add custom blocks with proper editable attributes
        const bm = editor.BlockManager;
        
        // CRITICAL: Verify BlockManager is available and blocks-panel exists
        if (!bm) {
          console.error('❌ BlockManager is not available!');
        } else {
          console.log('✅ BlockManager is available');
        }
        
        const blocksPanelCheck = document.getElementById('blocks-panel');
        if (!blocksPanelCheck) {
          console.warn('⚠️ blocks-panel not found during block registration, will retry later');
                        } else {
          console.log('✅ blocks-panel exists during block registration');
        }
        
        // Store block count before registration
        const blocksBefore = bm ? (bm.getAll ? bm.getAll().length : 0) : 0;
        console.log(`📦 Blocks before registration: ${blocksBefore}`);
        
        // ========== LAYOUT ELEMENTS ==========
        bm.add('section', {
          label: 'Section',
          category: 'Layout',
          content: '<section style="padding: 60px 20px; min-height: 300px; background: #f9fafb; position: relative;" data-gjs-droppable="*" data-gjs-selectable="true"><div style="max-width: 1200px; margin: 0 auto;">Section Content</div></section>',
        } as any);

        bm.add('container', {
          label: 'Container',
          category: 'Layout',
          content: '<div style="max-width: 1200px; margin: 0 auto; padding: 20px;" data-gjs-droppable="*" data-gjs-selectable="true">Container</div>',
        } as any);

        bm.add('columns-2', {
          label: '2 Columns',
          category: 'Layout',
          content: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 20px;" data-gjs-droppable="*" data-gjs-selectable="true"><div data-gjs-droppable="*" style="min-height: 150px; padding: 20px; background: #fff; border: 1px dashed #e5e7eb;">Column 1</div><div data-gjs-droppable="*" style="min-height: 150px; padding: 20px; background: #fff; border: 1px dashed #e5e7eb;">Column 2</div></div>',
        } as any);

        bm.add('columns-3', {
          label: '3 Columns',
          category: 'Layout',
          content: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; padding: 20px;" data-gjs-droppable="*" data-gjs-selectable="true"><div data-gjs-droppable="*" style="min-height: 150px; padding: 20px; background: #fff; border: 1px dashed #e5e7eb;">Col 1</div><div data-gjs-droppable="*" style="min-height: 150px; padding: 20px; background: #fff; border: 1px dashed #e5e7eb;">Col 2</div><div data-gjs-droppable="*" style="min-height: 150px; padding: 20px; background: #fff; border: 1px dashed #e5e7eb;">Col 3</div></div>',
        } as any);

        bm.add('columns-4', {
          label: '4 Columns',
          category: 'Layout',
          content: '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 20px;" data-gjs-droppable="*" data-gjs-selectable="true"><div data-gjs-droppable="*" style="min-height: 150px; padding: 15px; background: #fff; border: 1px dashed #e5e7eb;">Col 1</div><div data-gjs-droppable="*" style="min-height: 150px; padding: 15px; background: #fff; border: 1px dashed #e5e7eb;">Col 2</div><div data-gjs-droppable="*" style="min-height: 150px; padding: 15px; background: #fff; border: 1px dashed #e5e7eb;">Col 3</div><div data-gjs-droppable="*" style="min-height: 150px; padding: 15px; background: #fff; border: 1px dashed #e5e7eb;">Col 4</div></div>',
        } as any);

        bm.add('row', {
          label: 'Row',
          category: 'Layout',
          content: '<div style="display: flex; gap: 20px; padding: 20px; flex-wrap: wrap;" data-gjs-droppable="*" data-gjs-selectable="true"><div data-gjs-droppable="*" style="flex: 1; min-width: 200px; min-height: 150px; padding: 20px; background: #fff; border: 1px dashed #e5e7eb;">Row Item</div></div>',
        } as any);

        bm.add('divider', {
          label: 'Divider',
          category: 'Layout',
          content: '<div style="padding: 40px 20px; text-align: center;" data-gjs-selectable="true"><hr style="border: none; border-top: 2px solid #e5e7eb; margin: 0;" /></div>',
        } as any);

        bm.add('spacer', {
          label: 'Spacer',
          category: 'Layout',
          content: '<div style="height: 50px; width: 100%;" data-gjs-selectable="true"></div>',
        } as any);

        bm.add('navbar', {
          label: 'Navbar',
          category: 'Layout',
          content: '<nav style="background: #ffffff; padding: 16px 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;"><div style="display: flex; align-items: center; gap: 12px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 40px; height: 40px; background: #5e72e4; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;" data-gjs-type="text" data-gjs-editable="true">L</div><span style="font-size: 20px; font-weight: 700; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Logo</span></div><ul style="display: flex; list-style: none; gap: 32px; margin: 0; padding: 0; align-items: center; flex-wrap: wrap;" data-gjs-selectable="true" data-gjs-droppable="*"><li style="margin: 0;" data-gjs-selectable="true"><a href="#" style="color: #495157; text-decoration: none; font-size: 16px; font-weight: 500; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Home</a></li><li style="margin: 0;" data-gjs-selectable="true"><a href="#" style="color: #495157; text-decoration: none; font-size: 16px; font-weight: 500; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">About</a></li><li style="margin: 0;" data-gjs-selectable="true"><a href="#" style="color: #495157; text-decoration: none; font-size: 16px; font-weight: 500; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Services</a></li><li style="margin: 0;" data-gjs-selectable="true"><a href="#" style="color: #495157; text-decoration: none; font-size: 16px; font-weight: 500; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Contact</a></li></ul><div style="display: flex; align-items: center; gap: 14px;" data-gjs-selectable="true" data-gjs-droppable="*"><button style="padding: 14px 28px; background: transparent; color: #5e72e4; border: 2px solid #5e72e4; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.3s;" data-gjs-type="text" data-gjs-editable="true">Login</button><button style="padding: 14px 28px; background: #5e72e4; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.3s;" data-gjs-type="text" data-gjs-editable="true">Sign Up</button></div></div></nav>',
        } as any);

        // ========== TEXT ELEMENTS ==========
        bm.add('heading-1', {
          label: 'Heading 1',
          category: 'Basic',
          content: '<h1 style="font-size: 48px; font-weight: 700; margin: 20px 0; line-height: 1.2; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true" data-gjs-selectable="true">Heading</h1>',
        } as any);

        bm.add('heading-2', {
          label: 'Heading 2',
          category: 'Basic',
          content: '<h2 style="font-size: 36px; font-weight: 600; margin: 20px 0; line-height: 1.3; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true" data-gjs-selectable="true">Sub Heading</h2>',
        } as any);

        bm.add('heading-3', {
          label: 'Heading 3',
          category: 'Basic',
          content: '<h3 style="font-size: 28px; font-weight: 600; margin: 20px 0; line-height: 1.4; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true" data-gjs-selectable="true">Heading 3</h3>',
        } as any);

        bm.add('heading-4', {
          label: 'Heading 4',
          category: 'Basic',
          content: '<h4 style="font-size: 24px; font-weight: 600; margin: 20px 0; line-height: 1.4; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true" data-gjs-selectable="true">Heading 4</h4>',
        } as any);

        bm.add('paragraph', {
          label: 'Text Editor',
          category: 'Basic',
          content: '<p style="font-size: 16px; line-height: 1.8; margin: 20px 0; color: #495157;" data-gjs-type="text" data-gjs-editable="true" data-gjs-selectable="true">Add your text here. You can edit this text and change how it looks.</p>',
        } as any);

        bm.add('text-block', {
          label: 'Text Block',
          category: 'Basic',
          content: '<div style="padding: 30px; background: #fff;" data-gjs-selectable="true" data-gjs-droppable="*"><p style="font-size: 16px; line-height: 1.8; color: #495157; margin: 0;" data-gjs-type="text" data-gjs-editable="true">Text content</p></div>',
        } as any);

        bm.add('quote', {
          label: 'Quote',
          category: 'Basic',
          content: '<blockquote style="padding: 30px; margin: 30px 0; border-left: 4px solid #5e72e4; background: #f9fafb; font-style: italic; font-size: 18px; line-height: 1.6; color: #495157;" data-gjs-type="text" data-gjs-editable="true" data-gjs-selectable="true">Your quote text here</blockquote>',
        } as any);

        bm.add('list', {
          label: 'List',
          category: 'Basic',
          content: '<ul style="padding: 20px 20px 20px 40px; margin: 20px 0; list-style: disc; color: #495157; font-size: 16px; line-height: 1.8;" data-gjs-selectable="true" data-gjs-droppable="*"><li style="margin: 10px 0;" data-gjs-type="text" data-gjs-editable="true">List item 1</li><li style="margin: 10px 0;" data-gjs-type="text" data-gjs-editable="true">List item 2</li><li style="margin: 10px 0;" data-gjs-type="text" data-gjs-editable="true">List item 3</li></ul>',
        } as any);

        bm.add('link-block', {
          label: 'Link Block',
          category: 'Basic',
          content: '<div style="padding: 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;" data-gjs-selectable="true" data-gjs-droppable="*"><a href="#" style="color: #5e72e4; text-decoration: none; font-size: 16px; font-weight: 500;" data-gjs-type="text" data-gjs-editable="true">Link Text</a></div>',
        } as any);

        // ========== BUTTON ELEMENTS ==========
        bm.add('button', {
          label: 'Button',
          category: 'Buttons',
          content: '<div style="padding: 20px; text-align: center;" data-gjs-selectable="true"><button style="padding: 14px 32px; background: #5e72e4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.3s;" data-gjs-type="text" data-gjs-editable="true">Click Here</button></div>',
        } as any);

        bm.add('button-outline', {
          label: 'Button Outline',
          category: 'Buttons',
          content: '<div style="padding: 20px; text-align: center;" data-gjs-selectable="true"><button style="padding: 14px 32px; background: transparent; color: #5e72e4; border: 2px solid #5e72e4; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.3s;" data-gjs-type="text" data-gjs-editable="true">Click Here</button></div>',
        } as any);

        bm.add('button-text', {
          label: 'Button Text',
          category: 'Buttons',
          content: '<div style="padding: 20px; text-align: center;" data-gjs-selectable="true"><button style="padding: 14px 32px; background: transparent; color: #5e72e4; border: none; cursor: pointer; font-size: 16px; font-weight: 600; text-decoration: underline;" data-gjs-type="text" data-gjs-editable="true">Click Here</button></div>',
        } as any);

        bm.add('link', {
          label: 'Link',
          category: 'Buttons',
          content: '<div style="padding: 20px;" data-gjs-selectable="true"><a href="#" style="color: #5e72e4; text-decoration: none; font-size: 16px; font-weight: 500; border-bottom: 1px solid #5e72e4;" data-gjs-type="text" data-gjs-editable="true">Link Text</a></div>',
        } as any);
        
        // Page Link component - links to other pages in the theme
        bm.add('page-link', {
          label: 'Page Link',
          category: 'Buttons',
          content: '<div style="padding: 20px;" data-gjs-selectable="true"><a href="#page-page-1" data-page-link="page-1" style="color: #5e72e4; text-decoration: none; font-size: 16px; font-weight: 500; border-bottom: 1px solid #5e72e4;" data-gjs-type="text" data-gjs-editable="true">Link to Page</a></div>',
        } as any);

        // ========== MEDIA ELEMENTS ==========
        bm.add('image', {
          label: 'Image',
          category: 'Media',
          content: '<div style="padding: 20px; text-align: center;" data-gjs-selectable="true"><img src="https://via.placeholder.com/800x600/5e72e4/ffffff?text=Image" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /></div>',
        } as any);

        bm.add('image-gallery', {
          label: 'Image Gallery',
          category: 'Media',
          content: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 20px;" data-gjs-selectable="true" data-gjs-droppable="*"><div data-gjs-selectable="true"><img src="https://via.placeholder.com/300x300/5e72e4/ffffff?text=1" alt="Gallery Image" style="width: 100%; height: auto; border-radius: 8px;" /></div><div data-gjs-selectable="true"><img src="https://via.placeholder.com/300x300/5e72e4/ffffff?text=2" alt="Gallery Image" style="width: 100%; height: auto; border-radius: 8px;" /></div><div data-gjs-selectable="true"><img src="https://via.placeholder.com/300x300/5e72e4/ffffff?text=3" alt="Gallery Image" style="width: 100%; height: auto; border-radius: 8px;" /></div></div>',
        } as any);

        bm.add('video', {
          label: 'Video',
          category: 'Media',
          content: '<div style="padding: 20px; text-align: center; background: #000; border-radius: 8px;" data-gjs-selectable="true"><div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>',
        } as any);

        bm.add('icon', {
          label: 'Icon',
          category: 'Media',
          content: '<div style="padding: 30px; text-align: center;" data-gjs-selectable="true"><div style="width: 64px; height: 64px; margin: 0 auto; background: #5e72e4; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">★</div></div>',
        } as any);

        bm.add('google-maps', {
          label: 'Google Maps',
          category: 'Media',
          content: '<div style="padding: 20px; text-align: center;" data-gjs-selectable="true"><div style="width: 100%; height: 400px; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">Google Maps Embed</div></div>',
        } as any);

        // Form blocks - enhanced with multiple fields
        bm.add('form', {
          label: 'Contact Form',
          category: 'Forms',
          content: '<form style="padding: 20px; max-width: 500px; background: #fff; border-radius: 8px;" data-gjs-selectable="true" data-gjs-droppable="*"><input type="text" placeholder="Name" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" /><input type="email" placeholder="Email" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" /><input type="tel" placeholder="Phone" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" /><textarea placeholder="Message" rows="4" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; resize: vertical;" data-gjs-selectable="true"></textarea><button type="submit" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; width: 100%; margin-top: 10px;" data-gjs-selectable="true">Submit</button></form>',
        } as any);

        // Simple form with fewer fields
        bm.add('form-simple', {
          label: 'Simple Form',
          category: 'Forms',
          content: '<form style="padding: 20px; max-width: 500px; background: #fff; border-radius: 8px;" data-gjs-selectable="true" data-gjs-droppable="*"><input type="text" placeholder="Name" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" /><input type="email" placeholder="Email" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" /><button type="submit" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; width: 100%; margin-top: 10px;" data-gjs-selectable="true">Submit</button></form>',
        } as any);

        // Individual form field blocks - drag these into forms to add more fields
        bm.add('input-text', {
          label: 'Text Input',
          category: 'Forms',
          content: '<input type="text" placeholder="Enter text" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" data-gjs-draggable="*" />',
        } as any);

        bm.add('input-email', {
          label: 'Email Input',
          category: 'Forms',
          content: '<input type="email" placeholder="Enter email" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" data-gjs-draggable="*" />',
        } as any);

        bm.add('input-phone', {
          label: 'Phone Input',
          category: 'Forms',
          content: '<input type="tel" placeholder="Enter phone" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" data-gjs-draggable="*" />',
        } as any);

        bm.add('textarea-field', {
          label: 'Textarea',
          category: 'Forms',
          content: '<textarea placeholder="Enter message" rows="4" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; resize: vertical;" data-gjs-selectable="true" data-gjs-draggable="*"></textarea>',
        } as any);

        bm.add('form-button', {
          label: 'Submit Button',
          category: 'Forms',
          content: '<button type="submit" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;" data-gjs-selectable="true" data-gjs-draggable="*">Submit</button>',
        } as any);

        bm.add('input-number', {
          label: 'Number Input',
          category: 'Forms',
          content: '<input type="number" placeholder="Enter number" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" data-gjs-draggable="*" />',
        } as any);

        bm.add('input-password', {
          label: 'Password Input',
          category: 'Forms',
          content: '<input type="password" placeholder="Enter password" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" data-gjs-draggable="*" />',
        } as any);

        bm.add('input-date', {
          label: 'Date Input',
          category: 'Forms',
          content: '<input type="date" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" data-gjs-draggable="*" />',
        } as any);

        bm.add('select-dropdown', {
          label: 'Select Dropdown',
          category: 'Forms',
          content: '<select style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;" data-gjs-selectable="true" data-gjs-draggable="*"><option>Option 1</option><option>Option 2</option></select>',
        } as any);

        bm.add('checkbox', {
          label: 'Checkbox',
          category: 'Forms',
          content: '<label style="display: flex; align-items: center; gap: 8px; margin: 10px 0;"><input type="checkbox" style="width: 18px; height: 18px;" data-gjs-selectable="true" data-gjs-draggable="*" /><span>Checkbox label</span></label>',
        } as any);

        bm.add('radio', {
          label: 'Radio Button',
          category: 'Forms',
          content: '<label style="display: flex; align-items: center; gap: 8px; margin: 10px 0;"><input type="radio" name="radio-group" style="width: 18px; height: 18px;" data-gjs-selectable="true" data-gjs-draggable="*" /><span>Radio option</span></label>',
        } as any);

        // ========== ADVANCED ELEMENTS ==========
        bm.add('tabs', {
          label: 'Tabs',
          category: 'Advanced',
          content: '<div style="padding: 20px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px;"><button style="padding: 12px 24px; background: transparent; border: none; border-bottom: 2px solid #5e72e4; color: #5e72e4; font-weight: 600; cursor: pointer;" data-gjs-type="text" data-gjs-editable="true">Tab 1</button><button style="padding: 12px 24px; background: transparent; border: none; color: #6b7280; cursor: pointer;" data-gjs-type="text" data-gjs-editable="true">Tab 2</button><button style="padding: 12px 24px; background: transparent; border: none; color: #6b7280; cursor: pointer;" data-gjs-type="text" data-gjs-editable="true">Tab 3</button></div><div style="padding: 20px; min-height: 200px; background: #f9fafb; border-radius: 8px;" data-gjs-droppable="*">Tab content goes here</div></div>',
        } as any);

        bm.add('accordion', {
          label: 'Accordion',
          category: 'Advanced',
          content: '<div style="padding: 20px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; overflow: hidden;"><div style="padding: 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; cursor: pointer; font-weight: 600; display: flex; justify-content: space-between; align-items: center;"><span data-gjs-type="text" data-gjs-editable="true">Accordion Item 1</span><span>▼</span></div><div style="padding: 16px; background: #fff;" data-gjs-droppable="*">Content for accordion item 1</div></div><div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; overflow: hidden;"><div style="padding: 16px; background: #f9fafb; cursor: pointer; font-weight: 600; display: flex; justify-content: space-between; align-items: center;"><span data-gjs-type="text" data-gjs-editable="true">Accordion Item 2</span><span>▶</span></div></div></div>',
        } as any);

        bm.add('card', {
          label: 'Card',
          category: 'Advanced',
          content: '<div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="padding: 20px; border-bottom: 1px solid #e5e7eb;"><h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Card Title</h3></div><div style="padding: 20px;"><p style="margin: 0; color: #495157; line-height: 1.6;" data-gjs-type="text" data-gjs-editable="true">Card content goes here. You can add any content inside this card.</p></div></div>',
        } as any);

        bm.add('testimonial', {
          label: 'Testimonial',
          category: 'Advanced',
          content: '<div style="padding: 40px; background: #f9fafb; border-radius: 12px; text-align: center; max-width: 600px; margin: 0 auto;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="font-size: 24px; color: #5e72e4; margin-bottom: 20px;">"</div><p style="font-size: 18px; font-style: italic; color: #495157; line-height: 1.8; margin-bottom: 20px;" data-gjs-type="text" data-gjs-editable="true">This is a testimonial. You can edit this text to add your own testimonial content.</p><div style="margin-top: 20px;"><div style="width: 60px; height: 60px; border-radius: 50%; background: #5e72e4; margin: 0 auto 10px;"></div><div style="font-weight: 600; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Customer Name</div><div style="font-size: 14px; color: #6b7280;" data-gjs-type="text" data-gjs-editable="true">Company Name</div></div></div>',
        } as any);

        bm.add('pricing-table', {
          label: 'Pricing Table',
          category: 'Advanced',
          content: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; padding: 40px 20px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center; background: #fff;" data-gjs-droppable="*" data-gjs-selectable="true"><h3 style="font-size: 24px; margin-bottom: 10px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Basic</h3><div style="font-size: 48px; font-weight: 700; color: #5e72e4; margin: 20px 0;"><span data-gjs-type="text" data-gjs-editable="true">₹2,499</span></div><ul style="list-style: none; padding: 0; margin: 20px 0; text-align: left;"><li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;" data-gjs-type="text" data-gjs-editable="true">Feature 1</li><li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;" data-gjs-type="text" data-gjs-editable="true">Feature 2</li><li style="padding: 10px 0;" data-gjs-type="text" data-gjs-editable="true">Feature 3</li></ul><button style="width: 100%; padding: 14px; background: #5e72e4; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; margin-top: 20px;" data-gjs-type="text" data-gjs-editable="true">Get Started</button></div></div>',
        } as any);

        // ========== BOILERPLATE WIDGETS ==========
        
        // Footer Widget
        bm.add('footer', {
          label: 'Footer',
          category: 'Layout',
          content: '<footer style="background: #1e1e1e; color: #ffffff; padding: 60px 40px 20px; margin-top: 80px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 1200px; margin: 0 auto;"><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; margin-bottom: 40px; flex-wrap: wrap;" data-gjs-selectable="true" data-gjs-droppable="*"><div data-gjs-selectable="true" data-gjs-droppable="*"><h3 style="font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #ffffff;" data-gjs-type="text" data-gjs-editable="true">Company</h3><ul style="list-style: none; padding: 0; margin: 0;"><li style="margin-bottom: 12px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">About Us</a></li><li style="margin-bottom: 12px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Careers</a></li><li style="margin-bottom: 12px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Contact</a></li></ul></div><div data-gjs-selectable="true" data-gjs-droppable="*"><h3 style="font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #ffffff;" data-gjs-type="text" data-gjs-editable="true">Products</h3><ul style="list-style: none; padding: 0; margin: 0;"><li style="margin-bottom: 12px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Features</a></li><li style="margin-bottom: 12px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Pricing</a></li><li style="margin-bottom: 12px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">FAQ</a></li></ul></div><div data-gjs-selectable="true" data-gjs-droppable="*"><h3 style="font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #ffffff;" data-gjs-type="text" data-gjs-editable="true">Legal</h3><ul style="list-style: none; padding: 0; margin: 0;"><li style="margin-bottom: 12px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Privacy</a></li><li style="margin-bottom: 12px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Terms</a></li><li style="margin-bottom: 12px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Cookies</a></li></ul></div><div data-gjs-selectable="true" data-gjs-droppable="*"><h3 style="font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #ffffff;" data-gjs-type="text" data-gjs-editable="true">Follow Us</h3><div style="display: flex; gap: 12px; margin-top: 20px;"><a href="#" style="width: 40px; height: 40px; background: #374151; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; text-decoration: none; transition: background 0.3s;" data-gjs-type="text" data-gjs-editable="true">f</a><a href="#" style="width: 40px; height: 40px; background: #374151; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; text-decoration: none; transition: background 0.3s;" data-gjs-type="text" data-gjs-editable="true">t</a><a href="#" style="width: 40px; height: 40px; background: #374151; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; text-decoration: none; transition: background 0.3s;" data-gjs-type="text" data-gjs-editable="true">in</a></div></div></div><div style="border-top: 1px solid #374151; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 14px;" data-gjs-selectable="true" data-gjs-droppable="*"><p style="margin: 0;" data-gjs-type="text" data-gjs-editable="true">© 2024 Your Company. All rights reserved.</p></div></div></footer>',
        } as any);

        // Hero Section Widget
        bm.add('hero-section', {
          label: 'Hero Section',
          category: 'Layout',
          content: '<section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 100px 40px; text-align: center; color: #ffffff;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 800px; margin: 0 auto;"><h1 style="font-size: 56px; font-weight: 800; margin-bottom: 24px; line-height: 1.2;" data-gjs-type="text" data-gjs-editable="true">Welcome to Our Platform</h1><p style="font-size: 20px; margin-bottom: 40px; line-height: 1.6; opacity: 0.9;" data-gjs-type="text" data-gjs-editable="true">Build amazing experiences with our powerful tools and features</p><div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;" data-gjs-selectable="true" data-gjs-droppable="*"><button style="padding: 16px 32px; background: #ffffff; color: #667eea; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.3s;" data-gjs-type="text" data-gjs-editable="true">Get Started</button><button style="padding: 16px 32px; background: transparent; color: #ffffff; border: 2px solid #ffffff; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.3s;" data-gjs-type="text" data-gjs-editable="true">Learn More</button></div></div></section>',
        } as any);

        // Feature Section Widget
        bm.add('feature-section', {
          label: 'Feature Section',
          category: 'Layout',
          content: '<section style="padding: 80px 40px; background: #f9fafb;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; font-weight: 700; margin-bottom: 16px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Our Features</h2><p style="text-align: center; font-size: 18px; color: #6b7280; margin-bottom: 60px; max-width: 600px; margin-left: auto; margin-right: auto;" data-gjs-type="text" data-gjs-editable="true">Everything you need to build amazing websites</p><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="text-align: center; padding: 40px 20px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 64px; height: 64px; background: #5e72e4; border-radius: 12px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">⚡</div><h3 style="font-size: 24px; font-weight: 600; margin-bottom: 12px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Fast Performance</h3><p style="color: #6b7280; line-height: 1.6;" data-gjs-type="text" data-gjs-editable="true">Lightning-fast loading times for better user experience</p></div><div style="text-align: center; padding: 40px 20px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 64px; height: 64px; background: #10b981; border-radius: 12px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">🔒</div><h3 style="font-size: 24px; font-weight: 600; margin-bottom: 12px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Secure</h3><p style="color: #6b7280; line-height: 1.6;" data-gjs-type="text" data-gjs-editable="true">Enterprise-grade security to protect your data</p></div><div style="text-align: center; padding: 40px 20px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 64px; height: 64px; background: #f59e0b; border-radius: 12px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">📱</div><h3 style="font-size: 24px; font-weight: 600; margin-bottom: 12px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Responsive</h3><p style="color: #6b7280; line-height: 1.6;" data-gjs-type="text" data-gjs-editable="true">Works perfectly on all devices and screen sizes</p></div></div></div></section>',
        } as any);

        // Team Section Widget
        bm.add('team-section', {
          label: 'Team Section',
          category: 'Advanced',
          content: '<section style="padding: 80px 40px; background: #ffffff;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; font-weight: 700; margin-bottom: 16px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Our Team</h2><p style="text-align: center; font-size: 18px; color: #6b7280; margin-bottom: 60px;" data-gjs-type="text" data-gjs-editable="true">Meet the talented people behind our success</p><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="text-align: center;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 200px; height: 200px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 64px; font-weight: 700;">JD</div><h3 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">John Doe</h3><p style="color: #6b7280; margin-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">CEO & Founder</p><div style="display: flex; gap: 12px; justify-content: center;"><a href="#" style="color: #6b7280; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">in</a><a href="#" style="color: #6b7280; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">@</a></div></div><div style="text-align: center;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 200px; height: 200px; border-radius: 50%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 64px; font-weight: 700;">JS</div><h3 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Jane Smith</h3><p style="color: #6b7280; margin-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">CTO</p><div style="display: flex; gap: 12px; justify-content: center;"><a href="#" style="color: #6b7280; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">in</a><a href="#" style="color: #6b7280; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">@</a></div></div><div style="text-align: center;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 200px; height: 200px; border-radius: 50%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 64px; font-weight: 700;">MJ</div><h3 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Mike Johnson</h3><p style="color: #6b7280; margin-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">Designer</p><div style="display: flex; gap: 12px; justify-content: center;"><a href="#" style="color: #6b7280; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">in</a><a href="#" style="color: #6b7280; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">@</a></div></div><div style="text-align: center;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 200px; height: 200px; border-radius: 50%; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 64px; font-weight: 700;">SW</div><h3 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Sarah Williams</h3><p style="color: #6b7280; margin-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">Developer</p><div style="display: flex; gap: 12px; justify-content: center;"><a href="#" style="color: #6b7280; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">in</a><a href="#" style="color: #6b7280; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">@</a></div></div></div></div></section>',
        } as any);

        // FAQ Section Widget
        bm.add('faq-section', {
          label: 'FAQ Section',
          category: 'Advanced',
          content: '<section style="padding: 80px 40px; background: #f9fafb;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 800px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; font-weight: 700; margin-bottom: 16px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Frequently Asked Questions</h2><p style="text-align: center; font-size: 18px; color: #6b7280; margin-bottom: 60px;" data-gjs-type="text" data-gjs-editable="true">Everything you need to know</p><div style="display: flex; flex-direction: column; gap: 16px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"><h3 style="font-size: 18px; font-weight: 600; color: #1e1e1e; margin: 0;" data-gjs-type="text" data-gjs-editable="true">What is your return policy?</h3><span style="font-size: 24px; color: #6b7280;">+</span></div><p style="margin-top: 16px; color: #6b7280; line-height: 1.6; display: none;" data-gjs-type="text" data-gjs-editable="true">We offer a 30-day money-back guarantee on all our products.</p></div><div style="background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"><h3 style="font-size: 18px; font-weight: 600; color: #1e1e1e; margin: 0;" data-gjs-type="text" data-gjs-editable="true">How do I cancel my subscription?</h3><span style="font-size: 24px; color: #6b7280;">+</span></div><p style="margin-top: 16px; color: #6b7280; line-height: 1.6; display: none;" data-gjs-type="text" data-gjs-editable="true">You can cancel your subscription anytime from your account settings.</p></div><div style="background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"><h3 style="font-size: 18px; font-weight: 600; color: #1e1e1e; margin: 0;" data-gjs-type="text" data-gjs-editable="true">Do you offer customer support?</h3><span style="font-size: 24px; color: #6b7280;">+</span></div><p style="margin-top: 16px; color: #6b7280; line-height: 1.6; display: none;" data-gjs-type="text" data-gjs-editable="true">Yes, we offer 24/7 customer support via email and live chat.</p></div></div></div></section>',
        } as any);

        // Blog Post Card Widget
        bm.add('blog-card', {
          label: 'Blog Post Card',
          category: 'Advanced',
          content: '<div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative;" data-gjs-selectable="true"><div style="position: absolute; top: 16px; left: 16px; background: rgba(255,255,255,0.9); padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Category</div></div><div style="padding: 24px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 14px; color: #6b7280;"><span data-gjs-type="text" data-gjs-editable="true">Jan 15, 2024</span><span>•</span><span data-gjs-type="text" data-gjs-editable="true">5 min read</span></div><h3 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #1e1e1e; line-height: 1.3;" data-gjs-type="text" data-gjs-editable="true">Blog Post Title</h3><p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;" data-gjs-type="text" data-gjs-editable="true">This is a preview of the blog post content. You can edit this text to add your own content.</p><a href="#" style="color: #5e72e4; text-decoration: none; font-weight: 600; font-size: 14px;" data-gjs-type="text" data-gjs-editable="true">Read More →</a></div></div>',
        } as any);

        // Product Card Widget with quantity prompt
        const productCardContent = '<div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 100%; height: 250px; background: #f3f4f6; position: relative; display: flex; align-items: center; justify-content: center;" data-gjs-selectable="true"><div style="width: 150px; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;"></div><div style="position: absolute; top: 12px; right: 12px; background: #ffffff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;">♡</div></div><div style="padding: 20px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;" data-gjs-type="text" data-gjs-editable="true">New</span><span style="color: #6b7280; font-size: 14px;" data-gjs-type="text" data-gjs-editable="true">In Stock</span></div><h3 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Product Name</h3><p style="color: #6b7280; font-size: 14px; margin-bottom: 16px; line-height: 1.5;" data-gjs-type="text" data-gjs-editable="true">Product description goes here</p><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;"><div><span style="font-size: 24px; font-weight: 700; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">₹8,299</span><span style="font-size: 16px; color: #9ca3af; text-decoration: line-through; margin-left: 8px;" data-gjs-type="text" data-gjs-editable="true">₹12,499</span></div><div style="color: #f59e0b; font-size: 14px;">★★★★★</div></div><button style="width: 100%; padding: 12px; background: #5e72e4; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;" data-gjs-type="text" data-gjs-editable="true">Add to Cart</button></div></div>';
        
        bm.add('product-card', {
          label: 'Product Card',
          category: 'Advanced',
          content: productCardContent,
          activate: true, // Enable custom activation
        } as any);

        // Listen for product card block drag stop - intercept and add multiple cards
        editor.on('block:drag:stop', (block: any) => {
          if (block && block.get && block.get('id') === 'product-card') {
            // Wait a bit for the default block to be added, then remove it
            setTimeout(() => {
              const selected = editor.getSelected();
              let lastAddedCard: any = null;
              
              // Find the last added component (should be the product card that was just added)
              const wrapper = editor.getWrapper();
              if (wrapper) {
                const allComponents = wrapper.components();
                if (allComponents && allComponents.length > 0) {
                  lastAddedCard = allComponents.at(-1);
                }
              }
              
              // Prompt for quantity
              const quantityStr = prompt('How many product cards would you like to add?', '1');
              if (!quantityStr) {
                // User cancelled - remove the single card that was added
                if (lastAddedCard) {
                  lastAddedCard.remove();
                }
                return;
              }
              
              const quantity = parseInt(quantityStr, 10);
              if (isNaN(quantity) || quantity < 1) {
                alert('Please enter a valid number greater than 0');
                // Remove the single card that was added
                if (lastAddedCard) {
                  lastAddedCard.remove();
                }
                return;
              }
              
              if (quantity > 50) {
                const confirm = window.confirm(`You're about to add ${quantity} product cards. This might slow down the editor. Continue?`);
                if (!confirm) {
                  // Remove the single card that was added
                  if (lastAddedCard) {
                    lastAddedCard.remove();
                  }
                  return;
                }
              }
              
              // Get the target (where the card was dropped)
              const wrapperTarget = editor.getWrapper();
              const selectedTarget = editor.getSelected();
              let target: any = wrapperTarget;
              
              // If a component is selected and it's droppable, use it as target
              if (selectedTarget && selectedTarget.get && selectedTarget.get('type') !== 'wrapper') {
                const isDroppable = selectedTarget.get('droppable') || 
                                   selectedTarget.getAttributes?.()?.['data-gjs-droppable'] === '*';
                if (isDroppable) {
                  target = selectedTarget;
                } else {
                  // Use the parent of the selected component if it's droppable
                  try {
                    const parent = (selectedTarget as any).parent();
                    if (parent && parent.get && parent.get('type') !== 'wrapper') {
                      const parentDroppable = parent.get('droppable') || 
                                             parent.getAttributes?.()?.['data-gjs-droppable'] === '*';
                      if (parentDroppable) {
                        target = parent;
                      }
                    }
                  } catch (e) {
                    // Use wrapper as fallback
                  }
                }
              }
              
              // Remove the single card that was automatically added
              if (lastAddedCard && lastAddedCard.remove) {
                lastAddedCard.remove();
              }
              
              // Create a container div with grid layout for multiple cards
              const containerHtml = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; padding: 20px;" data-gjs-droppable="*" data-gjs-selectable="true"></div>`;
              const containerResult = target.components().add(containerHtml);
              const container = Array.isArray(containerResult) ? containerResult[0] : containerResult;
              
              if (!container || typeof container.set !== 'function') {
                console.error('Failed to create container');
                return;
              }
              
              // Configure container
              container.set({
                selectable: true,
                hoverable: true,
                draggable: true,
                stylable: true,
                droppable: '*'
              }, { silent: true });
              
              // Add multiple product cards to the container
              for (let i = 0; i < quantity; i++) {
                const cardResult = container.components().add(productCardContent);
                const cardComponent = Array.isArray(cardResult) ? cardResult[0] : cardResult;
                
                // Configure each card component
                if (cardComponent && typeof cardComponent.set === 'function') {
                  cardComponent.set({
                    selectable: true,
                    hoverable: true,
                    draggable: true,
                    stylable: true,
                    droppable: false
                  }, { silent: true });
                  
                  // Ensure CSS class for styling
                  if (editor.CssComposer && cardComponent.cid) {
                    const cardClasses = cardComponent.getClasses ? cardComponent.getClasses() : [];
                    let cardClass = cardClasses.find((c: string) => c && !c.startsWith('gjs-'));
                    if (!cardClass && cardComponent.addClass) {
                      cardClass = `gjs-comp-${cardComponent.cid}`;
                      cardComponent.addClass(cardClass);
                    }
                  }
                }
              }
              
              // Select the container after adding cards
              editor.select(container);
              
              // Show success message
              console.log(`✅ Added ${quantity} product card${quantity > 1 ? 's' : ''} to the page`);
            }, 100);
          }
        });

        // Stats Section Widget
        bm.add('stats-section', {
          label: 'Stats Section',
          category: 'Advanced',
          content: '<section style="padding: 80px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 1200px; margin: 0 auto;"><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center;" data-gjs-selectable="true" data-gjs-droppable="*"><div data-gjs-selectable="true" data-gjs-droppable="*"><div style="font-size: 56px; font-weight: 800; margin-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">10K+</div><div style="font-size: 18px; opacity: 0.9;" data-gjs-type="text" data-gjs-editable="true">Active Users</div></div><div data-gjs-selectable="true" data-gjs-droppable="*"><div style="font-size: 56px; font-weight: 800; margin-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">500+</div><div style="font-size: 18px; opacity: 0.9;" data-gjs-type="text" data-gjs-editable="true">Projects</div></div><div data-gjs-selectable="true" data-gjs-droppable="*"><div style="font-size: 56px; font-weight: 800; margin-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">98%</div><div style="font-size: 18px; opacity: 0.9;" data-gjs-type="text" data-gjs-editable="true">Satisfaction</div></div><div data-gjs-selectable="true" data-gjs-droppable="*"><div style="font-size: 56px; font-weight: 800; margin-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">24/7</div><div style="font-size: 18px; opacity: 0.9;" data-gjs-type="text" data-gjs-editable="true">Support</div></div></div></div></section>',
        } as any);

        // Call to Action (CTA) Widget
        bm.add('cta-section', {
          label: 'Call to Action',
          category: 'Layout',
          content: '<section style="padding: 80px 40px; background: #5e72e4; color: #ffffff; text-align: center;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 800px; margin: 0 auto;"><h2 style="font-size: 42px; font-weight: 700; margin-bottom: 20px; line-height: 1.2;" data-gjs-type="text" data-gjs-editable="true">Ready to Get Started?</h2><p style="font-size: 20px; margin-bottom: 40px; opacity: 0.9; line-height: 1.6;" data-gjs-type="text" data-gjs-editable="true">Join thousands of satisfied customers and start building today</p><div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;" data-gjs-selectable="true" data-gjs-droppable="*"><button style="padding: 16px 40px; background: #ffffff; color: #5e72e4; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; transition: transform 0.3s;" data-gjs-type="text" data-gjs-editable="true">Start Free Trial</button><button style="padding: 16px 40px; background: transparent; color: #ffffff; border: 2px solid #ffffff; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; transition: transform 0.3s;" data-gjs-type="text" data-gjs-editable="true">Contact Sales</button></div></div></section>',
        } as any);

        // Social Media Links Widget
        bm.add('social-links', {
          label: 'Social Media Links',
          category: 'Basic',
          content: '<div style="padding: 30px; text-align: center;" data-gjs-selectable="true" data-gjs-droppable="*"><h3 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Follow Us</h3><div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;" data-gjs-selectable="true" data-gjs-droppable="*"><a href="#" style="width: 50px; height: 50px; background: #1877f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; text-decoration: none; font-size: 24px; font-weight: 700; transition: transform 0.3s;" data-gjs-type="text" data-gjs-editable="true">f</a><a href="#" style="width: 50px; height: 50px; background: #1da1f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; text-decoration: none; font-size: 24px; font-weight: 700; transition: transform 0.3s;" data-gjs-type="text" data-gjs-editable="true">t</a><a href="#" style="width: 50px; height: 50px; background: #0077b5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; text-decoration: none; font-size: 24px; font-weight: 700; transition: transform 0.3s;" data-gjs-type="text" data-gjs-editable="true">in</a><a href="#" style="width: 50px; height: 50px; background: #e4405f; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; text-decoration: none; font-size: 24px; font-weight: 700; transition: transform 0.3s;" data-gjs-type="text" data-gjs-editable="true">ig</a><a href="#" style="width: 50px; height: 50px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; text-decoration: none; font-size: 24px; font-weight: 700; transition: transform 0.3s;" data-gjs-type="text" data-gjs-editable="true">yt</a></div></div>',
        } as any);

        // Breadcrumbs Widget
        bm.add('breadcrumbs', {
          label: 'Breadcrumbs',
          category: 'Basic',
          content: '<nav style="padding: 20px 40px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 1200px; margin: 0 auto;"><div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6b7280;" data-gjs-selectable="true" data-gjs-droppable="*"><a href="#" style="color: #5e72e4; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">Home</a><span>/</span><a href="#" style="color: #5e72e4; text-decoration: none;" data-gjs-type="text" data-gjs-editable="true">Category</a><span>/</span><span style="color: #1e1e1e; font-weight: 500;" data-gjs-type="text" data-gjs-editable="true">Current Page</span></div></div></nav>',
        } as any);

        // Sidebar Widget
        bm.add('sidebar', {
          label: 'Sidebar',
          category: 'Layout',
          content: '<aside style="background: #f9fafb; padding: 30px; border-radius: 12px; min-height: 400px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="margin-bottom: 30px;" data-gjs-selectable="true" data-gjs-droppable="*"><h3 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #1e1e1e; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">Categories</h3><ul style="list-style: none; padding: 0; margin: 0;"><li style="margin-bottom: 12px;"><a href="#" style="color: #6b7280; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Category 1</a></li><li style="margin-bottom: 12px;"><a href="#" style="color: #6b7280; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Category 2</a></li><li style="margin-bottom: 12px;"><a href="#" style="color: #6b7280; text-decoration: none; font-size: 14px; transition: color 0.3s;" data-gjs-type="text" data-gjs-editable="true">Category 3</a></li></ul></div><div style="margin-bottom: 30px;" data-gjs-selectable="true" data-gjs-droppable="*"><h3 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #1e1e1e; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">Recent Posts</h3><div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;"><a href="#" style="color: #1e1e1e; text-decoration: none; font-weight: 600; font-size: 14px; display: block; margin-bottom: 8px;" data-gjs-type="text" data-gjs-editable="true">Recent Post Title</a><span style="color: #6b7280; font-size: 12px;" data-gjs-type="text" data-gjs-editable="true">Jan 15, 2024</span></div><div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;"><a href="#" style="color: #1e1e1e; text-decoration: none; font-weight: 600; font-size: 14px; display: block; margin-bottom: 8px;" data-gjs-type="text" data-gjs-editable="true">Another Post Title</a><span style="color: #6b7280; font-size: 12px;" data-gjs-type="text" data-gjs-editable="true">Jan 10, 2024</span></div></div><div data-gjs-selectable="true" data-gjs-droppable="*"><h3 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #1e1e1e; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;" data-gjs-type="text" data-gjs-editable="true">Tags</h3><div style="display: flex; flex-wrap: wrap; gap: 8px;"><span style="background: #e5e7eb; color: #1e1e1e; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;" data-gjs-type="text" data-gjs-editable="true">Tag 1</span><span style="background: #e5e7eb; color: #1e1e1e; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;" data-gjs-type="text" data-gjs-editable="true">Tag 2</span><span style="background: #e5e7eb; color: #1e1e1e; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;" data-gjs-type="text" data-gjs-editable="true">Tag 3</span></div></div></aside>',
        } as any);

        // ========== ADVANCED MODERN WIDGETS ==========
        
        // Progress Bar Widget
        bm.add('progress-bar', {
          label: 'Progress Bar',
          category: 'Advanced',
          content: '<div class="ziplofy-progress-bar" style="padding: 30px; background: #ffffff; border-radius: 12px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="margin-bottom: 20px;"><div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span class="progress-label" style="font-size: 14px; font-weight: 600; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Skill Name</span><span class="progress-percentage" style="font-size: 14px; font-weight: 600; color: #5e72e4;" data-gjs-type="text" data-gjs-editable="true">75%</span></div><div class="progress-bar-container" style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;"><div class="progress-bar-fill" style="width: 75%; height: 100%; background: linear-gradient(90deg, #5e72e4 0%, #667eea 100%); border-radius: 6px; transition: width 0.3s ease;"></div></div></div></div>',
        } as any);

        // Counter Widget
        bm.add('counter', {
          label: 'Counter',
          category: 'Advanced',
          content: '<div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; color: #ffffff;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="font-size: 64px; font-weight: 800; margin-bottom: 12px; line-height: 1;" data-gjs-type="text" data-gjs-editable="true">1,234</div><div style="font-size: 20px; font-weight: 500; opacity: 0.9;" data-gjs-type="text" data-gjs-editable="true">Total Users</div></div>',
        } as any);

        // Image Carousel/Slider Widget - horizontal scroll with arrows, responsive
        bm.add('image-carousel', {
          label: 'Image Carousel',
          category: 'Media',
          content: '<div class="ziplofy-image-carousel" style="position:relative;width:100%;max-width:100%;padding:24px;background:linear-gradient(180deg,#fafbfc 0%,#fff 100%);border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.04);" data-gjs-selectable="true" data-gjs-droppable="*"><div class="ziplofy-carousel-track" style="display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;-ms-overflow-style:none;padding:8px 0;" data-gjs-selectable="true" data-gjs-droppable="*"><div class="ziplofy-carousel-slide" style="min-width:min(320px,85vw);max-width:100%;scroll-snap-align:center;flex-shrink:0;aspect-ratio:16/10;overflow:hidden;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.1);" data-gjs-selectable="true"><img src="https://via.placeholder.com/600x375/667eea/ffffff?text=Slide+1" alt="Slide 1" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" /></div><div class="ziplofy-carousel-slide" style="min-width:min(320px,85vw);max-width:100%;scroll-snap-align:center;flex-shrink:0;aspect-ratio:16/10;overflow:hidden;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.1);" data-gjs-selectable="true"><img src="https://via.placeholder.com/600x375/764ba2/ffffff?text=Slide+2" alt="Slide 2" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" /></div><div class="ziplofy-carousel-slide" style="min-width:min(320px,85vw);max-width:100%;scroll-snap-align:center;flex-shrink:0;aspect-ratio:16/10;overflow:hidden;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.1);" data-gjs-selectable="true"><img src="https://via.placeholder.com/600x375/f093fb/ffffff?text=Slide+3" alt="Slide 3" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" /></div></div><div class="ziplofy-carousel-nav" style="display:flex;align-items:center;justify-content:center;gap:12px;margin-top:20px;"><button type="button" class="ziplofy-carousel-prev" aria-label="Previous" style="width:40px;height:40px;border-radius:50%;border:2px solid #e5e7eb;background:#fff;color:#5e72e4;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;">‹</button><div style="display:flex;gap:8px;"><span class="ziplofy-carousel-dot" style="width:10px;height:10px;border-radius:50%;background:#5e72e4;"></span><span class="ziplofy-carousel-dot" style="width:10px;height:10px;border-radius:50%;background:#e5e7eb;"></span><span class="ziplofy-carousel-dot" style="width:10px;height:10px;border-radius:50%;background:#e5e7eb;"></span></div><button type="button" class="ziplofy-carousel-next" aria-label="Next" style="width:40px;height:40px;border-radius:50%;border:2px solid #e5e7eb;background:#fff;color:#5e72e4;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;">›</button></div></div>',
        } as any);

        // Advanced Card with Hover Effect
        bm.add('card-hover', {
          label: 'Card Hover',
          category: 'Advanced',
          content: '<div style="border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; overflow: hidden;" data-gjs-selectable="true"><div style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #ffffff;" data-gjs-type="text" data-gjs-editable="true">Featured</div></div><div style="padding: 24px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;" data-gjs-type="text" data-gjs-editable="true">Category</span><span style="color: #6b7280; font-size: 12px;" data-gjs-type="text" data-gjs-editable="true">Jan 15, 2024</span></div><h3 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #1e1e1e; line-height: 1.3;" data-gjs-type="text" data-gjs-editable="true">Card Title</h3><p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;" data-gjs-type="text" data-gjs-editable="true">This is an advanced card with hover effects. Edit this content to customize.</p><a href="#" style="color: #5e72e4; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px;" data-gjs-type="text" data-gjs-editable="true">Learn More →</a></div></div>',
        } as any);

        // Timeline Widget
        bm.add('timeline', {
          label: 'Timeline',
          category: 'Advanced',
          content: '<div style="padding: 40px; background: #ffffff; position: relative;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="position: relative; padding-left: 40px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #e5e7eb;"></div><div style="position: relative; margin-bottom: 40px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="position: absolute; left: -32px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: #5e72e4; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #5e72e4;"></div><div style="background: #f9fafb; padding: 24px; border-radius: 12px; border-left: 3px solid #5e72e4;"><div style="font-size: 14px; font-weight: 600; color: #5e72e4; margin-bottom: 8px;" data-gjs-type="text" data-gjs-editable="true">2024</div><h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Event Title</h3><p style="color: #6b7280; line-height: 1.6;" data-gjs-type="text" data-gjs-editable="true">Event description goes here. You can edit this text.</p></div></div><div style="position: relative; margin-bottom: 40px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="position: absolute; left: -32px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: #10b981; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #10b981;"></div><div style="background: #f9fafb; padding: 24px; border-radius: 12px; border-left: 3px solid #10b981;"><div style="font-size: 14px; font-weight: 600; color: #10b981; margin-bottom: 8px;" data-gjs-type="text" data-gjs-editable="true">2023</div><h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Another Event</h3><p style="color: #6b7280; line-height: 1.6;" data-gjs-type="text" data-gjs-editable="true">Another event description. Customize as needed.</p></div></div></div></div>',
        } as any);

        // Testimonials Slider Widget
        bm.add('testimonials-slider', {
          label: 'Testimonials Slider',
          category: 'Advanced',
          content: '<section style="padding: 80px 40px; background: #f9fafb;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; font-weight: 700; margin-bottom: 60px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">What Our Clients Say</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="color: #f59e0b; font-size: 20px; margin-bottom: 16px;">★★★★★</div><p style="font-size: 16px; line-height: 1.7; color: #495157; margin-bottom: 24px; font-style: italic;" data-gjs-type="text" data-gjs-editable="true">"Excellent service and amazing results. Highly recommended!"</p><div style="display: flex; align-items: center; gap: 16px;"><div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px;">JD</div><div><div style="font-weight: 600; color: #1e1e1e; margin-bottom: 4px;" data-gjs-type="text" data-gjs-editable="true">John Doe</div><div style="font-size: 14px; color: #6b7280;" data-gjs-type="text" data-gjs-editable="true">CEO, Company</div></div></div></div><div style="background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="color: #f59e0b; font-size: 20px; margin-bottom: 16px;">★★★★★</div><p style="font-size: 16px; line-height: 1.7; color: #495157; margin-bottom: 24px; font-style: italic;" data-gjs-type="text" data-gjs-editable="true">"Outstanding quality and professional team. Very satisfied!"</p><div style="display: flex; align-items: center; gap: 16px;"><div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px;">JS</div><div><div style="font-weight: 600; color: #1e1e1e; margin-bottom: 4px;" data-gjs-type="text" data-gjs-editable="true">Jane Smith</div><div style="font-size: 14px; color: #6b7280;" data-gjs-type="text" data-gjs-editable="true">CTO, Tech Corp</div></div></div></div><div style="background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><div style="color: #f59e0b; font-size: 20px; margin-bottom: 16px;">★★★★★</div><p style="font-size: 16px; line-height: 1.7; color: #495157; margin-bottom: 24px; font-style: italic;" data-gjs-type="text" data-gjs-editable="true">"Best decision we made. Exceeded all expectations!"</p><div style="display: flex; align-items: center; gap: 16px;"><div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px;">MJ</div><div><div style="font-weight: 600; color: #1e1e1e; margin-bottom: 4px;" data-gjs-type="text" data-gjs-editable="true">Mike Johnson</div><div style="font-size: 14px; color: #6b7280;" data-gjs-type="text" data-gjs-editable="true">Founder, Startup</div></div></div></div></div></div></section>',
        } as any);

        // Modal/Popup Widget
        bm.add('modal', {
          label: 'Modal Popup',
          category: 'Advanced',
          content: '<div style="padding: 20px; text-align: center;" data-gjs-selectable="true" data-gjs-droppable="*"><button style="padding: 14px 32px; background: #5e72e4; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;" data-gjs-type="text" data-gjs-editable="true">Open Modal</button><div style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="background: #ffffff; padding: 40px; border-radius: 16px; max-width: 500px; width: 90%; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.3);" data-gjs-selectable="true" data-gjs-droppable="*"><button style="position: absolute; top: 16px; right: 16px; background: transparent; border: none; font-size: 24px; cursor: pointer; color: #6b7280; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.3s;">×</button><h2 style="font-size: 28px; font-weight: 700; margin-bottom: 16px; color: #1e1e1e;" data-gjs-type="text" data-gjs-editable="true">Modal Title</h2><p style="color: #6b7280; line-height: 1.6; margin-bottom: 24px;" data-gjs-type="text" data-gjs-editable="true">This is a modal popup. You can customize the content and styling.</p><button style="padding: 12px 24px; background: #5e72e4; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;" data-gjs-type="text" data-gjs-editable="true">Close</button></div></div></div>',
        } as any);

        // Countdown Timer Widget
        bm.add('countdown-timer', {
          label: 'Countdown Timer',
          category: 'Advanced',
          content: '<div class="ziplofy-countdown-timer" data-countdown-days="30" data-countdown-hours="12" data-countdown-minutes="45" data-countdown-seconds="30" style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; text-align: center; color: #ffffff;" data-gjs-selectable="true" data-gjs-droppable="*"><h2 style="font-size: 32px; font-weight: 700; margin-bottom: 32px;" data-gjs-type="text" data-gjs-editable="true">Limited Time Offer</h2><div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; min-width: 100px;"><div class="countdown-days" style="font-size: 48px; font-weight: 800; line-height: 1;">30</div><div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Days</div></div><div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; min-width: 100px;"><div class="countdown-hours" style="font-size: 48px; font-weight: 800; line-height: 1;">12</div><div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Hours</div></div><div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; min-width: 100px;"><div class="countdown-minutes" style="font-size: 48px; font-weight: 800; line-height: 1;">45</div><div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Minutes</div></div><div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; min-width: 100px;"><div class="countdown-seconds" style="font-size: 48px; font-weight: 800; line-height: 1;">30</div><div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Seconds</div></div></div></div>',
        } as any);

        // Advanced Button with Icon
        bm.add('button-icon', {
          label: 'Button with Icon',
          category: 'Buttons',
          content: '<div style="padding: 20px; text-align: center;" data-gjs-selectable="true" data-gjs-droppable="*"><button style="display: inline-flex; align-items: center; gap: 12px; padding: 14px 32px; background: #5e72e4; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 6px rgba(94,114,228,0.3);" data-gjs-type="text" data-gjs-editable="true"><span style="font-size: 20px;">→</span><span>Get Started</span></button></div>',
        } as any);

        // Video Background Section
        bm.add('video-background', {
          label: 'Video Background',
          category: 'Media',
          content: '<section style="position: relative; height: 500px; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #ffffff;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); z-index: 1;"></div><div style="position: relative; z-index: 2; text-align: center; padding: 40px; max-width: 800px;" data-gjs-selectable="true" data-gjs-droppable="*"><h1 style="font-size: 56px; font-weight: 800; margin-bottom: 24px; line-height: 1.2; text-shadow: 0 2px 10px rgba(0,0,0,0.3);" data-gjs-type="text" data-gjs-editable="true">Video Background Section</h1><p style="font-size: 20px; margin-bottom: 40px; opacity: 0.95; line-height: 1.6; text-shadow: 0 2px 10px rgba(0,0,0,0.3);" data-gjs-type="text" data-gjs-editable="true">Add your video background here. This section supports video backgrounds.</p><button style="padding: 16px 40px; background: #ffffff; color: #5e72e4; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; transition: transform 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.2);" data-gjs-type="text" data-gjs-editable="true">Watch Video</button></div></section>',
        } as any);

        // Parallax Section Widget
        bm.add('parallax-section', {
          label: 'Parallax Section',
          category: 'Layout',
          content: '<section class="ziplofy-parallax-section" style="position: relative; min-height: 600px; overflow: hidden; display: flex; align-items: center; justify-content: center;" data-gjs-selectable="true" data-gjs-droppable="*"><div class="parallax-background" style="position: absolute; top: -20%; left: 0; width: 100%; height: 140%; background-image: linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.9) 100%), url(\'https://via.placeholder.com/1920x1080\'); background-size: cover; background-position: center; background-repeat: no-repeat; will-change: transform; transform: translateZ(0);"></div><div class="parallax-content" style="position: relative; z-index: 2; text-align: center; color: #ffffff; padding: 80px 40px; max-width: 800px;" data-gjs-selectable="true" data-gjs-droppable="*"><h1 style="font-size: 56px; font-weight: 800; margin-bottom: 24px; line-height: 1.2; text-shadow: 0 4px 20px rgba(0,0,0,0.3);" data-gjs-type="text" data-gjs-editable="true">Parallax Effect</h1><p style="font-size: 20px; margin-bottom: 40px; line-height: 1.6; opacity: 0.95; text-shadow: 0 2px 10px rgba(0,0,0,0.3);" data-gjs-type="text" data-gjs-editable="true">Create stunning parallax scrolling effects with this section.</p><button style="padding: 16px 40px; background: #ffffff; color: #5e72e4; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; transition: transform 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.2);" data-gjs-type="text" data-gjs-editable="true">Learn More</button></div></section>',
        } as any);

        // Advanced Form Widget
        bm.add('form-advanced', {
          label: 'Advanced Form',
          category: 'Forms',
          content: '<form style="max-width: 600px; margin: 0 auto; padding: 40px; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" data-gjs-selectable="true" data-gjs-droppable="*"><h2 style="font-size: 32px; font-weight: 700; margin-bottom: 8px; color: #1e1e1e; text-align: center;" data-gjs-type="text" data-gjs-editable="true">Contact Us</h2><p style="text-align: center; color: #6b7280; margin-bottom: 32px; font-size: 16px;" data-gjs-type="text" data-gjs-editable="true">Fill out the form below and we\'ll get back to you</p><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;" data-gjs-selectable="true" data-gjs-droppable="*"><input type="text" placeholder="First Name" style="padding: 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" data-gjs-selectable="true" /><input type="text" placeholder="Last Name" style="padding: 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;" data-gjs-selectable="true" /></div><input type="email" placeholder="Email Address" style="width: 100%; padding: 14px; margin-bottom: 20px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.3s; box-sizing: border-box;" data-gjs-selectable="true" /><select style="width: 100%; padding: 14px; margin-bottom: 20px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white; cursor: pointer;" data-gjs-selectable="true"><option>Select Subject</option><option>General Inquiry</option><option>Support</option><option>Sales</option></select><textarea placeholder="Your Message" rows="5" style="width: 100%; padding: 14px; margin-bottom: 20px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; box-sizing: border-box;" data-gjs-selectable="true"></textarea><label style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; cursor: pointer;"><input type="checkbox" style="width: 20px; height: 20px; cursor: pointer;" data-gjs-selectable="true" /><span style="font-size: 14px; color: #6b7280;">I agree to the terms and conditions</span></label><button type="submit" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #5e72e4 0%, #667eea 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 15px rgba(94,114,228,0.3);" data-gjs-selectable="true">Send Message</button></form>',
        } as any);

        // Badge Widget
        bm.add('badge', {
          label: 'Badge',
          category: 'Basic',
          content: '<div style="padding: 20px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;" data-gjs-selectable="true" data-gjs-droppable="*"><span style="background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;" data-gjs-type="text" data-gjs-editable="true">New</span><span style="background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;" data-gjs-type="text" data-gjs-editable="true">Featured</span><span style="background: #d1fae5; color: #065f46; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;" data-gjs-type="text" data-gjs-editable="true">Popular</span><span style="background: #fce7f3; color: #831843; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;" data-gjs-type="text" data-gjs-editable="true">Sale</span></div>',
        } as any);

        // Alert Widget
        bm.add('alert', {
          label: 'Alert',
          category: 'Basic',
          content: '<div style="padding: 20px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; display: flex; align-items: start; gap: 12px;" data-gjs-selectable="true" data-gjs-droppable="*"><div style="font-size: 20px; color: #3b82f6;">ℹ</div><div style="flex: 1;"><div style="font-weight: 600; color: #1e40af; margin-bottom: 4px;" data-gjs-type="text" data-gjs-editable="true">Information</div><div style="color: #1e3a8a; font-size: 14px; line-height: 1.5;" data-gjs-type="text" data-gjs-editable="true">This is an informational alert. You can customize the message.</div></div></div></div>',
        } as any);

        const blockIcons: Record<string, string> = {
          section: '▤',
          container: '▢',
          'columns-2': '⅍',
          'columns-3': '☰',
          'columns-4': '▦',
          row: '☷',
          divider: '─',
          spacer: '↕',
          navbar: '☰',
          'heading-1': 'H1',
          'heading-2': 'H2',
          'heading-3': 'H3',
          'heading-4': 'H4',
          paragraph: '¶',
          'text-block': 'Tx',
          quote: '❝',
          list: '≡',
          'link-block': '🔗',
          button: '⏺',
          'button-outline': '⭘',
          'button-text': 'Aa',
          link: '🔗',
          'page-link': '⇢',
          image: '🖼',
          'image-gallery': '▧',
          video: '▶',
          icon: '★',
          form: '✉',
          'form-simple': '✎',
          'input-text': 'T',
          'input-email': '@',
          'input-phone': '☎',
          'textarea-field': '▤',
          'form-button': '✔',
          'input-number': '#',
          'input-password': '🔒',
          'input-date': '📅',
          'select-dropdown': '∨',
          checkbox: '☑',
          radio: '◉',
          tabs: '⋯',
          accordion: '⇵',
          card: '▣',
          testimonial: '☺',
          'pricing-table': '$',
          'google-maps': '📍',
          footer: '⬇',
          'hero-section': '⭐',
          'feature-section': '✨',
          'team-section': '👥',
          'faq-section': '❓',
          'blog-card': '📝',
          'product-card': '🛍',
          'stats-section': '📊',
          'cta-section': '📢',
          'social-links': '🔗',
          breadcrumbs: '📍',
          sidebar: '📋',
          'progress-bar': '▰',
          counter: '🔢',
          'image-carousel': '🎠',
          'card-hover': '✨',
          timeline: '⏱',
          'testimonials-slider': '💬',
          modal: '🔲',
          'countdown-timer': '⏰',
          'button-icon': '🔘',
          'video-background': '🎬',
          'parallax-section': '🌊',
          'form-advanced': '📋',
          badge: '🏷',
          alert: '⚠',
        };

        Object.entries(blockIcons).forEach(([id, icon]) => {
          const block = bm.get(id);
          if (block) {
            block.set({
              media: `<span class="elementor-widget-icon">${icon}</span>`,
            });
          }
        });
        
        // CRITICAL: Verify blocks are registered and log count
        const blocksAfter = bm ? (bm.getAll ? bm.getAll().length : 0) : 0;
        const categories = bm ? (bm.getCategories ? bm.getCategories().length : 0) : 0;
        console.log(`📦 Blocks registered: ${blocksAfter} blocks in ${categories} categories`);
        
        if (blocksAfter === 0) {
          console.error('❌ CRITICAL: No blocks registered! BlockManager might not be initialized correctly.');
        } else {
          console.log('✅ Blocks successfully registered');
        }
        
        // CRITICAL: Force initial render of blocks immediately after registration
        // This ensures blocks are visible even before editor.on('load') fires
        // Use multiple attempts to ensure blocks render
        [100, 300, 500, 1000].forEach((delay) => {
          setTimeout(() => {
            const blocksPanel = document.getElementById('blocks-panel');
            if (!blocksPanel || !bm || blocksAfter === 0) {
              if (delay === 1000) {
                console.warn(`⚠️ blocks-panel not ready after ${delay}ms, blocks may not render`);
              }
              return;
            }
            
            // Check if blocks are already rendered
            const existingBlocks = blocksPanel.querySelectorAll('.gjs-block');
            if (existingBlocks.length > 0 && delay < 1000) {
              console.log(`✅ Blocks already rendered (${existingBlocks.length} found), skipping delay ${delay}ms`);
              return;
            }
            
            // Ensure panel is visible
            blocksPanel.style.setProperty('display', 'block', 'important');
            blocksPanel.style.setProperty('visibility', 'visible', 'important');
            blocksPanel.style.setProperty('opacity', '1', 'important');
            
            // Ensure wrapper is visible
            const wrapper = blocksPanel.closest('.elementor-blocks-wrapper') as HTMLElement;
            if (wrapper) {
              wrapper.style.setProperty('display', 'block', 'important');
              wrapper.style.setProperty('visibility', 'visible', 'important');
              wrapper.style.setProperty('opacity', '1', 'important');
            }
            
            // Only render if no blocks exist
            if (existingBlocks.length === 0) {
              console.log(`🔄 Rendering blocks at ${delay}ms delay...`);
              try {
                // Clear panel first
                blocksPanel.innerHTML = '';
                
                // CRITICAL: Get all blocks before rendering
                const allRegisteredBlocks = bm.getAll ? bm.getAll() : [];
                const registeredArray = Array.isArray(allRegisteredBlocks) ? allRegisteredBlocks : [];
                console.log(`📋 Found ${registeredArray.length} registered blocks, attempting render...`);
                
                // Try standard render first
                let renderResult;
                try {
                  renderResult = bm.render();
                  console.log(`✅ BlockManager.render() called at ${delay}ms`);
                } catch (renderErr) {
                  console.error('❌ BlockManager.render() threw error:', renderErr);
                  renderResult = null;
                }
                
                blocksRenderedRef.current = true;
                
                setTimeout(() => {
                  let renderedBlocks = blocksPanel.querySelectorAll('.gjs-block');
                  console.log(`🎨 After standard render at ${delay}ms: ${renderedBlocks.length} blocks found in DOM`);
                  
                  // If still no blocks and we have registered blocks, manually render them
                  if (renderedBlocks.length === 0 && registeredArray.length > 0) {
                    console.warn(`⚠️ BlockManager.render() returned 0 blocks, manually rendering ${registeredArray.length} blocks...`);
                    
                    // Clear and manually create block elements
                    blocksPanel.innerHTML = '';
                    
                    const blocksContainer = document.createElement('div');
                    blocksContainer.className = 'gjs-blocks-c';
                    blocksContainer.style.setProperty('display', 'flex', 'important');
                    blocksContainer.style.setProperty('flex-direction', 'column', 'important');
                    blocksContainer.style.setProperty('gap', '0', 'important');
                    blocksContainer.style.setProperty('padding', '0', 'important');
                    blocksContainer.style.setProperty('background', '#ffffff', 'important');
                    blocksContainer.style.setProperty('width', '100%', 'important');
                    
                    // Group blocks by category
                    const blocksByCategory: { [key: string]: any[] } = {};
                    registeredArray.forEach((block: any) => {
                      try {
                        const category = block.get ? block.get('category') : (block.category || 'Basic');
                        const categoryName = category || 'Basic';
                        if (!blocksByCategory[categoryName]) {
                          blocksByCategory[categoryName] = [];
                        }
                        blocksByCategory[categoryName].push(block);
                      } catch (e) {
                        console.warn('Error getting block category:', e);
                        if (!blocksByCategory['Basic']) {
                          blocksByCategory['Basic'] = [];
                        }
                        blocksByCategory['Basic'].push(block);
                      }
                    });
                    
                    console.log(`📁 Grouped blocks into ${Object.keys(blocksByCategory).length} categories:`, Object.keys(blocksByCategory));
                    
                    // Create category sections
                    Object.entries(blocksByCategory).forEach(([category, blocks]) => {
                      const categoryDiv = document.createElement('div');
                      categoryDiv.className = 'gjs-block-category';
                      categoryDiv.setAttribute('data-open', 'true');
                      
                      const categoryTitle = document.createElement('div');
                      categoryTitle.className = 'gjs-block-category-title';
                      categoryTitle.textContent = category;
                      categoryTitle.style.cursor = 'pointer';
                      categoryTitle.style.padding = '12px 16px';
                      categoryTitle.style.fontSize = '11px';
                      categoryTitle.style.fontWeight = '600';
                      categoryTitle.style.color = 'rgba(255, 255, 255, 0.5)';
                      categoryTitle.style.textTransform = 'uppercase';
                      categoryTitle.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
                      categoryDiv.appendChild(categoryTitle);
                      
                      const categoryBlocks = document.createElement('div');
                      categoryBlocks.className = 'gjs-block-category-blocks';
                      categoryBlocks.style.setProperty('display', 'grid', 'important');
                      categoryBlocks.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                      categoryBlocks.style.setProperty('gap', '10px', 'important');
                      categoryBlocks.style.setProperty('padding', '12px', 'important');
                      categoryBlocks.style.setProperty('background', '#ffffff', 'important');
                      
                      blocks.forEach((block: any) => {
                        try {
                          const blockId = block.getId ? block.getId() : (block.id || 'unknown');
                          const blockLabel = block.get ? block.get('label') : (block.label || blockId);
                          const blockMedia = block.get ? block.get('media') : (block.media || '');
                          
                          const blockEl = document.createElement('div');
                          blockEl.className = 'gjs-block';
                          blockEl.setAttribute('data-gjs-type', blockId);
                          blockEl.style.setProperty('display', 'flex', 'important');
                          blockEl.style.setProperty('align-items', 'center', 'important');
                          blockEl.style.setProperty('justify-content', 'center', 'important');
                          blockEl.style.setProperty('min-height', '90px', 'important');
                          blockEl.style.setProperty('height', '90px', 'important');
                          blockEl.style.setProperty('max-height', '90px', 'important');
                          blockEl.style.setProperty('background', 'linear-gradient(145deg, #1e1e26 0%, #1a1a22 100%)', 'important');
                          blockEl.style.setProperty('border-radius', '8px', 'important');
                          blockEl.style.setProperty('cursor', 'grab', 'important');
                          blockEl.style.setProperty('color', '#fff', 'important');
                          blockEl.style.setProperty('font-size', '12px', 'important');
                          blockEl.style.setProperty('font-weight', '500', 'important');
                          blockEl.style.setProperty('width', '100%', 'important');
                          blockEl.style.setProperty('max-width', '100%', 'important');
                          blockEl.style.setProperty('box-sizing', 'border-box', 'important');
                          blockEl.style.setProperty('position', 'relative', 'important');
                          blockEl.style.setProperty('z-index', '1', 'important');
                          
                          if (blockMedia) {
                            blockEl.innerHTML = blockMedia;
                          } else {
                            blockEl.textContent = blockLabel;
                          }
                          
                          // Make block draggable using GrapesJS drag system
                          blockEl.addEventListener('mousedown', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (bm && typeof (bm as any).startDrag === 'function') {
                              (bm as any).startDrag(block, e);
                            } else if (editor && editor.BlockManager) {
                              // Fallback: trigger block drag manually
                              const dragEvent = new MouseEvent('mousedown', {
                                bubbles: true,
                                cancelable: true,
                                clientX: e.clientX,
                                clientY: e.clientY
                              });
                              blockEl.dispatchEvent(dragEvent);
                            }
                          });
                          
                          categoryBlocks.appendChild(blockEl);
                        } catch (blockErr) {
                          console.warn('Error creating block element:', blockErr);
                        }
                      });
                      
                      categoryDiv.appendChild(categoryBlocks);
                      blocksContainer.appendChild(categoryDiv);
                    });
                    
                    blocksPanel.appendChild(blocksContainer);
                    renderedBlocks = blocksPanel.querySelectorAll('.gjs-block');
                    console.log(`✅ Manually rendered ${renderedBlocks.length} blocks in ${Object.keys(blocksByCategory).length} categories`);
                  }
                  
                  if (renderedBlocks.length === 0 && blocksAfter > 0 && delay === 1000) {
                    console.error('❌ CRITICAL: Blocks registered but still not rendered after all attempts!');
                    console.error('BlockManager state:', {
                      registeredCount: blocksAfter,
                      registeredArrayLength: registeredArray.length,
                      hasRender: !!bm.render,
                      panelExists: !!blocksPanel,
                      panelVisible: blocksPanel.style.display !== 'none',
                      panelParent: blocksPanel.parentElement?.tagName,
                      panelInnerHTML: blocksPanel.innerHTML.substring(0, 100)
                    });
                  } else if (renderedBlocks.length > 0) {
                    console.log(`✅ Successfully rendered ${renderedBlocks.length} blocks!`);
                  }
                }, 300);
              } catch (e) {
                console.error(`❌ Error rendering blocks at ${delay}ms:`, e);
              }
            }
          }, delay);
        });

        // Carousel prev/next button delegation (canvas iframe) - use editor Canvas API
        const setupCarouselButtons = () => {
          try {
            const frame = editor?.Canvas?.getFrameEl?.() as HTMLIFrameElement | undefined;
            const doc = frame?.contentDocument;
            if (!doc || (doc as any).__ziplofyCarouselSetup) return;
            (doc as any).__ziplofyCarouselSetup = true;
            doc.addEventListener('click', (e: MouseEvent) => {
              const t = e.target as HTMLElement;
              const prev = t.closest?.('.ziplofy-carousel-prev');
              const next = t.closest?.('.ziplofy-carousel-next');
              if (!prev && !next) return;
              const carousel = (prev || next)?.closest?.('.ziplofy-image-carousel');
              const track = carousel?.querySelector?.('.ziplofy-carousel-track') as HTMLElement;
              if (!track) return;
              e.preventDefault();
              e.stopPropagation();
              const slide = track.querySelector('.ziplofy-carousel-slide');
              const slideW = slide?.getBoundingClientRect?.()?.width ?? 340;
              if (prev) track.scrollBy({ left: -slideW, behavior: 'smooth' });
              if (next) track.scrollBy({ left: slideW, behavior: 'smooth' });
            }, true);
          } catch {}
        };
        runIfEditorReady(() => {
          [300, 800, 1500].forEach((d) => setTimeout(setupCarouselButtons, d));
        });
        editor.on('component:add', () => { setTimeout(setupCarouselButtons, 200); });

        // Ensure wrapper is droppable and all components are editable
        runIfEditorReady(() => {
          try {
            const wrapper = editor.getWrapper();
            if (wrapper) {
              // Configure wrapper properties
              wrapper.set({ 
                droppable: true, 
                selectable: true,
                editable: false,
                draggable: false,
                hoverable: false,
                stylable: true, // CRITICAL: Make wrapper stylable
              });
              
              // CRITICAL: Add class and remove ID to force class-based selectors
              wrapper.addClass('gjs-wrapper-body');
              
              // Remove the auto-generated ID to prevent ID-based selectors
              const wrapperId = wrapper.getId();
              if (wrapperId) {
                // Store the styles before removing ID
                const existingStyles = wrapper.getStyle();
                
                // If wrapper has an ID selector in CSS, convert it to class selector
                if (editor.CssComposer && Object.keys(existingStyles).length > 0) {
                  const rule = editor.CssComposer.getRule(`#${wrapperId}`);
                  if (rule) {
                    // Get the styles from the ID rule
                    const idStyles = rule.get('style');
                    // Remove the ID rule
                    editor.CssComposer.remove(rule);
                    // Add as class rule
                    const classRule = editor.CssComposer.getRule('.gjs-wrapper-body') || 
                                      editor.CssComposer.add('.gjs-wrapper-body');
                    if (classRule && idStyles) {
                      classRule.set('style', { ...classRule.get('style'), ...idStyles });
                      console.log('✓ Migrated wrapper styles from ID to class selector');
                    }
                  }
                }
              }
              
              // REMOVED: Don't set inline styles - let user style via Style Manager
              // wrapper.setStyle({ minHeight: '600px', padding: '40px', background: '#fff' });
              
              // Instead, add initial styles via CSS rule if wrapper has no styles yet
              const wrapperStyles = wrapper.getStyle();
              if (!wrapperStyles || Object.keys(wrapperStyles).length === 0) {
                // Add default styles via CSS rule (not inline)
                const cssComposer = editor.CssComposer;
                if (cssComposer) {
                  // Add CSS rule for wrapper
                  const rule = cssComposer.add('.gjs-wrapper-body');
                  if (rule) {
                    rule.set('style', {
                      'min-height': '600px',
                      'padding': '40px',
                      'background': '#fff'
                    });
                  }
                }
              }
              
              // Ensure canvas body is visible
              const body = editor.Canvas.getBody();
              if (body) {
                (body.style as any).margin = '0';
                (body.style as any).padding = '0';
                // Don't force background on body - let wrapper handle it
              }
              
                  // Load saved content or set initial content
                  // Use id from closure to avoid dependency issues
                  const themeId = id;
                  let loadTimeout: ReturnType<typeof setTimeout> | null = null;
                  
                  // Add timeout to prevent infinite loading
                  loadTimeout = setTimeout(() => {
                    if (!destroyed && loading) {
                      console.warn('Theme load timeout after 30s - forcing completion');
                      setLoading(false);
                      setError('Theme load timeout. Please refresh the page.');
                    }
                  }, 30000); // 30 second timeout
                  
                  (async () => {
                    try {
                      let existing = null;
                      let triedCustomTheme = false;
                      let customTheme404 = false;
                      
                      // Try to load as custom theme first if it's a valid ObjectId AND not an installed theme
                      if (themeId && !shouldLoadInstalledTheme) {
                        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(themeId);
                        if (isValidObjectId) {
                          triedCustomTheme = true;
                          try {
                            const { axiosi } = await import('../../config/axios.config');
                            const response = await axiosi.get(`/custom-themes/${themeId}`);
                            if (response.data.success && response.data.data) {
                              const themeData = response.data.data;
                              const storedHtml: string = themeData.html || '';
                              const storedCss: string = themeData.css || '';
                              const parsedPages = parsePagesFromStoredHtml(storedHtml);
                              if (parsedPages && parsedPages.length > 0) {
                                setPages(parsedPages);
                                setCurrentPageId(parsedPages[0].id);
                                existing = {
                                  ...themeData,
                                  html: parsedPages[0].html || DEFAULT_PAGE_CONTENT,
                                  css: storedCss,
                                };
                              } else {
                                const singlePage: Page = {
                                  id: 'page-1',
                                  name: 'Home',
                                  html: storedHtml || DEFAULT_PAGE_CONTENT,
                                  css: storedCss || '',
                                };
                                setPages([singlePage]);
                                setCurrentPageId('page-1');
                                existing = {
                                  ...themeData,
                                  html: singlePage.html,
                                  css: storedCss,
                                };
                              }
                            }
                          } catch (error: any) {
                            if (error?.response?.status === 404 || error?.response?.status === 400) {
                              customTheme404 = true;
                              // Suppress 404 error - it's expected when theme is installed, not custom
                              // console.log('Custom theme not found (404), will try installed theme as fallback');
                            } else {
                              console.error('Error loading custom theme:', error);
                            }
                          }
                        }
                      }

                      // If custom theme failed with 404, or if shouldLoadInstalledTheme is true, try installed theme
                      if (!existing && (shouldLoadInstalledTheme || customTheme404)) {
                        // Only log if not a silent fallback
                        if (!customTheme404) {
                          console.log('Loading installed theme...', { themeId: themeId, shouldLoadInstalledTheme });
                        }
                        const fallbackTheme = await fetchInstalledThemeFromFiles(customTheme404);
                        if (fallbackTheme) {
                          console.log('✓ Installed theme loaded successfully:', fallbackTheme.name);
                          
                          // Create main page (index.html)
                          const mainPage: Page = {
                            id: 'page-1',
                            name: fallbackTheme.name || 'Home',
                            html: fallbackTheme.html || DEFAULT_PAGE_CONTENT,
                            css: fallbackTheme.css || '',
                          };
                          
                          // Combine main page with discovered pages
                          const allPages = fallbackTheme.pages && fallbackTheme.pages.length > 0
                            ? [mainPage, ...fallbackTheme.pages]
                            : [mainPage];
                          
                          console.log(`📄 Loaded ${allPages.length} pages:`, allPages.map(p => p.name));
                          
                          setPages(allPages);
                          pagesRef.current = allPages;
                          setCurrentPageId('page-1');
                          existing = fallbackTheme;
                        } else {
                          if (customTheme404) {
                            console.error('❌ Theme not found as custom theme (404) and failed to load as installed theme', {
                              themeId,
                              ownerId: resolvedStoreId || extractUserIdFromToken(),
                              shouldLoadInstalledTheme,
                              isInstalledMode
                            });
                            // Error message already set by fetchInstalledThemeFromFiles
                            if (!error) {
                              setError('Theme not found. Please check if the theme exists and you have permission to access it.');
                            }
                          } else {
                            console.error('❌ Failed to load installed theme - fallbackTheme is null', {
                              themeId,
                              ownerId: resolvedStoreId || extractUserIdFromToken(),
                              shouldLoadInstalledTheme,
                              isInstalledMode,
                              resolvedStoreId,
                              extractedUserId: extractUserIdFromToken()
                            });
                            if (!error) {
                              setError('Failed to load theme. Please check the browser console for details.');
                            }
                          }
                          // Still initialize editor with default content so user can see something
                          console.log('Initializing editor with default content due to theme load failure');
                        }
                      }
                  
                  if (destroyed) return;
                  
                  console.log('📝 Applying theme to editor:', {
                    hasExisting: !!existing,
                    hasHtml: !!existing?.html,
                    hasCss: !!existing?.css,
                    htmlLength: existing?.html?.length,
                    cssLength: existing?.css?.length,
                    themeId: themeId,
                    isInstalledMode,
                    shouldLoadInstalledTheme
                  });
                  
                  try {
                    if (existing?.html) {
                      console.log('✅ Applying existing theme HTML to editor');
                      applyPageToEditor(existing.html, existing.css || '');
                    } else {
                      console.warn('⚠️ No existing theme found, using default content');
                      applyPageToEditor(DEFAULT_PAGE_CONTENT, existing?.css || '');
                    }
                    console.log('✅ Theme content applied to editor successfully');
                  } catch (applyError: any) {
                    console.error('❌ Error applying page to editor:', applyError);
                    console.error('Error stack:', applyError?.stack);
                    if (!destroyed) {
                      // Don't set error here - let editor initialize with default content
                      console.warn('⚠️ Continuing with default content due to apply error');
                      try {
                        applyPageToEditor(DEFAULT_PAGE_CONTENT, '');
                      } catch (fallbackError: any) {
                        console.error('❌ Failed to apply default content:', fallbackError);
                        setError(applyError?.message || 'Failed to apply theme content. Editor may still work.');
                        setLoading(false);
                      }
                    }
                  }
                  
                  // CRITICAL: Force widgets tab to be active and ensure blocks are visible
                  // This MUST happen after applyPageToEditor to ensure widgets show when editing
                  setTimeout(() => {
                    if (destroyed) return;
                    setActiveSidebarSection('widgets');
                    
                    // Force blocks panel visibility
                    const blocksPanel = document.getElementById('blocks-panel');
                    const blocksWrapper = document.querySelector('.elementor-blocks-wrapper') as HTMLElement;
                    
                    if (blocksWrapper) {
                      blocksWrapper.style.setProperty('display', 'block', 'important');
                      blocksWrapper.style.setProperty('visibility', 'visible', 'important');
                      blocksWrapper.style.setProperty('opacity', '1', 'important');
                    }
                    
                    if (blocksPanel) {
                      blocksPanel.style.setProperty('display', 'block', 'important');
                      blocksPanel.style.setProperty('visibility', 'visible', 'important');
                      blocksPanel.style.setProperty('opacity', '1', 'important');
                    }
                  }, 200);
                  
                  // CRITICAL: Ensure blocks are re-rendered after theme loads (especially with CSS)
                  // editor.setComponents() can trigger GrapesJS to clear the blocks panel
                  // Run multiple checks to ensure blocks appear
                  [400, 800, 1200, 2000].forEach((delay) => {
                    setTimeout(() => {
                      const blocksPanel = document.getElementById('blocks-panel');
                      if (blocksPanel && editor.BlockManager) {
                        // Ensure wrapper is visible FIRST
                        const wrapper = blocksPanel.closest('.elementor-blocks-wrapper') as HTMLElement;
                        if (wrapper) {
                          wrapper.style.setProperty('display', 'block', 'important');
                          wrapper.style.setProperty('visibility', 'visible', 'important');
                          wrapper.style.setProperty('opacity', '1', 'important');
                        }
                        
                        const existingBlocks = blocksPanel.querySelectorAll('.gjs-block');
                        const isEmpty = blocksPanel.innerHTML.trim() === '';
                        const hasBlocksContainer = !!blocksPanel.querySelector('.gjs-blocks-c');
                        
                        // Restore blocks if they're missing (regardless of blocksRenderedRef state)
                        if (existingBlocks.length === 0 && (isEmpty || !hasBlocksContainer)) {
                          console.log(`[Theme Load] Blocks missing at ${delay}ms, re-rendering...`);
                          
                          // Ensure panel is visible
                          blocksPanel.style.setProperty('display', 'block', 'important');
                          blocksPanel.style.setProperty('visibility', 'visible', 'important');
                          blocksPanel.style.setProperty('opacity', '1', 'important');
                          
                          // Clear and re-render
                          blocksPanel.innerHTML = '';
                          editor.BlockManager.render();
                          blocksRenderedRef.current = true;
                          
                          // Ensure blocks are visible after render
                          setTimeout(() => {
                            const restoredBlocks = blocksPanel.querySelectorAll('.gjs-block');
                            if (restoredBlocks.length > 0) {
                              restoredBlocks.forEach((block: any) => {
                                if (block) {
                                  block.style.display = 'flex';
                                  block.style.visibility = 'visible';
                                  block.style.opacity = '1';
                                  block.style.pointerEvents = 'auto';
                                  block.style.cursor = 'grab';
                                  block.style.position = 'relative';
                                  block.style.zIndex = '1';
                                }
                              });
                              
                              // Ensure categories are visible
                              const categories = blocksPanel.querySelectorAll('.gjs-block-category');
                              categories.forEach((cat: any) => {
                                if (cat) {
                                  cat.style.display = 'block';
                                  cat.style.visibility = 'visible';
                                }
                              });
                              
                              console.log(`[Theme Load] ✅ Restored ${restoredBlocks.length} blocks at ${delay}ms`);
                            } else {
                              console.warn(`[Theme Load] ⚠️ No blocks found after render at ${delay}ms`);
                              // If still no blocks, try one more time
                              if (delay === 2000) {
                                setTimeout(() => {
                                  const finalCheck = blocksPanel.querySelectorAll('.gjs-block');
                                  if (finalCheck.length === 0) {
                                    console.log('[Theme Load] 🔄 Final attempt to restore blocks...');
                                    blocksPanel.innerHTML = '';
                                    editor.BlockManager.render();
                                    blocksRenderedRef.current = true;
                                  }
                                }, 500);
                              }
                            }
                          }, 200);
                        } else if (existingBlocks.length > 0) {
                          // Blocks exist - mark as rendered and ensure visibility
                          blocksRenderedRef.current = true;
                          existingBlocks.forEach((block: any) => {
                            if (block) {
                              block.style.display = 'flex';
                              block.style.visibility = 'visible';
                              block.style.opacity = '1';
                              block.style.pointerEvents = 'auto';
                              block.style.cursor = 'grab';
                              block.style.position = 'relative';
                              block.style.zIndex = '1';
                            }
                          });
                          
                          // Ensure categories are visible
                          const categories = blocksPanel.querySelectorAll('.gjs-block-category');
                          categories.forEach((cat: any) => {
                            if (cat) {
                              cat.style.display = 'block';
                              cat.style.visibility = 'visible';
                            }
                          });
                          
                          console.log(`[Theme Load] ✅ Found ${existingBlocks.length} existing blocks at ${delay}ms`);
                        }
                      }
                    }, delay);
                  });
                  
                  if (existing?.name) setName(existing.name);
                  
                  // If loading an existing theme, mark it as published
                  if (existing && themeId) {
                    setIsPublished(true);
                    setHasUnsavedChanges(false);
                  } else {
                    // New theme - not published yet
                    setIsPublished(false);
                    setHasUnsavedChanges(true);
                  }
                  
                  // CRITICAL: Delay loading=false so panels (blocks, style, structure) finish rendering
                  if (!destroyed) {
                    setTimeout(() => {
                      if (!destroyed) {
                        setLoading(false);
                        if (loadTimeout) clearTimeout(loadTimeout);
                      }
                    }, 500);
                  }
                } catch (err: any) {
                  console.error('Error in editor load handler:', err);
                  if (destroyed) return;
                  if (loadTimeout) clearTimeout(loadTimeout);
                  try {
                    applyPageToEditor(DEFAULT_PAGE_CONTENT);
                    if (!destroyed) setLoading(false);
                  } catch (applyErr: any) {
                    console.error('Error applying default content:', applyErr);
                    if (!destroyed) {
                      setError(applyErr?.message || 'Failed to load theme');
                      setLoading(false);
                    }
                  }
                } finally {
                  if (loadTimeout) clearTimeout(loadTimeout);
                  /* setLoading handled in try (delayed) or catch */
                }
              })();
            }
          } catch (err: any) {
            console.error('Error setting up editor load handler:', err);
            if (loadTimeout) clearTimeout(loadTimeout);
            if (!destroyed) {
              setError(err?.message || 'Failed to initialize editor');
              setLoading(false);
            }
          }
        });

        // Track when components are added to detect successful drops
        let lastComponentCount = 0;

        // Debug drag operations
        editor.on('block:drag:start', (block: any) => {
          isDraggingBlock = true; // Set flag to prevent processing during drag
          console.log('🎯 Block drag started:', block?.get?.('label') || 'unknown');
          const wrapper = editor.getWrapper();
          if (wrapper) {
            const isDroppable = wrapper.get('droppable');
            console.log('  Wrapper droppable status:', isDroppable);
            console.log('  Wrapper exists:', !!wrapper);
            console.log('  Wrapper components count:', wrapper.components?.()?.length || 0);
            
            // Force wrapper to be droppable during drag
            if (!isDroppable) {
              console.warn('  ⚠️ Wrapper not droppable! Fixing...');
              wrapper.set('droppable', '*');
              console.log('  ✓ Set wrapper droppable to: *');
            }
            
            // Also ensure wrapper element in DOM accepts drops
            const wrapperEl = wrapper.getEl?.();
            if (wrapperEl) {
              wrapperEl.style.pointerEvents = 'auto';
              wrapperEl.style.minHeight = '600px';
              console.log('  ✓ Wrapper element configured for drops');
            }
          } else {
            console.error('  ❌ NO WRAPPER FOUND!');
          }
        });

        // Handle block drag and drop - ensure components are added
        editor.on('block:drag:stop', (block: any) => {
          console.log('🎯 Block drag stopped:', block?.get?.('label') || 'unknown');
          
          // Process any pending components that were added during drag
          setTimeout(() => {
            isDraggingBlock = false;
            
            // Process pending components if any
            if (pendingComponents.size > 0) {
              // Clear timeout and process immediately
              if (componentAddTimeout) {
                clearTimeout(componentAddTimeout);
                componentAddTimeout = null;
              }
              
              const componentsToProcess = Array.from(pendingComponents);
              pendingComponents.clear();
              
              // Find root component (component without parent or parent is wrapper)
              const rootComponent = componentsToProcess.find((comp: any) => {
                try {
                  const parent = comp.getParent();
                  return !parent || parent.get('type') === 'wrapper';
                } catch {
                  return true;
                }
              }) || componentsToProcess[0];
              
              if (rootComponent) {
                // Select root component to trigger processing
                setTimeout(() => {
                  try {
                    editor.select(rootComponent);
                  } catch {}
                }, 100);
              }
            }
          }, 300);
          try {
            if (!block) return;
            
            // Wait a moment to see if component was added
            setTimeout(() => {
              try {
                const wrapper = editor.getWrapper();
                if (!wrapper) return;
                
                const components = wrapper.components();
                const currentCount = components ? components.length : 0;
                
                // Always manually add to ensure it appears - GrapesJS sometimes misses drops
                if (block.get) {
                  const content = block.get('content');
                  if (content) {
                    // Add directly to wrapper
                    const added = wrapper.append(content);
                    if (added) {
                      const comp = Array.isArray(added) ? added[0] : added;
                      if (comp) {
                        // Ensure it's visible and selectable
                        comp.set({ 
                          selectable: true, 
                          hoverable: true,
                          draggable: true 
                        });
                        
                        // Force visibility
                        const el = comp.getEl?.();
                        if (el) {
                          (el.style as any).display = '';
                          (el.style as any).visibility = 'visible';
                          (el.style as any).opacity = '1';
                        }
                        
                        // Select and show
                        setTimeout(() => {
                          editor.select(comp);
                          editor.runCommand('open-sm');
                          
                          // Force layer manager update ONLY if structure tab is active
                          if (editor.LayerManager && activeSidebarSection === 'structure') {
                            const layersPanel = document.getElementById('layers-panel');
                            if (layersPanel) {
                              // Remove layer content from wrong locations
                              const allLayerContent = document.querySelectorAll('.gjs-layers, .gjs-layer-item, .gjs-layer-item-title');
                              allLayerContent.forEach((el: any) => {
                                const parent = el.closest('#layers-panel');
                                if (!parent) {
                                  el.remove();
                                }
                              });
                              layersPanel.innerHTML = '';
                              editor.LayerManager.render();
                            }
                          }
                        }, 50);
                        
                        // Update count
                        const newComps = wrapper.components();
                        lastComponentCount = newComps ? newComps.length : 0;
                      }
                    }
                  }
                }
              } catch (err) {
                console.error('Error in block:drag:stop:', err);
              }
            }, 100);
          } catch (err) {
            console.error('Error in block:drag:stop handler:', err);
          }
        });

        // Make all components selectable and editable when added
        editor.on('component:add', (component: any) => {
          try {
            if (!component) return;
            
            // Check if component and its collection are properly initialized
            if (!component.collection || !component.cid) return;
            
            // Track immediately (sync) so component:selected can skip showing image card on drop
            collectCids(component, lastAddedComponentCids);
            if (lastAddedClearTimeout) clearTimeout(lastAddedClearTimeout);
            lastAddedClearTimeout = setTimeout(() => { lastAddedComponentCids.clear(); lastAddedClearTimeout = null; }, 600);
            
            // OPTIMIZATION: Skip processing nested components during drag - batch process after drag completes
            if (isDraggingBlock) {
              pendingComponents.add(component);
              return;
            }
            
            // OPTIMIZATION: Debounce component additions to batch process nested components
            if (componentAddTimeout) {
              clearTimeout(componentAddTimeout);
            }
            
            pendingComponents.add(component);
            
            componentAddTimeout = setTimeout(() => {
              // Process all pending components at once
              const componentsToProcess = Array.from(pendingComponents);
              pendingComponents.clear();
              
              // Find the root component (component without parent or parent is wrapper)
              const rootComponent = componentsToProcess.find((comp: any) => {
                try {
                  const parent = comp.getParent();
                  return !parent || parent.get('type') === 'wrapper';
                } catch {
                  return true; // If we can't check parent, assume it's root
                }
              }) || componentsToProcess[0];
              
              if (!rootComponent) return;
              
              // Process only the root component to avoid performance issues with nested elements
              const component = rootComponent;
              
            // Disable undo tracking during component initialization to prevent errors
            const um = editor.UndoManager;
            if (um) {
              try {
                um.stop();
              } catch {}
            }
            
            // Track component count
            const wrapper = editor.getWrapper();
            if (wrapper) {
              const comps = wrapper.components();
              lastComponentCount = comps ? comps.length : 0;
            }
            
            // Check component attributes
            const attrs = component.getAttributes?.() || {};
            const tagName = component.get?.('tagName')?.toLowerCase?.() || '';
            const isDroppable = attrs['data-gjs-droppable'] === '*' || tagName === 'form';
            
            // OPTIMIZATION: Batch configure all nested components at once
            const configureComponent = (comp: any) => {
              try {
                const compAttrs = comp.getAttributes?.() || {};
                const compTagName = comp.get?.('tagName')?.toLowerCase?.() || '';
                const compIsDroppable = compAttrs['data-gjs-droppable'] === '*' || compTagName === 'form';
                
                // Check if component should be selectable based on data-gjs-selectable attribute
                const shouldBeSelectable = compAttrs['data-gjs-selectable'] !== 'false';
                
                comp.set({ 
              selectable: shouldBeSelectable, 
                  hoverable: true,
                  draggable: true,
                  stylable: true,
                  droppable: compIsDroppable
                }, { silent: true });
                
                if (compAttrs['data-gjs-editable'] === 'true' || compAttrs['data-gjs-type'] === 'text') {
                  comp.set({ editable: true, type: 'text' }, { silent: true });
                }
                
                // CRITICAL: Ensure component has a CSS class for style rules (required when avoidInlineStyle is true)
                // This allows styles like box-shadow, text-shadow, etc. to work properly
                if (editor.CssComposer) {
                  const compId = comp.cid || comp.getId?.();
                  if (compId) {
                    const compClasses = comp.getClasses();
                    let compClass = compClasses.find((c: string) => c && !c.startsWith('gjs-'));
                    
                    if (!compClass) {
                      // Generate a unique class name for this component
                      compClass = `gjs-comp-${compId}`;
                      comp.addClass(compClass);
                    }
                  }
                }
              } catch {}
            };
            
            // Configure root component
            configureComponent(component);
            
            // OPTIMIZATION: Configure nested components in batch (but don't select them)
            const configureNested = (comp: any) => {
              try {
                const children = comp.components();
                if (children && children.length > 0) {
                  children.forEach((child: any) => {
                    configureComponent(child);
                    configureNested(child); // Recursively configure nested children
                  });
                }
              } catch {}
            };
            
            configureNested(component);
            
            // Re-enable undo tracking
            if (um) {
              try {
                um.start();
              } catch {}
            }
            
            // Ensure component is visible in the DOM
            const el = component.getEl?.();
            if (el) {
              (el.style as any).display = '';
              (el.style as any).visibility = 'visible';
              (el.style as any).opacity = '1';
            }
            
            // Stop preview mode and select ONLY the root component (not nested children)
            try {
            editor.stopCommand('preview');
            } catch {}
            
            // OPTIMIZATION: Use requestAnimationFrame for smoother selection
            requestAnimationFrame(() => {
              try {
                if (component && component.cid && !isDraggingBlock) {
                  // Only select if not dragging
                editor.select(component);
                
                // Scroll to component if possible
                if (el) {
                  try {
                    editor.Canvas.scrollTo(el);
                  } catch {}
                }
                
                  // Open style panel and use debounced update
                  try {
                editor.runCommand('open-sm');
                    debouncedStyleUpdate(component, 100);
                  } catch {}
                }
                
                // Force layer manager update ONLY if structure tab is active
                setTimeout(() => {
                  try {
                    if (editor.LayerManager && activeSidebarSection === 'structure') {
                      const layersPanel = document.getElementById('layers-panel');
                      if (layersPanel) {
                        // Remove layer content from wrong locations
                        const allLayerContent = document.querySelectorAll('.gjs-layers, .gjs-layer-item, .gjs-layer-item-title');
                        allLayerContent.forEach((el: any) => {
                          const parent = el.closest('#layers-panel');
                          if (!parent) {
                            el.remove();
                          }
                        });
                        layersPanel.innerHTML = '';
                        editor.LayerManager.render();
                        // Force update again after a moment
                        setTimeout(() => {
                          if (editor.LayerManager && activeSidebarSection === 'structure') {
                            const retryPanel = document.getElementById('layers-panel');
                            if (retryPanel) {
                              retryPanel.innerHTML = '';
                              editor.LayerManager.render();
                            }
                          }
                        }, 200);
                      }
                    }
                  } catch {}
                }, 50);
              } catch {}
            });
            }, 150); // Debounce delay - batch process nested components
          } catch (err) {
            console.error('Error in component:add:', err);
          }
        });

        // Prevent Style Manager from being closed - register command if it doesn't exist
        const originalCloseSm = editor.Commands.get('close-sm');
        if (!originalCloseSm) {
          // Command doesn't exist, create it
          editor.Commands.add('close-sm', {
            run: function(editor: any) {
              // Don't actually close, just ensure style panel stays open
              const stylePanel = document.getElementById('style-panel');
              if (stylePanel) {
                stylePanel.style.display = 'block';
                stylePanel.style.visibility = 'visible';
                stylePanel.style.opacity = '1';
              }
              
              const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement;
              if (rightPanel) {
                rightPanel.style.display = 'flex';
                rightPanel.style.visibility = 'visible';
                rightPanel.style.opacity = '1';
              }
            },
            stop: function(editor: any) {
              // Do nothing - prevent closing
            }
          });
        } else {
          // Command exists, override it
          editor.Commands.add('close-sm', {
            ...originalCloseSm,
            run: function(editor: any) {
              // Don't actually close, just ensure it stays open
              const stylePanel = document.getElementById('style-panel');
              if (stylePanel) {
                stylePanel.style.display = 'block';
                stylePanel.style.visibility = 'visible';
                stylePanel.style.opacity = '1';
              }
              
              const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement;
              if (rightPanel) {
                rightPanel.style.display = 'flex';
                rightPanel.style.visibility = 'visible';
                rightPanel.style.opacity = '1';
              }
              
              // Re-open if needed
              editor.runCommand('open-sm');
            }
          });
        }

        // ============================================
        // PERFORMANCE OPTIMIZATION: Debounce and Cache
        // ============================================
        let styleManagerRenderTimeout: any = null;
        let lastSelectedComponentId: string | null = null;
        let isSelectingComponent = false; // Flag to prevent selection loops
        let isDraggingBlock = false; // Flag to prevent processing during drag
        let lastSelectedColorSnapshot: { cid: string; tag: string; inlineColor: string; inlineTextFill: string; computedColor: string; computedTextFill: string } | null = null;
        let componentAddTimeout: ReturnType<typeof setTimeout> | null = null;
        let pendingComponents: Set<any> = new Set(); // Batch component additions
        let cachedStylePanel: HTMLElement | null = null;
        let lastAddedComponentCids = new Set<string>();
        let lastAddedClearTimeout: ReturnType<typeof setTimeout> | null = null;
        const collectCids = (c: any, set: Set<string>) => {
          if (!c?.cid) return;
          set.add(c.cid);
          try { (c.components?.() || []).forEach((child: any) => collectCids(child, set)); } catch {}
        };
        
        // Debounced style panel update - prevents multiple rapid renders
        const debouncedStyleUpdate = (component: any, delay = 150) => {
          if (styleManagerRenderTimeout) {
            clearTimeout(styleManagerRenderTimeout);
          }
          
          styleManagerRenderTimeout = setTimeout(() => {
            if (!component || !editor.StyleManager) return;
            
            // Get current activeSidebarSection from DOM or state (more reliable)
            const styleTabButton = document.querySelector('.elementor-primary-tab-icon[title="Style"]');
            const isStyleTabActive = styleTabButton?.classList.contains('active') || activeSidebarSection === 'style';
            
            if (!isStyleTabActive) {
              console.log('Style tab not active, skipping StyleManager render');
              return;
            }
            
            // Skip if same component is already selected
            const componentId = component.cid || component.getId?.();
            if (componentId === lastSelectedComponentId && cachedStylePanel?.innerHTML.trim() !== '') {
              console.log('Same component already rendered, skipping');
              return;
            }
            lastSelectedComponentId = componentId;
            
            // Cache style panel reference
            if (!cachedStylePanel) {
              cachedStylePanel = document.getElementById('style-panel');
            }
            
            if (!cachedStylePanel) {
              console.warn('Style panel element not found');
              return;
            }
            
            // CRITICAL: Ensure style panel card is visible before checking
            const stylePanelCard = cachedStylePanel.closest('.elementor-panel-card[data-panel-type="style"]') as HTMLElement;
            if (!stylePanelCard) {
              console.warn('Style panel not in correct container, attempting to fix...');
              // Try to find and show the style panel card
              const styleCard = document.querySelector('.elementor-panel-card[data-panel-type="style"]') as HTMLElement;
              if (styleCard) {
                styleCard.style.display = 'flex';
                styleCard.style.visibility = 'visible';
                styleCard.style.opacity = '1';
              } else {
                console.error('Style panel card not found in DOM');
                return;
              }
            } else {
              // Ensure panel card is visible
              stylePanelCard.style.display = 'flex';
              stylePanelCard.style.visibility = 'visible';
              stylePanelCard.style.opacity = '1';
            }
            
            // Ensure style panel itself is visible
            cachedStylePanel.style.display = 'block';
            cachedStylePanel.style.visibility = 'visible';
            cachedStylePanel.style.opacity = '1';
            cachedStylePanel.style.width = '100%';
            cachedStylePanel.style.height = '100%';
            cachedStylePanel.style.minHeight = '300px';
            
            // CRITICAL: Ensure wrapper has class for CSS-based styling
            const isWrapper = component === editor.getWrapper();
            if (isWrapper) {
              const classes = component.getClasses();
              if (!classes.includes('gjs-wrapper-body')) {
                component.addClass('gjs-wrapper-body');
                console.log('✓ Added gjs-wrapper-body class to wrapper');
              }
            }
            
            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
              // Final check - ensure style tab is still active
              const finalCheck = document.querySelector('.elementor-primary-tab-icon[title="Style"]')?.classList.contains('active') || activeSidebarSection === 'style';
              if (!finalCheck) {
                console.log('Style tab no longer active, aborting render');
                return;
              }
              
              try {
                console.log('🎨 Rendering StyleManager for component:', componentId);
                
                // Ensure component is selected
                editor.select(component);
                
                // Set target first
                if ((editor.StyleManager as any).setTarget) {
                  (editor.StyleManager as any).setTarget(component);
                }
                  
                // Clear and render Style Manager
                cachedStylePanel!.innerHTML = '';
                editor.StyleManager.render();
                
                console.log('✓ StyleManager.render() called');
                
                // Force Style Manager to update its target again after render
                if ((editor.StyleManager as any).setTarget) {
                  (editor.StyleManager as any).setTarget(component);
                }
                
                // Do not force sectors open – allow user to collapse/expand subsections
          } catch (e) {
                console.error('❌ Error rendering Style Manager:', e);
              }
            });
          }, delay);
        };

        // Auto-open style panel when component is selected
        // Navigation traits for buttons and links are added dynamically when components are selected
        // See component:selected event handler below

        // Track Alt key state for parent selection
        let altKeyPressed = false;
        const handleAltKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Alt' || e.keyCode === 18) {
            altKeyPressed = true;
          }
        };
        const handleAltKeyUp = (e: KeyboardEvent) => {
          if (e.key === 'Alt' || e.keyCode === 18) {
            altKeyPressed = false;
          }
        };
        window.addEventListener('keydown', handleAltKeyDown);
        window.addEventListener('keyup', handleAltKeyUp);
        registerCleanup(() => {
          window.removeEventListener('keydown', handleAltKeyDown);
          window.removeEventListener('keyup', handleAltKeyUp);
        });

        // Handle Alt+Click to select parent component
        editor.on('component:selected', (component: any) => {
          try {
            try {
              const wrap = editor.getWrapper?.();
              const selTag = (component?.get?.('tagName') || '').toLowerCase();
              const isHeavySelection = component === wrap || selTag === 'body';
              rootContainerRef.current?.classList.toggle('ziplofy-wrapper-or-body-selected', Boolean(isHeavySelection));
              if (isHeavySelection) {
                try {
                  const currentStyles = component?.getStyle?.() || {};
                  if (currentStyles.color || currentStyles['-webkit-text-fill-color']) {
                    const nextStyles = { ...currentStyles };
                    delete nextStyles.color;
                    delete nextStyles['-webkit-text-fill-color'];
                    component.setStyle?.(nextStyles);
                    fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-5',hypothesisId:'H25',location:'CustomThemeBuilder.tsx:component:selected:heavy-cleanup',message:'removed wrapper/body color noise',data:{tag:selTag,removedColor:Boolean(currentStyles.color),removedTextFill:Boolean(currentStyles['-webkit-text-fill-color'])},timestamp:Date.now()})}).catch(()=>{});
                  }
                } catch {}
              }
              // #region agent log
              try {
                const selEl = component?.getEl?.() as HTMLElement | null;
                if (selEl && /hero-slide|hero-slide-overlay|hero-slide-title/i.test(String(selEl.className || ''))) {
                  fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-16',hypothesisId:'H36',location:'CustomThemeBuilder.tsx:component:selected:no-global-hero-fallback',message:'selected hero node without forced global color fallback',data:{selectedClass:String(selEl.className || '').slice(0,120)},timestamp:Date.now()})}).catch(()=>{});
                }
              } catch {}
              // #endregion agent log
              // Clear poisoned hero title model/rule styles injected by StyleManager sync.
              try {
                const selEl = component?.getEl?.() as HTMLElement | null;
                const isHeroTitle = Boolean(selEl) && /hero-slide-title/.test(String(selEl?.className || ''));
                if (isHeroTitle) {
                  const style = component?.getStyle?.() || {};
                  const next = { ...style };
                  // Hero title must keep theme-driven gradient paint; any explicit model color can poison it.
                  const hadModelColor = Object.prototype.hasOwnProperty.call(next, 'color');
                  const badModelColor =
                    hadModelColor ||
                    /^(rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0[^)]*\)|black|#000(?:000)?(?:ff)?)$/i.test(String(next.color || '').trim());
                  // Transparent fill is valid for gradient clipped text — never strip it from hero title.
                  const badModelFill =
                    /^(transparent|rgba\(0,\s*0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0,\s*0\.0+\))$/i.test(String(next['-webkit-text-fill-color'] || '').trim()) &&
                    !isHeroTitle;
                  if (badModelColor) delete next.color;
                  if (badModelFill) delete next['-webkit-text-fill-color'];
                  if (badModelColor || badModelFill) component.setStyle?.(next);

                  const classes = component?.getClasses?.() || [];
                  const componentClass = classes.find((c: string) => c && !c.startsWith('gjs-')) || '';
                  if (componentClass && editor?.CssComposer) {
                    const rule = editor.CssComposer.getRule(`.${componentClass}`);
                    if (rule) {
                      const rs = { ...(rule.get('style') || {}) };
                      const hadRuleColor = Object.prototype.hasOwnProperty.call(rs, 'color');
                      const badRuleColor =
                        hadRuleColor ||
                        /^(rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0[^)]*\)|black|#000(?:000)?(?:ff)?)$/i.test(String(rs.color || '').trim());
                      const badRuleFill =
                        /^(transparent|rgba\(0,\s*0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0,\s*0\.0+\))$/i.test(String(rs['-webkit-text-fill-color'] || '').trim()) &&
                        !isHeroTitle;
                      if (badRuleColor) delete rs.color;
                      if (badRuleFill) delete rs['-webkit-text-fill-color'];
                      if (badRuleColor || badRuleFill) rule.set('style', rs);
                      if (badRuleColor || badRuleFill || badModelColor || badModelFill) {
                        fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-10',hypothesisId:'H30',location:'CustomThemeBuilder.tsx:component:selected:hero-poison-cleanup',message:'removed poisoned hero title styles',data:{badModelColor,badModelFill,badRuleColor,badRuleFill,componentClass},timestamp:Date.now()})}).catch(()=>{});
                        // #region agent log
                        try {
                          const titleEl = component?.getEl?.() as HTMLElement | null;
                          const titleCs = titleEl ? window.getComputedStyle(titleEl) : null;
                          fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-13',hypothesisId:'H33',location:'CustomThemeBuilder.tsx:component:selected:cleanup-impact',message:'hero poison cleanup post-style snapshot',data:{badModelColor,badModelFill,badRuleColor,badRuleFill,titleColor:titleCs?.color||'',titleTextFill:titleCs?.getPropertyValue?.('-webkit-text-fill-color')||'',titleBgImage:titleCs?.backgroundImage||'',titleBgClip:titleCs?.getPropertyValue?.('-webkit-background-clip')||titleCs?.getPropertyValue?.('background-clip')||''},timestamp:Date.now()})}).catch(()=>{});
                        } catch {}
                        // #endregion agent log
                      }
                    }
                  }
                }
              } catch {}
              // #region agent log
              try {
                const el = component?.getEl?.() as HTMLElement | null;
                const cs = el ? window.getComputedStyle(el) : null;
                const cid = String(component?.cid || component?.getId?.() || '');
                lastSelectedColorSnapshot = {
                  cid,
                  tag: String(component?.get?.('tagName') || ''),
                  inlineColor: el?.style?.color || '',
                  inlineTextFill: el?.style?.getPropertyValue?.('-webkit-text-fill-color') || '',
                  computedColor: cs?.color || '',
                  computedTextFill: cs?.getPropertyValue?.('-webkit-text-fill-color') || '',
                };
                fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass',hypothesisId:'H16',location:'CustomThemeBuilder.tsx:component:selected:colorSnapshot',message:'selected component color snapshot',data:lastSelectedColorSnapshot,timestamp:Date.now()})}).catch(()=>{});
                if (/^(h1|h2|h3|h4|h5|h6|p|span|a)$/i.test(lastSelectedColorSnapshot.tag)) {
                  fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-9',hypothesisId:'H29',location:'CustomThemeBuilder.tsx:component:selected:visualState',message:'selected text visual state',data:{tag:lastSelectedColorSnapshot.tag,className:(el?.className||'').toString().slice(0,120),opacity:cs?.opacity||'',filter:cs?.filter||'',mixBlendMode:cs?.mixBlendMode||'',textShadow:cs?.textShadow||'',transform:cs?.transform||'',parentOpacity:el?.parentElement?window.getComputedStyle(el.parentElement).opacity:'',parentFilter:el?.parentElement?window.getComputedStyle(el.parentElement).filter:''},timestamp:Date.now()})}).catch(()=>{});
                }
                if (
                  /^(h1|h2|h3|h4|h5|h6|p|span|a)$/i.test(lastSelectedColorSnapshot.tag) &&
                  lastSelectedColorSnapshot.computedTextFill === 'rgba(0, 0, 0, 0)'
                ) {
                  fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-6',hypothesisId:'H26',location:'CustomThemeBuilder.tsx:component:selected:textFillContext',message:'selected text has transparent text fill',data:{tag:lastSelectedColorSnapshot.tag,className:(el?.className||'').toString().slice(0,120),computedColor:cs?.color||'',computedTextFill:cs?.getPropertyValue?.('-webkit-text-fill-color')||'',backgroundClip:cs?.getPropertyValue?.('background-clip')||'',webkitBackgroundClip:cs?.getPropertyValue?.('-webkit-background-clip')||'',backgroundImage:cs?.backgroundImage||''},timestamp:Date.now()})}).catch(()=>{});
                }
                // Keep original gradient style whenever possible; only apply temporary readability fallback
                // when selected hero text truly flips to black in canvas.
                if (el && /hero-slide-title|hero-slide-caption/i.test(String(el.className || ''))) {
                  const isTransparentTextFillNow = lastSelectedColorSnapshot.computedTextFill === 'rgba(0, 0, 0, 0)';
                  const isGradientClipText =
                    /text/i.test(cs?.getPropertyValue?.('-webkit-background-clip') || cs?.getPropertyValue?.('background-clip') || '') &&
                    /gradient/i.test(String(cs?.backgroundImage || ''));
                  // computedColor is often black for gradient text (fill paints the gradient); do not treat that alone as broken.
                  const isBlackNow =
                    lastSelectedColorSnapshot.computedTextFill === 'rgb(0, 0, 0)' ||
                    (lastSelectedColorSnapshot.computedColor === 'rgb(0, 0, 0)' && !isTransparentTextFillNow && !isGradientClipText);
                  if (isTransparentTextFillNow && isGradientClipText) {
                    // #region agent log
                    fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-17',hypothesisId:'H37',location:'CustomThemeBuilder.tsx:component:selected:skip-transparent-fill-fallback',message:'transparent text fill detected; skipping white fallback to preserve gradient text',data:{tag:lastSelectedColorSnapshot.tag,className:String(el.className || '').slice(0,120),computedColor:lastSelectedColorSnapshot.computedColor,computedTextFill:lastSelectedColorSnapshot.computedTextFill},timestamp:Date.now()})}).catch(()=>{});
                    fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-20',hypothesisId:'H40',location:'CustomThemeBuilder.tsx:component:selected:gradient-color-transparent',message:'gradient clip text detected; no inline color override applied',data:{tag:lastSelectedColorSnapshot.tag,className:String(el.className || '').slice(0,120)},timestamp:Date.now()})}).catch(()=>{});
                    // #endregion agent log
                  } else if (isBlackNow) {
                    if (!el.hasAttribute('data-ziplofy-temp-text-fix')) {
                      el.setAttribute('data-ziplofy-temp-text-fix', '1');
                      el.setAttribute('data-ziplofy-prev-color', el.style.getPropertyValue('color') || '');
                      el.setAttribute('data-ziplofy-prev-text-fill', el.style.getPropertyValue('-webkit-text-fill-color') || '');
                    }
                    el.style.setProperty('color', '#ffffff', 'important');
                    el.style.setProperty('-webkit-text-fill-color', '#ffffff', 'important');
                    fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-7',hypothesisId:'H27',location:'CustomThemeBuilder.tsx:component:selected:heroTextFallback',message:'applied temporary hero text readability fallback',data:{reason:'black',tag:lastSelectedColorSnapshot.tag,className:String(el.className || '').slice(0,120),computedColor:lastSelectedColorSnapshot.computedColor,computedTextFill:lastSelectedColorSnapshot.computedTextFill},timestamp:Date.now()})}).catch(()=>{});
                  } else if (el.hasAttribute('data-ziplofy-temp-text-fix')) {
                    const prevColor = el.getAttribute('data-ziplofy-prev-color') || '';
                    const prevTextFill = el.getAttribute('data-ziplofy-prev-text-fill') || '';
                    if (prevColor) el.style.setProperty('color', prevColor);
                    else el.style.removeProperty('color');
                    if (prevTextFill) el.style.setProperty('-webkit-text-fill-color', prevTextFill);
                    else el.style.removeProperty('-webkit-text-fill-color');
                    el.removeAttribute('data-ziplofy-temp-text-fix');
                    el.removeAttribute('data-ziplofy-prev-color');
                    el.removeAttribute('data-ziplofy-prev-text-fill');
                  }
                }
                const isTextTag = /^(h1|h2|h3|h4|h5|h6|p|span|a|li|button|label|strong|em)$/i.test(lastSelectedColorSnapshot.tag);
                if (
                  isTextTag &&
                  (lastSelectedColorSnapshot.computedColor === 'rgb(0, 0, 0)' ||
                    lastSelectedColorSnapshot.computedTextFill === 'rgb(0, 0, 0)')
                ) {
                  const parent = el?.parentElement || null;
                  const parentCs = parent ? window.getComputedStyle(parent) : null;
                  const modelStyle = component?.getStyle?.() || {};
                  const classes = component?.getClasses?.() || [];
                  const componentClass = classes.find((c: string) => c && !c.startsWith('gjs-')) || '';
                  const rule = componentClass && editor?.CssComposer
                    ? editor.CssComposer.getRule(`.${componentClass}`)
                    : null;
                  const ruleStyle = rule?.get?.('style') || {};
                  fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-2',hypothesisId:'H20',location:'CustomThemeBuilder.tsx:component:selected:blackSource',message:'black text source snapshot',data:{cid,tag:lastSelectedColorSnapshot.tag,classes:classes.slice(0,8),modelColor:modelStyle?.color||'',modelTextFill:modelStyle?.['-webkit-text-fill-color']||'',ruleColor:ruleStyle?.color||'',ruleTextFill:ruleStyle?.['-webkit-text-fill-color']||'',parentColor:parentCs?.color||'',parentTextFill:parentCs?.getPropertyValue?.('-webkit-text-fill-color')||''},timestamp:Date.now()})}).catch(()=>{});
                }
              } catch {}
              // #endregion agent log
            } catch {}
            // Prevent selection loops - if we're already processing a selection, skip
            if (isSelectingComponent) {
              return;
            }
            
            // OPTIMIZATION: If Alt key is pressed, select parent instead
            if (altKeyPressed && component) {
              try {
                const parent = component.getParent();
                if (parent && parent.get('type') !== 'wrapper') {
                  // Select parent component
                  isSelectingComponent = true;
                  requestAnimationFrame(() => {
                    editor.select(parent);
                    setTimeout(() => {
                      isSelectingComponent = false;
                    }, 100);
                  });
                  return;
                }
              } catch (e) {
                console.warn('Error selecting parent:', e);
              }
            }
            
            // Check if this is the same component as last time
            const componentId = component?.cid || component?.getId?.() || null;
            if (componentId === lastSelectedComponentId) {
              // Same component, just ensure styles panel is visible
              if (activeSidebarSection === 'style' && editor.StyleManager) {
                debouncedStyleUpdate(component, 50);
              }
              return;
            }
            
            // Mark as selecting to prevent loops
            isSelectingComponent = true;
            lastSelectedComponentId = componentId;
            
            // Ensure component is stylable (use silent to avoid undo tracking)
            if (component && component.cid) {
              try {
                component.set({ stylable: true }, { silent: true });
              } catch {}
            }
            
            // First, ensure right panel is visible
            const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement;
            if (rightPanel) {
              rightPanel.style.display = 'flex';
              rightPanel.style.visibility = 'visible';
              rightPanel.style.opacity = '1';
              rightPanel.style.width = '300px';
              rightPanel.style.flexShrink = '0';
            }
            
            // Ensure traits panel is visible and rendered
            const traitsPanel = document.getElementById('traits-panel');
            if (traitsPanel && editor.TraitManager) {
              traitsPanel.style.display = 'block';
              traitsPanel.style.visibility = 'visible';
              traitsPanel.style.opacity = '1';
              
              // For buttons and links, add navigation traits if not already present
              // Check both tagName and view element to catch buttons inside divs
              const tagName = component?.get('tagName')?.toLowerCase();
              
              // Safely get view element - check if it's actually a DOM element
              let viewEl: HTMLElement | null = null;
              let actualTagName = tagName;
              
              try {
                const view = component.getView?.();
                if (view && view.el) {
                  // Check if el is actually a DOM element
                  if (view.el.nodeType === 1 && typeof view.el.querySelector === 'function') {
                    viewEl = view.el as HTMLElement;
                    actualTagName = viewEl.tagName?.toLowerCase() || tagName;
                  }
                }
              } catch (e) {
                // If getView fails, just use tagName
                console.warn('Could not get view element:', e);
              }
              
              // Check if component is a button or link, or contains a button/link
              let isButton = actualTagName === 'button' || tagName === 'button';
              let isLink = actualTagName === 'a' || tagName === 'a';
              
              // If not directly a button/link, check if it contains one
              // Ensure viewEl is actually a DOM element before calling querySelector
              if (!isButton && !isLink && viewEl && typeof viewEl.querySelector === 'function') {
                const buttonChild = viewEl.querySelector('button');
                const linkChild = viewEl.querySelector('a');
                if (buttonChild) {
                  isButton = true;
                  // Get the actual button component if possible
                  try {
                    // Get component from element - GrapesJS API
                    const buttonComponent = (editor.Components as any).getComponent ? (editor.Components as any).getComponent(buttonChild) : null;
                    if (buttonComponent && buttonComponent.cid !== component.cid) {
                      // Only re-select if it's a different component
                      component = buttonComponent;
                      // Use requestAnimationFrame and set flag to prevent loop
                      requestAnimationFrame(() => {
                        isSelectingComponent = true;
                        editor.select(buttonComponent);
                        setTimeout(() => {
                          isSelectingComponent = false;
                        }, 100);
                      });
                    }
                  } catch (e) {
                    console.log('Could not get button component, using wrapper');
                  }
                } else if (linkChild) {
                  isLink = true;
                  try {
                    // Get component from element - GrapesJS API
                    const linkComponent = (editor.Components as any).getComponent ? (editor.Components as any).getComponent(linkChild) : null;
                    if (linkComponent && linkComponent.cid !== component.cid) {
                      // Only re-select if it's a different component
                      component = linkComponent;
                      requestAnimationFrame(() => {
                        isSelectingComponent = true;
                        editor.select(linkComponent);
                        setTimeout(() => {
                          isSelectingComponent = false;
                        }, 100);
                      });
                    }
                  } catch (e) {
                    console.log('Could not get link component, using wrapper');
                  }
                }
              }
              
              const currentPages = pagesRef.current;
              
              // Skip image handling for body/wrapper - getComponent may return body for nested imgs
              if (tagName === 'body' || actualTagName === 'body' || component === editor.getWrapper?.()) {
                // Don't treat body or root wrapper as image selection
              } else {
              
              // Check if component is an image or contains an image
              let isImage = actualTagName === 'img' || tagName === 'img';
              let imageComponent = component;
              
              // If not directly an img, check if it contains one
              if (!isImage && viewEl && typeof viewEl.querySelector === 'function') {
                const imgChild = viewEl.querySelector('img');
                if (imgChild) {
                  isImage = true;
                  try {
                    // Get the actual img component if possible
                    const imgComp = (editor.Components as any).getComponent ? (editor.Components as any).getComponent(imgChild) : null;
                    const imgTag = (imgComp?.get?.('tagName') || '').toLowerCase();
                    if (imgComp && imgComp.cid !== component.cid && imgTag === 'img') {
                      imageComponent = imgComp;
                      // Re-select the image component
                      requestAnimationFrame(() => {
                        isSelectingComponent = true;
                        editor.select(imgComp);
                        setTimeout(() => {
                          isSelectingComponent = false;
                        }, 100);
                      });
                    }
                  } catch (e) {
                    console.log('Could not get image component, using wrapper');
                  }
                }
              }
              
              if (isImage) {
                // Don't show image card when user just dropped the widget - only on explicit click
                if (imageComponent?.cid && lastAddedComponentCids.has(imageComponent.cid)) {
                  // Skip - component was just added via drag-drop
                } else {
                const attrs = imageComponent.getAttributes?.() || {};
                const src = attrs.src || imageComponent.get?.('src') || '';
                const alt = attrs.alt || imageComponent.get?.('alt') || '';
                setImagePanelData({ component: imageComponent, src: src || '', alt: alt || '' });
                
                const existingTraits = imageComponent.get('traits') || [];
                const hasImageSrc = existingTraits.some((t: any) => {
                  return (typeof t === 'object' && t.name === 'src') || t === 'src';
                });
                const hasImageAlt = existingTraits.some((t: any) => {
                  return (typeof t === 'object' && t.name === 'alt') || t === 'alt';
                });
                
                // Add image traits if missing
                if (!hasImageSrc || !hasImageAlt) {
                  const imageTraits = [];
                  
                  if (!hasImageSrc) {
                    imageTraits.push({
                      type: 'text',
                      name: 'src',
                      label: 'Image URL',
                      placeholder: 'https://example.com/image.jpg',
                      changeProp: true,
                    });
                  }
                  
                  if (!hasImageAlt) {
                    imageTraits.push({
                      type: 'text',
                      name: 'alt',
                      label: 'Alt Text',
                      placeholder: 'Image description',
                      changeProp: true,
                    });
                  }
                  
                  // Filter out existing image traits
                  const filteredTraits = existingTraits.filter((t: any) => {
                    if (typeof t === 'string') {
                      return t !== 'src' && t !== 'alt';
                    }
                    return t.name !== 'src' && t.name !== 'alt';
                  });
                  
                  // Merge existing traits with new image traits
                  imageComponent.set('traits', [...filteredTraits, ...imageTraits]);
                  
                  // Force immediate re-render of traits
                  setTimeout(() => {
                    if (editor.TraitManager) {
                      if (typeof editor.TraitManager.render === 'function') {
                        editor.TraitManager.render();
                      }
                    }
                  }, 50);
                  
                  // Initialize trait values from existing attributes
                  const existingAttrs = imageComponent.getAttributes?.() || {};
                  const existingSrc = existingAttrs.src || imageComponent.get('src') || '';
                  const existingAlt = existingAttrs.alt || imageComponent.get('alt') || '';
                  
                  // Set initial values if they exist
                  if (existingSrc && !imageComponent.get('src')) {
                    imageComponent.set('src', existingSrc);
                  }
                  if (existingAlt && !imageComponent.get('alt')) {
                    imageComponent.set('alt', existingAlt);
                  }
                  
                  // Add event handlers to update image src/alt when traits change
                  const updateImageAttributes = () => {
                    const src = imageComponent.get('src') || '';
                    const alt = imageComponent.get('alt') || '';
                    
                    if (src) {
                      imageComponent.addAttributes({ src });
                      const view = imageComponent.getView();
                      if (view && view.el) {
                        view.el.setAttribute('src', src);
                        // Also update if img is inside a wrapper
                        const imgEl = view.el.tagName === 'IMG' ? view.el : view.el.querySelector('img');
                        if (imgEl) {
                          imgEl.setAttribute('src', src);
                        }
                      }
                    }
                    
                    if (alt !== undefined) {
                      imageComponent.addAttributes({ alt });
                      const view = imageComponent.getView();
                      if (view && view.el) {
                        view.el.setAttribute('alt', alt);
                        // Also update if img is inside a wrapper
                        const imgEl = view.el.tagName === 'IMG' ? view.el : view.el.querySelector('img');
                        if (imgEl) {
                          imgEl.setAttribute('alt', alt);
                        }
                      }
                    }
                    
                    // Force component update
                    imageComponent.trigger('change');
                    editor.trigger('component:update', imageComponent);
                  };
                  
                  // Store update function on component
                  (imageComponent as any)._updateImageAttributes = updateImageAttributes;
                  
                  // Listen to trait changes
                  imageComponent.on('change:src', () => {
                    const updateFn = (imageComponent as any)._updateImageAttributes;
                    if (updateFn) {
                      setTimeout(updateFn, 50);
                    }
                  });
                  
                  imageComponent.on('change:alt', () => {
                    const updateFn = (imageComponent as any)._updateImageAttributes;
                    if (updateFn) {
                      setTimeout(updateFn, 50);
                    }
                  });
                }
              }
              }
              }
              
              if (isButton || isLink) {
                const attrs = component.getAttributes?.() || {};
                const href = attrs.href || component.get('href') || '';
                const pageLink = attrs['data-page-link'] || component.get('pageLink') || '';
                const linkType = component.get('linkType') || (pageLink ? 'page' : (href && href !== '#' ? 'url' : (isButton ? 'none' : 'page')));
                setLinksPanelData({
                  component,
                  href: href || '',
                  pageLink: pageLink || '',
                  linkType: linkType || 'page',
                  tagName: (component.get?.('tagName') || 'a').toLowerCase(),
                });
                // Auto-switch to Links tab when button/link is selected so user can edit link
                if (activeSidebarSection !== 'links') {
                  setActiveSidebarSection('links');
                }
                
                const existingTraits = component.get('traits') || [];
                const hasLinkType = existingTraits.some((t: any) => {
                  return (typeof t === 'object' && t.name === 'linkType') || t === 'linkType';
                });
                const hasPageLink = existingTraits.some((t: any) => {
                  return (typeof t === 'object' && t.name === 'pageLink') || t === 'pageLink';
                });
                
                const updatePageOptions = (trait: any) => {
                  if (!trait) return;
                  const options = [
                    { id: '', value: '', name: '-- Select Page --' },
                    ...(currentPages || []).map((p) => ({ id: p.id, value: p.id, name: p.name }))
                  ];
                  if (trait.set) {
                  trait.set('options', options);
                  } else if (trait.options) {
                    trait.options = options;
                  }
                };
                
                // Always ensure navigation traits exist (add if missing, update if existing)
                // Add traits if any are missing
                if (!hasLinkType) {
                  const navigationTraits = [
                    {
                      type: 'select',
                      name: 'linkType',
                      label: isButton ? 'Button Action' : 'Link Type',
                      options: isButton ? [
                        { id: 'none', value: 'none', name: 'No Action' },
                        { id: 'page', value: 'page', name: 'Navigate to Page' },
                        { id: 'url', value: 'url', name: 'Open URL' },
                      ] : [
                        { id: 'page', value: 'page', name: 'Link to Page' },
                        { id: 'url', value: 'url', name: 'External URL' },
                      ],
                      changeProp: true,
                    },
                    {
                      type: 'select',
                      name: 'pageLink',
                      label: 'Select Page',
                      options: [
                        { id: '', value: '', name: '-- Select Page --' },
                        ...(currentPages || []).map((p) => ({ id: p.id, value: p.id, name: p.name }))
                      ],
                      changeProp: true,
                    },
                    {
                      type: 'text',
                      name: 'href',
                      label: 'URL',
                      placeholder: 'https://example.com or #page-1',
                      changeProp: true,
                    },
                  ];
                  
                  // Filter out default id and title traits, and existing navigation traits
                  const filteredTraits = existingTraits.filter((t: any) => {
                    if (typeof t === 'string') {
                      return t !== 'id' && t !== 'title' && t !== 'linkType' && t !== 'pageLink';
                    }
                    return t.name !== 'id' && t.name !== 'title' && t.name !== 'linkType' && t.name !== 'pageLink' && t.name !== 'href';
                  });
                  
                  // Merge existing traits with new navigation traits
                  component.set('traits', [...filteredTraits, ...navigationTraits]);
                  
                  // Force immediate re-render of traits (without re-selecting to avoid loops)
                  setTimeout(() => {
                    if (editor.TraitManager) {
                      // Just render traits - don't re-select (component is already selected)
                      if (typeof editor.TraitManager.render === 'function') {
                        editor.TraitManager.render();
                      }
                    }
                  }, 50);
                  
                  // Initialize trait values from existing attributes
                  const existingAttrs = component.getAttributes?.() || {};
                  const existingHref = existingAttrs.href || component.get('href') || '';
                  const existingPageLink = existingAttrs['data-page-link'] || '';
                  
                  // Set initial values
                  if (existingPageLink) {
                    component.set('linkType', 'page');
                    component.set('pageLink', existingPageLink);
                    component.set('href', `#page-${existingPageLink}`);
                  } else if (existingHref && existingHref !== '#' && !existingHref.startsWith('#')) {
                    component.set('linkType', isButton ? 'url' : 'url');
                    component.set('href', sanitizeExternalHref(existingHref));
                  } else if (isButton) {
                    component.set('linkType', 'none');
                  } else {
                    component.set('linkType', 'page');
                  }
                  
                  // Function to show/hide conditional trait fields based on linkType
                  const updateTraitVisibility = () => {
                    const linkType = component.get('linkType');
                    const traitsPanel = document.getElementById('traits-panel');
                    if (traitsPanel) {
                      // Find traits by label text (more reliable than data attributes)
                      const allTraits = traitsPanel.querySelectorAll('.gjs-trt-trait');
                      allTraits.forEach((traitEl) => {
                        const label = traitEl.querySelector('label, .gjs-trt-trait__label');
                        if (label) {
                          const labelText = label.textContent || '';
                          if (labelText.includes('Select Page')) {
                            (traitEl as HTMLElement).style.display = linkType === 'page' ? 'block' : 'none';
                          } else if (labelText.includes('URL') && !labelText.includes('Select')) {
                            (traitEl as HTMLElement).style.display = linkType === 'url' ? 'block' : 'none';
                          }
                        }
                      });
                    }
                  };
                  
                  // Store updateTraitVisibility function on component
                  (component as any)._updateTraitVisibility = updateTraitVisibility;
                  
                  // Force traits panel to re-render with new traits
                  setTimeout(() => {
                    if (editor.TraitManager) {
                      // Select the component to update TraitManager target
                      editor.select(component);
                      // Then render traits
                      if (typeof editor.TraitManager.render === 'function') {
                        editor.TraitManager.render();
                      }
                      // Also ensure panel is visible
                      const traitsPanelEl = document.getElementById('traits-panel');
                      if (traitsPanelEl) {
                        traitsPanelEl.style.display = 'block';
                        traitsPanelEl.style.visibility = 'visible';
                        traitsPanelEl.style.opacity = '1';
                        // Update trait visibility after render
                        setTimeout(updateTraitVisibility, 100);
                        
                        // Watch for trait panel changes and update visibility
                        const observer = new MutationObserver(() => {
                          updateTraitVisibility();
                        });
                        observer.observe(traitsPanelEl, {
                          childList: true,
                          subtree: true,
                        });
                        // Store observer for cleanup
                        (component as any)._traitVisibilityObserver = observer;
                      }
                    }
                  }, 150);
                  
                  // Add event handlers for trait changes - use 'change' event for better compatibility
                  const updateAttributes = () => {
                    const linkType = component.get('linkType');
                    const pageId = component.get('pageLink');
                    const href = component.get('href');
                    
                    if (linkType === 'page') {
                      if (pageId && pageId.trim() !== '') {
                        const normalizedId = pageId.replace(/^#/, '').trim();
                        component.addAttributes({ 'data-page-link': normalizedId });
                        component.set('href', `#${normalizedId}`);
                        const view = component.getView();
                        if (view && view.el) {
                          view.el.setAttribute('data-page-link', normalizedId);
                          view.el.setAttribute('href', `#${normalizedId}`);
                        }
                      } else {
                        component.removeAttributes('data-page-link');
                        component.set('href', '#');
                        const view = component.getView();
                        if (view && view.el) {
                          view.el.removeAttribute('data-page-link');
                          view.el.setAttribute('href', '#');
                        }
                      }
                    } else if (linkType === 'url') {
                      component.removeAttributes('data-page-link');
                      const sanitizedHref = href ? sanitizeExternalHref(href) : '';
                      if (sanitizedHref) {
                        component.set('href', sanitizedHref);
                        const view = component.getView();
                        if (view && view.el) {
                          view.el.setAttribute('href', sanitizedHref);
                        }
                      } else {
                        component.set('href', '#');
                        const view = component.getView();
                        if (view && view.el) {
                          view.el.setAttribute('href', '#');
                        }
                      }
                    } else if (linkType === 'none') {
                      component.removeAttributes('data-page-link');
                      component.removeAttributes('href');
                    }
                    
                    // Force component update
                      component.trigger('change');
                      editor.trigger('component:update', component);
                  };
                  
                  // Store updateAttributes function on component for access in event handlers
                  (component as any)._updateNavigationAttributes = updateAttributes;
                  
                  // Store updateTraitVisibility function on component
                  (component as any)._updateTraitVisibility = updateTraitVisibility;
                  
                  // Listen to trait changes - use individual listeners for better reliability
                  component.on('change:linkType', () => {
                    const updateFn = (component as any)._updateNavigationAttributes;
                    if (updateFn) {
                      setTimeout(updateFn, 50);
                    }
                    // Update trait visibility
                    const visibilityFn = (component as any)._updateTraitVisibility;
                    if (visibilityFn) {
                      setTimeout(visibilityFn, 100);
                    }
                    // Re-render traits to show/hide conditional fields
                    setTimeout(() => {
                      if (editor.TraitManager) {
                        // Select the component to update TraitManager target
                        editor.select(component);
                        // Then render traits
                        if (typeof editor.TraitManager.render === 'function') {
                          editor.TraitManager.render();
                        }
                        // Update visibility after render
                        if (visibilityFn) {
                          setTimeout(visibilityFn, 50);
                        }
                      }
                    }, 150);
                  });
                  
                  component.on('change:pageLink', () => {
                    const updateFn = (component as any)._updateNavigationAttributes;
                    if (updateFn) setTimeout(updateFn, 50);
                  });
                  
                  component.on('change:href', () => {
                    const updateFn = (component as any)._updateNavigationAttributes;
                    if (updateFn) setTimeout(updateFn, 50);
                  });
                  
                  // Also listen to trait manager changes via TraitManager events
                  if (editor.TraitManager) {
                    // Override trait update to sync with component
                    const traitManager = editor.TraitManager as any;
                    const originalUpdate = traitManager?.updateTarget;
                    if (originalUpdate) {
                      traitManager.updateTarget = function(target: any) {
                        const result = originalUpdate.call(this, target);
                        if (target && target === component) {
                          setTimeout(() => {
                            const updateFn = (target as any)._updateNavigationAttributes;
                            if (updateFn) updateFn();
                          }, 100);
                        }
                        return result;
                      };
                    }
                    
                    // Listen to trait:update events
                    editor.on('trait:update', (trait: any, target: any) => {
                      if (target && (target === component || (target.cid && component.cid && target.cid === component.cid))) {
                        setTimeout(() => {
                          // Sync trait values to component properties
                          const linkType = target.get('linkType');
                          const pageLink = target.get('pageLink');
                          const href = target.get('href');
                          
                          if (linkType !== undefined) component.set('linkType', linkType);
                          if (pageLink !== undefined) component.set('pageLink', pageLink);
                          if (href !== undefined) component.set('href', href);
                          
                          const updateFn = (target as any)._updateNavigationAttributes;
                          if (updateFn) updateFn();
                        }, 50);
                      }
                    });
                  }
                }
                
                // Always update page options for pageLink trait (whether it was just added or already existed)
                setTimeout(() => {
                  if (editor.TraitManager) {
                    const allTraits = (editor.TraitManager as any).getTraits ? (editor.TraitManager as any).getTraits(component) : [];
                    allTraits.forEach((trait: any) => {
                      if (trait && (trait.get?.('name') === 'pageLink' || trait.name === 'pageLink')) {
                        updatePageOptions(trait);
                      }
                    });
                    // Re-render traits to show updated options
              if (typeof editor.TraitManager.render === 'function') {
                      editor.TraitManager.render();
                    }
                    // Update trait visibility after render
                    const visibilityFn = (component as any)._updateTraitVisibility;
                    if (visibilityFn) {
                      setTimeout(visibilityFn, 50);
                    }
                  }
                }, 100);
              }
            }
            
            // Style panel updates (only if style tab is active)
            if (activeSidebarSection === 'style') {
              // Use debounced update for performance
              debouncedStyleUpdate(component);
            }
              
            // Always render traits panel when component is selected
            if (editor.TraitManager) {
              // Select the component to update TraitManager target
              editor.select(component);
              
              // Then render
                setTimeout(() => {
                if (typeof editor.TraitManager.render === 'function') {
                  editor.TraitManager.render();
                }
                
                  const traitsPanel = document.getElementById('traits-panel');
                  if (traitsPanel) {
                  // Ensure panel is visible
                  traitsPanel.style.display = 'block';
                  traitsPanel.style.visibility = 'visible';
                  traitsPanel.style.opacity = '1';
                  
                  // Render traits - GrapesJS handles the DOM manipulation
                    const tmElement = editor.TraitManager.render();
                  if (tmElement && traitsPanel !== tmElement.parentNode) {
                    // Only append if not already a child
                    traitsPanel.innerHTML = '';
                      traitsPanel.appendChild(tmElement);
                  }
                  
                  // Function to ensure all trait inputs are editable
                  const ensureInputsEditable = () => {
                    const traitInputs = document.querySelectorAll('#traits-panel input, #traits-panel select, #traits-panel textarea');
                    traitInputs.forEach((input: any) => {
                      if (input) {
                        input.style.pointerEvents = 'auto';
                        input.style.cursor = input.tagName === 'SELECT' ? 'pointer' : 'text';
                        input.style.zIndex = '1';
                        input.style.position = 'relative';
                        input.disabled = false;
                        input.readOnly = false;
                        
                        // Ensure input can receive focus and changes
                        input.addEventListener('input', () => {
                          // Trigger component update when input changes
                          if (component) {
                            const updateFn = (component as any)._updateNavigationAttributes;
                            if (updateFn) setTimeout(updateFn, 50);
                          }
                        });
                        
                        input.addEventListener('change', () => {
                          // Trigger component update when select changes
                          if (component) {
                            const updateFn = (component as any)._updateNavigationAttributes;
                            if (updateFn) setTimeout(updateFn, 50);
                          }
                        });
                      }
                    });
                  };
                  
                  ensureInputsEditable();
                  
                  // Use MutationObserver to ensure inputs stay editable even after re-renders
                  const traitsPanelForObserver = document.getElementById('traits-panel');
                  if (traitsPanelForObserver) {
                    const observer = new MutationObserver(() => {
                      ensureInputsEditable();
                    });
                    observer.observe(traitsPanelForObserver, {
                      childList: true,
                      subtree: true,
                      attributes: true,
                      attributeFilter: ['style', 'disabled', 'readonly'],
                    });
                    
                    // Store observer for cleanup
                    (component as any)._traitObserver = observer;
                  }
              }
              }, 200);
            }
            
            if (component) {
              // Ensure component is editable if it has the attribute
              const attrs = component.getAttributes?.() || {};
              if (attrs['data-gjs-editable'] === 'true' || attrs['data-gjs-type'] === 'text') {
                component.set({ editable: true }, { silent: true });
              }
              
              // CRITICAL: Ensure component is stylable and can receive style changes
              component.set({ 
                stylable: true,
                selectable: true,
                hoverable: true
              }, { silent: true });
            }
            
            // Use requestAnimationFrame to defer state updates and prevent loops
            requestAnimationFrame(() => {
              if (destroyed) {
                isSelectingComponent = false;
                return;
              }
              
              // Ensure style tab is active when component is selected
              if (activeSidebarSection !== 'style') {
                setActiveSidebarSection('style');
              }
              
              // Ensure style panel is visible
              const stylePanel = document.getElementById('style-panel');
              if (stylePanel) {
                stylePanel.style.display = 'block';
                stylePanel.style.visibility = 'visible';
                stylePanel.style.opacity = '1';
              }
              
              // Ensure right panel is visible
              const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement;
              if (rightPanel) {
                rightPanel.style.display = 'flex';
                rightPanel.style.visibility = 'visible';
                rightPanel.style.opacity = '1';
              }
              
              // Open style manager and ensure it targets the selected component
              try {
                editor.runCommand('open-sm');
              } catch (e) {
                // Command might not exist, that's okay
              }
              
              // OPTIMIZED: Single render call with debouncing
              debouncedStyleUpdate(component, 50);

              // StyleManager sync on select can push computed styles as bad px (line-height/font-size); fix model + view
              requestAnimationFrame(() => {
                try {
                  const c = editor.getSelected?.();
                  if (c) sanitizeComponentStylesFromGrapes(c);
                } catch (_) {}
              });
              setTimeout(() => {
                try {
                  const c = editor.getSelected?.();
                  if (c) sanitizeComponentStylesFromGrapes(c);
                } catch (_) {}
              }, 80);
              
              // Reset selection flag after a short delay
                setTimeout(() => {
                isSelectingComponent = false;
              }, 150);
            });
          } catch (e) {
            console.warn('Component selected error:', e);
            isSelectingComponent = false; // Reset flag on error
          }
        });
        
        // Handle component deselection - ensure Style Manager stays visible
        editor.on('component:deselected', () => {
          rootContainerRef.current?.classList.remove('ziplofy-wrapper-or-body-selected');
          // cleanup any temporary selection readability fallback
          try {
            const frame = editor?.Canvas?.getFrameEl?.();
            const doc = frame?.contentDocument;
            const fixedNodes = doc?.querySelectorAll?.('[data-ziplofy-temp-text-fix="1"]') || [];
            // #region agent log
            try {
              const firstFixed = (fixedNodes?.[0] as HTMLElement | undefined) || null;
              const fixedCs = firstFixed ? window.getComputedStyle(firstFixed) : null;
              fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-14',hypothesisId:'H34',location:'CustomThemeBuilder.tsx:component:deselected:restore-begin',message:'restoring temporary readability fallback nodes',data:{fixedNodeCount:Number(fixedNodes?.length||0),firstTag:firstFixed?.tagName?.toLowerCase?.()||'',firstClass:String(firstFixed?.className||'').slice(0,120),firstColor:fixedCs?.color||'',firstTextFill:fixedCs?.getPropertyValue?.('-webkit-text-fill-color')||''},timestamp:Date.now()})}).catch(()=>{});
            } catch {}
            // #endregion agent log
            fixedNodes.forEach((n: any) => {
              const el = n as HTMLElement;
              const prevColor = el.getAttribute('data-ziplofy-prev-color') || '';
              const prevTextFill = el.getAttribute('data-ziplofy-prev-text-fill') || '';
              if (prevColor) el.style.setProperty('color', prevColor);
              else el.style.removeProperty('color');
              if (prevTextFill) el.style.setProperty('-webkit-text-fill-color', prevTextFill);
              else el.style.removeProperty('-webkit-text-fill-color');
              el.removeAttribute('data-ziplofy-temp-text-fix');
              el.removeAttribute('data-ziplofy-prev-color');
              el.removeAttribute('data-ziplofy-prev-text-fill');
            });
            // Repair malformed gradient URLs that appear as url(.../linear-gradient(...))
            // after selection transitions. This keeps gradient text visible on deselect.
            const heroTitles = doc?.querySelectorAll?.('.hero-slide-title, .hero-slide-subtitle') || [];
            heroTitles.forEach((n: any) => {
              try {
                const el = n as HTMLElement;
                const cs = window.getComputedStyle(el);
                const bg = String(cs.backgroundImage || '');
                const markerIdx = bg.toLowerCase().indexOf('/linear-gradient(');
                if (markerIdx < 0) return;
                const start = markerIdx + 1;
                const end = bg.lastIndexOf(')');
                if (end <= start) return;
                const encodedGradient = bg.slice(start, end).replace(/["']$/, '');
                const decoded = decodeURIComponent(encodedGradient);
                if (!/^linear-gradient\(/i.test(decoded)) return;
                el.style.setProperty('background-image', decoded, 'important');
                el.style.setProperty('-webkit-background-clip', 'text', 'important');
                el.style.setProperty('background-clip', 'text', 'important');
                el.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
                // #region agent log
                fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-18',hypothesisId:'H38',location:'CustomThemeBuilder.tsx:component:deselected:repair-gradient-url',message:'repaired malformed gradient url on hero title',data:{className:String(el.className||'').slice(0,120),before:bg,after:decoded},timestamp:Date.now()})}).catch(()=>{});
                // #endregion agent log
              } catch {}
            });
            // #region agent log
            fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-19',hypothesisId:'H39',location:'CustomThemeBuilder.tsx:component:deselected:gradient-color-transparent',message:'no forced color override on deselect gradient pass',data:{heroTitleCount:Number(heroTitles?.length||0)},timestamp:Date.now()})}).catch(()=>{});
            // #endregion agent log
            // #region agent log
            try {
              const firstTitle = doc?.querySelector?.('.hero-slide-title') as HTMLElement | null;
              const titleCs = firstTitle ? window.getComputedStyle(firstTitle) : null;
              fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-15',hypothesisId:'H35',location:'CustomThemeBuilder.tsx:component:deselected:restore-end',message:'hero title style after fallback restore',data:{titleColor:titleCs?.color||'',titleTextFill:titleCs?.getPropertyValue?.('-webkit-text-fill-color')||'',titleBgImage:titleCs?.backgroundImage||'',titleBgClip:titleCs?.getPropertyValue?.('-webkit-background-clip')||titleCs?.getPropertyValue?.('background-clip')||''},timestamp:Date.now()})}).catch(()=>{});
            } catch {}
            // #endregion agent log
          } catch {}
          // #region agent log
          try {
            fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass',hypothesisId:'H19',location:'CustomThemeBuilder.tsx:component:deselected:colorSnapshot',message:'last selected snapshot before deselect clear',data:lastSelectedColorSnapshot||{},timestamp:Date.now()})}).catch(()=>{});
          } catch {}
          // #endregion agent log
          // Clear cached component ID when deselected
          lastSelectedComponentId = null;
          setLinksPanelData(null);
          setImagePanelData(null);
        });

        // Ensure style changes are applied - listen to style property changes
        // This is the primary handler - will be supplemented by the more detailed one below
        // Track changes to detect unsaved modifications
        editor.on('component:update', () => {
          if (!saving) {
            setHasUnsavedChanges(true);
          }
        });
        
        editor.on('component:add', () => {
          if (!saving) {
            setHasUnsavedChanges(true);
          }
        });
        
        editor.on('component:remove', () => {
          if (!saving) {
            setHasUnsavedChanges(true);
          }
        });
        
        editor.on('style:property:update', (data: any) => {
          try {
            // GrapesJS passes a single data object; extract property name and value
            const prop = data?.property ?? data;
            const propName = typeof prop === 'string' ? prop : (prop?.get?.('property') ?? prop?.getName?.());
            const value = (prop && prop.getFullValue ? prop.getFullValue() : undefined) ?? (prop && prop.getValue ? prop.getValue() : undefined) ?? data?.value;
            const component = data?.component ?? editor.getSelected();

            if (!propName || value === undefined || value === null) return;

            // Block default black/empty color sync noise on select-deselect.
            // These values are emitted by StyleManager during focus transitions and can override theme text colors.
            const blackColorPattern = /^(rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0[^)]*\)|rgb\(0\s+0\s+0(?:\s*\/\s*[\d.]+)?\)|black|#000(?:000)?(?:ff)?)$/i;
            const colorPropName = String(propName).trim().toLowerCase();
            const rawColorValue = String(value).trim();
            const isColorProp = colorPropName === 'color' || colorPropName === '-webkit-text-fill-color';
            const isDefaultBlack = isColorProp && blackColorPattern.test(rawColorValue);
            const isEmptyColorReset = isColorProp && rawColorValue === '';
            // #region agent log
            if (propName === 'color' || propName === '-webkit-text-fill-color') {
              fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass',hypothesisId:'H17',location:'CustomThemeBuilder.tsx:style:property:update:color',message:'style property color update candidate',data:{propName,raw:String(value),isDefaultBlack,isEmptyColorReset},timestamp:Date.now()})}).catch(()=>{});
              if (isDefaultBlack || isEmptyColorReset) {
                const selectedForColor = component || editor.getSelected?.();
                const selEl = selectedForColor?.getEl?.() as HTMLElement | null;
                const selCs = selEl ? window.getComputedStyle(selEl) : null;
                fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-2',hypothesisId:'H21',location:'CustomThemeBuilder.tsx:style:property:update:blockedColor',message:'blocked color write snapshot',data:{propName,raw:rawColorValue,computedColor:selCs?.color||'',computedTextFill:selCs?.getPropertyValue?.('-webkit-text-fill-color')||'',tag:selectedForColor?.get?.('tagName')||''},timestamp:Date.now()})}).catch(()=>{});
                try {
                  const isHeroTitle = /hero-slide-title/.test(String(selEl?.className || ''));
                  if (isHeroTitle) {
                    const st = selectedForColor?.getStyle?.() || {};
                    const ns = { ...st };
                    delete ns.color;
                    // Keep -webkit-text-fill-color on hero title — transparent is required for gradient text.
                    selectedForColor?.setStyle?.(ns);

                    const classes = selectedForColor?.getClasses?.() || [];
                    const componentClass = classes.find((c: string) => c && !c.startsWith('gjs-')) || '';
                    if (componentClass && editor?.CssComposer) {
                      const rule = editor.CssComposer.getRule(`.${componentClass}`);
                      if (rule) {
                        const rs = { ...(rule.get('style') || {}) };
                        delete rs.color;
                        rule.set('style', rs);
                      }
                    }
                    fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-10',hypothesisId:'H30',location:'CustomThemeBuilder.tsx:style:property:update:hero-poison-cleanup',message:'cleaned hero title poison in blocked color path',data:{propName,raw:rawColorValue,componentClass},timestamp:Date.now()})}).catch(()=>{});
                  }
                } catch {}
              }
            }
            // #endregion agent log
            if (isDefaultBlack || isEmptyColorReset) return;

            const normalizedVal = normalizeStyleManagerCSSValue(propName, String(value));
            if (normalizedVal === null) return;

            if (isStyleManagerLayoutNoise(propName)) {
              return;
            }

            if (!saving) {
              setHasUnsavedChanges(true);
            }

            const selected = component || editor.getSelected();
            if (!selected) return;
            const selectedElForColor = selected?.getEl?.() as HTMLElement | null;
            const isHeroTitleSelected = /hero-slide-title/.test(String(selectedElForColor?.className || ''));
            if (isColorProp && isHeroTitleSelected) {
              // Hero title color must be theme-derived (gradient). Ignore all direct color writes from StyleManager.
              fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-21',hypothesisId:'H41',location:'CustomThemeBuilder.tsx:style:property:update:skip-hero-title-color',message:'skipped hero title color write to preserve gradient text',data:{propName,raw:rawColorValue},timestamp:Date.now()})}).catch(()=>{});
              return;
            }
            const selectedTag = String(selected?.get?.('tagName') || '').toLowerCase();
            const isWrapperOrBodySelected = selected === editor.getWrapper() || selectedTag === 'body';
            if (isWrapperOrBodySelected && isColorProp) {
              fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-5',hypothesisId:'H25',location:'CustomThemeBuilder.tsx:style:property:update:skip-wrapper-color',message:'skip wrapper/body color mutation',data:{propName,raw:rawColorValue,selectedTag},timestamp:Date.now()})}).catch(()=>{});
              return;
            }

            selected.set({ stylable: true }, { silent: true });

            const propVal = normalizedVal;

            // CRITICAL: Special handling for wrapper/body element
            const isWrapper = selected === editor.getWrapper();
            if (isWrapper) {
              const classes = selected.getClasses();
              if (!classes.includes('gjs-wrapper-body')) {
                selected.addClass('gjs-wrapper-body');
              }
              if (editor.CssComposer) {
                const rule = editor.CssComposer.getRule('.gjs-wrapper-body') || editor.CssComposer.add('.gjs-wrapper-body');
                if (rule) {
                  const currentStyles = rule.get('style') || {};
                  currentStyles[propName] = propVal;
                  rule.set('style', currentStyles);
                }
              }
            } else {
              if (typeof selected.addStyle === 'function') {
                selected.addStyle({ [propName]: propVal });
              } else {
                const currentStyles = selected.getStyle() || {};
                currentStyles[propName] = propVal;
                selected.setStyle(currentStyles);
              }
              if (editor.CssComposer) {
                const componentId = selected.cid || selected.getId?.();
                if (componentId) {
                  const classes = selected.getClasses();
                  let componentClass = classes.find((c: string) => c && !c.startsWith('gjs-'));
                  if (!componentClass) {
                    componentClass = `gjs-comp-${componentId}`;
                    selected.addClass(componentClass);
                  }
                  const selector = `.${componentClass}`;
                  let rule = editor.CssComposer.getRule(selector);
                  if (!rule) rule = editor.CssComposer.add(selector);
                  if (rule) {
                    const ruleStyles = rule.get('style') || {};
                    ruleStyles[propName] = propVal;
                    rule.set('style', ruleStyles);
                  }
                }
              }
            }

            requestAnimationFrame(() => {
              try {
                const el = selected.getEl?.();
                if (el) {
                  if (selected.view?.updateStyle) selected.view.updateStyle();
                  selected.trigger('change:style');
                  editor.refresh();
                  selected.trigger('component:update');
                  const cssProp = propName.replace(/([A-Z])/g, '-$1').toLowerCase();
                  // Only force !important inline for text/paint — StyleManager sync on select often
                  // pushes computed layout (width, flex, display) and nukes theme flex rows (header collapse).
                  const INLINE_IMPORTANT_OK = new Set([
                    'color',
                    'background-color',
                    'font-size',
                    'line-height',
                    'font-family',
                    'font-weight',
                    'font-style',
                    'letter-spacing',
                    'text-align',
                    'text-decoration',
                    'text-transform',
                    '-webkit-text-fill-color',
                    'opacity',
                    'caret-color',
                  ]);
                  if (INLINE_IMPORTANT_OK.has(cssProp)) {
                    el.style.setProperty(cssProp, propVal, 'important');
                  } else if (
                    /^(width|height|min-|max-|display|flex|grid|margin|padding|position|top|right|bottom|left|float|gap|align|justify|overflow|box-sizing|vertical-align|object-fit)/.test(
                      cssProp
                    )
                  ) {
                  }
                }
              } catch (e) {
                console.warn('Error updating component view:', e);
              }
            });
          } catch (e) {
            console.warn('Style property update error:', e);
          }
        });

        // Also listen for style changes
        editor.on('style:change', (style: any, component: any) => {
          try {
            const selected = component || editor.getSelected();
            if (selected) {
              // Ensure component is stylable
              selected.set({ stylable: true });
              
              // Ensure styles are applied
              selected.view?.updateStyle?.();
              // Trigger component update
              selected.trigger('change:style');
              // Force canvas refresh
              editor.refresh();
          }
        } catch (e) {
            console.warn('Style change error:', e);
        }
        });

        // Listen for component style updates
        editor.on('component:styleUpdate', (component: any) => {
          try {
            if (!saving) {
              setHasUnsavedChanges(true);
            }
            if (component) {
              component.set({ stylable: true }, { silent: true });
              
              // CRITICAL FIX: Ensure wrapper/body styles are saved as CSS rules, not inline
              const isWrapper = component === editor.getWrapper();
              if (isWrapper) {
                  // Force wrapper to use CSS class for styling
                const classes = component.getClasses();
                  if (!classes.includes('gjs-wrapper-body')) {
                  component.addClass('gjs-wrapper-body');
                  }
                
                  // Get wrapper styles and ensure they're in CSS rules
                const styles = component.getStyle();
                  if (styles && Object.keys(styles).length > 0 && editor.CssComposer) {
                  // Find or create CSS rule for wrapper
                    const existingRule = editor.CssComposer.getRule('.gjs-wrapper-body');
                  if (existingRule) {
                    // Update existing rule
                      existingRule.set('style', styles);
                    } else {
                    // Create new rule
                      const newRule = editor.CssComposer.add('.gjs-wrapper-body');
                    if (newRule) {
                        newRule.set('style', styles);
                      }
                    }
                  
                    console.log('✓ Wrapper styles saved as CSS rule:', styles);
                }
              }
              
              component.view?.updateStyle?.();
              editor.refresh();
            }
          } catch (e) {
            console.warn('Component style update error:', e);
          }
        });

        // Enable double-click to edit ANY element with text content - IMPROVED for easier editing
        editor.on('component:dblclick', (component: any) => {
          try {
            if (!component) return;
            
            const tagName = component.get('tagName')?.toLowerCase();
            const compType = component.get('type');
            const attrs = component.getAttributes?.() || {};
            const content = component.get('content') || '';
            
            // Check if it's a text element or has text content
            const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'label', 'li', 'td', 'th', 'button', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup', 'blockquote', 'cite'];
            const isTextElement = textTags.includes(tagName);
            const hasTextContent = typeof content === 'string' && content.trim().length > 0 && !component.components().length;
            const isEditable = attrs['data-gjs-editable'] === 'true' || 
                             attrs['data-gjs-type'] === 'text' ||
                             compType === 'text' ||
                             isTextElement ||
                             hasTextContent;
            
            if (isEditable) {
              // Enable editing if not already enabled
              if (!component.get('editable')) {
                component.set({
                  editable: true,
                  type: 'text'
                });
              }
              
              // Trigger edit mode using GrapesJS command
              editor.runCommand('core:component-edit', { force: true });
            }
          } catch (e) {
            console.warn('Error enabling double-click editing:', e);
          }
        });

        // Helper function to safely render Style Manager without duplicates
        // OPTIMIZED: Uses caching and reduced DOM manipulation
        let safeRenderTimeout: any = null;
        let lastRenderTime = 0;
        const MIN_RENDER_INTERVAL = 50; // Reduced from 200ms to 50ms for faster updates
        
        const safeRenderStyleManager = (forceRender = false) => {
          try {
            // Only render if style tab is active
            if (activeSidebarSection !== 'style') return;
            
            // Throttle renders with requestAnimationFrame for better performance
            const now = Date.now();
            if (!forceRender && now - lastRenderTime < MIN_RENDER_INTERVAL) {
              // Use requestAnimationFrame instead of setTimeout for smoother updates
              if (safeRenderTimeout) cancelAnimationFrame(safeRenderTimeout as any);
              safeRenderTimeout = requestAnimationFrame(() => safeRenderStyleManager(true)) as any;
              return;
            }
            lastRenderTime = now;
            if (safeRenderTimeout) {
              cancelAnimationFrame(safeRenderTimeout as any);
              safeRenderTimeout = null;
            }

            // Use cached panel reference
            if (!cachedStylePanel) {
              cachedStylePanel = document.getElementById('style-panel');
            }
            
            if (!cachedStylePanel || !editor.StyleManager) return;
            
            const stylePanel = cachedStylePanel;
            
            // Quick check - if sectors exist and not forcing, skip render (CSS handles styling)
            const existingSectors = stylePanel.querySelectorAll('.gjs-sm-sector');
            if (existingSectors.length > 0 && existingSectors.length <= 13 && !forceRender) {
              return; // Already rendered correctly
            }
            
            // Only re-render if forced or duplicates detected
            if (existingSectors.length > 13) {
              stylePanel.innerHTML = '';
            }
            
            // Check if needs render
            const needsRender = forceRender || existingSectors.length === 0 || existingSectors.length > 13;
            if (!needsRender) return;
            
            // Render Style Manager efficiently
            if (typeof editor.StyleManager.render === 'function') {
              // Get target
              const selected = editor.getSelected();
                const target = selected || editor.getWrapper();
              
              // Set target and render
                      if (target) {
                try {
                  target.set({ stylable: true }, { silent: true });
                      
                      // CRITICAL: Ensure component has a CSS class for style rules
                      if (editor.CssComposer && target !== editor.getWrapper()) {
                        const compId = target.cid || target.getId?.();
                        if (compId) {
                          const compClasses = target.getClasses();
                          let compClass = compClasses.find((c: string) => c && !c.startsWith('gjs-'));
                          
                          if (!compClass) {
                            compClass = `gjs-comp-${compId}`;
                            target.addClass(compClass);
                          }
                        }
                      }
                      
                      if ((editor.StyleManager as any).setTarget) {
                          (editor.StyleManager as any).setTarget(target);
                        }
                } catch {}
              }
              
              // Always render to ensure Style Manager is up to date
              // This is critical for style properties to work correctly
              // CRITICAL: Only render if style tab is active
              if (activeSidebarSection === 'style') {
                  stylePanel.innerHTML = '';
                  editor.StyleManager.render();
              }
                  
              // Set target again after render to ensure it's properly bound
              if (target && (editor.StyleManager as any).setTarget) {
                      (editor.StyleManager as any).setTarget(target);
                    }
            }
          } catch (e) {
            console.warn('Error rendering Style Manager:', e);
          }
        };

        // Ensure components maintain their editable state
        editor.on('component:update', (component: any) => {
          try {
            if (!component) return;
            const attrs = component.getAttributes?.() || {};
            if (attrs['data-gjs-editable'] === 'true' || attrs['data-gjs-type'] === 'text') {
              component.set({ editable: true, selectable: true }, { silent: true });
            }
            // Ensure component remains stylable (use silent to prevent undo issues)
            component.set({ stylable: true }, { silent: true });
          } catch {}
        });

        // Listen for Style Manager field changes directly
        editor.on('style:custom', (property: any, value: any, component: any) => {
          try {
            const selected = component || editor.getSelected();
            if (selected && property && value !== undefined) {
              selected.set({ stylable: true }, { silent: true });
              const propKey = String(property);
              const blackColorPattern = /^(rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0[^)]*\)|rgb\(0\s+0\s+0(?:\s*\/\s*[\d.]+)?\)|black|#000(?:000)?(?:ff)?)$/i;
              const colorPropKey = propKey.trim().toLowerCase();
              const rawColorValue = String(value).trim();
              const isColorProp = colorPropKey === 'color' || colorPropKey === '-webkit-text-fill-color';
              const isDefaultBlack = isColorProp && blackColorPattern.test(rawColorValue);
              const isEmptyColorReset = isColorProp && rawColorValue === '';
              // #region agent log
              if (propKey === 'color' || propKey === '-webkit-text-fill-color') {
                fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass',hypothesisId:'H18',location:'CustomThemeBuilder.tsx:style:custom:color',message:'style custom color update candidate',data:{property:propKey,raw:String(value),isDefaultBlack,isEmptyColorReset},timestamp:Date.now()})}).catch(()=>{});
              }
              // #endregion agent log
              if (isDefaultBlack || isEmptyColorReset) return;
              const selectedTag = String(selected?.get?.('tagName') || '').toLowerCase();
              const isWrapperOrBodySelected = selected === editor.getWrapper() || selectedTag === 'body';
              if (isWrapperOrBodySelected && isColorProp) {
                fetch('http://127.0.0.1:7524/ingest/80cc1e14-e0cc-49d1-bb1b-2091c52c2ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dd1c3'},body:JSON.stringify({sessionId:'5dd1c3',runId:'black-text-pass-5',hypothesisId:'H25',location:'CustomThemeBuilder.tsx:style:custom:skip-wrapper-color',message:'skip wrapper/body color mutation (custom)',data:{property:propKey,raw:rawColorValue,selectedTag},timestamp:Date.now()})}).catch(()=>{});
                return;
              }
              const normalized = normalizeStyleManagerCSSValue(String(property), String(value));
              if (normalized === null) return;
              if (isStyleManagerLayoutNoise(String(property))) return;
              const safeVal = normalized;
              
              // Apply style using addStyle
              if (typeof selected.addStyle === 'function') {
                selected.addStyle(property, safeVal);
              } else {
                const currentStyles = selected.getStyle() || {};
                currentStyles[property] = safeVal;
                selected.setStyle(currentStyles);
              }
              
              // Ensure component has a class for CSS rules (when avoidInlineStyle is true)
              if (editor.CssComposer) {
                const componentId = selected.cid || selected.getId?.();
                if (componentId) {
                  const classes = selected.getClasses();
                  let componentClass = classes.find((c: string) => c && !c.startsWith('gjs-'));
                  
                  if (!componentClass) {
                    componentClass = `gjs-comp-${componentId}`;
                    selected.addClass(componentClass);
                  }
                  
                  const selector = `.${componentClass}`;
                  let rule = editor.CssComposer.getRule(selector);
                  if (!rule) {
                    rule = editor.CssComposer.add(selector);
                  }
                  
                  if (rule) {
                    const ruleStyles = rule.get('style') || {};
                    ruleStyles[property] = safeVal;
                    rule.set('style', ruleStyles);
                  }
                }
              }
              
              // Force update
              requestAnimationFrame(() => {
                selected.view?.updateStyle?.();
                selected.trigger('change:style');
                editor.refresh();
              });
            }
          } catch (e) {
            console.warn('Style custom error:', e);
          }
        });
        
        // Listen to Style Manager's internal change events (debounced)
        let changeTimeout: any = null;
        editor.on('change', () => {
          if (changeTimeout) clearTimeout(changeTimeout);
          changeTimeout = setTimeout(() => {
          try {
            const selected = editor.getSelected();
            if (selected && editor.StyleManager) {
              const styles = selected.getStyle();
              if (styles && Object.keys(styles).length > 0) {
                selected.view?.updateStyle?.();
                editor.refresh();
              }
            }
            } catch {}
          }, 100);
        });

        const enforcePanelVisibility = () => {
          if (destroyed) return;
          const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement;
          if (rightPanel) {
            rightPanel.style.display = 'flex';
            rightPanel.style.visibility = 'visible';
            rightPanel.style.opacity = '1';
            rightPanel.style.width = '300px';
            rightPanel.style.flexShrink = '0';
          }
          
          const stylePanel = document.getElementById('style-panel');
          if (stylePanel) {
            stylePanel.style.display = 'block';
            stylePanel.style.visibility = 'visible';
            stylePanel.style.opacity = '1';
            stylePanel.style.width = '100%';
          }
        };

        // Handle fullscreen mode - sync class with root container
        const checkFullscreen = () => {
          try {
            if (rootContainerRef.current) {
              const editorEl = editor.getEl?.();
              const isFullscreen = editorEl?.classList.contains('gjs-fullscreen') || 
                                   document.querySelector('.gjs-editor.gjs-fullscreen') !== null;
              
              if (isFullscreen) {
                rootContainerRef.current.classList.add('gjs-fullscreen');
                
                // Ensure all interactive elements are visible and functional in fullscreen
                setTimeout(() => {
                  try {
                    // Force visibility of all buttons
                    const allButtons = rootContainerRef.current?.querySelectorAll('button');
                    allButtons?.forEach((btn: any) => {
                      if (btn) {
                        btn.style.display = 'flex';
                        btn.style.visibility = 'visible';
                        btn.style.opacity = '1';
                        btn.style.pointerEvents = 'auto';
                        btn.style.cursor = 'pointer';
                        btn.style.zIndex = '10001';
                      }
                    });
                    
                    // Force visibility of all inputs
                    const allInputs = rootContainerRef.current?.querySelectorAll('input, select, textarea');
                    allInputs?.forEach((input: any) => {
                      if (input) {
                        input.style.display = 'block';
                        input.style.visibility = 'visible';
                        input.style.opacity = '1';
                        input.style.pointerEvents = 'auto';
                        input.style.zIndex = '10001';
                      }
                    });
                    
                    // Ensure panels are interactive and visible
                    const leftPanel = rootContainerRef.current?.querySelector('.builder-left-panel') as HTMLElement;
                    const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement;
                    const centerPanel = rootContainerRef.current?.querySelector('.builder-center-panel') as HTMLElement;
                    
                    if (leftPanel) {
                      leftPanel.style.display = 'flex';
                      leftPanel.style.visibility = 'visible';
                      leftPanel.style.opacity = '1';
                      leftPanel.style.pointerEvents = 'auto';
                      leftPanel.style.width = '280px';
                      leftPanel.style.zIndex = '10001';
                    }
                    
                    if (rightPanel) {
                      rightPanel.style.display = 'flex';
                      rightPanel.style.visibility = 'visible';
                      rightPanel.style.opacity = '1';
                      rightPanel.style.pointerEvents = 'auto';
                      rightPanel.style.width = '300px';
                      rightPanel.style.zIndex = '10001';
                    }
                    
                    if (centerPanel) {
                      centerPanel.style.display = 'flex';
                      centerPanel.style.visibility = 'visible';
                      centerPanel.style.opacity = '1';
                      centerPanel.style.pointerEvents = 'auto';
                    }
                    
                    // Force Style Manager to render in fullscreen
                    const stylePanel = rootContainerRef.current?.querySelector('#style-panel') as HTMLElement;
                    if (stylePanel && editor.StyleManager) {
                      stylePanel.style.display = 'block';
                      stylePanel.style.visibility = 'visible';
                      stylePanel.style.opacity = '1';
                      stylePanel.style.background = '#ffffff';
                      stylePanel.style.minHeight = '200px';
                      
                      const existingSectors = stylePanel.querySelectorAll('.gjs-sm-sector');
                      if (existingSectors.length === 0 || existingSectors.length < 13) {
                        // Not rendered or incomplete - force render
                        // CRITICAL: Only render if style tab is active
                        if (activeSidebarSection === 'style' && typeof editor.StyleManager.render === 'function') {
                          editor.StyleManager.render();
                        }
                      }
                      
                      // Ensure all sectors are visible
                      setTimeout(() => {
                        const sectors = stylePanel.querySelectorAll('.gjs-sm-sector');
                        sectors.forEach((sector: any) => {
                          if (sector) {
                            sector.style.display = 'block';
                            sector.style.visibility = 'visible';
                            sector.style.opacity = '1';
                          }
                        });
                      }, 100);
                    }
                    
                    // Ensure device switcher is visible
                    const devicesPanel = rootContainerRef.current?.querySelector('.panel__devices') as HTMLElement;
                    if (devicesPanel) {
                      devicesPanel.style.display = 'flex';
                      devicesPanel.style.visibility = 'visible';
                      devicesPanel.style.opacity = '1';
                      devicesPanel.style.pointerEvents = 'auto';
                    }
                  } catch (e) {
                    console.warn('Error ensuring fullscreen elements visibility:', e);
                  }
                }, 50);
              } else {
                rootContainerRef.current.classList.remove('gjs-fullscreen');
              }
            }
          } catch {}
        };
        
        const fullscreenEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'] as const;
        const handleFullscreenChange = () => {
          if (destroyed) return;
          checkFullscreen();
        };
        fullscreenEvents.forEach((evt) => {
          document.addEventListener(evt as any, handleFullscreenChange, { passive: true } as AddEventListenerOptions);
          registerCleanup(() => document.removeEventListener(evt as any, handleFullscreenChange));
        });
        checkFullscreen();
        
        // Also check on editor load
        editor.on('load', () => {
          setTimeout(checkFullscreen, 100);
          // Set initial device
          try {
            const initialDevice = editor.getDevice();
            if (initialDevice) {
              setCurrentDevice(initialDevice);
            }
          } catch {}
        });
        
        // Listen for device changes
        editor.on('change:device', () => {
          try {
            const device = editor.getDevice();
            if (device) {
              setCurrentDevice(device);
            }
            renderDeviceSwitcher();
          } catch {}
        });
        
        // Listen for fullscreen toggle to force Style Manager render
        editor.on('run:fullscreen', () => {
          setTimeout(() => {
            try {
            const stylePanel = document.getElementById('style-panel');
              if (stylePanel && editor.StyleManager) {
                // Force visibility
              stylePanel.style.display = 'block';
              stylePanel.style.visibility = 'visible';
              stylePanel.style.opacity = '1';
                stylePanel.style.background = '#ffffff';
                
                // Force render Style Manager
                // CRITICAL: Only render if style tab is active
                if (activeSidebarSection === 'style' && typeof editor.StyleManager.render === 'function') {
                  editor.StyleManager.render();
                }
                
                // Ensure all sectors are visible
                setTimeout(() => {
                  const sectors = stylePanel.querySelectorAll('.gjs-sm-sector');
                  sectors.forEach((sector: any) => {
                    if (sector) {
                      sector.style.display = 'block';
                      sector.style.visibility = 'visible';
                      sector.style.opacity = '1';
                    }
                  });
                }, 100);
              }
            } catch (e) {
              console.warn('Error rendering Style Manager on fullscreen:', e);
            }
          }, 200);
        });

        // Ensure device switcher buttons are visible
        const renderDeviceSwitcher = () => {
          if (destroyed) return;
          try {
            const devicesPanel = document.querySelector('.panel__devices');
            if (devicesPanel) {
              const buttons = devicesPanel.querySelectorAll('button');
              buttons.forEach((btn: any) => {
                if (btn) {
                  btn.style.display = 'flex';
                  btn.style.visibility = 'visible';
                  btn.style.opacity = '1';
                }
              });
            }
          } catch {}
        };

        // Render blocks and ensure they're visible
        const renderBlocks = (force: boolean = false) => {
          if (destroyed) return;
          
          // CRITICAL: Check if blocks are actually registered
          const bm = editor.BlockManager;
          if (!bm) {
            console.warn('⚠️ BlockManager not available in renderBlocks');
            return;
          }
          
          // Check how many blocks are registered
          const registeredBlocks = bm.getAll ? bm.getAll() : [];
          const registeredCount = Array.isArray(registeredBlocks) ? registeredBlocks.length : 0;
          
          if (registeredCount === 0) {
            console.error('❌ CRITICAL: No blocks registered in BlockManager! Cannot render.');
            return;
          }
          
          console.log(`🔄 renderBlocks called: ${registeredCount} blocks registered, force=${force}`);
          
          // Always allow rendering when force is true or when widgets tab is active
          if (!force && blocksRenderedRef.current) {
            // Check if blocks actually exist in DOM
            const panel = document.getElementById('blocks-panel');
            const existingBlocks = panel?.querySelectorAll('.gjs-block');
            if (existingBlocks && existingBlocks.length > 0) {
              console.log(`✅ Blocks already rendered (${existingBlocks.length} found), skipping`);
              return; // Blocks exist, no need to re-render
            }
            // Blocks don't exist in DOM, allow re-render
            console.log('⚠️ blocksRenderedRef is true but no blocks in DOM, re-rendering...');
          }
          
          try {
            const blocksPanel = document.getElementById('blocks-panel');
            if (!blocksPanel) {
              console.warn('⚠️ blocks-panel not found, retrying...');
              setTimeout(() => renderBlocks(force), 200);
              return;
            }

            // CRITICAL: Ensure wrapper is visible before rendering
            // GrapesJS won't render into hidden elements
            const wrapper = blocksPanel.closest('.elementor-blocks-wrapper');
            if (wrapper) {
              const wrapperEl = wrapper as HTMLElement;
              const computedStyle = window.getComputedStyle(wrapperEl);
              
              // Force visibility with !important to override React styles
              wrapperEl.style.setProperty('display', 'block', 'important');
              wrapperEl.style.setProperty('visibility', 'visible', 'important');
              wrapperEl.style.setProperty('opacity', '1', 'important');
              
              // Verify it's actually visible
              const afterStyle = window.getComputedStyle(wrapperEl);
              if (afterStyle.display === 'none') {
                console.error('Wrapper is still hidden after forcing visibility!');
                setTimeout(() => renderBlocks(force), 100);
                return;
              }
            }

            // Ensure blocks-panel itself is visible
            blocksPanel.style.setProperty('display', 'block', 'important');
            blocksPanel.style.setProperty('visibility', 'visible', 'important');
            blocksPanel.style.setProperty('opacity', '1', 'important');
            blocksPanel.style.setProperty('min-height', '200px', 'important');

            // Clear any existing content to prevent duplicates
                blocksPanel.innerHTML = '';
            
            // Remove any duplicate blocks-panel elements
            const allPanels = document.querySelectorAll('#blocks-panel');
            if (allPanels.length > 1) {
              for (let i = 1; i < allPanels.length; i++) {
                allPanels[i].remove();
              }
            }

            // CRITICAL: Verify blocks are registered before rendering
            const registeredBlocks = editor.BlockManager.getAll ? editor.BlockManager.getAll() : [];
            const registeredCount = Array.isArray(registeredBlocks) ? registeredBlocks.length : 0;
            
            if (registeredCount === 0) {
              console.error('❌ CRITICAL: No blocks registered in BlockManager! Cannot render.');
              console.error('BlockManager state:', {
                hasGetAll: !!editor.BlockManager.getAll,
                hasRender: !!editor.BlockManager.render,
                hasGetCategories: !!editor.BlockManager.getCategories
              });
              return;
            }
            
            console.log(`🔄 Rendering ${registeredCount} registered blocks into blocks-panel...`);

            // Render blocks
            try {
              // Get registered blocks count first
              const allRegisteredBlocks = editor.BlockManager.getAll ? editor.BlockManager.getAll() : [];
              const registeredArray = Array.isArray(allRegisteredBlocks) ? allRegisteredBlocks : [];
              console.log(`🔄 renderBlocks: Attempting to render ${registeredArray.length} registered blocks...`);
              
              const renderResult = editor.BlockManager.render();
              console.log('✅ BlockManager.render() called successfully');
            blocksRenderedRef.current = true; // Mark as rendered
              
              // Check if blocks were actually rendered
              setTimeout(() => {
                const renderedBlocks = blocksPanel.querySelectorAll('.gjs-block');
                if (renderedBlocks.length === 0 && registeredArray.length > 0) {
                  console.warn('⚠️ BlockManager.render() returned 0 blocks, using manual render fallback...');
                  // Use the same manual render logic as in the initial render
                  renderBlocksManually(blocksPanel, registeredArray, editor.BlockManager, editor);
                }
              }, 200);
            } catch (renderError) {
              console.error('❌ Error calling BlockManager.render():', renderError);
              blocksRenderedRef.current = false; // Mark as not rendered on error
            }

            // Force visibility of all blocks and ensure they're draggable
            setTimeout(() => {
              const blocksPanel = document.getElementById('blocks-panel');
              if (blocksPanel) {
                // Remove TOP duplicate categories only (keep BOTTOM working set)
                const categoryElements = blocksPanel.querySelectorAll('.gjs-block-category');
                const categoryByName = new Map<string, { el: Element; blockCount: number }[]>();
                categoryElements.forEach((cat: Element) => {
                  const titleEl = cat.querySelector('.gjs-title') || cat.querySelector('.gjs-block-category-title');
                  const label = (titleEl?.textContent || '').trim() || 'Uncategorized';
                  const blocksContainer = cat.querySelector('.gjs-blocks-c') || cat.querySelector('.gjs-block-category-blocks');
                  const blockCount = blocksContainer ? blocksContainer.querySelectorAll('.gjs-block').length : 0;
                  if (!categoryByName.has(label)) categoryByName.set(label, []);
                  categoryByName.get(label)!.push({ el: cat, blockCount });
                });
                categoryByName.forEach((entries) => {
                  if (entries.length <= 1) return;
                  // Remove TOP (first) occurrence only - keep BOTTOM (working) section
                  entries[0].el.remove();
                });

                const allBlocks = blocksPanel.querySelectorAll('.gjs-block');
                const categoryBlocks = blocksPanel.querySelectorAll('.gjs-block-category-blocks');
                
                console.log(`📊 After render: ${allBlocks.length} blocks, ${categoryBlocks.length} category containers, ${categoryElements.length} categories`);
                
                if (allBlocks.length === 0 && registeredCount > 0) {
                  console.error('❌ CRITICAL: Blocks were registered but not rendered! Retrying...');
                  // Retry render
                  blocksPanel.innerHTML = '';
                  try {
                    editor.BlockManager.render();
                    console.log('🔄 Retry render called');
                  } catch (e) {
                    console.error('❌ Retry render failed:', e);
                  }
                  return; // Will be checked again in next timeout
                }
                
                // CRITICAL: Ensure grid layout is applied to all category blocks containers
                categoryBlocks.forEach((container: any) => {
                  container.style.setProperty('display', 'grid', 'important');
                  container.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                  container.style.setProperty('gap', '10px', 'important');
                  container.style.setProperty('width', '100%', 'important');
                  container.style.setProperty('box-sizing', 'border-box', 'important');
                });
                
                // Remove any duplicate blocks
                const seen = new Set();
                allBlocks.forEach((block: any) => {
                  const blockId = block.getAttribute('data-gjs-type') + '-' + block.textContent;
                  if (seen.has(blockId)) {
                    block.remove();
                  } else {
                    seen.add(blockId);
                    block.style.setProperty('display', 'flex', 'important');
                    block.style.setProperty('visibility', 'visible', 'important');
                    block.style.setProperty('opacity', '1', 'important');
                    block.style.setProperty('pointer-events', 'auto', 'important');
                    block.style.setProperty('cursor', 'grab', 'important');
                    block.style.setProperty('position', 'relative', 'important');
                    block.style.setProperty('z-index', '1', 'important');
                    // CRITICAL: Ensure blocks fit in grid
                    block.style.setProperty('width', '100%', 'important');
                    block.style.setProperty('max-width', '100%', 'important');
                    block.style.setProperty('min-width', '0', 'important');
                    block.style.setProperty('box-sizing', 'border-box', 'important');
                  }
                });
                
                // Log final count
                const finalBlocks = blocksPanel.querySelectorAll('.gjs-block');
                console.log(`✅ Final blocks count: ${finalBlocks.length} blocks rendered and visible`);
                
                // Ensure categories are properly set up
                const categories = blocksPanel.querySelectorAll('.gjs-block-category');
                categories.forEach((cat: any) => {
                  cat.style.position = 'relative';
                  cat.style.zIndex = '1';
                  cat.style.display = 'block';
                  cat.style.visibility = 'visible';
                  
                  // Make category titles clickable to toggle expand/collapse
                  const categoryTitle = cat.querySelector('.gjs-title') || cat.querySelector('.gjs-block-category-title');
                  if (categoryTitle && !categoryTitle.hasAttribute('data-toggle-bound')) {
                    categoryTitle.setAttribute('data-toggle-bound', 'true');
                    categoryTitle.addEventListener('click', (e: Event) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const isOpen = cat.getAttribute('data-open') !== 'false';
                      const categoryBlocks = cat.querySelector('.gjs-block-category-blocks');
                      
                      if (isOpen) {
                        // Collapse
                    cat.setAttribute('data-open', 'false');
                    if (categoryBlocks) {
                          (categoryBlocks as HTMLElement).style.display = 'none';
                        }
                      } else {
                        // Expand
                        cat.setAttribute('data-open', 'true');
                        if (categoryBlocks) {
                          (categoryBlocks as HTMLElement).style.display = 'grid';
                          // Re-enforce grid layout
                          (categoryBlocks as HTMLElement).style.setProperty('display', 'grid', 'important');
                          (categoryBlocks as HTMLElement).style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                          (categoryBlocks as HTMLElement).style.setProperty('gap', '10px', 'important');
                        }
                      }
                    });
                  }
                });

                // Ensure blocks container is visible
                const blocksContainer = blocksPanel.querySelector('.gjs-blocks-c');
                if (blocksContainer) {
                  (blocksContainer as HTMLElement).style.display = 'flex';
                  (blocksContainer as HTMLElement).style.visibility = 'visible';
                  (blocksContainer as HTMLElement).style.opacity = '1';
                }

                // CRITICAL: Re-enforce grid layout after all blocks are rendered
                // This ensures the grid is applied even if GrapesJS tries to override it
                requestAnimationFrame(() => {
                  const categoryBlocksContainers = blocksPanel.querySelectorAll('.gjs-block-category-blocks');
                  categoryBlocksContainers.forEach((container: any) => {
                    if (container) {
                      container.style.setProperty('display', 'grid', 'important');
                      container.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                      container.style.setProperty('gap', '10px', 'important');
                      container.style.setProperty('width', '100%', 'important');
                      container.style.setProperty('box-sizing', 'border-box', 'important');
                      container.style.setProperty('grid-auto-rows', '90px', 'important');
                      container.style.setProperty('grid-auto-flow', 'row', 'important');
                    }
                  });
                  
                  // Also ensure all blocks fit in the grid
                  const allBlocksInGrid = blocksPanel.querySelectorAll('.gjs-block-category-blocks .gjs-block');
                  allBlocksInGrid.forEach((block: any) => {
                    if (block) {
                      block.style.setProperty('width', '100%', 'important');
                      block.style.setProperty('max-width', '100%', 'important');
                      block.style.setProperty('min-width', '0', 'important');
                      block.style.setProperty('box-sizing', 'border-box', 'important');
                    }
                  });
                });

                console.log(`Rendered ${allBlocks.length} blocks in 2-column grid`);
                blocksRenderedRef.current = true; // Confirm blocks are rendered
              }
            }, 150);
          } catch (err) {
            console.error('Error rendering blocks:', err);
          }
        };

        // Render blocks after editor is ready
        editor.on('load', () => {
          // Wait a bit to ensure DOM is ready and wrapper is visible
          setTimeout(() => {
            renderBlocks(true);
          }, 300);
          
          // Additional render attempt in case first one fails
          setTimeout(() => {
            const panel = document.getElementById('blocks-panel');
            const blocks = panel?.querySelectorAll('.gjs-block');
            if (!blocks || blocks.length === 0) {
              console.log('No blocks found, retrying render...');
              renderBlocks(true);
            }
          }, 800);
          
          setTimeout(renderDeviceSwitcher, 200);
          
          // Select a component so Style Manager has a target
          setTimeout(() => {
            try {
              const wrapper = editor.getWrapper();
              if (wrapper) {
                // Select wrapper or first child component
                const components = wrapper.components();
                let targetComponent = null;
                
                if (components && components.length > 0) {
                  const firstComp = components.at(0);
                  if (firstComp) {
                    editor.select(firstComp);
                    firstComp.set({ stylable: true });
                    targetComponent = firstComp;
                  }
                } else {
                  // Select wrapper itself
                  editor.select(wrapper);
                  wrapper.set({ stylable: true });
                  targetComponent = wrapper;
                }
                
                // Open style manager
                editor.runCommand('open-sm');
                
                // Force Style Manager to render with target
                const stylePanel = document.getElementById('style-panel');
                if (stylePanel && editor.StyleManager && targetComponent) {
                  // Clear panel
                  stylePanel.innerHTML = '';
                  
                  // Set target explicitly
                  if ((editor.StyleManager as any).setTarget) {
                    (editor.StyleManager as any).setTarget(targetComponent);
                  }
                  
                  // Render
                  // CRITICAL: Only render if style tab is active
                  if (activeSidebarSection === 'style' && typeof editor.StyleManager.render === 'function') {
                    editor.StyleManager.render();
                  }
                  
                  // Force visibility
                  stylePanel.style.display = 'block';
                  stylePanel.style.visibility = 'visible';
                  stylePanel.style.opacity = '1';
                  stylePanel.style.background = '#ffffff';
                  stylePanel.style.minHeight = '300px';
                }
              }
            } catch (e) {
              console.warn('Error selecting component on load:', e);
            }
          }, 250);
          
          // Ensure Style Manager is rendered on load - single optimized call
          setTimeout(() => {
            safeRenderStyleManager(true);
          }, 500);
        });

        // Blocks will be rendered on 'load' event
        setTimeout(renderDeviceSwitcher, 400);
        
        const setupDevicePanelObserver = (): boolean => {
          if (destroyed) return false;
          renderDeviceSwitcher();
          const devicesPanel = document.querySelector('.panel__devices');
          if (!devicesPanel) return false;
          const devicesObserver = new MutationObserver(() => renderDeviceSwitcher());
          devicesObserver.observe(devicesPanel, { childList: true, subtree: true, attributes: true });
          registerCleanup(() => devicesObserver.disconnect());
          return true;
        };
        const ensureDevicePanelObserver = () => {
          if (setupDevicePanelObserver()) return;
          if (!destroyed) {
            setTimeout(ensureDevicePanelObserver, 800);
          }
        };
        setTimeout(ensureDevicePanelObserver, 500);
              
              // Ensure style manager is ready to apply styles
              editor.on('style:target', (target: any) => {
                try {
                  if (target && target.component) {
                    const comp = target.component;
                    // Ensure component can receive styles
              comp.set({ stylable: true }, { silent: true });
                  }
                } catch {}
              });
              
        // Render managers after load
        setTimeout(() => {
          if (!destroyed) {
            try {
              // Only render LayerManager if structure tab is active
              if (editor.LayerManager && activeSidebarSection === 'structure') {
                const layersPanel = document.getElementById('layers-panel');
                if (layersPanel) {
                  // Remove layer content from wrong locations
                  const allLayerContent = document.querySelectorAll('.gjs-layers, .gjs-layer-item, .gjs-layer-item-title');
                  allLayerContent.forEach((el: any) => {
                    const parent = el.closest('#layers-panel');
                    if (!parent) {
                      el.remove();
                    }
                  });
                  layersPanel.innerHTML = '';
                  const lmElement = editor.LayerManager.render();
                  if (lmElement && layersPanel) {
                    if (typeof lmElement === 'object' && lmElement.nodeType) {
                      layersPanel.appendChild(lmElement);
                    }
                    // Add click handlers to layer items for selection
                    setTimeout(() => {
                      attachLayerSelectionHandlers(editor, layersPanel);
                    }, 150);
                  }
                }
              }
            } catch {}
          }
        }, 500);

        const scheduleLayerRefresh = (() => {
          let timeout: number | null = null;
          return () => {
            if (destroyed) return;
            if (timeout) {
              clearTimeout(timeout);
            }
            timeout = window.setTimeout(() => {
              if (!destroyed) {
                try {
                  // Only render LayerManager if structure tab is active
                  if (editor.LayerManager && typeof editor.LayerManager.render === 'function' && activeSidebarSection === 'structure') {
                    const layersPanel = document.getElementById('layers-panel');
                    if (layersPanel) {
                      // Remove layer content from wrong locations
                      const allLayerContent = document.querySelectorAll('.gjs-layers, .gjs-layer-item, .gjs-layer-item-title');
                      allLayerContent.forEach((el: any) => {
                        const parent = el.closest('#layers-panel');
                        if (!parent) {
                          el.remove();
                        }
                      });
                      layersPanel.innerHTML = '';
                      const lmElement = editor.LayerManager.render();
                      if (lmElement && layersPanel) {
                        if (typeof lmElement === 'object' && lmElement.nodeType) {
                          layersPanel.appendChild(lmElement);
                        }
                        // Add click handlers and enrich layer items
                        setTimeout(() => {
                          attachLayerSelectionHandlers(editor, layersPanel);
                          enrichLayerItems(editor, layersPanel);
                        }, 150);
                      }
                      
                      // Ensure layers are expandable and enriched after render
                      setTimeout(() => {
                        const retryLayersPanel = document.getElementById('layers-panel');
                        if (retryLayersPanel) {
                          // Enrich layer items with information
                          enrichLayerItems(editor, retryLayersPanel);
                          
                          // Find all layer items and ensure they're expandable
                          const layers = retryLayersPanel.querySelectorAll('.gjs-lm-layer');
                          layers.forEach((layer: any) => {
                            if (layer) {
                              // Ensure layer has proper structure for expansion
                              const title = layer.querySelector('.gjs-lm-title');
                              const items = layer.querySelector('.gjs-lm-items');
                              if (title && items && items.children.length > 0) {
                                // Add click handler if not present
                                if (!layer.hasAttribute('data-expand-handler')) {
                                  layer.setAttribute('data-expand-handler', 'true');
                                  title.addEventListener('click', (e: MouseEvent) => {
                                    e.stopPropagation();
                                    layer.classList.toggle('gjs-lm-open');
                                  });
                                }
                              }
                            }
                          });
                        }
                      }, 100);
                    }
                  }
                } catch {}
              }
              timeout = null;
            }, 250);
          };
        })();
        const layerEvents = ['component:add', 'component:remove', 'component:update', 'component:styleUpdate', 'component:selected'];
        layerEvents.forEach((evt) => {
          const handler = () => scheduleLayerRefresh();
          editor.on(evt, handler);
          registerCleanup(() => editor.off(evt, handler));
        });
        scheduleLayerRefresh();

        // PERFORMANCE: Removed aggressive style manager maintenance
        // The style manager now handles its own updates via the optimized safeRenderStyleManager

        const setupPanelObservers = (): boolean => {
          if (destroyed) return false;
          enforcePanelVisibility();
          const observers: MutationObserver[] = [];
          let attached = false;
          
          // Only observe right panel for basic visibility - removed subtree observation for performance
          const rightPanel = rootContainerRef.current?.querySelector('.builder-right-panel') as HTMLElement | null;
          if (rightPanel) {
            const rightObserver = new MutationObserver(() => enforcePanelVisibility());
            rightObserver.observe(rightPanel, { attributes: true, attributeFilter: ['style', 'class'] });
            observers.push(rightObserver);
            attached = true;
          }
          
          registerCleanup(() => {
            observers.forEach((observer) => observer.disconnect());
          });
          
          return attached;
        };
        const ensurePanelObservers = () => {
          if (setupPanelObservers()) return;
          if (!destroyed) {
            setTimeout(ensurePanelObservers, 800);
          }
        };
        setTimeout(ensurePanelObservers, 600);

        if (!destroyed) {
          clearTimeout(loadingTimeout);
          setLoading(false);
          console.log('✅ Editor initialized successfully');
        }
      } catch (e: any) {
        console.error('❌ Error initializing editor:', e);
        if (!destroyed) {
          clearTimeout(loadingTimeout);
          setError(e?.message || 'Failed to initialize editor. Please check the console for details.');
          setLoading(false);
          // Still try to show the editor container even if initialization failed
          if (editorRef.current) {
            editorRef.current.innerHTML = `
              <div style="padding: 40px; text-align: center; color: #6b7280;">
                <h3>Editor Initialization Error</h3>
                <p>${e?.message || 'Failed to initialize editor'}</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #5e72e4; color: white; border: none; border-radius: 6px; cursor: pointer;">
                  Reload Page
                </button>
              </div>
            `;
          }
        }
      }
    })();

    return () => {
      destroyed = true;
      clearTimeout(loadingTimeout);
      cleanupFns.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
      
      // Disconnect MutationObserver if it exists
      // Note: stylePanelObserver is in the closure, we need to access it
      const stylePanel = document.getElementById('style-panel');
      if (stylePanel) {
        // Force disconnect any observers by removing and re-adding the element
        // This is a workaround since we can't access the observer variable directly
      }
      
      // Important: in React 18 StrictMode, an earlier effect cleanup can run
      // after a new effect has already created a fresh editor. Only destroy
      // the instance created by THIS effect.
      if (editorInstance.current && editorInstance.current === editorForThisEffect) {
        try {
          editorInstance.current.destroy();
        } catch {}
        editorInstance.current = null;
      }
      // Cleanup will be handled by destroyed flag in intervals
    };
  }, []); // Only run once on mount - don't include loadSaved or id to prevent infinite loops

  // Ensure editorRef is available before initialization
  useEffect(() => {
    if (!editorRef.current && !editorInstance.current) {
      // Wait a bit for DOM to be ready
      const checkRef = setTimeout(() => {
        if (editorRef.current && !editorInstance.current) {
          console.log('🔄 EditorRef became available, editor should initialize now');
        }
      }, 100);
      return () => clearTimeout(checkRef);
    }
  }, [editorRef.current]);

  // Filter blocks by search - only if blocks exist
  useEffect(() => {
    const container = document.getElementById('blocks-panel');
    if (!container) return;

    const blocks = container.querySelectorAll('.gjs-block');
    // Don't run filter if no blocks exist yet
    if (blocks.length === 0) return;

    const term = blockSearch.trim().toLowerCase();
    const categories = container.querySelectorAll('.gjs-block-category');

    blocks.forEach((block: any) => {
      const text = (block.textContent || '').toLowerCase();
      const shouldShow = !term || text.includes(term);
      // Use grid item display instead of flex to maintain grid layout
      block.style.display = shouldShow ? 'flex' : 'none';
      block.style.visibility = shouldShow ? 'visible' : 'hidden';
      // Ensure block stays within grid constraints
      if (shouldShow) {
        block.style.width = '100%';
        block.style.maxWidth = '100%';
        block.style.minWidth = '0';
      }
    });

    categories.forEach((cat: any) => {
      const hasVisible = !!cat.querySelector('.gjs-block[style*="display: flex"]');
      cat.style.display = hasVisible ? 'block' : 'none';
    });
  }, [blockSearch]);

  // Make category dropdowns functional
  useEffect(() => {
    const blocksPanel = document.getElementById('blocks-panel');
    if (!blocksPanel) return;

    const setupCategoryToggles = () => {
      // Remove TOP duplicate categories (keep BOTTOM working set)
      const allCats = blocksPanel.querySelectorAll('.gjs-block-category');
      const byName = new Map<string, Element[]>();
      allCats.forEach((cat: Element) => {
        const titleEl = cat.querySelector('.gjs-title') || cat.querySelector('.gjs-block-category-title');
        const label = (titleEl?.textContent || '').trim() || 'Uncategorized';
        if (!byName.has(label)) byName.set(label, []);
        byName.get(label)!.push(cat);
      });
      byName.forEach((entries) => {
        if (entries.length > 1) entries[0].remove();
      });

      const categories = blocksPanel.querySelectorAll('.gjs-block-category');
      categories.forEach((cat: Element) => {
        const catEl = cat as HTMLElement;
        if (!catEl.hasAttribute('data-open')) {
          catEl.setAttribute('data-open', 'true');
        }
        const categoryTitle = cat.querySelector('.gjs-title') || cat.querySelector('.gjs-block-category-title');
        if (categoryTitle && !categoryTitle.hasAttribute('data-toggle-bound')) {
          categoryTitle.setAttribute('data-toggle-bound', 'true');
          categoryTitle.addEventListener('click', (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = catEl.getAttribute('data-open') !== 'false';
            catEl.setAttribute('data-open', isOpen ? 'false' : 'true');
          });
        }
      });
    };

    // Setup initial toggles
    setupCategoryToggles();

    // Watch for new categories being added
    const observer = new MutationObserver(() => {
      observerFireCount++;
      setupCategoryToggles();
    });

    observer.observe(blocksPanel, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [activeSidebarSection]);

  // Generate default theme thumbnail
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
      const words = themeName.split(' ');
      let line = '';
      let y = 250;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[n] + ' ';
          y += 70;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);

      // Add subtitle
      ctx.font = '28px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('Custom Theme', canvas.width / 2, y + 60);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback to SVG if canvas fails
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

  const saveToLocal = useCallback(async (applyAfterSave: boolean) => {
    try {
      const editor = editorInstance.current;
      if (!editor || typeof editor.getHtml !== 'function') {
        alert('Editor not ready');
        return;
      }

      setSaving(true);
      
      // Use requestAnimationFrame to prevent UI freeze
      await new Promise(resolve => requestAnimationFrame(resolve));

      // CRITICAL: First, commit current page's changes to state
      // This ensures any unsaved changes are captured
      commitCurrentPage();
      
      // Wait a bit to ensure state update is processed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // CRITICAL: Capture current page's changes before saving
      // This ensures the current page's edits are included in the snapshot
      // Wait a bit to ensure editor has finished any pending operations
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Get the latest snapshot with current page's changes
      const { pagesSnapshot } = getPagesSnapshotWithCurrent();
      
      console.log('📸 Captured snapshot before save:', {
        currentPageId,
        snapshotPages: pagesSnapshot.map(p => ({
          id: p.id,
          name: p.name,
          htmlLength: p.html?.length || 0,
          cssLength: p.css?.length || 0
        }))
      });
      
      // CRITICAL: Double-check that we have the latest pages state
      // Merge the snapshot with current pages state to ensure nothing is lost
      const finalPagesSnapshot = pagesSnapshot.map(snapshotPage => {
        // Find corresponding page in current state
        const currentPage = pages.find(p => p.id === snapshotPage.id);
        // Use snapshot if it has content, otherwise preserve current page
        return {
          ...snapshotPage,
          html: snapshotPage.html && snapshotPage.html.trim().length > 0 
            ? snapshotPage.html 
            : (currentPage?.html || DEFAULT_PAGE_CONTENT),
          css: snapshotPage.css && snapshotPage.css.trim().length > 0 
            ? snapshotPage.css 
            : (currentPage?.css || '')
        };
      });
      
      // Update pages state to ensure all changes are captured
      setPages(finalPagesSnapshot);
      pagesRef.current = finalPagesSnapshot;
      
      // CRITICAL: Verify all pages have content before saving
      const pagesWithContent = finalPagesSnapshot.map(p => ({
        id: p.id,
        name: p.name,
        hasHtml: !!p.html && p.html.trim().length > 0,
        hasCss: !!p.css && p.css.trim().length > 0,
        htmlLength: p.html?.length || 0,
        cssLength: p.css?.length || 0
      }));
      
      console.log('💾 Saving theme with pages:', {
        totalPages: finalPagesSnapshot.length,
        currentPageId,
        pages: pagesWithContent,
        pagesData: finalPagesSnapshot.map(p => ({
          id: p.id,
          name: p.name,
          htmlPreview: p.html?.substring(0, 100),
          cssPreview: p.css?.substring(0, 100)
        }))
      });
      
      // Warn if any page is missing content
      pagesWithContent.forEach((pageInfo, index) => {
        if (!pageInfo.hasHtml) {
          console.warn(`⚠️ Page ${index + 1} (${pageInfo.name}) has no HTML content!`);
        }
        if (!pageInfo.hasCss) {
          console.warn(`⚠️ Page ${index + 1} (${pageInfo.name}) has no CSS content!`);
        }
      });

      // Combine CSS from all pages (each page keeps its own CSS in the JSON)
      const combinedCss = finalPagesSnapshot
        .map((page) => page.css || '')
        .filter(Boolean)
        .join('\n\n');

      // Build HTML document with all pages (each page's HTML and CSS are stored in the JSON)
      const exportHtml = buildMultiPageHtmlDocument(finalPagesSnapshot, name || 'Theme', combinedCss);
      
      // CRITICAL: Verify the export HTML contains all pages
      const pagesInExport = exportHtml.match(/ziplofy-pages-data/);
      if (!pagesInExport) {
        console.error('❌ ERROR: Pages data not found in export HTML!');
      } else {
        console.log('✅ Pages data found in export HTML');
      }
      
      console.log('📦 Built export HTML:', {
        htmlLength: exportHtml.length,
        containsPagesData: exportHtml.includes('ziplofy-pages-data'),
        combinedCssLength: combinedCss.length
      });

      // Generate default thumbnail for new themes
      let thumbnailBlob: Blob | undefined = undefined;
      const isValidObjectId = id && /^[0-9a-fA-F]{24}$/.test(id);
      
      // Always generate a default thumbnail for new themes
      // For existing themes, only generate if they don't have one (we'll check this on the backend)
      if (!isValidObjectId) {
        // New theme - always generate default thumbnail
        thumbnailBlob = await generateDefaultThumbnail(name || 'My Theme');
      } else {
        // Existing theme - generate default thumbnail (backend will only use it if theme doesn't have one)
        thumbnailBlob = await generateDefaultThumbnail(name || 'My Theme');
      }
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 50));

      let savedThemeId: string = id || '';

      // CRITICAL: Check if we're editing an installed theme (not a custom theme)
      // Installed themes should always create a new custom theme, not try to update
      const isEditingInstalledTheme = isInstalledMode || shouldLoadInstalledTheme;
      
      let didCreateInstead = false;
      
      // Only try to update if:
      // 1. We have a valid ObjectId
      // 2. We're NOT editing an installed theme (installed themes don't exist in custom-themes collection)
      if (isValidObjectId && !isEditingInstalledTheme) {
        try {
        const updated = await updateTheme(id, name, exportHtml, combinedCss, thumbnailBlob, applyAfterSave ? 'published' : 'draft');
        if (!updated) {
            console.warn('Update returned empty result; will create a new theme instead.');
            didCreateInstead = true;
          } else {
        savedThemeId = updated._id;
          }
        } catch (err: any) {
          // If the theme is not found on the backend, fall back to create instead of failing
          if (err?.response?.status === 404) {
            console.warn('Theme not found while updating (404); creating a new theme instead.');
            didCreateInstead = true;
      } else {
            throw err;
          }
        }
      } else if (isEditingInstalledTheme) {
        // Installed themes should always create a new custom theme
        console.log('Editing installed theme - will create a new custom theme');
        didCreateInstead = true;
      }

      // Create flow (new theme or fallback when update returned 404)
      if (!isValidObjectId || didCreateInstead) {
        if (id && !isValidObjectId) {
          console.warn(`Invalid theme ID format (${id}). Creating new theme instead.`);
          
          // Clear old localStorage data for invalid ID
          try {
            const oldKey = `ziplofy.builder.pages.${id}`;
            localStorage.removeItem(oldKey);
            console.log('Cleared localStorage for invalid theme ID:', id);
          } catch (e) {
            console.warn('Failed to clear old localStorage:', e);
          }
          
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('id');
          window.history.replaceState({}, '', newUrl.toString());
        }

        const created = await createTheme(name, exportHtml, combinedCss, thumbnailBlob, applyAfterSave ? 'published' : 'draft');
        if (!created) {
          throw new Error('Failed to create theme');
        }
        savedThemeId = created._id;
        // Use setSearchParams so React Router updates - id will be available on next Save (update, not create)
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('id', savedThemeId);
        setSearchParams(nextParams, { replace: true });
        
        // Clear any old localStorage data after successful creation
        clearOldLocalStorageData();
      }

      setSaving(false);

      // CRITICAL: After saving, ensure the editor reflects the saved state
      // Re-apply the current page to ensure editor and saved state are in sync
      setTimeout(() => {
        const currentPage = pagesRef.current.find(p => p.id === currentPageId);
        if (currentPage && editorInstance.current) {
          console.log('🔄 Refreshing editor with saved state after save...');
          applyPageToEditor(currentPage.html || DEFAULT_PAGE_CONTENT, currentPage.css || '');
        }
      }, 200);

      if (applyAfterSave) {
        localStorage.setItem('ziplofy.appliedCustomThemeId', savedThemeId);
        // Show success message instead of redirecting
        setPublishSuccess(true);
        setIsPublished(true);
        setHasUnsavedChanges(false);
        // Auto-hide the message after 3 seconds
        setTimeout(() => setPublishSuccess(false), 3000);
      } else {
        // Theme was saved as draft
        setHasUnsavedChanges(false);
        toast.success('Draft saved! You can continue editing or publish later.');
      }
    } catch (e: any) {
      setSaving(false);
      console.error('Error saving theme:', e);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save theme';
      if (e?.code === 'ECONNABORTED' || e?.message?.includes('timeout')) {
        errorMessage = 'Upload timeout: The theme is very large. Please try again or reduce the theme size.';
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
  }, [createTheme, getPagesSnapshotWithCurrent, id, name, updateTheme, buildMultiPageHtmlDocument, commitCurrentPage, currentPageId, applyPageToEditor, searchParams, setSearchParams]);

  const previewTheme = useCallback(() => {
    try {
      const editor = editorInstance.current;
      if (!editor || typeof editor.getHtml !== 'function') {
        alert('Editor not ready');
        return;
      }

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

      // CRITICAL: Get snapshot directly from editor and ref (not state)
      // This ensures we always get the absolute latest changes, even if state hasn't updated yet
      // Use getHtml with component option to get full HTML including all nested components
      // Also include styles in HTML to ensure inline styles are captured
      let currentHtml = '';
      try {
        if (wrapper) {
          // Try to get HTML with all styles included
          currentHtml = editor.getHtml({ component: wrapper }) || '';
          if (!currentHtml || currentHtml.trim().length === 0) {
            currentHtml = editor.getHtml() || '';
          }
        } else {
          currentHtml = editor.getHtml() || '';
        }
        
        // CRITICAL: If HTML doesn't include styles, we need to ensure CSS has them
        // But first, let's make sure we have the latest HTML
        if (!currentHtml || currentHtml.trim().length === 0) {
          console.warn('⚠️ No HTML from editor, using default');
          currentHtml = DEFAULT_PAGE_CONTENT;
        }
      } catch (e) {
        console.error('Error getting HTML from editor:', e);
        currentHtml = editor.getHtml() || DEFAULT_PAGE_CONTENT;
      }
      
      console.log('📄 Preview - Current HTML length:', currentHtml.length, 'Preview:', currentHtml.substring(0, 300));
      
      // Get CSS from editor directly - try multiple methods
      let currentCss = '';
      
      // Method 1: Standard getCss()
      if (editor.getCss) {
        const standardCss = editor.getCss() || '';
        if (standardCss && standardCss.trim().length > 0) {
          currentCss = standardCss;
          console.log('✅ Got CSS from editor.getCss():', standardCss.length, 'chars');
        }
      }
      
      // Also try CssComposer for more complete CSS
      if (editor.CssComposer) {
        try {
          const cssRules = editor.CssComposer.getAll();
          if (cssRules && cssRules.length > 0) {
            const composerCss = cssRules.map((rule: any) => {
              try {
                if (rule.toCSS) return rule.toCSS();
                const selector = rule.selectorsToString ? rule.selectorsToString() : '';
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
              currentCss = composerCss + (currentCss ? '\n\n' + currentCss : '');
            }
          }
        } catch (e) {
          console.warn('Failed to get CSS from CssComposer:', e);
        }
      }
      
      // Method 3: Get wrapper styles (CRITICAL for background images and wrapper-level styles)
      try {
        if (wrapper) {
          const wrapperStyles = wrapper.getStyle ? wrapper.getStyle() : null;
          if (wrapperStyles && Object.keys(wrapperStyles).length > 0) {
            const styleEntries = Object.entries(wrapperStyles)
              .map(([prop, value]) => `  ${prop}: ${value};`)
              .join('\n');
            const wrapperCssRule = `.gjs-wrapper-body {\n${styleEntries}\n}`;
            
            // Always add wrapper styles, replacing if they exist
            if (currentCss.includes('.gjs-wrapper-body')) {
              // Replace existing wrapper rule
              currentCss = currentCss.replace(/\.gjs-wrapper-body\s*\{[^}]*\}/g, wrapperCssRule);
            } else {
              // Add new wrapper rule at the beginning
              currentCss = wrapperCssRule + '\n\n' + currentCss;
            }
            console.log('✅ Added wrapper styles:', Object.keys(wrapperStyles).length, 'properties');
          }
        }
      } catch (e) {
        console.warn('Failed to extract wrapper styles:', e);
      }
      
      // Method 4: Extract styles from ALL components (fallback for any missed styles)
      if (!currentCss || currentCss.trim().length === 0) {
        try {
          if (wrapper) {
            const allComponents: any[] = [];
            const collectComponents = (component: any) => {
              if (component) {
                allComponents.push(component);
                const children = component.components ? component.components() : [];
                children.forEach((child: any) => collectComponents(child));
              }
            };
            collectComponents(wrapper);
            
            const componentStyles = allComponents
              .map((comp) => {
                const styles = comp.getStyle ? comp.getStyle() : null;
                const classes = comp.getClasses ? comp.getClasses() : [];
                if (styles && Object.keys(styles).length > 0) {
                  const selector = classes.length > 0 ? `.${classes.join('.')}` : `#${comp.getId()}`;
                  const styleString = Object.entries(styles)
                    .map(([prop, value]) => `  ${prop}: ${value};`)
                    .join('\n');
                  return `${selector} {\n${styleString}\n}`;
                }
                return null;
              })
              .filter(Boolean)
              .join('\n\n');
            
            if (componentStyles) {
              currentCss = componentStyles;
              console.log('✅ Extracted CSS from all components:', currentCss.length, 'chars');
            }
          }
        } catch (e) {
          console.warn('Failed to extract component styles:', e);
        }
      }
      
      // Build snapshot using ref (which is always up-to-date) and current editor state
      const pagesFromRef = pagesRef.current || pages;
      const pagesSnapshot = pagesFromRef.map((page) => {
            if (page.id === currentPageId) {
              return { 
                ...page, 
            html: currentHtml || DEFAULT_PAGE_CONTENT, 
            css: currentCss || (page.css || '')
              };
            }
            return page;
      });
      
      console.log('🎬 Preview - Using latest editor state:', {
        currentPageId,
        htmlLength: currentHtml.length,
        cssLength: currentCss.length,
        totalPages: pagesSnapshot.length,
        htmlPreview: currentHtml.substring(0, 200),
        cssPreview: currentCss.substring(0, 500)
      });
      let combinedCss = pagesSnapshot
        .map((page) => page.css || '')
        .filter(Boolean)
        .join('\n\n');

      // DEBUG: Log CSS information
      const hasBackgroundImage = combinedCss.includes('background-image') || combinedCss.includes('background:');
      console.log('🎨 Preview Theme - CSS Debug:', {
        totalPages: pagesSnapshot.length,
        pagesWithCss: pagesSnapshot.filter(p => p.css && p.css.trim()).length,
        combinedCssLength: combinedCss.length,
        hasBackgroundImage,
        backgroundImageCount: (combinedCss.match(/background-image/g) || []).length,
        fullCss: combinedCss,
        firstPage: {
          name: pagesSnapshot[0]?.name,
          cssLength: pagesSnapshot[0]?.css?.length || 0,
          cssPreview: pagesSnapshot[0]?.css?.substring(0, 500)
        }
      });

      if (!combinedCss || combinedCss.trim().length === 0) {
        console.warn('⚠️ WARNING: No CSS found! Styles might not appear in preview.');
        console.log('Attempting to get CSS directly from editor...');
        const directCss = editor.getCss ? editor.getCss() : '';
        console.log('Direct CSS from editor:', { length: directCss?.length, preview: directCss?.substring(0, 500) });
        
        // Use direct CSS if available
        if (directCss && directCss.trim().length > 0) {
          combinedCss = directCss;
        }
      }
      
      if (!hasBackgroundImage) {
        console.warn('⚠️ WARNING: No background-image found in CSS!');
        console.log('Checking wrapper element directly for background...');
        const wrapper = editor.getWrapper();
        if (wrapper) {
          const wrapperStyles = wrapper.getStyle();
          console.log('Wrapper styles:', wrapperStyles);
          
          // If wrapper has background image but it's not in CSS, add it manually
          if (wrapperStyles && (wrapperStyles['background-image'] || wrapperStyles['background'])) {
            console.log('🔧 FORCE FIX: Manually adding wrapper background to CSS');
            const wrapperCss = Object.entries(wrapperStyles)
              .map(([prop, value]) => `  ${prop}: ${value};`)
              .join('\n');
            const wrapperRule = `.gjs-wrapper-body {\n${wrapperCss}\n}`;
            combinedCss = wrapperRule + '\n\n' + combinedCss;
            console.log('✅ Added wrapper CSS manually:', wrapperRule);
          }
        }
      }

      // CRITICAL FIX: Convert relative background image URLs to absolute URLs
      // This ensures background images work in the preview blob
      const canvasFrame = editor.Canvas?.getFrameEl();
      if (canvasFrame && canvasFrame.contentWindow) {
        const frameLocation = canvasFrame.contentWindow.location;
        combinedCss = combinedCss.replace(
          /url\((['"]?)(?!data:)(?!http)([^'")]+)(['"]?)\)/gi,
          (match, quote1, url, quote2) => {
            try {
              // Convert relative URLs to absolute
              const absoluteUrl = new URL(url, frameLocation.href).href;
              console.log('Converting relative URL:', { original: url, absolute: absoluteUrl });
              return `url(${quote1}${absoluteUrl}${quote2})`;
            } catch {
              // If URL conversion fails, keep original
              return match;
            }
          }
        );
      }

      console.log('Final CSS for preview (first 500 chars):', combinedCss.substring(0, 500));
      console.log('📦 Building preview HTML with:', {
        pagesCount: pagesSnapshot.length,
        cssLength: combinedCss.length,
        firstPageHtmlLength: pagesSnapshot[0]?.html?.length || 0,
        firstPageCssLength: pagesSnapshot[0]?.css?.length || 0
      });

      const fullHtml = buildMultiPageHtmlDocument(pagesSnapshot, name || 'Theme Preview', combinedCss);
      
      console.log('✅ Preview HTML built:', {
        htmlLength: fullHtml.length,
        containsCss: fullHtml.includes('<style>'),
        containsPages: fullHtml.includes('ziplofy-pages-data'),
        htmlPreview: fullHtml.substring(0, 500)
      });

      // Use iframe modal with srcdoc instead of blob URL for better reliability
      // srcdoc embeds HTML directly and works even after reloads
      // CRITICAL: Clear previewHtml first to force re-render, then set new content
      setPreviewHtml('');
        setTimeout(() => {
        setPreviewHtml(fullHtml);
      setShowPreviewModal(true);
        
        // CRITICAL: Also update iframe directly after a short delay to ensure content is set
        setTimeout(() => {
          const iframe = document.getElementById('theme-preview-iframe') as HTMLIFrameElement;
          if (iframe && iframe.contentDocument && fullHtml) {
            iframe.contentDocument.open();
            iframe.contentDocument.write(fullHtml);
            iframe.contentDocument.close();
            console.log('✅ Forced iframe content update');
          }
        }, 100);
      }, 50);
      
      // CRITICAL: Commit changes after preview to ensure they're saved to state
      // This ensures that if user makes changes and previews, those changes are persisted
      commitCurrentPage();
    } catch (e) {
      console.error('Preview error:', e);
      alert('Failed to preview theme');
    }
  }, [buildMultiPageHtmlDocument, name, commitCurrentPage, currentPageId, pagesRef]);

  // Auto-save current page when switching
  useEffect(() => {
    if (editorInstance.current && currentPageId) {
      // Only commit if editor is ready and we have a valid page ID
      const timeoutId = setTimeout(() => {
        commitCurrentPage();
      }, 100); // Small delay to prevent rapid re-renders
      return () => clearTimeout(timeoutId);
    }
  }, [currentPageId]); // Remove commitCurrentPage from deps to prevent loops

  // Render StyleManager when switching to style tab
  useEffect(() => {
    if (activeSidebarSection === 'style' && editorInstance.current) {
    const editor = editorInstance.current;
      const selected = editor.getSelected();
      
      if (selected && editor.StyleManager) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          const stylePanel = document.getElementById('style-panel');
          const stylePanelCard = document.querySelector('.elementor-panel-card[data-panel-type="style"]') as HTMLElement;
          
          if (stylePanel && stylePanelCard) {
            // Ensure panel is visible
            stylePanelCard.style.display = 'flex';
            stylePanelCard.style.visibility = 'visible';
            stylePanelCard.style.opacity = '1';
            
            stylePanel.style.display = 'block';
            stylePanel.style.visibility = 'visible';
            stylePanel.style.opacity = '1';
            
            try {
              // Render StyleManager for selected component
              stylePanel.innerHTML = '';
              editor.StyleManager.render();
              
              // Attach sector toggle (Layout, Typography, etc. collapse like widgets)
              if (!(stylePanel as any)._sectorToggleBound) {
                (stylePanel as any)._sectorToggleBound = true;
                stylePanel.addEventListener('click', (e: MouseEvent) => {
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
            } catch (e) {
              console.error('Error rendering StyleManager on tab switch:', e);
            }
          }
        }, 150);
      }
    }
  }, [activeSidebarSection]);

  // Update page link trait options when pages change (for both links and buttons)
  useEffect(() => {
    if (editorInstance.current) {
      const editor = editorInstance.current;
      const updateNavigationTraits = (comp: any) => {
        const compType = comp?.get('type');
        // Update for links, buttons, button-outline, and button-text
        if (comp && (compType === 'link' || compType === 'button' || compType === 'button-outline' || compType === 'button-text')) {
          const pageLinkTrait = comp.getTrait('pageLink');
          if (pageLinkTrait) {
            const pageOptions = pages.map(p => ({ id: p.id, value: p.id, name: p.name }));
            pageOptions.unshift({ id: '', value: '', name: '-- Select Page --' });
            pageLinkTrait.set('options', pageOptions);
          }
        }
        const children = comp?.components?.();
        if (children && typeof children.forEach === 'function') {
          children.forEach((child: any) => updateNavigationTraits(child));
        }
      };
      const wrapper = editor.getWrapper && editor.getWrapper();
      if (wrapper) {
        updateNavigationTraits(wrapper);
      }
    }
  }, [pages]);

  // Close page manager when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showPageManager && !target.closest('[data-page-manager]')) {
        setShowPageManager(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPageManager]);

  // Check if tutorial should be shown on first load
  useEffect(() => {
    const tutorialSeen = localStorage.getItem('ziplofy.elementorTutorialSeen');
    if (!tutorialSeen) {
      // Show tutorial after a short delay to let the editor load
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
    }
  }, []);

  // Apply search filtering to GrapesJS blocks rendered in the sidebar
  const applyBlockSearch = useCallback(() => {
    const panel = document.getElementById('blocks-panel');
    if (!panel) return;
    const blocks = panel.querySelectorAll('.gjs-block');
    // Don't run filter if no blocks exist yet
    if (blocks.length === 0) return;
    
    const search = (blockSearch || '').toLowerCase();
    blocks.forEach((block) => {
      const text = (block.textContent || '').toLowerCase();
      const matches = !search || text.includes(search);
      (block as HTMLElement).style.display = matches ? 'flex' : 'none';
      (block as HTMLElement).style.visibility = matches ? 'visible' : 'hidden';
    });
  }, [blockSearch]);

  // Only apply search when blockSearch changes, not on every mutation
  useEffect(() => {
    applyBlockSearch();
  }, [applyBlockSearch]);

  // CRITICAL: Ensure widgets are visible when editing a custom theme
  // This runs when the component mounts or when id changes (editing existing theme)
  useEffect(() => {
    if (id && editorInstance.current) {
      console.log('📝 Editing custom theme - ensuring widgets are visible');
      // Force widgets tab to be active
      setActiveSidebarSection('widgets');
      
      // Ensure blocks are rendered
      setTimeout(() => {
        const editor = editorInstance.current;
        const blocksPanel = document.getElementById('blocks-panel');
        const wrapper = document.querySelector('.elementor-blocks-wrapper') as HTMLElement;
        
        if (editor?.BlockManager && blocksPanel) {
          // Ensure wrapper is visible
          if (wrapper) {
            wrapper.style.setProperty('display', 'block', 'important');
            wrapper.style.setProperty('visibility', 'visible', 'important');
            wrapper.style.setProperty('opacity', '1', 'important');
          }
          
          // Ensure panel is visible
          blocksPanel.style.setProperty('display', 'block', 'important');
          blocksPanel.style.setProperty('visibility', 'visible', 'important');
          blocksPanel.style.setProperty('opacity', '1', 'important');
          
          // Check if blocks exist
          const existingBlocks = blocksPanel.querySelectorAll('.gjs-block');
          if (existingBlocks.length === 0) {
            console.log('No blocks found when editing theme, rendering...');
            blocksPanel.innerHTML = '';
            editor.BlockManager.render();
            blocksRenderedRef.current = true;
          }
        }
      }, 500);
    }
  }, [id]);

  // Ensure widgets stay visible when switching to widgets tab
  useEffect(() => {
    if (activeSidebarSection === 'widgets') {
      // Force wrapper visibility via DOM (not React state) to prevent clearing
      const wrapper = document.querySelector('.elementor-blocks-wrapper');
      if (wrapper) {
        (wrapper as HTMLElement).style.setProperty('display', 'block', 'important');
        (wrapper as HTMLElement).style.setProperty('visibility', 'visible', 'important');
        (wrapper as HTMLElement).style.setProperty('opacity', '1', 'important');
      }

      // Function to render blocks - uses fresh editor reference each time
      const maxRetries = 25; // ~5 seconds total
      let retryCount = 0;
      const forceRenderBlocks = () => {
        const currentEditor = editorInstance.current;
        if (!currentEditor?.BlockManager) {
          retryCount += 1;
          if (retryCount <= 3) {
            console.warn('BlockManager not available yet, retrying...');
          }
          if (retryCount < maxRetries) {
            setTimeout(forceRenderBlocks, 200);
          }
          return;
        }

        const panel = document.getElementById('blocks-panel');
        if (!panel) {
          console.warn('blocks-panel not found, retrying...');
          setTimeout(() => {
            const retryPanel = document.getElementById('blocks-panel');
            const retryEditor = editorInstance.current;
            if (retryPanel && retryEditor?.BlockManager) {
              // Ensure wrapper is visible
              const wrapper = retryPanel.closest('.elementor-blocks-wrapper');
              if (wrapper) {
                (wrapper as HTMLElement).style.setProperty('display', 'block', 'important');
                (wrapper as HTMLElement).style.setProperty('visibility', 'visible', 'important');
                (wrapper as HTMLElement).style.setProperty('opacity', '1', 'important');
              }
              // Ensure panel is visible
              retryPanel.style.setProperty('display', 'block', 'important');
              retryPanel.style.setProperty('visibility', 'visible', 'important');
              retryPanel.style.setProperty('opacity', '1', 'important');
              retryPanel.innerHTML = '';
              retryEditor.BlockManager.render();
              blocksRenderedRef.current = true;
            }
          }, 200);
          return;
        }

        // Ensure wrapper is visible
        const wrapper = panel.closest('.elementor-blocks-wrapper');
        if (wrapper) {
          (wrapper as HTMLElement).style.setProperty('display', 'block', 'important');
          (wrapper as HTMLElement).style.setProperty('visibility', 'visible', 'important');
          (wrapper as HTMLElement).style.setProperty('opacity', '1', 'important');
        }

        // Ensure panel is visible
        panel.style.setProperty('display', 'block', 'important');
        panel.style.setProperty('visibility', 'visible', 'important');
        panel.style.setProperty('opacity', '1', 'important');

        // Check if blocks exist
        const existingBlocks = panel.querySelectorAll('.gjs-block');
        const hasBlocksContainer = !!panel.querySelector('.gjs-blocks-c');
        
        // Always render if no blocks or no blocks container
        if (existingBlocks.length === 0 || !hasBlocksContainer) {
          console.log('No blocks found in widgets tab, rendering...');
          
          // Clear and render
          panel.innerHTML = '';
          currentEditor.BlockManager.render();
          blocksRenderedRef.current = true;
          
          // Ensure blocks are visible after render
          setTimeout(() => {
            const retryEditor = editorInstance.current;
            const blocks = panel.querySelectorAll('.gjs-block');
            if (blocks.length === 0 && retryEditor?.BlockManager) {
              // Still no blocks, try again
              console.log('Still no blocks after render, retrying...');
              panel.innerHTML = '';
              retryEditor.BlockManager.render();
            }
            
            setTimeout(() => {
              const finalBlocks = panel.querySelectorAll('.gjs-block');
              finalBlocks.forEach((block: any) => {
                if (block) {
                  block.style.display = 'flex';
                  block.style.visibility = 'visible';
                  block.style.opacity = '1';
                  block.style.pointerEvents = 'auto';
                  block.style.cursor = 'grab';
                  block.style.position = 'relative';
                  block.style.zIndex = '1';
                }
              });
              
              // Ensure categories are visible
              const categories = panel.querySelectorAll('.gjs-block-category');
              categories.forEach((cat: any) => {
                if (cat) {
                  cat.style.display = 'block';
                  cat.style.visibility = 'visible';
                }
              });
              
              // Ensure blocks container is visible
              const blocksContainer = panel.querySelector('.gjs-blocks-c');
              if (blocksContainer) {
                (blocksContainer as HTMLElement).style.display = 'flex';
                (blocksContainer as HTMLElement).style.visibility = 'visible';
                (blocksContainer as HTMLElement).style.opacity = '1';
              }
              
              console.log(`Rendered ${finalBlocks.length} blocks in widgets tab`);
              applyBlockSearch();
            }, 100);
          }, 200);
        } else {
          // Blocks exist - just ensure they're visible and update ref
          blocksRenderedRef.current = true;
          existingBlocks.forEach((block: any) => {
            if (block) {
              block.style.display = 'flex';
              block.style.visibility = 'visible';
              block.style.opacity = '1';
              block.style.pointerEvents = 'auto';
              block.style.cursor = 'grab';
              block.style.position = 'relative';
              block.style.zIndex = '1';
            }
          });
          
          // Ensure categories are visible
          const categories = panel.querySelectorAll('.gjs-block-category');
          categories.forEach((cat: any) => {
            if (cat) {
              cat.style.display = 'block';
              cat.style.visibility = 'visible';
            }
          });
          
          // Ensure blocks container is visible
          const blocksContainer = panel.querySelector('.gjs-blocks-c');
          if (blocksContainer) {
            (blocksContainer as HTMLElement).style.display = 'flex';
            (blocksContainer as HTMLElement).style.visibility = 'visible';
            (blocksContainer as HTMLElement).style.opacity = '1';
          }
          
          applyBlockSearch();
        }
      };

      // Try to render blocks immediately
      forceRenderBlocks();
    }
  }, [activeSidebarSection, applyBlockSearch]);

  // Protection: Ensure wrapper stays visible and blocks don't disappear
  useEffect(() => {
    if (activeSidebarSection === 'widgets') {
      const panel = document.getElementById('blocks-panel');
      const wrapper = document.querySelector('.elementor-blocks-wrapper') as HTMLElement;
      if (!panel || !wrapper) return;

      // Force wrapper visibility immediately
      wrapper.style.setProperty('display', 'block', 'important');
      wrapper.style.setProperty('visibility', 'visible', 'important');
      wrapper.style.setProperty('opacity', '1', 'important');

      // Watch for wrapper being hidden
      const wrapperObserver = new MutationObserver(() => {
        if (activeSidebarSection === 'widgets') {
          const computedStyle = window.getComputedStyle(wrapper);
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
            console.warn('Wrapper was hidden! Restoring visibility...');
            wrapper.style.setProperty('display', 'block', 'important');
            wrapper.style.setProperty('visibility', 'visible', 'important');
            wrapper.style.setProperty('opacity', '1', 'important');
          }
        }
      });

      wrapperObserver.observe(wrapper, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: false
      });

      let lastBlockCount = panel.querySelectorAll('.gjs-block').length;
      let lastContent = panel.innerHTML;
      let restoreTimeout: ReturnType<typeof setTimeout> | null = null;
      let isRestoring = false;

      // MutationObserver to detect when blocks are removed
      const observer = new MutationObserver((mutations) => {
        // Don't process if we're already restoring
        if (isRestoring) return;

        const currentBlocks = panel.querySelectorAll('.gjs-block');
        const currentCount = currentBlocks.length;
        const currentContent = panel.innerHTML;

        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
            const removedBlocks = Array.from(mutation.removedNodes).filter(
              (node) => node.nodeType === Node.ELEMENT_NODE && 
              ((node as Element).classList.contains('gjs-block') || 
               (node as Element).querySelector('.gjs-block'))
            );

            // Only restore if ALL blocks were removed and panel is empty
            if (removedBlocks.length > 0 && currentCount === 0 && lastBlockCount > 0 && panel.innerHTML.trim() === '') {
              // Debounce restoration to avoid rapid re-renders
              if (restoreTimeout) {
                clearTimeout(restoreTimeout);
              }
              
              restoreTimeout = setTimeout(() => {
                // Double-check blocks are still missing before restoring
                const doubleCheck = panel.querySelectorAll('.gjs-block');
                if (doubleCheck.length === 0 && panel.innerHTML.trim() === '' && editorInstance.current?.BlockManager) {
                  console.warn('Blocks were removed! Restoring...');
                  isRestoring = true;
                  
                  const wrapper = panel.closest('.elementor-blocks-wrapper');
                  if (wrapper) {
                    (wrapper as HTMLElement).style.setProperty('display', 'block', 'important');
                    (wrapper as HTMLElement).style.setProperty('visibility', 'visible', 'important');
                    (wrapper as HTMLElement).style.setProperty('opacity', '1', 'important');
                  }
                  
                  editorInstance.current.BlockManager.render();
                  
                  setTimeout(() => {
                    const restored = panel.querySelectorAll('.gjs-block');
                    restored.forEach((block: any) => {
                      if (block) {
                        block.style.display = 'flex';
                        block.style.visibility = 'visible';
                        block.style.opacity = '1';
                        block.style.pointerEvents = 'auto';
                        block.style.cursor = 'grab';
                        block.style.position = 'relative';
                        block.style.zIndex = '1';
                      }
                    });
                    
                    const categories = panel.querySelectorAll('.gjs-block-category');
                    categories.forEach((cat: any) => {
                      if (cat) {
                        cat.style.display = 'block';
                        cat.style.visibility = 'visible';
                      }
                    });
                    
                    lastBlockCount = restored.length;
                    lastContent = panel.innerHTML;
                    isRestoring = false;
                    console.log(`Restored ${restored.length} blocks`);
                  }, 150);
                }
              }, 300); // Debounce for 300ms
            }
          }
        });

        // Update last known state only if blocks exist
        if (currentCount > 0) {
          lastBlockCount = currentCount;
          lastContent = currentContent;
        }
      });

      // Start observing
      observer.observe(panel, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
      });

      const ensureVisibility = () => {
        // Don't run if we're restoring
        if (isRestoring) return;

        const wrapper = document.querySelector('.elementor-blocks-wrapper');
        
        if (wrapper) {
          (wrapper as HTMLElement).style.setProperty('display', 'block', 'important');
          (wrapper as HTMLElement).style.setProperty('visibility', 'visible', 'important');
          (wrapper as HTMLElement).style.setProperty('opacity', '1', 'important');
        }
        
        panel.style.setProperty('display', 'block', 'important');
        panel.style.setProperty('visibility', 'visible', 'important');
        panel.style.setProperty('opacity', '1', 'important');

        // Ensure blocks are visible (but don't clear if they exist)
        const blocks = panel.querySelectorAll('.gjs-block');
        if (blocks.length > 0) {
          blocks.forEach((block: any) => {
            if (block) {
              block.style.display = 'flex';
              block.style.visibility = 'visible';
              block.style.opacity = '1';
              block.style.pointerEvents = 'auto';
              block.style.cursor = 'grab';
            }
          });
        } else if (blocksRenderedRef.current && editorInstance.current?.BlockManager) {
          // Blocks are missing but should exist - restore them
          if (panel.innerHTML.trim() === '') {
            console.warn('Periodic check: Blocks missing, restoring...');
            panel.innerHTML = '';
            editorInstance.current.BlockManager.render();
            blocksRenderedRef.current = true;
          }
        }
      };

      // Run immediately and periodically (more frequently to catch issues quickly)
      ensureVisibility();
      const interval = setInterval(() => {
        // Double-check wrapper is visible
        const wrapper = document.querySelector('.elementor-blocks-wrapper');
        if (wrapper && activeSidebarSection === 'widgets') {
          (wrapper as HTMLElement).style.setProperty('display', 'block', 'important');
          (wrapper as HTMLElement).style.setProperty('visibility', 'visible', 'important');
          (wrapper as HTMLElement).style.setProperty('opacity', '1', 'important');
        }
        ensureVisibility();
      }, 500); // Check every 500ms to catch issues quickly
      
      return () => {
        if (restoreTimeout) {
          clearTimeout(restoreTimeout);
        }
        observer.disconnect();
        wrapperObserver.disconnect();
        clearInterval(interval);
      };
    }
  }, [activeSidebarSection]);

  // Ensure Style Manager is rendered ONLY when style tab is active
  useEffect(() => {
    if (activeSidebarSection === 'style') {
      // Function to render style manager with fresh editor reference
      const renderStyleManager = () => {
        const currentEditor = editorInstance.current;
        if (!currentEditor?.StyleManager) {
          console.warn('StyleManager not available yet, retrying...');
          setTimeout(renderStyleManager, 200);
          return;
        }
        
        const stylePanel = document.getElementById('style-panel');
        if (!stylePanel) {
          console.warn('style-panel not found, retrying...');
          setTimeout(renderStyleManager, 200);
          return;
        }
        
        // CRITICAL: Remove style manager content from any other locations
        const allStyleContent = document.querySelectorAll('.gjs-sm-sector, .gjs-sm-property, .gjs-sm-properties');
        allStyleContent.forEach((el: any) => {
          const parent = el.closest('#style-panel');
          if (!parent) {
            el.remove(); // Remove style elements not in the correct panel
          }
        });
        
        // Ensure we have a selected component
        let targetComponent = currentEditor.getSelected();
        if (!targetComponent) {
          const wrapper = currentEditor.getWrapper();
          if (wrapper) {
            currentEditor.select(wrapper);
            wrapper.set({ stylable: true });
            targetComponent = wrapper;
          }
        } else {
          targetComponent.set({ stylable: true });
        }
        
        // Clear and render only in the correct panel
        stylePanel.innerHTML = '';
        if (targetComponent && (currentEditor.StyleManager as any).setTarget) {
          (currentEditor.StyleManager as any).setTarget(targetComponent);
        }
        
        // IMPORTANT: StyleManager.render() returns an element, we need to append it
        const smElement = currentEditor.StyleManager.render();
        if (smElement) {
          stylePanel.appendChild(smElement);
        }
        
        // Ensure sectors are visible after render
        setTimeout(() => {
          const sectors = stylePanel.querySelectorAll('.gjs-sm-sector');
          console.log(`Style Manager rendered with ${sectors.length} sectors`);
          
          if (sectors.length === 0) {
            // No sectors, retry
            console.warn('No sectors found after render, retrying...');
            setTimeout(renderStyleManager, 300);
            return;
          }
          
          sectors.forEach((sector: any) => {
        if (sector) {
              sector.style.display = 'block';
              sector.style.visibility = 'visible';
              sector.style.opacity = '1';
              sector.style.background = '#ffffff';
            }
          });
          
          // Ensure properties are visible and editable
          const properties = stylePanel.querySelectorAll('.gjs-sm-property');
          properties.forEach((prop: any) => {
            if (prop) {
              prop.style.display = 'block';
              prop.style.visibility = 'visible';
              prop.style.opacity = '1';
              
              // Ensure inputs are editable
              const inputs = prop.querySelectorAll('input, select, textarea');
              inputs.forEach((input: any) => {
                if (input) {
                  input.style.pointerEvents = 'auto';
                  input.style.cursor = input.tagName === 'SELECT' ? 'pointer' : 'text';
                  input.style.position = 'relative';
                  input.style.zIndex = '10';
                }
              });
            }
          });
        }, 200);
      };
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
    const stylePanel = document.getElementById('style-panel');
          if (!stylePanel) {
            console.warn('style-panel not found, starting render loop...');
            renderStyleManager();
            return;
          }

          // Ensure panel is visible (use white background to match Elementor)
      stylePanel.style.setProperty('display', 'block', 'important');
      stylePanel.style.setProperty('visibility', 'visible', 'important');
      stylePanel.style.setProperty('opacity', '1', 'important');
      stylePanel.style.setProperty('background', '#ffffff', 'important');
      stylePanel.style.setProperty('min-height', '200px', 'important');
      stylePanel.style.setProperty('width', '100%', 'important');
          stylePanel.style.setProperty('height', 'auto', 'important');
          stylePanel.style.setProperty('position', 'relative', 'important');
          stylePanel.style.setProperty('z-index', '1', 'important');

          // Ensure parent panel card is visible
      const panelCard = stylePanel.closest('.elementor-panel-card');
      if (panelCard) {
        (panelCard as HTMLElement).style.setProperty('display', 'flex', 'important');
        (panelCard as HTMLElement).style.setProperty('visibility', 'visible', 'important');
        (panelCard as HTMLElement).style.setProperty('opacity', '1', 'important');
      }

          // Also ensure the parent scroll container is visible
          const scrollContainer = stylePanel.closest('.elementor-left-scroll');
          if (scrollContainer) {
            (scrollContainer as HTMLElement).style.setProperty('display', 'flex', 'important');
            (scrollContainer as HTMLElement).style.setProperty('visibility', 'visible', 'important');
            (scrollContainer as HTMLElement).style.setProperty('opacity', '1', 'important');
          }
          
          // Start the render loop
          renderStyleManager();
        } catch (err) {
          console.warn('Error rendering Style Manager:', err);
        }
      }, 100);
      
      // Periodic check to ensure inputs stay editable while style tab is active
    const ensureInputsEditable = setInterval(() => {
        if (activeSidebarSection !== 'style') {
          clearInterval(ensureInputsEditable);
          return;
        }
        
        const stylePanel = document.getElementById('style-panel');
        if (!stylePanel) return;
        
        const inputs = stylePanel.querySelectorAll('input, select, textarea');
        inputs.forEach((input: any) => {
        if (input && !input.disabled) {
          input.style.pointerEvents = 'auto';
          input.style.cursor = input.tagName === 'SELECT' ? 'pointer' : 'text';
            input.style.position = 'relative';
            input.style.zIndex = '10';
        }
      });
    }, 1000);

      // Cleanup interval when component unmounts or tab changes
      return () => clearInterval(ensureInputsEditable);
    }
    // Note: Panel visibility is now managed by unified useEffect above
  }, [activeSidebarSection]);

  // Fix: Spectrum's click handler does not fire on swatch; programmatically show picker (capture phase to run first)
  useEffect(() => {
    if (activeSidebarSection !== 'style') return;
    const onCapture = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const panel = document.getElementById('style-panel');
      if (!panel || !panel.contains(t)) return;
      const onSwatch = t.closest('.gjs-field-color-picker, .sp-replacer, .sp-preview');
      if (!onSwatch || t.closest('input, textarea')) return;
      const fieldColor = onSwatch.closest('.gjs-field-color, [data-colorp-c]');
      const boundEl = fieldColor?.querySelector('.gjs-field-color-picker') || (t.closest('.sp-replacer')?.previousElementSibling) || (onSwatch.classList.contains('gjs-field-color-picker') ? onSwatch : null);
      const el = boundEl as HTMLElement | null;
      if (!el) return;
      const $ = (editorInstance.current as any)?.$ ?? (window as any).Backbone?.$;
      if (!$ || typeof $.fn?.spectrum !== 'function') return;
      const sp = document.querySelector('.sp-container');
      if (!sp?.classList.contains('sp-hidden')) return;
      try {
        $(el).spectrum('show');
        e.stopPropagation();
        e.preventDefault();
        requestAnimationFrame(() => requestAnimationFrame(() => repositionColorPicker()));
      } catch (_) {}
    };
    document.addEventListener('click', onCapture, true);
    return () => document.removeEventListener('click', onCapture, true);
  }, [activeSidebarSection]);

  // Reposition Spectrum picker to stay within the left sidebar (340px)
  const repositionColorPicker = () => {
    const sp = document.querySelector('.sp-container') as HTMLElement | null;
    if (!sp || sp.classList.contains('sp-hidden')) return;
    const leftPanel = document.querySelector('.builder-left-panel') as HTMLElement | null;
    const sidebarWidth = leftPanel ? leftPanel.getBoundingClientRect().width : 340;
    const pad = 16;
    const maxRight = sidebarWidth - pad;
    const rect = sp.getBoundingClientRect();
    if (rect.right > maxRight) {
      const newLeft = maxRight - rect.width;
      sp.style.left = `${Math.max(pad, newLeft)}px`;
    }
    if (rect.bottom > window.innerHeight - pad) {
      sp.style.top = `${window.innerHeight - rect.height - pad}px`;
    }
  };

  // Observe Spectrum picker visibility and reposition when it opens (container created lazily by GrapesJS)
  useEffect(() => {
    let obs: MutationObserver | null = null;
    const tryObserve = () => {
      const sp = document.querySelector('.sp-container');
      if (!sp) return false;
      obs = new MutationObserver(() => {
        if (!sp.classList.contains('sp-hidden')) repositionColorPicker();
      });
      obs.observe(sp, { attributes: true, attributeFilter: ['class'] });
      return true;
    };
    if (tryObserve()) {
      return () => { obs?.disconnect(); };
    }
    const id = setInterval(() => { if (tryObserve()) clearInterval(id); }, 500);
    return () => { clearInterval(id); obs?.disconnect(); };
  }, []);

  // Function to enrich layer items with element information
  const enrichLayerItems = (editor: any, layersPanel: HTMLElement) => {
    try {
      const layerItems = layersPanel.querySelectorAll('.gjs-lm-layer, .gjs-lm-item');
      
      layerItems.forEach((item: any) => {
        // Skip if already enriched
        if (item.dataset.enriched === 'true') {
          return;
        }
        
        item.dataset.enriched = 'true';
        
        // Get component from layer item
        let component = null;
        if (editor.LayerManager) {
          const views = editor.LayerManager.views || [];
          for (const view of views) {
            if (view.el === item || item.contains(view.el)) {
              component = view.model;
              break;
            }
          }
          if (!component && editor.LayerManager.getComponentFromView) {
            component = editor.LayerManager.getComponentFromView(item);
          }
        }
        
        if (component) {
          try {
            const tagName = component.get('tagName') || 'div';
            const componentId = component.get('attributes')?.id || component.get('id') || '';
            const componentClasses = component.get('classes')?.map((c: any) => c.getName?.() || c.name || c).join(' ') || '';
            const componentType = component.get('type') || tagName.toLowerCase();
            const childCount = component.components ? component.components().length : 0;
            
            // Get depth level
            let depth = 0;
            let parent = component.getParent();
            while (parent) {
              depth++;
              parent = parent.getParent();
            }
            item.setAttribute('data-depth', depth.toString());
            
            // Add element type to title
            const titleElement = item.querySelector('.gjs-lm-title');
            if (titleElement) {
              titleElement.setAttribute('data-element-type', tagName.toUpperCase());
              
              // Add child count badge if has children
              if (childCount > 0) {
                let badge = titleElement.querySelector('.gjs-lm-badge');
                if (!badge) {
                  badge = document.createElement('span');
                  badge.className = 'gjs-lm-badge';
                  titleElement.appendChild(badge);
                }
                badge.textContent = childCount.toString();
              }
            }
            
            // Create info element for classes and IDs
            let infoElement = item.querySelector('.gjs-lm-element-info');
            if (!infoElement && (componentId || componentClasses)) {
              infoElement = document.createElement('div');
              infoElement.className = 'gjs-lm-element-info';
              item.appendChild(infoElement);
            }
            
            if (infoElement) {
              infoElement.innerHTML = '';
              
              if (componentId) {
                const idSpan = document.createElement('span');
                idSpan.className = 'element-id';
                idSpan.textContent = `#${componentId}`;
                infoElement.appendChild(idSpan);
              }
              
              if (componentClasses) {
                const classes = componentClasses.split(' ').filter((c: string) => c.trim());
                classes.forEach((className: string) => {
                  if (className) {
                    const classSpan = document.createElement('span');
                    classSpan.className = 'element-class';
                    classSpan.textContent = `.${className}`;
                    infoElement.appendChild(classSpan);
                  }
                });
              }
            }
            
            // Add tooltip with full information
            const tooltipParts = [];
            tooltipParts.push(`Type: ${tagName.toUpperCase()}`);
            if (componentType && componentType !== tagName.toLowerCase()) {
              tooltipParts.push(`Component: ${componentType}`);
            }
            if (componentId) {
              tooltipParts.push(`ID: ${componentId}`);
            }
            if (componentClasses) {
              tooltipParts.push(`Classes: ${componentClasses}`);
            }
            if (childCount > 0) {
              tooltipParts.push(`Children: ${childCount}`);
            }
            
            item.setAttribute('title', tooltipParts.join(' • '));
          } catch (e) {
            console.warn('Error enriching layer item:', e);
          }
        }
      });
    } catch (error) {
      console.warn('Error enriching layer items:', error);
    }
  };

  // Function to attach click handlers to layer items for selection
  const attachLayerSelectionHandlers = (editor: any, layersPanel: HTMLElement) => {
    try {
      // First enrich layer items with information
      enrichLayerItems(editor, layersPanel);
      
      // Find all layer items (both .gjs-lm-layer and .gjs-lm-item)
      const layerItems = layersPanel.querySelectorAll('.gjs-lm-layer, .gjs-lm-item');
      
      layerItems.forEach((item: any) => {
        // Skip if already has handler attached
        if (item.dataset.selectionHandlerAttached === 'true') {
          return;
        }
        
        // Mark as having handler attached
        item.dataset.selectionHandlerAttached = 'true';
        
        // Add click handler to the title/label area (not the caret)
        const titleElement = item.querySelector('.gjs-lm-title') || item;
        
        titleElement.addEventListener('click', (e: MouseEvent) => {
          // Don't prevent default if clicking on expand/collapse caret
        const target = e.target as HTMLElement;
          if (target.classList.contains('gjs-lm-caret') || target.closest('.gjs-lm-caret')) {
            return; // Let GrapesJS handle expand/collapse
          }
          
          e.stopPropagation();
          
          try {
            // Get component from layer item using GrapesJS LayerManager API
            let component = null;
            
            // Method 1: Try to get component from LayerManager's view
            if (editor.LayerManager) {
              // Try to get the view from the item
              const views = editor.LayerManager.views || [];
              for (const view of views) {
                if (view.el === item || item.contains(view.el)) {
                  component = view.model;
                  break;
                }
              }
              
              // Alternative: Try getComponentFromView if available
              if (!component && editor.LayerManager.getComponentFromView) {
                component = editor.LayerManager.getComponentFromView(item);
              }
            }
            
            // Method 2: Use GrapesJS's built-in click handling, then enhance
            // GrapesJS should already select the component, so we just need to switch tabs
            // But let's also try to get the component directly
            if (!component) {
              // Try to find component by matching the layer item structure
              const allComponents = editor.getComponents();
              const findComponentByLayerItem = (components: any, layerItem: HTMLElement): any => {
                const layerText = layerItem.textContent?.trim() || '';
                for (const comp of components.models || components) {
                  try {
                    const compEl = comp.getEl?.();
                    if (compEl) {
                      const compType = comp.get('type') || '';
                      const compTag = comp.get('tagName') || '';
                      const tagMatch = layerText.toLowerCase().includes(compTag.toLowerCase());
                      const typeMatch = layerText.toLowerCase().includes(compType.toLowerCase());
                      
                      if (tagMatch || typeMatch) {
                        return comp;
                      }
                    }
                    // Check children
                    if (comp.components) {
                      const found = findComponentByLayerItem(comp.components(), layerItem);
                      if (found) return found;
                    }
                  } catch (e) {
                    // Continue
                  }
                }
                return null;
              };
              component = findComponentByLayerItem(allComponents, item);
            }
            
            // If we found a component, select it and show styles
            if (component) {
            editor.select(component);
              // Switch to style tab to show style panel
            setActiveSidebarSection('style');
              // Open style manager
              setTimeout(() => {
                editor.runCommand('open-sm');
              }, 100);
            } else {
              // Even if we can't find component, switch to style tab
              // GrapesJS's built-in handler should have selected it
              setActiveSidebarSection('style');
              setTimeout(() => {
                editor.runCommand('open-sm');
              }, 100);
            }
          } catch (error) {
            console.warn('Error selecting component from layer:', error);
            // Still switch to style tab even on error
            setActiveSidebarSection('style');
          }
        });
      });
      
      // Track if selection is coming from layer panel
      let selectingFromLayer = false;
      
      // Detect clicks in layer panel
      layersPanel.addEventListener('click', () => {
        selectingFromLayer = true;
        setTimeout(() => {
          selectingFromLayer = false;
        }, 300);
      }, true);
      
      // Listen to component selection events and switch to style tab if from layer panel
      const handleComponentSelected = (component: any) => {
        if (selectingFromLayer && component) {
          setActiveSidebarSection('style');
          setTimeout(() => {
            editor.runCommand('open-sm');
          }, 100);
        }
      };
      
      // Add listener if not already added
      if (!editor._layerSelectionListenerAdded) {
        editor.on('component:selected', handleComponentSelected);
        editor._layerSelectionListenerAdded = true;
      }
    } catch (error) {
      console.warn('Error attaching layer selection handlers:', error);
    }
  };

  // Ensure Layer Manager is rendered ONLY when structure tab is active
  useEffect(() => {
    const editor = editorInstance.current;
    if (!editor?.LayerManager) return;

    if (activeSidebarSection === 'structure') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          const layersPanel = document.getElementById('layers-panel');
          if (!layersPanel) {
            console.warn('layers-panel not found, retrying...');
            setTimeout(() => {
              const retryPanel = document.getElementById('layers-panel');
              if (retryPanel && editor.LayerManager) {
                retryPanel.style.setProperty('display', 'block', 'important');
                retryPanel.style.setProperty('visibility', 'visible', 'important');
                retryPanel.style.setProperty('opacity', '1', 'important');
                
                // CRITICAL: Remove layer content from any other locations
                const allLayerContent = document.querySelectorAll('.gjs-layers, .gjs-layer-item, .gjs-layer-item-title');
                allLayerContent.forEach((el: any) => {
                  const parent = el.closest('#layers-panel');
                  if (!parent) {
                    el.remove(); // Remove layer elements not in the correct panel
                  }
                });
                
                // CRITICAL: Remove ALL style content from structure panel
                const styleContentInStructure = retryPanel.querySelectorAll('.gjs-sm-sector, .gjs-sm-property, .gjs-sm-properties, .gjs-sm-sector-content, .gjs-sm-property__field, .gjs-field, [class*="gjs-sm"]');
                styleContentInStructure.forEach((el: any) => {
                  el.remove();
                });
                
                // Clear and render only in the correct panel
                retryPanel.innerHTML = '';
                const lmElement = editor.LayerManager.render();
                if (lmElement) {
                  retryPanel.appendChild(lmElement);
                  
                  // Add click handlers and enrich layer items
                  setTimeout(() => {
                    attachLayerSelectionHandlers(editor, retryPanel);
                    enrichLayerItems(editor, retryPanel);
                  }, 150);
                }
              }
            }, 100);
            return;
          }

          // CRITICAL: Remove layer manager content from any other locations
          const allLayerContent = document.querySelectorAll('.gjs-layers, .gjs-layer-item, .gjs-layer-item-title');
          allLayerContent.forEach((el: any) => {
            const parent = el.closest('#layers-panel');
            if (!parent) {
              el.remove(); // Remove layer elements not in the correct panel
            }
          });
          
          // CRITICAL: Remove ALL style content from structure panel
          const styleContentInStructure = layersPanel.querySelectorAll('.gjs-sm-sector, .gjs-sm-property, .gjs-sm-properties, .gjs-sm-sector-content, .gjs-sm-property__field, .gjs-field, [class*="gjs-sm"]');
          styleContentInStructure.forEach((el: any) => {
            el.remove();
          });

          // Ensure panel is visible
          layersPanel.style.setProperty('display', 'block', 'important');
          layersPanel.style.setProperty('visibility', 'visible', 'important');
          layersPanel.style.setProperty('opacity', '1', 'important');

          // Ensure parent panel card is visible
          const panelCard = layersPanel.closest('.elementor-panel-card');
          if (panelCard) {
            (panelCard as HTMLElement).style.setProperty('display', 'flex', 'important');
            (panelCard as HTMLElement).style.setProperty('visibility', 'visible', 'important');
            (panelCard as HTMLElement).style.setProperty('opacity', '1', 'important');
          }
          
          // Ensure style panel is hidden
          const stylePanel = document.getElementById('style-panel');
          if (stylePanel) {
            const stylePanelCard = stylePanel.closest('.elementor-panel-card[data-panel-type="style"]');
            if (stylePanelCard) {
              (stylePanelCard as HTMLElement).style.setProperty('display', 'none', 'important');
            }
          }

          // Clear panel before rendering to avoid duplicates
          layersPanel.innerHTML = '';

          // Render Layer Manager ONLY in the layers panel
          // IMPORTANT: LayerManager.render() returns an element that needs to be appended
          if (typeof editor.LayerManager.render === 'function') {
            const lmElement = editor.LayerManager.render();
            if (lmElement) {
              layersPanel.appendChild(lmElement);
              
              // Add click handlers and enrich layer items
              setTimeout(() => {
                attachLayerSelectionHandlers(editor, layersPanel);
                enrichLayerItems(editor, layersPanel);
              }, 150);
            }
          }

          console.log('Layer Manager rendered in layers-panel');
        } catch (err) {
          console.warn('Error rendering Layer Manager:', err);
        }
      }, 100);
    }
    // Note: Panel visibility is now managed by unified useEffect above
  }, [activeSidebarSection]);

  // Unified cleanup: Remove GrapesJS content from wrong locations and ensure panels show correct content
  useEffect(() => {
    // Debounce cleanup to prevent race conditions
    let cleanupTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const cleanupGrapesJSContent = () => {
      const layersPanel = document.getElementById('layers-panel');
      const stylePanel = document.getElementById('style-panel');
      const widgetsWrapper = document.querySelector('.elementor-blocks-wrapper');
      const blocksPanel = document.getElementById('blocks-panel');
      
      // CRITICAL: Remove style content from widgets panel
      if (activeSidebarSection === 'widgets') {
        if (widgetsWrapper) {
          const styleContentInWidgets = widgetsWrapper.querySelectorAll('.gjs-sm-sector, .gjs-sm-property, .gjs-sm-properties, .gjs-sm-sector-content, .gjs-sm-property__field, .gjs-field, [class*="gjs-sm"]');
          styleContentInWidgets.forEach((el: any) => {
            el.remove();
          });
        }
        if (blocksPanel) {
          const styleContentInBlocks = blocksPanel.querySelectorAll('.gjs-sm-sector, .gjs-sm-property, .gjs-sm-properties, .gjs-sm-sector-content, .gjs-sm-property__field, .gjs-field, [class*="gjs-sm"]');
          styleContentInBlocks.forEach((el: any) => {
            el.remove();
          });
        }
        // Ensure style panel is hidden
        if (stylePanel) {
          const stylePanelCard = stylePanel.closest('.elementor-panel-card[data-panel-type="style"]');
          if (stylePanelCard) {
            (stylePanelCard as HTMLElement).style.setProperty('display', 'none', 'important');
          }
        }
        // Ensure structure panel is hidden
        if (layersPanel) {
          const structurePanelCard = layersPanel.closest('.elementor-panel-card[data-panel-type="structure"]');
          if (structurePanelCard) {
            (structurePanelCard as HTMLElement).style.setProperty('display', 'none', 'important');
          }
        }
      }

      // CRITICAL: Ensure style content is ONLY in style panel, never in structure panel
      if (activeSidebarSection === 'structure') {
        // Remove ALL style content from structure panel
        if (layersPanel) {
          const styleContentInStructure = layersPanel.querySelectorAll('.gjs-sm-sector, .gjs-sm-property, .gjs-sm-properties, .gjs-sm-sector-content, .gjs-sm-property__field, .gjs-field, [class*="gjs-sm"]');
          styleContentInStructure.forEach((el: any) => {
            el.remove();
          });
        }
        
        // Also ensure style panel is hidden
        if (stylePanel) {
          const stylePanelCard = stylePanel.closest('.elementor-panel-card[data-panel-type="style"]');
          if (stylePanelCard) {
            (stylePanelCard as HTMLElement).style.setProperty('display', 'none', 'important');
          }
        }
      }
      
      // CRITICAL: Ensure layer content is ONLY in structure panel, never in style panel
      if (activeSidebarSection === 'style') {
        // Remove ALL layer content from style panel
        if (stylePanel) {
          const layerContentInStyle = stylePanel.querySelectorAll('.gjs-layers, .gjs-layer-item, .gjs-layer-item-title, .gjs-lm-layer, .gjs-lm-title, .gjs-lm-items, [class*="gjs-lm"]');
          layerContentInStyle.forEach((el: any) => {
            el.remove();
          });
        }
        
        // Also ensure structure panel is hidden
        if (layersPanel) {
          const structurePanelCard = layersPanel.closest('.elementor-panel-card[data-panel-type="structure"]');
          if (structurePanelCard) {
            (structurePanelCard as HTMLElement).style.setProperty('display', 'none', 'important');
          }
        }
      }
      
      // Cleanup style manager content from wrong locations (only if style tab is not active)
      if (activeSidebarSection !== 'style') {
        const allStyleContent = document.querySelectorAll('.gjs-sm-sector, .gjs-sm-property, .gjs-sm-properties, .gjs-sm-sector-content, .gjs-sm-property__field, .gjs-field, [class*="gjs-sm"]');
        allStyleContent.forEach((el: any) => {
          const parent = el.closest('#style-panel');
          if (!parent) {
            // Remove style elements not in the correct panel
            el.remove();
          }
        });
      }
      
      // Cleanup layer manager content from wrong locations (only if structure tab is not active)
      if (activeSidebarSection !== 'structure') {
        const allLayerContent = document.querySelectorAll('.gjs-layers, .gjs-layer-item, .gjs-layer-item-title, .gjs-lm-layer, .gjs-lm-title, .gjs-lm-items, [class*="gjs-lm"]');
        allLayerContent.forEach((el: any) => {
          const parent = el.closest('#layers-panel');
          if (!parent) {
            // Remove layer elements not in the correct panel
            el.remove();
          }
        });
      }
    };
    
    // Run cleanup immediately and after a delay
    cleanupGrapesJSContent();
    
    // Debounce cleanup to prevent conflicts with rendering
    if (cleanupTimeout) {
      clearTimeout(cleanupTimeout);
    }
    
    cleanupTimeout = setTimeout(() => {
      cleanupGrapesJSContent();
    }, 100); // Small delay to catch any late renders
    
    return () => {
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }
    };
  }, [activeSidebarSection]);

  return (
    <div ref={rootContainerRef} className="custom-theme-builder-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#ffffff' }}>
      {/* Success Message Toast */}
      {publishSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#ffffff',
            padding: '14px 28px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <span style={{ fontSize: '18px' }}>✓</span>
          Theme published successfully!
        </div>
      )}
      
      {/* Top Bar - WordPress Elementor Style */}
      <div className="elementor-top-bar">
        <div className="elementor-top-bar-left">
          <div className="elementor-top-bar-icon" onClick={handleBackClick} title="Back to Themes">☰</div>
          
          {/* Editable Theme Name */}
          <div style={{ 
            marginLeft: '12px', 
            display: 'flex', 
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ 
              fontSize: '10px', 
              color: 'rgba(26, 26, 26, 0.6)',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Theme:
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Theme Name"
              className="elementor-theme-name-input"
              style={{
                background: 'rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '6px',
                padding: '5px 12px',
                color: '#1a1a1a',
                fontSize: '12px',
                fontWeight: 500,
                minWidth: '140px',
                maxWidth: '340px',
                width: 'auto',
                flex: '1 1 auto',
                outline: 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7E60E0';
                e.target.style.background = 'rgba(126, 96, 224, 0.15)';
                e.target.style.boxShadow = '0 0 0 2px rgba(126, 96, 224, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                e.target.style.background = 'rgba(0, 0, 0, 0.06)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {/* Undo/Redo Buttons */}
          <button
            onClick={() => {
              const editor = editorInstance.current;
              if (editor && editor.UndoManager) {
                editor.UndoManager.undo();
              }
            }}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            style={{
              background: canUndo ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              padding: '5px 10px',
              color: canUndo ? '#1a1a1a' : 'rgba(26, 26, 26, 0.4)',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              fontSize: '11px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              opacity: canUndo ? 1 : 0.5,
              marginLeft: '6px',
            }}
            onMouseEnter={(e) => {
              if (canUndo) {
                e.currentTarget.style.background = 'rgba(126, 96, 224, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(126, 96, 224, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (canUndo) {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            ↶ Undo
          </button>
          <button
            onClick={() => {
              const editor = editorInstance.current;
              if (editor && editor.UndoManager) {
                editor.UndoManager.redo();
              }
            }}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            style={{
              background: canRedo ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              padding: '5px 10px',
              color: canRedo ? '#1a1a1a' : 'rgba(26, 26, 26, 0.4)',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              fontSize: '11px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              opacity: canRedo ? 1 : 0.5,
              marginLeft: '5px',
            }}
            onMouseEnter={(e) => {
              if (canRedo) {
                e.currentTarget.style.background = 'rgba(126, 96, 224, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(126, 96, 224, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (canRedo) {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            ↷ Redo
          </button>
          
          <div 
            className="elementor-top-bar-icon" 
            title="Add Widget"
            onClick={() => {
              setActiveSidebarSection('widgets');
              setIsLeftSidebarCollapsed(false);
            }}
            style={{ cursor: 'pointer' }}
          >
            +
          </div>
          <div 
            className="elementor-top-bar-icon" 
            title="Toggle Grid Overlay"
            onClick={() => {
              setShowGridOverlay(!showGridOverlay);
              const editor = editorInstance.current;
              if (editor) {
                const canvas = editor.Canvas;
                if (canvas) {
                  const frame = canvas.getFrameEl();
                  if (frame && frame.contentDocument) {
                    const body = frame.contentDocument.body;
                    if (body) {
                      if (!showGridOverlay) {
                        // Add grid overlay
                        const gridOverlay = frame.contentDocument.createElement('div');
                        gridOverlay.id = 'ziplofy-grid-overlay';
                        gridOverlay.style.cssText = `
                          position: fixed;
                          top: 0;
                          left: 0;
                          width: 100%;
                          height: 100%;
                          background-image: 
                            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
                          background-size: 20px 20px;
                          pointer-events: none;
                          z-index: 9999;
                        `;
                        body.appendChild(gridOverlay);
                      } else {
                        // Remove grid overlay
                        const existing = frame.contentDocument.getElementById('ziplofy-grid-overlay');
                        if (existing) {
                          existing.remove();
                        }
                      }
                    }
                  }
                }
              }
            }}
            style={{ cursor: 'pointer', opacity: showGridOverlay ? 1 : 0.6 }}
          >
            ⊞
          </div>
        </div>
        <div className="elementor-top-bar-center">
          <div data-page-manager style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, zIndex: 10000 }}>
            <button
              onClick={() => setShowPageManager(!showPageManager)}
              style={{
                padding: '6px 14px',
                background: 'rgba(126, 96, 224, 0.12)',
                border: '1px solid rgba(126, 96, 224, 0.3)',
                borderRadius: '6px',
                color: '#1a1a1a',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s ease',
                position: 'relative',
                zIndex: 10001,
                maxWidth: '340px',
                minWidth: '120px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(126, 96, 224, 0.25)';
                e.currentTarget.style.borderColor = '#FBBF24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(126, 96, 224, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(126, 96, 224, 0.4)';
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{pages.find(p => p.id === currentPageId)?.name || 'Home'}</span>
              <span style={{ fontSize: 9, transition: 'transform 0.2s ease', transform: showPageManager ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>▼</span>
            </button>
            {showPageManager && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 6,
                background: '#ffffff',
                border: '1px solid rgba(126, 96, 224, 0.25)',
                borderRadius: 8,
                minWidth: 240,
                maxHeight: 400,
                overflowY: 'auto',
                zIndex: 99999,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06)',
              }}>
                <div style={{ 
                  padding: '10px 12px', 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)', 
                  fontSize: 10, 
                  color: '#6b4fc9', 
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  background: 'rgba(126, 96, 224, 0.06)'
                }}>
                  PAGES ({pages.length})
                </div>
                {pages.map((page) => (
                  <div
                    key={page.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: page.id === currentPageId ? 'rgba(126, 96, 224, 0.1)' : 'transparent',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (page.id !== currentPageId) {
                        e.currentTarget.style.background = 'rgba(126, 96, 224, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page.id !== currentPageId) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                    onClick={() => {
                      switchPage(page.id);
                      setShowPageManager(false);
                    }}
                  >
                    {page.id === currentPageId && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '3px',
                        background: 'linear-gradient(180deg, #7E60E0 0%, #6b4fc9 100%)',
                        borderRadius: '0 2px 2px 0'
                      }}></div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, paddingLeft: page.id === currentPageId ? 8 : 0 }}>
                      <input
                        type="text"
                        value={page.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          renamePage(page.id, e.target.value);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: page.id === currentPageId ? '#1a1a2e' : '#1a1a1a',
                          fontSize: 13,
                          padding: '4px 6px',
                          flex: 1,
                          outline: 'none',
                          fontWeight: page.id === currentPageId ? 600 : 500,
                          borderRadius: '4px',
                        }}
                        onFocus={(e) => {
                          e.target.style.background = 'rgba(126, 96, 224, 0.06)';
                          e.target.style.border = '1px solid rgba(126, 96, 224, 0.35)';
                          e.target.style.padding = '3px 5px';
                        }}
                        onBlur={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.border = 'none';
                          e.target.style.padding = '4px 6px';
                        }}
                      />
                      {page.id === currentPageId && (
                        <span style={{ fontSize: 8, color: '#7E60E0', fontWeight: 700 }}>●</span>
                      )}
                    </div>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(page.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(220, 38, 38, 0.7)',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          fontSize: 14,
                          borderRadius: 6,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'rgba(220, 38, 38, 0.7)';
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <div
                  onClick={() => {
                    addPage();
                    setShowPageManager(false);
                  }}
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    color: '#7E60E0',
                    fontSize: 13,
                    fontWeight: 600,
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                    background: 'rgba(126, 96, 224, 0.05)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(126, 96, 224, 0.1)';
                    e.currentTarget.style.color = '#6b4fc9';
                    e.currentTarget.style.borderColor = 'rgba(126, 96, 224, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(126, 96, 224, 0.05)';
                    e.currentTarget.style.color = '#7E60E0';
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)';
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 400 }}>+</span>
                  <span>Add New Page</span>
                </div>
              </div>
            )}
          </div>
          <div className="elementor-device-switcher">
              <button
              className={`elementor-device-btn ${currentDevice === 'desktop' ? 'active' : ''}`}
                onClick={() => {
                try {
                  const editor = editorInstance.current;
                  if (editor && editor.setDevice) {
                    editor.setDevice('desktop');
                    setCurrentDevice('desktop');
                    // Ensure canvas is properly centered
                    setTimeout(() => {
                      const canvasEl = document.querySelector('.gjs-cv-canvas') as HTMLElement;
                      const frameEl = document.querySelector('.gjs-frame') as HTMLElement;
                      if (canvasEl) {
                        canvasEl.style.setProperty('display', 'flex', 'important');
                        canvasEl.style.setProperty('justify-content', 'center', 'important');
                        canvasEl.style.setProperty('align-items', 'flex-start', 'important');
                        canvasEl.style.setProperty('width', '100%', 'important');
                        canvasEl.style.setProperty('margin', '0', 'important');
                        canvasEl.style.setProperty('padding', '24px', 'important');
                      }
                      if (frameEl) {
                        frameEl.style.setProperty('min-width', '1200px', 'important');
                        frameEl.style.setProperty('max-width', '1200px', 'important');
                        frameEl.style.setProperty('width', '1200px', 'important');
                        frameEl.style.setProperty('margin', '0 auto', 'important');
                      }
                    }, 100);
                  }
                } catch (e) {
                  console.error('Error switching to desktop:', e);
                }
              }}
              title="Desktop"
            >
              <Monitor size={18} strokeWidth={2} />
              </button>
          <button
              className={`elementor-device-btn ${currentDevice === 'tablet' ? 'active' : ''}`}
              onClick={() => {
                try {
                  const editor = editorInstance.current;
                  if (editor && editor.setDevice) {
                    editor.setDevice('tablet');
                    setCurrentDevice('tablet');
                    // Ensure canvas is properly centered
                    setTimeout(() => {
                      const canvasEl = document.querySelector('.gjs-cv-canvas') as HTMLElement;
                      const frameEl = document.querySelector('.gjs-frame') as HTMLElement;
                      if (canvasEl) {
                        canvasEl.style.setProperty('display', 'flex', 'important');
                        canvasEl.style.setProperty('justify-content', 'center', 'important');
                        canvasEl.style.setProperty('align-items', 'flex-start', 'important');
                        canvasEl.style.setProperty('width', '100%', 'important');
                        canvasEl.style.setProperty('margin', '0', 'important');
                        canvasEl.style.setProperty('padding', '24px', 'important');
                      }
                      if (frameEl) {
                        frameEl.style.setProperty('min-width', '768px', 'important');
                        frameEl.style.setProperty('max-width', '768px', 'important');
                        frameEl.style.setProperty('width', '768px', 'important');
                        frameEl.style.setProperty('margin', '0 auto', 'important');
                      }
                    }, 100);
                  }
                } catch (e) {
                  console.error('Error switching to tablet:', e);
                }
              }}
              title="Tablet"
            >
              <Tablet size={18} strokeWidth={2} />
          </button>
          <button
              className={`elementor-device-btn ${currentDevice === 'mobile' ? 'active' : ''}`}
              onClick={() => {
                try {
                  const editor = editorInstance.current;
                  if (editor && editor.setDevice) {
                    editor.setDevice('mobile');
                    setCurrentDevice('mobile');
                    // Ensure canvas is properly centered
                    setTimeout(() => {
                      const canvasEl = document.querySelector('.gjs-cv-canvas') as HTMLElement;
                      const frameEl = document.querySelector('.gjs-frame') as HTMLElement;
                      if (canvasEl) {
                        canvasEl.style.setProperty('display', 'flex', 'important');
                        canvasEl.style.setProperty('justify-content', 'center', 'important');
                        canvasEl.style.setProperty('align-items', 'flex-start', 'important');
                        canvasEl.style.setProperty('width', '100%', 'important');
                        canvasEl.style.setProperty('margin', '0', 'important');
                        canvasEl.style.setProperty('padding', '24px', 'important');
                      }
                      if (frameEl) {
                        frameEl.style.setProperty('min-width', '375px', 'important');
                        frameEl.style.setProperty('max-width', '375px', 'important');
                        frameEl.style.setProperty('width', '375px', 'important');
                        frameEl.style.setProperty('margin', '0 auto', 'important');
                      }
                    }, 100);
                  }
                } catch (e) {
                  console.error('Error switching to mobile:', e);
                }
              }}
              title="Mobile"
            >
              <Smartphone size={18} strokeWidth={2} />
          </button>
          </div>
        </div>
        <div className="elementor-top-bar-right">
          <div 
            className="elementor-top-bar-icon" 
            onClick={() => {
              setShowNotes(true);
            }}
            title="Notes & Changes"
            style={{ cursor: 'pointer' }}
          >
            📋
          </div>
          <div 
            className="elementor-top-bar-icon" 
            title="Link Manager"
            onClick={() => {
              const editor = editorInstance.current;
              if (editor) {
                const wrapper = editor.getWrapper();
                if (wrapper) {
                  // Find all links and buttons recursively
                  const findAllLinks = (comp: any): any[] => {
                    const links: any[] = [];
                    if (!comp) return links;
                    
                    try {
                      const tagName = comp.get?.('tagName')?.toLowerCase?.() || '';
                      const type = comp.get?.('type') || '';
                      const el = comp.getEl?.();
                      
                      // Check if this component is a link or button
                      const isLink = tagName === 'a' || type === 'link';
                      const isButton = tagName === 'button' || type === 'button' || type === 'button-outline' || type === 'button-text';
                      
                      // Also check by element if available
                      let isLinkOrButton = isLink || isButton;
                      if (el && !isLinkOrButton) {
                        const nodeName = el.nodeName?.toLowerCase();
                        isLinkOrButton = nodeName === 'a' || nodeName === 'button';
                      }
                      
                      if (isLinkOrButton) {
                        const attrs = comp.getAttributes?.() || {};
                        const href = attrs.href || comp.get?.('href') || el?.getAttribute?.('href') || '';
                        const pageLink = attrs['data-page-link'] || comp.get?.('data-page-link') || el?.getAttribute?.('data-page-link') || '';
                        const text = el?.textContent?.trim() || el?.innerText?.trim() || comp.get?.('content') || 'Untitled';
                        
                        links.push({
                          id: comp.cid || comp.getId?.() || Date.now().toString() + Math.random(),
                          type: isLink ? 'link' : 'button',
                          text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                          href: href,
                          pageLink: pageLink,
                          component: comp
                        });
                      }
                      
                      // Recursively check children
                      const children = comp.components?.();
                      if (children) {
                        if (typeof children.forEach === 'function') {
                          children.forEach((child: any) => {
                            links.push(...findAllLinks(child));
                          });
                        } else if (Array.isArray(children)) {
                          children.forEach((child: any) => {
                            links.push(...findAllLinks(child));
                          });
                        }
                      }
                    } catch (e) {
                      console.warn('Error finding links in component:', e);
                    }
                    
                    return links;
                  };
                  
                  const allLinks = findAllLinks(wrapper);
                  console.log('Link Manager: Found', allLinks.length, 'links/buttons');
                  setLinkManagerLinks(allLinks);
                  setShowLinkManager(true);
                }
              } else {
                setShowLinkManager(true);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            🔗
          </div>
          <button
            className="elementor-preview-btn"
            onClick={previewTheme}
            title="Preview"
          >
            Preview
          </button>
          <button
            className="elementor-save-draft-btn"
            onClick={() => saveToLocal(false)}
            disabled={saving}
            title="Save progress as draft"
            style={{
              padding: '8px 16px',
              background: 'rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.15)',
              borderRadius: '6px',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            className="elementor-publish-btn"
            onClick={() => saveToLocal(true)}
            disabled={saving}
          >
            {saving
              ? (isExistingTheme ? 'Modifying...' : 'Publishing...')
              : (isExistingTheme ? 'Modify' : 'Publish')}
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="builder-main-editor" style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#f5f5f7', position: 'relative' }}>
        {/* Full-screen loading overlay - covers entire editor until fully loaded */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10000,
              background: '#f1f3f5',
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #7E60E0',
                borderRadius: '50%',
                animation: 'elementor-loading-spin 0.8s linear infinite',
              }}
            />
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>
              Loading Elementor Editor...
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              Preparing widgets, structure & style panels
            </div>
            <style>{`
              @keyframes elementor-loading-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        {/* Left - Elementor Panels */}
        <div 
          className={`builder-left-panel ${isLeftSidebarCollapsed ? 'collapsed' : ''}`}
        >
          <div className="elementor-elements-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px' }}>
            {!isLeftSidebarCollapsed && (
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                color: '#fff',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                Elements
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
              }}
              className="sidebar-toggle-btn"
              style={{
                position: isLeftSidebarCollapsed ? 'static' : 'absolute',
                right: isLeftSidebarCollapsed ? 'auto' : '12px',
                top: isLeftSidebarCollapsed ? 'auto' : '50%',
                transform: isLeftSidebarCollapsed ? 'none' : 'translateY(-50%)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.9)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '16px',
                zIndex: 10,
                margin: isLeftSidebarCollapsed ? '0 auto' : '0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(126, 96, 224, 0.3) 0%, rgba(126, 96, 224, 0.2) 100%)';
                e.currentTarget.style.color = '#7E60E0';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 210, 190, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(126, 96, 224, 0.4)';
                e.currentTarget.style.transform = isLeftSidebarCollapsed ? 'scale(1.1)' : 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = isLeftSidebarCollapsed ? 'scale(1)' : 'translateY(-50%) scale(1)';
              }}
              title={isLeftSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isLeftSidebarCollapsed ? '▶' : '◀'}
            </button>
          </div>
          {!isLeftSidebarCollapsed && (
          <div className="elementor-primary-tabs">
            <button
              className={`elementor-primary-tab ${activeSidebarSection === 'widgets' ? 'active' : ''}`}
              onClick={() => setActiveSidebarSection('widgets')}
            >
              Widgets
            </button>
            <button
              className={`elementor-primary-tab ${activeSidebarSection === 'links' ? 'active' : ''}`}
              onClick={() => {
                setActiveSidebarSection('links');
                const editor = editorInstance.current;
                const sel = editor?.getSelected?.();
                if (sel) {
                  const tag = (sel.get?.('tagName') || '').toLowerCase();
                  const type = sel.get?.('type') || '';
                  const isLink = tag === 'a' || type === 'link';
                  const isButton = tag === 'button' || /button/i.test(type);
                  const attrs = sel.getAttributes?.() || {};
                  const href = attrs.href || sel.get?.('href') || '';
                  const pageLink = attrs['data-page-link'] || sel.get?.('pageLink') || '';
                  const linkType = sel.get?.('linkType') || (pageLink ? 'page' : (href && href !== '#' ? 'url' : 'page'));
                  if (isLink || isButton) {
                    setLinksPanelData({ component: sel, href: href || '', pageLink: pageLink || '', linkType, tagName: tag });
                  }
                }
              }}
            >
              Links & Nav
            </button>
            <button
              className={`elementor-primary-tab ${activeSidebarSection === 'structure' ? 'active' : ''}`}
              onClick={() => setActiveSidebarSection('structure')}
            >
              Structure
            </button>
            <button
              className={`elementor-primary-tab ${activeSidebarSection === 'style' ? 'active' : ''}`}
              onClick={() => setActiveSidebarSection('style')}
            >
              Style
            </button>
          </div>
          )}
          
          {isLeftSidebarCollapsed && (
            <div className="elementor-primary-tabs-collapsed" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
              <button
                className={`elementor-primary-tab-icon ${activeSidebarSection === 'widgets' ? 'active' : ''}`}
                onClick={() => {
                  setIsLeftSidebarCollapsed(false);
                  setActiveSidebarSection('widgets');
                }}
                title="Widgets"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeSidebarSection === 'widgets' ? 'rgba(126, 96, 224, 0.15)' : '#F0F0F0',
                  color: activeSidebarSection === 'widgets' ? '#7E60E0' : '#495157',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeSidebarSection !== 'widgets') {
                    e.currentTarget.style.background = 'rgba(126, 96, 224, 0.1)';
                    e.currentTarget.style.color = '#7E60E0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSidebarSection !== 'widgets') {
                    e.currentTarget.style.background = '#F0F0F0';
                    e.currentTarget.style.color = '#495157';
                  }
                }}
              >
                📦
              </button>
              <button
                className={`elementor-primary-tab-icon ${activeSidebarSection === 'links' ? 'active' : ''}`}
                onClick={() => {
                  setIsLeftSidebarCollapsed(false);
                  setActiveSidebarSection('links');
                  const editor = editorInstance.current;
                  const sel = editor?.getSelected?.();
                  if (sel) {
                    const tag = (sel.get?.('tagName') || '').toLowerCase();
                    const type = sel.get?.('type') || '';
                    const isLink = tag === 'a' || type === 'link';
                    const isButton = tag === 'button' || /button/i.test(type);
                    const attrs = sel.getAttributes?.() || {};
                    const href = attrs.href || sel.get?.('href') || '';
                    const pageLink = attrs['data-page-link'] || sel.get?.('pageLink') || '';
                    const linkType = sel.get?.('linkType') || (pageLink ? 'page' : (href && href !== '#' ? 'url' : 'page'));
                    if (isLink || isButton) {
                      setLinksPanelData({ component: sel, href: href || '', pageLink: pageLink || '', linkType, tagName: tag });
                    }
                  }
                }}
                title="Links and Navigations"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeSidebarSection === 'links' ? 'rgba(126, 96, 224, 0.15)' : '#F0F0F0',
                  color: activeSidebarSection === 'links' ? '#7E60E0' : '#495157',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeSidebarSection !== 'links') {
                    e.currentTarget.style.background = 'rgba(126, 96, 224, 0.1)';
                    e.currentTarget.style.color = '#7E60E0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSidebarSection !== 'links') {
                    e.currentTarget.style.background = '#F0F0F0';
                    e.currentTarget.style.color = '#495157';
                  }
                }}
              >
                🔗
              </button>
              <button
                className={`elementor-primary-tab-icon ${activeSidebarSection === 'structure' ? 'active' : ''}`}
                onClick={() => {
                  setIsLeftSidebarCollapsed(false);
                  setActiveSidebarSection('structure');
                }}
                title="Structure"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeSidebarSection === 'structure' ? 'rgba(126, 96, 224, 0.15)' : '#F0F0F0',
                  color: activeSidebarSection === 'structure' ? '#7E60E0' : '#495157',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeSidebarSection !== 'structure') {
                    e.currentTarget.style.background = 'rgba(126, 96, 224, 0.1)';
                    e.currentTarget.style.color = '#7E60E0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSidebarSection !== 'structure') {
                    e.currentTarget.style.background = '#F0F0F0';
                    e.currentTarget.style.color = '#495157';
                  }
                }}
              >
                🗂️
              </button>
              <button
                className={`elementor-primary-tab-icon ${activeSidebarSection === 'style' ? 'active' : ''}`}
                onClick={() => {
                  setIsLeftSidebarCollapsed(false);
                  setActiveSidebarSection('style');
                }}
                title="Style"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeSidebarSection === 'style' ? 'rgba(126, 96, 224, 0.15)' : '#F0F0F0',
                  color: activeSidebarSection === 'style' ? '#7E60E0' : '#495157',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeSidebarSection !== 'style') {
                    e.currentTarget.style.background = 'rgba(126, 96, 224, 0.1)';
                    e.currentTarget.style.color = '#7E60E0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSidebarSection !== 'style') {
                    e.currentTarget.style.background = '#F0F0F0';
                    e.currentTarget.style.color = '#495157';
                  }
                }}
              >
                🎨
              </button>
            </div>
          )}

          {!isLeftSidebarCollapsed && activeSidebarSection === 'widgets' && (
            <div className="elementor-search-widget">
              <span className="elementor-search-icon">🔍</span>
              <input
                value={blockSearch}
                onChange={(e) => setBlockSearch(e.target.value)}
                placeholder="Search Widget..."
              />
            </div>
          )}

          {!isLeftSidebarCollapsed && (
          <div className="elementor-left-scroll">
              <div
                className="elementor-blocks-wrapper"
                style={{ 
                  display: activeSidebarSection === 'widgets' ? 'block' : 'none',
                  visibility: activeSidebarSection === 'widgets' ? 'visible' : 'hidden',
                  opacity: activeSidebarSection === 'widgets' ? '1' : '0'
                }}
                aria-hidden={activeSidebarSection !== 'widgets'}
                ref={(el) => {
                  // Show only when widgets tab is active; hide when switching to other tabs
                  if (el) {
                    if (activeSidebarSection === 'widgets') {
                      el.style.setProperty('display', 'block', 'important');
                      el.style.setProperty('visibility', 'visible', 'important');
                      el.style.setProperty('opacity', '1', 'important');
                    } else {
                      el.style.setProperty('display', 'none', 'important');
                      el.style.setProperty('visibility', 'hidden', 'important');
                      el.style.setProperty('opacity', '0', 'important');
                    }
                  }
                }}
              >
                <div 
                  id="blocks-panel" 
                  style={{ 
                    display: 'block',
                    visibility: 'visible',
                    opacity: 1,
                    minHeight: '200px'
                  }}
                />
              </div>

            {/* traits-panel kept hidden for GrapesJS TraitManager - Settings UI removed per user request */}
            <div id="traits-panel" style={{ display: 'none', position: 'absolute', left: -9999, overflow: 'hidden' }} />

            <div
              className="elementor-panel-card elementor-links-panel"
              data-panel-type="links"
              data-visible={activeSidebarSection === 'links'}
              style={{ display: activeSidebarSection === 'links' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}
              aria-hidden={activeSidebarSection !== 'links'}
            >
              <div className="elementor-panel-card-title">Links and Navigations</div>
              <div className="elementor-panel-card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {linksPanelData ? (
                  <>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                      Edit the link for the selected {linksPanelData.tagName === 'a' ? 'link' : 'button'}.
                    </p>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Link type</label>
                      <select
                        value={linksPanelData.linkType}
                        onChange={(e) => {
                          const v = e.target.value;
                          const comp = linksPanelData.component;
                          setLinksPanelData((d) => d ? { ...d, linkType: v } : null);
                          comp.set?.('linkType', v);
                          if (v === 'none') {
                            comp.removeAttributes?.('data-page-link');
                            comp.addAttributes?.({ href: '#' });
                            comp.set?.('href', '#');
                            const view = comp.getView?.();
                            if (view?.el) {
                              view.el.removeAttribute('data-page-link');
                              view.el.setAttribute('href', '#');
                            }
                          } else if (v === 'page' && linksPanelData.pageLink) {
                            comp.addAttributes?.({ 'data-page-link': linksPanelData.pageLink });
                            comp.set?.('href', `#${linksPanelData.pageLink}`);
                            const view = comp.getView?.();
                            if (view?.el) {
                              view.el.setAttribute('data-page-link', linksPanelData.pageLink);
                              view.el.setAttribute('href', `#${linksPanelData.pageLink}`);
                            }
                          } else if (v === 'url' && linksPanelData.href && linksPanelData.href !== '#') {
                            comp.removeAttributes?.('data-page-link');
                            const safe = linksPanelData.href.startsWith('http') ? linksPanelData.href : 'https://' + linksPanelData.href;
                            comp.addAttributes?.({ href: safe });
                            comp.set?.('href', safe);
                            const view = comp.getView?.();
                            if (view?.el) {
                              view.el.removeAttribute('data-page-link');
                              view.el.setAttribute('href', safe);
                            }
                          }
                          comp.trigger?.('change');
                          setHasUnsavedChanges(true);
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '13px' }}
                      >
                        <option value="page">Navigate to page</option>
                        <option value="url">External URL</option>
                        {linksPanelData.tagName === 'button' && <option value="none">No action</option>}
                      </select>
                    </div>
                    {linksPanelData.linkType === 'page' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Select page</label>
                        <select
                          value={linksPanelData.pageLink}
                          onChange={(e) => {
                            const pageId = e.target.value;
                            setLinksPanelData((d) => d ? { ...d, pageLink: pageId, href: pageId ? `#${pageId}` : '#' } : null);
                            const comp = linksPanelData.component;
                            if (pageId) {
                              comp.addAttributes?.({ 'data-page-link': pageId, href: `#${pageId}` });
                              comp.set?.('pageLink', pageId);
                              comp.set?.('href', `#${pageId}`);
                              const view = comp.getView?.();
                              if (view?.el) {
                                view.el.setAttribute('data-page-link', pageId);
                                view.el.setAttribute('href', `#${pageId}`);
                              }
                            } else {
                              comp.removeAttributes?.('data-page-link');
                              comp.addAttributes?.({ href: '#' });
                              comp.set?.('href', '#');
                              const view = comp.getView?.();
                              if (view?.el) {
                                view.el.removeAttribute('data-page-link');
                                view.el.setAttribute('href', '#');
                              }
                            }
                            comp.trigger?.('change');
                            setHasUnsavedChanges(true);
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '13px' }}
                        >
                          <option value="">-- Select page --</option>
                          {(pages || []).map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {linksPanelData.linkType === 'url' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>URL</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="url"
                            value={linksPanelData.href}
                            placeholder="https://example.com"
                            onChange={(e) => setLinksPanelData((d) => d ? { ...d, href: e.target.value } : null)}
                            onBlur={(e) => {
                              const comp = linksPanelData.component;
                              const href = (e.currentTarget?.value || '').trim();
                              const safe = href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) ? href : (href ? 'https://' + href.replace(/^https?:\/\//, '') : '#');
                              comp.removeAttributes?.('data-page-link');
                              comp.addAttributes?.({ href: safe || '#' });
                              comp.set?.('href', safe || '#');
                              const view = comp.getView?.();
                              if (view?.el) {
                                view.el.removeAttribute('data-page-link');
                                view.el.setAttribute('href', safe || '#');
                              }
                              comp.trigger?.('change');
                              setLinksPanelData((d) => d ? { ...d, href: safe } : null);
                              setHasUnsavedChanges(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '13px' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const comp = linksPanelData.component;
                              const href = (linksPanelData.href || '').trim();
                              const safe = href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) ? href : (href ? 'https://' + href.replace(/^https?:\/\//, '') : '#');
                              comp.removeAttributes?.('data-page-link');
                              comp.addAttributes?.({ href: safe || '#' });
                              comp.set?.('href', safe || '#');
                              const view = comp.getView?.();
                              if (view?.el) {
                                view.el.removeAttribute('data-page-link');
                                view.el.setAttribute('href', safe || '#');
                              }
                              comp.trigger?.('change');
                              setLinksPanelData((d) => d ? { ...d, href: safe } : null);
                              setHasUnsavedChanges(true);
                            }}
                            style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid rgba(94,114,228,0.4)', background: 'rgba(94,114,228,0.1)', color: '#5e72e4', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                    {linksPanelData.linkType === 'none' && (
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Button has no link action.</p>
                    )}
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '8px 0 0 0' }}>
                      Current: {linksPanelData.href || linksPanelData.pageLink ? (linksPanelData.pageLink ? `Page: ${pages?.find(p => p.id === linksPanelData.pageLink)?.name || linksPanelData.pageLink}` : linksPanelData.href) : 'No link'}
                    </p>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: '#9ca3af', fontSize: '13px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔗</div>
                    <div>Select a button or link</div>
                    <div style={{ fontSize: '12px', marginTop: '6px' }}>Click a button or link in the canvas, then edit its navigation here.</div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="elementor-panel-card"
              data-panel-type="structure"
              data-visible={activeSidebarSection === 'structure'}
              style={{ display: activeSidebarSection === 'structure' ? 'flex' : 'none' }}
              aria-hidden={activeSidebarSection !== 'structure'}
            >
              <div className="elementor-panel-card-title">Structure</div>
              <div
                id="layers-panel"
                className="elementor-panel-card-body"
                style={{ display: 'block' }}
              />
            </div>

            <div
              className="elementor-panel-card"
              data-panel-type="style"
              data-visible={activeSidebarSection === 'style'}
              style={{ display: activeSidebarSection === 'style' ? 'flex' : 'none' }}
              aria-hidden={activeSidebarSection !== 'style'}
            >
              <div className="elementor-panel-card-title">Style</div>
              <div
                id="style-panel"
                className="elementor-panel-card-body elementor-style-body"
                style={{ display: 'block' }}
              />
            </div>
          </div>
          )}

        </div>

        {/* On-canvas Image Card - centered, fixed size */}
        {imagePanelData && createPortal(
          <>
          <div role="presentation" onClick={() => setImagePanelData(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100000 }} />
          <div
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              minHeight: 380,
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
              zIndex: 100001,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>Edit image</span>
              <button type="button" onClick={() => setImagePanelData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#6b7280', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setImageCardMode('upload')} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: `1px solid ${imageCardMode === 'upload' ? '#5e72e4' : '#e5e7eb'}`, background: imageCardMode === 'upload' ? 'rgba(94,114,228,0.1)' : '#fff', color: imageCardMode === 'upload' ? '#5e72e4' : '#6b7280', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Drop / Upload</button>
                <button type="button" onClick={() => setImageCardMode('url')} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: `1px solid ${imageCardMode === 'url' ? '#5e72e4' : '#e5e7eb'}`, background: imageCardMode === 'url' ? 'rgba(94,114,228,0.1)' : '#fff', color: imageCardMode === 'url' ? '#5e72e4' : '#6b7280', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Paste URL</button>
              </div>
              {imageCardMode === 'upload' ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = 'rgba(94,114,228,0.08)'; e.currentTarget.style.borderColor = '#5e72e4'; }}
                  onDragLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                    const file = e.dataTransfer?.files?.[0];
                    if (file?.type?.startsWith('image/')) {
                      const r = new FileReader();
                      r.onload = () => { const s = r.result as string; if (s) applyImageFromCard(s); };
                      r.readAsDataURL(file);
                    }
                  }}
                  onClick={() => (document.getElementById('ziplofy-image-file-input') as HTMLInputElement)?.click()}
                  style={{ border: '2px dashed #d1d5db', borderRadius: '10px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'all 0.2s' }}
                >
                  <input id="ziplofy-image-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file?.type?.startsWith('image/')) {
                      const r = new FileReader();
                      r.onload = () => { const s = r.result as string; if (s) applyImageFromCard(s); };
                      r.readAsDataURL(file);
                    }
                    e.target.value = '';
                  }} />
                  <div style={{ fontSize: '28px', marginBottom: '6px', opacity: 0.7 }}>🖼️</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Drop image or click to upload</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>PNG, JPG, GIF</div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={imagePanelData.src} placeholder="https://example.com/image.jpg" onChange={(e) => setImagePanelData((d) => d ? { ...d, src: e.target.value } : null)} onKeyDown={(e) => e.key === 'Enter' && applyImageFromCard((e.target as HTMLInputElement).value.trim())} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  <button type="button" onClick={() => applyImageFromCard((imagePanelData?.src || '').trim())} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#5e72e4', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Apply</button>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Alt text</label>
                <input type="text" value={imagePanelData.alt} placeholder="Describe the image" onChange={(e) => setImagePanelData((d) => d ? { ...d, alt: e.target.value } : null)} onBlur={() => applyAltFromCard()} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
              </div>
            </div>
          </div>
          </>,
          document.body
        )}

        {/* Center - Canvas - WordPress Elementor Style */}
        <div className="builder-center-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', position: 'relative' }}>
          {/* Canvas Wrapper - seamless white, no brown bar */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#ffffff' }}>
            {/* Canvas Content - header integrated, single white block */}
            <div style={{ 
              width: '100%', 
              maxWidth: '1200px', 
              background: '#fff', 
              minHeight: '600px',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
            {/* Canvas Header - inside white block, no gap */}
            <div className="elementor-canvas-header" style={{ width: '100%', maxWidth: '100%', marginBottom: 0 }}>
              <div className="elementor-canvas-site-name">{name || 'Ziplofy Theme'}</div>
              <div className="elementor-canvas-page-name">{pages.find(p => p.id === currentPageId)?.name || 'Home'}</div>
            </div>
              {loading && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '600px',
                  fontSize: 14,
                  color: '#6b7280',
                  gap: '16px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #5e72e4',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  <div>Loading Elementor Editor...</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    This may take a few moments
                  </div>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              )}
              {error && (
                <div style={{
                  padding: 12,
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: 6,
                  fontSize: 13,
                  border: '1px solid #fecaca',
                  margin: '20px',
                }}>
                  {error}
                </div>
              )}
              <div ref={editorRef} style={{ minHeight: '600px', marginTop: 0, paddingTop: 0 }} />
            </div>
            
            {/* Canvas Footer */}
            <div className="elementor-canvas-footer" style={{ width: '100%', maxWidth: '1200px', marginTop: 0 }}>
              Copyright © {new Date().getFullYear()} {name || 'Ziplofy Theme'} | Powered by{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>Ziplofy Theme Builder</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <ElementorTutorial onClose={() => setShowTutorial(false)} />
      )}
      
      {/* Global Search Modal */}
      {showGlobalSearch && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100000,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowGlobalSearch(false)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              width: '600px',
              maxWidth: '90vw',
              maxHeight: '70vh',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#000', fontSize: '18px', fontWeight: 600 }}>Global Search</h3>
              <button
                onClick={() => setShowGlobalSearch(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#000',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search components, text, styles..."
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowGlobalSearch(false);
                }
              }}
            />
          </div>
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {globalSearchQuery ? (
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                Searching for "{globalSearchQuery}"...
                <div style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  Search functionality will find components, text content, and styles matching your query.
                </div>
              </div>
            ) : (
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
                Type to search for components, text, or styles...
              </div>
            )}
          </div>
          </div>
        </div>
      )}
      
      {/* Link Manager Modal */}
      {showLinkManager && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100000,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowLinkManager(false)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              width: '600px',
              maxWidth: '90vw',
              maxHeight: '70vh',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: '#000', fontSize: '18px', fontWeight: 600 }}>Link Manager</h3>
              <button
                onClick={() => setShowLinkManager(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#000',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>
          </div>
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {linkManagerLinks.length > 0 && (
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.6)', 
                marginBottom: '12px', 
                padding: '10px', 
                background: 'rgba(126, 96, 224, 0.15)', 
                borderRadius: '6px', 
                border: '1px solid rgba(126, 96, 224, 0.2)',
                lineHeight: '1.5'
              }}>
                <strong style={{ color: '#7E60E0' }}>💡 How to use:</strong> Click any link/button below to select it in the editor. The Widgets panel will open automatically where you can edit the link settings (Link Type, Page, or URL).
              </div>
            )}
            {linkManagerLinks.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '13px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔗</div>
                <div>No links or buttons found</div>
                <div style={{ fontSize: '11px', marginTop: '8px', color: 'rgba(255, 255, 255, 0.3)' }}>
                  Add links or buttons to your theme to manage them here
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>
                  Found {linkManagerLinks.length} {linkManagerLinks.length === 1 ? 'link/button' : 'links/buttons'}
                </div>
                {linkManagerLinks.map((link) => (
                  <div
                    key={link.id}
                    onClick={() => {
                      const editor = editorInstance.current;
                      if (editor && link.component) {
                        // Close the Link Manager first
                        setShowLinkManager(false);
                        
                        // Ensure sidebar is expanded
                        setIsLeftSidebarCollapsed(false);
                        
                        // Switch to widgets tab to show link settings
                        setActiveSidebarSection('widgets');
                        
                        // Use requestAnimationFrame and multiple timeouts to ensure everything is visible
                        requestAnimationFrame(() => {
                          setTimeout(() => {
                            // Ensure secondary panel (traits) is visible
                            const secondaryPanel = document.querySelector('.elementor-secondary-panel') as HTMLElement;
                            if (secondaryPanel) {
                              secondaryPanel.style.setProperty('display', 'block', 'important');
                              secondaryPanel.style.setProperty('visibility', 'visible', 'important');
                              secondaryPanel.style.setProperty('opacity', '1', 'important');
                            }
                            
                            // Select the component - this will trigger component:selected event
                        editor.select(link.component);
                            
                            // Wait for component:selected handler to run, then ensure traits are rendered
                            setTimeout(() => {
                              // First, manually ensure traits are added if they don't exist
                              const tagName = link.component?.get('tagName')?.toLowerCase();
                              const isButton = tagName === 'button';
                              const isLink = tagName === 'a';
                              
                              if (isButton || isLink) {
                                const existingTraits = link.component.get('traits') || [];
                                const hasLinkType = existingTraits.some((t: any) => {
                                  return (typeof t === 'object' && t.name === 'linkType') || t === 'linkType';
                                });
                                
                                if (!hasLinkType) {
                                  // Add navigation traits manually
                                  const currentPages = pagesRef.current || [];
                                  const navigationTraits = [
                                    {
                                      type: 'select',
                                      name: 'linkType',
                                      label: isButton ? 'Button Action' : 'Link Type',
                                      options: isButton ? [
                                        { id: 'none', value: 'none', name: 'No Action' },
                                        { id: 'page', value: 'page', name: 'Navigate to Page' },
                                        { id: 'url', value: 'url', name: 'Open URL' },
                                      ] : [
                                        { id: 'page', value: 'page', name: 'Link to Page' },
                                        { id: 'url', value: 'url', name: 'External URL' },
                                      ],
                                      changeProp: true,
                                    },
                                    {
                                      type: 'select',
                                      name: 'pageLink',
                                      label: 'Select Page',
                                      options: [
                                        { id: '', value: '', name: '-- Select Page --' },
                                        ...currentPages.map((p) => ({ id: p.id, value: p.id, name: p.name }))
                                      ],
                                      changeProp: true,
                                    },
                                    {
                                      type: 'text',
                                      name: 'href',
                                      label: 'URL',
                                      placeholder: 'https://example.com or #page-1',
                                      changeProp: true,
                                    },
                                  ];
                                  
                                  const filteredTraits = existingTraits.filter((t: any) => {
                                    if (typeof t === 'string') {
                                      return t !== 'id' && t !== 'title' && t !== 'linkType' && t !== 'pageLink';
                                    }
                                    return t.name !== 'id' && t.name !== 'title' && t.name !== 'linkType' && t.name !== 'pageLink' && t.name !== 'href';
                                  });
                                  
                                  link.component.set('traits', [...filteredTraits, ...navigationTraits]);
                                }
                              }
                              
                              // Now ensure traits panel is visible and rendered
                              const traitsPanel = document.getElementById('traits-panel');
                              if (traitsPanel) {
                                traitsPanel.style.setProperty('display', 'block', 'important');
                                traitsPanel.style.setProperty('visibility', 'visible', 'important');
                                traitsPanel.style.setProperty('opacity', '1', 'important');
                                
                                // Force re-render of traits
                                if (editor.TraitManager) {
                                  try {
                                    // Re-select to trigger full trait rendering
                                    editor.select(link.component);
                                    
                                    // Wait a bit for the selection to process
                                    setTimeout(() => {
                                      // Render traits
                                      if (typeof editor.TraitManager.render === 'function') {
                                        const traitsEl = editor.TraitManager.render();
                                        if (traitsEl && traitsPanel) {
                                          // Clear and append new traits
                                          traitsPanel.innerHTML = '';
                                          if (traitsEl.nodeType === 1) {
                                            traitsPanel.appendChild(traitsEl);
                                          } else if (typeof traitsEl === 'string') {
                                            traitsPanel.innerHTML = traitsEl;
                                          }
                                        }
                                      }
                                      
                                      // Force update trait visibility
                                      setTimeout(() => {
                                        const linkType = link.component.get?.('linkType');
                                        if (linkType !== undefined) {
                                          const allTraits = traitsPanel.querySelectorAll('.gjs-trt-trait');
                                          allTraits.forEach((traitEl) => {
                                            const label = traitEl.querySelector('label, .gjs-trt-trait__label');
                                            if (label) {
                                              const labelText = label.textContent || '';
                                              if (labelText.includes('Select Page')) {
                                                (traitEl as HTMLElement).style.display = linkType === 'page' ? 'block' : 'none';
                                              } else if (labelText.includes('URL') && !labelText.includes('Select')) {
                                                (traitEl as HTMLElement).style.display = linkType === 'url' ? 'block' : 'none';
                                              }
                                            }
                                          });
                                        }
                                      }, 100);
                                    }, 100);
                                  } catch (e) {
                                    console.warn('Error rendering traits:', e);
                                  }
                                }
                              }
                              
                              // Scroll to structure panel
                              if (structurePanel) {
                                structurePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                              }
                            }, 300);
                          }, 150);
                        });
                      }
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(126, 96, 224, 0.4)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span style={{ 
                          fontSize: '12px', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          background: link.type === 'link' ? 'rgba(126, 96, 224, 0.2)' : 'rgba(255, 193, 7, 0.15)',
                          color: link.type === 'link' ? '#7E60E0' : '#ffc107',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          {link.type === 'link' ? '🔗 Link' : '🔘 Button'}
                        </span>
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 500, flex: 1 }}>
                          {link.text || 'Untitled'}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px', marginBottom: '4px' }}>
                      {link.pageLink ? (
                        <span>📄 Internal: <strong>{pages.find(p => p.id === link.pageLink)?.name || link.pageLink}</strong></span>
                      ) : link.href ? (
                        <span>🌐 External: <strong>{link.href.length > 40 ? link.href.substring(0, 40) + '...' : link.href}</strong></span>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.3)' }}>⚠️ No link set</span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: 'rgba(0, 210, 190, 0.8)', 
                      marginTop: '6px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>→</span>
                      <span>Click to select and edit link settings</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      )}
      
      {/* Notes & Changes Card */}
      {showNotes && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 100000,
            width: '400px',
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 100px)',
            background: '#ffffff',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(245, 158, 11, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.3s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', background: 'linear-gradient(180deg, rgba(254, 243, 199, 0.6) 0%, rgba(255, 255, 255, 0) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: 600 }}>📋 Notes & Changes</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={createNewNote}
                  title="Create New Note"
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.5)',
                      color: '#b45309',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px 10px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)';
                      e.currentTarget.style.borderColor = '#d97706';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
                    }}
                >
                  +
                </button>
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem(`ziplofy-theme-notes-${id || 'new'}`, JSON.stringify(notes));
                    } catch (e) {
                      console.warn('Failed to save notes:', e);
                    }
                    setShowNotes(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)';
                      e.currentTarget.style.color = '#1f2937';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  ×
                </button>
              </div>
            </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
            </div>
            <div style={{ padding: '12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notes.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px', 
                  color: '#6b7280',
                  fontSize: '13px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                  <div style={{ color: '#374151' }}>No notes yet</div>
                  <div style={{ fontSize: '11px', marginTop: '8px', color: '#9ca3af' }}>
                    Click the + button to create your first note
                  </div>
                </div>
              ) : (
              notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: editingNoteId === note.id ? 'rgba(254, 243, 199, 0.8)' : 'rgba(254, 249, 235, 0.9)',
                      border: editingNoteId === note.id ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '8px',
                      padding: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontSize: '10px', color: '#78716c' }}>
                        {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(220, 38, 38, 0.6)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'rgba(220, 38, 38, 0.6)';
                        }}
                        title="Delete note"
                      >
                        ✕
                      </button>
                    </div>
                    {editingNoteId === note.id ? (
                      <textarea
                        value={note.content}
                        onChange={(e) => updateNote(note.id, e.target.value)}
                        onBlur={() => {
                          if (note.content.trim() === '') {
                            deleteNote(note.id);
                          } else {
                            setEditingNoteId(null);
                          }
                        }}
                        autoFocus
                        placeholder="Write your note here..."
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          maxHeight: '200px',
                          padding: '8px',
                          background: '#ffffff',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '6px',
                          color: '#1f2937',
                          fontSize: '13px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          lineHeight: '1.5',
                          outline: 'none',
                          resize: 'vertical',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            if (note.content.trim() === '') {
                              deleteNote(note.id);
                            } else {
                              setEditingNoteId(null);
                            }
                          }
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingNoteId(note.id)}
                        style={{
                          color: '#1f2937',
                          fontSize: '13px',
                          lineHeight: '1.6',
                          cursor: 'text',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          minHeight: '40px',
                          padding: '8px',
                          borderRadius: '4px',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {note.content || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Click to edit...</span>}
                      </div>
                    )}
                  </div>
                ))
            )}
            </div>
        </div>
      )}
      
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
          }}
        >
          {/* Preview Header */}
          <div
            style={{
              background: '#1a1a1a',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                Theme Preview: {name || 'My Theme'}
              </h2>
              <span
                style={{
                  background: 'rgba(126, 96, 224, 0.2)',
                  color: '#7E60E0',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Live Preview
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  // Reload the iframe content
                  const iframe = document.getElementById('theme-preview-iframe') as HTMLIFrameElement;
                  if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.location.reload();
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                🔄 Reload
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  background: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#ff6b6b',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>
          
          {/* Preview Content */}
          <div style={{ flex: 1, position: 'relative', overflow: 'auto', minHeight: 0 }}>
            <iframe
              id="theme-preview-iframe"
              key={`preview-${Date.now()}-${previewHtml.length}`}
              srcDoc={previewHtml}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#fff',
              }}
              title="Theme Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              onLoad={(e) => {
                // CRITICAL: Force update iframe content when it loads
                // This ensures the latest HTML is always displayed
                const iframe = e.currentTarget;
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

export default CustomThemeBuilder;