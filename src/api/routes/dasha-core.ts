import express, { Request, Response } from "express";
import { DashaCalculator } from "../../core/DashaCalculator";
import { Time } from "../../types/interfaces";
import { TimeUtil } from "../../utils/TimeUtil";

const router = express.Router();

// ============ DASHA APIs ============

router.post("/dasha", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const mahadashas = DashaCalculator.calculateMahadashas(time);
    res.json({ success: true, data: mahadashas });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/current-dasha", (req: Request, res: Response) => {
  try {
    const birthTime = TimeUtil.normalizeTime(req.body.birthTime || req.body);
    const currentTime = TimeUtil.normalizeTime(
      req.body.currentTime || {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: 0,
        minute: 0,
        second: 0,
        location: birthTime.location,
      },
    );

    const currentMahadasha = DashaCalculator.getCurrentMahadasha(
      birthTime,
      currentTime,
    );
    const currentAntardasha = DashaCalculator.getCurrentAntardasha(
      birthTime,
      currentTime,
    );
    res.json({
      success: true,
      data: { mahadasha: currentMahadasha, antardasha: currentAntardasha },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/dasha-balance", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const balance = DashaCalculator.getBalanceOfBirthDasha(time);
    res.json({ success: true, data: balance });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
