# mohamadissa.com

A static, bilingual (EN/AR) personal site for Mohamad Issa. Built with Next.js 16 and exported as plain HTML.

```bash
npm install
npm run dev          # http://localhost:3000  (Arabic at /ar)
npm run build        # writes the static site to /out
```

Read `CLAUDE.md` before changing anything. Copy is in `content/`, and contact details are in `site.config.ts`.

## Media pipeline
- `npm run media:images` regenerates WebP sizes from `assets/` into `public/media/` (needs Python + Pillow).
- `npm run media:video` regrades the hero loop from `assets/video/marina.mp4` (needs ffmpeg). Source: Pexels #34529274, free licence.
- `python3 scripts/make-og.py` rebuilds the 1200×630 link preview image.

## Launch checklist
- [ ] `site.config.ts`: real WhatsApp number (`whatsappNumber`)
- [ ] Create `contact@mohamadissa.com` (Google Workspace or Zoho) and add its MX records at GoDaddy
- [ ] `site.config.ts`: GA4 measurement ID (`gaId`). The consent bar switches on automatically.
- [ ] `site.config.ts`: signature SVG path (`signaturePath`), from a photo of his signature
- [ ] Arabic copy reviewed by Mohamad or a native speaker (`content/ar.ts`)
- [ ] Mohamad approves the stats wording ("11+ years", "AED 3B+ in sales"). See CONTENT.md for the public record.
- [ ] Replace Instagram photos with originals when available (`assets/`, then `npm run media:images`)
- [ ] Deploy: push to GitHub, import to Vercel (framework preset Next.js; static export is automatic)
- [ ] GoDaddy DNS: `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com` (confirm the values in Vercel's domain screen)
- [ ] Put `https://mohamadissa.com` in his Instagram and LinkedIn bios
