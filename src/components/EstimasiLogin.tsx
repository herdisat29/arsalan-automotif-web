import React, { useState } from "react";
import { Lock, LogIn, ArrowLeft, Key, ShieldCheck, AlertCircle, User } from "lucide-react";

interface EstimasiLoginProps {
  onBackToWeb: () => void;
  onSuccess: (user: any) => void;
}

export default function EstimasiLogin({ onBackToWeb, onSuccess }: EstimasiLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const normUser = username.trim().toLowerCase();
    const normPass = password.trim();

    if (normUser === "arsalan_sa" && normPass === "arsalanjaya24") {
      onSuccess({
        uid: "local-sa-crew",
        name: "Service Advisor",
        email: "sa@arsalanjaya.internal",
        photoURL: null,
        method: "Admin Portal"
      });
    } else {
      setErrorMessage("Username atau Password salah! Silakan masukkan kredensial Service Advisor resmi.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background Decorative Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>

      {/* Glassmorphic Form Card */}
      <div className="max-w-md w-full space-y-8 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 p-8 sm:p-10 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
            <Lock className="h-6 w-6 text-white" />
          </div>
          
          <h2 className="mt-4 text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
            Portal Internal SA
          </h2>
          <p className="mt-1 text-xs text-slate-400 font-mono tracking-wider uppercase">
            Arsalan Jaya Automotif
          </p>
          <div className="w-16 h-1 bg-red-600 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Warning Policy Box */}
        <div className="bg-slate-900/60 border-l-4 border-amber-500 p-3.5 rounded-lg text-xs leading-relaxed text-slate-300">
          <div className="flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-400 block mb-0.5">SISTEM OPERASIONAL INTERNAL (Bukan Untuk Umum)</span>
              Hanya digunakan oleh Service Advisor (SA) &amp; Manajemen Bengkel untuk kalkulasi estimasi, katalog harga, dan riwayat cetak pelanggan.
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-950/40 border border-red-800/60 text-red-300 text-xs p-3.5 rounded-lg flex items-start space-x-2 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="username"
                type="text"
                required
                placeholder="Username Service Advisor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Key className="h-4 w-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="Password Portal Internal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-red-950/40"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span>Verifikasi &amp; Masuk Portal 🔒</span>
          </button>
        </form>

        {/* Back Button */}
        <div className="pt-4 border-t border-slate-700/60 flex justify-center">
          <button
            onClick={onBackToWeb}
            className="flex items-center space-x-1.5 text-xs text-slate-450 hover:text-white transition cursor-pointer font-mono uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali Ke Web Utama (Customer)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
