/**
 * Format a monetary amount using the Intl.NumberFormat API.
 *
 * @param {number} amount  - The raw amount (e.g. 125000)
 * @param {string} currency - ISO 4217 code (e.g. "INR", "USD")
 * @param {string} locale   - BCP-47 locale (e.g. "en-IN", "en-US")
 * @returns {string}        - Formatted string (e.g. "₹1,25,000")
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    // Fallback if the browser doesn't know the currency/locale
    return `${currency} ${amount.toLocaleString()}`
  }
}

/**
 * Convenience wrapper: accepts a MoneyValue object {amount, currency}
 * plus an optional locale string from financials.locale.
 */
export function formatMoney(moneyValue, locale = 'en-US') {
  if (!moneyValue) return '—'
  return formatCurrency(moneyValue.amount, moneyValue.currency, locale)
}
