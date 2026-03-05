import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, AvatarConfig } from './store/gameStore';

const SKINS = [
  { id: 'light', label: 'Светлый', color: '#FDDBB4' },
  { id: 'medium', label: 'Средний', color: '#D4956A' },
  { id: 'dark', label: 'Тёмный', color: '#8D5524' },
  { id: 'pale', label: 'Бледный', color: '#FFE0C2' },
  { id: 'warm', label: 'Тёплый', color: '#C68642' },
];
const HAIRS = [
  { id: 'black', color: '#1a1a1a', label: 'Чёрный' },
  { id: 'brown', color: '#5C3317', label: 'Коричневый' },
  { id: 'blonde', color: '#D4AF37', label: 'Блонд' },
  { id: 'red', color: '#C0392B', label: 'Рыжий' },
  { id: 'white', color: '#E8E8E8', label: 'Белый' },
  { id: 'blue', color: '#2980B9', label: 'Синий' },
  { id: 'pink', color: '#E91E8C', label: 'Розовый' },
  { id: 'green', color: '#27AE60', label: 'Зелёный' },
];
const HAIR_STYLES = [
  { id: 'short', label: 'Короткие' },
  { id: 'long', label: 'Длинные' },
  { id: 'curly', label: 'Кудрявые' },
  { id: 'bald', label: 'Лысый' },
  { id: 'ponytail', label: 'Хвостик' },
];
const EYES = [
  { id: 'normal', label: '😊' },
  { id: 'happy', label: '🥰' },
  { id: 'cool', label: '😎' },
  { id: 'angry', label: '😤' },
  { id: 'sad', label: '😢' },
  { id: 'star', label: '🤩' },
];
const OUTFITS = [
  { id: 'casual', emoji: '👕', label: 'Повседневный', color: '#3B82F6' },
  { id: 'formal', emoji: '👔', label: 'Формальный', color: '#374151' },
  { id: 'sport', emoji: '🎽', label: 'Спортивный', color: '#10B981' },
  { id: 'winter', emoji: '🧥', label: 'Зимний', color: '#6B7280' },
  { id: 'dress', emoji: '👗', label: 'Платье', color: '#EC4899' },
  { id: 'karate', emoji: '🥋', label: 'Карате', color: '#1F2937' },
  { id: 'mage', emoji: '🧙', label: 'Маг', color: '#7C3AED' },
  { id: 'student', emoji: '🎒', label: 'Студент', color: '#F59E0B' },
];
const ACCESSORIES = [
  { id: 'none', emoji: '—', label: 'Нет' },
  { id: 'glasses', emoji: '🕶️', label: 'Очки' },
  { id: 'crown', emoji: '👑', label: 'Корона' },
  { id: 'cap', emoji: '🎓', label: 'Берет' },
  { id: 'hat', emoji: '🎩', label: 'Шляпа' },
  { id: 'helmet', emoji: '⛑️', label: 'Каска' },
  { id: 'headband', emoji: '🎀', label: 'Бантик' },
  { id: 'mask', emoji: '🦸', label: 'Маска' },
];
const BGS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#0ea5e9', '#14b8a6',
  '#f97316', '#64748b', '#1e40af', '#065f46',
];

// ────────────────────────────────────────────────────
// SVG Avatar Renderer
// ────────────────────────────────────────────────────
function getSkinColor(skin: string) {
  return SKINS.find(s => s.id === skin)?.color ?? '#FDDBB4';
}
function getHairColor(hair: string) {
  return HAIRS.find(h => h.id === hair)?.color ?? '#1a1a1a';
}

function HairPath({ style, color, size }: { style: string; color: string; size: number }) {
  const s = size;
  if (style === 'bald') return null;
  if (style === 'long') return (
    <g>
      <ellipse cx={s * 0.5} cy={s * 0.28} rx={s * 0.24} ry={s * 0.16} fill={color} />
      <rect x={s * 0.26} y={s * 0.28} width={s * 0.08} height={s * 0.38} rx={s * 0.04} fill={color} />
      <rect x={s * 0.66} y={s * 0.28} width={s * 0.08} height={s * 0.38} rx={s * 0.04} fill={color} />
      <ellipse cx={s * 0.5} cy={s * 0.21} rx={s * 0.22} ry={s * 0.1} fill={color} />
    </g>
  );
  if (style === 'curly') return (
    <g>
      <ellipse cx={s * 0.5} cy={s * 0.24} rx={s * 0.25} ry={s * 0.14} fill={color} />
      <circle cx={s * 0.28} cy={s * 0.3} r={s * 0.07} fill={color} />
      <circle cx={s * 0.72} cy={s * 0.3} r={s * 0.07} fill={color} />
      <circle cx={s * 0.35} cy={s * 0.2} r={s * 0.07} fill={color} />
      <circle cx={s * 0.65} cy={s * 0.2} r={s * 0.07} fill={color} />
      <circle cx={s * 0.5} cy={s * 0.17} r={s * 0.07} fill={color} />
    </g>
  );
  if (style === 'ponytail') return (
    <g>
      <ellipse cx={s * 0.5} cy={s * 0.26} rx={s * 0.22} ry={s * 0.13} fill={color} />
      <ellipse cx={s * 0.5} cy={s * 0.2} rx={s * 0.2} ry={s * 0.09} fill={color} />
      <path d={`M ${s * 0.62} ${s * 0.22} Q ${s * 0.72} ${s * 0.32} ${s * 0.68} ${s * 0.48}`}
        stroke={color} strokeWidth={s * 0.06} fill="none" strokeLinecap="round" />
    </g>
  );
  // short (default)
  return (
    <g>
      <ellipse cx={s * 0.5} cy={s * 0.26} rx={s * 0.22} ry={s * 0.13} fill={color} />
      <ellipse cx={s * 0.5} cy={s * 0.2} rx={s * 0.2} ry={s * 0.09} fill={color} />
    </g>
  );
}

function EyeExpression({ type, cx, cy, r }: { type: string; cx: number; cy: number; r: number }) {
  if (type === 'happy') return (
    <path d={`M ${cx - r} ${cy} Q ${cx} ${cy - r * 1.2} ${cx + r} ${cy}`}
      stroke="#1F2937" strokeWidth={r * 0.35} fill="none" strokeLinecap="round" />
  );
  if (type === 'star') return (
    <text x={cx} y={cy + r * 0.4} textAnchor="middle" fontSize={r * 2} fill="#F59E0B">★</text>
  );
  if (type === 'cool') return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r * 1.1} ry={r * 0.7} fill="#1F2937" />
      <ellipse cx={cx} cy={cy} rx={r * 0.7} ry={r * 0.5} fill="#374151" />
    </g>
  );
  if (type === 'sad') return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1F2937" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
      <path d={`M ${cx - r} ${cy - r * 0.2} Q ${cx} ${cy + r * 0.6} ${cx + r} ${cy - r * 0.2}`}
        stroke="#1F2937" strokeWidth={r * 0.25} fill="none" />
    </g>
  );
  if (type === 'angry') return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1F2937" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
      <line x1={cx - r * 1.1} y1={cy - r * 0.8} x2={cx + r * 0.2} y2={cy - r * 0.2}
        stroke="#EF4444" strokeWidth={r * 0.3} strokeLinecap="round" />
    </g>
  );
  // normal
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1F2937" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
      <circle cx={cx + r * 0.2} cy={cy - r * 0.15} r={r * 0.2} fill="#1F2937" />
    </g>
  );
}

function AccessoryLayer({ id, s }: { id: string; s: number }) {
  if (id === 'none') return null;
  const size = s * 0.28;
  const map: Record<string, string> = {
    glasses: '🕶️', crown: '👑', cap: '🎓', hat: '🎩', helmet: '⛑️', headband: '🎀', mask: '🦸',
  };
  return (
    <text x={s * 0.5} y={s * 0.28} textAnchor="middle" fontSize={size}
      dominantBaseline="middle">{map[id] ?? ''}</text>
  );
}

export function AvatarSVG({ config, size = 120 }: { config: AvatarConfig; size?: number }) {
  const s = size;
  const skinColor = getSkinColor(config.skin);
  const hairColor = getHairColor(config.hair);
  const outfitData = OUTFITS.find(o => o.id === config.outfit);
  const outfitColor = outfitData?.color ?? '#3B82F6';
  const outfitEmoji = outfitData?.emoji ?? '👕';

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ borderRadius: '50%', overflow: 'hidden', display: 'block' }}>
      {/* Background */}
      <circle cx={s * 0.5} cy={s * 0.5} r={s * 0.5} fill={config.bg} />
      {/* Glow */}
      <circle cx={s * 0.5} cy={s * 0.5} r={s * 0.46} fill="none" stroke="white" strokeWidth={s * 0.015} opacity="0.15" />

      {/* Body / outfit */}
      <ellipse cx={s * 0.5} cy={s * 0.83} rx={s * 0.28} ry={s * 0.2} fill={outfitColor} opacity="0.9" />
      {/* Neck */}
      <rect x={s * 0.44} y={s * 0.55} width={s * 0.12} height={s * 0.1} rx={s * 0.03} fill={skinColor} />
      {/* Head */}
      <ellipse cx={s * 0.5} cy={s * 0.4} rx={s * 0.2} ry={s * 0.22} fill={skinColor} />
      {/* Ears */}
      <ellipse cx={s * 0.3} cy={s * 0.41} rx={s * 0.04} ry={s * 0.06} fill={skinColor} />
      <ellipse cx={s * 0.7} cy={s * 0.41} rx={s * 0.04} ry={s * 0.06} fill={skinColor} />

      {/* Hair */}
      <HairPath style={config.hair_style ?? 'short'} color={hairColor} size={s} />

      {/* Eyes */}
      <EyeExpression type={config.eyes} cx={s * 0.41} cy={s * 0.39} r={s * 0.045} />
      <EyeExpression type={config.eyes} cx={s * 0.59} cy={s * 0.39} r={s * 0.045} />

      {/* Eyebrows */}
      <path d={`M ${s * 0.36} ${s * 0.34} Q ${s * 0.41} ${s * 0.32} ${s * 0.46} ${s * 0.34}`}
        stroke={hairColor} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />
      <path d={`M ${s * 0.54} ${s * 0.34} Q ${s * 0.59} ${s * 0.32} ${s * 0.64} ${s * 0.34}`}
        stroke={hairColor} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx={s * 0.5} cy={s * 0.44} rx={s * 0.025} ry={s * 0.02} fill={skinColor} stroke="#00000020" strokeWidth={1} />

      {/* Mouth */}
      {config.mouth === '😊' || config.mouth === '🙂' ? (
        <path d={`M ${s * 0.42} ${s * 0.49} Q ${s * 0.5} ${s * 0.54} ${s * 0.58} ${s * 0.49}`}
          stroke="#C0392B" strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
      ) : config.mouth === '😄' || config.mouth === '😁' ? (
        <g>
          <path d={`M ${s * 0.41} ${s * 0.49} Q ${s * 0.5} ${s * 0.56} ${s * 0.59} ${s * 0.49}`}
            stroke="#C0392B" strokeWidth={s * 0.022} fill="#EF4444" strokeLinecap="round" />
          <path d={`M ${s * 0.43} ${s * 0.5} Q ${s * 0.5} ${s * 0.55} ${s * 0.57} ${s * 0.5}`}
            fill="white" />
        </g>
      ) : config.mouth === '😏' ? (
        <path d={`M ${s * 0.44} ${s * 0.51} Q ${s * 0.52} ${s * 0.49} ${s * 0.58} ${s * 0.5}`}
          stroke="#C0392B" strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
      ) : (
        <line x1={s * 0.43} y1={s * 0.51} x2={s * 0.57} y2={s * 0.51}
          stroke="#C0392B" strokeWidth={s * 0.022} strokeLinecap="round" />
      )}

      {/* Cheeks */}
      <ellipse cx={s * 0.35} cy={s * 0.47} rx={s * 0.055} ry={s * 0.035} fill="#FFB3B3" opacity="0.5" />
      <ellipse cx={s * 0.65} cy={s * 0.47} rx={s * 0.055} ry={s * 0.035} fill="#FFB3B3" opacity="0.5" />

      {/* Outfit emoji */}
      <text x={s * 0.5} y={s * 0.88} textAnchor="middle" fontSize={s * 0.18} dominantBaseline="middle">
        {outfitEmoji}
      </text>

      {/* Accessory */}
      <AccessoryLayer id={config.accessory} s={s} />
    </svg>
  );
}

// Backward compat: keep AvatarPreview as alias
export function AvatarPreview({ config, size = 120 }: { config: AvatarConfig; size?: number }) {
  return <AvatarSVG config={config} size={size} />;
}

// ────────────────────────────────────────────────────
// Registration Flow
// ────────────────────────────────────────────────────
export function Registration() {
  const register = useGameStore((s) => s.register);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [config, setConfig] = useState<AvatarConfig>({
    skin: 'light', hair: 'black', hair_style: 'short',
    eyes: 'normal', mouth: '😊', outfit: 'casual',
    accessory: 'none', bg: '#6366f1', name: '',
  });

  const handleRegister = () => {
    if (!name.trim()) return;
    register(name.trim(), config);
  };

  const Section = ({ label }: { label: string }) => (
    <p className="text-white/60 text-xs mb-2 font-bold uppercase tracking-wider">{label}</p>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* floating bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(18)].map((_, i) => (
          <motion.div key={i}
            className="absolute text-3xl opacity-10 select-none"
            style={{ left: `${(i * 41 + 7) % 100}%`, top: `${(i * 57 + 11) % 100}%` }}
            animate={{ y: [0, -30, 0], rotate: [0, 15, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: (i % 4) * 0.8 }}>
            {['📚', '✏️', '🎓', '⭐', '🏆', '💡', '🔥', '📖', '🧠'][i % 9]}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white/8 backdrop-blur-2xl rounded-3xl p-6 max-w-md w-full border border-white/15 shadow-2xl relative"
      >
        {/* Logo */}
        <div className="text-center mb-5">
          <motion.div className="text-5xl mb-2" animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>🎓</motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight">ЕГЭ Арена</h1>
          <p className="text-white/50 text-sm">Игровая платформа подготовки к ЕГЭ</p>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mb-6 justify-center">
          {['Никнейм', 'Внешность', 'Готово'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 transition-all ${step >= i ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= i ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white'}`}>{i + 1}</div>
                <span className="text-white/70 text-xs font-semibold hidden sm:block">{label}</span>
              </div>
              {i < 2 && <div className={`w-6 h-px transition-all ${step > i ? 'bg-yellow-400' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}>
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">✍️</div>
                <h2 className="text-white text-xl font-black mb-1">Как вас зовут?</h2>
                <p className="text-white/50 text-sm">Это имя увидят другие игроки</p>
              </div>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)} maxLength={20}
                placeholder="Введите никнейм..."
                onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(1)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/30 outline-none focus:border-yellow-400/70 text-lg text-center font-bold mb-4 transition-all"
              />
              <div className="flex gap-2 text-white/40 text-xs justify-center mb-4">
                <span>💡 Используйте уникальное имя</span>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                onClick={() => name.trim() && setStep(1)} disabled={!name.trim()}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 font-black py-4 rounded-2xl text-lg disabled:opacity-30 shadow-lg shadow-yellow-400/20">
                Далее →
              </motion.button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}>
              {/* Live preview */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <AvatarSVG config={config} size={110} />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur rounded-full px-3 py-0.5">
                    <span className="text-white font-bold text-xs">{name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-0.5 scrollbar-thin">
                {/* Skin */}
                <div>
                  <Section label="🎨 Цвет кожи" />
                  <div className="flex gap-2 flex-wrap">
                    {SKINS.map(sk => (
                      <button key={sk.id} onClick={() => setConfig(c => ({ ...c, skin: sk.id }))}
                        title={sk.label}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${config.skin === sk.id ? 'border-yellow-400 scale-110 shadow-lg' : 'border-white/20'}`}
                        style={{ background: sk.color }} />
                    ))}
                  </div>
                </div>

                {/* Hair color */}
                <div>
                  <Section label="💇 Цвет волос" />
                  <div className="flex gap-2 flex-wrap">
                    {HAIRS.map(h => (
                      <button key={h.id} onClick={() => setConfig(c => ({ ...c, hair: h.id }))}
                        title={h.label}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${config.hair === h.id ? 'border-yellow-400 scale-110 shadow-lg' : 'border-white/20'}`}
                        style={{ background: h.color }} />
                    ))}
                  </div>
                </div>

                {/* Hair style */}
                <div>
                  <Section label="✂️ Причёска" />
                  <div className="flex gap-2 flex-wrap">
                    {HAIR_STYLES.map(hs => (
                      <button key={hs.id} onClick={() => setConfig(c => ({ ...c, hair_style: hs.id }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${(config.hair_style ?? 'short') === hs.id ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300' : 'border-white/15 bg-white/5 text-white/60'}`}>
                        {hs.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eyes */}
                <div>
                  <Section label="👀 Выражение глаз" />
                  <div className="flex gap-2 flex-wrap">
                    {EYES.map(e => (
                      <button key={e.id} onClick={() => setConfig(c => ({ ...c, eyes: e.id }))}
                        className={`w-10 h-10 rounded-xl border-2 text-xl transition-all ${config.eyes === e.id ? 'border-yellow-400 bg-yellow-400/20 scale-110' : 'border-white/15 bg-white/5'}`}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mouth */}
                <div>
                  <Section label="👄 Улыбка" />
                  <div className="flex gap-2 flex-wrap">
                    {['😊', '😄', '😐', '😏', '🙂', '😁'].map(m => (
                      <button key={m} onClick={() => setConfig(c => ({ ...c, mouth: m }))}
                        className={`w-10 h-10 rounded-xl border-2 text-xl transition-all ${config.mouth === m ? 'border-yellow-400 bg-yellow-400/20 scale-110' : 'border-white/15 bg-white/5'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Outfit */}
                <div>
                  <Section label="👗 Одежда" />
                  <div className="grid grid-cols-4 gap-2">
                    {OUTFITS.map(o => (
                      <button key={o.id} onClick={() => setConfig(c => ({ ...c, outfit: o.id }))}
                        className={`p-2 rounded-xl border-2 text-center transition-all ${config.outfit === o.id ? 'border-yellow-400 bg-yellow-400/15' : 'border-white/10 bg-white/5'}`}>
                        <div className="text-2xl">{o.emoji}</div>
                        <div className="text-white/60 text-xs mt-0.5">{o.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessory */}
                <div>
                  <Section label="🎩 Аксессуар" />
                  <div className="grid grid-cols-4 gap-2">
                    {ACCESSORIES.map(a => (
                      <button key={a.id} onClick={() => setConfig(c => ({ ...c, accessory: a.id }))}
                        className={`p-2 rounded-xl border-2 text-center transition-all ${config.accessory === a.id ? 'border-yellow-400 bg-yellow-400/15' : 'border-white/10 bg-white/5'}`}>
                        <div className="text-2xl">{a.emoji}</div>
                        <div className="text-white/60 text-xs mt-0.5">{a.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* BG */}
                <div>
                  <Section label="🌈 Цвет фона аватара" />
                  <div className="flex gap-2 flex-wrap">
                    {BGS.map(b => (
                      <button key={b} onClick={() => setConfig(c => ({ ...c, bg: b }))}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${config.bg === b ? 'border-yellow-400 scale-110 shadow-lg' : 'border-white/15'}`}
                        style={{ background: b }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(0)} className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-bold border border-white/10">← Назад</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                  className="flex-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 py-3 px-6 rounded-2xl font-black shadow-lg flex-1">
                  Далее →
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className="text-center">
              <motion.div className="flex justify-center mb-4" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <AvatarSVG config={config} size={130} />
              </motion.div>
              <h2 className="text-white text-2xl font-black mb-1">{name}</h2>
              <p className="text-white/50 text-sm mb-5">Ваш персонаж готов к покорению ЕГЭ!</p>
              <div className="bg-white/8 rounded-2xl p-4 mb-5 text-left space-y-2 border border-white/10">
                <p className="text-white/70 text-xs font-bold uppercase mb-2">🎁 Стартовый набор</p>
                <div className="flex justify-between text-sm"><span className="text-white/60">🪙 Монеты</span><span className="text-yellow-400 font-black">+100</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/60">⭐ Уровень</span><span className="text-white font-black">1</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/60">🏰 Поселение</span><span className="text-white font-black">Пустой участок</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/60">🗺 Доступ к заданиям</span><span className="text-green-400 font-black">Открыт!</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-bold border border-white/10">← Назад</button>
                <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={handleRegister}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 py-3 rounded-2xl font-black text-lg shadow-xl shadow-yellow-400/25">
                  🚀 Вперёд!
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
