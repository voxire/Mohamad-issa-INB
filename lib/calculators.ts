/**
 * The three advisory calculators, run in the browser (the site is static).
 * Same formulas as the Investment Hub calculators module:
 *   net yield:    gross = rent / price; net = (rent - yearly costs) / price
 *   mortgage:     annuity payment = L * r * (1 + r)^n / ((1 + r)^n - 1), monthly rate r over n months
 *   payment plan: a flexible split: booking % now, construction % in equal monthly instalments,
 *                 post-handover % in equal monthly instalments, and the rest on handover
 * Amounts are in dirhams; the component converts for display. Every function returns null
 * when the inputs cannot give a meaningful answer.
 */

// No service charge field: buyers rarely know it (his request, 16 Nov 2026). Any yearly costs go in `costs`.
export function rentalYield(price: number, rent: number, costs: number) {
  if (!(price > 0) || !(rent >= 0)) return null;
  const income = rent - costs;
  return { gross: rent / price, net: income / price, income };
}

export function mortgage(price: number, downPct: number, ratePct: number, years: number) {
  if (!(price > 0) || downPct < 0 || downPct >= 100 || ratePct < 0 || !(years > 0)) return null;
  const downAmount = (price * downPct) / 100;
  const loan = price - downAmount;
  const n = Math.round(years * 12);
  const r = ratePct / 100 / 12;
  const monthly = r === 0 ? loan / n : (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const repaid = monthly * n;
  return { monthly, loan, downAmount, interest: repaid - loan, repaid };
}

export function paymentPlan(
  price: number,
  bookingPct: number,
  constructionPct: number,
  months: number,
  postPct: number,
  postMonths: number,
) {
  const shares = [bookingPct, constructionPct, postPct];
  if (!(price > 0) || shares.some((s) => s < 0) || bookingPct + constructionPct + postPct > 100) return null;
  if ((constructionPct > 0 && !(months >= 1)) || (postPct > 0 && !(postMonths >= 1))) return null;
  const part = (pct: number) => (price * pct) / 100;
  const handoverPct = 100 - bookingPct - constructionPct - postPct;
  return {
    bookingAmount: part(bookingPct),
    monthly: constructionPct > 0 ? part(constructionPct) / Math.round(months) : 0,
    handover: part(handoverPct),
    handoverPct,
    postMonthly: postPct > 0 ? part(postPct) / Math.round(postMonths) : 0,
  };
}
