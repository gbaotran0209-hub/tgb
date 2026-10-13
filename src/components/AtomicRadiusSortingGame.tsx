import React, { useState, useMemo } from 'react';
import { ELEMENTS, ELEMENT_BY_SYMBOL, ChemicalElement } from '../data/elements';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, HelpCircle, Trophy, Sparkles, MoveRight, ArrowUpDown } from 'lucide-react';

interface SortingChallenge {
  id: number;
  title: string;
  direction: 'asc' | 'desc'; // asc: tăng dần (<), desc: giảm dần (>)
  symbols: string[];
  hint: string;
  explanation: string;
}

const PRESET_CHALLENGES: SortingChallenge[] = [
  {
    id: 1,
    title: 'Thử thách 1: Các nguyên tố thuộc Chu kì 3',
    direction: 'desc',
    symbols: ['Na', 'Mg', 'Al', 'Cl'],
    hint: 'Trong cùng một chu kì, đi từ trái sang phải: điện tích hạt nhân Z tăng trong khi số lớp electron không đổi (3 lớp), lực hút mạnh hơn nên bán kính giảm dần.',
    explanation:
      'Na (Z=11), Mg (Z=12), Al (Z=13), Cl (Z=17) đều thuộc chu kì 3. Điện tích hạt nhân tăng dần: +11 < +12 < +13 < +17 → Bán kính giảm dần: Na (186 pm) > Mg (160 pm) > Al (143 pm) > Cl (99 pm).',
  },
  {
    id: 2,
    title: 'Thử thách 2: Các kim loại kiềm thuộc Nhóm IA',
    direction: 'asc',
    symbols: ['Li', 'Na', 'K', 'Rb'],
    hint: 'Trong cùng một nhóm A, đi từ trên xuống dưới: số lớp electron tăng dần, electron lớp ngoài cùng ở xa hạt nhân hơn nên bán kính tăng dần.',
    explanation:
      'Li (2 lớp), Na (3 lớp), K (4 lớp), Rb (5 lớp) đều thuộc nhóm IA. Số lớp electron tăng dần nên bán kính tăng dần: Li (152 pm) < Na (186 pm) < K (227 pm) < Rb (248 pm).',
  },
  {
    id: 3,
    title: 'Thử thách 3: Các phi kim thuộc Chu kì 2',
    direction: 'desc',
    symbols: ['C', 'N', 'O', 'F'],
    hint: 'Các nguyên tố C, N, O, F đều có 2 lớp electron. Khi Z tăng từ 6 lên 9, lực hút hạt nhân tăng làm bán kính co lại.',
    explanation:
      'C (Z=6), N (Z=7), O (Z=8), F (Z=9) cùng thuộc chu kì 2. Lực hút hạt nhân tăng dần: C (77 pm) > N (70 pm) > O (66 pm) > F (64 pm).',
  },
  {
    id: 4,
    title: 'Thử thách 4: Các kim loại kiềm thổ thuộc Nhóm IIA',
    direction: 'desc',
    symbols: ['Be', 'Mg', 'Ca', 'Ba'],
    hint: 'Xác định số lớp electron của từng nguyên tố: Ba (6 lớp), Ca (4 lớp), Mg (3 lớp), Be (2 lớp).',
    explanation:
      'Be (112 pm), Mg (160 pm), Ca (197 pm), Ba (222 pm). Theo chiều giảm dần: Ba (222 pm) > Ca (197 pm) > Mg (160 pm) > Be (112 pm).',
  },
  {
    id: 5,
    title: 'Thử thách 5: So sánh bắc cầu khác chu kì & khác nhóm',
    direction: 'desc',
    symbols: ['K', 'Ca', 'Na', 'Mg'],
    hint: 'So sánh K và Na (nhóm IA: K > Na); Na và Mg (chu kì 3: Na > Mg); K và Ca (chu kì 4: K > Ca). K và Ca có 4 lớp electron nên đều lớn hơn Na và Mg (3 lớp).',
    explanation:
      'K (227 pm) > Ca (197 pm) > Na (186 pm) > Mg (160 pm). K và Ca thuộc chu kì 4 (4 lớp electron) nên có bán kính lớn hơn Na và Mg thuộc chu kì 3 (3 lớp electron).',
  },
];

export const AtomicRadiusSortingGame: React.FC = () => {
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState<number>(0);
  const challenge = PRESET_CHALLENGES[currentChallengeIdx];

  // Pool of available tiles to pick from (shuffled or unplaced)
  const [placedSymbols, setPlacedSymbols] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const availableSymbols = useMemo(() => {
    return challenge.symbols.filter((s) => !placedSymbols.includes(s));
  }, [challenge, placedSymbols]);

  const correctSortedSymbols = useMemo(() => {
    const list = [...challenge.symbols].map((s) => ELEMENT_BY_SYMBOL[s]);
    if (challenge.direction === 'asc') {
      list.sort((a, b) => (a.atomicRadius ?? 0) - (b.atomicRadius ?? 0));
    } else {
      list.sort((a, b) => (b.atomicRadius ?? 0) - (a.atomicRadius ?? 0));
    }
    return list.map((el) => el.symbol);
  }, [challenge]);

  const isCorrect = useMemo(() => {
    if (placedSymbols.length !== challenge.symbols.length) return false;
    return placedSymbols.every((s, i) => s === correctSortedSymbols[i]);
  }, [placedSymbols, correctSortedSymbols, challenge]);

  const handleSelectSymbol = (sym: string) => {
    if (isSubmitted) return;
    if (placedSymbols.length < challenge.symbols.length) {
      setPlacedSymbols([...placedSymbols, sym]);
    }
  };

  const handleRemoveSymbol = (index: number) => {
    if (isSubmitted) return;
    const next = [...placedSymbols];
    next.splice(index, 1);
    setPlacedSymbols(next);
  };

  const handleMoveLeft = (index: number) => {
    if (isSubmitted || index <= 0) return;
    const next = [...placedSymbols];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setPlacedSymbols(next);
  };

  const handleMoveRight = (index: number) => {
    if (isSubmitted || index >= placedSymbols.length - 1) return;
    const next = [...placedSymbols];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setPlacedSymbols(next);
  };

  const handleReset = () => {
    setPlacedSymbols([]);
    setIsSubmitted(false);
  };

  const handleNextChallenge = () => {
    setCurrentChallengeIdx((prev) => (prev + 1) % PRESET_CHALLENGES.length);
    setPlacedSymbols([]);
    setIsSubmitted(false);
  };

  const handleSubmit = () => {
    if (placedSymbols.length !== challenge.symbols.length) return;
    setIsSubmitted(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 border border-slate-200 shadow-xs space-y-6">
      {/* Header & Level Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Bài tập tương tác: Sắp xếp bán kính nguyên tử</span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
            {challenge.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_CHALLENGES.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCurrentChallengeIdx(idx);
                setPlacedSymbols([]);
                setIsSubmitted(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentChallengeIdx === idx
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              Bài {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Prompt */}
      <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
            <MoveRight className="w-4 h-4 text-indigo-600" />
            <span>Yêu cầu đề bài:</span>
          </div>
          <p className="text-sm text-slate-900 font-semibold">
            Hãy bấm chọn các nguyên tố bên dưới và sắp xếp theo chiều{' '}
            <strong className="text-indigo-700 underline underline-offset-2">
              {challenge.direction === 'desc' ? 'GIẢM DẦN (>)' : 'TĂNG DẦN (<)'}
            </strong>{' '}
            bán kính nguyên tử.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xếp lại từ đầu</span>
          </button>
        </div>
      </div>

      {/* Slots to fill: Ordered Sequence */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700">
          Vị trí sắp xếp của bạn ({placedSymbols.length}/{challenge.symbols.length}):
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: challenge.symbols.length }, (_, slotIdx) => {
            const sym = placedSymbols[slotIdx];
            const el = sym ? ELEMENT_BY_SYMBOL[sym] : null;

            return (
              <div
                key={slotIdx}
                className={`min-h-[130px] rounded-2xl border-2 transition-all p-3 flex flex-col justify-between ${
                  sym
                    ? isSubmitted
                      ? sym === correctSortedSymbols[slotIdx]
                        ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-xs'
                        : 'bg-rose-50/90 border-rose-400 text-rose-950 shadow-xs'
                      : 'bg-white border-indigo-400 shadow-xs'
                    : 'bg-slate-50/70 border-dashed border-slate-300 text-slate-400 flex items-center justify-center'
                }`}
              >
                {el ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        Vị trí #{slotIdx + 1}
                      </span>
                      {!isSubmitted && (
                        <div className="flex items-center gap-1">
                          {slotIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveLeft(slotIdx)}
                              title="Chuyển sang trái"
                              className="px-1 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                            >
                              ←
                            </button>
                          )}
                          {slotIdx < placedSymbols.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveRight(slotIdx)}
                              title="Chuyển sang phải"
                              className="px-1 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                            >
                              →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveSymbol(slotIdx)}
                            title="Bỏ chọn"
                            className="w-5 h-5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 flex items-center justify-center text-xs font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="my-1.5 text-center">
                      <div className="font-display text-2xl font-extrabold text-slate-900">
                        {el.symbol}
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        {el.name} <span className="text-slate-500 font-normal">({el.vietnameseName})</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                        Z = {el.atomicNumber} · Chu kì {el.period} · Nhóm {el.groupRoman}
                      </div>
                    </div>

                    <div className="text-center pt-1 border-t border-slate-100">
                      {isSubmitted ? (
                        <span className="font-mono text-xs font-extrabold text-indigo-700">
                          R = {el.atomicRadius} pm
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Bấm để tháo ô</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-3">
                    <span className="text-xs font-bold text-slate-400 block">
                      Ô #{slotIdx + 1}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Bấm nguyên tố bên dưới để xếp vào đây
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pool of Available Elements to Pick */}
      {availableSymbols.length > 0 && !isSubmitted && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700">
            Các nguyên tố chưa xếp (Bấm để đưa vào thứ tự):
          </div>
          <div className="flex flex-wrap gap-2.5">
            {availableSymbols.map((sym) => {
              const el = ELEMENT_BY_SYMBOL[sym];
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleSelectSymbol(sym)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-400 text-left transition-all cursor-pointer shadow-2xs hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-extrabold text-slate-900">
                      {el.symbol}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {el.name} ({el.vietnameseName})
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    Z={el.atomicNumber} · CK {el.period} · Nhóm {el.groupRoman}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit / Verification Area */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200">
        {!isSubmitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={placedSymbols.length !== challenge.symbols.length}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
              placedSymbols.length === challenge.symbols.length
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Kiểm tra kết quả sắp xếp</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNextChallenge}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span>Làm bài tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Làm lại bài này
            </button>
          </div>
        )}

        <div className="text-xs text-slate-500 font-medium">
          Dạng bài tập sắp xếp bán kính nguyên tử chuẩn SGK Hóa 10
        </div>
      </div>

      {/* Feedback & Step-by-Step Explanation when submitted */}
      {isSubmitted && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
            isCorrect
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/90 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-display text-sm sm:text-base font-extrabold">
                {isCorrect ? 'Chúc mừng! Bạn đã sắp xếp hoàn toàn chính xác!' : 'Chưa đúng, hãy cùng xem lại lời giải chi tiết:'}
              </div>
              <div className="font-mono text-xs font-bold mt-1">
                Thứ tự chính xác ({challenge.direction === 'desc' ? 'Giảm dần' : 'Tăng dần'}):{' '}
                {correctSortedSymbols
                  .map((s) => `${s} (${ELEMENT_BY_SYMBOL[s].atomicRadius} pm)`)
                  .join(challenge.direction === 'desc' ? ' > ' : ' < ')}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
            <div className="font-bold text-slate-900">Giải thích chi tiết:</div>
            <p>{challenge.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};
