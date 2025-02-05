import React from 'react';
import { NavLink } from 'react-router-dom';
import '@/styles/layout/Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Influenciadores', path: '/influencers' },
    { name: 'Alegações', path: '/claims' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Relatórios', path: '/reports' },
    { name: 'Configurações', path: '/settings' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="menu-items">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;