import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number | string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-[12px] py-1.5 px-3 rounded-[10px]',
    md: 'text-[13px] py-2 px-4 rounded-[12px]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 bg-[#0E171B] p-1 rounded-[14px] border border-[#1F353C]/80',
          className
        )
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={twMerge(
              clsx(
                'relative flex items-center gap-2 font-medium transition-colors select-none cursor-pointer focus:outline-none',
                sizeClasses[size],
                isActive ? 'text-white font-semibold' : 'text-[#7E96A0] hover:text-[#D2DFE5]'
              )
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-[#1A323A] border border-[#00D084]/30 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    'text-[12px] px-2 py-0.5 rounded-full font-bold',
                    isActive
                      ? 'bg-[#00D084]/20 text-[#00D084]'
                      : 'bg-[#15242A] text-[#9BB2BC]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
