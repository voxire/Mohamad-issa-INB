import type { Dict } from "@/content/types";
import { site, whatsappLink } from "@/site.config";
import { Arrow, Kicker, Monogram, d, srcSet } from "./ui";
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
      <Intro t={t} />
      <Header t={t} />
      <main>
        <Hero t={t} wa={wa} />
        <Statement t={t} />
        <Career t={t} />
        <Advisory t={t} />
        <Transactions t={t} />
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
      {/* Pass only the consent strings so the whole dictionary isn't shipped to the browser */}
      <Analytics t={{ consent: t.consent }} />
      <Motion />
    </>
  );
}

/**
 * Opening intro, once per visit (see the inline script in Document.tsx and Motion.tsx).
 * Particles of light form his portrait, a tower, a globe and the closing words (components/gl/particles.ts).
 * The name sits beneath: English animates letter by letter; Arabic word by word so the script stays joined.
 */
function Intro({ t }: { t: Dict }) {
  const parts = t.locale === "ar" ? t.hero.name.split(" ") : Array.from(t.hero.name);
  return (
    <div className="intro" aria-hidden="true" data-words={t.intro.words} data-portrait="/media/portrait-hero-480.webp">
      <canvas className="intro__stage" />
      <p className="intro__name">
        {parts.map((p, i) => (
          <span className="intro__char" key={i}>
            {p === " " ? " " : p}
          </span>
        ))}
      </p>
      <span className="intro__line" />
    </div>
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
    <section className="hero" aria-label={t.hero.name}>
      {/* City video + veil in one layer, so the scroll zoom-out can frame them together */}
      <div className="hero__media" aria-hidden="true">
        <video className="hero__video" autoPlay muted loop playsInline preload="metadata" poster="/media/hero-poster.jpg">
          <source src="/media/hero-mobile.mp4" type="video/mp4" media="(max-width: 860px)" />
          <source src="/media/hero-desktop.mp4" type="video/mp4" />
        </video>
        <div className="hero__veil" />
      </div>
      {/* Sits above the veil so the portrait stays at full strength */}
      <div className="hero__portrait" data-reveal="fade" style={d(0, 0, 0.2)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={portrait.src} srcSet={portrait.srcSet} sizes="(max-width: 860px) 100vw, 54vw" alt={t.hero.name} fetchPriority="high" />
      </div>

      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow label" data-reveal style={d(0, 0, 0.3)}>
            {/* Two parts, so phones can break cleanly at the divider */}
            {t.hero.eyebrow.split(" | ").map((part, i) => (
              <span className="hero__eyebrow-part" key={part}>
                {i > 0 && <span className="hero__eyebrow-sep"> | </span>}
                {part}
              </span>
            ))}
          </p>
          <h1 className="hero__name" data-reveal="mask" style={d(0, 0, 0.45)}>
            {t.hero.name}
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
        <figure>
          <blockquote>
            {/* Split on spaces only, so Arabic words stay joined; Motion lights them up on scroll */}
            <p className="statement__quote">
              {t.statement.quote.split(" ").map((w, i, all) => (
                <span className="w" key={i}>
                  {w}
                  {i < all.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </blockquote>
          <figcaption className="statement__by label" data-reveal style={d(1, 0.2)}>
            {t.statement.by}
          </figcaption>
        </figure>
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

/** The developers he has worked with, in his order, under "2016 to present". */
function Career({ t }: { t: Dict }) {
  return (
    <section className="section career" aria-label={t.career.kicker}>
      <div className="container">
        <Kicker>{t.career.kicker}</Kicker>
        <ol className="developers">
          {t.career.developers.map((name, i) => (
            <li className="developers__name" key={name} data-reveal style={d(i, 0.12)}>
              {name}
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

/** Anonymised deals supplied by the owner. Renders nothing until content/en.ts and ar.ts have items. */
function Transactions({ t }: { t: Dict }) {
  if (t.transactions.items.length === 0) return null;
  return (
    <section className="section transactions">
      <div className="container">
        <Kicker>{t.transactions.kicker}</Kicker>
        <h2 className="display h2" data-reveal="mask">
          {t.transactions.heading}
        </h2>
        <ol className="transactions__list">
          {t.transactions.items.map((item, i) => (
            <li className="transactions__item" key={item.title + item.year} data-reveal style={d(i, 0.1)}>
              <span className="transactions__year label">{item.year}</span>
              <span className="transactions__title">{item.title}</span>
              <span className="transactions__detail body">{item.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * His roadshow list around the globe: the first five countries on one side, the rest on the other
 * (a swipe row under the globe on phones). Each country and city is a button that focuses the globe
 * on its pins (components/gl/globe.ts); a country with no cities has one pin at its main city.
 * Pins are numbered in list order, so they line up with PINS in globe.ts.
 */
function International({ t }: { t: Dict }) {
  let next = 0;
  const countries = t.international.countries.map((c) => {
    const pins = Array.from({ length: Math.max(1, c.cities.length) }, () => next++);
    return { ...c, pins };
  });
  // One label per pin for the globe: the city name, or the country name when it has no cities
  const labels = countries.flatMap((c) => (c.cities.length ? c.cities : [c.name]));
  return (
    <section className="section intl">
      <div className="container">
        <h2 className="display h2 intl__heading" data-reveal="mask">
          {t.international.heading}
        </h2>
        <div className="intl__stage">
          <div className="intl__globe" data-reveal="fade">
            <canvas aria-hidden="true" />
            <div className="intl__labels" aria-hidden="true">
              {labels.map((name, i) => (
                <span className="intl__label label" key={i} data-label={i}>
                  {name}
                </span>
              ))}
            </div>
          </div>
          {/* His list, in his order: each country large, its cities small beneath */}
          <ul className="intl__countries">
            {countries.map((c, i) => (
              <li className="intl__country" key={c.name} data-reveal style={d(i % 5, 0.06)}>
                <button type="button" className="intl__name" data-pins={c.pins.join(",")}>
                  {c.name}
                </button>
                {c.cities.length > 0 && (
                  <span className="intl__cities label">
                    {c.cities.map((city, j) => (
                      <span key={city}>
                        {j > 0 && <span aria-hidden="true"> · </span>}
                        <button type="button" className="intl__city" data-pins={c.pins[j]}>
                          {city}
                        </button>
                      </span>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Interviews and articles: one row each. Add items in content/en.ts and ar.ts as he supplies them. */
function Press({ t }: { t: Dict }) {
  if (t.press.items.length === 0) return null;
  return (
    <section className="section press">
      <div className="container">
        <Kicker>{t.press.kicker}</Kicker>
        {t.press.items.map((item, i) => (
          <div className="press__inner" key={item.url}>
            <div>
              <p className="press__outlet label" data-reveal style={d(i, 0.1)}>
                {item.outlet}
              </p>
              <p className="press__date label" data-reveal style={d(i, 0.1, 0.1)}>
                {item.date}
              </p>
            </div>
            <div>
              <p className="press__title" lang="en" dir="ltr" data-reveal="mask">
                {item.title}
              </p>
              <a className="btn btn--ghost" href={item.url} target="_blank" rel="noopener noreferrer" data-reveal style={d(2)}>
                {t.press.cta}
                <Arrow />
              </a>
            </div>
          </div>
        ))}
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
