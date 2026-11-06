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
  // His points from his market brief, in his order (owner, Nov 2026). Sources in CONTENT.md; review yearly.
  whyDubai: {
    kicker: "Why Dubai",
    heading: "A market built for investors.",
    items: [
      { chapter: "Stable", figure: "Role Model City", label: "United Nations recognition", text: "Named a resilience Role Model City by the UN Office for Disaster Risk Reduction. Recovery here is designed, not improvised." },
      { chapter: "Stable", figure: "79.4%", label: "Non-oil share of UAE GDP, Q1 2026", text: "The UAE has grown through every shock since 2008, with only two contractions in eighteen years." },
      { chapter: "Stable", figure: "No. 1", label: "Wealth mobility, 2026", text: "The UAE attracts more mobile wealth than any other country, scoring 85.3 out of 100, ahead of Singapore." },
      { chapter: "Stable", figure: "3 of 5", label: "Of the world's safest cities are in the UAE", text: "Abu Dhabi, Dubai and Sharjah rank in Numbeo's 2025 top five. Dubai scores 83.8." },
      { chapter: "Stable", figure: "0%", label: "Income, capital gains and property tax", text: "VAT is 5% and corporate tax 9%. The return you earn is the return you keep." },
      { chapter: "Stable", figure: "406 km", label: "Habshan to Fujairah pipeline", text: "UAE crude reaches world markets without passing through the Strait of Hormuz." },
      { chapter: "People keep coming", figure: "19.6M", label: "International overnight visitors, 2025", text: "Up every year since 2022, with 81% hotel occupancy and 95.2 million airport passengers." },
      { chapter: "People keep coming", figure: "75%", label: "Of the world within an eight-hour flight", text: "Connectivity is why people and businesses keep arriving, and why they stay." },
      { chapter: "People keep coming", figure: "2×", label: "Population growth every decade", text: "From 370,786 residents in 1985 to 4.58 million in 2025, with no decade below 85% growth." },
      { chapter: "People keep coming", figure: "+332,100", label: "New residents in 2025", text: "Against about 39,700 homes handed over in the same year." },
      { chapter: "People keep coming", figure: "157,429", label: "New residents, first half of 2026", text: "Dubai is still adding the population of a mid-sized town every six months." },
      { chapter: "People keep coming", figure: "70%", label: "Of the Fortune 500 run their region from Dubai", text: "A business can be set up in about four days. 71,830 new companies joined Dubai Chamber in 2025." },
      { chapter: "People keep coming", figure: "10 years", label: "Golden Visa from AED 2 million in property", text: "Residency for the whole family. A two-year investor visa has no minimum for a sole buyer." },
      { chapter: "Property", figure: "AED 2,020", label: "Average price per sq ft, January to August 2026", text: "Up 3.2% on 2025. Dubai property has recovered from every downturn in its history." },
      { chapter: "Where Dubai is heading", figure: "+70%", label: "Transaction growth targeted by 2033", text: "Three government plans, one direction: the 2040 Urban Master Plan, Agenda D33 and the Real Estate Strategy 2033." },
      { chapter: "Where Dubai is heading", figure: "AED 300bn", label: "Industry's target share of UAE GDP by 2031", text: "Operation 300bn: every factory brings jobs, residents and demand for homes." },
      { chapter: "Where Dubai is heading", figure: "55%", label: "Of residents within 800 m of a main station by 2040", text: "With 60% of the emirate kept as nature reserves, across five urban centres." },
      { chapter: "Where Dubai is heading", figure: "13%", label: "Of the urban footprint still available to build", text: "Land is allocated by plan, so new supply cannot flood the market." },
      { chapter: "Where Dubai is heading", figure: "2032", label: "Dubai rail network plan", text: "Metro lines, Etihad Rail and air taxis: infrastructure arrives ahead of demand, not behind it." },
      { chapter: "Where Dubai is heading", figure: "80 km", label: "A new fourth corridor, approved September 2026", text: "Twelve lanes from Abu Dhabi to Sharjah via Al Maktoum Airport, opening new land for growth." },
    ],
    note: "Sources: FCSC, Dubai Statistics Centre, DET, DLD, Henley & Partners, Numbeo, ICP, ADNOC, dubai2040.ae. Not financial or tax advice.",
    swipe: "Swipe",
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
