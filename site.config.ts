/**
 * The ONLY place to edit contact details, links and stats.
 * Search for "TODO" before launch: every placeholder is marked.
 */
export const site = {
  url: "https://mohamadissa.com",

  // Mohamad's WhatsApp number, international format, digits only (supplied Nov 2026).
  whatsappNumber: "971561969292",

  // His chosen address (Nov 2026). TODO: he is creating this mailbox; confirm it receives mail before launch.
  email: "contact@mohamadissa.com",

  // TODO: Google Analytics 4 measurement ID (e.g. "G-XXXXXXXXXX"). Empty = analytics and consent bar disabled.
  gaId: "" as string,

  linkedin: "https://www.linkedin.com/in/mohamadissa/",
  instagram: "https://www.instagram.com/issa.properties/",

  press: {
    url: "https://uaestories.com/how-mohamad-issa-turned-grit/",
  },

  /**
   * Calculator currencies: dirhams per unit. The site has no server, so these are fixed.
   * USD is the official peg (exact). EUR and GBP are Wise mid-market rates on 16 Nov 2026,
   * shown to visitors as approximate. Refresh them now and then.
   */
  currencies: { AED: 1, USD: 3.6725, EUR: 4.042, GBP: 4.896 },
} as const;

export type Currency = keyof typeof site.currencies;

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const isPlaceholder = {
  whatsapp: false, // his real number, supplied Nov 2026
  email: true, // he is creating contact@mohamadissa.com; set to false once it receives mail
  analytics: site.gaId === "",
  signature: false, // his handwritten signature, supplied 16 Nov 2026 (public/media/signature-*.webp)
};
