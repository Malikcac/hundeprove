import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createJudgeInvitation, getJudgeInvitations, getTrials } from '../../services/firestoreService';
import { validateEmail } from '../../utils/validation';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';
import './JudgeInvitation.css';

const JudgeInvitation = () => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    trialId: ''
  });
  const [trials, setTrials] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trialsData, invitationsData] = await Promise.all([
        getTrials(),
        getJudgeInvitations()
      ]);
      
      // Filtrer kun kommende prøver
      const upcomingTrials = trialsData.filter(trial => {
        const trialDate = trial.date?.toDate ? trial.date.toDate() : new Date(trial.date);
        return trialDate >= new Date();
      });
      
      setTrials(upcomingTrials);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fejl ved indlæsning af data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !validateEmail(formData.email)) {
      toast.error('Indtast venligst en gyldig email adresse');
      return;
    }

    if (!formData.trialId) {
      toast.error('Vælg venligst en prøve');
      return;
    }

    // Check if judge is already invited to this trial
    const existingInvitation = invitations.find(inv => 
      inv.judgeEmail === formData.email && inv.trialId === formData.trialId
    );

    if (existingInvitation) {
      toast.error('Dommeren er allerede inviteret til denne prøve');
      return;
    }

    setLoading(true);

    try {
      await createJudgeInvitation({
        judgeEmail: formData.email,
        trialId: formData.trialId,
        invitedBy: userProfile.uid
      });
      
      toast.success('Invitation sendt til dommeren!');
      setFormData({ email: '', trialId: '' });
      
      // Reload invitations
      loadData();
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Fejl ved afsendelse af invitation');
    } finally {
      setLoading(false);
    }
  };

  const getInvitationStatus = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending">Afventer</span>;
      case 'accepted':
        return <span className="status-badge status-accepted">Accepteret</span>;
      case 'declined':
        return <span className="status-badge status-declined">Afvist</span>;
      default:
        return <span className="status-badge status-pending">Ukendt</span>;
    }
  };

  const getTrialName = (trialId) => {
    const trial = trials.find(t => t.id === trialId);
    return trial ? trial.name : 'Prøve ikke fundet';
  };

  const getTrialDate = (trialId) => {
    const trial = trials.find(t => t.id === trialId);
    return trial ? formatDate(trial.date) : 'Dato ikke tilgængelig';
  };

  if (loadingData) {
    return <Loading message="Indlæser data..." />;
  }

  return (
    <div className="judge-invitation">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dommer Invitationer</h1>
          <p className="page-subtitle">Inviter dommere til prøver</p>
        </div>

        <div className="invitation-content">
          <div className="send-invitation-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Send Invitation</h2>
                <p className="card-subtitle">Inviter en dommer til en specifik prøve</p>
              </div>
              
              {trials.length === 0 ? (
                <div className="no-trials">
                  <p>Ingen kommende prøver tilgængelige for invitationer.</p>
                  <p>Opret først en prøve før du kan invitere dommere.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="form">
                  <div className="form-group">
                    <label htmlFor="trialId" className="form-label">
                      Vælg Prøve *
                    </label>
                    <select
                      id="trialId"
                      name="trialId"
                      value={formData.trialId}
                      onChange={handleChange}
                      className="form-select"
                      disabled={loading}
                      required
                    >
                      <option value="">-- Vælg en prøve --</option>
                      {trials.map(trial => (
                        <option key={trial.id} value={trial.id}>
                          {trial.name} - {formatDate(trial.date)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Dommers Email Adresse *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                      placeholder="dommer@email.com"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Sender...' : 'Send Invitation'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="invitations-list-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Sendte Invitationer</h2>
              </div>
              
              {invitations.length === 0 ? (
                <div className="no-invitations">
                  <p>Ingen invitationer sendt endnu.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Dommer Email</th>
                        <th>Prøve</th>
                        <th>Dato</th>
                        <th>Status</th>
                        <th>Sendt</th>
                        <th>Besvaret</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map(invitation => (
                        <tr key={invitation.id}>
                          <td>{invitation.judgeEmail}</td>
                          <td>{getTrialName(invitation.trialId)}</td>
                          <td>{getTrialDate(invitation.trialId)}</td>
                          <td>{getInvitationStatus(invitation.status)}</td>
                          <td>{formatDate(invitation.createdAt)}</td>
                          <td>
                            {invitation.respondedAt 
                              ? formatDate(invitation.respondedAt)
                              : '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeInvitation;
