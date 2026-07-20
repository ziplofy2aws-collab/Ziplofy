import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useStore } from "../../contexts/store.context";

type FileId = "index.html" | "assets/css/style.css" | "assets/js/script.js";

const DEFAULT_FILES: FileId[] = [
  "index.html",
  "assets/css/style.css",
  "assets/js/script.js",
];

interface Props { fullScreen?: boolean }

const ThemeCodeEditor: React.FC<Props> = ({ fullScreen = false }) => {
  const { themeId = "" } = useParams();
  const { activeStoreId } = useStore();
  const [activeFile, setActiveFile] = useState<string>("index.html");
  const [files, setFiles] = useState<Record<string, string>>({});
  const [fileList, setFileList] = useState<string[]>(DEFAULT_FILES);
  const [themeName, setThemeName] = useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const codeEditorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Layout: resizable panes and expandable sections
  const [sidebarWidth, setSidebarWidth] = useState<number>(280);
  const [previewWidth, setPreviewWidth] = useState<number>(420);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [expandedPane, setExpandedPane] = useState<null | 'explorer' | 'editor' | 'preview'>(null);

  const isExplorerExpanded = expandedPane === 'explorer';
  const isEditorExpanded = expandedPane === 'editor';
  const isPreviewExpanded = expandedPane === 'preview';

  const apiBase = useMemo(() => (import.meta.env.VITE_API_URL || "http://localhost:5000/api") as string, []);
  const previewBase = useMemo(() => `${apiBase}/themes/preview/${themeId}`, [apiBase, themeId]);
  
  
  
  // Save status
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') ||
      ''
    );
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  const hasAuth = useMemo(() => {
    const t = getToken();
    return !!t;
  }, [getToken]);

  // Extract user id from JWT without verifying (for building installed preview base)
  const getUserIdFromToken = useCallback(() => {
    const token = getToken();
    if (!token) return '';
    try {
      const parts = token.split('.');
      if (parts.length < 2) return '';
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return String(payload.uid || payload.userId || payload.id || '');
    } catch {
      return '';
    }
  }, [getToken]);

  const installedPreviewBase = useMemo(() => {
    // CRITICAL: Prioritize store-specific preview when activeStoreId is available
    // This ensures preview shows the correct store's theme edits
    if (activeStoreId) {
      return `${apiBase}/themes/installed/${activeStoreId}/${themeId}/unzippedTheme/`;
    }
    // Fallback to user-specific preview if no store is selected
    const uid = getUserIdFromToken();
    return uid ? `${apiBase}/themes/installed/${uid}/${themeId}/unzippedTheme/` : '';
  }, [apiBase, themeId, activeStoreId, getUserIdFromToken]);

  const saveCurrentFileEdit = useCallback(async () => {
    if (!themeId || !activeFile) {
      setSaveError('No file selected to save.');
      return;
    }
    if (!hasAuth) {
      setSaveError('Login required to save.');
      return;
    }
    if (!activeStoreId) {
      setSaveError('Please select a store before saving.');
      return;
    }
    
    const contentToSave = files[activeFile] ?? '';
    if (!contentToSave && contentToSave !== '') {
      console.warn('Warning: Saving empty content');
    }
    
    setSaving(true);
    setSaveError(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeaders() as any,
      };
      
      const savePayload = { 
        path: activeFile, 
        content: contentToSave,
        storeId: activeStoreId, // Always send storeId when available
      };
      
      console.log('💾 Saving file:', { 
        themeId, 
        path: activeFile, 
        storeId: activeStoreId,
        contentLength: contentToSave.length 
      });
      
      const res = await fetch(`${apiBase}/themes/${themeId}/save-edit`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(savePayload),
      });
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        const errorMsg = txt || `Save failed with status ${res.status}`;
        console.error('❌ Save failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      const responseData = await res.json().catch(() => ({}));
      if (responseData.success !== false) {
        console.log('✅ File saved successfully:', { themeId, path: activeFile, storeId: activeStoreId });
        setLastSavedAt(new Date());
        setSaveError(null);
      } else {
        throw new Error(responseData.error || responseData.message || 'Save failed');
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Failed to save file';
      console.error('❌ Save error:', errorMsg);
      setSaveError(errorMsg);
    } finally {
      setSaving(false);
    }
  }, [apiBase, themeId, activeFile, files, getAuthHeaders, hasAuth, activeStoreId]);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      try {
        setLoading(true);
        setError(null);
        
        // Clear files cache when store changes to prevent stale data
        console.log(`🔄 Store changed, clearing file cache. New storeId: ${activeStoreId || 'none'}`);
        setFiles({});

        // Load listing from backend
        try {
          const storeIdParam = activeStoreId ? `?storeId=${encodeURIComponent(activeStoreId)}` : '';
          const listRes = await fetch(`${apiBase}/themes/files/${themeId}${storeIdParam}`, { credentials: "include", headers: getAuthHeaders() as any });
          if (listRes.ok) {
            const json = await listRes.json();
            if (json?.files?.length) setFileList(json.files);
          }
        } catch {}

        // Load theme name
        try {
          const tRes = await fetch(`${apiBase}/themes/${themeId}`, { credentials: 'include', headers: getAuthHeaders() as any });
          if (tRes.ok) {
            const t = await tRes.json();
            const nm = (t?.data?.name) || (t?.name) || "Theme";
            if (!cancelled) setThemeName(nm);
          }
        } catch {}

        // Load default editable files via user-aware file reader so user edits persist after refresh
        // CRITICAL: Always pass storeId when available to ensure store-specific files are loaded
        const storeIdParam = activeStoreId ? `&storeId=${encodeURIComponent(activeStoreId)}` : '';
        console.log(`📂 Loading files for storeId: ${activeStoreId || 'none (user-specific)'}`);
        const [html, css, js] = await Promise.all([
          fetch(`${apiBase}/themes/file/${themeId}?path=${encodeURIComponent('index.html')}${storeIdParam}`, { credentials: 'include', headers: getAuthHeaders() as any })
            .then(r => r.ok ? r.text() : ""),
          fetch(`${apiBase}/themes/file/${themeId}?path=${encodeURIComponent('assets/css/style.css')}${storeIdParam}`, { credentials: 'include', headers: getAuthHeaders() as any })
            .then(r => r.ok ? r.text() : ""),
          fetch(`${apiBase}/themes/file/${themeId}?path=${encodeURIComponent('assets/js/script.js')}${storeIdParam}`, { credentials: 'include', headers: getAuthHeaders() as any })
            .then(r => r.ok ? r.text() : ""),
        ]);

        if (cancelled) return;
        setFiles(prev => ({ ...prev, "index.html": html, "assets/css/style.css": css, "assets/js/script.js": js }));
        setActiveFile("index.html");
      } catch (e: any) {
        setError(e?.message || "Failed to load theme files");
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
    return () => { cancelled = true; };
  }, [previewBase, activeStoreId, apiBase, themeId, getAuthHeaders]);

  // Lazy load file content on selection if not already loaded
  useEffect(() => {
    async function loadFile(path: string) {
      if (files[path] !== undefined) return;
      try {
        setLoadingFile(path);
        const storeIdParam = activeStoreId ? `&storeId=${encodeURIComponent(activeStoreId)}` : '';
        const res = await fetch(`${apiBase}/themes/file/${themeId}?path=${encodeURIComponent(path)}${storeIdParam}`, { credentials: 'include', headers: getAuthHeaders() as any });
        if (res.ok) {
          const txt = await res.text();
          setFiles(prev => ({ ...prev, [path]: txt }));
        }
      } catch {}
      finally { setLoadingFile(prev => (prev === path ? null : prev)); }
    }
    if (activeFile && !DEFAULT_FILES.includes(activeFile as FileId)) {
      loadFile(activeFile);
    }
  }, [activeFile, apiBase, themeId, files, activeStoreId, getAuthHeaders]);

  const buildPreviewHtml = useCallback(() => {
    const html = files["index.html"] || "";
    const js = files["assets/js/script.js"] || "";

    // Sanitize: remove base and scripts only (keep link tags so CSS relative URLs work)
    let sanitized = html
      .replace(/<base[^>]*>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "");

    const ensureHead = sanitized.includes("</head>") ? sanitized : sanitized.replace(/<html[^>]*>/i, "$&<head></head>");
    const baseHref = installedPreviewBase || `${previewBase}/`;
    const withBase = ensureHead.replace(/<head>/i, `<head><base href="${baseHref}">`);
    // Inject a single script tag referencing the user-installed JS file so it runs once
    const injected = withBase
      .replace(/<\/body>/i, `${js ? `<script type=\"module\" src=\"${baseHref}assets/js/script.js\"></script>` : ""}</body>`);
    return injected;
  }, [files, previewBase, installedPreviewBase]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(buildPreviewHtml());
    doc.close();
  }, [files, buildPreviewHtml]);

  // Global keybinding: Cmd/Ctrl + F to open Monaco find widget
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const pressed = (isMac ? e.metaKey : e.ctrlKey) && (e.key === 'f' || e.key === 'F');
      if (pressed) {
        e.preventDefault();
        try {
          codeEditorRef.current?.focus?.();
          codeEditorRef.current?.trigger?.('keyboard', 'actions.find', null);
        } catch {}
      }
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true } as any);
  }, []);

  // Mouse handlers for resizers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const minSidebar = 180;
      const minPreview = 280;
      const minEditor = 300;
      const totalWidth = rect.width;

      if (isResizingLeft) {
        const x = e.clientX - rect.left;
        const newSidebar = Math.max(minSidebar, Math.min(x, totalWidth - previewWidth - minEditor));
        setSidebarWidth(newSidebar);
      } else if (isResizingRight) {
        const xFromRight = rect.right - e.clientX;
        const newPreview = Math.max(minPreview, Math.min(xFromRight, totalWidth - sidebarWidth - minEditor));
        setPreviewWidth(newPreview);
      }
    };
    const onUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizingLeft, isResizingRight, sidebarWidth, previewWidth]);

  const onChange = (value?: string) => {
    if (typeof value !== "string") return;
    setFiles(prev => ({ ...prev, [activeFile]: value }));
  };

  const language = useMemo(() => {
    const lower = activeFile.toLowerCase();
    if (lower.endsWith(".html") || lower.endsWith('.htm')) return "html";
    if (lower.endsWith(".css")) return "css";
    if (lower.endsWith(".js") || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return "javascript";
    if (lower.endsWith('.json')) return 'json';
    if (lower.endsWith('.ts')) return 'typescript';
    if (lower.endsWith('.tsx')) return 'typescript';
    if (lower.endsWith('.jsx')) return 'javascript';
    if (lower.endsWith('.md')) return 'markdown';
    return "plaintext";
  }, [activeFile]);

  const isTextFile = useMemo(() => {
    const lower = activeFile.toLowerCase();
    return (
      /\.(html?|css|js|mjs|cjs|json|ts|tsx|jsx|md|txt|svg|xml|yml|yaml|env|ini|cfg|conf)$/i.test(lower)
    );
  }, [activeFile]);

  // Build folder tree structure
  const folderTree = useMemo(() => {
    const root: Record<string, any> = {};
    
    fileList.forEach((filePath: string) => {
      const parts = filePath.split('/');
      let current = root;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        
        if (!current[part]) {
          current[part] = isLast ? { type: 'file', path: filePath } : { type: 'folder', children: {} };
        }
        
        if (!isLast) {
          current = current[part].children;
        }
      }
    });
    
    return root;
  }, [fileList]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const renderFileTree = (node: any, path = '', depth = 0) => {
    const items: React.ReactNode[] = [];
    
    Object.entries(node).forEach(([name, value]: [string, any]) => {
      if (name === 'files') return;
      
      const fullPath = path ? `${path}/${name}` : name;
      const isExpanded = expandedFolders.has(fullPath);
      
      if (value.type === 'folder') {
        items.push(
          <div key={fullPath}>
            <div
              onClick={() => toggleFolder(fullPath)}
              onMouseEnter={() => setHoveredFile(fullPath)}
              onMouseLeave={() => setHoveredFile(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                paddingLeft: `${8 + depth * 16}px`,
                cursor: 'pointer',
                fontSize: '13px',
                color: '#8B949E',
                backgroundColor: hoveredFile === fullPath ? '#21262D' : 'transparent',
                borderRadius: '3px',
                margin: '1px 0',
              }}
            >
              <span style={{ marginRight: '6px', fontSize: '12px' }}>
                {isExpanded ? '📂' : '📁'}
              </span>
              {name}
            </div>
            {isExpanded && (
              <div>
                {renderFileTree(value.children, fullPath, depth + 1)}
              </div>
            )}
          </div>
        );
      } else {
        const isActive = activeFile === value.path;
        const isLoading = loadingFile === value.path;
        const isHovered = hoveredFile === value.path;
        
        items.push(
          <div
            key={value.path}
            onClick={() => setActiveFile(value.path)}
            onMouseEnter={() => setHoveredFile(value.path)}
            onMouseLeave={() => setHoveredFile(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 8px',
              paddingLeft: `${8 + depth * 16}px`,
              cursor: 'pointer',
              fontSize: '13px',
              color: isActive ? '#FFFFFF' : '#8B949E',
              backgroundColor: isActive 
                ? '#0969DA' 
                : isHovered 
                  ? '#21262D' 
                  : 'transparent',
              borderRadius: '3px',
              margin: '1px 0',
            }}
          >
            <span style={{ marginRight: '6px', fontSize: '12px' }}>
              {getFileIcon(name)}
            </span>
            {name}
            {isLoading && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#6b7280' }}>(loading)</span>}
          </div>
        );
      }
    });
    
    return items;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
      case 'htm': return '🌐';
      case 'css': return '🎨';
      case 'js':
      case 'mjs':
      case 'cjs': return '📜';
      case 'ts':
      case 'tsx': return '🔷';
      case 'jsx': return '⚛️';
      case 'json': return '📋';
      case 'md': return '📝';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg': return '🖼️';
      case 'txt': return '📄';
      default: return '📄';
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: 'column', height: fullScreen ? "100vh" : "calc(100vh - 60px)", gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
          onClick={() => {
            // Always navigate to all-themes to maintain store context
            navigate('/themes/all-themes');
          }}
          style={{
            border: '1px solid #d1d5da', background: '#fff', color: '#111827',
            padding: '6px 10px', borderRadius: 6, cursor: 'pointer'
          }}
          >
            ← Back
          </button>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {themeName ? `Editing Code: ${themeName}` : 'Editing Code'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveError && <span style={{ color: '#dc2626', fontSize: 12 }}>{saveError}</span>}
          {saving && <span style={{ color: '#6b7280', fontSize: 12 }}>💾 Saving…</span>}
          {!saving && lastSavedAt && (
            <span style={{ color: '#6b7280', fontSize: 12 }}>✓ Saved {lastSavedAt.toLocaleTimeString()}</span>
          )}
          <button
            onClick={saveCurrentFileEdit}
            disabled={saving}
            style={{ border: '1px solid #10b981', background: '#10b981', color: '#ffffff', padding: '6px 12px', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}
          >
            Save
          </button>
        </div>
      </div>
      <div ref={containerRef} style={{ display: 'flex', gap: 0, flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
      {/* Explorer */}
      <div style={{ 
        flex: isExplorerExpanded ? '1 1 auto' : `0 0 ${((isEditorExpanded || isPreviewExpanded) ? 0 : sidebarWidth)}px`,
        minWidth: 0,
        borderRight: "1px solid #30363D", 
        backgroundColor: '#161B22',
        color: '#F0F6FC',
        display: 'flex',
        flexDirection: 'column',
        transition: 'flex-basis 120ms ease',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #30363D',
          fontWeight: 600,
          fontSize: '13px',
          color: '#F0F6FC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span>EXPLORER</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setExpandedPane(expandedPane === 'explorer' ? null : 'explorer')}
                title={expandedPane === 'explorer' ? 'Restore layout' : 'Expand Explorer'}
                style={{ border: '1px solid #30363D', background: '#0D1117', color: '#E6EDF3', padding: '2px 6px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
              >
                {expandedPane === 'explorer' ? 'Restore' : 'Expand'}
              </button>
            </div>
          </div>
        </div>
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          padding: '8px 0'
        }}>
          {renderFileTree(folderTree)}
        </div>
      </div>

      {/* Left resizer */}
      {expandedPane === null && (
        <div
          onMouseDown={() => setIsResizingLeft(true)}
          style={{ width: 8, cursor: 'col-resize', background: '#0d1117', borderRight: '1px solid #30363D', borderLeft: '1px solid #0b0f14' }}
        />
      )}

      {/* Editor */}
      <div style={{ 
        flex: isEditorExpanded ? '1 1 auto' : (expandedPane ? '0 0 0px' : '1 1 auto'),
        minWidth: 0,
        display: 'flex',
        flexDirection: "column",
        transition: 'flex-basis 120ms ease',
        overflow: expandedPane && !isEditorExpanded ? 'hidden' : 'initial'
      }}>
        <div style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>{activeFile}</div>
        <div style={{ flex: 1, minHeight: 300 }}>
          {!loading && isTextFile && (
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={files[activeFile] ?? (loadingFile === activeFile ? "" : (files[activeFile] ?? ""))}
              onChange={onChange}
              onMount={(editorInstance) => { codeEditorRef.current = editorInstance; }}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          )}
          {!loading && !isTextFile && (
            <div style={{ padding: 12, color: '#6b7280' }}>
              Preview not available for this file type. Select a text file to edit.
            </div>
          )}
          {loading && <div style={{ padding: 12 }}>Loading files…</div>}
          {error && <div style={{ padding: 12, color: "#dc2626" }}>{error}</div>}
        </div>
        <div style={{ padding: '6px 8px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setExpandedPane(expandedPane === 'editor' ? null : 'editor')}
            title={expandedPane === 'editor' ? 'Restore layout' : 'Expand Editor'}
            style={{ border: '1px solid #d1d5da', background: '#fff', color: '#111827', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          >
            {expandedPane === 'editor' ? 'Restore' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Right resizer */}
      {expandedPane === null && (
        <div
          onMouseDown={() => setIsResizingRight(true)}
          style={{ width: 6, cursor: 'col-resize', background: 'transparent' }}
        />
      )}

      {/* Preview */}
      <div style={{ 
        flex: isPreviewExpanded ? '1 1 auto' : `0 0 ${((isExplorerExpanded || isEditorExpanded) ? 0 : previewWidth)}px`, 
        minWidth: 0, 
        borderLeft: "1px solid #e5e7eb", 
        display: 'flex', 
        flexDirection: "column", 
        transition: 'flex-basis 120ms ease', 
        overflow: 'hidden' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontWeight: 600 }}>Preview</div>
          {!fullScreen && (
            <button
              onClick={() => window.open(`/themes/code-fullscreen/${themeId}`, '_blank', 'noopener,noreferrer')}
              style={{
                border: '1px solid #d1d5da', background: '#fff', color: '#111827',
                padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600
              }}
            >
              Edit in new tab
            </button>
          )}
          <button
            onClick={() => { setIsResizingLeft(false); setIsResizingRight(false); setExpandedPane(prev => (prev === 'preview' ? null : 'preview')); }}
            title={expandedPane === 'preview' ? 'Restore layout' : 'Expand Preview'}
            style={{ border: '1px solid #d1d5da', background: '#fff', color: '#111827', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          >
            {expandedPane === 'preview' ? 'Restore' : 'Expand'}
          </button>
        </div>
        <iframe ref={iframeRef} style={{ flex: 1, border: 0, background: "#fff" }} title="Theme Preview" />
      </div>
      </div>
    </div>
  );
};

export default ThemeCodeEditor;