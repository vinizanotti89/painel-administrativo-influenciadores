import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader, Plus, ArrowLeft } from 'lucide-react';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/hooks/useTranslation';
import '@/styles/pages/SearchPage.css';

const SearchPage = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [error, setError] = useState(null);

  // Configurações de pesquisa
  const [timeRange, setTimeRange] = useState('last-month');
  const [claimsToAnalyze, setClaimsToAnalyze] = useState(50);
  const [selectedJournals, setSelectedJournals] = useState([
    'PubMed Central',
    'Nature',
    'Science'
  ]);

  // Lista de journals disponíveis para seleção
  const availableJournals = [
    'PubMed Central', 'Nature', 'Science', 'The Lancet',
    'JAMA', 'New England Journal of Medicine', 'BMJ',
    'Cell', 'PLOS ONE', 'Scientific Reports'
  ];

  const [newJournal, setNewJournal] = useState('');
  const [showJournalDropdown, setShowJournalDropdown] = useState(false);

  // Filtrar journals disponíveis que ainda não foram selecionados
  const filteredJournals = availableJournals.filter(
    journal => !selectedJournals.includes(journal) &&
      journal.toLowerCase().includes(newJournal.toLowerCase())
  );

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Buscar dados do Instagram, YouTube e LinkedIn em paralelo
      const [instagramResults, youtubeResults, linkedinResults] = await Promise.all([
        fetchInstagramData(searchTerm),
        fetchYoutubeData(searchTerm),
        fetchLinkedinData(searchTerm)
      ]);

      // Processar e combinar resultados
      const processedResults = [];

      if (instagramResults) {
        processedResults.push(instagramResults);
      }

      if (youtubeResults) {
        processedResults.push(youtubeResults);
      }

      if (linkedinResults) {
        processedResults.push(linkedinResults);
      }

      setResults(processedResults);
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      setError(t('searchPage.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar dados do Instagram
  const fetchInstagramData = async (username) => {
    try {
      const profile = await instagramService.getProfile(username);

      if (!profile || !profile.id) {
        console.log('Perfil do Instagram não encontrado');
        return null;
      }

      // Buscar publicações para análise
      const posts = await instagramService.getRecentPosts(profile.id, timeRange);

      if (!posts || posts.length === 0) {
        console.log('Nenhuma publicação do Instagram encontrada');
        return {
          id: profile.id,
          name: profile.username || username,
          platform: 'Instagram',
          followers: profile.followers_count || 0,
          claims: 0,
          verifiedClaims: 0,
          trustScore: 0
        };
      }

      // Analisar posts para identificar claims
      const claimsAnalysis = await instagramService.analyzePosts(
        posts.slice(0, claimsToAnalyze)
      );

      // Verificar claims usando journals selecionados
      const verificationResults = await instagramService.verifyClaims(
        claimsAnalysis.claims,
        selectedJournals
      );

      return {
        id: profile.id,
        name: profile.username || username,
        platform: 'Instagram',
        followers: profile.followers_count || 0,
        claims: claimsAnalysis.claims.length,
        verifiedClaims: verificationResults.verifiedCount,
        trustScore: calculateTrustScore(
          verificationResults.verifiedCount,
          claimsAnalysis.claims.length,
          profile.engagement_rate || 0
        )
      };
    } catch (error) {
      console.error(`${t('searchPage.errors.instagram')}`, error);
      return null;
    }
  };

  // Função para buscar dados do YouTube
  const fetchYoutubeData = async (channelName) => {
    try {
      const channelData = await youtubeService.searchChannel(channelName);

      if (!channelData || !channelData.items || channelData.items.length === 0) {
        console.log('Canal do YouTube não encontrado');
        return null;
      }

      const channel = channelData.items[0];

      // Buscar vídeos recentes para análise
      const videos = await youtubeService.getChannelVideos(
        channel.id,
        timeRange,
        claimsToAnalyze
      );

      if (!videos || videos.length === 0) {
        console.log('Nenhum vídeo do YouTube encontrado');
        return {
          id: channel.id,
          name: channel.snippet?.title || channelName,
          platform: 'YouTube',
          followers: parseInt(channel.statistics?.subscriberCount) || 0,
          claims: 0,
          verifiedClaims: 0,
          trustScore: 0
        };
      }

      // Analisar vídeos para identificar claims
      const claimsAnalysis = await youtubeService.analyzeVideos(videos);

      // Verificar claims usando journals selecionados
      const verificationResults = await youtubeService.verifyClaims(
        claimsAnalysis.claims,
        selectedJournals
      );

      return {
        id: channel.id,
        name: channel.snippet?.title || channelName,
        platform: 'YouTube',
        followers: parseInt(channel.statistics?.subscriberCount) || 0,
        claims: claimsAnalysis.claims.length,
        verifiedClaims: verificationResults.verifiedCount,
        trustScore: calculateTrustScore(
          verificationResults.verifiedCount,
          claimsAnalysis.claims.length,
          calculateEngagementRate(channel, videos)
        )
      };
    } catch (error) {
      console.error(`${t('searchPage.errors.youtube')}`, error);
      return null;
    }
  };

  // Função para buscar dados do LinkedIn
  const fetchLinkedinData = async (profileName) => {
    try {
      const profile = await linkedinService.getProfile(profileName);

      if (!profile || !profile.id) {
        console.log('Perfil do LinkedIn não encontrado');
        return null;
      }

      // Buscar posts recentes para análise
      const posts = await linkedinService.getRecentPosts(
        profile.id,
        timeRange,
        claimsToAnalyze
      );

      if (!posts || posts.length === 0) {
        console.log('Nenhum post do LinkedIn encontrado');
        return {
          id: profile.id,
          name: profile.displayName || profileName,
          platform: 'LinkedIn',
          followers: profile.followerCount || 0,
          claims: 0,
          verifiedClaims: 0,
          trustScore: 0
        };
      }

      // Analisar posts para identificar claims
      const claimsAnalysis = await linkedinService.analyzePosts(posts);

      // Verificar claims usando journals selecionados
      const verificationResults = await linkedinService.verifyClaims(
        claimsAnalysis.claims,
        selectedJournals
      );

      return {
        id: profile.id,
        name: profile.displayName || profileName,
        platform: 'LinkedIn',
        followers: profile.followerCount || 0,
        claims: claimsAnalysis.claims.length,
        verifiedClaims: verificationResults.verifiedCount,
        trustScore: calculateTrustScore(
          verificationResults.verifiedCount,
          claimsAnalysis.claims.length,
          profile.engagementRate || 0
        )
      };
    } catch (error) {
      console.error(`${t('searchPage.errors.linkedin')}`, error);
      return null;
    }
  };

  // Calcula o score de confiança com base em claims verificados e taxa de engajamento
  const calculateTrustScore = (verifiedClaims, totalClaims, engagementRate) => {
    if (totalClaims === 0) return 0;

    // Peso para cada fator
    const verificationWeight = 0.7;  // 70% importância para verificação
    const engagementWeight = 0.3;    // 30% importância para engajamento

    // Cálculo do score de verificação (percentual de claims verificados)
    const verificationScore = (verifiedClaims / totalClaims) * 100;

    // Normalização da taxa de engajamento (assume-se que 10% é um bom engajamento)
    const normalizedEngagement = Math.min(engagementRate * 10, 100);

    // Cálculo ponderado do score final
    const trustScore = (verificationScore * verificationWeight) +
      (normalizedEngagement * engagementWeight);

    // Arredonda para um número inteiro
    return Math.round(trustScore);
  };

  // Calcula a taxa de engajamento para o YouTube
  const calculateEngagementRate = (channel, videos) => {
    if (!videos || videos.length === 0) return 0;

    const totalViews = videos.reduce((sum, video) => {
      return sum + parseInt(video.statistics?.viewCount || 0);
    }, 0);

    const totalEngagements = videos.reduce((sum, video) => {
      const likes = parseInt(video.statistics?.likeCount || 0);
      const comments = parseInt(video.statistics?.commentCount || 0);
      return sum + likes + comments;
    }, 0);

    // Taxa de engajamento = (engajamentos / visualizações) * 100
    return totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0;
  };

  // Adicionar um novo journal à lista
  const addJournal = (journal) => {
    if (!selectedJournals.includes(journal)) {
      setSelectedJournals([...selectedJournals, journal]);
    }
    setNewJournal('');
    setShowJournalDropdown(false);
  };

  // Remover um journal da lista
  const removeJournal = (journalToRemove) => {
    setSelectedJournals(selectedJournals.filter(journal => journal !== journalToRemove));
  };

  return (
    <div className="search-container">
      {/* Header */}
      <div className="search-header">
        <h1 className="search-title">{t('searchPage.title')}</h1>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="config-toggle-btn"
        >
          {showConfig ? (
            <>
              <ArrowLeft className="btn-icon" />
              {t('searchPage.configButton.backToResults')}
            </>
          ) : (
            t('searchPage.configButton.showConfig')
          )}
        </button>
      </div>

      {!showConfig ? (
        // Search and Results View
        <div className="search-content">
          <Card>
            <CardHeader>
              <CardTitle>{t('searchPage.searchSection.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="search-bar">
                <div className="search-input-container">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('searchPage.searchSection.inputPlaceholder')}
                    className="search-input"
                  />
                  <Search className="search-icon" />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="search-button"
                >
                  {loading ? (
                    <div className="loading-container">
                      <Loader className="loading-spinner" />
                      <span>{t('searchPage.searchSection.searching')}</span>
                    </div>
                  ) : (
                    t('searchPage.searchSection.button')
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="results-grid">
              {results.map((result) => (
                <Card key={`${result.platform}-${result.id}`} className="result-card">
                  <CardContent>
                    <div className="result-header">
                      <div className="result-info">
                        <h3 className="result-name">{result.name}</h3>
                        <p className="result-platform">
                          {result.platform} • {result.followers.toLocaleString()} {t('searchPage.results.followers')}
                        </p>
                      </div>
                      <div className="result-score">
                        <div
                          className={`trust-score ${result.trustScore >= 80 ? 'high' :
                            result.trustScore >= 50 ? 'medium' : 'low'
                            }`}
                        >
                          {result.trustScore}%
                        </div>
                        <p className="score-label">{t('searchPage.results.trustScore')}</p>
                      </div>
                    </div>

                    <div className="result-stats">
                      <div className="stat-box">
                        <div className="stat-value">{result.claims}</div>
                        <div className="stat-label">{t('searchPage.results.totalClaims')}</div>
                      </div>
                      <div className="stat-box">
                        <div className={`stat-value ${result.verifiedClaims > 0 ? 'verified' : ''}`}>
                          {result.verifiedClaims}
                        </div>
                        <div className="stat-label">{t('searchPage.results.verifiedClaims')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {results.length === 0 && searchTerm && !loading && !error && (
            <div className="no-results">
              <p>{t('searchPage.results.noResults').replace('{term}', searchTerm)}</p>
              <p>{t('searchPage.results.tryDifferent')}</p>
            </div>
          )}
        </div>
      ) : (
        // Configuration View
        <Card className="config-card">
          <CardHeader>
            <CardTitle>{t('searchPage.configSection.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="config-grid">
              <div className="config-section">
                <div className="config-group">
                  <h3 className="config-title">{t('searchPage.configSection.timeRange.title')}</h3>
                  <div className="time-range-buttons">
                    {[
                      { id: 'last-week', label: t('searchPage.configSection.timeRange.lastWeek') },
                      { id: 'last-month', label: t('searchPage.configSection.timeRange.lastMonth') },
                      { id: 'all-time', label: t('searchPage.configSection.timeRange.allTime') }
                    ].map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setTimeRange(range.id)}
                        className={`time-range-btn ${timeRange === range.id ? 'active' : ''}`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="config-group">
                  <h3 className="config-title">{t('searchPage.configSection.claims.title')}</h3>
                  <div className="claims-input-container">
                    <input
                      type="number"
                      value={claimsToAnalyze}
                      onChange={(e) => setClaimsToAnalyze(Math.max(1, Math.min(100, Number(e.target.value))))}
                      className="claims-input"
                      min={1}
                      max={100}
                    />
                    <span className="claims-limit">{t('searchPage.configSection.claims.maxLimit')}</span>
                  </div>
                  <p className="config-description">
                    {t('searchPage.configSection.claims.description')}
                  </p>
                </div>
              </div>

              <div className="config-section">
                <div className="config-group">
                  <h3 className="config-title">{t('searchPage.configSection.journals.title')}</h3>
                  <p className="config-description">
                    {t('searchPage.configSection.journals.description')}
                  </p>
                  <div className="journals-container">
                    {selectedJournals.map((journal) => (
                      <Badge key={journal} className="journal-badge">
                        {journal}
                        <button
                          className="remove-journal-btn"
                          onClick={() => removeJournal(journal)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}

                    <div className="journal-dropdown-container">
                      <button
                        className="add-journal-btn"
                        onClick={() => setShowJournalDropdown(!showJournalDropdown)}
                      >
                        <Plus className="plus-icon" />
                        <span>{t('searchPage.configSection.journals.add')}</span>
                      </button>

                      {showJournalDropdown && (
                        <div className="journal-dropdown">
                          <input
                            type="text"
                            value={newJournal}
                            onChange={(e) => setNewJournal(e.target.value)}
                            placeholder={t('searchPage.configSection.journals.filterPlaceholder')}
                            className="journal-filter-input"
                          />

                          <div className="journal-options">
                            {filteredJournals.length > 0 ? (
                              filteredJournals.map(journal => (
                                <div
                                  key={journal}
                                  className="journal-option"
                                  onClick={() => addJournal(journal)}
                                >
                                  {journal}
                                </div>
                              ))
                            ) : (
                              <div className="no-journals">
                                {t('searchPage.configSection.journals.noJournals')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;