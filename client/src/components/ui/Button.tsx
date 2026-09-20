import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'lime';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  as?: React.ElementType;
  to?: string;
}

type ButtonProps = ButtonBaseProps & 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> &
  Record<string, any>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-lime text-black font-extrabold hover:bg-lime-hover shadow-[0_0_20px_rgba(212,255,50,0.25)]',
  lime: 'bg-lime text-black font-extrabold hover:bg-lime-hover shadow-[0_0_25px_rgba(212,255,50,0.3)]',
  secondary: 'bg-secondary text-bg hover:bg-secondary-hover',
  outline: 'border border-white/20 bg-transparent hover:bg-elevated text-text',
  ghost: 'bg-transparent hover:bg-elevated text-text-muted hover:text-text',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-10 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
};

const Button = forwardRef<HTMLElement, ButtonProps>(({
  className = '',
  variant = 'primary' as ButtonVariant,
  size = 'md' as ButtonSize,
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  as,
  to,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none cursor-pointer no-underline';
  const combinedClassName = `${baseStyles} ${variantStyles[variant as ButtonVariant]} ${sizeStyles[size as ButtonSize]} ${className}`;

  // If an "as" component is provided (e.g., Link), render it as that component
  if (as) {
    const Component = as;
    return (
      <motion.div
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className="inline-block"
      >
        <Component
          ref={ref}
          to={to}
          className={combinedClassName}
          {...props}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </Component>
      </motion.div>
    );
  }

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';

// Support both default and named exports
export { Button };
export default Button;
