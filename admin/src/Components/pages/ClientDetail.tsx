import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Store, Mail, User, Calendar, Target, CreditCard } from "lucide-react";
import axios from "../../config/axios";
import "./ClientDetail.css";
import "./ClientList.css";

const GOAL_LABELS: Record<string, string> = {
  sell_online: "Sell online",
  sell_instore: "Sell in-store",
  dropshipping: "Dropshipping",
  digital_products: "Sell digital products",
  move_store: "Move existing store",
};

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
  onboardingGoals?: string[];
  onboardingPaymentMethod?: "upi" | "card" | null;
  onboardingPaymentHint?: string;
  onboardingStatus?: string;
  onboardingCompletedAt?: string | null;
  onboardingPlan?: string;
  onboardingIntroPrice?: number | null;
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
                onboardingGoals: userData.onboardingGoals || [],
                onboardingPaymentMethod: userData.onboardingPaymentMethod || null,
                onboardingPaymentHint: userData.onboardingPaymentHint || "",
                onboardingStatus: userData.onboardingStatus || "not_started",
                onboardingCompletedAt: userData.onboardingCompletedAt || null,
                onboardingPlan: userData.onboardingPlan || "",
                onboardingIntroPrice: userData.onboardingIntroPrice ?? null,
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

  const formatDate = (d: string | undefined | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  if (loading) return <div className="client-list-page"><div className="loading">Loading...</div></div>;
  if (error || !user) return <div className="client-list-page"><div className="error-alert">{error || "Client not found"}</div></div>;

  const goals = Array.isArray(user.onboardingGoals) ? user.onboardingGoals : [];
  const hasOnboarding =
    goals.length > 0 ||
    Boolean(user.onboardingPaymentMethod) ||
    Boolean(user.onboardingStatus && user.onboardingStatus !== "not_started");

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
                    background: user.status === "active" || user.status === "Active" ? "var(--z-success)" : user.status === "inactive" ? "var(--z-text-muted)" : "var(--z-warning)",
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

          <h3 style={{ margin: "28px 0 16px" }}>Onboarding details</h3>
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
            {!hasOnboarding ? (
              <div style={{ color: "var(--z-text-muted)", fontSize: 14 }}>
                No onboarding details submitted yet.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <Target size={18} style={{ color: "var(--z-text-muted)", marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--z-text-muted)", marginBottom: 8 }}>What they want to do</div>
                    {goals.length === 0 ? (
                      <div>—</div>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {goals.map((goalId) => (
                          <span
                            key={goalId}
                            style={{
                              display: "inline-flex",
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: "var(--z-bg-muted, #f3f4f6)",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {GOAL_LABELS[goalId] || goalId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CreditCard size={18} style={{ color: "var(--z-text-muted)" }} />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Payment method</div>
                    <div style={{ textTransform: "uppercase", fontWeight: 600 }}>
                      {user.onboardingPaymentMethod || (user.onboardingStatus === "skipped" ? "Skipped" : "—")}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CreditCard size={18} style={{ color: "var(--z-text-muted)" }} />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>
                      {user.onboardingPaymentMethod === "card" ? "Card" : "UPI / payment detail"}
                    </div>
                    <div>{user.onboardingPaymentHint || "—"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Store size={18} style={{ color: "var(--z-text-muted)" }} />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Plan</div>
                    <div>
                      {user.onboardingPlan || "Basic"}
                      {user.onboardingIntroPrice != null ? ` · ₹${user.onboardingIntroPrice}/mo intro` : ""}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Calendar size={18} style={{ color: "var(--z-text-muted)" }} />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Onboarding status</div>
                    <div style={{ textTransform: "capitalize" }}>
                      {(user.onboardingStatus || "not_started").replace(/_/g, " ")}
                      {user.onboardingCompletedAt ? ` · ${formatDate(user.onboardingCompletedAt)}` : ""}
                    </div>
                  </div>
                </div>
              </>
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
