import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Link } from 'lucide-react';
import instagramService from '@/services/instagram';
import youtubeService from '@/services/youtube';
import linkedinService from '@/services/linkedin';
import { useTranslation } from '@/hooks/useTranslation';
import useAsyncState from '@/hooks/useAsyncState';
import { errorService } from '@/services/errorService';
import '@/styles/pages/ClaimDetails.css';

const ClaimDetails = () => {
  const { id } = useParams();
  const { t, language } = useTranslation();
  const [sourceData, setSourceData] = useState(null);
  const [relatedClaims, setRelatedClaims] = useState([]);

  // Usando o hook unificado de estado assíncrono para buscar os detalhes da alegação
  const {
    data: claim,
    loading,
    error,
    execute: fetchClaimDetails,
    isSuccess,
    isError
  } = useAsyncState(async () => {
    // Extrair plataforma e ID real do parâmetro
    // Formato esperado: platform_id (ex: instagram_12345)
    const [platform, realId] = id.split('_');

    let sourceData;
    // Buscar dados da fonte apropriada com base na plataforma
    switch (platform) {
      case 'instagram':
        sourceData = await fetchInstagramData(realId);
        break;
      case 'youtube':
        sourceData = await fetchYoutubeData(realId);
        break;
      case 'linkedin':
        sourceData = await fetchLinkedinData(realId);
        break;
      default:
        throw new Error(language === 'pt' ? 'Plataforma não suportada' : 'Unsupported platform');
    }

    setSourceData(sourceData);

    // Processar os dados para obter detalhes da alegação
    const claimData = await processClaimData(sourceData, platform);

    // Buscar alegações relacionadas
    const related = await fetchRelatedClaims(claimData);
    setRelatedClaims(related);

    return claimData;
  }, {
    immediate: true,
    errorCategory: errorService.ERROR_CATEGORIES.API,
    onError: (err) => {
      const errorMessage = language === 'pt'
        ? 'Erro ao buscar detalhes da alegação'
        : 'Error fetching claim details';
      errorService.reportError('claim_details_error', err, {
        component: 'ClaimDetails',
        claimId: id
      });
    }
  });

  // Busca dados do Instagram
  const fetchInstagramData = async (mediaId) => {
    try {
      // Obtém detalhes da mídia específica
      const mediaDetails = await instagramService.getMediaDetails(mediaId);
      if (!mediaDetails) {
        throw new Error(language === 'pt'
          ? 'Detalhes da mídia do Instagram não encontrados'
          : 'Instagram media details not found');
      }

      // Obtém insights adicionais sobre a mídia
      const mediaInsights = await instagramService.getMediaInsights(mediaId);

      // Obtém informações do perfil do autor
      const profileInfo = await instagramService.getProfile();

      return {
        id: mediaId,
        platform: 'Instagram',
        content: mediaDetails.caption || (language === 'pt' ? 'Sem legenda' : 'No caption'),
        author: profileInfo.username,
        authorId: profileInfo.id,
        publishDate: new Date(mediaDetails.timestamp).toISOString(),
        engagement: {
          likes: mediaDetails.like_count || 0,
          comments: mediaDetails.comments_count || 0
        },
        insights: mediaInsights,
        mediaUrl: mediaDetails.media_url || null,
        mediaType: mediaDetails.media_type || 'IMAGE'
      };
    } catch (error) {
      console.error(language === 'pt'
        ? 'Erro ao buscar dados do Instagram:'
        : 'Error fetching Instagram data:', error);
      throw new Error(language === 'pt'
        ? 'Não foi possível recuperar dados do Instagram'
        : 'Could not retrieve Instagram data');
    }
  };

  // Busca dados do YouTube
  const fetchYoutubeData = async (videoId) => {
    try {
      // Obtém detalhes do vídeo
      const videoDetails = await youtubeService.getVideoDetails(videoId);
      if (!videoDetails) {
        throw new Error(language === 'pt'
          ? 'Detalhes do vídeo do YouTube não encontrados'
          : 'YouTube video details not found');
      }

      // Obtém informações do canal
      const channelId = videoDetails.snippet?.channelId;
      const channelInfo = await youtubeService.getChannelInfo(channelId);

      // Obtém comentários do vídeo
      const videoComments = await youtubeService.getVideoComments(videoId);

      return {
        id: videoId,
        platform: 'YouTube',
        content: videoDetails.snippet?.description || (language === 'pt' ? 'Sem descrição' : 'No description'),
        title: videoDetails.snippet?.title || (language === 'pt' ? 'Sem título' : 'No title'),
        author: videoDetails.snippet?.channelTitle || (language === 'pt' ? 'Canal desconhecido' : 'Unknown channel'),
        authorId: channelId,
        publishDate: new Date(videoDetails.snippet?.publishedAt).toISOString(),
        engagement: {
          views: parseInt(videoDetails.statistics?.viewCount) || 0,
          likes: parseInt(videoDetails.statistics?.likeCount) || 0,
          dislikes: parseInt(videoDetails.statistics?.dislikeCount) || 0,
          comments: parseInt(videoDetails.statistics?.commentCount) || 0
        },
        channelInfo: channelInfo,
        comments: videoComments,
        videoUrl: `https://youtube.com/watch?v=${videoId}`
      };
    } catch (error) {
      console.error(language === 'pt'
        ? 'Erro ao buscar dados do YouTube:'
        : 'Error fetching YouTube data:', error);
      throw new Error(language === 'pt'
        ? 'Não foi possível recuperar dados do YouTube'
        : 'Could not retrieve YouTube data');
    }
  };

  // Busca dados do LinkedIn
  const fetchLinkedinData = async (postId) => {
    try {
      // Obtém detalhes do post
      const postDetails = await linkedinService.getPostDetails(postId);
      if (!postDetails) {
        throw new Error(language === 'pt'
          ? 'Detalhes do post do LinkedIn não encontrados'
          : 'LinkedIn post details not found');
      }

      // Obtém informações do perfil do autor
      const profileInfo = await linkedinService.getProfile();

      // Obtém análises do post
      const postAnalytics = await linkedinService.getPostAnalytics(postId);

      return {
        id: postId,
        platform: 'LinkedIn',
        content: postDetails.commentary?.text || (language === 'pt' ? 'Sem conteúdo' : 'No content'),
        author: `${profileInfo.localizedFirstName} ${profileInfo.localizedLastName}`,
        authorId: profileInfo.id,
        publishDate: new Date(postDetails.created?.time || Date.now()).toISOString(),
        engagement: {
          reactions: postDetails.totalShareStatistics?.likeCount || 0,
          comments: postDetails.totalShareStatistics?.commentCount || 0,
          shares: postDetails.totalShareStatistics?.shareCount || 0
        },
        analytics: postAnalytics,
        profileInfo: profileInfo
      };
    } catch (error) {
      console.error(language === 'pt'
        ? 'Erro ao buscar dados do LinkedIn:'
        : 'Error fetching LinkedIn data:', error);
      throw new Error(language === 'pt'
        ? 'Não foi possível recuperar dados do LinkedIn'
        : 'Could not retrieve LinkedIn data');
    }
  };

  // Processa os dados para obter detalhes da alegação
  const processClaimData = async (sourceData, platform) => {
    if (!sourceData) return null;

    try {
      // Extrai alegações do conteúdo usando processamento de linguagem natural
      const claims = await extractClaims(sourceData.content, platform);

      // Verifica a confiabilidade de cada alegação
      const verifiedClaims = await verifyClaims(claims, platform);

      // Pegamos a primeira alegação verificada ou a principal
      const mainClaim = verifiedClaims[0] || {
        title: language === 'pt' ? 'Alegação não identificada' : 'Unidentified claim',
        content: sourceData.content,
        status: 'pending',
        analysis: language === 'pt'
          ? 'Não foi possível analisar esta alegação automaticamente.'
          : 'It was not possible to analyze this claim automatically.',
        confidence: 0,
        date: sourceData.publishDate
      };

      return {
        id: `${platform}_${sourceData.id}`,
        title: mainClaim.title,
        content: mainClaim.content,
        status: mainClaim.status,
        source: sourceData.author,
        sourceUrl: platform === 'YouTube' ? sourceData.videoUrl : null,
        date: sourceData.publishDate,
        analysis: mainClaim.analysis,
        confidence: mainClaim.confidence,
        studies: await findRelatedStudies(mainClaim),
        platform: platform,
        authorId: sourceData.authorId,
        engagementMetrics: sourceData.engagement
      };
    } catch (error) {
      console.error(language === 'pt'
        ? 'Erro ao processar dados de alegação:'
        : 'Error processing claim data:', error);

      // Retorna alegação mínima em caso de erro
      return {
        id: `${platform}_${sourceData.id}`,
        title: language === 'pt' ? 'Conteúdo do influenciador' : 'Influencer content',
        content: sourceData.content,
        status: 'pending',
        source: sourceData.author,
        date: sourceData.publishDate,
        analysis: language === 'pt' ? 'Análise pendente' : 'Analysis pending',
        confidence: 0,
        studies: [],
        platform: platform,
        authorId: sourceData.authorId,
        engagementMetrics: sourceData.engagement
      };
    }
  };

  // Extrai alegações do conteúdo
  const extractClaims = async (content, platform) => {
    // Aqui seria ideal integrar com uma API de processamento de linguagem natural
    // Por enquanto, usamos um processamento simplificado

    // Identifica frases que podem conter alegações
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);

    // Keywords que podem indicar alegações de saúde e bem-estar - ajustadas para multi-idioma
    const healthKeywords = language === 'pt'
      ? [
        'cura', 'tratamento', 'previne', 'elimina', 'combate',
        'melhora', 'reduz', 'aumenta', 'benefícios', 'saúde',
        'comprovado', 'científico', 'estudo', 'pesquisa', 'resultados',
        'nutrientes', 'vitamina', 'mineral', 'proteína', 'antioxidante',
        'natural', 'dieta', 'exercício', 'emagrecimento', 'peso'
      ]
      : [
        'cure', 'treatment', 'prevents', 'eliminates', 'fights',
        'improves', 'reduces', 'increases', 'benefits', 'health',
        'proven', 'scientific', 'study', 'research', 'results',
        'nutrients', 'vitamin', 'mineral', 'protein', 'antioxidant',
        'natural', 'diet', 'exercise', 'weight loss', 'weight'
      ];

    // Identifica possíveis alegações com base nas keywords
    const possibleClaims = sentences.filter(sentence =>
      healthKeywords.some(keyword =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    // Formata as alegações
    return possibleClaims.map((claim, index) => ({
      id: index,
      title: language === 'pt' ? `Alegação ${index + 1}` : `Claim ${index + 1}`,
      content: claim.trim(),
      dateExtracted: new Date().toISOString(),
      platform: platform
    }));
  };

  // Verifica a confiabilidade das alegações
  const verifyClaims = async (claims, platform) => {
    // Aqui seria ideal integrar com uma API de fact-checking ou base de dados médicos
    // Por enquanto, usamos uma verificação simulada

    const verificationResults = claims.map(claim => {
      // Simula uma análise baseada em keywords
      const text = claim.content.toLowerCase();

      // Keywords que podem indicar alegações problemáticas - ajustadas para multi-idioma
      const suspectKeywords = language === 'pt'
        ? [
          'cura garantida', 'tratamento milagroso', 'elimina instantaneamente',
          '100% eficaz', 'comprove em minutos', 'resultados imediatos',
          'cientistas descobriram', 'médicos não querem que você saiba',
          'segredo revelado', 'revolucionário', 'milagroso'
        ]
        : [
          'guaranteed cure', 'miraculous treatment', 'instantly eliminates',
          '100% effective', 'prove in minutes', 'immediate results',
          'scientists discovered', 'doctors don\'t want you to know',
          'revealed secret', 'revolutionary', 'miraculous'
        ];

      // Keywords que podem indicar alegações mais fundamentadas - ajustadas para multi-idioma
      const credibleKeywords = language === 'pt'
        ? [
          'de acordo com estudos', 'pesquisas sugerem', 'pode auxiliar',
          'evidências indicam', 'estudos preliminares', 'segundo pesquisadores',
          'alguns estudos mostram', 'resultados variáveis'
        ]
        : [
          'according to studies', 'research suggests', 'may help',
          'evidence indicates', 'preliminary studies', 'according to researchers',
          'some studies show', 'variable results'
        ];

      // Determina status com base nas keywords
      let status, analysis, confidence;

      const hasSuspectTerms = suspectKeywords.some(term => text.includes(term));
      const hasCredibleTerms = credibleKeywords.some(term => text.includes(term));

      if (hasSuspectTerms) {
        status = 'refuted';
        analysis = language === 'pt'
          ? 'Esta alegação contém termos exagerados ou promessas irrealistas comuns em informações de saúde não verificadas.'
          : 'This claim contains exaggerated terms or unrealistic promises common in unverified health information.';
        confidence = 0.8;
      } else if (hasCredibleTerms) {
        status = 'verified';
        analysis = language === 'pt'
          ? 'Esta alegação usa linguagem mais medida e faz referência a estudos ou pesquisas.'
          : 'This claim uses more measured language and references studies or research.';
        confidence = 0.7;
      } else {
        status = 'pending';
        analysis = language === 'pt'
          ? 'Esta alegação não contém indicadores claros de validade ou invalidade e requer análise adicional.'
          : 'This claim does not contain clear indicators of validity or invalidity and requires additional analysis.';
        confidence = 0.5;
      }

      return {
        ...claim,
        status,
        analysis,
        confidence
      };
    });

    // Ordena por confiabilidade da verificação
    return verificationResults.sort((a, b) => b.confidence - a.confidence);
  };

  // Busca estudos relacionados à alegação
  const findRelatedStudies = async (claim) => {
    // Aqui seria ideal integrar com uma API de base de dados científicos
    // Por enquanto, usamos dados simulados baseados no conteúdo da alegação

    const text = claim.content.toLowerCase();

    // Lista de estudos simulados para diferentes áreas - ajustadas para multi-idioma
    const studiesByTopic = language === 'pt'
      ? {
        nutricao: [
          {
            title: 'Efeitos de dietas ricas em proteínas na composição corporal',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example1',
            conclusion: 'Dietas com maior proporção de proteínas podem auxiliar na preservação de massa magra durante a perda de peso.'
          },
          {
            title: 'Impacto dos antioxidantes na função celular',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example2',
            conclusion: 'Antioxidantes de fontes alimentares podem ter efeitos protetores contra estresse oxidativo celular.'
          }
        ],
        exercicio: [
          {
            title: 'Comparação entre treinamento de força e cardio para perda de peso',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example3',
            conclusion: 'Uma combinação de treinamento de força e exercícios aeróbicos tende a produzir melhores resultados para composição corporal.'
          },
          {
            title: 'Efeitos do treinamento intervalado de alta intensidade',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example4',
            conclusion: 'HIIT pode proporcionar benefícios cardiovasculares similares ao treinamento contínuo, em menos tempo.'
          }
        ],
        suplementacao: [
          {
            title: 'Eficácia da suplementação de vitamina D em populações com deficiência',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example5',
            conclusion: 'A suplementação de vitamina D pode ser benéfica para pessoas com níveis séricos abaixo do recomendado.'
          },
          {
            title: 'Revisão sistemática sobre suplementos para performance atlética',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example6',
            conclusion: 'Apenas um pequeno número de suplementos possui evidências consistentes de benefícios para desempenho.'
          }
        ]
      }
      : {
        nutrition: [
          {
            title: 'Effects of high-protein diets on body composition',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example1',
            conclusion: 'Diets with a higher proportion of protein may help preserve lean mass during weight loss.'
          },
          {
            title: 'Impact of antioxidants on cellular function',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example2',
            conclusion: 'Antioxidants from dietary sources may have protective effects against cellular oxidative stress.'
          }
        ],
        exercise: [
          {
            title: 'Comparison between strength training and cardio for weight loss',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example3',
            conclusion: 'A combination of strength training and aerobic exercises tends to produce better results for body composition.'
          },
          {
            title: 'Effects of high-intensity interval training',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example4',
            conclusion: 'HIIT can provide cardiovascular benefits similar to continuous training, in less time.'
          }
        ],
        supplementation: [
          {
            title: 'Efficacy of vitamin D supplementation in deficient populations',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example5',
            conclusion: 'Vitamin D supplementation may be beneficial for people with serum levels below recommended.'
          },
          {
            title: 'Systematic review on supplements for athletic performance',
            url: 'https://pubmed.ncbi.nlm.nih.gov/example6',
            conclusion: 'Only a small number of supplements have consistent evidence of performance benefits.'
          }
        ]
      };

    // Keywords para identificar tópicos relacionados - ajustadas para multi-idioma
    const topicKeywords = language === 'pt'
      ? {
        nutricao: ['nutrição', 'dieta', 'alimentação', 'nutrientes', 'vitamina', 'mineral', 'proteína', 'carboidrato', 'gordura'],
        exercicio: ['exercício', 'treino', 'atividade física', 'musculação', 'cardio', 'aeróbico', 'anaeróbico', 'HIIT'],
        suplementacao: ['suplemento', 'vitamina', 'mineral', 'proteína', 'creatina', 'aminoácido', 'whey', 'pré-treino']
      }
      : {
        nutrition: ['nutrition', 'diet', 'food', 'nutrients', 'vitamin', 'mineral', 'protein', 'carbohydrate', 'fat'],
        exercise: ['exercise', 'training', 'physical activity', 'weight lifting', 'cardio', 'aerobic', 'anaerobic', 'HIIT'],
        supplementation: ['supplement', 'vitamin', 'mineral', 'protein', 'creatine', 'amino acid', 'whey', 'pre-workout']
      };

    // Identifica tópicos na alegação
    const detectedTopics = Object.entries(topicKeywords)
      .filter(([topic, keywords]) =>
        keywords.some(keyword => text.includes(keyword.toLowerCase()))
      )
      .map(([topic]) => topic);

    // Se não encontrar tópicos específicos, retorna um estudo geral
    if (detectedTopics.length === 0) {
      return [
        {
          title: language === 'pt'
            ? 'Guia de avaliação de evidências em saúde e nutrição'
            : 'Guide to evaluating evidence in health and nutrition',
          url: 'https://pubmed.ncbi.nlm.nih.gov/example-guide',
          conclusion: language === 'pt'
            ? 'Recomenda-se avaliar criticamente as alegações de saúde com base na qualidade das evidências científicas.'
            : 'It is recommended to critically evaluate health claims based on the quality of scientific evidence.'
        }
      ];
    }

    // Retorna estudos relacionados aos tópicos detectados
    let relatedStudies = [];
    detectedTopics.forEach(topic => {
      if (studiesByTopic[topic]) {
        relatedStudies = [...relatedStudies, ...studiesByTopic[topic]];
      }
    });

    // Limita a 3 estudos para não sobrecarregar a interface
    return relatedStudies.slice(0, 3);
  };

  // Busca alegações relacionadas
  const fetchRelatedClaims = async (claimData) => {
    // Aqui seria ideal buscar do banco de dados
    // Por enquanto, geramos algumas alegações relacionadas simuladas

    if (!claimData) return [];

    // Gera 2-3 alegações relacionadas simuladas
    const count = Math.floor(Math.random() * 2) + 2;
    const statuses = ['verified', 'refuted', 'pending'];

    return Array.from({ length: count }, (_, index) => ({
      id: `related_${index}`,
      title: language === 'pt'
        ? `Alegação relacionada ${index + 1}`
        : `Related claim ${index + 1}`,
      content: language === 'pt'
        ? `Esta é uma alegação relacionada à principal sobre ${claimData.title.toLowerCase()}.`
        : `This is a claim related to the main one about ${claimData.title.toLowerCase()}.`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: `Influencer ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: {
        icon: <CheckCircle className="w-4 h-4" />,
        text: language === 'pt' ? "Verificado" : "Verified",
        className: "bg-green-100 text-green-800"
      },
      refuted: {
        icon: <XCircle className="w-4 h-4" />,
        text: language === 'pt' ? "Refutado" : "Refuted",
        className: "bg-red-100 text-red-800"
      },
      pending: {
        icon: <AlertTriangle className="w-4 h-4" />,
        text: language === 'pt' ? "Pendente" : "Pending",
        className: "bg-yellow-100 text-yellow-800"
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {config.icon}
        <span className="ml-2">{config.text}</span>
      </Badge>
    );
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return <div className="platform-icon instagram"></div>;
      case 'youtube':
        return <div className="platform-icon youtube"></div>;
      case 'linkedin':
        return <div className="platform-icon linkedin"></div>;
      default:
        return <Link className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Traduções para os textos da página
  const translations = {
    loading: {
      pt: 'Carregando detalhes da alegação...',
      en: 'Loading claim details...'
    },
    error: {
      title: {
        pt: 'Erro',
        en: 'Error'
      }
    },
    notFound: {
      title: {
        pt: 'Aviso',
        en: 'Warning'
      },
      message: {
        pt: 'Alegação não encontrada',
        en: 'Claim not found'
      }
    },
    sections: {
      originalContent: {
        pt: 'Conteúdo Original',
        en: 'Original Content'
      },
      viewOriginal: {
        pt: 'Ver publicação original',
        en: 'View original post'
      },
      analysis: {
        pt: 'Análise',
        en: 'Analysis'
      },
      confidenceLevel: {
        pt: 'Nível de confiança:',
        en: 'Confidence level:'
      },
      relatedStudies: {
        pt: 'Estudos Relacionados',
        en: 'Related Studies'
      },
      noStudies: {
        pt: 'Nenhum estudo relacionado encontrado.',
        en: 'No related studies found.'
      },
      relatedClaims: {
        pt: 'Alegações Relacionadas',
        en: 'Related Claims'
      },
      engagementMetrics: {
        pt: 'Métricas de Engajamento',
        en: 'Engagement Metrics'
      }
    },
    metrics: {
      views: {
        pt: 'Visualizações:',
        en: 'Views:'
      },
      likes: {
        pt: 'Likes:',
        en: 'Likes:'
      },
      comments: {
        pt: 'Comentários:',
        en: 'Comments:'
      },
      reactions: {
        pt: 'Reações:',
        en: 'Reactions:'
      },
      shares: {
        pt: 'Compartilhamentos:',
        en: 'Shares:'
      }
    }
  };

  // Helpers para obter traduções
  const getText = (path) => {
    const keys = path.split('.');
    let value = translations;

    for (const key of keys) {
      if (!value[key]) return path;
      value = value[key];
    }

    return value[language] || path;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{getText('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>{getText('error.title')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!claim) {
    return (
      <Alert variant="warning" className="m-4">
        <AlertTitle>{getText('notFound.title')}</AlertTitle>
        <AlertDescription>{getText('notFound.message')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="claim-details">
      <Card className="claim-card">
        <CardHeader className="claim-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getPlatformIcon(claim.platform)}
              <CardTitle className="claim-title ml-2">{claim.title}</CardTitle>
            </div>
            {getStatusBadge(claim.status)}
          </div>
          <p className="claim-metadata">
            {claim.source} • {formatDate(claim.date)}
          </p>
        </CardHeader>
        <CardContent>
          {/* Conteúdo Original */}
          <div className="claim-section">
            <h3 className="section-title">{getText('sections.originalContent')}</h3>
            <div className="original-content">
              <p className="section-content">{claim.content}</p>
            </div>
            {claim.sourceUrl && (
              <a href={claim.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                {getText('sections.viewOriginal')}
              </a>
            )}
          </div>

          {/* Análise */}
          <div className="claim-section">
            <h3 className="section-title">{getText('sections.analysis')}</h3>
            <div className="analysis-content">
              <p className="section-content">{claim.analysis}</p>
              <div className="confidence-meter">
                <span className="confidence-label">{getText('sections.confidenceLevel')}</span>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${claim.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="confidence-value">{Math.round(claim.confidence * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Estudos Relacionados */}
          <div className="claim-section">
            <h3 className="section-title">{getText('sections.relatedStudies')}</h3>
            {claim.studies && claim.studies.length > 0 ? (
              <ul className="studies-list">
                {claim.studies.map((study, index) => (
                  <li key={index} className="study-item">
                    <a href={study.url} target="_blank" rel="noopener noreferrer" className="study-link">
                      {study.title}
                    </a>
                    <p className="study-conclusion">{study.conclusion}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">{getText('sections.noStudies')}</div>
            )}
          </div>

          {/* Alegações Relacionadas */}
          {relatedClaims.length > 0 && (
            <div className="claim-section">
              <h3 className="section-title">{getText('sections.relatedClaims')}</h3>
              <ul className="related-claims-list">
                {relatedClaims.map((relatedClaim) => (
                  <li key={relatedClaim.id} className="related-claim-item">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="related-claim-title">{relatedClaim.title}</h4>
                      {getStatusBadge(relatedClaim.status)}
                    </div>
                    <p className="related-claim-content">{relatedClaim.content}</p>
                    <div className="related-claim-meta">
                      {relatedClaim.source} • {formatDate(relatedClaim.date)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Métricas de Engajamento */}
          {claim.engagementMetrics && (
            <div className="claim-section">
              <h3 className="section-title">{getText('sections.engagementMetrics')}</h3>
              <div className="engagement-metrics">
                {claim.engagementMetrics.views !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">{getText('metrics.views')}</span>
                    <span className="metric-value">{claim.engagementMetrics.views.toLocaleString()}</span>
                  </div>
                )}
                {claim.engagementMetrics.likes !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">{getText('metrics.likes')}</span>
                    <span className="metric-value">{claim.engagementMetrics.likes.toLocaleString()}</span>
                  </div>
                )}
                {claim.engagementMetrics.comments !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">{getText('metrics.comments')}</span>
                    <span className="metric-value">{claim.engagementMetrics.comments.toLocaleString()}</span>
                  </div>
                )}
                {claim.engagementMetrics.reactions !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">{getText('metrics.reactions')}</span>
                    <span className="metric-value">{claim.engagementMetrics.reactions.toLocaleString()}</span>
                  </div>
                )}
                {claim.engagementMetrics.shares !== undefined && (
                  <div className="metric-item">
                    <span className="metric-label">{getText('metrics.shares')}</span>
                    <span className="metric-value">{claim.engagementMetrics.shares.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimDetails;