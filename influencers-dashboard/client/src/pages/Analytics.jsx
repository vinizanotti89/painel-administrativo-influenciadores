import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/lib/useTranslation';
import '@/styles/pages/Analytics.css';

// Componente StatCard para exibir estatísticas individuais
const StatCard = forwardRef(({ title, value }, ref) => {
  return (
    <Card className="stat-card" ref={ref}>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

const Analytics = React.forwardRef(({ className = '', ...props }, ref) => {
  const { t, language } = useTranslation();
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    statistics: {
      totalClaims: 0,
      verificationRate: 0,
      activeInfluencers: 0,
      averageScore: 0
    },
    trendData: [],
    categoryData: []
  });

  // Função auxiliar para obter o título traduzido de cada estatística
  const getStatTitle = (key) => {
    const statTitles = {
      totalClaims: t('analytics.stats.totalClaims'),
      verificationRate: t('analytics.stats.verificationRate'),
      activeInfluencers: t('analytics.stats.activeInfluencers'),
      averageScore: t('analytics.stats.averageScore')
    };

    return statTitles[key] || key;
  };

  // Formata o valor da estatística com base no tipo
  const formatStatValue = (key, value) => {
    switch (key) {
      case 'verificationRate':
        return `${value.toFixed(1)}%`;
      case 'averageScore':
        return `${value.toFixed(1)}`;
      case 'totalClaims':
      case 'activeInfluencers':
        return value.toString();
      default:
        return value.toString();
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch data from all services
        const instagramPromise = instagramService.getUserMedia()
          .catch(err => {
            console.error('Error fetching Instagram data:', err);
            return [];
          });

        const youtubePromise = youtubeService.getChannelVideos()
          .catch(err => {
            console.error('Error fetching YouTube data:', err);
            return [];
          });

        const linkedinPromise = linkedinService.getPosts()
          .catch(err => {
            console.error('Error fetching LinkedIn data:', err);
            return [];
          });

        // Wait for all promises to resolve
        const [instagramStats, youtubeStats, linkedinStats] = await Promise.all([
          instagramPromise,
          youtubePromise,
          linkedinPromise
        ]);

        // Process data from all platforms
        const stats = processStatistics(instagramStats, youtubeStats, linkedinStats, timeRange);
        const trends = processTrendData(instagramStats, youtubeStats, linkedinStats, timeRange);
        const categories = processCategoryData(instagramStats, youtubeStats, linkedinStats);

        setAnalyticsData({
          statistics: stats,
          trendData: trends,
          categoryData: categories
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError(t('analytics.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, t]);

  // Processa estatísticas gerais com base nos dados das plataformas
  const processStatistics = (instagramData, youtubeData, linkedinData, timeRange) => {
    // Inicializa as estatísticas
    let totalClaims = 0;
    let verifiedClaims = 0;
    let activeInfluencers = 0;
    let totalTrustScore = 0;

    try {
      // Processa dados do Instagram
      if (instagramData && Array.isArray(instagramData.data)) {
        const instagramPosts = instagramData.data;

        // Considera apenas posts dentro do intervalo de tempo selecionado
        const filteredPosts = filterDataByTimeRange(instagramPosts, timeRange, 'timestamp');

        totalClaims += filteredPosts.length;

        // Estima alegações verificadas por menções em legendas
        verifiedClaims += countVerifiedClaimsFromInstagram(filteredPosts);

        // Cada conta ativa do Instagram
        activeInfluencers += instagramPosts.length > 0 ? 1 : 0;

        // Trust score para Instagram (estimativa baseada em engagement)
        if (filteredPosts.length > 0) {
          const trustScore = calculateInstagramTrustScore(filteredPosts);
          totalTrustScore += trustScore;
        }
      }

      // Processa dados do YouTube
      if (youtubeData && Array.isArray(youtubeData.items)) {
        const youtubeVideos = youtubeData.items;

        // Filtra vídeos pelo período
        const filteredVideos = filterDataByTimeRange(youtubeVideos, timeRange, 'snippet.publishedAt');

        totalClaims += filteredVideos.length;

        // Estima alegações verificadas pelo conteúdo dos vídeos
        verifiedClaims += calculateVerifiedYouTubeClaims(filteredVideos);

        // Cada canal ativo do YouTube
        const uniqueChannels = new Set(filteredVideos.map(video => video.snippet?.channelId));
        activeInfluencers += uniqueChannels.size;

        // Trust score para YouTube (estimativa baseada em estatísticas)
        if (filteredVideos.length > 0) {
          const trustScore = calculateYouTubeTrustScore(filteredVideos);
          totalTrustScore += trustScore;
        }
      }

      // Processa dados do LinkedIn
      if (linkedinData && Array.isArray(linkedinData)) {
        const linkedinPosts = linkedinData;

        // Filtra posts pelo período
        const filteredPosts = filterDataByTimeRange(linkedinPosts, timeRange, 'created.time');

        totalClaims += filteredPosts.length;

        // Estima alegações verificadas nos posts do LinkedIn
        verifiedClaims += countVerifiedClaimsFromLinkedIn(filteredPosts);

        // Cada perfil ativo do LinkedIn
        activeInfluencers += linkedinPosts.length > 0 ? 1 : 0;

        // Trust score para LinkedIn (estimativa baseada em profissionalismo)
        if (filteredPosts.length > 0) {
          const trustScore = calculateLinkedInTrustScore(filteredPosts);
          totalTrustScore += trustScore;
        }
      }

      // Calcula média de Trust Score e taxa de verificação
      const activePlatforms = (instagramData?.data?.length > 0 ? 1 : 0) +
        (youtubeData?.items?.length > 0 ? 1 : 0) +
        (linkedinData?.length > 0 ? 1 : 0);

      const averageScore = activePlatforms > 0
        ? totalTrustScore / activePlatforms
        : 0;

      const verificationRate = totalClaims > 0
        ? (verifiedClaims / totalClaims) * 100
        : 0;

      return {
        totalClaims,
        verificationRate,
        activeInfluencers,
        averageScore
      };
    } catch (error) {
      console.error('Error processing statistics:', error);
      return {
        totalClaims: 0,
        verificationRate: 0,
        activeInfluencers: 0,
        averageScore: 0
      };
    }
  };

  // Calcula Trust Score para posts do Instagram
  const calculateInstagramTrustScore = (posts) => {
    if (!posts || posts.length === 0) return 65;

    try {
      // Calcula engagement médio
      const totalLikes = posts.reduce((sum, post) => sum + (parseInt(post.like_count) || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (parseInt(post.comments_count) || 0), 0);
      const avgEngagement = (totalLikes + totalComments) / posts.length;

      // Analisa qualidade do conteúdo
      const contentQuality = posts.reduce((sum, post) => {
        const caption = post.caption || '';

        // Fatores positivos na legenda
        let qualityScore = 0;

        // Legenda informativa (comprimento)
        if (caption.length > 200) qualityScore += 10;
        else if (caption.length > 100) qualityScore += 5;

        // Uso de referências
        if (caption.includes('fonte:') || caption.includes('referência:')) qualityScore += 15;

        // Fatores negativos na legenda
        if (caption.includes('milagre') || caption.includes('cura garantida')) qualityScore -= 15;

        return sum + qualityScore;
      }, 0) / posts.length;

      // Calcula score base com ajuste de engagement
      const baseScore = 65;
      const engagementBonus = Math.min(avgEngagement / 50, 20); // Max 20 pontos para engagement

      return Math.min(Math.max(baseScore + engagementBonus + contentQuality, 30), 100);
    } catch (error) {
      console.error('Error calculating Instagram trust score:', error);
      return 65;
    }
  };

  // Calcula Trust Score para vídeos do YouTube
  const calculateYouTubeTrustScore = (videos) => {
    if (!videos || videos.length === 0) return 70;

    try {
      // Base score para YouTube é um pouco maior (conteúdo mais elaborado)
      const baseScore = 70;

      // Bônus por quantidade de vídeos (consistência)
      const videoCountBonus = Math.min(videos.length / 5, 10);

      // Bônus por engajamento
      const likesComments = videos.reduce((sum, video) => {
        const stats = video.statistics || {};
        const likes = parseInt(stats.likeCount) || 0;
        const comments = parseInt(stats.commentCount) || 0;
        return sum + likes + comments;
      }, 0);

      const views = videos.reduce((sum, video) => {
        const stats = video.statistics || {};
        return sum + (parseInt(stats.viewCount) || 0);
      }, 0);

      const engagementRate = views > 0 ? (likesComments / views) * 100 : 0;
      const engagementBonus = Math.min(engagementRate * 2, 15);

      return Math.min(Math.max(baseScore + videoCountBonus + engagementBonus, 40), 100);
    } catch (error) {
      console.error('Error calculating YouTube trust score:', error);
      return 70;
    }
  };

  // Calcula Trust Score para posts do LinkedIn
  const calculateLinkedInTrustScore = (posts) => {
    if (!posts || posts.length === 0) return 75;

    try {
      // LinkedIn tem base score maior (mais profissional)
      const baseScore = 75;

      // Bônus por consistência de postagem
      const postCountBonus = Math.min(posts.length / 5, 8);

      // Bônus por engajamento
      const engagement = posts.reduce((sum, post) => {
        const stats = post.totalShareStatistics || {};
        const likes = parseInt(stats.likeCount) || 0;
        const comments = parseInt(stats.commentCount) || 0;
        const shares = parseInt(stats.shareCount) || 0;
        return sum + likes + (comments * 2) + (shares * 3); // Comentários e compartilhamentos valem mais
      }, 0) / posts.length;

      const engagementBonus = Math.min(engagement / 5, 12);

      // Bônus por conteúdo profissional
      const professionalContentBonus = posts.reduce((sum, post) => {
        const text = post.commentary?.text || '';
        if (text.includes('estudo') ||
          text.includes('pesquisa') ||
          text.includes('análise') ||
          text.includes('dados') ||
          text.includes('estatística')) {
          return sum + 5;
        }
        return sum;
      }, 0) / posts.length;

      return Math.min(Math.max(baseScore + postCountBonus + engagementBonus + professionalContentBonus, 50), 100);
    } catch (error) {
      console.error('Error calculating LinkedIn trust score:', error);
      return 75;
    }
  };

  // Conta alegações verificadas em posts do Instagram
  const countVerifiedClaimsFromInstagram = (posts) => {
    if (!posts || !Array.isArray(posts)) return 0;

    return posts.reduce((count, post) => {
      const caption = post.caption?.toLowerCase() || '';

      // Busca indicadores de verificação na legenda
      if (caption.includes('verificado') ||
        caption.includes('estudo:') ||
        caption.includes('fonte:') ||
        caption.includes('pesquisa:') ||
        caption.includes('comprovado cientificamente')) {
        return count + 1;
      }

      return count;
    }, 0);
  };

  // Estima alegações verificadas em vídeos do YouTube
  const calculateVerifiedYouTubeClaims = (videos) => {
    if (!videos || !Array.isArray(videos)) return 0;

    return videos.reduce((count, video) => {
      const title = video.snippet?.title?.toLowerCase() || '';
      const description = video.snippet?.description?.toLowerCase() || '';

      // Busca indicadores de verificação no título e descrição
      if (title.includes('verificado') ||
        title.includes('comprovado') ||
        description.includes('estudo:') ||
        description.includes('fonte:') ||
        description.includes('referência:') ||
        description.includes('baseado em ciência')) {
        return count + 1;
      }

      return count;
    }, 0);
  };

  // Conta alegações verificadas em posts do LinkedIn
  const countVerifiedClaimsFromLinkedIn = (posts) => {
    if (!posts || !Array.isArray(posts)) return 0;

    return posts.reduce((count, post) => {
      const text = post.commentary?.text?.toLowerCase() || '';

      // Busca indicadores de verificação no texto
      if (text.includes('pesquisa') ||
        text.includes('estudo') ||
        text.includes('dados mostram') ||
        text.includes('artigo publicado') ||
        text.includes('análise mostra')) {
        return count + 1;
      }

      return count;
    }, 0);
  };

  // Filtra dados com base no período selecionado (semana, mês, ano)
  const filterDataByTimeRange = (data, timeRange, dateField) => {
    if (!data || !Array.isArray(data)) return [];

    const now = new Date();
    let cutoffDate;

    switch (timeRange) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1)); // padrão: último mês
    }

    return data.filter(item => {
      // Acessa campo de data aninhado com notação de ponto
      const dateValue = dateField.split('.').reduce((obj, prop) => obj?.[prop], item);

      if (!dateValue) return false;

      const itemDate = new Date(dateValue);
      return itemDate >= cutoffDate;
    });
  };

  // Processa dados de tendência (gráfico de linha) para o período selecionado
  const processTrendData = (instagramData, youtubeData, linkedinData, timeRange) => {
    try {
      // Determina intervalo de datas com base no timeRange
      const datePoints = generateDatePoints(timeRange);

      // Inicializa dados de tendência
      const trendData = datePoints.map(date => ({
        date: date.label,
        total: 0,
        verified: 0,
        timestamp: date.timestamp
      }));

      // Processa dados do Instagram
      if (instagramData && Array.isArray(instagramData.data)) {
        processPlatformTrendData(instagramData.data, trendData, 'timestamp', countVerifiedClaimsFromInstagram);
      }

      // Processa dados do YouTube
      if (youtubeData && Array.isArray(youtubeData.items)) {
        processPlatformTrendData(youtubeData.items, trendData, 'snippet.publishedAt', calculateVerifiedYouTubeClaims);
      }

      // Processa dados do LinkedIn
      if (linkedinData && Array.isArray(linkedinData)) {
        processPlatformTrendData(linkedinData, trendData, 'created.time', countVerifiedClaimsFromLinkedIn);
      }

      // Ordena por data
      return trendData.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error processing trend data:', error);
      return generateDatePoints(timeRange).map(date => ({
        date: date.label,
        total: 0,
        verified: 0
      }));
    }
  };

  // Processa dados de tendência para uma plataforma específica
  const processPlatformTrendData = (platformData, trendData, dateField, verificationCounter) => {
    platformData.forEach(item => {
      // Acessa campo de data aninhado com notação de ponto
      const dateValue = dateField.split('.').reduce((obj, prop) => obj?.[prop], item);

      if (!dateValue) return;

      const itemDate = new Date(dateValue);

      // Encontra o ponto de dados correspondente
      const dataPoint = trendData.find(point => {
        const pointDate = new Date(point.timestamp);

        // Para semana: mesmo dia
        // Para mês: mesmo dia ou intervalo de 3 dias
        // Para ano: mesmo mês
        if (timeRange === 'week') {
          return pointDate.getDate() === itemDate.getDate() &&
            pointDate.getMonth() === itemDate.getMonth();
        } else if (timeRange === 'month') {
          const diffTime = Math.abs(pointDate - itemDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 3;
        } else {
          return pointDate.getMonth() === itemDate.getMonth() &&
            pointDate.getFullYear() === itemDate.getFullYear();
        }
      });

      if (dataPoint) {
        dataPoint.total += 1;

        // Verifica se esta reivindicação é verificada
        if (verificationCounter([item]) > 0) {
          dataPoint.verified += 1;
        }
      }
    });
  };

  // Gera pontos de data baseados no período selecionado
  const generateDatePoints = (timeRange) => {
    const datePoints = [];
    const now = new Date();

    switch (timeRange) {
      case 'week':
        // Últimos 7 dias
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          datePoints.push({
            label: `${date.getDate()}/${date.getMonth() + 1}`,
            timestamp: date.getTime()
          });
        }
        break;

      case 'month':
        // Dividido em 10 pontos para o último mês
        for (let i = 9; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - Math.floor(i * 3));
          datePoints.push({
            label: `${date.getDate()}/${date.getMonth() + 1}`,
            timestamp: date.getTime()
          });
        }
        break;

      case 'year':
        // Últimos 12 meses
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);

          const monthNames = language === 'pt'
            ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

          datePoints.push({
            label: monthNames[date.getMonth()],
            timestamp: date.getTime()
          });
        }
        break;

      default:
        // Padrão: último mês
        for (let i = 9; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - Math.floor(i * 3));
          datePoints.push({
            label: `${date.getDate()}/${date.getMonth() + 1}`,
            timestamp: date.getTime()
          });
        }
    }

    return datePoints;
  };

  // Processa dados para o gráfico de categorias
  const processCategoryData = (instagramData, youtubeData, linkedinData) => {
    try {
      // Mapeamento de categorias comuns
      const categoryMap = {
        // Saúde e bem-estar
        'saude': t('analytics.categories.health'),
        'medicina': t('analytics.categories.health'),
        'health': t('analytics.categories.health'),
        'fitness': t('analytics.categories.fitness'),
        'exercise': t('analytics.categories.fitness'),
        'workout': t('analytics.categories.fitness'),
        'nutricao': t('analytics.categories.nutrition'),
        'nutrition': t('analytics.categories.nutrition'),
        'food': t('analytics.categories.food'),
        'receitas': t('analytics.categories.food'),
        'recipes': t('analytics.categories.food'),

        // Beleza e estilo
        'beauty': t('analytics.categories.beauty'),
        'beleza': t('analytics.categories.beauty'),
        'makeup': t('analytics.categories.beauty'),
        'skincare': t('analytics.categories.beauty'),
        'fashion': t('analytics.categories.fashion'),
        'moda': t('analytics.categories.fashion'),
        'style': t('analytics.categories.fashion'),

        // Tecnologia e ciência
        'tech': t('analytics.categories.technology'),
        'tecnologia': t('analytics.categories.technology'),
        'coding': t('analytics.categories.technology'),
        'programming': t('analytics.categories.technology'),
        'ciencia': t('analytics.categories.science'),
        'science': t('analytics.categories.science'),

        // Negócios e carreira
        'business': t('analytics.categories.business'),
        'negocios': t('analytics.categories.business'),
        'empreendedorismo': t('analytics.categories.entrepreneurship'),
        'entrepreneurship': t('analytics.categories.entrepreneurship'),
        'carreira': t('analytics.categories.career'),
        'career': t('analytics.categories.career'),
        'job': t('analytics.categories.career'),

        // Entretenimento
        'entertainment': t('analytics.categories.entertainment'),
        'entretenimento': t('analytics.categories.entertainment'),
        'games': t('analytics.categories.games'),
        'jogos': t('analytics.categories.games'),
        'movie': t('analytics.categories.movies'),
        'film': t('analytics.categories.movies'),
        'music': t('analytics.categories.music'),
        'musica': t('analytics.categories.music')
      };

      // Contador de categorias
      const categoryCounts = {};

      // Processa dados do Instagram
      if (instagramData && Array.isArray(instagramData.data)) {
        instagramData.data.forEach(post => {
          const caption = post.caption?.toLowerCase() || '';

          Object.entries(categoryMap).forEach(([keyword, category]) => {
            if (caption.includes(keyword)) {
              categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
          });

          // Busca hashtags
          const hashtags = caption.match(/#(\w+)/g) || [];
          hashtags.forEach(tag => {
            const tagText = tag.substring(1).toLowerCase();

            Object.entries(categoryMap).forEach(([keyword, category]) => {
              if (tagText === keyword || tagText.includes(keyword)) {
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
              }
            });
          });
        });
      }

      // Processa dados do YouTube
      if (youtubeData && Array.isArray(youtubeData.items)) {
        youtubeData.items.forEach(video => {
          const title = video.snippet?.title?.toLowerCase() || '';
          const description = video.snippet?.description?.toLowerCase() || '';
          const content = title + ' ' + description;

          Object.entries(categoryMap).forEach(([keyword, category]) => {
            if (content.includes(keyword)) {
              categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
          });
        });
      }

      // Processa dados do LinkedIn
      if (linkedinData && Array.isArray(linkedinData)) {
        linkedinData.forEach(post => {
          const text = post.commentary?.text?.toLowerCase() || '';

          Object.entries(categoryMap).forEach(([keyword, category]) => {
            if (text.includes(keyword)) {
              categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
          });
        });
      }

      // Converte contagens para formato adequado para gráfico
      const categoryData = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Ordena do maior para o menor
        .slice(0, 8); // Limita para as 8 principais categorias

      return categoryData.length > 0 ? categoryData : [
        { name: t('analytics.categories.health'), value: 5 },
        { name: t('analytics.categories.nutrition'), value: 4 },
        { name: t('analytics.categories.fitness'), value: 3 },
        { name: t('analytics.categories.beauty'), value: 3 },
        { name: t('analytics.categories.science'), value: 2 }
      ];
    } catch (error) {
      console.error('Error processing category data:', error);
      return [
        { name: t('analytics.categories.health'), value: 5 },
        { name: t('analytics.categories.nutrition'), value: 4 },
        { name: t('analytics.categories.fitness'), value: 3 },
        { name: t('analytics.categories.beauty'), value: 3 },
        { name: t('analytics.categories.science'), value: 2 }
      ];
    }
  };

  // Cores para o gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#4ECDC4', '#FF9F40'];

  // Handler para mudança no período de tempo
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  return (
    <div className={`analytics-container ${className}`} ref={ref} {...props}>
      <div className="analytics-header">
        <h1 className="analytics-title">{t('analytics.title')}</h1>
        <Select
          value={timeRange}
          onValueChange={handleTimeRangeChange}
          className="time-range-select"
        >
          <SelectTrigger>
            <SelectValue placeholder={t('analytics.timeRanges.selectLabel')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t('analytics.timeRanges.week')}</SelectItem>
            <SelectItem value="month">{t('analytics.timeRanges.month')}</SelectItem>
            <SelectItem value="year">{t('analytics.timeRanges.year')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="loading-spinner">
          {t('analytics.loading')}
        </div>
      ) : error ? (
        <div className="error-message">
          {error}
        </div>
      ) : (
        <>
          <div className="analytics-grid">
            {Object.entries(analyticsData.statistics).map(([key, value]) => (
              <StatCard
                key={key}
                title={getStatTitle(key)}
                value={formatStatValue(key, value)}
              />
            ))}
          </div>

          <div className="analytics-grid">
            <div className="chart-container trend-chart">
              <h2>{t('analytics.charts.claimsTrend')}</h2>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart
                  data={analyticsData.trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name={t('analytics.charts.total')}
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="verified"
                    name={t('analytics.charts.verified')}
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container category-chart">
              <h2>{t('analytics.charts.categoryDistribution')}</h2>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={analyticsData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} ${t('analytics.charts.mentions')}`, t('analytics.charts.amount')]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

Analytics.displayName = 'Analytics';

export default Analytics;