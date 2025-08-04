import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ParticipantDashboard.css';

const ParticipantDashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="participant-dashboard">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Deltager Dashboard</h1>
          <p className="page-subtitle">Velkommen, {userProfile?.name}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>🏆 Mine Prøver</h3>
            <p>Se prøver du er tilmeldt</p>
            <button className="btn btn-primary">
              Se Mine Prøver
            </button>
          </div>

          <div className="dashboard-card">
            <h3>📊 Resultater</h3>
            <p>Se dine resultater og scores</p>
            <button className="btn btn-primary">
              Se Resultater
            </button>
          </div>

          <div className="dashboard-card">
            <h3>🐕 Mine Hunde</h3>
            <p>Administrer hundeoplysninger</p>
            <button className="btn btn-primary">
              Se Mine Hunde
            </button>
          </div>

          <div className="dashboard-card">
            <h3>📈 Statistikker</h3>
            <p>Se historik og præstationer</p>
            <button className="btn btn-primary">
              Se Statistikker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
