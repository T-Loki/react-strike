import React from 'react';
import type { Territory } from '../../types/combat';
import { X, Flame, Shield, Coins, Users, Skull, ChevronRight } from 'lucide-react';

interface Props {
  territory: Territory | null;
  gold: number;
  onClose: () => void;
  onUpgradeBuilding: (territoryId: string, buildingId: string) => void;
  onScorchTerritory: (territoryId: string) => void;
  onOpenUnitManager: (territoryId: string) => void;
}

export const TerritoryDrawer: React.FC<Props> = ({
  territory,
  gold,
  onClose,
  onUpgradeBuilding,
  onScorchTerritory,
  onOpenUnitManager,
}) => {
  if (!territory) return null;

  const isDanger = territory.hasActiveBattle;
  const isScorched = territory.isScorched;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Drawer Header */}
      <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Ring {territory.ringLevel} • {territory.type}
            </span>
            {isDanger && (
              <span className="text-xs uppercase font-black tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 animate-pulse">
                <Flame className="w-3.5 h-3.5" /> Front Line
              </span>
            )}
            {isScorched && (
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">
                Scorched
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold font-serif text-white">{territory.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Yield & Stats Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Territory Gold Yield</div>
          <div className="text-2xl font-bold text-green-400 mt-1">+{territory.resourceYield}g / turn</div>
        </div>

        {/* Assigned Defenders Overview */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm uppercase tracking-wide">
              <Users className="w-4 h-4 text-cyan-400" /> Garrisoned Defenders ({territory.allocatedDefenders.length})
            </div>
            <button
              onClick={() => onOpenUnitManager(territory.id)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
            >
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {territory.allocatedDefenders.length === 0 ? (
            <div className="text-slate-500 text-xs italic py-2">No units assigned to this territory yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.values(
                territory.allocatedDefenders.reduce((acc, u) => {
                  if (!acc[u.name]) acc[u.name] = { name: u.name, count: 0 };
                  acc[u.name].count += 1;
                  return acc;
                }, {} as Record<string, { name: string; count: number }>)
              ).map(stack => (
                <div
                  key={stack.name}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 font-mono flex items-center gap-1.5"
                >
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span className="font-semibold text-white">{stack.name}</span>
                  <span className="text-amber-400 font-bold text-[11px]">x{stack.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Town Buildings Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            Town Infrastructure & Buildings ({territory.buildings?.length ?? 0})
          </h3>

          {!territory.buildings || territory.buildings.length === 0 ? (
            <div className="text-slate-500 text-xs italic bg-slate-950 p-4 rounded-xl border border-slate-800">
              No buildings constructed in this territory.
            </div>
          ) : (
            territory.buildings.map(b => {
              const isMax = b.level >= b.maxLevel;
              const canAfford = gold >= b.upgradeCost;
              const currentBonus = (b.level - 1) * 25;
              const nextBonus = b.level * 25;

              return (
                <div
                  key={b.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-base flex items-center gap-2">
                        {b.name}
                        <span className="text-xs px-2 py-0.5 bg-slate-800 text-amber-400 rounded font-mono">
                          Lv.{b.level}/{b.maxLevel}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{b.effectDescription}</p>
                      {!isMax && (
                        <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                          Upgrade Effect: {b.type === 'production' ? `${currentBonus} → ${nextBonus} Gold per turn` : `Level ${b.level} → Level ${b.level + 1}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-xs text-slate-400">
                      {isMax && (
                        <span className="text-amber-400 font-bold uppercase">MAX LEVEL</span>
                      )}
                    </span>

                    {!isScorched && !isMax && (
                      <button
                        onClick={() => onUpgradeBuilding(territory.id, b.id)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:scale-[1.02]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" /> Upgrade: ({b.upgradeCost} Gold)
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
        {!isScorched ? (
          <>
            <button
              onClick={() => onOpenUnitManager(territory.id)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <Users className="w-4 h-4 text-cyan-400" /> Manage Troops ({territory.allocatedDefenders.length})
            </button>

            <button
              onClick={() => onScorchTerritory(territory.id)}
              className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Skull className="w-4 h-4 text-red-400" /> Scorched Earth (+1000g)
            </button>
          </>
        ) : (
          <div className="text-center text-red-500 font-bold py-3 uppercase tracking-widest text-sm bg-red-950/30 border border-red-900/40 rounded-lg">
            Territory Scorched
          </div>
        )}
      </div>
    </div>
  );
};
