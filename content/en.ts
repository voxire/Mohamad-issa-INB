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
  intro: { words: "Let’s talk.", skip: { touch: "Tap to skip", click: "Click to skip" } },
  hero: {
    name: "Mohamad Issa",
    eyebrow: "Dubai & Global Real Estate | Investment Advisory",
    tagline: "A decade of experience. A personal approach to property investment.",
    positioning:
      "Helping investors identify opportunities in Dubai's residential and ultra-luxury property market, from individual acquisitions to bulk transactions.",
    stats: [
      { value: "11+", label: "Years in Dubai real estate" },
      { value: "$1B+", label: "In transactions" },
      { value: "Global", label: "International client network" },
    ],
    cta: "Let's Talk on WhatsApp",
    scroll: "Scroll",
  },
  links: { linkedin: "LinkedIn", email: "Email", instagram: "Instagram" },
  // His own words, from his Instagram caption (see CONTENT.md).
  statement: {
    quote: "From humble beginnings to a portfolio exceeding $1 billion.",
    by: "Mohamad Issa",
  },
  // Public facts, sourced in CONTENT.md (researched Nov 2026). Review the figures each year.
  whyDubai: {
    kicker: "Why Dubai",
    heading: "A market built for investors.",
    items: [
      { figure: "0%", label: "Personal income tax", text: "No tax on salary, rental income or capital gains for individuals." },
      { figure: "10 years", label: "Golden Visa", text: "Renewable residency for property investors from AED 2 million." },
      { figure: "6.5–7%", label: "Average gross rental yield", text: "Among the highest of any major city in 2026." },
      { figure: "$250B", label: "Real estate deals in 2025", text: "A record AED 917 billion, up 20% on 2024." },
      { figure: "USD peg", label: "Stable currency", text: "The dirham has been fixed at 3.6725 to the dollar since 1997." },
      { figure: "Top 5", label: "Safest cities", text: "UAE cities lead the 2026 Numbeo safety rankings." },
    ],
    note: "Public sources, 2025 and 2026. Not financial or tax advice.",
  },
  // The four developers he asked to list, in his order (owner, Nov 2026).
  career: {
    kicker: "2016 to present",
    heading: "With Dubai's leading developers.",
    developers: ["Damac Properties", "Arada Developments", "Sobha Realty", "Binghatti Holding"],
  },
  advisory: {
    items: [
      {
        title: "Off-plan acquisitions",
        text: "Early access to launches from Dubai's leading developers, with an honest view of every project.",
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
  // Hidden until the owner supplies real, anonymised deals.
  transactions: {
    kicker: "Selected transactions",
    heading: "A record, quietly kept.",
    // His deals, as he gave them (WhatsApp, Nov 2026). No sizes or years supplied.
    items: [
      { title: "Bugatti Residences by Binghatti", detail: "Bulk deal" },
      { title: "Mercedes-Benz Places by Binghatti", detail: "Multiple units" },
      { title: "Burj Khalifa", detail: "Commercial office" },
      { title: "Damac Hills", detail: "Villas, bulk deal" },
    ],
  },
  // His list and order, supplied by the owner (Nov 2026).
  international: {
    heading: "International Roadshows & Investor Meetings",
    hint: { hover: "Hover a country to explore", tap: "Tap a country to explore", swipe: "Swipe" },
    countries: [
      { name: "Russia", cities: ["Moscow", "Kaliningrad", "St. Petersburg"] },
      { name: "United States", cities: ["Los Angeles", "Miami", "Texas"] },
      { name: "United Kingdom", cities: ["London", "Manchester"] },
      { name: "Saudi Arabia", cities: ["Riyadh", "Jeddah"] },
      { name: "Switzerland", cities: ["Zurich", "Geneva"] },
      { name: "Turkey", cities: ["Istanbul", "Bodrum"] },
      { name: "Singapore", cities: [] },
      { name: "Lebanon", cities: [] },
      { name: "Italy", cities: [] },
      { name: "Iraq", cities: [] },
    ],
  },
  // He has no interviews to highlight (Nov 2026), so the press section stays hidden until items are added.
  press: {
    kicker: "Press",
    cta: "Read the feature",
    items: [],
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
