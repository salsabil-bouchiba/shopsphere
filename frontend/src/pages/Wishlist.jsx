import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import EmptyState from "../components/EmptyState";

export default function Wishlist() {
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState(null);

  async function load() {
    const { data } = await api.get("/wishlist");
    setWishlist(data.wishlist);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(itemId) {
    await api.delete(`/wishlist/items/${itemId}`);
    await load();
  }

  async function addToCart(productId) {
    await api.post("/cart/items", { productId, quantity: 1 });
  }

  if (!wishlist) return <div className="container page">{t("common.loading")}</div>;

  return (
    <div className="container page">
      <h1>{t("wishlist.title")}</h1>
      {wishlist.items.length === 0 ? (
        <EmptyState
          icon="♥"
          title={t("wishlist.empty")}
          hint={t("wishlist.emptyHint")}
          ctaLabel={t("wishlist.browse")}
        />
      ) : (
        <div className="grid">
          {wishlist.items.map((item) => (
            <article key={item.id} className="product-card">
              <Link to={`/products/${item.product.id}`} className="media">
                <img
                  src={item.product.images?.[0] || "https://placehold.co/600x600"}
                  alt={item.product.name}
                />
              </Link>
              <div className="body">
                <Link to={`/products/${item.product.id}`}>
                  <h3>{item.product.name}</h3>
                </Link>
                <p className="price" style={{ marginBottom: "0.75rem" }}>
                  {item.product.price.toFixed(2)} €
                </p>
                <div className="row">
                  <button className="btn btn-primary" onClick={() => addToCart(item.productId)}>
                    {t("products.addCart")}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(item.id)}>
                    ✕
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
