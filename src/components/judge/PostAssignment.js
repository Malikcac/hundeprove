import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTrial, assignJudgeToPost, getParticipants } from '../../services/firestoreService';
import { formatDate } from '../../utils/dateUtils';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';
import './PostAssignment.css';

const PostAssignment = () => {
  const { trialId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [trial, setTrial] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState('');

  useEffect(() => {
    loadTrialData();
  }, [trialId]);

  const loadTrialData = async () => {
    try {
      console.log('Loading trial data for:', { trialId, userProfile });
      
      const [trialData, participantsData] = await Promise.all([
        getTrial(trialId),
        getParticipants(trialId)
      ]);
      
      console.log('Trial data loaded:', trialData);
      console.log('Judge in judges array?', trialData.judges?.includes(userProfile.uid));
      
      setTrial(trialData);
      setParticipants(participantsData);
      
      // Check if judge is already assigned to a post
      if (trialData.postAssignments && trialData.postAssignments[userProfile.uid]) {
        setSelectedPost(trialData.postAssignments[userProfile.uid]);
      }
      
    } catch (error) {
      console.error('Error loading trial data:', error);
      toast.error('Fejl ved indlæsning af prøvedata');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAssignment = async (postNumber) => {
    try {
      console.log('Attempting to assign judge to post:', { 
        trialId, 
        judgeId: userProfile.uid, 
        postNumber,
        userProfile 
      });
      
      await assignJudgeToPost(trialId, userProfile.uid, postNumber);
      setSelectedPost(postNumber);
      
      // Navigate directly to scoring instead of just setting selected post
      navigate(`/judge/scoring/${trialId}/${postNumber}`);
      
    } catch (error) {
      console.error('Error assigning to post:', error);
      console.error('Error details:', error.message, error.code);
      toast.error(`Fejl ved tildeling til post: ${error.message}`);
    }
  };

  const handleStartScoring = () => {
    if (selectedPost) {
      navigate(`/judge/scoring/${trialId}/${selectedPost}`);
    }
  };

  if (loading) {
    return <Loading message="Indlæser prøvedata..." />;
  }

  if (!trial) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Prøve ikke fundet</h2>
          <p>Den ønskede prøve kunne ikke findes.</p>
        </div>
      </div>
    );
  }

  const availablePosts = Array.from({ length: trial.numberOfPosts }, (_, i) => i + 1);
  const assignedPosts = trial.postAssignments || {};

  return (
    <div className="post-assignment">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">{trial.name}</h1>
          <p className="page-subtitle">
            📅 {formatDate(trial.date)} • {trial.numberOfPosts} poster • {participants.length} deltagere
          </p>
        </div>

        <div className="assignment-content">
          {selectedPost ? (
            <div className="assigned-post-info">
              <div className="card">
                <h2>Du er tildelt Post {selectedPost}</h2>
                <p>Du kan nu begynde bedømmelsen af deltagere på denne post.</p>
                <div className="post-actions">
                  <button 
                    className="btn btn-success btn-large"
                    onClick={handleStartScoring}
                  >
                    🏆 Start Bedømmelse
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedPost('')}
                  >
                    Skift Post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="post-selection">
              <div className="card">
                <h2>Vælg din post</h2>
                <p>Vælg hvilken post du vil dømme på for denne prøve.</p>
                
                <div className="posts-grid">
                  {availablePosts.map(postNumber => {
                    const isAssigned = Object.values(assignedPosts).includes(postNumber);
                    const assignedJudge = Object.keys(assignedPosts).find(
                      judgeId => assignedPosts[judgeId] === postNumber
                    );
                    
                    return (
                      <div key={postNumber} className="post-card">
                        <div className="post-header">
                          <h3>Post {postNumber}</h3>
                          {isAssigned && assignedJudge !== userProfile.uid && (
                            <span className="status-badge status-assigned">Optaget</span>
                          )}
                        </div>
                        
                        <div className="post-info">
                          <p>📍 Post nummer {postNumber}</p>
                          <p>👥 {participants.length} deltagere at bedømme</p>
                        </div>
                        
                        <button
                          className={`btn ${isAssigned && assignedJudge !== userProfile.uid ? 'btn-disabled' : 'btn-success'}`}
                          disabled={isAssigned && assignedJudge !== userProfile.uid}
                          onClick={() => handlePostAssignment(postNumber)}
                        >
                          {isAssigned && assignedJudge !== userProfile.uid ? 'Optaget' : 'Bedøm Post'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostAssignment;
