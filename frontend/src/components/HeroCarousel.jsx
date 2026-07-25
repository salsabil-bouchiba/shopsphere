import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    titleKey: "home.slide1Title",
    textKey: "home.slide1Text",
  },
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    titleKey: "home.slide2Title",
    textKey: "home.slide2Text",
  },
  {
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80",
    titleKey: "home.slide3Title",
    textKey: "home.slide3Text",
  },
  {
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80",
    titleKey: "home.slide4Title",
    textKey: "home.slide4Text",
  },
];

export default function HeroCarousel() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  function go(delta) {
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);
  }

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {SLIDES.map((slide, i) => (
        <div key={slide.image} className={`hero-slide ${i === index ? "active" : ""}`}>
          <img src={slide.image} alt="" />
        </div>
      ))}

      <div className="hero-content">
        <div className="container">
          <h1>{t(SLIDES[index].titleKey)}</h1>
          <p>{t(SLIDES[index].textKey)}</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              {t("home.cta")}
            </Link>
            <Link to="/wishlist" className="btn btn-ghost">
              {t("home.secondary")}
            </Link>
          </div>
        </div>
      </div>

      <button type="button" className="hero-nav prev" onClick={() => go(-1)} aria-label="Previous">
        ‹
      </button>
      <button type="button" className="hero-nav next" onClick={() => go(1)} aria-label="Next">
        ›
      </button>

      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={i === index ? "active" : ""}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
