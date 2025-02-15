import React from 'react';
import { Button } from '@/components/ui/button';

const InfluencerTableRow = ({ influencer }) => {
  return (
    <tr key={influencer.id || `inf-${Math.random()}`}>
      <td className="doctor-info">
        <div className="doctor-name">
          Dr(a). {influencer.name}
        </div>
      </td>
      <td className="category-cell">{influencer.category}</td>
      <td className="platform-cell">{influencer.platform}</td>
      <td className="followers-cell">{influencer.followers}</td>
      <td className="score-cell">
        <span className={`score-badge ${
          (influencer.trustScore || influencer.pontuacao) >= 80 ? 'high' :
          (influencer.trustScore || influencer.pontuacao) >= 60 ? 'medium' :
          'low'}`}
        >
          {influencer.trustScore || influencer.pontuacao || 0}/100
        </span>
      </td>
      <td className="history-cell">
        <span className={`history-badge ${
          influencer.jaPostouFakeNews ? 'has-fake-news' : 'no-fake-news'
        }`}>
          {influencer.jaPostouFakeNews ? 'Fake News Detectada' : 'Sem Fake News'}
        </span>
      </td>
      <td className="actions-cell">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/influencer/${influencer.id}`, '_blank')}
          className="view-claims-button"
        >
          Ver Detalhes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/influencer/${influencer.id}/edit`, '_blank')}
          className="edit-button"
        >
          Editar
        </Button>
      </td>
    </tr>
  );
};

export default InfluencerTableRow;