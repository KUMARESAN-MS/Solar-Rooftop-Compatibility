/**
 * Country-to-currency mapping.
 *
 * Maps ISO-3166-1 alpha-2 country codes to ISO 4217 currency codes,
 * symbols, and BCP-47 locales. Mirrors the backend currencies.json so the
 * frontend can resolve currency info *before* the backend analysis call
 * returns (e.g. in the WizardPage).
 *
 * NOTE: The canonical source is the backend's data/currencies.json.
 */

export const COUNTRY_CURRENCY_MAP = {
  IN: { code: 'INR', symbol: '₹', locale: 'en-IN' },
  US: { code: 'USD', symbol: '$', locale: 'en-US' },
  GB: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  DE: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  FR: { code: 'EUR', symbol: '€', locale: 'fr-FR' },
  IT: { code: 'EUR', symbol: '€', locale: 'it-IT' },
  ES: { code: 'EUR', symbol: '€', locale: 'es-ES' },
  AU: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  CA: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  JP: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  CN: { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  BR: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  ZA: { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
  AE: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
  SG: { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
  KR: { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
  MX: { code: 'MXN', symbol: 'MX$', locale: 'es-MX' },
  NG: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  PK: { code: 'PKR', symbol: '₨', locale: 'en-PK' },
  BD: { code: 'BDT', symbol: '৳', locale: 'bn-BD' },
}

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  JPY: '¥',
  CNY: '¥',
  BRL: 'R$',
  ZAR: 'R',
  AED: 'د.إ',
  SGD: 'S$',
  KRW: '₩',
  MXN: 'MX$',
  NGN: '₦',
  PKR: '₨',
  BDT: '৳',
}

export const DEFAULT_CURRENCY = { code: 'USD', symbol: '$', locale: 'en-US' }

/**
 * Return {code, symbol, locale} for a two-letter country code.
 * Falls back to USD when the country is unknown.
 */
export function getCurrencyForCountry(countryCode) {
  if (!countryCode) return DEFAULT_CURRENCY
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || DEFAULT_CURRENCY
}

/**
 * Return currency info {code, symbol, locale} for a currency code (e.g. "INR", "USD").
 */
export function getCurrencyInfoByCode(currencyCode) {
  if (!currencyCode) return DEFAULT_CURRENCY
  const upper = currencyCode.toUpperCase()
  for (const info of Object.values(COUNTRY_CURRENCY_MAP)) {
    if (info.code === upper) return info
  }
  return {
    code: upper,
    symbol: CURRENCY_SYMBOLS[upper] || upper,
    locale: upper === 'INR' ? 'en-IN' : 'en-US',
  }
}

/**
 * Return currency symbol for a currency code.
 */
export function getCurrencySymbol(currencyCode) {
  if (!currencyCode) return '$'
  const upper = currencyCode.toUpperCase()
  return CURRENCY_SYMBOLS[upper] || upper
}

/**
 * Extract the two-letter country code from an address string.
 * Nominatim's display_name typically ends with the country name, e.g.
 * "Samayapuram Puthur, Tiruchirappalli, Tamil Nadu, India"
 */
const COUNTRY_NAME_TO_CODE = {
  'india': 'IN',
  'united states': 'US',
  'united states of america': 'US',
  'usa': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'germany': 'DE',
  'deutschland': 'DE',
  'france': 'FR',
  'italy': 'IT',
  'italia': 'IT',
  'spain': 'ES',
  'españa': 'ES',
  'australia': 'AU',
  'canada': 'CA',
  'japan': 'JP',
  '日本': 'JP',
  'china': 'CN',
  '中国': 'CN',
  'brazil': 'BR',
  'brasil': 'BR',
  'south africa': 'ZA',
  'united arab emirates': 'AE',
  'singapore': 'SG',
  'south korea': 'KR',
  'republic of korea': 'KR',
  'mexico': 'MX',
  'méxico': 'MX',
  'nigeria': 'NG',
  'pakistan': 'PK',
  'bangladesh': 'BD',
}

export function detectCountryCodeFromAddress(address) {
  if (!address) return null
  const segments = address.split(',')
  const lastSegment = (segments[segments.length - 1] || '').trim().toLowerCase()
  return COUNTRY_NAME_TO_CODE[lastSegment] || null
}

/**
 * Detect country code from coordinates as a fast offline fallback.
 */
export function detectCountryFromCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null

  // India
  if (lat >= 6.0 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5) {
    return 'IN'
  }
  // United States (contiguous + rough bounds)
  if (lat >= 24.5 && lat <= 49.5 && lng >= -125.0 && lng <= -66.5) {
    return 'US'
  }
  // United Kingdom
  if (lat >= 49.8 && lat <= 60.9 && lng >= -8.5 && lng <= 1.8) {
    return 'GB'
  }
  // Western / Central Europe (Eurozone)
  if (lat >= 35.0 && lat <= 65.0 && lng >= -9.5 && lng <= 30.0) {
    return 'DE'
  }
  // Australia
  if (lat >= -44.0 && lat <= -10.0 && lng >= 112.0 && lng <= 154.0) {
    return 'AU'
  }
  // Canada
  if (lat >= 42.0 && lat <= 70.0 && lng >= -141.0 && lng <= -52.0) {
    return 'CA'
  }
  // Japan
  if (lat >= 24.0 && lat <= 46.0 && lng >= 122.0 && lng <= 153.0) {
    return 'JP'
  }
  // South Korea
  if (lat >= 33.0 && lat <= 38.8 && lng >= 124.5 && lng <= 130.0) {
    return 'KR'
  }
  // Brazil
  if (lat >= -34.0 && lat <= 5.5 && lng >= -74.0 && lng <= -34.5) {
    return 'BR'
  }
  // Mexico
  if (lat >= 14.5 && lat <= 32.8 && lng >= -118.5 && lng <= -86.5) {
    return 'MX'
  }
  // UAE
  if (lat >= 22.5 && lat <= 26.5 && lng >= 51.5 && lng <= 56.5) {
    return 'AE'
  }
  // Singapore
  if (lat >= 1.15 && lat <= 1.48 && lng >= 103.55 && lng <= 104.05) {
    return 'SG'
  }

  return null
}

/**
 * Get bill presets appropriate for a given currency code.
 * Returns an array of common monthly bill amounts in local currency units.
 */
export function getBillPresetsForCurrency(currencyCode) {
  switch (currencyCode) {
    case 'INR':
      return [500, 1000, 2000, 3500, 6000, 12000]
    case 'GBP':
      return [30, 60, 120, 250, 500, 1000]
    case 'EUR':
      return [30, 60, 120, 250, 500, 1000]
    case 'AUD':
    case 'CAD':
      return [40, 80, 150, 300, 600, 1200]
    case 'JPY':
      return [3000, 6000, 12000, 25000, 50000, 100000]
    case 'CNY':
      return [100, 300, 600, 1200, 2500, 5000]
    case 'BRL':
      return [100, 250, 500, 1000, 2000, 5000]
    case 'KRW':
      return [30000, 60000, 120000, 250000, 500000, 1000000]
    default:
      // USD and others
      return [40, 80, 150, 300, 600, 1200]
  }
}

/**
 * Get slider range (min, max, step) appropriate for a given currency.
 */
export function getSliderRangeForCurrency(currencyCode) {
  switch (currencyCode) {
    case 'INR':
      return { min: 200, max: 15000, step: 100 }
    case 'JPY':
      return { min: 2000, max: 150000, step: 1000 }
    case 'KRW':
      return { min: 20000, max: 1500000, step: 10000 }
    case 'CNY':
      return { min: 50, max: 8000, step: 50 }
    case 'BRL':
      return { min: 50, max: 8000, step: 50 }
    default:
      return { min: 20, max: 1500, step: 10 }
  }
}

/**
 * Get descriptive slider labels for the bill range slider.
 */
export function getSliderLabelsForCurrency(currencyCode, symbol) {
  const s = symbol
  switch (currencyCode) {
    case 'INR':
      return [
        `${s}200 (Minimal)`,
        `${s}2,000 (Residential Avg)`,
        `${s}6,000 (Heavy A/C)`,
        `${s}15,000+ (Commercial)`,
      ]
    case 'JPY':
      return [
        `${s}2,000 (Minimal)`,
        `${s}12,000 (Residential Avg)`,
        `${s}50,000 (Heavy)`,
        `${s}150,000+ (Commercial)`,
      ]
    case 'KRW':
      return [
        `${s}20,000`,
        `${s}120,000 (Avg)`,
        `${s}500,000 (Heavy)`,
        `${s}1,500,000+`,
      ]
    default:
      return [
        `${s}20 (Minimal)`,
        `${s}150 (Residential Avg)`,
        `${s}500 (Heavy HVAC)`,
        `${s}1,500+ (Commercial)`,
      ]
  }
}

/**
 * Get a sensible default monthly bill for a given currency.
 */
export function getDefaultBillForCurrency(currencyCode) {
  switch (currencyCode) {
    case 'INR': return 2000
    case 'JPY': return 12000
    case 'KRW': return 120000
    case 'CNY': return 600
    case 'BRL': return 500
    default: return 100
  }
}

/**
 * Approximate electricity tariff rate per kWh in local currency units
 * for live preliminary preview calculations before backend API returns.
 */
export function getEstimatedTariffForCurrency(currencyCode) {
  switch (currencyCode) {
    case 'INR': return 5.50
    case 'GBP': return 0.28
    case 'EUR': return 0.25
    case 'AUD': return 0.30
    case 'CAD': return 0.16
    case 'JPY': return 31.0
    case 'CNY': return 0.65
    case 'BRL': return 0.85
    case 'KRW': return 140.0
    default: return 0.14 // USD global default
  }
}
