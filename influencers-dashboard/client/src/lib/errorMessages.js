import { useLanguage } from '@/contexts/LanguageContext';
import {
    ERROR_CATEGORIES,
    DEFAULT_MESSAGES,
    FIELD_VALIDATION,
    SOCIAL_MEDIA,
    ASYNC_OPERATIONS,
    API_ERROR_CODES,
    getErrorMessage as getErrorMessageOriginal,
    validateSocialMedia,
    normalizeApiError,
    mapApiError
} from './errorMessages';

/**
 * Serviço centralizado para gerenciamento de erros
 * Integra o sistema de mensagens existente com funções de processamento e relato
 */
class ErrorService {
    constructor() {
        this.ERROR_CATEGORIES = ERROR_CATEGORIES;
        this.DEFAULT_MESSAGES = DEFAULT_MESSAGES;
        this.FIELD_VALIDATION = FIELD_VALIDATION;
        this.SOCIAL_MEDIA = SOCIAL_MEDIA;
        this.ASYNC_OPERATIONS = ASYNC_OPERATIONS;
        this.API_ERROR_CODES = API_ERROR_CODES;
    }

    /**
     * Retorna a mensagem de erro traduzida com base no código ou objeto de erro
     * @param {Error|string} error - Erro ou código de erro
     * @param {string} category - Categoria de erro (opcional)
     * @param {Object} params - Parâmetros adicionais para personalização da mensagem
     * @returns {string} Mensagem de erro traduzida
     */
    getErrorMessage(error, category, params) {
        const { language } = useLanguage?.() || { language: 'pt' };

        // Nenhum erro fornecido, retorna a mensagem padrão
        if (!error) {
            return this.DEFAULT_MESSAGES[category || this.ERROR_CATEGORIES.GENERAL];
        }

        // Se for código/string específico, usa a função existente
        if (typeof error === 'string') {
            return getErrorMessageOriginal(error, category, params);
        }

        // Se for objeto de erro com código conhecido, mapeia para mensagem
        if (error.code && params?.platform) {
            const mappedError = mapApiError(error, params.platform);
            return mappedError.message;
        }

        // Retorna a mensagem do erro ou a mensagem padrão
        return error.message || this.DEFAULT_MESSAGES[category || this.ERROR_CATEGORIES.GENERAL];
    }

    /**
     * Registra e reporta erros para um sistema de monitoramento
     * @param {string} errorCode - Código do erro
     * @param {Error} error - Objeto de erro
     * @param {Object} metadata - Metadados adicionais para logging
     */
    reportError(errorCode, error, metadata = {}) {
        console.error(`[${errorCode}]`, error, metadata);

        // Aqui seria feita a integração com um serviço de monitoramento como Sentry, 
        // LogRocket, etc.

        // Exemplo: sentryService.captureException(error, { tags: { code: errorCode, ...metadata } });
    }

    /**
     * Normaliza erros de API para formato padronizado 
     * @param {Error} error - Erro original
     * @param {string} platform - Plataforma (instagram, youtube, linkedin)
     * @returns {Object} Erro normalizado
     */
    normalizeError(error, platform) {
        if (platform) {
            return mapApiError(error, platform);
        }
        return {
            code: error?.code || 'UNKNOWN',
            message: normalizeApiError(error)
        };
    }

    /**
     * Valida campos de entrada para redes sociais
     * @param {string} platform - Nome da plataforma (instagram, youtube, linkedin)
     * @param {string} value - Valor a ser validado
     * @returns {string|null} Mensagem de erro ou null se válido
     */
    validateSocialInput(platform, value) {
        return validateSocialMedia(platform, value);
    }

    /**
     * Verifica se um erro é devido a problemas de rede
     * @param {Error} error - Objeto de erro
     * @returns {boolean} Verdadeiro se for um erro de rede
     */
    isNetworkError(error) {
        if (!error) return false;

        return (
            error.message?.includes('network') ||
            error.message?.includes('internet') ||
            error.message?.includes('offline') ||
            error.message?.includes('connection') ||
            error.code === 'NETWORK_ERROR' ||
            error.code === 'ECONNABORTED'
        );
    }

    /**
     * Verifica se um erro é devido a problemas de autenticação
     * @param {Error} error - Objeto de erro
     * @returns {boolean} Verdadeiro se for um erro de autenticação
     */
    isAuthError(error) {
        if (!error) return false;

        return (
            error.message?.includes('auth') ||
            error.message?.includes('token') ||
            error.message?.includes('expired') ||
            error.message?.includes('unauthorized') ||
            error.code === 'UNAUTHORIZED' ||
            error.status === 401
        );
    }
}

export const errorService = new ErrorService();

// Exporta também as funções e constantes originais para compatibilidade
export {
    ERROR_CATEGORIES,
    DEFAULT_MESSAGES,
    FIELD_VALIDATION,
    SOCIAL_MEDIA,
    ASYNC_OPERATIONS,
    API_ERROR_CODES,
    getErrorMessageOriginal as getErrorMessage,
    validateSocialMedia,
    normalizeApiError,
    mapApiError
};