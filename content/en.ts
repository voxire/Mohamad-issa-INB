import type { Dict } from "./types";

/**
 * English copy. Hero text follows Mohamad's own brief verbatim.
 * Facts are sourced in CONTENT.md. Do not add claims that aren't there.
 */
export const en: Dict = {
  locale: "en",
  dir: "ltr",
  meta: {
    title: "Mohamad Issa | Dubai Real Estate & Investment Advisory",
    description:
      "Helping investors identify opportunities in Dubai's residential and ultra-luxury property market, from individual acquisitions to bulk transactions.",
  },
  nav: { switchLabel: "العربية", switchHref: "/ar/", switchLang: "ar", skip: "Skip to content" },
  whatsappMessage:
    "Hi Mohamad, I visited your website and would like to discuss property investment opportunities in Dubai.",
  hero: {
    name: "Mohamad Issa",
    nameAlt: "محمد عيسى",
    eyebrow: "Dubai Real Estate | Investment Advisory",
    tagline: "A decade of experience. A personal approach to property investment.",
    positioning:
      "Helping investors identify opportunities in Dubai's residential and ultra-luxury property market, from individual acquisitions to bulk transactions.",
    stats: [
      { value: "11+", label: "Years in Dubai real estate" },
      { value: "AED 3B+", label: "In sales" },
      { value: "Global", label: "International client network" },
    ],
    cta: "Let's Talk on WhatsApp",
    scroll: "Scroll",
  },
  links: { linkedin: "LinkedIn", email: "Email", instagram: "Instagram" },
  statement: {
    kicker: "Philosophy",
    quote: "Success isn't about noise.",
    body: "It's about consistency, discipline, and faith in what you do.",
  },
  about: {
    kicker: "The story",
    heading: "From Lebanon to Dubai.",
    paragraphs: [
      "Mohamad Issa arrived in Dubai in 2015 with no safety net and a simple belief: that hard work, done honestly, compounds.",
      "Over the decade that followed, he advised investors and led sales teams at some of the city's most respected developers, rising from relationship manager to vice president of sales.",
      "His approach has never changed. Transparency first, a clear view of the market, and advice built around each investor's long-term goals, whether that is a single residence or an entire portfolio.",
    ],
  },
  career: {
    kicker: "Career",
    heading: "A decade at the centre of Dubai's market.",
    present: "Present",
    items: [
      { year: "2016", role: "Relationship Manager", company: "DAMAC Properties" },
      { year: "2017", role: "Sales Manager", company: "Azizi Developments" },
      { year: "2019", role: "Sales Manager", company: "Arada" },
      { year: "2021", role: "Director of Sales, AVP", company: "Sobha Realty" },
      { year: "2025", role: "Vice President of Sales", company: "The Heart of Europe" },
      { year: "2026", role: "Sales Director", company: "Binghatti" },
    ],
  },
  advisory: {
    kicker: "Advisory",
    heading: "Considered advice, from first viewing to final signature.",
    items: [
      {
        title: "Off-plan acquisitions",
        text: "Early access to launches from Dubai's leading developers, with an honest view of every project.",
      },
      {
        title: "Ready and secondary",
        text: "Completed residences selected for location, yield and long-term value.",
      },
      {
        title: "Bulk transactions",
        text: "Multi-unit and portfolio purchases negotiated as a single, discreet transaction.",
      },
      {
        title: "Portfolio strategy",
        text: "A long-term view across Dubai's residential and ultra-luxury segments.",
      },
    ],
  },
  international: {
    kicker: "International",
    heading: "A client network that spans continents.",
    text: "Investor roadshows and private meetings across",
    cities: ["London", "Moscow", "St Petersburg", "Istanbul", "Singapore", "Dubai"],
  },
  gallery: {
    kicker: "In person",
    heading: "Wherever the opportunity is.",
    hint: "Swipe",
    captions: { singapore: "Singapore", "london-sofa": "London", "london-street": "London", "terrace-coat": "Istanbul" },
  },
  press: {
    kicker: "Press",
    outlet: "UAE Stories",
    title: "How Mohamad Issa Turned Grit into Real Estate Gold",
    date: "August 2025",
    cta: "Read the feature",
  },
  consent: {
    text: "This site uses analytics cookies to understand how it is visited.",
    accept: "Accept",
    decline: "Decline",
  },
  close: {
    kicker: "By private appointment",
    heading: "Let's talk.",
    text: "For private enquiries, investment opportunities and partnerships.",
    cta: "Let's Talk on WhatsApp",
    footer: "Mohamad Issa",
    location: "Dubai, United Arab Emirates",
  },
};
