import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, AvatarConfig } from '../store/gameStore';
import { AvatarSVG } from '../components/Registration';
import { russianModules } from '../data/russianData';
import { BUILDING_TYPES } from '../data/buildingsData';

const SKINS = [
  { id: 'light', color: '#FDDBB4' }, { id: 'medium', color: '#D4956A' },
  { id: 'dark', color: '#8D5524' }, { id: 'pale', color: '#FFE0C2' }, { id: 'warm', color: '#C68642' },
];
const HAIRS = [
  { id: 'black', color: '#1a1a1a' }, { id: 'brown', color: '#5C3317' },
  { id: 'blonde', color: '#D4AF37' }, { id: 'red', color: '#C0392B' },
  { id: 'white', color: '#E8E8E8' }, { id: 'blue', color: '#2980B9' },
  { id: 'pink', color: '#E91E8C' }, { id: 'green', color: '#27AE60' },
];
const HAIR_STYLES = [
  { id: 'short', label: 'Короткие' }, { id: 'long', label: 'Длинные' },
  { id: 'curly', label: 'Кудрявые' }, { id: 'bald', label: 'Лысый' },
  { id: 'ponytail', label: 'Хвостик' },
];
const OUTFITS = [
  { id: 'casual', emoji: '👕', label: 'Повседневный' }, { id: 'formal', emoji: '👔', label: 'Формальный' },
  { id: 'sport', emoji: '🎽', label: 'Спортивный' }, { id: 'winter', emoji: '🧥', label: 'Зимний' },
  { id: 'dress', emoji: '👗', label: 'Платье' }, { id: 'karate', emoji: '🥋', label: 'Карате' },
  { id: 'mage', emoji: '🧙', label: 'Маг' }, { id: 'student', emoji: '🎒', label: 'Студент' },
];
const ACCESSORIES = [
  { id: 'none', emoji: '—', label: 'Нет' }, { id: 'glasses', emoji: '🕶️', label: 'Очки' },
  { id: 'crown', emoji: '👑', label: 'Корона' }, { id: 'cap', emoji: '🎓', label: 'Берет' },
  { id: 'hat', emoji: '🎩', label: 'Шляпа' }, { id: 'helmet', emoji: '⛑️', label: 'Каска' },
  { id: 'headband', emoji: '🎀', label: 'Бантик' }, { id: 'mask', emoji: '🦸', label: 'Маска' },
];
const BGS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#0ea5e9', '#14b8a6',
  '#f97316', '#64748b', '#1e40af', '#065f46',
];
const EYES_LIST = [
  { id: 'normal', label: '😊' }, { id: 'happy', label: '🥰' },
  { id: 'cool', label: '😎' }, { id: 'angry', label: '😤' },
  { id: 'sad', label: '😢' }, { id: 'star', label: '🤩' },
];
const MOUTHS = ['😊', '😄', '😐', '😏', '🙂', '😁'];

function SectionLabel({ label }: { label: string }) {
  return <p className="text-white/50 text-xs mb-2 font-bold uppercase tracking-wider">{label}</p>;
}

export function ProfilePage() {
  const { avatar, updateAvatar, coins, xp, level, streak, moduleProgress, buildings } = useGameStore();
  const [draft, setDraft] = useState<AvatarConfig>(avatar);
  const [tab, setTab] = useState<'profile' | 'stats' | 'avatar'>('profile');

  const xpForNextLevel = level * 500;
  const xpProgress = ((xp % 500) / xpForNextLevel) * 100;

  const completedModules = russianModules.filter(m =>
    m.sections.every(s => moduleProgress[m.id]?.[s.id]?.completed)
  ).length;
  const totalSections = russianModules.reduce((s, m) => s + m.sections.length, 0);
  const completedSections = russianModules.reduce((sum, m) =>
    sum + m.sections.filter(s => moduleProgress[m.id]?.[s.id]?.completed).length, 0);
  const totalIncome = buildings.reduce((sum, b) => {
    const bt = BUILDING_TYPES.find(t => t.id === b.type);
    return sum + (bt?.income ?? 0) * b.level;
  }, 0);

  const achievements = [
    { id: 'first_quiz', name: 'Первый шаг', desc: 'Пройти первое задание', icon: '🎯', done: completedSections >= 1 },
    { id: 'module_done', name: 'Знаток', desc: 'Завершить модуль', icon: '📚', done: completedModules >= 1 },
    { id: 'streak3', name: 'Серия 3 дня', desc: 'Играть 3 дня подряд', icon: '🔥', done: streak >= 3 },
    { id: 'streak7', name: 'Неделя усердия', desc: '7 дней подряд', icon: '🔥🔥', done: streak >= 7 },
    { id: 'coins100', name: 'Богач', desc: 'Накопить 100 монет', icon: '🪙', done: coins >= 100 },
    { id: 'coins500', name: 'Меценат', desc: 'Накопить 500 монет', icon: '💰', done: coins >= 500 },
    { id: 'builder', name: 'Строитель', desc: 'Построить 5 зданий', icon: '🏗', done: buildings.length >= 5 },
    { id: 'builder10', name: 'Архитектор', desc: 'Построить 10 зданий', icon: '🏛', done: buildings.length >= 10 },
    { id: 'level5', name: 'Ветеран', desc: 'Достичь 5 уровня', icon: '⭐', done: level >= 5 },
    { id: 'level10', name: 'Легенда', desc: 'Достичь 10 уровня', icon: '💎', done: level >= 10 },
    { id: 'perfect', name: 'Перфекционист', desc: 'Получить 100% в задании', icon: '✨', done: Object.values(moduleProgress).some(mp => Object.values(mp).some(sp => sp.bestScore === 100)) },
    { id: 'all_russian', name: 'Мастер русского', desc: 'Пройти все задания', icon: '🏆', done: completedModules >= russianModules.length },
  ];

  const saveAvatar = () => {
    updateAvatar(draft);
    setTab('profile');
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-6 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute text-4xl"
              style={{ left: `${(i * 37 + 10) % 90}%`, top: `${(i * 53 + 5) % 80}%` }}
              animate={{ y: [0, -10, 0] }} transition={{ duration: 3 + i, repeat: Infinity }}>
              ⭐
            </motion.div>
          ))}
        </div>
        <div className="relative flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <AvatarSVG config={avatar} size={88} />
            <button
              onClick={() => { setTab('avatar'); setDraft({ ...avatar }); }}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-xs shadow-lg border-2 border-gray-900 hover:scale-110 transition-transform">
              ✏️
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-black text-xl truncate">{avatar.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">⭐ Ур. {level}</span>
              <span className="bg-red-500/30 text-red-200 text-xs font-bold px-2 py-0.5 rounded-full">🔥 {streak} дн.</span>
              <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-2 py-0.5 rounded-full">
                📖 {completedSections}/{totalSections}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>{xp % 500} / {xpForNextLevel} XP</span>
                <span>→ Ур.{level + 1}</span>
              </div>
              <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
                <motion.div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2.5 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-3">
          {[
            { v: `🪙 ${coins}`, label: 'Монеты', color: 'text-yellow-400' },
            { v: `${xp}`, label: 'Опыт', color: 'text-blue-300' },
            { v: `+${totalIncome}/м`, label: 'Доход', color: 'text-green-300' },
          ].map((item, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <p className={`font-black text-base ${item.color}`}>{item.v}</p>
              <p className="text-white/40 text-xs mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 -mt-5 bg-gray-800 rounded-2xl p-1 z-10 relative shadow-xl">
        {(['profile', 'stats', 'avatar'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-indigo-600 text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}>
            {t === 'profile' ? '🏆 Достижения' : t === 'stats' ? '📊 Статистика' : '🎨 Аватар'}
          </button>
        ))}
      </div>

      <div className="px-4 pt-5">
        {tab === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-lg">🏆 Достижения</h3>
              <span className="text-white/40 text-sm">{achievements.filter(a => a.done).length}/{achievements.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((ach, i) => (
                <motion.div key={ach.id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`rounded-2xl border-2 p-4 transition-all ${ach.done
                    ? 'bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border-yellow-400/40'
                    : 'bg-white/3 border-white/8'}`}>
                  <div className={`text-3xl mb-2 ${!ach.done ? 'grayscale opacity-40' : ''}`}>
                    {ach.done ? ach.icon : '🔒'}
                  </div>
                  <p className={`font-bold text-sm ${ach.done ? 'text-white' : 'text-white/40'}`}>{ach.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">{ach.desc}</p>
                  {ach.done && <span className="text-yellow-400 text-xs font-bold mt-1.5 block">✓ Выполнено</span>}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">📊 Подробная статистика</h3>
            <div className="space-y-2">
              {[
                { label: '📖 Пройдено модулей', val: `${completedModules}/${russianModules.length}` },
                { label: '✅ Завершено разделов', val: `${completedSections}/${totalSections}` },
                { label: '🏠 Построек в городе', val: buildings.length },
                { label: '💰 Доход в минуту', val: `${totalIncome} 🪙` },
                { label: '🔥 Текущая серия', val: `${streak} дней` },
                { label: '⭐ Общий опыт', val: xp },
                { label: '🪙 Накоплено монет', val: coins },
                { label: '🎖 Уровень', val: level },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 rounded-xl p-3.5 border border-white/8">
                  <span className="text-white/60 text-sm">{item.label}</span>
                  <span className="text-white font-black text-sm">{item.val}</span>
                </div>
              ))}
            </div>
            <h3 className="text-white font-black text-base mt-6 mb-3">📖 Прогресс по заданиям</h3>
            {russianModules.map(m => {
              const done = m.sections.filter(s => moduleProgress[m.id]?.[s.id]?.completed).length;
              const pct = Math.round((done / m.sections.length) * 100);
              return (
                <div key={m.id} className="bg-white/5 rounded-xl p-4 border border-white/8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold text-sm">{m.icon} {m.subtitle}</span>
                    <span className="text-white/40 text-xs">{done}/{m.sections.length}</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div className={`bg-gradient-to-r ${m.color} h-2 rounded-full`}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  {pct === 100 && <span className="text-yellow-400 text-xs font-bold mt-1 block">🏆 Завершён!</span>}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'avatar' && (
          <div>
            <h3 className="text-white font-black text-lg mb-4">🎨 Редактор аватара</h3>
            <div className="flex justify-center mb-5">
              <div className="relative">
                <AvatarSVG config={draft} size={120} />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  {avatar.name}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <SectionLabel label="🎨 Цвет кожи" />
                <div className="flex gap-2 flex-wrap">
                  {SKINS.map(sk => (
                    <button key={sk.id} onClick={() => setDraft(d => ({ ...d, skin: sk.id }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${draft.skin === sk.id ? 'border-yellow-400 scale-110 shadow-lg shadow-yellow-400/30' : 'border-white/20'}`}
                      style={{ background: sk.color }} />
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel label="💇 Цвет волос" />
                <div className="flex gap-2 flex-wrap">
                  {HAIRS.map(h => (
                    <button key={h.id} onClick={() => setDraft(d => ({ ...d, hair: h.id }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${draft.hair === h.id ? 'border-yellow-400 scale-110' : 'border-white/20'}`}
                      style={{ background: h.color }} />
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel label="✂️ Причёска" />
                <div className="flex gap-2 flex-wrap">
                  {HAIR_STYLES.map(hs => (
                    <button key={hs.id} onClick={() => setDraft(d => ({ ...d, hair_style: hs.id }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${(draft.hair_style ?? 'short') === hs.id ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300' : 'border-white/15 bg-white/5 text-white/60'}`}>
                      {hs.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel label="👀 Выражение глаз" />
                <div className="flex gap-2 flex-wrap">
                  {EYES_LIST.map(e => (
                    <button key={e.id} onClick={() => setDraft(d => ({ ...d, eyes: e.id }))}
                      className={`w-11 h-11 rounded-xl border-2 text-xl transition-all ${draft.eyes === e.id ? 'border-yellow-400 bg-yellow-400/20 scale-110' : 'border-white/15 bg-white/5'}`}>
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel label="👄 Улыбка" />
                <div className="flex gap-2 flex-wrap">
                  {MOUTHS.map(m => (
                    <button key={m} onClick={() => setDraft(d => ({ ...d, mouth: m }))}
                      className={`w-11 h-11 rounded-xl border-2 text-xl transition-all ${draft.mouth === m ? 'border-yellow-400 bg-yellow-400/20 scale-110' : 'border-white/15 bg-white/5'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel label="👗 Одежда" />
                <div className="grid grid-cols-4 gap-2">
                  {OUTFITS.map(o => (
                    <button key={o.id} onClick={() => setDraft(d => ({ ...d, outfit: o.id }))}
                      className={`p-2 rounded-xl border-2 text-center transition-all ${draft.outfit === o.id ? 'border-yellow-400 bg-yellow-400/15' : 'border-white/10 bg-white/5'}`}>
                      <div className="text-2xl">{o.emoji}</div>
                      <div className="text-white/60 text-xs mt-0.5">{o.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel label="🎩 Аксессуар" />
                <div className="grid grid-cols-4 gap-2">
                  {ACCESSORIES.map(a => (
                    <button key={a.id} onClick={() => setDraft(d => ({ ...d, accessory: a.id }))}
                      className={`p-2 rounded-xl border-2 text-center transition-all ${draft.accessory === a.id ? 'border-yellow-400 bg-yellow-400/15' : 'border-white/10 bg-white/5'}`}>
                      <div className="text-2xl">{a.emoji}</div>
                      <div className="text-white/60 text-xs mt-0.5">{a.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel label="🌈 Цвет фона" />
                <div className="flex gap-2 flex-wrap">
                  {BGS.map(b => (
                    <button key={b} onClick={() => setDraft(d => ({ ...d, bg: b }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${draft.bg === b ? 'border-yellow-400 scale-110 shadow-lg' : 'border-white/15'}`}
                      style={{ background: b }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2 pb-4">
                <button onClick={() => { setDraft(avatar); setTab('profile'); }}
                  className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-bold border border-white/10">
                  Отмена
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={saveAvatar}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-black shadow-lg">
                  💾 Сохранить
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
