import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import { useProductActions } from "../hooks/useProductActions";

const CATEGORY_IMAGES = {
  Mode: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
  Maison: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
  Électronique: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
  default: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
};

const TRUST_ICONS = ["🚚", "🔒", "↺", "💬"];

export default function Home() {
  const { t } = useTranslation();
  const { handleAddCart, handleAddWish } = useProductActions();
  const [featured, setFeatured] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const railRef = useRef(null);

  useEffect(() => {
    api.get("/products?limit=8&sort=newest").then((res) => setFeatured(res.data.products));
    api.get("/recommendations?limit=8").then((res) => setRecommended(res.data.products));
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  function scrollRail(dir) {
    railRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  const promos = [
    {
      to: "/products?search=Mode",
      img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80",
      title: t("home.promo1Title"),
      text: t("home.promo1Text"),
    },
    {
      to: "/products?search=Maison",
      img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80",
      title: t("home.promo2Title"),
      text: t("home.promo2Text"),
    },
    {
      to: "/products",
      img: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=900&q=80",
      title: t("home.promo3Title"),
      text: t("home.promo3Text"),
    },
  ];

  return (
    <>
      <HeroCarousel />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-kicker">{t("home.promos")}</div>
              <h2>{t("home.promos")}</h2>
            </div>
          </div>
          <div className="promo-grid">
            {promos.map((promo) => (
              <Link key={promo.title} to={promo.to} className="promo-card">
                <img src={promo.img} alt="" />
                <div>
                  <h3>{promo.title}</h3>
                  <p>{promo.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-kicker">ShopSphere</div>
              <h2>{t("home.featured")}</h2>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">
              {t("home.cta")}
            </Link>
          </div>
          <div className="carousel-wrap">
            <button type="button" className="rail-btn prev" onClick={() => scrollRail(-1)}>
              ‹
            </button>
            <div className="product-rail" ref={railRef}>
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddCart={handleAddCart}
                  onAddWish={handleAddWish}
                />
              ))}
            </div>
            <button type="button" className="rail-btn next" onClick={() => scrollRail(1)}>
              ›
            </button>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>{t("home.categories")}</h2>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?categoryId=${category.id}`}
                className="category-tile"
              >
                <img
                  src={CATEGORY_IMAGES[category.name] || CATEGORY_IMAGES.default}
                  alt=""
                />
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>{t("home.recommended")}</h2>
          </div>
          <div className="grid">
            {recommended.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddCart={handleAddCart}
                onAddWish={handleAddWish}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>{t("home.trustTitle")}</h2>
          </div>
          <div className="trust-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="trust-item">
                <div className="icon">{TRUST_ICONS[n - 1]}</div>
                <h3>{t(`home.trust${n}Title`)}</h3>
                <p>{t(`home.trust${n}Text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
