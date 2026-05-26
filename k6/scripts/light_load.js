import { runTravelerSession } from '../common/scenarios.js';
import { THRESHOLDS } from '../common/config.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const options = {
  // Light Load Profile: Ramps up to 50 VUs, holds, and ramps down
  stages: [
    { duration: '30s', target: 50 },  // Ramp up from 0 to 50 users
    { duration: '1m', target: 50 },   // Sustain 50 active travelers
    { duration: '15s', target: 0 },   // Ramp down gracefully
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
