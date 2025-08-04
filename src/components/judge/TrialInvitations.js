import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getJudgeInvitations, updateJudgeInvitation, getTrial } from '../../services/firestoreService';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';
import './TrialInvitations.css';

const TrialInvitations = () => {
  const { userProfile } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const loadInvitations = useCallback(async () => {
    try {
      const invitationsData = await getJudgeInvitations(userProfile.email);
      
      // Hent trial information for hver invitation
      const invitationsWithTrials = await Promise.all(
        invitationsData.map(async (invitation) => {
          try {
            const trial = await getTrial(invitation.trialId);
            return { ...invitation, trial };
          } catch (error) {
            console.error('Error loading trial for invitation:', error);
            return { ...invitation, trial: null };
          }
        })
      );
      
      setInvitations(invitationsWithTrials);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast.error('Fejl ved indlæsning af invitationer');
    } finally {
      setLoading(false);
    }
  }, [userProfile.email]);

  useEffect(() => {
    if (userProfile?.email) {
      loadInvitations();
    }
  }, [userProfile, loadInvitations]);

  const handleInvitationResponse = async (invitationId, status) => {
    setActionLoading(prev => ({ ...prev, [invitationId]: true }));
    
    try {
      await updateJudgeInvitation(invitationId, status);
      
      // Opdater local state
      setInvitations(prev => prev.map(inv => 
        inv.id === invitationId 
          ? { ...inv, status, respondedAt: new Date() }
          : inv
      ));
      
      const statusText = status === 'accepted' ? 'accepteret' : 'afvist';
      toast.success(`Invitation ${statusText}!`);
      
    } catch (error) {
      console.error('Error updating invitation:', error);
      toast.error('Fejl ved opdatering af invitation');
    } finally {
      setActionLoading(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending">Afventer svar</span>;
      case 'accepted':
        return <span className="status-badge status-accepted">Accepteret</span>;
      case 'declined':
        return <span className="status-badge status-declined">Afvist</span>;
      default:
        return <span className="status-badge status-pending">Ukendt</span>;
    }
  };

  if (loading) {
    return <Loading message="Indlæser invitationer..." />;
  }

  return (
    <div className="trial-invitations">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Mine Invitationer</h1>
          <p className="page-subtitle">Se og besvar invitationer til prøver</p>
        </div>

        {invitations.length === 0 ? (
          <div className="card">
            <div className="no-invitations">
              <h3>Ingen invitationer</h3>
              <p>Du har ingen invitationer til prøver i øjeblikket.</p>
            </div>
          </div>
        ) : (
          <div className="invitations-list">
            {invitations.map(invitation => (
              <div key={invitation.id} className="invitation-card">
                <div className="invitation-header">
                  <div className="invitation-info">
                    <h3 className="trial-name">
                      {invitation.trial?.name || 'Prøve ikke fundet'}
                    </h3>
                    <p className="trial-date">
                      📅 {invitation.trial ? formatDate(invitation.trial.date) : 'Dato ikke tilgængelig'}
                    </p>
                    <p className="trial-posts">
                      📍 {invitation.trial?.numberOfPosts || 0} poster
                    </p>
                  </div>
                  <div className="invitation-status">
                    {getStatusBadge(invitation.status)}
                  </div>
                </div>
                
                <div className="invitation-details">
                  <p><strong>Inviteret af:</strong> Administrator</p>
                  <p><strong>Inviteret den:</strong> {formatDate(invitation.createdAt)}</p>
                  {invitation.respondedAt && (
                    <p><strong>Besvaret den:</strong> {formatDate(invitation.respondedAt)}</p>
                  )}
                </div>

                {invitation.status === 'pending' && (
                  <div className="invitation-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                      disabled={actionLoading[invitation.id]}
                    >
                      {actionLoading[invitation.id] ? 'Accepterer...' : '✓ Accepter'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleInvitationResponse(invitation.id, 'declined')}
                      disabled={actionLoading[invitation.id]}
                    >
                      {actionLoading[invitation.id] ? 'Afviser...' : '✗ Afvis'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialInvitations;
