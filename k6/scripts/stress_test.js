import { runTravelerSession } from '../common/scenarios.js';
import { THRESHOLDS } from '../common/config.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const options = {
  // Heavy Stress Profile: Ramps up to 1200+ VUs to identify structural bottlenecks
  stages: [
    { duration: '1m', target: 300 },   // Warm up to 300 VUs
    { duration: '1m', target: 800 },   // Step up to 800 VUs
    { duration: '1m', target: 1200 },  // Push to peak 1200 VUs
    { duration: '3m', target: 1200 },  // Hold peak to stress CPU, pool size & memory
    { duration: '1m', target: 0 },     // Graceful ramp down
  ],
  // Adjust threshold slightly under peak stress if needed, but keeping high standards
  thresholds: {
    ...THRESHOLDS,
    http_req_duration: ['p(95)<1000', 'p(99)<2500'], // Allow longer response windows under heavy stress
  },
};

export default function () {
  runTravelerSession();
}

export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}
