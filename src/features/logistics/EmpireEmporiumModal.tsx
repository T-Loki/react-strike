import React, { useState } from 'react';
import type { EmporiumItem } from '../../types/game';
import { X, Store, Coins, Sparkles, ShieldAlert, CheckCircle2, Flame, Users, Shield, Castle, TrendingUp, Snowflake } from 'lucide-react';

interface Props {
  emporiumItems: EmporiumItem[];
  gold: number;
  faith: number;
  purchasedItemIds: string[];
  onClose: () => void;
  onBuyShopItem: (itemId: string) => void;
}

export const EmpireEmporiumModal: React.FC<Props> = ({
  emporiumItems,
  gold,
  faith,
  purchasedItemIds,
  onClose,
  onBuyShopItem,
}) => {
  const [activeTab, setActiveTab] = useState<'decree' | 'perk' | 'spell'>('decree');

  const filteredItems = emporiumItems.filter(item => item.category === activeTab);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users className="w-5 h-5 text-amber-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-yellow-400" />;
      case 'Castle': return <Castle className="w-5 h-5 text-indigo-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-red-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-amber-300" />;
      case 'Snowflake': return <Snowflake className="w-5 h-5 text-blue-300" />;
      default: return <Store className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 relative shadow-2xl flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
              <Store className="w-6 h-6 text-amber-400" /> Empire Emporium & Grand Sanctuary
            </h2>
            <p className="text-slate-400 text-sm">
              Enact imperial decrees, empower your army with global perks, and unlock holy battle spells.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 font-bold text-yellow-400 text-sm">
              <Coins className="w-4 h-4" /> {gold} Gold
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-sm">
              <Sparkles className="w-4 h-4" /> {faith} Faith
            </div>
          </div>
        </div>

        {/* Shop Category Tabs */}
        <div className="flex border-b border-slate-800 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('decree')}
            className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all border-b-2 ${
              activeTab === 'decree'
                ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            Emergency Decrees
          </button>

          <button
            onClick={() => setActiveTab('perk')}
            className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all border-b-2 ${
              activeTab === 'perk'
                ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            Global Perks
          </button>

          <button
            onClick={() => setActiveTab('spell')}
            className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all border-b-2 ${
              activeTab === 'spell'
                ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            Battle Spells
          </button>
        </div>

        {/* Tab Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
          {filteredItems.map(item => {
            const isPurchased = item.purchased || purchasedItemIds.includes(item.id);
            const canAfford =
              item.costType === 'gold' ? gold >= item.cost : faith >= item.cost;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isPurchased
                    ? 'bg-slate-950/60 border-slate-800 opacity-75'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        {renderIcon(item.icon)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">{item.name}</h4>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {isPurchased && (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-950/60 px-2 py-0.5 rounded border border-green-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 my-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
                  <div className="text-xs font-bold font-mono">
                    <span className="text-slate-400">Cost: </span>
                    <span
                      className={
                        item.costType === 'gold' ? 'text-yellow-400' : 'text-cyan-400'
                      }
                    >
                      {item.cost} {item.costType === 'gold' ? 'Gold' : 'Faith'}
                    </span>
                  </div>

                  {!isPurchased ? (
                    <button
                      onClick={() => onBuyShopItem(item.id)}
                      disabled={!canAfford}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        canAfford
                          ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {item.category === 'decree' ? 'Enact Decree' : 'Unlock'}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Purchased</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-wider rounded-lg shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
