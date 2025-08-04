import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Navigation from './Navigation';
import './Header.css';

const Header = () => {
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <h1>🐕 Hundeprøve System</h1>
        </div>
        
        {userProfile && (
          <div className="header-user-info">
            <span className="user-name">
              {userProfile.name} ({userProfile.role})
            </span>
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              Log ud
            </button>
          </div>
        )}
      </div>
      
      {userProfile && <Navigation />}
    </header>
  );
};

export default Header;
