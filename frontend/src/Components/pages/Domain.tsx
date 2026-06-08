import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Domain.css";
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

interface DomainType {
  id: number;
  leadId: string;
  email: string;
  domain: string;
  selection: string;
  status: string;
  created: string;
}

const Domain: React.FC = () => {
  const { exportAndLog } = useExportLog();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<Range[]>([
    { startDate: new Date(2025, 9, 15), endDate: new Date(2025, 10, 30), key: "selection" },
  ]);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("");
  const [selectedDomains, setSelectedDomains] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(10);
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  const [domains, setDomains] = useState<DomainType[]>([
    {
      id: 1,
      leadId: "Ziplofy_174980",
      email: "info@gmail.com",
      domain: "infodemo.vhost12",
      selection: "",
      status: "Pending",
      created: "Nov 28, 2025",
    },
    {
      id: 2,
      leadId: "Ziplofy_174981",
      email: "support@example.com",
      domain: "exampledemo.vhost12",
      selection: "",
      status: "Pending",
      created: "Nov 27, 2025",
    },
    {
      id: 3,
      leadId: "Ziplofy_174982",
      email: "contact@test.com",
      domain: "testdemo.vhost12",
      selection: "",
      status: "Approved",
      created: "Nov 26, 2025",
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

  const filteredDomains = useMemo(() => {
    let result = [...domains];

    const start = dateRange[0]?.startDate;
    const end = dateRange[0]?.endDate;
    if (start && end) {
      result = result.filter((d) => {
        const createdDate = new Date(d.created);
        if (isNaN(createdDate.getTime())) return true;
        return createdDate >= start && createdDate <= end;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.domain.toLowerCase().includes(term) ||
          d.leadId.toLowerCase().includes(term) ||
          d.email.toLowerCase().includes(term)
      );
    }

    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "leadId":
            return a.leadId.localeCompare(b.leadId);
          case "domain":
            return a.domain.localeCompare(b.domain);
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
  }, [domains, searchTerm, sortBy, dateRange]);

  const paginatedDomains = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredDomains.slice(start, start + entriesPerPage);
  }, [filteredDomains, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(filteredDomains.length / entriesPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedDomains(paginatedDomains.map((d) => d.id));
    } else {
      setSelectedDomains([]);
    }
  };

  const handleSelectDomain = (id: number) => {
    const updated = selectedDomains.includes(id)
      ? selectedDomains.filter((x) => x !== id)
      : [...selectedDomains, id];
    setSelectedDomains(updated);
    setSelectAll(updated.length === paginatedDomains.length);
  };

  useEffect(() => {
    if (paginatedDomains.length > 0) {
      setSelectAll(
        selectedDomains.length === paginatedDomains.length &&
          paginatedDomains.every((d) => selectedDomains.includes(d.id))
      );
    }
  }, [selectedDomains, paginatedDomains]);

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
    console.log("Edit domain:", id);
    const domain = domains.find((d) => d.id === id);
    if (domain) {
      alert(`Edit functionality for ${domain.domain} - would open edit modal`);
    }
  };

  const handleDelete = (id: number) => {
    const domain = domains.find((d) => d.id === id);
    if (domain && window.confirm(`Are you sure you want to delete the domain request for ${domain.domain}?`)) {
      setDomains(domains.filter((d) => d.id !== id));
      setSelectedDomains(selectedDomains.filter((x) => x !== id));
    }
  };

  const handleExport = () => {
    const headers = ["Lead ID", "Email", "Domain", "Selection", "Status", "Created"];
    const rows = filteredDomains.map((d) => [d.leadId, d.email, d.domain, d.selection, d.status, d.created]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const fileName = `domain-requests-${format(new Date(), "yyyy-MM-dd")}.csv`;
    exportAndLog({ page: "Domain Requests", csvContent, fileName });
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
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  const startIndex = filteredDomains.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, filteredDomains.length);

  return (
    <div className="domain-container">
      <div className="domain-card">
        <div className="domain-card-header">
          <div className="domain-title-block">
            <div className="domain-title-accent" />
            <div>
              <h1 className="domain-title">Domain Requests</h1>
              <p className="domain-subtitle">View and manage domain requests for your store</p>
            </div>
          </div>
        </div>

        <div className="domain-controls">
        <div className="controls-left">
          <div className="sort-dropdown">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="">Sort</option>
              <option value="leadId">Lead ID</option>
              <option value="domain">Domain</option>
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

      <div className="domain-table-container">
        <table className="domain-table">
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
              <th>Lead ID</th>
              <th>Email</th>
              <th>Domain</th>
              <th>Selection</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDomains.map((domain) => (
              <tr
                key={domain.id}
                className={selectedDomains.includes(domain.id) ? "selected-row" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(domain.id)}
                    onChange={() => handleSelectDomain(domain.id)}
                    className="checkbox-input"
                  />
                </td>
                <td>{domain.leadId}</td>
                <td>{domain.email}</td>
                <td>{domain.domain}</td>
                <td>{domain.selection}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(domain.status)}`}>
                    {domain.status}
                  </span>
                </td>
                <td>{domain.created}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(domain.id)}
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(domain.id)}
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

      <div className="domain-pagination">
        <div className="pagination-info">
          Showing {startIndex} to {endIndex} of {filteredDomains.length} entries
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

export default Domain;
