import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card, { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Link as LinkIcon, BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '@/api/mockApi';
import '@/styles/pages/ClaimDetails.css';

const ClaimDetails = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        setLoading(true);
        const claimData = await api.getClaimById(id);

        if (!claimData) {
          setError('Alegação não encontrada');
          return;
        }

        const influencerData = await api.getInfluencerById(claimData.influencerId);

        setClaim({
          ...claimData,
          influencer: {
            name: influencerData?.name || 'Nome não encontrado',
            platform: influencerData?.platform || 'Plataforma não encontrada',
            followers: influencerData?.followers || 0
          }
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClaimDetails();
    }
  }, [id]);

  if (loading) {
    return <div className="loading-state">Carregando...</div>;
  }

  if (error) {
    return <div className="error-state">Erro: {error}</div>;
  }

  if (!claim) {
    return <div className="error-state">Alegação não encontrada</div>;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'refuted':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'refuted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verificado';
      case 'refuted':
        return 'Refutado';
      default:
        return 'Inconclusivo';
    }
  };

  const getStudyConclusion = (conclusion) => {
    switch (conclusion) {
      case 'supports':
        return <Badge className="bg-green-100 text-green-800">Suporta</Badge>;
      case 'refutes':
        return <Badge className="bg-red-100 text-red-800">Refuta</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Inconclusivo</Badge>;
    }
  };

  return (
    <div className="claim-details">
      <div className="claim-header">
        <h1 className="page-title">Detalhes da Alegação</h1>
        <Badge className={`status-badge ${claim.status}`}>
          <div className="status-content">
            {getStatusIcon(claim.status)}
            <span>{getStatusText(claim.status)}</span>
          </div>
        </Badge>
      </div>

      <Card className="info-card">
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="info-grid">
            <div className="info-section">
              <h3 className="section-title">Influenciador</h3>
              <p className="influencer-name">{claim.influencer.name}</p>
              <p className="platform-info">
                {claim.influencer.platform} • {claim.influencer.followers.toLocaleString()} seguidores
              </p>
            </div>
            <div className="info-section">
              <h3 className="section-title">Alegação</h3>
              <p className="claim-description">{claim.content}</p>
              <p className="claim-metadata">
                Tipo: {claim.category} • Data: {new Date(claim.originalSource.postDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="fonte" className="claim-tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="fonte" className="tab-item">
            <LinkIcon className="tab-icon" />
            Fonte Original
          </TabsTrigger>
          <TabsTrigger value="estudos" className="tab-item">
            <BookOpen className="tab-icon" />
            Estudos
          </TabsTrigger>
          <TabsTrigger value="verificacao" className="tab-item">
            <CheckCircle className="tab-icon" />
            Verificação
          </TabsTrigger>
          <TabsTrigger value="especialistas" className="tab-item">
            <FileText className="tab-icon" />
            Especialistas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fonte" className="tab-content">
          <Card className="content-card">
            <CardHeader>
              <CardTitle>Fonte Original</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="data-table">
                <TableBody>
                  <TableRow>
                    <TableCell className="label-cell">URL</TableCell>
                    <TableCell>
                      <a href={claim.originalSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-link">
                        {claim.originalSource.url}
                        <LinkIcon className="link-icon" />
                      </a>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="label-cell">Data da Publicação</TableCell>
                    <TableCell>
                      {new Date(claim.originalSource.postDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="label-cell">Engajamento</TableCell>
                    <TableCell>
                      <div className="engagement-stats">
                        <span>{claim.originalSource.engagement.likes.toLocaleString()} likes</span>
                        <span>{claim.originalSource.engagement.comments.toLocaleString()} comentários</span>
                        <span>{claim.originalSource.engagement.shares.toLocaleString()} compartilhamentos</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estudos" className="tab-content">
          <Card className="content-card">
            <CardHeader>
              <CardTitle>Estudos Científicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="studies-list">
                {claim.studies.map((study) => (
                  <div key={study.id} className="study-item">
                    <div className="study-header">
                      <h3 className="study-title">{study.title}</h3>
                      {getStudyConclusion(study.conclusion)}
                    </div>
                    <p className="study-authors">
                      {study.authors} • {study.journal} • {study.year}
                    </p>
                    <p className="study-summary">{study.summary}</p>
                    <a href={`https://doi.org/${study.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="study-link">
                      DOI: {study.doi}
                      <LinkIcon className="link-icon" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verificacao" className="tab-content">
          <Card className="content-card">
            <CardHeader>
              <CardTitle>Notas de Verificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="verification-notes">
                <p className="note-content">{claim.verificationNotes}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="especialistas" className="tab-content">
          <Card className="content-card">
            <CardHeader>
              <CardTitle>Opiniões de Especialistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="experts-list">
                {claim.expertOpinions.map((expert, index) => (
                  <div key={index} className="expert-item">
                    <div className="expert-header">
                      <h3 className="expert-name">{expert.name || expert.expert}</h3>
                      <p className="expert-credentials">{expert.credentials || expert.credential}</p>
                    </div>
                    <p className="expert-opinion">{expert.opinion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimDetails;