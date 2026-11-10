/**
 * MirrorAction - Wear OS Synchronization Bridge
 * Módulo de enlace para compatibilidad con el repositorio Smartwatch Wear OS:
 * https://github.com/Progamaster2308/reloj
 * 
 * Define la estructura del protocolo Wearable DataClient de Android (DataMap / MessageClient),
 * así como la exportación JSON para Wear OS Tiles y Complications.
 * 
 * @license Apache-2.0
 */

import { StockQuote, WearOSSyncPayload } from '../types/stock';
import { buildWearOSSyncPacket, getFavorites, getPrimaryWatchSymbol } from './storage';

/**
 * Constantes del protocolo Android Wearable Data Layer
 */
export const WEAR_DATA_LAYER_PATHS = {
  STOCKS_SYNC: '/mirror_action/stocks',
  FAVORITES_SYNC: '/mirror_action/favorites',
  COMPLICATION_UPDATE: '/mirror_action/complication_ticker',
  PING_WATCH: '/mirror_action/ping',
} as const;

/**
 * Formato de complicación de reloj Wear OS (ShortText & RangedValue)
 */
export interface WearComplicationData {
  ticker: string;
  shortText: string;        // p. ej. "$138.25"
  title: string;            // p. ej. "NVDA"
  contentDescription: string; // p. ej. "NVIDIA Corp 138.25 +2.54%"
  trendColorHex: string;    // "#00E676" o "#FF5252"
  percentValue: string;     // "+2.54%"
}

/**
 * Genera el paquete de sincronización en formato DataMap para la API de Android Wearable
 */
export async function createWearOSDataMapPayload(
  quotesMap: Record<string, StockQuote>
): Promise<{
  path: string;
  dataMap: Record<string, unknown>;
  jsonString: string;
}> {
  const syncPacket: WearOSSyncPayload = await buildWearOSSyncPacket(quotesMap);

  const dataMap = {
    protocol_version: syncPacket.version,
    sync_timestamp: Date.now(),
    device_id: syncPacket.deviceId,
    primary_ticker: syncPacket.primaryWatchSymbol,
    favorites_list: syncPacket.favorites,
    stocks_summary: JSON.stringify(syncPacket.stocks),
  };

  return {
    path: WEAR_DATA_LAYER_PATHS.STOCKS_SYNC,
    dataMap,
    jsonString: JSON.stringify(syncPacket, null, 2),
  };
}

/**
 * Extrae los datos formateados para una carátula / complicación de Wear OS
 */
export function getComplicationFormat(quote?: StockQuote): WearComplicationData {
  if (!quote) {
    return {
      ticker: 'NVDA',
      shortText: '--',
      title: 'NVDA',
      contentDescription: 'Sin datos disponibles',
      trendColorHex: '#9E9E9E',
      percentValue: '0.00%',
    };
  }

  return {
    ticker: quote.symbol,
    shortText: `$${quote.price.toFixed(1)}`,
    title: quote.symbol,
    contentDescription: `${quote.symbol} cotiza a $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`,
    trendColorHex: quote.isPositive ? '#00E676' : '#FF5252',
    percentValue: `${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`,
  };
}

/**
 * Descarga o copia el archivo de sincronización JSON para transferirlo al reloj vía ADB o Companion App
 */
export function exportSyncPayloadAsBlob(jsonString: string): void {
  try {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mirror_action_wear_sync_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('[MirrorAction:WearSync] Error exportando archivo JSON:', err);
  }
}
