import { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { CampaignProvider } from './context/CampaignContext';
import { MainMenu } from './pages/MainMenu';
import { ModeSelectMenu } from './pages/ModeSelectMenu';
import { SandboxOrchestrator } from './features/combat/SandboxOrchestrator';
import { SettingsPage } from './pages/SettingsPage';
import { CampaignOrchestrator } from './features/combat/CampaignOrchestrator';
import { StoryScene } from './features/visual_novel/StoryScene';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { GameState } from './types/game';

const GameOrchestrator = () => {
  const [currentView, setCurrentView] = useState<GameState>('menu');

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col selection:bg-[var(--accent-color)] selection:text-[var(--bg-color)]">
      {currentView === 'menu' && <ErrorBoundary><MainMenu onNavigate={setCurrentView} /></ErrorBoundary>}
      {currentView === 'mode_select' && <ErrorBoundary><ModeSelectMenu onNavigate={setCurrentView} /></ErrorBoundary>}
      {currentView === 'sandbox' && <ErrorBoundary><SandboxOrchestrator onNavigate={setCurrentView} /></ErrorBoundary>}
      {currentView === 'settings' && <ErrorBoundary><SettingsPage onNavigate={setCurrentView} /></ErrorBoundary>}
      {currentView === 'battle' && <ErrorBoundary><CampaignOrchestrator onNavigate={setCurrentView} /></ErrorBoundary>}
      {currentView === 'story' && <ErrorBoundary><StoryScene onNavigate={setCurrentView} /></ErrorBoundary>}
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <CampaignProvider>
        <GameOrchestrator />
      </CampaignProvider>
    </SettingsProvider>
  );
}

export default App;
