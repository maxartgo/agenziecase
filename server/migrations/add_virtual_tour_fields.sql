-- Migration: Add Virtual Tour Fields to Properties Table
-- Date: 2025-12-13
-- Description: Adds virtual tour URL and request status tracking to properties

-- 1. Add virtualTourUrl column to properties
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "virtualTourUrl" VARCHAR(500);

-- 2. Add vtRequestStatus to track virtual tour request state
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "vtRequestStatus" VARCHAR(50) DEFAULT 'none';

-- 3. Add vtRequestedAt timestamp
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "vtRequestedAt" TIMESTAMP;

-- 4. Add vtCompletedAt timestamp
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "vtCompletedAt" TIMESTAMP;

-- 5. Add comment for documentation
COMMENT ON COLUMN properties."virtualTourUrl" IS 'URL del virtual tour Kuula collegato all''immobile';
COMMENT ON COLUMN properties."vtRequestStatus" IS 'Stato richiesta virtual tour: none, pending, processing, completed, rejected';
COMMENT ON COLUMN properties."vtRequestedAt" IS 'Data richiesta virtual tour';
COMMENT ON COLUMN properties."vtCompletedAt" IS 'Data completamento virtual tour';
