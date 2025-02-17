import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/layout/Header.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-title">
            <h1>Dashboard de Influenciadores</h1>
          </div>
          <div className="header-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="theme-toggle-button"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Tema Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Tema Claro</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;