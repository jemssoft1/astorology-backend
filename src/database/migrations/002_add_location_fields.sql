-- ==============================================================================
-- Migration: Add Location Fields to Persons Table
-- Created: 2026-02-09
-- ==============================================================================

ALTER TABLE persons
ADD COLUMN birth_location VARCHAR(255) NULL AFTER notes,
ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER birth_location,
ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude,
ADD COLUMN timezone_offset VARCHAR(10) DEFAULT '+05:30' AFTER longitude;

-- Add index for location searches
CREATE INDEX idx_location ON persons(latitude, longitude);
