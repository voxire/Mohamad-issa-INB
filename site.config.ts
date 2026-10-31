/**
 * The ONLY place to edit contact details, links and stats.
 * Search for "TODO" before launch: every placeholder is marked.
 */
export const site = {
  url: "https://mohamadissa.com",

  // TODO: Mohamad's WhatsApp number, international format, digits only (e.g. "9715XXXXXXXX").
  whatsappNumber: "971500000000",

  // TODO: create this mailbox on the domain (Google Workspace or Zoho, MX records at GoDaddy).
  email: "contact@mohamadissa.com",

  // TODO: Google Analytics 4 measurement ID (e.g. "G-XXXXXXXXXX"). Empty = analytics and consent bar disabled.
  gaId: "" as string,

  linkedin: "https://www.linkedin.com/in/mohamadissa/",
  instagram: "https://www.instagram.com/issa.properties/",

  press: {
    url: "https://uaestories.com/how-mohamad-issa-turned-grit/",
  },

  /**
   * TODO: replace with the vectorised handwritten signature.
   * When `signaturePath` is set (an SVG path "d" string drawn in a 600×200 box),
   * the footer draws it; until then the name is set in italic as a stand-in.
   */
  signaturePath: "" as string,
} as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const isPlaceholder = {
  whatsapp: site.whatsappNumber === "971500000000",
  email: true, // mailbox not created yet
  analytics: site.gaId === "",
  signature: site.signaturePath === "",
};
