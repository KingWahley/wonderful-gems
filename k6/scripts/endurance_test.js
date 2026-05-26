import { runTravelerSession } from '../common/scenarios.js';
import { THRESHOLDS } from '../common/config.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const options = {
  // Endurance/Soak Profile: Constant moderate load over a sustained period
  stages: [
    { duration: '30s', target: 150 },  // Smooth ramp-up to 150 VUs
    { duration: '5m', target: 150 },   // Sustain constant load for 5 minutes (Extend to 30m+ in production)
    { duration: '30s', target: 0 },    // Gradual ramp-down
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
