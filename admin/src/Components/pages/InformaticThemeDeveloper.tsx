import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./ThemeDeveloper.css";
import {
  Plus,
  Search,
  Trash2,
  X,
  Loader2,
  Check,
  AlertCircle,
  LayoutGrid,
  Globe,
  BarChart2,
} from "lucide-react";
import { PermissionGate } from "../PermissionGate";
import { usePermissions } from "../../hooks/usePermissions";
import { useAwsUpload } from "../../contexts/aws-upload.context";
import {
  useInformaticThemes,
  type InformaticThemeRecord,
} from "../../contexts/informatic-themes.context";

type ThemeUploadRowStatus = "pending" | "uploading" | "done" | "error";

interface ThemeUploadRow {
  id: string;
  label: string;
  status: ThemeUploadRowStatus;
}

interface ThemeUploadProgressUi {
  headline: string;
  fileCounter: string;
  remainingCounter: string;
  currentLabel: string;
  currentIndex: number;
  totalCount: number;
  percent: number;
  currentFileBytePercent: number;
  rows: ThemeUploadRow[];
}

function truncateMiddle(s: string, max: number): string {
  if (s.length <= max) return s;
  const keep = max - 1;
  const right = Math.ceil(keep / 2);
  const left = keep - right;
  return `${s.slice(0, left)}…${s.slice(-right)}`;
}

const PLACEHOLDER_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect fill='%23f1f5f9' width='200' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'%3ENo preview%3C/text%3E%3C/svg%3E";

const PREPARING_UPLOAD_PROGRESS: ThemeUploadProgressUi = {
  headline: "Preparing upload…",
  fileCounter: "Starting",
  remainingCounter: "Please wait",
  currentLabel: "",
  currentIndex: 0,
  totalCount: 0,
  percent: 0,
  currentFileBytePercent: 0,
  rows: [],
};

const InformaticThemeDeveloper: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [themes, setThemes] = useState<InformaticThemeRecord[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [deletingThemeId, setDeletingThemeId] = useState<string | null>(null);

  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    plan: "free",
    price: "",
    version: "1.0.0",
    tags: "informatic,content",
  });
  const [themeFolderFiles, setThemeFolderFiles] = useState<File[]>([]);
  const [reactThemeJsFile, setReactThemeJsFile] = useState<File | null>(null);
  const [reactThemeCssFile, setReactThemeCssFile] = useState<File | null>(null);
  const [themeSchemaFile, setThemeSchemaFile] = useState<File | null>(null);
  const [themeDefaultConfigFile, setThemeDefaultConfigFile] = useState<File | null>(null);
  const [themeManifestFile, setThemeManifestFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<ThemeUploadProgressUi | null>(null);

  const { hasViewPermission, hasUploadPermission } = usePermissions();
  const canView =
    hasViewPermission("Developer", "Informatic Themes") ||
    hasViewPermission("Developer", "Theme Developer");
  const canUpload =
    hasUploadPermission("Developer", "Informatic Themes") ||
    hasUploadPermission("Developer", "Theme Developer");

  const { generateThemeAssetSignedUrl, uploadFileToSignedUrl } = useAwsUpload();
  const { listInformaticThemes, createInformaticThemeFromS3, deactivateInformaticTheme } =
    useInformaticThemes();

  const signedUrlOpts = { themePipeline: "informatic" as const };

  const loadThemes = useCallback(async () => {
    setLoadingThemes(true);
    try {
      const res = await listInformaticThemes({ limit: 100 });
      setThemes(Array.isArray(res.data) ? res.data.filter((t) => t.isActive !== false) : []);
    } catch {
      setThemes([]);
    } finally {
      setLoadingThemes(false);
    }
  }, [listInformaticThemes]);

  useEffect(() => {
    if (canView) void loadThemes();
  }, [canView, loadThemes]);

  const filteredThemes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return themes;
    return themes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  }, [themes, searchTerm]);

  const handleDeleteTheme = async (themeId: string, themeName: string) => {
    if (!window.confirm(`Deactivate Informatic theme "${themeName}"?`)) return;
    setDeletingThemeId(themeId);
    try {
      await deactivateInformaticTheme(themeId);
      await loadThemes();
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to deactivate theme");
    } finally {
      setDeletingThemeId(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(PREPARING_UPLOAD_PROGRESS);

    let progressRows: ThemeUploadRow[] = [];
    let totalSteps = 0;

    try {
      if (!uploadForm.name || !uploadForm.plan) {
        throw new Error("Please fill in name and plan");
      }
      if (themeFolderFiles.length === 0 || !thumbnailFile) {
        throw new Error("Please select a theme folder and thumbnail");
      }
      if (!reactThemeJsFile || !reactThemeCssFile) {
        throw new Error("Please select remote theme JS and CSS bundles");
      }
      if (!themeSchemaFile || !themeDefaultConfigFile || !themeManifestFile) {
        throw new Error(
          "Please select theme.schema.json, theme.default-config.json, and theme.manifest.json"
        );
      }

      const themeCount = themeFolderFiles.length;
      progressRows = themeFolderFiles.map((f, i) => ({
        id: `theme-${i}`,
        label: (f.webkitRelativePath || f.name).replace(/\\/g, "/"),
        status: "pending" as ThemeUploadRowStatus,
      }));
      progressRows.push(
        { id: "thumb", label: `Thumbnail · ${thumbnailFile.name}`, status: "pending" },
        { id: "react-js", label: `Remote theme JS · ${reactThemeJsFile.name}`, status: "pending" },
        { id: "react-css", label: `Remote theme CSS · ${reactThemeCssFile.name}`, status: "pending" },
        { id: "theme-schema", label: `Theme schema · ${themeSchemaFile.name}`, status: "pending" },
        {
          id: "theme-default-config",
          label: `Default config · ${themeDefaultConfigFile.name}`,
          status: "pending",
        },
        { id: "theme-manifest", label: `Manifest · ${themeManifestFile.name}`, status: "pending" },
        { id: "finalize", label: "Register Informatic theme in catalog", status: "pending" }
      );

      totalSteps = progressRows.length;

      let currentFileBytePercent = 0;

      const syncProgress = (rowsSnapshot: ThemeUploadRow[], bytePct?: number) => {
        if (bytePct !== undefined) currentFileBytePercent = bytePct;

        const done = rowsSnapshot.filter((r) => r.status === "done").length;
        const upIdx = rowsSnapshot.findIndex((r) => r.status === "uploading");
        const inTheme = upIdx >= 0 && upIdx < themeCount;
        const isFinalizing = upIdx === totalSteps - 1;

        const currentIndex = upIdx >= 0 ? upIdx + 1 : Math.min(done + 1, totalSteps);
        const remaining = Math.max(0, totalSteps - done - (upIdx >= 0 ? 1 : 0));

        const headline =
          upIdx < 0
            ? "Preparing secure upload"
            : inTheme
              ? `Uploading theme folder — file ${upIdx + 1} of ${themeCount}`
              : upIdx === themeCount
                ? "Uploading thumbnail"
                : isFinalizing
                  ? "Registering Informatic theme in catalog"
                  : "Uploading theme config and remote assets";

        const fileCounter = inTheme
          ? `${upIdx + 1} / ${themeCount} theme files`
          : `${currentIndex} / ${totalSteps} overall`;

        const remainingCounter =
          remaining === 1 ? "1 file left" : `${remaining} files left`;

        const stepWeight = upIdx >= 0 ? currentFileBytePercent / 100 : 0;
        const pct =
          done >= totalSteps
            ? 100
            : Math.min(99, Math.round(((done + stepWeight) / totalSteps) * 100));

        const currentLabel =
          upIdx >= 0
            ? rowsSnapshot[upIdx].label
            : rowsSnapshot.find((r) => r.status === "pending")?.label ?? "";

        setUploadProgress({
          headline,
          fileCounter,
          remainingCounter,
          currentLabel,
          currentIndex,
          totalCount: totalSteps,
          percent: pct,
          currentFileBytePercent,
          rows: rowsSnapshot.map((r) => ({ ...r })),
        });
      };

      const setRow = (idx: number, status: ThemeUploadRowStatus) => {
        if (status !== "uploading") currentFileBytePercent = 0;
        progressRows = progressRows.map((r, i) => (i === idx ? { ...r, status } : r));
        syncProgress(progressRows, status === "uploading" ? 0 : currentFileBytePercent);
      };

      const putFile = async (
        rowIdx: number,
        file: File,
        contentType: string,
        getSigned: () => Promise<{ signedUrl: string; contentType: string; key: string }>
      ) => {
        setRow(rowIdx, "uploading");
        const signed = await getSigned();
        await uploadFileToSignedUrl(signed.signedUrl, file, signed.contentType, {
          onProgress: (loaded, total) => {
            const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
            syncProgress(progressRows, pct);
          },
        });
        setRow(rowIdx, "done");
        return signed;
      };

      syncProgress(progressRows);

      const sessionId = crypto.randomUUID();
      const uploadedFiles: { key: string; relativePath: string }[] = [];

      for (let i = 0; i < themeFolderFiles.length; i++) {
        const file = themeFolderFiles[i];
        const relativePath = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
        const signed = await putFile(i, file, file.type || "application/octet-stream", () =>
          generateThemeAssetSignedUrl({
            sessionId,
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            assetKind: "themeFile",
            relativePath,
            ...signedUrlOpts,
          })
        );
        uploadedFiles.push({ key: signed.key, relativePath });
      }

      const thumbSigned = await putFile(
        themeCount,
        thumbnailFile,
        thumbnailFile.type || "image/jpeg",
        () =>
          generateThemeAssetSignedUrl({
            sessionId,
            fileName: thumbnailFile.name,
            fileType: thumbnailFile.type || "image/jpeg",
            assetKind: "thumbnail",
            ...signedUrlOpts,
          })
      );

      let idx = themeCount + 1;

      const jsSigned = await putFile(
        idx,
        reactThemeJsFile,
        reactThemeJsFile.type || "application/javascript",
        () =>
          generateThemeAssetSignedUrl({
            sessionId,
            fileName: reactThemeJsFile.name,
            fileType: reactThemeJsFile.type || "application/javascript",
            assetKind: "reactJs",
            ...signedUrlOpts,
          })
      );
      const reactJsKey = jsSigned.key;
      idx++;

      const cssSigned = await putFile(
        idx,
        reactThemeCssFile,
        reactThemeCssFile.type || "text/css",
        () =>
          generateThemeAssetSignedUrl({
            sessionId,
            fileName: reactThemeCssFile.name,
            fileType: reactThemeCssFile.type || "text/css",
            assetKind: "reactCss",
            ...signedUrlOpts,
          })
      );
      const reactCssKey = cssSigned.key;
      idx++;

      const schemaSigned = await putFile(
        idx,
        themeSchemaFile,
        themeSchemaFile.type || "application/json",
        () =>
          generateThemeAssetSignedUrl({
            sessionId,
            fileName: themeSchemaFile.name,
            fileType: themeSchemaFile.type || "application/json",
            assetKind: "themeSchema",
            ...signedUrlOpts,
          })
      );
      const themeSchemaKey = schemaSigned.key;
      idx++;

      const defaultConfigSigned = await putFile(
        idx,
        themeDefaultConfigFile,
        themeDefaultConfigFile.type || "application/json",
        () =>
          generateThemeAssetSignedUrl({
            sessionId,
            fileName: themeDefaultConfigFile.name,
            fileType: themeDefaultConfigFile.type || "application/json",
            assetKind: "themeDefaultConfig",
            ...signedUrlOpts,
          })
      );
      const themeDefaultConfigKey = defaultConfigSigned.key;
      idx++;

      const manifestSigned = await putFile(
        idx,
        themeManifestFile,
        themeManifestFile.type || "application/json",
        () =>
          generateThemeAssetSignedUrl({
            sessionId,
            fileName: themeManifestFile.name,
            fileType: themeManifestFile.type || "application/json",
            assetKind: "themeManifest",
            ...signedUrlOpts,
          })
      );
      const themeManifestKey = manifestSigned.key;

      const finalizeIdx = progressRows.length - 1;
      setRow(finalizeIdx, "uploading");
      const priceNum = uploadForm.price === "" ? 0 : Number(uploadForm.price);

      const response = await createInformaticThemeFromS3({
        name: uploadForm.name,
        description: uploadForm.description,
        plan: uploadForm.plan,
        price: Number.isFinite(priceNum) ? priceNum : 0,
        version: uploadForm.version || "1.0.0",
        tags: uploadForm.tags,
        s3SessionId: sessionId,
        s3: {
          files: uploadedFiles,
          thumbnailKey: thumbSigned.key,
          reactJsKey,
          reactCssKey,
          themeSchemaKey,
          themeDefaultConfigKey,
          themeManifestKey,
        },
      });

      if (response.data.success) {
        setRow(finalizeIdx, "done");
        setUploadProgress({
          headline: "Informatic theme created successfully",
          fileCounter: `${totalSteps} / ${totalSteps}`,
          remainingCounter: "0 files left",
          currentLabel: "",
          currentIndex: totalSteps,
          totalCount: totalSteps,
          percent: 100,
          currentFileBytePercent: 100,
          rows: progressRows.map((r) => ({ ...r })),
        });
        await new Promise<void>((resolve) => {
          window.setTimeout(() => resolve(), 450);
        });
        setUploadForm({
          name: "",
          description: "",
          plan: "free",
          price: "",
          version: "1.0.0",
          tags: "informatic,content",
        });
        setThemeFolderFiles([]);
        setReactThemeJsFile(null);
        setReactThemeCssFile(null);
        setThemeSchemaFile(null);
        setThemeDefaultConfigFile(null);
        setThemeManifestFile(null);
        setThumbnailFile(null);
        setIsUploadOpen(false);
        await loadThemes();
      } else {
        throw new Error(response.data.message || "Failed to create theme");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Upload failed";
      setUploadError(msg);
      if (progressRows.length) {
        const failIdx = progressRows.findIndex((r) => r.status === "uploading");
        if (failIdx >= 0) {
          progressRows = progressRows.map((r, i) =>
            i === failIdx ? { ...r, status: "error" as ThemeUploadRowStatus } : r
          );
          setUploadProgress((prev) =>
            prev
              ? {
                  ...prev,
                  headline: "Upload failed",
                  rows: progressRows.map((r) => ({ ...r })),
                }
              : null
          );
        }
      } else {
        setUploadProgress(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!canView) {
    return (
      <div className="theme-table-container theme-developer-enhanced">
        <div className="theme-card" style={{ padding: 24 }}>
          <p>You do not have permission to view Informatic Themes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-table-container theme-developer-enhanced" style={{ position: "relative" }}>
      <div className="theme-card">
        <div className="theme-card-header">
          <div className="theme-title-block">
            <div className="theme-title-accent" />
            <div>
              <h1 className="theme-card-title">Informatic Themes</h1>
              <p className="theme-card-subtitle">
                Upload content-site themes for the webpanel catalog (S3 + MongoDB)
              </p>
            </div>
          </div>
          <div className="theme-stats-row kpi-grid">
            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-content">
                  <div className="kpi-label">Total Themes</div>
                  <div className="kpi-value">{themes.length}</div>
                </div>
                <div className="kpi-icon-wrap primary">
                  <Globe size={24} strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-content">
                  <div className="kpi-label">Showing</div>
                  <div className="kpi-value">{filteredThemes.length}</div>
                </div>
                <div className="kpi-icon-wrap neutral">
                  <BarChart2 size={24} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="theme-controls-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search Informatic themes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="search-icon" />
          </div>
          <div className="theme-controls-actions">
            <div className="view-toggle">
              <button className="view-toggle-btn active" type="button" title="Grid view">
                <LayoutGrid size={18} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => void loadThemes()}
              className="refresh-btn-compact"
              disabled={loadingThemes}
              title="Refresh"
            >
              {loadingThemes ? "..." : "Refresh"}
            </button>
            <PermissionGate
              action="upload"
              section="Developer"
              subsection="Theme Developer"
              fallback={<div className="upload-fallback-msg">No upload permission</div>}
            >
              <button
                type="button"
                className="add-theme-btn add-theme-btn-accent"
                onClick={() => setIsUploadOpen(true)}
                disabled={!canUpload}
              >
                <Plus size={20} />
                Upload Informatic Theme
              </button>
            </PermissionGate>
          </div>
        </div>

        <div className="theme-grid-enhanced">
          {loadingThemes ? (
            <div className="theme-grid-loading">
              <div className="theme-grid-spinner" />
              <p>Loading Informatic themes...</p>
            </div>
          ) : filteredThemes.length === 0 ? (
            <div className="theme-grid-empty">
              <Globe size={48} strokeWidth={1.5} />
              <p>
                {searchTerm
                  ? "No themes match your search."
                  : "No Informatic themes yet. Upload your first theme for webpanel!"}
              </p>
            </div>
          ) : (
            filteredThemes.map((theme) => (
              <div key={theme._id} className="theme-card-enhanced">
                <div className="theme-card-thumb-wrap">
                  <img
                    src={theme.thumbnailUrl || PLACEHOLDER_THUMB}
                    alt={theme.name}
                    className="theme-card-thumb-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_THUMB;
                    }}
                  />
                </div>
                <div className="theme-card-body-enhanced">
                  <h3 className="theme-card-name-enhanced">{theme.name}</h3>
                  <div className="theme-card-meta-enhanced">
                    <span className="category-badge category-badge-sm">Informatic</span>
                    <span
                      className={`plan-badge plan-${(theme.plan || "").toLowerCase().replace(/\s+/g, "-")} plan-badge-sm`}
                    >
                      {theme.plan}
                    </span>
                    {theme.hasRemoteTheme ? (
                      <span className="theme-remote-badge" title="Includes remote theme.js / theme.css">
                        Remote
                      </span>
                    ) : null}
                  </div>
                  {theme.description ? (
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: 13,
                        color: "var(--z-text-muted, #64748b)",
                        lineHeight: 1.45,
                      }}
                    >
                      {theme.description}
                    </p>
                  ) : null}
                  <div className="theme-card-footer-enhanced">
                    <span className="theme-card-date-enhanced">
                      v{theme.version || "1.0.0"}
                    </span>
                  </div>
                  <div className="theme-card-actions-enhanced">
                    <PermissionGate action="edit" section="Developer" subsection="Theme Developer">
                      <button
                        type="button"
                        className="theme-card-action-btn"
                        disabled={deletingThemeId === theme._id}
                        onClick={() => handleDeleteTheme(theme._id, theme.name)}
                      >
                        <Trash2 size={14} />
                        {deletingThemeId === theme._id ? "Removing…" : "Deactivate"}
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isUploadOpen && (
        <div
          className={`themeUpload-overlay${isUploading ? " themeUpload-overlay--busy" : ""}`}
          onClick={() => {
            if (!isUploading) setIsUploadOpen(false);
          }}
        >
          <div className="themeUpload-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="themeUpload-header">
              <h2>Upload Informatic Theme</h2>
              <button
                type="button"
                className={`themeUpload-close${isUploading ? " themeUpload-close--disabled" : ""}`}
                onClick={() => {
                  if (!isUploading) setIsUploadOpen(false);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="themeUpload-form">
              <div className="themeUpload-body themeUpload-scroll">
                {uploadError && (
                  <div
                    style={{
                      color: "#b91c1c",
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      fontSize: "13px",
                    }}
                  >
                    {uploadError}
                  </div>
                )}

                <fieldset className="themeUpload-fieldset" disabled={isUploading}>
                <label>Theme Name *</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Informatic Pro"
                  required
                />

                <label>Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="themeUpload-description"
                  placeholder="Content / information site theme for webpanel"
                />

                <label>Plan *</label>
                <select
                  value={uploadForm.plan}
                  onChange={(e) => setUploadForm((f) => ({ ...f, plan: e.target.value }))}
                  required
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                <label>Price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={uploadForm.price}
                  onChange={(e) => setUploadForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                />

                <label>Version</label>
                <input
                  type="text"
                  value={uploadForm.version}
                  onChange={(e) => setUploadForm((f) => ({ ...f, version: e.target.value }))}
                  placeholder="1.0.0"
                />

                <label>Tags</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="informatic, content, blog"
                />

                <label>Theme folder (content assets) *</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setThemeFolderFiles(Array.from(e.target.files || []))}
                  {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
                />
                {themeFolderFiles.length > 0 && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    Selected: {themeFolderFiles.length} file{themeFolderFiles.length === 1 ? "" : "s"}
                  </div>
                )}

                <label>Thumbnail *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                />
                {thumbnailFile && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    Selected: {thumbnailFile.name}
                  </div>
                )}

                <label>Remote theme: theme.js *</label>
                <input
                  type="file"
                  accept=".js,application/javascript,text/javascript"
                  onChange={(e) => setReactThemeJsFile(e.target.files?.[0] || null)}
                />
                {reactThemeJsFile && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    Selected: {reactThemeJsFile.name}
                  </div>
                )}

                <label>Remote theme: theme.css *</label>
                <input
                  type="file"
                  accept=".css,text/css"
                  onChange={(e) => setReactThemeCssFile(e.target.files?.[0] || null)}
                />
                {reactThemeCssFile && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    Selected: {reactThemeCssFile.name}
                  </div>
                )}

                <label>theme.schema.json *</label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => setThemeSchemaFile(e.target.files?.[0] || null)}
                />
                {themeSchemaFile && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    Selected: {themeSchemaFile.name}
                  </div>
                )}

                <label>theme.default-config.json *</label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => setThemeDefaultConfigFile(e.target.files?.[0] || null)}
                />
                {themeDefaultConfigFile && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    Selected: {themeDefaultConfigFile.name}
                  </div>
                )}

                <label>theme.manifest.json *</label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => setThemeManifestFile(e.target.files?.[0] || null)}
                />
                {themeManifestFile && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    Selected: {themeManifestFile.name}
                  </div>
                )}
              </fieldset>
              </div>

              <div className="themeUpload-footer">
                {isUploading && uploadProgress ? (
                  <div
                    className="themeUpload-progress themeUpload-progress--footer"
                    aria-live="polite"
                    aria-busy={uploadProgress.percent < 100}
                  >
                    <div className="themeUpload-progress__top">
                      <div className="themeUpload-progress__titleRow">
                        {uploadProgress.percent < 100 ? (
                          <Loader2 className="themeUpload-progress__spinner" size={22} aria-hidden />
                        ) : (
                          <Check className="themeUpload-progress__check" size={22} aria-hidden />
                        )}
                        <div className="themeUpload-progress__titles">
                          <div className="themeUpload-progress__headline">{uploadProgress.headline}</div>
                          <div className="themeUpload-progress__counter">
                            {uploadProgress.fileCounter}
                            {uploadProgress.remainingCounter ? (
                              <>
                                <span style={{ margin: "0 6px", opacity: 0.45 }}>·</span>
                                {uploadProgress.remainingCounter}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div
                        className="themeUpload-progress__barTrack"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={uploadProgress.percent}
                        aria-valuetext={`${uploadProgress.percent}% — ${uploadProgress.fileCounter}`}
                      >
                        <div
                          className="themeUpload-progress__barFill"
                          style={{ width: `${uploadProgress.percent}%` }}
                        />
                      </div>
                      <div className="themeUpload-progress__meta">
                        <span className="themeUpload-progress__pct">{uploadProgress.percent}%</span>
                        {uploadProgress.currentLabel ? (
                          <span
                            className="themeUpload-progress__current"
                            title={uploadProgress.currentLabel}
                          >
                            {truncateMiddle(uploadProgress.currentLabel, 52)}
                          </span>
                        ) : null}
                      </div>
                      {uploadProgress.currentFileBytePercent > 0 &&
                      uploadProgress.currentFileBytePercent < 100 ? (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 11,
                            color: "#64748b",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          Current file transfer: {uploadProgress.currentFileBytePercent}%
                        </div>
                      ) : null}
                    </div>
                    {uploadProgress.rows.length > 0 ? (
                      <>
                        <div className="themeUpload-progress__listHead">
                          <span>Upload queue</span>
                          <span>
                            {uploadProgress.rows.filter((r) => r.status === "done").length} /{" "}
                            {uploadProgress.rows.length} done
                          </span>
                        </div>
                        <ul className="themeUpload-progress__list">
                          {uploadProgress.rows.map((row, rowIdx) => (
                            <li
                              key={row.id}
                              className={`themeUpload-progress__row themeUpload-progress__row--${row.status}`}
                            >
                              <span className="themeUpload-progress__rowIcon" aria-hidden>
                                {row.status === "done" ? (
                                  <Check size={14} strokeWidth={2.5} />
                                ) : row.status === "uploading" ? (
                                  <Loader2 size={14} className="themeUpload-progress__rowSpin" />
                                ) : row.status === "error" ? (
                                  <AlertCircle size={14} />
                                ) : (
                                  <span className="themeUpload-progress__rowDot" />
                                )}
                              </span>
                              <span className="themeUpload-progress__rowLabel" title={row.label}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    minWidth: 28,
                                    marginRight: 6,
                                    color: "#94a3b8",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {rowIdx + 1}.
                                </span>
                                {truncateMiddle(row.label, 48)}
                              </span>
                              <span className="themeUpload-progress__rowState">
                                {row.status === "done"
                                  ? "Done"
                                  : row.status === "uploading"
                                    ? "Uploading…"
                                    : row.status === "error"
                                      ? "Failed"
                                      : "Queued"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                ) : null}

                <button type="submit" className="themeUpload-submit" disabled={isUploading || !canUpload}>
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="themeUpload-progress__spinner" /> Uploading…
                    </>
                  ) : (
                    "Upload to catalog"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformaticThemeDeveloper;
