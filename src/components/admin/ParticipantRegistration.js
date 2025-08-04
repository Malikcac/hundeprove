import React, { useState, useEffect } from 'react';
import { getTrials, createParticipant } from '../../services/firestoreService';
import { getValidationErrors, participantValidationRules } from '../../utils/validation';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';
import './ParticipantRegistration.css';

const ParticipantRegistration = () => {
  const [trials, setTrials] = useState([]);
  const [selectedTrial, setSelectedTrial] = useState('');
  const [loadingTrials, setLoadingTrials] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    participantNumber: '',
    dogName: '',
    dogNumber: '',
    gender: 'T',
    color: '',
    breed: '',
    father: '',
    mother: '',
    breeder: '',
    owner: '',
    sameBreederOwner: false,
    handler: '',
    email: ''
  });

  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    try {
      const trialsData = await getTrials();
      // Show trials from today and future (not past trials)
      const availableTrials = trialsData.filter(trial => {
        const trialDate = trial.date?.toDate ? trial.date.toDate() : new Date(trial.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        trialDate.setHours(0, 0, 0, 0); // Set to start of day
        return trialDate >= today; // Include today's trials
      });
      setTrials(availableTrials);
    } catch (error) {
      console.error('Error loading trials:', error);
      toast.error('Fejl ved indlæsning af prøver');
    } finally {
      setLoadingTrials(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific error when user starts typing/changing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTrial) {
      toast.error('Vælg venligst en prøve');
      return;
    }

    // Validate form
    const validationErrors = getValidationErrors(formData, participantValidationRules);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const participantData = {
        ...formData,
        trialId: selectedTrial,
        participantNumber: formData.participantNumber.padStart(4, '0')
      };

      await createParticipant(participantData);
      
      toast.success('Deltager registreret succesfuldt!');
      
      // Reset form
      setFormData({
        participantNumber: '',
        dogName: '',
        dogNumber: '',
        gender: 'T',
        color: '',
        breed: '',
        father: '',
        mother: '',
        breeder: '',
        owner: '',
        sameBreederOwner: false,
        handler: '',
        email: ''
      });
      
    } catch (error) {
      console.error('Error registering participant:', error);
      toast.error('Fejl ved registrering af deltager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="participant-registration">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Deltager Registrering</h1>
          <p className="page-subtitle">Registrer en ny deltager til en prøve</p>
        </div>

        <div className="card">
          {loadingTrials ? (
            <Loading message="Indlæser prøver..." />
          ) : trials.length === 0 ? (
            <div className="no-trials">
              <p>Ingen kommende prøver tilgængelige for registrering.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="trial" className="form-label">
                  Vælg Prøve *
                </label>
                <select
                  id="trial"
                  value={selectedTrial}
                  onChange={(e) => setSelectedTrial(e.target.value)}
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

              <div className="form-section">
                <h3>Deltager Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="participantNumber" className="form-label">
                      Deltager Nummer * (4 cifre)
                    </label>
                    <input
                      type="text"
                      id="participantNumber"
                      name="participantNumber"
                      value={formData.participantNumber}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                      placeholder="0001"
                      maxLength="4"
                    />
                    {errors.participantNumber && <div className="form-error">{errors.participantNumber}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                      placeholder="deltager@email.com"
                    />
                    {errors.email && <div className="form-error">{errors.email}</div>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Hunde Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dogName" className="form-label">
                      Hundens Fulde Navn *
                    </label>
                    <input
                      type="text"
                      id="dogName"
                      name="dogName"
                      value={formData.dogName}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                    />
                    {errors.dogName && <div className="form-error">{errors.dogName}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="dogNumber" className="form-label">
                      Hunde Nummer * (Dkxxxxx/xxxx)
                    </label>
                    <input
                      type="text"
                      id="dogNumber"
                      name="dogNumber"
                      value={formData.dogNumber}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                      placeholder="Dk12345/2022"
                    />
                    {errors.dogNumber && <div className="form-error">{errors.dogNumber}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gender" className="form-label">
                      Køn *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="form-select"
                      disabled={loading}
                    >
                      <option value="T">Tæve</option>
                      <option value="H">Hanhund</option>
                    </select>
                    {errors.gender && <div className="form-error">{errors.gender}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="color" className="form-label">
                      Farve *
                    </label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                      placeholder="Sort"
                    />
                    {errors.color && <div className="form-error">{errors.color}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="breed" className="form-label">
                      Race *
                    </label>
                    <input
                      type="text"
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                      placeholder="Golden Retriever"
                    />
                    {errors.breed && <div className="form-error">{errors.breed}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="father" className="form-label">
                      Fars Navn *
                    </label>
                    <input
                      type="text"
                      id="father"
                      name="father"
                      value={formData.father}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                    />
                    {errors.father && <div className="form-error">{errors.father}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="mother" className="form-label">
                      Mors Navn *
                    </label>
                    <input
                      type="text"
                      id="mother"
                      name="mother"
                      value={formData.mother}
                      onChange={handleChange}
                      className="form-input"
                      disabled={loading}
                    />
                    {errors.mother && <div className="form-error">{errors.mother}</div>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Ejerskab og Kontakt</h3>
                
                <div className="form-group">
                  <label htmlFor="breeder" className="form-label">
                    Opdrætter Navn og Adresse *
                  </label>
                  <textarea
                    id="breeder"
                    name="breeder"
                    value={formData.breeder}
                    onChange={handleChange}
                    className="form-textarea"
                    disabled={loading}
                    rows="3"
                  />
                  {errors.breeder && <div className="form-error">{errors.breeder}</div>}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="sameBreederOwner"
                      checked={formData.sameBreederOwner}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Opdrætter og ejer er samme person
                  </label>
                </div>

                {!formData.sameBreederOwner && (
                  <div className="form-group">
                    <label htmlFor="owner" className="form-label">
                      Ejer Navn og Adresse *
                    </label>
                    <textarea
                      id="owner"
                      name="owner"
                      value={formData.owner}
                      onChange={handleChange}
                      className="form-textarea"
                      disabled={loading}
                      rows="3"
                    />
                    {errors.owner && <div className="form-error">{errors.owner}</div>}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="handler" className="form-label">
                    Hundefører Navn *
                  </label>
                  <input
                    type="text"
                    id="handler"
                    name="handler"
                    value={formData.handler}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loading}
                  />
                  {errors.handler && <div className="form-error">{errors.handler}</div>}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Registrerer...' : 'Registrer Deltager'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantRegistration;
