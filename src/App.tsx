import { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { MainMenu } from './pages/MainMenu';
import { ModeSelectMenu } from './pages/ModeSelectMenu';
import { SandboxCanvas } from './features/combat/SandboxCanvas';
import { SettingsPage } from './pages/SettingsPage';
import { CampaignOrchestrator } from './features/combat/CampaignOrchestrator';
import type { GameState } from './types/game';

const GameOrchestrator = () => {
  const [currentView, setCurrentView] = useState<GameState>('menu');

  return (
    <div className="w-full h-full selection:bg-[var(--accent-color)] selection:text-[var(--bg-color)]">
      {currentView === 'menu' && <MainMenu onNavigate={setCurrentView} />}
      {currentView === 'mode_select' && <ModeSelectMenu onNavigate={setCurrentView} />}
      {currentView === 'sandbox' && <SandboxCanvas onNavigate={setCurrentView} />}
      {currentView === 'settings' && <SettingsPage onNavigate={setCurrentView} />}
      {currentView === 'battle' && <CampaignOrchestrator onNavigate={setCurrentView} />}
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <GameOrchestrator />
    </SettingsProvider>
  );
}

export default App;
