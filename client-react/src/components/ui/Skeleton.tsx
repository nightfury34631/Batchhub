import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  className,
  ...props
}) => {
  const variantStyles = {
    rect: 'rounded-[12px]',
    circle: 'rounded-full',
    text: 'rounded-[6px] h-4 w-full',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse bg-[#1A2E36]/80',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    />
  );
};
