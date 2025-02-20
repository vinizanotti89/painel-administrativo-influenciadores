import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '@/api/mockApi';
import '@/styles/pages/ClaimDetails.css';

const ClaimDetails = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claim, setClaim] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadClaimData = async () => {
      try {
        const claimData = await api.getClaimById(id);
        if (isMounted) {
          if (claimData) {
            setClaim(claimData);
          } else {
            setError('Claim não encontrado');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Erro ao carregar os detalhes do claim');
          console.error('Erro:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadClaimData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Resto do componente igual ao anterior...

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: {
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Verificado",
        className: "bg-green-100 text-green-800"
      },
      refuted: {
        icon: <XCircle className="w-4 h-4" />,
        text: "Refutado",
        className: "bg-red-100 text-red-800"
      },
      pending: {
        icon: <AlertTriangle className="w-4 h-4" />,
        text: "Pendente",
        className: "bg-yellow-100 text-yellow-800"
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge className={`flex items-center gap-2 ${config.className}`}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!claim) {
    return (
      <Alert className="m-4">
        <AlertTitle>Não encontrado</AlertTitle>
        <AlertDescription>Claim não encontrado</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{claim.description}</CardTitle>
          {getStatusBadge(claim.verificationStatus)}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Conteúdo</h3>
              <p>{claim.content}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Fonte Original</h3>
              <p className="text-gray-600">
                URL: {claim.originalSource?.url}<br />
                Data: {new Date(claim.originalSource?.postDate).toLocaleDateString()}<br />
                Engajamento: {claim.originalSource?.engagement?.likes} likes, {' '}
                {claim.originalSource?.engagement?.comments} comentários, {' '}
                {claim.originalSource?.engagement?.shares} compartilhamentos
              </p>
            </div>

            {claim.studies && claim.studies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Estudos</h3>
                {claim.studies.map((study, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold">{study.title}</h4>
                    <p className="text-sm text-gray-600">
                      Autores: {study.authors}<br />
                      Ano: {study.year}<br />
                      Journal: {study.journal}<br />
                      DOI: {study.doi}
                    </p>
                    <p className="mt-2">{study.summary}</p>
                  </div>
                ))}
              </div>
            )}

            {claim.verificationNotes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notas de Verificação</h3>
                <p>{claim.verificationNotes}</p>
              </div>
            )}

            {claim.expertOpinions && claim.expertOpinions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Opiniões de Especialistas</h3>
                {claim.expertOpinions.map((expert, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-semibold">{expert.expert}</p>
                    <p className="text-sm text-gray-600">{expert.credential}</p>
                    <p className="mt-1">{expert.opinion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimDetails;