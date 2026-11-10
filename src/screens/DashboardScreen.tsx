/**
 * MirrorAction - Dashboard Screen
 * Pantalla principal de la aplicación móvil.
 * 
 * Muestra la lista de acciones favoritas (NVDA, AAPL, TSLA, MSFT por defecto)
 * con diseño de alto contraste en Modo Oscuro (#0A0A0A, #161618, acentos #00E5FF / #2979FF),
 * sistema de refresco pull-to-refresh y navegación directa al detalle.
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Watch,
  Search,
  Sparkles,
  SlidersHorizontal,
  Clock,
  Layers,
} from 'lucide-react';
import { StockQuote } from '../types/stock';
import { fetchMultipleQuotes } from '../api/stockService';
import { getFavorites, getPrimaryWatchSymbol } from '../utils/storage';
import { MirrorActionLogo } from '../components/MirrorActionLogo';

interface DashboardScreenProps {
  onSelectStock: (symbol: string) => void;
  onNavigateToSearch: () => void;
  onNavigateToWearSync: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onSelectStock,
  onNavigateToSearch,
  onNavigateToWearSync,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [primaryWatchTicker, setPrimaryWatchTicker] = useState<string>('NVDA');

  // Carga de favoritos y cotizaciones iniciales
  const loadDashboardData = useCallback(async (bypassCache = false) => {
    try {
      const favList = await getFavorites();
      const watchTicker = await getPrimaryWatchSymbol();
      setFavorites(favList);
      setPrimaryWatchTicker(watchTicker);

      if (favList.length > 0) {
        const fetched = await fetchMultipleQuotes(favList, undefined, bypassCache);
        setQuotes(fetched);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('[MirrorAction:Dashboard] Error cargando cotizaciones:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Manejador de refresco (Pull-to-refresh / botón táctil)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData(true);
  };

  // Cálculo de estadísticas agregadas del Watchlist
  const stockList = favorites.map((sym) => quotes[sym]).filter(Boolean);
  const avgChangePercent =
    stockList.length > 0
      ? stockList.reduce((acc, q) => acc + q.changePercent, 0) / stockList.length
      : 0;
  const isPortfolioPositive = avgChangePercent >= 0;

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white overflow-y-auto">
      {/* 1. Header Superior Móvil (Estilo Top App Bar) */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3.5 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#222226]">
        <MirrorActionLogo size={32} showText={true} compact={false} />

        <div className="flex items-center gap-2">
          {/* Botón de Sincronización Wear OS */}
          <button
            onClick={onNavigateToWearSync}
            title="Sincronizar con Reloj Wear OS"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#161618] border border-[#222226] text-[#00E5FF] hover:border-[#00E5FF]/40 active:scale-95 transition-all"
            aria-label="Sincronizar con Smartwatch"
          >
            <Watch className="w-4 h-4" />
          </button>

          {/* Botón de Refresco Táctil */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Actualizar cotizaciones"
            className={`flex items-center justify-center w-9 h-9 rounded-xl bg-[#161618] border border-[#222226] text-white hover:border-[#2979FF]/50 active:scale-95 transition-all ${
              isRefreshing ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            aria-label="Actualizar datos"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#2979FF] ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </header>

      {/* 2. Cuerpo del Dashboard */}
      <div className="flex-1 px-4 py-3 space-y-4 pb-24">
        {/* Banner de Resumen de Mercado (KPI Card) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161618] via-[#121214] to-[#161618] border border-[#222226] p-4 shadow-lg shadow-black/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2 text-xs text-[#9E9E9E]">
            <div className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Watchlist Activo</span>
            </div>
            {lastRefreshed && (
              <div className="flex items-center gap-1 text-[11px] text-[#9E9E9E] tabular-nums">
                <Clock className="w-3 h-3 text-[#9E9E9E]" />
                <span>
                  {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div>
              <span className="text-[11px] text-[#9E9E9E] uppercase tracking-wider block">
                Rendimiento Promedio
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-2xl font-black tabular-nums tracking-tight ${
                    isPortfolioPositive ? 'text-[#00E676]' : 'text-[#FF5252]'
                  }`}
                >
                  {isPortfolioPositive ? '+' : ''}
                  {avgChangePercent.toFixed(2)}%
                </span>
                <span
                  className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
                    isPortfolioPositive
                      ? 'bg-[#00E676]/10 text-[#00E676]'
                      : 'bg-[#FF5252]/10 text-[#FF5252]'
                  }`}
                >
                  {isPortfolioPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-1" />
                  )}
                  {isPortfolioPositive ? 'Alza' : 'Baja'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#9E9E9E] block">Símbolos</span>
              <span className="text-xl font-bold text-white tabular-nums">
                {favorites.length}
              </span>
            </div>
          </div>

          {/* Quick Access a Reloj Wear OS */}
          <div className="mt-3.5 pt-3 border-t border-[#222226] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="text-[#9E9E9E]">Ticker en Reloj:</span>
              <span className="text-white font-bold tracking-wide">{primaryWatchTicker}</span>
            </div>
            <button
              onClick={onNavigateToWearSync}
              className="text-xs text-[#00E5FF] hover:text-white font-medium flex items-center gap-1 transition-colors"
            >
              <span>Ver Sync</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. Título de Sección y Barra de Búsqueda Rápida */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Mis Acciones
            </h2>
            <span className="text-xs text-[#9E9E9E] tabular-nums">({favorites.length})</span>
          </div>

          <button
            onClick={onNavigateToSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161618] border border-[#222226] text-xs text-[#00E5FF] hover:border-[#00E5FF]/40 active:scale-95 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="font-medium">Buscar Ticker</span>
          </button>
        </div>

        {/* 4. Lista de Tarjetas de Acciones (FlatList equivalente) */}
        {loading && stockList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-10 h-10 border-2 border-[#222226] border-t-[#00E5FF] rounded-full animate-spin" />
            <span className="text-xs text-[#9E9E9E] tracking-wide">
              Cargando cotizaciones de Alpha Vantage...
            </span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#161618] border border-[#222226]">
            <Sparkles className="w-10 h-10 text-[#00E5FF] mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-bold text-white mb-1">Sin acciones en favoritos</h3>
            <p className="text-xs text-[#9E9E9E] max-w-xs mx-auto mb-4">
              Agrega tus tickers favoritos para darles seguimiento y sincronizarlos con tu reloj.
            </p>
            <button
              onClick={onNavigateToSearch}
              className="px-4 py-2 text-xs font-bold text-black bg-[#00E5FF] rounded-xl hover:bg-[#00E5FF]/90 transition-colors"
            >
              Explorar Acciones
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {favorites.map((symbol) => {
              const quote = quotes[symbol];
              const isPos = quote ? quote.isPositive : true;

              return (
                <div
                  key={symbol}
                  onClick={() => onSelectStock(symbol)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#161618] border border-[#222226] hover:border-[#2979FF]/50 active:scale-[0.99] p-3.5 transition-all shadow-sm hover:shadow-md hover:shadow-[#00E5FF]/5"
                >
                  <div className="flex items-center justify-between">
                    {/* Columna Izquierda: Ticker y Nombre */}
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white tracking-wide group-hover:text-[#00E5FF] transition-colors">
                          {symbol}
                        </span>
                        {symbol === primaryWatchTicker && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2979FF]/15 text-[#00E5FF] font-semibold border border-[#2979FF]/30">
                            WATCH
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#9E9E9E] truncate block mt-0.5 font-medium">
                        {quote?.name || `${symbol} Corp`}
                      </span>
                    </div>

                    {/* Columna Derecha: Precio y Porcentaje */}
                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-white tabular-nums tracking-tight">
                        {quote ? `$${quote.price.toFixed(2)}` : '--'}
                      </div>
                      <div
                        className={`inline-flex items-center justify-end text-xs font-bold tabular-nums mt-0.5 ${
                          isPos ? 'text-[#00E676]' : 'text-[#FF5252]'
                        }`}
                      >
                        {isPos ? (
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                        )}
                        <span>
                          {quote
                            ? `${isPos ? '+' : ''}${quote.changePercent.toFixed(2)}%`
                            : '0.00%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Micro barra del rango de precio del día */}
                  {quote && (
                    <div className="mt-2.5 pt-2 border-t border-[#222226]/60 flex items-center justify-between text-[10px] text-[#9E9E9E]">
                      <div className="flex items-center gap-1.5 tabular-nums">
                        <span>L: ${quote.low.toFixed(1)}</span>
                        <div className="w-16 h-1 bg-[#222226] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isPos ? 'bg-[#00E676]' : 'bg-[#FF5252]'
                            }`}
                            style={{ width: `${quote.dayRangePercentage || 50}%` }}
                          />
                        </div>
                        <span>H: ${quote.high.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#9E9E9E] group-hover:text-white transition-colors">
                        <span>Detalles</span>
                        <ChevronRight className="w-3 h-3 text-[#2979FF]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
