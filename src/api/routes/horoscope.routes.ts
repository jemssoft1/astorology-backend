import { Router } from "express";
import { check } from "express-validator";
import { HoroscopeController } from "../../controllers/HoroscopeController";

const router = Router();

router.post(
  "/generate-horoscope",
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("day").isInt({ min: 1, max: 31 }).withMessage("Day must be between 1 and 31"),
    check("month").isInt({ min: 1, max: 12 }).withMessage("Month must be between 1 and 12"),
    check("year").isInt().withMessage("Year is required"),
    check("hour").isInt({ min: 0, max: 23 }).withMessage("Hour must be between 0 and 23"),
    check("minute").isInt({ min: 0, max: 59 }).withMessage("Minute must be between 0 and 59"),
    check("latitude").isFloat().withMessage("Latitude must be a valid float"),
    check("longitude").isFloat().withMessage("Longitude must be a valid float"),
    check("timezone").isFloat().withMessage("Timezone must be a valid float"),
    check("language").isIn(["en", "hi", "ma", "bn", "ta", "te", "kn", "ml"]).withMessage("Invalid language"),
    check("place").notEmpty().withMessage("Place is required"),
    check("company_info").isLength({ max: 500 }).withMessage("Company info must be less than 500 characters"),
    check("company_email").isEmail().withMessage("Invalid company email"),
    check("footer_link").notEmpty().withMessage("Footer link is required"),
    check("logo_url").optional().isURL().withMessage("Logo URL must be valid"),
    check("company_name").notEmpty().withMessage("Company name is required"),
    check("domain_url").isURL().withMessage("Domain URL must be valid"),
    check("company_landline").notEmpty().withMessage("Company landline is required"),
    check("company_mobile").notEmpty().withMessage("Company mobile is required")
  ],
  HoroscopeController.generateHoroscope
);

router.post(
  "/horoscope/mini-pdf",
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("day").isInt({ min: 1, max: 31 }),
    check("month").isInt({ min: 1, max: 12 }),
    check("year").isInt(),
    check("hour").isInt({ min: 0, max: 23 }),
    check("min").isInt({ min: 0, max: 59 }),
    check("lat").isFloat(),
    check("lon").isFloat(),
    check("tzone").isFloat(),
    check("place").notEmpty(),
    check("chart_style").isIn(["NORTH_INDIAN", "SOUTH_INDIAN", "EAST_INDIAN"]).optional(),
    check("footer_link").notEmpty(),
    check("logo_url").optional().isURL(),
    check("company_name").notEmpty(),
    check("domain_url").isURL(),
    check("company_mobile").notEmpty()
  ],
  (req, res) => {
      const controller = new HoroscopeController();
      controller.generateMiniHoroscope(req, res);
  }
);

export default router;
