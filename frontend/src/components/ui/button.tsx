'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20',
      secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700',
      outline: 'bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800',
      ghost: 'bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20',
      coral: 'bg-[#ff8a65] text-zinc-950 hover:bg-[#ff7a50] shadow-lg shadow-orange-500/10 font-semibold',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-white" />
        ) : null}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
