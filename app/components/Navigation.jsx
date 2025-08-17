'use client';

import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header style={{
      background: 'rgba(0, 0, 0, 0.2)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>T</span>
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Tag.ai</h1>
              <p style={{ fontSize: '0.75rem', color: '#c084fc', margin: 0 }}>AI Music Tagging</p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>Home</a>
            {isAuthenticated ? (
              <>
                <a href="/tracks" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>My Tracks</a>
                <a href="/upload" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>Upload</a>
                <button
                  onClick={logout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <a href="/auth/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>Login</a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
