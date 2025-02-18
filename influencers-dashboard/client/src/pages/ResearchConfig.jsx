import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Research Tasks</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Research Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Specific Influencer</h3>
                <div className="relative">
                  <Input
                    placeholder="Research a known health influencer by name"
                    className="w-full pl-10"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Research a known health influencer by name
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Time Range</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={timeRange === 'last-week' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('last-week')}
                    className="flex-1"
                  >
                    Last Week
                  </Button>
                  <Button
                    variant={timeRange === 'last-month' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('last-month')}
                    className="flex-1"
                  >
                    Last Month
                  </Button>
                  <Button
                    variant={timeRange === 'all-time' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('all-time')}
                    className="flex-1"
                  >
                    All Time
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Claims to Analyze</h3>
                <Input
                  type="number"
                  value={claimsToAnalyze}
                  onChange={(e) => setClaimsToAnalyze(Number(e.target.value))}
                  min={1}
                  max={100}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: 50-100 claims for comprehensive analysis
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Analysis Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Include Revenue Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        Analyze monetization methods and affiliate earnings
                      </p>
                    </div>
                    <Switch
                      checked={includeRevenue}
                      onCheckedChange={setIncludeRevenue}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Verify with Scientific Journals</p>
                      <p className="text-sm text-muted-foreground">
                        Cross-reference claims with scientific literature
                      </p>
                    </div>
                    <Switch
                      checked={verifyJournals}
                      onCheckedChange={setVerifyJournals}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Scientific Journals</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJournals.map((journal) => (
                    <Badge key={journal} variant="secondary" className="text-sm">
                      {journal}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-6">
                    <Plus className="w-4 h-4" />
                    Add Journal
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Research Notes</h3>
                <textarea
                  className="w-full h-24 p-2 border rounded-md resize-none"
                  placeholder="Add any specific instructions or focus areas..."
                  value={researchNotes}
                  onChange={(e) => setResearchNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleStartResearch}
              className="w-full md:w-auto"
            >
              Start Research
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchConfig;