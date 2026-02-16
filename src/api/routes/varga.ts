import { Router, Request, Response } from "express";
import { PlanetName } from "../../types/enums";
import { Time } from "../../types/interfaces";
import { TimeUtil } from "../../utils/TimeUtil";
import { VargaCalculator } from "../../core/VargaCalculator";

const router = Router();

/**
 * POST /api/varga/navamsa
 * Get Navamsa (D9) chart - Marriage and Dharma
 */
router.post("/navamsa", async (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);

    const chart = VargaCalculator.getCompleteDivisionalChart(time, 9);

    res.json({
      success: true,
      division: "D9",
      name: "Navamsa",
      purpose: "Marriage and Dharma",
      chart,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/varga/dasamsa
 * Get Dasamsa (D10) chart - Career and Profession
 */
router.post("/dasamsa", async (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);

    const chart = VargaCalculator.getCompleteDivisionalChart(time, 10);

    res.json({
      success: true,
      division: "D10",
      name: "Dasamsa",
      purpose: "Career and Profession",
      chart,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/varga/hora
 * Get Hora (D2) chart - Wealth
 */
router.post("/hora", async (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);

    const chart = VargaCalculator.getCompleteDivisionalChart(time, 2);

    res.json({
      success: true,
      division: "D2",
      name: "Hora",
      purpose: "Wealth",
      chart,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/varga/drekkana
 * Get Drekkana (D3) chart - Siblings and Courage
 */
router.post("/drekkana", async (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);

    const chart = VargaCalculator.getCompleteDivisionalChart(time, 3);

    res.json({
      success: true,
      division: "D3",
      name: "Drekkana",
      purpose: "Siblings and Courage",
      chart,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/varga/planet-position
 * Get planet position in a specific varga
 */
router.post("/planet-position", async (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const { planet } = req.body;
    const division = req.body.division || 9; // Default to D9 if not specified

    const planetEnum = PlanetName[
      planet as keyof typeof PlanetName
    ] as unknown as PlanetName;

    if (planetEnum === undefined) {
      return res
        .status(400)
        .json({ success: false, error: `Invalid planet name: ${planet}` });
    }

    const position = VargaCalculator.calculateVargaPosition(
      planetEnum,
      time,
      division,
    );

    res.json({
      success: true,
      planet,
      division: `D${division}`,
      position,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/varga/:division
 * Get any divisional chart by number
 */
router.post("/:division", async (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const division = parseInt(req.params.division);

    if (isNaN(division) || division < 1 || division > 60) {
      return res
        .status(400)
        .json({ success: false, error: "Division must be between 1 and 60" });
    }

    const names: Record<number, string> = {
      1: "Rasi (Birth Chart)",
      2: "Hora (Wealth)",
      3: "Drekkana (Siblings)",
      9: "Navamsa (Marriage)",
      10: "Dasamsa (Career)",
      12: "Dwadasamsa (Parents)",
      16: "Shodasamsa (Vehicles)",
      20: "Vimsamsa (Spiritual)",
      24: "Chaturvimsamsa (Education)",
      27: "Saptavimsamsa (Strength)",
      30: "Trimsamsa (Evils)",
      40: "Khavedamsa (Auspicious)",
      45: "Akshavedamsa (General)",
      60: "Shashtyamsa (General)",
    };

    const chart = VargaCalculator.getCompleteDivisionalChart(time, division);

    res.json({
      success: true,
      division: `D${division}`,
      name: names[division] || `D${division}`,
      chart,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
