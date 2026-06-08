import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Ticket.css";
import {
  Edit3,
  Trash2,
  RefreshCw,
  Search,
  Upload,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { DateRange, Range } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import { useExportLog } from "../../hooks/useExportLog";

interface TicketData {
  id: number;
  ticketId: string;
  leadId: string;
  issueType: string;
  subject: string;
  status: string;
  created: string;
}

const Ticket: React.FC = () => {
  const { exportAndLog } = useExportLog();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<Range[]>([
    { startDate: new Date(2025, 9, 15), endDate: new Date(2025, 10, 30), key: "selection" },
  ]);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("");
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(10);
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  const [tickets, setTickets] = useState<TicketData[]>([
    {
      id: 1,
      ticketId: "1689686999",
      leadId: "Ziplofy_174980",
      issueType: "website",
      subject: "Plan support",
      status: "On Hold",
      created: "Nov 28, 2025",
    },
    {
      id: 2,
      ticketId: "1689686999",
      leadId: "Ziplofy_174980",
      issueType: "domain",
      subject: "Performance Degration",
      status: "Process",
      created: "Nov 28, 2025",
    },
    {
      id: 3,
      ticketId: "1689686999",
      leadId: "Ziplofy_174980",
      issueType: "domain",
      subject: "Performance Degration",
      status: "Process",
      created: "Nov 28, 2025",
    },
  ]);

  const formatDateRange = (range: Range) => {
    if (!range.startDate || !range.endDate) return "";
    return `${format(range.startDate, "dd/MM/yyyy")} - ${format(range.endDate, "dd/MM/yyyy")}`;
  };

  const defaultFilters = {
    search: "",
    sort: "",
    dateStart: new Date(2025, 9, 15),
    dateEnd: new Date(2025, 10, 30),
  };

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    const start = dateRange[0]?.startDate;
    const end = dateRange[0]?.endDate;
    if (start && end) {
      result = result.filter((t) => {
        const createdDate = new Date(t.created);
        if (isNaN(createdDate.getTime())) return true;
        return createdDate >= start && createdDate <= end;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.ticketId.toLowerCase().includes(term) ||
          t.leadId.toLowerCase().includes(term) ||
          t.issueType.toLowerCase().includes(term) ||
          t.subject.toLowerCase().includes(term)
      );
    }

    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "ticketId":
            return a.ticketId.localeCompare(b.ticketId);
          case "leadId":
            return a.leadId.localeCompare(b.leadId);
          case "issueType":
            return a.issueType.localeCompare(b.issueType);
          case "subject":
            return a.subject.localeCompare(b.subject);
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
  }, [tickets, searchTerm, sortBy, dateRange]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredTickets.slice(start, start + entriesPerPage);
  }, [filteredTickets, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(filteredTickets.length / entriesPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedTickets(paginatedTickets.map((t) => t.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectTicket = (id: number) => {
    const updated = selectedTickets.includes(id)
      ? selectedTickets.filter((x) => x !== id)
      : [...selectedTickets, id];
    setSelectedTickets(updated);
    setSelectAll(updated.length === paginatedTickets.length);
  };

  useEffect(() => {
    if (paginatedTickets.length > 0) {
      setSelectAll(
        selectedTickets.length === paginatedTickets.length &&
          paginatedTickets.every((t) => selectedTickets.includes(t.id))
      );
    }
  }, [selectedTickets, paginatedTickets]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker]);

  const handleEdit = (id: number) => {
    const ticket = tickets.find((t) => t.id === id);
    if (ticket) {
      alert(`Edit functionality for ticket #${ticket.ticketId} - would open edit modal`);
    }
  };

  const handleDelete = (id: number) => {
    const ticket = tickets.find((t) => t.id === id);
    if (
      ticket &&
      window.confirm(
        `Are you sure you want to delete ticket #${ticket.ticketId} (${ticket.subject})?`
      )
    ) {
      setTickets(tickets.filter((t) => t.id !== id));
      setSelectedTickets(selectedTickets.filter((x) => x !== id));
    }
  };

  const handleTicketIdClick = (ticket: TicketData) => {
    alert(`View ticket #${ticket.ticketId} - would open ticket details`);
  };

  const handleExport = () => {
    const headers = ["Ticket ID", "Lead ID", "Issue Type", "Subject", "Status", "Created"];
    const rows = filteredTickets.map((t) => [
      t.ticketId,
      t.leadId,
      t.issueType,
      t.subject,
      t.status,
      t.created,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const fileName = `support-tickets-${format(new Date(), "yyyy-MM-dd")}.csv`;
    exportAndLog({ page: "Support Tickets", csvContent, fileName });
  };

  const handleReset = () => {
    setSearchTerm("");
    setSortBy("");
    setDateRange([
      { startDate: defaultFilters.dateStart, endDate: defaultFilters.dateEnd, key: "selection" },
    ]);
    setCurrentPage(1);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "on hold":
        return "status-on-hold";
      case "process":
        return "status-process";
      case "resolved":
        return "status-resolved";
      default:
        return "status-process";
    }
  };

  const startIndex = filteredTickets.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, filteredTickets.length);

  return (
    <div className="tickets-container">
      <div className="tickets-card">
        <div className="tickets-card-header">
          <div className="tickets-title-block">
            <div className="tickets-title-accent" />
            <div>
              <h1 className="tickets-title">Support Tickets</h1>
              <p className="tickets-subtitle">View and manage support tickets for your store</p>
            </div>
          </div>
        </div>

        <div className="tickets-controls">
        <div className="controls-left">
          <div className="sort-dropdown">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="">Sort</option>
              <option value="ticketId">Ticket ID</option>
              <option value="leadId">Lead ID</option>
              <option value="issueType">Issue Type</option>
              <option value="subject">Subject</option>
              <option value="status">Status</option>
              <option value="created">Date</option>
            </select>
            <ChevronDown size={14} className="sort-chevron" />
          </div>

          <div className="date-picker-wrapper" ref={datePickerRef}>
            <button
              type="button"
              className="date-range-btn"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              {formatDateRange(dateRange[0])}
            </button>
            {showDatePicker && (
              <div className="date-range-picker">
                <DateRange
                  ranges={dateRange}
                  onChange={(ranges) => setDateRange([ranges.selection])}
                  moveRangeOnFirstSelection={false}
                  months={2}
                  direction="horizontal"
                />
              </div>
            )}
          </div>

          <button type="button" className="control-btn export-btn" onClick={handleExport}>
            <Upload size={16} />
            Export
          </button>
          <button type="button" className="control-btn reset-btn" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </button>
          <button type="button" className="control-btn reload-btn" onClick={handleReload}>
            <RefreshCw size={16} />
            Reload
          </button>
        </div>

        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="checkbox-input"
                />
              </th>
              <th>Ticket ID</th>
              <th>Lead ID</th>
              <th>Issue Type</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className={selectedTickets.includes(ticket.id) ? "selected-row" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.id)}
                    onChange={() => handleSelectTicket(ticket.id)}
                    className="checkbox-input"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="ticket-id-btn"
                    onClick={() => handleTicketIdClick(ticket)}
                  >
                    {ticket.ticketId}
                  </button>
                </td>
                <td>{ticket.leadId}</td>
                <td>{ticket.issueType}</td>
                <td>{ticket.subject}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>{ticket.created}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(ticket.id)}
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(ticket.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tickets-pagination">
        <div className="pagination-info">
          Showing {startIndex} to {endIndex} of {filteredTickets.length} entries
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pagination-btn ${currentPage === p ? "active" : ""}`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Ticket;
