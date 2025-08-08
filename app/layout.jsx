//import './globals.css'

export const metadata = {
  title: 'Tag.ai',
  description: 'Train custom models to categoriza your music'
}

export default function RootLayou({children}){
  return(
    <html lang='en'>
      <head />
      <body suppressHydrationWarning>
        <header style={{padding: '1rem', background: '#eee'}}>
          <h1>Tag.ai</h1>
        </header>
        <main>{children}</main>
        <footer style={{padding: '1rem', background: '#eee'}}>
          <small>© Gautam Nigam</small>
        </footer>
      </body>
    </html>
  );
}