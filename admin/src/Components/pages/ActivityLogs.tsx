import React, { useEffect, useState } from "react";
import { Eye, Download, RefreshCw, Activity, X } from "lucide-react";
import axios from "../../config/axios";
import "./ActivityLogs.css";

const ACTION_LABELS: Record<string, string> = {
  theme_upload: "Theme Upload",
  theme_update: "Theme Update",
  theme_delete: "Theme Delete",
  theme_install: "Theme Install",
  custom_theme_upload: "Custom Theme Upload",
  user_create: "User Created",
  user_update: "User Updated",
  user_delete: "User Deleted",
  export: "Data Export",
  role_update: "Role Updated",
  permission_update: "Permission Updated",
};

interface ActivityLogEntry {
  _id: string;
  performedByName: string;
  performedByEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  summary: string;
  details: Record<string, unknown>;
  createdAt: string;
}

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewLog, setViewLog] = useState<ActivityLogEntry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/activity-logs", { params: { page, limit: 20 } });
      const data = res.data?.data || [];
      setLogs(Array.isArray(data) ? data : []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Failed to load activity logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleViewDetail = async (log: ActivityLogEntry) => {
    setViewLog(log);
    setDetailLoading(true);
    try {
      const res = await axios.get(`/activity-logs/${log._id}`);
      const fullLog = res.data?.data;
      if (fullLog) setViewLog(fullLog);
    } catch {
      // Keep existing log if fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = async (id: string, fileName?: string) => {
    try {
      const res = await axios.get(`/activity-logs/${id}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `export-${id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || "Failed to download");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatAction = (action: string) =>
    ACTION_LABELS[action] || action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatDetails = (details: Record<string, unknown>, isExport?: boolean) => {
    try {
      const sanitized = { ...details };
      if (isExport && typeof sanitized.csvContent === "string") {
        sanitized.csvContent = `[CSV content, ${(sanitized.csvContent as string).length} chars - use Download to retrieve]`;
      }
      return JSON.stringify(sanitized, null, 2);
    } catch {
      return String(details);
    }
  };

  return (
    <div className="activity-logs-page">
      <div className="activity-logs-card">
        <div className="activity-logs-header">
          <div className="activity-logs-title-block">
            <div className="activity-logs-title-accent" />
            <div>
              <h1 className="activity-logs-title">Activity Logs</h1>
              <p className="activity-logs-subtitle">
                View major actions by admins. Only visible to super-admin.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => fetchLogs()}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="activity-logs-loading">Loading activity logs...</div>
        ) : error ? (
          <div className="activity-logs-error">{error}</div>
        ) : logs.length === 0 ? (
          <div className="activity-logs-empty">
            <Activity size={48} strokeWidth={1.5} />
            <p>No activity logs yet</p>
            <p className="activity-logs-empty-hint">
              Theme uploads, user changes, exports, and other major actions will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="activity-logs-table-wrap">
              <table className="activity-logs-table">
                <thead>
                  <tr>
                    <th>Performed By</th>
                    <th>Action</th>
                    <th>Summary</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <div className="activity-log-user">
                          <strong>{log.performedByName}</strong>
                          <span className="activity-log-sep">·</span>
                          <span className="activity-log-email">{log.performedByEmail}</span>
                        </div>
                      </td>
                      <td>
                        <span className="activity-log-action-badge">{formatAction(log.action)}</span>
                      </td>
                      <td className="activity-log-summary">{log.summary}</td>
                      <td className="activity-log-date">{formatDate(log.createdAt)}</td>
                      <td>
                        <div className="activity-log-actions">
                          <button
                            type="button"
                            className="btn btn-view"
                            onClick={() => handleViewDetail(log)}
                          >
                            <Eye size={14} />
                            View
                          </button>
                          {log.action === "export" && (
                            <button
                              type="button"
                              className="btn btn-download"
                              onClick={() =>
                                handleDownload(
                                  log._id,
                                  (log.details as { fileName?: string })?.fileName
                                )
                              }
                            >
                              <Download size={14} />
                              Download
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="activity-logs-pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages} ({total} total)
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {viewLog && (
        <div className="activity-detail-overlay" onClick={() => setViewLog(null)}>
          <div className="activity-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="activity-detail-header">
              {detailLoading && (
                <span className="activity-detail-loading">Loading details...</span>
              )}
              <h2>Activity Detail</h2>
              <button
                type="button"
                className="activity-detail-close"
                onClick={() => setViewLog(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="activity-detail-body">
              {detailLoading ? (
                <div className="activity-detail-loading-body">Loading...</div>
              ) : (
              <>
              <div className="activity-detail-row">
                <label>Performed By</label>
                <div>
                  <strong>{viewLog.performedByName}</strong>
                  <span className="activity-detail-email">{viewLog.performedByEmail}</span>
                </div>
              </div>
              <div className="activity-detail-row">
                <label>Action</label>
                <span className="activity-log-action-badge">{formatAction(viewLog.action)}</span>
              </div>
              <div className="activity-detail-row">
                <label>Summary</label>
                <p className="activity-detail-summary">{viewLog.summary}</p>
              </div>
              <div className="activity-detail-row">
                <label>Date & Time</label>
                <span>{formatDate(viewLog.createdAt)}</span>
              </div>
              {viewLog.entityName && (
                <div className="activity-detail-row">
                  <label>Entity</label>
                  <span>
                    {viewLog.entityName}
                    {viewLog.entityId && (
                      <code className="activity-detail-id"> ({viewLog.entityId})</code>
                    )}
                  </span>
                </div>
              )}
              {Object.keys(viewLog.details || {}).length > 0 && (
                <div className="activity-detail-row activity-detail-full">
                  <label>Detailed Overview</label>
                  <pre className="activity-detail-pre">{formatDetails(viewLog.details, viewLog.action === "export")}</pre>
                </div>
              )}
              {viewLog.action === "export" && (
                <div className="activity-detail-row">
                  <button
                    type="button"
                    className="btn btn-download"
                    onClick={() => {
                      handleDownload(
                        viewLog._id,
                        (viewLog.details as { fileName?: string })?.fileName
                      );
                      setViewLog(null);
                    }}
                  >
                    <Download size={14} />
                    Download CSV
                  </button>
                </div>
              )}
              </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
