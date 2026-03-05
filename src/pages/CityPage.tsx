import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { BUILDING_TYPES, BuildingType, GRID_SIZE, CELL_SIZE } from './data/buildingsData';
import { russianModules } from './data/russianData';
import { AvatarSVG } from './components/Registration';

const BOTS = [
  { name: 'Алексей_ЕГЭшник', emoji: '🤖', color: '#6366f1', buildings: 8, rating: 1200, level: 4 },
  { name: 'МатЕГЭ_про', emoji: '🧠', color: '#10b981', buildings: 12, rating: 2100, level: 7 },
  { name: 'ОтличницаАня', emoji: '⭐', color: '#ec4899', buildings: 6, rating: 850, level: 3 },
  { name: 'Задрот100баллов', emoji: '🔥', color: '#f59e0b', buildings: 20, rating: 3500, level: 11 },
  { name: 'НовичокЕГЭ', emoji: '😅', color: '#0ea5e9', buildings: 3, rating: 300, level: 1 },
];

const CATEGORIES = [
  { id: 'all', name: 'Все', icon: '🏗' },
  { id: 'housing', name: 'Жильё', icon: '🏠' },
  { id: 'resource', name: 'Ресурсы', icon: '⛏️' },
  { id: 'defense', name: 'Защита', icon: '🛡' },
  { id: 'special', name: 'Особые', icon: '✨' },
  { id: 'decoration', name: 'Декор', icon: '🌸' },
];

// Passive income timer
function usePassiveIncome() {
  const { buildings, addCoins } = useGameStore();
  useEffect(() => {
    const interval = setInterval(() => {
      const income = buildings.reduce((sum, b) => {
        const bt = BUILDING_TYPES.find(t => t.id === b.type);
        if (!bt || bt.income === 0) return sum;
        return sum + bt.income * b.level;
      }, 0);
      if (income > 0) addCoins(income);
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [buildings, addCoins]);
}

// Collect button that gives immediate partial income
function CollectButton() {
  const { buildings, addCoins, addXp } = useGameStore();
  const [collected, setCollected] = useState(false);
  const [lastCollect, setLastCollect] = useState(Date.now());
  const [pendingCoins, setPendingCoins] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - lastCollect) / 60000; // minutes
      const totalIncome = buildings.reduce((sum, b) => {
        const bt = BUILDING_TYPES.find(t => t.id === b.type);
        return sum + (bt?.income ?? 0) * b.level;
      }, 0);
      setPendingCoins(Math.floor(totalIncome * elapsed));
    }, 5000);
    return () => clearInterval(interval);
  }, [buildings, lastCollect]);

  const collect = () => {
    if (pendingCoins <= 0) return;
    addCoins(pendingCoins);
    addXp(Math.floor(pendingCoins / 3));
    setLastCollect(Date.now());
    setPendingCoins(0);
    setCollected(true);
    setTimeout(() => setCollected(false), 2000);
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={collect}
        disabled={pendingCoins <= 0}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
          pendingCoins > 0
            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 shadow-lg shadow-yellow-400/30'
            : 'bg-white/10 text-white/40'
        }`}>
        <span>🪙</span>
        <span>{pendingCoins > 0 ? `+${pendingCoins} Собрать` : 'Доход'}</span>
      </motion.button>
      <AnimatePresence>
        {collected && (
          <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 font-black text-lg pointer-events-none whitespace-nowrap">
            +{pendingCoins} 🪙
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CityPage() {
  usePassiveIncome();
  const { coins, buildings, addBuilding, removeBuilding, spendCoins,
    upgradeBuilding, moduleProgress, level, avatar } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);
  const [placingMode, setPlacingMode] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showInfo, setShowInfo] = useState<{ bt: BuildingType; bid: string } | null>(null);
  const [tab, setTab] = useState<'city' | 'leaderboard' | 'army'>('city');
  const [showUpgradeAnim, setShowUpgradeAnim] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const completedModules = russianModules.filter(m =>
    m.sections.every(s => moduleProgress[m.id]?.[s.id]?.completed)
  ).map(m => m.id);

  const canBuy = (bt: BuildingType) => {
    if (coins < bt.cost) return false;
    if (bt.requiredLevel && level < bt.requiredLevel) return false;
    if (bt.requiredModules?.length) {
      if (!bt.requiredModules.every(rid => completedModules.includes(rid))) return false;
    }
    if (bt.maxCount) {
      if (buildings.filter(b => b.type === bt.id).length >= bt.maxCount) return false;
    }
    return true;
  };

  const lockReason = (bt: BuildingType): string | null => {
    if (bt.requiredLevel && level < bt.requiredLevel) return `Нужен уровень ${bt.requiredLevel}`;
    if (bt.requiredModules?.length) {
      const missing = bt.requiredModules.filter(rid => !completedModules.includes(rid));
      if (missing.length) {
        const names = missing.map(rid => russianModules.find(m => m.id === rid)?.subtitle ?? rid);
        return `Пройдите: ${names.slice(0, 2).join(', ')}${names.length > 2 ? '...' : ''}`;
      }
    }
    if (bt.maxCount) {
      if (buildings.filter(b => b.type === bt.id).length >= bt.maxCount)
        return `Максимум: ${bt.maxCount} шт.`;
    }
    return null;
  };

  const handleGridClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingMode || !selectedBuildingType || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    if (x < 0 || y < 0 || x + selectedBuildingType.size > GRID_SIZE || y + selectedBuildingType.size > GRID_SIZE) return;
    if (spendCoins(selectedBuildingType.cost)) {
      addBuilding({ id: `${selectedBuildingType.id}_${Date.now()}`, type: selectedBuildingType.id, x, y, level: 1 });
    }
    setPlacingMode(false);
    setSelectedBuildingType(null);
  }, [placingMode, selectedBuildingType, spendCoins, addBuilding]);

  const startBuy = (bt: BuildingType) => {
    if (!canBuy(bt)) return;
    setSelectedBuildingType(bt);
    setPlacingMode(true);
    setShowShop(false);
  };

  const handleUpgrade = (bid: string, bt: BuildingType) => {
    const upgradeCost = Math.floor(bt.cost * bt.upgradeMultiplier * (buildings.find(b => b.id === bid)?.level ?? 1));
    if (spendCoins(upgradeCost)) {
      upgradeBuilding(bid);
      setShowUpgradeAnim(bid);
      setTimeout(() => setShowUpgradeAnim(null), 1500);
    }
    setShowInfo(null);
    setSelectedBuilding(null);
  };

  const totalIncome = buildings.reduce((sum, b) => {
    const bt = BUILDING_TYPES.find(t => t.id === b.type);
    return sum + (bt?.income ?? 0) * b.level;
  }, 0);

  const playerRating = buildings.reduce((sum, b) => {
    const bt = BUILDING_TYPES.find(t => t.id === b.type);
    return sum + (bt?.hp ?? 0) * b.level;
  }, 0);

  const filteredTypes = BUILDING_TYPES.filter(bt =>
    selectedCategory === 'all' || bt.category === selectedCategory
  );

  const armyPower = buildings.filter(b => {
    const bt = BUILDING_TYPES.find(t => t.id === b.type);
    return bt?.category === 'defense' || bt?.category === 'special';
  }).reduce((sum, b) => {
    const bt = BUILDING_TYPES.find(t => t.id === b.type);
    return sum + (bt?.hp ?? 0) * b.level;
  }, 0);

  return (
    <div className="min-h-screen pb-4">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-white font-black text-base">🏰 {avatar.name}'s Kingdom</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-green-400 text-xs font-bold">📈 +{totalIncome}/мин</span>
              <span className="text-red-400 text-xs font-bold">⚔️ {armyPower} силы</span>
              <span className="text-blue-400 text-xs font-bold">🏠 {buildings.length} зданий</span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <CollectButton />
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowShop(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-lg">
              🏪
            </motion.button>
          </div>
        </div>
        <div className="flex gap-1">
          {(['city', 'army', 'leaderboard'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${tab === t ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}>
              {t === 'city' ? '🗺 Город' : t === 'army' ? '⚔️ Армия' : '🏆 Рейтинг'}
            </button>
          ))}
        </div>
      </div>

      {/* City tab */}
      {tab === 'city' && (
        <>
          {placingMode && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="mx-4 mt-3 bg-yellow-400/15 border border-yellow-400/40 rounded-xl p-3 flex items-center justify-between">
              <span className="text-yellow-200 text-sm font-bold">
                📍 Нажмите на карту: {selectedBuildingType?.emoji} {selectedBuildingType?.name}
              </span>
              <button onClick={() => { setPlacingMode(false); setSelectedBuildingType(null); }}
                className="text-yellow-400 font-black text-lg ml-2">✕</button>
            </motion.div>
          )}

          <div className="mt-3 mx-4 overflow-auto rounded-2xl border border-white/10 shadow-2xl cursor-pointer"
            style={{ maxHeight: '60vh' }}>
            <div ref={gridRef}
              style={{
                cursor: placingMode ? 'crosshair' : 'default',
                width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE,
                position: 'relative',
                background: 'linear-gradient(160deg, #14532d 0%, #166534 40%, #15803d 70%, #166534 100%)',
              }}
              onClick={handleGridClick}>

              {/* Grid */}
              <svg className="absolute inset-0 opacity-10 pointer-events-none" width={GRID_SIZE * CELL_SIZE} height={GRID_SIZE * CELL_SIZE}>
                {[...Array(GRID_SIZE + 1)].map((_, i) => (
                  <g key={i}>
                    <line x1={i * CELL_SIZE} y1={0} x2={i * CELL_SIZE} y2={GRID_SIZE * CELL_SIZE} stroke="white" strokeWidth="0.5" />
                    <line x1={0} y1={i * CELL_SIZE} x2={GRID_SIZE * CELL_SIZE} y2={i * CELL_SIZE} stroke="white" strokeWidth="0.5" />
                  </g>
                ))}
              </svg>

              {/* Terrain details */}
              {/* River */}
              <div className="absolute pointer-events-none"
                style={{ left: CELL_SIZE * 8.5, top: 0, width: CELL_SIZE * 2.5, height: GRID_SIZE * CELL_SIZE,
                  background: 'linear-gradient(180deg, #0369a1aa 0%, #0ea5e9aa 50%, #0369a1aa 100%)', borderRadius: 8 }} />
              {[0,3,6,9,12,15,18].map(i => (
                <span key={i} className="absolute pointer-events-none text-blue-300 opacity-50 text-xs"
                  style={{ left: CELL_SIZE * 9 + 2, top: CELL_SIZE * i + CELL_SIZE * 0.3 }}>🌊</span>
              ))}
              {/* Bridge */}
              <div className="absolute pointer-events-none"
                style={{ left: CELL_SIZE * 8.5, top: CELL_SIZE * 7, width: CELL_SIZE * 2.5, height: CELL_SIZE * 2,
                  background: '#92400e99', borderRadius: 4 }} />
              {/* Road horizontal */}
              <div className="absolute pointer-events-none"
                style={{ left: 0, top: CELL_SIZE * 7.5, width: CELL_SIZE * 8.5, height: CELL_SIZE * 1,
                  background: '#78350f55' }} />
              <div className="absolute pointer-events-none"
                style={{ left: CELL_SIZE * 11, top: CELL_SIZE * 7.5, width: CELL_SIZE * 9, height: CELL_SIZE * 1,
                  background: '#78350f55' }} />
              {/* Trees background */}
              {[{x:0.5,y:0.5},{x:1.5,y:2},{x:2,y:0.5},{x:18,y:1},{x:19,y:3},{x:17.5,y:0.5},
                {x:0.5,y:17},{x:1,y:19},{x:18.5,y:18},{x:19,y:16}].map((t, ti) => (
                <span key={ti} className="absolute pointer-events-none text-xl opacity-70 select-none"
                  style={{ left: t.x * CELL_SIZE, top: t.y * CELL_SIZE }}>🌲</span>
              ))}

              {/* Buildings */}
              {buildings.map((b) => {
                const bt = BUILDING_TYPES.find(t => t.id === b.type);
                if (!bt) return null;
                const isSelected = selectedBuilding === b.id;
                const isAnimating = showUpgradeAnim === b.id;
                return (
                  <motion.div key={b.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: isAnimating ? [1, 1.3, 1] : 1, opacity: 1 }}
                    transition={{ duration: isAnimating ? 0.5 : 0.3, type: 'spring' }}
                    style={{
                      position: 'absolute',
                      left: b.x * CELL_SIZE, top: b.y * CELL_SIZE,
                      width: bt.size * CELL_SIZE, height: bt.size * CELL_SIZE,
                      background: `${bt.color}28`,
                      border: isSelected ? `2.5px solid #fbbf24` : `1.5px solid ${bt.color}60`,
                      borderRadius: 10,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: isSelected ? 20 : 1,
                      boxShadow: isSelected ? `0 0 16px ${bt.color}80, 0 0 4px #fbbf2460` : `0 2px 8px ${bt.color}30`,
                      backdropFilter: 'blur(2px)',
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedBuilding(b.id === selectedBuilding ? null : b.id); }}>
                    <span style={{ fontSize: Math.max(18, bt.size * 20), lineHeight: 1 }}>{bt.emoji}</span>
                    {b.level > 1 && (
                      <span className="text-yellow-400 font-black text-xs bg-black/50 rounded-md px-1 leading-tight mt-0.5">
                        ⭐{b.level}
                      </span>
                    )}
                    {isSelected && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 z-30 whitespace-nowrap">
                        <button onClick={(e) => { e.stopPropagation(); removeBuilding(b.id); setSelectedBuilding(null); }}
                          className="bg-red-500 hover:bg-red-400 text-white text-xs px-2 py-1 rounded-lg font-bold shadow-lg">
                          🗑
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowInfo({ bt, bid: b.id }); }}
                          className="bg-blue-500 hover:bg-blue-400 text-white text-xs px-2 py-1 rounded-lg font-bold shadow-lg">
                          ℹ️
                        </button>
                      </motion.div>
                    )}
                    {isAnimating && (
                      <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -30 }}
                        className="absolute -top-6 text-yellow-400 font-black text-sm pointer-events-none">
                        ⬆️ УЛУЧШЕНО!
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {buildings.length === 0 && !placingMode && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center bg-black/40 rounded-2xl p-6 backdrop-blur">
                    <p className="text-white/60 text-4xl mb-2">🏗</p>
                    <p className="text-white/50 text-sm font-bold">Нажмите 🏪 и начните строить!</p>
                    <p className="text-white/30 text-xs mt-1">У вас 100 монет для старта</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mx-4 mt-3 grid grid-cols-4 gap-2">
            {[
              { label: 'Зданий', val: buildings.length, icon: '🏠', color: 'text-white' },
              { label: '/мин', val: totalIncome, icon: '🪙', color: 'text-yellow-400' },
              { label: 'Сила', val: armyPower, icon: '⚔️', color: 'text-red-400' },
              { label: 'Рейтинг', val: playerRating, icon: '🏆', color: 'text-purple-400' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-2.5 text-center border border-white/8">
                <p className="text-white/40 text-xs">{item.icon} {item.label}</p>
                <p className={`font-black text-sm ${item.color}`}>{item.val}</p>
              </div>
            ))}
          </div>

          <div className="mx-4 mt-3 bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-3">
            <p className="text-indigo-300 text-xs">
              💡 <strong>Совет:</strong> Некоторые здания открываются после прохождения модулей ЕГЭ. Нажмите на здание, чтобы улучшить его.
            </p>
          </div>
        </>
      )}

      {/* Army tab */}
      {tab === 'army' && (
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border border-red-400/20 rounded-2xl p-5">
            <h3 className="text-white font-black text-lg mb-1">⚔️ Военная мощь</h3>
            <p className="text-white/50 text-sm mb-4">Защитные и особые постройки определяют вашу силу</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-4xl font-black text-red-400">{armyPower}</div>
                <div className="text-white/50 text-xs mt-1">Сила армии</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-orange-400">
                  {buildings.filter(b => ['defense','special'].includes(BUILDING_TYPES.find(t=>t.id===b.type)?.category??'')).length}
                </div>
                <div className="text-white/50 text-xs mt-1">Боевых зданий</div>
              </div>
            </div>
          </div>

          <h3 className="text-white font-black text-base">🛡 Ваши укрепления</h3>
          {buildings.filter(b => {
            const bt = BUILDING_TYPES.find(t => t.id === b.type);
            return bt?.category === 'defense' || bt?.category === 'special';
          }).length === 0 ? (
            <div className="text-center py-10 text-white/30">
              <div className="text-5xl mb-3">⛺</div>
              <p className="font-bold">Нет боевых зданий</p>
              <p className="text-xs mt-1">Стройте казармы, башни и замки</p>
            </div>
          ) : (
            <div className="space-y-2">
              {buildings.filter(b => {
                const bt = BUILDING_TYPES.find(t => t.id === b.type);
                return bt?.category === 'defense' || bt?.category === 'special';
              }).map(b => {
                const bt = BUILDING_TYPES.find(t => t.id === b.type)!;
                const upgradeCost = Math.floor(bt.cost * bt.upgradeMultiplier * b.level);
                return (
                  <div key={b.id} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                    <span className="text-4xl">{bt.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold">{bt.name}</p>
                      <p className="text-white/40 text-xs">HP: {bt.hp * b.level} • Уровень {b.level}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (spendCoins(upgradeCost)) {
                          upgradeBuilding(b.id);
                          setShowUpgradeAnim(b.id);
                          setTimeout(() => setShowUpgradeAnim(null), 1500);
                        }
                      }}
                      disabled={coins < upgradeCost}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${coins >= upgradeCost ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white/10 text-white/30'}`}>
                      ⬆️ 🪙{upgradeCost}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Raids section */}
          <h3 className="text-white font-black text-base mt-4">🗡 Рейды на соседей</h3>
          <div className="space-y-2">
            {BOTS.map((bot) => {
              const canRaid = armyPower > bot.rating * 0.3;
              const reward = Math.floor(bot.rating / 10);
              return (
                <div key={bot.name} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-white/20"
                    style={{ background: bot.color + '40' }}>
                    {bot.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{bot.name}</p>
                    <p className="text-white/40 text-xs">⚔️ {bot.rating} силы • Ур.{bot.level}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-xs font-bold">+{reward}🪙</div>
                    <button disabled={!canRaid}
                      onClick={() => { if (canRaid) useGameStore.getState().addCoins(reward); }}
                      className={`mt-1 px-3 py-1 rounded-lg text-xs font-bold ${canRaid ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-white/10 text-white/30'}`}>
                      {canRaid ? '⚔️ Атака' : '🔒 Слабо'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard tab */}
      {tab === 'leaderboard' && (
        <div className="px-4 pt-4 space-y-3">
          <h3 className="text-white font-black text-lg mb-1">🏆 Таблица рейтингов</h3>
          <p className="text-white/40 text-xs mb-4">Рейтинг зависит от HP и уровня зданий</p>

          {/* Player */}
          <div className="bg-indigo-500/20 border border-indigo-400/40 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl font-black text-yellow-400 w-8">
              #{[...BOTS].sort((a,b)=>b.rating-a.rating).findIndex(b=>b.rating<playerRating)+1 || BOTS.length+1}
            </span>
            <AvatarSVG config={avatar} size={44} />
            <div className="flex-1">
              <p className="text-white font-black">{avatar.name} <span className="text-indigo-300 text-xs">(Вы)</span></p>
              <p className="text-white/50 text-xs">🏠 {buildings.length} зданий • ⭐ Ур.{level}</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-black">{playerRating}</p>
              <p className="text-white/30 text-xs">рейтинг</p>
            </div>
          </div>

          {[...BOTS].sort((a, b) => b.rating - a.rating).map((bot, i) => (
            <motion.div key={bot.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <span className={`text-xl font-black w-8 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-white/40'}`}>
                #{i + 1}
              </span>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl border border-white/20"
                style={{ background: bot.color + '50' }}>
                {bot.emoji}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{bot.name}</p>
                <p className="text-white/40 text-xs">🏠 {bot.buildings} • ⭐ Ур.{bot.level}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-black">{bot.rating}</p>
                {i === 0 && <span className="text-yellow-400 text-xs">👑 Лидер</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Shop modal */}
      <AnimatePresence>
        {showShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={e => e.target === e.currentTarget && setShowShop(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-gray-900 rounded-t-3xl w-full max-w-2xl border-t border-white/10 max-h-[88vh] flex flex-col">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-white font-black text-xl">🏪 Магазин</h3>
                  <p className="text-white/40 text-xs">Стройте и развивайте поселение</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-yellow-400/15 text-yellow-400 font-black px-3 py-1.5 rounded-xl text-sm">🪙 {coins}</span>
                  <button onClick={() => setShowShop(false)}
                    className="text-white/40 hover:text-white w-9 h-9 flex items-center justify-center rounded-xl bg-white/10">✕</button>
                </div>
              </div>

              <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-white/10 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-white/8 text-white/50 hover:bg-white/15'}`}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto flex-1 px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {filteredTypes.map((bt) => {
                    const locked = lockReason(bt);
                    const affordable = coins >= bt.cost;
                    const owned = buildings.filter(b => b.type === bt.id).length;
                    return (
                      <motion.div key={bt.id} whileTap={{ scale: locked ? 1 : 0.97 }}
                        className={`relative rounded-2xl border-2 p-4 transition-all overflow-hidden ${
                          locked ? 'border-white/8 opacity-75' :
                          affordable ? 'border-white/15 hover:border-indigo-400/50 cursor-pointer' :
                          'border-red-400/20 cursor-not-allowed'
                        }`}
                        style={{ background: `${bt.color}15` }}
                        onClick={() => !locked && affordable && startBuy(bt)}>
                        {locked && (
                          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 z-10 rounded-2xl">
                            <p className="text-white/80 text-xs text-center font-semibold leading-snug">🔒 {locked}</p>
                          </div>
                        )}
                        <div className="text-center mb-3">
                          <div className="text-4xl mb-1">{bt.emoji}</div>
                          <p className="text-white font-bold text-sm leading-tight">{bt.name}</p>
                          <p className="text-white/30 text-xs mt-1 line-clamp-2">{bt.description}</p>
                        </div>
                        <div className="space-y-1.5 border-t border-white/10 pt-2.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/40">💰 Цена</span>
                            <span className={`font-black ${affordable ? 'text-yellow-400' : 'text-red-400'}`}>🪙{bt.cost}</span>
                          </div>
                          {bt.income > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-white/40">📈 Доход</span>
                              <span className="text-green-400 font-bold">+{bt.income}/м</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span className="text-white/40">❤️ HP</span>
                            <span className="text-red-300 font-bold">{bt.hp}</span>
                          </div>
                          {bt.maxCount !== undefined && (
                            <div className="flex justify-between text-xs">
                              <span className="text-white/40">📦 Есть</span>
                              <span className="text-white/60 font-bold">{owned}/{bt.maxCount}</span>
                            </div>
                          )}
                        </div>
                        <div className={`mt-2.5 text-xs font-black py-1.5 rounded-lg text-center ${
                          !locked && affordable ? 'bg-indigo-600/80 text-white' :
                          !locked ? 'bg-red-500/20 text-red-300' : ''
                        }`}>
                          {!locked && affordable ? '→ Купить и разместить' : !locked ? '💸 Мало монет' : ''}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Building info / upgrade modal */}
      <AnimatePresence>
        {showInfo && (() => {
          const { bt, bid } = showInfo;
          const b = buildings.find(bld => bld.id === bid);
          if (!b) return null;
          const upgradeCost = Math.floor(bt.cost * bt.upgradeMultiplier * b.level);
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
              onClick={() => setShowInfo(null)}>
              <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }}
                className="bg-gray-900 rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl"
                onClick={e => e.stopPropagation()}>
                <div className="text-center mb-5">
                  <div className="text-5xl mb-2">{bt.emoji}</div>
                  <h3 className="text-white font-black text-xl">{bt.name}</h3>
                  <p className="text-white/50 text-sm mt-1">{bt.description}</p>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, idx) => (
                      <span key={idx} className={`text-lg ${idx < b.level ? 'text-yellow-400' : 'text-white/10'}`}>⭐</span>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-1">Уровень {b.level}/5</p>
                </div>
                <div className="space-y-2 bg-white/5 rounded-2xl p-4 mb-4 border border-white/8">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">📈 Доход</span>
                    <span className="text-green-400 font-bold">{bt.income * b.level}/мин</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">❤️ HP</span>
                    <span className="text-red-400 font-bold">{bt.hp * b.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">📐 Размер</span>
                    <span className="text-white font-bold">{bt.size}×{bt.size}</span>
                  </div>
                </div>
                {b.level < 5 && (
                  <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-3 mb-4">
                    <p className="text-indigo-300 text-xs font-bold mb-1">⬆️ После улучшения:</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">📈 Доход</span>
                      <span className="text-green-300">{bt.income * (b.level + 1)}/мин (+{bt.income})</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-white/50">❤️ HP</span>
                      <span className="text-red-300">{bt.hp * (b.level + 1)} (+{bt.hp})</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setShowInfo(null)}
                    className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-bold border border-white/10">
                    Закрыть
                  </button>
                  {b.level < 5 && (
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpgrade(bid, bt)}
                      disabled={coins < upgradeCost}
                      className={`flex-1 py-3 rounded-2xl font-black ${coins >= upgradeCost ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-white/10 text-white/30'}`}>
                      ⬆️ 🪙{upgradeCost}
                    </motion.button>
                  )}
                  {b.level >= 5 && (
                    <div className="flex-1 py-3 rounded-2xl font-black bg-yellow-400/20 text-yellow-400 text-center">
                      🏆 Макс!
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
