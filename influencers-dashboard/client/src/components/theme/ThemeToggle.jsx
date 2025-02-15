import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext'; // Atualizado para importar direto do contexto

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-28 h-10 flex items-center justify-center gap-2"
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
  );
};

export default ThemeToggle;