import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import type { Dict } from "@/content/types";
import { site } from "@/site.config";

import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource-variable/manrope";
import "@fontsource/noto-naskh-arabic/400.css";
import "@fontsource/noto-naskh-arabic/500.css";
import "@/app/globals.css";

export const viewport: Viewport = {
  themeColor: "#121212",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export function buildMetadata(t: Dict): Metadata {
  const path = t.locale === "en" ? "/" : "/ar/";
  return {
    metadataBase: new URL(site.url),
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: path, languages: { en: "/", ar: "/ar/" } },
    openGraph: {
      type: "profile",
      url: path,
      title: t.meta.title,
      description: t.meta.description,
      locale: t.locale === "en" ? "en_GB" : "ar_AE",
      images: [{ url: "/media/og.jpg", width: 1200, height: 630, alt: t.hero.name }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: ["/media/og.jpg"] },
    icons: { icon: "/icon.svg" },
  };
}

/** The <html> shell shared by both locales. */
export function Document({ t, children }: { t: Dict; children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mohamad Issa",
    alternateName: "محمد عيسى",
    url: site.url,
    image: `${site.url}/media/portrait-800.webp`,
    description: t.meta.description,
    address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
    sameAs: [site.linkedin, site.instagram],
  };
  return (
    <html lang={t.locale} dir={t.dir} suppressHydrationWarning>
      <head>
        {/* Gate reveal animations on JS so content is never hidden without it */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preload" as="image" href="/media/hero-poster.jpg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
