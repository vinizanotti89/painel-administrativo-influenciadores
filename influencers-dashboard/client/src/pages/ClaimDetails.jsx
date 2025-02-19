import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/mockApi';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BookOpen, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import '@/styles/pages/ClaimDetails.css';

const mockClaim = {
  id: "claim_1",
  content: "Chá verde aumenta o metabolismo em 50%",
  status: "questionable",
  category: "nutrition",
  date: "2024-02-15",
  trustScore: 65,
  originalSource: {
    url: "https://instagram.com/p/123456",
    postDate: "2024-02-15",
    engagement: {
      likes: 15000,
      comments: 1200,
      shares: 500
    }
  },
  studies: [
    {
      id: "study_1",
      title: "Effects of Green Tea on Metabolism",
      authors: "Smith, J., Johnson, M.",
      year: 2023,
      journal: "Journal of Nutrition",
      doi: "10.1234/jn.2023.1234",
      conclusion: "inconclusive",
      summary: "Estudos mostram aumento moderado no metabolismo, mas não na magnitude alegada."
    }
  ],
  verificationNotes: "Alegação exagerada dos benefícios reais",
  expertOpinions: [
    {
      id: "expert_1",
      expert: "Dra. Ana Paula Silva",
      credential: "PhD em Nutrição",
      opinion: "O chá verde tem benefícios metabólicos comprovados, mas o aumento de 50% é inexato."
    }
  ]
};

const ClaimDetails = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  seEffect(() => {
    const fetchClaim = async () => {
      try {
        setLoading(true);
        // Simulando delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Em produção, aqui você faria a chamada real à API
        setClaim(mockClaim);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar os dados da alegação');
        console.error('Error fetching claim:', err);
      } finally {
        setLoading(false);
      }
    };

    if (claimId) {
      fetchClaim();
    }
  }, [claimId]);

  console.log('Current state:', { loading, error, claim });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Carregando detalhes da alegação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Alegação não encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold">Detalhes da Alegação</h1>
        <Badge variant={claim.status === 'verified' ? 'success' :
          claim.status === 'refuted' ? 'destructive' : 'warning'}>
          {claim.status === 'verified' && <CheckCircle className="w-4 h-4 mr-2" />}
          {claim.status === 'refuted' && <XCircle className="w-4 h-4 mr-2" />}
          {claim.status === 'questionable' && <AlertCircle className="w-4 h-4 mr-2" />}
          {claim.status === 'verified' ? 'Verificado' :
            claim.status === 'refuted' ? 'Refutado' : 'Em Análise'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Alegação</h3>
              <p>{claim.content}</p>
              <p className="text-sm text-muted-foreground">
                {claim.category} • {new Date(claim.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fonte Original</h3>
              <a
                href={claim.originalSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                {claim.originalSource.url}
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-sm text-muted-foreground">
                Publicado em: {new Date(claim.originalSource.postDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="studies" className="w-full">
        <TabsList>
          <TabsTrigger value="studies">
            <BookOpen className="w-4 h-4 mr-2" />
            Estudos
          </TabsTrigger>
          <TabsTrigger value="verification">
            <CheckCircle className="w-4 h-4 mr-2" />
            Verificação
          </TabsTrigger>
          <TabsTrigger value="experts">
            <FileText className="w-4 h-4 mr-2" />
            Especialistas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="studies">
          <Card>
            <CardContent className="pt-6">
              {claim.studies.map((study) => (
                <div key={study.id} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold mb-2">{study.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {study.authors} • {study.journal} • {study.year}
                  </p>
                  <p className="mb-2">{study.summary}</p>
                  <a
                    href={`https://doi.org/${study.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    DOI: {study.doi}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardContent className="pt-6">
              <p>{claim.verificationNotes}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experts">
          <Card>
            <CardContent className="pt-6">
              {claim.expertOpinions.map((expert, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h3 className="font-semibold">{expert.expert}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{expert.credential}</p>
                  <p>{expert.opinion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimDetails;