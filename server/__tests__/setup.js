// server/__tests__/setup.js
import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })

// Set test environment variables if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}

if (!process.env.DB_NAME) {
  process.env.DB_NAME = 'agenziecase_test'
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
}
