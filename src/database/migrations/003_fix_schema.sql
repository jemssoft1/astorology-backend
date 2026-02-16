-- ==============================================================================
-- Migration: Fix Schema - Remove Foreign Key & Add Location Fields
-- Created: 2026-02-09
-- ==============================================================================

-- 1. Drop the Foreign Key Constraint
-- Note: Constraint name might vary, trying common default names. 
-- You can verify the name with: SHOW CREATE TABLE persons;
ALTER TABLE persons DROP FOREIGN KEY persons_ibfk_1;

-- 2. Add Missing Location Columns (if not already present via 002)
-- Using IF NOT EXISTS logic via stored procedure or just running ADD COLUMN (which might fail if exists)
-- This script assumes columns might be missing.

ALTER TABLE persons
ADD COLUMN birth_location VARCHAR(255) NULL AFTER notes,
ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER birth_location,
ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude,
ADD COLUMN timezone_offset VARCHAR(10) DEFAULT '+05:30' AFTER longitude;

-- 3. Re-add index for location
CREATE INDEX idx_location ON persons(latitude, longitude);
