#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Spotify Badge Cloudflare Workers Deployment Script\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if wrangler.toml exists
const wranglerConfigPath = path.join(process.cwd(), 'wrangler.toml');
if (!fs.existsSync(wranglerConfigPath)) {
  console.error('❌ Error: wrangler.toml not found. This script requires Cloudflare Workers configuration.');
  process.exit(1);
}

// Check if Wrangler CLI is installed
try {
  execSync('wrangler --version', { stdio: 'ignore' });
} catch (error) {
  console.log('📦 Installing Wrangler CLI...');
  try {
    execSync('npm install -g wrangler', { stdio: 'inherit' });
  } catch (installError) {
    console.error('❌ Failed to install Wrangler CLI. Please install it manually:');
    console.error('   npm install -g wrangler');
    process.exit(1);
  }
}

// Check authentication
console.log('🔍 Checking Cloudflare authentication...');
try {
  execSync('wrangler whoami', { stdio: 'ignore' });
  console.log('✅ Authenticated with Cloudflare');
} catch (error) {
  console.log('🔐 Please authenticate with Cloudflare:');
  try {
    execSync('wrangler login', { stdio: 'inherit' });
  } catch (authError) {
    console.error('❌ Authentication failed. Please run: wrangler login');
    process.exit(1);
  }
}

// Check for required secrets
const requiredSecrets = [
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'SPOTIFY_REFRESH_TOKEN'
];

console.log('\n🔐 Checking secrets configuration...');
console.log('⚠️  You need to set these secrets after deployment:');
requiredSecrets.forEach(secret => {
  console.log(`   - ${secret}`);
});

console.log('\n💡 To set secrets after deployment, run:');
requiredSecrets.forEach(secret => {
  console.log(`   wrangler secret put ${secret}`);
});

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nContinue with deployment? (y/N): ', (answer) => {
  rl.close();
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('Deployment cancelled.');
    process.exit(0);
  }
  deployToCloudflare();
});

function deployToCloudflare() {
  console.log('\n🚀 Deploying to Cloudflare Workers...');
  
  try {
    // Deploy to Cloudflare Workers
    execSync('wrangler deploy', { stdio: 'inherit' });
    
    console.log('\n✅ Deployment successful!');
    console.log('\n📋 Next steps:');
    console.log('1. Set your Spotify API secrets:');
    requiredSecrets.forEach(secret => {
      console.log(`   wrangler secret put ${secret}`);
    });
    console.log('2. Test your worker endpoint');
    console.log('3. Set up your custom subdomain (optional)');
    console.log('4. Update your badge URL in README files');
    console.log('\n🎵 Your Spotify badge API is ready to use!');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you\'re authenticated: wrangler login');
    console.log('2. Check your internet connection');
    console.log('3. Verify wrangler.toml configuration');
    console.log('4. Check Cloudflare Workers limits on your account');
    process.exit(1);
  }
}