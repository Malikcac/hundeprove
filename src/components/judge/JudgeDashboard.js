import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './JudgeDashboard.css';

const JudgeDashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="judge-dashboard">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dommer Dashboard</h1>
          <p className="page-subtitle">Velkommen, {userProfile?.name}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📧 Invitationer</h3>
            <p>Se og besvar invitationer til prøver</p>
            <button className="btn btn-primary">
              Se Invitationer
            </button>
          </div>

          <div className="dashboard-card">
            <h3>⚖️ Mine Prøver</h3>
            <p>Prøver du skal dømme</p>
            <button className="btn btn-primary">
              Se Mine Prøver
            </button>
          </div>

          <div className="dashboard-card">
            <h3>📝 Bedømmelse</h3>
            <p>Indtast points og bedømmelser</p>
            <button className="btn btn-primary">
              Start Bedømmelse
            </button>
          </div>

          <div className="dashboard-card">
            <h3>📊 Historik</h3>
            <p>Se tidligere bedømmelser</p>
            <button className="btn btn-primary">
              Se Historik
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;
