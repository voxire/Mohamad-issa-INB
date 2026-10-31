"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The single motion engine.
 *  - Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger stays in sync
 *  - Opening intro (once per tab session): monogram draws, name rises, curtain lifts
 *  - Living hero: chrome sheen on the name (CSS), pointer depth on portrait and city, stats count up
 *  - Apple-style pinned zoom-out of the hero on scroll (lighter, unpinned on phones)
 *  - Scroll storytelling: quote lights up word by word, career line draws and lights each year
 *  - [data-reveal] reveals (IntersectionObserver), [data-parallax] drift, header and dock state
 * Under prefers-reduced-motion everything is shown in its final state and nothing moves.
 */
export function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    /* ---------- Reveals ---------- */
    // Fully clipped elements ("mask") never report as intersecting, so watch their parent.
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
    const observe = (scope: ParentNode, filter: (el: Element) => boolean) =>
      scope.querySelectorAll<HTMLElement>("[data-reveal], .signature").forEach((el) => {
        if (!filter(el)) return;
        const watch = el.dataset.reveal === "mask" && el.parentElement ? el.parentElement : el;
        if (!targets.has(watch)) targets.set(watch, []);
        targets.get(watch)!.push(el);
        io.observe(watch);
      });
    const inHero = (el: Element) => !!el.closest(".hero");
    observe(document, (el) => !inHero(el)); // the hero waits for the intro

    if (reduce) document.querySelectorAll<HTMLVideoElement>("video").forEach((v) => v.pause());

    /* ---------- Smooth scroll ---------- */
    const lenis = reduce ? null : new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    const raf = (time: number) => lenis?.raf(time * 1000);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    /* ---------- Hero start (after intro) ---------- */
    const hero = document.querySelector<HTMLElement>(".hero");
    const startHero = () => {
      if (hero) observe(hero, () => true);
      document.querySelector(".hero__name")?.classList.add("is-live");
      if (!reduce) countStats();
    };

    /* ---------- Intro ---------- */
    const intro = document.querySelector<HTMLElement>(".intro");
    const introVisible = intro && getComputedStyle(intro).display !== "none";
    let introTl: gsap.core.Timeline | null = null;
    const finishIntro = () => {
      try {
        sessionStorage.setItem("mi-intro", "1");
      } catch {}
      root.classList.add("intro-seen");
      lenis?.start();
      startHero();
      ScrollTrigger.refresh();
    };
    if (introVisible && intro && !reduce) {
      lenis?.stop();
      const ring = intro.querySelector(".intro__ring");
      introTl = gsap
        .timeline({ defaults: { ease: "power3.out" }, onComplete: finishIntro })
        .to(ring, { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" })
        .to(".intro__mi", { opacity: 1, duration: 0.6 }, 0.45)
        .to(".intro__char", { y: "0%", duration: 0.9, stagger: 0.035 }, 0.45)
        .to(".intro__line", { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, 1.0)
        .to(".intro__mark, .intro__name, .intro__line", { y: -30, opacity: 0, duration: 0.6, ease: "power2.in" }, 1.75)
        .to(intro, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.95, ease: "power4.inOut" }, 1.9);
      const skip = () => introTl?.timeScale(5);
      intro.addEventListener("pointerdown", skip, { once: true });
      window.addEventListener("keydown", skip, { once: true });
    } else {
      root.classList.add("intro-seen");
      startHero();
    }

    /* ---------- Stats count up ---------- */
    function countStats() {
      document.querySelectorAll<HTMLElement>(".stats__value").forEach((el, i) => {
        const text = el.textContent || "";
        const m = text.match(/\d+(?:\.\d+)?/);
        if (!m || m.index === undefined) return;
        const [pre, post, target] = [text.slice(0, m.index), text.slice(m.index + m[0].length), parseFloat(m[0])];
        const o = { v: 0 };
        el.textContent = `${pre}0${post}`;
        gsap.to(o, {
          v: target,
          duration: 1.8,
          delay: 1.0 + i * 0.12,
          ease: "power2.out",
          onUpdate: () => (el.textContent = `${pre}${Math.round(o.v)}${post}`),
        });
      });
    }

    if (!reduce) {
      /* ---------- Living hero: pointer depth (desktop) ---------- */
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const img = document.querySelector(".hero__portrait img");
        const vid = document.querySelector(".hero__video");
        if (!img || !vid || !hero) return;
        gsap.set(vid, { scale: 1.08 });
        const px = gsap.quickTo(img, "x", { duration: 1.4, ease: "power3.out" });
        const py = gsap.quickTo(img, "y", { duration: 1.4, ease: "power3.out" });
        const vx = gsap.quickTo(vid, "x", { duration: 2.2, ease: "power3.out" });
        const vy = gsap.quickTo(vid, "y", { duration: 2.2, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          px(nx * 18);
          py(ny * 10);
          vx(nx * -26);
          vy(ny * -14);
        };
        hero.addEventListener("pointermove", move);
        return () => hero.removeEventListener("pointermove", move);
      });

      /* ---------- Hero pinned zoom-out ---------- */
      mm.add("(min-width: 861px)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "+=75%", pin: true, scrub: 0.8 } })
          .to(".hero__media", { clipPath: "inset(10% 6% 10% 6% round 6px)", ease: "none" }, 0)
          .to(".hero__copy", { y: -90, opacity: 0, ease: "none" }, 0)
          .to(".hero__portrait", { y: 40, scale: 0.94, ease: "none" }, 0);
      });
      mm.add("(max-width: 860px)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } })
          .to(".hero__media", { clipPath: "inset(6% 4% 6% 4% round 4px)", ease: "none" }, 0)
          .to(".hero__copy", { y: -40, opacity: 0.2, ease: "none" }, 0);
      });

      /* ---------- Quote, word by word ---------- */
      const words = gsap.utils.toArray<HTMLElement>(".statement__quote .w");
      if (words.length) {
        gsap.fromTo(
          words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.12,
            ease: "none",
            scrollTrigger: { trigger: ".statement__quote", start: "top 82%", end: "bottom 42%", scrub: true },
          },
        );
      }

      /* ---------- Career line ---------- */
      const wrap = document.querySelector(".timeline-wrap");
      if (wrap) {
        gsap.fromTo(
          ".timeline__line",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: wrap, start: "top 62%", end: "bottom 62%", scrub: 0.5 } },
        );
        gsap.utils.toArray<HTMLElement>(".timeline__row").forEach((row) =>
          ScrollTrigger.create({
            trigger: row,
            start: "top 62%",
            onEnter: () => row.classList.add("is-active"),
            onLeaveBack: () => row.classList.remove("is-active"),
          }),
        );
      }
    } else {
      document.querySelectorAll(".timeline__row").forEach((r) => r.classList.add("is-active"));
    }

    /* ---------- Per-frame: header, dock, image parallax ---------- */
    const header = document.querySelector(".header");
    const dock = document.querySelector(".dock");
    const close = document.querySelector(".close__cta");
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const frame = () => {
      const vh = window.innerHeight;
      header?.classList.toggle("is-scrolled", window.scrollY > 40);
      if (dock && hero) {
        const heroBottom = (hero.parentElement?.classList.contains("pin-spacer") ? hero.parentElement : hero).getBoundingClientRect().bottom;
        const closeTop = close ? close.getBoundingClientRect().top : Infinity;
        dock.classList.toggle("is-visible", heroBottom < 0 && closeTop > vh);
      }
      if (reduce) return;
      for (const img of parallax) {
        const r = img.parentElement!.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const speed = parseFloat(img.dataset.parallax || "0");
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = `translate3d(0, ${(-progress * speed * 100).toFixed(2)}px, 0) scale(1.12)`;
      }
    };
    gsap.ticker.add(frame);

    /* ---------- Anchors glide through Lenis ---------- */
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

    // Layout settles after fonts and images; recompute trigger positions then.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    root.classList.add("motion-ready");

    return () => {
      io.disconnect();
      introTl?.kill();
      mm.revert();
      ScrollTrigger.getAll().forEach((s) => s.kill());
      gsap.ticker.remove(raf);
      gsap.ticker.remove(frame);
      lenis?.destroy();
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return null;
}
