import { Router, Request, Response } from "express";
import { EventsChartGenerator } from "../../core/EventsChartGenerator";
import { PersonRepository } from "../../database/PersonRepository";
import { TimeUtil } from "../../utils/TimeUtil";

const router = Router();
const personRepo = new PersonRepository();

/**
 * GET /api/events-chart/saved/:personId
 * Get saved charts for a person
 */
router.get("/saved/:ownerId/:personId", async (req: Request, res: Response) => {
  try {
    const { ownerId, personId } = req.params;
    // In a real app, check DB for saved charts
    // Returning mock list
    res.json({
      success: true,
      data: [
        { id: "chart1", name: "Life Overview", type: "Dasha" },
        { id: "chart2", name: "2024 Predictions", type: "Transit" },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/events-chart/generate
 * Generate new events chart
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { personId, ownerId, options } = req.body;

    let birthTime;
    if (personId && ownerId) {
      const person = await personRepo.getPersonById(ownerId, personId);
      if (!person)
        return res
          .status(404)
          .json({ success: false, error: "Person not found" });
      birthTime = person.birthTime;
    } else {
      birthTime = TimeUtil.normalizeTime(req.body.birthTime || req.body);
    }

    const svg = EventsChartGenerator.generateEventsChartSvg(birthTime);

    res.json({
      success: true,
      data: {
        svg: svg,
        options: options || {},
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/events-chart/:chartId
 * Get specific chart by ID
 */
router.get("/:chartId", (req: Request, res: Response) => {
  // Mock return
  res.json({
    success: true,
    data: {
      id: req.params.chartId,
      svg: "<svg>...</svg>",
    },
  });
});

/**
 * POST /api/events-chart/email
 * Email chart to user
 */
router.post("/email", (req: Request, res: Response) => {
  try {
    const { email, chartId } = req.body;
    if (!email)
      return res.status(400).json({ success: false, error: "Email required" });

    // Mock email sending
    console.log(`Sending chart ${chartId} to ${email}`);

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
