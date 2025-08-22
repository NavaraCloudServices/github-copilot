import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ 
  children, 
  className,
  hover = false,
  animated = true,
  padding = 'default',
  accent = false,
  ...props 
}, ref) => {
  const baseClasses = 'bg-white dark:bg-github-dark-gray border border-github-light-gray dark:border-gray-800 shadow-sm relative';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer' : '';
  
  const classes = cn(
    baseClasses,
    paddingClasses[padding],
    hoverClasses,
    'rounded-lg transition-all duration-200',
    className
  );

  const CardComponent = animated ? motion.div : 'div';
  
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
    ...(hover && {
      whileHover: { y: -2, transition: { duration: 0.2 } }
    })
  } : {};

  return (
    <CardComponent
      ref={ref}
      className={classes}
      {...motionProps}
      {...props}
    >
      {accent && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-navara-blue rounded-l-lg"></div>
      )}
      {children}
    </CardComponent>
  );
});

Card.displayName = 'Card';

// Card subcomponents
export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-github-dark-gray dark:text-white', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('mt-4 pt-4 border-t border-github-light-gray dark:border-gray-800', className)} {...props}>
    {children}
  </div>
);

export default Card;