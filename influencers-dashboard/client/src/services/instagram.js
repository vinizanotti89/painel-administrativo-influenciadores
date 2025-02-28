import axios from 'axios';
import { errorService } from '@/services/errorService';

/**
 * Cliente Axios configurado para a API do Instagram
 */
const instagramApi = axios.create({
  baseURL: 'https://graph.instagram.com',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN}`
  },
  timeout: 10000 // 10 segundos de timeout
});

/**
 * Serviço para interação com a API do Instagram
 * Separa a lógica de negócio do componente de apresentação
 */
class InstagramService {
  /**
   * Testa a conexão com a API do Instagram
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
      const normalizedError = errorService.normalizeError(error, 'instagram');
      throw new Error(normalizedError.message);
    }
  }

  /**
   * Recupera dados básicos do perfil do usuário autenticado
   * @returns {Promise<Object>} Dados do perfil do usuário
   */
  async getProfile() {
    try {
      const { data } = await instagramApi.get(`/me`, {
        params: {
          fields: 'id,username,media_count,account_type'
        }
      });
      return data;
    } catch (error) {
      console.error('Error fetching Instagram profile:', error);
      const normalizedError = errorService.normalizeError(error, 'instagram');
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
      return ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'];
    } catch (error) {
      console.error('Error fetching Instagram permissions:', error);
      const normalizedError = errorService.normalizeError(error, 'instagram');
      throw normalizedError;
    }
  }

  /**
   * Recupera insights de uma mídia específica
   * @param {string} mediaId - ID da mídia
   * @returns {Promise<Object>} Dados de insights da mídia
   */
  async getMediaInsights(mediaId) {
    try {
      const { data } = await instagramApi.get(`/${mediaId}/insights`, {
        params: {
          metric: 'engagement,impressions,reach'
        }
      });
      return data;
    } catch (error) {
      console.error('Error fetching media insights:', error);
      const normalizedError = errorService.normalizeError(error, 'instagram');
      throw normalizedError;
    }
  }

  /**
   * Recupera as mídias do usuário autenticado
   * @returns {Promise<Array>} Lista de mídias do usuário
   */
  async getUserMedia() {
    try {
      const { data } = await instagramApi.get('/me/media', {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count'
        }
      });
      return data;
    } catch (error) {
      console.error('Error fetching user media:', error);
      const normalizedError = errorService.normalizeError(error, 'instagram');
      throw normalizedError;
    }
  }

  /**
   * Recupera dados de um perfil de Instagram por nome de usuário
   * Observação: Isso requer permissões específicas e integração com a API Graph
   * @param {string} username - Nome de usuário do Instagram
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
        followersCount: 10000,
        postsCount: 150,
        engagement: 3.2
      };
    } catch (error) {
      console.error(`Error fetching Instagram profile for ${username}:`, error);
      const normalizedError = errorService.normalizeError(error, 'instagram');
      throw normalizedError;
    }
  }

  /**
   * Analisa um perfil de influenciador
   * @param {string} username - Nome de usuário do Instagram
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
              '18-24': 35,
              '25-34': 45,
              '35-44': 15,
              '45+': 5
            },
            genderSplit: {
              male: 40,
              female: 60
            },
            topCountries: [
              { name: 'Brasil', percentage: 75 },
              { name: 'Portugal', percentage: 10 },
              { name: 'Estados Unidos', percentage: 5 }
            ]
          }
        }
      };
    } catch (error) {
      console.error(`Error analyzing Instagram influencer ${username}:`, error);
      const normalizedError = errorService.normalizeError(error, 'instagram');
      throw normalizedError;
    }
  }
}

// Exporta uma única instância do serviço para uso em toda a aplicação
export const instagramService = new InstagramService();

export default instagramService;
