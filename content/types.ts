export type Locale = "en" | "ar";

export type Dict = {
  locale: Locale;
  dir: "ltr" | "rtl";
  meta: { title: string; description: string };
  nav: { switchLabel: string; switchHref: string; switchLang: string; skip: string };
  whatsappMessage: string;
  hero: {
    name: string;
    nameAlt: string;
    eyebrow: string;
    tagline: string;
    positioning: string;
    stats: { value: string; label: string }[];
    cta: string;
    scroll: string;
  };
  links: { linkedin: string; email: string; instagram: string };
  statement: { kicker: string; quote: string; body: string };
  about: { kicker: string; heading: string; paragraphs: string[] };
  career: {
    kicker: string;
    heading: string;
    present: string;
    items: { year: string; role: string; company: string }[];
  };
  advisory: { kicker: string; heading: string; items: { title: string; text: string }[] };
  company: {
    kicker: string;
    heading: string;
    items: { key: string; name: string; note: string }[];
  };
  international: { kicker: string; heading: string; text: string; cities: string[] };
  gallery: { kicker: string; heading: string; hint: string; captions: Record<string, string> };
  press: { kicker: string; outlet: string; title: string; date: string; cta: string };
  consent: { text: string; accept: string; decline: string };
  close: { kicker: string; heading: string; text: string; cta: string; footer: string; location: string };
};
