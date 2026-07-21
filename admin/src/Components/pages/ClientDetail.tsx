import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Store, Mail, User, Calendar } from "lucide-react";
import axios from "../../config/axios";
import "./ClientDetail.css";
import "./ClientList.css";

interface ClientUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string | null;
  assignedSupportDeveloper?: { username: string; email: string } | null;
}

const ClientDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const match = location.pathname.match(/\/admin\/client\/([^/]+)(?:\/|$)/);
  const id = match?.[1] ?? "";
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid client ID");
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        try {
          const res = await axios.get(`/client-user-stats/${id}`);
          const d = res.data?.data;
          setUser(d?.user || null);
        } catch (statsErr: any) {
          if (statsErr.response?.status === 404 || statsErr.response?.status === 403) {
            const [userRes] = await Promise.allSettled([axios.get(`/user/${id}`)]);
            const userData = userRes.status === "fulfilled" ? userRes.value?.data?.data : null;
            if (userData) {
              setUser({
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                role: typeof userData.role === "object" ? userData.role?.name || "" : userData.role || "",
                status: userData.status || "",
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
                lastLogin: userData.lastLogin ?? null,
                assignedSupportDeveloper: userData.assignedSupportDeveloper ?? null,
              });
            } else {
              setError("Client not found");
            }
          } else {
            setError(statsErr.response?.data?.message || "Failed to load client");
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load client");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (d: string | undefined) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  if (loading) return <div className="client-list-page"><div className="loading">Loading...</div></div>;
  if (error || !user) return <div className="client-list-page"><div className="error-alert">{error || "Client not found"}</div></div>;

  return (
    <div className="client-list-page">
      <div className="client-list-card">
        <div className="client-list-card-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            className="btn"
            onClick={() => {
              sessionStorage.setItem("activeMenu", "Client List");
              navigate("/admin/dashboard", { replace: true });
            }}
            style={{ padding: 8 }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="client-list-title">{user.name}</h2>
            <p className="client-list-subtitle">{user.email}</p>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Client Details</h3>
          <div
            style={{
              display: "grid",
              gap: 16,
              padding: 20,
              background: "var(--z-surface)",
              borderRadius: 8,
              border: "1px solid var(--z-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <User size={18} style={{ color: "var(--z-text-muted)" }} />
              <div>
                <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Name</div>
                <div style={{ fontWeight: 600 }}>{user.name}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Mail size={18} style={{ color: "var(--z-text-muted)" }} />
              <div>
                <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Email</div>
                <div>{user.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <User size={18} style={{ color: "var(--z-text-muted)" }} />
              <div>
                <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Role</div>
                <div>{user.role || "—"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: user.status === "active" ? "var(--z-success)" : user.status === "inactive" ? "var(--z-text-muted)" : "var(--z-warning)",
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Status</div>
                <div style={{ textTransform: "capitalize" }}>{user.status || "—"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Calendar size={18} style={{ color: "var(--z-text-muted)" }} />
              <div>
                <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Joined</div>
                <div>{formatDate(user.createdAt)}</div>
              </div>
            </div>
            {user.assignedSupportDeveloper && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <User size={18} style={{ color: "var(--z-text-muted)" }} />
                <div>
                  <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Assigned Support Developer</div>
                  <div>{user.assignedSupportDeveloper.username} ({user.assignedSupportDeveloper.email})</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              className="btn primary"
              onClick={() => navigate(`/admin/client/${id}/stores`)}
            >
              <Store size={16} /> View Stores & Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
