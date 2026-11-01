import React, { useState, useEffect } from 'react';
import { GameMode } from './types.ts';
import { PasapalabraGame } from './PasapalabraGame.tsx';
import { AdivinanzasGame } from './AdivinanzasGame.tsx';
import { MathGame } from './MathGame.tsx';
import { playSound, isSoundMuted, toggleSoundMuted, subscribeSoundMute } from './soundEffects.ts';
import {
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<GameMode>('rosco');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(isSoundMuted());

  useEffect(() => {
    return subscribeSoundMute((muted) => {
      setIsMuted(muted);
    });
  }, []);

  const switchTab = (mode: GameMode) => {
    setActiveTab(mode);
    playSound('whistle');
  };

  const handleToggleSound = () => {
    const nextMuted = toggleSoundMuted();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      playSound('whistle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* Background Stadium Atmosphere Gradients & Lights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blue-600/20 via-sky-500/10 to-transparent blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-emerald-600/15 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-amber-600/15 blur-3xl rounded-full"></div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-emerald-500 flex items-center justify-center font-black text-xl text-slate-950 shadow-lg shadow-amber-500/20">
                ⚽
              </div>
              <span className="absolute -bottom-1 -right-1 text-[10px] bg-blue-600 px-1 rounded font-bold text-white">
                ARM-ES
              </span>
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                PASAPALABRA FÚTBOL
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Español + Հայերեն
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Ֆուտբոլային ինտերակտիվ խաղեր • Էլ Ռոսկո, հանելուկներ և մաթեմատիկա
              </p>
            </div>
          </div>

          {/* Game Switcher Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => switchTab('rosco')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rosco'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🎡</span>
              <span>Pasapalabra</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('adivinanzas')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'adivinanzas'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🧩</span>
              <span>27 Հանելուկ</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('matematicas')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'matematicas'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📐</span>
              <span>20 Մաթեմատիկա</span>
            </button>
          </nav>

          {/* Sound Mute Toggle & Referee Whistle */}
          <div className="flex items-center gap-2">
            {/* Sound Mute/Unmute Button */}
            <button
              type="button"
              onClick={handleToggleSound}
              title={
                isMuted
                  ? 'Ձայնն անջատված է։ Սեղմի՛ր միացնելու համար (Activar sonido)'
                  : 'Ձայնը միացված է։ Սեղմի՛ր անջատելու համար (Silenciar sonido)'
              }
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 text-xs font-bold ${
                isMuted
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 hover:bg-rose-900 shadow-md shadow-rose-950/50'
                  : 'bg-slate-800/90 border-emerald-500/50 text-emerald-300 hover:bg-slate-700 shadow-md shadow-emerald-950/30'
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="hidden sm:inline">Ձայնը՝ ԱՆՋԱՏՎԱԾ</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Ձայնը՝ ՄԻԱՑՎԱԾ</span>
                </>
              )}
            </button>

            {/* Whistle Button (only when unmuted) */}
            {!isMuted && (
              <button
                type="button"
                onClick={() => playSound('whistle')}
                title="Սուլիչի ձայն (Silbato de árbitro)"
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer border border-slate-700"
              >
                📢
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              title="Կանոններ և օգնություն"
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 z-10 w-full py-4">
        {activeTab === 'rosco' && <PasapalabraGame />}
        {activeTab === 'adivinanzas' && <AdivinanzasGame />}
        {activeTab === 'matematicas' && <MathGame />}
      </main>

      {/* Footer */}
      <footer className="z-10 border-t border-slate-800/80 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          ⚽ 27 Adivinanzas y preguntas de fútbol & 20 Problemas matemáticos (7.º curso) • Իսպաներեն + Հայերեն
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          💡 Սեղմի՛ր իսպաներեն ցանկացած տեքստի վրա՝ հայերեն թարգմանությունը բացելու համար։
        </p>
      </footer>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 shadow-2xl text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Ինչպե՞ս խաղալ և սովորել
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/30">
                <strong className="text-blue-300 block mb-1">
                  🎡 1. Pasapalabra (El Rosco de fútbol)
                </strong>
                Իսպանական հայտնի խաղի 25 տառերը։ Կարդա՛ հարցը, գրի՛ր պատասխանը իսպաներեն կամ սեղմի՛ր «Pasapalabra»՝ հաջորդ տառին անցնելու համար։ Երբ պատասխանում ես (ճիշտ կամ սխալ), միշտ կարող ես անմիջապես շարունակել խաղալ «Հաջորդ բառը» կոճակով։
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                <strong className="text-emerald-300 block mb-1">
                  🧩 2. 27 ֆուտբոլային հանելուկներ և վիկտորինա
                </strong>
                Ներառում է բոլոր 4 մասերը՝ «Adivina la palabra», «¿Qué significa?», «¿Cómo se llama?», «Con trampa», ինչպես նաև արագ պատասխանների մինի խաղը։
              </div>

              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/30">
                <strong className="text-amber-300 block mb-1">
                  📐 3. 20 մաթեմատիկական խնդիրներ (7-րդ դասարան)
                </strong>
                Հաշվի՛ր գոլերը, խաղացողներին, ժամանակը, տոկոսները, արագությունը և մակերեսը։ Յուրաքանչյուր խնդրի համար կա քայլ առ քայլ լուծում, ինչպես նաև 8 խոսակցական հարցեր։
              </div>

              <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/30 text-amber-200">
                <strong>🇦🇲 Կարևոր կանոն՝</strong> Սեղմի՛ր իսպաներեն ցանկացած տեքստի վրա՝ ակնթարթորեն հայերեն թարգմանությունը տեսնելու համար։ Բարձրախոսի կոճակով կարող ես լսել իսպաներեն ճիշտ արտասանությունը։
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm cursor-pointer"
            >
              Հասկանալի է, սկսենք խաղալ ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
