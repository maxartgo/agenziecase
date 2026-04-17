-- Migration: Add 'partner' to user role enum

-- Step 1: Add the new value to the existing enum type
ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS 'partner';

-- Note: This migration adds 'partner' to the enum.
-- The value will be added at the end of the enum values.
-- Existing data will not be affected.
