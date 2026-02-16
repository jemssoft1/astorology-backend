import fs from 'fs';
import path from 'path';
import { getPool, testConnection, closePool } from './config';

/**
 * Database Migration Runner
 * Executes all SQL migration files in order
 */

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function runMigrations(): Promise<void> {
    console.log('🚀 Starting database migrations...\n');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('❌ Database connection failed. Please check your .env configuration.');
        process.exit(1);
    }
    
    try {
        // Get all SQL files sorted by name
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort();
        
        if (files.length === 0) {
            console.log('⚠️  No migration files found in:', MIGRATIONS_DIR);
            return;
        }
        
        console.log(`Found ${files.length} migration files:\n`);
        
        const pool = getPool();
        const connection = await pool.getConnection();
        
        for (const file of files) {
            const filePath = path.join(MIGRATIONS_DIR, file);
            const sql = fs.readFileSync(filePath, 'utf-8');
            
            console.log(`📄 Running: ${file}`);
            
            try {
                // Split by semicolon to handle multiple statements
                const statements = sql
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.startsWith('--'));
                
                for (const statement of statements) {
                    await connection.query(statement);
                }
                
                console.log(`   ✅ Success\n`);
            } catch (error: any) {
                console.error(`   ❌ Error: ${error.message}\n`);
                throw error;
            }
        }
        
        connection.release();
        
        console.log('✅ All migrations completed successfully!\n');
        console.log('📊 Database schema is ready.\n');
        
    } catch (error: any) {
        console.error('\n❌ Migration failed:', error.message);
        throw error;
    } finally {
        await closePool();
    }
}

// Run if executed directly
if (require.main === module) {
    runMigrations()
        .then(() => {
            console.log('🎉 Migration process finished');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

export { runMigrations };
