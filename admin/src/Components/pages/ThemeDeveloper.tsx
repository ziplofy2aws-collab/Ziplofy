import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ThemeDeveloper.css";
import {
  Search,
  Plus,
  Calendar,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  X,
  LayoutGrid,
  LayoutList,
  Palette,
  Layout,
  BarChart2,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { DateRange, Range } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { PermissionGate } from "../PermissionGate";
import { EditVerificationModal } from "../EditVerificationModal";
import { usePermissions } from "../../hooks/usePermissions";
import axiosi from "../../config/axios";
import { useAwsUpload } from "../../contexts/aws-upload.context";
import {
  useThemes,
  formatThemePackageLabel,
  type ThemeAdminListItem,
} from "../../contexts/themes.context";

// ---------------------- Types ----------------------

interface DateRangeItem {
  startDate: Date;
  endDate: Date;
  key: string;
}

type ThemeUploadRowStatus = "pending" | "uploading" | "done" | "error";

interface ThemeUploadRow {
  id: string;
  label: string;
  status: ThemeUploadRowStatus;
}

interface ThemeUploadProgressUi {
  headline: string;
  fileCounter: string;
  currentLabel: string;
  percent: number;
  rows: ThemeUploadRow[];
}

function truncateMiddle(s: string, max: number): string {
  if (s.length <= max) return s;
  const keep = max - 1;
  const right = Math.ceil(keep / 2);
  const left = keep - right;
  return `${s.slice(0, left)}…${s.slice(-right)}`;
}

// ---------------------- Component ----------------------
const ThemeDeveloper: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeActionDropdown, setActiveActionDropdown] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "",
    plan: "",
    price: "",
    version: "1.0.0",
    tags: ""
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
  
  // Dynamic theme data
  const [themes, setThemes] = useState<ThemeAdminListItem[]>([]);
  const [totalThemes, setTotalThemes] = useState<number>(0);
  const [loadingThemes, setLoadingThemes] = useState<boolean>(true);
  const [deletingThemeId, setDeletingThemeId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [pendingDeleteTheme, setPendingDeleteTheme] = useState<{ themeId: string; themeName: string } | null>(null);

  // Permission checking
  const { hasViewPermission, hasEditPermission, hasUploadPermission } = usePermissions();
  
  const canView = hasViewPermission('Developer', 'Theme Developer');
  const canUpload = hasUploadPermission('Developer', 'Theme Developer');

  const { generateThemeAssetSignedUrl, uploadFileToSignedUrl } = useAwsUpload();
  const { createThemeFromS3, fetchAdminThemesList } = useThemes();
  
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRangeItem[]>([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");

  const getThumbnailSrc = (theme: ThemeAdminListItem) =>
    theme.thumbnailUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect fill='%23f1f5f9' width='200' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'%3ENo preview%3C/text%3E%3C/svg%3E";

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    if (showFilterMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker, showFilterMenu]);

  // Filter themes by search
  const filteredThemes = themes.filter((theme) => {
    const searchMatch =
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theme.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theme.uploadBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theme.plan.toLowerCase().includes(searchTerm.toLowerCase());

    const categoryMatch = selectedCategory === "all" || theme.category === selectedCategory;
    const planMatch = selectedPlan === "all" || theme.plan === selectedPlan;
    return searchMatch && categoryMatch && planMatch;
  });

  const categoryOptions = useMemo(
    () => Array.from(new Set(themes.map((t) => t.category).filter(Boolean))),
    [themes]
  );
  const planOptions = useMemo(
    () => Array.from(new Set(themes.map((t) => t.plan).filter(Boolean))),
    [themes]
  );

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) + (selectedPlan !== "all" ? 1 : 0);

  const fetchThemes = async () => {
    try {
      setLoadingThemes(true);
      const { themes: list, total } = await fetchAdminThemesList({ limit: 100 });
      setThemes(list);
      setTotalThemes(total);
    } catch (error) {
      console.error("Error fetching themes:", error);
      setThemes([]);
      setTotalThemes(0);
    } finally {
      setLoadingThemes(false);
    }
  };

  // Load themes on component mount
  useEffect(() => {
    if (canView) {
      fetchThemes();
    }
  }, [canView]);

  // Close upload modal on Escape key (not while upload is running)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isUploadOpen && !isUploading) setIsUploadOpen(false);
    };
    if (isUploadOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isUploadOpen, isUploading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking inside action-container, action-item, or action-dropdown
      const isInsideActionArea = target.closest('.action-container') || 
                                  target.closest('.action-item') || 
                                  target.closest('.action-dropdown') ||
                                  target.closest('.action-btn');
      
      if (activeActionDropdown && !isInsideActionArea) {
        setActiveActionDropdown(null);
      }
    };

    if (activeActionDropdown) {
      // Use click instead of mousedown to allow action-item clicks to process first
      document.addEventListener('click', handleClickOutside, true);

      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [activeActionDropdown]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'thumbnail' | 'reactThemeJs' | 'reactThemeCss' | 'themeSchema' | 'themeDefaultConfig' | 'themeManifest'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'reactThemeJs') setReactThemeJsFile(file);
    else if (type === 'reactThemeCss') setReactThemeCssFile(file);
    else if (type === 'themeSchema') setThemeSchemaFile(file);
    else if (type === 'themeDefaultConfig') setThemeDefaultConfigFile(file);
    else if (type === 'themeManifest') setThemeManifestFile(file);
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

  // Execute theme deletion with OTP (called after OTP verification)
  const executeDeleteTheme = async (themeId: string, themeName: string, otp: string) => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      alert('Authentication required. Please log in again.');
      return;
    }

    setDeletingThemeId(themeId);
    setIsDeleting(true);

    try {
      const response = await axiosi.delete(`/themes/${themeId}`, {
        data: { editOtp: otp },
        headers: {
          "X-Edit-Otp": otp,
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.data.success) {
        alert('Theme deleted successfully!');
        setThemes(prevThemes => prevThemes.filter(theme => theme._id !== themeId));
        setTotalThemes(prevTotal => prevTotal - 1);
        await fetchThemes();
      }
    } catch (error: any) {
      let errorMessage = 'Delete failed';
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend server is running on port 5000.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Your session may have expired. Please log in again.';
        localStorage.removeItem('admin_token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isSuperAdmin');
      } else if (error.response?.status === 403) {
        errorMessage = error.response?.data?.error || error.response?.data?.message || 'You do not have permission to delete themes. Contact administrator.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Theme not found. It may have already been deleted.';
        await fetchThemes();
      } else if (error.response?.data?.error || error.response?.data?.message) {
        errorMessage = error.response.data.error || error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeletingThemeId(null);
      setIsDeleting(false);
    }
  };

  // Handle theme deletion - show OTP modal first
  const handleDeleteTheme = (themeId: string, themeName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the theme "${themeName}"? This action cannot be undone and will remove the theme from the database and all associated files.`
    );
    if (!confirmed) return;

    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      alert('Authentication required. Please log in again.');
      return;
    }

    setPendingDeleteTheme({ themeId, themeName });
    setShowOtpModal(true);
  };

  const handleOtpVerified = (otp: string) => {
    setShowOtpModal(false);
    if (pendingDeleteTheme) {
      executeDeleteTheme(pendingDeleteTheme.themeId, pendingDeleteTheme.themeName, otp);
      setPendingDeleteTheme(null);
    }
  };

  // Handle form submission
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadProgress(null);
    setIsUploading(true);

    let progressRows: ThemeUploadRow[] = [];
    let totalSteps = 0;

    try {
      if (!uploadForm.name || !uploadForm.category || !uploadForm.plan) {
        throw new Error("Please fill in all required fields");
      }

      if (themeFolderFiles.length === 0 || !thumbnailFile) {
        throw new Error("Please select a theme folder and thumbnail");
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
      progressRows.push({
        id: "thumb",
        label: `Thumbnail · ${thumbnailFile.name}`,
        status: "pending",
      });
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
      progressRows.push({
        id: "theme-schema",
        label: `Theme schema · ${themeSchemaFile.name}`,
        status: "pending",
      });
      progressRows.push({
        id: "theme-default-config",
        label: `Default config · ${themeDefaultConfigFile.name}`,
        status: "pending",
      });
      progressRows.push({
        id: "theme-manifest",
        label: `Manifest · ${themeManifestFile.name}`,
        status: "pending",
      });
      progressRows.push({
        id: "finalize",
        label: "Register theme in catalog",
        status: "pending",
      });

      totalSteps = progressRows.length;

      const syncProgress = (rowsSnapshot: ThemeUploadRow[]) => {
        const done = rowsSnapshot.filter((r) => r.status === "done").length;
        const upIdx = rowsSnapshot.findIndex((r) => r.status === "uploading");
        const inTheme = upIdx >= 0 && upIdx < themeCount;
        const headline =
          upIdx < 0
            ? "Preparing secure upload"
            : inTheme
              ? "Uploading theme folder to secure storage"
              : upIdx === themeCount
                ? "Uploading thumbnail"
                : upIdx < totalSteps - 1
                  ? "Uploading theme config and remote assets"
                  : "Finalizing on server";

        const fileCounter =
          upIdx < 0
            ? `0 of ${totalSteps} steps`
            : inTheme
              ? `File ${upIdx + 1} of ${themeCount}`
              : `${done} of ${totalSteps} steps completed`;

        const hasUploading = upIdx >= 0;
        const pct = Math.min(
          99,
          Math.round(((done + (hasUploading ? 0.2 : 0)) / totalSteps) * 100)
        );

        setUploadProgress({
          headline,
          fileCounter,
          currentLabel:
            upIdx >= 0
              ? rowsSnapshot[upIdx].label
              : rowsSnapshot.find((r) => r.status === "pending")?.label ?? "",
          percent: pct,
          rows: rowsSnapshot.map((r) => ({ ...r })),
        });
      };

      const setRow = (idx: number, status: ThemeUploadRowStatus) => {
        progressRows = progressRows.map((r, i) => (i === idx ? { ...r, status } : r));
        syncProgress(progressRows);
      };

      syncProgress(progressRows);

      const sessionId = crypto.randomUUID();
      const uploadedFiles: { key: string; relativePath: string }[] = [];

      for (let i = 0; i < themeFolderFiles.length; i++) {
        const file = themeFolderFiles[i];
        setRow(i, "uploading");
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
        setRow(i, "done");
      }

      const thumbIdx = themeCount;
      setRow(thumbIdx, "uploading");
      const thumbSigned = await generateThemeAssetSignedUrl({
        sessionId,
        fileName: thumbnailFile.name,
        fileType: thumbnailFile.type || "image/jpeg",
        assetKind: "thumbnail",
      });
      await uploadFileToSignedUrl(thumbSigned.signedUrl, thumbnailFile, thumbSigned.contentType);
      setRow(thumbIdx, "done");

      let reactJsKey: string | undefined;
      let reactCssKey: string | undefined;
      let themeSchemaKey: string | undefined;
      let themeDefaultConfigKey: string | undefined;
      let themeManifestKey: string | undefined;
      let idx = thumbIdx + 1;
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

      setRow(idx, "uploading");
      const schemaSigned = await generateThemeAssetSignedUrl({
        sessionId,
        fileName: themeSchemaFile.name,
        fileType: themeSchemaFile.type || "application/json",
        assetKind: "themeSchema",
      });
      await uploadFileToSignedUrl(
        schemaSigned.signedUrl,
        themeSchemaFile,
        schemaSigned.contentType
      );
      themeSchemaKey = schemaSigned.key;
      setRow(idx, "done");
      idx++;

      setRow(idx, "uploading");
      const defaultConfigSigned = await generateThemeAssetSignedUrl({
        sessionId,
        fileName: themeDefaultConfigFile.name,
        fileType: themeDefaultConfigFile.type || "application/json",
        assetKind: "themeDefaultConfig",
      });
      await uploadFileToSignedUrl(
        defaultConfigSigned.signedUrl,
        themeDefaultConfigFile,
        defaultConfigSigned.contentType
      );
      themeDefaultConfigKey = defaultConfigSigned.key;
      setRow(idx, "done");
      idx++;

      setRow(idx, "uploading");
      const manifestSigned = await generateThemeAssetSignedUrl({
        sessionId,
        fileName: themeManifestFile.name,
        fileType: themeManifestFile.type || "application/json",
        assetKind: "themeManifest",
      });
      await uploadFileToSignedUrl(
        manifestSigned.signedUrl,
        themeManifestFile,
        manifestSigned.contentType
      );
      themeManifestKey = manifestSigned.key;
      setRow(idx, "done");
      idx++;

      const finalizeIdx = progressRows.length - 1;
      setRow(finalizeIdx, "uploading");
      const priceNum = uploadForm.price === "" ? 0 : Number(uploadForm.price);

      const response = await createThemeFromS3({
        name: uploadForm.name,
        description: uploadForm.description,
        category: uploadForm.category,
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
          headline: "Theme created successfully",
          fileCounter: `${totalSteps} of ${totalSteps} steps completed`,
          currentLabel: "",
          percent: 100,
          rows: progressRows.map((r) => ({ ...r })),
        });
        await new Promise<void>((resolve) => {
          window.setTimeout(() => resolve(), 450);
        });
        setUploadForm({
          name: "",
          description: "",
          category: "",
          plan: "",
          price: "",
          version: "1.0.0",
          tags: "",
        });
        setThemeFolderFiles([]);
        setReactThemeJsFile(null);
        setReactThemeCssFile(null);
        setThemeSchemaFile(null);
        setThemeDefaultConfigFile(null);
        setThemeManifestFile(null);
        setThumbnailFile(null);
        setUploadProgress(null);
        setIsUploadOpen(false);

        await fetchThemes();

        alert("Theme uploaded successfully!");
      } else {
        progressRows = progressRows.map((r, i) =>
          i === finalizeIdx ? { ...r, status: "error" as const } : r
        );
        const ts = Math.max(1, totalSteps);
        setUploadProgress({
          headline: "Finalization failed",
          fileCounter: `${Math.max(0, totalSteps - 1)} of ${totalSteps} steps completed`,
          currentLabel: progressRows[finalizeIdx]?.label ?? "",
          percent: Math.min(99, Math.round(((totalSteps - 1) / ts) * 100)),
          rows: progressRows.map((r) => ({ ...r })),
        });
        setUploadError(response.data?.message || "Theme registration failed.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      const upIdx = progressRows.findIndex((r) => r.status === "uploading");
      if (upIdx >= 0) {
        progressRows = progressRows.map((r, i) =>
          i === upIdx ? { ...r, status: "error" as const } : r
        );
        const done = progressRows.filter((r) => r.status === "done").length;
        const ts = Math.max(1, totalSteps);
        setUploadProgress({
          headline: "Upload interrupted",
          fileCounter: `${done} of ${ts} steps completed`,
          currentLabel: progressRows[upIdx]?.label ?? "",
          percent: Math.min(99, Math.round((done / ts) * 100)),
          rows: progressRows.map((r) => ({ ...r })),
        });
      }

      let errorMessage = "Upload failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "You do not have permission to upload themes. Contact administrator.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid request data. Please check all fields.";
      } else if (!error.response) {
        errorMessage = "Network error while uploading. Check backend server and API URL/port.";
      } else {
        errorMessage = error.message || "Upload failed";
      }

      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // If user doesn't have view permission, show access denied message
  if (!canView) {
    return (
      <div className="theme-table-container" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '10px', 
          padding: '32px',
          color: '#475569',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <h2 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 600, color: '#334155' }}>Access Denied</h2>
          <p>You don't have permission to view the Theme Developer section.</p>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>Contact your administrator to request access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-table-container theme-developer-enhanced" style={{ position: 'relative' }}>
      <div className="theme-card">
        {/* Card Header - Discounts style */}
        <div className="theme-card-header">
          <div className="theme-title-block">
            <div className="theme-title-accent" />
            <div>
              <h1 className="theme-card-title">Theme Library</h1>
              <p className="theme-card-subtitle">Manage and customize your store themes</p>
            </div>
          </div>
        <div className="theme-stats-row kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card-header">
              <div className="kpi-content">
                <div className="kpi-label">Total Themes</div>
                <div className="kpi-value">{totalThemes}</div>
              </div>
              <div className="kpi-icon-wrap primary">
                <Layout size={24} strokeWidth={2} />
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

      {/* Delete Loading Animation */}
      {isDeleting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.2)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.75rem',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.1)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '280px',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #64748b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#334155',
              textAlign: 'center'
            }}>
              Deleting Theme...
            </div>
            
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              Please wait while we remove the theme and all associated files
            </div>
          </div>
        </div>
      )}
      {/* Controls Bar */}
      <div className="theme-controls-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search Theme"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} className="search-icon" />
        </div>
        <div className="theme-controls-actions">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table view"
            >
              <LayoutList size={18} />
            </button>
          </div>
          <button
            onClick={fetchThemes}
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
            fallback={
              <div className="upload-fallback-msg">No upload permission</div>
            }
          >
            <button className="add-theme-btn add-theme-btn-accent" onClick={() => setIsUploadOpen(true)}>
              <Plus size={20} />
              Add Theme
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Date Range and Filter */}
      <div className="filters" style={{ position: 'relative' }}>
        <div className="date-range" onClick={() => setShowDatePicker(!showDatePicker)}>
          <Calendar size={16} />
          <span>
            {dateRange[0].startDate.toLocaleDateString()} - {dateRange[0].endDate.toLocaleDateString()}
          </span>
        </div>
        <div className="filter-wrapper" ref={filterRef}>
          <button
            className="filter-btn"
            onClick={() => setShowFilterMenu((prev) => !prev)}
            type="button"
          >
            <Filter size={16} />
            {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : "Filter"}
          </button>
          {showFilterMenu && (
            <div className="filter-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="filter-row">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="filter-row">
                <label>Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  <option value="all">All</option>
                  {planOptions.map((plan) => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>
              <div className="filter-actions">
                <button
                  type="button"
                  className="filter-clear"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedPlan("all");
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="filter-apply"
                  onClick={() => setShowFilterMenu(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {showDatePicker && (
          <div className="date-range-picker" ref={datePickerRef}>
            <DateRange
              editableDateInputs={true}
              onChange={(item: { selection: Range }) => setDateRange([{ ...item.selection, key: "selection" }])}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
            />
          </div>
        )}
      </div>

      {/* Theme List - Grid or Table */}
      {viewMode === "grid" ? (
        <div className="theme-grid-enhanced">
          {loadingThemes ? (
            <div className="theme-grid-loading">
              <div className="theme-grid-spinner" />
              <p>Loading themes...</p>
            </div>
          ) : filteredThemes.length === 0 ? (
            <div className="theme-grid-empty">
              <Palette size={48} strokeWidth={1.5} />
              <p>{searchTerm ? "No themes match your search." : "No themes yet. Upload your first theme!"}</p>
            </div>
          ) : (
            filteredThemes.map((theme) => (
              <div key={theme._id} className="theme-card-enhanced">
                <div className="theme-card-thumb-wrap">
                  <img
                    src={getThumbnailSrc(theme)}
                    alt={theme.name}
                    className="theme-card-thumb-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' fill='%23e2e8f0'%3E%3Crect width='200' height='120' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'%3ENo preview%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className="theme-card-body-enhanced">
                  <h3 className="theme-card-name-enhanced">{theme.name}</h3>
                  <div className="theme-card-meta-enhanced">
                    <span className="category-badge category-badge-sm">{theme.category}</span>
                    <span className={`plan-badge plan-${(theme.plan || "").toLowerCase().replace(/\s+/g, "-")} plan-badge-sm`}>
                      {theme.plan}
                    </span>
                    {formatThemePackageLabel(theme) ? (
                      <span className="theme-package-badge" title="Theme package on S3">
                        {formatThemePackageLabel(theme)}
                      </span>
                    ) : null}
                    {theme.hasRemoteTheme ? (
                      <span className="theme-remote-badge" title="Includes remote theme.js / theme.css">
                        Remote
                      </span>
                    ) : null}
                  </div>
                  <div className="theme-card-footer-enhanced">
                    <span className="theme-card-date-enhanced">{theme.uploadDate}</span>
                    <span className="theme-card-by-enhanced">by {theme.uploadBy}</span>
                  </div>
                  <div className="theme-card-actions-enhanced">
                    <PermissionGate action="edit" section="Developer" subsection="Theme Developer">
                      <button
                        className="theme-card-action-btn"
                        onClick={() => navigate(`/admin/themes/edit/${theme._id}`)}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <div className="action-container theme-card-action-dropdown">
                        <button
                          className="theme-card-action-btn icon-only"
                          onClick={() =>
                            setActiveActionDropdown(activeActionDropdown === theme._id ? null : theme._id)
                          }
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {activeActionDropdown === theme._id && (
                          <div className="action-dropdown" onClick={(e) => e.stopPropagation()}>
                            <PermissionGate action="edit" section="Developer" subsection="Theme Developer">
                              <div
                                className="action-item"
                                onClick={() => {
                                  if (deletingThemeId !== theme._id) {
                                    handleDeleteTheme(theme._id, theme.name);
                                    setActiveActionDropdown(null);
                                  }
                                }}
                                style={{ cursor: deletingThemeId === theme._id ? "not-allowed" : "pointer" }}
                              >
                                <Trash2 size={16} className="action-icon delete-icon" />
                                <span>Delete</span>
                              </div>
                            </PermissionGate>
                          </div>
                        )}
                      </div>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="table-container table-container-enhanced">
          <table className="theme-table">
            <thead>
              <tr>
                <th style={{ width: 88 }}>Preview</th>
                <th>Theme Name</th>
                <th>Category</th>
                <th>Upload Date</th>
                <th>Upload By</th>
                <th>Plan</th>
                <th>Package</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody style={{ textAlign: "left" }}>
              {loadingThemes ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>
                    <div className="theme-table-loading">
                      <div className="theme-grid-spinner" />
                      <span>Loading themes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredThemes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    {searchTerm ? "No themes match your search." : "No themes found. Upload your first theme!"}
                  </td>
                </tr>
              ) : (
                filteredThemes.map((theme) => (
                  <tr key={theme._id} className="theme-table-row-enhanced">
                    <td>
                      <div className="theme-table-thumb">
                        <img
                          src={getThumbnailSrc(theme)}
                          alt={theme.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='40'%3E%3Crect fill='%23e2e8f0' width='56' height='40'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </td>
                    <td className="theme-name">{theme.name}</td>
                    <td>
                      <span className="category-badge">{theme.category}</span>
                    </td>
                    <td className="upload-date">{theme.uploadDate}</td>
                    <td className="upload-by">{theme.uploadBy}</td>
                    <td>
                      <span className={`plan-badge plan-${(theme.plan || "").toLowerCase().replace(/\s+/g, "-")}`}>
                        {theme.plan}
                      </span>
                    </td>
                    <td className="theme-package-cell">
                      {formatThemePackageLabel(theme) ?? "—"}
                      {theme.hasRemoteTheme ? (
                        <span className="theme-remote-badge" style={{ marginLeft: 6 }}>
                          Remote
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <div className="action-container">
                        <PermissionGate action="edit" section="Developer" subsection="Theme Developer">
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => navigate(`/admin/themes/edit/${theme._id}`)}
                          >
                            <Edit size={14} /> Edit
                          </button>
                        </PermissionGate>
                        <button
                          className="action-btn"
                          onClick={() =>
                            setActiveActionDropdown(activeActionDropdown === theme._id ? null : theme._id)
                          }
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {activeActionDropdown === theme._id && (
                          <div className="action-dropdown" onClick={(e) => e.stopPropagation()}>
                            <PermissionGate action="edit" section="Developer" subsection="Theme Developer">
                              <div
                                className="action-item"
                                onClick={() => {
                                  if (deletingThemeId !== theme._id) {
                                    handleDeleteTheme(theme._id, theme.name);
                                    setActiveActionDropdown(null);
                                  }
                                }}
                                style={{ cursor: deletingThemeId === theme._id ? "not-allowed" : "pointer" }}
                              >
                                <Trash2 size={16} className="action-icon delete-icon" />
                                <span>Delete</span>
                              </div>
                            </PermissionGate>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-btn" disabled>
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="pagination-info">
          Page 1 of {Math.max(1, Math.ceil(filteredThemes.length / 12))}
        </span>
        <button className="pagination-btn active">1</button>
        <button className="pagination-btn">
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Upload Sidebar */}
      {isUploadOpen && (
        <div
          className={`themeUpload-overlay${isUploading ? " themeUpload-overlay--busy" : ""}`}
          onClick={() => {
            if (!isUploading) setIsUploadOpen(false);
          }}
        >
          <div className="themeUpload-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="themeUpload-header">
              <h2>Upload Theme</h2>
              <button
                type="button"
                className={`themeUpload-close${isUploading ? " themeUpload-close--disabled" : ""}`}
                title={isUploading ? "Finish upload before closing" : "Close"}
                aria-disabled={isUploading}
                onClick={() => {
                  if (!isUploading) setIsUploadOpen(false);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="themeUpload-body">
              {uploadError && (
                <div style={{ 
                  color: '#b91c1c', 
                  backgroundColor: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  borderRadius: '6px', 
                  padding: '10px 12px', 
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  {uploadError}
                </div>
              )}

              {isUploading && uploadProgress && (
                <div className="themeUpload-progress" aria-live="polite" aria-busy="true">
                  <div className="themeUpload-progress__top">
                    <div className="themeUpload-progress__titleRow">
                      {uploadProgress.percent < 100 ? (
                        <Loader2 className="themeUpload-progress__spinner" size={22} aria-hidden />
                      ) : (
                        <Check className="themeUpload-progress__check" size={22} aria-hidden />
                      )}
                      <div className="themeUpload-progress__titles">
                        <div className="themeUpload-progress__headline">{uploadProgress.headline}</div>
                        <div className="themeUpload-progress__counter">{uploadProgress.fileCounter}</div>
                      </div>
                    </div>
                    <div className="themeUpload-progress__barTrack" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress.percent}>
                      <div
                        className="themeUpload-progress__barFill"
                        style={{ width: `${uploadProgress.percent}%` }}
                      />
                    </div>
                    <div className="themeUpload-progress__meta">
                      <span className="themeUpload-progress__pct">{uploadProgress.percent}%</span>
                      {uploadProgress.currentLabel ? (
                        <span className="themeUpload-progress__current" title={uploadProgress.currentLabel}>
                          {truncateMiddle(uploadProgress.currentLabel, 48)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="themeUpload-progress__listHead">
                    <span>Files & steps</span>
                    <span>{uploadProgress.rows.length} total</span>
                  </div>
                  <ul className="themeUpload-progress__list">
                    {uploadProgress.rows.map((row) => (
                      <li key={row.id} className={`themeUpload-progress__row themeUpload-progress__row--${row.status}`}>
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
                          {truncateMiddle(row.label, 56)}
                        </span>
                        <span className="themeUpload-progress__rowState">
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
              )}

              <fieldset className="themeUpload-fieldset" disabled={isUploading}>
              <label>Theme Name *</label>
              <input 
                type="text" 
                name="name"
                value={uploadForm.name}
                onChange={handleInputChange}
                placeholder="Enter theme name" 
                required
              />

              <label>Description</label>
              <textarea 
                name="description"
                value={uploadForm.description}
                onChange={handleInputChange}
                placeholder="Enter theme description"
                rows={6}
                className="themeUpload-description"
              />

              <label>Category *</label>
              <select 
                name="category"
                value={uploadForm.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="travel">Travel</option>
                <option value="business">Business</option>
                <option value="portfolio">Portfolio</option>
                <option value="ecommerce">E-commerce</option>
                <option value="blog">Blog</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="food">Food</option>
              </select>

              <label>Plan *</label>
              <select 
                name="plan"
                value={uploadForm.plan}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Plan</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>

              <label>Price</label>
              <input 
                type="number" 
                name="price"
                value={uploadForm.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />

              <label>Version</label>
              <input 
                type="text" 
                name="version"
                value={uploadForm.version}
                onChange={handleInputChange}
                placeholder="1.0.0"
              />

              <label>Tags</label>
              <input 
                type="text" 
                name="tags"
                value={uploadForm.tags}
                onChange={handleInputChange}
                placeholder="tag1, tag2, tag3"
              />

              <label>Theme folder (HTML / CSS / JS) *</label>
              <input
                type="file"
                multiple
                onChange={handleThemeFolderChange}
                {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
              />
              {themeFolderFiles.length > 0 && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Selected: {themeFolderFiles.length} file{themeFolderFiles.length === 1 ? '' : 's'} from folder
                </div>
              )}
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: 1.45 }}>
                Choose the folder that contains your static theme (for example <code style={{ fontSize: '11px' }}>index.html</code>, assets, and scripts). The full relative paths inside that folder are preserved.
              </p>

              <label>Remote theme: theme.js (optional)</label>
              <input
                type="file"
                accept=".js,application/javascript,text/javascript"
                onChange={(e) => handleFileChange(e, 'reactThemeJs')}
              />
              {reactThemeJsFile && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Selected: {reactThemeJsFile.name}
                </div>
              )}

              <label>Remote theme: theme.css (optional)</label>
              <input
                type="file"
                accept=".css,text/css"
                onChange={(e) => handleFileChange(e, 'reactThemeCss')}
              />
              {reactThemeCssFile && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Selected: {reactThemeCssFile.name}
                </div>
              )}
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: 1.45 }}>
                Upload the built files from your remote theme dist folder (for example{' '}
                <code style={{ fontSize: '11px' }}>remote-themes/makeup/dist/theme.js</code> and{' '}
                <code style={{ fontSize: '11px' }}>theme.css</code> after <code style={{ fontSize: '11px' }}>npm run build</code>).
              </p>

              <label>theme.schema.json (optional, for editor)</label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileChange(e, 'themeSchema')}
              />
              {themeSchemaFile && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Selected: {themeSchemaFile.name}
                </div>
              )}

              <label>theme.default-config.json *</label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileChange(e, 'themeDefaultConfig')}
                required
              />
              {themeDefaultConfigFile && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Selected: {themeDefaultConfigFile.name}
                </div>
              )}

              <label>theme.manifest.json *</label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileChange(e, 'themeManifest')}
                required
              />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: 1.45 }}>
                Required for the section editor: schema defines settings, default-config is the baseline
                layout, and manifest points to built assets (for example{' '}
                <code style={{ fontSize: '11px' }}>remote-themes/makeup/theme.schema.json</code>).
              </p>
              {themeManifestFile && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Selected: {themeManifestFile.name}
                </div>
              )}

              <label>Thumbnail (JPG/PNG) *</label>
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png" 
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                required
              />
              {thumbnailFile && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Selected: {thumbnailFile.name}
                </div>
              )}

              </fieldset>

              <div className="themeUpload-footer">
                <button
                  type="submit"
                  className="themeUpload-submit"
                  disabled={isUploading}
                >
                  {isUploading
                    ? uploadProgress
                      ? `Uploading… ${uploadProgress.percent}%`
                      : "Uploading…"
                    : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EditVerificationModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setPendingDeleteTheme(null);
        }}
        onVerified={handleOtpVerified}
        requireVerification={true}
      />
      </div>
    </div>
  );
};

export default ThemeDeveloper;
