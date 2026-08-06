import React, { useEffect } from 'react';
import { useCampaign } from '../../context/CampaignContext';
import { ShieldAlert, ChevronRight } from 'lucide-react';

interface Props {
  onNext?: () => void;
}

export const BattleSelectMenu: React.FC<Props> = ({ onNext }) => {
  const { territories } = useCampaign();
  const activeBattles = territories.filter(t => t.hasActiveBattle && !t.isScorched);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && activeBattles.length > 0) {
      setSelectedId(activeBattles[0].id);
    }
  }, [selectedId, activeBattles]);

  const selectedTerritory = territories.find(t => t.id === selectedId);

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold mb-2 font-serif text-white">Battle Select (Map Phase)</h2>
      <p className="text-slate-400 mb-8 max-w-lg text-center">
        Select an active front-line territory to defend against the incoming doom wave.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mb-8">
        {activeBattles.length === 0 ? (
          <div className="col-span-2 text-center text-slate-500 py-12 border border-slate-800 rounded-xl bg-slate-900/50">
            No active fronts available. All outer territories have been scorched!
          </div>
        ) : (
          activeBattles.map(t => {
            const isSelected = t.id === selectedId;
            return (
              <div 
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-red-500 bg-slate-900 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-[1.02]' 
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase font-bold tracking-widest text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                      Front Line (Ring {t.ringLevel})
                    </span>
                    <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold font-serif text-white mb-2">{t.name}</h3>
                  <p className="text-sm text-slate-400">Allocated Defenders: <span className="text-amber-400 font-bold">{t.allocatedDefenders.length}</span></p>
                </div>

                <div className="mt-6 flex justify-end items-center gap-1 text-sm font-bold text-red-400">
                  {isSelected ? 'SELECTED FOR DEFENSE' : 'Click to Select'} <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {onNext && selectedTerritory && (
        <button 
          onClick={onNext}
          className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-lg shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all hover:scale-105"
        >
          Lock In Defense for {selectedTerritory.name}
        </button>
      )}
    </div>
  );
};
