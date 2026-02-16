import express, { Request, Response } from "express";
import { BirthChartCalculator } from "../../core/BirthChartCalculator";
import { Time } from "../../types/interfaces";
import { TimeUtil } from "../../utils/TimeUtil";
import { PlanetName, HouseName } from "../../types/enums";

const router = express.Router();

// ============ PLANET STRENGTH APIs ============

router.post("/planet-strength", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const { planet } = req.body;
    const isExalted = BirthChartCalculator.isPlanetExalted(
      planet as PlanetName,
      time as Time,
    );
    const isDebilitated = BirthChartCalculator.isPlanetDebilitated(
      planet as PlanetName,
      time as Time,
    );
    const isOwnSign = BirthChartCalculator.isPlanetInOwnSign(
      planet as PlanetName,
      time as Time,
    );
    const category = BirthChartCalculator.getPlanetStrengthCategory(
      planet as PlanetName,
      time as Time,
    );

    res.json({
      success: true,
      data: {
        planet,
        isExalted,
        isDebilitated,
        isOwnSign,
        strengthCategory: category,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ HOUSE APIs ============

router.post("/house-lord", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const { house } = req.body;
    const lord = BirthChartCalculator.getHouseLord(
      house as HouseName,
      time as Time,
    );
    res.json({ success: true, data: { house, lord } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/planets-in-house", (req: Request, res: Response) => {
  try {
    const { house, ...time } = req.body;
    const planets = BirthChartCalculator.getPlanetsInHouse(
      house as HouseName,
      time as Time,
    );
    res.json({ success: true, data: { house, planets } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/planets-aspecting-house", (req: Request, res: Response) => {
  try {
    const { house, ...time } = req.body;
    const planets = BirthChartCalculator.getPlanetsAspectingHouse(
      house as HouseName,
      time as Time,
    );
    res.json({ success: true, data: { house, aspectingPlanets: planets } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
