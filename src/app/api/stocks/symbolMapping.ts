// Symbol mapping for Yahoo Finance API
// Maps display symbols to Yahoo Finance symbols when they differ
export const yahooSymbolMap: Record<string, string> = {
  ABB: 'ABBN.SW', // ABB trades on Swiss exchange in Yahoo Finance
}

// Get the Yahoo Finance symbol for a given display symbol
export function getYahooSymbol(symbol: string): string {
  return yahooSymbolMap[symbol] || symbol
}

