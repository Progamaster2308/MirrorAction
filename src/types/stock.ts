/**
 * MirrorAction - Type Definitions
 * Tipos estrictos de TypeScript para cotizaciones bursátiles,
 * respuestas de Alpha Vantage y sincronización con Wear OS.
 * 
 * @license Apache-2.0
 */

/**
 * Respuesta cruda devuelta por el endpoint GLOBAL_QUOTE de Alpha Vantage
 */
export interface RawGlobalQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

/**
 * Estructura del cuerpo JSON para GLOBAL_QUOTE
 */
export interface GlobalQuoteResponse {
  'Global Quote'?: RawGlobalQuote;
  'Note'?: string;
  'Information'?: string;
  'Error Message'?: string;
}

/**
 * Elemento individual devuelto por el endpoint SYMBOL_SEARCH
 */
export interface RawSearchResultItem {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

/**
 * Estructura del cuerpo JSON para SYMBOL_SEARCH
 */
export interface SymbolSearchResponse {
  'bestMatches'?: RawSearchResultItem[];
  'Note'?: string;
  'Information'?: string;
  'Error Message'?: string;
}

/**
 * Modelo de datos unificado y tipado para cotizaciones bursátiles en la app
 */
export interface StockQuote {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  latestTradingDay: string;
  lastUpdatedTimestamp: number;
  isPositive: boolean;
  marketCapEstimate?: string;
  peRatioEstimate?: number;
  dayRangePercentage?: number; // posición relativa del precio actual entre min y max (0 - 100)
}

/**
 * Modelo simplificado para los resultados de búsqueda de símbolos
 */
export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
  matchScore: number;
  isFavorite?: boolean;
}

/**
 * Estructura de sincronización de datos con el reloj inteligente Wear OS
 * Compatible con el repositorio: https://github.com/Progamaster2308/reloj
 * y con la API Wearable DataClient de Android / Tizen / Wear OS Tiles.
 */
export interface WearOSStockItem {
  symbol: string;
  price: string;
  changePercent: string;
  isPositive: boolean;
  timestamp: number;
}

export interface WearOSSyncPayload {
  version: string;
  protocol: 'MIRROR_ACTION_WEAR_V1';
  exportedAt: string;
  deviceId: string;
  primaryWatchSymbol: string;
  favorites: string[];
  stocks: WearOSStockItem[];
  metadata: {
    appVersion: string;
    totalTracked: number;
    syncPath: string; // p. ej. "/mirror_action/stocks"
  };
}

/**
 * Estado general de carga y error para hooks y pantallas
 */
export interface StockServiceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
