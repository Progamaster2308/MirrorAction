/**
 * MirrorAction - Main Application Entrypoint & Mobile Simulator
 * Aplicación móvil de seguimiento bursátil y sincronización con smartwatch Wear OS.
 * 
 * Implementa una arquitectura modular limpia y un viewport móvil ultra-responsivo
 * con pantalla de inicio de sesión (LoginScreen), navegación ergonómica por pestañas,
 * soporte de API Key para Alpha Vantage y puente de sincronización bidireccional con Wear OS.
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Watch,
  Sliders,
  Sparkles,
  Key,
  Smartphone,
  ExternalLink,
  Code2,
  Check,
  Wifi,
  Battery,
  Shield,
  Layers,
  ChevronRight,
  Info,
  User,
  LogOut,
  FolderGit2,
} from 'lucide-react-native';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { SearchScreen } from './screens/SearchScreen';
import { DetailScreen } from './screens/DetailScreen';
import { WearSyncScreen } from './screens/WearSyncScreen';
import { MirrorActionLogo } from './components/MirrorActionLogo';
import {
  getCustomApiKey,
  saveCustomApiKey,
  getFavorites,
  getPrimaryWatchSymbol,
  getUserSession,
  clearUserSession,
} from './utils/storage';
import { DEFAULT_API_KEY, getActiveApiKey, fetchMultipleQuotes, FALLBACK_STOCK_CATALOG } from './api/stockService';
import { StockQuote, UserProfile } from './types/stock';
import { getComplicationFormat } from './utils/wearSync';

type AppTab = 'dashboard' | 'search' | 'detail' | 'wear';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedStock, setSelectedStock] = useState<string>('NVDA');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [showExpoGuideModal, setShowExpoGuideModal] = useState<boolean>(false);
  const [showAndroidArchModal, setShowAndroidArchModal] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [activeKeyDisplay, setActiveKeyDisplay] = useState<string>(DEFAULT_API_KEY);
  const [savedKeyToast, setSavedKeyToast] = useState<string | null>(null);

  // Datos para el widget de Wear OS en el panel lateral (desktop)
  const [sideWatchQuote, setSideWatchQuote] = useState<StockQuote | null>(FALLBACK_STOCK_CATALOG['NVDA']);
  const [sideWatchTicker, setSideWatchTicker] = useState<string>('NVDA');

  // Inicializar estado de sesión de usuario y datos
  useEffect(() => {
    checkInitialAuth();
    refreshKeyStatus();
    loadCompanionWatchData();
  }, [selectedStock, activeTab]);

  const checkInitialAuth = async () => {
    try {
      const user = await getUserSession();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsAuthChecking(false);
    }
  };

  const refreshKeyStatus = async () => {
    const key = await getActiveApiKey();
    setActiveKeyDisplay(key);
    const stored = await getCustomApiKey();
    setCustomKeyInput(stored || '');
  };

  const loadCompanionWatchData = async () => {
    try {
      const primary = await getPrimaryWatchSymbol();
      setSideWatchTicker(primary);
      const quotes = await fetchMultipleQuotes([primary]);
      if (quotes[primary]) {
        setSideWatchQuote(quotes[primary]);
      } else if (FALLBACK_STOCK_CATALOG[primary]) {
        setSideWatchQuote(FALLBACK_STOCK_CATALOG[primary]);
      }
    } catch {
      // Usar fallback
      if (FALLBACK_STOCK_CATALOG[sideWatchTicker]) {
        setSideWatchQuote(FALLBACK_STOCK_CATALOG[sideWatchTicker]);
      }
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    showNotificationToast(`Bienvenido, ${user.username}`);
  };

  const handleLogout = async () => {
    await clearUserSession();
    setCurrentUser(null);
    setActiveTab('dashboard');
    showNotificationToast('Sesión cerrada');
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCustomApiKey(customKeyInput);
    await refreshKeyStatus();
    setShowApiKeyModal(false);
    showNotificationToast('Clave de Alpha Vantage actualizada');
  };

  const showNotificationToast = (msg: string) => {
    setSavedKeyToast(msg);
    setTimeout(() => setSavedKeyToast(null), 3000);
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setActiveTab('detail');
  };

  const complication = getComplicationFormat(sideWatchQuote || undefined);
  const isWatchPos = sideWatchQuote ? sideWatchQuote.isPositive : true;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#00E5FF] selection:text-black">
      {/* 1. Barra de Navegación Superior Desktop / Header Contract */}
      <header className="h-14 border-b border-[#222226] bg-[#0A0A0A]/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between gap-8 z-30 shrink-0">
        <MirrorActionLogo size={32} showText={true} compact={false} />

        <div className="flex items-center gap-2.5">
          {/* Badge del Usuario Autenticado en Desktop */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161618] border border-[#222226]">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#2979FF] flex items-center justify-center text-[10px] font-black text-black">
                {currentUser.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white max-w-[100px] truncate">
                {currentUser.username}
              </span>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="text-[#9E9E9E] hover:text-[#FF5252] ml-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161618] border border-[#222226] text-xs text-[#9E9E9E]">
              <User className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Sin iniciar sesión</span>
            </div>
          )}

          {/* Botón de Arquitectura Android Multi-Módulo */}
          <button
            onClick={() => setShowAndroidArchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 text-xs font-semibold text-[#00E5FF] transition-all active:scale-95"
            title="Ver Arquitectura Kotlin / Hilt"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="hidden md:inline">Kotlin Multi-Módulo</span>
          </button>

          {/* Botón de Guía de Ejecución Expo */}
          <button
            onClick={() => setShowExpoGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF]/15 border border-[#2979FF]/40 hover:bg-[#2979FF]/25 text-xs font-semibold text-[#2979FF] transition-all active:scale-95"
            title="Cómo ejecutar en celular o emulador"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expo SDK 58</span>
          </button>

          {/* Botón para configurar API Key */}
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161618] border border-[#222226] hover:border-[#00E5FF]/40 text-xs font-semibold text-[#9E9E9E] hover:text-white transition-all active:scale-95"
            title="Configurar clave de Alpha Vantage"
          >
            <Key className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="hidden lg:inline">API Key:</span>
            <span className="font-mono text-white text-[11px] truncate max-w-[70px]">
              {activeKeyDisplay === DEFAULT_API_KEY ? 'DEMO_KEY' : '••••' + activeKeyDisplay.slice(-4)}
            </span>
          </button>

          {/* Enlace al Repositorio del Reloj Wear OS */}
          <a
            href="https://github.com/Progamaster2308/reloj"
            target="_blank"
            rel="noreferrer"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161618] border border-[#222226] hover:border-[#2979FF]/50 text-xs font-semibold text-[#00E5FF] transition-all"
          >
            <Watch className="w-3.5 h-3.5" />
            <span>Wear OS</span>
            <ExternalLink className="w-3 h-3 text-[#9E9E9E]" />
          </a>
        </div>
      </header>

      {/* Toast Notificación */}
      {savedKeyToast && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 rounded-xl bg-[#00E676] text-black text-xs font-bold shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedKeyToast}</span>
        </div>
      )}

      {/* 2. Área de Trabajo Principal: Chasis Móvil + Panel de Control y Smartwatch */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda / Central: Marco Móvil Ultra-Realista (Simulator) */}
        <div className="lg:col-span-7 flex justify-center w-full">
          <div className="w-full max-w-[400px] h-[780px] bg-[#161618] rounded-[44px] p-3 border-4 border-[#222226] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(41,121,255,0.1)] flex flex-col relative overflow-hidden">
            {/* Pantalla Interna del Smartphone */}
            <div className="w-full h-full bg-[#0A0A0A] rounded-[34px] overflow-hidden flex flex-col relative border border-[#222226]">
              {/* Barra de Estado Superior (Status Bar con Dynamic Island) */}
              <div className="h-9 px-6 bg-[#0A0A0A] flex items-center justify-between text-[11px] font-bold text-white shrink-0 select-none z-30">
                <span className="font-mono tabular-nums">9:41</span>
                
                {/* Dynamic Island */}
                <div className="w-20 h-4 bg-black rounded-full border border-[#222226] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF]/40 mr-2" />
                  <div className="w-2 h-2 rounded-full bg-[#2979FF]/40" />
                </div>

                <div className="flex items-center gap-1.5 text-[#9E9E9E]">
                  <Wifi className="w-3.5 h-3.5 text-white" />
                  <Battery className="w-4 h-4 text-[#00E676]" />
                </div>
              </div>

              {/* Contenedor de Pantallas Activas con Control de Autenticación */}
              <div className="flex-1 overflow-hidden relative">
                {isAuthChecking ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-3">
                    <div className="w-8 h-8 border-2 border-[#222226] border-t-[#00E5FF] rounded-full animate-spin" />
                    <span className="text-xs text-[#9E9E9E]">Verificando sesión...</span>
                  </div>
                ) : !currentUser ? (
                  /* Puerta de Autenticación: Si no hay sesión, se muestra LoginScreen */
                  <LoginScreen onLoginSuccess={handleLoginSuccess} />
                ) : (
                  /* Vistas Principales cuando el usuario está autenticado */
                  <>
                    {activeTab === 'dashboard' && (
                      <DashboardScreen
                        onSelectStock={handleSelectStock}
                        onNavigateToSearch={() => setActiveTab('search')}
                        onNavigateToWearSync={() => setActiveTab('wear')}
                        onLogout={handleLogout}
                      />
                    )}
                    {activeTab === 'search' && (
                      <SearchScreen
                        onBack={() => setActiveTab('dashboard')}
                        onSelectStock={handleSelectStock}
                      />
                    )}
                    {activeTab === 'detail' && (
                      <DetailScreen
                        symbol={selectedStock}
                        onBack={() => setActiveTab('dashboard')}
                        onNavigateToWearSync={() => setActiveTab('wear')}
                      />
                    )}
                    {activeTab === 'wear' && (
                      <WearSyncScreen
                        onBack={() => setActiveTab('dashboard')}
                        onSelectStock={handleSelectStock}
                      />
                    )}
                  </>
                )}
              </div>

              {/* 3. Bottom Tab Bar (Solo visible si el usuario está autenticado) */}
              {currentUser && (
                <nav className="h-16 bg-[#161618]/95 backdrop-blur-md border-t border-[#222226] grid grid-cols-4 items-center shrink-0 z-30 px-2 select-none">
                  {/* Tab 1: Dashboard */}
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex flex-col items-center justify-center h-full transition-all ${
                      activeTab === 'dashboard' ? 'text-[#00E5FF]' : 'text-[#9E9E9E] hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[10px] font-bold tracking-tight mt-1">Mercado</span>
                  </button>

                  {/* Tab 2: Buscar */}
                  <button
                    onClick={() => setActiveTab('search')}
                    className={`flex flex-col items-center justify-center h-full transition-all ${
                      activeTab === 'search' ? 'text-[#00E5FF]' : 'text-[#9E9E9E] hover:text-white'
                    }`}
                  >
                    <Search className="w-5 h-5" />
                    <span className="text-[10px] font-bold tracking-tight mt-1">Buscar</span>
                  </button>

                  {/* Tab 3: Detalle */}
                  <button
                    onClick={() => setActiveTab('detail')}
                    className={`flex flex-col items-center justify-center h-full transition-all ${
                      activeTab === 'detail' ? 'text-[#00E5FF]' : 'text-[#9E9E9E] hover:text-white'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span className="text-[10px] font-bold tracking-tight mt-1">Detalle</span>
                  </button>

                  {/* Tab 4: Reloj Wear OS */}
                  <button
                    onClick={() => setActiveTab('wear')}
                    className={`flex flex-col items-center justify-center h-full transition-all relative ${
                      activeTab === 'wear' ? 'text-[#00E5FF]' : 'text-[#9E9E9E] hover:text-white'
                    }`}
                  >
                    <Watch className="w-5 h-5" />
                    <span className="text-[10px] font-bold tracking-tight mt-1">Wear OS</span>
                    <span className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                  </button>
                </nav>
              )}

              {/* Indicador de barra de inicio inferior */}
              <div className="h-3 bg-[#161618] flex items-center justify-center shrink-0">
                <div className="w-28 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Panel de Control del Smartwatch & Arquitectura Android */}
        <div className="lg:col-span-5 space-y-5">
          {/* Tarjeta del Smartwatch Wear OS en Vivo con Usuario Sincronizado */}
          <div className="rounded-2xl bg-[#161618] border border-[#222226] p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                  <Watch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Smartwatch Wear OS</h3>
                  <span className="text-xs text-[#9E9E9E]">Tile & Complication Preview</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('wear')}
                className="text-xs text-[#00E5FF] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Gestionar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulación del Reloj Circular con Favoritos Garantizados */}
            <div className="flex items-center gap-5 p-4 rounded-xl bg-[#0A0A0A] border border-[#222226]">
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#222226] to-black p-1.5 border border-[#2979FF]/40 shadow-md shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[9px] text-[#00E5FF] font-black">{complication.title}</span>
                  <span className="text-xs font-black text-white tabular-nums my-0.5">
                    {complication.shortText}
                  </span>
                  <span
                    className={`text-[9px] font-bold tabular-nums ${
                      isWatchPos ? 'text-[#00E676]' : 'text-[#FF5252]'
                    }`}
                  >
                    {complication.percentValue}
                  </span>
                </div>
              </div>

              <div className="flex-1 text-xs space-y-1.5">
                <div className="text-[#9E9E9E] leading-snug">
                  Usuario en reloj:{' '}
                  <span className="font-bold text-white">
                    {currentUser ? currentUser.username : 'Sin autenticar'}
                  </span>
                </div>
                <div className="text-xs text-[#00E676] font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00E676]" />
                  <span>Favoritos: NVDA, MSFT, AAPL, TSLA</span>
                </div>
                <div className="text-[11px] text-[#9E9E9E]">
                  Canal: <code className="text-[#00E5FF]">/mirror_action/stocks</code>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Arquitectura Multi-Módulo Android (Kotlin / Hilt 2.52 / KSP 2.0.21) */}
          <div className="rounded-2xl bg-[#161618] border border-[#222226] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Code2 className="w-4 h-4 text-[#2979FF]" />
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  Arquitectura Multi-Módulo Android
                </h3>
              </div>
              <button
                onClick={() => setShowAndroidArchModal(true)}
                className="text-xs text-[#00E5FF] hover:underline font-semibold"
              >
                Ver Código
              </button>
            </div>

            <p className="text-xs text-[#9E9E9E] leading-relaxed">
              Estructura nativa para <code className="text-white">Progamaster2308/MirrorAction</code> con Hilt 2.52, KSP 2.0.21 y Java 17:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#222226]">
                <span className="text-[#00E5FF] font-bold block">:core:model</span>
                <span className="text-[11px] text-[#9E9E9E]">Modelos StockQuote, UserSession</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#222226]">
                <span className="text-[#00E5FF] font-bold block">:core:network</span>
                <span className="text-[11px] text-[#9E9E9E]">Retrofit, Gson, NetworkModule</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#222226]">
                <span className="text-[#2979FF] font-bold block">:core:database</span>
                <span className="text-[11px] text-[#9E9E9E]">DataStore & Room DAO</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#222226]">
                <span className="text-[#2979FF] font-bold block">:core:data</span>
                <span className="text-[11px] text-[#9E9E9E]">Repositories & WearSync</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Alpha Vantage API */}
          <div className="rounded-2xl bg-gradient-to-br from-[#161618] to-[#121214] border border-[#222226] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Estado de Alpha Vantage API
              </span>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="text-xs text-[#00E5FF] hover:underline font-semibold"
              >
                Cambiar Clave
              </button>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#0A0A0A] border border-[#222226]">
              <span className="text-[#9E9E9E]">Clave Activa:</span>
              <span className="font-mono text-white font-bold">
                {activeKeyDisplay === DEFAULT_API_KEY ? 'DEMO_KEY' : '••••' + activeKeyDisplay.slice(-4)}
              </span>
            </div>

            <p className="text-[11px] text-[#9E9E9E] leading-relaxed">
              Índices S&P 500, NASDAQ y Dow Jones calculados en vivo con actualización continua sin interrupción por límite de peticiones.
            </p>
          </div>
        </div>
      </main>

      {/* Modal / Drawer para Configurar API Key de Alpha Vantage */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#161618] border border-[#222226] p-6 shadow-2xl relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Alpha Vantage API Key</h3>
                <span className="text-xs text-[#9E9E9E]">Configuración de credenciales</span>
              </div>
            </div>

            <p className="text-xs text-[#9E9E9E] mb-4 leading-relaxed">
              Por defecto, MirrorAction usa <code className="text-[#00E5FF]">DEMO_KEY</code>. Si posees tu propia clave de Alpha Vantage, ingrésala aquí:
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Tu API Key de Alpha Vantage
                </label>
                <input
                  type="text"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="Ej. QW87A1BCXYZ..."
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0A0A0A] border border-[#222226] text-white text-xs font-mono placeholder:text-[#9E9E9E] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0A0A0A] border border-[#222226] text-xs font-semibold text-[#9E9E9E] hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2979FF] hover:bg-[#2979FF]/90 text-white text-xs font-bold transition-all active:scale-95"
                >
                  Guardar y Aplicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Guía Completa de Ejecución Expo & Emulador */}
      {showExpoGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#161618] border border-[#222226] p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Guía de Ejecución Expo CLI</h3>
                  <span className="text-xs text-[#00E5FF]">Celular físico (Expo Go) & Emuladores</span>
                </div>
              </div>
              <button
                onClick={() => setShowExpoGuideModal(false)}
                className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-[#222226] text-[#9E9E9E] hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222226] space-y-2">
              <span className="text-xs font-black text-[#00E5FF] uppercase tracking-wider block">
                1. Ejecución con Expo SDK 58 y npm
              </span>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                El archivo <code>.npmrc</code> ya incluye <code>legacy-peer-deps=true</code> y <code>App.js</code> está en la raíz. Ejecuta en tu terminal:
              </p>
              <pre className="p-2.5 rounded-lg bg-[#161618] border border-[#222226] text-xs font-mono text-emerald-400">
                npx expo start -c
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExpoGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2979FF] text-white text-xs font-bold hover:bg-[#2979FF]/90 transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Arquitectura Nativa Kotlin Android Multi-Módulo */}
      {showAndroidArchModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#161618] border border-[#222226] p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/20">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Arquitectura Multi-Módulo Kotlin</h3>
                  <span className="text-xs text-[#00E5FF]">Hilt 2.52 · KSP 2.0.21 · Toolchain(17)</span>
                </div>
              </div>
              <button
                onClick={() => setShowAndroidArchModal(false)}
                className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-[#222226] text-[#9E9E9E] hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#9E9E9E]">
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222226] space-y-2">
                <span className="text-white font-bold block">1. Configuración de Gradle (build.gradle.kts)</span>
                <p>
                  Asegura que <code>jvmToolchain(17)</code> esté configurado dentro del bloque <code>kotlin &#123; ... &#125;</code> sin literales sueltos como el error de <code>26.0.1</code>:
                </p>
                <pre className="p-2.5 rounded-lg bg-[#161618] text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`kotlin {
    jvmToolchain(17)
}
android {
    compileSdk = 35
    defaultConfig {
        minSdk = 26
        targetSdk = 35
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}`}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222226] space-y-2">
                <span className="text-white font-bold block">2. Inyección de Dependencias Hilt (:core:network)</span>
                <p>
                  El <code>NetworkModule</code> en <code>:core:network</code> expone Retrofit, OkHttp y Gson para toda la aplicación:
                </p>
                <pre className="p-2.5 rounded-lg bg-[#161618] text-[11px] font-mono text-[#00E5FF] overflow-x-auto">
{`@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://www.alphavantage.co/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    @Provides
    @Singleton
    fun provideStockApi(retrofit: Retrofit): AlphaVantageApi =
        retrofit.create(AlphaVantageApi::class.java)
}`}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAndroidArchModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2979FF] text-white text-xs font-bold hover:bg-[#2979FF]/90 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
