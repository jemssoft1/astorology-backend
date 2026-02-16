import { Router, Request, Response } from "express";
import { LifePathCalculator } from "../../core/LifePathCalculator";
import { TimeUtil } from "../../utils/TimeUtil";
import { Time } from "../../types/interfaces";
import { LifePathRequest } from "../../types/lifepath";

const router = Router();
router.get("/test", (req: Request, res: Response) => {
  console.log("✅ GET /api/life-path/test hit!");
  res.json({ success: true, message: "Life-path route is working!" });
});
/**
 * POST /api/life-path/predict
 * Generate comprehensive life path prediction
 *
 * @body {
 *   birthTime: Time,
 *   startDate?: string (ISO format),
 *   endDate?: string (ISO format),
 *   daysPerPixel?: number,
 *   precisionHours?: number
 * }
 */
router.post("/predict", (req: Request, res: Response) => {
  console.log("========================================");
  console.log("🚀 /api/life-path/predict HIT!");
  console.log("📦 Body:", JSON.stringify(req.body, null, 2));
  console.log("========================================");

  try {
    let birthTimeInput = req.body.birthTime || req.body;
    const birthTime: Time = TimeUtil.normalizeTime(birthTimeInput);

    console.log("✅ birthTime received:", birthTime);

    const request: LifePathRequest = {
      birthTime,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      daysPerPixel: req.body.daysPerPixel,
      precisionHours: req.body.precisionHours,
    };

    console.log("📊 Calling LifePathCalculator...");
    const prediction = LifePathCalculator.generateLifePathPrediction(request);

    console.log("📈 Result:");
    console.log("   TimeSlices:", prediction.TimeSlices.length);
    console.log("   TotalEvents:", prediction.Configuration.TotalEventsCount);

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error: any) {
    console.log("❌ ERROR:", error.message);
    console.log("Stack:", error.stack);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/life-path/events
 * Get life events for a specific date range
 *
 * @body {
 *   birthTime: Time,
 *   queryDate: string (ISO format),
 *   daysRange?: number (default 30)
 * }
 */
router.post("/events", (req: Request, res: Response) => {
  try {
    const birthTime: Time = TimeUtil.normalizeTime(
      req.body.birthTime || req.body,
    );
    const queryDate = req.body.queryDate || new Date().toISOString();
    const daysRange = req.body.daysRange || 30;

    const startDate = new Date(queryDate);
    const endDate = new Date(
      startDate.getTime() + daysRange * 24 * 60 * 60 * 1000,
    );

    const request: LifePathRequest = {
      birthTime: birthTime as Time,
      startDate,
      endDate,
      daysPerPixel: 0.73,
      precisionHours: 17.52,
    };

    const prediction = LifePathCalculator.generateLifePathPrediction(request);

    res.json({
      success: true,
      data: {
        timeRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        eventsCount: prediction.TimeSlices.reduce(
          (sum, slice) => sum + slice.Events.length,
          0,
        ),
        timeSlices: prediction.TimeSlices,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/life-path/current-period
 * Get current life period analysis
 *
 * @body {
 *   birthTime: Time
 * }
 */
router.post("/current-period", (req: Request, res: Response) => {
  try {
    const birthTime: Time = TimeUtil.normalizeTime(
      req.body.birthTime || req.body,
    );

    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days

    const request: LifePathRequest = {
      birthTime: birthTime as Time,
      startDate: now,
      endDate,
      daysPerPixel: 0.1,
      precisionHours: 6,
    };

    const prediction = LifePathCalculator.generateLifePathPrediction(request);

    res.json({
      success: true,
      data: {
        currentPeriod: prediction.TimeSlices[0],
        upcomingWeek: prediction.TimeSlices,
        summary: {
          totalEvents: prediction.Configuration.TotalEventsCount,
          avgNatureScore:
            prediction.TimeSlices.length > 0
              ? prediction.TimeSlices[0].Events.reduce(
                  (sum, e) => sum + e.NatureScore,
                  0,
                ) / prediction.TimeSlices[0].Events.length
              : 0,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
