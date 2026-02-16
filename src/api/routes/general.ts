import { Router, Request, Response } from 'express';
import path from 'path';

const router = Router();

/**
 * Utilities
 */
router.get('/favicon', (req: Request, res: Response) => {
   // Send a dummy 204 No Content or a real icon if present
   res.status(204).send();
});

router.get('/home', (req: Request, res: Response) => {
    res.send(`
        <h1>Vedic Astrology API</h1>
        <p>Running successfully!</p>
        <p>Endponts: /api/...</p>
    `);
});

router.get('/js-hash', (req: Request, res: Response) => {
    res.json({
        success: true,
        hash: 'cb24a04d3e89569733075c026ca2554d' // Static hash for now
    });
});

/**
 * Logging
 */
router.post('/log/error', (req: Request, res: Response) => {
    const { message, stack } = req.body;
    console.error(`[CLIENT ERROR] ${message}`, stack);
    res.json({ success: true });
});

router.post('/log/debug', (req: Request, res: Response) => {
    const { message, data } = req.body;
    console.log(`[CLIENT DEBUG] ${message}`, data);
    res.json({ success: true });
});

/**
 * 404 Handler for API
 */
router.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'API Endpoint Not Found'
    });
});

export default router;
