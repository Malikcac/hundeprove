import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTrials, getParticipants } from '../../services/firestoreService';
import { formatDate } from '../../utils/dateUtils';
import Loading from '../common/Loading';
import './TrialParticipants.css';

const TrialParticipants = () => {
  const [searchParams] = useSearchParams();
  const [trials, setTrials] = useState([]);
  const [selectedTrial, setSelectedTrial] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    loadTrials();
  }, []);

  useEffect(() => {
    // Check for trialId in URL params and select that trial
    const trialId = searchParams.get('trialId');
    if (trialId && trials.length > 0) {
      setSelectedTrial(trialId);
    }
  }, [searchParams, trials]);

  useEffect(() => {
    if (selectedTrial) {
      loadParticipants();
    } else {
      setParticipants([]);
    }
  }, [selectedTrial]);

  const loadTrials = async () => {
    try {
      const trialsData = await getTrials();
      setTrials(trialsData);
    } catch (error) {
      console.error('Error loading trials:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    setParticipantsLoading(true);
    try {
      const participantsData = await getParticipants(selectedTrial);
      setParticipants(participantsData);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const getTrialStatus = (trial) => {
    const trialDate = trial.date?.toDate ? trial.date.toDate() : new Date(trial.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    trialDate.setHours(0, 0, 0, 0);
    
    if (trialDate < today) {
      return 'completed';
    } else if (trialDate.getTime() === today.getTime()) {
      return 'active';
    } else {
      return 'upcoming';
    }
  };

  const selectedTrialData = trials.find(t => t.id === selectedTrial);

  if (loading) {
    return <Loading message="Indlæser prøver..." />;
  }

  return (
    <div className="trial-participants">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Prøve Deltagere</h1>
          <p className="page-subtitle">Se og administrer deltagere for hver prøve</p>
        </div>

        <div className="trial-selector">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Vælg Prøve</h2>
            </div>
            
            <div className="selector-content">
              <div className="form-group">
                <label htmlFor="trial-select" className="form-label">
                  Prøve
                </label>
                <select
                  id="trial-select"
                  value={selectedTrial}
                  onChange={(e) => setSelectedTrial(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Vælg en prøve --</option>
                  {trials.map(trial => (
                    <option key={trial.id} value={trial.id}>
                      {trial.name} - {formatDate(trial.date)} ({getTrialStatus(trial)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {selectedTrial && (
          <div className="participants-section">
            <div className="card">
              <div className="card-header">
                <div className="participants-header">
                  <div>
                    <h2 className="card-title">
                      Deltagere - {selectedTrialData?.name}
                    </h2>
                    <p className="card-subtitle">
                      📅 {formatDate(selectedTrialData?.date)} • 
                      📍 {selectedTrialData?.numberOfPosts} poster • 
                      👥 {participants.length} deltagere
                    </p>
                  </div>
                </div>
              </div>

              {participantsLoading ? (
                <Loading message="Indlæser deltagere..." />
              ) : participants.length === 0 ? (
                <div className="no-participants">
                  <h3>Ingen deltagere</h3>
                  <p>Der er ikke registreret nogen deltagere til denne prøve endnu.</p>
                </div>
              ) : (
                <div className="participants-table-container">
                  <table className="participants-table">
                    <thead>
                      <tr>
                        <th>Nr.</th>
                        <th>Hundens Navn</th>
                        <th>Hunde Nr.</th>
                        <th>Køn</th>
                        <th>Race</th>
                        <th>Hundefører</th>
                        <th>Email</th>
                        <th>Handlinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map(participant => (
                        <tr key={participant.id}>
                          <td className="participant-number">
                            {participant.participantNumber}
                          </td>
                          <td className="dog-name">
                            <strong>{participant.dogName}</strong>
                          </td>
                          <td className="dog-number">
                            {participant.dogNumber}
                          </td>
                          <td className="gender">
                            <span className={`gender-badge gender-${participant.gender.toLowerCase()}`}>
                              {participant.gender === 'T' ? 'Tæve' : 'Hanhund'}
                            </span>
                          </td>
                          <td className="breed">
                            {participant.breed}
                          </td>
                          <td className="handler">
                            {participant.handler}
                          </td>
                          <td className="email">
                            <a href={`mailto:${participant.email}`}>
                              {participant.email}
                            </a>
                          </td>
                          <td className="actions">
                            <button className="btn btn-small btn-secondary">
                              Rediger
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialParticipants;
