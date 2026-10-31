# mohamadissa.com: creative brief (locked 31 Oct 2026)

Purpose: a personal link for his Instagram and LinkedIn bios. It is about Mohamad, not his employer. **No mention of Binghatti anywhere.** Binghatti's hypercar look is a mood reference only.

## Visual
- Look: B "Hypercar noir" (black, chrome light streaks, cinematic) + C "Champagne monogram" (Didone serif, MI monogram, Arabic).
- Palette (from his brief): charcoal background, warm beige text, a restrained light-blue accent (this stands in for the chrome).
  - Starting tokens: `#121212` charcoal · `#E8DCC8` beige · `#9DB8CC` light blue
- Type: a wide sans for the name (Syncopate-like), Bodoni Moda for headings and italics, Inter for small caps and body. Arabic serif for RTL.
- Motion: cinematic. Smooth scroll, parallax photos, a pinned scroll story, a magnetic WhatsApp button, text reveals.
- Signature: MI monogram (top corner and favicon) + his real handwritten signature, vectorised, which draws itself in the footer.

## Hero (first screen = his brief exactly)
- Background: a 12s graded cut of 2–3 free clips (night aerial, then light streaks, then tower), desaturated, cool blue tint, ~50% speed, charcoal veil, muted, looped.
  - Candidates: Pexels 30495104 (night aerial), 11256291 (driving at night), 34922677 (Burj Khalifa night); Mixkit 39451. Confirm 4K and license before download.
  - Fallback if the footage isn't good enough: a 2s animated name reveal that settles into the portrait layout.
- Copy:
  - MOHAMAD ISSA
  - Dubai Real Estate | Investment Advisory
  - A decade of experience. A personal approach to property investment.
  - Helping investors identify opportunities in Dubai's residential and ultra-luxury property market, from individual acquisitions to bulk transactions.
  - 11+ years in Dubai real estate · AED 3B+ in sales · International client network (verified OK to publish)
  - [Let's Talk on WhatsApp] (visible immediately on mobile)
  - Small links: LinkedIn · Email
- WhatsApp prefill: "Hi Mohamad, I visited your website and would like to discuss property investment opportunities in Dubai."

## Scroll story (below the first screen)
1. About / his story: 3–4 lines in his voice
2. Services strip: off-plan, secondary, bulk transactions, portfolio advisory (one line each, no listings)
3. Photo gallery: 4–6 professional photos (Instagram versions as placeholders, originals later)
4. Press and media: logos and headlines with links
5. Close: WhatsApp CTA, signature, LinkedIn · Email · Instagram

## Language
Full EN/AR toggle with a mirrored RTL layout. Arabic drafted by us, approved by a native speaker or Mohamad.

## Build
Next.js (App Router), deployed on Vercel, his own domain mohamadissa.com pointed to Vercel.

## Open inputs (see CONTENT.md for what has been gathered)
- [ ] WhatsApp number (international format): not public
- [x] LinkedIn URL: linkedin.com/in/mohamadissa
- [ ] Public email: not public
- [x] Press: UAE Stories, Aug 2025 (the only one found)
- [x] Photos: LinkedIn studio portrait + 9 IG photos in assets/
- [ ] His handwritten signature (photo on white paper)
- [x] About material: Lebanese, in Dubai since 2015, DAMAC → Azizi → Arada → Sobha → Heart of Europe → Binghatti
- [ ] Confirm stats wording (10+ yrs, AED 3B+ portfolio vs AED 2B+ sales)
- [ ] GoDaddy DNS access at launch
