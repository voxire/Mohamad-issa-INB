"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createParticleStory, type ParticleStory } from "./gl/particles";

/**
 * The single motion engine.
 *  - Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger stays in sync
 *  - Opening intro (once per tab session): particles form his portrait, a tower, a globe and "Let's talk", then the curtain lifts
 *  - Investor globe in the International section (WebGL, lazy-loaded, renders only while on screen)
 *  - Living hero: chrome sheen on the name (CSS), pointer depth on portrait and city, stats count up
 *  - Apple-style pinned zoom-out of the hero on scroll (lighter, unpinned on phones)
 *  - Scroll storytelling: the quote lights up word by word
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
    let story: ParticleStory | null = null;
    if (introVisible && intro && !reduce) {
      lenis?.stop();
      const canvas = intro.querySelector<HTMLCanvasElement>(".intro__stage");
      const rtl = root.dir === "rtl";
      story = canvas
        ? createParticleStory(canvas, {
            portrait: intro.dataset.portrait || "",
            words: intro.dataset.words || "",
            font: rtl ? '"Noto Naskh Arabic", serif' : '"Cormorant Garamond", Georgia, serif',
            rtl,
          })
        : null;
      introTl = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power3.out" },
          onComplete: () => {
            story?.destroy();
            finishIntro();
          },
        })
        .to(".intro__char", { y: "0%", duration: 0.8, stagger: 0.03 }, 0.1)
        .to(".intro__line", { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 0.45);
      if (story) {
        // Dust → portrait → tower → globe → words in about 4.5s, each morph eased, with short holds between
        const s = story.state;
        introTl
          .to(s, { v: 1, duration: 1.1, ease: "power3.inOut" }, 0)
          .to(s, { v: 2, duration: 0.65, ease: "power2.inOut" }, "+=0.25")
          .to(s, { v: 3, duration: 0.65, ease: "power2.inOut" }, "+=0.1")
          .to(s, { v: 4, duration: 0.7, ease: "power2.inOut" }, "+=0.1")
          .to(".intro__stage, .intro__name, .intro__line", { y: -30, opacity: 0, duration: 0.45, ease: "power2.in" }, "+=0.35");
      } else {
        introTl.to(".intro__name, .intro__line", { y: -30, opacity: 0, duration: 0.5, ease: "power2.in" }, 1.4);
      }
      introTl.to(intro, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "power4.inOut" }, "-=0.3");
      // Start once his portrait is ready to form (never wait more than 0.8s)
      Promise.race([story?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 800))]).then(() => introTl?.play());
      const skip = () => introTl?.timeScale(5).play();
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

      /* ---------- Roadshows: hold the globe and its lists on screen while you explore (desktop) ---------- */
      mm.add("(min-width: 861px)", () => {
        if (!document.querySelector(".intl__stage")) return;
        ScrollTrigger.create({ trigger: ".intl__stage", start: "center center", end: "+=45%", pin: true });
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
    }

    /* ---------- Investor globe (loaded only when the section is near) ---------- */
    let globeOff: (() => void) | null = null;
    let disposed = false;
    const globeBox = document.querySelector<HTMLElement>(".intl__globe");
    const globeIo = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || !globeBox) return;
        globeIo.disconnect();
        import("./gl/globe").then(({ createGlobe, PIN_COUNT }) => {
          if (disposed) return;
          const canvas = globeBox.querySelector("canvas");
          const labels = Array.from({ length: PIN_COUNT }, (_, i) =>
            globeBox.querySelector<HTMLElement>(`[data-label="${i}"]`),
          );
          const globe = canvas ? createGlobe(canvas, { reduce, labels }) : null;
          if (!globe) {
            globeBox.classList.add("is-off");
            return;
          }
          globeOff = wireGlobe(globe.focus, globe.destroy);
        });
      },
      { rootMargin: "600px 0px" },
    );
    if (globeBox) globeIo.observe(globeBox);

    /**
     * Countries and cities focus the globe: hover or keyboard focus previews, click or tap locks,
     * and clicking anywhere else (or the locked item again) releases it back to the slow tour.
     */
    function wireGlobe(focus: (pins: number[] | null) => void, destroy: () => void) {
      const list = document.querySelector<HTMLElement>(".intl__countries");
      const triggers = Array.from(document.querySelectorAll<HTMLElement>(".intl [data-pins]"));
      const pinsOf = (el: HTMLElement) => (el.dataset.pins || "").split(",").map(Number);
      let locked: HTMLElement | null = null;
      const show = (el: HTMLElement | null) => {
        focus(el ? pinsOf(el) : null);
        list?.classList.toggle("has-focus", !!el);
        triggers.forEach((t) => t.classList.toggle("is-focused", t === el));
        list?.querySelectorAll(".intl__country").forEach((li) => li.classList.toggle("is-focused", !!el && li.contains(el)));
      };
      const preview = (e: Event) => show(e.currentTarget as HTMLElement);
      const restore = () => show(locked);
      const lock = (e: Event) => {
        e.stopPropagation();
        const el = e.currentTarget as HTMLElement;
        locked = locked === el ? null : el;
        show(locked ?? el);
        // Phones: bring the tapped country to the middle of the swipe row
        if (window.matchMedia("(max-width: 860px)").matches) {
          el.closest(".intl__country")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
        }
      };
      const release = (e: MouseEvent) => {
        if (!locked || (e.target as HTMLElement).closest(".intl__globe")) return;
        locked = null;
        show(null);
      };
      triggers.forEach((t) => {
        t.addEventListener("pointerenter", preview);
        t.addEventListener("pointerleave", restore);
        t.addEventListener("focus", preview);
        t.addEventListener("blur", restore);
        t.addEventListener("click", lock);
      });
      document.addEventListener("click", release);
      return () => {
        triggers.forEach((t) => {
          t.removeEventListener("pointerenter", preview);
          t.removeEventListener("pointerleave", restore);
          t.removeEventListener("focus", preview);
          t.removeEventListener("blur", restore);
          t.removeEventListener("click", lock);
        });
        document.removeEventListener("click", release);
        destroy();
      };
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
      disposed = true;
      io.disconnect();
      globeIo.disconnect();
      globeOff?.();
      story?.destroy();
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
