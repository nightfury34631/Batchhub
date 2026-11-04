import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Bell,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Dropdown } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';

export interface TopbarProps {
  title?: string;
  onOpenSidebar: () => void;
  onOpenCommand: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title = 'Dashboard',
  onOpenSidebar,
  onOpenCommand,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const userMenuItems = [
    {
      id: 'profile',
      label: 'Your Profile',
      onClick: () => {
        navigate('/profile');
      },
    },
    {
      id: 'logout',
      label: 'Sign Out',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#0E181D]/90 backdrop-blur-md border-b border-[#1F353C] px-4 sm:px-6 lg:px-8 flex items-center justify-between select-none">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-[10px] text-[#9BB2BC] hover:text-white hover:bg-[#15242A] transition-colors cursor-pointer shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 truncate">
          <h1 className="text-[17px] font-bold text-white tracking-tight truncate">{title}</h1>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#00D084] shrink-0" />
          <span className="hidden sm:inline-block text-[12px] text-[#9BB2BC] font-medium truncate">
            Semester Cohort Hub
          </span>
        </div>
      </div>

      {/* Center: Global Command Search Trigger */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <button
          type="button"
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between bg-[#0E171B] border border-[#1F353C] hover:border-[#00D084]/40 rounded-[12px] py-1.5 px-3.5 text-[13px] text-[#9BB2BC] transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#9BB2BC] group-hover:text-[#00D084] transition-colors" />
            <span className="group-hover:text-[#D2DFE5] transition-colors">
              Search students, events, or announcements...
            </span>
          </div>
          <kbd className="text-[11.5px] font-mono bg-[#15242A] border border-[#1F353C] px-1.5 py-0.5 rounded text-[#9BB2BC]">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Actions and User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenCommand}
          className="md:hidden p-2 rounded-[10px] text-[#9BB2BC] hover:text-white hover:bg-[#15242A] transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Calendar Quick Action */}
        <button
          onClick={() => navigate('/events')}
          className="p-2 rounded-[10px] text-[#9BB2BC] hover:text-white hover:bg-[#15242A] transition-colors cursor-pointer"
          title="Campus Calendar"
        >
          <Calendar className="w-4 h-4" />
        </button>

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-[10px] text-[#9BB2BC] hover:text-white hover:bg-[#15242A] transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00D084]" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1B2E36] border border-[#1F353C] rounded-[16px] shadow-[0_16px_40px_rgba(0,0,0,0.6)] p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1F353C]">
                <span className="text-[13px] font-bold text-white">Cohort Notifications</span>
                <Badge variant="mint" size="xs">
                  2 New
                </Badge>
              </div>

              <div className="flex flex-col gap-2">
                <div className="p-2.5 rounded-[10px] bg-[#15242A] border border-[#1F353C]/60 flex flex-col gap-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold text-[#00D084]">URGENT NOTICE</span>
                    <span className="text-[11px] text-[#9BB2BC]">10m ago</span>
                  </div>
                  <span className="text-[12.5px] font-medium text-white leading-snug">
                    Final-Year Project Proposal Submission & Supervisor Defense
                  </span>
                </div>

                <div className="p-2.5 rounded-[10px] bg-[#15242A] border border-[#1F353C]/60 flex flex-col gap-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold text-[#38BDF8]">EXAM SCHEDULE</span>
                    <span className="text-[11px] text-[#9BB2BC]">2h ago</span>
                  </div>
                  <span className="text-[12.5px] font-medium text-white leading-snug">
                    CSE-3101 Midterm exam room announced: Room 402
                  </span>
                </div>
              </div>

              <Link
                to="/announcements"
                onClick={() => setIsNotifOpen(false)}
                className="block text-center text-[12px] text-[#00D084] hover:underline font-medium pt-2.5 mt-2 border-t border-[#1F353C]"
              >
                View all cohort announcements →
              </Link>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-[#1F353C] mx-1" />

        {/* Profile Avatar Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5 p-1 rounded-[12px] hover:bg-[#15242A] transition-colors cursor-pointer select-none">
              <div className="w-8 h-8 rounded-full bg-[#192C34] border border-[#00D084]/30 flex items-center justify-center text-[13px] font-bold text-[#00D084]">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[13px] font-semibold text-white leading-tight">
                  {user?.name || 'Academic User'}
                </span>
                <span className="text-[11.5px] text-[#9BB2BC] capitalize">
                  {user?.role || 'student'}
                </span>
              </div>
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
};
