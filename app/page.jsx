


export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ 
              fontSize: '3.75rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              AI-Powered Music
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Tagging Platform
              </span>
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#94a3b8', 
              marginBottom: '2rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Upload your music and let our advanced AI analyze and tag your tracks with intelligent precision. 
              Organize your library like never before.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
              <a 
                href="/upload" 
                style={{
                  background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Start Uploading
              </a>
              <a 
                href="/tracks" 
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'inline-block'
                }}
              >
                View My Library
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '5rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'white'
            }}>
              Why Choose Tag.ai?
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#94a3b8',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Advanced machine learning meets intuitive design for the ultimate music organization experience.
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'rgba(139, 92, 246, 0.2)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <span style={{ fontSize: '2rem' }}>⚡</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                Lightning Fast Analysis
              </h3>
              <p style={{ color: '#94a3b8' }}>
                Our AI processes your tracks in seconds, providing instant genre detection and mood analysis.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <span style={{ fontSize: '2rem' }}>🤖</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                AI-Powered Intelligence
              </h3>
              <p style={{ color: '#94a3b8' }}>
                Advanced machine learning algorithms provide accurate genre and mood detection with high confidence scores.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <span style={{ fontSize: '2rem' }}>🔒</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                Secure Cloud Storage
              </h3>
              <p style={{ color: '#94a3b8' }}>
                Your music is safely stored in the cloud with enterprise-grade security and easy access from anywhere.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))',
            padding: '3rem',
            borderRadius: '1.5rem',
            border: '1px solid rgba(147, 51, 234, 0.3)'
          }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              Ready to Transform Your Music Library?
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#cbd5e1',
              marginBottom: '2rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Join thousands of DJs, producers, and music enthusiasts who are already using AI to organize their collections.
            </p>
            <a 
              href="/upload" 
              style={{
                background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '1.125rem',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Get Started Now
            </a>
          </div>
    </section>
      </div>
    </div>
  );
}