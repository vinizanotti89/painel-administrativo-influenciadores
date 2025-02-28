import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowUpRight, DollarSign, Package, Users } from 'lucide-react';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/hooks/useTranslation';
import '@/styles/pages/InfluencerDetails.css';

const InfluencerDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [influencerData, setInfluencerData] = useState({
    profile: null,
    metrics: {
      trustScore: 0,
      engagement: 0,
      followers: 0
    },
    posts: [],
    categories: [],
    platform: ''
  });

  useEffect(() => {
    const fetchInfluencerData = async () => {
      setLoading(true);
      try {
        // Determina qual plataforma o ID pertence e busca os dados
        const platformData = await identifyPlatformAndFetchData(id);
        if (platformData) {
          setInfluencerData(platformData);
        } else {
          setError(t('influencerDetails.notFound'));
        }
      } catch (err) {
        setError(err.message || t('influencerDetails.error'));
        console.error(t('influencerDetails.errorLog'), err);
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencerData();
  }, [id, t]);

  // Identifica a plataforma com base no ID e busca os dados correspondentes
  const identifyPlatformAndFetchData = async (influencerId) => {
    try {
      // Tenta buscar nas três plataformas
      const [instagramData, youtubeData, linkedinData] = await Promise.allSettled([
        fetchInstagramData(influencerId),
        fetchYoutubeData(influencerId),
        fetchLinkedInData(influencerId)
      ]);

      // Verifica qual plataforma retornou dados válidos
      if (instagramData.status === 'fulfilled' && instagramData.value) {
        return processInfluencerData(instagramData.value, 'Instagram');
      } else if (youtubeData.status === 'fulfilled' && youtubeData.value) {
        return processInfluencerData(youtubeData.value, 'YouTube');
      } else if (linkedinData.status === 'fulfilled' && linkedinData.value) {
        return processInfluencerData(linkedinData.value, 'LinkedIn');
      }

      return null;
    } catch (error) {
      console.error(t('influencerDetails.platformError'), error);
      throw error;
    }
  };

  // Busca dados do Instagram
  const fetchInstagramData = async (influencerId) => {
    try {
      const profile = await instagramService.getProfile(influencerId);
      if (!profile) return null;

      const userMedia = await instagramService.getUserMedia(influencerId);
      const mediaInsights = await instagramService.getMediaInsights(influencerId);

      return { profile, userMedia, mediaInsights, platform: 'Instagram' };
    } catch (error) {
      console.error(t('influencerDetails.instagramError'), error);
      return null;
    }
  };

  // Busca dados do YouTube
  const fetchYoutubeData = async (influencerId) => {
    try {
      const channel = await youtubeService.searchChannel(influencerId);
      if (!channel) return null;

      const channelVideos = await youtubeService.getChannelVideos(
        channel.id || channel.channelId || influencerId
      );

      return { profile: channel, channelVideos, platform: 'YouTube' };
    } catch (error) {
      console.error(t('influencerDetails.youtubeError'), error);
      return null;
    }
  };

  // Busca dados do LinkedIn
  const fetchLinkedInData = async (influencerId) => {
    try {
      const profile = await linkedinService.getProfile(influencerId);
      if (!profile) return null;

      const posts = await linkedinService.getPosts(influencerId);
      const followers = await linkedinService.getFollowers(influencerId);

      return { profile, posts, followers, platform: 'LinkedIn' };
    } catch (error) {
      console.error(t('influencerDetails.linkedinError'), error);
      return null;
    }
  };

  // Processa os dados do influenciador com base na plataforma
  const processInfluencerData = async (data, platform) => {
    try {
      if (!data) return null;

      let processedData = {
        profile: null,
        metrics: {
          trustScore: 0,
          engagement: 0,
          followers: 0
        },
        posts: [],
        categories: [],
        platform: platform
      };

      if (platform === 'Instagram') {
        const { profile, userMedia, mediaInsights } = data;
        const trustScore = await calculateTrustScore(data, 'Instagram');
        const categories = await processCategories(data, 'Instagram');
        const engagement = calculateEngagement(userMedia, parseInt(profile.follower_count) || 1);

        processedData = {
          profile: {
            id: profile.id,
            username: profile.username,
            name: profile.full_name || profile.username,
            bio: profile.biography || '',
            photo: profile.profile_picture_url || 'https://via.placeholder.com/150',
            url: `https://instagram.com/${profile.username}`
          },
          metrics: {
            trustScore,
            engagement: (engagement * 100).toFixed(2),
            followers: parseInt(profile.follower_count) || 0,
            posts: parseInt(profile.media_count) || 0
          },
          posts: userMedia || [],
          categories,
          platform: 'Instagram'
        };
      } else if (platform === 'YouTube') {
        const { profile, channelVideos } = data;
        const channelData = profile.rawData || profile;
        const trustScore = await calculateTrustScore(data, 'YouTube');
        const categories = await processCategories(data, 'YouTube');

        // Calcula taxa de engajamento para YouTube
        let engagement = 0;
        if (channelVideos && channelVideos.length > 0) {
          const totalLikes = channelVideos.reduce((sum, video) =>
            sum + (parseInt(video.statistics?.likeCount) || 0), 0);
          const totalComments = channelVideos.reduce((sum, video) =>
            sum + (parseInt(video.statistics?.commentCount) || 0), 0);
          const totalViews = channelVideos.reduce((sum, video) =>
            sum + (parseInt(video.statistics?.viewCount) || 0), 0);

          if (totalViews > 0) {
            engagement = ((totalLikes + totalComments) / totalViews) * 100;
          }
        }

        processedData = {
          profile: {
            id: channelData.id,
            username: channelData.snippet?.customUrl || '',
            name: channelData.snippet?.title || profile.channelName,
            bio: channelData.snippet?.description || '',
            photo: channelData.snippet?.thumbnails?.high?.url || 'https://via.placeholder.com/150',
            url: `https://youtube.com/channel/${channelData.id}`
          },
          metrics: {
            trustScore,
            engagement: engagement.toFixed(2),
            followers: parseInt(channelData.statistics?.subscriberCount) || 0,
            views: parseInt(channelData.statistics?.viewCount) || 0,
            videos: parseInt(channelData.statistics?.videoCount) || 0
          },
          posts: channelVideos || [],
          categories,
          platform: 'YouTube'
        };
      } else if (platform === 'LinkedIn') {
        const { profile, posts, followers } = data;
        const trustScore = await calculateTrustScore(data, 'LinkedIn');
        const categories = await processCategories(data, 'LinkedIn');

        // Calcula taxa de engajamento para LinkedIn
        let engagement = 0;
        const followersCount = followers?.count || 1;

        if (posts && posts.length > 0) {
          const totalEngagements = posts.reduce((sum, post) =>
            sum + (post.totalShareStatistics?.shareCount || 0) +
            (post.totalShareStatistics?.likeCount || 0) +
            (post.totalShareStatistics?.commentCount || 0), 0);

          engagement = (totalEngagements / posts.length) / followersCount * 100;
        }

        processedData = {
          profile: {
            id: profile.id,
            username: profile.vanityName || '',
            name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
            bio: profile.headline || '',
            photo: profile.profilePicture?.displayImage || 'https://via.placeholder.com/150',
            url: `https://linkedin.com/in/${profile.vanityName || profile.id}`
          },
          metrics: {
            trustScore,
            engagement: engagement.toFixed(2),
            followers: followers?.count || 0,
            connections: followers?.count || 0,
            posts: posts?.length || 0
          },
          posts: posts || [],
          categories,
          platform: 'LinkedIn'
        };
      }

      return processedData;
    } catch (error) {
      console.error(`${t('influencerDetails.processingError')} ${platform}:`, error);
      throw error;
    }
  };

  // Calcula o Trust Score baseado em engajamento e consistência
  const calculateTrustScore = async (data, platform) => {
    try {
      if (platform === 'Instagram') {
        const { userMedia, profile } = data;
        // Cálculo para Instagram baseado em engagement e qualidade de conteúdo
        if (!userMedia || userMedia.length === 0) return 65; // Score padrão se não houver dados

        const followers = parseInt(profile.follower_count) || 10000;
        const engagementRate = calculateEngagement(userMedia, followers);
        const contentQuality = analyzeContentQuality(userMedia);

        // Fórmula ponderada
        return Math.round((engagementRate * 0.6 + contentQuality * 0.4) * 100);
      } else if (platform === 'YouTube') {
        const { channelVideos, profile } = data;
        // Cálculo para YouTube baseado em views, likes e comentários
        if (!channelVideos || channelVideos.length === 0) return 65; // Score padrão se não houver dados

        const totalViews = channelVideos.reduce((sum, video) =>
          sum + (parseInt(video.statistics?.viewCount) || 0), 0);
        const totalLikes = channelVideos.reduce((sum, video) =>
          sum + (parseInt(video.statistics?.likeCount) || 0), 0);
        const totalComments = channelVideos.reduce((sum, video) =>
          sum + (parseInt(video.statistics?.commentCount) || 0), 0);

        const subscribers = parseInt(profile.statistics?.subscriberCount) || 10000;
        const avgViews = totalViews / channelVideos.length;
        const engagement = ((totalLikes + totalComments) / totalViews) * 100;

        // Fórmula ponderada para calcular trust score
        const viewScore = Math.min(avgViews / (subscribers * 0.1), 1) * 40; // Máx 40 pontos
        const engagementScore = Math.min(engagement * 2, 1) * 60; // Máx 60 pontos

        return Math.round(viewScore + engagementScore);
      } else if (platform === 'LinkedIn') {
        const { posts, followers } = data;
        // Cálculo para LinkedIn baseado em atividade profissional e engagement
        if (!posts || posts.length === 0) return 80; // Score padrão para LinkedIn

        const followersCount = followers?.count || 1000;

        // Calcular engagement baseado em likes, comentários e compartilhamentos
        let engagement = 0;
        if (posts.length > 0) {
          const totalEngagements = posts.reduce((sum, post) =>
            sum + (post.totalShareStatistics?.shareCount || 0) +
            (post.totalShareStatistics?.likeCount || 0) +
            (post.totalShareStatistics?.commentCount || 0), 0);

          engagement = (totalEngagements / posts.length) / followersCount * 100;
        }

        // Trust score baseado em profissionalismo (peso maior) e engagement
        const professionalismScore = 70; // Base alta pelo caráter profissional
        const engagementScore = Math.min(engagement * 3, 30); // Máx 30 pontos

        return Math.round(professionalismScore + engagementScore);
      }

      return 65; // Score padrão
    } catch (error) {
      console.error(`${t('influencerDetails.trustScoreError')} ${platform}:`, error);
      return 60; // Score padrão em caso de erro
    }
  };

  // Extrai categorias dos dados do influenciador
  const processCategories = async (data, platform) => {
    if (platform === 'Instagram') {
      const { userMedia } = data;
      if (!userMedia || userMedia.length === 0) return [t('categories.lifestyle')];

      // Extrai hashtags para determinar categorias
      const allHashtags = userMedia
        .map(media => {
          const caption = media.caption || '';
          const hashtags = caption.match(/#(\w+)/g) || [];
          return hashtags.map(tag => tag.substring(1).toLowerCase());
        })
        .flat();

      // Mapeamento de hashtags para categorias
      const categoryMappings = {
        'saude': t('categories.health'),
        'health': t('categories.health'),
        'fitness': t('categories.fitness'),
        'lifestyle': t('categories.lifestyle'),
        'beleza': t('categories.beauty'),
        'beauty': t('categories.beauty'),
        'nutrição': t('categories.nutrition'),
        'nutricao': t('categories.nutrition'),
        'nutrition': t('categories.nutrition'),
        'moda': t('categories.fashion'),
        'fashion': t('categories.fashion'),
        'esporte': t('categories.sports'),
        'esportes': t('categories.sports'),
        'sports': t('categories.sports'),
        'medicina': t('categories.health'),
        'medicine': t('categories.health'),
        'yoga': t('categories.fitness'),
        'crossfit': t('categories.fitness'),
        'dieta': t('categories.nutrition'),
        'diet': t('categories.nutrition'),
        'receitas': t('categories.food'),
        'food': t('categories.food'),
        'recipes': t('categories.food'),
        'viagem': t('categories.travel'),
        'travel': t('categories.travel'),
        'turismo': t('categories.travel'),
        'tourism': t('categories.travel'),
        'tecnologia': t('categories.technology'),
        'technology': t('categories.technology'),
        'games': t('categories.games'),
        'jogos': t('categories.games')
      };

      // Conta ocorrências de categorias
      const categoryCounts = {};
      allHashtags.forEach(tag => {
        Object.entries(categoryMappings).forEach(([key, category]) => {
          if (tag.includes(key)) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          }
        });
      });

      // Top categorias (até 3)
      const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);

      return topCategories.length > 0 ? topCategories : [t('categories.lifestyle')];
    } else if (platform === 'YouTube') {
      const { profile, channelVideos } = data;
      const channelData = profile.rawData || profile;
      const categoryId = channelData.snippet?.categoryId;

      // Mapeia IDs de categoria do YouTube para nomes legíveis
      const youtubeCategoryMap = {
        '1': t('youtube.categories.film'),
        '2': t('youtube.categories.autos'),
        '10': t('categories.music'),
        '15': t('youtube.categories.pets'),
        '17': t('categories.sports'),
        '18': t('youtube.categories.shortMovies'),
        '19': t('categories.travel'),
        '20': t('categories.games'),
        '21': t('youtube.categories.videoblogs'),
        '22': t('youtube.categories.people'),
        '23': t('youtube.categories.comedy'),
        '24': t('youtube.categories.entertainment'),
        '25': t('youtube.categories.news'),
        '26': t('youtube.categories.howto'),
        '27': t('categories.education'),
        '28': t('categories.science'),
        '29': t('youtube.categories.nonprofit')
      };

      const categoryName = categoryId ? youtubeCategoryMap[categoryId] : null;

      // Tenta extrair tópicos das tags
      let additionalCategories = [];
      if (channelData.snippet?.tags) {
        const tags = channelData.snippet.tags;
        const commonTags = [
          'saúde', 'health', 'fitness', 'medicina', 'medicine',
          'nutrição', 'nutrition', 'beleza', 'beauty', 'lifestyle'
        ];
        additionalCategories = commonTags.filter(tag =>
          tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        ).map(tag => {
          // Mapeia tags para categorias traduzidas
          const tagLower = tag.toLowerCase();
          if (tagLower.includes('saúde') || tagLower.includes('health')) return t('categories.health');
          if (tagLower.includes('fitness')) return t('categories.fitness');
          if (tagLower.includes('medicina') || tagLower.includes('medicine')) return t('categories.health');
          if (tagLower.includes('nutrição') || tagLower.includes('nutrition')) return t('categories.nutrition');
          if (tagLower.includes('beleza') || tagLower.includes('beauty')) return t('categories.beauty');
          if (tagLower.includes('lifestyle')) return t('categories.lifestyle');
          return tag.charAt(0).toUpperCase() + tag.slice(1);
        });
      }

      // Combina e remove duplicatas
      const allCategories = [...new Set([
        categoryName,
        ...additionalCategories
      ])].filter(Boolean);

      return allCategories.length > 0 ? allCategories : [t('categories.general')];
    } else if (platform === 'LinkedIn') {
      const { profile, posts } = data;

      // Categorias baseadas na indústria do perfil
      let categories = [];

      if (profile.industry) {
        categories.push(profile.industry);
      }

      // Analisa posts para temas comuns
      if (posts && posts.length > 0) {
        const commonBusinessTerms = {
          'marketing': t('categories.marketing'),
          'vendas': t('categories.sales'),
          'sales': t('categories.sales'),
          'saúde': t('categories.health'),
          'health': t('categories.health'),
          'tecnologia': t('categories.technology'),
          'technology': t('categories.technology'),
          'finanças': t('categories.finance'),
          'finance': t('categories.finance'),
          'gestão': t('categories.management'),
          'management': t('categories.management'),
          'liderança': t('categories.leadership'),
          'leadership': t('categories.leadership'),
          'rh': t('categories.hr'),
          'hr': t('categories.hr'),
          'recursos humanos': t('categories.hr'),
          'human resources': t('categories.hr'),
          'consultoria': t('categories.consulting'),
          'consulting': t('categories.consulting'),
          'educação': t('categories.education'),
          'education': t('categories.education'),
          'carreira': t('categories.career'),
          'career': t('categories.career')
        };

        // Analisa texto dos posts
        const postContents = posts.map(post => post.commentary?.text || '').join(' ').toLowerCase();

        Object.entries(commonBusinessTerms).forEach(([term, category]) => {
          if (postContents.includes(term)) {
            categories.push(category);
          }
        });
      }

      // Remove duplicatas e limita a 3
      categories = [...new Set(categories)].slice(0, 3);

      return categories.length > 0 ? categories : [t('categories.professional')];
    }

    return [t('categories.general')]; // Categoria padrão
  };

  // Calcula taxa de engagement
  const calculateEngagement = (data, followers) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return 0.5; // Taxa padrão
    }

    try {
      // Média de likes e comentários dividido por seguidores
      const totalLikes = data.reduce((sum, item) => sum + (parseInt(item.like_count) || 0), 0);
      const totalComments = data.reduce((sum, item) => sum + (parseInt(item.comments_count) || 0), 0);
      const totalEngagement = totalLikes + totalComments;

      // Normaliza por número de posts e seguidores
      const engagementRate = (totalEngagement / data.length) / (followers || 1) * 100;

      // Limita a uma taxa máxima de 1.0 (100%)
      return Math.min(engagementRate / 100, 1);
    } catch (error) {
      console.error(t('influencerDetails.engagementError'), error);
      return 0;
    }
  };

  // Analisa qualidade do conteúdo para determinar influência
  const analyzeContentQuality = (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) return 0.7; // Valor padrão

    try {
      // Análise baseada em engagement consistente e captioning
      const engagementConsistency = calculateEngagementConsistency(mediaItems);
      const captionQuality = evaluateCaptionQuality(mediaItems);

      return (engagementConsistency * 0.7) + (captionQuality * 0.3);
    } catch (error) {
      console.error(t('influencerDetails.contentQualityError'), error);
      return 0.7; // Valor padrão em caso de erro
    }
  };

  // Calcula a consistência de engagement
  const calculateEngagementConsistency = (mediaItems) => {
    if (!mediaItems || mediaItems.length < 3) return 0.6;

    try {
      const engagementRates = mediaItems.map(item => {
        const likes = item.like_count || 0;
        const comments = item.comments_count || 0;
        const totalEngagement = likes + comments;
        return totalEngagement;
      });

      // Calcula o desvio padrão
      const avg = engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length;
      const squareDiffs = engagementRates.map(rate => Math.pow(rate - avg, 2));
      const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(avgSquareDiff);

      // Menor desvio = maior consistência
      const normalizedStdDev = Math.min(stdDev / avg, 1);
      return 1 - normalizedStdDev;
    } catch (error) {
      console.error(t('influencerDetails.consistencyError'), error);
      return 0.6; // Valor padrão em caso de erro
    }
  };

  // Avalia a qualidade das legendas/descrições
  const evaluateCaptionQuality = (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) return 0.5;

    try {
      const captionScores = mediaItems.map(item => {
        const caption = item.caption || '';
        const length = Math.min(caption.length / 200, 1);
        const hashtagCount = (caption.match(/#/g) || []).length;
        const hashtagScore = hashtagCount > 0 && hashtagCount <= 10 ? 0.8 : 0.3;

        return (length * 0.6) + (hashtagScore * 0.4);
      });

      return captionScores.reduce((sum, score) => sum + score, 0) / captionScores.length;
    } catch (error) {
      console.error(t('influencerDetails.captionQualityError'), error);
      return 0.5; // Valor padrão em caso de erro
    }
  };

  // Renderiza conteúdo do Instagram
  const renderInstagramContent = () => {
    if (!posts || posts.length === 0) return null;

    return (
      <div className="instagram-content">
        {posts.slice(0, 6).map((post, index) => (
          <Card key={index} className="content-card">
            <CardContent>
              <div className="post-preview">
                <div className="post-header">
                  <div className="post-date">
                    {new Date(post.timestamp || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                {post.media_url && (
                  <div className="post-image">
                    <img
                      src={post.media_url}
                      alt={post.caption ? post.caption.substring(0, 30) : t('influencerDetails.content.postImage')}
                      className="instagram-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
                      }}
                    />
                  </div>
                )}
                <div className="post-content">
                  <p className="post-text">
                    {post.caption &&
                      (post.caption.length > 150
                        ? `${post.caption.substring(0, 150)}...`
                        : post.caption)}
                  </p>
                </div>
                <div className="post-stats">
                  <div className="stat-item">
                    {post.like_count || 0} {t('influencerDetails.content.likes')}
                  </div>
                  <div className="stat-item">
                    {post.comments_count || 0} {t('influencerDetails.content.comments')}
                  </div>
                </div>
                {post.permalink && (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="post-link"
                  >
                    {t('influencerDetails.content.viewPost')} <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Renderiza conteúdo do YouTube
  const renderYouTubeContent = () => {
    if (!posts || posts.length === 0) return null;

    return (
      <div className="youtube-content">
        {posts.slice(0, 6).map((video, index) => (
          <Card key={index} className="content-card">
            <CardContent>
              <div className="video-preview">
                <div className="video-thumbnail">
                  <img
                    src={video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url}
                    alt={video.snippet?.title || t('influencerDetails.content.videoThumbnail')}
                    className="thumbnail-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x225?text=Thumbnail+Not+Available';
                    }}
                  />
                </div>
                <div className="video-info">
                  <h4 className="video-title">
                    {video.snippet?.title &&
                      (video.snippet.title.length > 60
                        ? `${video.snippet.title.substring(0, 60)}...`
                        : video.snippet.title)}
                  </h4>
                  <div className="video-stats">
                    <div className="stat-item">
                      {formatNumber(video.statistics?.viewCount || 0)} {t('influencerDetails.content.views')}
                    </div>
                    <div className="stat-item">
                      {formatNumber(video.statistics?.likeCount || 0)} {t('influencerDetails.content.likes')}
                    </div>
                  </div>
                  <div className="video-description">
                    {video.snippet?.description &&
                      (video.snippet.description.length > 100
                        ? `${video.snippet.description.substring(0, 100)}...`
                        : video.snippet.description)}
                  </div>
                  <a
                    href={`https://youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-link"
                  >
                    {t('influencerDetails.content.watchVideo')} <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Renderiza conteúdo do LinkedIn
  const renderLinkedInContent = () => {
    if (!posts || posts.length === 0) return null;

    return (
      <div className="linkedin-content">
        {posts.slice(0, 6).map((post, index) => (
          <Card key={index} className="content-card">
            <CardContent>
              <div className="post-preview">
                <div className="post-header">
                  <div className="post-date">
                    {new Date(post.created?.time || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <div className="post-content">
                  <p className="post-text">
                    {post.commentary?.text &&
                      (post.commentary.text.length > 150
                        ? `${post.commentary.text.substring(0, 150)}...`
                        : post.commentary.text)}
                  </p>
                </div>
                <div className="post-stats">
                  <div className="stat-item">
                    {post.totalShareStatistics?.likeCount || 0} {t('influencerDetails.content.likes')}
                  </div>
                  <div className="stat-item">
                    {post.totalShareStatistics?.commentCount || 0} {t('influencerDetails.content.comments')}
                  </div>
                  <div className="stat-item">
                    {post.totalShareStatistics?.shareCount || 0} {t('influencerDetails.content.shares')}
                  </div>
                </div>
                {post.activity?.shareUrn && (
                  <a
                    href={`https://linkedin.com/feed/update/${post.activity.shareUrn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="post-link"
                  >
                    {t('influencerDetails.content.viewPost')} <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Renderização principal do componente
  return (
    <div className="influencer-details-container">
      {loading ? (
        <div className="loading-state">
          <p>{t('influencerDetails.loading')}</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : profile ? (
        <>
          <div className="profile-header">
            <div className="profile-avatar">
              <img
                src={profile.photo}
                alt={profile.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=Profile';
                }}
              />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{profile.name}</h1>
              <div className="profile-username">@{profile.username}</div>
              <div className="profile-platform">
                <Badge variant="outline" className={`platform-badge ${platform.toLowerCase()}`}>
                  {platform}
                </Badge>
                {categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="category-badge">
                    {category}
                  </Badge>
                ))}
              </div>
              <p className="profile-bio">{profile.bio}</p>
              <div className="profile-links">
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link"
                >
                  {t('influencerDetails.viewProfile')} <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>

          <div className="metrics-cards">
            <Card className="metric-card trust-score">
              <CardHeader>
                <CardTitle>{t('metrics.trustScore')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="metric-value">
                  <div className="score-circle" style={{
                    background: `conic-gradient(var(--${getScoreColor(metrics.trustScore)}) ${metrics.trustScore}%, #e9ecef ${metrics.trustScore}%)`
                  }}>
                    <div className="score-inner">{metrics.trustScore}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader>
                <CardTitle>{t('metrics.engagement')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="metric-value">
                  <DollarSign size={20} />
                  <span>{metrics.engagement}%</span>
                </div>
                <div className="metric-description">
                  {t('metrics.engagementDesc')}
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader>
                <CardTitle>{t('metrics.followers')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="metric-value">
                  <Users size={20} />
                  <span>{formatNumber(metrics.followers)}</span>
                </div>
                <div className="metric-description">
                  {t('metrics.followersDesc')}
                </div>
              </CardContent>
            </Card>

            {platform === 'YouTube' && (
              <Card className="metric-card">
                <CardHeader>
                  <CardTitle>{t('metrics.views')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="metric-value">
                    <Package size={20} />
                    <span>{formatNumber(metrics.views || 0)}</span>
                  </div>
                  <div className="metric-description">
                    {t('metrics.viewsDesc')}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Tabs
            defaultValue="overview"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="tabs-container"
          >
            <TabsList>
              <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
              <TabsTrigger value="content">{t('tabs.content')}</TabsTrigger>
              <TabsTrigger value="insights">{t('tabs.insights')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="tab-content">
              <div className="overview-section">
                <h2>{t('overview.title')}</h2>
                <div className="overview-cards">
                  {/* Conteúdo da visão geral */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('overview.audience')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{t('overview.audienceDesc')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t('overview.activity')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{t('overview.activityDesc')}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="tab-content">
              <div className="content-section">
                <h2>{t('content.title')}</h2>
                <div className="content-container">
                  {platform === 'Instagram' && renderInstagramContent()}
                  {platform === 'YouTube' && renderYouTubeContent()}
                  {platform === 'LinkedIn' && renderLinkedInContent()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="tab-content">
              <div className="insights-section">
                <h2>{t('insights.title')}</h2>
                {/* Conteúdo de insights */}
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="empty-state">
          <p>{t('influencerDetails.noData')}</p>
        </div>
      )}
    </div>
  );

  // Utilidade para determinar a cor do score com base no valor
  function getScoreColor(score) {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  }
};

export default InfluencerDetails;