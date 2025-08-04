import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJudgeTrials, getParticipants } from '../../services/firestoreService';
import { formatDate, isToday, isPastDate } from '../../utils/dateUtils';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';
import './JudgeTrialView.css';

const JudgeTrialView = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState({});

  const loadMyTrials = useCallback(async () => {
    try {
      if (!userProfile?.uid || !userProfile?.email) {
        return;
      }
      
      // Use the new function to get trials based on accepted invitations
      const myTrials = await getJudgeTrials(userProfile.uid, userProfile.email);
      setTrials(myTrials);
      
      // Load participant counts for each trial
      const counts = {};
      for (const trial of myTrials) {
        try {
          const participants = await getParticipants(trial.id);
          counts[trial.id] = participants.length;
        } catch (error) {
          console.error(`Error loading participants for trial ${trial.id}:`, error);
          counts[trial.id] = 0;
        }
      }
      setParticipantCounts(counts);
      
    } catch (error) {
      console.error('Error loading trials:', error);
      toast.error('Fejl ved indlæsning af prøver');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.uid, userProfile?.email]);

  useEffect(() => {
    loadMyTrials();
  }, [loadMyTrials]);

  const getTrialStatus = (trial) => {
    const trialDate = trial.date?.toDate ? trial.date.toDate() : new Date(trial.date);
    
    if (isToday(trialDate)) {
      return { status: 'active', text: 'I dag' };
    } else if (isPastDate(trialDate)) {
      return { status: 'completed', text: 'Afsluttet' };
    } else {
      return { status: 'upcoming', text: 'Kommende' };
    }
  };

  const canJudge = (trial) => {
    return isToday(trial.date);
  };

  const handleStartScoring = (trial) => {
    // Navigate to post assignment page
    navigate(`/judge/trials/${trial.id}/posts`);
  };

  const handleViewParticipants = (trial) => {
    const participantCount = participantCounts[trial.id] || 0;
    if (participantCount === 0) {
      toast.success(`Ingen deltagere registreret til "${trial.name}" endnu.`);
    } else {
      toast.success(`"${trial.name}" har ${participantCount} deltagere. Deltagervisning kommer snart...`);
    }
  };

  const handleViewResults = (trial) => {
    toast.success(`Resultater for "${trial.name}" kommer snart...`);
  };

  if (loading) {
    return <Loading message="Indlæser dine prøver..." />;
  }

  return (
    <div className="judge-trial-view">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Mine Prøver</h1>
          <p className="page-subtitle">Prøver du skal dømme</p>
        </div>

        {trials.length === 0 ? (
          <div className="card">
            <div className="no-trials">
              <h3>Ingen prøver</h3>
              <p>Du er ikke tildelt som dommer på nogen prøver endnu.</p>
              <p>Accepter invitationer for at se prøver her.</p>
            </div>
          </div>
        ) : (
          <div className="trials-list">
            {trials.map(trial => {
              const trialStatus = getTrialStatus(trial);
              
              return (
                <div key={trial.id} className="trial-card">
                  <div className="trial-header">
                    <div className="trial-info">
                      <h3 className="trial-name">{trial.name}</h3>
                      <p className="trial-date">
                        📅 {formatDate(trial.date)}
                      </p>
                      <p className="trial-posts">
                        📍 {trial.numberOfPosts} poster
                      </p>
                      <p className="trial-participants">
                        👥 {participantCounts[trial.id] || 0} deltagere
                      </p>
                    </div>
                    <div className="trial-status">
                      <span className={`status-badge status-${trialStatus.status}`}>
                        {trialStatus.text}
                      </span>
                    </div>
                  </div>

                  <div className="trial-actions">
                    {canJudge(trial) ? (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleStartScoring(trial)}
                        title="Start bedømmelse af denne prøve"
                      >
                        🏆 Bedøm
                      </button>
                    ) : trialStatus.status === 'upcoming' ? (
                      <button className="btn btn-secondary" disabled>
                        ⏰ Bedømmelse tilgængelig på prøve dagen
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleViewResults(trial)}
                        title="Se resultater for denne prøve"
                      >
                        📊 Se Resultater
                      </button>
                    )}
                  </div>

                  {isToday(trial.date) && (
                    <div className="judge-info">
                      <div className="info-box">
                        <h4>📋 Dagens Bedømmelse</h4>
                        <p>Du kan nu bedømme denne prøve. Klik på "Start Bedømmelse" for at begynde.</p>
                        <ul>
                          <li>Indtast points for hver post (0-20)</li>
                          <li>Sørg for at validere deltager numre</li>
                          <li>Gem løbende for ikke at miste data</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeTrialView;
