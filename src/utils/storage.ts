/**
 * MirrorAction - Local Storage Manager
 * Gestión centralizada de persistencia de datos y favoritos.
 * 
 * Diseñado con compatibilidad universal:
 * 1. Implementa la interfaz estándar de AsyncStorage de React Native (@react-native-async-storage/async-storage).
 * 2. Posee fallback automático a localStorage / in-memory para ejecución web sin dependencias nativas faltantes.
 * 3. Provee esquemas JSON estructurados listos para sincronización con Wear OS (https://github.com/Progamaster2308/reloj).
 * 
 * @license Apache-2.0
 */

import { WearOSSyncPayload, StockQuote } from '../types/stock';

// Claves de almacenamiento locales
export const STORAGE_KEYS = {
  FAVORITES: '@mirror_action_favorites_v1',
  API_KEY: '@mirror_action_alpha_vantage_key',
  LAST_SYNC: '@mirror_action_last_sync_timestamp',
  PRIMARY_WATCH_TICKER: '@mirror_action_primary_watch_ticker',
  SETTINGS: '@mirror_action_user_settings',
} as const;

// Lista de símbolos favoritos por defecto (según especificación: NVDA, AAPL, TSLA, MSFT)
export const DEFAULT_FAVORITES: string[] = ['NVDA', 'AAPL', 'TSLA', 'MSFT'];

/**
 * Motor AsyncStorage Isomórfico (compatible con Expo / React Native y React Web)
 */
class IsomorphicStorage {
  private memoryStore: Map<string, string> = new Map();

  private isWebStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && !!window.localStorage;
    } catch {
      return false;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWebStorageAvailable()) {
        return window.localStorage.getItem(key);
      }
      return this.memoryStore.get(key) ?? null;
    } catch (error) {
      console.warn(`[MirrorAction:Storage] Error reading key "${key}":`, error);
      return this.memoryStore.get(key) ?? null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWebStorageAvailable()) {
        window.localStorage.setItem(key, value);
      }
      this.memoryStore.set(key, value);
    } catch (error) {
      console.warn(`[MirrorAction:Storage] Error setting key "${key}":`, error);
      this.memoryStore.set(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWebStorageAvailable()) {
        window.localStorage.removeItem(key);
      }
      this.memoryStore.delete(key);
    } catch (error) {
      console.warn(`[MirrorAction:Storage] Error removing key "${key}":`, error);
      this.memoryStore.delete(key);
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isWebStorageAvailable()) {
        window.localStorage.clear();
      }
      this.memoryStore.clear();
    } catch (error) {
      console.warn('[MirrorAction:Storage] Error clearing storage:', error);
      this.memoryStore.clear();
    }
  }
}

// Exportamos la instancia base compatible con AsyncStorage de React Native
export const AsyncStorage = new IsomorphicStorage();

/**
 * Obtiene la lista actual de símbolos favoritos persistidos.
 * Si el usuario no tiene ninguna lista guardada, devuelve la lista por defecto.
 */
export async function getFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) {
      // Inicializar con los favoritos por defecto si es la primera vez
      await saveFavorites(DEFAULT_FAVORITES);
      return [...DEFAULT_FAVORITES];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((s) => String(s).toUpperCase().trim());
    }
    return [...DEFAULT_FAVORITES];
  } catch (error) {
    console.error('[MirrorAction:Storage] Error al parsear favoritos:', error);
    return [...DEFAULT_FAVORITES];
  }
}

/**
 * Guarda la lista de símbolos favoritos en almacenamiento persistente.
 */
export async function saveFavorites(symbols: string[]): Promise<void> {
  try {
    const normalized = Array.from(
      new Set(symbols.map((s) => s.toUpperCase().trim()).filter(Boolean))
    );
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(normalized));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('[MirrorAction:Storage] Error al guardar favoritos:', error);
    throw error;
  }
}

/**
 * Añade un símbolo a la lista de favoritos si no existe.
 */
export async function addFavorite(symbol: string): Promise<string[]> {
  const current = await getFavorites();
  const cleanSymbol = symbol.toUpperCase().trim();
  if (!current.includes(cleanSymbol)) {
    const updated = [...current, cleanSymbol];
    await saveFavorites(updated);
    return updated;
  }
  return current;
}

/**
 * Elimina un símbolo de la lista de favoritos.
 */
export async function removeFavorite(symbol: string): Promise<string[]> {
  const current = await getFavorites();
  const cleanSymbol = symbol.toUpperCase().trim();
  const updated = current.filter((s) => s !== cleanSymbol);
  await saveFavorites(updated);
  return updated;
}

/**
 * Alterna (toggle) el estado de favorito de un ticker.
 */
export async function toggleFavorite(symbol: string): Promise<{
  favorites: string[];
  isAdded: boolean;
}> {
  const current = await getFavorites();
  const cleanSymbol = symbol.toUpperCase().trim();
  const exists = current.includes(cleanSymbol);

  let updated: string[];
  if (exists) {
    updated = current.filter((s) => s !== cleanSymbol);
  } else {
    updated = [...current, cleanSymbol];
  }

  await saveFavorites(updated);
  return { favorites: updated, isAdded: !exists };
}

/**
 * Verifica si un símbolo está en favoritos.
 */
export async function isFavorite(symbol: string): Promise<boolean> {
  const current = await getFavorites();
  return current.includes(symbol.toUpperCase().trim());
}

/**
 * Obtiene la API Key de Alpha Vantage personalizada guardada por el usuario (si existe).
 */
export async function getCustomApiKey(): Promise<string | null> {
  return await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
}

/**
 * Guarda una API Key personalizada para Alpha Vantage.
 */
export async function saveCustomApiKey(key: string): Promise<void> {
  const cleanKey = key.trim();
  if (cleanKey) {
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, cleanKey);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.API_KEY);
  }
}

/**
 * Obtiene el ticker principal configurado para la carátula o complicación del reloj.
 */
export async function getPrimaryWatchSymbol(): Promise<string> {
  const symbol = await AsyncStorage.getItem(STORAGE_KEYS.PRIMARY_WATCH_TICKER);
  if (symbol) return symbol.toUpperCase().trim();
  const favs = await getFavorites();
  return favs[0] || 'NVDA';
}

/**
 * Configura el ticker principal para el smartwatch.
 */
export async function setPrimaryWatchSymbol(symbol: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PRIMARY_WATCH_TICKER, symbol.toUpperCase().trim());
}

/**
 * Genera el paquete de sincronización en formato JSON para el repositorio del Smartwatch Wear OS:
 * https://github.com/Progamaster2308/reloj
 * 
 * Este formato estandarizado puede enviarse mediante:
 * 1. Android Wearable DataLayer API (PutDataMapRequest / MessageClient).
 * 2. Un servidor de sincronización local o BLE GATT Characteristic.
 * 3. Exportación manual / código QR para emulador o reloj conectado por ADB.
 */
export async function buildWearOSSyncPacket(
  quotesMap?: Record<string, StockQuote>
): Promise<WearOSSyncPayload> {
  const favorites = await getFavorites();
  const primarySymbol = await getPrimaryWatchSymbol();

  const stockItems = favorites.map((symbol) => {
    const q = quotesMap ? quotesMap[symbol] : undefined;
    return {
      symbol,
      price: q ? `$${q.price.toFixed(2)}` : '--',
      changePercent: q ? `${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%` : '0.00%',
      isPositive: q ? q.isPositive : true,
      timestamp: q ? q.lastUpdatedTimestamp : Date.now(),
    };
  });

  return {
    version: '1.0.0',
    protocol: 'MIRROR_ACTION_WEAR_V1',
    exportedAt: new Date().toISOString(),
    deviceId: 'mirror-action-mobile-client',
    primaryWatchSymbol: primarySymbol,
    favorites,
    stocks: stockItems,
    metadata: {
      appVersion: '1.0.0',
      totalTracked: favorites.length,
      syncPath: '/mirror_action/stocks',
    },
  };
}
