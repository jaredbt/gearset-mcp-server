#!/usr/bin/env node

/**
 * Simple test script to verify the Gearset MCP server functionality
 * Run this after setting up your .env file with a valid GEARSET_API_TOKEN
 */

const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
require('dotenv').config();

if (!process.env.GEARSET_API_TOKEN) {
  console.error('❌ Error: GEARSET_API_TOKEN not found in environment');
  console.error('Please add your token to the .env file');
  process.exit(1);
}

console.log('🚀 Testing Gearset MCP Server...');
console.log('Token found:', process.env.GEARSET_API_TOKEN.substring(0, 8) + '...');

// Test the built server
const serverPath = path.join(__dirname, '../dist', 'index.js');
const server = spawn('node', [serverPath], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe'],
});

let output = '';
let errorOutput = '';

server.stdout.on('data', data => {
  output += data.toString();
  console.log('📤 Server output:', data.toString().trim());
});

server.stderr.on('data', data => {
  errorOutput += data.toString();
  console.log('🖥️  Server message:', data.toString().trim());
});

// Send a test MCP message to list tools
const listToolsMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {},
};

console.log('📨 Sending tools/list request...');
server.stdin.write(JSON.stringify(listToolsMessage) + '\n');

// Test timeout
setTimeout(() => {
  console.log('⏰ Test complete - terminating server');
  server.kill();
}, 3000);

server.on('close', code => {
  console.log(`\n📊 Test Results:`);
  console.log(`Exit code: ${code}`);

  if (errorOutput.includes('running on stdio')) {
    console.log('✅ Server started successfully');
  } else {
    console.log('❌ Server may have issues');
  }

  if (output.includes('tools')) {
    console.log('✅ MCP protocol responding');
  } else {
    console.log('❌ No MCP response detected');
  }

  console.log('\n📝 Full output:');
  console.log('STDOUT:', output);
  console.log('STDERR:', errorOutput);
});

server.on('error', err => {
  console.error('❌ Failed to start server:', err);
});
