import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/hooks/useTranslation';
import useAsyncState from '@/hooks/useAsyncState';
import { errorService } from '@/services/errorService';
import '@/styles/pages/InfluencerList.css';

const InfluencerList = React.forwardRef(({ className = '', ...props }, ref) => {
  const { t, language } = useTranslation();

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    platform: ''
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10
  });

  // Usando o hook unificado de estado assíncrono
  const {
    data: influencers,
    loading,
    error,
    execute: fetchInfluencers,
    setData: setInfluencers
  } = useAsyncState(null, {
    errorCategory: errorService.ERROR_CATEGORIES.API,
    onError: (err) => {
      errorService.reportError('influencer_list_error', err, { component: 'InfluencerList' });
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

  // Extrai categorias dos dados do influenciador
  const processCategories = async (data, platform) => {
    if (!data) return ['Geral'];

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
        const categoryMappings = {
          'saude': 'Saúde',
          'fitness': 'Fitness',
          'lifestyle': 'Lifestyle',
          'beleza': 'Beleza',
          'nutrição': 'Nutrição',
          'nutricao': 'Nutrição',
          'moda': 'Moda',
          'esporte': 'Esportes',
          'esportes': 'Esportes',
          'medicina': 'Saúde',
          'yoga': 'Fitness',
          'crossfit': 'Fitness',
          'dieta': 'Nutrição',
          'receitas': 'Alimentação',
          'viagem': 'Viagens',
          'turismo': 'Viagens',
          'tecnologia': 'Tecnologia',
          'games': 'Games',
          'jogos': 'Games'
        };

        // Conta ocorrências de cada categoria
        const categoryCounts = {};
        allHashtags.forEach(tag => {
          Object.entries(categoryMappings).forEach(([key, category]) => {
            if (tag.includes(key)) {
              categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
          });
        });

        // Seleciona as top categorias (até 3)
        const topCategories = Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => entry[0]);

        return topCategories.length > 0 ? topCategories : [t('categories.general')];
      }
      else if (platform === 'YouTube') {
        // Para YouTube, usa categorias do próprio YouTube
        const channelData = data.rawData || data;
        const categoryId = channelData.snippet?.categoryId;

        // Mapeia os IDs de categoria do YouTube para nomes traduzidos
        const youtubeCategoryMap = {
          '1': t('youtube.categories.film'),
          '2': t('youtube.categories.autos'),
          '10': t('categories.music'),
          '15': t('youtube.categories.pets'),
          '17': t('categories.sports'),
          '18': t('youtube.categories.shortMovies'),
          '19': t('youtube.categories.travel'),
          '20': t('categories.games'),
          '21': t('youtube.categories.videoblogs'),
          '22': t('youtube.categories.people'),
          '23': t('youtube.categories.comedy'),
          '24': t('youtube.categories.entertainment'),
          '25': t('youtube.categories.news'),
          '26': t('youtube.categories.howto'),
          '27': t('categories.education'),
          '28': t('categories.technology'),
          '29': t('youtube.categories.nonprofit')
        };

        const categoryName = categoryId ? youtubeCategoryMap[categoryId] : null;

        // Tenta extrair tópicos das tags se disponíveis
        let additionalCategories = [];
        if (channelData.snippet?.tags) {
          const tags = channelData.snippet.tags;
          const commonTags = [
            { key: 'saúde', value: t('categories.health') },
            { key: 'fitness', value: t('categories.fitness') },
            { key: 'medicina', value: t('categories.health') },
            { key: 'nutrição', value: t('categories.nutrition') },
            { key: 'beleza', value: t('categories.beauty') },
            { key: 'lifestyle', value: t('categories.lifestyle') }
          ];

          additionalCategories = commonTags
            .filter(tag => tags.some(t => t.toLowerCase().includes(tag.key.toLowerCase())))
            .map(tag => tag.value);
        }

        // Combina e remove duplicatas
        const allCategories = [...new Set([
          categoryName,
          ...additionalCategories
        ])].filter(Boolean);

        return allCategories.length > 0 ? allCategories : [t('influencerList.generalContent')];
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
          const commonBusinessTerms = {
            'marketing': t('categories.marketing'),
            'vendas': t('categories.sales'),
            'saúde': t('categories.health'),
            'tecnologia': t('categories.technology'),
            'finanças': t('categories.finance'),
            'gestão': t('categories.management'),
            'liderança': t('categories.leadership'),
            'rh': t('categories.hr'),
            'recursos humanos': t('categories.hr'),
            'consultoria': t('categories.consulting'),
            'educação': t('categories.education'),
            'carreira': t('categories.career')
          };

          // Analisa texto dos posts
          const postContents = posts.map(post => post.commentary?.text || '').join(' ').toLowerCase();

          Object.entries(commonBusinessTerms).forEach(([term, category]) => {
            if (postContents.includes(term)) {
              categories.push(category);
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

  // Analisa histórico de posts para detectar fake news
  const checkForFakeNews = async (data, platform) => {
    try {
      // Esta função simula uma análise de conteúdo para detecção de fake news
      // Em uma implementação real, poderia usar um serviço de verificação de fatos

      if (platform === 'Instagram') {
        const userMedia = await instagramService.getUserMedia();
        // Simula verificação de conteúdo com palavras-chave problemáticas
        return userMedia.some(post => {
          const caption = post.caption?.toLowerCase() || '';
          return caption.includes('cura milagrosa') ||
            caption.includes('sem efeitos colaterais') ||
            caption.includes('100% garantido');
        });
      }
      else if (platform === 'YouTube') {
        const videos = await youtubeService.getChannelVideos(data.id);
        // Simula verificação de títulos e descrições
        return videos.some(video => {
          const title = video.snippet?.title?.toLowerCase() || '';
          const description = video.snippet?.description?.toLowerCase() || '';
          return title.includes('cura milagrosa') ||
            description.includes('sem efeitos colaterais') ||
            title.includes('100% garantido');
        });
      }
      else if (platform === 'LinkedIn') {
        const posts = await linkedinService.getPosts();
        // Simula verificação de publicações
        return posts.some(post => {
          const content = post.commentary?.text?.toLowerCase() || '';
          return content.includes('cura milagrosa') ||
            content.includes('sem efeitos colaterais') ||
            content.includes('100% garantido');
        });
      }

      return false; // Padrão: não detectou fake news
    } catch (error) {
      console.error(`Error checking for fake news on ${platform}:`, error);
      return false;
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
        const hasFakeNews = await checkForFakeNews(data, 'Instagram');

        return {
          id: data.id,
          name: data.username,
          platform: 'Instagram',
          followers: data.media_count || 0,
          trustScore,
          categories,
          engagement,
          jaPostouFakeNews: hasFakeNews,
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
        const hasFakeNews = await checkForFakeNews(channelData, 'YouTube');

        return {
          id: channelData.id,
          name: channelData.snippet?.title || data.channelName,
          platform: 'YouTube',
          followers: parseInt(channelData.statistics?.subscriberCount) || 0,
          trustScore,
          categories,
          engagement: parseFloat(channelData.statistics?.engagement || '0'),
          jaPostouFakeNews: hasFakeNews,
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
        const hasFakeNews = await checkForFakeNews(profileData, 'LinkedIn');

        return {
          id: profileData.id,
          name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
          platform: 'LinkedIn',
          followers: followers,
          trustScore,
          categories,
          engagement: 0, // Será calculado com dados reais
          jaPostouFakeNews: hasFakeNews,
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

  // Implementação da busca de influenciadores
  const loadInfluencers = async () => {
    try {
      const platformPromises = [];

      if (!filters.platform || filters.platform === 'Instagram') {
        platformPromises.push(instagramService.getProfile(filters.search)
          .then(data => data ? processInfluencerData(data, 'Instagram') : null)
          .catch(err => {
            console.error('Instagram search error:', err);
            return null;
          })
        );
      }

      if (!filters.platform || filters.platform === 'YouTube') {
        platformPromises.push(youtubeService.searchChannel(filters.search)
          .then(data => data ? processInfluencerData(data, 'YouTube') : null)
          .catch(err => {
            console.error('YouTube search error:', err);
            return null;
          })
        );
      }

      if (!filters.platform || filters.platform === 'LinkedIn') {
        platformPromises.push(linkedinService.getProfile()
          .then(data => data ? processInfluencerData(data, 'LinkedIn') : null)
          .catch(err => {
            console.error('LinkedIn search error:', err);
            return null;
          })
        );
      }

      const platformResults = await Promise.allSettled(platformPromises);

      // Filtra resultados válidos
      let combinedResults = platformResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);

      // Aplica filtro de categoria se necessário
      if (filters.category) {
        combinedResults = combinedResults.filter(inf =>
          inf.categories.some(cat => cat.toLowerCase().includes(filters.category.toLowerCase()))
        );
      }

      // Paginação
      const totalPages = Math.ceil(combinedResults.length / pagination.pageSize);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.max(1, totalPages)
      }));

      const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;

      return combinedResults.slice(startIndex, endIndex);
    } catch (err) {
      throw new Error(err.message || t('influencerList.fetchError'));
    }
  };

  // Executa a busca quando os filtros mudam
  useEffect(() => {
    fetchInfluencers(loadInfluencers);
  }, [filters, pagination.currentPage, language]);

  // Tratamento de mudança de página
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // Manipula a pesquisa
  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setFilters(prev => ({ ...prev, search: event.target.value }));
    }
  };

  // Formata números para exibição
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Determina classe CSS para o Trust Score
  const getTrustScoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  return (
    <div className={`influencer-list-container ${className}`} ref={ref} {...props}>
      <div className="list-header">
        <h2>{t('influencerList.title')}</h2>
        <Button
          onClick={() => window.location.href = '/influencer/new'}
          className="add-button"
        >
          {t('influencerList.addButton')}
        </Button>
      </div>

      <Card className="filter-card">
        <CardContent className="filter-content">
          <div className="filter-section">
            <Input
              placeholder={t('influencerList.searchPlaceholder')}
              onKeyPress={handleSearch}
              className="search-input"
            />

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="category-select">
                <SelectValue placeholder={t('influencerList.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('influencerList.allCategories')}</SelectItem>
                <SelectItem value="Saúde">{t('categories.health')}</SelectItem>
                <SelectItem value="Nutrição">{t('categories.nutrition')}</SelectItem>
                <SelectItem value="Fitness">{t('categories.fitness')}</SelectItem>
                <SelectItem value="Beleza">{t('categories.beauty')}</SelectItem>
                <SelectItem value="Lifestyle">{t('categories.lifestyle')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.platform}
              onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}
            >
              <SelectTrigger className="platform-select">
                <SelectValue placeholder={t('influencerList.allPlatforms')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('influencerList.allPlatforms')}</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('influencerList.loading')}</p>
        </div>
      ) : error ? (
        <div className="error-message">
          {error.message || t('influencerList.errorMessage')}
        </div>
      ) : (
        <Card className="table-card">
          <CardContent className="table-content">
            <table className="influencers-table">
              <thead>
                <tr>
                  <th>{t('influencerList.table.name')}</th>
                  <th>{t('influencerList.table.platform')}</th>
                  <th>{t('influencerList.table.followers')}</th>
                  <th>{t('influencerList.table.categories')}</th>
                  <th>{t('influencerList.table.trustScore')}</th>
                  <th>{t('influencerList.table.fakeNews')}</th>
                  <th>{t('influencerList.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {influencers && influencers.map(influencer => (
                  <tr key={`${influencer.platform}-${influencer.id}`}>
                    <td className="influencer-name">
                      <div className="name-with-image">
                        <img
                          src={influencer.profileUrl}
                          alt={influencer.name}
                          className="profile-thumbnail"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40';
                          }}
                        />
                        {influencer.name}
                      </div>
                    </td>
                    <td>
                      <Badge>{influencer.platform}</Badge>
                    </td>
                    <td>{formatNumber(influencer.followers)}</td>
                    <td>
                      <div className="categories-cell">
                        {influencer.categories.map(category => (
                          <Badge key={category} variant="outline" className="category-badge">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`trust-score-badge ${getTrustScoreClass(influencer.trustScore)}`}>
                        {influencer.trustScore}%
                      </span>
                    </td>
                    <td>
                      <Badge
                        variant={influencer.jaPostouFakeNews ? "destructive" : "outline"}
                        className="status-badge"
                      >
                        {influencer.jaPostouFakeNews ? t('influencerList.yes') : t('influencerList.no')}
                      </Badge>
                    </td>
                    <td>
                      <a
                        href={`/influencer-details/${influencer.id}`}
                        className="view-details"
                      >
                        {t('influencerList.viewDetails')}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!influencers || influencers.length === 0) && (
              <div className="no-results">
                {t('influencerList.noResults')}
              </div>
            )}

            {influencers && influencers.length > 0 && pagination.totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={pagination.currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-button ${pagination.currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
});

InfluencerList.displayName = 'InfluencerList';

export default InfluencerList;