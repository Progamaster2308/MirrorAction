/**
 * MirrorAction - Search Screen
 * Pantalla de búsqueda de acciones y activos con barra reactiva debounced,
 * sugerencias rápidas e interactividad para agregar/remover de favoritos.
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Star,
  Check,
  Plus,
  ArrowLeft,
  X,
  TrendingUp,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react-native';
import { SearchResult } from '../types/stock';
import { searchSymbols } from '../api/stockService';
import { getFavorites, toggleFavorite } from '../utils/storage';

interface SearchScreenProps {
  onBack: () => void;
  onSelectStock: (symbol: string) => void;
}

// Tickers destacados para acceso rápido en 1 toque
const DISCOVERY_TICKERS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', category: 'Semiconductors' },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Consumer Tech' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Automotive & Clean Energy' },
  { symbol: 'MSFT', name: 'Microsoft Corp', category: 'Enterprise Cloud & AI' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Internet & Search' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'E-commerce & Cloud' },
  { symbol: 'META', name: 'Meta Platforms', category: 'Social Media & VR' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'Semiconductors' },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ onBack, onSelectStock }) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Cargar lista de favoritos persistida
  useEffect(() => {
    getFavorites().then(setFavorites);
  }, []);

  // Función de búsqueda con debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const matches = await searchSymbols(query);
        setResults(matches);
      } catch (err) {
        console.error('[MirrorAction:Search] Error en búsqueda:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Manejador de favoritos (Toggle)
  const handleToggleFavorite = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    try {
      const { favorites: updatedFavs, isAdded } = await toggleFavorite(symbol);
      setFavorites(updatedFavs);
      showToast(isAdded ? `${symbol} agregado a favoritos` : `${symbol} eliminado de favoritos`);
    } catch (err) {
      console.error('[MirrorAction:Search] Error modificando favoritos:', err);
    }
  };

  const showToast = (message: string) => {
    setActiveToast(message);
    setTimeout(() => {
      setActiveToast((current) => (current === message ? null : current));
    }, 2200);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white">
      {/* 1. Header con Barra de Búsqueda Reactiva */}
      <header className="sticky top-0 z-20 px-4 pt-3 pb-3 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222226]">
        <div className="flex items-center gap-3">
          {/* Botón Atrás */}
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#161618] border border-[#222226] text-white hover:text-[#00E5FF] hover:border-[#00E5FF]/40 active:scale-95 transition-all shrink-0"
            aria-label="Volver al Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E9E9E]">
              <Search className="w-4 h-4 text-[#00E5FF]" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ticker (ej. NVDA, AAPL) o empresa..."
              className="w-full h-10 pl-9 pr-8 bg-[#161618] border border-[#222226] rounded-xl text-white text-xs placeholder:text-[#9E9E9E] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 transition-all font-medium"
              autoFocus
            />

            {query.length > 0 && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9E9E9E] hover:text-white"
                aria-label="Borrar texto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notificación Flotante */}
      {activeToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-lg bg-[#2979FF] text-white text-xs font-semibold shadow-lg shadow-[#2979FF]/30 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-3.5 h-3.5" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* 2. Cuerpo de Resultados o Sugerencias */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-4 pb-20">
        {/* Estado: Buscando en Alpha Vantage */}
        {isSearching && (
          <div className="flex items-center justify-center py-6 gap-2 text-xs text-[#00E5FF]">
            <div className="w-4 h-4 border-2 border-[#222226] border-t-[#00E5FF] rounded-full animate-spin" />
            <span>Consultando Alpha Vantage API...</span>
          </div>
        )}

        {/* Lista de Resultados de la Búsqueda */}
        {query.trim().length > 0 && !isSearching && (
          <div>
            <div className="flex items-center justify-between text-xs text-[#9E9E9E] mb-2 font-medium">
              <span>Resultados encontrados</span>
              <span>{results.length} coincidencias</span>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-[#161618] border border-[#222226]">
                <p className="text-sm font-semibold text-white mb-1">
                  No se encontraron resultados
                </p>
                <p className="text-xs text-[#9E9E9E]">
                  Intenta buscar por el ticker en inglés (ej. TSLA, NVDA) o el nombre oficial.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((item) => {
                  const isFav = favorites.includes(item.symbol);

                  return (
                    <div
                      key={item.symbol}
                      onClick={() => onSelectStock(item.symbol)}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#161618] border border-[#222226] hover:border-[#2979FF]/50 active:scale-[0.99] cursor-pointer transition-all"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{item.symbol}</span>
                          <span className="text-[10px] text-[#9E9E9E] px-1.5 py-0.5 rounded bg-[#0A0A0A] border border-[#222226]">
                            {item.currency}
                          </span>
                        </div>
                        <span className="text-xs text-[#9E9E9E] truncate block mt-0.5 font-medium">
                          {item.name}
                        </span>
                      </div>

                      {/* Botón de Agregar / Quitar de Favoritos */}
                      <button
                        onClick={(e) => handleToggleFavorite(e, item.symbol)}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                          isFav
                            ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]'
                            : 'bg-[#0A0A0A] border-[#222226] text-[#9E9E9E] hover:text-white hover:border-[#2979FF]'
                        }`}
                        title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        aria-label="Favorito"
                      >
                        <Star
                          className={`w-4 h-4 ${isFav ? 'fill-[#00E5FF] text-[#00E5FF]' : ''}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. Modo Exploración / Sugerencias cuando no hay búsqueda activa */}
        {query.trim().length === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-[#9E9E9E] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Sugerencias del Mercado (1-Tap)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DISCOVERY_TICKERS.map((item) => {
                const isFav = favorites.includes(item.symbol);

                return (
                  <div
                    key={item.symbol}
                    onClick={() => onSelectStock(item.symbol)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#161618] border border-[#222226] hover:border-[#00E5FF]/30 active:scale-[0.99] cursor-pointer transition-all"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white">{item.symbol}</span>
                      </div>
                      <span className="text-xs text-[#9E9E9E] truncate block font-medium">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[#2979FF] font-medium block mt-0.5">
                        {item.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleFavorite(e, item.symbol)}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all shrink-0 ${
                        isFav
                          ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]'
                          : 'bg-[#0A0A0A] border-[#222226] text-[#9E9E9E] hover:text-white hover:border-[#2979FF]'
                      }`}
                      aria-label="Agregar a favoritos"
                    >
                      <Star
                        className={`w-4 h-4 ${isFav ? 'fill-[#00E5FF] text-[#00E5FF]' : ''}`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Guía informativa de sincronización */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#161618]/70 border border-[#222226] text-xs text-[#9E9E9E] leading-relaxed">
              <div className="text-white font-bold mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Sincronización con Wear OS</span>
              </div>
              Todos los símbolos que agregues a tus favoritos se reflejarán automáticamente en
              el esquema de sincronización de tu reloj Wear OS inteligente.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
