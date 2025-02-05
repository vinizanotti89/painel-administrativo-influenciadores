import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import '@/styles/components/dashboard/stats-card.css';

const StatsCard = ({ title, value, icon: Icon, trend, description }) => {
  const isPositiveTrend = trend?.startsWith('+');
  
  return (
    <Card className="stats-card">
      <div className="stats-card-header">
        <h3 className="stats-card-title">{title}</h3>
        {Icon && <Icon className="stats-card-icon" />}
      </div>
      <div className="stats-card-content">
        <div className="stats-card-main">
          <span className="stats-card-value">{value}</span>
          {trend && (
            <Badge 
              className={`stats-card-trend ${
                isPositiveTrend ? 'trend-positive' : 'trend-negative'
              }`}
            >
              {isPositiveTrend ? (
                <TrendingUp className="trend-icon" />
              ) : (
                <TrendingDown className="trend-icon" />
              )}
              {trend}
            </Badge>
          )}
        </div>
        {description && (
          <p className="stats-card-description">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
