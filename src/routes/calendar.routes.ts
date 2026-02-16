import { Router } from "express";
import { CalendarController } from "../controllers/CalendarController";

const router = Router();

/**
 * Calendar Routes
 * Base path: /api/calendar
 */

/**
 * @route   GET /api/calendar
 * @desc    Get month calendar (current month by default)
 * @query   month - Month number (1-12), optional
 * @query   year - Year (e.g., 2026), optional
 * @access  Public
 * @example GET /api/calendar
 * @example GET /api/calendar?month=2&year=2026
 */
router.get("/", CalendarController.getMonthCalendar);

/**
 * @route   GET /api/calendar/previous
 * @desc    Get previous month calendar
 * @query   month - Current month number (1-12), optional
 * @query   year - Current year, optional
 * @access  Public
 * @example GET /api/calendar/previous
 * @example GET /api/calendar/previous?month=2&year=2026
 */
router.get("/previous", CalendarController.getPreviousMonth);

/**
 * @route   GET /api/calendar/next
 * @desc    Get next month calendar
 * @query   month - Current month number (1-12), optional
 * @query   year - Current year, optional
 * @access  Public
 * @example GET /api/calendar/next
 * @example GET /api/calendar/next?month=2&year=2026
 */
router.get("/next", CalendarController.getNextMonth);

export default router;
