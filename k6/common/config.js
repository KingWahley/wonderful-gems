/**
 * Shared configuration and options for the k6 load testing suite.
 */

// Target environment URL, fallback to localhost:3000
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Standard HTTP Headers
export const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'k6-load-tester/1.0',
};

// Custom SLO (Service Level Objective) Performance Thresholds
export const THRESHOLDS = {
  http_req_failed: ['rate<0.01'], // Fail rate must be under 1%
  http_req_duration: ['p(95)<500', 'p(99)<1200'], // 95% of reqs < 500ms, 99% < 1.2s
  http_req_connecting: ['p(95)<100'], // TCP Handshake under 100ms
  checks: ['rate>0.99'], // 99%+ of assertion checks must pass
};

// Simulation user wait limits (in seconds)
export const SLEEP_MIN = 0.5;
export const SLEEP_MAX = 2.5;

// Generate a random sleep to represent human wait times
export function randomSleep() {
  const t = Math.random() * (SLEEP_MAX - SLEEP_MIN) + SLEEP_MIN;
  return t;
}
