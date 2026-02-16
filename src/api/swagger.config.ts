import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AstroWeb API',
            version: process.env.API_VERSION || '1.0.0',
            description: 'Comprehensive Vedic Astrology REST API - Migrated from C# to Node.js',
            contact: {
                name: 'AstroWeb',
                url: 'https://astroweb.org'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' 
                    ? 'https://api.astroweb.org'
                    : `http://localhost:${process.env.PORT || 3000}`,
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                Time: {
                    type: 'object',
                    required: ['year', 'month', 'day', 'hour', 'minute', 'second', 'latitude', 'longitude', 'timezone'],
                    properties: {
                        year: { type: 'number', example: 1990 },
                        month: { type: 'number', example: 6 },
                        day: { type: 'number', example: 15 },
                        hour: { type: 'number', example: 14 },
                        minute: { type: 'number', example: 30 },
                        second: { type: 'number', example: 0 },
                        latitude: { type: 'number', example: 28.6139 },
                        longitude: { type: 'number', example: 77.2090 },
                        timezone: { type: 'number', example: 5.5 }
                    }
                },
                Person: {
                    type: 'object',
                    properties: {
                        PersonId: { type: 'string' },
                        OwnerId: { type: 'string' },
                        Name: { type: 'string' },
                        BirthTime: { type: 'string', format: 'date-time' },
                        Gender: { type: 'string', enum: ['Male', 'Female'] },
                        Notes: { type: 'string' },
                        CreatedAt: { type: 'string', format: 'date-time' },
                        UpdatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['admin', 'user', 'guest'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        lastLogin: { type: 'string', format: 'date-time' }
                    }
                },
                Match: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        person1: { $ref: '#/components/schemas/Person' },
                        person2: { $ref: '#/components/schemas/Person' },
                        kutaScore: { type: 'number', minimum: 0, maximum: 36 },
                        compatibility: { type: 'string' },
                        details: { type: 'object' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        Payload: { type: 'object' },
                        Status: { type: 'string', enum: ['Pass', 'Fail'] }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' }
                    }
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'User authentication and authorization' },
            { name: 'Person Management', description: 'Manage person profiles' },
            { name: 'Match', description: 'Compatibility matching' },
            { name: 'Birth Chart', description: 'Birth chart calculations' },
            { name: 'Panchang', description: 'Panchang calculations' },
            { name: 'Dasha', description: 'Dasha period calculations' },
            { name: 'Muhurtha', description: 'Auspicious time calculations' },
            { name: 'Events Chart', description: 'Life events timing predictions' },
            { name: 'Health', description: 'API health and status' }
        ]
    },
    apis: ['./src/api/routes/*.ts', './src/api/server.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
    // Swagger UI
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'AstroWeb API Documentation'
    }));
    
    // Swagger JSON
    app.get('/api/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    
    console.log(`📚 Swagger documentation available at /api/docs`);
}

export { swaggerSpec };
