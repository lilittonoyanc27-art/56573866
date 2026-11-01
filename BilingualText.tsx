import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Languages, Eye, EyeOff } from 'lucide-react';
import { speakSpanish } from './SpeechHelper.ts';
import { isSoundMuted, subscribeSoundMute } from './soundEffects.ts';

interface BilingualTextProps {
  es: string;
  arm: string;
  className?: string;
  esClassName?: string;
  armClassName?: string;
  alwaysShowArm?: boolean;
  showAudio?: boolean;
  prefixBadge?: string;
}

export const BilingualText: React.FC<BilingualTextProps> = ({
  es,
  arm,
  className = '',
  esClassName = '',
  armClassName = '',
  alwaysShowArm = false,
  showAudio = true,
  prefixBadge,
}) => {
  const [showArmenian, setShowArmenian] = useState<boolean>(alwaysShowArm);
  const [isMuted, setIsMuted] = useState<boolean>(isSoundMuted());

  useEffect(() => {
    return subscribeSoundMute((muted) => setIsMuted(muted));
  }, []);

  const toggleTranslation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowArmenian((prev) => !prev);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakSpanish(es);
  };

  return (
    <div className={`group/bilingual relative rounded-xl transition-all ${className}`}>
      {/* Spanish interactive block */}
      <div className="flex items-start gap-2.5">
        <div
          onClick={toggleTranslation}
          title="Սեղմի՛ր իսպաներենի վրա՝ հայերեն թարգմանությունը տեսնելու համար (Haz clic para ver la traducción en armenio)"
          className={`flex-1 cursor-pointer rounded-lg p-2 transition-all hover:bg-white/10 active:scale-[0.99] select-text ${esClassName}`}
        >
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {prefixBadge && (
              <span className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {prefixBadge}
              </span>
            )}
            <span className="text-[10px] font-semibold tracking-wider text-amber-300/80 uppercase flex items-center gap-1">
              <Languages className="w-3 h-3" />
              <span>Español (Սեղմի՛ր թարգմանության համար)</span>
            </span>
          </div>
          <p className="text-base sm:text-lg font-medium leading-relaxed text-white">
            {es}
          </p>
        </div>

        {/* Action icons: Audio & Translation toggle */}
        <div className="flex flex-col gap-1 shrink-0 pt-1">
          {showAudio && (
            <button
              type="button"
              onClick={handleSpeak}
              title={
                isMuted
                  ? 'Ձայնն անջատված է (Խաղի վերևում միացրու ձայնը)'
                  : 'Լսել իսպաներեն արտասանությունը (Escuchar en español)'
              }
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-slate-800 text-slate-500 opacity-60 hover:opacity-100'
                  : 'bg-blue-600/30 hover:bg-blue-500 text-blue-200 hover:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={toggleTranslation}
            title={showArmenian ? 'Թաքցնել հայերենը' : 'Բացել հայերեն թարգմանությունը'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showArmenian
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
          >
            {showArmenian ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Armenian translation drop/reveal */}
      {(showArmenian || alwaysShowArm) && (
        <div
          className={`mt-2 rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-950/60 to-orange-950/40 p-2.5 sm:p-3 text-amber-100 animate-fadeIn ${armClassName}`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 mb-1">
            <span>🇦🇲 Հայերեն թարգմանություն</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-amber-100/95 font-normal">
            {arm}
          </p>
        </div>
      )}
    </div>
  );
};
