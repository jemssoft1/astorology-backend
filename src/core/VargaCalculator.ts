// src/core/VargaCalculator.ts
import { ZodiacName, PlanetName } from "../types/enums";
import { Time, ZodiacSign, Angle, PlanetPosition } from "../types/interfaces";
import { BirthChartCalculator } from "./BirthChartCalculator";
import { AstroCalculator } from "./AstroCalculator";

/**
 * Varga (Divisional Charts) Calculator
 */
export class VargaCalculator {
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
    ZodiacName.Pisces,
  ];

  /**
   * Create an Angle from total degrees
   */
  private static createAngle(totalDegrees: number): Angle {
    const degrees = Math.floor(totalDegrees);
    const minutesFloat = (totalDegrees - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = Math.round((minutesFloat - minutes) * 60);

    return {
      degrees,
      minutes,
      seconds,
      totalDegrees,
    };
  }

  /**
   * D2 - Hora Chart (Wealth)
   */
  private static readonly HORA_TABLE: Record<
    ZodiacName,
    Array<[number, number, ZodiacName]>
  > = {
    [ZodiacName.Aries]: [
      [0, 15, ZodiacName.Leo],
      [15, 30, ZodiacName.Cancer],
    ],
    [ZodiacName.Taurus]: [
      [0, 15, ZodiacName.Cancer],
      [15, 30, ZodiacName.Leo],
    ],
    [ZodiacName.Gemini]: [
      [0, 15, ZodiacName.Leo],
      [15, 30, ZodiacName.Cancer],
    ],
    [ZodiacName.Cancer]: [
      [0, 15, ZodiacName.Cancer],
      [15, 30, ZodiacName.Leo],
    ],
    [ZodiacName.Leo]: [
      [0, 15, ZodiacName.Leo],
      [15, 30, ZodiacName.Cancer],
    ],
    [ZodiacName.Virgo]: [
      [0, 15, ZodiacName.Cancer],
      [15, 30, ZodiacName.Leo],
    ],
    [ZodiacName.Libra]: [
      [0, 15, ZodiacName.Leo],
      [15, 30, ZodiacName.Cancer],
    ],
    [ZodiacName.Scorpio]: [
      [0, 15, ZodiacName.Cancer],
      [15, 30, ZodiacName.Leo],
    ],
    [ZodiacName.Sagittarius]: [
      [0, 15, ZodiacName.Leo],
      [15, 30, ZodiacName.Cancer],
    ],
    [ZodiacName.Capricorn]: [
      [0, 15, ZodiacName.Cancer],
      [15, 30, ZodiacName.Leo],
    ],
    [ZodiacName.Aquarius]: [
      [0, 15, ZodiacName.Leo],
      [15, 30, ZodiacName.Cancer],
    ],
    [ZodiacName.Pisces]: [
      [0, 15, ZodiacName.Cancer],
      [15, 30, ZodiacName.Leo],
    ],
  };

  /**
   * D3 - Drekkana Chart (Siblings, Courage)
   */
  private static readonly DREKKANA_TABLE: Record<
    ZodiacName,
    Array<[number, number, ZodiacName]>
  > = {
    [ZodiacName.Aries]: [
      [0, 10, ZodiacName.Aries],
      [10, 20, ZodiacName.Leo],
      [20, 30, ZodiacName.Sagittarius],
    ],
    [ZodiacName.Taurus]: [
      [0, 10, ZodiacName.Taurus],
      [10, 20, ZodiacName.Virgo],
      [20, 30, ZodiacName.Capricorn],
    ],
    [ZodiacName.Gemini]: [
      [0, 10, ZodiacName.Gemini],
      [10, 20, ZodiacName.Libra],
      [20, 30, ZodiacName.Aquarius],
    ],
    [ZodiacName.Cancer]: [
      [0, 10, ZodiacName.Cancer],
      [10, 20, ZodiacName.Scorpio],
      [20, 30, ZodiacName.Pisces],
    ],
    [ZodiacName.Leo]: [
      [0, 10, ZodiacName.Leo],
      [10, 20, ZodiacName.Sagittarius],
      [20, 30, ZodiacName.Aries],
    ],
    [ZodiacName.Virgo]: [
      [0, 10, ZodiacName.Virgo],
      [10, 20, ZodiacName.Capricorn],
      [20, 30, ZodiacName.Taurus],
    ],
    [ZodiacName.Libra]: [
      [0, 10, ZodiacName.Libra],
      [10, 20, ZodiacName.Aquarius],
      [20, 30, ZodiacName.Gemini],
    ],
    [ZodiacName.Scorpio]: [
      [0, 10, ZodiacName.Scorpio],
      [10, 20, ZodiacName.Pisces],
      [20, 30, ZodiacName.Cancer],
    ],
    [ZodiacName.Sagittarius]: [
      [0, 10, ZodiacName.Sagittarius],
      [10, 20, ZodiacName.Aries],
      [20, 30, ZodiacName.Leo],
    ],
    [ZodiacName.Capricorn]: [
      [0, 10, ZodiacName.Capricorn],
      [10, 20, ZodiacName.Taurus],
      [20, 30, ZodiacName.Virgo],
    ],
    [ZodiacName.Aquarius]: [
      [0, 10, ZodiacName.Aquarius],
      [10, 20, ZodiacName.Gemini],
      [20, 30, ZodiacName.Libra],
    ],
    [ZodiacName.Pisces]: [
      [0, 10, ZodiacName.Pisces],
      [10, 20, ZodiacName.Cancer],
      [20, 30, ZodiacName.Scorpio],
    ],
  };

  /**
   * D9 - Navamsa Chart (Marriage, Dharma)
   */
  private static readonly NAVAMSA_TABLE: Record<
    ZodiacName,
    Array<[number, number, ZodiacName]>
  > = {
    [ZodiacName.Aries]: [
      [0, 3.3333, ZodiacName.Aries],
      [3.3333, 6.6667, ZodiacName.Taurus],
      [6.6667, 10, ZodiacName.Gemini],
      [10, 13.3333, ZodiacName.Cancer],
      [13.3333, 16.6667, ZodiacName.Leo],
      [16.6667, 20, ZodiacName.Virgo],
      [20, 23.3333, ZodiacName.Libra],
      [23.3333, 26.6667, ZodiacName.Scorpio],
      [26.6667, 30, ZodiacName.Sagittarius],
    ],
    [ZodiacName.Taurus]: [
      [0, 3.3333, ZodiacName.Capricorn],
      [3.3333, 6.6667, ZodiacName.Aquarius],
      [6.6667, 10, ZodiacName.Pisces],
      [10, 13.3333, ZodiacName.Aries],
      [13.3333, 16.6667, ZodiacName.Taurus],
      [16.6667, 20, ZodiacName.Gemini],
      [20, 23.3333, ZodiacName.Cancer],
      [23.3333, 26.6667, ZodiacName.Leo],
      [26.6667, 30, ZodiacName.Virgo],
    ],
    [ZodiacName.Gemini]: [
      [0, 3.3333, ZodiacName.Libra],
      [3.3333, 6.6667, ZodiacName.Scorpio],
      [6.6667, 10, ZodiacName.Sagittarius],
      [10, 13.3333, ZodiacName.Capricorn],
      [13.3333, 16.6667, ZodiacName.Aquarius],
      [16.6667, 20, ZodiacName.Pisces],
      [20, 23.3333, ZodiacName.Aries],
      [23.3333, 26.6667, ZodiacName.Taurus],
      [26.6667, 30, ZodiacName.Gemini],
    ],
    [ZodiacName.Cancer]: [
      [0, 3.3333, ZodiacName.Cancer],
      [3.3333, 6.6667, ZodiacName.Leo],
      [6.6667, 10, ZodiacName.Virgo],
      [10, 13.3333, ZodiacName.Libra],
      [13.3333, 16.6667, ZodiacName.Scorpio],
      [16.6667, 20, ZodiacName.Sagittarius],
      [20, 23.3333, ZodiacName.Capricorn],
      [23.3333, 26.6667, ZodiacName.Aquarius],
      [26.6667, 30, ZodiacName.Pisces],
    ],
    [ZodiacName.Leo]: [
      [0, 3.3333, ZodiacName.Aries],
      [3.3333, 6.6667, ZodiacName.Taurus],
      [6.6667, 10, ZodiacName.Gemini],
      [10, 13.3333, ZodiacName.Cancer],
      [13.3333, 16.6667, ZodiacName.Leo],
      [16.6667, 20, ZodiacName.Virgo],
      [20, 23.3333, ZodiacName.Libra],
      [23.3333, 26.6667, ZodiacName.Scorpio],
      [26.6667, 30, ZodiacName.Sagittarius],
    ],
    [ZodiacName.Virgo]: [
      [0, 3.3333, ZodiacName.Capricorn],
      [3.3333, 6.6667, ZodiacName.Aquarius],
      [6.6667, 10, ZodiacName.Pisces],
      [10, 13.3333, ZodiacName.Aries],
      [13.3333, 16.6667, ZodiacName.Taurus],
      [16.6667, 20, ZodiacName.Gemini],
      [20, 23.3333, ZodiacName.Cancer],
      [23.3333, 26.6667, ZodiacName.Leo],
      [26.6667, 30, ZodiacName.Virgo],
    ],
    [ZodiacName.Libra]: [
      [0, 3.3333, ZodiacName.Libra],
      [3.3333, 6.6667, ZodiacName.Scorpio],
      [6.6667, 10, ZodiacName.Sagittarius],
      [10, 13.3333, ZodiacName.Capricorn],
      [13.3333, 16.6667, ZodiacName.Aquarius],
      [16.6667, 20, ZodiacName.Pisces],
      [20, 23.3333, ZodiacName.Aries],
      [23.3333, 26.6667, ZodiacName.Taurus],
      [26.6667, 30, ZodiacName.Gemini],
    ],
    [ZodiacName.Scorpio]: [
      [0, 3.3333, ZodiacName.Cancer],
      [3.3333, 6.6667, ZodiacName.Leo],
      [6.6667, 10, ZodiacName.Virgo],
      [10, 13.3333, ZodiacName.Libra],
      [13.3333, 16.6667, ZodiacName.Scorpio],
      [16.6667, 20, ZodiacName.Sagittarius],
      [20, 23.3333, ZodiacName.Capricorn],
      [23.3333, 26.6667, ZodiacName.Aquarius],
      [26.6667, 30, ZodiacName.Pisces],
    ],
    [ZodiacName.Sagittarius]: [
      [0, 3.3333, ZodiacName.Aries],
      [3.3333, 6.6667, ZodiacName.Taurus],
      [6.6667, 10, ZodiacName.Gemini],
      [10, 13.3333, ZodiacName.Cancer],
      [13.3333, 16.6667, ZodiacName.Leo],
      [16.6667, 20, ZodiacName.Virgo],
      [20, 23.3333, ZodiacName.Libra],
      [23.3333, 26.6667, ZodiacName.Scorpio],
      [26.6667, 30, ZodiacName.Sagittarius],
    ],
    [ZodiacName.Capricorn]: [
      [0, 3.3333, ZodiacName.Capricorn],
      [3.3333, 6.6667, ZodiacName.Aquarius],
      [6.6667, 10, ZodiacName.Pisces],
      [10, 13.3333, ZodiacName.Aries],
      [13.3333, 16.6667, ZodiacName.Taurus],
      [16.6667, 20, ZodiacName.Gemini],
      [20, 23.3333, ZodiacName.Cancer],
      [23.3333, 26.6667, ZodiacName.Leo],
      [26.6667, 30, ZodiacName.Virgo],
    ],
    [ZodiacName.Aquarius]: [
      [0, 3.3333, ZodiacName.Libra],
      [3.3333, 6.6667, ZodiacName.Scorpio],
      [6.6667, 10, ZodiacName.Sagittarius],
      [10, 13.3333, ZodiacName.Capricorn],
      [13.3333, 16.6667, ZodiacName.Aquarius],
      [16.6667, 20, ZodiacName.Pisces],
      [20, 23.3333, ZodiacName.Aries],
      [23.3333, 26.6667, ZodiacName.Taurus],
      [26.6667, 30, ZodiacName.Gemini],
    ],
    [ZodiacName.Pisces]: [
      [0, 3.3333, ZodiacName.Cancer],
      [3.3333, 6.6667, ZodiacName.Leo],
      [6.6667, 10, ZodiacName.Virgo],
      [10, 13.3333, ZodiacName.Libra],
      [13.3333, 16.6667, ZodiacName.Scorpio],
      [16.6667, 20, ZodiacName.Sagittarius],
      [20, 23.3333, ZodiacName.Capricorn],
      [23.3333, 26.6667, ZodiacName.Aquarius],
      [26.6667, 30, ZodiacName.Pisces],
    ],
  };

  /**
   * D10 - Dasamsa Chart (Career, Profession)
   */
  static calculateDasamsa(rasiSign: ZodiacSign): ZodiacSign {
    // Get degrees as a number from the Angle
    const degree = rasiSign.degreesInSign.totalDegrees;
    const signName = rasiSign.name;

    // Determine which 3° division
    const division = Math.floor(degree / 3);

    // Get starting sign based on rasi sign
    const startSigns: Record<ZodiacName, ZodiacName> = {
      [ZodiacName.Aries]: ZodiacName.Aries,
      [ZodiacName.Taurus]: ZodiacName.Capricorn,
      [ZodiacName.Gemini]: ZodiacName.Gemini,
      [ZodiacName.Cancer]: ZodiacName.Pisces,
      [ZodiacName.Leo]: ZodiacName.Leo,
      [ZodiacName.Virgo]: ZodiacName.Taurus,
      [ZodiacName.Libra]: ZodiacName.Libra,
      [ZodiacName.Scorpio]: ZodiacName.Cancer,
      [ZodiacName.Sagittarius]: ZodiacName.Sagittarius,
      [ZodiacName.Capricorn]: ZodiacName.Virgo,
      [ZodiacName.Aquarius]: ZodiacName.Aquarius,
      [ZodiacName.Pisces]: ZodiacName.Scorpio,
    };

    const startSign = startSigns[signName];
    const vargaSign = this.getSignAtDistance(startSign, division);
    const vargaDegree = this.calculateDivisionalDegree(degree, 10);
    const vargaLongitude =
      this.ZODIAC_SIGNS.indexOf(vargaSign) * 30 + vargaDegree;

    return {
      name: vargaSign,
      degreesInSign: this.createAngle(vargaDegree),
      longitude: this.createAngle(vargaLongitude),
    };
  }

  /**
   * Get planet position in Rasi chart
   */
  private static getPlanetZodiacSign(
    planet: PlanetName,
    birthTime: Time,
  ): ZodiacSign {
    const positions = BirthChartCalculator.getAllPlanetPositions(birthTime);
    const planetPos = positions.find((p) => p.planet === planet);
    if (!planetPos) {
      throw new Error(`Could not find position for planet ${planet}`);
    }
    return planetPos.sign;
  }

  /**
   * Get the Lagna (Ascendant) sign for a given birth time
   */
  private static getLagnaSign(birthTime: Time): ZodiacSign {
    const lagnaLongitude = AstroCalculator.getAscendantLongitude(birthTime);
    return AstroCalculator.getZodiacSignFromLongitude(lagnaLongitude);
  }

  /**
   * Calculate planet position in any divisional chart
   */
  static calculateVargaPosition(
    planet: PlanetName,
    birthTime: Time,
    division: number,
  ): ZodiacSign {
    const rasiPosition = this.getPlanetZodiacSign(planet, birthTime);

    switch (division) {
      case 1:
        return rasiPosition; // D1 - Rasi
      case 2:
        return this.calculateFromTable(rasiPosition, this.HORA_TABLE);
      case 3:
        return this.calculateFromTable(rasiPosition, this.DREKKANA_TABLE);
      case 4:
        return this.calculateD4(rasiPosition);
      case 7:
        return this.calculateD7(rasiPosition);
      case 9:
        return this.calculateFromTable(rasiPosition, this.NAVAMSA_TABLE);
      case 10:
        return this.calculateDasamsa(rasiPosition);
      case 12:
        return this.calculateD12(rasiPosition);
      case 16:
        return this.calculateD16(rasiPosition);
      case 20:
        return this.calculateD20(rasiPosition);
      case 24:
        return this.calculateD24(rasiPosition);
      case 27:
        return this.calculateD27(rasiPosition);
      case 30:
        return this.calculateD30(rasiPosition);
      case 40:
        return this.calculateD40(rasiPosition);
      case 45:
        return this.calculateD45(rasiPosition);
      case 60:
        return this.calculateD60(rasiPosition);
      default:
        throw new Error(`Division D${division} not yet implemented`);
    }
  }

  // ============================================================================
  // VARGA CALCULATION METHOD IMPLEMENTATIONS
  // ============================================================================

  static calculateD4(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const division = Math.floor(degree / (30 / 4));
    // D4: Starts from Self (1,4,7,10 signs), Self (2,5,8,11), Self (3,6,9,12)?
    // Standard rule: Kendra cycles from the sign itself.
    // Part 1: Sign, Part 2: Sign+3, Part 3: Sign+6, Part 4: Sign+9
    const distance = (division * 3) % 12;
    return this.createVargaSign(rasiSign, 4, distance);
  }

  static calculateD7(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const division = Math.floor(degree / (30 / 7));
    const signIndex = this.ZODIAC_SIGNS.indexOf(rasiSign.name);
    // Odd: Start from Self. Even: Start from 7th.
    const startOffset = signIndex % 2 === 0 ? 0 : 6;
    return this.createVargaSign(rasiSign, 7, startOffset + division);
  }

  static calculateD12(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const division = Math.floor(degree / (30 / 12));
    // D12: Start from Self, contiguous.
    return this.createVargaSign(rasiSign, 12, division);
  }

  static calculateD16(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const division = Math.floor(degree / (30 / 16));
    const signIndex = this.ZODIAC_SIGNS.indexOf(rasiSign.name);
    // Moveable (0,3,6,9): Start Aries (0)
    // Fixed (1,4,7,10): Start Leo (4)
    // Dual (2,5,8,11): Start Sagittarius (8)
    let startSignIndex = 0;
    if (signIndex % 3 === 1) startSignIndex = 4; // Fixed
    if (signIndex % 3 === 2) startSignIndex = 8; // Dual

    // Distance relative to rasiSign needed by createVargaSign?
    // No, createVargaSign uses getSignAtDistance which is relative to Rasi Sign.
    // We need logic relative to Aries.
    // Let's refactor createVargaSign or use getSignAtDistance manually.
    const vargaSignName = this.getZodiacNameByIndex(
      (startSignIndex + division) % 12,
    );
    return this.createVargaSignDirect(rasiSign, 16, vargaSignName);
  }

  static calculateD20(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const division = Math.floor(degree / (30 / 20));
    const signIndex = this.ZODIAC_SIGNS.indexOf(rasiSign.name);
    // Moveable: Aries (0)
    // Fixed: Sagittarius (8)
    // Dual: Leo (4)
    let startSignIndex = 0;
    if (signIndex % 3 === 1) startSignIndex = 8;
    if (signIndex % 3 === 2) startSignIndex = 4;

    const vargaSignName = this.getZodiacNameByIndex(
      (startSignIndex + division) % 12,
    );
    return this.createVargaSignDirect(rasiSign, 20, vargaSignName);
  }

  static calculateD24(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const division = Math.floor(degree / (30 / 24));
    const signIndex = this.ZODIAC_SIGNS.indexOf(rasiSign.name);
    // Odd: Leo (4)
    // Even: Cancer (3)
    const startSignIndex = signIndex % 2 === 0 ? 4 : 3;
    const vargaSignName = this.getZodiacNameByIndex(
      (startSignIndex + division) % 12,
    );
    return this.createVargaSignDirect(rasiSign, 24, vargaSignName);
  }

  static calculateD27(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const division = Math.floor(degree / (30 / 27));
    const signIndex = this.ZODIAC_SIGNS.indexOf(rasiSign.name);
    // Fire (0,4,8): Aries (0)
    // Earth (1,5,9): Cancer (3)
    // Air (2,6,10): Libra (6)
    // Water (3,7,11): Capricorn (9)
    const element = signIndex % 4;
    const startSignIndex = element * 3;
    const vargaSignName = this.getZodiacNameByIndex(
      (startSignIndex + division) % 12,
    );
    return this.createVargaSignDirect(rasiSign, 27, vargaSignName);
  }

  static calculateD30(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const signIndex = this.ZODIAC_SIGNS.indexOf(rasiSign.name);
    // Trimsamsa logic is by degree ranges, not equal parts
    // Odd Signs: 0-5 (Aries), 5-10 (Aquarius), 10-18 (Sagittarius), 18-25 (Gemini), 25-30 (Libra)
    // Even Signs: 0-5 (Taurus), 5-12 (Virgo), 12-20 (Pisces), 20-25 (Capricorn), 25-30 (Scorpio)
    let vargaSignIndex = 0;
    if (signIndex % 2 === 0) {
      // Odd Sign (0=Aries)
      if (degree < 5)
        vargaSignIndex = 0; // Aries
      else if (degree < 10)
        vargaSignIndex = 10; // Aquarius
      else if (degree < 18)
        vargaSignIndex = 8; // Sagittarius
      else if (degree < 25)
        vargaSignIndex = 2; // Gemini
      else vargaSignIndex = 6; // Libra
    } else {
      // Even Sign
      if (degree < 5)
        vargaSignIndex = 1; // Taurus
      else if (degree < 12)
        vargaSignIndex = 5; // Virgo
      else if (degree < 20)
        vargaSignIndex = 11; // Pisces
      else if (degree < 25)
        vargaSignIndex = 9; // Capricorn
      else vargaSignIndex = 7; // Scorpio
    }
    const vargaSignName = this.getZodiacNameByIndex(vargaSignIndex);
    return this.createVargaSignDirect(rasiSign, 30, vargaSignName);
  }

  static calculateD40(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const division = Math.floor(degree / (30 / 40));
    const signIndex = this.ZODIAC_SIGNS.indexOf(rasiSign.name);
    // Odd: Aries (0)
    // Even: Libra (6)
    const startSignIndex = signIndex % 2 === 0 ? 0 : 6;
    const vargaSignName = this.getZodiacNameByIndex(
      (startSignIndex + division) % 12,
    );
    return this.createVargaSignDirect(rasiSign, 40, vargaSignName);
  }

  static calculateD45(rasiSign: ZodiacSign): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const division = Math.floor(degree / (30 / 45));
    const signIndex = this.ZODIAC_SIGNS.indexOf(rasiSign.name);
    // Movable: Aries (0)
    // Fixed: Leo (4)
    // Dual: Sagittarius (8)
    let startSignIndex = 0;
    if (signIndex % 3 === 1) startSignIndex = 4;
    if (signIndex % 3 === 2) startSignIndex = 8;
    const vargaSignName = this.getZodiacNameByIndex(
      (startSignIndex + division) % 12,
    );
    return this.createVargaSignDirect(rasiSign, 45, vargaSignName);
  }

  static calculateD60(rasiSign: ZodiacSign): ZodiacSign {
    // Common D60 Logic: Ignore sign. (Longitude * 2) % 12 ?
    // No, Varga always uses position within sign.
    // D60 is often counted cyclically from the sign itself or specific lords.
    // Simplest Parashara: Each part is 0.5 deg. Count from Sign itself? No.
    // "The lords of the 60 amsas are..." - Usually mapped to deities.
    // For chart construction: It's often treated as cyclic from the Sign (or Aries?).
    // Many software use: (SignIndex * 30 + Degrees) * 2 => Total Half Degrees.
    // Result % 12 => Sign Index.
    // Let's implement this "Scalar" approach usually used for higher harmonics.
    // Harmonic 60.

    const totalDegrees =
      this.ZODIAC_SIGNS.indexOf(rasiSign.name) * 30 +
      rasiSign.degreesInSign.totalDegrees;
    const vargaPos = totalDegrees * 60;
    const vargaSignIndex = Math.floor(vargaPos / 30) % 12;
    const vargaSignName = this.getZodiacNameByIndex(vargaSignIndex);
    return this.createVargaSignDirect(rasiSign, 60, vargaSignName);
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private static createVargaSign(
    rasiSign: ZodiacSign,
    division: number,
    distance: number,
  ): ZodiacSign {
    const vargaSignName = this.getSignAtDistance(rasiSign.name, distance);
    return this.createVargaSignDirect(rasiSign, division, vargaSignName);
  }

  private static createVargaSignDirect(
    rasiSign: ZodiacSign,
    division: number,
    vargaSignName: ZodiacName,
  ): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const vargaDegree = this.calculateDivisionalDegree(degree, division);
    const vargaLongitude =
      this.ZODIAC_SIGNS.indexOf(vargaSignName) * 30 + vargaDegree;

    return {
      name: vargaSignName,
      degreesInSign: this.createAngle(vargaDegree),
      longitude: this.createAngle(vargaLongitude),
    };
  }

  private static getZodiacNameByIndex(index: number): ZodiacName {
    return this.ZODIAC_SIGNS[((index % 12) + 12) % 12];
  }

  /**
   * Helper: Calculate varga sign from precomputed table
   */
  private static calculateFromTable(
    rasiSign: ZodiacSign,
    table: Record<ZodiacName, Array<[number, number, ZodiacName]>>,
  ): ZodiacSign {
    const degree = rasiSign.degreesInSign.totalDegrees;
    const signName = rasiSign.name;
    const ranges = table[signName];

    for (const [start, end, vargaSign] of ranges) {
      if (degree >= start && degree < end) {
        const division = ranges.length;
        const vargaDegree = this.calculateDivisionalDegree(degree, division);
        const vargaLongitude =
          this.ZODIAC_SIGNS.indexOf(vargaSign) * 30 + vargaDegree;

        return {
          name: vargaSign,
          degreesInSign: this.createAngle(vargaDegree),
          longitude: this.createAngle(vargaLongitude),
        };
      }
    }

    throw new Error(
      `Degree ${degree} not found in varga table for ${signName}`,
    );
  }

  /**
   * Calculate divisional longitude (degrees within the varga sign)
   */
  private static calculateDivisionalDegree(
    rasiDegree: number,
    division: number,
  ): number {
    const degreesPerDivision = 30 / division;
    const positionInDivision = rasiDegree % degreesPerDivision;
    return (positionInDivision * division) % 30;
  }

  /**
   * Helper: Get zodiac sign at a specific distance
   */
  private static getSignAtDistance(
    fromSign: ZodiacName,
    distance: number,
  ): ZodiacName {
    const startIndex = this.ZODIAC_SIGNS.indexOf(fromSign);
    const targetIndex = (startIndex + distance) % 12;
    return this.ZODIAC_SIGNS[targetIndex];
  }

  /**
   * Get complete divisional chart for all planets
   */
  static getCompleteDivisionalChart(
    birthTime: Time,
    division: number,
  ): Record<string, ZodiacSign> {
    const planets = [
      PlanetName.Sun,
      PlanetName.Moon,
      PlanetName.Mars,
      PlanetName.Mercury,
      PlanetName.Jupiter,
      PlanetName.Venus,
      PlanetName.Saturn,
      PlanetName.Rahu,
      PlanetName.Ketu,
    ];

    const chart: Record<string, ZodiacSign> = {};

    for (const planet of planets) {
      const planetName = PlanetName[planet];
      chart[planetName] = this.calculateVargaPosition(
        planet,
        birthTime,
        division,
      );
    }

    // Add Lagna (Ascendant)
    const lagnaSign = this.getLagnaSign(birthTime);
    chart["Lagna"] = lagnaSign;

    return chart;
  }
}
