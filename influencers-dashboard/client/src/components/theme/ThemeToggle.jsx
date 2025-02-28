import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import '@/styles/theme/themeToggle.css';

const ThemeToggle = React.forwardRef(({ className = '', ...props }, ref) => {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const texts = {
    pt: {
      dark: 'Tema Escuro',
      light: 'Tema Claro'
    },
    en: {
      dark: 'Dark Theme',
      light: 'Light Theme'
    }
  };

  const t = texts[language];

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`theme-toggle-button ${className}`}
      ref={ref}
      {...props}
    >
      {theme === 'light' ? (
        <>
          <Moon className="theme-toggle-icon" />
          <span className="theme-toggle-text">{t.dark}</span>
        </>
      ) : (
        <>
          <Sun className="theme-toggle-icon" />
          <span className="theme-toggle-text">{t.light}</span>
        </>
      )}
    </Button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export { ThemeToggle };