import React from "react";
import SearchBar from "@/components/ui/SearchBar";
import '@/styles/layout/MainContent.css';

const MainContent = ({ children }) => {
  return (
    <main className="main-content">
      <div className="content-container">
        <div className="search-container">
          <SearchBar />
        </div>
        {children}
      </div>
    </main>
  );
};

export default MainContent;