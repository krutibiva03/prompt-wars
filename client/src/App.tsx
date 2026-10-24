import React from 'react';
import { useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AchievementModal } from './components/AchievementModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ArenaPage } from './pages/ArenaPage';
import { DefenseLabPage } from './pages/DefenseLabPage';
import { ResultsPage } from './pages/ResultsPage';
import { LearnPage } from './pages/LearnPage';
import { HackathonDemoPage } from './pages/HackathonDemoPage';

export const AppContent: React.FC = () => {
  const { currentPage } = useGame();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'arena':
        return <ArenaPage />;
      case 'defense-lab':
        return <DefenseLabPage />;
      case 'results':
        return <ResultsPage />;
      case 'learn':
        return <LearnPage />;
      case 'demo':
        return <HackathonDemoPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cyber-bg text-slate-100">
      <Navbar />
      <main className="flex-1 w-full">{renderPage()}</main>
      <Footer />
      <AchievementModal />
    </div>
  );
};

export default AppContent;
