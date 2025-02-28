import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/hooks/useTranslation';
import '@/styles/pages/settings.css';

const Settings = React.forwardRef(({ className = '', ...props }, ref) => {
  const { darkMode, toggleTheme } = useTheme();
  const { t, language } = useTranslation();
  const [accounts, setAccounts] = useState({
    instagram: null,
    youtube: null,
    linkedin: null,
  });
  const [loading, setLoading] = useState({
    instagram: false,
    youtube: false,
    linkedin: false,
  });
  const [userPreferences, setUserPreferences] = useState({
    emailNotifications: false,
    pushNotifications: true,
    reportFrequency: 'weekly',
    email: '',
    language: language,
  });
  const [connectionStatus, setConnectionStatus] = useState({
    instagram: false,
    youtube: false,
    linkedin: false,
  });
  const [alerts, setAlerts] = useState({
    success: null,
    error: null,
  });

  // Buscar status das contas conectadas ao carregar o componente
  useEffect(() => {
    fetchAccountsStatus();
  }, []);

  // Função para buscar o status das contas conectadas
  const fetchAccountsStatus = async () => {
    try {
      // Verificar status do Instagram
      checkInstagramConnection();

      // Verificar status do YouTube
      checkYoutubeConnection();

      // Verificar status do LinkedIn
      checkLinkedinConnection();

    } catch (error) {
      console.error(t('settings.errors.accountsStatus'), error);
      showAlert('error', t('settings.alerts.error.accountsStatus'));
    }
  };

  // Verificar conexão com Instagram
  const checkInstagramConnection = async () => {
    setLoading(prev => ({ ...prev, instagram: true }));
    try {
      const profile = await instagramService.getProfile();
      if (profile && profile.id) {
        setAccounts(prev => ({
          ...prev,
          instagram: {
            id: profile.id,
            username: profile.username,
            profilePicture: profile.profile_picture_url,
            mediaCount: profile.media_count
          }
        }));
        setConnectionStatus(prev => ({ ...prev, instagram: true }));
      }
    } catch (error) {
      console.error(t('settings.errors.instagramConnection'), error);
      setConnectionStatus(prev => ({ ...prev, instagram: false }));
    } finally {
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };

  // Verificar conexão com YouTube
  const checkYoutubeConnection = async () => {
    setLoading(prev => ({ ...prev, youtube: true }));
    try {
      const channelData = await youtubeService.getChannel();
      if (channelData && channelData.id) {
        setAccounts(prev => ({
          ...prev,
          youtube: {
            id: channelData.id,
            name: channelData.snippet?.title,
            profilePicture: channelData.snippet?.thumbnails?.default?.url,
            subscribers: channelData.statistics?.subscriberCount,
            videos: channelData.statistics?.videoCount
          }
        }));
        setConnectionStatus(prev => ({ ...prev, youtube: true }));
      }
    } catch (error) {
      console.error(t('settings.errors.youtubeConnection'), error);
      setConnectionStatus(prev => ({ ...prev, youtube: false }));
    } finally {
      setLoading(prev => ({ ...prev, youtube: false }));
    }
  };

  // Verificar conexão com LinkedIn
  const checkLinkedinConnection = async () => {
    setLoading(prev => ({ ...prev, linkedin: true }));
    try {
      const profile = await linkedinService.getProfile();
      if (profile && profile.id) {
        const followers = await linkedinService.getFollowers();
        setAccounts(prev => ({
          ...prev,
          linkedin: {
            id: profile.id,
            name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
            profilePicture: profile.profilePicture?.displayImage,
            connections: followers?.count || 0,
            industry: profile.industry
          }
        }));
        setConnectionStatus(prev => ({ ...prev, linkedin: true }));
      }
    } catch (error) {
      console.error(t('settings.errors.linkedinConnection'), error);
      setConnectionStatus(prev => ({ ...prev, linkedin: false }));
    } finally {
      setLoading(prev => ({ ...prev, linkedin: false }));
    }
  };

  // Conectar conta do Instagram
  const connectInstagram = async () => {
    setLoading(prev => ({ ...prev, instagram: true }));
    try {
      // Simulação de autorização OAuth para Instagram
      // Em produção, usaria: window.location.href = instagramService.getAuthUrl();
      // Para fins de exemplo, vamos simular que a autorização já foi concedida
      const authResponse = await instagramService.authenticate();
      if (authResponse && authResponse.success) {
        await checkInstagramConnection();
        showAlert('success', t('settings.alerts.success.instagramConnected'));
      } else {
        throw new Error(t('settings.errors.instagramConnectionFailed'));
      }
    } catch (error) {
      console.error(t('settings.errors.connectInstagram'), error);
      showAlert('error', t('settings.alerts.error.instagramConnection'));
    } finally {
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };

  // Conectar conta do YouTube
  const connectYoutube = async () => {
    setLoading(prev => ({ ...prev, youtube: true }));
    try {
      // Simulação de autorização OAuth para YouTube
      // Em produção, usaria: window.location.href = youtubeService.getAuthUrl();
      const authResponse = await youtubeService.authenticate();
      if (authResponse && authResponse.success) {
        await checkYoutubeConnection();
        showAlert('success', t('settings.alerts.success.youtubeConnected'));
      } else {
        throw new Error(t('settings.errors.youtubeConnectionFailed'));
      }
    } catch (error) {
      console.error(t('settings.errors.connectYoutube'), error);
      showAlert('error', t('settings.alerts.error.youtubeConnection'));
    } finally {
      setLoading(prev => ({ ...prev, youtube: false }));
    }
  };

  // Conectar conta do LinkedIn
  const connectLinkedin = async () => {
    setLoading(prev => ({ ...prev, linkedin: true }));
    try {
      // Simulação de autorização OAuth para LinkedIn
      // Em produção, usaria: window.location.href = linkedinService.getAuthUrl();
      const authResponse = await linkedinService.authenticate();
      if (authResponse && authResponse.success) {
        await checkLinkedinConnection();
        showAlert('success', t('settings.alerts.success.linkedinConnected'));
      } else {
        throw new Error(t('settings.errors.linkedinConnectionFailed'));
      }
    } catch (error) {
      console.error(t('settings.errors.connectLinkedin'), error);
      showAlert('error', t('settings.alerts.error.linkedinConnection'));
    } finally {
      setLoading(prev => ({ ...prev, linkedin: false }));
    }
  };

  // Desconectar conta do Instagram
  const disconnectInstagram = async () => {
    setLoading(prev => ({ ...prev, instagram: true }));
    try {
      await instagramService.disconnect();
      setAccounts(prev => ({ ...prev, instagram: null }));
      setConnectionStatus(prev => ({ ...prev, instagram: false }));
      showAlert('success', t('settings.alerts.success.instagramDisconnected'));
    } catch (error) {
      console.error(t('settings.errors.disconnectInstagram'), error);
      showAlert('error', t('settings.alerts.error.instagramDisconnection'));
    } finally {
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };

  // Desconectar conta do YouTube
  const disconnectYoutube = async () => {
    setLoading(prev => ({ ...prev, youtube: true }));
    try {
      await youtubeService.disconnect();
      setAccounts(prev => ({ ...prev, youtube: null }));
      setConnectionStatus(prev => ({ ...prev, youtube: false }));
      showAlert('success', t('settings.alerts.success.youtubeDisconnected'));
    } catch (error) {
      console.error(t('settings.errors.disconnectYoutube'), error);
      showAlert('error', t('settings.alerts.error.youtubeDisconnection'));
    } finally {
      setLoading(prev => ({ ...prev, youtube: false }));
    }
  };

  // Desconectar conta do LinkedIn
  const disconnectLinkedin = async () => {
    setLoading(prev => ({ ...prev, linkedin: true }));
    try {
      await linkedinService.disconnect();
      setAccounts(prev => ({ ...prev, linkedin: null }));
      setConnectionStatus(prev => ({ ...prev, linkedin: false }));
      showAlert('success', t('settings.alerts.success.linkedinDisconnected'));
    } catch (error) {
      console.error(t('settings.errors.disconnectLinkedin'), error);
      showAlert('error', t('settings.alerts.error.linkedinDisconnection'));
    } finally {
      setLoading(prev => ({ ...prev, linkedin: false }));
    }
  };

  // Salvar preferências de usuário
  const saveUserPreferences = () => {
    try {
      // Aqui você implementaria a lógica para salvar as preferências no backend
      // Por enquanto, apenas simulamos o sucesso da operação
      showAlert('success', t('settings.alerts.success.preferencesSaved'));
    } catch (error) {
      console.error(t('settings.errors.savePreferences'), error);
      showAlert('error', t('settings.alerts.error.savePreferences'));
    }
  };

  // Exportar dados em CSV
  const exportCSV = async () => {
    try {
      // Aqui você implementaria a lógica para exportar os dados em CSV
      // Por exemplo, fazendo uma requisição ao backend para gerar o arquivo
      // E então fazendo o download do arquivo gerado
      const blob = new Blob(['id,name,platform,followers\n1,teste,Instagram,1000'], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'influencers_data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showAlert('success', t('settings.alerts.success.csvExport'));
    } catch (error) {
      console.error(t('settings.errors.csvExport'), error);
      showAlert('error', t('settings.alerts.error.csvExport'));
    }
  };

  // Exportar dados em PDF
  const exportPDF = async () => {
    try {
      // Aqui você implementaria a lógica para exportar os dados em PDF
      showAlert('success', t('settings.alerts.success.pdfExport'));
    } catch (error) {
      console.error(t('settings.errors.pdfExport'), error);
      showAlert('error', t('settings.alerts.error.pdfExport'));
    }
  };

  // Função auxiliar para exibir alertas
  const showAlert = (type, message) => {
    setAlerts({
      success: type === 'success' ? message : null,
      error: type === 'error' ? message : null
    });

    // Limpar alertas após 5 segundos
    setTimeout(() => {
      setAlerts({ success: null, error: null });
    }, 5000);
  };

  // Função para renderizar os detalhes da conta Instagram
  const renderInstagramAccount = () => {
    if (loading.instagram) {
      return <div className="loading-indicator">{t('settings.common.checkingConnection')}</div>;
    }

    if (connectionStatus.instagram && accounts.instagram) {
      return (
        <div className="account-details">
          <div className="account-info">
            <img
              src={accounts.instagram.profilePicture || 'https://via.placeholder.com/40'}
              alt={t('settings.accounts.instagram.profileAlt')}
              className="account-avatar"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
            />
            <div className="account-meta">
              <div className="account-name">{accounts.instagram.username}</div>
              <div className="account-stats">
                {accounts.instagram.mediaCount} {t('settings.accounts.instagram.posts')}
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={disconnectInstagram}
            disabled={loading.instagram}
            className="disconnect-btn"
          >
            {t('settings.common.disconnect')}
          </Button>
        </div>
      );
    }

    return (
      <div className="connect-account">
        <p>{t('settings.accounts.instagram.connectPrompt')}</p>
        <Button
          onClick={connectInstagram}
          disabled={loading.instagram}
          className="connect-btn instagram-btn"
        >
          {loading.instagram ? t('settings.common.connecting') : t('settings.accounts.instagram.connect')}
        </Button>
      </div>
    );
  };

  // Função para renderizar os detalhes da conta YouTube
  const renderYoutubeAccount = () => {
    if (loading.youtube) {
      return <div className="loading-indicator">{t('settings.common.checkingConnection')}</div>;
    }

    if (connectionStatus.youtube && accounts.youtube) {
      return (
        <div className="account-details">
          <div className="account-info">
            <img
              src={accounts.youtube.profilePicture || 'https://via.placeholder.com/40'}
              alt={t('settings.accounts.youtube.profileAlt')}
              className="account-avatar"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
            />
            <div className="account-meta">
              <div className="account-name">{accounts.youtube.name}</div>
              <div className="account-stats">
                {accounts.youtube.subscribers} {t('settings.accounts.youtube.subscribers')} • {accounts.youtube.videos} {t('settings.accounts.youtube.videos')}
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={disconnectYoutube}
            disabled={loading.youtube}
            className="disconnect-btn"
          >
            {t('settings.common.disconnect')}
          </Button>
        </div>
      );
    }

    return (
      <div className="connect-account">
        <p>{t('settings.accounts.youtube.connectPrompt')}</p>
        <Button
          onClick={connectYoutube}
          disabled={loading.youtube}
          className="connect-btn youtube-btn"
        >
          {loading.youtube ? t('settings.common.connecting') : t('settings.accounts.youtube.connect')}
        </Button>
      </div>
    );
  };

  // Função para renderizar os detalhes da conta LinkedIn
  const renderLinkedinAccount = () => {
    if (loading.linkedin) {
      return <div className="loading-indicator">{t('settings.common.checkingConnection')}</div>;
    }

    if (connectionStatus.linkedin && accounts.linkedin) {
      return (
        <div className="account-details">
          <div className="account-info">
            <img
              src={accounts.linkedin.profilePicture || 'https://via.placeholder.com/40'}
              alt={t('settings.accounts.linkedin.profileAlt')}
              className="account-avatar"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
            />
            <div className="account-meta">
              <div className="account-name">{accounts.linkedin.name}</div>
              <div className="account-stats">
                {accounts.linkedin.connections} {t('settings.accounts.linkedin.connections')} • {accounts.linkedin.industry}
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={disconnectLinkedin}
            disabled={loading.linkedin}
            className="disconnect-btn"
          >
            {t('settings.common.disconnect')}
          </Button>
        </div>
      );
    }

    return (
      <div className="connect-account">
        <p>{t('settings.accounts.linkedin.connectPrompt')}</p>
        <Button
          onClick={connectLinkedin}
          disabled={loading.linkedin}
          className="connect-btn linkedin-btn"
        >
          {loading.linkedin ? t('settings.common.connecting') : t('settings.accounts.linkedin.connect')}
        </Button>
      </div>
    );
  };

  return (
    <div className={`settings-container ${className}`} ref={ref} {...props}>
      <h1 className="settings-title">{t('settings.title')}</h1>

      {/* Alertas */}
      {alerts.success && (
        <Alert className="alert-success">
          <AlertDescription>{alerts.success}</AlertDescription>
        </Alert>
      )}

      {alerts.error && (
        <Alert className="alert-error">
          <AlertDescription>{alerts.error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="accounts" className="settings-tabs">
        <TabsList className="settings-tabs-list">
          <TabsTrigger value="accounts">{t('settings.tabs.accounts')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('settings.tabs.preferences')}</TabsTrigger>
          <TabsTrigger value="exports">{t('settings.tabs.exports')}</TabsTrigger>
        </TabsList>

        {/* Contas Conectadas */}
        <TabsContent value="accounts" className="settings-tabs-content">
          <Card className="settings-card">
            <CardHeader>
              <CardTitle>{t('settings.accounts.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="platforms-grid">
                <Card className="platform-card">
                  <CardHeader className="platform-header">
                    <div className="platform-title">
                      <div className="platform-icon instagram-icon"></div>
                      <h3>Instagram</h3>
                    </div>
                    <Badge variant={connectionStatus.instagram ? "success" : "outline"}>
                      {connectionStatus.instagram ? t('settings.common.connected') : t('settings.common.disconnected')}
                    </Badge>
                  </CardHeader>
                  <CardContent className="platform-content">
                    {renderInstagramAccount()}
                  </CardContent>
                </Card>

                <Card className="platform-card">
                  <CardHeader className="platform-header">
                    <div className="platform-title">
                      <div className="platform-icon youtube-icon"></div>
                      <h3>YouTube</h3>
                    </div>
                    <Badge variant={connectionStatus.youtube ? "success" : "outline"}>
                      {connectionStatus.youtube ? t('settings.common.connected') : t('settings.common.disconnected')}
                    </Badge>
                  </CardHeader>
                  <CardContent className="platform-content">
                    {renderYoutubeAccount()}
                  </CardContent>
                </Card>

                <Card className="platform-card">
                  <CardHeader className="platform-header">
                    <div className="platform-title">
                      <div className="platform-icon linkedin-icon"></div>
                      <h3>LinkedIn</h3>
                    </div>
                    <Badge variant={connectionStatus.linkedin ? "success" : "outline"}>
                      {connectionStatus.linkedin ? t('settings.common.connected') : t('settings.common.disconnected')}
                    </Badge>
                  </CardHeader>
                  <CardContent className="platform-content">
                    {renderLinkedinAccount()}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferências */}
        <TabsContent value="preferences" className="settings-tabs-content">
          <Card className="settings-card">
            <CardHeader>
              <CardTitle>{t('settings.preferences.appearance.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="theme-toggle">
                <span>{t('settings.preferences.appearance.darkMode')}</span>
                <Switch
                  checked={darkMode}
                  onCheckedChange={toggleTheme}
                  aria-label={t('settings.preferences.appearance.toggleTheme')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="settings-card">
            <CardHeader>
              <CardTitle>{t('settings.preferences.notifications.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="notification-settings">
                <div className="notification-option">
                  <div className="notification-label">
                    <span>{t('settings.preferences.notifications.email')}</span>
                  </div>
                  <Switch
                    checked={userPreferences.emailNotifications}
                    onCheckedChange={(checked) => setUserPreferences(prev => ({
                      ...prev,
                      emailNotifications: checked
                    }))}
                  />
                </div>

                {userPreferences.emailNotifications && (
                  <div className="notification-email">
                    <Input
                      type="email"
                      placeholder={t('settings.preferences.notifications.emailPlaceholder')}
                      value={userPreferences.email}
                      onChange={(e) => setUserPreferences(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                    />
                  </div>
                )}

                <div className="notification-option">
                  <div className="notification-label">
                    <span>{t('settings.preferences.notifications.push')}</span>
                  </div>
                  <Switch
                    checked={userPreferences.pushNotifications}
                    onCheckedChange={(checked) => setUserPreferences(prev => ({
                      ...prev,
                      pushNotifications: checked
                    }))}
                  />
                </div>

                <div className="notification-option">
                  <div className="notification-label">
                    <span>{t('settings.preferences.notifications.reportFrequency')}</span>
                  </div>
                  <select
                    value={userPreferences.reportFrequency}
                    onChange={(e) => setUserPreferences(prev => ({
                      ...prev,
                      reportFrequency: e.target.value
                    }))}
                    className="report-frequency-select"
                  >
                    <option value="daily">{t('settings.preferences.notifications.frequencies.daily')}</option>
                    <option value="weekly">{t('settings.preferences.notifications.frequencies.weekly')}</option>
                    <option value="monthly">{t('settings.preferences.notifications.frequencies.monthly')}</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={saveUserPreferences}
                className="save-preferences-btn"
              >
                {t('settings.preferences.saveButton')}
              </Button>
            </CardContent>
          </Card>

          <Card className="settings-card">
            <CardHeader>
              <CardTitle>{t('settings.preferences.language.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="language-settings">
                <select
                  value={userPreferences.language}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    language: e.target.value
                  }))}
                  className="language-select"
                >
                  <option value="pt">{t('settings.preferences.language.options.portuguese')}</option>
                  <option value="en">{t('settings.preferences.language.options.english')}</option>
                  <option value="es">{t('settings.preferences.language.options.spanish')}</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exportação */}
        <TabsContent value="exports" className="settings-tabs-content">
          <Card className="settings-card">
            <CardHeader>
              <CardTitle>{t('settings.exports.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="export-description">
                {t('settings.exports.description')}
              </p>

              <div className="export-options">
                <div className="export-option">
                  <h4>{t('settings.exports.csv.title')}</h4>
                  <p>{t('settings.exports.csv.description')}</p>
                  <Button onClick={exportCSV} className="export-btn">
                    {t('settings.exports.csv.button')}
                  </Button>
                </div>

                <div className="export-option">
                  <h4>{t('settings.exports.pdf.title')}</h4>
                  <p>{t('settings.exports.pdf.description')}</p>
                  <Button onClick={exportPDF} className="export-btn">
                    {t('settings.exports.pdf.button')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

Settings.displayName = 'Settings';

export default Settings;