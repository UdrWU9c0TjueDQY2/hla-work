export function validAmount(value) {
  const text = String(value).trim();
  if (!/^(?:\d{1,7}|\d{1,3}(?:,\d{3}){1,2})(?:\.\d{1,2})?$/.test(text)) return false;
  return text.split('.')[0].replaceAll(',', '').length <= 7;
}

export function cents(value) {
  if (!validAmount(value)) throw new Error('Enter an amount from 0 to 9999999.99, using a decimal point and up to two decimals. Use 0 when none applies.');
  const [a,b='']=String(value).trim().replaceAll(',', '').split('.'); return Number(a)*100+Number(b.padEnd(2,'0'));
}
export function reconcile(values) {
  const [gross,deductions,additions,net]=values.map(cents);
  return {gross,deductions,additions,net,expected:gross-deductions+additions,difference:net-(gross-deductions+additions)};
}
export function amount(n) {return (n/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
