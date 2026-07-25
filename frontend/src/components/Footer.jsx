import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand">
            ShopSphere
          </Link>
          <p>{t("footer.tagline")}</p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              Ig
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X">
              X
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              Fb
            </a>
          </div>
        </div>

        <div>
          <h3>{t("footer.shop")}</h3>
          <Link to="/products">{t("nav.products")}</Link>
          <Link to="/wishlist">{t("nav.wishlist")}</Link>
          <Link to="/orders">{t("nav.orders")}</Link>
        </div>

        <div>
          <h3>{t("footer.help")}</h3>
          <Link to="/about">{t("footer.about")}</Link>
          <Link to="/contact">{t("footer.contact")}</Link>
          <Link to="/cgv">{t("footer.cgv")}</Link>
          <Link to="/faq">{t("footer.faq")}</Link>
        </div>

        <div>
          <h3>{t("footer.newsletter")}</h3>
          <p>{t("footer.newsletterHint")}</p>
          <form
            className="newsletter"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input type="email" placeholder="email@example.com" required />
            <button type="submit" className="btn btn-primary">
              {t("footer.subscribe")}
            </button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} ShopSphere. {t("footer.rights")}
        </span>
        <span>FR / EN · Dark mode ready</span>
      </div>
    </footer>
  );
}
