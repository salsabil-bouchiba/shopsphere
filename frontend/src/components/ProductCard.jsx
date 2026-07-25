import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ProductCard({ product, onAddCart, onAddWish }) {
  const { t } = useTranslation();
  const [cartState, setCartState] = useState("idle");
  const img = product.images?.[0] || "https://placehold.co/600x600?text=ShopSphere";

  async function handleAdd() {
    if (!onAddCart || cartState === "loading") return;
    setCartState("loading");
    try {
      await onAddCart(product);
      setCartState("success");
      setTimeout(() => setCartState("idle"), 1400);
    } catch {
      setCartState("idle");
    }
  }

  const stockBadge =
    product.stock <= 0 ? (
      <span className="badge badge-danger">{t("products.outOfStock")}</span>
    ) : product.lowStock ? (
      <span className="badge badge-warn">{t("products.lowStock")}</span>
    ) : null;

  return (
    <article className="product-card">
      <div className="media">
        <Link to={`/products/${product.id}`}>
          <img src={img} alt={product.name} />
        </Link>
        <button
          type="button"
          className="wish-btn"
          aria-label={t("products.addWish")}
          onClick={() => onAddWish?.(product)}
        >
          ♥
        </button>
      </div>
      <div className="body">
        <p className="muted" style={{ margin: "0 0 0.35rem", fontSize: "0.85rem" }}>
          {product.category?.name}
        </p>
        <Link to={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="row" style={{ marginBottom: "0.85rem" }}>
          <span className="price">{Number(product.price).toFixed(2)} €</span>
          {stockBadge}
        </div>
        <button
          type="button"
          className={`btn btn-primary btn-block ${cartState === "loading" ? "loading" : ""} ${
            cartState === "success" ? "success-flash" : ""
          }`}
          onClick={handleAdd}
          disabled={product.stock <= 0 || cartState === "loading"}
        >
          {cartState === "loading"
            ? t("products.adding")
            : cartState === "success"
              ? t("products.added")
              : t("products.addCart")}
        </button>
      </div>
    </article>
  );
}
