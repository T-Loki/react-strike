import React from 'react';
import { Infinity, UserCheck, Coins, MapPin } from 'lucide-react';
import type { UnitTemplate } from '../../types/combat';
import { DAMAGE_TYPE_DESCRIPTIONS, ARMOR_TYPE_DESCRIPTIONS } from '../../core/math/combatMath';

export type UnitCardVariant = 'deployment' | 'city_management';

export interface UnitCardProps {
  unit: UnitTemplate;
  variant?: UnitCardVariant;
  count?: number;               // For stacked roster displays (e.g. x10 Spearmen)
  isInfinite?: boolean;         // For sandbox infinite stacks
  isSelected?: boolean;
  isDisabled?: boolean;
  assignedLocationName?: string; // e.g. "Outer Barren Fields" or "Reserve"
  upkeepCost?: number;          // Gold/turn upkeep
  onClick?: () => void;
  onAction?: (actionType: 'deploy' | 'transfer' | 'return' | 'inspect') => void;
  customActionLabel?: string;
  customActionDisabled?: boolean;
  actions?: React.ReactNode;    // Slot for custom action buttons (e.g. transfer 1 / all / recruit)
  className?: string;
}

export const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  variant = 'deployment',
  count,
  isInfinite = false,
  isSelected = false,
  isDisabled = false,
  assignedLocationName,
  upkeepCost,
  onClick,
  onAction,
  customActionLabel,
  customActionDisabled = false,
  actions,
  className = '',
}) => {
  const isHero = unit.type === 'hero';
  const isElite = unit.type === 'elite';

  const damageType = unit.damageType || 'Normal';
  const armorType = unit.armorType || 'Medium';

  // Calculate default upkeep if not explicitly provided
  const calculatedUpkeep = upkeepCost !== undefined 
    ? upkeepCost 
    : (isHero ? 10 : (unit.cost > 0 ? Math.max(1, Math.floor(unit.cost * 0.1)) : 0));

  const isFixedGarrison = unit.abilities?.includes('Fixed Garrison');

  // Border & Glow styling based on rarity and selection
  const getRarityCardStyle = () => {
    if (isSelected) {
      return 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02] ring-1 ring-cyan-400/40';
    }
    if (isHero) {
      return 'border-amber-500/50 bg-slate-950 hover:border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.12)] hover:bg-slate-900/90';
    }
    if (isElite) {
      return 'border-purple-500/40 bg-slate-950 hover:border-purple-400/70 shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:bg-slate-900/90';
    }
    return 'border-slate-700/80 bg-slate-950 hover:border-slate-500 hover:bg-slate-900/80';
  };

  const getPortraitFrameStyle = () => {
    if (isHero) {
      return 'border-amber-400/70 bg-amber-950/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.35)]';
    }
    if (isElite) {
      return 'border-purple-400/60 bg-purple-950/40 text-purple-300 shadow-[0_0_6px_rgba(168,85,247,0.25)]';
    }
    return 'border-slate-700 bg-slate-900 text-slate-300';
  };

  const getTypeBadgeStyle = () => {
    if (isHero) return 'bg-amber-950 text-amber-300 border-amber-700/60';
    if (isElite) return 'bg-purple-950 text-purple-300 border-purple-700/60';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const handleCardClick = () => {
    if (isDisabled) return;
    if (onClick) {
      onClick();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VARIANT: Deployment (Compact Vertical Card for Bench/Roster Lists)
  // ─────────────────────────────────────────────────────────────────────────────
  if (variant === 'deployment') {
    return (
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleCardClick}
        className={`w-full flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left relative select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          getRarityCardStyle()
        } ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      >
        {/* Stack Count / Infinite Indicator */}
        {(count !== undefined || isInfinite) && (
          <div
            data-testid="unit-card-count"
            className={`absolute top-2.5 right-2.5 px-2 py-0.5 font-black text-[10px] rounded-full shadow-md flex items-center gap-0.5 font-mono ${
              isInfinite
                ? 'bg-cyan-600 text-white shadow-cyan-600/30'
                : 'bg-amber-500 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isInfinite ? <Infinity className="w-3 h-3" /> : `×${count}`}
          </div>
        )}

        {/* Top Header: Avatar + Name + Type */}
        <div className="flex items-center gap-2.5 pr-12 w-full">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm flex-shrink-0 ${getPortraitFrameStyle()}`}>
            {unit.icon || (isHero ? '👑' : isElite ? '🐺' : '🛡️')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm truncate leading-tight">
                {unit.name}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border font-mono ${getTypeBadgeStyle()}`}>
                {unit.type}
              </span>
              {isInfinite && (
                <span className="text-[9px] text-cyan-400 font-mono">· Unlimited</span>
              )}
            </div>
          </div>
        </div>

        {/* Core Stat Row */}
        <div className="grid grid-cols-5 gap-1 w-full text-[10px] font-mono text-slate-300 bg-slate-900/90 rounded-lg p-1.5 mt-2.5 border border-slate-800/80 text-center">
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase" title="Health">HP</span>
            <span className="font-bold text-emerald-400">{unit.hp}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase" title="Damage">ATK</span>
            <span className="font-bold text-red-400">{unit.damage}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase" title="Range">RNG</span>
            <span className="font-bold text-cyan-400">{unit.range}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase" title="Attack Speed">ATK SPD</span>
            <span className="font-bold text-amber-300">{unit.attackSpeed ?? 1.0}s</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase" title="Move Speed">MOV SPD</span>
            <span className="font-bold text-blue-300">{unit.speed ?? 80}</span>
          </div>
        </div>

        {/* Combat Badges (Damage & Armor Type Chips with Hover Tooltips) */}
        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono w-full">
          <span
            title={DAMAGE_TYPE_DESCRIPTIONS[damageType]}
            className="flex-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-help truncate text-center font-bold"
          >
            ATK: {damageType}
          </span>
          <span
            title={ARMOR_TYPE_DESCRIPTIONS[armorType]}
            className="flex-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 cursor-help truncate text-center font-bold"
          >
            DEF: {armorType}
          </span>
        </div>

        {/* Selected Ready State Indicator */}
        {isSelected && (
          <div className="mt-2 text-[10px] text-cyan-300 font-bold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Ready to Place
          </div>
        )}
      </button>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VARIANT: City Management (Wide/Horizontal Layout with Logistical Metadata)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`w-full flex flex-col gap-2.5 p-3.5 rounded-xl border-2 transition-all text-left relative ${
        getRarityCardStyle()
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {/* Top Main Row: Avatar, Title, Badges & Logistical Stats */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Avatar + Title + Rarity + Stats */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 shadow-inner ${getPortraitFrameStyle()}`}>
            {unit.icon || (isHero ? '👑' : isElite ? '🐺' : '🛡️')}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-bold text-base leading-tight truncate ${isHero ? 'text-amber-300' : 'text-white'}`}>
                {isHero && <span className="mr-1">★</span>}
                {unit.name}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-mono font-bold border ${getTypeBadgeStyle()}`}>
                {unit.type}
              </span>
              {isFixedGarrison && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-400 uppercase font-mono border border-slate-700">
                  Fixed Garrison
                </span>
              )}
            </div>

            {/* Subtitle Stats & Location */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
              <span>HP: <strong className="text-emerald-400">{unit.hp}</strong></span>
              <span>ATK: <strong className="text-red-400">{unit.damage}</strong></span>
              <span>Range: <strong className="text-cyan-400">{unit.range}</strong></span>
              <span>Atk Spd: <strong className="text-amber-300">{unit.attackSpeed ?? 1.0}s</strong></span>
              <span>Move Spd: <strong className="text-blue-300">{unit.speed ?? 80}</strong></span>
              {unit.armor !== undefined && unit.armor > 0 && (
                <span>Armor: <strong className="text-amber-300">+{unit.armor}</strong></span>
              )}
            </div>

            {/* Combat Badges (Damage & Armor Type) */}
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono">
              <span
                title={DAMAGE_TYPE_DESCRIPTIONS[damageType]}
                className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-help font-bold"
              >
                ATK: {damageType}
              </span>
              <span
                title={ARMOR_TYPE_DESCRIPTIONS[armorType]}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 cursor-help font-bold"
              >
                DEF: {armorType}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Upkeep, Count, and Station Badges */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1.5 flex-shrink-0">
          {count !== undefined && (
            <span 
              data-testid="unit-card-count"
              className="text-xs font-bold text-amber-300 font-mono px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-lg shadow-sm"
            >
              x{count}
            </span>
          )}

          {/* Upkeep Cost Tag */}
          <span 
            data-testid="unit-card-upkeep"
            className="text-[11px] font-semibold text-slate-300 font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md flex items-center gap-1"
            title={`Upkeep: ${calculatedUpkeep} Gold deducted every turn`}
          >
            <Coins className="w-3 h-3 text-yellow-400" /> {calculatedUpkeep}g / turn
          </span>

          {assignedLocationName && (
            <span className="text-[10px] font-medium text-slate-400 font-mono px-1.5 py-0.5 bg-slate-950 border border-slate-800/80 rounded flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-cyan-400" /> {assignedLocationName}
            </span>
          )}
        </div>
      </div>

      {/* Action Controls / Action Slot */}
      {(actions || onAction || customActionLabel) && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
          {actions ? (
            <div className="w-full flex items-center justify-between gap-2">
              {actions}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              {customActionLabel && (
                <button
                  type="button"
                  onClick={() => onAction && onAction('inspect')}
                  disabled={isDisabled || customActionDisabled}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs rounded-lg transition-all shadow"
                >
                  {customActionLabel}
                </button>
              )}

              {onAction && !customActionLabel && (
                <>
                  <button
                    type="button"
                    onClick={() => onAction('deploy')}
                    disabled={isDisabled}
                    className="px-2.5 py-1 bg-green-900/80 hover:bg-green-700 text-green-200 font-bold text-xs rounded transition-colors"
                  >
                    Deploy
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction('return')}
                    disabled={isDisabled}
                    className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs rounded transition-colors"
                  >
                    Recall
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
