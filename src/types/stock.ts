/**
 * MirrorAction - Type Definitions
 * Tipos estrictos de TypeScript para cotizaciones bursátiles,
 * índices de mercado, autenticación de usuario y sincronización bidireccional con Wear OS.
 * 
 * @license Apache-2.0
 */

/**
 * Perfil de usuario y sesión activa de autenticación
 */
export interface UserProfile {
  username: string;
  email: string;
  avatarUrl?: string;
  token?: string;
  loggedInAt: number;
  preferredCurrency?: string;
  bio?: string;
}

/**
 * Índice de Mercado Principal (ej. S&P 500, NASDAQ, Dow Jones)
 */
export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  high52Week?: number;
  low52Week?: number;
}

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
  name: string;
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
  marketCapEstimate: string;
  peRatioEstimate: number;
  dayRangePercentage: number; // posición relativa del precio actual entre min y max (0 - 100)
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
 * Elemento de acción sincronizado con el smartwatch Wear OS
 */
export interface WearOSStockItem {
  symbol: string;
  name: string;
  price: string;
  changePercent: string;
  isPositive: boolean;
  timestamp: number;
}

/**
 * Estructura de sincronización bidireccional con el reloj inteligente Wear OS
 * Compatible con el repositorio: https://github.com/Progamaster2308/reloj
 * y con la API Wearable DataClient de Android / Jetpack Compose for Wear OS.
 */
export interface WearOSSyncPayload {
  version: string;
  protocol: 'MIRROR_ACTION_WEAR_V2';
  exportedAt: string;
  deviceId: string;
  user: {
    username: string;
    email: string;
    isAuthenticated: boolean;
    sessionTimestamp: number;
  };
  primaryWatchSymbol: string;
  favorites: string[];
  stocks: WearOSStockItem[];
  indices: MarketIndex[];
  metadata: {
    appVersion: string;
    totalTracked: number;
    syncPath: string; // p. ej. "/mirror_action/stocks"
    lastSyncStatus: 'SYNCED' | 'PENDING' | 'OFFLINE';
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
