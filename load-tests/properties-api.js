import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },     // Ramp up to 50 users
    { duration: '2m', target: 100 },    // Ramp up to 100 users
    { duration: '1m', target: 50 },     // Ramp down to 50 users
    { duration: '30s', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.05'],     // Error rate must be less than 5%
    errors: ['rate<0.05'],
  },
};

const BASE_URL = 'http://localhost:3001/api';

export default function () {
  // Test 1: Get all properties
  const getPropertiesRes = http.get(`${BASE_URL}/properties?limit=20`);

  check(getPropertiesRes, {
    'GET /properties status is 200': (r) => r.status === 200,
    'GET /properties has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && Array.isArray(body.properties);
      } catch {
        return false;
      }
    },
    'GET /properties response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  responseTimeTrend.add(getPropertiesRes.timings.duration);

  sleep(1);

  // Test 2: Get featured properties
  const getFeaturedRes = http.get(`${BASE_URL}/properties/featured`);

  check(getFeaturedRes, {
    'GET /properties/featured status is 200': (r) => r.status === 200,
    'GET /properties/featured has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && Array.isArray(body.properties);
      } catch {
        return false;
      }
    },
    'GET /properties/featured response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  responseTimeTrend.add(getFeaturedRes.timings.duration);

  sleep(1);

  // Test 3: Get property stats
  const getStatsRes = http.get(`${BASE_URL}/properties/stats`);

  check(getStatsRes, {
    'GET /properties/stats status is 200': (r) => r.status === 200,
    'GET /properties/stats has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.stats;
      } catch {
        return false;
      }
    },
    'GET /properties/stats response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  responseTimeTrend.add(getStatsRes.timings.duration);

  sleep(2);

  // Test 4: Get single property (random ID between 1-10)
  const randomId = Math.floor(Math.random() * 10) + 1;
  const getPropertyRes = http.get(`${BASE_URL}/properties/${randomId}`);

  check(getPropertyRes, {
    'GET /properties/:id status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'GET /properties/:id response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  responseTimeTrend.add(getPropertyRes.timings.duration);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'load-tests/results.json': JSON.stringify(data, null, 2),
    stdout: JSON.stringify({
      'Average Response Time': `${data.metrics.http_req_duration.values['avg']}ms`,
      '95th Percentile': `${data.metrics.http_req_duration.values['p(95)']}ms`,
      'Request Rate': `${data.metrics.http_reqs.values['rate']} req/s`,
      'Error Rate': `${(data.metrics.http_req_failed.values['rate'] * 100).toFixed(2)}%`,
    }, null, 2),
  };
}
