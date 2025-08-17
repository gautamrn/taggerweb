'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

export default function TracksPage() {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customTag, setCustomTag] = useState('');
  const [training, setTraining] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchTracks();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyTracks();
      setTracks(response.tracks || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tracks:', err);
      setError('Failed to load tracks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openTrackModal = (track) => {
    setSelectedTrack(track);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTrack(null);
    setCustomTag('');
  };

  const addCustomTag = async () => {
    if (!customTag.trim() || !selectedTrack) return;

    try {
      await apiService.addCustomTag(selectedTrack.id, [customTag.trim()]);
      
      // Refresh tracks to show new tag
      await fetchTracks();
      setCustomTag('');
      
      // Close modal after adding tag
      closeModal();
      
    } catch (err) {
      console.error('Failed to add custom tag:', err);
      alert('Failed to add custom tag. Please try again.');
    }
  };

  const trainPersonalModel = async () => {
    try {
      setTraining(true);
      const response = await apiService.trainPersonalModel();
      
      alert(`Personal model trained successfully! Accuracy: ${(response.accuracy * 100).toFixed(1)}%`);
      await fetchTracks(); // Refresh to show updated predictions
    } catch (err) {
      console.error('Failed to train model:', err);
      alert(err.message || 'Failed to train personal model. Please try again.');
    } finally {
      setTraining(false);
    }
  };

  const deleteTrack = async (trackId) => {
    try {
      await apiService.deleteTrack(trackId);
      setTracks(tracks.filter(track => track.id !== trackId));
      closeModal();
    } catch (err) {
      console.error('Failed to delete track:', err);
      alert('Failed to delete track. Please try again.');
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>My Tracks</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>My Tracks</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Please log in to view your tracks
          </p>
          <a 
            href="/auth/login" 
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '1.1rem'
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Show loading while fetching tracks
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>My Tracks</h1>
          <p>Loading your tracks...</p>
        </div>
      </div>
    );
  }

  // Show error if tracks failed to load
  if (error) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>My Tracks</h1>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
          <button 
            onClick={fetchTracks}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tracksWithCustomTags = tracks.filter(track => track.customTags?.length > 0);
  const canTrainModel = tracksWithCustomTags.length >= 5;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem' }}>My Tracks</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {tracks.length > 5 && (
              <button 
                onClick={trainPersonalModel}
                disabled={training}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: training ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  opacity: training ? 0.7 : 1
                }}
              >
                {training ? 'Training...' : 'Train Personal Model'}
              </button>
            )}
            <a 
              href="/upload"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '1.1rem'
              }}
            >
              Upload More
            </a>
          </div>
        </div>

        {tracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
              You haven't uploaded any tracks yet.
            </p>
            <a 
              href="/upload"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '1.1rem'
              }}
            >
              Upload Your First Track
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {tracks.map((track) => (
              <div 
                key={track.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                onClick={() => openTrackModal(track)}
              >
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {track.title}
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  {track.artist || 'Unknown Artist'}
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                    AI Predictions:
                  </h4>
                  {track.predictions && track.predictions.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {track.predictions.slice(0, 3).map((prediction, index) => (
                        <span 
                          key={index}
                          style={{
                            background: 'rgba(102, 126, 234, 0.3)',
                            color: '#e2e8f0',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        >
                          {prediction.tag.name}: {(prediction.confidence * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      No predictions yet
                    </p>
                  )}
                </div>

                {track.customTags && track.customTags.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                      Your Tags:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {track.customTags.map((tag, index) => (
                        <span 
                          key={index}
                          style={{
                            background: 'rgba(16, 185, 129, 0.3)',
                            color: '#e2e8f0',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Track Detail Modal */}
        {showModal && selectedTrack && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '600' }}>
                  {selectedTrack.title}
                </h2>
                <button 
                  onClick={closeModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>

              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                {selectedTrack.artist || 'Unknown Artist'}
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                  AI Predictions:
                </h3>
                {selectedTrack.predictions && selectedTrack.predictions.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {selectedTrack.predictions.map((prediction, index) => (
                      <span 
                        key={index}
                        style={{
                          background: 'rgba(102, 126, 234, 0.3)',
                          color: '#e2e8f0',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      >
                        {prediction.tag.name}: {(prediction.confidence * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                    No predictions yet
                  </p>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                    Add Your Own Tag:
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="e.g., Deep House, My Favorite, Party Music"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    />
                    <button 
                      onClick={addCustomTag}
                      disabled={!customTag.trim()}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: customTag.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '1rem',
                        opacity: customTag.trim() ? 1 : 0.5
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {selectedTrack.customTags && selectedTrack.customTags.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                      Your Tags:
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedTrack.customTags.map((tag, index) => (
                        <span 
                          key={index}
                          style={{
                            background: 'rgba(16, 185, 129, 0.3)',
                            color: '#e2e8f0',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '1rem'
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => deleteTrack(selectedTrack.id)}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Delete Track
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
