import express, { Request, Response } from "express";
import { PanchangCalculator } from "../../core/PanchangCalculator";
import { TimeUtil } from "../../utils/TimeUtil";
import { Time } from "../../types/interfaces";

const router = express.Router();

// ============ COMPATIBILITY APIs ============

router.post("/tarabala", (req: Request, res: Response) => {
  try {
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);
    const { person } = req.body;
    const tarabala = PanchangCalculator.getTabala(time, person);
    res.json({ success: true, data: tarabala });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/chandrabala", (req: Request, res: Response) => {
  try {
    const { time, person } = req.body;
    const chandrabala = PanchangCalculator.getChandrabala(time, person);
    res.json({ success: true, data: chandrabala });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
