import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Check, Loader2, AlertCircle } from "lucide-react";
import { useAwsUpload } from "../../contexts/aws-upload.context";
import {
  useThemes,
  type ThemeApiRecord,
  type UpdateThemeFromS3Payload,
} from "../../contexts/themes.context";
import "./ThemeEditPage.css";

type UploadRowStatus = "pending" | "uploading" | "done" | "error";

interface UploadRow {
  id: string;
  label: string;
  status: UploadRowStatus;
}

interface UploadProgressUi {
  headline: string;
  fileCounter: string;
  currentLabel: string;
  percent: number;
  rows: UploadRow[];
}

function truncateMiddle(s: string, max: number): string {
  if (s.length <= max) return s;
  const keep = max - 1;
  const right = Math.ceil(keep / 2);
  const left = keep - right;
  return `${s.slice(0, left)}…${s.slice(-right)}`;
}

function assetStatusLabel(present: boolean): string {
  return present ? "On file — leave empty to keep" : "Not uploaded yet";
}

const ThemeEditPage: React.FC = () => {
  const location = useLocation();
  const { themeId: themeIdFromParams } = useParams<{ themeId: string }>();
  const themeId = (
    themeIdFromParams ||
    location.pathname.split("/admin/themes/edit/")[1]?.split("/")[0] ||
    ""
  ).trim();
  const navigate = useNavigate();

  const { generateThemeAssetSignedUrl, uploadFileToSignedUrl } = useAwsUpload();
  const { getThemeById, updateThemeFromS3 } = useThemes();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeApiRecord | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressUi | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    plan: "",
    price: "",
    version: "1.0.0",
    tags: "",
    isActive: true,
  });

  const [themeFolderFiles, setThemeFolderFiles] = useState<File[]>([]);
  const [reactThemeJsFile, setReactThemeJsFile] = useState<File | null>(null);
  const [reactThemeCssFile, setReactThemeCssFile] = useState<File | null>(null);
  const [themeSchemaFile, setThemeSchemaFile] = useState<File | null>(null);
  const [themeDefaultConfigFile, setThemeDefaultConfigFile] = useState<File | null>(null);
  const [themeManifestFile, setThemeManifestFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const existingAssets = useMemo(() => {
    const s3 = theme?.s3Assets;
    return {
      folderCount: s3?.contentRoot?.fileCount ?? theme?.contentFileCount ?? 0,
      hasFolder: Boolean(s3?.contentRoot?.prefix),
      hasZip: Boolean(s3?.zip?.key),
      hasThumbnail: Boolean(s3?.thumbnail?.key || theme?.thumbnailUrl),
      hasReactJs: Boolean(s3?.reactThemeJs?.key),
      hasReactCss: Boolean(s3?.reactThemeCss?.key),
      hasSchema: Boolean(s3?.reactThemeSchema?.key),
      hasDefaultConfig: Boolean(s3?.reactThemeDefaultConfig?.key),
      hasManifest: Boolean(s3?.reactThemeManifest?.key),
      thumbnailUrl: theme?.thumbnailUrl ?? s3?.thumbnail?.url ?? null,
    };
  }, [theme]);

  useEffect(() => {
    const fetchTheme = async () => {
      if (!themeId) {
        setError("Theme ID is required");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await getThemeById(themeId);
        if (!response.data.success || !response.data.data) {
          setError("Failed to load theme data");
          return;
        }
        const themeData = response.data.data;
        setTheme(themeData);
        setFormData({
          name: themeData.name || "",
          description: themeData.description || "",
          category: themeData.category ? String(themeData.category).toLowerCase() : "",
          plan: themeData.plan ? String(themeData.plan).toLowerCase() : "",
          price: themeData.price?.toString() || "",
          version: themeData.version || "1.0.0",
          tags: Array.isArray(themeData.tags) ? themeData.tags.join(", ") : "",
          isActive: themeData.isActive !== false,
        });
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load theme. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    void fetchTheme();
  }, [themeId, getThemeById]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type:
      | "thumbnail"
      | "reactThemeJs"
      | "reactThemeCss"
      | "themeSchema"
      | "themeDefaultConfig"
      | "themeManifest"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "reactThemeJs") setReactThemeJsFile(file);
    else if (type === "reactThemeCss") setReactThemeCssFile(file);
    else if (type === "themeSchema") setThemeSchemaFile(file);
    else if (type === "themeDefaultConfig") setThemeDefaultConfigFile(file);
    else if (type === "themeManifest") setThemeManifestFile(file);
    else setThumbnailFile(file);
  };

  const handleThemeFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) {
      setThemeFolderFiles([]);
      return;
    }
    setThemeFolderFiles(Array.from(list));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeId) {
      setError("Theme ID is required");
      return;
    }
    if (!formData.name || !formData.category || !formData.plan) {
      setError("Please fill in all required fields");
      return;
    }

    const replacingAssets =
      themeFolderFiles.length > 0 ||
      Boolean(thumbnailFile) ||
      Boolean(reactThemeJsFile) ||
      Boolean(reactThemeCssFile) ||
      Boolean(themeSchemaFile) ||
      Boolean(themeDefaultConfigFile) ||
      Boolean(themeManifestFile);

    setSaving(true);
    setError(null);
    setUploadProgress(null);

    let progressRows: UploadRow[] = [];
    let totalSteps = 0;

    try {
      const priceNum = formData.price === "" ? 0 : Number(formData.price);
      const payload: UpdateThemeFromS3Payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        plan: formData.plan,
        price: Number.isFinite(priceNum) ? priceNum : 0,
        version: formData.version || "1.0.0",
        tags: formData.tags,
        isActive: formData.isActive,
      };

      if (!replacingAssets) {
        const response = await updateThemeFromS3(themeId, payload);
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to update theme");
        }
        toast.success("Theme updated successfully!");
        sessionStorage.setItem("activeMenu", "Theme Developer");
        setTimeout(() => navigate(-1), 400);
        return;
      }

      const progressRowsInit: UploadRow[] = themeFolderFiles.map((f, i) => ({
        id: `theme-${i}`,
        label: (f.webkitRelativePath || f.name).replace(/\\/g, "/"),
        status: "pending" as UploadRowStatus,
      }));
      progressRows = progressRowsInit;
      if (thumbnailFile) {
        progressRows.push({
          id: "thumb",
          label: `Thumbnail · ${thumbnailFile.name}`,
          status: "pending",
        });
      }
      if (reactThemeJsFile) {
        progressRows.push({
          id: "react-js",
          label: `Remote theme JS · ${reactThemeJsFile.name}`,
          status: "pending",
        });
      }
      if (reactThemeCssFile) {
        progressRows.push({
          id: "react-css",
          label: `Remote theme CSS · ${reactThemeCssFile.name}`,
          status: "pending",
        });
      }
      if (themeSchemaFile) {
        progressRows.push({
          id: "theme-schema",
          label: `Theme schema · ${themeSchemaFile.name}`,
          status: "pending",
        });
      }
      if (themeDefaultConfigFile) {
        progressRows.push({
          id: "theme-default-config",
          label: `Default config · ${themeDefaultConfigFile.name}`,
          status: "pending",
        });
      }
      if (themeManifestFile) {
        progressRows.push({
          id: "theme-manifest",
          label: `Manifest · ${themeManifestFile.name}`,
          status: "pending",
        });
      }
      progressRows.push({
        id: "finalize",
        label: "Update theme catalog & S3 paths",
        status: "pending",
      });
      totalSteps = progressRows.length;

      const syncProgress = (rowsSnapshot: UploadRow[]) => {
        const done = rowsSnapshot.filter((r) => r.status === "done").length;
        const upIdx = rowsSnapshot.findIndex((r) => r.status === "uploading");
        const headline =
          upIdx < 0
            ? "Preparing secure upload"
            : upIdx < totalSteps - 1
              ? "Uploading replacement assets"
              : "Finalizing on server";
        const pct = Math.min(
          99,
          Math.round(((done + (upIdx >= 0 ? 0.2 : 0)) / totalSteps) * 100)
        );
        setUploadProgress({
          headline,
          fileCounter: `${done} of ${totalSteps} steps completed`,
          currentLabel: upIdx >= 0 ? rowsSnapshot[upIdx].label : "",
          percent: pct,
          rows: rowsSnapshot.map((r) => ({ ...r })),
        });
      };

      const setRow = (idx: number, status: UploadRowStatus) => {
        progressRows = progressRows.map((r, i) => (i === idx ? { ...r, status } : r));
        syncProgress(progressRows);
      };

      syncProgress(progressRows);

      const sessionId = crypto.randomUUID();
      const uploadedFiles: { key: string; relativePath: string }[] = [];
      let idx = 0;

      for (let i = 0; i < themeFolderFiles.length; i++) {
        const file = themeFolderFiles[i];
        setRow(idx, "uploading");
        const relativePath = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
        const signed = await generateThemeAssetSignedUrl({
          sessionId,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          assetKind: "themeFile",
          relativePath,
        });
        await uploadFileToSignedUrl(signed.signedUrl, file, signed.contentType);
        uploadedFiles.push({ key: signed.key, relativePath });
        setRow(idx, "done");
        idx++;
      }

      let thumbnailKey: string | undefined;
      let reactJsKey: string | undefined;
      let reactCssKey: string | undefined;
      let themeSchemaKey: string | undefined;
      let themeDefaultConfigKey: string | undefined;
      let themeManifestKey: string | undefined;

      if (thumbnailFile) {
        setRow(idx, "uploading");
        const signed = await generateThemeAssetSignedUrl({
          sessionId,
          fileName: thumbnailFile.name,
          fileType: thumbnailFile.type || "image/jpeg",
          assetKind: "thumbnail",
        });
        await uploadFileToSignedUrl(signed.signedUrl, thumbnailFile, signed.contentType);
        thumbnailKey = signed.key;
        setRow(idx, "done");
        idx++;
      }

      if (reactThemeJsFile) {
        setRow(idx, "uploading");
        const signed = await generateThemeAssetSignedUrl({
          sessionId,
          fileName: reactThemeJsFile.name,
          fileType: reactThemeJsFile.type || "application/javascript",
          assetKind: "reactJs",
        });
        await uploadFileToSignedUrl(signed.signedUrl, reactThemeJsFile, signed.contentType);
        reactJsKey = signed.key;
        setRow(idx, "done");
        idx++;
      }

      if (reactThemeCssFile) {
        setRow(idx, "uploading");
        const signed = await generateThemeAssetSignedUrl({
          sessionId,
          fileName: reactThemeCssFile.name,
          fileType: reactThemeCssFile.type || "text/css",
          assetKind: "reactCss",
        });
        await uploadFileToSignedUrl(signed.signedUrl, reactThemeCssFile, signed.contentType);
        reactCssKey = signed.key;
        setRow(idx, "done");
        idx++;
      }

      if (themeSchemaFile) {
        setRow(idx, "uploading");
        const signed = await generateThemeAssetSignedUrl({
          sessionId,
          fileName: themeSchemaFile.name,
          fileType: themeSchemaFile.type || "application/json",
          assetKind: "themeSchema",
        });
        await uploadFileToSignedUrl(signed.signedUrl, themeSchemaFile, signed.contentType);
        themeSchemaKey = signed.key;
        setRow(idx, "done");
        idx++;
      }

      if (themeDefaultConfigFile) {
        setRow(idx, "uploading");
        const signed = await generateThemeAssetSignedUrl({
          sessionId,
          fileName: themeDefaultConfigFile.name,
          fileType: themeDefaultConfigFile.type || "application/json",
          assetKind: "themeDefaultConfig",
        });
        await uploadFileToSignedUrl(
          signed.signedUrl,
          themeDefaultConfigFile,
          signed.contentType
        );
        themeDefaultConfigKey = signed.key;
        setRow(idx, "done");
        idx++;
      }

      if (themeManifestFile) {
        setRow(idx, "uploading");
        const signed = await generateThemeAssetSignedUrl({
          sessionId,
          fileName: themeManifestFile.name,
          fileType: themeManifestFile.type || "application/json",
          assetKind: "themeManifest",
        });
        await uploadFileToSignedUrl(signed.signedUrl, themeManifestFile, signed.contentType);
        themeManifestKey = signed.key;
        setRow(idx, "done");
        idx++;
      }

      const finalizeIdx = progressRows.length - 1;
      setRow(finalizeIdx, "uploading");

      payload.s3SessionId = sessionId;
      payload.s3 = {
        ...(uploadedFiles.length ? { files: uploadedFiles } : {}),
        ...(thumbnailKey ? { thumbnailKey } : {}),
        ...(reactJsKey ? { reactJsKey } : {}),
        ...(reactCssKey ? { reactCssKey } : {}),
        ...(themeSchemaKey ? { themeSchemaKey } : {}),
        ...(themeDefaultConfigKey ? { themeDefaultConfigKey } : {}),
        ...(themeManifestKey ? { themeManifestKey } : {}),
      };

      const response = await updateThemeFromS3(themeId, payload);
      if (!response.data.success) {
        progressRows = progressRows.map((r, i) =>
          i === finalizeIdx ? { ...r, status: "error" as const } : r
        );
        setUploadProgress({
          headline: "Finalization failed",
          fileCounter: `${Math.max(0, totalSteps - 1)} of ${totalSteps} steps completed`,
          currentLabel: "",
          percent: Math.round(((totalSteps - 1) / Math.max(1, totalSteps)) * 100),
          rows: progressRows,
        });
        throw new Error(response.data.message || "Failed to update theme");
      }

      setRow(finalizeIdx, "done");
      setUploadProgress({
        headline: "Theme updated successfully",
        fileCounter: `${totalSteps} of ${totalSteps} steps completed`,
        currentLabel: "",
        percent: 100,
        rows: progressRows.map((r) => ({ ...r })),
      });

      if (response.data.data) setTheme(response.data.data);

      toast.success(response.data.message || "Theme and assets updated successfully!");
      sessionStorage.setItem("activeMenu", "Theme Developer");
      await new Promise<void>((resolve) => window.setTimeout(() => resolve(), 500));
      navigate(-1);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update theme. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-edit-page">
        <div className="theme-edit-loading">
          <div className="loading-spinner" />
          <p>Loading theme data...</p>
        </div>
      </div>
    );
  }

  if (error && !theme) {
    return (
      <div className="theme-edit-page">
        <div className="theme-edit-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary" type="button">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-edit-page">
      <div className="theme-edit-header">
        <button
          type="button"
          onClick={() => !saving && navigate(-1)}
          className="btn-back"
          disabled={saving}
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h1>Edit Theme: {theme?.name || "Unknown"}</h1>
      </div>

      {error ? (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="theme-edit-form">
        <fieldset disabled={saving} className="theme-edit-fieldset">
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="name">
                Theme Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter theme name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter theme description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="travel">Travel</option>
                  <option value="business">Business</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="blog">Blog</option>
                  <option value="education">Education</option>
                  <option value="health">Health</option>
                  <option value="food">Food</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="plan">
                  Plan <span className="required">*</span>
                </label>
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select plan</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="version">Version</label>
                <input
                  type="text"
                  id="version"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., modern, responsive, e-commerce"
              />
            </div>

            <div className="form-group form-group--checkbox">
              <label htmlFor="isActive" className="theme-edit-checkbox-label">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Theme is active in the catalog
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>Replace assets (optional)</h2>
            <p className="theme-edit-section-hint">
              Only choose files you want to replace. Empty fields keep the current S3 objects and
              database paths. Replacing the theme folder deletes the previous folder contents and
              uploads the new tree.
            </p>

            <div className="form-group">
              <label>Theme folder (HTML / CSS / JS)</label>
              <div className="theme-edit-asset-status">
                {existingAssets.hasFolder
                  ? `Current: folder · ${existingAssets.folderCount} files`
                  : existingAssets.hasZip
                    ? "Current: ZIP package"
                    : "No static package on file"}
              </div>
              <input
                type="file"
                multiple
                onChange={handleThemeFolderChange}
                {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
              />
              {themeFolderFiles.length > 0 ? (
                <div className="theme-edit-file-selected">
                  Selected: {themeFolderFiles.length} file
                  {themeFolderFiles.length === 1 ? "" : "s"} to replace folder
                </div>
              ) : null}
              <p className="theme-edit-field-hint">
                Choose the folder that contains your static theme (for example{" "}
                <code>index.html</code>, assets, and scripts). Full relative paths are preserved.
              </p>
            </div>

            <div className="form-group">
              <label>Remote theme: theme.js</label>
              <div className="theme-edit-asset-status">
                {assetStatusLabel(existingAssets.hasReactJs)}
              </div>
              <input
                type="file"
                accept=".js,application/javascript,text/javascript"
                onChange={(e) => handleFileChange(e, "reactThemeJs")}
              />
              {reactThemeJsFile ? (
                <div className="theme-edit-file-selected">Selected: {reactThemeJsFile.name}</div>
              ) : null}
            </div>

            <div className="form-group">
              <label>Remote theme: theme.css</label>
              <div className="theme-edit-asset-status">
                {assetStatusLabel(existingAssets.hasReactCss)}
              </div>
              <input
                type="file"
                accept=".css,text/css"
                onChange={(e) => handleFileChange(e, "reactThemeCss")}
              />
              {reactThemeCssFile ? (
                <div className="theme-edit-file-selected">Selected: {reactThemeCssFile.name}</div>
              ) : null}
              <p className="theme-edit-field-hint">
                Upload rebuilt files from your remote theme dist folder (for example{" "}
                <code>remote-themes/horizon/dist/theme.js</code> after <code>npm run build</code>).
              </p>
            </div>

            <div className="form-group">
              <label>theme.schema.json</label>
              <div className="theme-edit-asset-status">
                {assetStatusLabel(existingAssets.hasSchema)}
              </div>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileChange(e, "themeSchema")}
              />
              {themeSchemaFile ? (
                <div className="theme-edit-file-selected">Selected: {themeSchemaFile.name}</div>
              ) : null}
            </div>

            <div className="form-group">
              <label>theme.default-config.json</label>
              <div className="theme-edit-asset-status">
                {assetStatusLabel(existingAssets.hasDefaultConfig)}
              </div>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileChange(e, "themeDefaultConfig")}
              />
              {themeDefaultConfigFile ? (
                <div className="theme-edit-file-selected">
                  Selected: {themeDefaultConfigFile.name}
                </div>
              ) : null}
            </div>

            <div className="form-group">
              <label>theme.manifest.json</label>
              <div className="theme-edit-asset-status">
                {assetStatusLabel(existingAssets.hasManifest)}
              </div>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileChange(e, "themeManifest")}
              />
              {themeManifestFile ? (
                <div className="theme-edit-file-selected">Selected: {themeManifestFile.name}</div>
              ) : null}
              <p className="theme-edit-field-hint">
                Schema defines settings, default-config is the baseline layout, and manifest points
                to built assets.
              </p>
            </div>

            <div className="form-group">
              <label>Thumbnail (JPG/PNG)</label>
              <div className="theme-edit-asset-status">
                {assetStatusLabel(existingAssets.hasThumbnail)}
              </div>
              {existingAssets.thumbnailUrl && !thumbnailFile ? (
                <div className="theme-edit-thumb-current">
                  <img src={existingAssets.thumbnailUrl} alt="Current thumbnail" />
                </div>
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "thumbnail")}
              />
              {thumbnailFile ? (
                <div className="theme-edit-file-selected">Selected: {thumbnailFile.name}</div>
              ) : null}
            </div>
          </div>
        </fieldset>

        {saving && uploadProgress ? (
          <div className="theme-edit-progress" aria-live="polite" aria-busy="true">
            <div className="theme-edit-progress__top">
              <div className="theme-edit-progress__titleRow">
                {uploadProgress.percent < 100 ? (
                  <Loader2 className="theme-edit-progress__spinner" size={22} aria-hidden />
                ) : (
                  <Check className="theme-edit-progress__check" size={22} aria-hidden />
                )}
                <div>
                  <div className="theme-edit-progress__headline">{uploadProgress.headline}</div>
                  <div className="theme-edit-progress__counter">{uploadProgress.fileCounter}</div>
                </div>
              </div>
              <div
                className="theme-edit-progress__barTrack"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress.percent}
              >
                <div
                  className="theme-edit-progress__barFill"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
              {uploadProgress.currentLabel ? (
                <div className="theme-edit-progress__current" title={uploadProgress.currentLabel}>
                  {truncateMiddle(uploadProgress.currentLabel, 56)}
                </div>
              ) : null}
            </div>
            <ul className="theme-edit-progress__list">
              {uploadProgress.rows.map((row) => (
                <li
                  key={row.id}
                  className={`theme-edit-progress__row theme-edit-progress__row--${row.status}`}
                >
                  <span className="theme-edit-progress__rowIcon" aria-hidden>
                    {row.status === "done" ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : row.status === "uploading" ? (
                      <Loader2 size={14} className="theme-edit-progress__rowSpin" />
                    ) : row.status === "error" ? (
                      <AlertCircle size={14} />
                    ) : (
                      <span className="theme-edit-progress__rowDot" />
                    )}
                  </span>
                  <span className="theme-edit-progress__rowLabel" title={row.label}>
                    {truncateMiddle(row.label, 56)}
                  </span>
                  <span className="theme-edit-progress__rowState">
                    {row.status === "done"
                      ? "OK"
                      : row.status === "uploading"
                        ? "Uploading…"
                        : row.status === "error"
                          ? "Failed"
                          : "Queued"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (
              <>
                <div className="loading-spinner-small" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThemeEditPage;
