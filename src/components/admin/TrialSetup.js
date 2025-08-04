import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createTrial, getTrials } from '../../services/firestoreService';
import { formatDate, formatDateForInput, parseInputDate } from '../../utils/dateUtils';
import { getValidationErrors, trialValidationRules } from '../../utils/validation';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';
import './TrialSetup.css';

const TrialSetup = () => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    numberOfPosts: 4
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [trials, setTrials] = useState([]);
  const [loadingTrials, setLoadingTrials] = useState(true);

  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    try {
      const trialsData = await getTrials();
      setTrials(trialsData);
    } catch (error) {
      console.error('Error loading trials:', error);
      toast.error('Fejl ved indlæsning af prøver');
    } finally {
      setLoadingTrials(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = getValidationErrors(formData, trialValidationRules);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const trialData = {
        name: formData.name.trim(),
        date: parseInputDate(formData.date),
        numberOfPosts: parseInt(formData.numberOfPosts),
        createdBy: userProfile.uid
      };

      await createTrial(trialData);
      
      toast.success('Prøve oprettet succesfuldt!');
      
      // Reset form
      setFormData({
        name: '',
        date: '',
        numberOfPosts: 4
      });
      
      // Reload trials
      loadTrials();
      
    } catch (error) {
      console.error('Error creating trial:', error);
      toast.error('Fejl ved oprettelse af prøve');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (trial) => {
    const trialDate = trial.date?.toDate ? trial.date.toDate() : new Date(trial.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    trialDate.setHours(0, 0, 0, 0);
    
    if (trialDate < today) {
      return <span className="status-badge status-completed">Afsluttet</span>;
    } else if (trialDate.getTime() === today.getTime()) {
      return <span className="status-badge status-active">I dag</span>;
    } else {
      return <span className="status-badge status-upcoming">Kommende</span>;
    }
  };

  return (
    <div className="trial-setup">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Prøve Administration</h1>
          <p className="page-subtitle">Opret og administrer hundeprøver</p>
        </div>

        <div className="trial-setup-content">
          <div className="create-trial-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Opret Ny Prøve</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Prøve Navn *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                    placeholder="F.eks. Årets Hundeprøve 2025"
                  />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date" className="form-label">
                      Dato *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                      min={formatDateForInput(new Date())}
                    />
                    {errors.date && <div className="form-error">{errors.date}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="numberOfPosts" className="form-label">
                      Antal Poster *
                    </label>
                    <select
                      id="numberOfPosts"
                      name="numberOfPosts"
                      value={formData.numberOfPosts}
                      onChange={handleChange}
                      className="form-select"
                      disabled={loading}
                    >
                      <option value={1}>1 Post</option>
                      <option value={2}>2 Poster</option>
                      <option value={3}>3 Poster</option>
                      <option value={4}>4 Poster</option>
                      <option value={5}>5 Poster</option>
                      <option value={6}>6 Poster</option>
                    </select>
                    {errors.numberOfPosts && <div className="form-error">{errors.numberOfPosts}</div>}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Opretter...' : 'Opret Prøve'}
                </button>
              </form>
            </div>
          </div>

          <div className="trials-list-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Eksisterende Prøver</h2>
              </div>
              
              {loadingTrials ? (
                <Loading message="Indlæser prøver..." />
              ) : trials.length === 0 ? (
                <p className="no-data">Ingen prøver oprettet endnu.</p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Navn</th>
                        <th>Dato</th>
                        <th>Poster</th>
                        <th>Status</th>
                        <th>Deltagere</th>
                        <th>Handlinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trials.map(trial => (
                        <tr key={trial.id}>
                          <td>{trial.name}</td>
                          <td>{formatDate(trial.date)}</td>
                          <td>{trial.numberOfPosts}</td>
                          <td>{getStatusBadge(trial)}</td>
                          <td>{trial.participants?.length || 0}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn btn-small btn-secondary">
                                Rediger
                              </button>
                              <button className="btn btn-small btn-primary">
                                Deltagere
                              </button>
                            </div>
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

export default TrialSetup;
