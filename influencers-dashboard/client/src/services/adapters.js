/**
 * Módulo de adaptadores para padronizar os dados de diferentes plataformas
 * Converte as respostas específicas de cada API em um formato unificado
 */

/**
 * Adapta dados da API do Instagram para o formato padrão do dashboard
 * @param {Object} rawData - Dados brutos retornados pela API do Instagram
 * @returns {Object} Dados formatados no padrão do dashboard
 */
export const adaptInstagramData = (rawData) => {
  if (!rawData) return null;

  return {
    id: rawData.id,
    username: rawData.username,
    platform: 'Instagram',
    followers: rawData.media_count,
    metrics: {
      posts: rawData.media_count,
      engagement: rawData.engagement_rate || 0
    },
    trustScore: rawData.trustScore,
    analysisDate: rawData.analysisDate,
    audience: rawData.audience,
    rawData
  };
};

/**
 * Adapta dados da API do YouTube para o formato padrão do dashboard
 * @param {Object} rawData - Dados brutos retornados pela API do YouTube
 * @returns {Object} Dados formatados no padrão do dashboard
 */
export const adaptYoutubeData = (rawData) => {
  if (!rawData) return null;

  // Se os dados vierem no formato de resposta da API direta
  if (rawData.items && rawData.items.length > 0) {
    const channel = rawData.items[0];
    return {
      id: channel.id,
      username: channel.snippet.title,
      platform: 'YouTube',
      followers: parseInt(channel.statistics.subscriberCount) || 0,
      metrics: {
        views: parseInt(channel.statistics.viewCount) || 0,
        videos: parseInt(channel.statistics.videoCount) || 0,
        engagement: calculateYoutubeEngagement(channel.statistics)
      },
      thumbnailUrl: channel.snippet?.thumbnails?.default?.url,
      rawData: channel
    };
  }

  // Se os dados já vierem pré-processados pelo serviço
  return {
    id: rawData.channelId || rawData.id,
    username: rawData.channelName,
    platform: 'YouTube',
    followers: rawData.statistics?.followers,
    metrics: {
      views: rawData.statistics?.views,
      videos: rawData.statistics?.videos,
      engagement: rawData.statistics?.engagement
    },
    thumbnailUrl: rawData.thumbnailUrl,
    trustScore: rawData.trustScore,
    analysisDate: rawData.analysisDate,
    audience: rawData.audience,
    rawData
  };
};

/**
 * Adapta dados da API do LinkedIn para o formato padrão do dashboard
 * @param {Object} rawData - Dados brutos retornados pela API do LinkedIn
 * @returns {Object} Dados formatados no padrão do dashboard
 */
export const adaptLinkedinData = (rawData) => {
  if (!rawData) return null;

  return {
    id: rawData.id,
    username: rawData.username || `${rawData.localizedFirstName} ${rawData.localizedLastName}`,
    fullName: rawData.fullName || `${rawData.localizedFirstName} ${rawData.localizedLastName}`,
    platform: 'LinkedIn',
    followers: rawData.followersCount || 0,
    metrics: {
      posts: rawData.postsCount || 0,
      engagement: rawData.engagement || 0
    },
    trustScore: rawData.trustScore,
    analysisDate: rawData.analysisDate,
    audience: rawData.audience,
    rawData
  };
};

/**
 * Calcula a taxa de engajamento para um canal do YouTube
 * @param {Object} statistics - Estatísticas do canal do YouTube
 * @returns {string} Taxa de engajamento formatada com 2 casas decimais
 */
const calculateYoutubeEngagement = (statistics) => {
  const subscribers = parseInt(statistics.subscriberCount) || 1; // Evita divisão por zero
  const views = parseInt(statistics.viewCount) || 0;
  const videos = parseInt(statistics.videoCount) || 1; // Evita divisão por zero

  // Engagement rate = (views per video) / subscribers * 100
  const viewsPerVideo = views / videos;
  return ((viewsPerVideo / subscribers) * 100).toFixed(2);
};

/**
 * Função unificada para adaptar dados de qualquer plataforma
 * @param {Object} data - Dados brutos
 * @param {string} platform - Nome da plataforma ('instagram', 'youtube', 'linkedin')
 * @returns {Object} Dados formatados no padrão do dashboard
 */
export const adaptPlatformData = (data, platform) => {
  if (!data) return null;

  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case 'instagram':
      return adaptInstagramData(data);
    case 'youtube':
      return adaptYoutubeData(data);
    case 'linkedin':
      return adaptLinkedinData(data);
    default:
      console.warn(`Adaptador não encontrado para a plataforma: ${platform}`);
      return data;
  }
};