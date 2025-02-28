import React, { useEffect } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import useAsyncState from '@/hooks/useAsyncState';
import { useLanguage } from '@/contexts/LanguageContext';
import { errorService } from '@/services/errorService';
import '@/styles/components/auth/AuthCallback.css';

const AuthCallback = React.forwardRef(({ className = '', ...props }, ref) => {
    const { language } = useLanguage();

    const texts = {
        pt: {
            title: 'Autenticação em andamento',
            processing: 'Processando sua autenticação...',
            success: 'Autenticação realizada com sucesso!',
            redirecting: 'Redirecionando para a página principal...',
            error: 'Ocorreu um erro durante a autenticação',
            backToHome: 'Voltar para o início',
            authCodeNotFound: 'Código de autorização não encontrado. Tente novamente.'
        },
        en: {
            title: 'Authentication in progress',
            processing: 'Processing your authentication...',
            success: 'Authentication successful!',
            redirecting: 'Redirecting to the main page...',
            error: 'An error occurred during authentication',
            backToHome: 'Back to home',
            authCodeNotFound: 'Authorization code not found. Please try again.'
        }
    };

    const t = texts[language];

    // Usando o hook unificado de estado assíncrono
    const {
        loading,
        error,
        execute: processAuth,
        isSuccess,
        isError,
        setData
    } = useAsyncState(async () => {
        // Obtém parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const urlError = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Se houver erro na URL
        if (urlError) {
            throw new Error(errorDescription || urlError);
        }

        // Se não houver código
        if (!code) {
            throw new Error(t.authCodeNotFound);
        }

        // Simular sucesso na autenticação para fins de demonstração
        // Em um ambiente real, você trocaria o código por token através de uma API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redireciona para a página principal após pequeno delay
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);

        return { success: true };
    }, {
        errorCategory: errorService.ERROR_CATEGORIES.AUTH,
        onError: (err) => {
            errorService.reportError('auth_callback_error', err, {
                component: 'AuthCallback',
                url: window.location.href
            });
        }
    });

    useEffect(() => {
        processAuth();
    }, [processAuth]);

    return (
        <div className={`auth-callback-container ${className}`} ref={ref} {...props}>
            <div className="auth-callback-card">
                <h1 className="auth-callback-title">
                    {t.title}
                </h1>

                {loading && (
                    <div className="auth-callback-processing">
                        <Loader className="auth-callback-spinner" />
                        <p className="auth-callback-processing-message">
                            {t.processing}
                        </p>
                    </div>
                )}

                {isSuccess && (
                    <div className="auth-callback-success">
                        <div className="auth-callback-success-icon-container">
                            <CheckCircle className="auth-callback-success-icon" />
                        </div>
                        <Alert className="auth-callback-success-alert">
                            <AlertDescription className="auth-callback-success-message">
                                {t.success}
                            </AlertDescription>
                        </Alert>
                        <p className="auth-callback-redirect-message">
                            {t.redirecting}
                        </p>
                    </div>
                )}

                {isError && (
                    <div className="auth-callback-error">
                        <Alert variant="destructive" className="auth-callback-error-alert">
                            <AlertCircle className="auth-callback-error-icon" />
                            <AlertDescription className="auth-callback-error-message">
                                {error?.message || t.error}
                            </AlertDescription>
                        </Alert>
                        <div className="auth-callback-error-action">
                            <Button
                                onClick={() => window.location.href = '/'}
                                className="auth-callback-error-button"
                            >
                                {t.backToHome}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

AuthCallback.displayName = 'AuthCallback';

export default AuthCallback;