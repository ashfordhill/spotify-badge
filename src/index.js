// Spotify API endpoints
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const SPOTIFY_RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

/**
 * Get access token using refresh token
 */
async function getAccessToken(env) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = env;
  
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error('Missing required Spotify environment variables');
  }

  const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Get currently playing track
 */
async function getCurrentlyPlaying(accessToken) {
  const response = await fetch(SPOTIFY_NOW_PLAYING_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.status === 204) {
    // No content - nothing is currently playing
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to get currently playing: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get recently played track as fallback
 */
async function getRecentlyPlayed(accessToken) {
  const response = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get recently played: ${response.status}`);
  }

  const data = await response.json();
  return data.items && data.items.length > 0 ? data.items[0] : null;
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength = 64) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format track data for Shields badge
 */
function formatTrackData(trackData, isCurrentlyPlaying = false) {
  if (!trackData) {
    return {
      schemaVersion: 1,
      label: 'spotify',
      message: 'Not playing',
      color: 'lightgrey',
      namedLogo: 'spotify',
      isError: false
    };
  }

  const track = trackData.track || trackData;
  const trackName = track.name || 'Unknown Track';
  const artistName = track.artists && track.artists.length > 0 
    ? track.artists[0].name 
    : 'Unknown Artist';
  
  const message = truncateText(`${trackName} — ${artistName}`);
  const color = isCurrentlyPlaying ? '1DB954' : '1e90ff'; // Spotify green or blue

  return {
    schemaVersion: 1,
    label: 'spotify',
    message: message,
    color: color,
    namedLogo: 'spotify',
    isError: false
  };
}

/**
 * Create error response
 */
function createErrorResponse(message = 'Service unavailable') {
  return {
    schemaVersion: 1,
    label: 'spotify',
    message: message,
    color: 'red',
    namedLogo: 'spotify',
    isError: true
  };
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  return corsHeaders;
}

/**
 * Main worker handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }
    
    // Only handle GET requests to the root path or /api/now-playing
    if (request.method !== 'GET') {
      return new Response(JSON.stringify(createErrorResponse('Method not allowed')), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...handleCORS(request)
        }
      });
    }

    // Support both root path and /api/now-playing for compatibility
    if (url.pathname !== '/' && url.pathname !== '/api/now-playing') {
      return new Response(JSON.stringify(createErrorResponse('Not found')), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...handleCORS(request)
        }
      });
    }

    try {
      // Get access token
      const accessToken = await getAccessToken(env);
      
      // Try to get currently playing track
      let trackData = await getCurrentlyPlaying(accessToken);
      let isCurrentlyPlaying = true;
      
      // If nothing is currently playing, get recently played
      if (!trackData) {
        trackData = await getRecentlyPlayed(accessToken);
        isCurrentlyPlaying = false;
      }
      
      // Format response for Shields
      const badgeData = formatTrackData(trackData, isCurrentlyPlaying);
      
      // Return response with caching headers
      return new Response(JSON.stringify(badgeData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=60',
          ...handleCORS(request)
        }
      });
      
    } catch (error) {
      console.error('Error in worker:', error);
      
      // Always return 200 with error badge so the badge still renders
      return new Response(JSON.stringify(createErrorResponse('Service error')), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30, s-maxage=30',
          ...handleCORS(request)
        }
      });
    }
  }
};