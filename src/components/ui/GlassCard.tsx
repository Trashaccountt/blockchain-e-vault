
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'dark' | 'light';
  hover?: boolean;
  className?: string;
}

const GlassCard = ({
  children,
  variant = 'default',
  hover = true,
  className,
  ...props
}: GlassCardProps) => {
  const variantClasses = {
    default: 'glass-card',
    dark: 'glass-card bg-gray-900/30 border-gray-800/20 text-white',
    light: 'glass-card bg-white/80 border-white/30',
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        hover ? 'hover:shadow-glass-hover hover:-translate-y-1' : '',
        'transition-all duration-300 ease-in-out animate-scale-in',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
