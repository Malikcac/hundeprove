import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TrialInvitations from './TrialInvitations';
import JudgeTrialView from './JudgeTrialView';
import './JudgeDashboard.css';

const JudgeDashboard = () => {
  const { userProfile } = useAuth();

  const JudgeHome = () => (
    <div className="judge-home">
      <div className="page-header">
        <h1 className="page-title">Dommer Dashboard</h1>
        <p className="page-subtitle">Velkommen, {userProfile?.name}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📧 Invitationer</h3>
          <p>Se og besvar invitationer til prøver</p>
          <Link to="/judge/invitations" className="btn btn-primary">
            Se Invitationer
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>⚖️ Mine Prøver</h3>
          <p>Prøver du skal dømme</p>
          <Link to="/judge/trials" className="btn btn-primary">
            Se Mine Prøver
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>📝 Bedømmelse</h3>
          <p>Indtast points og bedømmelser</p>
          <Link to="/judge/scoring" className="btn btn-primary">
            Start Bedømmelse
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>📊 Historik</h3>
          <p>Se tidligere bedømmelser</p>
          <Link to="/judge/history" className="btn btn-primary">
            Se Historik
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="judge-dashboard">
      <Routes>
        <Route index element={<JudgeHome />} />
        <Route path="invitations" element={<TrialInvitations />} />
        <Route path="trials" element={<JudgeTrialView />} />
        <Route path="scoring" element={<div className="page-container"><h1>Bedømmelse kommer snart...</h1></div>} />
        <Route path="history" element={<div className="page-container"><h1>Historik kommer snart...</h1></div>} />
      </Routes>
    </div>
  );
};

export default JudgeDashboard;
