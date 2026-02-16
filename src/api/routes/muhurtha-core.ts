import express, { Request, Response } from "express";
import { MuhurthaCalculator } from "../../core/MuhurthaCalculator";
import { AstroCalculator } from "../../core/AstroCalculator";
import { Time } from "../../types/interfaces";
import { TimeUtil } from "../../utils/TimeUtil";

const router = express.Router();

// ============ MUHURTHA APIs - TRAVEL ============

router.post("/muhurtha/travel/check", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const { person } = req.body;
    const score = MuhurthaCalculator.getTravelMuhurthaScore(time, person);
    const quality = MuhurthaCalculator.getActivityQuality(score);

    const details = {
      score,
      quality,
      lunarDay: {
        isGood: MuhurthaCalculator.isGoodLunarDayForTravel(time),
        isBad: MuhurthaCalculator.isBadLunarDayForTravel(time),
      },
      constellation: {
        isGood: MuhurthaCalculator.isGoodConstellationForTravel(time),
        isBad: MuhurthaCalculator.isBadConstellationForTravel(time),
      },
      lagna: {
        isGood: MuhurthaCalculator.isGoodLagnaForTravel(time),
        hasGoodPlanets: MuhurthaCalculator.hasGoodPlanetsInLagnaForTravel(time),
      },
    };

    res.json({ success: true, data: details });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/muhurtha/travel/direction", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const { direction } = req.body;
    let isBad = false;

    switch (direction.toLowerCase()) {
      case "east":
        isBad = MuhurthaCalculator.isBadWeekdayForTravelEast(time);
        break;
      case "south":
        isBad = MuhurthaCalculator.isBadWeekdayForTravelSouth(time);
        break;
      case "west":
        isBad = MuhurthaCalculator.isBadWeekdayForTravelWest(time);
        break;
      case "north":
        isBad = MuhurthaCalculator.isBadWeekdayForTravelNorth(time);
        break;
    }

    res.json({
      success: true,
      data: { direction, isBadWeekday: isBad, isGood: !isBad },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============ MUHURTHA APIs - MARRIAGE ============

router.post("/muhurtha/marriage/check", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const score = MuhurthaCalculator.getMarriageMuhurthaScore(time);
    const quality = MuhurthaCalculator.getActivityQuality(score);

    const details = {
      score,
      quality,
      lunarDay: {
        isGood: MuhurthaCalculator.isGoodLunarDayForMarriage(time),
        isBad: MuhurthaCalculator.isBadLunarDayForMarriage(time),
      },
      constellation: {
        isGood: MuhurthaCalculator.isGoodConstellationForMarriage(time),
        isBad: MuhurthaCalculator.isBadConstellationForMarriage(time),
      },
      isDayBirth: AstroCalculator.isDayBirth(time),
    };

    res.json({ success: true, data: details });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
