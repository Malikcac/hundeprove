import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TrialInvitations from './TrialInvitations';
import JudgeTrialView from './JudgeTrialView';
import PostAssignment from './PostAssignment';
import JudgeScoring from './JudgeScoring';
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
            Mine Prøver
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
        <Route path="trials/:trialId/posts" element={<PostAssignment />} />
        <Route path="scoring/:trialId/:postNumber" element={<JudgeScoring />} />
      </Routes>
    </div>
  );
};

export default JudgeDashboard;
