import type { Dict } from "@/content/types";
import { site, whatsappLink } from "@/site.config";
import { Arrow, Kicker, Monogram, Photo, d, srcSet } from "./ui";
import { Magnetic } from "./Magnetic";
import { Motion } from "./Motion";
import { Analytics } from "./Analytics";

/** The whole one-page site, rendered for one locale. */
export function Site({ t }: { t: Dict }) {
  const wa = whatsappLink(t.whatsappMessage);
  return (
    <>
      <a className="skip label" href="#story">
        {t.nav.skip}
      </a>
      <Header t={t} />
      <main>
        <Hero t={t} wa={wa} />
        <Statement t={t} />
        <About t={t} />
        <Career t={t} />
        <Advisory t={t} />
        <Gallery t={t} />
        <International t={t} />
        <Press t={t} />
        <Close t={t} wa={wa} />
      </main>
      <div className="dock">
        <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">
          {t.hero.cta}
          <Arrow />
        </a>
      </div>
      <Analytics t={t} />
      <Motion />
    </>
  );
}

function Header({ t }: { t: Dict }) {
  return (
    <header className="header">
      <a className="header__brand" href={t.locale === "en" ? "/" : "/ar/"} aria-label={t.hero.name}>
        <Monogram />
        <span className="header__name label">{t.hero.name}</span>
      </a>
      <a className="header__lang label" href={t.nav.switchHref} lang={t.nav.switchLang} hrefLang={t.nav.switchLang}>
        {t.nav.switchLabel}
      </a>
    </header>
  );
}

function ContactLinks({ t }: { t: Dict }) {
  return (
    <div className="links label">
      <a className="textlink" href={site.linkedin} target="_blank" rel="noopener noreferrer">
        {t.links.linkedin}
      </a>
      <span className="dot" aria-hidden="true" />
      <a className="textlink" href={`mailto:${site.email}`}>
        {t.links.email}
      </a>
      <span className="dot" aria-hidden="true" />
      <a className="textlink" href={site.instagram} target="_blank" rel="noopener noreferrer">
        {t.links.instagram}
      </a>
    </div>
  );
}

function Hero({ t, wa }: { t: Dict; wa: string }) {
  const portrait = srcSet("portrait-hero");
  return (
    <section className="hero" aria-label={t.hero.name} style={{ backgroundImage: "url(/media/hero-poster.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}>
      <video
        className="hero__video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/media/hero-mobile.mp4" type="video/mp4" media="(max-width: 860px)" />
        <source src="/media/hero-desktop.mp4" type="video/mp4" />
      </video>

      <div className="hero__veil" aria-hidden="true" />
      {/* Sits above the veil so the portrait stays at full strength */}
      <div className="hero__portrait" data-reveal="fade" style={d(0, 0, 0.2)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={portrait.src} srcSet={portrait.srcSet} sizes="(max-width: 860px) 100vw, 54vw" alt={t.hero.name} fetchPriority="high" />
      </div>

      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow label" data-reveal style={d(0, 0, 0.3)}>
            {t.hero.eyebrow}
          </p>
          <h1 className="hero__name" data-reveal="mask" style={d(0, 0, 0.45)}>
            {t.hero.name}
            <span className="hero__alt" lang={t.locale === "en" ? "ar" : "en"}>
              {t.hero.nameAlt}
            </span>
          </h1>
          <p className="hero__tagline" data-reveal style={d(0, 0, 0.75)}>
            {t.hero.tagline}
          </p>
          <p className="hero__positioning" data-reveal style={d(0, 0, 0.9)}>
            {t.hero.positioning}
          </p>
          <ul className="stats" data-reveal style={d(0, 0, 1.0)}>
            {t.hero.stats.map((s) => (
              <li className="stats__item" key={s.label}>
                <span className="stats__value">{s.value}</span>
                <span className="stats__label label">{s.label}</span>
              </li>
            ))}
          </ul>
          <div className="hero__actions" data-reveal style={d(0, 0, 1.15)}>
            <Magnetic>
              <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">
                {t.hero.cta}
                <Arrow />
              </a>
            </Magnetic>
            <ContactLinks t={t} />
          </div>
        </div>
      </div>

      <a className="hero__scroll label" href="#story" data-reveal="fade" style={d(0, 0, 1.6)}>
        {t.hero.scroll}
      </a>
    </section>
  );
}

function Statement({ t }: { t: Dict }) {
  return (
    <section className="section statement" id="story">
      <div className="container">
        <Kicker>{t.statement.kicker}</Kicker>
        <blockquote>
          <p className="statement__quote" data-reveal="mask">
            {t.statement.quote}
          </p>
          <p className="statement__body lede" data-reveal style={d(1, 0.2)}>
            {t.statement.body}
          </p>
        </blockquote>
      </div>
    </section>
  );
}

function Signature() {
  return (
    <div className="signature" aria-hidden="true">
      {site.signaturePath ? (
        <svg viewBox="0 0 600 200">
          <path d={site.signaturePath} />
        </svg>
      ) : (
        <span className="signature__fallback">Mohamad Issa</span>
      )}
    </div>
  );
}

function About({ t }: { t: Dict }) {
  return (
    <section className="section about">
      <div className="container about__grid">
        <div className="about__media">
          <Photo name="lounge-cream" alt={t.hero.name} sizes="(max-width: 860px) 90vw, 40vw" shape="tall" parallax={0.14} />
        </div>
        <div className="about__text">
          <Kicker>{t.about.kicker}</Kicker>
          <h2 className="display h2" data-reveal="mask">
            {t.about.heading}
          </h2>
          {t.about.paragraphs.map((p, i) => (
            <p className="body" key={i} data-reveal style={d(i, 0.12, 0.15)}>
              {p}
            </p>
          ))}
          <div className="about__sign" data-reveal style={d(0, 0, 0.5)}>
            <Signature />
          </div>
        </div>
      </div>
    </section>
  );
}

function Career({ t }: { t: Dict }) {
  const last = t.career.items.length - 1;
  return (
    <section className="section career">
      <div className="container career__grid">
        <div className="career__intro">
          <Kicker>{t.career.kicker}</Kicker>
          <h2 className="display h2" data-reveal="mask">
            {t.career.heading}
          </h2>
        </div>
        <ol className="timeline">
          {t.career.items.map((item, i) => (
            <li className="timeline__row" key={item.year + item.company} data-reveal style={d(i, 0.08)}>
              <span className="timeline__year">
                {item.year}
                {i === last && <span className="timeline__present">{t.career.present}</span>}
              </span>
              <span className="timeline__role">{item.role}</span>
              <span className="timeline__company label">{item.company}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Advisory({ t }: { t: Dict }) {
  return (
    <section className="section advisory">
      <div className="container">
        <div className="advisory__head">
          <Kicker>{t.advisory.kicker}</Kicker>
          <h2 className="display h2" data-reveal="mask" style={{ maxWidth: "20ch" }}>
            {t.advisory.heading}
          </h2>
        </div>
        <ol className="advisory__list">
          {t.advisory.items.map((item, i) => (
            <li className="advisory__item" key={item.title} data-reveal style={d(i % 2, 0.15)}>
              <p className="advisory__num">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="advisory__title">{item.title}</h3>
              <p className="body">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const GALLERY = [
  { name: "lounge-teal", shape: "tall", cls: "g1", speed: 0.1 },
  { name: "singapore", shape: "wide", cls: "g2", speed: 0.18 },
  { name: "terrace-coat", shape: "square", cls: "g3", speed: 0.12 },
  { name: "london-street", shape: "tall", cls: "g4", speed: 0.2 },
  { name: "london-sofa", shape: "wide", cls: "g5", speed: 0.1 },
] as const;

function Gallery({ t }: { t: Dict }) {
  return (
    <section className="section gallery">
      <div className="container">
        <div className="gallery__head">
          <div>
            <Kicker>{t.gallery.kicker}</Kicker>
            <h2 className="display h2" data-reveal="mask">
              {t.gallery.heading}
            </h2>
          </div>
        </div>
        <div className="gallery__grid">
          {GALLERY.map((g) => {
            const caption = t.gallery.captions[g.name];
            return (
              <figure className={`gallery__fig ${g.cls}`} key={g.name}>
                <Photo
                  name={g.name}
                  alt={caption ? `${t.hero.name}, ${caption}` : t.hero.name}
                  sizes="(max-width: 860px) 78vw, 45vw"
                  shape={g.shape}
                  parallax={g.speed}
                />
                {caption && <figcaption className="label">{caption}</figcaption>}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function International({ t }: { t: Dict }) {
  return (
    <section className="section intl">
      <div className="container">
        <Kicker>{t.international.kicker}</Kicker>
        <h2 className="display h2 intl__heading" data-reveal="mask">
          {t.international.heading}
        </h2>
        <p className="intl__text label" data-reveal style={d(1, 0.2)}>
          {t.international.text}
        </p>
        <ul className="intl__cities">
          {t.international.cities.map((c, i) => (
            <li key={c} style={{ display: "contents" }}>
              {i > 0 && <span className="intl__sep" aria-hidden="true" data-reveal="fade" style={d(i, 0.1, 0.1)} />}
              <span className="intl__city" data-reveal style={d(i, 0.1)}>
                {c}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Press({ t }: { t: Dict }) {
  return (
    <section className="section press">
      <div className="container press__inner">
        <div>
          <Kicker>{t.press.kicker}</Kicker>
          <p className="press__outlet label" data-reveal>
            {t.press.outlet}
          </p>
          <p className="press__date label" data-reveal style={d(1)}>
            {t.press.date}
          </p>
        </div>
        <div>
          <p className="press__title" lang="en" dir="ltr" data-reveal="mask">
            {t.press.title}
          </p>
          <a className="btn btn--ghost" href={site.press.url} target="_blank" rel="noopener noreferrer" data-reveal style={d(2)}>
            {t.press.cta}
            <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}

function Close({ t, wa }: { t: Dict; wa: string }) {
  return (
    <section className="close" id="contact">
      <div className="container">
        <Kicker>{t.close.kicker}</Kicker>
        <h2 className="close__heading" data-reveal="mask">
          {t.close.heading}
        </h2>
        <p className="close__text" data-reveal style={d(1, 0.15)}>
          {t.close.text}
        </p>
        <div className="close__cta" data-reveal style={d(2, 0.15)}>
          <Magnetic>
            <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">
              {t.close.cta}
              <Arrow />
            </a>
          </Magnetic>
        </div>
        <div className="close__links" data-reveal style={d(3, 0.15)}>
          <ContactLinks t={t} />
        </div>
        <div className="close__sign">
          <Signature />
        </div>
        <footer className="footer label">
          <span>
            © {new Date().getFullYear()} {t.close.footer}
          </span>
          <Monogram />
          <span>{t.close.location}</span>
        </footer>
      </div>
    </section>
  );
}
