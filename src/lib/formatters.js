/**
 * Formatting utilities for SwipeSense
 */

/**
 * Formats a number or numeric string into the Indian numbering system format (e.g., 6,17,000).
 * Handles null, undefined, strings, NaN, and floating-point values gracefully.
 *
 * @param {number|string} amount - The numeric value to format
 * @param {Intl.NumberFormatOptions} [options] - Optional Intl.NumberFormat options
 * @returns {string} Number formatted in Indian locale (en-IN)
 */
export function formatIndianNumber(amount, options) {
  if (amount === null || amount === undefined || amount === '') return '0';
  const num = Number(amount);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('en-IN', options);
}

/**
 * Convenience helper to format an amount with a currency symbol in Indian format.
 * e.g., formatIndianCurrency(617000, '₹') => "₹6,17,000"
 *
 * @param {number|string} amount
 * @param {string} [currency='₹']
 * @param {Intl.NumberFormatOptions} [options]
 * @returns {string} Formatted currency string
 */
export function formatIndianCurrency(amount, currency = '₹', options) {
  return `${currency}${formatIndianNumber(amount, options)}`;
}
