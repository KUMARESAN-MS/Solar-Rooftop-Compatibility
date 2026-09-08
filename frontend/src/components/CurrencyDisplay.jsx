import React from 'react'
import { formatCurrency } from '../utils/formatCurrency'

/**
 * CurrencyDisplay
 * Clean, restrained currency rendering adhering to modern typography scale.
 */
export default function CurrencyDisplay({
  amount = 0,
  currency = 'USD',
  locale = 'en-US',
  moneyValue = null,
  compact = false,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showPlus = false,
  color = null,
}) {
  const actualAmount = moneyValue ? moneyValue.amount : amount
  const actualCurrency = moneyValue ? moneyValue.currency : currency

  const fullFormatted = formatCurrency(actualAmount, actualCurrency, locale)

  let displayText = fullFormatted
  if (compact) {
    const abs = Math.abs(actualAmount)
    const sign = actualAmount < 0 ? '-' : showPlus && actualAmount > 0 ? '+' : ''

    if (actualCurrency === 'INR' || locale.includes('IN')) {
      if (abs >= 10000000) {
        displayText = `${sign}₹${(abs / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`
      } else if (abs >= 100000) {
        displayText = `${sign}₹${(abs / 100000).toFixed(1).replace(/\.0$/, '')} Lakh`
      } else if (abs >= 1000) {
        displayText = `${sign}₹${(abs / 1000).toFixed(1).replace(/\.0$/, '')}k`
      } else {
        displayText = fullFormatted
      }
    } else {
      if (abs >= 1000000) {
        const symbol = actualCurrency === 'USD' ? '$' : actualCurrency === 'EUR' ? '€' : `${actualCurrency} `
        displayText = `${sign}${symbol}${(abs / 1000000).toFixed(1).replace(/\.0$/, '')}M`
      } else if (abs >= 1000) {
        const symbol = actualCurrency === 'USD' ? '$' : actualCurrency === 'EUR' ? '€' : `${actualCurrency} `
        displayText = `${sign}${symbol}${(abs / 1000).toFixed(1).replace(/\.0$/, '')}k`
      } else {
        displayText = fullFormatted
      }
    }
  }

  const sizeClasses = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-semibold',
    lg: 'text-xl font-bold tracking-tight',
    xl: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
  }

  return (
    <span
      className={`inline-block font-sans ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={color ? { color } : undefined}
      title={`Exact: ${fullFormatted}`}
    >
      {displayText}
    </span>
  )
}
