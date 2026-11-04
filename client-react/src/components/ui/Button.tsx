import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed select-none focus:outline-none';

    const sizeStyles = {
      xs: 'text-[11px] px-2.5 py-1 rounded-[8px] gap-1.5',
      sm: 'text-[12.5px] px-3.5 py-1.5 rounded-[10px] gap-1.5',
      md: 'text-[13.5px] px-4 py-2.5 rounded-[12px] gap-2',
      lg: 'text-[15px] px-6 py-3 rounded-[14px] gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-[#00D084] text-[#0B1316] hover:bg-[#00B875] font-semibold active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-[#00D084] disabled:active:scale-100 shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
      secondary:
        'bg-[#192C34] text-[#D2DFE5] hover:text-white border border-[#1F353C] hover:border-[#00D084]/40 hover:bg-[#1E343E] active:scale-[0.98] disabled:opacity-50',
      outline:
        'bg-transparent text-[#D2DFE5] border border-[#1F353C] hover:border-[#00D084]/50 hover:text-white active:scale-[0.98] disabled:opacity-50',
      danger:
        'bg-[rgba(248,113,113,0.12)] text-[#F87171] border border-[rgba(248,113,113,0.3)] hover:bg-[rgba(248,113,113,0.2)] active:scale-[0.98] disabled:opacity-50',
      ghost:
        'bg-transparent text-[#7E96A0] hover:text-[#D2DFE5] hover:bg-[#192C34] active:scale-[0.98] disabled:opacity-50',
      subtle:
        'bg-[#0E171B] text-[#D2DFE5] hover:text-white border border-[#1F353C]/60 hover:border-[#1F353C] active:scale-[0.98] disabled:opacity-50',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            baseStyles,
            sizeStyles[size],
            variantStyles[variant],
            className
          )
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
