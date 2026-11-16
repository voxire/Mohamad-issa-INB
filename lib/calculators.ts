/**
 * The three advisory calculators, run in the browser (the site is static).
 * Same formulas as the Investment Hub calculators module:
 *   net yield:    gross = rent / price; net = (rent - yearly costs) / price
 *   mortgage:     annuity payment = L * r * (1 + r)^n / ((1 + r)^n - 1), monthly rate r over n months
 *   payment plan: booking % now, construction % in equal monthly instalments, the rest on handover
 * Every function returns null when the inputs cannot give a meaningful answer.
 */

// No service charge field: buyers rarely know it (his request, 16 Nov 2026). Any yearly costs go in `costs`.
export function rentalYield(price: number, rent: number, costs: number) {
  if (!(price > 0) || !(rent >= 0)) return null;
  const income = rent - costs;
  return { gross: rent / price, net: income / price, income };
}

export function mortgage(price: number, downPct: number, ratePct: number, years: number) {
  if (!(price > 0) || downPct < 0 || downPct >= 100 || ratePct < 0 || !(years > 0)) return null;
  const loan = price * (1 - downPct / 100);
  const n = Math.round(years * 12);
  const r = ratePct / 100 / 12;
  const monthly = r === 0 ? loan / n : (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  return { monthly, loan, interest: monthly * n - loan };
}

export function paymentPlan(price: number, bookingPct: number, constructionPct: number, months: number) {
  if (!(price > 0) || bookingPct < 0 || constructionPct < 0 || bookingPct + constructionPct > 100 || !(months > 0)) return null;
  const bookingAmount = (price * bookingPct) / 100;
  const monthly = (price * constructionPct) / 100 / Math.round(months);
  const handover = price - bookingAmount - monthly * Math.round(months);
  return { bookingAmount, monthly, handover, handoverPct: 100 - bookingPct - constructionPct };
}
