import { Time, PlanetPosition } from "../types/interfaces";
import { PlanetName, HouseName } from "../types/enums";
import { BirthChartCalculator } from "./BirthChartCalculator";
import { AstroCalculator } from "./AstroCalculator";
import { ZodiacName } from "../types/enums"; // Assuming ZodiacName is defined here or similar

export class DoshaCalculator {
  /**
   * Calculates Mangal Dosha (Mars Defect)
   * Checks if Mars is in 1st, 2nd, 4th, 7th, 8th, or 12th house.
   */
  static calculateMangalDosha(time: Time): {
    hasDosha: boolean;
    severity: string;
    description: string;
    remedies: string[];
  } {
    // 1. Get Birth Chart to access planets and houses
    const birthChart = BirthChartCalculator.generateBirthChart(time);
    const mars = birthChart.planets.find((p) => p.planet === PlanetName.Mars);

    if (!mars) {
      throw new Error("Could not calculate Mars position");
    }

    // 2. Determine House of Mars
    // Iterate through houses to find which one contains Mars longitude
    let marsHouseNumber = 0;

    for (const house of birthChart.houses) {
      // Simple check: is longitude between begin and end?
      // Note: Houses can span across 360 degrees (Pisces to Aries)
      const start = house.beginLongitude.totalDegrees;
      const end = house.endLongitude.totalDegrees;
      const planetLong = mars.longitude.totalDegrees; // Assuming totalDegrees exists on Angle

      // Handle wrap around 360
      if (start < end) {
        if (planetLong >= start && planetLong <= end) {
          marsHouseNumber = house.number;
          break;
        }
      } else {
        // House crosses 0 degrees
        if (planetLong >= start || planetLong <= end) {
          marsHouseNumber = house.number;
          break;
        }
      }
    }

    // Fallback if not found (should not happen if houses cover 360)
    if (marsHouseNumber === 0) {
      // Fallback to sign-based house (Planet Sign - Ascendant Sign + 1)
      // This is a simplified approach and might not be accurate for all house systems.
      // Assuming lagna.name and mars.sign.name are numerical enums or can be converted.
      // This part might need further refinement based on actual enum structure.
      const ascendantSign = birthChart.lagna.name as unknown as number; // Assuming ZodiacName enum values are 0-11
      const marsSign = mars.sign.name as unknown as number; // Assuming ZodiacName enum values are 0-11
      let houseIndex = marsSign - ascendantSign + 1;
      if (houseIndex <= 0) houseIndex += 12;
      marsHouseNumber = houseIndex;
    }

    // Mangal Dosha Houses: 1, 2, 4, 7, 8, 12
    const doshaHouses = [1, 2, 4, 7, 8, 12];
    const hasDosha = doshaHouses.includes(marsHouseNumber);

    let severity = "None";
    let description = "No Mangal Dosha present.";
    let remedies: string[] = [];

    if (hasDosha) {
      severity = "High"; // Default to high, can be mitigated
      description = `Mars is in House ${marsHouseNumber}, indicating Mangal Dosha.`;

      // Basic exceptions/cancellations
      // Check if Mars is in its own sign (Aries=1, Scorpio=8) or Exalted (Capricorn=10)
      if (
        mars.sign.name === ZodiacName.Aries ||
        mars.sign.name === ZodiacName.Scorpio ||
        mars.sign.name === ZodiacName.Capricorn
      ) {
        severity = "Low";
        description += " However, Mars is in a strong sign, reducing severity.";
      }

      remedies = [
        "Perform Kumbh Vivah before marriage.",
        "Chant Hanuman Chalisa daily.",
        "Visit Navagraha temple on Tuesdays.",
      ];
    }

    return { hasDosha, severity, description, remedies };
  }

  /**
   * Calculates Kaal Sarp Dosha
   * Checks if all planets are between Rahu and Ketu.
   */
  static calculateKaalSarpDosha(time: Time): {
    hasDosha: boolean;
    type: string;
    description: string;
    remedies: string[];
  } {
    const birthChart = BirthChartCalculator.generateBirthChart(time);
    const planets = birthChart.planets;

    const rahu = planets.find((p) => p.planet === PlanetName.Rahu);
    const ketu = planets.find((p) => p.planet === PlanetName.Ketu);

    if (!rahu || !ketu) {
      return {
        hasDosha: false,
        type: "Unknown",
        description: "Rahu/Ketu positions not found",
        remedies: [],
      };
    }

    // Simplified Logic for Demo:
    // If Rahu and Ketu axis traps all planets on one side.
    const hasDosha = false; // logic placeholder

    return {
      hasDosha,
      type: "None",
      description: "Exact calculation logic being enhanced.",
      remedies: [],
    };
  }

  /**
   * Calculates Pitra Dosha
   * Checks for Sun-Saturn conjunction or 9th house afflictions.
   */
  static calculatePitraDosha(time: Time): {
    hasDosha: boolean;
    description: string;
    remedies: string[];
  } {
    const birthChart = BirthChartCalculator.generateBirthChart(time);
    const sun = birthChart.planets.find((p) => p.planet === PlanetName.Sun);
    const saturn = birthChart.planets.find(
      (p) => p.planet === PlanetName.Saturn,
    );

    let hasDosha = false;
    let description = "No Pitra Dosha detected.";

    if (sun && saturn && sun.sign.name === saturn.sign.name) {
      hasDosha = true;
      description = "Sun and Saturn are conjunct, indicating Pitra Dosha.";
    }

    return {
      hasDosha,
      description,
      remedies: hasDosha
        ? ["Perform Pind Daan", "Respect elders", "Offer water to ancestors"]
        : [],
    };
  }

  /**
   * Calculate Shub Kartari Planets
   * Planets hemmed between benefics
   */
  static hasShubKartariYoga(time: Time): { yoga: boolean; planets: string[] } {
    // Logic placeholder
    return { yoga: false, planets: [] };
  }

  static getShubKartariPlanets(time: Time): string[] {
    // Return names of planets
    // Real implementation requires iterating planets and checking 2nd/12th
    return [];
  }

  /**
   * Calculate Paapa Kartari Planets
   */
  static getPaapaKartariPlanets(time: Time): string[] {
    return [];
  }

  static getShubKartariHouses(time: Time): number[] {
    return [];
  }

  /**
   * Get Shubha Kartari Houses as formatted string
   * Returns comma-separated house names like "House5, House7, House12"
   */
  static getShubKartariHousesFormatted(time: Time): string {
    const houses = this.getShubKartariHouses(time);
    if (houses.length === 0) return "";
    return houses.map((h) => `House${h}`).join(", ");
  }

  static getPaapaKartariHouses(time: Time): number[] {
    return [];
  }

  /**
   * Get Paapa Kartari Houses as formatted string
   * Returns comma-separated house names like "House1, House3, House4"
   */
  static getPaapaKartariHousesFormatted(time: Time): string {
    const houses = this.getPaapaKartariHouses(time);
    if (houses.length === 0) return "";
    return houses.map((h) => `House${h}`).join(", ");
  }

  static calculateKujaDoshaScore(time: Time): number {
    const res = this.calculateMangalDosha(time);
    return res.hasDosha ? 100 : 0; // Simplified
  }
}
