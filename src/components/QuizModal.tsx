import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { QuizQuestion, Section } from './data/russianData';

interface Props {
  section: Section;
  moduleId: string;
  onClose: () => void;
}

export function QuizModal({ section, moduleId, onClose }: Props) {
  const { completeSection, addCoins, addXp } = useGameStore();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [finished, setFinished] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const questions = section.questions;
  const q: QuizQuestion = questions[current];
  const progress = ((current) / questions.length) * 100;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = idx === q.answer;
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setWrong(false);
    } else {
      setLives(l => l - 1);
      setWrong(true);
      if (lives - 1 <= 0) {
        setTimeout(() => { setFinished(true); }, 1200);
        return;
      }
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
      setShowExplanation(false);
      setWrong(false);
    }
  };

  useEffect(() => {
    if (finished) {
      const pct = Math.round((correctCount / questions.length) * 100);
      completeSection(moduleId, section.id, pct);
      const coins = pct >= 80 ? 30 : pct >= 60 ? 15 : 5;
      const xp = pct >= 80 ? 50 : pct >= 60 ? 25 : 10;
      addCoins(coins);
      addXp(xp);
    }
  }, [finished]);

  const pct = Math.round((correctCount / questions.length) * 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
        className="bg-gray-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-white/10">

        {!finished ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <div className="flex justify-between items-center mb-3">
                <button onClick={onClose} className="text-white/70 hover:text-white text-xl">✕</button>
                <span className="text-white font-bold text-sm">{section.icon} {section.title}</span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < lives ? 'text-red-400' : 'text-white/20'}`}>❤️</span>
                  ))}
                </div>
              </div>
              <div className="bg-white/20 rounded-full h-2">
                <motion.div className="bg-yellow-400 h-2 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
              <div className="text-white/70 text-xs mt-1 text-right">{current + 1} / {questions.length}</div>
            </div>

            {/* Question */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div key={current} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
                  <p className="text-white text-lg font-semibold mb-6 leading-relaxed">{q.question}</p>
                  <div className="space-y-3">
                    {q.options.map((opt, i) => {
                      let cls = 'bg-white/10 border-white/20 text-white hover:bg-white/20';
                      if (answered) {
                        if (i === q.answer) cls = 'bg-green-500/30 border-green-400 text-green-200';
                        else if (i === selected && selected !== q.answer) cls = 'bg-red-500/30 border-red-400 text-red-200';
                        else cls = 'bg-white/5 border-white/10 text-white/40';
                      }
                      return (
                        <motion.button key={i} whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect(i)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${cls}`}>
                          <span className="text-xs font-bold mr-2 opacity-70">{['A', 'B', 'C', 'D'][i]})</span>
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 rounded-xl border ${wrong ? 'bg-red-500/10 border-red-400/30 text-red-200' : 'bg-green-500/10 border-green-400/30 text-green-200'}`}>
                      <p className="text-sm font-semibold mb-1">{wrong ? '❌ Неверно!' : '✅ Верно!'}</p>
                      <p className="text-xs opacity-80">{q.explanation}</p>
                    </motion.div>
                  )}

                  {answered && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors">
                      {current + 1 >= questions.length ? 'Завершить 🏁' : 'Далее →'}
                    </motion.button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📚'}</div>
            <h2 className="text-white text-3xl font-black mb-2">
              {pct >= 80 ? 'Отлично!' : pct >= 60 ? 'Хорошо!' : 'Продолжайте!'}
            </h2>
            <p className="text-white/60 mb-6">{correctCount} из {questions.length} правильно</p>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="3" />
                <motion.circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={pct >= 80 ? '#fbbf24' : pct >= 60 ? '#34d399' : '#f87171'}
                  strokeWidth="3" strokeLinecap="round"
                  initial={{ strokeDasharray: '0 100' }}
                  animate={{ strokeDasharray: `${pct} ${100 - pct}` }}
                  transition={{ duration: 1, delay: 0.3 }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-2xl font-black">{pct}%</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">🪙 Получено монет</span>
                <span className="text-yellow-400 font-bold">+{pct >= 80 ? 30 : pct >= 60 ? 15 : 5}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">⭐ Опыт</span>
                <span className="text-blue-400 font-bold">+{pct >= 80 ? 50 : pct >= 60 ? 25 : 10} XP</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCurrent(0); setCorrectCount(0); setLives(3); setFinished(false); setSelected(null); setAnswered(false); setShowExplanation(false); }}
                className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20">
                🔄 Повторить
              </button>
              <button onClick={onClose} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-500">
                ✓ Закрыть
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
