import React from 'react';
import * as Icons from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import '@/styles/components/dashboard/stats-card.css';

const StatsCard = ({ title, value, icon, trend, description }) => {
  const Icon = Icons[icon];
  const { theme } = useTheme();
  
  const getTrendClass = () => {
    if (!trend) return '';
    return trend.startsWith('+') ? 'trend-positive' : 'trend-negative';
  };
  
  return (
    <div className={`stats-card ${theme}`}>
      <div className="stats-card-header">
        <h3 className="stats-card-title">{title}</h3>
        {Icon && <Icon className="stats-card-icon" />}
      </div>
      <div className="stats-card-content">
        <div className="stats-card-main">
          <span className="stats-card-value">{value}</span>
          {trend && (
            <span className={`stats-card-trend ${getTrendClass()}`}>
              {trend}
            </span>
          )}
        </div>
        {description && (
          <p className="stats-card-description">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;