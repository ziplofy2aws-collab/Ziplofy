import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/admin-auth.context";
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Edit, Trash2, Eye, X, Users } from "lucide-react";
import axios from "../../config/axios";
import { useDebounce } from "../../hooks/useDebounce";
import { EditVerificationModal } from "../EditVerificationModal";
import "./ClientList.css";

// ---------------------- Types ----------------------
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  userCode?: string;
  createdAt: string;
}

const formatClientDisplay = (u: User) =>
  u.userCode ? `${u.name} ${u.userCode}/${u._id}` : u.name;

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  mode?: "add" | "edit";
}

interface UserFormData {
  name: string;
  email: string;
  status: "active" | "inactive" | "suspended";
}

// ---------------------- User Modal ----------------------
const UserModal: React.FC<UserModalProps> = ({
  user,
  onClose,
  onSubmit,
  mode = "add",
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || "",
    email: user?.email || "",
    status: (user?.status as "active" | "inactive" | "suspended") || "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{mode === "add" ? "Add New User" : "Edit User"}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={mode === "edit"}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {errors.submit && <div className="error">{errors.submit}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn cancel">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn primary">
              {isSubmitting ? "Saving..." : mode === "add" ? "Add User" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ADMIN_ROLES = ["super-admin", "support-admin", "client-admin", "developer-admin"];

// ---------------------- Client List (Client users only - non-admin) ----------------------
const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const { user: adminUser } = useAdminAuth();
  const isSuperAdmin =
    adminUser?.roleName === "super-admin" || localStorage.getItem("isSuperAdmin") === "true";

  useEffect(() => {
    if (!isSuperAdmin) {
      sessionStorage.setItem("activeMenu", "Payment");
      window.location.href = "/admin/dashboard";
    }
  }, [isSuperAdmin]);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<{ userId: string; data: UserFormData } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [allClientUsers, setAllClientUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "email" | "status" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {
        page: "1",
        limit: "500",
        search: debouncedSearch,
        status: statusFilter,
      };
      const res = await axios.get("/user", { params });
      const data = res.data?.data || [];

      const normalized = (Array.isArray(data) ? data : []).map((u: any) => ({
        ...u,
        role:
          typeof u.role === "object" && u.role?.name
            ? u.role.name
            : typeof u.role === "string"
            ? u.role
            : "",
      }));

      // Client List: show only client users (exclude admin roles)
      const clientUsers = normalized.filter(
        (u: any) => !ADMIN_ROLES.includes((u.role || "").toLowerCase())
      );

      setAllClientUsers(clientUsers);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch users");
      setAllClientUsers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  const handleSort = (column: "name" | "email" | "status" | "createdAt") => {
    if (sortBy === column) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleSortFromDropdown = (value: string) => {
    const [col, order] = value.split("-") as ["name" | "email" | "status" | "createdAt", "asc" | "desc"];
    setSortBy(col);
    setSortOrder(order);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const sortDropdownValue = `${sortBy}-${sortOrder}`;

  const sortedUsers = useMemo(() => {
    const list = [...allClientUsers];
    const mult = sortOrder === "asc" ? 1 : -1;
    const statusOrder = { active: 0, inactive: 1, suspended: 2 };
    list.sort((a, b) => {
      if (sortBy === "name") {
        return mult * (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
      }
      if (sortBy === "email") {
        return mult * (a.email || "").localeCompare(b.email || "", undefined, { sensitivity: "base" });
      }
      if (sortBy === "status") {
        const sa = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
        const sb = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
        return mult * (sa - sb);
      }
      if (sortBy === "createdAt") {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return mult * (da - db);
      }
      return 0;
    });
    return list;
  }, [allClientUsers, sortBy, sortOrder]);

  // Paginate client users for display
  const paginatedUsers = sortedUsers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );
  const totalClientUsers = sortedUsers.length;
  const totalPages = Math.ceil(totalClientUsers / pagination.limit) || 1;

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = async (formData: UserFormData) => {
    if (!editingUser) return;
    setPendingEditData({ userId: editingUser._id, data: formData });
    setShowOtpModal(true);
  };

  const executeEditWithOtp = async (otp: string) => {
    if (!pendingEditData) return;
    try {
      await axios.put(`/user/${pendingEditData.userId}`, {
        name: pendingEditData.data.name,
        email: pendingEditData.data.email,
        status: pendingEditData.data.status,
        editOtp: otp,
      });
      setPendingEditData(null);
      setShowOtpModal(false);
      closeModal();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleOtpVerified = (otp: string) => {
    if (pendingEditData) {
      executeEditWithOtp(otp);
    } else if (pendingDeleteId) {
      executeDeleteWithOtp(otp);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setPendingDeleteId(id);
    setShowOtpModal(true);
  };

  const executeDeleteWithOtp = async (otp: string) => {
    if (!pendingDeleteId) return;
    try {
      const token = localStorage.getItem("admin_token");
      await axios.delete(`/user/${pendingDeleteId}`, {
        data: { editOtp: otp },
        headers: {
          "X-Edit-Otp": otp,
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      setPendingDeleteId(null);
      setShowOtpModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((p) => ({ ...p, page: newPage }));
    }
  };

  return (
    <div className="client-list-page main-content">
      <div className="client-list-card">
        <div className="client-list-card-header">
          <div className="client-list-title-block">
            <div className="client-list-title-accent" />
            <div>
              <h2 className="client-list-title">Client List</h2>
              <p className="client-list-subtitle">
                View and manage your store clients
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        <div className="client-list-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={sortDropdownValue}
            onChange={(e) => handleSortFromDropdown(e.target.value)}
            className="filter-select"
            title="Sort by"
          >
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
            <option value="email-asc">Email (A → Z)</option>
            <option value="email-desc">Email (Z → A)</option>
            <option value="status-asc">Status (Active first)</option>
            <option value="status-desc">Status (Suspended first)</option>
            <option value="createdAt-desc">Created (Newest)</option>
            <option value="createdAt-asc">Created (Oldest)</option>
          </select>
        </div>

        <div className="client-list-table-card">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : paginatedUsers.length === 0 ? (
            <div className="client-list-empty">
              <Users className="client-list-empty-icon" size={64} strokeWidth={1.5} />
              <p className="client-list-empty-message">
                {searchTerm || statusFilter !== "all"
                  ? "No users match your search criteria"
                  : "No clients yet"}
              </p>
            </div>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }} className="client-list-sortable">
                      <button type="button" onClick={() => handleSort("name")} className="client-list-sort-btn">
                        Name {sortBy === "name" ? (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                      </button>
                    </th>
                    <th style={{ textAlign: "left" }} className="client-list-sortable">
                      <button type="button" onClick={() => handleSort("email")} className="client-list-sort-btn">
                        Email {sortBy === "email" ? (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                      </button>
                    </th>
                    <th style={{ textAlign: "left" }} className="client-list-sortable">
                      <button type="button" onClick={() => handleSort("status")} className="client-list-sort-btn">
                        Status {sortBy === "status" ? (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                      </button>
                    </th>
                    <th style={{ textAlign: "left" }} className="client-list-sortable">
                      <button type="button" onClick={() => handleSort("createdAt")} className="client-list-sort-btn">
                        Created {sortBy === "createdAt" ? (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                      </button>
                    </th>
                    <th style={{ textAlign: "left" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      <td style={{ textAlign: "left" }}>{formatClientDisplay(user)}</td>
                      <td style={{ textAlign: "left" }}>{user.email}</td>
                      <td style={{ textAlign: "left" }}>
                        <span
                          className={`status-badge ${user.status.toLowerCase()}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "left" }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "left" }}>
                        <div className="action-buttons">
                          <button
                            className="btn view"
                            onClick={() => navigate(`/admin/client/${user._id}`)}
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            className="btn edit"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit size={14} /> Edit
                          </button>
                          {user.role?.toLowerCase().replace(/\s/g, "-") !== "super-admin" && (
                            <button
                              className="btn delete"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span>
                    Page {pagination.page} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === totalPages}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

        {showModal && (
          <UserModal
            user={editingUser}
            onClose={closeModal}
            onSubmit={handleEditUser}
            mode="edit"
          />
        )}

        <EditVerificationModal
          isOpen={showOtpModal}
          onClose={() => {
            setShowOtpModal(false);
            setPendingEditData(null);
            setPendingDeleteId(null);
          }}
          onVerified={handleOtpVerified}
          requireVerification={true}
        />
    </div>
  );
};

export default ClientList;
