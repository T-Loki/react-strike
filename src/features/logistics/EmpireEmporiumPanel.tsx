import React, { useState } from 'react';
import type { EmporiumItem } from '../../types/game';
import { Store, Coins, Sparkles, ShieldAlert, CheckCircle2, Flame, Users, Shield, Castle, TrendingUp, Snowflake } from 'lucide-react';

interface Props {
  emporiumItems: EmporiumItem[];
  gold: number;
  faith: number;
  purchasedItemIds: string[];
  onBuyShopItem: (itemId: string) => void;
}

export const EmpireEmporiumPanel: React.FC<Props> = ({
  emporiumItems,
  gold,
  faith,
  purchasedItemIds,
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
    <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800">
        <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
          <Store className="w-5 h-5 text-amber-400" /> Empire Emporium & Grand Sanctuary
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Enact imperial decrees, empower your army with global perks, and unlock holy battle spells.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-2 gap-1">
        <button
          onClick={() => setActiveTab('decree')}
          className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-all border-b-2 ${
            activeTab === 'decree'
              ? 'border-amber-500 text-amber-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Emergency Decrees
        </button>

        <button
          onClick={() => setActiveTab('perk')}
          className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-all border-b-2 ${
            activeTab === 'perk'
              ? 'border-amber-500 text-amber-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Global Perks
        </button>

        <button
          onClick={() => setActiveTab('spell')}
          className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-all border-b-2 ${
            activeTab === 'spell'
              ? 'border-amber-500 text-amber-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Battle Spells
        </button>
      </div>

      {/* Tab Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.map(item => {
          const isPurchased = item.purchased || purchasedItemIds.includes(item.id);
          const canAfford =
            item.costType === 'gold' ? gold >= item.cost : faith >= item.cost;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
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
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {isPurchased && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-green-400 bg-green-950/60 px-2 py-0.5 rounded border border-green-800">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 my-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center mt-1">
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
                    className={`px-3 py-1 rounded font-bold text-xs transition-all ${
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
    </div>
  );
};
