import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/hooks/useTranslation';
import '@/styles/pages/Reports.css';

const Reports = () => {
  const { t, language } = useTranslation();
  const [reportType, setReportType] = useState('influencer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [recentReports, setRecentReports] = useState([
    {
      id: 1,
      name: "Relatório de Influenciador - João Silva",
      type: "influencer",
      date: "2025-01-10",
      platform: "Instagram",
      status: "completed"
    },
    {
      id: 2,
      name: "Análise Mensal - Dezembro 2024",
      type: "monthly",
      date: "2025-01-01",
      platform: "Todas",
      status: "completed"
    },
    {
      id: 3,
      name: "Relatório de Categoria - Saúde",
      type: "category",
      date: "2024-12-15",
      platform: "YouTube",
      status: "completed"
    }
  ]);

  useEffect(() => {
    // Carregar relatórios recentes da API em uma implementação real
    const loadRecentReports = async () => {
      try {
        // Aqui seria uma chamada de API real para buscar relatórios recentes
        // const response = await fetch('/api/reports/recent');
        // const data = await response.json();
        // setRecentReports(data);

        // Por enquanto, usamos dados simulados
        console.log(t('reports.loading.recentReports'));
      } catch (error) {
        console.error(t('reports.error.loadingRecentReports'), error);
        setError(t('reports.error.recentReportsLoad'));
      }
    };

    loadRecentReports();
  }, [t]);

  // Função para gerar relatório com base em dados das APIs externas
  const generateReport = async () => {
    if (
      (reportType === 'influencer' && !searchTerm) ||
      (reportType === 'category' && !selectedCategory) ||
      (reportType === 'monthly' && !selectedPeriod)
    ) {
      setError(t('reports.error.requiredFields'));
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      let reportResult = null;

      if (reportType === 'influencer') {
        reportResult = await generateInfluencerReport(searchTerm, selectedPlatform);
      } else if (reportType === 'category') {
        reportResult = await generateCategoryReport(selectedCategory, selectedPlatform);
      } else if (reportType === 'monthly') {
        reportResult = await generateMonthlyReport(selectedPeriod, selectedPlatform);
      }

      if (reportResult) {
        setReportData(reportResult);

        // Adicionar o relatório gerado à lista de relatórios recentes
        const newReport = {
          id: Date.now(),
          name: getReportName(reportType, reportResult),
          type: reportType,
          date: new Date().toISOString().split('T')[0],
          platform: selectedPlatform || t('reports.platforms.all'),
          status: 'completed'
        };

        setRecentReports(prevReports => [newReport, ...prevReports]);
      }
    } catch (error) {
      console.error(t('reports.error.reportGeneration'), error);
      setError(t('reports.error.reportGenerationFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Gerar nome do relatório com base no tipo e resultado
  const getReportName = (type, result) => {
    const date = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });

    if (type === 'influencer') {
      return `${t('reports.reportNames.influencer')} - ${result.influencerName || searchTerm}`;
    } else if (type === 'category') {
      return `${t('reports.reportNames.category')} - ${selectedCategory}`;
    } else if (type === 'monthly') {
      return `${t('reports.reportNames.monthly')} - ${date}`;
    }

    return t('reports.reportNames.new');
  };

  // Gerar relatório de influenciador específico
  const generateInfluencerReport = async (term, platform) => {
    try {
      const platformData = {};

      if (!platform || platform === 'Instagram') {
        try {
          const instagramData = await instagramService.getProfile(term);
          if (instagramData) {
            const mediaInsights = await instagramService.getMediaInsights(instagramData.id);
            const userMedia = await instagramService.getUserMedia();

            platformData.instagram = {
              profile: instagramData,
              mediaInsights,
              engagement: calculateEngagement(userMedia),
              trustScore: await calculateTrustScore(instagramData, 'Instagram')
            };
          }
        } catch (error) {
          console.error(t('reports.error.instagramAPI'), error);
        }
      }

      if (!platform || platform === 'YouTube') {
        try {
          const youtubeData = await youtubeService.searchChannel(term);
          if (youtubeData) {
            const channelVideos = await youtubeService.getChannelVideos(youtubeData.id);

            platformData.youtube = {
              profile: youtubeData,
              videos: channelVideos,
              statistics: youtubeData.statistics,
              trustScore: await calculateTrustScore(youtubeData, 'YouTube')
            };
          }
        } catch (error) {
          console.error(t('reports.error.youtubeAPI'), error);
        }
      }

      if (!platform || platform === 'LinkedIn') {
        try {
          const linkedinData = await linkedinService.getProfile();
          if (linkedinData) {
            const posts = await linkedinService.getPosts();
            const followers = await linkedinService.getFollowers();

            platformData.linkedin = {
              profile: linkedinData,
              posts,
              followers,
              trustScore: await calculateTrustScore(linkedinData, 'LinkedIn')
            };
          }
        } catch (error) {
          console.error(t('reports.error.linkedinAPI'), error);
        }
      }

      // Verificar se temos dados de alguma plataforma
      if (Object.keys(platformData).length === 0) {
        throw new Error(t('reports.error.noInfluencerData'));
      }

      // Construir e retornar o relatório completo
      return {
        influencerName: term,
        generatedAt: new Date().toISOString(),
        platforms: platformData,
        summary: generateInfluencerSummary(platformData)
      };
    } catch (error) {
      console.error(t('reports.error.influencerReportGeneration'), error);
      throw error;
    }
  };

  // Gerar um sumário para o relatório de influenciador
  const generateInfluencerSummary = (platformData) => {
    const summary = {
      totalFollowers: 0,
      averageTrustScore: 0,
      platforms: Object.keys(platformData).length,
      topPlatform: null,
      engagementRate: 0
    };

    let highestFollowers = 0;
    let totalTrustScore = 0;
    let trustScoreCount = 0;

    // Calcular dados agregados de todas as plataformas
    Object.entries(platformData).forEach(([platform, data]) => {
      let followers = 0;

      if (platform === 'instagram') {
        followers = data.profile.media_count || 0;
        summary.totalFollowers += followers;

        if (followers > highestFollowers) {
          highestFollowers = followers;
          summary.topPlatform = 'Instagram';
        }
      }
      else if (platform === 'youtube') {
        followers = parseInt(data.profile.statistics?.subscriberCount) || 0;
        summary.totalFollowers += followers;

        if (followers > highestFollowers) {
          highestFollowers = followers;
          summary.topPlatform = 'YouTube';
        }
      }
      else if (platform === 'linkedin') {
        followers = data.followers?.count || 0;
        summary.totalFollowers += followers;

        if (followers > highestFollowers) {
          highestFollowers = followers;
          summary.topPlatform = 'LinkedIn';
        }
      }

      if (data.trustScore) {
        totalTrustScore += data.trustScore;
        trustScoreCount++;
      }
    });

    // Calcular média do trust score
    if (trustScoreCount > 0) {
      summary.averageTrustScore = Math.round(totalTrustScore / trustScoreCount);
    }

    return summary;
  };

  // Gerar relatório por categoria
  const generateCategoryReport = async (category, platform) => {
    try {
      // Implementação de exemplo, em uma aplicação real isso seria mais robusto
      const influencersByCategory = [];

      if (!platform || platform === 'Instagram') {
        try {
          // Em uma implementação real, você chamaria uma API para buscar todos os influenciadores por categoria
          // Aqui estamos simulando dados
          const instagramInfluencers = await instagramService.searchInfluencersByCategory(category);
          if (instagramInfluencers && instagramInfluencers.length > 0) {
            influencersByCategory.push(...instagramInfluencers.map(inf => ({
              ...inf,
              platform: 'Instagram'
            })));
          }
        } catch (error) {
          console.error(t('reports.error.instagramInfluencersByCategory'), error);
        }
      }

      if (!platform || platform === 'YouTube') {
        try {
          const youtubeInfluencers = await youtubeService.searchChannelsByCategory(category);
          if (youtubeInfluencers && youtubeInfluencers.length > 0) {
            influencersByCategory.push(...youtubeInfluencers.map(inf => ({
              ...inf,
              platform: 'YouTube'
            })));
          }
        } catch (error) {
          console.error(t('reports.error.youtubeInfluencersByCategory'), error);
        }
      }

      // Calcular estatísticas da categoria
      const categorySummary = {
        totalInfluencers: influencersByCategory.length,
        avgFollowers: 0,
        avgEngagement: 0,
        topInfluencers: influencersByCategory.slice(0, 5)
      };

      if (influencersByCategory.length > 0) {
        const totalFollowers = influencersByCategory.reduce((sum, inf) => sum + (inf.followers || 0), 0);
        const totalEngagement = influencersByCategory.reduce((sum, inf) => sum + (inf.engagement || 0), 0);

        categorySummary.avgFollowers = Math.round(totalFollowers / influencersByCategory.length);
        categorySummary.avgEngagement = (totalEngagement / influencersByCategory.length).toFixed(2);
      }

      return {
        category,
        platforms: platform || t('reports.platforms.all'),
        generatedAt: new Date().toISOString(),
        influencers: influencersByCategory,
        summary: categorySummary
      };
    } catch (error) {
      console.error(t('reports.error.categoryReportGeneration'), error);
      throw error;
    }
  };

  // Gerar relatório mensal
  const generateMonthlyReport = async (period, platform) => {
    // Em uma implementação real, você buscaria dados históricos para o período selecionado
    try {
      const startDate = getStartDateForPeriod(period);
      const endDate = new Date().toISOString();

      const reportData = {
        period,
        startDate,
        endDate,
        platforms: {},
        summary: {
          totalNewInfluencers: 0,
          growthRate: 0,
          topCategories: []
        }
      };

      if (!platform || platform === 'Instagram') {
        try {
          const instagramData = await instagramService.getMetricsForPeriod(startDate, endDate);
          reportData.platforms.instagram = instagramData;

          if (instagramData) {
            reportData.summary.totalNewInfluencers += instagramData.newInfluencers || 0;
          }
        } catch (error) {
          console.error(t('reports.error.instagramMetrics'), error);
        }
      }

      if (!platform || platform === 'YouTube') {
        try {
          const youtubeData = await youtubeService.getMetricsForPeriod(startDate, endDate);
          reportData.platforms.youtube = youtubeData;

          if (youtubeData) {
            reportData.summary.totalNewInfluencers += youtubeData.newInfluencers || 0;
          }
        } catch (error) {
          console.error(t('reports.error.youtubeMetrics'), error);
        }
      }

      if (!platform || platform === 'LinkedIn') {
        try {
          const linkedinData = await linkedinService.getMetricsForPeriod(startDate, endDate);
          reportData.platforms.linkedin = linkedinData;

          if (linkedinData) {
            reportData.summary.totalNewInfluencers += linkedinData.newInfluencers || 0;
          }
        } catch (error) {
          console.error(t('reports.error.linkedinMetrics'), error);
        }
      }

      // Categorias mais populares no período
      reportData.summary.topCategories = calculateTopCategoriesForPeriod(reportData.platforms);

      return reportData;
    } catch (error) {
      console.error(t('reports.error.monthlyReportGeneration'), error);
      throw error;
    }
  };

  // Função de exemplo para calcular as categorias mais populares
  const calculateTopCategoriesForPeriod = (platformsData) => {
    // Em uma implementação real, você analisaria os dados de cada plataforma
    // para determinar as categorias mais populares

    // Dados de exemplo
    return [
      { name: t('categories.health'), count: 56 },
      { name: t('categories.fitness'), count: 42 },
      { name: t('categories.lifestyle'), count: 38 },
      { name: t('categories.beauty'), count: 29 },
      { name: t('categories.nutrition'), count: 24 }
    ];
  };

  // Função para determinar a data de início com base no período selecionado
  const getStartDateForPeriod = (period) => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(now.getMonth() - 3);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    return startDate.toISOString();
  };

  // Função para calcular o Trust Score - reutilizada do SearchInfluencer.jsx
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
      console.error(t('reports.error.trustScoreCalculation', { platform }), error);
      return 50; // Valor padrão em caso de erro
    }
  };

  // Analisa o conteúdo para determinar qualidade (0-1) - reutilizada do SearchInfluencer.jsx
  const analyzeContentQuality = (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) return 0.7; // Valor padrão

    // Análise baseada em engagement consistente e captioning
    const engagementConsistency = calculateEngagementConsistency(mediaItems);
    const captionQuality = evaluateCaptionQuality(mediaItems);

    return (engagementConsistency * 0.7) + (captionQuality * 0.3);
  };

  // Calcula a consistência de engagement (0-1) - reutilizada do SearchInfluencer.jsx
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

  // Avalia a qualidade das legendas/descrições (0-1) - reutilizada do SearchInfluencer.jsx
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

  // Calcula taxa de engagement - reutilizada do SearchInfluencer.jsx
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
      console.error(t('reports.error.engagementCalculation'), error);
      return 0;
    }
  };

  // Determina classe CSS para o Trust Score
  const getTrustScoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  // Formata números para exibição
  const formatNumber = (num) => {
    if (!num) return '0';

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Funções para exportação e impressão
  const handleExportPDF = () => {
    if (!reportData) {
      setError(t('reports.error.noReportToExport'));
      return;
    }

    console.log(t('reports.logs.exportingPDF'), reportData);
    // Em uma implementação real, você usaria uma biblioteca como jsPDF ou chamaria uma API
    alert(t('reports.alerts.pdfExportSuccess'));
  };

  const handleExportCSV = () => {
    if (!reportData) {
      setError(t('reports.error.noReportToExport'));
      return;
    }

    console.log(t('reports.logs.exportingCSV'), reportData);
    // Em uma implementação real, você usaria uma biblioteca como PapaParse ou chamaria uma API
    alert(t('reports.alerts.csvExportSuccess'));
  };

  const handlePrint = () => {
    if (!reportData) {
      setError(t('reports.error.noReportToPrint'));
      return;
    }

    window.print();
  };

  const renderReportForm = () => {
    return (
      <div className="report-form">
        {reportType === 'influencer' && (
          <div className="form-group">
            <label htmlFor="search-term">{t('reports.form.influencerName')}</label>
            <Input
              id="search-term"
              placeholder={t('reports.form.placeholders.influencerName')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {reportType === 'category' && (
          <div className="form-group">
            <label htmlFor="category">{t('reports.form.category')}</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder={t('reports.form.placeholders.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Saúde">{t('categories.health')}</SelectItem>
                <SelectItem value="Nutrição">{t('categories.nutrition')}</SelectItem>
                <SelectItem value="Fitness">{t('categories.fitness')}</SelectItem>
                <SelectItem value="Beleza">{t('categories.beauty')}</SelectItem>
                <SelectItem value="Lifestyle">{t('categories.lifestyle')}</SelectItem>
                <SelectItem value="Tecnologia">{t('categories.technology')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="form-group">
            <label htmlFor="period">{t('reports.form.period')}</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger id="period">
                <SelectValue placeholder={t('reports.form.placeholders.selectPeriod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">{t('reports.periods.week')}</SelectItem>
                <SelectItem value="month">{t('reports.periods.month')}</SelectItem>
                <SelectItem value="quarter">{t('reports.periods.quarter')}</SelectItem>
                <SelectItem value="year">{t('reports.periods.year')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="platform">{t('reports.form.platform')}</label>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger id="platform">
              <SelectValue placeholder={t('reports.form.placeholders.selectPlatform')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('reports.platforms.all')}</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderReportPreview = () => {
    if (!reportData) return null;

    return (
      <Card className="report-preview">
        <CardHeader>
          <CardTitle>{t('reports.preview.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {reportType === 'influencer' && (
            <div className="influencer-report">
              <h3>{reportData.influencerName}</h3>
              <div className="report-summary">
                <div className="summary-item">
                  <span className="summary-label">{t('reports.preview.totalFollowers')}:</span>
                  <span className="summary-value">{formatNumber(reportData.summary.totalFollowers)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t('reports.preview.averageTrustScore')}:</span>
                  <span className={`trust-score ${getTrustScoreClass(reportData.summary.averageTrustScore)}`}>
                    {reportData.summary.averageTrustScore}%
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t('reports.preview.mainPlatform')}:</span>
                  <span className="summary-value">{reportData.summary.topPlatform || t('reports.preview.notAvailable')}</span>
                </div>
              </div>

              <div className="platforms-summary">
                <h4>{t('reports.preview.platforms', { count: reportData.summary.platforms })}</h4>
                <div className="platforms-grid">
                  {Object.keys(reportData.platforms).map(platform => (
                    <div key={platform} className="platform-card">
                      <h5>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h5>
                      {platform === 'instagram' && reportData.platforms.instagram && (
                        <div>
                          <p>{t('reports.preview.posts')}: {reportData.platforms.instagram.profile.media_count || 0}</p>
                          <p>{t('reports.preview.engagementRate')}: {reportData.platforms.instagram.engagement || 0}</p>
                          <p>{t('reports.preview.trustScore')}:
                            <span className={`trust-score ${getTrustScoreClass(reportData.platforms.instagram.trustScore)}`}>
                              {reportData.platforms.instagram.trustScore}%
                            </span>
                          </p>
                        </div>
                      )}

                      {platform === 'youtube' && reportData.platforms.youtube && (
                        <div>
                          <p>{t('reports.preview.subscribers')}: {formatNumber(reportData.platforms.youtube.profile.statistics?.subscriberCount)}</p>
                          <p>{t('reports.preview.videos')}: {formatNumber(reportData.platforms.youtube.profile.statistics?.videoCount)}</p>
                          <p>{t('reports.preview.views')}: {formatNumber(reportData.platforms.youtube.profile.statistics?.viewCount)}</p>
                          <p>{t('reports.preview.trustScore')}:
                            <span className={`trust-score ${getTrustScoreClass(reportData.platforms.youtube.trustScore)}`}>
                              {reportData.platforms.youtube.trustScore}%
                            </span>
                          </p>
                        </div>
                      )}

                      {platform === 'linkedin' && reportData.platforms.linkedin && (
                        <div>
                          <p>{t('reports.preview.connections')}: {formatNumber(reportData.platforms.linkedin.followers?.count || 0)}</p>
                          <p>{t('reports.preview.posts')}: {reportData.platforms.linkedin.posts?.length || 0}</p>
                          <p>{t('reports.preview.trustScore')}:
                            <span className={`trust-score ${getTrustScoreClass(reportData.platforms.linkedin.trustScore)}`}>
                              {reportData.platforms.linkedin.trustScore}%
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {reportType === 'category' && (
            <div className="category-report">
              <h3>{t('reports.preview.category')}: {reportData.category}</h3>
              <div className="report-summary">
                <div className="summary-item">
                  <span className="summary-label">{t('reports.preview.totalInfluencers')}:</span>
                  <span className="summary-value">{reportData.summary.totalInfluencers}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t('reports.preview.avgFollowers')}:</span>
                  <span className="summary-value">{formatNumber(reportData.summary.avgFollowers)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t('reports.preview.avgEngagement')}:</span>
                  <span className="summary-value">{reportData.summary.avgEngagement}%</span>
                </div>
              </div>

              {reportData.summary.topInfluencers && reportData.summary.topInfluencers.length > 0 && (
                <div className="top-influencers">
                  <h4>{t('reports.preview.topInfluencers')}</h4>
                  <div className="influencers-list">
                    {reportData.summary.topInfluencers.map((inf, index) => (
                      <div key={index} className="influencer-item">
                        <div className="influencer-rank">{index + 1}</div>
                        <div className="influencer-name">{inf.name || inf.username}</div>
                        <div className="influencer-platform">{inf.platform}</div>
                        <div className="influencer-followers">{formatNumber(inf.followers)} {t('reports.preview.followers')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {reportType === 'monthly' && (
            <div className="monthly-report">
              <h3>{t('reports.preview.monthlyReport', { period: t(`reports.periods.${reportData.period}`) })}</h3>
              <div className="report-summary">
                <div className="summary-item">
                  <span className="summary-label">{t('reports.preview.newInfluencers')}:</span>
                  <span className="summary-value">{reportData.summary.totalNewInfluencers}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t('reports.preview.growthRate')}:</span>
                  <span className="summary-value">{reportData.summary.growthRate || 0}%</span>
                </div>
              </div>

              {reportData.summary.topCategories && reportData.summary.topCategories.length > 0 && (
                <div className="top-categories">
                  <h4>{t('reports.preview.topCategories')}</h4>
                  <div className="categories-list">
                    {reportData.summary.topCategories.map((cat, index) => (
                      <div key={index} className="category-item">
                        <div className="category-name">{cat.name}</div>
                        <div className="category-count">{cat.count} {t('reports.preview.mentions')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="report-actions">
            <Button variant="outline" onClick={handleExportPDF}>
              {t('reports.actions.exportPDF')}
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              {t('reports.actions.exportCSV')}
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              {t('reports.actions.print')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
}
export default Reports;