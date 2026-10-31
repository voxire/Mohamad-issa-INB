"use client";

import { useEffect, useState } from "react";
import type { Dict } from "@/content/types";
import { site } from "@/site.config";

const KEY = "mi-consent";

function loadGA(id: string) {
  if (document.getElementById("ga")) return;
  const s = document.createElement("script");
  s.id = "ga";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", id, { anonymize_ip: true });
}

/**
 * Google Analytics, loaded only after the visitor accepts.
 * Disabled entirely while site.gaId is empty.
 */
export function Analytics({ t }: { t: Dict }) {
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    if (!site.gaId) return;
    let choice: string | null = null;
    try {
      choice = localStorage.getItem(KEY);
    } catch {}
    if (choice === "yes") loadGA(site.gaId);
    else if (choice !== "no") {
      const timer = setTimeout(() => setAsk(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!site.gaId || !ask) return null;

  const decide = (yes: boolean) => {
    try {
      localStorage.setItem(KEY, yes ? "yes" : "no");
    } catch {}
    if (yes) loadGA(site.gaId);
    setAsk(false);
  };

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label={t.consent.text}>
      <p>{t.consent.text}</p>
      <div className="consent__actions label">
        <button type="button" className="textlink" onClick={() => decide(false)}>
          {t.consent.decline}
        </button>
        <button type="button" className="consent__accept" onClick={() => decide(true)}>
          {t.consent.accept}
        </button>
      </div>
    </div>
  );
}
