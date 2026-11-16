"use client";

import { useId, useState } from "react";
import type { Dict } from "@/content/types";
import { mortgage, paymentPlan, rentalYield } from "@/lib/calculators";
import { whatsappLink } from "@/site.config";
import { Arrow, Kicker } from "./ui";

type T = Dict["calculator"];
type ToolKey = "yield" | "mortgage" | "plan";
type Unit = "money" | "pct" | "years" | "months";

/** Each tab's inputs in order, with their unit and a sensible Dubai starting value. */
const FIELDS: Record<ToolKey, { key: string; unit: Unit; start: number }[]> = {
  yield: [
    { key: "price", unit: "money", start: 2500000 },
    { key: "rent", unit: "money", start: 190000 },
    { key: "other", unit: "money", start: 0 },
  ],
  mortgage: [
    { key: "price", unit: "money", start: 2500000 },
    { key: "down", unit: "pct", start: 20 },
    { key: "rate", unit: "pct", start: 4.5 },
    { key: "years", unit: "years", start: 25 },
  ],
  plan: [
    { key: "price", unit: "money", start: 2500000 },
    { key: "booking", unit: "pct", start: 20 },
    { key: "construction", unit: "pct", start: 40 },
    { key: "months", unit: "months", start: 24 },
  ],
};
const TOOLS: ToolKey[] = ["yield", "mortgage", "plan"];

const group = (n: number) => Math.round(n).toLocaleString("en-US");
const parse = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;

/**
 * Real Estate Investment Advisory: three working calculators on one screen.
 * Visitors type their own figures; results update as they type, and the button
 * opens WhatsApp with their figures and result already written.
 */
export function Calculator({ t }: { t: T }) {
  const id = useId();
  const [tool, setTool] = useState<ToolKey>("yield");
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const k of TOOLS) for (const f of FIELDS[k]) v[`${k}.${f.key}`] = f.unit === "money" ? group(f.start) : String(f.start);
    return v;
  });

  const num = (k: string) => parse(values[`${tool}.${k}`] ?? "");
  const money = (n: number) => `${t.currency} ${group(n)}`;
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  // Main figure, its label, and two supporting figures for the chosen tab
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
        { value: money(r.interest), label: t.mortgage.results.interest },
      ];
    }
  } else {
    const r = paymentPlan(num("price"), num("booking"), num("construction"), num("months"));
    mainLabel = t.plan.results.monthly;
    if (r) {
      main = money(r.monthly);
      side = [
        { value: money(r.bookingAmount), label: t.plan.results.bookingAmount },
        { value: `${money(r.handover)} (${Math.round(r.handoverPct)}%)`, label: t.plan.results.handover },
      ];
    }
  }

  const fields = t[tool].fields as Record<string, string>;
  const figures = [
    ...FIELDS[tool].map((f) => `${fields[f.key]}: ${f.unit === "money" ? money(num(f.key)) : values[`${tool}.${f.key}`]}`),
    `${mainLabel}: ${main}`,
    ...side.map((s) => `${s.label}: ${s.value}`),
  ].join("\n");
  const wa = whatsappLink(t.message.replace("{tool}", t[tool].title).replace("{figures}", figures));

  const onChange = (key: string, unit: Unit, raw: string) => {
    let v = raw.replace(/[^0-9.]/g, "");
    if (unit === "money") v = v ? group(parse(v)) : "";
    setValues((s) => ({ ...s, [`${tool}.${key}`]: v }));
  };

  return (
    <section className="section calc" aria-label={t.kicker}>
      <div className="container">
        <Kicker>{t.kicker}</Kicker>
        <h2 className="display h2 calc__heading" data-reveal="mask">
          {t.heading}
        </h2>
        <div className="calc__tabs" role="tablist" aria-label={t.kicker} data-reveal>
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
        <div className="calc__body" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tool}`} key={tool}>
          <div className="calc__fields">
            {FIELDS[tool].map((f) => (
              <label className="calc__field" key={f.key}>
                <span className="calc__name label">{fields[f.key]}</span>
                <span className="calc__input" dir="ltr">
                  {f.unit === "money" && <span className="calc__unit">{t.currency}</span>}
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={values[`${tool}.${f.key}`]}
                    onChange={(e) => onChange(f.key, f.unit, e.target.value)}
                    size={f.unit === "money" ? 10 : 4}
                  />
                  {f.unit === "pct" && <span className="calc__unit">%</span>}
                </span>
              </label>
            ))}
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
            <p className="calc__note label">{t.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
