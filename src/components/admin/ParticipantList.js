import React from 'react';
import './ParticipantList.css';

const ParticipantList = () => {
  return (
    <div className="participant-list">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Deltager Oversigt</h1>
          <p className="page-subtitle">Se alle registrerede deltagere</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Deltagere</h2>
          </div>
          
          <div className="participant-content">
            <p className="no-data">Funktionalitet kommer snart...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantList;
