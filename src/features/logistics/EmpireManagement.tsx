import React, { useState } from 'react';
import { useCampaign } from '../../context/CampaignContext';
import { Skull, Coins, Users, ShieldAlert, Store, Sparkles, Map } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { RingMapView } from './RingMapView';
import { TerritoryDetailPanel } from './TerritoryDetailPanel';
import { UnitLogisticsPanel } from './UnitLogisticsPanel';
import { EmpireEmporiumPanel } from './EmpireEmporiumPanel';

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
    emporiumItems,
    purchasedItemIds,
    scorchTerritory,
    allocateUnitToTerritory,
    deallocateUnitFromTerritory,
    upgradeBuilding,
    buyUnit,
    transferUnits,
    buyShopItem,
  } = useCampaign();

  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(territories[0]?.id ?? null);
  const [viewMode, setViewMode] = useState<'map' | 'logistics' | 'shop'>('map');

  const selectedTerritory = territories.find(t => t.id === selectedTerritoryId) || null;

  const handleSelectTerritoryNode = (territoryId: string) => {
    setSelectedTerritoryId(territoryId);
    // Stay in map view so user can view details on right side of map view
  };

  const handleOpenUnitManager = (territoryId?: string) => {
    if (territoryId) {
      setSelectedTerritoryId(territoryId);
    }
    setViewMode('logistics');
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full bg-slate-950 text-slate-200 flex flex-col overflow-hidden relative select-none">
        {/* Top Navigation & Resource Header Bar */}
        <div className="flex-shrink-0 flex flex-wrap justify-between items-center bg-slate-900 border-b border-slate-800 p-3.5 shadow-xl z-20 gap-4">
          {/* Main 3 Full-Screen View Navigation Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-amber-600 text-black shadow-lg scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Map className="w-4 h-4" /> Map & City Details
              </button>

              <button
                onClick={() => setViewMode('logistics')}
                className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${
                  viewMode === 'logistics'
                    ? 'bg-amber-600 text-black shadow-lg scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" /> Army Logistics
              </button>

              <button
                onClick={() => setViewMode('shop')}
                className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${
                  viewMode === 'shop'
                    ? 'bg-amber-600 text-black shadow-lg scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Store className="w-4 h-4" /> Empire Emporium
              </button>
            </div>
          </div>

          {/* Resource Status Indicators */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm">
              <Coins className="w-4 h-4" /> Gold: {gold}
              <span className="sr-only">{gold} Gold</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" /> Faith: {faith}
              <span className="sr-only">{faith} Faith</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Unassigned Pool: {globalUnitPool.length} Units
            </div>
            <div className="flex items-center gap-1.5 text-red-500 font-black text-sm tracking-wider bg-red-950/60 px-3 py-1.5 rounded-lg border border-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Skull className="w-4 h-4 animate-pulse" /> {doomClock <= 1 ? 'DOOMSDAY IS COMING!' : `DOOM IN: ${doomClock} CYCLES`}
            </div>
          </div>
        </div>

        {/* ── View 1: Map + City Details / Empire Overview (Full Screen) ── */}
        {viewMode === 'map' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Side: Concentric Interactive Ring Map (~60% width) */}
            <div className="w-full md:w-[60%] h-full relative border-r border-slate-800 bg-slate-950">
              <RingMapView
                territories={territories}
                selectedTerritoryId={selectedTerritoryId}
                onSelectTerritory={handleSelectTerritoryNode}
              />
            </div>

            {/* Right Side: City Details & Town Infrastructure Panel (~40% width) */}
            <div className="w-full md:w-[40%] h-full bg-slate-900 flex flex-col overflow-hidden">
              <TerritoryDetailPanel
                territory={selectedTerritory}
                territories={territories}
                globalUnitPool={globalUnitPool}
                gold={gold}
                faith={faith}
                doomClock={doomClock}
                emporiumItems={emporiumItems}
                purchasedItemIds={purchasedItemIds}
                onUpgradeBuilding={upgradeBuilding}
                onScorchTerritory={scorchTerritory}
                onOpenUnitManager={handleOpenUnitManager}
              />
            </div>
          </div>
        )}

        {/* ── View 2: Army Logistics (Full Screen 2-Column Manager) ── */}
        {viewMode === 'logistics' && (
          <div className="flex-1 overflow-hidden bg-slate-900">
            <UnitLogisticsPanel
              territories={territories}
              globalUnitPool={globalUnitPool}
              gold={gold}
              selectedTerritoryId={selectedTerritoryId}
              onSelectTerritory={(id) => setSelectedTerritoryId(id)}
              onAllocateUnit={allocateUnitToTerritory}
              onDeallocateUnit={deallocateUnitFromTerritory}
              onBuyUnit={buyUnit}
              onTransferUnits={transferUnits}
            />
          </div>
        )}

        {/* ── View 3: Empire Emporium / Shop (Full Screen Shop) ── */}
        {viewMode === 'shop' && (
          <div className="flex-1 overflow-hidden bg-slate-900">
            <EmpireEmporiumPanel
              emporiumItems={emporiumItems}
              gold={gold}
              faith={faith}
              purchasedItemIds={purchasedItemIds}
              onBuyShopItem={buyShopItem}
            />
          </div>
        )}

        {/* Bottom Phase Navigation Footer */}
        {onEndPhase && (
          <div className="flex-shrink-0 flex justify-end p-3.5 border-t border-slate-800 bg-slate-900/90 z-20 backdrop-blur">
            <button
              onClick={onEndPhase}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all hover:scale-105"
            >
              End Management Phase
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
