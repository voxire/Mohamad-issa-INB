"use client";

import { useId, useState, type CSSProperties } from "react";
import type { Dict } from "@/content/types";
import { mortgage, paymentPlan, rentalYield } from "@/lib/calculators";
import { site, whatsappLink, type Currency } from "@/site.config";
import { Arrow, Kicker } from "./ui";

type T = Dict["calculator"];
type ToolKey = "yield" | "mortgage" | "plan";
type Unit = "money" | "pct" | "years" | "months";
/** One input: its unit, starting value and slider range. Money is held in dirhams. */
type Field = { key: string; unit: Unit; start: number; min: number; max: number; step?: number; wide?: boolean };

const FIELDS: Record<ToolKey, Field[]> = {
  yield: [
    { key: "price", unit: "money", start: 2500000, min: 300000, max: 50000000 },
    { key: "rent", unit: "money", start: 190000, min: 10000, max: 5000000 },
    { key: "other", unit: "money", start: 0, min: 0, max: 1000000 },
  ],
  mortgage: [
    { key: "price", unit: "money", start: 2500000, min: 300000, max: 50000000 },
    { key: "down", unit: "pct", start: 20, min: 0, max: 90, step: 1 },
    { key: "rate", unit: "pct", start: 4.5, min: 0, max: 12, step: 0.05 },
    { key: "years", unit: "years", start: 25, min: 1, max: 30, step: 1 },
  ],
  plan: [
    { key: "price", unit: "money", start: 2500000, min: 300000, max: 50000000 },
    { key: "booking", unit: "pct", start: 20, min: 0, max: 100, step: 1, wide: true },
    { key: "construction", unit: "pct", start: 40, min: 0, max: 100, step: 1 },
    { key: "months", unit: "months", start: 24, min: 1, max: 72, step: 1 },
    { key: "post", unit: "pct", start: 0, min: 0, max: 100, step: 1 },
    { key: "postMonths", unit: "months", start: 24, min: 1, max: 120, step: 1 },
  ],
};
const TOOLS: ToolKey[] = ["yield", "mortgage", "plan"];
const CURRENCIES = Object.keys(site.currencies) as Currency[];
/** In the payment plan these three shares, plus handover, make 100%. */
const SHARES = ["booking", "construction", "post"];

const group = (n: number) => Math.round(n).toLocaleString("en-US");
const parse = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/* Money sliders move on a log scale, so small and large prices both get fine control. */
const STEPS = 1000;
const nice = (v: number) => {
  const unit = v >= 1e6 ? 10000 : v >= 1e5 ? 1000 : 100;
  return Math.round(v / unit) * unit;
};
const toSlider = (v: number, f: Field) => {
  if (v <= 0) return 0;
  const lo = Math.max(f.min, 1000);
  return Math.round((Math.log(clamp(v, lo, f.max) / lo) / Math.log(f.max / lo)) * STEPS);
};
const fromSlider = (p: number, f: Field) => {
  if (p <= 0 && f.min === 0) return 0;
  const lo = Math.max(f.min, 1000);
  return nice(lo * (f.max / lo) ** (p / STEPS));
};

/**
 * Real Estate Investment Advisory: three working calculators on one screen, built to be flexible:
 * every figure can be typed or dragged, the payment plan splits however the visitor likes,
 * and results show in AED, USD, EUR or GBP. The button opens WhatsApp with their figures written in.
 */
export function Calculator({ t }: { t: T }) {
  const id = useId();
  const [tool, setTool] = useState<ToolKey>("yield");
  const [cur, setCur] = useState<Currency>("AED");
  // Money in dirhams as numbers; other inputs as the text the visitor typed (so "4." stays while typing)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const k of TOOLS) for (const f of FIELDS[k]) v[`${k}.${f.key}`] = String(f.start);
    return v;
  });

  const rate = site.currencies[cur];
  const key = (k: string) => `${tool}.${k}`;
  const num = (k: string) => parse(values[key(k)] ?? "");
  const money = (aed: number) => `${cur} ${group(aed / rate)}`;
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const labels = t[tool].fields as Record<string, string>;

  const set = (f: Field, n: number | string) => {
    let v = typeof n === "number" ? n : parse(n);
    // Payment plan shares can never add up to more than 100%: the one being moved stops at the limit
    if (tool === "plan" && SHARES.includes(f.key)) {
      const others = SHARES.filter((s) => s !== f.key).reduce((sum, s) => sum + num(s), 0);
      v = clamp(v, 0, 100 - others);
      if (typeof n === "string" && parse(n) === v) return setValues((s) => ({ ...s, [key(f.key)]: n.replace(/[^0-9.]/g, "") }));
    } else if (f.unit !== "money") {
      v = clamp(v, 0, f.unit === "pct" ? 100 : f.max * 2);
      if (typeof n === "string" && parse(n) === v) return setValues((s) => ({ ...s, [key(f.key)]: n.replace(/[^0-9.]/g, "") }));
    }
    setValues((s) => ({ ...s, [key(f.key)]: String(v) }));
  };

  // The headline figure, its label, and the breakdown beneath it
  let main = "–";
  let mainLabel = "";
  let side: { value: string; label: string }[] = [];
  if (tool === "yield") {
    const r = rentalYield(num("price"), num("rent"), num("other"));
    mainLabel = t.yield.results.net;
    if (r) {
      main = pct(r.net);
      side = [
        { value: pct(r.gross), label: t.yield.results.gross },
        { value: money(r.income), label: t.yield.results.income },
      ];
    }
  } else if (tool === "mortgage") {
    const r = mortgage(num("price"), num("down"), num("rate"), num("years"));
    mainLabel = t.mortgage.results.monthly;
    if (r) {
      main = money(r.monthly);
      side = [
        { value: money(r.loan), label: t.mortgage.results.loan },
        { value: money(r.downAmount), label: t.mortgage.results.downAmount },
        { value: money(r.interest), label: t.mortgage.results.interest },
        { value: money(r.repaid), label: t.mortgage.results.repaid },
      ];
    }
  } else {
    const r = paymentPlan(num("price"), num("booking"), num("construction"), num("months"), num("post"), num("postMonths"));
    mainLabel = t.plan.results.monthly;
    if (r) {
      main = money(r.monthly);
      side = [
        { value: money(r.bookingAmount), label: t.plan.results.bookingAmount },
        { value: `${money(r.handover)} · ${Math.round(r.handoverPct)}%`, label: t.plan.results.handover },
        ...(r.postMonthly > 0 ? [{ value: money(r.postMonthly), label: t.plan.results.postMonthly }] : []),
      ];
    }
  }

  const shown = (f: Field) => (f.unit === "money" ? group(num(f.key) / rate) : values[key(f.key)]);
  const figures = [
    ...FIELDS[tool].map((f) => `${labels[f.key]}: ${f.unit === "money" ? money(num(f.key)) : shown(f)}${f.unit === "pct" ? "%" : ""}`),
    `${mainLabel}: ${main}`,
    ...side.map((s) => `${s.label}: ${s.value}`),
  ].join("\n");
  const wa = whatsappLink(t.message.replace("{tool}", t[tool].title).replace("{figures}", figures));

  return (
    <section className="section calc" aria-label={t.kicker}>
      <div className="container">
        <Kicker>{t.kicker}</Kicker>
        <h2 className="display h2 calc__heading" data-reveal="mask">
          {t.heading}
        </h2>
        <div className="calc__bar" data-reveal>
          <div className="calc__tabs" role="tablist" aria-label={t.kicker}>
            {TOOLS.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                className="calc__tab label"
                id={`${id}-tab-${k}`}
                aria-selected={tool === k}
                aria-controls={`${id}-panel`}
                onClick={() => setTool(k)}
              >
                {t[k].title}
              </button>
            ))}
          </div>
          <div className="calc__currencies" role="group" aria-label={t.currencyLabel}>
            {CURRENCIES.map((c) => (
              <button key={c} type="button" className="calc__currency label" aria-pressed={cur === c} onClick={() => setCur(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="calc__body" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tool}`} key={tool}>
          <div className="calc__fields">
            {FIELDS[tool].map((f) => {
              const v = num(f.key);
              const pos = f.unit === "money" ? toSlider(v, f) : v;
              const [lo, hi] = f.unit === "money" ? [0, STEPS] : [f.min, f.max];
              return (
                <div className={`calc__field${f.unit === "money" || f.wide ? "" : " calc__field--half"}`} key={f.key}>
                  <label className="calc__row">
                    <span className="calc__name label">{labels[f.key]}</span>
                    <span className="calc__input" dir="ltr">
                      {f.unit === "money" && <span className="calc__unit">{cur}</span>}
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={shown(f)}
                        onChange={(e) => set(f, f.unit === "money" ? parse(e.target.value) * rate : e.target.value)}
                        size={f.unit === "money" ? 10 : 3}
                      />
                      {f.unit === "pct" && <span className="calc__unit">%</span>}
                    </span>
                  </label>
                  <input
                    className="calc__range"
                    type="range"
                    min={lo}
                    max={hi}
                    step={f.unit === "money" ? 1 : f.step}
                    value={clamp(pos, lo, hi)}
                    aria-label={labels[f.key]}
                    style={{ "--p": `${((clamp(pos, lo, hi) - lo) / (hi - lo)) * 100}%` } as CSSProperties}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      set(f, f.unit === "money" ? fromSlider(p, f) : p);
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="calc__result" aria-live="polite">
            <p className="calc__main">
              <bdi dir="ltr">{main}</bdi>
            </p>
            <p className="calc__label label">{mainLabel}</p>
            <ul className="calc__side">
              {side.map((s) => (
                <li key={s.label}>
                  <span className="calc__value">
                    <bdi dir="ltr">{s.value}</bdi>
                  </span>
                  <span className="calc__name label">{s.label}</span>
                </li>
              ))}
            </ul>
            <a className="btn calc__cta" href={wa} target="_blank" rel="noopener noreferrer">
              {t.cta}
              <Arrow />
            </a>
            <p className="calc__note label">
              {t.note}
              {(cur === "EUR" || cur === "GBP") && ` ${t.rateNote}`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
