export type Locale = "en" | "ar";

export type Dict = {
  locale: Locale;
  dir: "ltr" | "rtl";
  meta: { title: string; description: string };
  nav: { switchLabel: string; switchHref: string; switchLang: string; skip: string };
  whatsappMessage: string;
  /** The words the intro particles gather into at the end, and the skip hint (touch and mouse wording). */
  intro: { words: string; skip: { touch: string; click: string } };
  hero: {
    name: string;
    eyebrow: string;
    tagline: string;
    positioning: string;
    stats: { value: string; label: string }[];
    cta: string;
    scroll: string;
  };
  links: { linkedin: string; email: string; instagram: string };
  /** A line in his own words, lit up word by word, signed with his name. */
  statement: { quote: string; by: string };
  /** The developers he has worked with, in his order, under a small label and a short heading. */
  career: { kicker: string; heading: string; developers: string[] };
  advisory: { items: { title: string; text: string }[] };
  /** Anonymised deals supplied by the owner. The section is hidden while `items` is empty. */
  transactions: {
    kicker: string;
    heading: string;
    /** Project name, and optionally the kind of deal and the year, exactly as he gave them. */
    items: { title: string; detail?: string; year?: string }[];
  };
  international: {
    heading: string;
    /** How to use the globe: on desktop (hover), on phones (tap), and the swipe cue for the phone row. */
    hint: { hover: string; tap: string; swipe: string };
    countries: { name: string; cities: string[] }[];
  };
  /** Interviews and articles. Add more items as the owner supplies them. */
  press: {
    kicker: string;
    cta: string;
    items: { outlet: string; title: string; date: string; url: string }[];
  };
  consent: { text: string; accept: string; decline: string };
  close: { kicker: string; heading: string; text: string; cta: string; footer: string; location: string };
};
