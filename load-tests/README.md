# Load Testing with k6

This directory contains load testing scripts for the AgenzieCase API using k6.

## Prerequisites

1. Install k6: https://k6.io/docs/getting-started/installation/
   - Windows: `choco install k6`
   - Mac: `brew install k6`
   - Linux: See https://k6.io/docs/getting-started/installation/

2. Start the API server:
   ```bash
   cd server
   npm start
   ```

## Running Load Tests

### Basic Load Test

Run the properties API load test:
```bash
k6 run load-tests/properties-api.js
```

### With Output File

Run and save results to JSON:
```bash
k6 run load-tests/properties-api.js --out json=load-tests/results.json
```

### With HTML Report

Run and generate HTML report:
```bash
k6 run load-tests/properties-api.js --summary-export=load-tests/summary.json
```

## Test Scenarios

### properties-api.js

Tests the properties API endpoints with the following stages:
- 30s: Ramp up to 10 users
- 1m: Ramp up to 50 users
- 2m: Ramp up to 100 users
- 1m: Ramp down to 50 users
- 30s: Ramp down to 0 users

**Endpoints tested:**
- GET /api/properties (list properties)
- GET /api/properties/featured (featured properties)
- GET /api/properties/stats (statistics)
- GET /api/properties/:id (single property)

**Thresholds:**
- 95% of requests must complete below 500ms
- Error rate must be less than 5%

## Performance Goals

### Before Optimization (Estimated)
- Property list API: ~800-1200ms
- CRM dashboard load: ~2000-3000ms
- Frontend bundle: ~800KB-1MB
- Initial page load: ~4-5s

### After Optimization (Target)
- Property list API: ~100-200ms (80% improvement)
- CRM dashboard load: ~400-600ms (75% improvement)
- Frontend bundle: ~300-400KB (50% reduction)
- Initial page load: ~1.5-2s (60% improvement)

## Analyzing Results

### Key Metrics

1. **Response Time**: How long requests take to complete
   - Average: Mean response time
   - p(95): 95th percentile (95% of requests complete in this time)

2. **Request Rate**: Requests per second
   - Higher is better (indicates better throughput)

3. **Error Rate**: Percentage of failed requests
   - Should be below 5%

4. **Virtual Users (VUs)**: Number of concurrent users

### Interpreting Results

```json
{
  "metrics": {
    "http_req_duration": {
      "values": {
        "avg": 234.5,        // Average response time in ms
        "p(95)": 456.7       // 95th percentile in ms
      }
    },
    "http_reqs": {
      "values": {
        "rate": 123.4        // Requests per second
      }
    },
    "http_req_failed": {
      "values": {
        "rate": 0.01         // Error rate (1%)
      }
    }
  }
}
```

## Troubleshooting

### Connection Refused

Make sure the API server is running:
```bash
cd server
npm start
```

### High Error Rates

1. Check server logs for errors
2. Verify database connection
3. Check Redis connection (if caching is enabled)

### Slow Response Times

1. Check database query performance
2. Verify caching is working (check X-Cache header)
3. Monitor database connection pool

## Customizing Tests

### Adjust Load Levels

Edit the `stages` array in the test file:
```javascript
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // 50 users for 1 minute
    { duration: '2m', target: 100 },  // 100 users for 2 minutes
  ],
};
```

### Change Thresholds

Edit the `thresholds` object:
```javascript
thresholds: {
  http_req_duration: ['p(95)<300'],   // Stricter: 95% under 300ms
  http_req_failed: ['rate<0.01'],     // Stricter: 1% error rate
},
```

### Add New Endpoints

Add new test cases in the default function:
```javascript
export default function () {
  const res = http.get(`${BASE_URL}/your-endpoint`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```
