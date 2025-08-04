import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getTrial, 
  getParticipants, 
  getScores,
  createScore,
  updateScore 
} from '../../services/firestoreService';
import { formatDate } from '../../utils/dateUtils';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';
import './JudgeScoring.css';

const JudgeScoring = () => {
  const { trialId, postNumber } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [trial, setTrial] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [participantNumber, setParticipantNumber] = useState('');
  const [score, setScore] = useState('');

  useEffect(() => {
    loadScoringData();
  }, [trialId, postNumber]);

  const loadScoringData = async () => {
    try {
      console.log('Loading scoring data for trial:', trialId, 'post:', postNumber);
      
      const [trialData, participantsData] = await Promise.all([
        getTrial(trialId),
        getParticipants(trialId)
      ]);
      
      setTrial(trialData);
      setParticipants(participantsData);
      
      // Try to load existing scores (might fail if none exist yet)
      try {
        const scoresData = await getScores(trialId);
        const scoresMap = {};
        scoresData.forEach(scoreData => {
          if (scoreData.postNumber === parseInt(postNumber)) {
            scoresMap[scoreData.participantId] = scoreData;
          }
        });
        setScores(scoresMap);
      } catch (scoresError) {
        console.log('No existing scores found, starting fresh');
        setScores({});
      }
      
    } catch (error) {
      console.error('Error loading scoring data:', error);
      toast.error('Fejl ved indlæsning af bedømmelsesdata');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    
    if (!participantNumber || score === '') {
      toast.error('Indtast deltagernummer og point');
      return;
    }

    const scoreValue = parseInt(score);
    if (scoreValue < 0 || scoreValue > 20) {
      toast.error('Point skal være mellem 0 og 20');
      return;
    }

    // Find participant by participant number
    const participant = participants.find(p => p.participantNumber === participantNumber);
    if (!participant) {
      toast.error(`Deltager ${participantNumber} ikke fundet`);
      return;
    }

    setSubmittingScore(true);
    
    try {
      const existingScore = scores[participant.id];
      
      const scoreData = {
        trialId,
        participantId: participant.id,
        participantNumber: participant.participantNumber,
        postNumber: parseInt(postNumber),
        score: scoreValue,
        judgeId: userProfile.uid,
        dogName: participant.dogName,
        handler: participant.handler
      };

      if (existingScore) {
        // Update existing score
        await updateScore(existingScore.id, scoreData);
        toast.success(`Opdateret score for deltager ${participantNumber}: ${scoreValue} point`);
      } else {
        // Create new score
        await createScore(scoreData);
        toast.success(`Bedømt deltager ${participantNumber}: ${scoreValue} point`);
      }
      
      // Reload scores to show updated data
      await loadScoringData();
      
      // Clear form
      setParticipantNumber('');
      setScore('');
      
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error('Fejl ved bedømmelse: ' + error.message);
    } finally {
      setSubmittingScore(false);
    }
  };

  const getParticipantScore = (participantId) => {
    return scores[participantId]?.score;
  };

  const getScoredParticipants = () => {
    return participants.filter(p => scores[p.id]);
  };

  if (loading) {
    return <Loading message="Indlæser bedømmelsesdata..." />;
  }

  if (!trial) {
    return (
      <div className="error-container">
        <h2>Prøve ikke fundet</h2>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Gå tilbage
        </button>
      </div>
    );
  }

  return (
    <div className="judge-scoring">
      <div className="page-container">
        <div className="page-header">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-secondary back-btn"
          >
            ← Tilbage
          </button>
          <div className="header-info">
            <h1 className="page-title">Bedømmelse - Post {postNumber}</h1>
            <p className="page-subtitle">
              {trial.name} • {formatDate(trial.date)}
            </p>
          </div>
        </div>

        <div className="scoring-content">
          {/* Quick Scoring Form */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Bedøm Deltager</h2>
            </div>
            
            <form onSubmit={handleScoreSubmit} className="scoring-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="participantNumber" className="form-label">
                    Deltagernummer
                  </label>
                  <input
                    type="text"
                    id="participantNumber"
                    value={participantNumber}
                    onChange={(e) => setParticipantNumber(e.target.value)}
                    className="form-input"
                    placeholder="0001"
                    disabled={submittingScore}
                    maxLength={4}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="score" className="form-label">
                    Point (0-20)
                  </label>
                  <input
                    type="number"
                    id="score"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="form-input"
                    min="0"
                    max="20"
                    placeholder="15"
                    disabled={submittingScore}
                  />
                </div>
                
                <div className="form-group">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submittingScore}
                  >
                    {submittingScore ? 'Gemmer...' : 'Gem Score'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Participants Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                Tilmeldte Deltagere ({participants.length})
              </h2>
            </div>
            
            {participants.length === 0 ? (
              <p className="no-data">Ingen deltagere tilmeldt endnu.</p>
            ) : (
              <div className="participants-overview">
                <div className="participants-grid">
                  {participants.map(participant => {
                    const participantScore = getParticipantScore(participant.id);
                    const isScored = participantScore !== undefined;
                    
                    return (
                      <div 
                        key={participant.id} 
                        className={`participant-card ${isScored ? 'scored' : 'pending'}`}
                        onClick={() => {
                          setParticipantNumber(participant.participantNumber);
                          if (isScored) {
                            setScore(participantScore.toString());
                          }
                        }}
                      >
                        <div className="participant-number">
                          #{participant.participantNumber}
                        </div>
                        <div className="participant-info">
                          <div className="dog-name">{participant.dogName}</div>
                          <div className="handler">{participant.handler}</div>
                        </div>
                        <div className="participant-score">
                          {isScored ? (
                            <span className="score-value">{participantScore} pt</span>
                          ) : (
                            <span className="score-pending">Ikke bedømt</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Scored Summary */}
          {getScoredParticipants().length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  Bedømte Deltagere ({getScoredParticipants().length})
                </h2>
              </div>
              
              <div className="scored-summary">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Deltager</th>
                        <th>Hund</th>
                        <th>Fører</th>
                        <th>Point</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getScoredParticipants()
                        .sort((a, b) => getParticipantScore(b.id) - getParticipantScore(a.id))
                        .map(participant => (
                        <tr key={participant.id}>
                          <td>#{participant.participantNumber}</td>
                          <td>{participant.dogName}</td>
                          <td>{participant.handler}</td>
                          <td className="score-cell">
                            <span className="score-badge">
                              {getParticipantScore(participant.id)} pt
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JudgeScoring;
