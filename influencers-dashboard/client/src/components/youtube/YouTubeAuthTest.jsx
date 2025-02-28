import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useAsyncState from '@/hooks/useAsyncState';
import { youtubeService } from '@/services/youtube';
import { useLanguage } from '@/contexts/LanguageContext';
import { errorService } from '@/services/errorService';
import '@/styles/components/youtube/YouTubeAuthTest.css';

const YouTubeAuthTest = React.forwardRef(({ className = '', ...props }, ref) => {
    const { language } = useLanguage();

    // Usando o hook unificado de estado assíncrono
    const {
        data,
        loading,
        error,
        execute: testConnection,
        isSuccess,
        isError
    } = useAsyncState(async () => youtubeService.searchChannel('Google'), {
        platform: 'youtube',
        errorCategory: errorService.ERROR_CATEGORIES.API,
        onError: (err) => {
            errorService.reportError('youtube_connection_error', err, { component: 'YouTubeAuthTest' });
        }
    });

    useEffect(() => {
        testConnection();
    }, [testConnection]);

    const texts = {
        pt: {
            title: 'Teste de Autenticação da API YouTube',
            testing: 'Testando conexão com a API...',
            success: 'Conexão estabelecida com sucesso!',
            channelData: 'Dados do Canal:',
            subscribers: 'inscritos',
            views: 'Visualizações:',
            videos: 'Vídeos:',
            engagement: 'Engajamento:',
            errorPrefix: 'Erro ao conectar com a API:'
        },
        en: {
            title: 'YouTube API Authentication Test',
            testing: 'Testing API connection...',
            success: 'Connection established successfully!',
            channelData: 'Channel Data:',
            subscribers: 'subscribers',
            views: 'Views:',
            videos: 'Videos:',
            engagement: 'Engagement:',
            errorPrefix: 'Error connecting to API:'
        }
    };

    const t = texts[language];

    return (
        <div className={`youtube-auth-container ${className}`} ref={ref} {...props}>
            <h2 className="youtube-auth-title">{t.title}</h2>

            {loading && (
                <div className="youtube-auth-pending">
                    <div className="youtube-auth-spinner"></div>
                    <span>{t.testing}</span>
                </div>
            )}

            {isSuccess && data && (
                <>
                    <Alert className="youtube-auth-success-alert">
                        <CheckCircle className="youtube-auth-success-icon" />
                        <AlertDescription className="youtube-auth-success-message">
                            {t.success}
                        </AlertDescription>
                    </Alert>

                    <div className="youtube-auth-card">
                        <div className="youtube-auth-card-header">
                            <h3 className="youtube-auth-card-title">{t.channelData}</h3>
                        </div>
                        <div className="youtube-auth-card-content">
                            <div className="youtube-auth-channel-info">
                                {data?.thumbnailUrl && (
                                    <img
                                        src={data.thumbnailUrl}
                                        alt="Canal"
                                        className="youtube-auth-channel-image"
                                    />
                                )}
                                <div className="youtube-auth-channel-details">
                                    <h3 className="youtube-auth-channel-name">{data?.channelName}</h3>
                                    <p className="youtube-auth-channel-subscribers">{data?.statistics?.followers} {t.subscribers}</p>
                                </div>
                            </div>

                            <div className="youtube-auth-stats-grid">
                                <div className="youtube-auth-stat-item">{t.views} {data?.statistics?.views}</div>
                                <div className="youtube-auth-stat-item">{t.videos} {data?.statistics?.videos}</div>
                                <div className="youtube-auth-stat-item">{t.engagement} {data?.statistics?.engagement}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {isError && (
                <Alert variant="destructive" className="youtube-auth-error">
                    <AlertCircle className="youtube-auth-error-icon" />
                    <AlertDescription className="youtube-auth-error-message">
                        {t.errorPrefix} {error?.message || 'Erro desconhecido'}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
});

YouTubeAuthTest.displayName = 'YouTubeAuthTest';

export default YouTubeAuthTest;