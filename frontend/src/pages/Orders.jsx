import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import EmptyState from "../components/EmptyState";

const FLOW = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

function Timeline({ status }) {
  const { t } = useTranslation();
  if (status === "CANCELLED") {
    return <span className="badge badge-danger">{t("orders.cancelled")}</span>;
  }
  const current = FLOW.indexOf(status);

  const labels = {
    PENDING: t("orders.pending"),
    PAID: t("orders.paid"),
    SHIPPED: t("orders.shipped"),
    DELIVERED: t("orders.delivered"),
  };

  return (
    <div className="timeline">
      {FLOW.map((step, i) => (
        <div
          key={step}
          className={`timeline-step ${i < current ? "done" : ""} ${i === current ? "active" : ""}`}
        >
          <div className="bar" />
          {labels[step]}
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await api.get("/orders/mine");
    setOrders(data.orders);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmPay(id) {
    await api.post(`/orders/${id}/confirm-payment`);
    await load();
  }

  function downloadInvoice(id) {
    const token = localStorage.getItem("ss_token");
    fetch(`${import.meta.env.VITE_API_URL}/orders/${id}/invoice`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `facture-${id.slice(0, 8)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  if (loading) return <div className="container page">{t("common.loading")}</div>;

  return (
    <div className="container page">
      <h1>{t("orders.title")}</h1>
      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title={t("orders.empty")}
          hint={t("orders.emptyHint")}
          ctaLabel={t("orders.browse")}
        />
      ) : (
        <div className="stack">
          {orders.map((order) => (
            <div key={order.id} className="panel stack">
              <div className="row">
                <strong>#{order.id.slice(0, 8)}</strong>
                <span className="badge">{order.status}</span>
              </div>
              <p className="muted" style={{ margin: 0 }}>
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <Timeline status={order.status} />
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.name} × {item.quantity} —{" "}
                    {(item.price * item.quantity).toFixed(2)} €
                  </li>
                ))}
              </ul>
              <div className="row">
                <strong className="price">{order.total.toFixed(2)} €</strong>
                <div className="row">
                  {order.status === "PENDING" && (
                    <button className="btn btn-primary" onClick={() => confirmPay(order.id)}>
                      {t("orders.confirmPay")}
                    </button>
                  )}
                  {["PAID", "SHIPPED", "DELIVERED"].includes(order.status) && (
                    <button className="btn btn-secondary" onClick={() => downloadInvoice(order.id)}>
                      {t("orders.invoice")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
