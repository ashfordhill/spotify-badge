#!/usr/bin/env node

const fetch = require('node-fetch');

// Configuration
const API_URL = process.argv[2] || 'http://localhost:8787';

console.log('🧪 Testing Spotify Badge API\n');
console.log(`📡 API URL: ${API_URL}\n`);

async function testApi() {
  try {
    console.log('⏳ Fetching API response...');
    const startTime = Date.now();
    
    const response = await fetch(API_URL);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`⚡ Response Time: ${responseTime}ms`);
    
    // Check headers
    console.log('\n📋 Response Headers:');
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   Cache-Control: ${response.headers.get('cache-control')}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('\n📄 Response Body:');
    console.log(JSON.stringify(data, null, 2));
    
    // Validate Shields.IO format
    console.log('\n✅ Validation Results:');
    
    const requiredFields = ['schemaVersion', 'label', 'message', 'color', 'namedLogo'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length === 0) {
      console.log('   ✅ All required Shields.IO fields present');
    } else {
      console.log(`   ❌ Missing required fields: ${missingFields.join(', ')}`);
    }
    
    if (data.schemaVersion === 1) {
      console.log('   ✅ Correct schema version');
    } else {
      console.log(`   ⚠️  Schema version is ${data.schemaVersion}, expected 1`);
    }
    
    if (data.namedLogo === 'spotify') {
      console.log('   ✅ Correct logo specified');
    } else {
      console.log(`   ⚠️  Logo is "${data.namedLogo}", expected "spotify"`);
    }
    
    if (typeof data.isError === 'boolean') {
      console.log(`   ✅ Error flag is boolean: ${data.isError}`);
    } else {
      console.log(`   ⚠️  Error flag should be boolean, got: ${typeof data.isError}`);
    }
    
    // Generate badge URL
    const encodedApiUrl = encodeURIComponent(API_URL);
    const badgeUrl = `https://img.shields.io/endpoint?url=${encodedApiUrl}&style=flat-square&logo=spotify&labelColor=000&color=1DB954`;
    
    console.log('\n🎨 Badge URL:');
    console.log(badgeUrl);
    
    console.log('\n📝 Markdown:');
    console.log(`![Spotify](${badgeUrl})`);
    
    console.log('\n🎉 API test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ API test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Make sure your worker is running');
      console.log('   - For local testing, run: npm run dev (wrangler dev)');
      console.log('   - Check if the URL is correct');
    } else if (error.message.includes('HTTP 500')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check your environment variables');
      console.log('   - Verify Spotify API credentials');
      console.log('   - Check server logs for detailed error information');
    }
    
    process.exit(1);
  }
}

// Add usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node scripts/test-api.js [API_URL]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/test-api.js');
  console.log('  node scripts/test-api.js http://localhost:8787');
  console.log('  node scripts/test-api.js https://your-worker.your-subdomain.workers.dev');
  process.exit(0);
}

testApi();