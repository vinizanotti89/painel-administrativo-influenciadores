import axios from 'axios';
import { handleApiError, formatNumberToK, calculateEngagementRate } from '../utils/apiHelpers';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtubeApi = axios.create({
  baseURL: YOUTUBE_API_BASE_URL,
  params: {
    key: import.meta.env.VITE_YOUTUBE_API_KEY
  }
});

export const youtubeService = {
  searchChannel: async (query) => {
    try {
      // Busca o canal
      const searchResponse = await youtubeApi.get('/search', {
        params: {
          part: 'snippet',
          type: 'channel',
          q: query,
          maxResults: 1
        }
      });

      if (!searchResponse.data.items?.length) {
        throw new Error('Canal não encontrado');
      }

      const channelId = searchResponse.data.items[0].id.channelId;

      // Obtém estatísticas do canal
      const channelResponse = await youtubeApi.get('/channels', {
        params: {
          part: 'statistics,snippet,brandingSettings',
          id: channelId
        }
      });

      if (!channelResponse.data.items?.length) {
        throw new Error('Dados do canal não encontrados');
      }

      const channelData = channelResponse.data.items[0];

      // Obtém vídeos recentes para calcular engajamento
      const videosResponse = await youtubeApi.get('/search', {
        params: {
          part: 'id',
          channelId: channelId,
          order: 'date',
          type: 'video',
          maxResults: 10
        }
      });

      const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');
      const videoStatsResponse = await youtubeApi.get('/videos', {
        params: {
          part: 'statistics',
          id: videoIds
        }
      });

      // Calcula engajamento médio
      const videoStats = videoStatsResponse.data.items;
      const totalEngagement = videoStats.reduce((sum, video) => {
        const likes = parseInt(video.statistics.likeCount) || 0;
        const comments = parseInt(video.statistics.commentCount) || 0;
        return sum + likes + comments;
      }, 0);

      const averageEngagement = totalEngagement / videoStats.length;
      const subscribers = parseInt(channelData.statistics.subscriberCount);
      const engagementRate = calculateEngagementRate(averageEngagement, subscribers);

      return {
        platform: 'YouTube',
        channelName: channelData.snippet.title,
        channelId: channelId,
        thumbnailUrl: channelData.snippet.thumbnails.default.url,
        bannerUrl: channelData.brandingSettings.image?.bannerExternalUrl,
        description: channelData.snippet.description,
        statistics: {
          followers: formatNumberToK(subscribers),
          views: formatNumberToK(parseInt(channelData.statistics.viewCount)),
          videos: formatNumberToK(parseInt(channelData.statistics.videoCount)),
          engagement: `${engagementRate}%`
        },
        rawData: channelData
      };
    } catch (error) {
      return handleApiError(error, 'YouTube');
    }
  },

  getChannelVideos: async (channelId, maxResults = 50) => {
    try {
      const response = await youtubeApi.get('/search', {
        params: {
          part: 'snippet',
          channelId: channelId,
          order: 'date',
          type: 'video',
          maxResults: maxResults
        }
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      throw error;
    }
  }
};

export default youtubeService;