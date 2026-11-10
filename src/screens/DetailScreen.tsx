/**
 * MirrorAction - Detail Screen
 * Vista detallada de instrumento financiero con métricas avanzadas
 * organizadas en tarjetas tipo dashboard, selector de rango de tiempo interactivo,
 * indicador de rango de sesión y sincronización directa con Wear OS.
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Star,
  Watch,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Calendar,
  Layers,
  Activity,
  Check,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react-native';
import { StockQuote } from '../types/stock';
import { fetchGlobalQuote } from '../api/stockService';
import {
  isFavorite,
  toggleFavorite,
  getPrimaryWatchSymbol,
  setPrimaryWatchSymbol,
} from '../utils/storage';

interface DetailScreenProps {
  symbol: string;
  onBack: () => void;
  onNavigateToWearSync: () => void;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({
  symbol,
  onBack,
  onNavigateToWearSync,
}) => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFav, setIsFav] = useState<boolean>(false);
  const [isPrimaryWatch, setIsPrimaryWatch] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const loadStockDetail = useCallback(
    async (bypass = false) => {
      try {
        const [stockData, favStatus, currentPrimaryWatch] = await Promise.all([
          fetchGlobalQuote(symbol, undefined, bypass),
          isFavorite(symbol),
          getPrimaryWatchSymbol(),
        ]);
        setQuote(stockData);
        setIsFav(favStatus);
        setIsPrimaryWatch(currentPrimaryWatch === symbol.toUpperCase().trim());
      } catch (err) {
        console.error('[MirrorAction:Detail] Error cargando detalle:', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [symbol]
  );

  useEffect(() => {
    loadStockDetail();
  }, [loadStockDetail]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStockDetail(true);
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await toggleFavorite(symbol);
      setIsFav(res.isAdded);
      showToast(res.isAdded ? `${symbol} agregado a favoritos` : `${symbol} removido de favoritos`);
    } catch (err) {
      console.error('[MirrorAction:Detail] Error modificando favoritos:', err);
    }
  };

  const handleSetAsPrimaryWatch = async () => {
    try {
      await setPrimaryWatchSymbol(symbol);
      setIsPrimaryWatch(true);
      showToast(`${symbol} configurado como ticker en Smartwatch`);
    } catch (err) {
      console.error('[MirrorAction:Detail] Error configurando ticker en reloj:', err);
    }
  };

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => {
      setFeedbackToast((curr) => (curr === message ? null : curr));
    }, 2200);
  };

  const isPos = quote ? quote.isPositive : true;

  // Generador de puntos para la curva interactiva SVG
  const generateChartPoints = () => {
    const base = quote?.price || 150;
    const direction = isPos ? 1 : -1;
    const points = [
      { x: 0, y: base * (1 - 0.015 * direction) },
      { x: 15, y: base * (1 - 0.008 * direction) },
      { x: 30, y: base * (1 + 0.005 * direction) },
      { x: 45, y: base * (1 - 0.002 * direction) },
      { x: 60, y: base * (1 + 0.012 * direction) },
      { x: 75, y: base * (1 + 0.008 * direction) },
      { x: 90, y: base * (1 + 0.018 * direction) },
      { x: 100, y: base },
    ];

    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const span = maxY - minY || 1;

    // Normalizar a viewBox 0 0 100 50
    return points
      .map((p) => {
        const normY = 45 - ((p.y - minY) / span) * 35;
        return `${p.x},${normY.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white overflow-y-auto">
      {/* 1. Header con Controles Rápidos */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222226]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#161618] border border-[#222226] text-white hover:text-[#00E5FF] hover:border-[#00E5FF]/40 active:scale-95 transition-all"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-none">
              {symbol}
            </h1>
            <span className="text-[11px] text-[#9E9E9E] font-medium truncate block max-w-[160px]">
              {quote?.name || 'Instrumento Financiero'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Asignar a Watchface / Complicación */}
          <button
            onClick={handleSetAsPrimaryWatch}
            title={isPrimaryWatch ? 'Ticker activo en reloj' : 'Fijar en Smartwatch'}
            className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all active:scale-95 ${
              isPrimaryWatch
                ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                : 'bg-[#161618] border-[#222226] text-[#9E9E9E] hover:text-white hover:border-[#2979FF]'
            }`}
            aria-label="Fijar en reloj"
          >
            <Watch className="w-4 h-4" />
          </button>

          {/* Botón Favoritos */}
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all active:scale-95 ${
              isFav
                ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]'
                : 'bg-[#161618] border-[#222226] text-[#9E9E9E] hover:text-white'
            }`}
            aria-label="Favorito"
          >
            <Star className={`w-4 h-4 ${isFav ? 'fill-[#00E5FF] text-[#00E5FF]' : ''}`} />
          </button>

          {/* Botón Refrescar */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#161618] border border-[#222226] text-[#2979FF] hover:border-[#2979FF]/50 active:scale-95 transition-all"
            aria-label="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Toast Notificación Flotante */}
      {feedbackToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-lg bg-[#2979FF] text-white text-xs font-semibold shadow-lg shadow-[#2979FF]/30 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-3.5 h-3.5" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 2. Cuerpo Principal */}
      <div className="flex-1 px-4 py-3 space-y-4 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-2 border-[#222226] border-t-[#00E5FF] rounded-full animate-spin" />
            <span className="text-xs text-[#9E9E9E]">Obteniendo cotización en vivo...</span>
          </div>
        ) : (
          <>
            {/* Tarjeta Hero: Precio y Variación */}
            <div className="rounded-2xl bg-[#161618] border border-[#222226] p-4.5 shadow-md">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-[#9E9E9E] uppercase tracking-wider block font-medium">
                    Precio de Mercado
                  </span>
                  <div className="text-3xl font-black text-white tabular-nums tracking-tight mt-0.5">
                    ${quote ? quote.price.toFixed(2) : '--'}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1 text-sm font-extrabold tabular-nums px-2.5 py-1 rounded-lg ${
                      isPos ? 'bg-[#00E676]/15 text-[#00E676]' : 'bg-[#FF5252]/15 text-[#FF5252]'
                    }`}
                  >
                    {isPos ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {quote ? `${isPos ? '+' : ''}${quote.change.toFixed(2)}` : '0.00'} (
                      {quote ? `${isPos ? '+' : ''}${quote.changePercent.toFixed(2)}%` : '0%'})
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9E9E9E] block mt-1">
                    Actualizado: {quote?.latestTradingDay}
                  </span>
                </div>
              </div>

              {/* Selector de Rango de Tiempo (Segmented Control) */}
              <div className="mt-4 pt-3 border-t border-[#222226] flex items-center justify-between">
                <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-lg border border-[#222226]">
                  {(['1D', '1W', '1M', '1Y'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeframe(range)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        selectedTimeframe === range
                          ? 'bg-[#2979FF] text-white shadow-sm'
                          : 'text-[#9E9E9E] hover:text-white'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-[#00E5FF] font-medium flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>En vivo</span>
                </div>
              </div>

              {/* Gráfico Sparkline de Tendencia SVG */}
              <div className="mt-4 h-24 w-full relative">
                <svg
                  viewBox="0 0 100 50"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={isPos ? '#00E676' : '#FF5252'}
                        stopOpacity="0.28"
                      />
                      <stop
                        offset="100%"
                        stopColor={isPos ? '#00E676' : '#FF5252'}
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Curva de cotización */}
                  <polyline
                    fill="none"
                    stroke={isPos ? '#00E676' : '#FF5252'}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={generateChartPoints()}
                  />
                </svg>
              </div>

              {/* Barra de Rango de Sesión: Mínimo a Máximo del Día */}
              {quote && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#9E9E9E]">
                    <span>Mín. ${quote.low.toFixed(2)}</span>
                    <span className="text-white font-medium">Rango Diario</span>
                    <span>Máx. ${quote.high.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden border border-[#222226]">
                    <div
                      className={`h-full rounded-full ${isPos ? 'bg-[#00E676]' : 'bg-[#FF5252]'}`}
                      style={{ width: `${quote.dayRangePercentage || 50}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Cuadrícula de Métricas Financieras Avanzadas (2 Columnas) */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9E9E]">
                Métricas del Instrumento
              </h2>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Apertura */}
                <div className="p-3 rounded-xl bg-[#161618] border border-[#222226]">
                  <span className="text-[11px] text-[#9E9E9E] block">Apertura (Open)</span>
                  <span className="text-base font-extrabold text-white tabular-nums">
                    ${quote ? quote.open.toFixed(2) : '--'}
                  </span>
                </div>

                {/* Cierre Previo */}
                <div className="p-3 rounded-xl bg-[#161618] border border-[#222226]">
                  <span className="text-[11px] text-[#9E9E9E] block">Cierre Anterior</span>
                  <span className="text-base font-extrabold text-white tabular-nums">
                    ${quote ? quote.previousClose.toFixed(2) : '--'}
                  </span>
                </div>

                {/* Máximo del Día */}
                <div className="p-3 rounded-xl bg-[#161618] border border-[#222226]">
                  <span className="text-[11px] text-[#9E9E9E] block">Máximo (High)</span>
                  <span className="text-base font-extrabold text-[#00E676] tabular-nums">
                    ${quote ? quote.high.toFixed(2) : '--'}
                  </span>
                </div>

                {/* Mínimo del Día */}
                <div className="p-3 rounded-xl bg-[#161618] border border-[#222226]">
                  <span className="text-[11px] text-[#9E9E9E] block">Mínimo (Low)</span>
                  <span className="text-base font-extrabold text-[#FF5252] tabular-nums">
                    ${quote ? quote.low.toFixed(2) : '--'}
                  </span>
                </div>

                {/* Volumen Transaccionado */}
                <div className="p-3 rounded-xl bg-[#161618] border border-[#222226]">
                  <span className="text-[11px] text-[#9E9E9E] block">Volumen</span>
                  <span className="text-base font-extrabold text-white tabular-nums">
                    {quote ? quote.volume.toLocaleString() : '--'}
                  </span>
                </div>

                {/* Capitalización Estimada */}
                <div className="p-3 rounded-xl bg-[#161618] border border-[#222226]">
                  <span className="text-[11px] text-[#9E9E9E] block">Cap. de Mercado</span>
                  <span className="text-base font-extrabold text-white tabular-nums">
                    {quote?.marketCapEstimate || 'N/D'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Tarjeta de Sincronización Wear OS para este Ticker */}
            <div className="p-3.5 rounded-xl bg-[#161618] border border-[#222226] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF]">
                  <Watch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Smartwatch Wear OS</h3>
                  <p className="text-[11px] text-[#9E9E9E]">
                    {isPrimaryWatch
                      ? 'Este ticker se muestra en la carátula principal'
                      : 'Puedes fijar esta acción en la carátula'}
                  </p>
                </div>
              </div>

              <button
                onClick={isPrimaryWatch ? onNavigateToWearSync : handleSetAsPrimaryWatch}
                className="px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-[#2979FF]/90 text-white text-xs font-bold transition-all active:scale-95"
              >
                {isPrimaryWatch ? 'Ver Sync' : 'Fijar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
