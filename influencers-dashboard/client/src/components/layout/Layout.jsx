import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import '@/styles/layout/Layout.css';

const Layout = React.forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div className={`layout ${className}`} ref={ref} {...props}>
      <Header />
      <div className="layout-container">
        <Sidebar />
        <MainContent>
          {children}
        </MainContent>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;