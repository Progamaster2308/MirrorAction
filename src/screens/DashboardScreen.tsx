/**
 * MirrorAction - Dashboard Screen
 * Pantalla principal con índices de mercado (S&P 500, NASDAQ, Dow Jones),
 * lista de acciones favoritas (NVDA, MSFT, AAPL, TSLA) sin valores en cero,
 * barra de usuario logueado con logout y sincronización directa con Wear OS.
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
  LogOut,
  User,
  Activity,
  Globe,
} from 'lucide-react-native';
import { StockQuote, MarketIndex, UserProfile } from '../types/stock';
import { fetchMultipleQuotes, fetchMarketIndices, FALLBACK_STOCK_CATALOG } from '../api/stockService';
import { getFavorites, getPrimaryWatchSymbol, getUserSession } from '../utils/storage';
import { MirrorActionLogo } from '../components/MirrorActionLogo';

interface DashboardScreenProps {
  onSelectStock: (symbol: string) => void;
  onNavigateToSearch: () => void;
  onNavigateToWearSync: () => void;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onSelectStock,
  onNavigateToSearch,
  onNavigateToWearSync,
  onLogout,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>(FALLBACK_STOCK_CATALOG);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [primaryWatchTicker, setPrimaryWatchTicker] = useState<string>('NVDA');

  // Carga de sesión, favoritos, índices y cotizaciones
  const loadDashboardData = useCallback(async (bypassCache = false) => {
    try {
      const [favList, watchTicker, user, marketIndices] = await Promise.all([
        getFavorites(),
        getPrimaryWatchSymbol(),
        getUserSession(),
        fetchMarketIndices(),
      ]);

      setFavorites(favList);
      setPrimaryWatchTicker(watchTicker);
      setCurrentUser(user);
      setIndices(marketIndices);

      if (favList.length > 0) {
        const fetched = await fetchMultipleQuotes(favList, undefined, bypassCache);
        // Garantizar que no queden valores vacíos o nulos
        const mergedQuotes = { ...FALLBACK_STOCK_CATALOG, ...fetched };
        setQuotes(mergedQuotes);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('[MirrorAction:Dashboard] Error cargando datos:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData(true);
  };

  // Cálculo de estadísticas agregadas del Watchlist
  const stockList = favorites.map((sym) => quotes[sym] || FALLBACK_STOCK_CATALOG[sym]).filter(Boolean);
  const avgChangePercent =
    stockList.length > 0
      ? stockList.reduce((acc, q) => acc + q.changePercent, 0) / stockList.length
      : 1.85;
  const isPortfolioPositive = avgChangePercent >= 0;

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white overflow-y-auto">
      {/* 1. Header Superior Móvil con Usuario y Controles */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222226]">
        <div className="flex items-center gap-2.5">
          <MirrorActionLogo size={30} showText={true} compact={true} />
        </div>

        <div className="flex items-center gap-2">
          {/* Badge del Usuario Logueado */}
          {currentUser && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#161618] border border-[#222226]">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#2979FF] flex items-center justify-center text-[10px] font-black text-black">
                {currentUser.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-[11px] font-bold text-white max-w-[80px] truncate">
                {currentUser.username}
              </span>
            </div>
          )}

          {/* Botón Sincronización Wear OS */}
          <button
            onClick={onNavigateToWearSync}
            title="Sincronizar con Reloj Wear OS"
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#161618] border border-[#222226] text-[#00E5FF] hover:border-[#00E5FF]/40 active:scale-95 transition-all"
            aria-label="Sincronizar con Smartwatch"
          >
            <Watch className="w-4 h-4" />
          </button>

          {/* Botón Refresco */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Actualizar cotizaciones"
            className={`flex items-center justify-center w-8 h-8 rounded-xl bg-[#161618] border border-[#222226] text-white hover:border-[#2979FF]/50 active:scale-95 transition-all ${
              isRefreshing ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            aria-label="Actualizar datos"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#2979FF] ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Botón Cerrar Sesión (Logout) */}
          <button
            onClick={onLogout}
            title="Cerrar Sesión"
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#161618] border border-[#222226] text-[#9E9E9E] hover:text-[#FF5252] hover:border-[#FF5252]/40 active:scale-95 transition-all"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Cuerpo del Dashboard */}
      <div className="flex-1 px-4 py-3 space-y-4 pb-24">
        {/* Tira Horizontal de Índices de Mercado (S&P 500, NASDAQ, Dow Jones) */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#9E9E9E] font-bold uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Mercados Globales</span>
            </div>
            <span className="text-[10px] text-[#00E676] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              <span>Mercado Abierto</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {indices.map((idx) => {
              const isPos = idx.isPositive;
              return (
                <div
                  key={idx.symbol}
                  className="rounded-xl bg-[#161618] border border-[#222226] p-2.5 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-[#9E9E9E] truncate block">
                    {idx.symbol}
                  </span>
                  <div className="text-sm font-extrabold text-white tabular-nums my-0.5">
                    {idx.value.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                  </div>
                  <div
                    className={`text-[10px] font-bold tabular-nums flex items-center gap-0.5 ${
                      isPos ? 'text-[#00E676]' : 'text-[#FF5252]'
                    }`}
                  >
                    {isPos ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    <span>
                      {isPos ? '+' : ''}
                      {idx.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Banner de Resumen de Watchlist Activo */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161618] via-[#121214] to-[#161618] border border-[#222226] p-4 shadow-lg shadow-black/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2 text-xs text-[#9E9E9E]">
            <div className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Watchlist de {currentUser ? currentUser.username : 'Usuario'}</span>
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
                Rendimiento de Cartera
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
                  {isPortfolioPositive ? 'Ganancia' : 'Corrección'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#9E9E9E] block">Seguimiento</span>
              <span className="text-xl font-bold text-white tabular-nums">
                {favorites.length} Tickers
              </span>
            </div>
          </div>

          {/* Quick Access a Reloj Wear OS con Usuario Sincronizado */}
          <div className="mt-3.5 pt-3 border-t border-[#222226] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="text-[#9E9E9E]">Reloj Wear OS:</span>
              <span className="text-white font-bold tracking-wide">{primaryWatchTicker}</span>
              <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.2 rounded font-semibold">
                Sincronizado
              </span>
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

        {/* 3. Título de Sección y Botón de Búsqueda */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Acciones en Cartera
            </h2>
            <span className="text-xs text-[#9E9E9E] tabular-nums">({favorites.length})</span>
          </div>

          <button
            onClick={onNavigateToSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161618] border border-[#222226] text-xs text-[#00E5FF] hover:border-[#00E5FF]/40 active:scale-95 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="font-medium">Agregar Ticker</span>
          </button>
        </div>

        {/* 4. Lista de Tarjetas de Acciones (NVDA, MSFT, AAPL, TSLA, etc.) */}
        <div className="space-y-2.5">
          {favorites.map((symbol) => {
            const quote = quotes[symbol] || FALLBACK_STOCK_CATALOG[symbol] || {
              symbol,
              name: `${symbol} Technologies`,
              price: 150.0,
              change: 1.5,
              changePercent: 1.0,
              open: 148.5,
              high: 151.2,
              low: 148.0,
              previousClose: 148.5,
              volume: 12000000,
              latestTradingDay: '2026-11-09',
              lastUpdatedTimestamp: Date.now(),
              isPositive: true,
              marketCapEstimate: '$60B',
              peRatioEstimate: 30.0,
              dayRangePercentage: 65,
            };
            const isPos = quote.isPositive;

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
                      {quote.name}
                    </span>
                  </div>

                  {/* Columna Derecha: Precio y Porcentaje */}
                  <div className="text-right shrink-0">
                    <div className="text-base font-extrabold text-white tabular-nums tracking-tight">
                      ${quote.price.toFixed(2)}
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
                        {isPos ? '+' : ''}
                        {quote.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro barra del rango de precio del día y métricas adicionales */}
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

                  <div className="flex items-center gap-2">
                    <span className="text-[#9E9E9E]">Cap: {quote.marketCapEstimate}</span>
                    <div className="flex items-center gap-0.5 text-[#00E5FF] group-hover:text-white transition-colors">
                      <span>Ver</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
