import { useTranslation } from "react-i18next";
import InfoPage from "../components/InfoPage";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5"];

export default function Faq() {
  const { t } = useTranslation();
  return (
    <InfoPage titleKey="pages.faq.title">
      {FAQ_KEYS.map((key) => (
        <details key={key} open={key === "q1"}>
          <summary style={{ cursor: "pointer", fontWeight: 700, marginBottom: "0.35rem" }}>
            {t(`pages.faq.${key}`)}
          </summary>
          <p className="muted" style={{ marginTop: 0 }}>
            {t(`pages.faq.${key}a`)}
          </p>
        </details>
      ))}
    </InfoPage>
  );
}
