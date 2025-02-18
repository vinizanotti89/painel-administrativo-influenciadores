import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Plus, ArrowLeft } from 'lucide-react';
import ResearchVisualization from './ResearchVisualization';
import { useTheme } from '@/contexts/ThemeContext';
import '@/styles/pages/ResearchConfig.css';

const ResearchConfig = () => {
    const { theme } = useTheme();
    const [timeRange, setTimeRange] = useState('last-month');
    const [claimsToAnalyze, setClaimsToAnalyze] = useState(50);
    const [includeRevenue, setIncludeRevenue] = useState(true);
    const [verifyJournals, setVerifyJournals] = useState(true);
    const [selectedJournals, setSelectedJournals] = useState([
        'PubMed Central',
        'Nature',
        'Science',
        'The Lancet'
    ]);

    return (
        <div className={`research-container ${theme}`}>
            <div className="research-header">
                <Button variant="ghost" className="back-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Dashboard
                </Button>
                <h1 className="text-2xl font-bold">Configuração da Pesquisa</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Configurações</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Período de Análise
                            </label>
                            <div className="flex space-x-2">
                                {['last-week', 'last-month', 'last-year'].map((period) => (
                                    <Button
                                        key={period}
                                        variant={timeRange === period ? 'default' : 'outline'}
                                        onClick={() => setTimeRange(period)}
                                        className="flex-1"
                                    >
                                        {period === 'last-week' ? 'Última Semana' :
                                            period === 'last-month' ? 'Último Mês' : 'Último Ano'}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Quantidade de Alegações
                            </label>
                            <input
                                type="number"
                                value={claimsToAnalyze}
                                onChange={(e) => setClaimsToAnalyze(Number(e.target.value))}
                                className="w-full p-2 border rounded-md"
                                min={1}
                                max={100}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Journals Selecionados
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {selectedJournals.map((journal) => (
                                    <Badge key={journal} variant="secondary">
                                        {journal}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                <ResearchVisualization />
            </div>
        </div>
    );
};

export default ResearchConfig;