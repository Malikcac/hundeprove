import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrials } from '../../services/firestoreService';
import { formatDate, isToday, isPastDate } from '../../utils/dateUtils';
import Loading from '../common/Loading';
import './JudgeTrialView.css';

const JudgeTrialView = () => {
  const { userProfile } = useAuth();
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyTrials();
  }, [userProfile]);

  const loadMyTrials = async () => {
    try {
      const allTrials = await getTrials();
      
      // Filtrer kun prøver hvor brugeren er dommer
      const myTrials = allTrials.filter(trial => 
        trial.judges && trial.judges.includes(userProfile.uid)
      );
      
      setTrials(myTrials);
    } catch (error) {
      console.error('Error loading trials:', error);
    } finally {
      setLoading(false);
    }
  };

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
                        👥 {trial.participants?.length || 0} deltagere
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
                      <button className="btn btn-success">
                        🏆 Start Bedømmelse
                      </button>
                    ) : trialStatus.status === 'upcoming' ? (
                      <button className="btn btn-secondary" disabled>
                        ⏰ Bedømmelse tilgængelig på prøve dagen
                      </button>
                    ) : (
                      <button className="btn btn-secondary">
                        📊 Se Resultater
                      </button>
                    )}
                    
                    <button className="btn btn-secondary">
                      👥 Se Deltagere
                    </button>
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
