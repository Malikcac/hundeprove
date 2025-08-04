import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TrialSetup from './TrialSetup';
import ParticipantRegistration from './ParticipantRegistration';
import JudgeInvitation from './JudgeInvitation';
import ParticipantList from './ParticipantList';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { userProfile } = useAuth();

  const AdminHome = () => (
    <div className="admin-home">
      <div className="page-header">
        <h1 className="page-title">Administrator Dashboard</h1>
        <p className="page-subtitle">Velkommen, {userProfile?.name}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>🏆 Prøver</h3>
          <p>Opret og administrer hundeprøver</p>
          <Link to="/admin/trials" className="btn btn-primary">
            Administrer Prøver
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>👥 Deltagere</h3>
          <p>Registrer deltagere til prøver</p>
          <Link to="/admin/participants" className="btn btn-primary">
            Administrer Deltagere
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>⚖️ Dommere</h3>
          <p>Inviter og administrer dommere</p>
          <Link to="/admin/judges" className="btn btn-primary">
            Administrer Dommere
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>📊 Resultater</h3>
          <p>Se resultater og statistikker</p>
          <Link to="/admin/results" className="btn btn-primary">
            Se Resultater
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="trials" element={<TrialSetup />} />
        <Route path="participants" element={<ParticipantRegistration />} />
        <Route path="judges" element={<JudgeInvitation />} />
        <Route path="participant-list" element={<ParticipantList />} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
