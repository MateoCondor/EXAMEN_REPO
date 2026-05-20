export const LOCALE_TAX = 0.15

export function formatMoney(value: number) {
  return '$' + value.toFixed(2)
}

export function computeTax(value: number) {
  return value * LOCALE_TAX
}

export function excludeTax(value: number) {
  return value * (1 - LOCALE_TAX)
}

export function applyTax(value: number) {
  return value * (1 + LOCALE_TAX)
}
