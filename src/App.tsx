import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { Registration } from './components/Registration';
import { RoadmapPage } from './pages/RoadmapPage';
import { DailyPage } from './pages/DailyPage';
import { CityPage } from './pages/CityPage';
import { ProfilePage } from './pages/ProfilePage';

type Page = 'roadmap' | 'daily' | 'city' | 'profile';

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: 'city', icon: '🏰', label: 'Поселение' },
  { id: 'daily', icon: '⚡', label: 'Ежедневное' },
  { id: 'roadmap', icon: '🗺', label: 'Дорожная карта' },
  { id: 'profile', icon: '👤', label: 'Профиль' },
];

function CoinCounter({ coins }: { coins: number }) {
  const [displayed, setDisplayed] = useState(coins);
  useEffect(() => {
    if (displayed === coins) return;
    const step = coins > displayed ? 1 : -1;
    const timer = setTimeout(() => setDisplayed(d => d + step), 16);
    return () => clearTimeout(timer);
  }, [coins, displayed]);
  return <>{displayed}</>;
}

function TopBar({ page, coins, streak }: { page: Page; coins: number; streak: number }) {
  const titles: Record<Page, string> = {
    roadmap: '🗺 Дорожная карта ЕГЭ',
    daily: '⚡ Ежедневные задания',
    city: '🏰 Поселение ЕГЭ',
    profile: '👤 Профиль',
  };
  return (
    <div className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <h1 className="text-white font-black text-base">{titles[page]}</h1>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-red-500/20 border border-red-400/30 rounded-full px-2.5 py-1">
              <span className="text-sm">🔥</span>
              <span className="text-red-300 font-bold text-xs">{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1">
            <span className="text-sm">🪙</span>
            <span className="text-yellow-400 font-black text-sm"><CoinCounter coins={coins} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const { isRegistered, coins, streak, updateStreak, dailyTasksCompleted } = useGameStore();
  const [page, setPage] = useState<Page>('roadmap');

  useEffect(() => {
    if (isRegistered) updateStreak();
  }, [isRegistered]);

  // Count daily completed today
  const todayKey = `daily_${new Date().toDateString()}_`;
  const dailyDoneCount = dailyTasksCompleted.filter(id => id.startsWith(todayKey)).length;

  if (!isRegistered) {
    return <Registration />;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <TopBar page={page} coins={coins} streak={streak} />

      <main className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {page === 'roadmap' && <RoadmapPage />}
            {page === 'daily' && <DailyPage />}
            {page === 'city' && <CityPage />}
            {page === 'profile' && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 z-30 bg-gray-950/95 backdrop-blur border-t border-white/10">
        <div className="flex max-w-2xl mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = page === item.id;
            const hasBadge = item.id === 'daily' && dailyDoneCount < 3;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 relative transition-all ${
                  isActive ? 'text-indigo-400' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  className="relative"
                >
                  <span className="text-xl">{item.icon}</span>
                  {hasBadge && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </motion.div>
                <span className={`text-xs mt-0.5 font-semibold transition-all ${isActive ? 'text-indigo-400' : 'text-white/30'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-400 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
