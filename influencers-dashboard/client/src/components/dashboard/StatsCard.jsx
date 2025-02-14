import React from 'react';
import * as Icons from 'lucide-react';
import '@/styles/components/dashboard/stats-card.css';

const StatsCard = ({ title, value, icon }) => {
  const Icon = Icons[icon];
  
  return (
    <div className="stats-card">
      <div className="stats-content">
        <div className="stats-info">
          <p className="stats-title">{title}</p>
          <p className="stats-value">{value}</p>
        </div>
        {Icon && <Icon className="stats-icon" />}
      </div>
    </div>
  );
};

export default StatsCard;