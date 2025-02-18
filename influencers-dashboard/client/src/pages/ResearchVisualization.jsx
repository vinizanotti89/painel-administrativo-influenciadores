import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ResearchVisualization = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const { theme } = useTheme();

    // Simular uma pesquisa
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            // Simulando chamada de API
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockResults = [
                {
                    id: 1,
                    name: 'Dr. ' + searchTerm,
                    platform: 'Instagram',
                    followers: 50000,
                    claims: 23,
                    verifiedClaims: 18,
                    trustScore: 85
                },
                // Mais resultados simulados aqui
            ];

            setResults(mockResults);
        } catch (error) {
            console.error('Erro na pesquisa:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Pesquisa de Influenciador</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Nome do influenciador..."
                                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            {loading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Pesquisar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {results.length > 0 && (
                <div className="grid gap-4">
                    {results.map((result) => (
                        <Card key={result.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold">{result.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {result.platform} • {result.followers.toLocaleString()} seguidores
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {result.trustScore}%
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Trust Score
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-lg font-semibold">{result.claims}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Total de Alegações
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-lg font-semibold text-green-600">
                                            {result.verifiedClaims}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Alegações Verificadas
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResearchVisualization;