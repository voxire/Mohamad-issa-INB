"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * One client component drives all motion:
 *  - Lenis smooth scrolling
 *  - [data-reveal] → adds .is-in when the element enters the viewport
 *  - [data-parallax="0.08"] → gentle vertical drift on images
 *  - header and mobile WhatsApp dock state
 * Everything is skipped under prefers-reduced-motion (content stays visible).
 */
export function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    // Reveal on scroll. Fully clipped elements ("mask") never report as intersecting,
    // so we watch their parent instead and reveal every element mapped to it.
    const targets = new Map<Element, Element[]>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          targets.get(e.target)?.forEach((el) => el.classList.add("is-in"));
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal], .signature").forEach((el) => {
      const watch = el.dataset.reveal === "mask" && el.parentElement ? el.parentElement : el;
      if (!targets.has(watch)) targets.set(watch, []);
      targets.get(watch)!.push(el);
      io.observe(watch);
    });

    if (reduce) {
      document.querySelectorAll<HTMLVideoElement>("video").forEach((v) => v.pause());
    }

    const header = document.querySelector(".header");
    const dock = document.querySelector(".dock");
    const hero = document.querySelector(".hero");
    const close = document.querySelector(".close__cta");
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));

    let lenis: Lenis | null = null;
    if (!reduce) {
      lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    }

    let frame = 0;
    const tick = (time: number) => {
      lenis?.raf(time);
      const vh = window.innerHeight;
      const y = window.scrollY;

      header?.classList.toggle("is-scrolled", y > 40);

      if (dock && hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        const closeTop = close ? close.getBoundingClientRect().top : Infinity;
        dock.classList.toggle("is-visible", heroBottom < 0 && closeTop > vh);
      }

      if (!reduce) {
        for (const img of parallax) {
          const r = img.parentElement!.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) continue;
          const speed = parseFloat(img.dataset.parallax || "0");
          const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 roughly
          img.style.transform = `translate3d(0, ${(-progress * speed * 100).toFixed(2)}px, 0) scale(1.12)`;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // In-page anchors go through Lenis for a smooth glide
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || !lenis) return;
      const target = document.querySelector(a.getAttribute("href")!);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: -40 });
      }
    };
    document.addEventListener("click", onClick);
    root.classList.add("motion-ready");

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      lenis?.destroy();
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
