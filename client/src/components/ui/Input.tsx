import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  leftIcon,
  id,
  ...props
}, ref) => {
  const inputId = id || React.useId();
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-elevated border ${error ? 'border-error' : 'border-border'} rounded-lg px-4 py-2.5 text-text placeholder:text-text-muted/50 focus-ring ${leftIcon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
