import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';

export interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Academic Flight Deck',
  '/tasks': 'Tasks & Deadlines',
  '/events': 'Campus Events',
  '/announcements': 'Batch Announcements',
  '/projects': 'Project Hub',
  '/resources': 'Resource Library',
  '/members': 'Batch Members',
  '/profile': 'My Profile',
  '/cr-panel': 'Cohort Administration',
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const location = useLocation();

  const resolvedTitle =
    (title && title !== 'Dashboard' ? title : null) ||
    ROUTE_TITLES[location.pathname] ||
    title ||
    'Academic Flight Deck';

  return (
    <div className="min-h-screen bg-[#0B1316] text-[#D2DFE5] flex">
      {/* Sidebar Rail */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar
          title={resolvedTitle}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenCommand={() => setIsCommandOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
};

