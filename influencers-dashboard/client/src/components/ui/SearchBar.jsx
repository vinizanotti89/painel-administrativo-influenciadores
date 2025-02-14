import React, { useState } from 'react';
import { useInfluencer } from '../../contexts/InfluencerContext';
import '@/styles/components/ui/SearchBar.css';

const SearchBar = ({ 
  placeholder = 'Buscar influenciadores...', 
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { updateFilters } = useInfluencer();

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateFilters({ search: value }); // Busca em tempo real
  };

  return (
    <form onSubmit={handleSubmit} className={`search-form ${className}`}>
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          className="search-input"
          placeholder={placeholder}
        />
        <button type="submit" className="search-button">
          <span className="search-button-text">Buscar</span>
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;