import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className,
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    gray: 'text-gray-600 dark:text-gray-400',
  };

  const SpinnerComponent = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <motion.div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-current',
          sizeClasses[size],
          colorClasses[color]
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <motion.p 
          className="mt-3 text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div 
        className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {SpinnerComponent}
      </motion.div>
    );
  }

  return SpinnerComponent;
};

// Pulse loading animation for skeleton states
export const PulseLoader = ({ className, lines = 3, height = 'h-4' }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        className={cn('bg-gray-200 dark:bg-gray-700 rounded animate-pulse', height)}
        style={{ width: `${Math.random() * 40 + 60}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      />
    ))}
  </div>
);

// Dots loading animation
export const DotsLoader = ({ className, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    gray: 'bg-gray-400',
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('w-2 h-2 rounded-full', colorClasses[color])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;