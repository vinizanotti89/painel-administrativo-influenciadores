import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import '@/styles/pages/Settings.css';

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="settings-container">
      <h2 className="settings-title">
        Configurações
      </h2>

      <Card className="settings-card">
        <div className="settings-card-header">
          <h3>Preferências de Tema</h3>
        </div>
        <div className="settings-card-content">
          <div className="theme-toggle">
            <span>Modo Escuro</span>
            <Button
              onClick={toggleTheme}
              variant="secondary"
            >
              {darkMode ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="settings-card">
        <div className="settings-card-header">
          <h3>Notificações</h3>
        </div>
        <div className="settings-card-content">
          <div className="notification-settings">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="emailNotif"
                className="notification-checkbox"
              />
              <label
                htmlFor="emailNotif"
                className="checkbox-label"
              >
                Receber notificações por email
              </label>
            </div>
            <Input
              label="Email para notificações"
              type="email"
              placeholder="seu@email.com"
              className="email-input"
            />
          </div>
        </div>
      </Card>

      <Card className="settings-card">
        <div className="settings-card-header">
          <h3>Exportação de Dados</h3>
        </div>
        <div className="settings-card-content">
          <p className="export-description">
            Exporte seus dados em diferentes formatos
          </p>
          <div className="export-options">
            <Button variant="secondary">
              Exportar CSV
            </Button>
            <Button variant="secondary">
              Exportar PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;