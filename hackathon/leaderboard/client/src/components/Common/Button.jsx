import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className,
  animated = true,
  as: Component = 'button',
  onClick,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-navara-blue text-white hover:bg-navara-blue/90 focus:ring-navara-blue shadow-lg hover:shadow-xl',
    secondary: 'border-2 border-navara-blue text-navara-blue bg-transparent hover:bg-navara-blue hover:text-white focus:ring-navara-blue',
    outline: 'border-2 border-github-light-gray dark:border-gray-600 text-github-dark-gray dark:text-white bg-transparent hover:bg-github-light-gray dark:hover:bg-gray-800 focus:ring-github-light-gray dark:focus:ring-gray-600',
    ghost: 'text-github-dark-gray dark:text-white hover:bg-github-light-gray dark:hover:bg-gray-800 focus:ring-github-dark-gray dark:focus:ring-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl',
    critical: 'bg-github-orange text-white hover:bg-github-orange/90 focus:ring-github-orange shadow-lg hover:shadow-xl',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-sm rounded',
    lg: 'px-6 py-3 text-base rounded',
    xl: 'px-8 py-4 text-lg rounded',
  };

  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );

  // Memoize click handler to prevent re-creation on every render
  const handleClick = useCallback((e) => {
    // Prevent double-clicks during loading
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    
    // Ensure onClick handler exists before calling
    if (onClick && typeof onClick === 'function') {
      onClick(e);
    }
  }, [onClick, loading, disabled]);

  const ButtonComponent = animated ? motion(Component) : Component;
  
  const motionProps = animated ? {
    whileHover: { scale: disabled || loading ? 1 : 1.02 },
    whileTap: { scale: disabled || loading ? 1 : 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  } : {};

  return (
    <ButtonComponent
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...motionProps}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </ButtonComponent>
  );
});

Button.displayName = 'Button';

export default Button;