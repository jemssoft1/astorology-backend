import { BaseCalculator, CalculatorInput } from "./BaseCalculator";
import { BirthChartCalculator } from "./BirthChartCalculator";

export class KartariCalculator extends BaseCalculator {
  /**
   * Helper: Get house number for a planet
   */
  private static getPlanetHouseNumber(planet: any, houses: any[]): number {
    // Find which house the planet is in by matching sign
    for (let i = 0; i < houses.length; i++) {
      if (planet.sign.name === houses[i].sign.name) {
        return i + 1; // House numbers are 1-indexed
      }
    }
    return 1; // Default to first house if not found
  }

  /**
   * Get planets with Shubh Kartari Yoga
   */
  static async getShubKartariPlanets(input: CalculatorInput): Promise<any> {
    // Convert CalculatorInput to Time format
    const time = {
      year: input.datetime.year,
      month: input.datetime.month,
      day: input.datetime.day,
      hour: input.datetime.hour,
      minute: input.datetime.minute,
      second: input.datetime.second || 0,
      location: {
        name: input.location.name || "",
        latitude: input.location.latitude || 0,
        longitude: input.location.longitude || 0,
        timezone: input.datetime.timezone || "+00:00",
      },
    };

    const chart = BirthChartCalculator.generateBirthChart(time);
    const planets = chart.planets;
    const houses = chart.houses;
    const shubhKartariPlanets: any[] = [];

    // Benefic planets
    const benefics = ["Jupiter", "Venus", "Mercury", "Moon"];

    for (const planet of planets) {
      const houseNum = this.getPlanetHouseNumber(planet, houses);
      const prevHouse = houseNum === 1 ? 12 : houseNum - 1;
      const nextHouse = houseNum === 12 ? 1 : houseNum + 1;

      // Get planets in adjacent houses
      const prevHousePlanets = planets.filter(
        (p: any) => this.getPlanetHouseNumber(p, houses) === prevHouse,
      );
      const nextHousePlanets = planets.filter(
        (p: any) => this.getPlanetHouseNumber(p, houses) === nextHouse,
      );

      // Check if surrounded by benefics
      const prevHasBenefic = prevHousePlanets.some((p: any) =>
        benefics.includes(p.planet),
      );
      const nextHasBenefic = nextHousePlanets.some((p: any) =>
        benefics.includes(p.planet),
      );

      if (prevHasBenefic && nextHasBenefic) {
        shubhKartariPlanets.push({
          planet: planet.planet,
          house: houseNum,
          prevHouseBenefics: prevHousePlanets
            .filter((p: any) => benefics.includes(p.planet))
            .map((p: any) => p.planet),
          nextHouseBenefics: nextHousePlanets
            .filter((p: any) => benefics.includes(p.planet))
            .map((p: any) => p.planet),
        });
      }
    }

    return shubhKartariPlanets;
  }

  /**
   * Get planets with Paapa Kartari Yoga
   */
  static async getPaapaKartariPlanets(input: CalculatorInput): Promise<any> {
    const time = {
      year: input.datetime.year,
      month: input.datetime.month,
      day: input.datetime.day,
      hour: input.datetime.hour,
      minute: input.datetime.minute,
      second: input.datetime.second || 0,
      location: {
        name: input.location.name || "",
        latitude: input.location.latitude || 0,
        longitude: input.location.longitude || 0,
        timezone: input.datetime.timezone || "+00:00",
      },
    };
    const chart = BirthChartCalculator.generateBirthChart(time);
    const planets = chart.planets;
    const houses = chart.houses;
    const paapaKartariPlanets: any[] = [];

    // Malefic planets
    const malefics = ["Saturn", "Mars", "Rahu", "Ketu", "Sun"];

    for (const planet of planets) {
      const houseNum = this.getPlanetHouseNumber(planet, houses);
      const prevHouse = houseNum === 1 ? 12 : houseNum - 1;
      const nextHouse = houseNum === 12 ? 1 : houseNum + 1;

      const prevHousePlanets = planets.filter(
        (p: any) => this.getPlanetHouseNumber(p, houses) === prevHouse,
      );
      const nextHousePlanets = planets.filter(
        (p: any) => this.getPlanetHouseNumber(p, houses) === nextHouse,
      );

      const prevHasMalefic = prevHousePlanets.some((p: any) =>
        malefics.includes(p.planet),
      );
      const nextHasMalefic = nextHousePlanets.some((p: any) =>
        malefics.includes(p.planet),
      );

      if (prevHasMalefic && nextHasMalefic) {
        paapaKartariPlanets.push({
          planet: planet.planet,
          house: houseNum,
          prevHouseMalefics: prevHousePlanets
            .filter((p: any) => malefics.includes(p.planet))
            .map((p: any) => p.planet),
          nextHouseMalefics: nextHousePlanets
            .filter((p: any) => malefics.includes(p.planet))
            .map((p: any) => p.planet),
        });
      }
    }

    return paapaKartariPlanets;
  }

  /**
   * Get houses with Shubh Kartari Yoga
   */
  static async getShubKartariHouses(input: CalculatorInput): Promise<any> {
    const time = {
      year: input.datetime.year,
      month: input.datetime.month,
      day: input.datetime.day,
      hour: input.datetime.hour,
      minute: input.datetime.minute,
      second: input.datetime.second || 0,
      location: {
        name: input.location.name || "",
        latitude: input.location.latitude || 0,
        longitude: input.location.longitude || 0,
        timezone: input.datetime.timezone || "+00:00",
      },
    };
    const chart = BirthChartCalculator.generateBirthChart(time);
    const planets = chart.planets;
    const houses = chart.houses;
    const shubhKartariHouses: any[] = [];

    const benefics = ["Jupiter", "Venus", "Mercury", "Moon"];

    for (let house = 1; house <= 12; house++) {
      const prevHouse = house === 1 ? 12 : house - 1;
      const nextHouse = house === 12 ? 1 : house + 1;

      const prevHousePlanets = planets.filter(
        (p: any) => this.getPlanetHouseNumber(p, houses) === prevHouse,
      );
      const nextHousePlanets = planets.filter(
        (p: any) => this.getPlanetHouseNumber(p, houses) === nextHouse,
      );

      const prevHasBenefic = prevHousePlanets.some((p: any) =>
        benefics.includes(p.planet),
      );
      const nextHasBenefic = nextHousePlanets.some((p: any) =>
        benefics.includes(p.planet),
      );

      if (prevHasBenefic && nextHasBenefic) {
        shubhKartariHouses.push({
          house: house,
          prevHouseBenefics: prevHousePlanets
            .filter((p: any) => benefics.includes(p.planet))
            .map((p: any) => p.planet),
          nextHouseBenefics: nextHousePlanets
            .filter((p: any) => benefics.includes(p.planet))
            .map((p: any) => p.planet),
        });
      }
    }

    return shubhKartariHouses;
  }

  /**
   * Get houses with Paapa Kartari Yoga
   */
  static async getPaapaKartariHouses(input: CalculatorInput): Promise<any> {
    const time = {
      year: input.datetime.year,
      month: input.datetime.month,
      day: input.datetime.day,
      hour: input.datetime.hour,
      minute: input.datetime.minute,
      second: input.datetime.second || 0,
      location: {
        name: input.location.name || "",
        latitude: input.location.latitude || 0,
        longitude: input.location.longitude || 0,
        timezone: input.datetime.timezone || "+00:00",
      },
    };
    const chart = BirthChartCalculator.generateBirthChart(time);
    const planets = chart.planets;
    const houses = chart.houses;
    const paapaKartariHouses: any[] = [];

    const malefics = ["Saturn", "Mars", "Rahu", "Ketu", "Sun"];

    for (let house = 1; house <= 12; house++) {
      const prevHouse = house === 1 ? 12 : house - 1;
      const nextHouse = house === 12 ? 1 : house + 1;

      const prevHousePlanets = planets.filter(
        (p: any) => this.getPlanetHouseNumber(p, houses) === prevHouse,
      );
      const nextHousePlanets = planets.filter(
        (p: any) => this.getPlanetHouseNumber(p, houses) === nextHouse,
      );

      const prevHasMalefic = prevHousePlanets.some((p: any) =>
        malefics.includes(p.planet),
      );
      const nextHasMalefic = nextHousePlanets.some((p: any) =>
        malefics.includes(p.planet),
      );

      if (prevHasMalefic && nextHasMalefic) {
        paapaKartariHouses.push({
          house: house,
          prevHouseMalefics: prevHousePlanets
            .filter((p: any) => malefics.includes(p.planet))
            .map((p: any) => p.planet),
          nextHouseMalefics: nextHousePlanets
            .filter((p: any) => malefics.includes(p.planet))
            .map((p: any) => p.planet),
        });
      }
    }

    return paapaKartariHouses;
  }
}
