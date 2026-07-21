import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Store,
  Calendar,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import axios from "../../config/axios";
import "./ClientDetail.css";
import "./ClientList.css";
import "./ClientAnalytics.css";

const formatStoreLabel = (s: { storeName?: string; storeCode?: string; _id?: string } | null | undefined) =>
  s?.storeCode && s?._id ? `${s.storeName || "—"} ${s.storeCode}/${s._id}` : s?.storeName || "—";

const CHART_COLORS = [
  "var(--z-primary)",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

type SectionTab = "overview" | "orders" | "revenue" | "products";
type TimeRange = "6" | "12";

interface AnalyticsData {
  user: { _id: string; name: string; email: string };
  stores: { _id: string; storeName: string; storeCode?: string }[];
  totals: { storesCount: number; ordersCount: number; productsSold: number; totalRevenue: number };
  ordersByMonth: { month: string; count: number }[];
  ordersByMonthByStore?: { storeId: string; storeName: string; ordersByMonth: { month: string; count: number }[] }[];
  productsByStore: { storeId: string; storeName: string; productsSold: number }[];
  revenueByStore: { storeId: string; storeName: string; revenue: number; ordersCount: number }[];
}

interface OrderWithItems {
  _id: string;
  orderDate: string;
  total: number;
  status: string;
  storeId?: { storeName?: string; storeCode?: string; _id?: string };
  customerId?: { firstName?: string; lastName?: string; email?: string };
  items?: OrderItem[];
}

interface OrderItem {
  quantity: number;
  total: number;
  productVariantId?: { sku?: string; productId?: { title?: string; _id?: string } };
}

interface ProductSummary {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  revenue: number;
}

const ClientAnalytics: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const match = location.pathname.match(/\/admin\/client\/([^/]+)/);
  const userId = match?.[1] ?? "";

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(() => searchParams.get("store") || null);
  const [timeRange, setTimeRange] = useState<TimeRange>("12");

  useEffect(() => {
    const storeFromUrl = searchParams.get("store");
    setSelectedStoreId(storeFromUrl || null);
  }, [searchParams]);
  const [activeSection, setActiveSection] = useState<SectionTab>("overview");
  const [rawOrders, setRawOrders] = useState<OrderWithItems[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("Invalid client ID");
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`/client-user-stats/${userId}`);
        setData(res.data?.data || null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load analytics");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!data?.stores?.length) return;
    const storeIds = selectedStoreId ? [selectedStoreId] : data.stores.map((s) => String(s._id));
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const results = await Promise.all(
          storeIds.map((storeId) =>
            axios.get(`/orders/store/${storeId}`).then((r) => r.data?.data || [])
          )
        );
        const all = results.flat() as OrderWithItems[];
        all.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setRawOrders(all);
      } catch {
        setRawOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [data?.stores, selectedStoreId]);

  const productsList = useMemo((): ProductSummary[] => {
    const map = new Map<string, ProductSummary>();
    for (const order of rawOrders) {
      for (const item of order.items || []) {
        const pv = item.productVariantId as { sku?: string; productId?: { title?: string; _id?: string } } | undefined;
        const productId = (pv?.productId as any)?._id?.toString() || pv?.productId?.toString() || (pv as any)?._id?.toString() || "unknown";
        const productName = (pv?.productId as any)?.title || "Unknown Product";
        const sku = pv?.sku || "—";
        const qty = item.quantity || 0;
        const total = item.total || 0;

        const key = productId;
        if (!map.has(key)) {
          map.set(key, { productId: key, productName, sku, quantity: 0, revenue: 0 });
        }
        const p = map.get(key)!;
        p.quantity += qty;
        p.revenue += total;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
  }, [rawOrders]);

  const filteredOrdersList = useMemo(() => {
    let list = rawOrders;
    const n = parseInt(timeRange, 10);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - n);
    list = list.filter((o) => new Date(o.orderDate) >= cutoffDate);
    if (orderStatusFilter && orderStatusFilter !== "all") {
      list = list.filter((o) => (o.status || "").toLowerCase() === orderStatusFilter.toLowerCase());
    }
    return list;
  }, [rawOrders, timeRange, orderStatusFilter]);

  const filteredProductsList = useMemo(() => {
    return productsList;
  }, [productsList]);

  const filteredOrdersByMonth = useMemo(() => {
    if (!data?.ordersByMonth) return [];
    const n = parseInt(timeRange, 10);
    return data.ordersByMonth.slice(-n);
  }, [data?.ordersByMonth, timeRange]);

  const filteredOrdersByMonthByStore = useMemo(() => {
    if (!data?.ordersByMonthByStore) return [];
    const n = parseInt(timeRange, 10);
    return data.ordersByMonthByStore.map((s) => ({
      ...s,
      ordersByMonth: s.ordersByMonth.slice(-n),
    }));
  }, [data?.ordersByMonthByStore, timeRange]);

  const filteredRevenueByStore = useMemo(() => {
    if (!data?.revenueByStore) return [];
    let list = data.revenueByStore;
    if (selectedStoreId) {
      list = list.filter((r) => String(r.storeId) === selectedStoreId);
    }
    return list;
  }, [data?.revenueByStore, selectedStoreId]);

  const filteredProductsByStore = useMemo(() => {
    if (!data?.productsByStore) return [];
    let list = data.productsByStore;
    if (selectedStoreId) {
      list = list.filter((p) => String(p.storeId) === selectedStoreId);
    }
    return list;
  }, [data?.productsByStore, selectedStoreId]);

  const ordersChartData = useMemo(() => {
    if (selectedStoreId && data?.ordersByMonthByStore) {
      const storeData = data.ordersByMonthByStore.find((s) => String(s.storeId) === selectedStoreId);
      if (storeData) {
        const n = parseInt(timeRange, 10);
        return storeData.ordersByMonth.slice(-n).map((m) => ({ month: m.month, orders: m.count }));
      }
    }
    return filteredOrdersByMonth.map((m) => ({ month: m.month, orders: m.count }));
  }, [selectedStoreId, data?.ordersByMonthByStore, filteredOrdersByMonth, timeRange]);

  const revenuePieData = useMemo(() => {
    const raw = filteredRevenueByStore.map((r) => ({
      name: r.storeName.length > 20 ? r.storeName.slice(0, 17) + "…" : r.storeName,
      value: r.revenue,
    }));
    return raw.filter((r) => r.value > 0);
  }, [filteredRevenueByStore]);

  const productsBarData = useMemo(
    () =>
      filteredProductsByStore.map((p) => ({
        name: p.storeName.length > 20 ? p.storeName.slice(0, 17) + "…" : p.storeName,
        products: p.productsSold,
      })),
    [filteredProductsByStore]
  );

  const revenueBarData = useMemo(
    () =>
      filteredRevenueByStore.map((r) => ({
        name: r.storeName.length > 20 ? r.storeName.slice(0, 17) + "…" : r.storeName,
        revenue: r.revenue,
        orders: r.ordersCount,
      })),
    [filteredRevenueByStore]
  );

  const formatCurrency = (v: number) => `₹${(v || 0).toLocaleString()}`;

  const displayTotals = useMemo(() => {
    if (!data?.totals) return { storesCount: 0, ordersCount: 0, productsSold: 0, totalRevenue: 0 };
    if (selectedStoreId) {
      const ordersCount = filteredRevenueByStore.reduce((s, r) => s + (r.ordersCount || 0), 0);
      const productsSold = filteredProductsByStore.reduce((s, p) => s + (p.productsSold || 0), 0);
      const totalRevenue = filteredRevenueByStore.reduce((s, r) => s + (r.revenue || 0), 0);
      return {
        storesCount: 1,
        ordersCount,
        productsSold,
        totalRevenue,
      };
    }
    return {
      storesCount: data.totals.storesCount ?? 0,
      ordersCount: data.totals.ordersCount ?? 0,
      productsSold: data.totals.productsSold ?? 0,
      totalRevenue: data.totals.totalRevenue ?? 0,
    };
  }, [data?.totals, selectedStoreId, filteredRevenueByStore, filteredProductsByStore]);

  const sectionTabs: { id: SectionTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag size={16} /> },
    { id: "revenue", label: "Revenue", icon: <DollarSign size={16} /> },
    { id: "products", label: "Products", icon: <TrendingUp size={16} /> },
  ];

  if (loading) return <div className="client-analytics-page"><div className="loading">Loading analytics...</div></div>;
  if (error || !data) return <div className="client-analytics-page"><div className="error-alert">{error || "Analytics not found"}</div></div>;

  return (
    <div className="client-analytics-page">
      <div className="client-analytics-card">
        <div className="client-analytics-header">
          <button
            className="client-analytics-back"
            onClick={() => navigate(`/admin/client/${userId}`, { replace: true })}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="client-analytics-title">Analytics — {data.user?.name}</h1>
            <p className="client-analytics-subtitle">{data.user?.email}</p>
          </div>
        </div>

        <div className="client-analytics-filters">
          <div className="client-analytics-filter-group">
            <Filter size={16} />
            <label>Store</label>
            <select
              value={selectedStoreId ?? ""}
              onChange={(e) => {
                const storeId = e.target.value || null;
                setSelectedStoreId(storeId);
                setSearchParams(storeId ? { store: storeId } : {}, { replace: true });
              }}
              className="client-analytics-select"
            >
              <option value="">All Stores</option>
              {data.stores?.map((s) => (
                <option key={s._id} value={s._id}>
                  {formatStoreLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="client-analytics-filter-group">
            <Calendar size={16} />
            <label>Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="client-analytics-select"
            >
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
          </div>
        </div>

        <div className="client-analytics-tabs">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              className={`client-analytics-tab ${activeSection === tab.id ? "active" : ""}`}
              onClick={() => setActiveSection(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="client-analytics-content">
          {activeSection === "overview" && (
            <>
              <div className="client-analytics-stats">
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon stores"><Store size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.storesCount}</span>
                    <span className="client-analytics-stat-label">Stores</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon orders"><ShoppingBag size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.ordersCount}</span>
                    <span className="client-analytics-stat-label">Total Orders</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon products"><TrendingUp size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.productsSold}</span>
                    <span className="client-analytics-stat-label">Products Sold</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon revenue"><DollarSign size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{formatCurrency(displayTotals.totalRevenue)}</span>
                    <span className="client-analytics-stat-label">Total Revenue</span>
                  </div>
                </div>
              </div>

              <div className="client-analytics-charts-row">
                <div className="client-analytics-chart-section client-analytics-chart-half">
                  <h3 className="client-analytics-chart-title">Orders Over Time</h3>
                  <div className="client-analytics-chart">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={ordersChartData} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--z-border)" vertical={false} />
                        <XAxis dataKey="month" stroke="var(--z-text-muted)" fontSize={12} tick={{ fill: "var(--z-text-muted)" }} interval={0} />
                        <YAxis stroke="var(--z-text-muted)" fontSize={12} tick={{ fill: "var(--z-text-muted)" }} width={32} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--z-bg)",
                            border: "1px solid var(--z-border)",
                            borderRadius: "10px",
                            color: "var(--z-text)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            padding: "12px 16px",
                          }}
                          labelStyle={{ color: "var(--z-text-muted)", fontWeight: 600 }}
                        />
                        <Bar dataKey="orders" fill="var(--z-primary)" radius={[6, 6, 0, 0]} name="Orders" barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="client-analytics-chart-section client-analytics-chart-half">
                  <h3 className="client-analytics-chart-title">Revenue by Store</h3>
                  <div className="client-analytics-chart">
                    <ResponsiveContainer width="100%" height={180}>
                      {revenuePieData.length > 0 ? (
                      <RechartsPieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                        <Pie
                          data={revenuePieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={56}
                          innerRadius={22}
                          paddingAngle={2}
                        >
                          {revenuePieData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="var(--z-bg)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => formatCurrency(v)}
                          contentStyle={{
                            background: "var(--z-bg)",
                            border: "1px solid var(--z-border)",
                            borderRadius: "10px",
                            color: "var(--z-text)",
                            padding: "12px 16px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          itemStyle={{ padding: "4px 0" }}
                        />
                        <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 12 }} />
                      </RechartsPieChart>
                      ) : (
                        <div className="client-analytics-empty">No revenue data</div>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="client-analytics-chart-section client-analytics-chart-full">
                <h3 className="client-analytics-chart-title">Products Sold by Store</h3>
                <div className="client-analytics-chart">
                  <ResponsiveContainer width="100%" height={Math.min(Math.max(160, (productsBarData.length || 1) * 28), 260)}>
                  {productsBarData.length > 0 ? (
                    <BarChart data={productsBarData} layout="vertical" margin={{ top: 12, right: 24, left: 12, bottom: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--z-border)" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="var(--z-text-muted)" fontSize={12} tick={{ fill: "var(--z-text-muted)" }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fill: "var(--z-text)", fontSize: 12 }} stroke="var(--z-text-muted)" />
                        <Tooltip
                          contentStyle={{
                            background: "var(--z-bg)",
                            border: "1px solid var(--z-border)",
                            borderRadius: "var(--z-radius-sm)",
                            color: "var(--z-text)",
                          }}
                        />
                        <Bar dataKey="products" fill="var(--z-primary)" radius={[0, 6, 6, 0]} name="Products" barSize={24} />
                      </BarChart>
                    ) : (
                      <div className="client-analytics-empty">No product data</div>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {activeSection === "orders" && (
            <>
              <div className="client-analytics-stats">
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon stores"><Store size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.storesCount}</span>
                    <span className="client-analytics-stat-label">Stores</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon orders"><ShoppingBag size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.ordersCount}</span>
                    <span className="client-analytics-stat-label">Total Orders</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon products"><TrendingUp size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.productsSold}</span>
                    <span className="client-analytics-stat-label">Products Sold</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon revenue"><DollarSign size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{formatCurrency(displayTotals.totalRevenue)}</span>
                    <span className="client-analytics-stat-label">Total Revenue</span>
                  </div>
                </div>
              </div>
              <div className="client-analytics-chart-section client-analytics-chart-full">
                <h3 className="client-analytics-chart-title">Orders Over Time {selectedStoreId ? "(Selected Store)" : "(All Stores)"}</h3>
                <div className="client-analytics-chart">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={ordersChartData} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--z-border)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--z-text-muted)" fontSize={12} tick={{ fill: "var(--z-text-muted)" }} interval={0} />
                      <YAxis stroke="var(--z-text-muted)" fontSize={12} tick={{ fill: "var(--z-text-muted)" }} width={32} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--z-bg)",
                          border: "1px solid var(--z-border)",
                          borderRadius: "10px",
                          color: "var(--z-text)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Line type="monotone" dataKey="orders" stroke="var(--z-primary)" strokeWidth={2} dot={{ fill: "var(--z-primary)" }} name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="client-analytics-table-wrap">
                <h3 className="client-analytics-chart-title">All Orders</h3>
                <div className="client-analytics-filters client-analytics-orders-filters">
                  <div className="client-analytics-filter-group">
                    <Store size={16} />
                    <label>Store</label>
                    <select
                      value={selectedStoreId ?? ""}
                      onChange={(e) => setSelectedStoreId(e.target.value || null)}
                      className="client-analytics-select"
                    >
                      <option value="">All Stores</option>
                      {data.stores?.map((s) => (
                        <option key={s._id} value={s._id}>
                          {formatStoreLabel(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="client-analytics-filter-group">
                    <Calendar size={16} />
                    <label>Time Range</label>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                      className="client-analytics-select"
                    >
                      <option value="6">Last 6 months</option>
                      <option value="12">Last 12 months</option>
                    </select>
                  </div>
                  <div className="client-analytics-filter-group">
                    <Filter size={16} />
                    <label>Status</label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="client-analytics-select"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                {ordersLoading ? (
                  <div className="client-analytics-loading">Loading orders...</div>
                ) : filteredOrdersList.length === 0 ? (
                  <div className="client-analytics-empty">No orders found</div>
                ) : (
                  <div className="client-analytics-table-scroll">
                    <table className="table client-analytics-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Store</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrdersList.map((ord) => {
                          const storeDisplay = formatStoreLabel(ord.storeId as any);
                          return (
                            <tr key={ord._id}>
                              <td>{ord.orderDate ? new Date(ord.orderDate).toLocaleDateString() : "—"}</td>
                              <td>{storeDisplay}</td>
                              <td>{formatCurrency(ord.total)}</td>
                              <td><span className={`status-badge ${(ord.status || "").toLowerCase()}`}>{ord.status || "—"}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === "revenue" && (
            <>
              <div className="client-analytics-stats">
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon stores"><Store size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.storesCount}</span>
                    <span className="client-analytics-stat-label">Stores</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon orders"><ShoppingBag size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.ordersCount}</span>
                    <span className="client-analytics-stat-label">Total Orders</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon products"><TrendingUp size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.productsSold}</span>
                    <span className="client-analytics-stat-label">Products Sold</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon revenue"><DollarSign size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{formatCurrency(displayTotals.totalRevenue)}</span>
                    <span className="client-analytics-stat-label">Total Revenue</span>
                  </div>
                </div>
              </div>
              <div className="client-analytics-chart-section client-analytics-chart-full">
                <h3 className="client-analytics-chart-title">Revenue by Store</h3>
                <div className="client-analytics-chart">
                  <ResponsiveContainer width="100%" height={200}>
                    {revenueBarData.length > 0 ? (
                      <BarChart data={revenueBarData} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--z-border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--z-text-muted)" fontSize={12} tick={{ fill: "var(--z-text-muted)" }} interval={0} />
                        <YAxis stroke="var(--z-text-muted)" fontSize={12} tick={{ fill: "var(--z-text-muted)" }} width={40} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} allowDecimals={false} />
                        <Tooltip
                          formatter={(v: number) => formatCurrency(v)}
                          contentStyle={{
                            background: "var(--z-bg)",
                            border: "1px solid var(--z-border)",
                            borderRadius: "var(--z-radius-sm)",
                            color: "var(--z-text)",
                          }}
                        />
                        <Bar dataKey="revenue" fill="var(--z-primary)" radius={[4, 4, 0, 0]} name="Revenue" barSize={32} />
                      </BarChart>
                    ) : (
                      <div className="client-analytics-empty" style={{ height: 220 }}>No revenue data</div>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="client-analytics-table-wrap">
                <h3 className="client-analytics-chart-title">Revenue Summary</h3>
                <table className="table client-analytics-table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Orders</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRevenueByStore.map((r) => (
                      <tr key={r.storeId}>
                        <td>{r.storeName}</td>
                        <td>{r.ordersCount}</td>
                        <td>{formatCurrency(r.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeSection === "products" && (
            <>
              <div className="client-analytics-stats">
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon stores"><Store size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.storesCount}</span>
                    <span className="client-analytics-stat-label">Stores</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon orders"><ShoppingBag size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.ordersCount}</span>
                    <span className="client-analytics-stat-label">Total Orders</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon products"><TrendingUp size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{displayTotals.productsSold}</span>
                    <span className="client-analytics-stat-label">Products Sold</span>
                  </div>
                </div>
                <div className="client-analytics-stat-card">
                  <div className="client-analytics-stat-icon revenue"><DollarSign size={24} /></div>
                  <div>
                    <span className="client-analytics-stat-value">{formatCurrency(displayTotals.totalRevenue)}</span>
                    <span className="client-analytics-stat-label">Total Revenue</span>
                  </div>
                </div>
              </div>
              <div className="client-analytics-chart-section client-analytics-chart-full">
                <h3 className="client-analytics-chart-title">Products Sold by Store</h3>
                <div className="client-analytics-chart">
                  <ResponsiveContainer width="100%" height={Math.min(Math.max(180, (productsBarData.length || 1) * 32), 280)}>
                    {productsBarData.length > 0 ? (
                      <BarChart data={productsBarData} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--z-border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--z-text-muted)" fontSize={12} tick={{ fill: "var(--z-text-muted)" }} interval={0} />
                        <YAxis stroke="var(--z-text-muted)" fontSize={12} tick={{ fill: "var(--z-text-muted)" }} width={40} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--z-bg)",
                            border: "1px solid var(--z-border)",
                            borderRadius: "10px",
                            color: "var(--z-text)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Bar dataKey="products" fill="var(--z-primary)" radius={[4, 4, 0, 0]} name="Products Sold" />
                      </BarChart>
                    ) : (
                      <div className="client-analytics-empty" style={{ height: 220 }}>No product data</div>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="client-analytics-table-wrap">
                <h3 className="client-analytics-chart-title">All Products</h3>
                {ordersLoading ? (
                  <div className="client-analytics-loading">Loading products...</div>
                ) : filteredProductsList.length === 0 ? (
                  <div className="client-analytics-empty">No products found</div>
                ) : (
                  <div className="client-analytics-table-scroll">
                    <table className="table client-analytics-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Qty Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProductsList.map((p) => (
                          <tr key={p.productId}>
                            <td>{p.productName}</td>
                            <td>{p.sku}</td>
                            <td>{p.quantity}</td>
                            <td>{formatCurrency(p.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClientAnalytics;
