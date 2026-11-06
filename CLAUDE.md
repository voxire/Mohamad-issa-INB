# CLAUDE.md: mohamadissa.com

A personal website for **Mohamad Issa**, a Dubai luxury real estate sales leader. It is the link in his Instagram and LinkedIn bios. It must look and feel expensive: quiet, confident, cinematic, never busy.

Read `BRIEF.md` (agreed creative decisions) and `CONTENT.md` (gathered facts and sources) before changing anything.

## Stack
- Next.js 16 (App Router) with `output: "export"`. The site is fully static: no server, no API routes, no runtime data fetching.
- TypeScript, React 19. Plain CSS in one file (`app/globals.css`, sectioned by component). No Tailwind, no UI kit.
- Fonts are self-hosted via `@fontsource`: Cormorant Garamond (display), Manrope (UI), Noto Naskh Arabic (AR). Nothing loads from Google at runtime.
- Motion: `gsap` + `ScrollTrigger` (scroll choreography, intro) and `lenis` (smooth scroll, driven by the GSAP ticker). Simple reveals stay on IntersectionObserver + CSS. Don't add other animation libraries without asking.
- Images are pre-optimised into `public/media/` (WebP, several widths) because static export disables `next/image` optimisation.
- Hosting: Vercel (static). Domain mohamadissa.com is registered at GoDaddy.

## Commands
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to /out
npx serve out      # preview the exported site
```

## Structure
```
app/(en)/layout.tsx, page.tsx        → /       (lang="en", dir="ltr")
app/(ar)/ar/layout.tsx, page.tsx     → /ar     (lang="ar", dir="rtl")
app/globals.css                      → all styles, design tokens at the top
components/Site.tsx                  → every section of the page, in order
components/Document.tsx              → <html> shell, fonts, metadata, JSON-LD
components/Motion.tsx                → the only motion engine (Lenis, reveals, parallax, dock)
components/gl/                       → plain WebGL 3D (no three.js): particles.ts (intro), globe.ts (International), core.ts
components/Magnetic.tsx, ui.tsx      → small primitives (Photo, Kicker, Monogram, Arrow)
content/en.ts, content/ar.ts         → every user-facing string
site.config.ts                       → contact details, links, stats: the ONLY place to edit them
assets/                              → raw source media (not deployed)
public/media/                        → optimised media (deployed)
scripts/                             → media pipeline (images, video grading)
```

## Design rules (non-negotiable)
- **Palette (his brief):** charcoal `#121212` background, warm beige `#E8DCC8` text, restrained light blue `#9DB8CC` accent. The accent is used sparingly: hairlines, the monogram, small labels. Never as large fills.
- **Typography:** large, light-weight Cormorant for names and statements; Manrope at small sizes, uppercase, wide tracking (0.2–0.32em) for labels. Body text is never bold. Use at most two weights per family.
- **Space is the luxury.** Every section is one full screen (`min-height: 100svh`, content centred) on desktop and phones, in EN and AR; check new content still fits. One idea per screen. If a section feels full, remove something.
- **Guidance cues** stay quiet (small labels, accent blue) and fade once used: "Scroll" with a travelling line on the hero, "Hover/Tap a country to explore" on the globe, "Swipe" on the phone row, "Tap/Click to skip" on the intro. Wording switches between mouse and touch via `.cue-mouse` / `.cue-touch`.
- **Motion (Apple-style, precise and scroll-driven):** slow and eased (600–1400ms, `cubic-bezier(.22,1,.36,1)`). The set pieces are: the opening intro (once per tab session, tap to skip: particles form his portrait, a tower, a globe and "Let's talk"), the living hero (name sheen every ~10s, pointer depth on desktop, stats count up), the pinned hero zoom-out (unpinned and lighter on phones), the quote lighting up word by word, the developers screen (it holds while each developer arrives large in the centre and settles into the list, with a 01 / 04 counter and a filling hairline; hover lights a name once all four are in), and the investor globe in the International section (it turns slowly from Dubai to Europe to the Americas; his countries sit either side of it, a swipe row on phones, and hovering or tapping a country or city turns the globe to it, lights up that place, redraws its arcs, pulses and labels its pins; the earth always stays whole inside its glow, never cropped; a click locks the focus, the section holds on screen briefly on desktop). Plus reveals and magnetic buttons. Normal cursor. Nothing bounces or spins; only the hero video, the name sheen, the globe's arcs and the guidance cues (until used) loop.
- **3D:** plain WebGL in `components/gl/`, no three.js. Phones get fewer points. The intro runs about 4.5 seconds. The globe is the real earth at night (NASA Black Marble, graded to the palette), ray-traced on a single quad; it is lazy-loaded near its section and renders only while on screen. If WebGL is unavailable, the intro falls back to the name alone and the globe is hidden. Under `prefers-reduced-motion` everything shows in its final state.
- **No stock-template tells:** no icons in circles, no card grids with shadows, no gradients except the dark veil over the video and photo masks, no emojis.
- **WhatsApp button** must be visible on the first mobile screen without scrolling, and stays reachable (sticky on mobile after the hero).
- Every component must work in RTL. Use logical CSS properties (`margin-inline-start`, `inset-inline-end`, `text-align: start`).

## Content rules
- All copy lives in `content/en.ts` and `content/ar.ts`. Never hardcode user-facing text in components.
- Every EN string needs an AR counterpart. AR is a draft until Mohamad or a native speaker approves it (see `content/ar.ts` header).
- Hero copy follows Mohamad's brief verbatim (see `BRIEF.md`).
- Binghatti appears **only** where he named it (Nov 2026): "Binghatti Holding" in the developers list and his Binghatti projects in Selected transactions. Never in the hero, meta tags or elsewhere.
- The owner removed the story, gallery, "In good company" section and all lifestyle photos (Nov 2026). Do not add them back unless he asks, and never pull photos of him or others from the web.
- Sections for selected transactions and press render only when `content/en.ts` and `ar.ts` have items. Add only what he supplies (transactions: his four deals; press: empty, he has no interviews to highlight).
- Do not use family or children photos, or company team shots. Approved photos are listed in `CONTENT.md`.
- Never invent achievements, clients, awards or press. If a fact is not in `CONTENT.md` or confirmed by the owner, it doesn't ship.
- Placeholders (WhatsApp number, email, signature) are marked `TODO` in `site.config.ts`. Search for `TODO` before launch.

## Working rules
- Plan before multi-file changes; keep the site to one page per locale.
- Keep the JS bundle small. Prefer CSS over JS for motion.
- Check every change at 390px (mobile), 1440px (desktop), in both EN and AR.
- Lighthouse targets: Performance ≥ 90 on mobile, Accessibility ≥ 95.
- No secrets in the repo. There is no backend, so there should be none.

## Git workflow
- **Never commit secrets.** No `.env`, credentials, tokens or keys. If one is already committed, stop and tell the owner immediately. Do not quietly rewrite history.

### Commit messages (every commit, every session, no exceptions)
1. **Atomic commits.** One commit per file or logical unit. Never batch unrelated changes. Each migrated file, bug fix, config change, i18n update and test change gets its own commit.
2. **Split in dependency order:** types → API → hook/service → component → test → i18n (EN) → i18n (AR). Each is a separate commit.
3. **Separate fix commits.** A bug found while doing something else gets its own commit, never folded into feature work.
4. **Format:** short imperative subject, no conventional-commit prefixes (no `feat:`, `fix:`, `chore:`).
5. **No `Co-Authored-By` trailers.** The owner is the sole author.
6. **Never use em dashes in commit messages**, and do not substitute a hyphen. Restructure the sentence or use a colon.
7. **Always commit and push** once a change is complete and the build passes (the owner's standing instruction). A push to `main` deploys to production on Vercel automatically.
