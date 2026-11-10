/**
 * MirrorAction - Login Screen
 * Pantalla de autenticación y control de acceso inicial.
 * 
 * Valida los campos de Correo Electrónico y Nombre de Usuario,
 * almacena la sesión persistente en Storage y desbloquea el Dashboard
 * garantizando la sincronización con el reloj inteligente Wear OS.
 * 
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import {
  Mail,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Watch,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { MirrorActionLogo } from '../components/MirrorActionLogo';
import { saveUserSession } from '../utils/storage';
import { UserProfile } from '../types/stock';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; username?: string }>({});

  // Validación de campos
  const validateForm = (): boolean => {
    const newErrors: { email?: string; username?: string } = {};

    // Validar Correo Electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Ingresa un formato de correo válido (ej. usuario@dominio.com)';
    }

    // Validar Nombre de Usuario
    if (!username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (username.trim().length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
      newErrors.username = 'Usa solo letras, números, puntos o guiones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user: UserProfile = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        loggedInAt: Date.now(),
        preferredCurrency: 'USD',
      };

      await saveUserSession(user);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(user);
      }, 500);
    } catch (err) {
      console.error('[MirrorAction:Login] Error al iniciar sesión:', err);
      setIsLoading(false);
    }
  };

  // Inicio de sesión rápido para demostraciones
  const handleQuickDemo = (demoUser: string, demoEmail: string) => {
    setUsername(demoUser);
    setEmail(demoEmail);
    setErrors({});
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white overflow-y-auto px-6 py-6 justify-between select-none">
      {/* 1. Header con Logo de Marca */}
      <div className="flex flex-col items-center text-center mt-2">
        <MirrorActionLogo size={48} showText={false} />
        
        <div className="mt-4 flex items-center tracking-tight leading-none">
          <span className="text-white font-black text-2xl tracking-wide uppercase">
            Mirror
          </span>
          <span className="text-[#00E5FF] font-black text-2xl tracking-wide uppercase ml-1">
            Action
          </span>
        </div>
        <p className="text-xs text-[#9E9E9E] mt-1 font-medium max-w-xs">
          Plataforma de seguimiento bursátil y sincronización en tiempo real con Wear OS.
        </p>
      </div>

      {/* 2. Formulario de Inicio de Sesión */}
      <div className="my-auto py-4">
        <div className="bg-[#161618] border border-[#222226] rounded-2xl p-5 shadow-xl shadow-black/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Iniciar Sesión</h2>
            <p className="text-xs text-[#9E9E9E] mt-0.5">
              Ingresa tus credenciales para acceder al Dashboard y sincronizar tu reloj.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo: Nombre de Usuario */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Nombre de Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E9E9E]">
                  <User className="w-4 h-4 text-[#00E5FF]" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  placeholder="ej. brian_trader"
                  className={`w-full h-11 pl-9 pr-3 bg-[#0A0A0A] border rounded-xl text-white text-xs placeholder:text-[#9E9E9E] focus:outline-none transition-all ${
                    errors.username
                      ? 'border-[#FF5252] focus:ring-1 focus:ring-[#FF5252]/40'
                      : 'border-[#222226] focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <div className="flex items-center gap-1 text-[11px] text-[#FF5252] mt-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            {/* Campo: Correo Electrónico */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E9E9E]">
                  <Mail className="w-4 h-4 text-[#2979FF]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="ej. brian@mirroraction.app"
                  className={`w-full h-11 pl-9 pr-3 bg-[#0A0A0A] border rounded-xl text-white text-xs placeholder:text-[#9E9E9E] focus:outline-none transition-all ${
                    errors.email
                      ? 'border-[#FF5252] focus:ring-1 focus:ring-[#FF5252]/40'
                      : 'border-[#222226] focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1 text-[11px] text-[#FF5252] mt-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Botón de Ingreso */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a MirrorAction</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Opciones rápidas de prueba */}
          <div className="mt-4 pt-3.5 border-t border-[#222226]">
            <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wider block mb-2 font-semibold">
              Acceso Rápido (Demo)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('AlexTrader', 'alex.trader@mirroraction.app')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#0A0A0A] border border-[#222226] hover:border-[#00E5FF]/40 text-[11px] text-[#9E9E9E] hover:text-white transition-all text-left truncate"
              >
                👤 Alex Trader
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ProTrader', 'trader@mirroraction.com')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#0A0A0A] border border-[#222226] hover:border-[#2979FF]/40 text-[11px] text-[#9E9E9E] hover:text-white transition-all text-left truncate"
              >
                📈 Trader Pro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer con garantía de sincronización Wear OS */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#9E9E9E] py-2">
        <Watch className="w-4 h-4 text-[#00E5FF]" />
        <span>Sincronización encriptada con Wear OS DataLayer</span>
      </div>
    </div>
  );
};
