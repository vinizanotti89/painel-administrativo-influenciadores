import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Plus, ArrowLeft } from 'lucide-react';
import '@/styles/pages/ResearchConfig.css';

const ResearchConfig = () => {
    const [timeRange, setTimeRange] = useState('last-month');
    const [claimsToAnalyze, setClaimsToAnalyze] = useState(50);
    const [includeRevenue, setIncludeRevenue] = useState(true);
    const [verifyJournals, setVerifyJournals] = useState(true);
    const [selectedJournals, setSelectedJournals] = useState([
        'PubMed Central',
        'Nature',
        'Science',
        'The Lancet',
        'JAMA Network',
        'Cell',
        'New England Journal of Medicine'
    ]);
    const [researchNotes, setResearchNotes] = useState('');

    const handleStartResearch = () => {
        console.log('Starting research with configuration:', {
            timeRange,
            claimsToAnalyze,
            includeRevenue,
            verifyJournals,
            selectedJournals,
            researchNotes
        });
    };

    return (
        <div className="research-container">
            <div className="research-header">
                <Button variant="ghost" className="back-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Dashboard
                </Button>
                <h1 className="text-2xl font-bold">Tarefas de Pesquisa</h1>
            </div>

            <Card className="p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Configuração da Pesquisa</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Coluna Esquerda */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Influenciador Específico</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Pesquisar influenciador da área da saúde por nome"
                                    className="w-full p-2 pl-10 border rounded-md"
                                />
                                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Período</h3>
                            <div className="flex space-x-2">
                                <Button
                                    variant={timeRange === 'last-week' ? 'default' : 'outline'}
                                    onClick={() => setTimeRange('last-week')}
                                    className="flex-1"
                                >
                                    Última Semana
                                </Button>
                                <Button
                                    variant={timeRange === 'last-month' ? 'default' : 'outline'}
                                    onClick={() => setTimeRange('last-month')}
                                    className="flex-1"
                                >
                                    Último Mês
                                </Button>
                                <Button
                                    variant={timeRange === 'all-time' ? 'default' : 'outline'}
                                    onClick={() => setTimeRange('all-time')}
                                    className="flex-1"
                                >
                                    Todo Período
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Alegações para Análise</h3>
                            <input
                                type="number"
                                value={claimsToAnalyze}
                                onChange={(e) => setClaimsToAnalyze(Number(e.target.value))}
                                min={1}
                                max={100}
                                className="w-full p-2 border rounded-md"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Recomendado: 50-100 alegações para análise completa
                            </p>
                        </div>
                    </div>

                    {/* Coluna Direita */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Opções de Análise</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Incluir Análise de Receita</p>
                                        <p className="text-sm text-gray-500">
                                            Analisar métodos de monetização e ganhos com afiliados
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={includeRevenue}
                                            onChange={(e) => setIncludeRevenue(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Verificar com Journals Científicos</p>
                                        <p className="text-sm text-gray-500">
                                            Cruzar alegações com literatura científica
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={verifyJournals}
                                            onChange={(e) => setVerifyJournals(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Journals Científicos</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedJournals.map((journal) => (
                                    <Badge key={journal} variant="secondary" className="text-sm">
                                        {journal}
                                    </Badge>
                                ))}
                                <Button variant="outline" size="sm" className="h-6">
                                    <Plus className="w-4 h-4" />
                                    Adicionar Journal
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Notas da Pesquisa</h3>
                            <textarea
                                className="w-full h-24 p-2 border rounded-md resize-none"
                                placeholder="Adicione instruções específicas ou áreas de foco..."
                                value={researchNotes}
                                onChange={(e) => setResearchNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <Button
                        onClick={handleStartResearch}
                        className="w-full md:w-auto"
                    >
                        Iniciar Pesquisa
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ResearchConfig;