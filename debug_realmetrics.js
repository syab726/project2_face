try {
  const realMetricsStore = require('./dist/services/realMetricsStore.js').default;
  const stats = realMetricsStore.getStats();
  const services = realMetricsStore.getServiceBreakdown();
  
  console.log('=== realMetricsStore.getStats() ===');
  console.log(JSON.stringify(stats, null, 2));
  console.log('');
  console.log('=== realMetricsStore.getServiceBreakdown() ===');  
  console.log(JSON.stringify(services, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}
