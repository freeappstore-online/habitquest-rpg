import { useState, useEffect, useCallback } from "react";
import { Shell } from "./components/Shell";
import { CharacterSprite } from "./components/CharacterSprite";

// ─── Types ───────────────────────────────────────────────────────────────────

type HabitCategory = "body" | "mind" | "soul" | "craft";

interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  icon: string;
  xpReward: number;
  goldReward: number;
  completedToday: boolean;
  streak: number;
}

interface GearItem {
  id: string;
  name: string;
  slot: "head" | "body" | "weapon" | "boots";
  cost: number;
  statBonus: number;
  sprite: string;
  owned: boolean;
  equipped: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface Character {
  name: string;
  class: "Warrior" | "Mage" | "Ranger" | "Monk";
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  gold: number;
  str: number;
  int: number;
  agi: number;
  vit: number;
  totalHabitsCompleted: number;
  longestStreak: number;
  isDead: boolean;
  deathCount: number;
  lastReckoningDate: string;
}

interface GameState {
  character: Character;
  habits: Habit[];
  gear: GearItem[];
  log: LogEntry[];
  lastLoginDate: string;
  reckoningPending: boolean;
}

interface LogEntry {
  id: string;
  message: string;
  type: "xp" | "gold" | "damage" | "level" | "death" | "revive" | "quest" | "purchase";
  timestamp: number;
}

type Tab = "quest" | "character" | "shop" | "log";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  body: "#ef4444",
  mind: "#3b82f6",
  soul: "#8b5cf6",
  craft: "#f59e0b",
};

const CATEGORY_ICONS: Record<HabitCategory, string> = {
  body: "💪",
  mind: "📚",
  soul: "🧘",
  craft: "🛠️",
};

const DEFAULT_HABITS: Omit<Habit, "completedToday" | "streak">[] = [
  { id: "h1", name: "Drink 8 cups of water", category: "body", icon: "💧", xpReward: 30, goldReward: 10 },
  { id: "h2", name: "Exercise 30 minutes", category: "body", icon: "🏃", xpReward: 60, goldReward: 20 },
  { id: "h3", name: "Read for 20 minutes", category: "mind", icon: "📖", xpReward: 40, goldReward: 15 },
  { id: "h4", name: "Meditate 10 minutes", category: "soul", icon: "🧘", xpReward: 35, goldReward: 12 },
  { id: "h5", name: "Practice a skill", category: "craft", icon: "⚒️", xpReward: 50, goldReward: 18 },
  { id: "h6", name: "Sleep before midnight", category: "soul", icon: "🌙", xpReward: 45, goldReward: 15 },
];

const DEFAULT_GEAR: GearItem[] = [
  { id: "g1", name: "Iron Helm", slot: "head", cost: 80, statBonus: 2, sprite: "⛑️", owned: false, equipped: false, rarity: "common" },
  { id: "g2", name: "Leather Vest", slot: "body", cost: 120, statBonus: 3, sprite: "🥋", owned: false, equipped: false, rarity: "common" },
  { id: "g3", name: "Rusty Sword", slot: "weapon", cost: 60, statBonus: 2, sprite: "🗡️", owned: false, equipped: false, rarity: "common" },
  { id: "g4", name: "Worn Boots", slot: "boots", cost: 50, statBonus: 1, sprite: "👢", owned: false, equipped: false, rarity: "common" },
  { id: "g5", name: "Knight's Visor", slot: "head", cost: 250, statBonus: 6, sprite: "🪖", owned: false, equipped: false, rarity: "rare" },
  { id: "g6", name: "Chain Mail", slot: "body", cost: 350, statBonus: 8, sprite: "🛡️", owned: false, equipped: false, rarity: "rare" },
  { id: "g7", name: "Silver Blade", slot: "weapon", cost: 300, statBonus: 7, sprite: "⚔️", owned: false, equipped: false, rarity: "rare" },
  { id: "g8", name: "Swift Greaves", slot: "boots", cost: 200, statBonus: 5, sprite: "🥿", owned: false, equipped: false, rarity: "rare" },
  { id: "g9", name: "Arcane Crown", slot: "head", cost: 700, statBonus: 14, sprite: "👑", owned: false, equipped: false, rarity: "epic" },
  { id: "g10", name: "Dragon Scale", slot: "body", cost: 900, statBonus: 18, sprite: "🐉", owned: false, equipped: false, rarity: "epic" },
  { id: "g11", name: "Excalibur", slot: "weapon", cost: 1500, statBonus: 30, sprite: "✨", owned: false, equipped: false, rarity: "legendary" },
  { id: "g12", name: "Hermes Boots", slot: "boots", cost: 800, statBonus: 16, sprite: "⚡", owned: false, equipped: false, rarity: "epic" },
];

const RARITY_COLORS = {
  common: "#9ca3af",
  rare: "#3b82f6",
  epic: "#8b5cf6",
  legendary: "#f59e0b",
};

const CLASS_ACCENT: Record<string, string> = {
  Warrior: "#ef4444",
  Mage: "#8b5cf6",
  Ranger: "#22c55e",
  Monk: "#f59e0b",
};

const XP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(1.4, level - 1));

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function createDefaultState(): GameState {
  return {
    character: {
      name: "Hero",
      class: "Warrior",
      level: 1,
      xp: 0,
      xpToNext: XP_PER_LEVEL(1),
      hp: 100,
      maxHp: 100,
      gold: 50,
      str: 5,
      int: 5,
      agi: 5,
      vit: 5,
      totalHabitsCompleted: 0,
      longestStreak: 0,
      isDead: false,
      deathCount: 0,
      lastReckoningDate: "",
    },
    habits: DEFAULT_HABITS.map(h => ({ ...h, completedToday: false, streak: 0 })),
    gear: DEFAULT_GEAR,
    log: [{ id: "init", message: "Your quest begins. Complete daily habits to grow stronger!", type: "quest", timestamp: Date.now() }],
    lastLoginDate: todayStr(),
    reckoningPending: false,
  };
}

// ─── UI Components ────────────────────────────────────────────────────────────

function PixelBorder({ children, color = "var(--accent)", className = "" }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ border: `3px solid ${color}`, boxShadow: `4px 4px 0 ${color}` }}>
      {children}
    </div>
  );
}

function HPBar({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, (current / max) * 100);
  const color = pct > 60 ? "#22c55e" : pct > 30 ? "#f59e0b" : "#ef4444";
  return (
    <div className="w-full" style={{ background: "#1a1a1a", border: "2px solid #333", height: 14 }}>
      <div style={{ width: `${pct}%`, background: color, height: "100%", transition: "width 0.4s", boxShadow: `0 0 6px ${color}` }} />
    </div>
  );
}

function XPBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(100, (current / max) * 100);
  return (
    <div className="w-full" style={{ background: "#1a1a1a", border: "2px solid #333", height: 10 }}>
      <div style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", height: "100%", transition: "width 0.4s", boxShadow: "0 0 6px #8b5cf6" }} />
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded" style={{ background: "var(--panel)", border: "2px solid var(--line)" }}>
      <span className="text-xs font-bold" style={{ color, fontFamily: "monospace" }}>{label}</span>
      <span className="text-lg font-bold" style={{ fontFamily: "monospace", color: "var(--ink)" }}>{value}</span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem("habitquest_v2");
      if (saved) return JSON.parse(saved);
    } catch {}
    return createDefaultState();
  });

  const [tab, setTab] = useState<Tab>("quest");
  const [floats, setFloats] = useState<{ id: string; text: string; color: string; x: number }[]>([]);
  const [showReckoning, setShowReckoning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>("body");
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [shake, setShake] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(state.character.name);

  useEffect(() => {
    localStorage.setItem("habitquest_v2", JSON.stringify(state));
  }, [state]);

  // New-day check
  useEffect(() => {
    const today = todayStr();
    if (state.lastLoginDate !== today) {
      setState(prev => {
        const missedCount = prev.habits.filter(h => !h.completedToday).length;
        const totalHabits = prev.habits.length;
        const damage = missedCount > 0 ? Math.floor((missedCount / totalHabits) * 60) + 10 : 0;
        const newHp = Math.max(1, prev.character.hp - damage);
        const isDead = newHp <= 15 && missedCount > totalHabits * 0.6;
        const newHabits = prev.habits.map(h => ({
          ...h, streak: h.completedToday ? h.streak + 1 : 0, completedToday: false,
        }));
        const reckoningLog: LogEntry[] = damage > 0 ? [{
          id: `reck_${Date.now()}`,
          message: isDead
            ? `☠️ MIDNIGHT RECKONING: You neglected ${missedCount} quests. Revived at the inn...`
            : `🌑 Midnight Reckoning: Missed ${missedCount} quest(s). Lost ${damage} HP!`,
          type: isDead ? "death" : "damage",
          timestamp: Date.now(),
        }] : [{ id: `reck_${Date.now()}`, message: `🌟 Perfect day! All quests completed.`, type: "quest", timestamp: Date.now() }];
        return {
          ...prev,
          character: {
            ...prev.character,
            hp: isDead ? prev.character.maxHp : newHp,
            isDead: false,
            gold: isDead ? Math.floor(prev.character.gold * 0.5) : prev.character.gold,
            deathCount: isDead ? prev.character.deathCount + 1 : prev.character.deathCount,
          },
          habits: newHabits,
          log: [...reckoningLog, ...prev.log].slice(0, 50),
          lastLoginDate: today,
          reckoningPending: damage > 0 || isDead,
        };
      });
    }
  }, []);

  useEffect(() => {
    if (state.reckoningPending) setShowReckoning(true);
  }, [state.reckoningPending]);

  useEffect(() => {
    const done = localStorage.getItem("habitquest_onboarded");
    if (!done) setShowOnboarding(true);
  }, []);

  const addFloat = useCallback((text: string, color: string) => {
    const id = Math.random().toString(36).slice(2);
    const x = 40 + Math.random() * 20;
    setFloats(f => [...f, { id, text, color, x }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1400);
  }, []);

  const completeHabit = useCallback((habitId: string) => {
    setState(prev => {
      const habit = prev.habits.find(h => h.id === habitId);
      if (!habit || habit.completedToday || prev.character.isDead) return prev;
      const streakBonus = habit.streak >= 7 ? 2 : habit.streak >= 3 ? 1.5 : 1;
      const xpGain = Math.floor(habit.xpReward * streakBonus);
      const goldGain = Math.floor(habit.goldReward * streakBonus);
      let newXP = prev.character.xp + xpGain;
      let newLevel = prev.character.level;
      let newXPToNext = prev.character.xpToNext;
      let newStr = prev.character.str, newInt = prev.character.int, newAgi = prev.character.agi, newVit = prev.character.vit;
      let newMaxHp = prev.character.maxHp;
      const newLogEntries: LogEntry[] = [];
      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel++;
        newXPToNext = XP_PER_LEVEL(newLevel);
        newStr++; newInt++; newAgi++; newVit++;
        newMaxHp += 10;
        newLogEntries.push({ id: `lv_${Date.now()}`, message: `⬆️ LEVEL UP! You are now Level ${newLevel}!`, type: "level", timestamp: Date.now() });
      }
      newLogEntries.push({ id: `h_${Date.now()}`, message: `✅ "${habit.name}" complete! +${xpGain} XP, +${goldGain} Gold${streakBonus > 1 ? " (🔥 streak bonus!)" : ""}`, type: "xp", timestamp: Date.now() });
      return {
        ...prev,
        character: {
          ...prev.character, xp: newXP, level: newLevel, xpToNext: newXPToNext,
          gold: prev.character.gold + goldGain, str: newStr, int: newInt, agi: newAgi, vit: newVit,
          maxHp: newMaxHp, totalHabitsCompleted: prev.character.totalHabitsCompleted + 1,
          longestStreak: Math.max(prev.character.longestStreak, habit.streak + 1),
        },
        habits: prev.habits.map(h => h.id === habitId ? { ...h, completedToday: true } : h),
        log: [...newLogEntries, ...prev.log].slice(0, 50),
      };
    });
    const h = state.habits.find(x => x.id === habitId);
    if (h) {
      addFloat(`+${h.xpReward} XP`, "#8b5cf6");
      setTimeout(() => addFloat(`+${h.goldReward} 🪙`, "#f59e0b"), 300);
    }
  }, [state.habits, addFloat]);

  const buyGear = useCallback((gearId: string) => {
    setState(prev => {
      const item = prev.gear.find(g => g.id === gearId);
      if (!item || item.owned || prev.character.gold < item.cost) {
        setShake(true); setTimeout(() => setShake(false), 500);
        return prev;
      }
      return {
        ...prev,
        character: { ...prev.character, gold: prev.character.gold - item.cost },
        gear: prev.gear.map(g => g.id === gearId ? { ...g, owned: true } : g),
        log: [{ id: `buy_${Date.now()}`, message: `🛒 Purchased "${item.name}" for ${item.cost} Gold!`, type: "purchase", timestamp: Date.now() }, ...prev.log].slice(0, 50),
      };
    });
  }, []);

  const equipGear = useCallback((gearId: string) => {
    setState(prev => {
      const item = prev.gear.find(g => g.id === gearId);
      if (!item || !item.owned) return prev;
      return {
        ...prev,
        gear: prev.gear.map(g => g.slot === item.slot ? { ...g, equipped: g.id === gearId ? !g.equipped : false } : g),
      };
    });
  }, []);

  const addCustomHabit = useCallback(() => {
    if (!newHabitName.trim()) return;
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, {
        id: `custom_${Date.now()}`, name: newHabitName.trim(), category: newHabitCategory,
        icon: CATEGORY_ICONS[newHabitCategory], xpReward: 40, goldReward: 14, completedToday: false, streak: 0,
      }],
    }));
    setNewHabitName(""); setShowAddHabit(false);
  }, [newHabitName, newHabitCategory]);

  const saveName = () => {
    if (nameInput.trim()) setState(prev => ({ ...prev, character: { ...prev.character, name: nameInput.trim() } }));
    setEditingName(false);
  };

  const completedToday = state.habits.filter(h => h.completedToday).length;
  const totalHabits = state.habits.length;
  const equippedGear = state.gear.filter(g => g.equipped);
  const totalGearBonus = equippedGear.reduce((sum, g) => sum + g.statBonus, 0);
  const classAccent = CLASS_ACCENT[state.character.class];

  const navItems = [
    { id: "quest", label: "Daily Quests", icon: "⚔️" },
    { id: "character", label: "Character", icon: "🧙" },
    { id: "shop", label: "Gear Shop", icon: "🛒" },
    { id: "log", label: "Quest Log", icon: "📜" },
  ];

  return (
    <Shell navItems={navItems} activeTab={tab} onTabChange={(t) => setTab(t as Tab)} appName="HabitQuest">
      {/* Floating XP/Gold */}
      <div className="fixed top-20 right-6 z-50 pointer-events-none">
        {floats.map(f => (
          <span key={f.id} className="absolute text-sm font-bold" style={{
            color: f.color, fontFamily: "monospace", right: `${f.x}px`,
            animation: "floatUp 1.2s ease-out forwards", zIndex: 50,
          }}>{f.text}</span>
        ))}
      </div>

      <style>{`
        @keyframes floatUp { 0% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-50px); } }
        @keyframes pixelShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px var(--accent)} 50%{box-shadow:0 0 22px var(--accent)} }
        @keyframes pulse-border { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .pixel-shake { animation: pixelShake 0.4s ease; }
        .glow-anim { animation: glow 2s ease-in-out infinite; }
        .habit-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Midnight Reckoning Modal */}
      {showReckoning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.88)" }}>
          <div className="max-w-sm w-full mx-4 p-6 text-center" style={{ background: "#0f0f0f", border: "3px solid #ef4444", boxShadow: "0 0 30px #ef4444, 6px 6px 0 #ef4444", fontFamily: "monospace" }}>
            <div className="text-4xl mb-2">🌑</div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "#ef4444", fontFamily: "Fraunces, serif" }}>MIDNIGHT RECKONING</h2>
            <p className="text-sm mb-4" style={{ color: "#9ca3af" }}>{state.log[0]?.message}</p>
            <div className="mb-4"><HPBar current={state.character.hp} max={state.character.maxHp} /><p className="text-xs mt-1" style={{ color: "#ef4444" }}>{state.character.hp} / {state.character.maxHp} HP</p></div>
            <button onClick={() => { setShowReckoning(false); setState(p => ({ ...p, reckoningPending: false })); }} className="w-full py-2 font-bold text-sm" style={{ background: "#ef4444", color: "#fff", border: "2px solid #fff", fontFamily: "monospace", cursor: "pointer" }}>
              [ ACCEPT FATE ]
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.92)" }}>
          <div className="max-w-sm w-full mx-4 p-6" style={{ background: "#0f0f0f", border: "3px solid #8b5cf6", boxShadow: "6px 6px 0 #8b5cf6", fontFamily: "monospace" }}>
            <div className="flex justify-center mb-3">
              <CharacterSprite charClass="Warrior" equipped={[]} hp={100} maxHp={100} level={1} animate />
            </div>
            <h2 className="text-center text-xl font-bold mb-3" style={{ color: "#8b5cf6", fontFamily: "Fraunces, serif" }}>WELCOME, HERO</h2>
            <div className="text-sm space-y-2" style={{ color: "#d1d5db" }}>
              <p>🗡️ <strong>Complete daily habits</strong> to earn XP and Gold</p>
              <p>📈 <strong>Level up your character</strong> by building real streaks</p>
              <p>🛒 <strong>Spend Gold</strong> on pixel gear to boost your stats</p>
              <p>🌑 <strong>Midnight Reckoning:</strong> Miss habits = HP damage. Too many = lose gold!</p>
              <p>🔥 <strong>Streak bonuses:</strong> 3+ days = 1.5×. 7+ days = 2×!</p>
            </div>
            <button className="w-full mt-5 py-2 font-bold" onClick={() => { setShowOnboarding(false); localStorage.setItem("habitquest_onboarded", "1"); }}
              style={{ background: "#8b5cf6", color: "#fff", border: "2px solid #fff", fontFamily: "monospace", cursor: "pointer" }}>
              [ BEGIN QUEST ]
            </button>
          </div>
        </div>
      )}

      {/* ── QUEST TAB ── */}
      {tab === "quest" && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Daily Quests</h1>
              <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "monospace" }}>{completedToday}/{totalHabits} quests complete</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold" style={{ color: "#f59e0b", fontFamily: "monospace" }}>🪙 {state.character.gold}</div>
              <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "monospace" }}>Lv.{state.character.level} {state.character.class}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl space-y-3" style={{ background: "var(--panel)", border: "2px solid var(--line)" }}>
            <div className="flex justify-between text-xs mb-1" style={{ fontFamily: "monospace", color: "var(--muted)" }}>
              <span>❤️ HP {state.character.hp}/{state.character.maxHp}</span>
              <span>⚡ XP {state.character.xp}/{state.character.xpToNext}</span>
            </div>
            <HPBar current={state.character.hp} max={state.character.maxHp} />
            <XPBar current={state.character.xp} max={state.character.xpToNext} />
          </div>

          {completedToday === totalHabits && totalHabits > 0 && (
            <div className="p-4 rounded-xl text-center glow-anim" style={{ background: "linear-gradient(135deg,#065f46,#047857)", border: "2px solid #22c55e", fontFamily: "monospace", color: "#fff" }}>
              <div className="text-2xl mb-1">🏆</div>
              <div className="font-bold">ALL QUESTS COMPLETE!</div>
              <div className="text-xs opacity-80">No damage at midnight. Well done, Hero!</div>
            </div>
          )}

          <div className="space-y-3">
            {state.habits.map(habit => (
              <button key={habit.id} className="habit-btn w-full text-left p-4 rounded-xl transition-all" onClick={() => completeHabit(habit.id)}
                disabled={habit.completedToday || state.character.isDead}
                style={{
                  background: habit.completedToday ? "linear-gradient(135deg,#052e16,#065f46)" : "var(--panel)",
                  border: `2px solid ${habit.completedToday ? "#22c55e" : CATEGORY_COLORS[habit.category]}`,
                  boxShadow: habit.completedToday ? "none" : `3px 3px 0 ${CATEGORY_COLORS[habit.category]}`,
                  opacity: habit.completedToday ? 0.85 : 1,
                  cursor: habit.completedToday ? "default" : "pointer",
                }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.completedToday ? "✅" : habit.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color: habit.completedToday ? "#22c55e" : "var(--ink)", fontFamily: "monospace", textDecoration: habit.completedToday ? "line-through" : "none" }}>
                      {habit.name}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: CATEGORY_COLORS[habit.category] + "33", color: CATEGORY_COLORS[habit.category], fontFamily: "monospace" }}>
                        {CATEGORY_ICONS[habit.category]} {habit.category}
                      </span>
                      <span className="text-xs" style={{ color: "#8b5cf6", fontFamily: "monospace" }}>+{habit.xpReward} XP</span>
                      <span className="text-xs" style={{ color: "#f59e0b", fontFamily: "monospace" }}>+{habit.goldReward} 🪙</span>
                      {habit.streak > 0 && <span className="text-xs" style={{ color: "#ef4444", fontFamily: "monospace" }}>🔥 {habit.streak}d</span>}
                    </div>
                  </div>
                  {!habit.completedToday && (
                    <div className="text-xs px-2 py-1 rounded" style={{ background: CATEGORY_COLORS[habit.category], color: "#fff", fontFamily: "monospace", fontWeight: "bold" }}>DO IT</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {showAddHabit ? (
            <div className="p-4 rounded-xl space-y-3" style={{ background: "var(--panel)", border: "2px solid var(--accent)", boxShadow: "3px 3px 0 var(--accent)" }}>
              <h3 className="font-bold text-sm" style={{ fontFamily: "monospace" }}>+ NEW QUEST</h3>
              <input className="w-full px-3 py-2 rounded text-sm" style={{ background: "var(--paper)", border: "2px solid var(--line)", color: "var(--ink)", fontFamily: "monospace", outline: "none" }}
                placeholder="Quest name..." value={newHabitName} onChange={e => setNewHabitName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomHabit()} autoFocus />
              <div className="flex gap-2 flex-wrap">
                {(["body", "mind", "soul", "craft"] as HabitCategory[]).map(cat => (
                  <button key={cat} onClick={() => setNewHabitCategory(cat)} className="px-3 py-1 rounded text-xs font-bold"
                    style={{ background: newHabitCategory === cat ? CATEGORY_COLORS[cat] : "var(--paper)", color: newHabitCategory === cat ? "#fff" : CATEGORY_COLORS[cat], border: `2px solid ${CATEGORY_COLORS[cat]}`, fontFamily: "monospace", cursor: "pointer" }}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={addCustomHabit} className="flex-1 py-2 rounded font-bold text-sm" style={{ background: "var(--accent)", color: "#fff", border: "none", fontFamily: "monospace", cursor: "pointer" }}>[ ADD QUEST ]</button>
                <button onClick={() => setShowAddHabit(false)} className="px-4 py-2 rounded font-bold text-sm" style={{ background: "var(--panel)", color: "var(--muted)", border: "2px solid var(--line)", fontFamily: "monospace", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddHabit(true)} className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: "transparent", border: "2px dashed var(--line)", color: "var(--muted)", fontFamily: "monospace", cursor: "pointer" }}>
              + ADD CUSTOM QUEST
            </button>
          )}
        </div>
      )}

      {/* ── CHARACTER TAB ── */}
      {tab === "character" && (
        <div className="max-w-2xl mx-auto space-y-5">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Character Sheet</h1>

          {/* Main character card */}
          <PixelBorder color={classAccent}>
            <div className="p-5" style={{ background: "var(--panel)" }}>
              <div className="flex flex-col sm:flex-row items-center gap-6">

                {/* Sprite + name */}
                <div className="flex flex-col items-center gap-2">
                  {/* Sprite stage */}
                  <div className="relative flex items-center justify-center rounded-xl p-3" style={{
                    background: "linear-gradient(180deg, #0f0f23 0%, #1a1a3e 60%, #0d1f0d 100%)",
                    border: `3px solid ${classAccent}`,
                    boxShadow: `0 0 20px ${classAccent}44`,
                    minWidth: 140,
                    minHeight: 200,
                  }}>
                    {/* Grid floor */}
                    <div className="absolute bottom-3 left-3 right-3" style={{ height: 24, background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 16px)", borderTop: `1px solid ${classAccent}33` }} />
                    <CharacterSprite
                      charClass={state.character.class}
                      equipped={equippedGear.map(g => ({ slot: g.slot, id: g.id }))}
                      hp={state.character.hp}
                      maxHp={state.character.maxHp}
                      level={state.character.level}
                      animate
                    />
                    {/* Scanline overlay */}
                    <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)" }} />
                  </div>

                  {/* Name */}
                  {editingName ? (
                    <div className="flex gap-1">
                      <input autoFocus value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                        className="px-2 py-1 rounded text-sm text-center w-28" style={{ background: "var(--paper)", border: `2px solid ${classAccent}`, color: "var(--ink)", fontFamily: "monospace", outline: "none" }} />
                      <button onClick={saveName} style={{ background: classAccent, color: "#fff", border: "none", borderRadius: 4, padding: "2px 6px", fontFamily: "monospace", cursor: "pointer", fontSize: 12 }}>✓</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingName(true); setNameInput(state.character.name); }}
                      className="text-base font-bold hover:underline" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)", background: "none", border: "none", cursor: "pointer" }}>
                      {state.character.name} ✏️
                    </button>
                  )}
                  <div className="text-xs px-3 py-0.5 rounded-full font-bold" style={{ background: classAccent + "22", color: classAccent, fontFamily: "monospace", border: `1px solid ${classAccent}` }}>
                    Level {state.character.level} {state.character.class}
                  </div>
                </div>

                {/* Stats panel */}
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs" style={{ fontFamily: "monospace", color: "var(--muted)" }}>
                      <span>❤️ HP</span><span style={{ color: state.character.hp < state.character.maxHp * 0.4 ? "#ef4444" : "var(--muted)" }}>{state.character.hp}/{state.character.maxHp}</span>
                    </div>
                    <HPBar current={state.character.hp} max={state.character.maxHp} />
                    <div className="flex justify-between text-xs" style={{ fontFamily: "monospace", color: "var(--muted)" }}>
                      <span>⚡ XP to Level {state.character.level + 1}</span><span>{state.character.xp}/{state.character.xpToNext}</span>
                    </div>
                    <XPBar current={state.character.xp} max={state.character.xpToNext} />
                  </div>

                  <div className="text-lg font-bold" style={{ color: "#f59e0b", fontFamily: "monospace" }}>🪙 {state.character.gold} Gold</div>

                  <div className="grid grid-cols-4 gap-2">
                    <StatBadge label="STR" value={state.character.str + equippedGear.filter(g => g.slot === "weapon").reduce((s, g) => s + g.statBonus, 0)} color="#ef4444" />
                    <StatBadge label="INT" value={state.character.int + equippedGear.filter(g => g.slot === "head").reduce((s, g) => s + g.statBonus, 0)} color="#3b82f6" />
                    <StatBadge label="AGI" value={state.character.agi + equippedGear.filter(g => g.slot === "boots").reduce((s, g) => s + g.statBonus, 0)} color="#22c55e" />
                    <StatBadge label="VIT" value={state.character.vit + equippedGear.filter(g => g.slot === "body").reduce((s, g) => s + g.statBonus, 0)} color="#f59e0b" />
                  </div>
                  {totalGearBonus > 0 && <p className="text-xs" style={{ color: "#22c55e", fontFamily: "monospace" }}>+{totalGearBonus} total gear bonus</p>}
                </div>
              </div>
            </div>
          </PixelBorder>

          {/* Class selector */}
          <div>
            <h2 className="text-sm font-bold mb-3" style={{ fontFamily: "monospace", color: "var(--muted)", letterSpacing: "0.1em" }}>CHOOSE CLASS</h2>
            <div className="grid grid-cols-4 gap-2">
              {(["Warrior", "Mage", "Ranger", "Monk"] as const).map(cls => {
                const accent = CLASS_ACCENT[cls];
                const isActive = state.character.class === cls;
                return (
                  <button key={cls} onClick={() => setState(prev => ({ ...prev, character: { ...prev.character, class: cls } }))}
                    className="p-2 rounded-xl flex flex-col items-center gap-2"
                    style={{ background: isActive ? accent + "22" : "var(--panel)", border: `2px solid ${isActive ? accent : "var(--line)"}`, boxShadow: isActive ? `3px 3px 0 ${accent}` : "none", cursor: "pointer" }}>
                    {/* Mini sprite preview */}
                    <div style={{ transform: "scale(0.45)", transformOrigin: "top center", height: 44, overflow: "hidden" }}>
                      <CharacterSprite charClass={cls} equipped={[]} hp={100} maxHp={100} level={1} animate={false} />
                    </div>
                    <span className="text-xs font-bold" style={{ fontFamily: "monospace", color: isActive ? accent : "var(--muted)" }}>{cls}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipped gear */}
          <div>
            <h2 className="text-sm font-bold mb-3" style={{ fontFamily: "monospace", color: "var(--muted)", letterSpacing: "0.1em" }}>EQUIPPED GEAR</h2>
            <div className="grid grid-cols-2 gap-2">
              {(["head", "body", "weapon", "boots"] as const).map(slot => {
                const item = state.gear.find(g => g.slot === slot && g.equipped);
                return (
                  <div key={slot} className="p-3 rounded-xl flex items-center gap-2" style={{
                    background: "var(--panel)", border: `2px solid ${item ? RARITY_COLORS[item.rarity] : "var(--line)"}`,
                    boxShadow: item ? `2px 2px 0 ${item ? RARITY_COLORS[item.rarity] : "transparent"}` : "none",
                  }}>
                    <span className="text-2xl">{item ? item.sprite : "⬜"}</span>
                    <div>
                      <div className="text-xs font-bold" style={{ fontFamily: "monospace", color: item ? RARITY_COLORS[item.rarity] : "var(--muted)" }}>
                        {item ? item.name : `[${slot}]`}
                      </div>
                      <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "monospace" }}>{item ? `+${item.statBonus} bonus` : "empty"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campaign stats */}
          <div>
            <h2 className="text-sm font-bold mb-3" style={{ fontFamily: "monospace", color: "var(--muted)", letterSpacing: "0.1em" }}>CAMPAIGN STATS</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Quests Done", value: state.character.totalHabitsCompleted, icon: "✅" },
                { label: "Best Streak", value: `${state.character.longestStreak}d`, icon: "🔥" },
                { label: "Deaths", value: state.character.deathCount, icon: "💀" },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: "var(--panel)", border: "2px solid var(--line)" }}>
                  <div className="text-xl">{s.icon}</div>
                  <div className="text-lg font-bold" style={{ fontFamily: "monospace" }}>{s.value}</div>
                  <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "monospace" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SHOP TAB ── */}
      {tab === "shop" && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Gear Shop</h1>
            <div className={`text-lg font-bold ${shake ? "pixel-shake" : ""}`} style={{ color: "#f59e0b", fontFamily: "monospace" }}>🪙 {state.character.gold}</div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {(Object.entries(RARITY_COLORS) as [string, string][]).map(([r, c]) => (
              <span key={r} className="text-xs px-2 py-0.5 rounded" style={{ background: c + "22", color: c, fontFamily: "monospace", border: `1px solid ${c}` }}>◆ {r}</span>
            ))}
          </div>

          {(["head", "body", "weapon", "boots"] as const).map(slot => (
            <div key={slot}>
              <h2 className="text-sm font-bold mb-2" style={{ fontFamily: "monospace", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {slot === "head" ? "🪖" : slot === "body" ? "🛡️" : slot === "weapon" ? "⚔️" : "👢"} {slot}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {state.gear.filter(g => g.slot === slot).map(item => (
                  <div key={item.id} className="p-3 rounded-xl" style={{
                    background: "var(--panel)",
                    border: `2px solid ${item.equipped ? RARITY_COLORS[item.rarity] : item.owned ? RARITY_COLORS[item.rarity] + "88" : "var(--line)"}`,
                    boxShadow: item.equipped ? `3px 3px 0 ${RARITY_COLORS[item.rarity]}` : "none",
                  }}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.sprite}</span>
                      <div className="flex-1">
                        <div className="font-bold text-sm" style={{ fontFamily: "monospace", color: RARITY_COLORS[item.rarity] }}>{item.name}</div>
                        <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "monospace" }}>+{item.statBonus} stat bonus</div>
                        <div className="text-xs mt-0.5" style={{ color: "#f59e0b", fontFamily: "monospace" }}>{item.cost} 🪙</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {item.owned ? (
                          <button onClick={() => equipGear(item.id)} className="px-3 py-1 rounded text-xs font-bold"
                            style={{ background: item.equipped ? RARITY_COLORS[item.rarity] : "transparent", color: item.equipped ? "#fff" : RARITY_COLORS[item.rarity], border: `2px solid ${RARITY_COLORS[item.rarity]}`, fontFamily: "monospace", cursor: "pointer" }}>
                            {item.equipped ? "UNEQUIP" : "EQUIP"}
                          </button>
                        ) : (
                          <button onClick={() => buyGear(item.id)} disabled={state.character.gold < item.cost} className="px-3 py-1 rounded text-xs font-bold"
                            style={{ background: state.character.gold >= item.cost ? "#f59e0b" : "var(--panel)", color: state.character.gold >= item.cost ? "#000" : "var(--muted)", border: `2px solid ${state.character.gold >= item.cost ? "#f59e0b" : "var(--line)"}`, fontFamily: "monospace", cursor: state.character.gold >= item.cost ? "pointer" : "not-allowed" }}>
                            BUY
                          </button>
                        )}
                        {item.owned && <span className="text-xs text-center" style={{ color: "#22c55e", fontFamily: "monospace" }}>owned</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LOG TAB ── */}
      {tab === "log" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Quest Log</h1>
          <div className="space-y-2">
            {state.log.length === 0 && <div className="text-center py-12" style={{ color: "var(--muted)", fontFamily: "monospace" }}>No entries yet. Complete your first quest!</div>}
            {state.log.map(entry => {
              const colors: Record<LogEntry["type"], string> = { xp: "#8b5cf6", gold: "#f59e0b", damage: "#ef4444", level: "#22c55e", death: "#ef4444", revive: "#3b82f6", quest: "#6b7280", purchase: "#f59e0b" };
              return (
                <div key={entry.id} className="p-3 rounded-xl flex gap-3 items-start" style={{ background: "var(--panel)", border: `2px solid ${colors[entry.type]}33`, borderLeft: `4px solid ${colors[entry.type]}` }}>
                  <div className="flex-1 text-sm" style={{ fontFamily: "monospace", color: "var(--ink)" }}>{entry.message}</div>
                  <div className="text-xs shrink-0" style={{ color: "var(--muted)", fontFamily: "monospace" }}>{new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              );
            })}
          </div>
          <div className="pt-4 border-t" style={{ borderColor: "var(--line)" }}>
            <button onClick={() => { if (confirm("Reset all progress? This cannot be undone!")) { localStorage.removeItem("habitquest_v2"); localStorage.removeItem("habitquest_onboarded"); window.location.reload(); } }}
              className="px-4 py-2 rounded text-sm font-bold" style={{ background: "transparent", border: "2px solid #ef4444", color: "#ef4444", fontFamily: "monospace", cursor: "pointer" }}>
              ☠️ RESET CAMPAIGN
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}
