import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { userProfile } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  if (!userProfile) return null;

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {userProfile.role === 'admin' && (
          <>
            <Link to="/admin" className={isActive('/admin')}>
              Dashboard
            </Link>
            <Link to="/admin/trials" className={isActive('/admin/trials')}>
              Prøver
            </Link>
            <Link to="/admin/participants" className={isActive('/admin/participants')}>
              Deltagere
            </Link>
            <Link to="/admin/judges" className={isActive('/admin/judges')}>
              Dommere
            </Link>
          </>
        )}

        {userProfile.role === 'judge' && (
          <>
            <Link to="/judge" className={isActive('/judge')}>
              Dashboard
            </Link>
            <Link to="/judge/invitations" className={isActive('/judge/invitations')}>
              Invitationer
            </Link>
            <Link to="/judge/trials" className={isActive('/judge/trials')}>
              Mine Prøver
            </Link>
          </>
        )}

        {userProfile.role === 'participant' && (
          <>
            <Link to="/participant" className={isActive('/participant')}>
              Dashboard
            </Link>
            <Link to="/participant/trials" className={isActive('/participant/trials')}>
              Mine Prøver
            </Link>
            <Link to="/participant/results" className={isActive('/participant/results')}>
              Resultater
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
