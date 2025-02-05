import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export { useTheme }

/* Funcionalidades:
- Hook para acessar o ThemeContext
- Validação de uso dentro do Provider
- Reutilizável em toda aplicação
*/