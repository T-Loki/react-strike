import React from 'react';
import { useCampaign } from '../../context/CampaignContext';
import { ShieldCheck, Skull, Coins, Sparkles, ArrowRight, Building2, Flame } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface Props {
  onProceedToEmpireManagement: () => void;
}

export const RoundSummaryScreen: React.FC<Props> = ({ onProceedToEmpireManagement }) => {
  const { territories, roundLog, doomClock, applyEndOfRoundYields } = useCampaign();

  const survivingTerritories = territories.filter(t => !t.isScorched);
  const scorchedTerritories = territories.filter(t => t.isScorched);

  const totalGoldYield = survivingTerritories.reduce((acc, t) => acc + (t.resourceYield || 0), 0);
  const totalFaithYield = survivingTerritories.reduce((acc, t) => acc + (t.faithYield || 0), 0);

  const handleProceed = () => {
    applyEndOfRoundYields();
    onProceedToEmpireManagement();
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12 select-none overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          {/* Header Banner */}
          <div className="text-center space-y-2 border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> Round Resolution Complete
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-serif tracking-tight text-white">
              End of Round Tactical Report
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              All frontline defense engagements for this cycle have concluded. Review territory status and collect empire yields.
            </p>
          </div>

          {/* Round Battles Log Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" /> Recent Engagements & Territory Status
            </h2>

            {roundLog.length === 0 ? (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm italic">
                No active defense battles took place this round. Frontlines held without conflict.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roundLog.map((log, idx) => (
                  <div
                    key={`${log.territoryId}_${idx}`}
                    className={`p-4 rounded-xl border flex items-center justify-between shadow-lg ${
                      log.outcome === 'victory'
                        ? 'bg-emerald-950/30 border-emerald-900/80 text-emerald-200'
                        : 'bg-red-950/30 border-red-900/80 text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {log.outcome === 'victory' ? (
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                      )}
                      <div>
                        <div className="font-bold text-base text-white">{log.territoryName}</div>
                        <div className="text-xs opacity-80">
                          {log.outcome === 'victory' ? 'Defended Successfully' : 'Surrendered / Fallen'}
                        </div>
                      </div>
                    </div>

                    {log.outcome === 'surrendered' && (
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800">
                        +{log.goldEarned}g Salvage
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* End of Round Yield Earnings Grid */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" /> End of Round Resource Earnings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gold Yield */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gold Yield</span>
                  <Coins className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-3xl font-black text-yellow-400">+{totalGoldYield} Gold</div>
                <div className="text-xs text-slate-500">From {survivingTerritories.length} surviving territories & production infrastructure</div>
              </div>

              {/* Faith Yield */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Faith Yield</span>
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-cyan-400">+{totalFaithYield} Faith</div>
                <div className="text-xs text-slate-500">From divine sanctums and territory shrines</div>
              </div>

              {/* Empire Health / Doom Clock */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Doom Clock Status</span>
                  <Skull className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-black text-red-500">
                  {doomClock <= 1 ? 'DOOMSDAY IS COMING!' : `${doomClock} Cycles Remaining`}
                </div>
                <div className="text-xs text-slate-500">{scorchedTerritories.length} of {territories.length} cities have fallen</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proceed Action Button */}
        <div className="max-w-4xl mx-auto w-full pt-8 border-t border-slate-800">
          <button
            onClick={handleProceed}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest rounded-xl text-base md:text-lg shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
          >
            Collect Yields & Return to Empire Management <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
};
