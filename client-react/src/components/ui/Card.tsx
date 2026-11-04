import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'recessed' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#15242A] border border-[#1F353C]',
    elevated: 'bg-[#1B2E36] border border-[#1F353C] shadow-[0_12px_32px_rgba(0,0,0,0.35)]',
    recessed: 'bg-[#0E171B] border border-[#1F353C]/60',
    interactive:
      'bg-[#15242A] border border-[#1F353C] hover:border-[#00D084]/40 hover:bg-[#182A31] transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-[18px] p-5 sm:p-6 text-white overflow-hidden',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={twMerge(clsx('flex flex-col gap-1 pb-4', className))} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={twMerge(clsx('text-[17px] font-semibold text-white tracking-tight', className))}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={twMerge(clsx('text-[13px] text-[#7E96A0]', className))} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => <div className={twMerge(clsx('pt-1', className))} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={twMerge(
      clsx('flex items-center justify-between pt-4 mt-4 border-t border-[#1F353C]/80', className)
    )}
    {...props}
  >
    {children}
  </div>
);

