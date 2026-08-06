import React, { useEffect, useState } from 'react';
import { useCampaign } from '../../context/CampaignContext';
import { ShieldAlert, Shield, Users, Flame, ChevronRight, Swords, Building2, Coins } from 'lucide-react';
import { RingMapView } from './RingMapView';

interface Props {
  onNext?: () => void;
}

export const BattleSelectMenu: React.FC<Props> = ({ onNext }) => {
  const { territories } = useCampaign();
  const activeBattles = territories.filter(t => t.hasActiveBattle && !t.isScorched);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'combat' | 'city'>('combat');

  useEffect(() => {
    if (!selectedId && activeBattles.length > 0) {
      setSelectedId(activeBattles[0].id);
    }
  }, [selectedId, activeBattles]);

  const selectedTerritory = territories.find(t => t.id === selectedId) || null;
  const validTerritoryIds = activeBattles.map(t => t.id);

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 flex flex-col overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 shadow-lg flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 animate-pulse">
              <Flame className="w-3.5 h-3.5" /> Battle Phase Target Selection
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif text-white">Select Defense Frontline</h2>
        </div>

        <p className="text-xs text-slate-400 max-w-md hidden sm:block text-right">
          Click an active red battle front node on the map to select where your garrison will engage the horde.
        </p>
      </div>

      {/* Main Content Area (Left: Interactive Map with non-valid targets greyed out; Right: 2-Tab Battle & City Detail Panel) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Ring Map Canvas View (~65% width) */}
        <div className="w-full md:w-[65%] h-full relative border-r border-slate-800 bg-slate-950">
          <RingMapView
            territories={territories}
            selectedTerritoryId={selectedId}
            onSelectTerritory={(id) => setSelectedId(id)}
            validTerritoryIds={validTerritoryIds}
          />
        </div>

        {/* Right Side: Selected Battle Front Details (2 Tabs: Combat Details & City Details) (~35% width) */}
        <div className="w-full md:w-[35%] h-full bg-slate-900 flex flex-col justify-between p-5 overflow-hidden">
          {activeBattles.length === 0 ? (
            <div className="text-center text-slate-500 py-12 border border-slate-800 rounded-xl bg-slate-950/60 my-auto">
              <ShieldAlert className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              No active fronts available. All outer territories have been scorched!
            </div>
          ) : !selectedTerritory ? (
            <div className="text-center text-slate-500 py-12 italic my-auto">
              Select an active frontline battle node on the map.
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              {/* 2 Tabs Header: Combat Details vs City Details */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 flex-shrink-0">
                <button
                  onClick={() => setRightTab('combat')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    rightTab === 'combat'
                      ? 'bg-red-900/80 text-white border border-red-700 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5 text-red-400" /> Combat Details
                </button>
                <button
                  onClick={() => setRightTab('city')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    rightTab === 'city'
                      ? 'bg-amber-600 text-black shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> City Details
                </button>
              </div>

              {/* Selected Front Header Card */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-red-900/60 shadow-[0_0_20px_rgba(239,68,68,0.15)] flex-shrink-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs uppercase font-bold tracking-widest text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded border border-red-800 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" /> Front Line • Ring {selectedTerritory.ringLevel}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-serif text-white">{selectedTerritory.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type: <span className="text-slate-200 capitalize font-semibold">{selectedTerritory.type}</span>
                </p>
              </div>

              {/* Tab 1: Combat Details */}
              {rightTab === 'combat' && (
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {/* Defender Roster */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Assigned Garrison ({selectedTerritory.allocatedDefenders.length})
                      </h4>
                    </div>

                    {selectedTerritory.allocatedDefenders.length === 0 ? (
                      <div className="text-slate-500 text-xs italic py-2">No units assigned to this garrison. Deploying un-garrisoned!</div>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                        {Object.values(
                          selectedTerritory.allocatedDefenders.reduce((acc, u) => {
                            if (!acc[u.name]) acc[u.name] = { name: u.name, count: 0 };
                            acc[u.name].count += 1;
                            return acc;
                          }, {} as Record<string, { name: string; count: number }>)
                        ).map(stack => (
                          <div
                            key={stack.name}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 font-mono flex items-center gap-1.5 shadow-sm"
                          >
                            <Shield className="w-3 h-3 text-amber-400" />
                            <span className="font-semibold">{stack.name}</span>
                            <span className="text-amber-400 font-bold text-[11px]">x{stack.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: City Details */}
              {rightTab === 'city' && (
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {/* City Yields Card */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-yellow-400" /> City Yields
                    </div>
                    <div className="text-lg font-bold text-green-400 mt-1">+{selectedTerritory.resourceYield}g Gold / turn</div>
                    <div className="text-lg font-bold text-cyan-400 mt-0.5">+{selectedTerritory.faithYield ?? 10} Faith / turn</div>
                  </div>

                  {/* Infrastructure Summary */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Town Infrastructure & Buildings ({selectedTerritory.buildings?.length ?? 0})
                    </h4>
                    {!selectedTerritory.buildings || selectedTerritory.buildings.length === 0 ? (
                      <div className="text-slate-500 text-xs italic py-1">No buildings constructed.</div>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedTerritory.buildings.map(b => (
                          <div key={b.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{b.name}</span>
                              <span className="text-amber-400 font-mono font-bold text-[11px]">Lv.{b.level}/{b.maxLevel}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{b.effectDescription}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button Footer */}
          {onNext && selectedTerritory && (
            <div className="pt-4 border-t border-slate-800/80 flex-shrink-0 mt-2">
              <button
                onClick={onNext}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
              >
                <Swords className="w-5 h-5" /> Engage Horde at {selectedTerritory.name} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
