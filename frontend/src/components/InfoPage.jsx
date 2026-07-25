import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Layout partagé pour les pages légales / info (About, Contact, CGV, FAQ). */
export default function InfoPage({ titleKey, children }) {
  const { t } = useTranslation();

  return (
    <div className="container page">
      <nav className="breadcrumb">
        <Link to="/">{t("product.home")}</Link>
        <span>/</span>
        <span>{t(titleKey)}</span>
      </nav>
      <div className="section-kicker">ShopSphere</div>
      <h1 style={{ marginBottom: "1.25rem" }}>{t(titleKey)}</h1>
      <div className="panel stack info-content" style={{ maxWidth: 760 }}>
        {children}
      </div>
    </div>
  );
}
