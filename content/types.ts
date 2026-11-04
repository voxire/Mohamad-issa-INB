export type Locale = "en" | "ar";

export type Dict = {
  locale: Locale;
  dir: "ltr" | "rtl";
  meta: { title: string; description: string };
  nav: { switchLabel: string; switchHref: string; switchLang: string; skip: string };
  whatsappMessage: string;
  /** The words the intro particles gather into at the end. */
  intro: { words: string };
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
  /** The developers he has worked with, in order, under one small label. */
  career: { kicker: string; developers: string[] };
  advisory: { items: { title: string; text: string }[] };
  /** Anonymised deals supplied by the owner. The section is hidden while `items` is empty. */
  transactions: {
    kicker: string;
    heading: string;
    items: { title: string; detail: string; year: string }[];
  };
  international: { heading: string; countries: { name: string; cities: string[] }[] };
  /** Interviews and articles. Add more items as the owner supplies them. */
  press: {
    kicker: string;
    cta: string;
    items: { outlet: string; title: string; date: string; url: string }[];
  };
  consent: { text: string; accept: string; decline: string };
  close: { kicker: string; heading: string; text: string; cta: string; footer: string; location: string };
};
