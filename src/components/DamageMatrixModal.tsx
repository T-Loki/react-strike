import React from 'react';
import { X, Swords, Shield, Info } from 'lucide-react';
import { DAMAGE_MULTIPLIER_MATRIX } from '../core/math/combatMath';
import type { DamageType, ArmorType } from '../types/combat';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DAMAGE_TYPES: DamageType[] = ['Normal', 'Piercing', 'Siege', 'Magic', 'Hero'];
const ARMOR_TYPES: ArmorType[] = ['Unarmored', 'Light', 'Medium', 'Heavy', 'Fortified', 'Hero'];

export const DamageMatrixModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Swords className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white">
                Damage & Armor Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Attacker Damage Type vs Defender Armor Type Multiplier Table
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-1">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950">
                  <th className="p-3 text-slate-400 uppercase font-bold text-[11px] tracking-wider">
                    ATK \ DEF
                  </th>
                  {ARMOR_TYPES.map(armor => (
                    <th key={armor} className="p-3 text-center text-slate-300 font-bold text-[11px]">
                      <div className="flex flex-col items-center gap-0.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>{armor}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {DAMAGE_TYPES.map(dmg => (
                  <tr key={dmg} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-bold text-amber-400 bg-slate-950/40">
                      <div className="flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-amber-500" />
                        <span>{dmg}</span>
                      </div>
                    </td>
                    {ARMOR_TYPES.map(armor => {
                      const mult = DAMAGE_MULTIPLIER_MATRIX[dmg][armor];
                      const pct = Math.round(mult * 100);

                      let badgeStyle = 'text-slate-300 bg-slate-900/50';
                      if (pct > 100) {
                        badgeStyle = 'text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-700/50 shadow-sm';
                      } else if (pct < 100) {
                        badgeStyle = 'text-red-300 font-medium bg-red-950/50 border border-red-900/40';
                      }

                      return (
                        <td key={armor} className="p-2.5 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-[11px] w-14 text-center ${badgeStyle}`}>
                            {pct}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tactical Intel / Notes */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
            <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Info className="w-4 h-4 text-amber-400" /> Tactical Damage Formula
            </div>
            <p className="font-mono text-slate-400 text-[11px]">
              Final Damage = max(1, Math.floor(Base Damage × Matrix Multiplier − Flat Armor))
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  Piercing
                </span>
                <span className="text-slate-400">150% vs Light & Unarmored targets</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  Siege
                </span>
                <span className="text-slate-400">150% vs Fortified structures/units</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  Magic
                </span>
                <span className="text-slate-400">125% vs Heavy & Medium armor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                  Hero
                </span>
                <span className="text-slate-400">100% vs all except Fortified (75%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow"
          >
            Close Matrix Reference
          </button>
        </div>
      </div>
    </div>
  );
};
