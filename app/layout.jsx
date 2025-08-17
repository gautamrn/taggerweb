import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';

export const metadata = {
  title: 'Tag.ai - AI-Powered Music Tagging',
  description: 'Upload your music and get AI-generated tags for intelligent categorization',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head />
      <body 
        suppressHydrationWarning={true}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
          color: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          padding: 0,
          minHeight: '100vh'
        }}
      >
        <AuthProvider>
          <Navigation />
          {/* Main Content */}
          <main style={{ flex: 1, padding: '2rem 0' }}>
            {children}
          </main>
          {/* Simple Footer */}
          <footer style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2rem 0',
            marginTop: 'auto'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>© 2024 Tag.ai. All rights reserved.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}