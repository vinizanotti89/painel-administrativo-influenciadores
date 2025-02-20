import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';
import '@/styles/pages/TrustLeaderboard.css';

const TrustLeaderboard = () => {
    const [loading, setLoading] = useState(true);
    const [influencers, setInfluencers] = useState([]);

    useEffect(() => {
        const mockInfluencers = [
            {
                id: "inf_1",
                name: "Dr. João Silva",
                category: "Medicina",
                platform: "Instagram",
                followers: 1200000,
                trustScore: 85,
                trend: "up",
                statistics: {
                    totalClaims: 150,
                    verifiedClaims: 127,
                    refutedClaims: 15,
                    pendingClaims: 8
                }
            },
            {
                id: "inf_2",
                name: "Dra. Maria Santos",
                category: "Nutrição",
                platform: "Instagram",
                followers: 800000,
                trustScore: 92,
                trend: "up",
                statistics: {
                    totalClaims: 120,
                    verifiedClaims: 110,
                    refutedClaims: 5,
                    pendingClaims: 5
                }
            }
        ];

        setTimeout(() => {
            setInfluencers(mockInfluencers);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Calcular métricas globais
    const totalVerifiedClaims = influencers.reduce((acc, inf) => acc + inf.statistics.verifiedClaims, 0);
    const averageTrustScore = (
        influencers.reduce((acc, inf) => acc + inf.trustScore, 0) / influencers.length
    ).toFixed(1);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Trust Leaderboard</h1>
                <p className="text-gray-600">
                    Ranking baseado em precisão científica, credibilidade e transparência
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Influenciadores Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{influencers.length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alegações Verificadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalVerifiedClaims}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trust Score Médio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{averageTrustScore}%</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Influenciador</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Trust Score</TableHead>
                                <TableHead>Tendência</TableHead>
                                <TableHead>Seguidores</TableHead>
                                <TableHead>Alegações Verificadas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {influencers.map((influencer, index) => (
                                <TableRow key={influencer.id}>
                                    <TableCell>#{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{influencer.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{influencer.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full ${influencer.trustScore >= 80 ? 'bg-green-100 text-green-800' :
                                                influencer.trustScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {influencer.trustScore}%
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {influencer.trend === 'up' ? (
                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {(influencer.followers / 1000000).toFixed(1)}M
                                    </TableCell>
                                    <TableCell>
                                        {influencer.statistics.verifiedClaims}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default TrustLeaderboard;