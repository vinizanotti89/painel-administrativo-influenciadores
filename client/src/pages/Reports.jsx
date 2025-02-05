import React, { useState } from 'react';
import Card, { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import '@/styles/pages/Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('influencer');

  const recentReports = [
    {
      id: 1,
      name: "Relatório de Influenciador - João Silva",
      type: "influencer",
      date: "2025-01-10",
      status: "completed"
    },
    {
      id: 2,
      name: "Análise Mensal - Dezembro 2024",
      type: "monthly",
      date: "2025-01-01",
      status: "completed"
    }
  ];

  const handleExportPDF = () => {
    console.log('Exportando PDF...');
  };

  const handleExportCSV = () => {
    console.log('Exportando CSV...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Relatórios</h1>
        <div className="reports-actions">
          <Button onClick={handleExportPDF} variant="outline">PDF</Button>
          <Button onClick={handleExportCSV} variant="outline">CSV</Button>
          <Button onClick={handlePrint} variant="outline">Imprimir</Button>
        </div>
      </div>

      <div className="reports-grid">
        <Card className="report-card">
          <CardHeader>
            <CardTitle>Gerar Novo Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="select-container">
              <label className="select-label">
                Tipo de Relatório
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="influencer">Influenciador</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="category">Por Categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="generate-button">
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="report-card">
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-grid">
              <div className="stat-item">
                <p className="stat-label">Total de Relatórios</p>
                <p className="stat-value">24</p>
              </div>
              <div className="stat-item">
                <p className="stat-label">Gerados este mês</p>
                <p className="stat-value">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="recent-reports">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="reports-table">
              <div className="table-header">
                <div>Nome</div>
                <div>Tipo</div>
                <div>Data</div>
                <div>Status</div>
                <div>Ações</div>
              </div>
              <div className="table-body">
                {recentReports.map((report) => (
                  <div key={report.id} className="table-row">
                    <div>{report.name}</div>
                    <div>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                    <div>{report.date}</div>
                    <div>
                      <Badge variant={report.status === 'completed' ? 'success' : 'warning'}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="table-actions">
                      <Button variant="ghost" size="sm">Download</Button>
                      <Button variant="ghost" size="sm">Imprimir</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;