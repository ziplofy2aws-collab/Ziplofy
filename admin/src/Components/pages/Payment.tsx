import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../config/axios";
import "./PageCard.css";

const GOAL_LABELS: Record<string, string> = {
  sell_online: "Sell online",
  sell_instore: "Sell in-store",
  dropshipping: "Dropshipping",
  digital_products: "Sell digital products",
  move_store: "Move existing store",
};

interface PaymentIntentRow {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  goals: string[];
  paymentMethod: "upi" | "card" | null;
  paymentHint: string;
  planName: string;
  amount: number;
  currency: string;
  status: "submitted" | "skipped";
  createdAt: string;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PaymentIntentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("/platform-payment-intents");
        setRows(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load payment data");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className="payment-page"
      style={{ padding: "24px 28px", background: "var(--z-surface)", minHeight: "calc(100vh - 80px)" }}
    >
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-title-block">
            <div className="page-title-accent" />
            <div>
              <h2 className="page-title">Payment</h2>
              <p className="page-subtitle">Client onboarding payment intents (UPI / card details)</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "48px 28px", textAlign: "center", color: "var(--z-text-muted)" }}>
            Loading…
          </div>
        ) : error ? (
          <div style={{ padding: "24px 28px", color: "#b91c1c" }}>{error}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "48px 28px", textAlign: "center", color: "var(--z-text-muted)" }}>
            No payment data yet. Intents appear when clients complete or skip onboarding.
          </div>
        ) : (
          <div style={{ padding: "8px 20px 24px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--z-border)" }}>
                  <th style={{ padding: "12px 8px", color: "var(--z-text-muted)", fontWeight: 600 }}>Client</th>
                  <th style={{ padding: "12px 8px", color: "var(--z-text-muted)", fontWeight: 600 }}>Goals</th>
                  <th style={{ padding: "12px 8px", color: "var(--z-text-muted)", fontWeight: 600 }}>Method</th>
                  <th style={{ padding: "12px 8px", color: "var(--z-text-muted)", fontWeight: 600 }}>Detail</th>
                  <th style={{ padding: "12px 8px", color: "var(--z-text-muted)", fontWeight: 600 }}>Plan</th>
                  <th style={{ padding: "12px 8px", color: "var(--z-text-muted)", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 8px", color: "var(--z-text-muted)", fontWeight: 600 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id} style={{ borderBottom: "1px solid var(--z-border)" }}>
                    <td style={{ padding: "14px 8px" }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/client/${row.userId}`)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          textAlign: "left",
                          color: "var(--z-text)",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{row.userName}</div>
                        <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>{row.userEmail}</div>
                      </button>
                    </td>
                    <td style={{ padding: "14px 8px", maxWidth: 220 }}>
                      {(row.goals || []).length === 0
                        ? "—"
                        : (row.goals || [])
                            .map((g) => GOAL_LABELS[g] || g)
                            .join(", ")}
                    </td>
                    <td style={{ padding: "14px 8px", textTransform: "uppercase" }}>
                      {row.paymentMethod || "—"}
                    </td>
                    <td style={{ padding: "14px 8px" }}>{row.paymentHint || "—"}</td>
                    <td style={{ padding: "14px 8px" }}>
                      {row.planName || "Basic"} · ₹{row.amount ?? 20}
                    </td>
                    <td style={{ padding: "14px 8px", textTransform: "capitalize" }}>{row.status}</td>
                    <td style={{ padding: "14px 8px", whiteSpace: "nowrap" }}>
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
