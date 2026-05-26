import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS, randomSleep } from './config.js';

// Realistic list of destination slugs from the seed data
const DESTINATION_SLUGS = [
  'japan',
  'portugal',
  'chile',
  'mexico',
  'morocco',
  'iceland',
  'vietnam',
  'italy',
  'belgium'
];

// Supabase details for simulating direct DB write calls
const SUPABASE_URL = 'https://aehjcuowbyugudhmvcag.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dbvMosiThU4RsiX9p_77bQ_UUiAqBrq';

/**
 * 1. Simulates homepage load (including server-rendered Next.js database queries)
 */
export function browseHomepage() {
  const res = http.get(BASE_URL, { headers: HEADERS });
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage has title': (r) => r.body && r.body.includes('Tours & activities') || r.body.includes('destinations') || r.body.includes('Plan with Me'),
  });
  sleep(randomSleep());
}

/**
 * 2. Simulates browsing the general Destinations list page
 */
export function browseDestinations() {
  const res = http.get(`${BASE_URL}/destinations`, { headers: HEADERS });
  check(res, {
    'destinations status is 200': (r) => r.status === 200,
    'destinations page has header': (r) => r.body && r.body.includes('Destinations'),
  });
  sleep(randomSleep());
}

/**
 * 3. Simulates reading a specific country guide (heavily triggers Supabase joins on the Next.js server)
 */
export function browseSingleDestination() {
  const randomSlug = DESTINATION_SLUGS[Math.floor(Math.random() * DESTINATION_SLUGS.length)];
  const res = http.get(`${BASE_URL}/destinations/${randomSlug}`, { headers: HEADERS });
  check(res, {
    'single destination status is 200': (r) => r.status === 200,
    'single destination renders country name': (r) => r.body && r.body.includes('posts from') || r.body.includes('COUNTRY GUIDE'),
  });
  sleep(randomSleep());
}

/**
 * 4. Simulates browsing tours & activities list (and testing smooth scroll targets)
 */
export function browseTours() {
  const res = http.get(`${BASE_URL}/tours`, { headers: HEADERS });
  check(res, {
    'tours status is 200': (r) => r.status === 200,
    'tours has headers': (r) => r.body && r.body.includes('Tours & activities') || r.body.includes('ALL'),
  });
  sleep(randomSleep());
}

/**
 * 5. Simulates reading blog posts
 */
export function browseBlogs() {
  const res = http.get(`${BASE_URL}/blog`, { headers: HEADERS });
  check(res, {
    'blog status is 200': (r) => r.status === 200,
    'blog has listing container': (r) => r.body && r.body.includes('Stories from the road') || r.body.includes('Latest Posts'),
  });
  sleep(randomSleep());
}

/**
 * 6. Simulates loading static pages (About Page)
 */
export function browseAbout() {
  const res = http.get(`${BASE_URL}/about`, { headers: HEADERS });
  check(res, {
    'about status is 200': (r) => r.status === 200,
  });
  sleep(randomSleep());
}

/**
 * 7. Load-tests the local Next.js cached API endpoint
 */
export function fetchLocationsAPI() {
  const res = http.get(`${BASE_URL}/api/locations`, { headers: HEADERS });
  check(res, {
    'locations API status is 200': (r) => r.status === 200,
    'locations API returns JSON array': (r) => {
      try {
        const parsed = JSON.parse(r.body);
        return Array.isArray(parsed) && parsed.length > 0;
      } catch (e) {
        return false;
      }
    },
  });
  sleep(randomSleep());
}

/**
 * 8. Simulates submitting a trip inquiry (direct database write actions)
 */
export function submitInquiry() {
  // Generate dynamic, realistic inquiry data
  const payload = JSON.stringify({
    name: `LoadTest User ${Math.floor(Math.random() * 10000)}`,
    email: `loadtest-${Date.now()}@travelwithtejiri.com`,
    package: 'Custom Itinerary Design',
    destinations: 'Japan, Portugal',
    dates: 'September 2026, 14 days',
    budget: '$3000 per person',
    message: 'Automated performance run - verifying write stress and latency under peak load.',
    status: 'new'
  });

  const headers = {
    ...HEADERS,
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=representation'
  };

  // POST directly to Supabase table REST endpoint, simulating direct client-side client write
  const res = http.post(`${SUPABASE_URL}/rest/v1/inquiries`, payload, { headers: headers });
  
  check(res, {
    'inquiry insert returns successful code (201)': (r) => r.status === 201 || r.status === 200,
  });

  sleep(randomSleep());
}

/**
 * Combined high-fidelity user session path simulating general traveler behavior
 */
export function runTravelerSession() {
  // 1. Enter site via Homepage
  browseHomepage();

  // 2. Select filter or search for locations
  fetchLocationsAPI();

  // 3. View list of destinations
  browseDestinations();

  // 4. Read about a specific country
  browseSingleDestination();

  // 5. Check out recommended tours
  browseTours();

  // 6. Navigate to plan a trip & submit inquiry (15% conversion probability)
  if (Math.random() < 0.15) {
    submitInquiry();
  }

  // 7. Check out blog or about
  if (Math.random() < 0.5) {
    browseBlogs();
  } else {
    browseAbout();
  }
}
