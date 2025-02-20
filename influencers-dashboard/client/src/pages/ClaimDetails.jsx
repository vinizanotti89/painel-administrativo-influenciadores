import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '@/api/mockApi';
import '@/styles/pages/ClaimDetails.css';

const ClaimDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [claim, setClaim] = useState({
    id: id,
    title: "Exemplo de Claim",
    status: "verified", // ou "refuted" ou "pending"
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    source: "Instagram",
    date: "2024-02-19",
    analysis: "Análise detalhada do claim...",
    studies: [
      "Estudo A sobre o tema",
      "Estudo B relacionado"
    ]
  });

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

    const config = statusConfig[status];

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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{claim.title}</CardTitle>
          {getStatusBadge(claim.status)}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Conteúdo</h3>
              <p>{claim.content}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Fonte</h3>
              <p className="text-gray-600">{claim.source} - {claim.date}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Análise</h3>
              <p>{claim.analysis}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Estudos Relacionados</h3>
              <ul className="list-disc pl-5">
                {claim.studies.map((study, index) => (
                  <li key={index} className="text-gray-600">{study}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimDetails;