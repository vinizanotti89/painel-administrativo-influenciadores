import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useAsyncState from '@/hooks/useAsyncState';
import { linkedinService } from '@/services/linkedin';
import { useLanguage } from '@/contexts/LanguageContext';
import { errorService } from '@/services/errorService';
import '@/styles/components/linkedin/LinkedinAuthTest.css';

const LinkedinAuthTest = React.forwardRef(({ className = '', ...props }, ref) => {
    const { language } = useLanguage();

    // Usando o hook unificado de estado assíncrono
    const {
        data,
        loading,
        error,
        execute: testConnection,
        isSuccess,
        isError
    } = useAsyncState(linkedinService.testConnection.bind(linkedinService), {
        platform: 'linkedin',
        errorCategory: errorService.ERROR_CATEGORIES.API,
        onError: (err) => {
            errorService.reportError('linkedin_connection_error', err, { component: 'LinkedinAuthTest' });
        }
    });

    useEffect(() => {
        testConnection();
    }, [testConnection]);

    const texts = {
        pt: {
            title: 'Teste de Autenticação da API LinkedIn',
            testing: 'Testando conexão com a API...',
            success: 'Conexão estabelecida com sucesso!',
            profileData: 'Dados do perfil:',
            permissions: 'Permissões ativas:',
            errorPrefix: 'Erro ao conectar com a API:'
        },
        en: {
            title: 'LinkedIn API Authentication Test',
            testing: 'Testing API connection...',
            success: 'Connection established successfully!',
            profileData: 'Profile data:',
            permissions: 'Active permissions:',
            errorPrefix: 'Error connecting to API:'
        }
    };

    const t = texts[language];

    return (
        <div className={`linkedin-auth-container ${className}`} ref={ref} {...props}>
            <h2 className="linkedin-auth-title">{t.title}</h2>

            {loading && (
                <div className="linkedin-auth-pending">
                    <div className="linkedin-auth-spinner"></div>
                    <span>{t.testing}</span>
                </div>
            )}

            {isSuccess && data && (
                <>
                    <Alert className="linkedin-auth-success-alert">
                        <CheckCircle className="linkedin-auth-success-icon" />
                        <AlertDescription className="linkedin-auth-success-message">
                            {t.success}
                        </AlertDescription>
                    </Alert>

                    <div className="linkedin-auth-data-container">
                        <h3 className="linkedin-auth-data-title">{t.profileData}</h3>
                        <pre className="linkedin-auth-data-content">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>

                    {data.permissions && (
                        <div className="linkedin-auth-permissions">
                            <h3 className="linkedin-auth-permissions-title">{t.permissions}</h3>
                            <ul className="linkedin-auth-permissions-list">
                                {data.permissions.map(permission => (
                                    <li key={permission}>{permission}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}

            {isError && (
                <Alert variant="destructive" className="linkedin-auth-error">
                    <AlertCircle className="linkedin-auth-error-icon" />
                    <AlertDescription className="linkedin-auth-error-message">
                        {t.errorPrefix} {error?.message || 'Erro desconhecido'}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
});

LinkedinAuthTest.displayName = 'LinkedinAuthTest';

export default LinkedinAuthTest;