import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PASAPALABRA_ROSTER } from './pasapalabraData.ts';
import { RoscoItem, RoscoStatus } from './types.ts';
import { playSound } from './soundEffects.ts';
import { speakSpanish } from './SpeechHelper.ts';
import { BilingualText } from './BilingualText.tsx';
import {
  RotateCcw,
  Sparkles,
  HelpCircle,
  Play,
  Pause,
  Award,
  ChevronRight,
  Flame,
  Volume2,
} from 'lucide-react';

// Normalize text for comparison: remove accents, extra spaces, lower-case
function normalizeAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}

export const PasapalabraGame: React.FC = () => {
  const [items] = useState<RoscoItem[]>(PASAPALABRA_ROSTER);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [statuses, setStatuses] = useState<Record<string, RoscoStatus>>({});
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong' | null;
    messageEs: string;
    messageArm: string;
    correctWord: string;
    correctArm: string;
  } | null>(null);

  const [showHint, setShowHint] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const currentItem = items[currentIndex];

  // Calculate statistics
  const aciertos = items.filter((item) => statuses[item.id] === 'correct').length;
  const fallos = items.filter((item) => statuses[item.id] === 'incorrect').length;
  const pendientes = items.filter(
    (item) => !statuses[item.id] || statuses[item.id] === 'passed'
  ).length;

  // Check if round/game is complete
  const checkGameCompletion = useCallback(
    (currentStatuses: Record<string, RoscoStatus>) => {
      const allDone = items.every(
        (it) => currentStatuses[it.id] === 'correct' || currentStatuses[it.id] === 'incorrect'
      );
      if (allDone) {
        setGameOver(true);
        setIsTimerActive(false);
        playSound('win');
      }
    },
    [items]
  );

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerEnabled && isTimerActive && timeLeft > 0 && !gameOver) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setGameOver(true);
            playSound('whistle');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerEnabled, isTimerActive, timeLeft, gameOver]);

  // Focus input when moving to a new letter
  useEffect(() => {
    if (!feedback) {
      inputRef.current?.focus();
    }
  }, [currentIndex, feedback]);

  // Find next unanswered or passed letter
  const getNextAvailableIndex = (startIndex: number, currentStatuses: Record<string, RoscoStatus>) => {
    const total = items.length;
    for (let i = 1; i <= total; i++) {
      const nextIdx = (startIndex + i) % total;
      const status = currentStatuses[items[nextIdx].id];
      if (!status || status === 'passed') {
        return nextIdx;
      }
    }
    return startIndex; // If none left
  };

  // Handle Pasapalabra (Pass)
  const handlePasapalabra = () => {
    if (gameOver) return;
    playSound('pass');

    const newStatuses = {
      ...statuses,
      [currentItem.id]: 'passed' as RoscoStatus,
    };
    setStatuses(newStatuses);
    setFeedback(null);
    setShowHint(false);
    setUserAnswer('');

    const nextIdx = getNextAvailableIndex(currentIndex, newStatuses);
    if (nextIdx <= currentIndex) {
      setRound((r) => r + 1);
    }
    setCurrentIndex(nextIdx);
    checkGameCompletion(newStatuses);
  };

  // Submit Answer
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim() || gameOver) return;

    const normalizedUser = normalizeAnswer(userAnswer);
    const isCorrect = currentItem.acceptableAnswers.some((ans) => {
      const normAns = normalizeAnswer(ans);
      return (
        normalizedUser === normAns ||
        normalizedUser === `el ${normAns}` ||
        normalizedUser === `la ${normAns}` ||
        normAns.includes(normalizedUser && normalizedUser.length > 4 ? normalizedUser : '_____')
      );
    });

    const newStatus: RoscoStatus = isCorrect ? 'correct' : 'incorrect';
    const newStatuses = {
      ...statuses,
      [currentItem.id]: newStatus,
    };
    setStatuses(newStatuses);

    if (isCorrect) {
      playSound('correct');
      setFeedback({
        type: 'correct',
        messageEs: `¡Correcto! La respuesta es «${currentItem.answerEs}».`,
        messageArm: `Ճիշտ է։ Պատասխանն է՝ «${currentItem.answerArm}» (${currentItem.answerEs})։`,
        correctWord: currentItem.answerEs,
        correctArm: currentItem.answerArm,
      });
    } else {
      playSound('wrong');
      setFeedback({
        type: 'wrong',
        messageEs: `¡Incorrecto! La respuesta correcta era «${currentItem.answerEs}».`,
        messageArm: `Սխալ է։ Ճիշտ պատասխանն էր՝ «${currentItem.answerArm}» (${currentItem.answerEs})։`,
        correctWord: currentItem.answerEs,
        correctArm: currentItem.answerArm,
      });
    }

    checkGameCompletion(newStatuses);
  };

  // Continue playing to next word
  const handleContinue = () => {
    setFeedback(null);
    setShowHint(false);
    setUserAnswer('');

    const nextIdx = getNextAvailableIndex(currentIndex, statuses);
    if (nextIdx <= currentIndex) {
      setRound((r) => r + 1);
    }
    setCurrentIndex(nextIdx);
    checkGameCompletion(statuses);
  };

  // Restart Game
  const handleRestart = () => {
    setStatuses({});
    setCurrentIndex(0);
    setUserAnswer('');
    setFeedback(null);
    setShowHint(false);
    setRound(1);
    setTimeLeft(180);
    setGameOver(false);
    setIsTimerActive(false);
    playSound('whistle');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-2 sm:px-4 py-4">
      {/* Top Bar: TV Show Header & Stats */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 shadow-xl mb-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/30 font-black text-xl text-white">
            ⚽
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              EL ROSCO DE FÚTBOL
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Pasapalabra
              </span>
            </h2>
            <p className="text-xs text-blue-200/80">
              25 Տառ • Իսպաներեն & Հայերեն • Շրջանցի՛ր կամ պատասխանի՛ր
            </p>
          </div>
        </div>

        {/* Counters & Score */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Aciertos (Green) */}
          <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/50 rounded-xl px-3.5 py-1.5 shadow-md">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Aciertos (Ճիշտ)
              </div>
              <div className="text-xl font-black text-emerald-300 leading-none">{aciertos}</div>
            </div>
          </div>

          {/* Fallos (Red) */}
          <div className="flex items-center gap-2 bg-rose-950/70 border border-rose-500/50 rounded-xl px-3.5 py-1.5 shadow-md">
            <span className="w-3 h-3 rounded-full bg-rose-400"></span>
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                Fallos (Սխալ)
              </div>
              <div className="text-xl font-black text-rose-300 leading-none">{fallos}</div>
            </div>
          </div>

          {/* Pendientes */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-600 rounded-xl px-3 py-1.5">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                Մնացել է
              </div>
              <div className="text-lg font-bold text-white leading-none">{pendientes}</div>
            </div>
          </div>

          {/* Timer Mode Toggle & Display */}
          <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-500/40 rounded-xl px-3 py-1.5">
            {timerEnabled ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsTimerActive((prev) => !prev)}
                  className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  title={isTimerActive ? 'Դադարեցնել ժամանակը' : 'Շարունակել'}
                >
                  {isTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <div className="text-right">
                  <div className="text-[9px] uppercase font-bold text-blue-300">Վայրկյան</div>
                  <div
                    className={`text-lg font-mono font-black leading-none ${
                      timeLeft < 30 ? 'text-rose-400 animate-pulse' : 'text-blue-100'
                    }`}
                  >
                    {timeLeft}s
                  </div>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTimerEnabled(true);
                  setIsTimerActive(true);
                }}
                className="text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Ակտիվացնել 180 վայրկյանի ժամաչափը"
              >
                ⏱️ Միացնել ժամանակը
              </button>
            )}
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={handleRestart}
            title="Սկսել նորից (Reiniciar Rosco)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Arena: Circular Rosco layout + Center Card */}
      <div className="relative w-full flex flex-col items-center justify-center my-2">
        {/* The Rosco Circle of 25 Letters */}
        <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[540px] md:h-[540px] flex items-center justify-center">
          {/* Subtle circular track */}
          <div className="absolute inset-4 sm:inset-6 rounded-full border border-blue-500/20 shadow-[inset_0_0_40px_rgba(30,58,138,0.3)] pointer-events-none"></div>

          {/* Letter Badges in Polar Distribution */}
          {items.map((item, index) => {
            const total = items.length;
            // Angle in radians starting from top (-pi/2)
            const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
            // Radii for responsiveness: 44% from center
            const radiusPercent = 44;
            const x = 50 + radiusPercent * Math.cos(angle);
            const y = 50 + radiusPercent * Math.sin(angle);

            const status = statuses[item.id] || 'unanswered';
            const isCurrent = index === currentIndex;

            let badgeBg =
              'bg-gradient-to-b from-blue-600 to-indigo-800 text-white border-blue-400/50 shadow-blue-500/20';
            if (status === 'correct') {
              badgeBg =
                'bg-gradient-to-b from-emerald-500 to-green-700 text-white border-emerald-300 shadow-emerald-500/40';
            } else if (status === 'incorrect') {
              badgeBg =
                'bg-gradient-to-b from-rose-500 to-red-800 text-white border-rose-300 shadow-rose-500/40';
            } else if (status === 'passed') {
              badgeBg =
                'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black border-amber-200 shadow-amber-400/40';
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (!gameOver) {
                    setCurrentIndex(index);
                    setFeedback(null);
                    setShowHint(false);
                    setUserAnswer('');
                  }
                }}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`Տառ ${item.letter}: ${status}`}
                className={`absolute w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm sm:text-base md:text-lg border-2 transition-all duration-300 cursor-pointer shadow-lg select-none ${badgeBg} ${
                  isCurrent
                    ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-125 z-20 animate-pulse'
                    : 'hover:scale-110 z-10'
                }`}
              >
                {item.letter}
              </button>
            );
          })}

          {/* Center Card inside the Rosco Ring */}
          <div className="z-10 w-[240px] sm:w-[320px] md:w-[370px] max-h-[85%] overflow-y-auto bg-slate-950/95 border-2 border-blue-500/40 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between text-center scrollbar-thin">
            {/* Top Indicator */}
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                {currentItem.type === 'empieza'
                  ? `Empieza por ${currentItem.letter}`
                  : `Contiene la ${currentItem.letter}`}
              </span>

              <button
                type="button"
                onClick={() => speakSpanish(currentItem.questionEs)}
                className="p-1 rounded-md text-blue-300 hover:text-white bg-blue-900/40 hover:bg-blue-800 transition-colors cursor-pointer"
                title="Լսել հարցը իսպաներեն"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clue with Click-to-Translate */}
            <div className="my-1 text-left">
              <BilingualText
                es={currentItem.questionEs}
                arm={currentItem.questionArm}
                prefixBadge={`Տառ: ${currentItem.letter}`}
                esClassName="text-xs sm:text-sm md:text-base font-semibold text-slate-100"
                armClassName="text-xs sm:text-sm"
              />
            </div>

            {/* Hint if revealed */}
            {showHint && currentItem.hintEs && (
              <div className="my-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-left text-xs">
                <p className="font-semibold text-amber-300 flex items-center gap-1">
                  💡 {currentItem.hintEs}
                </p>
                <p className="text-amber-200/80 mt-0.5">{currentItem.hintArm}</p>
              </div>
            )}

            {/* If feedback is active: show result + button to CONTINUE PLAYING */}
            {feedback ? (
              <div className="mt-3 flex flex-col gap-2 animate-fadeIn">
                <div
                  className={`p-2.5 rounded-xl text-left border ${
                    feedback.type === 'correct'
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
                      : 'bg-rose-950/80 border-rose-500/60 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                    {feedback.type === 'correct' ? '🎉 ՃԻՇՏ Է (¡CORRECTO!)' : '❌ ՍԽԱԼ Է (INCORRECTO)'}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold">
                    🇪🇸 {currentItem.answerEs} — 🇦🇲 {currentItem.answerArm}
                  </div>
                  <div className="text-[11px] mt-1 opacity-90 leading-tight">
                    {currentItem.explanationEs}
                  </div>
                </div>

                {/* Continue Playing Button */}
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>Շարունակել խաղալ (Հաջորդ բառը)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Input & Action Buttons */
              <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={`Պատասխան իսպաներեն (${currentItem.letter}...)`}
                  disabled={gameOver}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-900 border border-blue-400/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-slate-400 outline-none transition-all"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    disabled={!userAnswer.trim() || gameOver}
                    className="py-2 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Պատասխանել ✓
                  </button>

                  <button
                    type="button"
                    onClick={handlePasapalabra}
                    disabled={gameOver}
                    className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <span>Pasapalabra ↷</span>
                  </button>
                </div>

                {/* Helper buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Հուշում (Pista)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswer(currentItem.answerEs);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Օգնություն (Ver palabra)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Instructions / Learning Note */}
      <div className="w-full mt-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-300 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Խաղի կանոնները՝</strong> Սեղմի՛ր ցանկացած իսպաներեն նախադասության վրա՝ հայերեն թարգմանությունը կարդալու համար։ Եթե պատասխանը ճիշտ է կամ սխալ, կարող ես անմիջապես շարունակել խաղալ «Հաջորդ բառը» կոճակով։
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
            Փուլ {round}
          </span>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-blue-950 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-center animate-scaleUp">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg font-black text-2xl">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">¡FIN DE LA PARTIDA!</h3>
            <p className="text-sm text-blue-200 mt-1">Խաղն ավարտվեց։ Ահա քո արդյունքը՝</p>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50">
                <div className="text-xs text-emerald-400 uppercase font-bold">Ճիշտ (Aciertos)</div>
                <div className="text-3xl font-black text-emerald-300">{aciertos}</div>
              </div>
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50">
                <div className="text-xs text-rose-400 uppercase font-bold">Սխալ (Fallos)</div>
                <div className="text-3xl font-black text-rose-300">{fallos}</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              {aciertos >= 20
                ? '🌟 Հիանալի՛ արդյունք։ Դու իսկական Pasapalabra-ի չեմպիոն ես։'
                : '⚽ Շատ լավ փորձ։ Կարող ես կրկին փորձել և բարելավել արդյունքդ։'}
            </p>

            <button
              type="button"
              onClick={handleRestart}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-400/20 cursor-pointer active:scale-95 transition-all"
            >
              Խաղալ կրկին ↺
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
