import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useProductActions } from "../hooks/useProductActions";

export default function ProductDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addToCart, addToWishlist, handleAddCart, handleAddWish } = useProductActions();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [tab, setTab] = useState("description");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [cartState, setCartState] = useState("idle");

  const loadProduct = useCallback(async () => {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data.product);
    setActiveImg(0);
    const rec = await api.get(`/recommendations?productId=${id}&limit=6`);
    setSimilar(rec.data.products);
  }, [id]);

  useEffect(() => {
    setProduct(null);
    loadProduct();
  }, [loadProduct]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.length
      ? product.images
      : ["https://placehold.co/900x900?text=ShopSphere"];
  }, [product]);

  async function addCurrentToCart() {
    setCartState("loading");
    const ok = await addToCart(id, qty);
    if (!ok) {
      setCartState("idle");
      return;
    }
    setCartState("success");
    setMessage(t("products.added"));
    setTimeout(() => setCartState("idle"), 1400);
  }

  async function addCurrentToWishlist() {
    const ok = await addToWishlist(id);
    if (ok) setMessage(t("products.addWish"));
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api.post("/reviews", { productId: id, rating: Number(rating), comment });
      setComment("");
      await loadProduct();
      setMessage(t("product.writeReview"));
    } catch (err) {
      setMessage(err.response?.data?.message || t("common.error"));
    }
  }

  if (!product) {
    return (
      <div className="container page">
        <div className="detail-layout">
          <div className="skeleton" style={{ aspectRatio: 1 }} />
          <div className="stack">
            <div className="skeleton" style={{ height: 32, width: "70%" }} />
            <div className="skeleton" style={{ height: 20, width: "40%" }} />
            <div className="skeleton" style={{ height: 120 }} />
          </div>
        </div>
      </div>
    );
  }

  const stockLabel =
    product.stock <= 0
      ? t("products.outOfStock")
      : product.lowStock
        ? t("products.lowStock")
        : t("products.inStockLabel");
  const stockClass =
    product.stock <= 0 ? "badge-danger" : product.lowStock ? "badge-warn" : "badge-success";

  return (
    <div className="container page">
      <nav className="breadcrumb">
        <Link to="/">{t("product.home")}</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/products?categoryId=${product.categoryId}`}>{product.category.name}</Link>
            <span>/</span>
          </>
        )}
        <span>{product.name}</span>
      </nav>

      <div className="detail-layout">
        <div>
          <button type="button" className="gallery-main" onClick={() => setZoom(true)}>
            <img src={images[activeImg]} alt={product.name} />
          </button>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  className={i === activeImg ? "active" : ""}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="stack">
          <p className="muted" style={{ margin: 0 }}>
            {product.category?.name}
          </p>
          <h1>{product.name}</h1>
          {product.avgRating != null && (
            <p className="stars">
              {"★".repeat(Math.round(product.avgRating))}
              <span className="muted"> ({product.reviews?.length || 0})</span>
            </p>
          )}
          <p className="price" style={{ fontSize: "1.75rem" }}>
            {Number(product.price).toFixed(2)} €
          </p>
          <span className={`badge ${stockClass}`}>{stockLabel}</span>

          <p style={{ marginTop: "0.5rem" }}>{product.description}</p>

          <div>
            <p className="muted" style={{ marginBottom: "0.4rem" }}>
              {t("product.quantity")}
            </p>
            <div className="qty-control">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
          </div>

          <div className="buy-actions">
            <button
              className={`btn btn-primary ${cartState === "loading" ? "loading" : ""} ${
                cartState === "success" ? "success-flash" : ""
              }`}
              onClick={addCurrentToCart}
              disabled={product.stock <= 0 || cartState === "loading"}
            >
              {cartState === "loading"
                ? t("products.adding")
                : cartState === "success"
                  ? t("products.added")
                  : t("products.addCart")}
            </button>
            <button className="btn btn-secondary" onClick={addCurrentToWishlist}>
              ♥ {t("products.addWish")}
            </button>
          </div>

          {message && <p className="muted">{message}</p>}

          <div className="reassure-mini">
            <div>✓ {t("product.securePay")}</div>
            <div>✓ {t("product.freeReturn")}</div>
            <div>✓ {t("product.fastShip")}</div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="tabs">
          {["description", "specs", "shipping", "reviews"].map((key) => (
            <button
              key={key}
              type="button"
              className={tab === key ? "active" : ""}
              onClick={() => setTab(key)}
            >
              {t(`product.${key === "reviews" ? "reviews" : key}`)}
            </button>
          ))}
        </div>

        {tab === "description" && <p>{product.description}</p>}
        {tab === "specs" && (
          <div className="panel">
            <p>{t("product.specsBody")}</p>
            <ul>
              <li>SKU: {product.id.slice(0, 8).toUpperCase()}</li>
              <li>
                {t("products.inStockLabel")}: {product.stock}
              </li>
              <li>
                {t("nav.products")}: {product.category?.name}
              </li>
            </ul>
          </div>
        )}
        {tab === "shipping" && <p>{t("product.shippingBody")}</p>}
        {tab === "reviews" && (
          <div className="stack">
            {(product.reviews || []).length === 0 && (
              <p className="muted">{t("products.empty")}</p>
            )}
            {(product.reviews || []).map((r) => (
              <div key={r.id} className="panel">
                <strong>{r.user?.name}</strong>
                <div className="stars">{"★".repeat(r.rating)}</div>
                <p>{r.comment}</p>
              </div>
            ))}
            {user && (
              <form className="form review-form panel" onSubmit={submitReview}>
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="…"
                />
                <button className="btn btn-primary" type="submit">
                  {t("product.writeReview")}
                </button>
              </form>
            )}
          </div>
        )}
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2>{t("product.similar")}</h2>
        </div>
        <div className="product-rail">
          {similar.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onAddCart={handleAddCart}
              onAddWish={handleAddWish}
            />
          ))}
        </div>
      </section>

      {zoom && (
        <div className="zoom-modal" onClick={() => setZoom(false)} role="dialog">
          <img src={images[activeImg]} alt={product.name} />
        </div>
      )}
    </div>
  );
}
