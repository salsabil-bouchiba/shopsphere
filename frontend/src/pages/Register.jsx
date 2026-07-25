import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("common.error"));
    }
  }

  return (
    <div className="container page">
      <h1>{t("auth.registerTitle")}</h1>
      <form className="form panel" onSubmit={onSubmit}>
        {error && <div className="alert">{error}</div>}
        <label>
          {t("auth.name")}
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          {t("auth.email")}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t("auth.password")}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        <button className="btn btn-primary" type="submit">
          {t("auth.submitRegister")}
        </button>
        <p className="muted">
          {t("auth.hasAccount")} <Link to="/login">{t("nav.login")}</Link>
        </p>
      </form>
    </div>
  );
}
