// Currency pairs configuration

export interface CurrencyPair {
  id: string
  name: string
  type: "real" | "otc"
}

export const currencyPairs: CurrencyPair[] = [
  // Real Market Pairs
  { id: "eur-usd", name: "EUR/USD", type: "real" },
  { id: "gbp-usd", name: "GBP/USD", type: "real" },
  { id: "usd-jpy", name: "USD/JPY", type: "real" },
  { id: "aud-usd", name: "AUD/USD", type: "real" },
  { id: "usd-cad", name: "USD/CAD", type: "real" },
  { id: "nzd-usd", name: "NZD/USD", type: "real" },
  { id: "eur-gbp", name: "EUR/GBP", type: "real" },
  { id: "eur-jpy", name: "EUR/JPY", type: "real" },

  // OTC Market Pairs
  { id: "eur-usd-otc", name: "EUR/USD (OTC)", type: "otc" },
  { id: "gbp-usd-otc", name: "GBP/USD (OTC)", type: "otc" },
  { id: "usd-jpy-otc", name: "USD/JPY (OTC)", type: "otc" },
  { id: "aud-usd-otc", name: "AUD/USD (OTC)", type: "otc" },
  { id: "usd-cad-otc", name: "USD/CAD (OTC)", type: "otc" },
  { id: "nzd-usd-otc", name: "NZD/USD (OTC)", type: "otc" },
]

export function isMarketOpen(type: "real" | "otc"): boolean {
  if (type === "otc") return true // OTC markets always open

  const now = new Date()
  const day = now.getDay()

  // Real markets closed on weekends (Saturday = 6, Sunday = 0)
  return day !== 0 && day !== 6
}

export function getMarketStatus(type: "real" | "otc"): "open" | "closed" {
  return isMarketOpen(type) ? "open" : "closed"
}

export function formatPairName(pairId: string): string {
  const pair = currencyPairs.find((p) => p.id === pairId)
  return pair ? pair.name : pairId
}
