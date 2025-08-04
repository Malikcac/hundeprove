import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getParticipants, getScores, getUsers, getTrials } from '../../services/firestoreService';
import { formatDate } from '../../utils/dateUtils';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';
import './ParticipantDashboard.css';

const ParticipantDashboard = () => {
  const { userProfile } = useAuth();
  const [myParticipations, setMyParticipations] = useState([]);
  const [scores, setScores] = useState({});
  const [judges, setJudges] = useState({});
  const [trials, setTrials] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyData();
  }, [userProfile]);

  const loadMyData = async () => {
    try {
      if (!userProfile?.email) return;

      // Get my participations (where email matches)
      const allParticipants = await getParticipants();
      const myParticipations = allParticipants.filter(p => p.email === userProfile.email);
      
      setMyParticipations(myParticipations);

      // Get trial information for each participation
      const allTrials = await getTrials();
      const trialsMap = {};
      allTrials.forEach(trial => {
        trialsMap[trial.id] = trial;
      });
      setTrials(trialsMap);

      // Get scores for my participations
      const allScores = {};
      const judgeIds = new Set();

      for (const participation of myParticipations) {
        try {
          const participationScores = await getScores(participation.trialId, participation.id);
          allScores[participation.id] = participationScores;
          
          // Collect judge IDs
          participationScores.forEach(score => {
            if (score.judgeId) judgeIds.add(score.judgeId);
          });
        } catch (error) {
          console.log(`No scores found for participation ${participation.id}`);
          allScores[participation.id] = [];
        }
      }

      setScores(allScores);

      // Get judge information
      if (judgeIds.size > 0) {
        const allUsers = await getUsers();
        const judgeMap = {};
        allUsers.forEach(user => {
          if (judgeIds.has(user.id)) {
            judgeMap[user.id] = user;
          }
        });
        setJudges(judgeMap);
      }

    } catch (error) {
      console.error('Error loading participant data:', error);
      toast.error('Fejl ved indlæsning af data');
    } finally {
      setLoading(false);
    }
  };

  const getTotalScore = (participationId) => {
    const participationScores = scores[participationId] || [];
    return participationScores.reduce((total, score) => total + score.score, 0);
  };

  const getMaxPossibleScore = (participationId, numberOfPosts) => {
    return numberOfPosts * 20; // Max 20 points per post
  };

  const getAllPosts = (participationId, numberOfPosts) => {
    const participationScores = scores[participationId] || [];
    const allPosts = [];
    
    for (let postNumber = 1; postNumber <= numberOfPosts; postNumber++) {
      const existingScore = participationScores.find(score => score.postNumber === postNumber);
      allPosts.push({
        postNumber,
        score: existingScore?.score || null,
        judgeId: existingScore?.judgeId || null,
        hasScore: !!existingScore
      });
    }
    
    return allPosts;
  };

  if (loading) {
    return <Loading message="Indlæser dine prøver..." />;
  }

  return (
    <div className="participant-dashboard">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Deltager Dashboard</h1>
          <p className="page-subtitle">Velkommen, {userProfile?.name}</p>
        </div>

        {myParticipations.length === 0 ? (
          <div className="card">
            <div className="no-participations">
              <h3>Ingen prøver</h3>
              <p>Du er ikke tilmeldt nogen prøver endnu.</p>
            </div>
          </div>
        ) : (
          <div className="participations-list">
            {myParticipations.map(participation => {
              const trial = trials[participation.trialId];
              const numberOfPosts = trial?.numberOfPosts || 0;
              const allPosts = getAllPosts(participation.id, numberOfPosts);
              const totalScore = getTotalScore(participation.id);
              const maxScore = getMaxPossibleScore(participation.id, numberOfPosts);
              const completedPosts = allPosts.filter(post => post.hasScore).length;
              const averageScore = completedPosts > 0 ? (totalScore / completedPosts).toFixed(1) : 0;

              return (
                <div key={participation.id} className="participation-card">
                  <div className="participation-header">
                    <div className="participation-info">
                      <h3 className="trial-name">{trial?.name || 'Hundeprøve'}</h3>
                      <p className="participation-details">
                        <span className="participant-number">#{participation.participantNumber}</span>
                        <span className="dog-info">{participation.dogName}</span>
                        <span className="trial-date">📅 {formatDate(trial?.date || participation.createdAt)}</span>
                      </p>
                    </div>
                    
                    <div className="score-summary">
                      <div className="total-score">
                        <span className="score-value">{totalScore}</span>
                        <span className="score-max">/{maxScore}</span>
                      </div>
                      <div className="progress-info">
                        <div className="completed-posts">{completedPosts}/{numberOfPosts} poster</div>
                        {completedPosts > 0 && (
                          <div className="average-score">Gennemsnit: {averageScore}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="participation-details-section">
                    <div className="dog-details">
                      <p><strong>Hund:</strong> {participation.dogName}</p>
                      <p><strong>Hund nr:</strong> {participation.dogNumber}</p>
                      <p><strong>Race:</strong> {participation.breed}</p>
                      <p><strong>Fører:</strong> {participation.handler}</p>
                    </div>
                  </div>

                  <div className="scores-section">
                    <h4>📊 Bedømmelser ({completedPosts}/{numberOfPosts} poster)</h4>
                    <div className="scores-grid">
                      {allPosts.map(post => (
                        <div key={post.postNumber} className={`score-item ${!post.hasScore ? 'no-score' : ''}`}>
                          <div className="score-header">
                            <span className="post-number">Post {post.postNumber}</span>
                            <span className="score-points">
                              {post.hasScore ? `${post.score}/20` : '—/20'}
                            </span>
                          </div>
                          <div className="score-judge">
                            {post.hasScore ? 
                              `Dommer: ${judges[post.judgeId]?.name || 'Ukendt'}` : 
                              'Ikke bedømt endnu'
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;
