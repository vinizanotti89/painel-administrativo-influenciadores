import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader } from 'lucide-react';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import useTranslation from '@/hooks/useTranslation';
import '@/styles/pages/InfluencerSearchComponent.css';

const InfluencerSearchComponent = React.forwardRef(({ className = '', ...props }, ref) => {
    const { t, language } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useState({
        term: '',
        category: '',
        platform: ''
    });
    const [results, setResults] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10
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
                const categoryMappings = {
                    'saude': t('categories.health'),
                    'fitness': t('categories.fitness'),
                    'lifestyle': t('categories.lifestyle'),
                    'beleza': t('categories.beauty'),
                    'nutrição': t('categories.nutrition'),
                    'nutricao': t('categories.nutrition'),
                    'moda': t('categories.fashion'),
                    'esporte': t('categories.sports'),
                    'esportes': t('categories.sports'),
                    'medicina': t('categories.health'),
                    'yoga': t('categories.fitness'),
                    'crossfit': t('categories.fitness'),
                    'dieta': t('categories.nutrition'),
                    'receitas': t('categories.food'),
                    'viagem': t('categories.travel'),
                    'turismo': t('categories.travel'),
                    'tecnologia': t('categories.technology'),
                    'games': t('categories.games'),
                    'jogos': t('categories.games')
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

                return topCategories.length > 0 ? topCategories : [t('categories.lifestyle')];
            }
            else if (platform === 'YouTube') {
                // Para YouTube, usa categorias do próprio YouTube
                const channelData = data.rawData || data;
                const categoryId = channelData.snippet?.categoryId;

                // Mapeia os IDs de categoria do YouTube para nomes legíveis
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
                    const commonTags = ['saúde', 'fitness', 'medicina', 'nutrição', 'beleza', 'lifestyle'];
                    additionalCategories = commonTags.filter(tag =>
                        tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
                    ).map(tag => tag.charAt(0).toUpperCase() + tag.slice(1));
                }

                // Combina e remove duplicatas
                const allCategories = [...new Set([
                    categoryName,
                    ...additionalCategories
                ])].filter(Boolean);

                return allCategories.length > 0 ? allCategories : [t('influencerSearch.generalContent')];
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

    // Busca influenciadores
    const searchInfluencers = async () => {
        if (!searchParams.term && !searchParams.category && !searchParams.platform) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const platformPromises = [];

            if (!searchParams.platform || searchParams.platform === 'Instagram') {
                platformPromises.push(instagramService.getProfile(searchParams.term)
                    .then(data => data ? processInfluencerData(data, 'Instagram') : null)
                    .catch(err => {
                        console.error('Instagram search error:', err);
                        return null;
                    })
                );
            }

            if (!searchParams.platform || searchParams.platform === 'YouTube') {
                platformPromises.push(youtubeService.searchChannel(searchParams.term)
                    .then(data => data ? processInfluencerData(data, 'YouTube') : null)
                    .catch(err => {
                        console.error('YouTube search error:', err);
                        return null;
                    })
                );
            }

            if (!searchParams.platform || searchParams.platform === 'LinkedIn') {
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
            if (searchParams.category) {
                combinedResults = combinedResults.filter(inf =>
                    inf.categories.some(cat => cat.toLowerCase().includes(searchParams.category.toLowerCase()))
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
            setResults(combinedResults.slice(startIndex, endIndex));

        } catch (err) {
            setError(err.message || t('influencerSearch.errors.fetchError'));
            console.error('Error searching influencers:', err);
        } finally {
            setLoading(false);
        }
    };

    // Tratamento de mudança de página
    const handlePageChange = (page) => {
        setPagination(prev => ({
            ...prev,
            currentPage: page
        }));
        searchInfluencers();
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
        <div className={`search-component-container ${className}`} ref={ref} {...props}>
            <h1 className="search-component-title">{t('influencerSearch.title')}</h1>

            <div className="search-header">
                <div className="search-filters">
                    <Select
                        value={searchParams.category}
                        onValueChange={(value) => setSearchParams(prev => ({ ...prev, category: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('influencerSearch.filters.category')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">{t('influencerSearch.filters.allCategories')}</SelectItem>
                            <SelectItem value={t('categories.health')}>{t('categories.health')}</SelectItem>
                            <SelectItem value={t('categories.nutrition')}>{t('categories.nutrition')}</SelectItem>
                            <SelectItem value={t('categories.fitness')}>{t('categories.fitness')}</SelectItem>
                            <SelectItem value={t('categories.beauty')}>{t('categories.beauty')}</SelectItem>
                            <SelectItem value={t('categories.lifestyle')}>{t('categories.lifestyle')}</SelectItem>
                            <SelectItem value={t('categories.technology')}>{t('categories.technology')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={searchParams.platform}
                        onValueChange={(value) => setSearchParams(prev => ({ ...prev, platform: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('influencerSearch.filters.platform')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">{t('influencerSearch.filters.allPlatforms')}</SelectItem>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="search-bar">
                <Input
                    placeholder={t('influencerSearch.searchPlaceholder')}
                    value={searchParams.term}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, term: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && searchInfluencers()}
                />
                <Button onClick={searchInfluencers} disabled={loading}>
                    {loading ? (
                        <>
                            <Loader className="loader-icon" />
                            <span>{t('influencerSearch.searching')}</span>
                        </>
                    ) : (
                        <>
                            <Search className="search-icon" />
                            <span>{t('influencerSearch.search')}</span>
                        </>
                    )}
                </Button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {results.length > 0 ? (
                <div className="influencers-grid">
                    {results.map((influencer) => (
                        <Card key={influencer.id} className="influencer-card">
                            <CardHeader>
                                <div className="influencer-header">
                                    <img
                                        src={influencer.profileUrl}
                                        alt={influencer.name}
                                        className="profile-image"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/150';
                                        }}
                                    />
                                    <div className="influencer-info">
                                        <CardTitle>{influencer.name}</CardTitle>
                                        <Badge>{influencer.platform}</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="influencer-stats">
                                    <div className="stat-row">
                                        <span className="stat-label">{t('influencerSearch.stats.followers')}:</span>
                                        <span>{formatNumber(influencer.followers)}</span>
                                    </div>
                                    <div className="stat-row">
                                        <span className="stat-label">{t('influencerSearch.stats.trustScore')}:</span>
                                        <span className={`trust-score ${getTrustScoreClass(influencer.trustScore)}`}>
                                            {influencer.trustScore}%
                                        </span>
                                    </div>

                                    {influencer.platform === 'Instagram' && (
                                        <div className="stat-row">
                                            <span className="stat-label">{t('influencerSearch.stats.posts')}:</span>
                                            <span>{influencer.statistics.posts}</span>
                                        </div>
                                    )}

                                    {influencer.platform === 'YouTube' && (
                                        <>
                                            <div className="stat-row">
                                                <span className="stat-label">{t('influencerSearch.stats.views')}:</span>
                                                <span>{formatNumber(influencer.statistics.views)}</span>
                                            </div>
                                            <div className="stat-row">
                                                <span className="stat-label">{t('influencerSearch.stats.videos')}:</span>
                                                <span>{influencer.statistics.videos}</span>
                                            </div>
                                        </>
                                    )}

                                    {influencer.platform === 'LinkedIn' && (
                                        <div className="stat-row">
                                            <span className="stat-label">{t('influencerSearch.stats.connections')}:</span>
                                            <span>{formatNumber(influencer.statistics.connections)}</span>
                                        </div>
                                    )}

                                    <div className="categories">
                                        {influencer.categories.map((category) => (
                                            <Badge key={category} variant="outline" className="category-badge">
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    className="details-button"
                                    onClick={() => window.location.href = `/influencer-details/${influencer.id}`}
                                >
                                    {t('influencerSearch.viewDetails')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                !loading && searchParams.term && (
                    <div className="no-results">
                        <p>{t('influencerSearch.noResults')}</p>
                    </div>
                )
            )}

            {results.length > 0 && pagination.totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                            key={page}
                            variant={pagination.currentPage === page ? 'solid' : 'outline'}
                            onClick={() => handlePageChange(page)}
                            className={`pagination-button ${pagination.currentPage === page ? 'active' : ''}`}
                        >
                            {page}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
});

InfluencerSearchComponent.displayName = 'InfluencerSearchComponent';

export default InfluencerSearchComponent;