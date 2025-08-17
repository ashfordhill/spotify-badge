# Spotify Now Playing Badge API

Style variations from [Shields.io](https://shields.io/badges)

![Spotify](https://img.shields.io/endpoint?url=https%3A%2F%2Fspotify.ashhill.dev&style=flat&color=191414)

![Spotify](https://img.shields.io/endpoint?url=https%3A%2F%2Fspotify.ashhill.dev&style=flat-square&color=191414)

![Spotify](https://img.shields.io/endpoint?url=https%3A%2F%2Fspotify.ashhill.dev&style=plastic&color=191414)

![Spotify](https://img.shields.io/endpoint?url=https%3A%2F%2Fspotify.ashhill.dev&style=for-the-badge&color=191414)

![Spotify](https://img.shields.io/endpoint?url=https%3A%2F%2Fspotify.ashhill.dev&style=social&color=191414)

## About

Will show last song played or currently playing song. Currently hooked up to my domain with my Spotify API tokens but this can be reused for your own Spotify account.

## Host Your Own

1. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/spotify-badge.git
   cd spotify-badge
   ```

2. **Create a Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Note your Client ID and Client Secret
   - Add `http://127.0.0.1:8888/callback` as a redirect URI

3. **Get your Refresh Token**
   - Run the authorization flow to get a refresh token
   - You can use tools like Postman or create a simple auth script

4. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

5. **Configure Cloudflare Workers**
   ```bash
   wrangler login
   ```

6. **Set your secrets**
   ```bash
   wrangler secret put SPOTIFY_CLIENT_ID
   wrangler secret put SPOTIFY_CLIENT_SECRET  
   wrangler secret put SPOTIFY_REFRESH_TOKEN
   ```

7. **Deploy**
   ```bash
   wrangler deploy
   ```

Your API will be available at `https://your-worker-name.your-subdomain.workers.dev`

## Test Your Own

Once deployed, test your API endpoint:

```bash
curl https://your-worker-name.your-subdomain.workers.dev
```

Expected response:
```json
{
  "schemaVersion": 1,
  "label": "",
  "message": "Song Name — Artist Name",
  "color": "1DB954",
  "namedLogo": "spotify",
  "isError": false
}
```

Add a subdomain to replace the workers URL above to reference in the badge examples above in place of `spotify.ashhill.dev`.
