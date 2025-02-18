import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, FileText, Clock, AlertTriangle } from 'lucide-react';
import '@/styles/pages/HealthClaimForm.css';

const HealthClaimForm = () => {
  const [formData, setFormData] = useState({
    influencerName: '',
    platform: '',
    postUrl: '',
    claimType: '',
    claimDescription: '',
    evidence: '',
    reportDate: '',
    status: 'pending'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validação básica
    if (!formData.influencerName || !formData.platform || !formData.claimType) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Aqui você implementaria a lógica para enviar os dados para seu backend
      // const response = await api.post('/health-claims', formData);
      
      setSuccess(true);
      // Limpar o formulário após sucesso
      setFormData({
        influencerName: '',
        platform: '',
        postUrl: '',
        claimType: '',
        claimDescription: '',
        evidence: '',
        reportDate: '',
        status: 'pending'
      });
    } catch (err) {
      setError('Erro ao enviar o formulário. Tente novamente.');
    }
  };

  return (
    <div className="claim-form-container">
      <Card className="form-card">
        <CardHeader className="form-header">
          <CardTitle className="form-title">
            <FileText className="header-icon" />
            Formulário de Denúncia de Alegação de Saúde
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="form-content">
            {error && (
              <Alert className="form-alert error">
                <AlertTriangle className="alert-icon" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="form-alert success">
                <AlertDescription>
                  Formulário enviado com sucesso!
                </AlertDescription>
              </Alert>
            )}

            <div className="form-grid">
              <div className="form-field">
                <Label htmlFor="influencerName" className="field-label">
                  Nome do Influenciador *
                </Label>
                <Input
                  id="influencerName"
                  name="influencerName"
                  value={formData.influencerName}
                  onChange={handleInputChange}
                  placeholder="Nome completo do influenciador"
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <Label htmlFor="platform" className="field-label">
                  Plataforma *
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => handleSelectChange(value, 'platform')}
                  className="field-select"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postUrl">URL do Post</Label>
                <Input
                  id="postUrl"
                  name="postUrl"
                  value={formData.postUrl}
                  onChange={handleInputChange}
                  placeholder="https://"
                  type="url"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claimType">Tipo de Alegação *</Label>
                <Select
                  value={formData.claimType}
                  onValueChange={(value) => handleSelectChange(value, 'claimType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de alegação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicinal">Alegação Medicinal</SelectItem>
                    <SelectItem value="funcional">Alegação Funcional</SelectItem>
                    <SelectItem value="terapeutica">Alegação Terapêutica</SelectItem>
                    <SelectItem value="nutricional">Alegação Nutricional</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="claimDescription">Descrição da Alegação *</Label>
                <Textarea
                  id="claimDescription"
                  name="claimDescription"
                  value={formData.claimDescription}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhadamente a alegação feita pelo influenciador..."
                  className="min-h-32"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="evidence">Evidências</Label>
                <Textarea
                  id="evidence"
                  name="evidence"
                  value={formData.evidence}
                  onChange={handleInputChange}
                  placeholder="Inclua links, citações ou outras evidências relevantes..."
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDate">Data do Relato</Label>
                <Input
                  id="reportDate"
                  name="reportDate"
                  type="date"
                  value={formData.reportDate}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="form-actions">
              <Button type="button" className="btn-clear" onClick={handleClear}>
                Limpar
              </Button>
              <Button type="submit" className="btn-submit">
                Enviar Denúncia
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthClaimForm;