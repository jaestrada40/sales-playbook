import React, { useState } from "react";
import {
  PhoneCall,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { UserProfile } from "../types";
import { login } from "../api";

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile, accessToken?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const demoEnabled = import.meta.env.VITE_ENABLE_DEMO === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await login(email, password);
      setIsLoading(false);
      onLoginSuccess(
        {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          role:
            response.user.role === "ADMIN" ? "Sales Lead" : "Vendedor Senior",
          todayCallsCount: 0,
          todayMeetingsBooked: 0,
          conversionRatePercent: 0,
          apiRole: response.user.role as UserProfile["apiRole"],
        },
        response.accessToken,
      );
    } catch (loginError) {
      setIsLoading(false);
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No se pudo iniciar sesión",
      );
    }
  };

  const handleQuickDemo = (roleName: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (roleName === "admin") {
        onLoginSuccess({
          id: "user-admin",
          name: "Dra. Sofia Mendoza",
          email: "admin@salesplaybook.io",
          avatarUrl:
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          role: "Sales Lead",
          todayCallsCount: 28,
          todayMeetingsBooked: 11,
          conversionRatePercent: 41.2,
          apiRole: "ADMIN",
        });
      } else {
        onLoginSuccess({
          id: "user-1",
          name: "Carlos Ruiz",
          email: "carlos.ruiz@salesplaybook.io",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          role: "Vendedor Senior",
          todayCallsCount: 14,
          todayMeetingsBooked: 5,
          conversionRatePercent: 35.7,
          apiRole: "SELLER",
        });
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Container Box */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 mx-auto flex items-center justify-center text-emerald-400 shadow-md">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sales Playbook
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Copiloto en tiempo real para llamadas de ventas B2B
          </p>
        </div>

        {/* Forgot Password Modal View */}
        {showForgotPassword ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <KeyRound className="w-4 h-4 text-amber-600 mb-1" />
              <p className="font-semibold">Recuperación de contraseña</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Ingresa tu correo institucional y te enviaremos un enlace de
                acceso seguro.
              </p>
            </div>

            {resetSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-900">
                  ¡Enlace enviado!
                </p>
                <p className="text-xs text-emerald-800">
                  Revisa tu bandeja de entrada en {email}.
                </p>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-2 text-xs font-bold text-slate-700 underline"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setResetSent(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Enviar enlace de recuperación
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-center text-xs text-slate-500 font-medium hover:underline pt-1"
                >
                  Cancelar y regresar
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendedor@empresa.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetSent(false);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Demo Quick Presets */}
        {demoEnabled && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
              Acceso Rápido Demo Prototipo
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("vendedor")}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all cursor-pointer group"
              >
                <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                  Carlos Ruiz
                </span>
                <span className="block text-[10px] text-slate-500">
                  Vendedor Senior POS
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all cursor-pointer group"
              >
                <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                  Dra. Sofia M.
                </span>
                <span className="block text-[10px] text-slate-500">
                  Sales Manager / Admin
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Conexión cifrada de grado bancario TLS 1.3</span>
        </div>
      </div>
    </div>
  );
};
