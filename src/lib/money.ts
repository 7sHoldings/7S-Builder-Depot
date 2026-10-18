const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function money(n: number): string {
  return formatter.format(n);
}
