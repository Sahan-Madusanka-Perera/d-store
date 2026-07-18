'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch — render a placeholder until mounted
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-zinc-300"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" strokeWidth={1.5} />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200 overflow-hidden"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={`h-5 w-5 absolute inset-0 m-auto transition-all duration-500 ease-in-out ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
        strokeWidth={1.5}
      />
      <Moon
        className={`h-5 w-5 absolute inset-0 m-auto transition-all duration-500 ease-in-out ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
        strokeWidth={1.5}
      />
    </Button>
  );
}
