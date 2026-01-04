/**
 * Formats a number into Philippine Peso currency string.
 * Example: 1000 -> "₱1,000.00"
 */
export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};
