import React, { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Verificar preferência salva ou preferência do sistema
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved ? saved : prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    // Atualizar classe no documento
    document.documentElement.setAttribute('data-theme', theme);
    // Salvar preferência
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


/* Funcionalidades:
- Gerenciamento de tema claro/escuro
- Persistência da preferência
- Detecção de preferência do sistema
- Hook personalizado para fácil acesso
*/