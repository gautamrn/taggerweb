'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    console.log('Files selected:', acceptedFiles);
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      predictions: []
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = (event) => {
    console.log('File input changed:', event.target.files);
    const selectedFiles = Array.from(event.target.files);
    onDrop(selectedFiles);
  };

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const startUpload = async () => {
    console.log('Starting upload...');
    console.log('Files to upload:', files);
    
    if (files.length === 0) {
      console.log('No files to upload');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('Not authenticated');
      alert('Please log in to upload files');
      return;
    }
    
    setUploading(true);
    
    for (const file of files) {
      if (file.status === 'pending') {
        try {
          console.log('Uploading file:', file.name);
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'uploading' } : f
          ));
          
          const formData = new FormData();
          formData.append('audio', file.file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
          
          console.log('FormData created, sending to backend...');
          
          const response = await apiService.uploadTrack(formData);
          
          console.log('Upload response:', response);
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'analyzing' } : f
          ));
          
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'completed',
              predictions: response.predictions || []
            } : f
          ));
          
        } catch (error) {
          console.error('Upload failed for file:', file.name, error);
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'error',
              error: error.message 
            } : f
          ));
        }
      }
    }
    
    setUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#6b7280';
      case 'uploading': return '#3b82f6';
      case 'analyzing': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'uploading': return 'Uploading...';
      case 'analyzing': return 'Analyzing...';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Upload Tracks</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Please log in to upload tracks
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

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Upload Tracks</h1>
        
        {/* File Upload Area */}
        <div style={{
          border: '2px dashed rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={handleSelectFiles}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          e.target.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Drop your audio files here
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              or click to browse files
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              display: 'inline-block',
              fontSize: '1.1rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              Select Files
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Selected Files ({files.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {files.map((file) => (
                <div key={file.id} style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{file.name}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        color: getStatusColor(file.status),
                        fontWeight: '600'
                      }}>
                        {getStatusText(file.status)}
                      </span>
                      <button
                        onClick={() => removeFile(file.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        width: `${uploadProgress[file.id] || 0}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {file.status === 'error' && (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      {file.error}
                    </p>
                  )}
                  
                  {/* Predictions */}
                  {file.status === 'completed' && file.predictions && file.predictions.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                        AI Predictions:
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {file.predictions.map((prediction, index) => (
                          <span key={index} style={{
                            background: 'rgba(102, 126, 234, 0.3)',
                            color: '#e2e8f0',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}>
                            {prediction.tag}: {(prediction.confidence * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={startUpload}
            disabled={uploading || files.length === 0}
            style={{
              background: (uploading || files.length === 0)
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              border: 'none',
              cursor: (uploading || files.length === 0) ? 'not-allowed' : 'pointer',
              fontSize: '1.2rem',
              opacity: (uploading || files.length === 0) ? 0.7 : 1
            }}
          >
            {uploading ? 'Uploading...' : files.length === 0 ? 'Select Files First' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
   