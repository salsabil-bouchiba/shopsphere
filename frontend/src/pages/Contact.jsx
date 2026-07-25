import { useState } from "react";
import { useTranslation } from "react-i18next";
import InfoPage from "../components/InfoPage";

export default function Contact() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <InfoPage titleKey="pages.contact.title">
      <p>{t("pages.contact.intro")}</p>
      <p>
        <strong>Email :</strong> hello@shopsphere.local
        <br />
        <strong>{t("pages.contact.hours")} :</strong> {t("pages.contact.hoursValue")}
      </p>
      <form className="form" style={{ maxWidth: "100%" }} onSubmit={onSubmit}>
        <input type="text" name="name" placeholder={t("auth.name")} required />
        <input type="email" name="email" placeholder={t("auth.email")} required />
        <textarea name="message" rows={4} placeholder={t("pages.contact.message")} required />
        <button type="submit" className="btn btn-primary">
          {t("pages.contact.send")}
        </button>
        {sent && <p className="muted">{t("pages.contact.thanks")}</p>}
      </form>
    </InfoPage>
  );
}
