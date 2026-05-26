import { runTravelerSession } from '../common/scenarios.js';
import { THRESHOLDS } from '../common/config.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const options = {
  // Spike Profile: Sharp increase to 800 users in 20s, hold briefly, and dump instantly
  stages: [
    { duration: '20s', target: 800 },   // Massive sudden traffic surge
    { duration: '1m30s', target: 800 }, // Hold load to inspect queuing and scale latency
    { duration: '10s', target: 0 },     // Rapid traffic dump
  ],
  thresholds: {
    ...THRESHOLDS,
    http_req_failed: ['rate<0.02'], // Allow up to 2% error rate during sudden spikes
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
