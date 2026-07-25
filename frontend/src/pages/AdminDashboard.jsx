import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/client";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/analytics"),
      api.get("/admin/orders"),
    ]).then(([dash, anal, ord]) => {
      setStats(dash.data.stats);
      setTopProducts(dash.data.topProducts);
      setAnalytics(anal.data);
      setOrders(ord.data.orders);
    });
  }, []);

  async function updateStatus(id, status) {
    await api.patch(`/orders/${id}/status`, { status });
    const { data } = await api.get("/admin/orders");
    setOrders(data.orders);
  }

  function exportFile(type) {
    const token = localStorage.getItem("ss_token");
    fetch(`${import.meta.env.VITE_API_URL}/admin/orders/export/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = type === "excel" ? "orders.xlsx" : "orders.pdf";
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  if (!stats) return <div className="container page">{t("common.loading")}</div>;

  return (
    <div className="container page stack">
      <div className="row">
        <h1>{t("admin.title")}</h1>
        <div className="row">
          <button className="btn" onClick={() => exportFile("excel")}>
            {t("admin.exportExcel")}
          </button>
          <button className="btn" onClick={() => exportFile("pdf")}>
            {t("admin.exportPdf")}
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          {t("admin.revenue")}
          <strong>{Number(stats.revenue).toFixed(2)} €</strong>
        </div>
        <div className="stat">
          {t("admin.orders")}
          <strong>{stats.paidOrders}</strong>
        </div>
        <div className="stat">
          {t("admin.pending")}
          <strong>{stats.pendingOrders}</strong>
        </div>
        <div className="stat">
          {t("admin.users")}
          <strong>{stats.userCount}</strong>
        </div>
        <div className="stat">
          {t("admin.products")}
          <strong>{stats.productCount}</strong>
        </div>
      </div>

      <div className="panel">
        <h2>{t("admin.topProducts")}</h2>
        <div className="stack">
          {topProducts.map((row) => (
            <div key={row.product?.id || Math.random()} className="row">
              <span>{row.product?.name || "—"}</span>
              <strong>× {row.quantitySold}</strong>
            </div>
          ))}
        </div>
      </div>

      {analytics && (
        <div className="panel">
          <h2>Top catégories</h2>
          <div className="stack">
            {analytics.topCategories.map((c) => (
              <div key={c.category.id} className="row">
                <span>{c.category.name}</span>
                <strong>{c.revenue.toFixed(2)} €</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel">
        <h2>Commandes</h2>
        <div className="stack">
          {orders.slice(0, 20).map((o) => (
            <div key={o.id} className="row">
              <div>
                <strong>#{o.id.slice(0, 8)}</strong> — {o.user?.name} — {o.total.toFixed(2)} €
              </div>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                {["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
