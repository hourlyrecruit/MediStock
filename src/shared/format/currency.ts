const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatINR(value: number) {
  return inr.format(value);
}

export function formatINRCompact(value: number) {
  return inrCompact.format(value);
}
