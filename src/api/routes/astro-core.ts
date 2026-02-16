import express, { Request, Response } from "express";
import { AstroCalculator } from "../../core/AstroCalculator";
import { BirthChartCalculator } from "../../core/BirthChartCalculator";
import { TimeUtil } from "../../utils/TimeUtil";
import { Time } from "../../types/interfaces";
import { PlanetName, ZodiacName } from "../../types/enums";

const router = express.Router();

// ============ BIRTH CHART APIs ============

router.post("/birth-chart", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body);
    const chart = BirthChartCalculator.generateBirthChart(time);
    res.json({ success: true, data: chart });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/planets", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body);
    const planets = BirthChartCalculator.getAllPlanetPositions(time);
    res.json({ success: true, data: planets });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/houses", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body);
    const houses = AstroCalculator.getAllHouses(time);
    res.json({ success: true, data: houses });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/ascendant", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body);
    const ascendant = AstroCalculator.getAscendantLongitude(time);
    const sign = AstroCalculator.getZodiacSignFromLongitude(ascendant);
    res.json({ success: true, data: { longitude: ascendant, sign } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ NEW CORE APIs ============

router.post("/planet-in-watery-sign", (req: Request, res: Response) => {
  try {
    const { planet, ...time } = req.body;
    const isWatery = AstroCalculator.isPlanetInWaterySign(
      planet as PlanetName,
      time as Time,
    );
    res.json({ success: true, data: { planet, isWatery } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/day-night-birth", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body);
    const isDayBirth = AstroCalculator.isDayBirth(time);
    const isNightBirth = AstroCalculator.isNightBirth(time);
    const dayDuration = AstroCalculator.dayDurationHours(time);
    res.json({
      success: true,
      data: { isDayBirth, isNightBirth, dayDurationHours: dayDuration },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/planet-ownership", (req: Request, res: Response) => {
  try {
    const { planet, ...time } = req.body;
    const signsOwned = AstroCalculator.getZodiacSignsOwnedByPlanet(
      planet as PlanetName,
    );
    const housesOwned = AstroCalculator.getHousesOwnedByPlanet(
      planet as PlanetName,
      time as Time,
    );
    res.json({ success: true, data: { planet, signsOwned, housesOwned } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/sign-lord", (req: Request, res: Response) => {
  try {
    const { sign } = req.body;
    const lord = AstroCalculator.getLordOfSign(sign as ZodiacName);
    res.json({ success: true, data: { sign, lord } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
