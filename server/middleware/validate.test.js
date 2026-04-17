// server/middleware/validate.test.js
import { describe, test, expect } from '@jest/globals'
import { validate, validateQuery, validateParams } from './validate'
import { z } from 'zod'

// Mock Express request/response
const mockRequest = (body = {}, query = {}, params = {}) => ({
  body,
  query,
  params
})

const mockResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('Validation Middleware', () => {
  describe('validate() middleware', () => {
    const testSchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      age: z.number().min(18).optional()
    })

    test('should call next() with valid data', () => {
      const req = mockRequest({
        name: 'John',
        email: 'john@example.com',
        age: 25
      })
      const res = mockResponse()
      const next = jest.fn()

      validate(testSchema)(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(req.body).toEqual({
        name: 'John',
        email: 'john@example.com',
        age: 25
      })
    })

    test('should return 400 with validation errors', () => {
      const req = mockRequest({
        name: 'J',
        email: 'invalid-email',
        age: 15
      })
      const res = mockResponse()
      const next = jest.fn()

      validate(testSchema)(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Dati non validi',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
            code: expect.any(String)
          })
        ])
      })
      expect(next).not.toHaveBeenCalled()
    })

    test('should handle missing required fields', () => {
      const req = mockRequest({})
      const res = mockResponse()
      const next = jest.fn()

      validate(testSchema)(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('validateQuery() middleware', () => {
    const querySchema = z.object({
      page: z.number().positive().default(1),
      limit: z.number().positive().max(100).default(20),
      search: z.string().optional()
    })

    test('should validate query parameters', () => {
      const req = mockRequest({}, {
        page: '2',
        limit: '10'
      })
      const res = mockResponse()
      const next = jest.fn()

      validateQuery(querySchema)(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(req.query.page).toBe(2)
      expect(req.query.limit).toBe(10)
    })

    test('should apply default values', () => {
      const req = mockRequest({}, {})
      const res = mockResponse()
      const next = jest.fn()

      validateQuery(querySchema)(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(req.query.page).toBe(1)
      expect(req.query.limit).toBe(20)
    })
  })

  describe('validateParams() middleware', () => {
    const paramsSchema = z.object({
      id: z.string().regex(/^\d+$/),
      slug: z.string().min(3)
    })

    test('should validate route parameters', () => {
      const req = mockRequest({}, {}, {
        id: '123',
        slug: 'test-slug'
      })
      const res = mockResponse()
      const next = jest.fn()

      validateParams(paramsSchema)(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    test('should reject invalid params', () => {
      const req = mockRequest({}, {}, {
        id: 'abc',
        slug: 'ab'
      })
      const res = mockResponse()
      const next = jest.fn()

      validateParams(paramsSchema)(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
