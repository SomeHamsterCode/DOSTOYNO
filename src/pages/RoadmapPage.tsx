import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { russianModules, Module, Section } from '../data/russianData';
import { QuizModal } from '../components/QuizModal';

function SectionCard({ section, moduleId, isCompleted, bestScore, isLocked }: {
  section: Section; moduleId: string; isCompleted: boolean; bestScore: number; isLocked: boolean;
}) {
  const [showQuiz, setShowQuiz] = useState(false);

  const getRankColor = (score: number) => {
    if (score >= 90) return 'text-yellow-400';
    if (score >= 70) return 'text-green-400';
    return 'text-orange-400';
  };
  const getRankLabel = (score: number) => {
    if (score >= 90) return '🥇';
    if (score >= 70) return '🥈';
    return '🥉';
  };

  return (
    <>
      <motion.div
        whileHover={isLocked ? {} : { x: 4 }}
        whileTap={isLocked ? {} : { scale: 0.98 }}
        onClick={() => !isLocked && setShowQuiz(true)}
        className={`relative rounded-2xl p-4 border transition-all ${
          isLocked
            ? 'bg-white/3 border-white/8 opacity-60 cursor-not-allowed'
            : isCompleted
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30 cursor-pointer hover:border-green-400/60'
              : 'bg-white/5 border-white/10 cursor-pointer hover:border-white/25 hover:bg-white/8'
        }`}>
        {isLocked && (
          <div className="absolute right-3 top-3 text-white/30 text-sm">🔒</div>
        )}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all ${
            isCompleted ? 'bg-green-500/25 shadow-lg shadow-green-500/20' : 'bg-white/8'
          }`}>
            {isCompleted ? '✅' : isLocked ? '🔒' : section.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">{section.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-white/40 text-xs">{section.questions.length} вопросов</span>
              {isCompleted && (
                <span className="text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full font-semibold">
                  Завершён
                </span>
              )}
            </div>
          </div>
          {isCompleted && bestScore > 0 && (
            <div className="text-right flex-shrink-0">
              <div className={`text-base font-black ${getRankColor(bestScore)}`}>
                {getRankLabel(bestScore)} {bestScore}%
              </div>
            </div>
          )}
          {!isLocked && (
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-white/30 text-sm flex-shrink-0">
              ▶
            </motion.div>
          )}
        </div>
        {isCompleted && bestScore > 0 && (
          <div className="mt-3 bg-white/10 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${bestScore}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {showQuiz && (
          <QuizModal section={section} moduleId={moduleId} onClose={() => setShowQuiz(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function ModuleCard({ module, moduleProgress, index }: {
  module: Module;
  moduleProgress: Record<string, { completed: boolean; bestScore: number }>;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const completedSections = module.sections.filter(s => moduleProgress[s.id]?.completed).length;
  const totalSections = module.sections.length;
  const completionPct = Math.round((completedSections / totalSections) * 100);
  const isFullyDone = completedSections === totalSections;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`relative rounded-2xl overflow-hidden border shadow-lg mb-3 ${
        isFullyDone ? 'border-yellow-400/30' : 'border-white/10'
      }`}>
      {/* Top color line */}
      <div className={`h-1 bg-gradient-to-r ${module.color}`} />

      <div className={`backdrop-blur-sm ${isFullyDone ? 'bg-yellow-400/5' : 'bg-gray-800/60'}`}>
        <button onClick={() => setExpanded(!expanded)} className="w-full p-5 text-left">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0 relative`}>
              {module.icon}
              {isFullyDone && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">✓</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/40 text-xs font-bold uppercase tracking-wider">ЕГЭ • Задание {module.number}</span>
                {isFullyDone && (
                  <span className="text-yellow-400 text-xs font-bold bg-yellow-400/15 px-2 py-0.5 rounded-full">🏆 Пройден</span>
                )}
              </div>
              <h3 className="text-white font-black text-base leading-tight">{module.subtitle}</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`bg-gradient-to-r ${module.color} h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 1.2 }}
                  />
                </div>
                <span className="text-white/40 text-xs font-semibold flex-shrink-0">
                  {completedSections}/{totalSections}
                </span>
              </div>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-white/40 text-lg flex-shrink-0 w-6 h-6 flex items-center justify-center">
              ▾
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden">
              <div className="px-5 pb-5 space-y-2 border-t border-white/8 pt-3">
                {module.sections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    moduleId={module.id}
                    isCompleted={moduleProgress[section.id]?.completed ?? false}
                    bestScore={moduleProgress[section.id]?.bestScore ?? 0}
                    isLocked={false}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const OTHER_SUBJECTS = [
  { id: 'math', name: 'Проф. математика', icon: '📐', color: 'from-blue-500 to-cyan-500',
    topics: ['Алгебра', 'Геометрия', 'Производные', 'Интегралы', 'Вероятность'] },
  { id: 'english', name: 'Английский язык', icon: '🇬🇧', color: 'from-red-500 to-rose-500',
    topics: ['Грамматика', 'Лексика', 'Чтение', 'Аудирование', 'Эссе'] },
  { id: 'history', name: 'История', icon: '📜', color: 'from-amber-500 to-orange-500',
    topics: ['Древняя Русь', 'Российская империя', 'СССР', 'Новейшая история'] },
  { id: 'biology', name: 'Биология', icon: '🧬', color: 'from-green-500 to-teal-500',
    topics: ['Клетка', 'Генетика', 'Эволюция', 'Экология', 'Анатомия'] },
  { id: 'physics', name: 'Физика', icon: '⚛️', color: 'from-violet-500 to-purple-500',
    topics: ['Механика', 'Термодинамика', 'Электродинамика', 'Оптика'] },
  { id: 'chemistry', name: 'Химия', icon: '🧪', color: 'from-pink-500 to-rose-500',
    topics: ['Органика', 'Неорганика', 'Реакции', 'Электролиз'] },
  { id: 'social', name: 'Обществознание', icon: '🌍', color: 'from-indigo-500 to-blue-500',
    topics: ['Право', 'Экономика', 'Политология', 'Социология'] },
];

export function RoadmapPage() {
  const moduleProgress = useGameStore(s => s.moduleProgress);
  const [activeSubject, setActiveSubject] = useState<string>('russian');

  const totalCompleted = russianModules.reduce((sum, m) =>
    sum + m.sections.filter(s => moduleProgress[m.id]?.[s.id]?.completed).length, 0);
  const totalSections = russianModules.reduce((sum, m) => sum + m.sections.length, 0);

  return (
    <div className="min-h-screen pb-8">
      {/* Subject switcher */}
      <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-white/10">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubject('russian')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeSubject === 'russian'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/8 text-white/50 hover:bg-white/15'
            }`}>
            📖 Русский язык
          </button>
          {OTHER_SUBJECTS.map(s => (
            <button key={s.id} onClick={() => setActiveSubject(s.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeSubject === s.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/8 text-white/50 hover:bg-white/15'
              }`}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5">
        {activeSubject === 'russian' ? (
          <>
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-white text-2xl font-black">📖 Русский язык</h2>
                  <p className="text-white/40 text-sm">Задания из открытого банка ФИПИ</p>
                </div>
                <div className="text-right">
                  <div className="text-white font-black text-lg">{totalCompleted}/{totalSections}</div>
                  <div className="text-white/40 text-xs">разделов</div>
                </div>
              </div>

              {/* Global progress */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm font-semibold">Общий прогресс</span>
                  <span className="text-white font-black">{Math.round((totalCompleted / totalSections) * 100)}%</span>
                </div>
                <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalCompleted / totalSections) * 100}%` }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
                <div className="flex gap-3 mt-3">
                  {[
                    { label: 'Задания', val: russianModules.length, icon: '📚' },
                    { label: 'Разделы', val: `${totalCompleted}/${totalSections}`, icon: '✅' },
                    { label: 'Осталось', val: totalSections - totalCompleted, icon: '🎯' },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="text-white font-black text-sm">{item.icon} {item.val}</div>
                      <div className="text-white/30 text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Roadmap path visual */}
            <div className="mb-4 relative">
              <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent" />
              <div className="space-y-0">
                {russianModules.map((module, i) => (
                  <div key={module.id} className="relative pl-14">
                    {/* Node */}
                    <div className={`absolute left-4 top-7 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black z-10 transition-all ${
                      moduleProgress[module.id] && module.sections.every(s => moduleProgress[module.id]?.[s.id]?.completed)
                        ? 'bg-yellow-400 border-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/40'
                        : 'bg-gray-800 border-indigo-500 text-indigo-400'
                    }`}>
                      {i + 1}
                    </div>
                    <ModuleCard module={module} moduleProgress={moduleProgress[module.id] || {}} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          (() => {
            const subject = OTHER_SUBJECTS.find(s => s.id === activeSubject)!;
            return (
              <div className="pb-8">
                {/* Subject header */}
                <div className={`rounded-3xl p-6 bg-gradient-to-br ${subject.color} mb-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 right-4 text-6xl">{subject.icon}</div>
                  </div>
                  <h2 className="text-white text-2xl font-black relative">{subject.name}</h2>
                  <p className="text-white/70 text-sm relative mt-1">ЕГЭ подготовка</p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 relative">
                    <span className="text-white text-xs font-bold">🚧 В разработке</span>
                  </div>
                </div>

                {/* Topics preview */}
                <h3 className="text-white font-black text-lg mb-3">Темы, которые будут добавлены:</h3>
                <div className="space-y-2 mb-8">
                  {subject.topics.map((topic, i) => (
                    <motion.div key={topic} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 0.5 + i * 0.05, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/8 opacity-60">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">🔒</div>
                      <span className="text-white/60 font-semibold text-sm">{topic}</span>
                      <span className="ml-auto text-white/20 text-xs">Скоро</span>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">🔔</div>
                  <h3 className="text-white font-bold mb-2">Следите за обновлениями!</h3>
                  <p className="text-white/50 text-sm">
                    Новые предметы добавляются регулярно. Пока тренируйтесь с русским языком
                    и накапливайте монеты для строительства поселения!
                  </p>
                  <div className="mt-4 flex gap-3">
                    <div className="flex-1 bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-3">
                      <div className="text-indigo-400 font-black text-lg">📖</div>
                      <div className="text-white/60 text-xs mt-1">Русский язык<br/><span className="text-green-400 font-bold">Доступен!</span></div>
                    </div>
                    {OTHER_SUBJECTS.slice(0, 3).map(s => (
                      <div key={s.id} className="flex-1 bg-white/5 border border-white/8 rounded-xl p-3 opacity-50">
                        <div className="text-lg">{s.icon}</div>
                        <div className="text-white/40 text-xs mt-1">{s.name.split(' ')[0]}<br/>Скоро</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
