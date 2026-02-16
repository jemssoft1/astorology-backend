import { Request, Response } from "express";
import { generateMonthCalendar } from "../utils/calendarUtils";

/**
 * Calendar Controller
 * Handles all calendar-related API requests
 */
export class CalendarController {
  /**
   * Get month calendar
   * GET /api/calendar?month=2&year=2026
   */
  static getMonthCalendar(req: Request, res: Response): void {
    try {
      // Extract query parameters
      const monthParam = req.query.month as string | undefined;
      const yearParam = req.query.year as string | undefined;

      // Parse and validate month
      let month: number | undefined;
      if (monthParam) {
        month = parseInt(monthParam, 10);
        if (isNaN(month) || month < 1 || month > 12) {
          res.status(400).json({
            success: false,
            error: "Invalid month. Must be between 1 and 12.",
          });
          return;
        }
      }

      // Parse and validate year
      let year: number | undefined;
      if (yearParam) {
        year = parseInt(yearParam, 10);
        if (isNaN(year) || year < 1900 || year > 2100) {
          res.status(400).json({
            success: false,
            error: "Invalid year. Must be between 1900 and 2100.",
          });
          return;
        }
      }

      // Generate calendar
      const calendar = generateMonthCalendar(month, year);

      // Send response
      res.status(200).json({
        success: true,
        data: calendar,
      });
    } catch (error) {
      console.error("Error generating calendar:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while generating calendar.",
      });
    }
  }

  /**
   * Get previous month calendar
   * GET /api/calendar/previous?month=2&year=2026
   */
  static getPreviousMonth(req: Request, res: Response): void {
    try {
      const monthParam = req.query.month as string | undefined;
      const yearParam = req.query.year as string | undefined;

      let month = monthParam
        ? parseInt(monthParam, 10)
        : new Date().getMonth() + 1;
      let year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

      // Calculate previous month
      if (month === 1) {
        month = 12;
        year -= 1;
      } else {
        month -= 1;
      }

      const calendar = generateMonthCalendar(month, year);

      res.status(200).json({
        success: true,
        data: calendar,
      });
    } catch (error) {
      console.error("Error generating previous month:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error.",
      });
    }
  }

  /**
   * Get next month calendar
   * GET /api/calendar/next?month=2&year=2026
   */
  static getNextMonth(req: Request, res: Response): void {
    try {
      const monthParam = req.query.month as string | undefined;
      const yearParam = req.query.year as string | undefined;

      let month = monthParam
        ? parseInt(monthParam, 10)
        : new Date().getMonth() + 1;
      let year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

      // Calculate next month
      if (month === 12) {
        month = 1;
        year += 1;
      } else {
        month += 1;
      }

      const calendar = generateMonthCalendar(month, year);

      res.status(200).json({
        success: true,
        data: calendar,
      });
    } catch (error) {
      console.error("Error generating next month:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error.",
      });
    }
  }
}
