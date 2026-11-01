import React, { useState } from 'react';
import { MATH_PROBLEMS, SPEAKING_QUESTIONS } from './mathData.ts';
import { MathProblemItem } from './types.ts';
import { BilingualText } from './BilingualText.tsx';
import { playSound } from './soundEffects.ts';
import { speakSpanish } from './SpeechHelper.ts';
import {
  Calculator,
  CheckCircle2,
  XCircle,
  Volume2,
  MessageSquare,
  BookOpen,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const MathGame: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'problems' | 'speaking'>('problems');
  const [selectedPart, setSelectedPart] = useState<number | 'all'>('all');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [solvedState, setSolvedState] = useState<
    Record<number, { isCorrect: boolean; showSolution: boolean }>
  >({});
  const [showAllSolutions, setShowAllSolutions] = useState<boolean>(false);

  // Speaking questions state
  const [activeSpeakingId, setActiveSpeakingId] = useState<number | null>(null);

  // Filter problems
  const displayedProblems =
    selectedPart === 'all'
      ? MATH_PROBLEMS
      : MATH_PROBLEMS.filter((p) => p.part === selectedPart);

  const totalCorrect = Object.values(solvedState).filter((s) => s.isCorrect).length;

  const handleCheckAnswer = (problem: MathProblemItem) => {
    const rawAnswer = userAnswers[problem.id] || '';
    if (!rawAnswer.trim()) return;

    const trimmed = rawAnswer.trim().toLowerCase();
    const correctVal = String(problem.correctValue).trim().toLowerCase();

    // Check equality (numeric or string)
    const numUser = parseFloat(trimmed.replace('%', '').replace(',', '.'));
    const numCorrect =
      typeof problem.correctValue === 'number'
        ? problem.correctValue
        : parseFloat(correctVal.replace('%', '').replace(',', '.'));

    let isMatch = false;
    if (!isNaN(numUser) && !isNaN(numCorrect)) {
      isMatch = Math.abs(numUser - numCorrect) < 0.01;
    } else {
      isMatch = trimmed === correctVal || trimmed === correctVal.replace(':', '-');
    }

    if (isMatch) {
      playSound('correct');
      setSolvedState((prev) => ({
        ...prev,
        [problem.id]: { isCorrect: true, showSolution: true },
      }));
    } else {
      playSound('wrong');
      setSolvedState((prev) => ({
        ...prev,
        [problem.id]: { isCorrect: false, showSolution: true },
      }));
    }
  };

  const toggleSolution = (problemId: number) => {
    setSolvedState((prev) => ({
      ...prev,
      [problemId]: {
        isCorrect: prev[problemId]?.isCorrect || false,
        showSolution: !prev[problemId]?.showSolution,
      },
    }));
  };

  const handleToggleAllSolutions = () => {
    const nextState = !showAllSolutions;
    setShowAllSolutions(nextState);

    setSolvedState((prev) => {
      const updated: Record<number, { isCorrect: boolean; showSolution: boolean }> = { ...prev };
      MATH_PROBLEMS.forEach((p) => {
        updated[p.id] = {
          isCorrect: prev[p.id]?.isCorrect || false,
          showSolution: nextState,
        };
      });
      return updated;
    });
  };

  const handleResetAll = () => {
    setUserAnswers({});
    setSolvedState({});
    setShowAllSolutions(false);
    playSound('whistle');
  };

  const getPartBadge = (part: number) => {
    switch (part) {
      case 1:
        return { label: '🟢 Fáciles (Հեշտ)', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
      case 2:
        return { label: '🟡 Lógica (Տրամաբանական)', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
      case 3:
        return { label: '🟠 Porcentajes (Տոկոսներ)', color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' };
      case 4:
      default:
        return { label: '🔴 Difíciles (Բարդ)', color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' };
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 flex flex-col gap-5">
      {/* Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-xl text-slate-950 shadow-lg shadow-amber-500/20">
            📐
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              20 Problemas Matemáticos de Fútbol
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                7.º Curso | 7-րդ դասարան
              </span>
            </h2>
            <p className="text-xs text-amber-200/80">
              Բոլոր 20 խնդիրները մեկ էջում • Սեղմի՛ր իսպաներենի վրա՝ հայերենը բացելու համար
            </p>
          </div>
        </div>

        {/* Global Controls & Mode Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-amber-950/70 border border-amber-500/40 rounded-xl px-3 py-1.5 shadow-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-amber-300 block">Ճիշտ լուծված</span>
              <div className="text-base font-black text-amber-200 leading-none">
                {totalCorrect} / {MATH_PROBLEMS.length}
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('problems')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'problems'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Բոլոր 20 Խնդիրները</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('speaking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'speaking'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Խոսակցական (8)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            title="Մաքրել բոլոր պատասխանները"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'problems' ? (
        <>
          {/* Filter Bar & Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedPart('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPart === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                Բոլոր 20-ը միասին ({MATH_PROBLEMS.length})
              </button>
              {[
                { id: 1, label: '🟢 1. Fáciles (1-5)' },
                { id: 2, label: '🟡 2. Lógica (6-10)' },
                { id: 3, label: '🟠 3. Porcentajes (11-15)' },
                { id: 4, label: '🔴 4. Difíciles (16-20)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedPart(tab.id as number)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedPart === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Toggle all solutions button */}
            <button
              type="button"
              onClick={handleToggleAllSolutions}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              {showAllSolutions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>
                {showAllSolutions
                  ? 'Թաքցնել բոլոր լուծումները'
                  : 'Ցույց տալ բոլոր լուծումները'}
              </span>
            </button>
          </div>

          {/* ALL MATH PROBLEMS RENDERED SIMULTANEOUSLY */}
          <div className="flex flex-col gap-4">
            {displayedProblems.map((problem) => {
              const status = solvedState[problem.id];
              const isSolved = status?.isCorrect;
              const isSolutionOpen = status?.showSolution || showAllSolutions;
              const currentInput = userAnswers[problem.id] || '';
              const badge = getPartBadge(problem.part);

              return (
                <div
                  key={problem.id}
                  id={`problem-${problem.id}`}
                  className={`bg-slate-900/90 border-2 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col gap-4 transition-all ${
                    isSolved
                      ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20'
                      : 'border-slate-800 hover:border-amber-500/30'
                  }`}
                >
                  {/* Problem Top Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                        #{problem.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {problem.titleEs} • {problem.titleArm}
                      </span>
                    </div>

                    {isSolved && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ճիշտ է
                      </span>
                    )}
                  </div>

                  {/* Problem Description with Click-to-Translate */}
                  <BilingualText
                    es={problem.problemEs}
                    arm={problem.problemArm}
                    esClassName="text-sm sm:text-base font-semibold text-slate-100 bg-slate-950/40"
                    armClassName="text-xs sm:text-sm font-medium"
                  />

                  {/* Answer Input & Buttons for this problem */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={currentInput}
                        onChange={(e) =>
                          setUserAnswers((prev) => ({ ...prev, [problem.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCheckAnswer(problem);
                          }
                        }}
                        placeholder={`Գրի՛ր արդյունքը (${problem.unitArm} / ${problem.unitEs})`}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-slate-500 outline-none text-xs sm:text-sm font-medium"
                      />
                      {problem.unitArm && (
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          {problem.unitEs}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCheckAnswer(problem)}
                        disabled={!currentInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm shadow-md cursor-pointer active:scale-95 transition-all"
                      >
                        Ստուգել ✓
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSolution(problem.id)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors border ${
                          isSolutionOpen
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isSolutionOpen ? 'Թաքցնել լուծումը' : 'Լուծումը 💡'}
                      </button>
                    </div>
                  </div>

                  {/* Step-by-Step Solution Drawer if active */}
                  {isSolutionOpen && (
                    <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-950 to-orange-950/20 p-4 flex flex-col gap-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          {status?.isCorrect ? (
                            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Ճիշտ հաշվարկ (¡Cálculo correcto!)
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                              💡 Լուծման քայլերը (Solución oficial)՝
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ✅ Պատասխան՝ {problem.finalAnswerArm} ({problem.finalAnswerEs})
                        </span>
                      </div>

                      {/* Spanish and Armenian step by step */}
                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <div className="font-bold text-slate-300">
                          🇪🇸 {problem.solutionStepsEs.join(' • ')}
                        </div>
                        <div className="font-medium text-amber-200/90 pt-1 border-t border-slate-800/80">
                          🇦🇲 {problem.solutionStepsArm.join(' • ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Speaking / Conversational Questions Section */
        <div className="bg-slate-900/90 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Preguntas extra para hablar — Լրացուցիչ խոսակցական հարցեր
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Յուրաքանչյուր խնդրից հետո աշակերտին կարելի է տալ այս հարցերը՝ իսպաներեն մտածելու և պատասխանելու համար։
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SPEAKING_QUESTIONS.map((item) => {
              const isOpen = activeSpeakingId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveSpeakingId(isOpen ? null : item.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isOpen
                      ? 'bg-amber-950/40 border-amber-400 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                      #{item.id}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakSpanish(item.questionEs);
                      }}
                      className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-500 text-blue-200 hover:text-white transition-colors cursor-pointer"
                      title="Լսել իսպաներեն"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-2 text-sm sm:text-base font-bold text-white">
                    🇪🇸 {item.questionEs}
                  </div>

                  <div className="mt-1 text-xs sm:text-sm font-medium text-amber-300/90">
                    🇦🇲 {item.questionArm}
                  </div>

                  {item.suggestedAnswerEs && (
                    <div className="mt-3 pt-2 border-t border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] uppercase font-bold text-emerald-400">
                        Հնարավոր պատասխան (Respuesta sugerida)՝
                      </div>
                      <p className="text-slate-300">🇪🇸 {item.suggestedAnswerEs}</p>
                      <p className="text-amber-200/80">🇦🇲 {item.suggestedAnswerArm}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
