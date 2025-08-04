import React, { useState } from 'react';
import { createJudgeInvitation } from '../../services/firestoreService';
import { validateEmail } from '../../utils/validation';
import toast from 'react-hot-toast';
import './JudgeInvitation.css';

const JudgeInvitation = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      toast.error('Indtast venligst en gyldig email adresse');
      return;
    }

    setLoading(true);

    try {
      // For now, we'll create a general invitation
      // In full implementation, this would be tied to specific trials
      await createJudgeInvitation({
        judgeEmail: email,
        invitedBy: 'current-admin-uid', // This should come from auth context
        trialId: 'placeholder-trial-id' // This should be selected from available trials
      });
      
      toast.success('Invitation sendt til dommeren!');
      setEmail('');
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Fejl ved afsendelse af invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="judge-invitation">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dommer Invitationer</h1>
          <p className="page-subtitle">Inviter dommere til prøver</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Send Invitation</h2>
            <p className="card-subtitle">Indtast dommers email adresse</p>
          </div>
          
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Dommers Email Adresse
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pending Invitationer</h2>
          </div>
          
          <div className="invitation-list">
            <p className="no-data">Funktionalitet kommer snart...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeInvitation;
