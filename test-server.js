// Simple test server to verify network connectivity
const express = require('express');
const app = express();
const PORT = 3006;

app.use(express.json());

// Enable CORS for mobile app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/api/health', (req, res) => {
  console.log('Health check received');
  res.json({ ok: true, message: 'Test server is working!', timestamp: new Date().toISOString() });
});

app.post('/api/test', (req, res) => {
  console.log('Test POST received:', req.body);
  res.json({ success: true, received: req.body });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('✓ Test Server Running');
  console.log(`  Local: http://localhost:${PORT}`);
  console.log(`  Network: http://10.53.241.208:${PORT}`);
  console.log('=================================');
  console.log('');
  console.log('Test these URLs:');
  console.log(`  1. http://localhost:${PORT}/api/health`);
  console.log(`  2. http://10.53.241.208:${PORT}/api/health`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});

// Keep server alive
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});
