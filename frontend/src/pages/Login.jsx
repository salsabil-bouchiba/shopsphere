import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("user@shopsphere.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("common.error"));
    }
  }

  return (
    <div className="container page">
      <h1>{t("auth.loginTitle")}</h1>
      <form className="form panel" onSubmit={onSubmit}>
        {error && <div className="alert">{error}</div>}
        <label>
          {t("auth.email")}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t("auth.password")}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn btn-primary" type="submit">
          {t("auth.submitLogin")}
        </button>
        <p className="muted">
          {t("auth.noAccount")} <Link to="/register">{t("nav.register")}</Link>
        </p>
      </form>
    </div>
  );
}
