import express, { Request, Response } from "express";
import { PanchangCalculator } from "../../core/PanchangCalculator";
import { AstroCalculator } from "../../core/AstroCalculator";
import { Time } from "../../types/interfaces";
import { TimeUtil } from "../../utils/TimeUtil";

const router = express.Router();

// ============ LOCAL PANCHANG APIs ============

router.post("/panchang", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const panchang = PanchangCalculator.getPanchang(time);
    res.json({ success: true, data: panchang });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/tithi", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const tithi = PanchangCalculator.getLunarDay(time);
    res.json({ success: true, data: tithi });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/nakshatra", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const nakshatra = PanchangCalculator.getMoonConstellation(time);
    res.json({ success: true, data: nakshatra });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/yoga", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const yoga = PanchangCalculator.getNithyaYoga(time);
    res.json({ success: true, data: yoga });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/karana", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const karana = PanchangCalculator.getKarana(time);
    res.json({ success: true, data: karana });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/sunrise-sunset", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const sunrise = AstroCalculator.getSunriseTime(time);
    const sunset = AstroCalculator.getSunsetTime(time);
    res.json({ success: true, data: { sunrise, sunset } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
