import React, { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  RotateCcw,
  Upload,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";
import "./LiveSupport.css";
import "./KpiCard.css";
import { useExportLog } from "../../hooks/useExportLog";

interface Chat {
  id: number;
  name: string;
  email: string;
  category: string;
  status: string;
  created: string;
}

const LiveSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(10);

  const chats: Chat[] = [
    { id: 1, name: "Shishir Kumar", email: "info@techwyzo.in", category: "Domain", status: "Resolved", created: "21 Jul 2025 05:00 PM" },
    { id: 2, name: "Priya Sharma", email: "priya@example.com", category: "Billing", status: "Active", created: "20 Jul 2025 02:30 PM" },
    { id: 3, name: "Rajesh Patel", email: "rajesh@startup.io", category: "Technical", status: "Pending", created: "19 Jul 2025 02:04 PM" },
    { id: 4, name: "Shishir Kumar", email: "info@techwyzo.in", category: "Domain", status: "Resolved", created: "19 Jul 2025 11:00 AM" },
    { id: 5, name: "Anita Verma", email: "anita@business.com", category: "Account", status: "On Hold", created: "18 Jul 2025 04:15 PM" },
    { id: 6, name: "Vikram Singh", email: "vikram@tech.co", category: "Technical", status: "Active", created: "18 Jul 2025 09:30 AM" },
  ];

  const filteredChats = useMemo(() => {
    let result = [...chats];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.category.toLowerCase().includes(term) ||
          c.status.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "email":
            return a.email.localeCompare(b.email);
          case "status":
            return a.status.localeCompare(b.status);
          case "created":
            return new Date(b.created).getTime() - new Date(a.created).getTime();
          default:
            return 0;
        }
      });
    }

    return result;
  }, [chats, searchTerm, statusFilter, sortBy]);

  const paginatedChats = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredChats.slice(start, start + entriesPerPage);
  }, [filteredChats, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(filteredChats.length / entriesPerPage);

  const stats = useMemo(() => ({
    total: chats.length,
    active: chats.filter((c) => c.status.toLowerCase() === "active").length,
    resolved: chats.filter((c) => c.status.toLowerCase() === "resolved").length,
    pending: chats.filter((c) => c.status.toLowerCase() === "pending").length + chats.filter((c) => c.status.toLowerCase() === "on hold").length,
  }), [chats]);

  const handleExport = () => {
    const headers = ["#", "Name", "Email", "Category", "Status", "Created"];
    const rows = filteredChats.map((c) => [c.id, c.name, c.email, c.category, c.status, c.created]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const fileName = `live-support-${new Date().toISOString().slice(0, 10)}.csv`;
    exportAndLog({ page: "Live Support", csvContent, fileName });
  };

  const handleReset = () => {
    setSearchTerm("");
    setSortBy("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "resolved") return "resolved";
    if (s === "active") return "active";
    if (s === "pending") return "pending";
    if (s === "on hold") return "onhold";
    return "pending";
  };

  const startIndex = filteredChats.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, filteredChats.length);

  return (
    <div className="live-support-container">
      <div className="ls-card">
        <div className="ls-card-header">
          <div className="ls-title-block">
            <div className="ls-title-accent" />
            <div>
              <h1 className="ls-title">Live Support</h1>
              <p className="ls-subtitle">Manage and respond to live support chats</p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Analytics style */}
      <div className="ls-stats kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-content">
              <div className="kpi-label">Total Chats</div>
              <div className="kpi-value">{stats.total}</div>
            </div>
            <div className="kpi-icon-wrap primary">
              <MessageSquare size={24} strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-content">
              <div className="kpi-label">Active</div>
              <div className="kpi-value">{stats.active}</div>
            </div>
            <div className="kpi-icon-wrap success">
              <MessageCircle size={24} strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-content">
              <div className="kpi-label">Resolved</div>
              <div className="kpi-value">{stats.resolved}</div>
            </div>
            <div className="kpi-icon-wrap accent">
              <CheckCircle2 size={24} strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-content">
              <div className="kpi-label">Pending</div>
              <div className="kpi-value">{stats.pending}</div>
            </div>
            <div className="kpi-icon-wrap warning">
              <Clock size={24} strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="ls-controls">
        <div className="ls-controls-left">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ls-sort-select"
          >
            <option value="">Sort</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="status">Status</option>
            <option value="created">Date</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="ls-status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
            <option value="on hold">On Hold</option>
          </select>

          <button type="button" className="ls-control-btn export-btn" onClick={handleExport}>
            <Upload size={16} />
            Export
          </button>
          <button type="button" className="ls-control-btn reset-btn" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </button>
          <button type="button" className="ls-control-btn reload-btn" onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
            Reload
          </button>
        </div>

        <div className="ls-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="ls-table-container">
        {paginatedChats.length === 0 ? (
          <div className="ls-empty-state">
            <MessageCircle size={48} />
            <h3>No chats found</h3>
            <p>
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Support chats will appear here when customers reach out"}
            </p>
          </div>
        ) : (
          <table className="ls-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedChats.map((chat) => (
                <tr key={chat.id}>
                  <td>{chat.id}</td>
                  <td>{chat.name}</td>
                  <td>{chat.email}</td>
                  <td>{chat.category}</td>
                  <td>
                    <span className={`ls-status-badge ${getStatusClass(chat.status)}`}>
                      {chat.status}
                    </span>
                  </td>
                  <td>{chat.created}</td>
                  <td>
                    <button className="ls-action-btn" onClick={() => console.log("Open chat:", chat.id)}>
                      <MessageCircle size={14} />
                      Open Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {paginatedChats.length > 0 && (
        <div className="ls-bottom-controls">
          <span className="ls-entries-info">
            Showing {startIndex} to {endIndex} of {filteredChats.length} entries
          </span>
          <div className="ls-pagination">
            <button
              className="ls-page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button className="ls-page-btn current" disabled>
              {currentPage}
            </button>
            <button
              className="ls-page-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LiveSupport;
