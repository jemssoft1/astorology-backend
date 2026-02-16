import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration interface
interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
    waitForConnections: boolean;
    queueLimit: number;
}

// Get configuration from environment variables
const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'astroweb',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    waitForConnections: true,
    queueLimit: 0
};

// Create connection pool
let pool: mysql.Pool | null = null;

/**
 * Get or create database connection pool
 */
export const getPool = (): mysql.Pool => {
    if (!pool) {
        pool = mysql.createPool(config);
        console.log('✅ MySQL connection pool created');
    }
    return pool;
};

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        const connection = await getPool().getConnection();
        console.log('✅ Database connection successful');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};

/**
 * Close all database connections
 */
export const closePool = async (): Promise<void> => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✅ Database connection pool closed');
    }
};

/**
 * Execute a query with automatic connection handling
 */
export const query = async <T = any>(sql: string, params?: any[]): Promise<T> => {
    const connection = await getPool().getConnection();
    try {
        const [rows] = await connection.execute(sql, params);
        return rows as T;
    } finally {
        connection.release();
    }
};

/**
 * Execute a transaction
 */
export const transaction = async <T = any>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
    const connection = await getPool().getConnection();
    await connection.beginTransaction();
    
    try {
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export default {
    getPool,
    testConnection,
    closePool,
    query,
    transaction
};
