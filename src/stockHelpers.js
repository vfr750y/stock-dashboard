/** Calculate how many days remain before expiry */
export function getDaysLeft(expiry) {
  const now = new Date();
  const exp = new Date(expiry);
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

/** Suggest a discounted price based on days until expiry and configurable discounts */
export function suggestPrice(p, discounts) {
  const days = getDaysLeft(p.expiry);

  let discount = 0;
  if (days < 5 && days >= 3) discount = discounts.discount5 || 0;
  else if (days < 3 && days >= 2) discount = discounts.discount3 || 0;
  else if (days < 2 && days >= 1) discount = discounts.discount2 || 0;

  const discounted = p.salePrice * (1 - discount);
  return Math.max(p.costPrice, discounted).toFixed(2);
}

/** Calculate real-time profit: cumulative revenue - (costPrice * sold) */
export function calculateProfit(p) {
  const sold = Number(p.sold || 0);
  const cost = Number(p.costPrice || 0);
  const revenue = Number(p.revenue || 0);

  return (revenue - (cost * sold)).toFixed(2);
}