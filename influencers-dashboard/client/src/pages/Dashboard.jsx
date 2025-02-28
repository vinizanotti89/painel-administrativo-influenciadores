import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, BarChart2, RefreshCw } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import RecentInfluencers from '@/components/dashboard/RecentInfluencers';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/hooks/useTranslation';
import '@/styles/pages/Dashboard.css';

const Dashboard = React.forwardRef(({ className = '', ...props }, ref) => {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    influencers: [],
    statistics: {
      totalInfluencers: 0,
      averageFollowers: 0,
      averageTrustScore: 0
    },
    trends: {
      monthlyGrowth: 0,
      followerGrowth: 0,
      trustScoreGrowth: 0
    }
  });

  // Função para calcular o Trust Score com base em dados de cada plataforma
  const calculateTrustScore = async (data, platform) => {
    try {
      if (platform === 'Instagram') {
        // Cálculo para Instagram baseado em engagement e qualidade de conteúdo
        const mediaInsights = await instagramService.getMediaInsights(data.id);
        const engagementRate = calculateEngagement(mediaInsights);
        const contentQuality = analyzeContentQuality(mediaInsights);
        return Math.round((engagementRate * 0.6 + contentQuality * 0.4) * 100);
      } else if (platform === 'YouTube') {
        // Cálculo para YouTube baseado em views, likes e comentários
        const channelVideos = await youtubeService.getChannelVideos(data.channelId || data.id);
        if (!channelVideos || channelVideos.length === 0) return 65; // Valor padrão se não houver dados

        const totalViews = channelVideos.reduce((sum, video) =>
          sum + (parseInt(video.statistics?.viewCount) || 0), 0);
        const totalLikes = channelVideos.reduce((sum, video) =>
          sum + (parseInt(video.statistics?.likeCount) || 0), 0);
        const totalComments = channelVideos.reduce((sum, video) =>
          sum + (parseInt(video.statistics?.commentCount) || 0), 0);

        const avgViews = totalViews / channelVideos.length;
        const engagement = ((totalLikes + totalComments) / totalViews) * 100;

        // Fórmula ponderada para calcular trust score
        const viewScore = Math.min(avgViews / 10000, 1) * 40; // Máximo de 40 pontos
        const engagementScore = Math.min(engagement * 2, 1) * 60; // Máximo de 60 pontos

        return Math.round(viewScore + engagementScore);
      } else if (platform === 'LinkedIn') {
        // Cálculo para LinkedIn baseado em atividade profissional e engagement
        const posts = await linkedinService.getPosts();
        const analytics = posts && posts.length > 0
          ? await linkedinService.getPostAnalytics(posts[0].id)
          : null;

        const followersCount = (await linkedinService.getFollowers()).count || 1;

        // Calcular engagement com base em likes, comentários e compartilhamentos
        let engagement = 0;
        if (analytics && posts.length > 0) {
          const totalEngagements = posts.reduce((sum, post) =>
            sum + (post.totalShareStatistics?.shareCount || 0) +
            (post.totalShareStatistics?.likeCount || 0) +
            (post.totalShareStatistics?.commentCount || 0), 0);

          engagement = (totalEngagements / posts.length) / followersCount * 100;
        }

        // Trust score baseado em profissionalismo (peso maior) e engagement
        const professionalismScore = 70; // Base alta devido ao caráter profissional do LinkedIn
        const engagementScore = Math.min(engagement * 3, 30); // Máximo de 30 pontos

        return Math.round(professionalismScore + engagementScore);
      }

      return 60; // Valor padrão para outras plataformas
    } catch (error) {
      console.error(`Error calculating trust score for ${platform}:`, error);
      return 50; // Valor padrão em caso de erro
    }
  };

  // Analisa o conteúdo para determinar qualidade (0-1)
  const analyzeContentQuality = (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) return 0.7; // Valor padrão

    // Análise baseada em engagement consistente e captioning
    const engagementConsistency = calculateEngagementConsistency(mediaItems);
    const captionQuality = evaluateCaptionQuality(mediaItems);

    return (engagementConsistency * 0.7) + (captionQuality * 0.3);
  };

  // Calcula a consistência de engagement (0-1)
  const calculateEngagementConsistency = (mediaItems) => {
    if (!mediaItems || mediaItems.length < 3) return 0.6; // Precisa de pelo menos 3 itens

    const engagementRates = mediaItems.map(item => {
      const likes = item.like_count || 0;
      const comments = item.comments_count || 0;
      const totalEngagement = likes + comments;
      return totalEngagement;
    });

    // Calcula o desvio padrão das taxas de engagement
    const avg = engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length;
    const squareDiffs = engagementRates.map(rate => Math.pow(rate - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    // Menor desvio padrão = maior consistência
    const normalizedStdDev = Math.min(stdDev / avg, 1);
    return 1 - normalizedStdDev; // Inverte para que menor desvio = maior pontuação
  };

  // Avalia a qualidade das legendas/descrições (0-1)
  const evaluateCaptionQuality = (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) return 0.5;

    const captionScores = mediaItems.map(item => {
      const caption = item.caption || '';
      // Fatores simples de qualidade: comprimento, uso de hashtags
      const length = Math.min(caption.length / 200, 1); // Até 200 caracteres
      const hashtagCount = (caption.match(/#/g) || []).length;
      const hashtagScore = hashtagCount > 0 && hashtagCount <= 10 ? 0.8 : 0.3;

      return (length * 0.6) + (hashtagScore * 0.4);
    });

    return captionScores.reduce((sum, score) => sum + score, 0) / captionScores.length;
  };

  // Processa categorias dos dados do influenciador
  const processCategories = async (data, platform) => {
    if (!data) return [t('categories.general')];

    try {
      if (platform === 'Instagram') {
        // Extrai categorias das mídias do Instagram
        const userMedia = await instagramService.getUserMedia();

        // Analisar hashtags para determinar categorias
        const allHashtags = userMedia
          .map(media => {
            const caption = media.caption || '';
            const hashtags = caption.match(/#(\w+)/g) || [];
            return hashtags.map(tag => tag.substring(1).toLowerCase());
          })
          .flat();

        // Mapeamento de hashtags comuns para categorias
        const categoryMappingsKeys = {
          'saude': 'health',
          'fitness': 'fitness',
          'lifestyle': 'lifestyle',
          'beleza': 'beauty',
          'nutrição': 'nutrition',
          'nutricao': 'nutrition',
          'moda': 'fashion',
          'esporte': 'sports',
          'esportes': 'sports',
          'medicina': 'health',
          'yoga': 'fitness',
          'crossfit': 'fitness',
          'dieta': 'nutrition',
          'receitas': 'food',
          'viagem': 'travel',
          'turismo': 'travel',
          'tecnologia': 'technology',
          'games': 'games',
          'jogos': 'games'
        };

        // Conta ocorrências de cada categoria
        const categoryCounts = {};
        allHashtags.forEach(tag => {
          Object.entries(categoryMappingsKeys).forEach(([key, categoryKey]) => {
            if (tag.includes(key)) {
              const translatedCategory = t(`categories.${categoryKey}`);
              categoryCounts[translatedCategory] = (categoryCounts[translatedCategory] || 0) + 1;
            }
          });
        });

        // Seleciona as top categorias (até 3)
        const topCategories = Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => entry[0]);

        return topCategories.length > 0 ? topCategories : [t('categories.lifestyle')];
      }
      else if (platform === 'YouTube') {
        // Para YouTube, usa categorias do próprio YouTube
        const channelData = data.rawData || data;
        const categoryId = channelData.snippet?.categoryId;

        // Mapeia os IDs de categoria do YouTube para chaves de tradução
        const youtubeCategoryMap = {
          '1': 'movies',
          '2': 'automotive',
          '10': 'music',
          '15': 'animals',
          '17': 'sports',
          '18': 'shortMovies',
          '19': 'travel',
          '20': 'games',
          '21': 'videoblogs',
          '22': 'people',
          '23': 'comedy',
          '24': 'entertainment',
          '25': 'news',
          '26': 'fashion',
          '27': 'education',
          '28': 'technology',
          '29': 'nonprofit'
        };

        const categoryKey = categoryId ? youtubeCategoryMap[categoryId] : null;
        const categoryName = categoryKey ? t(`categories.${categoryKey}`) : null;

        // Tenta extrair tópicos das tags se disponíveis
        let additionalCategories = [];
        if (channelData.snippet?.tags) {
          const tags = channelData.snippet.tags;
          const commonTags = ['saúde', 'fitness', 'medicina', 'nutrição', 'beleza', 'lifestyle'];
          const commonTagsMap = {
            'saúde': 'health',
            'fitness': 'fitness',
            'medicina': 'health',
            'nutrição': 'nutrition',
            'beleza': 'beauty',
            'lifestyle': 'lifestyle'
          };

          additionalCategories = commonTags
            .filter(tag => tags.some(t => t.toLowerCase().includes(tag.toLowerCase())))
            .map(tag => t(`categories.${commonTagsMap[tag]}`));
        }

        // Combina e remove duplicatas
        const allCategories = [...new Set([
          categoryName,
          ...additionalCategories
        ])].filter(Boolean);

        return allCategories.length > 0 ? allCategories : [t('categories.general')];
      }
      else if (platform === 'LinkedIn') {
        // Para LinkedIn, extrai do perfil e posts
        const profile = await linkedinService.getProfile();
        const posts = await linkedinService.getPosts();

        // Categorias baseadas na indústria do perfil
        let categories = [];

        if (profile.industry) {
          categories.push(profile.industry);
        }

        // Analisa posts para identificar temas comuns
        if (posts && posts.length > 0) {
          const commonBusinessTermsMap = {
            'marketing': 'marketing',
            'vendas': 'sales',
            'saúde': 'health',
            'tecnologia': 'technology',
            'finanças': 'finance',
            'gestão': 'management',
            'liderança': 'leadership',
            'rh': 'hr',
            'recursos humanos': 'hr',
            'consultoria': 'consulting',
            'educação': 'education',
            'carreira': 'career'
          };

          // Analisa texto dos posts
          const postContents = posts.map(post => post.commentary?.text || '').join(' ').toLowerCase();

          Object.entries(commonBusinessTermsMap).forEach(([term, categoryKey]) => {
            if (postContents.includes(term)) {
              categories.push(t(`categories.${categoryKey}`));
            }
          });
        }

        // Remove duplicatas e limita a 3 categorias
        categories = [...new Set(categories)].slice(0, 3);

        return categories.length > 0 ? categories : [t('categories.professional')];
      }

      return [t('categories.general')]; // Categoria padrão
    } catch (error) {
      console.error(`Error processing categories for ${platform}:`, error);
      return [t('categories.general')];
    }
  };

  // Calcula taxa de engagement
  const calculateEngagement = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return 0;
    }

    try {
      // Total de likes e comentários dividido pelo número de posts
      const totalLikes = data.reduce((sum, item) => sum + (parseInt(item.like_count) || 0), 0);
      const totalComments = data.reduce((sum, item) => sum + (parseInt(item.comments_count) || 0), 0);
      const totalEngagement = totalLikes + totalComments;

      // Taxa média de engagement por post
      const engagementRate = totalEngagement / data.length;

      return engagementRate;
    } catch (error) {
      console.error('Error calculating engagement:', error);
      return 0;
    }
  };

  // Processa dados do influenciador
  const processInfluencerData = async (data, platform) => {
    try {
      if (!data) return null;

      if (platform === 'Instagram') {
        const userMedia = await instagramService.getUserMedia();
        const trustScore = await calculateTrustScore(data, 'Instagram');
        const categories = await processCategories(data, 'Instagram');
        const engagement = calculateEngagement(userMedia);

        return {
          id: data.id,
          name: data.username,
          platform: 'Instagram',
          followers: data.media_count || 0,
          trustScore,
          categories,
          engagement,
          profileUrl: data.profile_picture_url || 'https://via.placeholder.com/150',
          statistics: {
            posts: data.media_count || 0,
            engagement: (engagement / (data.media_count || 1) * 100).toFixed(2)
          }
        };
      }
      else if (platform === 'YouTube') {
        const channelData = data.rawData || data;
        const trustScore = await calculateTrustScore(channelData, 'YouTube');
        const categories = await processCategories(channelData, 'YouTube');

        return {
          id: channelData.id,
          name: channelData.snippet?.title || data.channelName,
          platform: 'YouTube',
          followers: parseInt(channelData.statistics?.subscriberCount) || 0,
          trustScore,
          categories,
          engagement: parseFloat(data.statistics?.engagement || '0'),
          profileUrl: channelData.snippet?.thumbnails?.default?.url || data.thumbnailUrl || 'https://via.placeholder.com/150',
          statistics: {
            views: parseInt(channelData.statistics?.viewCount) || 0,
            videos: parseInt(channelData.statistics?.videoCount) || 0
          }
        };
      }
      else if (platform === 'LinkedIn') {
        const profileData = await linkedinService.getProfile();
        const trustScore = await calculateTrustScore(profileData, 'LinkedIn');
        const categories = await processCategories(profileData, 'LinkedIn');
        const followers = (await linkedinService.getFollowers()).count || 0;

        return {
          id: profileData.id,
          name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
          platform: 'LinkedIn',
          followers: followers,
          trustScore,
          categories,
          engagement: 0, // Será calculado com dados reais
          profileUrl: profileData.profilePicture?.displayImage || 'https://via.placeholder.com/150',
          statistics: {
            connections: followers,
            posts: (await linkedinService.getPosts()).length || 0
          }
        };
      }

      return null;
    } catch (error) {
      console.error(`Error processing ${platform} influencer data:`, error);
      throw error;
    }
  };

  // Função principal para processar dados do dashboard
  const processDashboardData = async (instagramData, youtubeData) => {
    try {
      // Processar dados de Instagram
      const instagramPromises = Array.isArray(instagramData)
        ? instagramData.map(data => processInfluencerData(data, 'Instagram'))
        : [];

      // Processar dados de YouTube
      const youtubePromises = Array.isArray(youtubeData)
        ? youtubeData.map(data => processInfluencerData(data, 'YouTube'))
        : [];

      // Obter dados do LinkedIn
      let linkedinInfluencers = [];
      try {
        const linkedinProfile = await linkedinService.getProfile();
        if (linkedinProfile) {
          const processedLinkedin = await processInfluencerData(linkedinProfile, 'LinkedIn');
          if (processedLinkedin) {
            linkedinInfluencers = [processedLinkedin];
          }
        }
      } catch (error) {
        console.error('Error fetching LinkedIn data:', error);
      }

      // Coletar todos os resultados
      const instagramResults = await Promise.all(instagramPromises);
      const youtubeResults = await Promise.all(youtubePromises);

      // Filtrar resultados válidos
      const validInstagramInfluencers = instagramResults.filter(Boolean);
      const validYoutubeInfluencers = youtubeResults.filter(Boolean);

      // Combinar todos os influenciadores
      const allInfluencers = [
        ...validInstagramInfluencers,
        ...validYoutubeInfluencers,
        ...linkedinInfluencers
      ];

      // Calcular estatísticas
      const totalInfluencers = allInfluencers.length;
      const totalFollowers = allInfluencers.reduce((sum, inf) => sum + (inf.followers || 0), 0);
      const totalTrustScore = allInfluencers.reduce((sum, inf) => sum + (inf.trustScore || 0), 0);

      const averageFollowers = totalInfluencers > 0 ? Math.round(totalFollowers / totalInfluencers) : 0;
      const averageTrustScore = totalInfluencers > 0 ? Math.round(totalTrustScore / totalInfluencers) : 0;

      // Simular dados de crescimento para o dashboard
      // Em um cenário real, esses dados viriam de análises históricas
      const monthlyGrowth = Math.round(Math.random() * 10) + 2; // 2-12% de crescimento
      const followerGrowth = Math.round(Math.random() * 15) + 5; // 5-20% de crescimento
      const trustScoreGrowth = Math.round(Math.random() * 8) - 2; // -2 a 6% de crescimento

      return {
        // Ordenar por trustScore para o dashboard
        influencers: allInfluencers.sort((a, b) => b.trustScore - a.trustScore),
        statistics: {
          totalInfluencers,
          averageFollowers,
          averageTrustScore
        },
        trends: {
          monthlyGrowth,
          followerGrowth,
          trustScoreGrowth
        }
      };
    } catch (error) {
      console.error('Error processing dashboard data:', error);
      return {
        influencers: [],
        statistics: {
          totalInfluencers: 0,
          averageFollowers: 0,
          averageTrustScore: 0
        },
        trends: {
          monthlyGrowth: 0,
          followerGrowth: 0,
          trustScoreGrowth: 0
        }
      };
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch data from all platforms
        const instagramPromise = instagramService.getUserMedia().catch(err => {
          console.error('Instagram fetch error:', err);
          return [];
        });

        const youtubePromise = youtubeService.getChannelVideos().catch(err => {
          console.error('YouTube fetch error:', err);
          return [];
        });

        const linkedinPromise = linkedinService.getProfile().catch(err => {
          console.error('LinkedIn fetch error:', err);
          return null;
        });

        // Wait for all promises to resolve
        const [instagramData, youtubeData, linkedinData] = await Promise.all([
          instagramPromise,
          youtubePromise,
          linkedinPromise
        ]);

        // Process the dashboard data
        const processedData = await processDashboardData(instagramData, youtubeData);
        setDashboardData(processedData);
      } catch (err) {
        setError(err.message || t('dashboard.error'));
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [language, t]); // Adiciona language como dependência para recarregar ao mudar o idioma

  const stats = [
    {
      title: t('dashboard.stats.totalInfluencers'),
      value: dashboardData.statistics.totalInfluencers.toString(),
      icon: Users,
      trend: `+${dashboardData.trends.monthlyGrowth}%`,
      description: t('dashboard.stats.comparedToLastMonth')
    },
    {
      title: t('dashboard.stats.averageFollowers'),
      value: dashboardData.statistics.averageFollowers.toLocaleString(),
      icon: BarChart2,
      trend: `+${dashboardData.trends.followerGrowth}%`,
      description: t('dashboard.stats.perInfluencer')
    },
    {
      title: t('dashboard.stats.averageTrustScore'),
      value: `${dashboardData.statistics.averageTrustScore}%`,
      icon: TrendingUp,
      trend: `${dashboardData.trends.trustScoreGrowth > 0 ? '+' : ''}${dashboardData.trends.trustScoreGrowth}%`,
      description: t('dashboard.stats.last30Days')
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">{t('dashboard.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-title">{t('dashboard.errorTitle')}</div>
        <div className="error-message">{error}</div>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={16} style={{ marginRight: '8px' }} />
          {t('dashboard.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${className}`} ref={ref} {...props}>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <RecentInfluencers
        influencers={dashboardData.influencers}
        title={t('dashboard.recentInfluencers')}
        viewAllText={t('dashboard.viewAll')}
      />
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;