import React, { useContext, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,} from 'recharts';
import { PieChart as PieChartIcon, BarChart2, TrendingUp, Users } from 'lucide-react';
import '@/styles/pages/Analytics.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');

  // Mock data - substituir por dados reais do contexto
  const trendData = [
    { month: 'Jan', verified: 65, refuted: 35 },
    { month: 'Fev', verified: 59, refuted: 41 },
    { month: 'Mar', verified: 80, refuted: 20 },
    { month: 'Abr', verified: 55, refuted: 45 },
    { month: 'Mai', verified: 40, refuted: 60 },
    { month: 'Jun', verified: 70, refuted: 30 },
  ];

  const categoryData = [
    { name: 'Nutrição', value: 400 },
    { name: 'Medicina', value: 300 },
    { name: 'Saúde Mental', value: 300 },
  ];

  const topInfluencers = [
    { name: 'João Silva', verified: 45, refuted: 15 },
    { name: 'Maria Santos', verified: 38, refuted: 12 },
    { name: 'Pedro Lima', verified: 30, refuted: 20 },
    { name: 'Ana Costa', verified: 25, refuted: 25 },
    { name: 'Carlos Oliveira', verified: 20, refuted: 30 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Análise de Dados</h1>
        <Select 
          value={timeRange} 
          onValueChange={setTimeRange}
          className="time-range-select"
        >
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="year">Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <CardHeader className="stat-card-header">
            <CardTitle className="stat-title">
              Total de Alegações
            </CardTitle>
            <TrendingUp className="stat-icon" />
          </CardHeader>
          <CardContent className="stat-content">
            <div className="stat-value">1,234</div>
            <p className="stat-comparison">
              +20.1% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-card-header">
            <CardTitle className="stat-title">
              Taxa de Verificação
            </CardTitle>
            <PieChartIcon className="stat-icon" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">67.5%</div>
            <p className="stat-comparison">
              +2.5% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-card-header">
            <CardTitle className="stat-title">
              Influenciadores Ativos
            </CardTitle>
            <Users className="stat-icon" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">342</div>
            <p className="stat-comparison">
              +12 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-card-header">
            <CardTitle className="stat-title">
              Score Médio
            </CardTitle>
            <BarChart2 className="stat-icon" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">72.8</div>
            <p className="stat-comparison">
              -1.2 em relação ao período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="influencers">Top Influenciadores</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="analytics-tabs">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Alegações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="verified"
                      stroke="#0088FE"
                      name="Verificadas"
                    />
                    <Line
                      type="monotone"
                      dataKey="refuted"
                      stroke="#FF8042"
                      name="Refutadas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="influencers">
          <Card>
            <CardHeader>
              <CardTitle>Top Influenciadores por Verificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topInfluencers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="verified" name="Verificadas" fill="#0088FE" />
                    <Bar dataKey="refuted" name="Refutadas" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;