import React, { useState } from 'react';
import { ADIVINANZAS_LIST } from './adivinanzasData.ts';
import { AdivinanzaItem } from './types.ts';
import { BilingualText } from './BilingualText.tsx';
import { playSound } from './soundEffects.ts';
import { speakSpanish } from './SpeechHelper.ts';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Trophy,
  Filter,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const AdivinanzasGame: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<number | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userTextAnswer, setUserTextAnswer] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [userScores, setUserScores] = useState<Record<number, 'correct' | 'wrong'>>({});

  // Filter list
  const filteredList =
    selectedPart === 'all'
      ? ADIVINANZAS_LIST
      : ADIVINANZAS_LIST.filter((item) => item.part === selectedPart);

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredList.length - 1));
  const currentItem: AdivinanzaItem = filteredList[safeIndex] || filteredList[0];

  const isAnswered = !!userScores[currentItem.id] || !!revealedAnswers[currentItem.id];
  const isCorrect = userScores[currentItem.id] === 'correct';

  // Total statistics
  const totalCompleted = Object.keys(userScores).length;
  const totalCorrect = Object.values(userScores).filter((s) => s === 'correct').length;

  const handleSelectOption = (key: string) => {
    if (isAnswered) return;
    setSelectedOption(key);

    const correct = currentItem.correctOptionKey === key;
    if (correct) {
      playSound('correct');
      setUserScores((prev) => ({ ...prev, [currentItem.id]: 'correct' }));
    } else {
      playSound('wrong');
      setUserScores((prev) => ({ ...prev, [currentItem.id]: 'wrong' }));
    }
  };

  const handleCheckTextAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTextAnswer.trim() || isAnswered) return;

    const norm = userTextAnswer.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matched = currentItem.acceptableKeywords.some((kw) => {
      const normKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return norm.includes(normKw) || normKw.includes(norm);
    });

    if (matched) {
      playSound('correct');
      setUserScores((prev) => ({ ...prev, [currentItem.id]: 'correct' }));
    } else {
      playSound('wrong');
      setUserScores((prev) => ({ ...prev, [currentItem.id]: 'wrong' }));
    }
    setRevealedAnswers((prev) => ({ ...prev, [currentItem.id]: true }));
  };

  const handleReveal = () => {
    setRevealedAnswers((prev) => ({ ...prev, [currentItem.id]: true }));
    if (!userScores[currentItem.id]) {
      setUserScores((prev) => ({ ...prev, [currentItem.id]: 'wrong' }));
    }
  };

  const handleNext = () => {
    if (safeIndex < filteredList.length - 1) {
      setCurrentIndex(safeIndex + 1);
      setUserTextAnswer('');
      setSelectedOption(null);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
      setUserTextAnswer('');
      setSelectedOption(null);
    }
  };

  const handleResetAll = () => {
    setUserScores({});
    setRevealedAnswers({});
    setCurrentIndex(0);
    setUserTextAnswer('');
    setSelectedOption(null);
    playSound('whistle');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 flex flex-col gap-5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-emerald-500/20">
            🧩
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              27 Adivinanzas y Preguntas de Fútbol
            </h2>
            <p className="text-xs text-emerald-200/80">
              27 ֆուտբոլային հանելուկ և վիկտորինա • Իսպաներեն + Հայերեն
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 rounded-xl px-3 py-1.5">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Միավորներ</span>
              <div className="text-base font-black text-emerald-200 leading-none">
                {totalCorrect} / {ADIVINANZAS_LIST.length}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            title="Սկսել նորից"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Part Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 px-2">
          <Filter className="w-3.5 h-3.5" /> Մաս՝
        </span>
        {[
          { id: 'all', label: 'Բոլոր 27 + Մինի' },
          { id: 1, label: '1. Adivina la palabra (1-8)' },
          { id: 2, label: '2. ¿Qué significa? (9-15)' },
          { id: 3, label: '3. ¿Cómo se llama? (16-21)' },
          { id: 4, label: '4. Con trampa (22-27)' },
          { id: 5, label: '5. Mini juego (28-30)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setSelectedPart(tab.id as number | 'all');
              setCurrentIndex(0);
              setUserTextAnswer('');
              setSelectedOption(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedPart === tab.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col gap-5">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              #{currentItem.id}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {currentItem.partTitleEs} • {currentItem.partTitleArm}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {safeIndex + 1} / {filteredList.length}
          </div>
        </div>

        {/* The Question in Spanish with Armenian translation click-to-open */}
        <div>
          <BilingualText
            es={currentItem.questionEs}
            arm={currentItem.questionArm}
            prefixBadge={`Հարց ${currentItem.id}`}
            esClassName="text-base sm:text-lg font-bold text-white bg-slate-950/40"
            armClassName="text-sm sm:text-base font-medium"
          />
        </div>

        {/* Interaction section depending on type */}
        {currentItem.type === 'multiple_choice' && currentItem.options && (
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Ընտրի՛ր ճիշտ տարբերակը (Elige la opción correcta)՝
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {currentItem.options.map((opt) => {
                const isSelected = selectedOption === opt.key;
                const isAnswerKey = currentItem.correctOptionKey === opt.key;

                let optStyle =
                  'bg-slate-950/70 border-slate-700 hover:border-emerald-500 text-slate-200';
                if (isAnswered) {
                  if (isAnswerKey) {
                    optStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-md';
                  } else if (isSelected && !isAnswerKey) {
                    optStyle = 'bg-rose-950/90 border-rose-500 text-rose-200';
                  }
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(opt.key)}
                    disabled={isAnswered}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                  >
                    <span className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      {opt.key}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm sm:text-base font-semibold">{opt.textEs}</div>
                      <div className="text-xs text-amber-200/80 mt-0.5">{opt.textArm}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Text Input for Riddles & Tricks */}
        {currentItem.type !== 'multiple_choice' && !isAnswered && (
          <form onSubmit={handleCheckTextAnswer} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={userTextAnswer}
                onChange={(e) => setUserTextAnswer(e.target.value)}
                placeholder="Գրի՛ր պատասխանը իսպաներեն կամ հայերեն..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-white placeholder-slate-500 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!userTextAnswer.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all"
              >
                Ստուգել
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleReveal}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ցույց տալ ճիշտ պատասխանը (Ver respuesta)</span>
              </button>
            </div>
          </form>
        )}

        {/* Answer Revealed / Feedback section */}
        {isAnswered && (
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 to-slate-950 p-4 sm:p-5 flex flex-col gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-300">
                    Ճիշտ է (¡Correcto!)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="text-sm font-bold text-rose-300">
                    Պատասխանը (Respuesta)՝
                  </span>
                </>
              )}
            </div>

            {/* Answer in Spanish + Armenian */}
            <div className="bg-slate-900/80 rounded-xl p-3 border border-emerald-500/30 flex items-start justify-between gap-2">
              <div>
                <div className="text-base sm:text-lg font-black text-emerald-300">
                  🇪🇸 {currentItem.answerEs}
                </div>
                <div className="text-sm font-semibold text-amber-300 mt-1">
                  🇦🇲 {currentItem.answerArm}
                </div>
              </div>

              <button
                type="button"
                onClick={() => speakSpanish(currentItem.answerEs)}
                className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-500 text-emerald-200 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Լսել արտասանությունը"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation */}
            {currentItem.explanationEs && (
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <strong>Բացատրություն (ES):</strong> {currentItem.explanationEs}
                </p>
                {currentItem.explanationArm && (
                  <p className="text-amber-200/90">
                    <strong>Բացատրություն (ARM):</strong> {currentItem.explanationArm}
                  </p>
                )}
              </div>
            )}

            {/* Proactive CONTINUE button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                disabled={safeIndex >= filteredList.length - 1}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Շարունակել խաղալ (Հաջորդ հարցը)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Նախորդը</span>
          </button>

          <span className="text-xs text-slate-400">
            Սեղմի՛ր իսպաներեն տեքստի վրա՝ թարգմանության համար
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={safeIndex === filteredList.length - 1}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Հաջորդը</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
