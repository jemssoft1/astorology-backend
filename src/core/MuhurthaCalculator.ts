import { Time, Person } from "../types/interfaces";
import {
  DayOfWeek,
  LunarDayGroup,
  ConstellationName,
  ZodiacName,
  HouseName,
  PlanetName,
} from "../types/enums";
import { PanchangCalculator } from "./PanchangCalculator";
import { AstroCalculator } from "./AstroCalculator";
import { BirthChartCalculator } from "./BirthChartCalculator";

/**
 * Muhurtha Calculator - Electional Astrology
 * Converted from C# Muhurtha.cs
 * For finding auspicious times for various activities
 */
export class MuhurthaCalculator {
  // ============ TRAVEL MUHURTHA ============

  /**
   * Good Lunar Days for Travel
   * From Muhurtha.cs GoodLunarDayForTravel()
   * Best lunar days: 2nd, 3rd, 5th, 7th, 10th, 11th, 13th
   */
  static isGoodLunarDayForTravel(time: Time): boolean {
    const lunarDay = PanchangCalculator.getLunarDay(time);
    const goodDays = [2, 3, 5, 7, 10, 11, 13];
    return goodDays.includes(lunarDay.number);
  }

  /**
   * Bad Lunar Days for Travel
   * From Muhurtha.cs BadLunarDayForTravel()
   * Avoid: 14th lunar day, Full Moon, New Moon
   */
  static isBadLunarDayForTravel(time: Time): boolean {
    const lunarDay = PanchangCalculator.getLunarDay(time);
    const badDays = [14, 15, 30]; // 14th, Full Moon (15), New Moon (30)
    return badDays.includes(lunarDay.number);
  }

  /**
   * Good Constellations for Travel
   * From Muhurtha.cs GoodConstellationForTravel()
   * Good: Mrigasira, Aswini, Pushya, Punarvasu, Hasta, Anuradha, Sravana, Moola, Dhanishta, Revati
   */
  static isGoodConstellationForTravel(time: Time): boolean {
    const constellation = PanchangCalculator.getMoonConstellation(time);
    const goodConstellations = [
      ConstellationName.Mrigasira,
      ConstellationName.Aswini,
      ConstellationName.Pushyami,
      ConstellationName.Punarvasu,
      ConstellationName.Hasta,
      ConstellationName.Anuradha,
      ConstellationName.Sravana,
      ConstellationName.Moola,
      ConstellationName.Dhanishta,
      ConstellationName.Revathi,
    ];
    return goodConstellations.includes(constellation.name);
  }

  /**
   * Bad Constellations for Travel
   * From Muhurtha.cs BadConstellationForTravel()
   * Avoid: Krithika, Bharani, Aslesha, Visakha, Pubba, Poorvabhadra, Aridra
   */
  static isBadConstellationForTravel(time: Time): boolean {
    const constellation = PanchangCalculator.getMoonConstellation(time);
    const badConstellations = [
      ConstellationName.Krithika,
      ConstellationName.Bharani,
      ConstellationName.Aslesha,
      ConstellationName.Vishhaka,
      ConstellationName.Pubba,
      ConstellationName.Poorvabhadra,
      ConstellationName.Aridra,
    ];
    return badConstellations.includes(constellation.name);
  }

  /**
   * Bad Weekday for Travel to East
   * From Muhurtha.cs BadWeekdayForTravelEast()
   * Avoid: Saturday and Monday
   */
  static isBadWeekdayForTravelEast(time: Time): boolean {
    const weekday = PanchangCalculator.getDayOfWeek(time);
    return weekday === DayOfWeek.Saturday || weekday === DayOfWeek.Monday;
  }

  /**
   * Bad Weekday for Travel to South
   * From Muhurtha.cs BadWeekdayForTravelSouth()
   * Avoid: Thursday
   */
  static isBadWeekdayForTravelSouth(time: Time): boolean {
    const weekday = PanchangCalculator.getDayOfWeek(time);
    return weekday === DayOfWeek.Thursday;
  }

  /**
   * Bad Weekday for Travel to West
   * From Muhurtha.cs BadWeekdayForTravelWest()
   * Avoid: Sunday and Friday
   */
  static isBadWeekdayForTravelWest(time: Time): boolean {
    const weekday = PanchangCalculator.getDayOfWeek(time);
    return weekday === DayOfWeek.Sunday || weekday === DayOfWeek.Friday;
  }

  /**
   * Bad Weekday for Travel to North
   * From Muhurtha.cs BadWeekdayForTravelNorth()
   * Avoid: Wednesday and Tuesday
   */
  static isBadWeekdayForTravelNorth(time: Time): boolean {
    const weekday = PanchangCalculator.getDayOfWeek(time);
    return weekday === DayOfWeek.Wednesday || weekday === DayOfWeek.Tuesday;
  }

  /**
   * Good Lagna for Travel
   * From Muhurtha.cs GoodLagnaForTravel()
   * Good: Aries, Taurus, Cancer, Leo, Libra, Sagittarius
   */
  static isGoodLagnaForTravel(time: Time): boolean {
    const lagna = AstroCalculator.getAscendantLongitude(time);
    const lagnaSign = AstroCalculator.getZodiacSignFromLongitude(lagna);
    const goodSigns = [
      ZodiacName.Aries,
      ZodiacName.Taurus,
      ZodiacName.Cancer,
      ZodiacName.Leo,
      ZodiacName.Libra,
      ZodiacName.Sagittarius,
    ];
    return goodSigns.includes(lagnaSign.name);
  }

  /**
   * Best Lagna for Travel
   * From Muhurtha.cs BestLagnaForTravel()
   * Best: Rising sign same as birth Moon sign (Janma Rasi)
   */
  static isBestLagnaForTravel(time: Time, person: Person): boolean {
    const lagna = AstroCalculator.getAscendantLongitude(time);
    const lagnaSign = AstroCalculator.getZodiacSignFromLongitude(lagna);

    const birthMoonSign = BirthChartCalculator.generateBirthChart(
      person.birthTime,
    ).moonSign;

    return lagnaSign.name === birthMoonSign.name;
  }

  /**
   * Worst Lagna for Travel
   * From Muhurtha.cs WorstLagnaForTravel()
   * Worst: Rising sign same as birth Lagna
   */
  static isWorstLagnaForTravel(time: Time, person: Person): boolean {
    const lagna = AstroCalculator.getAscendantLongitude(time);
    const lagnaSign = AstroCalculator.getZodiacSignFromLongitude(lagna);

    const birthLagna = BirthChartCalculator.generateBirthChart(
      person.birthTime,
    ).lagna;

    return lagnaSign.name === birthLagna.name;
  }

  /**
   * Bad Lagna for Travel
   * From Muhurtha.cs BadLagnaForTravel()
   * Bad: 5th, 7th, or 9th from birth Lagna
   */
  static isBadLagnaForTravel(time: Time, person: Person): boolean {
    const lagna = AstroCalculator.getAscendantLongitude(time);
    const lagnaSign = AstroCalculator.getZodiacSignFromLongitude(lagna);

    const birthLagna = BirthChartCalculator.generateBirthChart(
      person.birthTime,
    ).lagna;

    // Calculate house distance
    const distance = (lagnaSign.name - birthLagna.name + 12) % 12;

    return distance === 4 || distance === 6 || distance === 8; // 5th, 7th, 9th (0-indexed)
  }

  /**
   * Good Planets in Lagna for Travel
   * From Muhurtha.cs GoodPlanetsInLagnaForTravel()
   * Jupiter or Venus in Lagna makes journey successful
   */
  static hasGoodPlanetsInLagnaForTravel(time: Time): boolean {
    const chart = BirthChartCalculator.generateBirthChart(time);
    const planetsInLagna = BirthChartCalculator.getPlanetsInHouse(
      HouseName.House1,
      time,
    );

    return (
      planetsInLagna.includes(PlanetName.Jupiter) ||
      planetsInLagna.includes(PlanetName.Venus)
    );
  }

  // ============ MARRIAGE MUHURTHA ============

  /**
   * Good Lunar Days for Marriage
   * Best days: 2nd, 3rd, 5th, 7th, 10th, 11th, 13th
   */
  static isGoodLunarDayForMarriage(time: Time): boolean {
    const lunarDay = PanchangCalculator.getLunarDay(time);
    const goodDays = [2, 3, 5, 7, 10, 11, 13];
    return goodDays.includes(lunarDay.number);
  }

  /**
   * Bad Lunar Days for Marriage
   * Avoid: 4th, 6th, 8th, 9th, 12th, 14th, New Moon, Full Moon
   */
  static isBadLunarDayForMarriage(time: Time): boolean {
    const lunarDay = PanchangCalculator.getLunarDay(time);
    const badDays = [4, 6, 8, 9, 12, 14, 15, 30];
    return badDays.includes(lunarDay.number);
  }

  /**
   * Good Constellations for Marriage
   * Good: Rohini, Uttara, Hasta, Swathi, Anuradha, Mrigasira, Moola, Revati
   */
  static isGoodConstellationForMarriage(time: Time): boolean {
    const constellation = PanchangCalculator.getMoonConstellation(time);
    const goodConstellations = [
      ConstellationName.Rohini,
      ConstellationName.Uttara,
      ConstellationName.Hasta,
      ConstellationName.Swathi,
      ConstellationName.Anuradha,
      ConstellationName.Mrigasira,
      ConstellationName.Moola,
      ConstellationName.Revathi,
    ];
    return goodConstellations.includes(constellation.name);
  }

  /**
   * Bad Constellations for Marriage
   * Avoid: Bharani, Krithika, Aslesha, Makha, Jyesta, Moola (in some traditions)
   */
  static isBadConstellationForMarriage(time: Time): boolean {
    const constellation = PanchangCalculator.getMoonConstellation(time);
    const badConstellations = [
      ConstellationName.Bharani,
      ConstellationName.Krithika,
      ConstellationName.Aslesha,
      ConstellationName.Makha,
      ConstellationName.Jyesta,
    ];
    return badConstellations.includes(constellation.name);
  }

  // ============ GENERAL MUHURTHA ============

  /**
   * Comprehensive Travel Muhurtha Check
   * Returns score from 0-100
   */
  static getTravelMuhurthaScore(time: Time, person?: Person): number {
    let score = 50; // Start with neutral score

    // Lunar Day (20 points)
    if (this.isGoodLunarDayForTravel(time)) score += 20;
    if (this.isBadLunarDayForTravel(time)) score -= 20;

    // Constellation (20 points)
    if (this.isGoodConstellationForTravel(time)) score += 20;
    if (this.isBadConstellationForTravel(time)) score -= 20;

    // Lagna (20 points)
    if (this.isGoodLagnaForTravel(time)) score += 20;

    // Planets in Lagna (20 points)
    if (this.hasGoodPlanetsInLagnaForTravel(time)) score += 20;

    // Personal factors if person provided (20 points)
    if (person) {
      if (this.isBestLagnaForTravel(time, person)) score += 20;
      if (this.isWorstLagnaForTravel(time, person)) score -= 30;
      if (this.isBadLagnaForTravel(time, person)) score -= 15;
    }

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Comprehensive Marriage Muhurtha Check
   * Returns score from 0-100
   */
  static getMarriageMuhurthaScore(time: Time): number {
    let score = 50;

    if (this.isGoodLunarDayForMarriage(time)) score += 25;
    if (this.isBadLunarDayForMarriage(time)) score -= 25;

    if (this.isGoodConstellationForMarriage(time)) score += 25;
    if (this.isBadConstellationForMarriage(time)) score -= 25;

    // Check if day birth (preferred for marriage)
    if (AstroCalculator.isDayBirth(time)) score += 25;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get best time for activity
   * Returns quality rating: Excellent, Good, Average, Poor, Bad
   */
  static getActivityQuality(score: number): string {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    if (score >= 20) return "Poor";
    return "Bad";
  }
}
