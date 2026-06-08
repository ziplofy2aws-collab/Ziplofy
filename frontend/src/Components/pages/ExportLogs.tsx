import React, { useEffect, useState } from "react";
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import axios from "../../config/axios";
import "./ExportLogs.css";

interface ExportLogEntry {
  _id: string;
  exportedByName: string;
  exportedByEmail: string;
  page: string;
  fileName: string;
  createdAt: string;
}

const ExportLogs: React.FC = () => {
  const [logs, setLogs] = useState<ExportLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/export-logs", { params: { page, limit: 20 } });
      const data = res.data?.data || [];
      setLogs(Array.isArray(data) ? data : []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load export logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleDownload = async (id: string, fileName?: string) => {
    try {
      const res = await axios.get(`/export-logs/${id}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `export-${id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to download");
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
  return (
    <div className="export-logs-page">
      <div className="export-logs-card">
        <div className="export-logs-header">
          <div className="export-logs-title-block">
            <div className="export-logs-title-accent" />
            <div>
              <h1 className="export-logs-title">Export Logs</h1>
              <p className="export-logs-subtitle">
                View who exported data, from which page, and when. Re-download exports for audit.
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
          <div className="export-logs-loading">Loading export logs...</div>
        ) : error ? (
          <div className="export-logs-error">{error}</div>
        ) : logs.length === 0 ? (
          <div className="export-logs-empty">
            <FileSpreadsheet size={48} strokeWidth={1.5} />
            <p>No export logs yet</p>
            <p className="export-logs-empty-hint">Exports from Manage User, Live Support, Tickets, and Domain pages will appear here.</p>
          </div>
        ) : (
          <>
            <div className="export-logs-table-wrap">
              <table className="export-logs-table">
                <thead>
                  <tr>
                    <th>Exported By</th>
                    <th>Page</th>
                    <th>File Name</th>
                    <th>Date & Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <div className="export-log-user">
                          <strong>{log.exportedByName}</strong>
                          <span className="export-log-email">{log.exportedByEmail}</span>
                        </div>
                      </td>
                      <td>{log.page}</td>
                      <td className="export-log-filename">{log.fileName}</td>
                      <td>{formatDate(log.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-download"
                          onClick={() => handleDownload(log._id, log.fileName)}
                        >
                          <Download size={14} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="export-logs-pagination">
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
    </div>
  );
};

export default ExportLogs;
