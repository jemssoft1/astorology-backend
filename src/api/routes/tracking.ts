import { Router, Request, Response } from "express";
import { VisitorRepository } from "../../database/VisitorRepository";
import { GeoLocationService } from "../../services/GeoLocationService";

const router = Router();
const visitorRepo = new VisitorRepository();

/**
 * POST /api/tracking/visit
 * Track a visitor - captures IP, location, device info
 * This should be called on first API call or app load
 */
router.post("/visit", async (req: Request, res: Response) => {
  try {
    // Get comprehensive visitor info
    const visitorInfo = await GeoLocationService.getVisitorInfo(req);

    // Allow client to override PC name if they can provide it
    if (req.body.pcName) {
      visitorInfo.pcName = req.body.pcName;
    }

    // Record the visit
    // Record the visit
    const visitor = await visitorRepo.recordVisit({
      ...visitorInfo,
      firstVisit: new Date(),
      lastVisit: new Date(),
      visitCount: 1,
    });

    res.json({
      success: true,
      data: {
        isNewVisitor: visitor.visitCount === 1,
        visitCount: visitor.visitCount,
        location: {
          city: visitor.city,
          state: visitor.state,
          country: visitor.country,
          area: visitor.area,
        },
        message:
          visitor.visitCount === 1
            ? "Welcome! First time visitor recorded."
            : `Welcome back! Visit #${visitor.visitCount}`,
      },
    });
  } catch (error: any) {
    console.error("Error tracking visit:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tracking/stats
 * Get visitor statistics
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = await visitorRepo.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tracking/visitors
 * Get all visitors (paginated)
 */
router.get("/visitors", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const visitors = await visitorRepo.getAllVisitors(limit, offset);

    res.json({
      success: true,
      data: {
        visitors,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tracking/visitors/location
 * Get visitors by location
 */
router.get("/visitors/location", async (req: Request, res: Response) => {
  try {
    const { city, state, country } = req.query;

    const visitors = await visitorRepo.getVisitorsByLocation(
      city as string,
      state as string,
      country as string,
    );

    res.json({
      success: true,
      data: {
        visitors,
        filters: { city, state, country },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tracking/my-info
 * Get current visitor's info without saving to database
 */
router.get("/my-info", async (req: Request, res: Response) => {
  try {
    const visitorInfo = await GeoLocationService.getVisitorInfo(req);

    res.json({
      success: true,
      data: visitorInfo,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
