import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../contexts/store.context";

// NOTE: Requires installing dependencies in Ziplofy:
// npm install grapesjs grapesjs-preset-webpage

const ThemeEditor: React.FC = () => {
  const { themeId = "" } = useParams();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [themeName, setThemeName] = useState<string>("");

  useEffect(() => {
    let editor: any;
    let destroyed = false;

    async function bootstrap() {
      try {
        setLoading(true);
        setError(null);

        // Dynamically import to avoid bundling issues until deps are installed
        const grapesjs = (await import("grapesjs")).default;
        // Optional preset with common blocks
        await import("grapesjs/dist/css/grapes.min.css");

        // Fetch the preview/installed HTML that already rewrites asset URLs
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const cacheBuster = `?v=${Date.now()}`;

        const getUserIdFromToken = (): string | null => {
          try {
            const token = localStorage.getItem('accessToken') || 
                          sessionStorage.getItem('accessToken') ||
                          localStorage.getItem('token') ||
                          sessionStorage.getItem('token');
            if (!token) return null;
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return String(payload.uid || payload.userId || payload.id || '');
          } catch {
            return null;
          }
        };

        const userId = getUserIdFromToken();
        // Fetch theme details to show name
        try {
          const tRes = await fetch(`${apiBase}/themes/${themeId}`, { credentials: 'include' });
          if (tRes.ok) {
            const t = await tRes.json();
            const nm = (t?.data?.name) || (t?.name) || "Theme";
            setThemeName(nm);
          }
        } catch {}
        // Prefer installed (store-specific first, then user-specific), fallback to default preview
        const installedBase = activeStoreId
          ? `${apiBase}/themes/installed/${activeStoreId}/${themeId}/unzippedTheme`
          : (userId ? `${apiBase}/themes/installed/${userId}/${themeId}/unzippedTheme` : null);

        let previewUrl = `${apiBase}/themes/preview/${themeId}`;
        let cssUrl = `${apiBase}/themes/preview/${themeId}/assets/css/style.css`;

        if (installedBase) {
          // Try to use the installed, modified theme if available
          const probe = await fetch(`${installedBase}/index.html${cacheBuster}`, { credentials: 'include' });
          if (probe.ok) {
            previewUrl = `${installedBase}/index.html${cacheBuster}`;
            cssUrl = `${installedBase}/assets/css/style.css${cacheBuster}`;
          }
        }

        const res = await fetch(previewUrl, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load theme HTML for editor");
        const html = await res.text();

        if (destroyed) return;

        editor = grapesjs.init({
          container: editorRef.current as HTMLElement,
          fromElement: false,
          height: "calc(100vh - 100px)",
          storageManager: { autoload: false },
          canvas: {
            styles: [cssUrl],
          },
          selectorManager: { componentFirst: true },
        });

        editor.setComponents(html);

        // Basic panel: export / preview actions (optional minimal UX)
        const pn = editor.Panels;
        pn.addButton("options", {
          id: "preview-page",
          className: "fa fa-eye",
          attributes: { title: "Preview" },
          command: "preview",
        });

        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Failed to initialize editor");
        setLoading(false);
      }
    }

    bootstrap();

    return () => {
      destroyed = true;
    };
  }, [themeId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: "8px 0" }}>
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/themes/all-themes');
            }
          }}
          style={{
            border: '1px solid #d1d5da', background: '#fff', color: '#111827',
            padding: '6px 10px', borderRadius: 6, cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <div style={{ fontWeight: 700, fontSize: 16 }}>
          {themeName ? `Editing: ${themeName}` : 'Editing Theme'}
        </div>
      </div>
      {loading && <div>Loading editor...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div ref={editorRef} style={{ flex: 1, minHeight: 600, border: "1px solid #e5e7eb", borderRadius: 6 }} />
    </div>
  );
};

export default ThemeEditor;


