// Debug script for metrics
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/dashboard',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('Full dashboard response:');
    console.log(JSON.stringify(result.data.stats, null, 2));
    console.log('Today stats from realStats:');
    console.log(JSON.stringify(result.data.realtimeMetrics, null, 2));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write('{}');
req.end();
