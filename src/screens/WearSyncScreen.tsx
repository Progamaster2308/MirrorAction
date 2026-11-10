/**
 * MirrorAction - Wear OS Synchronization Companion Screen
 * Pantalla dedicada a la gestión del enlace con el smartwatch Wear OS
 * (Repositorio de referencia: https://github.com/Progamaster2308/reloj).
 * 
 * Permite visualizar el Tile / Complicación en un simulador circular en vivo con el
 * usuario autenticado, inspeccionar el paquete JSON estandarizado V2
 * y exportarlo directamente para depuración por ADB o DataClient.
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Watch,
  Copy,
  Check,
  Download,
  Send,
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  FileCode,
  Smartphone,
  ExternalLink,
  User,
  ShieldCheck,
} from 'lucide-react-native';
import { StockQuote, WearOSSyncPayload, UserProfile } from '../types/stock';
import { fetchMultipleQuotes, FALLBACK_STOCK_CATALOG } from '../api/stockService';
import {
  getFavorites,
  getPrimaryWatchSymbol,
  setPrimaryWatchSymbol,
  buildWearOSSyncPacket,
  getUserSession,
} from '../utils/storage';
import {
  WEAR_DATA_LAYER_PATHS,
  getComplicationFormat,
  exportSyncPayloadAsBlob,
} from '../utils/wearSync';

interface WearSyncScreenProps {
  onBack: () => void;
  onSelectStock: (symbol: string) => void;
}

export const WearSyncScreen: React.FC<WearSyncScreenProps> = ({ onBack, onSelectStock }) => {
  const [favorites, setFavorites] = useState<string[]>(['NVDA', 'MSFT', 'AAPL', 'TSLA']);
  const [primarySymbol, setPrimarySymbol] = useState<string>('NVDA');
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>(FALLBACK_STOCK_CATALOG);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [jsonPayload, setJsonPayload] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);
  const [guideTab, setGuideTab] = useState<'json' | 'android_studio' | 'adb'>('json');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [favs, primary, user] = await Promise.all([
      getFavorites(),
      getPrimaryWatchSymbol(),
      getUserSession(),
    ]);

    setFavorites(favs);
    setPrimarySymbol(primary);
    setCurrentUser(user);

    const fetchedQuotes = await fetchMultipleQuotes(favs);
    const merged = { ...FALLBACK_STOCK_CATALOG, ...fetchedQuotes };
    setQuotes(merged);

    const packet: WearOSSyncPayload = await buildWearOSSyncPacket(merged);
    setJsonPayload(JSON.stringify(packet, null, 2));
  };

  const handleSelectPrimary = async (symbol: string) => {
    await setPrimaryWatchSymbol(symbol);
    setPrimarySymbol(symbol);
    const packet = await buildWearOSSyncPacket(quotes);
    setJsonPayload(JSON.stringify(packet, null, 2));
    showToast(`Ticker ${symbol} establecido para la carátula`);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Payload JSON copiado al portapapeles');
    } catch {
      showToast('No se pudo copiar automáticamente');
    }
  };

  const handleDownloadJson = () => {
    exportSyncPayloadAsBlob(jsonPayload);
    showToast('Archivo JSON descargado para Wear OS');
  };

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('¡Datos sincronizados con Wear OS DataClient!');
    }, 700);
  };

  const showToast = (msg: string) => {
    setSyncSuccessToast(msg);
    setTimeout(() => {
      setSyncSuccessToast((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const primaryQuote = quotes[primarySymbol] || FALLBACK_STOCK_CATALOG[primarySymbol];
  const complication = getComplicationFormat(primaryQuote);
  const isPos = primaryQuote ? primaryQuote.isPositive : true;

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white overflow-y-auto">
      {/* 1. Top Bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222226]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#161618] border border-[#222226] text-white hover:text-[#00E5FF] hover:border-[#00E5FF]/40 active:scale-95 transition-all"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-none">
              Wear OS Companion
            </h1>
            <span className="text-[11px] text-[#00E5FF] font-medium">
              Sincronización Bidireccional
            </span>
          </div>
        </div>

        <button
          onClick={handleSimulateSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2979FF] hover:bg-[#2979FF]/90 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          <Send className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
          <span>{isSyncing ? 'Sincronizando...' : 'Transmitir'}</span>
        </button>
      </header>

      {/* Toast Notificación */}
      {syncSuccessToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-lg bg-[#00E676] text-black text-xs font-bold shadow-lg shadow-[#00E676]/30 flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check className="w-3.5 h-3.5" />
          <span>{syncSuccessToast}</span>
        </div>
      )}

      {/* 2. Cuerpo Principal */}
      <div className="flex-1 px-4 py-4 space-y-5 pb-24">
        {/* Banner de Estado de Usuario Autenticado en el Reloj */}
        <div className="rounded-xl bg-[#161618] border border-[#222226] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#2979FF] flex items-center justify-center text-xs font-bold text-black">
              {currentUser ? currentUser.username.slice(0, 2).toUpperCase() : 'TR'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">
                  {currentUser ? currentUser.username : 'Trader Autenticado'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
              </div>
              <span className="text-[11px] text-[#9E9E9E]">
                {currentUser ? currentUser.email : 'usuario@mirroraction.app'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#00E676] font-semibold bg-[#00E676]/10 px-2 py-0.5 rounded block">
              Enlace Activo
            </span>
            <span className="text-[10px] text-[#9E9E9E] mt-0.5 block">
              {favorites.length} Tickers en Reloj
            </span>
          </div>
        </div>

        {/* Simulador Circular de Carátula Wear OS con Favoritos Activos */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[11px] text-[#9E9E9E] uppercase tracking-wider mb-2 font-medium">
            Vista Previa de Carátula (Tile / Watchface)
          </span>

          {/* Bisel del Reloj Inteligente Circular */}
          <div className="relative w-48 h-48 rounded-full bg-gradient-to-b from-[#222226] to-[#0A0A0A] p-2 shadow-2xl shadow-black/80 border-2 border-[#2979FF]/40 flex items-center justify-center">
            {/* Pantalla OLED Circular */}
            <div className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${
                    isPos ? '#00E676' : '#FF5252'
                  } 0%, transparent 70%)`,
                }}
              />

              {/* Hora y Usuario en el Reloj */}
              <div className="flex items-center gap-1 text-[9px] text-[#9E9E9E] font-mono tracking-wider tabular-nums mb-1">
                <span>10:09 AM</span>
                <span>·</span>
                <span className="text-[#00E5FF]">{currentUser?.username || 'Trader'}</span>
              </div>

              {/* Ticker Activo */}
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-white tracking-wider">
                  {complication.title}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
              </div>

              {/* Precio y Variación */}
              <div className="text-lg font-black text-white tabular-nums tracking-tight my-0.5">
                {complication.shortText}
              </div>

              <div
                className={`text-[11px] font-bold tabular-nums flex items-center justify-center gap-0.5 ${
                  isPos ? 'text-[#00E676]' : 'text-[#FF5252]'
                }`}
              >
                {isPos ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{complication.percentValue}</span>
              </div>

              {/* Indicador de Favoritos Poblados */}
              <div className="mt-1 flex items-center gap-1 text-[9px] text-[#00E5FF]">
                <span>✓</span>
                <span className="font-semibold">{favorites.join(' · ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de Ticker Prioritario para el Reloj */}
        <div className="rounded-xl bg-[#161618] border border-[#222226] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Ticker Principal en Reloj
            </span>
            <span className="text-[11px] text-[#00E5FF] font-medium">Toca para cambiar</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {favorites.map((sym) => {
              const isSelected = sym === primarySymbol;
              return (
                <button
                  key={sym}
                  onClick={() => handleSelectPrimary(sym)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#00E5FF] text-black shadow-sm'
                      : 'bg-[#0A0A0A] text-[#9E9E9E] border border-[#222226] hover:text-white'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pestañas de Inspección y Guía de Arquitectura */}
        <div className="rounded-xl bg-[#161618] border border-[#222226] p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Sincronización con Wear OS
            </span>
            <div className="flex items-center gap-1 bg-[#0A0A0A] p-0.5 rounded-lg border border-[#222226]">
              <button
                onClick={() => setGuideTab('json')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  guideTab === 'json' ? 'bg-[#2979FF] text-white' : 'text-[#9E9E9E] hover:text-white'
                }`}
              >
                Payload V2
              </button>
              <button
                onClick={() => setGuideTab('android_studio')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  guideTab === 'android_studio'
                    ? 'bg-[#2979FF] text-white'
                    : 'text-[#9E9E9E] hover:text-white'
                }`}
              >
                Multi-Módulo
              </button>
              <button
                onClick={() => setGuideTab('adb')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  guideTab === 'adb' ? 'bg-[#2979FF] text-white' : 'text-[#9E9E9E] hover:text-white'
                }`}
              >
                DataLayer
              </button>
            </div>
          </div>

          {/* Vista 1: JSON V2 con Usuario y Favoritos */}
          {guideTab === 'json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#9E9E9E] font-mono">
                  Ruta: <span className="text-[#00E5FF]">{WEAR_DATA_LAYER_PATHS.STOCKS_SYNC}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0A0A0A] border border-[#222226] text-xs text-[#00E5FF] hover:border-[#00E5FF]/40 active:scale-95 transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#00E676]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0A0A0A] border border-[#222226] text-xs text-white hover:text-[#00E5FF] active:scale-95 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>
              <pre className="max-h-48 overflow-y-auto p-3 rounded-lg bg-[#0A0A0A] border border-[#222226] text-[11px] text-emerald-400 font-mono leading-relaxed select-all">
                {jsonPayload}
              </pre>
            </div>
          )}

          {/* Vista 2: Multi-Módulo Android (:app, :core:model, :core:network, etc.) */}
          {guideTab === 'android_studio' && (
            <div className="space-y-2 text-xs text-[#9E9E9E] leading-relaxed">
              <p className="text-white font-semibold">
                Estructura de MirrorAction en Android Studio (Kotlin, Hilt 2.52, KSP 2.0.21, Toolchain 17):
              </p>
              <ul className="space-y-1 pl-1">
                <li>• <strong className="text-white">:core:model</strong>: Modelos de datos compartidos (`UserSession`, `StockQuote`, `MarketIndex`).</li>
                <li>• <strong className="text-white">:core:network</strong>: `AlphaVantageApi`, `NetworkModule` con Retrofit y OkHttp inyectados vía Hilt.</li>
                <li>• <strong className="text-white">:core:database</strong>: `UserPreferencesDataStore` y Room Database para persistencia local segura.</li>
                <li>• <strong className="text-white">:core:data</strong>: `StockRepository` y `AuthRepository` con sincronización a Wear OS.</li>
                <li>• <strong className="text-white">:app</strong>: Jetpack Compose con `LoginScreen` y `DashboardScreen`.</li>
              </ul>
            </div>
          )}

          {/* Vista 3: Vinculación DataLayer con el repositorio reloj */}
          {guideTab === 'adb' && (
            <div className="space-y-2 text-xs text-[#9E9E9E] leading-relaxed">
              <span className="text-white font-semibold block">
                Recepción en el Smartwatch (`https://github.com/Progamaster2308/reloj`):
              </span>
              <p>
                El smartwatch implementa un <code className="text-[#00E5FF]">WearableListenerService</code> que escucha en <code className="text-white">/mirror_action/stocks</code>. Al deserializar el payload, almacena los favoritos y la sesión de usuario en Room/DataStore del reloj, actualizando instantáneamente la Complicación y el Tile sin dejarlo "Sin favoritos".
              </p>
              <pre className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#222226] text-[11px] font-mono text-emerald-400">
                adb -d forward tcp:5601 tcp:5601
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
