// BottomNav navigation bar adhering to 48x48px touch targets and clear accessible states

import React from 'react';
import { Home, History, BookOpen, Settings } from 'lucide-react';

export type MainTab = 'home' | 'history' | 'guide' | 'settings';

interface BottomNavProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  lang?: 'id' | 'en';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  lang = 'id',
}) => {
  const tabs = [
    {
      id: 'home' as MainTab,
      label: lang === 'en' ? 'Home' : 'Beranda',
      icon: Home,
    },
    {
      id: 'history' as MainTab,
      label: lang === 'en' ? 'History' : 'Riwayat',
      icon: History,
    },
    {
      id: 'guide' as MainTab,
      label: lang === 'en' ? 'Guide' : 'Panduan',
      icon: BookOpen,
    },
    {
      id: 'settings' as MainTab,
      label: lang === 'en' ? 'Settings' : 'Pengaturan',
      icon: Settings,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 safe-bottom"
      role="navigation"
      aria-label="Navigasi Utama"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-2 py-1 transition-colors select-none focus:outline-none ${
                isActive
                  ? 'text-brand-maroon font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`p-1 rounded-full transition-all ${
                  isActive ? 'bg-rose-50 text-brand-maroon' : ''
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
