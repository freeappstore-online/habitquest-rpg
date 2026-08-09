import React from "react";

type CharClass = "Warrior" | "Mage" | "Ranger" | "Monk";
type GearSlot = "head" | "body" | "weapon" | "boots";

interface EquippedGear {
  slot: GearSlot;
  id: string;
}

interface CharacterSpriteProps {
  charClass: CharClass;
  equipped: EquippedGear[];
  hp: number;
  maxHp: number;
  level: number;
  animate?: boolean;
}

// Skin tones per class
const SKIN: Record<CharClass, string> = {
  Warrior: "#f5c5a3",
  Mage: "#d4a8c7",
  Ranger: "#c8a882",
  Monk: "#e8b89a",
};

// Hair colors per class
const HAIR: Record<CharClass, string> = {
  Warrior: "#8B4513",
  Mage: "#4a0080",
  Ranger: "#2d5a1b",
  Monk: "#1a1a1a",
};

// Class accent colors
const ACCENT: Record<CharClass, string> = {
  Warrior: "#ef4444",
  Mage: "#8b5cf6",
  Ranger: "#22c55e",
  Monk: "#f59e0b",
};

// Gear color mappings by item ID prefix
function getGearColors(equipped: EquippedGear[]) {
  const slots: Record<GearSlot, string | null> = { head: null, body: null, weapon: null, boots: null };
  equipped.forEach(g => { slots[g.slot] = g.id; });

  const headColor = slots.head
    ? slots.head.includes("g9") ? "#f59e0b"   // Arcane Crown
    : slots.head.includes("g5") ? "#6b7280"   // Knight's Visor
    : "#7c3f00"                                // Iron Helm
    : null;

  const bodyColor = slots.body
    ? slots.body.includes("g10") ? "#16a34a"  // Dragon Scale
    : slots.body.includes("g6") ? "#374151"   // Chain Mail
    : "#92400e"                               // Leather Vest
    : null;

  const weaponColor = slots.weapon
    ? slots.weapon.includes("g11") ? "#fbbf24" // Excalibur
    : slots.weapon.includes("g7") ? "#c0c0c0"  // Silver Blade
    : "#78350f"                                // Rusty Sword
    : null;

  const bootsColor = slots.boots
    ? slots.boots.includes("g12") ? "#fbbf24"  // Hermes Boots
    : slots.boots.includes("g8") ? "#374151"   // Swift Greaves
    : "#451a03"                                // Worn Boots
    : null;

  return { headColor, bodyColor, weaponColor, bootsColor };
}

export function CharacterSprite({ charClass, equipped, hp, maxHp, level, animate = true }: CharacterSpriteProps) {
  const skin = SKIN[charClass];
  const hair = HAIR[charClass];
  const accent = ACCENT[charClass];
  const hpPct = hp / maxHp;
  const isDamaged = hpPct < 0.4;
  const { headColor, bodyColor, weaponColor, bootsColor } = getGearColors(equipped);

  // Default outfit colors if no gear
  const tunicColor = bodyColor ?? (
    charClass === "Warrior" ? "#b91c1c" :
    charClass === "Mage" ? "#6d28d9" :
    charClass === "Ranger" ? "#15803d" :
    "#d97706"
  );
  const pantsColor = charClass === "Warrior" ? "#374151" : charClass === "Mage" ? "#1e1b4b" : charClass === "Ranger" ? "#1c3a1c" : "#78350f";
  const helmetColor = headColor;
  const bootColor = bootsColor ?? "#292524";
  const swordColor = weaponColor;

  // Mage staff / Monk fists / Ranger bow
  const hasWeapon = !!swordColor || !equipped.find(e => e.slot === "weapon");

  return (
    <svg
      viewBox="0 0 64 96"
      width="128"
      height="192"
      style={{
        imageRendering: "pixelated",
        filter: isDamaged ? "drop-shadow(0 0 6px #ef4444)" : `drop-shadow(0 0 8px ${accent})`,
        animation: animate ? "charBob 1.8s ease-in-out infinite" : "none",
      }}
    >
      <style>{`
        @keyframes charBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes swordSwing {
          0%, 100% { transform: rotate(0deg); transform-origin: 48px 52px; }
          50% { transform: rotate(-15deg); transform-origin: 48px 52px; }
        }
      `}</style>

      {/* ── SHADOW ── */}
      <ellipse cx="32" cy="92" rx="14" ry="3" fill="rgba(0,0,0,0.25)" />

      {/* ── BOOTS ── */}
      {/* Left boot */}
      <rect x="20" y="76" width="10" height="10" fill={bootColor} />
      <rect x="19" y="83" width="12" height="4" fill={bootColor} />
      {/* Right boot */}
      <rect x="34" y="76" width="10" height="10" fill={bootColor} />
      <rect x="33" y="83" width="12" height="4" fill={bootColor} />
      {/* Boot highlights */}
      {bootsColor && (
        <>
          <rect x="20" y="76" width="10" height="2" fill="#fbbf24" opacity="0.6" />
          <rect x="34" y="76" width="10" height="2" fill="#fbbf24" opacity="0.6" />
        </>
      )}

      {/* ── LEGS / PANTS ── */}
      <rect x="21" y="62" width="9" height="16" fill={pantsColor} />
      <rect x="34" y="62" width="9" height="16" fill={pantsColor} />
      {/* Belt */}
      <rect x="18" y="60" width="28" height="4" fill="#1a1a1a" />
      <rect x="29" y="61" width="6" height="3" fill="#f59e0b" />

      {/* ── BODY / TUNIC ── */}
      <rect x="18" y="38" width="28" height="24" fill={tunicColor} />
      {/* Tunic detail lines */}
      <rect x="18" y="38" width="28" height="2" fill="rgba(255,255,255,0.15)" />
      {/* Chest emblem based on class */}
      {charClass === "Warrior" && <rect x="28" y="44" width="8" height="8" fill="#fbbf24" opacity="0.7" />}
      {charClass === "Mage" && <circle cx="32" cy="48" r="4" fill="#c4b5fd" opacity="0.8" />}
      {charClass === "Ranger" && (
        <>
          <line x1="32" y1="42" x2="32" y2="58" stroke="#86efac" strokeWidth="1.5" />
          <line x1="28" y1="50" x2="36" y2="50" stroke="#86efac" strokeWidth="1.5" />
        </>
      )}
      {charClass === "Monk" && (
        <>
          <rect x="26" y="43" width="12" height="2" fill="#fcd34d" opacity="0.8" />
          <rect x="26" y="56" width="12" height="2" fill="#fcd34d" opacity="0.8" />
        </>
      )}
      {/* Body armor overlay */}
      {bodyColor && (
        <>
          <rect x="18" y="38" width="28" height="24" fill={bodyColor} opacity="0.55" />
          <rect x="18" y="38" width="28" height="2" fill="rgba(255,255,255,0.2)" />
          <rect x="18" y="38" width="2" height="24" fill="rgba(255,255,255,0.1)" />
          <rect x="44" y="38" width="2" height="24" fill="rgba(0,0,0,0.2)" />
        </>
      )}

      {/* ── ARMS ── */}
      {/* Left arm */}
      <rect x="10" y="40" width="8" height="18" fill={tunicColor} />
      <rect x="10" y="57" width="8" height="7" fill={skin} />
      {/* Right arm */}
      <rect x="46" y="40" width="8" height="18" fill={tunicColor} />
      <rect x="46" y="57" width="8" height="7" fill={skin} />
      {/* Arm armor */}
      {bodyColor && (
        <>
          <rect x="10" y="40" width="8" height="18" fill={bodyColor} opacity="0.4" />
          <rect x="46" y="40" width="8" height="18" fill={bodyColor} opacity="0.4" />
        </>
      )}

      {/* ── WEAPON ── */}
      {charClass === "Warrior" && (
        <g style={{ animation: animate ? "swordSwing 2s ease-in-out infinite" : "none" }}>
          {/* Sword */}
          <rect x="54" y="32" width="3" height="28" fill={swordColor ?? "#9ca3af"} />
          <rect x="50" y="46" width="11" height="3" fill="#f59e0b" />
          <rect x="54" y="30" width="3" height="4" fill="#fbbf24" />
          {swordColor === "#fbbf24" && (
            <rect x="54" y="32" width="3" height="28" fill="url(#goldGrad)" opacity="0.8" />
          )}
        </g>
      )}
      {charClass === "Mage" && (
        <g>
          {/* Staff */}
          <rect x="56" y="20" width="3" height="44" fill="#7c3f00" />
          <circle cx="57" cy="20" r="5" fill={swordColor ?? "#c4b5fd"} opacity="0.9" />
          <circle cx="57" cy="20" r="3" fill="#fff" opacity="0.5" />
        </g>
      )}
      {charClass === "Ranger" && (
        <g>
          {/* Bow */}
          <path d="M 57 24 Q 64 40 57 56" stroke={swordColor ?? "#92400e"} strokeWidth="3" fill="none" />
          <line x1="57" y1="24" x2="57" y2="56" stroke="#f59e0b" strokeWidth="1" />
        </g>
      )}
      {charClass === "Monk" && (
        <g>
          {/* Glowing fists */}
          <circle cx="10" cy="64" r="5" fill={accent} opacity="0.8" />
          <circle cx="54" cy="64" r="5" fill={accent} opacity="0.8" />
          <circle cx="10" cy="64" r="3" fill="#fff" opacity="0.4" />
          <circle cx="54" cy="64" r="3" fill="#fff" opacity="0.4" />
        </g>
      )}

      {/* ── NECK ── */}
      <rect x="28" y="34" width="8" height="6" fill={skin} />

      {/* ── HEAD ── */}
      {/* Base head */}
      <rect x="20" y="12" width="24" height="24" fill={skin} rx="2" />

      {/* Eyes */}
      <rect x="24" y="20" width="4" height="4" fill={isDamaged ? "#ef4444" : "#1a1a1a"} />
      <rect x="36" y="20" width="4" height="4" fill={isDamaged ? "#ef4444" : "#1a1a1a"} />
      {/* Eye shine */}
      <rect x="25" y="21" width="1" height="1" fill="#fff" />
      <rect x="37" y="21" width="1" height="1" fill="#fff" />

      {/* Mouth */}
      {isDamaged
        ? <rect x="26" y="28" width="12" height="2" fill="#7f1d1d" />
        : <rect x="26" y="28" width="12" height="2" fill="#c2410c" />
      }

      {/* Eyebrows */}
      <rect x="23" y="17" width="6" height="2" fill={hair} />
      <rect x="35" y="17" width="6" height="2" fill={hair} />

      {/* ── HAIR (shown when no helmet) ── */}
      {!helmetColor && (
        <>
          {charClass === "Warrior" && (
            <>
              <rect x="20" y="8" width="24" height="8" fill={hair} />
              <rect x="18" y="10" width="4" height="6" fill={hair} />
              <rect x="42" y="10" width="4" height="6" fill={hair} />
              <rect x="20" y="12" width="4" height="4" fill={hair} />
              <rect x="40" y="12" width="4" height="4" fill={hair} />
            </>
          )}
          {charClass === "Mage" && (
            <>
              <rect x="18" y="6" width="28" height="10" fill={hair} />
              <rect x="14" y="10" width="6" height="16" fill={hair} />
              <rect x="44" y="10" width="6" height="16" fill={hair} />
              {/* Wizard hat */}
              <polygon points="32,0 22,12 42,12" fill="#4a0080" />
              <rect x="18" y="11" width="28" height="4" fill="#6d28d9" />
              <circle cx="32" cy="4" r="2" fill="#c4b5fd" />
            </>
          )}
          {charClass === "Ranger" && (
            <>
              <rect x="20" y="8" width="24" height="6" fill={hair} />
              <rect x="20" y="12" width="24" height="4" fill={hair} />
              {/* Hood */}
              <rect x="16" y="8" width="32" height="8" fill="#15803d" opacity="0.7" />
              <rect x="14" y="14" width="6" height="12" fill="#15803d" opacity="0.7" />
              <rect x="44" y="14" width="6" height="12" fill="#15803d" opacity="0.7" />
            </>
          )}
          {charClass === "Monk" && (
            <>
              {/* Shaved head / headband */}
              <rect x="20" y="8" width="24" height="6" fill={skin} />
              <rect x="18" y="13" width="28" height="3" fill="#f59e0b" />
              <rect x="42" y="11" width="6" height="8" fill="#f59e0b" opacity="0.8" />
            </>
          )}
        </>
      )}

      {/* ── HELMET (if equipped) ── */}
      {helmetColor && (
        <>
          <rect x="18" y="8" width="28" height="28" fill={helmetColor} opacity="0.9" rx="2" />
          {/* Visor slit */}
          <rect x="22" y="20" width="20" height="4" fill="rgba(0,0,0,0.6)" />
          <rect x="22" y="20" width="20" height="1" fill="rgba(255,255,255,0.2)" />
          {/* Helmet highlight */}
          <rect x="18" y="8" width="28" height="3" fill="rgba(255,255,255,0.25)" />
          {/* Crown gems for legendary */}
          {helmetColor === "#f59e0b" && (
            <>
              <circle cx="26" cy="10" r="2" fill="#ef4444" />
              <circle cx="32" cy="8" r="2.5" fill="#3b82f6" />
              <circle cx="38" cy="10" r="2" fill="#22c55e" />
            </>
          )}
        </>
      )}

      {/* ── DAMAGE OVERLAY ── */}
      {isDamaged && (
        <>
          <rect x="20" y="12" width="24" height="24" fill="#ef4444" opacity="0.15" />
          {/* Cracks */}
          <line x1="28" y1="14" x2="24" y2="22" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
          <line x1="36" y1="16" x2="40" y2="26" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
        </>
      )}

      {/* ── LEVEL BADGE ── */}
      <rect x="0" y="0" width="16" height="12" fill="#1a1a1a" rx="2" />
      <text x="8" y="9" textAnchor="middle" fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold">
        {`L${level}`}
      </text>

      {/* Gradient def for legendary sword */}
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
