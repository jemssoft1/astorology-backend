
// src/core/AshtakavargaCalculator.ts
import { PlanetName, ZodiacName } from '../types/enums';
import { Time, Angle, ZodiacSign } from '../types/interfaces';
import { BirthChartCalculator } from './BirthChartCalculator';
import { AstroCalculator } from './AstroCalculator';

/**
 * Ashtakavarga Calculator
 * Implements the complete Ashtakavarga system for calculating benefic points
 */
export class AshtakavargaCalculator {
  
  // Traditional Vedic planets used in Ashtakavarga (7 planets, no Rahu/Ketu)
  private static readonly VEDIC_PLANETS: PlanetName[] = [
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.Mars,
    PlanetName.Mercury,
    PlanetName.Jupiter,
    PlanetName.Venus,
    PlanetName.Saturn
  ];

  // Zodiac signs in order
  private static readonly ZODIAC_SIGNS: ZodiacName[] = [
    ZodiacName.Aries,
    ZodiacName.Taurus,
    ZodiacName.Gemini,
    ZodiacName.Cancer,
    ZodiacName.Leo,
    ZodiacName.Virgo,
    ZodiacName.Libra,
    ZodiacName.Scorpio,
    ZodiacName.Sagittarius,
    ZodiacName.Capricorn,
    ZodiacName.Aquarius,
    ZodiacName.Pisces
  ];

  /**
   * Planet name mapping for lookup tables
   */
  private static getPlanetKey(planet: PlanetName): string {
    const keyMap: Record<PlanetName, string> = {
      [PlanetName.Sun]: 'sun',
      [PlanetName.Moon]: 'moon',
      [PlanetName.Mars]: 'mars',
      [PlanetName.Mercury]: 'mercury',
      [PlanetName.Jupiter]: 'jupiter',
      [PlanetName.Venus]: 'venus',
      [PlanetName.Saturn]: 'saturn',
      [PlanetName.Rahu]: 'rahu',
      [PlanetName.Ketu]: 'ketu',
      [PlanetName.Uranus]: 'uranus',
      [PlanetName.Neptune]: 'neptune',
      [PlanetName.Pluto]: 'pluto'
    };
    return keyMap[planet] || 'unknown';
  }

  /**
   * Benefic houses table
   */
  private static readonly BENEFIC_HOUSES_TABLE: Record<string, number[]> = {
    // SUN benefic positions
    'sun-sun': [1, 2, 4, 7, 8, 9, 10, 11],
    'sun-moon': [3, 6, 10, 11],
    'sun-mars': [1, 2, 4, 7, 8, 9, 10, 11],
    'sun-mercury': [3, 5, 6, 9, 10, 11, 12],
    'sun-jupiter': [5, 6, 9, 11],
    'sun-venus': [6, 7, 12],
    'sun-saturn': [1, 2, 4, 7, 8, 9, 10, 11],
    'sun-ascendant': [3, 4, 6, 10, 11, 12],

    // MOON benefic positions
    'moon-sun': [3, 6, 7, 8, 10, 11],
    'moon-moon': [1, 3, 6, 7, 10, 11],
    'moon-mars': [2, 3, 5, 6, 9, 10, 11],
    'moon-mercury': [1, 3, 4, 5, 7, 8, 10, 11],
    'moon-jupiter': [1, 4, 7, 8, 10, 11, 12],
    'moon-venus': [3, 4, 5, 7, 9, 10, 11],
    'moon-saturn': [3, 5, 6, 11],
    'moon-ascendant': [3, 6, 10, 11],

    // MARS benefic positions
    'mars-sun': [3, 5, 6, 10, 11],
    'mars-moon': [3, 6, 11],
    'mars-mars': [1, 2, 4, 7, 8, 10, 11],
    'mars-mercury': [3, 5, 6, 11],
    'mars-jupiter': [6, 10, 11, 12],
    'mars-venus': [6, 8, 11, 12],
    'mars-saturn': [1, 4, 7, 8, 9, 10, 11],
    'mars-ascendant': [1, 3, 6, 10, 11],

    // MERCURY benefic positions
    'mercury-sun': [5, 6, 9, 11, 12],
    'mercury-moon': [2, 4, 6, 8, 10, 11],
    'mercury-mars': [1, 2, 4, 7, 8, 9, 10, 11],
    'mercury-mercury': [1, 3, 5, 6, 9, 10, 11, 12],
    'mercury-jupiter': [6, 8, 11, 12],
    'mercury-venus': [1, 2, 3, 4, 5, 8, 9, 11],
    'mercury-saturn': [1, 2, 4, 7, 8, 9, 10, 11],
    'mercury-ascendant': [1, 2, 4, 6, 8, 10, 11],

    // JUPITER benefic positions
    'jupiter-sun': [1, 2, 3, 4, 7, 8, 9, 10, 11],
    'jupiter-moon': [2, 5, 7, 9, 11],
    'jupiter-mars': [1, 2, 4, 7, 8, 10, 11],
    'jupiter-mercury': [1, 2, 4, 5, 6, 9, 10, 11],
    'jupiter-jupiter': [1, 2, 3, 4, 7, 8, 10, 11],
    'jupiter-venus': [2, 5, 6, 9, 10, 11],
    'jupiter-saturn': [3, 5, 6, 12],
    'jupiter-ascendant': [1, 2, 4, 5, 6, 7, 9, 10, 11],

    // VENUS benefic positions
    'venus-sun': [8, 11, 12],
    'venus-moon': [1, 2, 3, 4, 5, 8, 9, 11, 12],
    'venus-mars': [3, 5, 6, 9, 11, 12],
    'venus-mercury': [3, 5, 6, 9, 11],
    'venus-jupiter': [5, 8, 9, 10, 11],
    'venus-venus': [1, 2, 3, 4, 5, 8, 9, 10, 11],
    'venus-saturn': [3, 4, 5, 8, 9, 10, 11],
    'venus-ascendant': [1, 2, 3, 4, 5, 8, 9, 11],

    // SATURN benefic positions
    'saturn-sun': [1, 2, 4, 7, 8, 10, 11],
    'saturn-moon': [3, 6, 11],
    'saturn-mars': [3, 5, 6, 10, 11, 12],
    'saturn-mercury': [6, 8, 9, 10, 11, 12],
    'saturn-jupiter': [5, 6, 11, 12],
    'saturn-venus': [6, 11, 12],
    'saturn-saturn': [3, 5, 6, 11],
    'saturn-ascendant': [1, 3, 4, 6, 10, 11]
  };

  /**
   * Get the sign a planet is in for a given birth time
   */
  private static getPlanetSign(planet: PlanetName, birthTime: Time): ZodiacName {
    const positions = BirthChartCalculator.getAllPlanetPositions(birthTime);
    const planetPos = positions.find(p => p.planet === planet);
    if (!planetPos) {
      throw new Error(`Could not find position for planet ${planet}`);
    }
    return planetPos.sign.name;
  }

  /**
   * Get the Lagna (Ascendant) sign for a given birth time
   */
  private static getLagnaSign(birthTime: Time): ZodiacName {
    const lagnaLongitude = AstroCalculator.getAscendantLongitude(birthTime);
    const lagna = AstroCalculator.getZodiacSignFromLongitude(lagnaLongitude);
    return lagna.name;
  }

  /**
   * Initialize empty chart with all signs set to 0
   */
  private static initializeChart(): Record<ZodiacName, number> {
    const chart: Record<ZodiacName, number> = {} as Record<ZodiacName, number>;
    for (const sign of this.ZODIAC_SIGNS) {
      chart[sign] = 0;
    }
    return chart;
  }

  /**
   * Check if planet is a traditional Vedic planet (used in Ashtakavarga)
   */
  private static isVedicPlanet(planet: PlanetName): boolean {
    return this.VEDIC_PLANETS.includes(planet);
  }

  /**
   * Calculate Bhinnashtakavarga for a specific planet
   */
  static calculateBhinnashtakavarga(planet: PlanetName, birthTime: Time): Record<ZodiacName, number> {
    const chart = this.initializeChart();

    // Only traditional 7 planets are used in Ashtakavarga
    if (!this.isVedicPlanet(planet)) {
      return chart;
    }

    const planetKey = this.getPlanetKey(planet);

    // Reference points: 7 planets + Ascendant
    type RefPoint = PlanetName | 'ascendant';
    const referencePoints: RefPoint[] = [...this.VEDIC_PLANETS, 'ascendant'];

    for (const refPoint of referencePoints) {
      let refSign: ZodiacName;
      let refKey: string;

      if (refPoint === 'ascendant') {
        refSign = this.getLagnaSign(birthTime);
        refKey = 'ascendant';
      } else {
        refSign = this.getPlanetSign(refPoint, birthTime);
        refKey = this.getPlanetKey(refPoint);
      }

      // Get benefic houses for this combination
      const tableKey = `${planetKey}-${refKey}`;
      const beneficHouses = this.BENEFIC_HOUSES_TABLE[tableKey];

      if (beneficHouses) {
        for (const houseNum of beneficHouses) {
          const beneficSign = this.getSignAtHouseDistance(refSign, houseNum);
          chart[beneficSign]++;
        }
      }
    }

    return chart;
  }

  /**
   * Calculate Sarvashtakavarga (combined Ashtakavarga)
   */
  static calculateSarvashtakavarga(birthTime: Time): Record<ZodiacName, number> {
    const chart = this.initializeChart();

    for (const planet of this.VEDIC_PLANETS) {
      const bhinnaChart = this.calculateBhinnashtakavarga(planet, birthTime);
      
      for (const sign of this.ZODIAC_SIGNS) {
        chart[sign] += bhinnaChart[sign];
      }
    }

    return chart;
  }

  /**
   * Get bindu points for a planet in a specific sign
   */
  static getBinduPoints(planet: PlanetName, sign: ZodiacName, birthTime: Time): number {
    const chart = this.calculateBhinnashtakavarga(planet, birthTime);
    return chart[sign];
  }

  /**
   * Calculate transit score using Ashtakavarga
   */
  static calculateTransitScore(planet: PlanetName, transitTime: Time, birthTime: Time): number {
    const transitSign = this.getPlanetSign(planet, transitTime);
    const binduPoints = this.getBinduPoints(planet, transitSign, birthTime);
    return binduPoints;
  }

  /**
   * Helper: Get sign at a specific house distance from a reference sign
   */
  private static getSignAtHouseDistance(fromSign: ZodiacName, houseNumber: number): ZodiacName {
    const startIndex = this.ZODIAC_SIGNS.indexOf(fromSign);
    const targetIndex = (startIndex + houseNumber - 1) % 12;
    return this.ZODIAC_SIGNS[targetIndex];
  }

  /**
   * Get detailed Ashtakavarga analysis for a planet
   */
  static getDetailedAnalysis(planet: PlanetName, birthTime: Time): {
    planet: PlanetName;
    currentSign: ZodiacName;
    currentBindu: number;
    allSigns: Record<ZodiacName, number>;
    strength: string;
    favorableSigns: string[];
    unfavorableSigns: string[];
  } {
    const chart = this.calculateBhinnashtakavarga(planet, birthTime);
    const planetSign = this.getPlanetSign(planet, birthTime);
    const currentBindu = chart[planetSign];

    return {
      planet,
      currentSign: planetSign,
      currentBindu,
      allSigns: chart,
      strength: currentBindu >= 5 ? 'Strong' : currentBindu >= 3 ? 'Moderate' : 'Weak',
      favorableSigns: Object.entries(chart)
        .filter(([_, points]) => points >= 5)
        .map(([sign]) => sign),
      unfavorableSigns: Object.entries(chart)
        .filter(([_, points]) => points <= 2)
        .map(([sign]) => sign)
    };
  }
}