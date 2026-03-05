import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { dailyQuestions } from '../data/russianData';

function getDailyTasks() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const shuffled = [...dailyQuestions].sort((a, b) => {
    const hashA = (parseInt(a.id.replace('d', '')) * seed) % dailyQuestions.length;
    const hashB = (parseInt(b.id.replace('d', '')) * seed) % dailyQuestions.length;
    return hashA - hashB;
  });
  return shuffled.slice(0, 3).map((q, i) => ({
    ...q,
    taskId: `daily_${today.toDateString()}_${i}`,
    reward: [30, 50, 80][i],
  }));
}

export function DailyPage() {
  const { dailyTasksCompleted, markDailyCompleted, addCoins, addXp } = useGameStore();
  const dailyTasks = getDailyTasks();
  const today = new Date().toDateString();
  const todayKey = `daily_${today}_`;

  const [active, setActive] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const completedToday = dailyTasksCompleted.filter(id => id.startsWith(todayKey));
  const totalReward = dailyTasks.reduce((s, t) => s + t.reward, 0);
  const earnedToday = dailyTasks.filter(t => dailyTasksCompleted.includes(t.taskId)).reduce((s, t) => s + t.reward, 0);

  const handleSelect = (qi: number, idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const task = dailyTasks[qi];
    if (idx === task.answer) {
      addCoins(task.reward);
      addXp(task.reward);
      markDailyCompleted(task.taskId);
    }
  };

  const openTask = (i: number) => {
    if (dailyTasksCompleted.includes(dailyTasks[i].taskId)) return;
    setActive(i);
    setSelected(null);
    setAnswered(false);
  };

  const closeTask = () => {
    setActive(null);
    setSelected(null);
    setAnswered(false);
  };

  const timeUntilReset = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}ч ${m}м`;
  };

  return (
    <div className="min-h-screen p-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-2xl font-black mb-1">⚡ Ежедневные задания</h2>
        <p className="text-white/50 text-sm">Обновляются каждый день в полночь</p>
      </div>

      {/* Progress banner */}
      <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-400/30 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-lg">{completedToday.length}/{dailyTasks.length} выполнено</p>
            <p className="text-white/60 text-sm">Обновление через {timeUntilReset()}</p>
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-black text-2xl">🪙 {earnedToday}</p>
            <p className="text-white/50 text-xs">из {totalReward} монет</p>
          </div>
        </div>
        <div className="bg-black/20 rounded-full h-3">
          <motion.div className="bg-gradient-to-r from-orange-400 to-yellow-400 h-3 rounded-full"
            animate={{ width: `${(completedToday.length / dailyTasks.length) * 100}%` }} />
        </div>
      </div>

      {/* Streak bonus */}
      <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-white font-bold">Серия выполнений</p>
            <p className="text-white/60 text-sm">Выполняйте ежедневные задания подряд для бонусов!</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-red-400 font-black text-2xl">{useGameStore.getState().streak}</p>
            <p className="text-white/50 text-xs">дней</p>
          </div>
        </div>
      </div>

      {/* Task cards */}
      <div className="space-y-3 mb-6">
        {dailyTasks.map((task, i) => {
          const isCompleted = dailyTasksCompleted.includes(task.taskId);
          return (
            <motion.div key={task.taskId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => openTask(i)}
              className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${isCompleted ? 'bg-green-500/10 border-green-400/40' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isCompleted ? 'bg-green-500/20' : 'bg-gradient-to-br from-orange-500/30 to-yellow-500/30'}`}>
                  {isCompleted ? '✅' : ['📝', '🔤', '🧩'][i]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wide mb-1">Задание {i + 1}</p>
                  <p className="text-white font-semibold text-sm line-clamp-2">{task.question}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`font-black text-lg ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isCompleted ? '✓' : `🪙${task.reward}`}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly bonus */}
      <div className="bg-purple-500/10 border border-purple-400/20 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3">🎁 Недельный бонус</h3>
        <div className="flex gap-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => {
            const dayNum = (new Date().getDay() + 6) % 7;
            return (
              <div key={day} className={`flex-1 text-center py-2 rounded-xl text-xs font-bold ${i < dayNum ? 'bg-green-500/30 text-green-300' : i === dayNum ? 'bg-yellow-500/30 text-yellow-300 ring-1 ring-yellow-400' : 'bg-white/5 text-white/30'}`}>
                {i < dayNum ? '✓' : day}
              </div>
            );
          })}
        </div>
        <p className="text-white/50 text-xs mt-3 text-center">Выполните все 7 дней и получите 500 🪙</p>
      </div>

      {/* Quiz modal */}
      <AnimatePresence>
        {active !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              className="bg-gray-900 rounded-3xl max-w-lg w-full border border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 flex items-center justify-between">
                <span className="text-white font-black">⚡ Ежедневное задание {active + 1}</span>
                <span className="text-yellow-900 font-black bg-white/30 px-3 py-1 rounded-full text-sm">
                  🪙 {dailyTasks[active]?.reward}
                </span>
              </div>
              <div className="p-6">
                <p className="text-white text-lg font-semibold mb-6 leading-relaxed">{dailyTasks[active]?.question}</p>
                <div className="space-y-3">
                  {dailyTasks[active]?.options.map((opt, idx) => {
                    let cls = 'bg-white/10 border-white/20 text-white hover:bg-white/20';
                    if (answered) {
                      if (idx === dailyTasks[active].answer) cls = 'bg-green-500/30 border-green-400 text-green-200';
                      else if (idx === selected) cls = 'bg-red-500/30 border-red-400 text-red-200';
                      else cls = 'bg-white/5 border-white/10 text-white/40';
                    }
                    return (
                      <button key={idx} onClick={() => handleSelect(active, idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${cls}`}>
                        <span className="text-xs font-bold mr-2 opacity-70">{['A', 'B', 'C', 'D'][idx]})</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={`mt-4 p-4 rounded-xl border ${selected === dailyTasks[active]?.answer ? 'bg-green-500/10 border-green-400/30 text-green-200' : 'bg-red-500/10 border-red-400/30 text-red-200'}`}>
                      <p className="text-sm font-semibold mb-1">{selected === dailyTasks[active]?.answer ? `✅ Верно! +${dailyTasks[active]?.reward} монет` : '❌ Неверно!'}</p>
                      <p className="text-xs opacity-80">{dailyTasks[active]?.explanation}</p>
                    </div>
                    <button onClick={closeTask} className="w-full mt-3 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-500">
                      Закрыть
                    </button>
                  </motion.div>
                )}
                {!answered && (
                  <button onClick={closeTask} className="w-full mt-4 bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20">
                    Отмена
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
