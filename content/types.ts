export type Locale = "en" | "ar";

/** One calculator tab: its name, the input labels and the result labels. */
export type CalcTool<F extends string, R extends string> = {
  title: string;
  fields: Record<F, string>;
  results: Record<R, string>;
};

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
  /** Why invest in Dubai: a few headline facts, each with a public source (see CONTENT.md). */
  whyDubai: {
    kicker: string;
    heading: string;
    /** His points, in his order, grouped into the chapters of his brief; each chapter is a tab. */
    chapters: { title: string; items: { figure: string; label: string; text: string }[] }[];
    note: string;
  };
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
  /**
   * Real Estate Investment Advisory: a working calculator (rental yield, mortgage, payment plan).
   * Visitors enter their own figures; the button sends the result to him on WhatsApp.
   * Placeholders in `message`: {tool} and {figures}.
   */
  calculator: {
    kicker: string;
    heading: string;
    /** Accessible name for the currency switch. */
    currencyLabel: string;
    cta: string;
    note: string;
    /** Added to the note when EUR or GBP is chosen (fixed, approximate rates). */
    rateNote: string;
    message: string;
    yield: CalcTool<"price" | "rent" | "other", "net" | "gross" | "income">;
    mortgage: CalcTool<"price" | "down" | "rate" | "years", "monthly" | "loan" | "downAmount" | "interest" | "repaid">;
    plan: CalcTool<
      "price" | "booking" | "construction" | "months" | "post" | "postMonths",
      "monthly" | "bookingAmount" | "handover" | "postMonthly"
    >;
  };
  consent: { text: string; accept: string; decline: string };
  close: { kicker: string; heading: string; text: string; cta: string; footer: string; location: string };
};
