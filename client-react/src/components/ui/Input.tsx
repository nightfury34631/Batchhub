import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftElement, rightElement, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-[12.5px] font-medium text-[#D2DFE5] select-none">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftElement && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#7E96A0]">
              {leftElement}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-[#0E171B] text-white text-[13.5px] rounded-[12px] border border-[#1F353C] py-2.5 px-3.5 transition-all duration-150',
                'placeholder:text-[#8EA2AC]',
                'focus:outline-none focus:border-[#00D084] focus:ring-1 focus:ring-[#00D084]/30',
                leftElement && 'pl-10',
                rightElement && 'pr-10',
                error && 'border-[#F87171] focus:border-[#F87171] focus:ring-[#F87171]/30',
                className
              )
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3.5 flex items-center text-[#7E96A0]">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <span className="text-[12.5px] text-[#F87171] font-medium">{error}</span>
        )}
        {!error && helperText && (
          <span className="text-[12.5px] text-[#9BB2BC]">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
