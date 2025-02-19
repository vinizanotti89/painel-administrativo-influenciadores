import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card, { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BookOpen, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import api from '@/mockApi';
import '@/styles/pages/ClaimDetails.css';

const ClaimDetails = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        setLoading(true);
        const data = await api.getClaimById(id); 
        if (!data) {
          throw new Error('Alegação não encontrada');
        }
        setClaim(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClaim();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!claim) return null;

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