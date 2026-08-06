import React, { useState } from 'react';
import { useCampaign } from '../../context/CampaignContext';
import { Skull, Coins, Users, ShieldAlert, Plus, Minus, X } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface Props {
  onEndPhase?: () => void;
}

export const EmpireManagement: React.FC<Props> = ({ onEndPhase }) => {
  const { 
    gold, 
    faith, 
    doomClock, 
    globalUnitPool, 
    territories, 
    scorchTerritory,
    allocateUnitToTerritory,
    deallocateUnitFromTerritory
  } = useCampaign();

  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);

  const selectedTerritory = territories.find(t => t.id === selectedTerritoryId);

  return (
    <ErrorBoundary>
      <div className="w-full h-full bg-slate-950 text-slate-200 flex flex-col">
      {/* Top Resource Bar */}
      <div className="flex-shrink-0 flex justify-between items-center bg-slate-900 border-b border-slate-700 p-4 shadow-lg z-10">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-yellow-400 font-bold">
            <Coins className="w-5 h-5" /> Gold: {gold}
          </div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Users className="w-5 h-5" /> Faith: {faith}
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <ShieldAlert className="w-5 h-5" /> Unassigned Pool: {globalUnitPool.length} Units
          </div>
        </div>
        <div className="flex items-center gap-2 text-red-500 font-black text-xl tracking-widest bg-red-950/50 px-4 py-2 rounded-lg border border-red-900/50">
          <Skull className="w-6 h-6 animate-pulse" /> DOOM IN: {doomClock}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Territory Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 content-start">
        {territories.map(t => {
          const isDanger = t.hasActiveBattle;
          const isScorched = t.isScorched;
          
          return (
            <div key={t.id} className={`relative p-5 rounded-xl border-2 transition-all ${isScorched ? 'border-slate-800 bg-slate-900/30 opacity-50' : isDanger ? 'border-red-500/80 bg-slate-900 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-700 bg-slate-900'}`}>
              <h3 className="text-xl font-bold font-serif mb-1 text-white">{t.name}</h3>
              <div className="text-sm text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">Ring: {t.ringLevel} | {t.type}</div>
              
              {!isScorched ? (
                <>
                  <div className="flex justify-between mb-2 text-sm font-mono">
                    <span className="text-green-400">+{t.resourceYield} Yield</span>
                    <span className="text-red-400">-{t.upkeepCost} Upkeep</span>
                  </div>
                  
                  <div className="text-slate-300 text-sm font-semibold mb-2">
                    Defenders Assigned: <span className="text-amber-400 font-bold">{t.allocatedDefenders.length}</span>
                  </div>

                  {isDanger && (
                    <div className="text-red-500 font-bold text-sm my-3 bg-red-950/40 py-1 px-2 rounded inline-block animate-pulse">
                      BATTLE IMMINENT
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mt-4">
                    <button 
                      onClick={() => setSelectedTerritoryId(t.id)}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold text-sm transition-colors text-white flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" /> Manage Troops ({t.allocatedDefenders.length})
                    </button>
                    <button 
                      onClick={() => scorchTerritory(t.id)}
                      className="w-full py-2 bg-red-900/60 hover:bg-red-700 border border-red-700/50 rounded font-bold text-sm text-red-200 transition-colors"
                    >
                      Scorched Earth (+1000g)
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-red-600 font-bold py-8 tracking-widest uppercase border border-red-900/30 bg-red-950/20 rounded">
                  Scorched
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Allocation Modal */}
      {selectedTerritory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl flex flex-col max-h-[80vh]">
            <button 
              onClick={() => setSelectedTerritoryId(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold font-serif text-white mb-2">Allocate Troops to {selectedTerritory.name}</h2>
            <p className="text-slate-400 text-sm mb-6">Assign available troops from the global army pool to defend this territory.</p>

            <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto">
              {/* Assigned to Territory */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3">
                  Assigned ({selectedTerritory.allocatedDefenders.length})
                </h4>
                {selectedTerritory.allocatedDefenders.length === 0 ? (
                  <div className="text-slate-600 text-sm italic py-4">No defenders assigned yet.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedTerritory.allocatedDefenders.map((u) => (
                      <div key={u.id} className="flex justify-between items-center bg-slate-900 p-2.5 rounded border border-slate-700 text-sm">
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-xs text-slate-400 uppercase">{u.type} | HP: {u.hp} | DMG: {u.damage}</div>
                        </div>
                        <button 
                          onClick={() => deallocateUnitFromTerritory(selectedTerritory.id, u.id)}
                          className="p-1.5 bg-red-900/50 hover:bg-red-700 text-red-200 rounded"
                          title="Remove from territory"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Global Pool */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3">
                  Available Pool ({globalUnitPool.length})
                </h4>
                {globalUnitPool.length === 0 ? (
                  <div className="text-slate-600 text-sm italic py-4">All available units are currently deployed.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {globalUnitPool.map((u) => (
                      <div key={u.id} className="flex justify-between items-center bg-slate-900 p-2.5 rounded border border-slate-700 text-sm">
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-xs text-slate-400 uppercase">{u.type} | HP: {u.hp} | DMG: {u.damage}</div>
                        </div>
                        <button 
                          onClick={() => allocateUnitToTerritory(selectedTerritory.id, u.id)}
                          className="p-1.5 bg-green-900/50 hover:bg-green-700 text-green-200 rounded"
                          title="Assign to territory"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedTerritoryId(null)}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-wider rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Bottom Action */}
      {onEndPhase && (
        <div className="flex-shrink-0 flex justify-end p-4 border-t border-slate-700 bg-slate-900 z-10">
          <button 
            onClick={onEndPhase}
            className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all hover:scale-105"
          >
            End Management Phase
          </button>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
};
