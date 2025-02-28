import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit } from 'lucide-react';
import '@/styles/components/influencer/influencerTableRow.css';

const InfluencerTableRow = React.forwardRef(({ influencer = {}, className = '', ...props }, ref) => {
  const { language } = useLanguage();

  const translations = {
    en: {
      viewDetails: 'View Details',
      edit: 'Edit',
      fakeNewsDetected: 'Fake News Detected',
      noFakeNews: 'No Fake News',
      dr: 'Dr.',
      dra: 'Dr.'
    },
    pt: {
      viewDetails: 'Ver Detalhes',
      edit: 'Editar',
      fakeNewsDetected: 'Fake News Detectada',
      noFakeNews: 'Sem Fake News',
      dr: 'Dr.',
      dra: 'Dra.'
    }
  };

  const t = translations[language] || translations.pt;

  // Tratamento robusto para propriedades indefinidas
  const {
    id = `inf-${Math.random().toString(36).substring(2, 11)}`,
    name = '',
    gender = 'unknown',
    category = '',
    platform = '',
    followers = 0,
    trustScore = null,
    pontuacao = null,
    jaPostouFakeNews = false
  } = influencer;

  // Formatação de valores
  const formattedFollowers = typeof followers === 'number'
    ? new Intl.NumberFormat(language === 'en' ? 'en-US' : 'pt-BR').format(followers)
    : followers;

  // Cálculo de pontuação
  const score = trustScore !== null ? trustScore : (pontuacao !== null ? pontuacao : 0);

  // Determinação do título com base no gênero (Dr. ou Dra.)
  const title = gender === 'female' ? t.dra : t.dr;

  // Determinação da classe para pontuação
  const getScoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  return (
    <TableRow
      className={`influencer-table-row ${className}`}
      ref={ref}
      {...props}
    >
      <TableCell className="influencer-doctor-info">
        <div className="influencer-doctor-name">
          {title} {name}
        </div>
      </TableCell>
      <TableCell className="influencer-category-cell">{category}</TableCell>
      <TableCell className="influencer-platform-cell">{platform}</TableCell>
      <TableCell className="influencer-followers-cell">{formattedFollowers}</TableCell>
      <TableCell className="influencer-score-cell">
        <Badge
          variant="outline"
          className={`influencer-score-badge trust-score ${getScoreClass(score)}`}
        >
          {score}/100
        </Badge>
      </TableCell>
      <TableCell className="influencer-history-cell">
        <Badge
          variant="outline"
          className={`influencer-history-badge ${jaPostouFakeNews ? 'has-fake-news' : 'no-fake-news'}`}
        >
          {jaPostouFakeNews ? t.fakeNewsDetected : t.noFakeNews}
        </Badge>
      </TableCell>
      <TableCell className="influencer-actions-cell">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/influencer/${id}`, '_blank')}
          className="influencer-view-details-button"
        >
          <ExternalLink className="mr-1 h-4 w-4" />
          {t.viewDetails}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/influencer/${id}/edit`, '_blank')}
          className="influencer-edit-button"
        >
          <Edit className="mr-1 h-4 w-4" />
          {t.edit}
        </Button>
      </TableCell>
    </TableRow>
  );
});

InfluencerTableRow.displayName = 'InfluencerTableRow';

export { InfluencerTableRow };