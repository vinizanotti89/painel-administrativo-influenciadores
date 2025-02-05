import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
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
            <button 
              className="theme-toggle-button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            >
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;