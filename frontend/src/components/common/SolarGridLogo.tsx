import React from 'react';
import { Sun } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function SolarGridLogo({ size = 'md', variant = 'light' }: LogoProps) {
  const badgeSizes = {
    sm: 'h-8 w-8 rounded-xl',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-10 w-10 rounded-2xl',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const isDark = variant === 'dark';

  return (
    <div className="flex items-center gap-2.5 font-sans font-bold tracking-tight select-none">
      <span className={`grid ${badgeSizes[size]} place-items-center bg-slate-900 text-white shadow-md`}>
        <Sun size={iconSizes[size]} className="text-amber-400" />
      </span>

      <span className={`${textSizes[size]} font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        SolarGrid
      </span>
    </div>
  );
}
