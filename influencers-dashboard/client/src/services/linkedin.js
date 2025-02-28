import axios from 'axios';
import { errorService } from '@/services/errorService';

/**
 * Cliente Axios configurado para a API do LinkedIn
 */
const linkedinApi = axios.create({
    baseURL: 'https://api.linkedin.com/v2',
    headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_LINKEDIN_ACCESS_TOKEN}`,
        'X-Li-Format': 'json',
        'X-Restli-Protocol-Version': '2.0.0'
    },
    timeout: 10000 // 10 segundos de timeout
});

/**
 * Serviço para interação com a API do LinkedIn
 * Separa a lógica de negócio do componente de apresentação
 */
class LinkedinService {
    /**
     * Testa a conexão com a API do LinkedIn
     * @returns {Promise<Object>} Dados do perfil do usuário e permissões
     * @throws {Error} Erro de conexão ou autenticação
     */
    async testConnection() {
        try {
            // Tenta obter os dados do perfil para verificar se a conexão está funcionando
            const profile = await this.getProfile();
            const permissions = await this.getPermissions();

            return {
                ...profile,
                permissions
            };
        } catch (error) {
            const normalizedError = errorService.normalizeError(error, 'linkedin');
            throw new Error(normalizedError.message);
        }
    }

    /**
     * Recupera dados básicos do perfil do usuário autenticado
     * @returns {Promise<Object>} Dados do perfil do usuário
     */
    async getProfile() {
        try {
            const { data } = await linkedinApi.get(`/me`, {
                params: {
                    fields: 'id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams)'
                }
            });
            return data;
        } catch (error) {
            console.error('Error fetching LinkedIn profile:', error);
            const normalizedError = errorService.normalizeError(error, 'linkedin');
            throw normalizedError;
        }
    }

    /**
     * Recupera as permissões atuais da aplicação
     * @returns {Promise<Array<string>>} Lista de permissões ativas
     */
    async getPermissions() {
        try {
            // Em uma implementação real, você recuperaria as permissões da API
            // Como exemplo, retornamos um conjunto fixo de permissões
            return ['r_basicprofile', 'r_organization_social', 'w_member_social'];
        } catch (error) {
            console.error('Error fetching LinkedIn permissions:', error);
            const normalizedError = errorService.normalizeError(error, 'linkedin');
            throw normalizedError;
        }
    }

    /**
     * Recupera as postagens recentes do usuário
     * @returns {Promise<Array>} Lista de postagens do usuário
     */
    async getPosts() {
        try {
            const { data } = await linkedinApi.get('/ugcPosts', {
                params: {
                    q: 'authors',
                    authors: `urn:li:person:${import.meta.env.VITE_LINKEDIN_USER_ID}`
                }
            });
            return data;
        } catch (error) {
            console.error('Error fetching LinkedIn posts:', error);
            const normalizedError = errorService.normalizeError(error, 'linkedin');
            throw normalizedError;
        }
    }

    /**
     * Recupera analytics de uma postagem específica
     * @param {string} postId - ID da postagem
     * @returns {Promise<Object>} Dados de analytics da postagem
     */
    async getPostAnalytics(postId) {
        try {
            const { data } = await linkedinApi.get(`/socialMetrics/${postId}`);
            return data;
        } catch (error) {
            console.error('Error fetching post analytics:', error);
            const normalizedError = errorService.normalizeError(error, 'linkedin');
            throw normalizedError;
        }
    }

    /**
     * Recupera dados de um perfil de LinkedIn por nome de usuário
     * Observação: Isso requer permissões específicas e integração com a API Graph
     * @param {string} username - Nome de usuário do LinkedIn
     * @returns {Promise<Object>} Dados do perfil
     */
    async getProfileByUsername(username) {
        try {
            // Em uma implementação real, você faria uma busca pelo username
            // Como exemplo, simulamos uma resposta com dados fictícios
            if (!username) {
                throw new Error('Nome de usuário é obrigatório');
            }

            // Simula um atraso de rede
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                id: `${username}_id`,
                username,
                fullName: `${username} Nome Completo`,
                followersCount: 5000,
                postsCount: 120,
                engagement: 2.8
            };
        } catch (error) {
            console.error(`Error fetching LinkedIn profile for ${username}:`, error);
            const normalizedError = errorService.normalizeError(error, 'linkedin');
            throw normalizedError;
        }
    }

    /**
     * Analisa um perfil de influenciador
     * @param {string} username - Nome de usuário do LinkedIn
     * @returns {Promise<Object>} Análise completa do perfil
     */
    async analyzeInfluencer(username) {
        try {
            const profile = await this.getProfileByUsername(username);

            // Em uma implementação real, você faria mais chamadas para obter
            // dados adicionais e análises do perfil

            return {
                ...profile,
                analysisDate: new Date().toISOString(),
                trustScore: Math.floor(Math.random() * 100),
                engagement: (Math.random() * 5 + 1).toFixed(2),
                audience: {
                    demographics: {
                        ageGroups: {
                            '18-24': 15,
                            '25-34': 40,
                            '35-44': 30,
                            '45+': 15
                        },
                        genderSplit: {
                            male: 55,
                            female: 45
                        },
                        topIndustries: [
                            { name: 'Tecnologia', percentage: 35 },
                            { name: 'Marketing', percentage: 25 },
                            { name: 'Finanças', percentage: 15 }
                        ]
                    }
                }
            };
        } catch (error) {
            console.error(`Error analyzing LinkedIn influencer ${username}:`, error);
            const normalizedError = errorService.normalizeError(error, 'linkedin');
            throw normalizedError;
        }
    }
}

// Exporta uma única instância do serviço para uso em toda a aplicação
export const linkedinService = new LinkedinService();

export default linkedinService;