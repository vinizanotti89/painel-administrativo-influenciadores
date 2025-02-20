import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader, Plus, ArrowLeft } from 'lucide-react';
import '@/styles/pages/SearchPage.css';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  
  // Configurações de pesquisa
  const [timeRange, setTimeRange] = useState('last-month');
  const [claimsToAnalyze, setClaimsToAnalyze] = useState(50);
  const [selectedJournals, setSelectedJournals] = useState([
    'PubMed Central',
    'Nature',
    'Science'
  ]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Simulando chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults = [{
        id: 1,
        name: searchTerm,
        platform: 'Instagram',
        followers: 50000,
        claims: 23,
        verifiedClaims: 18,
        trustScore: 85
      }];

      setResults(mockResults);
    } catch (error) {
      console.error('Erro na pesquisa:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      {/* Header */}
      <div className="search-header">
        <h1 className="search-title">Research Dashboard</h1>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="config-toggle-btn"
        >
          {showConfig ? 'Show Results' : 'Configure Research'}
        </button>
      </div>

      {!showConfig ? (
        // Search and Results View
        <div className="search-content">
          <Card>
            <CardHeader>
              <CardTitle>Search Influencers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="search-bar">
                <div className="search-input-container">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter influencer name..."
                    className="search-input"
                  />
                  <Search className="search-icon" />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="search-button"
                >
                  {loading ? (
                    <div className="loading-container">
                      <Loader className="loading-spinner" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <div className="results-grid">
              {results.map((result) => (
                <Card key={result.id} className="result-card">
                  <CardContent>
                    <div className="result-header">
                      <div className="result-info">
                        <h3 className="result-name">{result.name}</h3>
                        <p className="result-platform">
                          {result.platform} • {result.followers.toLocaleString()} followers
                        </p>
                      </div>
                      <div className="result-score">
                        <div className="trust-score">{result.trustScore}%</div>
                        <p className="score-label">Trust Score</p>
                      </div>
                    </div>

                    <div className="result-stats">
                      <div className="stat-box">
                        <div className="stat-value">{result.claims}</div>
                        <div className="stat-label">Total Claims</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-value verified">{result.verifiedClaims}</div>
                        <div className="stat-label">Verified Claims</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Configuration View
        <Card className="config-card">
          <CardContent>
            <div className="config-grid">
              <div className="config-section">
                <div className="config-group">
                  <h3 className="config-title">Time Range</h3>
                  <div className="time-range-buttons">
                    {['last-week', 'last-month', 'all-time'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                      >
                        {range.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="config-group">
                  <h3 className="config-title">Claims to Analyze</h3>
                  <input
                    type="number"
                    value={claimsToAnalyze}
                    onChange={(e) => setClaimsToAnalyze(Number(e.target.value))}
                    className="claims-input"
                    min={1}
                    max={100}
                  />
                </div>
              </div>

              <div className="config-section">
                <div className="config-group">
                  <h3 className="config-title">Selected Journals</h3>
                  <div className="journals-container">
                    {selectedJournals.map((journal) => (
                      <Badge key={journal} className="journal-badge">
                        {journal}
                      </Badge>
                    ))}
                    <button className="add-journal-btn">
                      <Plus className="plus-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;