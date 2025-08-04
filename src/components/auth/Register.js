import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'participant'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Udfyld venligst alle påkrævede felter');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Adgangskoderne matcher ikke');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Adgangskoden skal være mindst 6 tegn');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      await register(formData.email, formData.password, {
        name: formData.name,
        role: formData.role
      });
      
      toast.success('Din konto er oprettet!');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Der opstod en fejl ved oprettelse af konto';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email adressen er allerede i brug';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Ugyldig email adresse';
          break;
        case 'auth/weak-password':
          errorMessage = 'Adgangskoden er for svag';
          break;
        default:
          errorMessage = 'Der opstod en fejl ved oprettelse af konto';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>🐕 Opret Konto</h2>
          <p>Tilmeld dig Hundeprøve System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Fulde navn *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rolle</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="participant">Deltager</option>
              <option value="judge">Dommer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Adgangskode *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Bekræft adgangskode *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'Opretter konto...' : 'Opret konto'}
          </button>
        </form>
        
        <div className="register-links">
          <p>
            Har du allerede en konto? <Link to="/login">Log ind her</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
