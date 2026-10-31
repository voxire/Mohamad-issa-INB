import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource-variable/manrope";
import "@fontsource/noto-naskh-arabic/400.css";
import "./globals.css";
import { Monogram } from "@/components/ui";

export const metadata: Metadata = {
  title: "Mohamad Issa",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body>
        <main
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            padding: "var(--gutter)",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
              <Monogram />
            </div>
            <h1 className="display" style={{ fontSize: "clamp(48px, 8vw, 104px)" }}>
              This page has moved on.
            </h1>
            <p className="lede" lang="ar" dir="rtl" style={{ marginTop: 18 }}>
              هذه الصفحة غير موجودة.
            </p>
            <p style={{ marginTop: 44 }}>
              <a className="btn btn--ghost" href="/">
                Mohamad Issa
              </a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
