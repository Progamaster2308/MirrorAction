/**
 * MirrorAction - Wear OS Synchronization Companion Screen
 * Pantalla dedicada a la gestión del enlace con el smartwatch Wear OS
 * (Repositorio de referencia: https://github.com/Progamaster2308/reloj).
 * 
 * Permite visualizar el Tile / Complicación en un simulador circular en vivo,
 * seleccionar el ticker prioritario, inspeccionar el paquete JSON estandarizado
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
} from 'lucide-react';
import { StockQuote, WearOSSyncPayload } from '../types/stock';
import { fetchMultipleQuotes } from '../api/stockService';
import {
  getFavorites,
  getPrimaryWatchSymbol,
  setPrimaryWatchSymbol,
  buildWearOSSyncPacket,
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [primarySymbol, setPrimarySymbol] = useState<string>('NVDA');
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [jsonPayload, setJsonPayload] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);
  const [guideTab, setGuideTab] = useState<'json' | 'android_studio' | 'adb'>('json');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const favs = await getFavorites();
    const primary = await getPrimaryWatchSymbol();
    setFavorites(favs);
    setPrimarySymbol(primary);

    if (favs.length > 0) {
      const fetchedQuotes = await fetchMultipleQuotes(favs);
      setQuotes(fetchedQuotes);

      const packet: WearOSSyncPayload = await buildWearOSSyncPacket(fetchedQuotes);
      setJsonPayload(JSON.stringify(packet, null, 2));
    }
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
      showToast('¡Paquete transmitido a Wearable Data Layer!');
    }, 900);
  };

  const showToast = (msg: string) => {
    setSyncSuccessToast(msg);
    setTimeout(() => {
      setSyncSuccessToast((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const primaryQuote = quotes[primarySymbol];
  const complication = getComplicationFormat(primaryQuote);
  const isPos = primaryQuote ? primaryQuote.isPositive : true;

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white overflow-y-auto">
      {/* 1. Top Bar */}
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
              Wear OS Companion
            </h1>
            <span className="text-[11px] text-[#00E5FF] font-medium">
              Sincronización con Smartwatch
            </span>
          </div>
        </div>

        <button
          onClick={handleSimulateSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2979FF] hover:bg-[#2979FF]/90 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          <Send className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
          <span>{isSyncing ? 'Enviando...' : 'Sincronizar'}</span>
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
        {/* Simulador Circular de Carátula Wear OS */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[11px] text-[#9E9E9E] uppercase tracking-wider mb-2 font-medium">
            Vista Previa de Carátula (Tile / Watchface)
          </span>

          {/* Bisel del Reloj Inteligente Circular */}
          <div className="relative w-48 h-48 rounded-full bg-gradient-to-b from-[#222226] to-[#0A0A0A] p-2 shadow-2xl shadow-black/80 border-2 border-[#2979FF]/40 flex items-center justify-center">
            {/* Pantalla OLED Circular */}
            <div className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
              {/* Resplandor sutil en la corona del reloj */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${
                    isPos ? '#00E676' : '#FF5252'
                  } 0%, transparent 70%)`,
                }}
              />

              {/* Hora simulada en el reloj */}
              <span className="text-[10px] text-[#9E9E9E] font-mono tracking-widest tabular-nums mb-1">
                10:09 AM
              </span>

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

              {/* Indicador de favoritos en el reloj */}
              <div className="mt-1 text-[9px] text-[#9E9E9E] tracking-tighter">
                {favorites.length} tickers en memoria
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

        {/* Selector de Pestañas de Integración con el Repo Reloj */}
        <div className="rounded-xl bg-[#161618] border border-[#222226] p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Enlace con Repo Reloj
            </span>
            <div className="flex items-center gap-1 bg-[#0A0A0A] p-0.5 rounded-lg border border-[#222226]">
              <button
                onClick={() => setGuideTab('json')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  guideTab === 'json' ? 'bg-[#2979FF] text-white' : 'text-[#9E9E9E] hover:text-white'
                }`}
              >
                Esquema JSON
              </button>
              <button
                onClick={() => setGuideTab('android_studio')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  guideTab === 'android_studio'
                    ? 'bg-[#2979FF] text-white'
                    : 'text-[#9E9E9E] hover:text-white'
                }`}
              >
                Android Studio
              </button>
              <button
                onClick={() => setGuideTab('adb')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  guideTab === 'adb' ? 'bg-[#2979FF] text-white' : 'text-[#9E9E9E] hover:text-white'
                }`}
              >
                Comandos ADB
              </button>
            </div>
          </div>

          {/* Vista 1: JSON */}
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

          {/* Vista 2: Cómo abrir y compilar el repo en Android Studio */}
          {guideTab === 'android_studio' && (
            <div className="space-y-2 text-xs text-[#9E9E9E] leading-relaxed">
              <p className="text-white font-semibold">
                El repositorio <code className="text-[#00E5FF]">Progamaster2308/reloj</code> es una app nativa de Wear OS (Kotlin/Java). Se ejecuta en Android Studio:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>Clona el repo: <code className="text-emerald-400 font-mono text-[11px]">git clone https://github.com/Progamaster2308/reloj.git</code></li>
                <li>Abre la carpeta en <strong>Android Studio</strong> (*File &gt; Open*).</li>
                <li>En <strong>Device Manager</strong>, haz clic en <em>Create Device &gt; Wear OS &gt; Wear OS Large Round</em>.</li>
                <li>Descarga la imagen del sistema <strong>Wear OS 4 (API 33)</strong> o superior y dale a <em>Finish</em>.</li>
                <li>Presiona el botón de <strong>Run ▶ (Shift + F10)</strong> para compilar e instalar la app directamente en el emulador del reloj.</li>
              </ol>
            </div>
          )}

          {/* Vista 3: Vinculación Móvil - Reloj por ADB */}
          {guideTab === 'adb' && (
            <div className="space-y-2 text-xs text-[#9E9E9E] leading-relaxed">
              <span className="text-white font-semibold block">
                Emparejar el Emulador del Teléfono con el Emulador del Reloj:
              </span>
              <p>Para que la app de Expo y el reloj se comuniquen en tu laptop:</p>
              <pre className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#222226] text-[11px] font-mono text-emerald-400">
                adb -d forward tcp:5601 tcp:5601
              </pre>
              <p>
                Si tienes un smartwatch físico (Galaxy Watch, Pixel Watch), activa <em>Depuración por Wi-Fi</em> en el reloj y conéctalo con:
              </p>
              <pre className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#222226] text-[11px] font-mono text-[#00E5FF]">
                adb connect 192.168.1.XX:5555
              </pre>
            </div>
          )}
        </div>

        {/* Tarjeta Informativa de Integración con el Repositorio de Wear OS */}
        <div className="rounded-xl bg-gradient-to-br from-[#161618] to-[#121214] border border-[#222226] p-3.5 space-y-2 text-xs text-[#9E9E9E] leading-relaxed">
          <div className="flex items-center justify-between text-white font-bold">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#2979FF]" />
              <span>Conexión con repo Progamaster2308/reloj</span>
            </div>
            <a
              href="https://github.com/Progamaster2308/reloj"
              target="_blank"
              rel="noreferrer"
              className="text-[#00E5FF] hover:underline flex items-center gap-0.5 text-[11px]"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p>
            El reloj inteligente escucha eventos en el canal{' '}
            <code className="text-[#00E5FF] bg-black/50 px-1 py-0.5 rounded">
              /mirror_action/stocks
            </code>{' '}
            mediante el servicio de fondo <code className="text-white">WearableListenerService</code> en Kotlin. Al recibir el paquete, actualiza la base de datos Room del reloj o los DataStore Preferences sin consumir cuota de red adicional en el smartwatch.
          </p>
        </div>
      </div>
    </div>
  );
};
