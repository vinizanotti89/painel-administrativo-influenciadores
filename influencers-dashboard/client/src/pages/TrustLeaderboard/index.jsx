import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/lib/useTranslation';
import useAsyncState from '@/hooks/useAsyncState';
import { errorService } from '@/services/errorService';
import '@/styles/pages/TrustLeaderboard.css';

const TrustLeaderboard = () => {
    const { t, language } = useTranslation();
    const [influencers, setInfluencers] = useState([]);
    const [metrics, setMetrics] = useState({
        totalVerifiedClaims: 0,
        averageTrustScore: 0
    });

    // Usar o hook unificado de estado assíncrono para carregar dados
    const {
        loading,
        error,
        execute: fetchInfluencerData
    } = useAsyncState(async () => {
        try {
            // Fetch real data from services with proper parameters
            // Para Instagram, precisamos de um username
            const instagramPromise = instagramService.getProfile('health_experts')
                .then(data => processInstagramData(data))
                .catch(err => {
                    console.error('Error fetching Instagram data:', err);
                    return [];
                });

            // Para YouTube, precisamos de um termo de busca
            const youtubePromise = youtubeService.searchChannel('health influencers')
                .then(data => processYoutubeData(data))
                .catch(err => {
                    console.error('Error fetching YouTube data:', err);
                    return [];
                });

            // Para LinkedIn, precisamos do perfil do usuário
            const linkedinPromise = linkedinService.getProfile()
                .then(data => processLinkedinData(data))
                .catch(err => {
                    console.error('Error fetching LinkedIn data:', err);
                    return [];
                });

            // Aguarda todas as requisições
            const results = await Promise.allSettled([
                instagramPromise,
                youtubePromise,
                linkedinPromise
            ]);

            // Processa os resultados válidos
            const processedData = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value)
                .flat()
                .filter(Boolean);

            // Ordena por trustScore
            const sortedInfluencers = processedData.sort((a, b) => b.trustScore - a.trustScore);
            setInfluencers(sortedInfluencers);

            // Calcula métricas
            const metrics = calculateMetrics(sortedInfluencers);
            setMetrics(metrics);

            return sortedInfluencers;
        } catch (err) {
            errorService.reportError('leaderboard_data_error', err, { component: 'TrustLeaderboard' });
            throw err;
        }
    }, {
        errorCategory: errorService.ERROR_CATEGORIES.API
    });

    useEffect(() => {
        fetchInfluencerData();
    }, [fetchInfluencerData]);

    // Processa dados do Instagram
    const processInstagramData = async (profileData) => {
        if (!profileData) return [];

        try {
            // Obtém media insights para cálculos
            const userMedia = await instagramService.getUserMedia();

            if (!userMedia || !userMedia.data) {
                return [];
            }

            // Processa cada perfil
            return Promise.all(userMedia.data.map(async (post) => {
                try {
                    const mediaInsights = await instagramService.getMediaInsights(post.id);
                    const trustScore = calculateTrustScore(post, mediaInsights, 'Instagram');

                    return {
                        id: post.id,
                        name: profileData.username || 'Instagram User',
                        platform: 'Instagram',
                        category: t('categories.health'), // Categorias traduzidas
                        followers: profileData.media_count || 0,
                        trustScore: trustScore,
                        trend: determineTrend(mediaInsights, 'Instagram'),
                        statistics: {
                            verifiedClaims: countVerifiedClaims(mediaInsights, 'Instagram'),
                            totalClaims: mediaInsights ? 1 : 0
                        }
                    };
                } catch (error) {
                    console.error('Error processing Instagram post:', error);
                    return null;
                }
            })).then(results => results.filter(Boolean));
        } catch (error) {
            console.error('Error processing Instagram data:', error);
            return [];
        }
    };

    // Processa dados do YouTube
    const processYoutubeData = async (channelData) => {
        if (!channelData) return [];

        try {
            // Se o retorno for um único objeto, converte para array
            const channels = Array.isArray(channelData) ? channelData : [channelData];

            return channels.map(channel => {
                const trustScore = calculateTrustScore(channel, null, 'YouTube');

                return {
                    id: channel.channelId || channel.id,
                    name: channel.channelName || channel.snippet?.title || t('general.youtubeChannel'),
                    platform: 'YouTube',
                    category: determineYouTubeCategory(channel),
                    followers: parseInt(channel.statistics?.subscriberCount) || 0,
                    trustScore: trustScore,
                    trend: determineTrend(channel, 'YouTube'),
                    statistics: {
                        verifiedClaims: countVerifiedClaims(channel, 'YouTube'),
                        totalClaims: parseInt(channel.statistics?.videoCount) || 0
                    }
                };
            });
        } catch (error) {
            console.error('Error processing YouTube data:', error);
            return [];
        }
    };

    // Processa dados do LinkedIn
    const processLinkedinData = async (profileData) => {
        if (!profileData) return [];

        try {
            // Obtém posts para análise
            const posts = await linkedinService.getPosts();
            const followers = await linkedinService.getFollowers();

            const trustScore = calculateTrustScore(profileData, posts, 'LinkedIn');

            return [{
                id: profileData.id,
                name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
                platform: 'LinkedIn',
                category: t('categories.professional'),
                followers: followers?.count || 0,
                trustScore: trustScore,
                trend: determineTrend(posts, 'LinkedIn'),
                statistics: {
                    verifiedClaims: countVerifiedClaims(posts, 'LinkedIn'),
                    totalClaims: posts?.length || 0
                }
            }];
        } catch (error) {
            console.error('Error processing LinkedIn data:', error);
            return [];
        }
    };

    // Calcula o Trust Score baseado na plataforma
    const calculateTrustScore = (data, additionalData, platform) => {
        if (!data) return 65; // Valor padrão se não houver dados

        try {
            switch (platform) {
                case 'Instagram': {
                    // Cálculo para Instagram baseado em engagement e qualidade de conteúdo
                    const baseScore = 65; // Pontuação base

                    let adjustments = 0;

                    // Ajustes baseados em engajamento
                    if (additionalData) {
                        const likes = data.like_count || 0;
                        const comments = data.comments_count || 0;
                        const engagementScore = likes + comments * 2; // Comentários valem mais

                        if (engagementScore > 1000) adjustments += 15;
                        else if (engagementScore > 500) adjustments += 10;
                        else if (engagementScore > 100) adjustments += 5;
                    }

                    // Ajustes baseados em conteúdo
                    if (data.caption) {
                        const caption = data.caption.toLowerCase();
                        // Detecta palavras-chave baseadas no idioma atual
                        const keywords = {
                            positive: language === 'pt'
                                ? ['fonte:', 'referência:', 'estudo:', 'pesquisa:']
                                : ['source:', 'reference:', 'study:', 'research:'],
                            negative: language === 'pt'
                                ? ['milagre', 'cura garantida', 'segredo revelado']
                                : ['miracle', 'guaranteed cure', 'secret revealed']
                        };

                        // Bonificação para menções a fontes ou referências
                        if (keywords.positive.some(word => caption.includes(word))) {
                            adjustments += 10;
                        }

                        // Penalização para frases típicas de conteúdo não confiável
                        if (keywords.negative.some(word => caption.includes(word))) {
                            adjustments -= 15;
                        }
                    }

                    return Math.min(Math.max(baseScore + adjustments, 30), 100);
                }

                case 'YouTube': {
                    // Dados do canal do YouTube
                    const baseScore = 70; // YouTube tende a ter conteúdo mais elaborado

                    let adjustments = 0;

                    // Ajustes baseados em estatísticas
                    if (data.statistics) {
                        const viewCount = parseInt(data.statistics.viewCount) || 0;
                        const videoCount = parseInt(data.statistics.videoCount) || 0;

                        // Canais com muitos vídeos tendem a ser mais consistentes
                        if (videoCount > 100) adjustments += 10;
                        else if (videoCount > 50) adjustments += 5;

                        // Canais com grande alcance
                        if (viewCount > 1000000) adjustments += 5;
                    }

                    // Ajustes baseados em descrição do canal
                    if (data.snippet?.description) {
                        const description = data.snippet.description.toLowerCase();

                        // Palavras-chave baseadas no idioma
                        const credentialWords = language === 'pt'
                            ? ['médico', 'ph.d', 'especialista', 'profissional']
                            : ['doctor', 'ph.d', 'specialist', 'professional'];

                        const sensationalistWords = language === 'pt'
                            ? ['segredo', 'revelado', 'ninguém conta', 'exclusivo']
                            : ['secret', 'revealed', 'nobody tells', 'exclusive'];

                        // Bonificação para menções a credenciais
                        if (credentialWords.some(word => description.includes(word))) {
                            adjustments += 8;
                        }

                        // Penalização para linguagem sensacionalista
                        if (sensationalistWords.some(word => description.includes(word))) {
                            adjustments -= 10;
                        }
                    }

                    return Math.min(Math.max(baseScore + adjustments, 40), 100);
                }

                case 'LinkedIn': {
                    // LinkedIn normalmente tem conteúdo mais profissional
                    const baseScore = 75;

                    let adjustments = 0;

                    // Ajustes baseados no perfil
                    if (data.headline) {
                        const headline = data.headline.toLowerCase();
                        const expertWords = language === 'pt'
                            ? ['especialista', 'profissional', 'expert']
                            : ['specialist', 'professional', 'expert'];

                        if (expertWords.some(word => headline.includes(word))) {
                            adjustments += 5;
                        }
                    }

                    // Ajustes baseados nos posts
                    if (additionalData && additionalData.length > 0) {
                        // Frequência de postagem indica consistência
                        if (additionalData.length > 20) adjustments += 10;
                        else if (additionalData.length > 10) adjustments += 5;

                        // Análise de conteúdo dos posts poderia ser feita aqui
                    }

                    return Math.min(Math.max(baseScore + adjustments, 50), 100);
                }

                default:
                    return 65; // Valor padrão
            }
        } catch (error) {
            console.error(`Error calculating trust score for ${platform}:`, error);
            return 65; // Valor padrão em caso de erro
        }
    };

    // Determina a tendência (up/down) com base nos dados
    const determineTrend = (data, platform) => {
        // Valor padrão em caso de falta de dados
        if (!data) return 'up';

        try {
            switch (platform) {
                case 'Instagram': {
                    // Verifica se há aumento no engajamento nos dados mais recentes
                    if (Array.isArray(data) && data.length >= 2) {
                        const sortedData = [...data].sort((a, b) =>
                            new Date(b.timestamp) - new Date(a.timestamp)
                        );

                        const recentEngagement = sortedData[0].like_count + sortedData[0].comments_count;
                        const prevEngagement = sortedData[1].like_count + sortedData[1].comments_count;

                        return recentEngagement >= prevEngagement ? 'up' : 'down';
                    }
                    return 'up';
                }

                case 'YouTube': {
                    // Para YouTube, poderiamos analisar crescimento de inscritos ou views
                    // Como não temos dados temporais, atribuímos com base nas métricas
                    const subscriberCount = parseInt(data.statistics?.subscriberCount) || 0;
                    const videoCount = parseInt(data.statistics?.videoCount) || 0;

                    // Canais com boa proporção de inscritos/vídeos tendem a estar crescendo
                    return (subscriberCount / (videoCount || 1)) > 1000 ? 'up' : 'down';
                }

                case 'LinkedIn': {
                    // LinkedIn: analisamos engajamento nos posts
                    if (Array.isArray(data) && data.length >= 2) {
                        // Ordenar por data mais recente
                        const sortedPosts = [...data].sort((a, b) =>
                            new Date(b.created?.time || 0) - new Date(a.created?.time || 0)
                        );

                        // Calcular engajamento médio dos posts recentes vs. anteriores
                        const recentCount = Math.min(3, Math.floor(sortedPosts.length / 2));
                        if (recentCount > 0) {
                            const recentPosts = sortedPosts.slice(0, recentCount);
                            const olderPosts = sortedPosts.slice(recentCount, recentCount * 2);

                            const getEngagement = (post) =>
                                (post.totalShareStatistics?.likeCount || 0) +
                                (post.totalShareStatistics?.commentCount || 0);

                            const recentEngagement = recentPosts.reduce((sum, post) => sum + getEngagement(post), 0) / recentCount;
                            const olderEngagement = olderPosts.reduce((sum, post) => sum + getEngagement(post), 0) / recentCount;

                            return recentEngagement >= olderEngagement ? 'up' : 'down';
                        }
                    }
                    return 'up';
                }

                default:
                    return 'up';
            }
        } catch (error) {
            console.error(`Error determining trend for ${platform}:`, error);
            return 'up'; // Valor padrão em caso de erro
        }
    };

    // Conta alegações verificadas com base na plataforma
    const countVerifiedClaims = (data, platform) => {
        if (!data) return 0;

        try {
            switch (platform) {
                case 'Instagram': {
                    let verifiedCount = 0;

                    // Palavras-chave baseadas no idioma atual
                    const verificationKeywords = language === 'pt'
                        ? ['verificado', 'comprovado', 'estudo:', 'fonte:']
                        : ['verified', 'proven', 'study:', 'source:'];

                    // Procura por indicadores de conteúdo verificado no caption
                    if (Array.isArray(data)) {
                        data.forEach(item => {
                            const caption = item.caption?.toLowerCase() || '';
                            if (verificationKeywords.some(keyword => caption.includes(keyword))) {
                                verifiedCount++;
                            }
                        });
                    }

                    return verifiedCount;
                }

                case 'YouTube': {
                    // Para YouTube, podemos simular com base em proporção
                    const videoCount = parseInt(data.statistics?.videoCount) || 0;
                    // Estimativa: 30% dos vídeos contêm alegações verificadas
                    return Math.round(videoCount * 0.3);
                }

                case 'LinkedIn': {
                    let verifiedCount = 0;

                    // Palavras-chave baseadas no idioma atual
                    const verificationKeywords = language === 'pt'
                        ? ['pesquisa', 'estudo', 'artigo', 'harvard', 'universidade']
                        : ['research', 'study', 'article', 'harvard', 'university'];

                    // Conta posts que mencionam fontes confiáveis
                    if (Array.isArray(data)) {
                        data.forEach(post => {
                            const content = post.commentary?.text?.toLowerCase() || '';
                            if (verificationKeywords.some(keyword => content.includes(keyword))) {
                                verifiedCount++;
                            }
                        });
                    }

                    return verifiedCount;
                }

                default:
                    return 0;
            }
        } catch (error) {
            console.error(`Error counting verified claims for ${platform}:`, error);
            return 0; // Valor padrão em caso de erro
        }
    };

    // Determina a categoria do YouTube com base nos dados do canal
    const determineYouTubeCategory = (channel) => {
        if (!channel) return t('categories.general');

        try {
            // Tenta extrair a categoria das tags, título ou descrição
            const tags = channel.snippet?.tags || [];
            const title = channel.snippet?.title?.toLowerCase() || '';
            const description = channel.snippet?.description?.toLowerCase() || '';

            // Mapeamento de palavras-chave para categorias (baseado no idioma)
            const categoryMappings = language === 'pt'
                ? {
                    'saúde': 'Saúde',
                    'medicina': 'Saúde',
                    'fitness': 'Fitness',
                    'exercício': 'Fitness',
                    'nutrição': 'Nutrição',
                    'alimentação': 'Nutrição',
                    'dieta': 'Nutrição',
                    'beleza': 'Beleza',
                    'estética': 'Beleza',
                    'ciência': 'Ciência',
                    'tecnologia': 'Tecnologia',
                    'educação': 'Educação'
                }
                : {
                    'health': 'Health',
                    'medicine': 'Health',
                    'fitness': 'Fitness',
                    'exercise': 'Fitness',
                    'nutrition': 'Nutrition',
                    'food': 'Nutrition',
                    'diet': 'Nutrition',
                    'beauty': 'Beauty',
                    'aesthetics': 'Beauty',
                    'science': 'Science',
                    'technology': 'Technology',
                    'education': 'Education'
                };

            // Verifica tags
            for (const tag of tags) {
                const tagLower = tag.toLowerCase();
                for (const [keyword, category] of Object.entries(categoryMappings)) {
                    if (tagLower.includes(keyword)) {
                        return category;
                    }
                }
            }

            // Verifica título e descrição
            const content = title + ' ' + description;
            for (const [keyword, category] of Object.entries(categoryMappings)) {
                if (content.includes(keyword)) {
                    return category;
                }
            }

            return t('categories.general');
        } catch (error) {
            console.error('Error determining YouTube category:', error);
            return t('categories.general');
        }
    };

    // Calcula métricas agregadas do leaderboard
    const calculateMetrics = (influencers) => {
        if (!influencers || influencers.length === 0) {
            return {
                totalVerifiedClaims: 0,
                averageTrustScore: 0
            };
        }

        const totalVerified = influencers.reduce((sum, inf) =>
            sum + (inf.statistics?.verifiedClaims || 0), 0);

        const avgTrust = influencers.reduce((sum, inf) =>
            sum + (inf.trustScore || 0), 0) / influencers.length;

        return {
            totalVerifiedClaims: totalVerified,
            averageTrustScore: avgTrust.toFixed(1)
        };
    };

    // Formata números de seguidores para exibição
    const formatFollowers = (count) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    // Retorna a classe CSS com base no Trust Score
    const getTrustScoreClass = (score) => {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    };

    if (loading) {
        return <div className="loading-spinner">{t('leaderboard.loading')}</div>;
    }

    if (error) {
        return <div className="error-message">{t('leaderboard.error')}: {error.message || error}</div>;
    }

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h1 className="leaderboard-title">{t('leaderboard.title')}</h1>
                <p className="leaderboard-description">
                    {t('leaderboard.description')}
                </p>
            </div>

            <div className="metrics-grid">
                <Card className="metric-card">
                    <h2>{t('leaderboard.metrics.activeInfluencers')}</h2>
                    <p className="metric-value">{influencers.length}</p>
                </Card>

                <Card className="metric-card">
                    <h2>{t('leaderboard.metrics.verifiedClaims')}</h2>
                    <p className="metric-value">{metrics.totalVerifiedClaims}</p>
                </Card>

                <Card className="metric-card">
                    <h2>{t('leaderboard.metrics.averageTrustScore')}</h2>
                    <p className="metric-value">{metrics.averageTrustScore}%</p>
                </Card>
            </div>

            <Card className="leaderboard-table-card">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>{t('leaderboard.table.rank')}</th>
                            <th>{t('leaderboard.table.influencer')}</th>
                            <th>{t('leaderboard.table.category')}</th>
                            <th>{t('leaderboard.table.trustScore')}</th>
                            <th>{t('leaderboard.table.trend')}</th>
                            <th>{t('leaderboard.table.followers')}</th>
                            <th>{t('leaderboard.table.verifiedClaims')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {influencers.map((influencer, index) => (
                            <tr key={influencer.id}>
                                <td>#{index + 1}</td>
                                <td className="influencer-name">{influencer.name}</td>
                                <td>
                                    <Badge className="category-badge">
                                        {influencer.category}
                                    </Badge>
                                </td>
                                <td>
                                    <span className={`trust-score-badge ${getTrustScoreClass(influencer.trustScore)}`}>
                                        {influencer.trustScore}%
                                    </span>
                                </td>
                                <td>
                                    {influencer.trend === 'up' ? (
                                        <TrendingUp className="trend-icon up" aria-label={t('leaderboard.trend.up')} />
                                    ) : (
                                        <TrendingDown className="trend-icon down" aria-label={t('leaderboard.trend.down')} />
                                    )}
                                </td>
                                <td className="followers-count">
                                    {formatFollowers(influencer.followers)}
                                </td>
                                <td className="verified-claims">
                                    {influencer.statistics.verifiedClaims}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default TrustLeaderboard;