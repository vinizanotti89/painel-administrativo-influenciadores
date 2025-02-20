import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      console.log('Starting research...');
    };
  
    return (
      <div className="research-container">
        <div className="research-header">
          <Button 
            variant="ghost" 
            className="back-button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1>Research Tasks</h1>
        </div>
  
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Research Configuration</h2>
          </div>
  
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Specific Influencer</h3>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search health influencer by name"
                    className="pl-10"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
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
                <p className="text-sm text-gray-500 mt-1">
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
                      <p className="text-sm text-gray-500">
                        Analyze monetization methods and affiliate earnings
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeRevenue}
                        onChange={(e) => setIncludeRevenue(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="toggle-slider"></div>
                    </label>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Verify with Scientific Journals</p>
                      <p className="text-sm text-gray-500">
                        Cross-reference claims with scientific literature
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verifyJournals}
                        onChange={(e) => setVerifyJournals(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="toggle-slider"></div>
                    </label>
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
                  placeholder="Add specific instructions or focus areas..."
                  value={researchNotes}
                  onChange={(e) => setResearchNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
  
          <div className="flex justify-end pt-6">
            <Button onClick={handleStartResearch}>
              Start Research
            </Button>
          </div>
        </Card>
      </div>
    );
  };
  
  export default ResearchConfig;