import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-[12.5px] font-medium text-[#D2DFE5] select-none">
            {label}
          </label>
        )}

        <textarea
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full bg-[#0E171B] text-white text-[13.5px] rounded-[12px] border border-[#1F353C] py-2.5 px-3.5 transition-all duration-150',
              'placeholder:text-[#8EA2AC]',
              'focus:outline-none focus:border-[#00D084] focus:ring-1 focus:ring-[#00D084]/30 min-h-[90px] resize-y',
              error && 'border-[#F87171] focus:border-[#F87171] focus:ring-[#F87171]/30',
              className
            )
          )}
          {...props}
        />

        {error && <span className="text-[12.5px] text-[#F87171] font-medium">{error}</span>}
        {!error && helperText && <span className="text-[12.5px] text-[#9BB2BC]">{helperText}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
