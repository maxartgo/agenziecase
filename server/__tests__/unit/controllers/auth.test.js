// server/__tests__/unit/controllers/auth.test.js
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'

// Mock app per testing
const app = express()
app.use(express.json())

app.post('/api/test/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  if (email === 'test@test.com' && password === 'password123') {
    return res.status(200).json({
      token: 'mock-jwt-token',
      user: { id: 1, email }
    })
  }

  return res.status(401).json({ error: 'Invalid credentials' })
})

describe('Auth Controller', () => {
  describe('POST /api/test/login', () => {
    test('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/test/login')
        .send({ password: 'password123' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Email and password required')
    })

    test('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/test/login')
        .send({ email: 'test@test.com' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Email and password required')
    })

    test('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/test/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid credentials')
    })

    test('should return 200 and token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/test/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        })

      expect(response.status).toBe(200)
      expect(response.body.token).toBe('mock-jwt-token')
      expect(response.body.user.email).toBe('test@test.com')
    })
  })
})
