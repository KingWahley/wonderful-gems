import { runTravelerSession } from '../common/scenarios.js';
import { THRESHOLDS } from '../common/config.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const options = {
  // Medium Load Profile: Ramps up to 500 VUs, sustains, and ramps down
  stages: [
    { duration: '1m', target: 200 },   // Initial warm-up to 200 VUs
    { duration: '1m', target: 500 },   // Ramp up to peak 500 VUs
    { duration: '2m', target: 500 },   // Maintain peak load
    { duration: '30s', target: 0 },    // Gradual cool down
  ],
  thresholds: THRESHOLDS,
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
