import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInfluencer } from '@/contexts/InfluencerContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import '@/styles/pages/HealthClaims.css';

const HealthClaims = () => {
  const { id } = useParams();
  const { influencers } = useInfluencer();
  const [influencer, setInfluencer] = useState(null);
  const [claims, setClaims] = useState([]);

  // Exemplo de estrutura de alegação
  const mockClaims = [
    {
      id: 1,
      content: "Consumo de vitamina C previne gripe",
      source: "Video do Instagram - 12/01/2024",
      sourceUrl: "https://instagram.com/post1",
      verificationStatus: "verified",
      studies: [
        {
          title: "Vitamin C for preventing and treating the common cold",
          url: "https://pubmed.ncbi.nlm.nih.gov/12804435/",
          conclusion: "Evidência inconsistente para prevenção"
        }
      ],
      factCheck: "Parcialmente Verdadeiro",
      explanation: "Embora a vitamina C seja importante para o sistema imunológico, não há evidências conclusivas de que previna gripes."
    }
  ];

  useEffect(() => {
    const currentInfluencer = influencers.find(inf => inf.id === parseInt(id));
    setInfluencer(currentInfluencer);
    // Em produção, aqui faria fetch das alegações do backend
    setClaims(mockClaims);
  }, [id, influencers]);

  if (!influencer) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="health-claims">
      <Card className="claims-card">
        <div className="claims-header">
          <h2 className="claims-title">
            Alegações de Saúde - Dr(a). {influencer.name}
          </h2>
          <div className="claims-stats">
            <p className="stat-item">
              Total de vídeos analisados: {influencer.quantidadeVideos}
            </p>
            <p className="stat-item">
              Vídeos com conteúdo relevante: {influencer.quantidadeVideosRelevancia}
            </p>
          </div>
          <Button className="btn-add">
            Adicionar Nova Alegação
          </Button>
        </div>

        <div className="claims-list">
          {claims.map(claim => (
            <div key={claim.id} className="claim-item">
              <div className="claim-header">
                <div className="claim-main">
                  <h4 className="claim-label">Alegação:</h4>
                  <p className="claim-content">{claim.content}</p>
                </div>
                <span className={`claim-status ${claim.verificationStatus}`}>
                  {claim.factCheck}
                </span>
              </div>

              <div className="claim-source">
                <h5 className="source-label">Fonte Original:</h5>
                <a href={claim.sourceUrl} className="source-link">
                  {claim.source}
                </a>
              </div>

              <div className="claim-studies">
                <h5 className="studies-label">Estudos Relacionados:</h5>
                <ul className="studies-list">
                  {claim.studies.map((study, index) => (
                    <li key={index} className="study-item">
                      <a href={study.url} className="study-link">
                        {study.title}
                      </a>
                      <p className="study-conclusion">
                        Conclusão: {study.conclusion}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="claim-analysis">
                <h5 className="analysis-label">Análise:</h5>
                <p className="analysis-content">{claim.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HealthClaims;