const integer = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export function formatNumber(value: number) {
  return integer.format(value);
}

export function formatSigned(value: number) {
  return value > 0 ? `+${integer.format(value)}` : integer.format(value);
}
