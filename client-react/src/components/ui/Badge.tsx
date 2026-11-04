import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'mint' | 'danger' | 'warning' | 'info' | 'purple' | 'neutral' | 'muted';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'mint',
  size = 'sm',
  dot = false,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium select-none rounded-full';

  const sizeStyles = {
    xs: 'text-[12px] px-2 py-0.5 gap-1 font-semibold',
    sm: 'text-[12.5px] px-2.5 py-1 gap-1.5 font-medium',
    md: 'text-[13.5px] px-3 py-1.5 gap-2 font-medium',
  };

  const variantStyles = {
    mint: 'bg-[rgba(0, 208, 132, 0.10)] text-[#00D084] border border-[rgba(0, 208, 132, 0.20)]',
    danger: 'bg-[rgba(248,113,113,0.12)] text-[#F87171] border border-[rgba(248,113,113,0.25)]',
    warning: 'bg-[rgba(251,191,36,0.12)] text-[#FBBF24] border border-[rgba(251,191,36,0.25)]',
    info: 'bg-[rgba(56,189,248,0.12)] text-[#38BDF8] border border-[rgba(56,189,248,0.25)]',
    purple: 'bg-[rgba(167,139,250,0.12)] text-[#A78BFA] border border-[rgba(167,139,250,0.25)]',
    neutral: 'bg-[#192C34] text-[#7E96A0] border border-[#1F353C]',
    muted: 'bg-[#0E171B] text-[#9BB2BC] border border-[#1F353C]',
  };

  const dotColors = {
    mint: 'bg-[#00D084]',
    danger: 'bg-[#F87171]',
    warning: 'bg-[#FBBF24]',
    info: 'bg-[#38BDF8]',
    purple: 'bg-[#A78BFA]',
    neutral: 'bg-[#7E96A0]',
    muted: 'bg-[#9BB2BC]',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};
