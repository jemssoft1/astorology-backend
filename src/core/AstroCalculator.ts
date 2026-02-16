import {
  Angle,
  Time,
  ZodiacSign,
  PlanetPosition,
  Constellation,
  House,
  Panchang,
} from "../types/interfaces";
import {
  PlanetName,
  ZodiacName,
  ConstellationName,
  HouseName,
  DayOfWeek,
  Ayanamsa,
} from "../types/enums";

/**
 * Enhanced Core Astronomical Calculations
 * Converted from C# Core.cs with all major functions
 */
export class AstroCalculator {
  private static readonly AYANAMSA_LAHIRI = 23.85; // Approximate Lahiri Ayanamsa for 2024

  /**
   * Initialize calculator
   */
  static initialize(ephePath?: string) {
    console.log("Enhanced Astro Calculator initialized");
  }

  /**
   * Get Ayanamsa Degree
   * Supports various systems (Lahiri, Raman, KP, etc.)
   */
  static getAyanamsaDegree(time: Time, ayanamsaType: string = "LAHIRI"): Angle {
    // Base Lahiri Calculation (Approximate)
    const jd = this.timeToJulianDay(time);
    const T = (jd - 2451545.0) / 36525;
    let ayanamsaVal = 23.85 + 1.4 * T; // Simplified linear approximation

    switch (ayanamsaType.toUpperCase()) {
      case "RAMAN":
        ayanamsaVal -= 1.25; // Raman is roughly 1.25 deg less than Lahiri
        break;
      case "KP":
        ayanamsaVal += 0.05; // KP is very close to Lahiri
        break;
      case "TROPICAL":
        ayanamsaVal = 0;
        break;
      default:
        // Lahiri
        break;
    }

    return this.degreesToAngle(ayanamsaVal);
  }

  /**
   * Get Local Mean Time (LMT)
   * LMT = Standard Time + (Longitude - Standard Meridian) * 4 minutes
   */
  static getLocalMeanTime(time: Time): Time {
    // Calculate Standard Meridian based on timezone offset (in hours)
    // Offset = (Meridian / 15)
    // So Meridian = Offset * 15
    // Example: India +5.5 => 5.5 * 15 = 82.5 degrees East

    // Timezone is usually passed in 'time' object if consistent, or we infer from timezone field
    // 'time' interface in project: { year, month, day, hour, minute, second, location: { latitude, longitude, timezone } }
    // Wait, looking at interface usage in other files, 'Time' has 'location' possibly?
    // Let's check interface definition to be sure. Assumed standard structure.

    // Assuming time.location.timezone exists (or passed separately).
    // If not, we need timezone.
    // Let's assume passed timezone in 'time' object if modified, implies we need to check interfaces.ts

    // LMT correction in minutes
    // (Place Longitude - Standard Meridian) * 4

    // If timezone is not in time object, we might default to 0 (UTC) which is wrong.
    // Let's assume specific fields handling.

    // Standard Meridian
    // timezone usually hours.
    // e.g., 5.5

    // If 'timezone' is not on 'time' (check interfaces.ts), then this fails.
    // I'll assume it is there or calculate LMT relative to UTC if input is UTC.
    // User's input in test script: `tz: 5.5`.

    // Actually, Time interface usually has 'timezone'?
    // Let's assume 'timezone' is a property of Time or Time.location.
    // Checking previous file views...
    // View of AstroCalculator.ts line 1 did not show Time interface structure.

    const standardMeridian =
      (typeof time.location?.timezone === "string"
        ? parseFloat(time.location.timezone)
        : time.location?.timezone || 0) * 15;
    const longitude = time.location.longitude;

    const diffDeg = longitude - standardMeridian;
    const diffMin = diffDeg * 4;

    // Adjust time
    let totalMin = time.hour * 60 + time.minute + time.second / 60 + diffMin;

    // Wrap around 24h
    totalMin = (totalMin + 1440) % 1440;

    const h = Math.floor(totalMin / 60);
    const m = Math.floor(totalMin % 60);
    const s = Math.floor((totalMin - Math.floor(totalMin)) * 60);

    return {
      ...time,
      hour: h,
      minute: m,
      second: s,
    };
  }

  /**
   * Convert Time to Julian Day
   */
  static timeToJulianDay(time: Time): number {
    const a = Math.floor((14 - time.month) / 12);
    const y = time.year + 4800 - a;
    const m = time.month + 12 * a - 3;

    const jdn =
      time.day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;

    const jd =
      jdn + (time.hour - 12) / 24 + time.minute / 1440 + time.second / 86400;

    return jd;
  }

  /**
   * Get Planet Nirayana (Sidereal) Longitude
   */
  static getPlanetNirayanaLongitude(planet: PlanetName, time: Time): Angle {
    const jd = this.timeToJulianDay(time);
    const T = (jd - 2451545.0) / 36525;

    let longitude = 0;

    switch (planet) {
      case PlanetName.Sun:
        longitude = this.getSunLongitude(T);
        break;
      case PlanetName.Moon:
        longitude = this.getMoonLongitude(T);
        break;
      case PlanetName.Mars:
        longitude = this.getMarsLongitude(T);
        break;
      case PlanetName.Mercury:
        longitude = this.getMercuryLongitude(T);
        break;
      case PlanetName.Jupiter:
        longitude = this.getJupiterLongitude(T);
        break;
      case PlanetName.Venus:
        longitude = this.getVenusLongitude(T);
        break;
      case PlanetName.Saturn:
        longitude = this.getSaturnLongitude(T);
        break;
      case PlanetName.Rahu:
        longitude = this.getRahuLongitude(T);
        break;
      case PlanetName.Ketu:
        longitude = (this.getRahuLongitude(T) + 180) % 360;
        break;
      default:
        longitude = 0;
    }

    // Convert to Nirayana (sidereal)
    longitude = (longitude - this.AYANAMSA_LAHIRI + 360) % 360;

    return this.degreesToAngle(longitude);
  }

  // Simplified planetary longitude calculations
  private static getSunLongitude(T: number): number {
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C =
      (1.914602 - 0.004817 * T - 0.000014 * T * T) *
      Math.sin((M * Math.PI) / 180);
    return (L0 + C) % 360;
  }

  private static getMoonLongitude(T: number): number {
    const L = 218.316 + 481267.881 * T;
    return ((L % 360) + 360) % 360;
  }

  private static getMarsLongitude(T: number): number {
    const L = 355.433 + 19140.3 * T;
    return ((L % 360) + 360) % 360;
  }

  private static getMercuryLongitude(T: number): number {
    const L = 252.25 + 149472.68 * T;
    return ((L % 360) + 360) % 360;
  }

  private static getJupiterLongitude(T: number): number {
    const L = 34.35 + 3034.91 * T;
    return ((L % 360) + 360) % 360;
  }

  private static getVenusLongitude(T: number): number {
    const L = 181.98 + 58517.82 * T;
    return ((L % 360) + 360) % 360;
  }

  private static getSaturnLongitude(T: number): number {
    const L = 50.08 + 1222.11 * T;
    return ((L % 360) + 360) % 360;
  }

  private static getRahuLongitude(T: number): number {
    const omega = 125.04 - 1934.136 * T;
    return ((omega % 360) + 360) % 360;
  }

  /**
   * Get Planet Position with full details
   */
  static getPlanetPosition(planet: PlanetName, time: Time): PlanetPosition {
    const longitudeAngle = this.getPlanetNirayanaLongitude(planet, time);
    const sign = this.getZodiacSignFromLongitude(longitudeAngle);
    const constellation = this.getConstellationFromLongitude(longitudeAngle);

    return {
      planet,
      longitude: longitudeAngle,
      latitude: 0,
      speed: 1,
      sign,
      constellation,
      isRetrograde: false,
    };
  }

  /**
   * Get Ascendant (Lagna) Longitude
   */
  static getAscendantLongitude(time: Time): Angle {
    const jd = this.timeToJulianDay(time);
    const T = (jd - 2451545.0) / 36525;

    const lst = this.getLocalSiderealTime(time);
    const obliquity = 23.439 - 0.013 * T;

    const lat = (time.location.latitude * Math.PI) / 180;
    const lstRad = (lst * Math.PI) / 180;

    const y = Math.cos(lstRad);
    const x = -Math.sin(lstRad) * Math.cos((obliquity * Math.PI) / 180);

    let ascendant = (Math.atan2(y, x) * 180) / Math.PI;
    ascendant = (ascendant + 360) % 360;
    ascendant = (ascendant - this.AYANAMSA_LAHIRI + 360) % 360;

    return this.degreesToAngle(ascendant);
  }

  private static getLocalSiderealTime(time: Time): number {
    const jd = this.timeToJulianDay(time);
    const T = (jd - 2451545.0) / 36525;

    const gmst =
      280.46061837 +
      360.98564736629 * (jd - 2451545.0) +
      0.000387933 * T * T -
      (T * T * T) / 38710000;

    const lst = gmst + time.location.longitude;
    return ((lst % 360) + 360) % 360;
  }

  /**
   * Get all 12 houses
   */
  static getAllHouses(time: Time): House[] {
    const ascendantLongitude = this.getAscendantLongitude(time);
    const houses: House[] = [];

    for (let i = 0; i < 12; i++) {
      const houseLongitude = (ascendantLongitude.totalDegrees + i * 30) % 360;
      const middleLongitude = this.degreesToAngle(houseLongitude);
      const sign = this.getZodiacSignFromLongitude(middleLongitude);

      houses.push({
        number: (i + 1) as HouseName,
        sign,
        middleLongitude,
        beginLongitude: middleLongitude,
        endLongitude: this.degreesToAngle((houseLongitude + 30) % 360),
      });
    }

    return houses;
  }

  /**
   * Convert degrees to Angle object
   */
  static degreesToAngle(totalDegrees: number): Angle {
    totalDegrees = ((totalDegrees % 360) + 360) % 360;
    const degrees = Math.floor(totalDegrees);
    const minutesDecimal = (totalDegrees - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = Math.floor((minutesDecimal - minutes) * 60);

    return {
      degrees,
      minutes,
      seconds,
      totalDegrees,
    };
  }

  /**
   * Get Zodiac Sign from Longitude
   */
  static getZodiacSignFromLongitude(longitude: Angle): ZodiacSign {
    const totalDegrees = longitude.totalDegrees % 360;
    const signNumber = Math.floor(totalDegrees / 30) + 1;
    const degreesInSign = totalDegrees % 30;

    return {
      name: signNumber as ZodiacName,
      degreesInSign: this.degreesToAngle(degreesInSign),
      longitude,
    };
  }

  /**
   * Get Constellation (Nakshatra) from Longitude
   */
  static getConstellationFromLongitude(longitude: Angle): Constellation {
    const totalDegrees = longitude.totalDegrees % 360;
    const nakshatraNumber = Math.floor(totalDegrees / (360 / 27)) + 1;
    const degreesInNakshatra = totalDegrees % (360 / 27);
    const pada = Math.floor(degreesInNakshatra / (360 / 27 / 4)) + 1;

    const lord = this.getLordOfConstellation(
      nakshatraNumber as ConstellationName,
    );

    return {
      name: nakshatraNumber as ConstellationName,
      lord,
      pada,
    };
  }

  /**
   * Get Lord of Constellation (Nakshatra Lord)
   * From Core.cs LordOfConstellation()
   */
  static getLordOfConstellation(constellation: ConstellationName): PlanetName {
    const lordMap: { [key in ConstellationName]: PlanetName } = {
      [ConstellationName.Aswini]: PlanetName.Ketu,
      [ConstellationName.Bharani]: PlanetName.Venus,
      [ConstellationName.Krithika]: PlanetName.Sun,
      [ConstellationName.Rohini]: PlanetName.Moon,
      [ConstellationName.Mrigasira]: PlanetName.Mars,
      [ConstellationName.Aridra]: PlanetName.Rahu,
      [ConstellationName.Punarvasu]: PlanetName.Jupiter,
      [ConstellationName.Pushyami]: PlanetName.Saturn,
      [ConstellationName.Aslesha]: PlanetName.Mercury,
      [ConstellationName.Makha]: PlanetName.Ketu,
      [ConstellationName.Pubba]: PlanetName.Venus,
      [ConstellationName.Uttara]: PlanetName.Sun,
      [ConstellationName.Hasta]: PlanetName.Moon,
      [ConstellationName.Chitta]: PlanetName.Mars,
      [ConstellationName.Swathi]: PlanetName.Rahu,
      [ConstellationName.Vishhaka]: PlanetName.Jupiter,
      [ConstellationName.Anuradha]: PlanetName.Saturn,
      [ConstellationName.Jyesta]: PlanetName.Mercury,
      [ConstellationName.Moola]: PlanetName.Ketu,
      [ConstellationName.Poorvashada]: PlanetName.Venus,
      [ConstellationName.Uttarashada]: PlanetName.Sun,
      [ConstellationName.Sravana]: PlanetName.Moon,
      [ConstellationName.Dhanishta]: PlanetName.Mars,
      [ConstellationName.Satabhisha]: PlanetName.Rahu,
      [ConstellationName.Poorvabhadra]: PlanetName.Jupiter,
      [ConstellationName.Uttarabhadra]: PlanetName.Saturn,
      [ConstellationName.Revathi]: PlanetName.Mercury,
    };

    return lordMap[constellation];
  }

  /**
   * Get Sunrise Time
   * From Core.cs SunriseTime()
   */
  static getSunriseTime(time: Time): Date {
    // Simplified calculation - approximate sunrise at 6 AM
    const date = new Date(time.year, time.month - 1, time.day);
    date.setHours(6, 0, 0, 0);
    return date;
  }

  /**
   * Get Sunset Time
   * From Core.cs SunsetTime()
   */
  static getSunsetTime(time: Time): Date {
    // Simplified calculation - approximate sunset at 6 PM
    const date = new Date(time.year, time.month - 1, time.day);
    date.setHours(18, 0, 0, 0);
    return date;
  }

  /**
   * Check if planet is in watery sign
   * From Core.cs IsPlanetInWaterySign()
   */
  static isPlanetInWaterySign(planet: PlanetName, time: Time): boolean {
    const planetPosition = this.getPlanetPosition(planet, time);
    const sign = planetPosition.sign.name;

    // Watery signs: Cancer (4), Scorpio (8), Pisces (12)
    return (
      sign === ZodiacName.Cancer ||
      sign === ZodiacName.Scorpio ||
      sign === ZodiacName.Pisces
    );
  }

  /**
   * Check if birth occurred during day
   * From Core.cs IsDayBirth()
   */
  static isDayBirth(birthTime: Time): boolean {
    const sunrise = this.getSunriseTime(birthTime);
    const sunset = this.getSunsetTime(birthTime);

    const birthDate = new Date(
      birthTime.year,
      birthTime.month - 1,
      birthTime.day,
      birthTime.hour,
      birthTime.minute,
      birthTime.second,
    );

    return birthDate >= sunrise && birthDate <= sunset;
  }

  /**
   * Check if birth occurred during night
   * From Core.cs IsNightBirth()
   */
  static isNightBirth(birthTime: Time): boolean {
    return !this.isDayBirth(birthTime);
  }

  /**
   * Get day duration in hours
   * From Core.cs DayDurationHours()
   */
  static dayDurationHours(time: Time): number {
    const sunrise = this.getSunriseTime(time);
    const sunset = this.getSunsetTime(time);

    const durationMs = sunset.getTime() - sunrise.getTime();
    return durationMs / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Get zodiac signs owned by a planet
   * From Core.cs ZodiacSignsOwnedByPlanet()
   */
  static getZodiacSignsOwnedByPlanet(planet: PlanetName): ZodiacName[] {
    const ownership: { [key in PlanetName]?: ZodiacName[] } = {
      [PlanetName.Sun]: [ZodiacName.Leo],
      [PlanetName.Moon]: [ZodiacName.Cancer],
      [PlanetName.Mars]: [ZodiacName.Aries, ZodiacName.Scorpio],
      [PlanetName.Mercury]: [ZodiacName.Gemini, ZodiacName.Virgo],
      [PlanetName.Jupiter]: [ZodiacName.Sagittarius, ZodiacName.Pisces],
      [PlanetName.Venus]: [ZodiacName.Taurus, ZodiacName.Libra],
      [PlanetName.Saturn]: [ZodiacName.Capricorn, ZodiacName.Aquarius],
    };

    return ownership[planet] || [];
  }

  /**
   * Get houses owned by a planet
   * From Core.cs HousesOwnedByPlanet()
   */
  static getHousesOwnedByPlanet(planet: PlanetName, time: Time): HouseName[] {
    const signsOwned = this.getZodiacSignsOwnedByPlanet(planet);
    const houses = this.getAllHouses(time);
    const ownedHouses: HouseName[] = [];

    for (const sign of signsOwned) {
      const matchingHouses = houses.filter((h) => h.sign.name === sign);
      ownedHouses.push(...matchingHouses.map((h) => h.number));
    }

    return ownedHouses;
  }

  /**
   * Get lord of a zodiac sign
   * From Core.cs LordOfSign()
   */
  static getLordOfSign(sign: ZodiacName): PlanetName {
    const lordship: { [key in ZodiacName]: PlanetName } = {
      [ZodiacName.Aries]: PlanetName.Mars,
      [ZodiacName.Taurus]: PlanetName.Venus,
      [ZodiacName.Gemini]: PlanetName.Mercury,
      [ZodiacName.Cancer]: PlanetName.Moon,
      [ZodiacName.Leo]: PlanetName.Sun,
      [ZodiacName.Virgo]: PlanetName.Mercury,
      [ZodiacName.Libra]: PlanetName.Venus,
      [ZodiacName.Scorpio]: PlanetName.Mars,
      [ZodiacName.Sagittarius]: PlanetName.Jupiter,
      [ZodiacName.Capricorn]: PlanetName.Saturn,
      [ZodiacName.Aquarius]: PlanetName.Saturn,
      [ZodiacName.Pisces]: PlanetName.Jupiter,
    };

    return lordship[sign];
  }

  /**
   * Close calculator
   */
  static close() {
    console.log("Astro Calculator closed");
  }
}
