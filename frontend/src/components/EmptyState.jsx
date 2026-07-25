import { Link } from "react-router-dom";

export default function EmptyState({ icon = "🛍️", title, hint, ctaLabel, ctaTo = "/products" }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden>
        {icon}
      </div>
      <h2>{title}</h2>
      {hint && <p>{hint}</p>}
      {ctaLabel && (
        <Link to={ctaTo} className="btn btn-primary">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
