import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { useProductActions } from "../hooks/useProductActions";

export default function Products() {
  const { t } = useTranslation();
  const { handleAddCart, handleAddWish } = useProductActions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("categoryId") || "",
    inStock: "",
    sort: "newest",
    page: 1,
    maxPrice: 500,
  });

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    setFilters((prev) => ({
      ...prev,
      search,
      categoryId,
      page: 1,
    }));
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(filters.page));
    params.set("limit", "12");
    params.set("sort", filters.sort);
    params.set("maxPrice", String(filters.maxPrice));
    if (filters.search) params.set("search", filters.search);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.inStock) params.set("inStock", filters.inStock);

    api
      .get(`/products?${params}`)
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  function setCategory(categoryId) {
    setFilters((prev) => ({ ...prev, categoryId, page: 1 }));
    const next = new URLSearchParams(searchParams);
    if (categoryId) next.set("categoryId", categoryId);
    else next.delete("categoryId");
    setSearchParams(next);
  }

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <div className="section-kicker">ShopSphere</div>
          <h1>{t("products.title")}</h1>
        </div>
        <div className="view-toggle">
          <button
            type="button"
            className={`chip ${view === "grid" ? "active" : ""}`}
            onClick={() => setView("grid")}
          >
            {t("products.grid")}
          </button>
          <button
            type="button"
            className={`chip ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            {t("products.list")}
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-row">
          <input
            placeholder={t("products.search")}
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
            }
          />
          <select
            value={filters.inStock}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, inStock: e.target.value, page: 1 }))
            }
          >
            <option value="">Stock</option>
            <option value="true">{t("products.inStock")}</option>
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
          >
            <option value="newest">{t("products.newest")}</option>
            <option value="price_asc">{t("products.priceAsc")}</option>
            <option value="price_desc">{t("products.priceDesc")}</option>
          </select>
        </div>

        <div className="chips">
          <button
            type="button"
            className={`chip ${!filters.categoryId ? "active" : ""}`}
            onClick={() => setCategory("")}
          >
            {t("products.allCategories")}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`chip ${filters.categoryId === category.id ? "active" : ""}`}
              onClick={() => setCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="price-range">
          <span>
            {t("products.maxPrice")}: {filters.maxPrice} €
          </span>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: Number(e.target.value),
                page: 1,
              }))
            }
          />
        </div>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon="🔎"
          title={t("products.empty")}
          hint=""
          ctaLabel={t("cart.browse")}
        />
      ) : (
        <div className={`grid ${view === "list" ? "list-view" : ""}`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddCart={handleAddCart}
              onAddWish={handleAddWish}
            />
          ))}
        </div>
      )}

      <div className="pagination">
        <button
          className="btn"
          disabled={filters.page <= 1}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
        >
          ←
        </button>
        <span>
          {pagination.page} / {pagination.totalPages}
        </span>
        <button
          className="btn"
          disabled={filters.page >= pagination.totalPages}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
        >
          →
        </button>
      </div>
    </div>
  );
}
