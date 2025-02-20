import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInfluencer } from '@/contexts/InfluencerContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, DollarSign, Package, Users } from 'lucide-react';
import '@/styles/pages/InfluencerDetails.css';

const InfluencerDetails = () => {
  const { id } = useParams();
  const { influencers } = useInfluencer();
  const [selectedTab, setSelectedTab] = useState('claims');
  const [influencer, setInfluencer] = useState(null);

  useEffect(() => {
    const found = influencers.find(inf => inf.id === id);
    setInfluencer(found);
  }, [id, influencers]);

  if (!influencer) return null;

  const categories = ['Sleep', 'Performance', 'Hormones', 'Stress Management', 'Exercise Science', 'Circadian Biology'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Profile Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            {influencer.photo && (
              <img
                src={influencer.photo}
                alt={influencer.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{influencer.name}</h1>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Badge key={category} variant="secondary">{category}</Badge>
              ))}
            </div>
            <p className="text-muted-foreground mt-2">{influencer.bio}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Trust Score</p>
                <p className="text-2xl font-bold">{influencer.trustScore}%</p>
              </div>
              <ArrowUpRight className="text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Based on 127 verified claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Yearly Revenue</p>
                <p className="text-2xl font-bold">$5.0M</p>
              </div>
              <DollarSign className="text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Estimated earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Products</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Package className="text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Recommended products</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Followers</p>
                <p className="text-2xl font-bold">4.2M+</p>
              </div>
              <Users className="text-purple-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total following</p>
          </CardContent>
        </Card>
      </div>

      {/* Claims Analysis Tabs */}
      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="claims">Claims Analysis</TabsTrigger>
          <TabsTrigger value="products">Recommended Products</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
        </TabsList>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Claims</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline">All Claims</Button>
                  <Button variant="outline">Categories</Button>
                  <Button variant="outline">Date</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Claims list would go here */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents */}
      </Tabs>
    </div>
  );
};

export default InfluencerDetails;