# Spotify Now Playing Badge API

A Cloudflare Workers API that creates a dynamic Spotify badge showing your currently playing or recently played track, compatible with Shields.IO.

![Spotify Badge Example](https://img.shields.io/endpoint?url=https%3A%2F%2Fspotify.yourdomain.com&style=flat-square&logo=spotify&labelColor=000&color=1DB954)

## Features

- 🎵 Shows currently playing track in real-time
- 🔄 Falls back to recently played track when nothing is playing
- 🎨 Dynamic colors (green for currently playing, blue for recent)
- ⚡ Optimized caching (60-second intervals)
- 🛡️ Error-resistant (always returns a valid badge)
- 📱 Responsive text truncation for clean display
- 🚀 Cloudflare Workers deployment (global edge network)
- 🌐 Custom subdomain support

## Quick Start

### 1. Set up Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use an existing one
3. Note your **Client ID** and **Client Secret**
4. Add `http://localhost:8888/callback` to your app's redirect URIs

### 2. Generate Refresh Token

1. Update the credentials in `scripts/generate-refresh-token.js`:
   ```javascript
   const CLIENT_ID = 'your_actual_client_id';
   const CLIENT_SECRET = 'your_actual_client_secret';
   ```

2. Install dependencies and run the token generator:
   ```bash
   npm install
   npm run setup
   ```

3. Open the provided authorization URL in your browser
4. Authorize the application
5. Copy the generated refresh token

### 3. Deploy to Cloudflare Workers

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

3. Deploy the worker:
   ```bash
   npm run deploy
   ```

4. Set your Spotify API secrets:
   ```bash
   wrangler secret put SPOTIFY_CLIENT_ID
   wrangler secret put SPOTIFY_CLIENT_SECRET
   wrangler secret put SPOTIFY_REFRESH_TOKEN
   ```

### 4. Set up Custom Subdomain (Optional but Recommended)

1. In your Cloudflare dashboard, go to Workers & Pages
2. Find your deployed worker
3. Go to Settings → Triggers
4. Add a custom domain (e.g., `spotify.yourdomain.com`)

### 5. Use the Badge

Add this to your README or any Markdown file:

```markdown
![Spotify](https://img.shields.io/endpoint?url=https%3A%2F%2Fspotify.yourdomain.com&style=flat-square&logo=spotify&labelColor=000&color=1DB954)
```

Replace `spotify.yourdomain.com` with your actual subdomain or worker URL.

## API Response Format

The API returns a Shields.IO compatible JSON response:

```json
{
  "schemaVersion": 1,
  "label": "spotify",
  "message": "Song Name — Artist Name",
  "color": "1DB954",
  "namedLogo": "spotify",
  "isError": false
}
```

### Response States

- **Currently Playing**: Green badge (`#1DB954`) with current track
- **Recently Played**: Blue badge (`#1e90ff`) with last played track
- **Not Playing**: Grey badge with "Not playing" message
- **Error**: Red badge with error message (service still returns 200 status)

## Customization

### Badge Styling

You can customize the badge appearance using Shields.IO parameters:

```markdown
![Spotify](https://img.shields.io/endpoint?url=YOUR_API_URL&style=for-the-badge&logo=spotify&logoColor=white&labelColor=000000&color=1DB954&cacheSeconds=60)
```

Available styles:
- `flat` (default)
- `flat-square`
- `plastic`
- `for-the-badge`
- `social`

### Cache Duration

Adjust caching by modifying the `Cache-Control` header in `src/index.js`:

```javascript
'Cache-Control': 'public, max-age=60, s-maxage=60'
```

### Text Truncation

Modify the truncation length in the `truncateText` function:

```javascript
function truncateText(text, maxLength = 64) {
  // Adjust maxLength as needed
}
```

### Custom Domain Configuration

Update `wrangler.toml` to use your custom domain:

```toml
routes = [
  { pattern = "spotify.yourdomain.com/*", custom_domain = true }
]
```

## Local Development

### Testing Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Test the API
npm test
```

Visit `http://localhost:8787` to test the API locally.

### Environment Variables for Local Development

Create a `.dev.vars` file in the project root:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token
```

## Deployment Options

### Option 1: Workers Subdomain (Free)
Your worker will be available at: `https://spotify-badge-api.your-subdomain.workers.dev`

### Option 2: Custom Domain (Recommended)
Set up a custom subdomain like `spotify.yourdomain.com` for a cleaner URL.

### Option 3: Route on Existing Domain
Add a route to your existing website that proxies to the worker.

## Security Notes

- ✅ Refresh token stored as encrypted secret in Cloudflare
- ✅ No sensitive data in client-side code
- ✅ Secrets never exposed in logs or responses
- ✅ CORS headers properly configured
- ⚠️ Never commit credentials to version control

## Troubleshooting

### Common Issues

1. **"Missing required Spotify environment variables"**
   - Ensure all three secrets are set: `wrangler secret list`
   - Re-add missing secrets: `wrangler secret put SECRET_NAME`

2. **"Failed to refresh token"**
   - Check that your client ID and secret are correct
   - Verify the refresh token hasn't expired (regenerate if needed)

3. **Badge shows "Service error"**
   - Check worker logs: `wrangler tail`
   - Verify Spotify API permissions and scopes

4. **Badge not updating**
   - Check cache headers and wait for cache to expire
   - Verify Spotify is actually playing music
   - Clear Shields.IO cache by adding `?t=timestamp` to URL

5. **Worker deployment fails**
   - Ensure you're authenticated: `wrangler whoami`
   - Check your Cloudflare account limits
   - Verify `wrangler.toml` configuration

### Testing Commands

```bash
# Test locally
npm run dev
npm test

# Test deployed worker
npm test https://your-worker.your-subdomain.workers.dev

# Check worker logs
wrangler tail

# List secrets
wrangler secret list
```

## Advanced Configuration

### Multiple Environments

The `wrangler.toml` supports different environments:

```bash
# Deploy to development
wrangler deploy --env development

# Deploy to production
wrangler deploy --env production
```

### Custom Worker Name

Update the `name` field in `wrangler.toml`:

```toml
name = "my-spotify-badge"
```

### Rate Limiting

Cloudflare Workers automatically handle rate limiting, but you can add custom logic:

```javascript
// Add to src/index.js
const RATE_LIMIT = 100; // requests per minute
```

## Why Cloudflare Workers?

- 🌍 **Global Edge Network**: Sub-50ms response times worldwide
- 💰 **Cost Effective**: 100,000 free requests per day
- 🔒 **Secure**: Built-in DDoS protection and security
- ⚡ **Fast**: V8 isolates start in <1ms
- 🛠️ **Easy**: Simple deployment and management
- 📊 **Analytics**: Built-in request analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run dev` and `npm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Shields.IO](https://shields.io/) for the badge service
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for music data
- [Cloudflare Workers](https://workers.cloudflare.com/) for serverless hosting
- Inspired by various GitHub profile badge projects