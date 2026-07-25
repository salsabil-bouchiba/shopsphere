import { useTranslation } from "react-i18next";
import InfoPage from "../components/InfoPage";

export default function Cgv() {
  const { t } = useTranslation();
  return (
    <InfoPage titleKey="pages.cgv.title">
      <h3>{t("pages.cgv.s1")}</h3>
      <p>{t("pages.cgv.p1")}</p>
      <h3>{t("pages.cgv.s2")}</h3>
      <p>{t("pages.cgv.p2")}</p>
      <h3>{t("pages.cgv.s3")}</h3>
      <p>{t("pages.cgv.p3")}</p>
      <p className="muted">{t("pages.cgv.note")}</p>
    </InfoPage>
  );
}
