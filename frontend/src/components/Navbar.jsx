import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/client";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    api
      .get("/cart")
      .then((res) => setCartCount(res.data.cart?.itemCount || 0))
      .catch(() => setCartCount(0));
  }, [user]);

  function switchLang() {
    const next = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(next);
    localStorage.setItem("ss_lang", next);
  }

  function onSearch(e) {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          ShopSphere
        </Link>

        <div className="nav-center">
          <form className="nav-search" onSubmit={onSearch}>
            <span aria-hidden>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("nav.search")}
            />
          </form>
        </div>

        <nav className="nav-links">
          <NavLink to="/" end>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/products">{t("nav.products")}</NavLink>
          {user && (
            <>
              <Link to="/cart" className="nav-icon-link" aria-label={t("nav.cart")}>
                🛒
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
              <NavLink to="/wishlist">{t("nav.wishlist")}</NavLink>
              <NavLink to="/orders">{t("nav.orders")}</NavLink>
            </>
          )}
          {isAdmin && <NavLink to="/admin">{t("nav.admin")}</NavLink>}
          <button type="button" className="icon-btn btn-sm" onClick={toggleTheme}>
            {theme === "light" ? "☾" : "☀"}
          </button>
          <button type="button" className="icon-btn btn-sm" onClick={switchLang}>
            {i18n.language === "fr" ? "EN" : "FR"}
          </button>
          {user ? (
            <button type="button" onClick={logout}>
              {t("nav.logout")}
            </button>
          ) : (
            <>
              <NavLink to="/login">{t("nav.login")}</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                {t("nav.register")}
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
