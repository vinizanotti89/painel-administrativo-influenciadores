import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BookOpen, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

const ClaimDetails = () => {
  // Since we don't have react-router-dom, we'll get the ID from a prop or context
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        // Mocking API call with sample data for demonstration
        const mockClaim = {
          id: "claim_1",
          content: "Chá verde aumenta o metabolismo em 50%",
          status: "questionable",
          category: "nutrition",
          trustScore: 65,
          influencer: {
            name: "Dr. João Silva",
            platform: "Instagram",
            followers: 500000
          },
          originalSource: {
            url: "https://instagram.com/p/123456",
            postDate: "2024-12-15",
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
              name: "Dr. Ana Paula Silva",
              credentials: "PhD em Nutrição",
              opinion: "O chá verde tem benefícios metabólicos comprovados, mas o aumento de 50% é inexato."
            }
          ]
        };

        setClaim(mockClaim);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchClaimDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
        Erro: {error}
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100 rounded">
        Alegação não encontrada
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold">Detalhes da Alegação</h1>
        <Badge variant={claim.status === 'verified' ? 'success' : 
                       claim.status === 'refuted' ? 'destructive' : 'warning'}>
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
              <h3 className="font-semibold mb-2">Influenciador</h3>
              <p>{claim.influencer.name}</p>
              <p className="text-sm text-muted-foreground">
                {claim.influencer.platform} • {claim.influencer.followers.toLocaleString()} seguidores
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Alegação</h3>
              <p>{claim.content}</p>
              <p className="text-sm text-muted-foreground">
                {claim.category} • {new Date(claim.originalSource.postDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="source" className="w-full">
        <TabsList>
          <TabsTrigger value="source">
            <ExternalLink className="w-4 h-4 mr-2" />
            Fonte
          </TabsTrigger>
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

        <TabsContent value="source">
          <Card>
            <CardContent className="pt-6">
              <div className="divide-y">
                <div className="py-3 grid grid-cols-3">
                  <div className="font-medium">URL</div>
                  <div className="col-span-2">
                    <a href={claim.originalSource.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-primary hover:underline inline-flex items-center">
                      {claim.originalSource.url}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <div className="font-medium">Data</div>
                  <div className="col-span-2">
                    {new Date(claim.originalSource.postDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <div className="font-medium">Engajamento</div>
                  <div className="col-span-2 flex gap-4">
                    <span>{claim.originalSource.engagement.likes.toLocaleString()} likes</span>
                    <span>{claim.originalSource.engagement.comments.toLocaleString()} comentários</span>
                    <span>{claim.originalSource.engagement.shares.toLocaleString()} compartilhamentos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <a href={`https://doi.org/${study.doi}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-primary hover:underline inline-flex items-center">
                    DOI: {study.doi}
                    <ExternalLink className="w-4 h-4 ml-2" />
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
              {claim.expertOpinions.map((expert) => (
                <div key={expert.id} className="mb-6 last:mb-0">
                  <h3 className="font-semibold">{expert.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{expert.credentials}</p>
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