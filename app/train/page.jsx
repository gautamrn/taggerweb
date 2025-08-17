'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

export default function TrainPage() {
  const [training, setTraining] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const startTraining = async () => {
    try {
      setTraining(true);
      setError(null);
      setResult(null);

      const response = await apiService.request('/tracks/train-model', {
        method: 'POST'
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setTraining(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', color: 'white', marginBottom: '1rem' }}>
            Please log in to train the model
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: 'white'
          }}>
            Train AI Model
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Train the AI model with your uploaded tracks to improve predictions
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: 'white',
            marginBottom: '1rem'
          }}>
            Model Training
          </h2>
          
          <p style={{ 
            color: '#94a3b8', 
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Upload at least 5 tracks with different genres to train your personalized AI model. 
            The model will learn from your music collection to provide better predictions.
          </p>

          <button
            onClick={startTraining}
            disabled={training}
            style={{
              background: training 
                ? 'rgba(139, 92, 246, 0.5)' 
                : 'linear-gradient(135deg, #9333ea, #ec4899)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: training ? 'not-allowed' : 'pointer',
              opacity: training ? 0.7 : 1
            }}
          >
            {training ? 'Training...' : 'Start Training'}
          </button>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginTop: '1rem'
            }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#86efac',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginTop: '1rem'
            }}>
              <strong>Training completed!</strong><br />
              Processed {result.tracksProcessed} tracks
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
