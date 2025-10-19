// Market configuration with categories

export interface Market {
  id: string
  name: string
  type: "otc"
  category: "currencies" | "commodities" | "stocks"
}

export const markets: Market[] = [
  // Currencies
  { id: "usd-brl-otc", name: "USD/BRL", type: "otc", category: "currencies" },
  { id: "usd-bdt-otc", name: "USD/BDT", type: "otc", category: "currencies" },
  { id: "nzd-chf-otc", name: "NZD/CHF", type: "otc", category: "currencies" },
  { id: "eur-aud-otc", name: "EUR/AUD", type: "otc", category: "currencies" },
  { id: "eur-jpy-otc", name: "EUR/JPY", type: "otc", category: "currencies" },
  { id: "gbp-chf-otc", name: "GBP/CHF", type: "otc", category: "currencies" },
  { id: "usd-cad-otc", name: "USD/CAD", type: "otc", category: "currencies" },
  { id: "usd-chf-otc", name: "USD/CHF", type: "otc", category: "currencies" },
  { id: "usd-idr-otc", name: "USD/IDR", type: "otc", category: "currencies" },
  { id: "eur-cad-otc", name: "EUR/CAD", type: "otc", category: "currencies" },
  { id: "eur-chf-otc", name: "EUR/CHF", type: "otc", category: "currencies" },
  { id: "usd-inr-otc", name: "USD/INR", type: "otc", category: "currencies" },
  { id: "usd-ngn-otc", name: "USD/NGN", type: "otc", category: "currencies" },
  { id: "aud-chf-otc", name: "AUD/CHF", type: "otc", category: "currencies" },
  { id: "aud-jpy-otc", name: "AUD/JPY", type: "otc", category: "currencies" },
  { id: "usd-php-otc", name: "USD/PHP", type: "otc", category: "currencies" },
  { id: "gbp-aud-otc", name: "GBP/AUD", type: "otc", category: "currencies" },
  { id: "usd-cop-otc", name: "USD/COP", type: "otc", category: "currencies" },
  { id: "nzd-cad-otc", name: "NZD/CAD", type: "otc", category: "currencies" },
  { id: "usd-mxn-otc", name: "USD/MXN", type: "otc", category: "currencies" },
  { id: "usd-zar-otc", name: "USD/ZAR", type: "otc", category: "currencies" },
  { id: "eur-sgd-otc", name: "EUR/SGD", type: "otc", category: "currencies" },
  { id: "nzd-usd-otc", name: "NZD/USD", type: "otc", category: "currencies" },
  { id: "aud-cad-otc", name: "AUD/CAD", type: "otc", category: "currencies" },
  { id: "gbp-jpy-otc", name: "GBP/JPY", type: "otc", category: "currencies" },
  { id: "usd-jpy-otc", name: "USD/JPY", type: "otc", category: "currencies" },
  { id: "usd-pkr-otc", name: "USD/PKR", type: "otc", category: "currencies" },
  { id: "usd-ars-otc", name: "USD/ARS", type: "otc", category: "currencies" },
  { id: "aud-usd-otc", name: "AUD/USD", type: "otc", category: "currencies" },
  { id: "cad-chf-otc", name: "CAD/CHF", type: "otc", category: "currencies" },
  { id: "chf-jpy-otc", name: "CHF/JPY", type: "otc", category: "currencies" },
  { id: "eur-gbp-otc", name: "EUR/GBP", type: "otc", category: "currencies" },
  { id: "usd-dzd-otc", name: "USD/DZD", type: "otc", category: "currencies" },
  { id: "usd-try-otc", name: "USD/TRY", type: "otc", category: "currencies" },
  { id: "nzd-jpy-otc", name: "NZD/JPY", type: "otc", category: "currencies" },
  { id: "eur-nzd-otc", name: "EUR/NZD", type: "otc", category: "currencies" },

  // Commodities
  { id: "ukbrent-otc", name: "UKBrent", type: "otc", category: "commodities" },
  { id: "gold-otc", name: "Gold", type: "otc", category: "commodities" },
  { id: "uscrude-otc", name: "USCrude", type: "otc", category: "commodities" },
  { id: "silver-otc", name: "Silver", type: "otc", category: "commodities" },

  // Stocks
  { id: "intel-otc", name: "Intel", type: "otc", category: "stocks" },
  { id: "microsoft-otc", name: "Microsoft", type: "otc", category: "stocks" },
  { id: "facebook-otc", name: "FACEBOOK INC", type: "otc", category: "stocks" },
  { id: "pfizer-otc", name: "Pfizer Inc", type: "otc", category: "stocks" },
  { id: "amex-otc", name: "American Express", type: "otc", category: "stocks" },
]

export const currencyPairs = markets

export function isMarketOpen(type: "otc"): boolean {
  return true // OTC markets always open
}

export function getMarketStatus(type: "otc"): "open" | "closed" {
  return isMarketOpen(type) ? "open" : "closed"
}

export function formatPairName(pairId: string): string {
  const market = markets.find((p) => p.id === pairId)
  return market ? market.name : pairId
}

export function getMarketsByCategory(category: "currencies" | "commodities" | "stocks"): Market[] {
  return markets.filter((m) => m.category === category)
}
