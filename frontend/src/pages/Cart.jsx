import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import api from "../api/client";
import EmptyState from "../components/EmptyState";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function StripeCheckout({ orderId, onDone }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function pay(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    await api.post(`/orders/${orderId}/confirm-payment`);
    onDone();
  }

  return (
    <form className="panel stack" onSubmit={pay}>
      <PaymentElement />
      {error && <div className="alert">{error}</div>}
      <button className="btn btn-primary" disabled={!stripe || loading}>
        {loading ? "…" : "Stripe"}
      </button>
    </form>
  );
}

export default function Cart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState("");
  const [promo, setPromo] = useState("");
  const [payment, setPayment] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await api.get("/cart");
    setCart(data.cart);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(itemId, quantity) {
    if (quantity < 1) return;
    await api.patch(`/cart/items/${itemId}`, { quantity });
    await load();
  }

  async function removeItem(itemId) {
    await api.delete(`/cart/items/${itemId}`);
    await load();
  }

  async function clear() {
    await api.delete("/cart");
    await load();
  }

  async function checkout() {
    setMessage("");
    const method = stripePromise ? "stripe" : "cod";
    const { data } = await api.post("/orders", {
      shippingAddress: address,
      paymentMethod: method,
    });
    setOrderId(data.order.id);
    if (data.payment?.clientSecret) {
      setPayment(data.payment);
    } else {
      await api.post(`/orders/${data.order.id}/confirm-payment`);
      navigate("/orders");
    }
    await load();
  }

  if (!cart) return <div className="container page">{t("common.loading")}</div>;

  return (
    <div className="container page">
      <div className="row" style={{ marginBottom: "1.25rem" }}>
        <h1>{t("cart.title")}</h1>
        {cart.items.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={clear}>
            {t("cart.clear")}
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title={t("cart.empty")}
          hint={t("cart.emptyHint")}
          ctaLabel={t("cart.browse")}
        />
      ) : (
        <div className="cart-layout">
          <div className="panel">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-line">
                <Link to={`/products/${item.product.id}`}>
                  <img
                    src={item.product.images?.[0] || "https://placehold.co/160x160"}
                    alt={item.product.name}
                  />
                </Link>
                <div>
                  <Link to={`/products/${item.product.id}`}>
                    <strong>{item.product.name}</strong>
                  </Link>
                  <p className="muted" style={{ margin: "0.25rem 0" }}>
                    {t("cart.unit")}: {item.product.price.toFixed(2)} €
                  </p>
                  <div className="qty-control">
                    <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="price">
                    {(item.product.price * item.quantity).toFixed(2)} €
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() => removeItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="panel cart-summary stack">
            <h2>{t("cart.summary")}</h2>
            <div className="row">
              <span className="muted">{t("cart.subtotal")}</span>
              <strong>{cart.total.toFixed(2)} €</strong>
            </div>
            <div className="row">
              <span>{t("cart.total")}</span>
              <span className="price" style={{ fontSize: "1.35rem" }}>
                {cart.total.toFixed(2)} €
              </span>
            </div>
            <div className="filters-row" style={{ display: "flex" }}>
              <input
                placeholder={t("cart.promo")}
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setMessage(t("cart.promoUnavailable"))}
              >
                {t("cart.promoApply")}
              </button>
            </div>
            <input
              placeholder={t("cart.address")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button className="btn btn-primary btn-block" onClick={checkout}>
              {t("cart.checkout")}
            </button>
            {message && <p className="muted">{message}</p>}

            {payment?.clientSecret && stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret: payment.clientSecret }}>
                <StripeCheckout orderId={orderId} onDone={() => navigate("/orders")} />
              </Elements>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
