// All money is integer cents. Round the comparison price UP once to a whole cent.
export function amount(raw, name) {
  const text = String(raw).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new Error(`${name}: enter a non-negative amount with at most two decimal places.`);
  const [whole, fraction = ''] = text.split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  if (cents > 1000000000n) throw new Error(`${name}: use an amount no greater than 10,000,000.`);
  return cents;
}
export function calculate(values) {
  const names = ['Original price', 'Original direct cost', 'Extra price offered', 'Extra direct cost'];
  const [price, cost, extraPrice, extraCost] = values.map((v, i) => amount(v, names[i]));
  if (price === 0n) throw new Error('Original price must be greater than zero to calculate a margin.');
  const row = (p, c) => ({price:p, cost:c, profit:p-c, margin:Number(p-c)/Number(p)*100});
  const original = row(price,cost);
  const proposed = row(price+extraPrice,cost+extraCost);
  const keepExtra = cost === 0n ? null : (extraCost*price + cost-1n)/cost;
  const matched = keepExtra === null ? null : row(price+keepExtra,cost+extraCost);
  return {original, proposed, matched, extraPrice, extraCost, keepExtra,
    extraProfit:extraPrice-extraCost,
    extraMargin:extraPrice===0n?null:Number(extraPrice-extraCost)/Number(extraPrice)*100,
    percentagePoints:proposed.margin-original.margin};
}
export function money(cents) {
  const sign = cents < 0n ? '-' : '';
  const n = cents < 0n ? -cents : cents;
  return sign + (n/100n).toLocaleString('en-US') + '.' + String(n%100n).padStart(2,'0');
}
export function record(r) {
  const row = (name, x) => `${name}\nPrice: ${money(x.price)}\nDirect cost: ${money(x.cost)}\nEstimated gross profit: ${money(x.profit)}\nGross margin: ${x.margin.toFixed(2)}%`;
  return ['EXTRA WORK — WHOLE-JOB MARGIN COMPARISON',
    'All amounts use one currency, excluding sales tax. Illustrative inputs; not an approved change order.',
    row('ORIGINAL JOB',r.original),
    `EXTRA WORK AS OFFERED\nExtra price: ${money(r.extraPrice)}\nExtra direct cost: ${money(r.extraCost)}\nExtra gross profit: ${money(r.extraProfit)}\nExtra gross margin: ${r.extraMargin===null?'Undefined: extra price is zero':r.extraMargin.toFixed(2)+'%'}`,
    row('REVISED JOB AT OFFERED EXTRA PRICE',r.proposed),
    `Whole-job margin change: ${r.percentagePoints>=0?'+':''}${r.percentagePoints.toFixed(2)} percentage points`,
    r.matched?`COMPARISON ONLY — SAME ORIGINAL GROSS MARGIN\nExtra price rounded up to a cent: ${money(r.keepExtra)}\n${row('Revised job',r.matched)}`:'The unchanged-margin comparison is not calculated when original direct cost is zero. If extra direct cost is also zero, the revised job retains a 100% gross margin.',
    'Method: gross profit = price - entered direct cost; gross margin = gross profit / price. Comparison extra price = extra direct cost × original price / original direct cost, rounded up once to a cent.',
    'Costs, overhead, timing, tax, commercial terms and approval require separate review. Gross profit is not take-home pay. No figures are transferred into ScopeBid.',
    'Teaching tool by Honest Little Apps\nhttps://udrwu9c0tjuedqy2.github.io/hla-work/scopebid/scope-change-worksheet/#price-change'].join('\n\n');
}
