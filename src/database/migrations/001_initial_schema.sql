-- ==============================================================================
-- AstroWeb Database Schema - Complete Migration
-- ==============================================================================
-- This file contains all database tables needed for the AstroWeb API
-- Created: 2026-02-05
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- TABLE: users
-- Stores authenticated user accounts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'guest') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create default guest user (id: 101, matches C# API)
INSERT INTO users (id, username, email, password_hash, role) 
VALUES ('101', 'guest', 'guest@astroweb.org', '', 'guest')
ON DUPLICATE KEY UPDATE id=id;

-- ------------------------------------------------------------------------------
-- TABLE: persons
-- Stores person profiles for astrological calculations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persons (
    id VARCHAR(255) PRIMARY KEY,
    owner_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    birth_time DATETIME NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    notes TEXT,
    birth_location VARCHAR(255) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    timezone_offset VARCHAR(10) DEFAULT '+05:30',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE, -- REMOVED to allow guest/unlinked users
    INDEX idx_owner (owner_id),
    INDEX idx_name (name),
    INDEX idx_birth_time (birth_time),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- TABLE: matches
-- Stores compatibility match results between persons
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(255) PRIMARY KEY,
    person1_id VARCHAR(255) NOT NULL,
    person2_id VARCHAR(255) NOT NULL,
    kuta_score DECIMAL(5,2) NOT NULL,
    details JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person1_id) REFERENCES persons(id) ON DELETE CASCADE,
    FOREIGN KEY (person2_id) REFERENCES persons(id) ON DELETE CASCADE,
    INDEX idx_person1 (person1_id),
    INDEX idx_person2 (person2_id),
    INDEX idx_kuta_score (kuta_score),
    INDEX idx_created_at (created_at),
    UNIQUE KEY unique_match (person1_id, person2_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- TABLE: api_logs
-- Tracks all API requests for analytics and monitoring
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    response_time INT NOT NULL,
    status_code INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_endpoint (endpoint(255)),
    INDEX idx_timestamp (timestamp),
    INDEX idx_status_code (status_code),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- TABLE: error_logs
-- Stores detailed error information for debugging
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS error_logs (
    id VARCHAR(255) PRIMARY KEY,
    endpoint VARCHAR(500) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id VARCHAR(255) NULL,
    request_body TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_endpoint (endpoint(255)),
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
