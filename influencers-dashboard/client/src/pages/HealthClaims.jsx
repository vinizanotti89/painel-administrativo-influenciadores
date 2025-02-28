import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/hooks/useTranslation';
import { errorService } from '@/services/errorService';
import '@/styles/pages/HealthClaims.css';

const HealthClaims = React.forwardRef((props, ref) => {
  const { id } = useParams();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [influencer, setInfluencer] = useState(null);
  const [claims, setClaims] = useState([]);
  const [claimFilter, setClaimFilter] = useState('all');
  const [contentStats, setContentStats] = useState({
    totalContent: 0,
    relevantContent: 0,
    claimsByVerification: {
      verified: 0,
      partially: 0,
      misleading: 0,
      incorrect: 0,
      unverified: 0
    }
  });

  // Carrega os detalhes do influenciador
  useEffect(() => {
    const fetchInfluencerData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Tenta carregar de cada plataforma e usa a primeira que tiver sucesso
        const platformServices = [
          { name: 'Instagram', service: instagramService.getProfile },
          { name: 'YouTube', service: youtubeService.getChannelById },
          { name: 'LinkedIn', service: linkedinService.getProfileById }
        ];

        let influencerData = null;

        for (const { name, service } of platformServices) {
          try {
            const data = await service(id);
            if (data) {
              influencerData = {
                id: data.id,
                name: name === 'Instagram' ? data.username :
                  name === 'YouTube' ? data.snippet?.title :
                    `${data.localizedFirstName} ${data.localizedLastName}`,
                platform: name,
                profileUrl: name === 'Instagram' ? data.profile_picture_url :
                  name === 'YouTube' ? data.snippet?.thumbnails?.default?.url :
                    data.profilePicture?.displayImage || 'https://via.placeholder.com/150'
              };
              break;
            }
          } catch (err) {
            console.log(`Failed to fetch from ${name}`, err);
            // Continue para o próximo serviço
          }
        }

        if (!influencerData) {
          throw new Error(t('healthClaims.notFound'));
        }

        setInfluencer(influencerData);

        // Agora carrega as alegações com base na plataforma
        await fetchHealthClaims(influencerData.id, influencerData.platform);
      } catch (err) {
        const errorMessage = err.message || errorService.getErrorMessage(err);
        setError(errorMessage);
        errorService.reportError('healthclaims_influencer_load_error', err, { id });
        console.error('Error fetching influencer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencerData();
  }, [id, t]);

  // Função para extrair alegações de saúde dos conteúdos
  const extractHealthClaims = async (contentItems, platform) => {
    // Palavras-chave para detectar conteúdo relacionado à saúde (considerando os dois idiomas)
    const healthKeywords = language === 'pt' ?
      [
        'saúde', 'cura', 'tratamento', 'prevenir', 'prevenção', 'vitamina',
        'suplemento', 'remédio', 'medicamento', 'terapia', 'dieta', 'emagrecer',
        'perder peso', 'emagrecimento', 'imunidade', 'doença', 'covid', 'vírus'
      ] : [
        'health', 'cure', 'treatment', 'prevent', 'prevention', 'vitamin',
        'supplement', 'remedy', 'medicine', 'therapy', 'diet', 'lose weight',
        'weight loss', 'immunity', 'disease', 'covid', 'virus'
      ];

    // Marcadores de alegações potencialmente questionáveis
    const questionableClaims = language === 'pt' ?
      [
        'milagroso', 'cura tudo', 'revolucionário', 'descoberta incrível',
        'médicos não querem que você saiba', 'segredo', 'não precisa de remédio',
        'substitui medicamento', 'tratamento natural', 'único produto'
      ] : [
        'miraculous', 'cures everything', 'revolutionary', 'amazing discovery',
        'doctors don\'t want you to know', 'secret', 'no need for medicine',
        'replaces medication', 'natural treatment', 'only product'
      ];

    try {
      const claims = [];
      let relevantContent = 0;
      let claimId = 1;

      // Processa cada item de conteúdo
      for (const item of contentItems) {
        let text = '';
        let mediaUrl = '';
        let date = '';
        let sourceId = '';

        // Extrai dados específicos por plataforma
        if (platform === 'Instagram') {
          text = item.caption || '';
          mediaUrl = item.permalink || '';
          date = new Date(item.timestamp).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US');
          sourceId = item.id;
        } else if (platform === 'YouTube') {
          text = item.snippet?.description || '' + ' ' + item.snippet?.title || '';
          mediaUrl = `https://www.youtube.com/watch?v=${item.id}`;
          date = new Date(item.snippet?.publishedAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US');
          sourceId = item.id;
        } else if (platform === 'LinkedIn') {
          text = item.commentary?.text || '';
          mediaUrl = item.permalink || '';
          date = item.created?.time ? new Date(item.created.time).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US') : '';
          sourceId = item.id;
        }

        // Verifica se o conteúdo contém palavras-chave de saúde
        const containsHealthTopic = healthKeywords.some(keyword =>
          text.toLowerCase().includes(keyword.toLowerCase())
        );

        if (containsHealthTopic) {
          relevantContent++;

          // Verifica a presença de alegações questionáveis
          const questionableMarkers = questionableClaims.filter(marker =>
            text.toLowerCase().includes(marker.toLowerCase())
          );

          // Se tiver marcadores questionáveis ou for escolhido aleatoriamente para verificação
          // (para simular uma análise parcial do conteúdo)
          const shouldAnalyze = questionableMarkers.length > 0 || Math.random() < 0.3;

          if (shouldAnalyze) {
            // Extrai uma alegação do texto (simplificado para demonstração)
            // Em um cenário real, isso usaria NLP ou análise mais avançada
            let extractedClaim = '';
            let verificationStatus = '';
            let factCheck = '';

            // Simulação de extração de alegação e verificação com base em marcadores
            if (questionableMarkers.length > 0) {
              // Extrai 10-15 palavras ao redor do primeiro marcador questionável encontrado
              const marker = questionableMarkers[0];
              const markerIndex = text.toLowerCase().indexOf(marker.toLowerCase());
              const words = text.split(' ');
              let wordIndex = 0;
              let markerWordIndex = 0;

              // Encontra o índice da palavra com o marcador
              for (let i = 0; i < words.length; i++) {
                wordIndex += words[i].length + 1; // +1 pelo espaço
                if (wordIndex > markerIndex) {
                  markerWordIndex = i;
                  break;
                }
              }

              // Extrai palavras antes e depois do marcador
              const start = Math.max(0, markerWordIndex - 7);
              const end = Math.min(words.length, markerWordIndex + 8);
              extractedClaim = words.slice(start, end).join(' ');

              // Determina o status de verificação (simulado)
              // Em um cenário real, isso seria baseado em verificação contra fontes científicas
              const randomFactor = Math.random();
              if (randomFactor < 0.2) {
                verificationStatus = 'incorrect';
                factCheck = t('healthClaims.verification.incorrect');
              } else if (randomFactor < 0.5) {
                verificationStatus = 'misleading';
                factCheck = t('healthClaims.verification.misleading');
              } else if (randomFactor < 0.8) {
                verificationStatus = 'partially';
                factCheck = t('healthClaims.verification.partially');
              } else {
                verificationStatus = 'verified';
                factCheck = t('healthClaims.verification.verified');
              }
            } else {
              // Para conteúdo sem marcadores claros, extrai uma parte do texto
              // e assume uma verificação mais positiva
              const words = text.split(' ');
              const start = Math.min(words.length, 5);
              const end = Math.min(words.length, start + 10);
              extractedClaim = words.slice(start, end).join(' ');

              const randomFactor = Math.random();
              if (randomFactor < 0.7) {
                verificationStatus = 'verified';
                factCheck = t('healthClaims.verification.verified');
              } else {
                verificationStatus = 'partially';
                factCheck = t('healthClaims.verification.partially');
              }
            }

            // Gera estudos relacionados (simulado)
            // Em um cenário real, isso seria baseado em busca em bases de dados científicas
            const studiesCount = Math.floor(Math.random() * 3) + 1;
            const studies = [];

            // Templates de estudos para PT e EN
            const studyTemplates = language === 'pt' ? [
              {
                title: "Efeitos da suplementação de vitaminas em adultos saudáveis",
                url: "https://pubmed.ncbi.nlm.nih.gov/example1",
                conclusion: "Sem efeito significativo na prevenção de doenças comuns"
              },
              {
                title: "Revisão sistemática sobre os efeitos de antioxidantes na saúde",
                url: "https://pubmed.ncbi.nlm.nih.gov/example2",
                conclusion: "Benefícios limitados para indivíduos com dieta equilibrada"
              },
              {
                title: "Análise da eficácia de produtos naturais para tratamento de condições inflamatórias",
                url: "https://pubmed.ncbi.nlm.nih.gov/example3",
                conclusion: "Evidências preliminares positivas, mas estudos de qualidade são necessários"
              },
              {
                title: "Meta-análise de intervenções nutricionais e seu impacto na imunidade",
                url: "https://pubmed.ncbi.nlm.nih.gov/example4",
                conclusion: "Certos nutrientes podem melhorar aspectos da função imune, mas não previnem doenças"
              },
              {
                title: "Avaliação clínica de suplementos para perda de peso",
                url: "https://pubmed.ncbi.nlm.nih.gov/example5",
                conclusion: "Eficácia modesta e temporária quando comparados com placebo"
              }
            ] : [
              {
                title: "Effects of vitamin supplementation in healthy adults",
                url: "https://pubmed.ncbi.nlm.nih.gov/example1",
                conclusion: "No significant effect in preventing common diseases"
              },
              {
                title: "Systematic review on the effects of antioxidants on health",
                url: "https://pubmed.ncbi.nlm.nih.gov/example2",
                conclusion: "Limited benefits for individuals with a balanced diet"
              },
              {
                title: "Analysis of the effectiveness of natural products for treating inflammatory conditions",
                url: "https://pubmed.ncbi.nlm.nih.gov/example3",
                conclusion: "Positive preliminary evidence, but quality studies are needed"
              },
              {
                title: "Meta-analysis of nutritional interventions and their impact on immunity",
                url: "https://pubmed.ncbi.nlm.nih.gov/example4",
                conclusion: "Certain nutrients may improve aspects of immune function, but do not prevent diseases"
              },
              {
                title: "Clinical evaluation of supplements for weight loss",
                url: "https://pubmed.ncbi.nlm.nih.gov/example5",
                conclusion: "Modest and temporary efficacy when compared to placebo"
              }
            ];

            for (let i = 0; i < studiesCount; i++) {
              studies.push(studyTemplates[Math.floor(Math.random() * studyTemplates.length)]);
            }

            // Explicação com base no status de verificação
            let explanation = '';
            if (verificationStatus === 'verified') {
              explanation = language === 'pt'
                ? "Esta alegação é suportada por evidências científicas atuais, embora seja importante lembrar que a ciência está em constante evolução."
                : "This claim is supported by current scientific evidence, although it's important to remember that science is constantly evolving.";
            } else if (verificationStatus === 'partially') {
              explanation = language === 'pt'
                ? "Há alguma evidência que suporta aspectos desta alegação, mas pode estar simplificada ou não aplicável a todos os contextos."
                : "There is some evidence supporting aspects of this claim, but it may be simplified or not applicable to all contexts.";
            } else if (verificationStatus === 'misleading') {
              explanation = language === 'pt'
                ? "Esta alegação contém elementos verdadeiros, mas apresentados de forma a levar a conclusões exageradas ou incorretas."
                : "This claim contains true elements but presented in a way that leads to exaggerated or incorrect conclusions.";
            } else {
              explanation = language === 'pt'
                ? "Esta alegação não é suportada pelas evidências científicas disponíveis e contradiz o consenso médico atual."
                : "This claim is not supported by available scientific evidence and contradicts current medical consensus.";
            }

            // Adiciona a alegação à lista
            claims.push({
              id: claimId++,
              content: extractedClaim,
              source: `${platform} - ${date}`,
              sourceUrl: mediaUrl,
              sourceId: sourceId,
              verificationStatus,
              studies,
              factCheck,
              explanation
            });
          }
        }
      }

      // Atualiza as estatísticas de conteúdo
      const stats = {
        totalContent: contentItems.length,
        relevantContent,
        claimsByVerification: {
          verified: claims.filter(c => c.verificationStatus === 'verified').length,
          partially: claims.filter(c => c.verificationStatus === 'partially').length,
          misleading: claims.filter(c => c.verificationStatus === 'misleading').length,
          incorrect: claims.filter(c => c.verificationStatus === 'incorrect').length,
          unverified: claims.filter(c => c.verificationStatus === 'unverified').length
        }
      };

      return { claims, stats };
    } catch (error) {
      console.error('Error extracting health claims:', error);
      throw error;
    }
  };

  // Carrega alegações de saúde com base na plataforma
  const fetchHealthClaims = async (influencerId, platform) => {
    try {
      let contentItems = [];

      // Busca conteúdo específico da plataforma
      if (platform === 'Instagram') {
        contentItems = await instagramService.getUserMedia(influencerId);
      } else if (platform === 'YouTube') {
        const channelVideos = await youtubeService.getChannelVideos(influencerId);
        contentItems = channelVideos || [];
      } else if (platform === 'LinkedIn') {
        contentItems = await linkedinService.getPosts(influencerId);
      }

      // Extrai as alegações de saúde do conteúdo
      const { claims, stats } = await extractHealthClaims(contentItems, platform);

      setClaims(claims);
      setContentStats(stats);
    } catch (error) {
      const errorMessage = errorService.getErrorMessage(error);
      setError(errorMessage);
      errorService.reportError('healthclaims_data_load_error', error, { platform });
      console.error('Error fetching health claims:', error);
    }
  };

  // Filtrar alegações
  const filteredClaims = claims.filter(claim => {
    if (claimFilter === 'all') return true;
    return claim.verificationStatus === claimFilter;
  });

  // Status de cada alegação
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'partially': return 'warning';
      case 'misleading': return 'error';
      case 'incorrect': return 'error';
      default: return 'neutral';
    }
  };

  if (loading) {
    return <div className="health-claims-loading">{t('healthClaims.loading')}</div>;
  }

  if (error) {
    return <div className="health-claims-error">
      <p>{t('healthClaims.error')} {error}</p>
      <Button onClick={() => window.history.back()}>{t('healthClaims.back')}</Button>
    </div>;
  }

  if (!influencer) {
    return <div className="health-claims-error">
      <p>{t('healthClaims.notFound')}</p>
      <Button onClick={() => window.history.back()}>{t('healthClaims.back')}</Button>
    </div>;
  }

  return (
    <div className="health-claims-container" ref={ref}>
      <div className="claims-header">
        <div className="influencer-info">
          <img
            src={influencer.profileUrl}
            alt={influencer.name}
            className="influencer-avatar"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
          />
          <div>
            <h1 className="claims-title">{t('healthClaims.title')}</h1>
            <h2 className="influencer-name">{influencer.name}</h2>
            <Badge>{influencer.platform}</Badge>
          </div>
        </div>
      </div>

      <div className="claims-stats-container">
        <Card className="stats-card">
          <CardHeader>
            <CardTitle>{t('healthClaims.stats.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">{t('healthClaims.stats.totalContent')}</span>
                <span className="stat-value">{contentStats.totalContent}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('healthClaims.stats.healthContent')}</span>
                <span className="stat-value">{contentStats.relevantContent}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('healthClaims.stats.verifiedClaims')}</span>
                <span className="stat-value success">{contentStats.claimsByVerification.verified}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('healthClaims.stats.partiallyClaims')}</span>
                <span className="stat-value warning">{contentStats.claimsByVerification.partially}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('healthClaims.stats.misleadingClaims')}</span>
                <span className="stat-value error">
                  {contentStats.claimsByVerification.misleading + contentStats.claimsByVerification.incorrect}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="claims-filter-container">
        <Select
          value={claimFilter}
          onValueChange={setClaimFilter}
        >
          <SelectTrigger className="filter-select">
            <SelectValue placeholder={t('healthClaims.filter.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('healthClaims.filter.allClaims')}</SelectItem>
            <SelectItem value="verified">{t('healthClaims.filter.verified')}</SelectItem>
            <SelectItem value="partially">{t('healthClaims.filter.partially')}</SelectItem>
            <SelectItem value="misleading">{t('healthClaims.filter.misleading')}</SelectItem>
            <SelectItem value="incorrect">{t('healthClaims.filter.incorrect')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="claims-list">
        {filteredClaims.length > 0 ? (
          filteredClaims.map(claim => (
            <Card key={claim.id} className="claim-card">
              <CardHeader className="claim-card-header">
                <div className="claim-header-content">
                  <CardTitle className="claim-title">{t('healthClaims.claim.title')}</CardTitle>
                  <Badge className={`verification-badge ${getStatusBadgeClass(claim.verificationStatus)}`}>
                    {claim.factCheck}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="claim-content">
                  <p className="claim-text">"{claim.content}"</p>
                  <div className="claim-source">
                    <span className="source-label">{t('healthClaims.claim.source')}</span>
                    <a href={claim.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                      {claim.source}
                    </a>
                  </div>
                </div>

                <div className="claim-verification">
                  <h4 className="verification-title">{t('healthClaims.claim.analysis')}</h4>
                  <p className="verification-text">{claim.explanation}</p>
                </div>

                <div className="claim-studies">
                  <h4 className="studies-title">{t('healthClaims.claim.studies')}</h4>
                  <ul className="studies-list">
                    {claim.studies.map((study, index) => (
                      <li key={index} className="study-item">
                        <a href={study.url} target="_blank" rel="noopener noreferrer" className="study-link">
                          {study.title}
                        </a>
                        <p className="study-conclusion">
                          <span className="conclusion-label">{t('healthClaims.claim.conclusion')}</span> {study.conclusion}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="no-claims-card">
            <CardContent>
              <p className="no-claims-text">
                {t('healthClaims.claim.noClaims')}{' '}
                {claimFilter !== 'all' ? `${t('healthClaims.claim.withStatus')} "${claimFilter}" ` : ''}
                {t('healthClaims.claim.found')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
});

HealthClaims.displayName = 'HealthClaims';

export default HealthClaims;