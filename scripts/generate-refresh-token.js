const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fetch = require('node-fetch');

// Configuration - Replace these with your Spotify app credentials
const CLIENT_ID = 'your_spotify_client_id';
const CLIENT_SECRET = 'your_spotify_client_secret';
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';  // Using 127.0.0.1 as you mentioned
const PORT = 8888;

// Required scopes for the badge
const SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played'
];

/**
 * Generate authorization URL
 */
function generateAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    redirect_uri: REDIRECT_URI,
    state: 'spotify-badge-auth'
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    })
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Start local server to handle OAuth callback
 */
function startServer() {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/callback') {
      const { code, error, state } = parsedUrl.query;
      
      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h1>Authorization Error</h1><p>${error}</p>`);
        return;
      }
      
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Error</h1><p>No authorization code received</p>');
        return;
      }
      
      try {
        const tokens = await exchangeCodeForTokens(code);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <h1>Success!</h1>
          <p>Your refresh token has been generated. Copy the values below:</p>
          <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px;">
SPOTIFY_CLIENT_ID=${CLIENT_ID}
SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}
SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}
          </pre>
          <p><strong>Keep these values secure and never commit them to version control!</strong></p>
          <p>You can now close this window and stop the server (Ctrl+C).</p>
        `);
        
        console.log('\n✅ Success! Refresh token generated:');
        console.log('\n🔐 Your secrets (copy these for Cloudflare Workers):');
        console.log(`SPOTIFY_CLIENT_ID=${CLIENT_ID}`);
        console.log(`SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\n⚠️  Keep these values secure and never commit them to version control!');
        
      } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Error</h1><p>Failed to exchange code for tokens: ${error.message}</p>`);
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>Not Found</h1>');
    }
  });
  
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`🎵 Spotify OAuth Helper Server running on http://127.0.0.1:${PORT}`);
    console.log('\n📋 Setup Instructions:');
    console.log('1. Update CLIENT_ID and CLIENT_SECRET in this script');
    console.log('2. Add this redirect URI to your Spotify app: http://127.0.0.1:8888/callback');
    console.log('3. Open the authorization URL below in your browser');
    console.log('4. Authorize the application');
    console.log('5. Copy the generated refresh token to use with Cloudflare Workers\n');
    
    const authUrl = generateAuthUrl();
    console.log('🔗 Authorization URL:');
    console.log(authUrl);
    console.log('\n⏳ Waiting for authorization...');
  });
}

// Validation
if (CLIENT_ID === 'your_spotify_client_id' || CLIENT_SECRET === 'your_spotify_client_secret') {
  console.error('❌ Please update CLIENT_ID and CLIENT_SECRET in this script first!');
  console.log('\n📝 Steps to get your credentials:');
  console.log('1. Go to https://developer.spotify.com/dashboard');
  console.log('2. Create a new app or use an existing one');
  console.log('3. Copy the Client ID and Client Secret');
  console.log('4. Add http://127.0.0.1:8888/callback to your app\'s redirect URIs');
  console.log('5. Update this script with your credentials');
  process.exit(1);
}

// Start the server
startServer();