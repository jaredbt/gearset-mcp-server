#!/usr/bin/env node

/**
 * SAFE READ-ONLY test for PRODUCTION Gearset API
 * This only tests authentication and basic connectivity
 * NO CI jobs will be started or modified!
 */

const { spawn } = require('child_process');
const path = require('path');

require('dotenv').config();

if (!process.env.GEARSET_API_TOKEN) {
  console.error('❌ Error: GEARSET_API_TOKEN not found in environment');
  process.exit(1);
}

console.log('🔒 SAFE READ-ONLY Test for PRODUCTION Gearset...');
console.log('Token found:', process.env.GEARSET_API_TOKEN.substring(0, 8) + '...');
console.log('⚠️  This test will ONLY check authentication - no changes will be made');

const serverPath = path.join(__dirname, '../dist', 'index.js');
const server = spawn('node', [serverPath], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe']
});

let responses = [];

server.stdout.on('data', (data) => {
  const output = data.toString().trim();
  if (output) {
    try {
      const parsed = JSON.parse(output);
      responses.push(parsed);
      console.log('📤 Server response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('📤 Raw output:', output);
    }
  }
});

server.stderr.on('data', (data) => {
  console.log('🖥️  Server:', data.toString().trim());
});

// Test 1: List tools (safe)
setTimeout(() => {
  console.log('\n📨 Test 1: Listing available MCP tools...');
  const listToolsMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  server.stdin.write(JSON.stringify(listToolsMessage) + '\n');
}, 500);

// Test 2: Try status check with obviously fake job ID (safe - will return 404)
setTimeout(() => {
  console.log('\n📨 Test 2: Testing authentication with fake job ID (safe - expects 404)...');
  const testMessage = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get_ci_job_status',
      arguments: {
        jobId: 'test-fake-nonexistent-job-id-999999'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(testMessage) + '\n');
}, 2000);

// Clean shutdown
setTimeout(() => {
  console.log('\n⏰ Safe test complete - terminating server');
  server.kill();
}, 4000);

server.on('close', (code) => {
  console.log(`\n📊 Test Results:`);
  console.log(`Exit code: ${code}`);
  
  if (responses.length > 0) {
    console.log('✅ Server communication working');
    
    // Check for tools list response
    const toolsResponse = responses.find(r => r.result && r.result.tools);
    if (toolsResponse) {
      console.log('✅ MCP tools properly exposed:', toolsResponse.result.tools.length, 'tools');
    }
    
    // Check for API authentication test
    const apiResponse = responses.find(r => r.error || (r.result && typeof r.result === 'object'));
    if (apiResponse) {
      if (apiResponse.error) {
        const errorMsg = apiResponse.error.message || '';
        if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('Resource not found')) {
          console.log('✅ Authentication SUCCESS: Got expected 404 for fake job ID');
          console.log('✅ This confirms your Gearset API token is valid and working');
        } else if (errorMsg.includes('401') || errorMsg.includes('Invalid') || errorMsg.includes('token')) {
          console.log('❌ Authentication FAILED: Invalid API token');
        } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
          console.log('⚠️  Rate limit encountered - but authentication is working');
        } else {
          console.log('❓ Unexpected API response:', errorMsg);
        }
      } else {
        console.log('❓ Unexpected successful response (expected 404 for fake job ID)');
      }
    }
  } else {
    console.log('❌ No responses received');
  }
  
  console.log('\n🔒 SAFE TEST COMPLETE - No changes were made to your production Gearset instance');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});