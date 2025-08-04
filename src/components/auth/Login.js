import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Udfyld venligst alle felter');
      return;
    }

    setLoading(true);
    
    try {
      await login(formData.email, formData.password);
      toast.success('Du er nu logget ind!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Der opstod en fejl ved login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Brugeren findes ikke';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Forkert adgangskode';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Ugyldig email adresse';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'For mange forsøg. Prøv igen senere';
          break;
        default:
          errorMessage = 'Der opstod en fejl ved login';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>🐕 Hundeprøve System</h2>
          <p>Log ind for at fortsætte</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
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
            <label htmlFor="password">Adgangskode</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logger ind...' : 'Log ind'}
          </button>
        </form>
        
        <div className="login-links">
          <Link to="/forgot-password" className="forgot-password-link">
            Glemt adgangskode?
          </Link>
          <p>
            Har du ikke en konto? <Link to="/register">Opret konto</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
