import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import axios from "../../config/axios";
import "./ClientDetail.css";
import "./ClientList.css";

interface ClientStoresData {
  user: { _id: string; name: string; email: string };
  stores: {
    _id: string;
    storeName: string;
    storeCode?: string;
    storeDescription?: string;
  }[];
  totals: { storesCount: number; ordersCount: number; productsSold: number; totalRevenue: number };
}

const generateStoreIdCode = (storeId: string): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let hash = 0;
  for (let i = 0; i < storeId.length; i++) {
    hash = ((hash << 5) - hash) + storeId.charCodeAt(i);
    hash = hash & hash;
  }
  let code = "";
  let n = Math.abs(hash);
  for (let i = 0; i < 6; i++) {
    code += chars[n % chars.length];
    n = Math.floor(n / chars.length);
  }
  return code;
};

const getStoreIdentification = (s: { storeName: string; storeCode?: string; _id: string }) => {
  const code = s.storeCode || generateStoreIdCode(s._id);
  return `${code}-${s._id}`;
};

const ClientStores: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const match = location.pathname.match(/\/admin\/client\/([^/]+)/);
  const id = match?.[1] ?? "";
  const [data, setData] = useState<ClientStoresData | null>(null);
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
          setData(d ? { user: d.user, stores: d.stores || [], totals: d.totals || { storesCount: 0, ordersCount: 0, productsSold: 0, totalRevenue: 0 } } : null);
        } catch (statsErr: any) {
          if (statsErr.response?.status === 404 || statsErr.response?.status === 403) {
            const [userRes, storesRes] = await Promise.allSettled([
              axios.get(`/user/${id}`),
              axios.get(`/stores/user/${id}`),
            ]);
            const userData = userRes.status === "fulfilled" ? userRes.value?.data?.data : null;
            const storesData = storesRes.status === "fulfilled" ? storesRes.value?.data?.data || [] : [];
            if (userData) {
              const storesList = Array.isArray(storesData) ? storesData : [];
              setData({
                user: { _id: userData._id, name: userData.name, email: userData.email },
                stores: storesList,
                totals: { storesCount: storesList.length, ordersCount: 0, productsSold: 0, totalRevenue: 0 },
              });
            } else {
              setError("Client not found");
            }
          } else {
            setError(statsErr.response?.data?.message || "Failed to load");
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="client-list-page"><div className="loading">Loading...</div></div>;
  if (error || !data) return <div className="client-list-page"><div className="error-alert">{error || "Not found"}</div></div>;

  return (
    <div className="client-list-page">
      <div className="client-list-card">
        <div className="client-list-card-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            className="btn"
            onClick={() => navigate(`/admin/client/${id}`, { replace: true })}
            style={{ padding: 8 }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="client-list-title">{data.user.name} — Stores</h2>
            <p className="client-list-subtitle">{data.user.email}</p>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Stores</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.stores.map((s) => (
              <div
                key={s._id}
                style={{
                  padding: 16,
                  border: "1px solid var(--z-border)",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{s.storeName}</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--z-text-muted)", fontSize: 13, fontFamily: "monospace" }}>
                    ID: {getStoreIdentification(s)}
                  </p>
                  {s.storeDescription && <p style={{ margin: "8px 0 0", color: "var(--z-text-muted)", fontSize: 14 }}>{s.storeDescription}</p>}
                </div>
                <button
                  className="btn primary"
                  onClick={() => navigate(`/admin/client/${id}/analytics?store=${s._id}`)}
                >
                  <BarChart3 size={16} /> Analytics
                </button>
              </div>
            ))}
            {data.stores.length === 0 && <p style={{ color: "var(--z-text-muted)" }}>No stores</p>}
          </div>

          <div style={{ marginTop: 32, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ padding: 16, background: "var(--z-surface)", borderRadius: 8, minWidth: 140 }}>
              <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Total Orders</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{data.totals.ordersCount}</div>
            </div>
            <div style={{ padding: 16, background: "var(--z-surface)", borderRadius: 8, minWidth: 140 }}>
              <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Products Sold</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{data.totals.productsSold}</div>
            </div>
            <div style={{ padding: 16, background: "var(--z-surface)", borderRadius: 8, minWidth: 140 }}>
              <div style={{ fontSize: 12, color: "var(--z-text-muted)" }}>Revenue</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>₹{data.totals.totalRevenue.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              className="btn primary"
              onClick={() => navigate(`/admin/client/${id}/analytics`)}
            >
              <BarChart3 size={16} /> View Full Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientStores;
