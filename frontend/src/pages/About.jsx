import { useTranslation } from "react-i18next";
import InfoPage from "../components/InfoPage";

export default function About() {
  const { t } = useTranslation();
  return (
    <InfoPage titleKey="pages.about.title">
      <p>{t("pages.about.p1")}</p>
      <p>{t("pages.about.p2")}</p>
      <p className="muted">{t("pages.about.p3")}</p>
    </InfoPage>
  );
}
