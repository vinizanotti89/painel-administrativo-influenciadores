import React from 'react';
import InfluencerTableRow from './InfluencerTableRow';

const InfluencerTable = ({ influencers }) => {
  return (
    <div className="table-container">
      <table className="influencers-table">
        <thead>
          <tr>
            <th>Médico</th>
            <th>Especialidade</th>
            <th>Plataforma</th>
            <th>Seguidores</th>
            <th>Pontuação</th>
            <th>Histórico</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {influencers && influencers.map((influencer) => (
            <InfluencerTableRow 
              key={influencer.id || `inf-${Math.random()}`} 
              influencer={influencer} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InfluencerTable;