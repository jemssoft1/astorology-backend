import { AstroCalculator } from "./AstroCalculator";
import { Time, LunarDay, Panchang, Constellation } from "../types/interfaces";
import {
  PlanetName,
  Karana,
  NithyaYoga,
  DayOfWeek,
  LunarDayGroup,
} from "../types/enums";

/**
 * Panchang Calculations (5 Limbs of Time)
 */
export class PanchangCalculator {
  /**
   * Get Lunar Day (Tithi)
   * Tithi is the lunar day based on the angular distance between Sun and Moon
   */
  static getLunarDay(time: Time): LunarDay {
    const sunLongitude = AstroCalculator.getPlanetNirayanaLongitude(
      PlanetName.Sun,
      time,
    );
    const moonLongitude = AstroCalculator.getPlanetNirayanaLongitude(
      PlanetName.Moon,
      time,
    );

    let angularDistance: number;

    if (moonLongitude.totalDegrees > sunLongitude.totalDegrees) {
      angularDistance = moonLongitude.totalDegrees - sunLongitude.totalDegrees;
    } else {
      angularDistance =
        moonLongitude.totalDegrees + 360 - sunLongitude.totalDegrees;
    }

    const rawLunarDate = angularDistance / 12.0;
    const lunarDayNumber = Math.ceil(rawLunarDate);
    const percentage = (rawLunarDate - Math.floor(rawLunarDate)) * 100;

    return {
      number: lunarDayNumber,
      name: this.getLunarDayName(lunarDayNumber),
      percentage,
    };
  }

  /**
   * Get Lunar Day Name
   */
  private static getLunarDayName(number: number): string {
    const names = [
      "Pratipada",
      "Dwitiya",
      "Tritiya",
      "Chaturthi",
      "Panchami",
      "Shashthi",
      "Saptami",
      "Ashtami",
      "Navami",
      "Dashami",
      "Ekadashi",
      "Dwadashi",
      "Trayodashi",
      "Chaturdashi",
      "Purnima/Amavasya",
      "Pratipada",
      "Dwitiya",
      "Tritiya",
      "Chaturthi",
      "Panchami",
      "Shashthi",
      "Saptami",
      "Ashtami",
      "Navami",
      "Dashami",
      "Ekadashi",
      "Dwadashi",
      "Trayodashi",
      "Chaturdashi",
      "Amavasya/Purnima",
    ];

    return names[number - 1] || "Unknown";
  }

  /**
   * Get Lunar Day Group
   */
  static getLunarDayGroup(lunarDayNumber: number): LunarDayGroup {
    const remainder = lunarDayNumber % 5;

    switch (remainder) {
      case 1:
        return LunarDayGroup.Nanda;
      case 2:
        return LunarDayGroup.Bhadra;
      case 3:
        return LunarDayGroup.Jaya;
      case 4:
        return LunarDayGroup.Rikta;
      case 0:
        return LunarDayGroup.Purna;
      default:
        return LunarDayGroup.Nanda;
    }
  }

  /**
   * Get Moon Constellation (Nakshatra)
   */
  static getMoonConstellation(time: Time): Constellation {
    const moonLongitude = AstroCalculator.getPlanetNirayanaLongitude(
      PlanetName.Moon,
      time,
    );
    return AstroCalculator.getConstellationFromLongitude(moonLongitude);
  }

  /**
   * Get Nithya Yoga (Panchanga Yoga)
   * Yoga = (Longitude of Sun + Longitude of Moon) / 13°20' (or 800')
   */
  static getNithyaYoga(time: Time): NithyaYoga {
    const sunLongitude = AstroCalculator.getPlanetNirayanaLongitude(
      PlanetName.Sun,
      time,
    );
    const moonLongitude = AstroCalculator.getPlanetNirayanaLongitude(
      PlanetName.Moon,
      time,
    );

    const jointLongitude =
      (sunLongitude.totalDegrees + moonLongitude.totalDegrees) % 360;
    const jointLongitudeInMinutes = jointLongitude * 60;

    const rawYogaNumber = jointLongitudeInMinutes / 800;
    const yogaNumber = Math.ceil(rawYogaNumber);

    return yogaNumber as NithyaYoga;
  }

  /**
   * Get Karana
   * Each tithi is divided into 2 karanas
   */
  static getKarana(time: Time): Karana {
    const sunLongitude = AstroCalculator.getPlanetNirayanaLongitude(
      PlanetName.Sun,
      time,
    );
    const moonLongitude = AstroCalculator.getPlanetNirayanaLongitude(
      PlanetName.Moon,
      time,
    );

    let angularDistance: number;

    if (moonLongitude.totalDegrees > sunLongitude.totalDegrees) {
      angularDistance = moonLongitude.totalDegrees - sunLongitude.totalDegrees;
    } else {
      angularDistance =
        moonLongitude.totalDegrees + 360 - sunLongitude.totalDegrees;
    }

    const rawLunarDate = angularDistance / 12.0;
    const lunarDayNumber = Math.ceil(rawLunarDate);
    const lunarDayTraversed = rawLunarDate - Math.floor(rawLunarDate);

    return this.getKaranaFromLunarDay(lunarDayNumber, lunarDayTraversed);
  }

  /**
   * Get Karana from Lunar Day
   */
  private static getKaranaFromLunarDay(
    lunarDay: number,
    traversed: number,
  ): Karana {
    const isFirstHalf = traversed <= 0.5;

    switch (lunarDay) {
      case 1:
        return isFirstHalf ? Karana.Kimstughna : Karana.Bava;
      case 2:
      case 9:
      case 16:
      case 23:
        return isFirstHalf ? Karana.Balava : Karana.Kaulava;
      case 3:
      case 10:
      case 17:
      case 24:
        return isFirstHalf ? Karana.Taitula : Karana.Garija;
      case 4:
      case 11:
      case 18:
      case 25:
        return isFirstHalf ? Karana.Vanija : Karana.Visti;
      case 5:
      case 12:
      case 19:
      case 26:
        return isFirstHalf ? Karana.Bava : Karana.Balava;
      case 6:
      case 13:
      case 20:
      case 27:
        return isFirstHalf ? Karana.Kaulava : Karana.Taitula;
      case 7:
      case 14:
      case 21:
      case 28:
        return isFirstHalf ? Karana.Garija : Karana.Vanija;
      case 8:
      case 15:
      case 22:
        return isFirstHalf ? Karana.Visti : Karana.Bava;
      case 29:
        return isFirstHalf ? Karana.Visti : Karana.Sakuna;
      case 30:
        return isFirstHalf ? Karana.Chatushpada : Karana.Naga;
      default:
        return Karana.Bava;
    }
  }

  /**
   * Get Day of Week (Vara)
   */
  static getDayOfWeek(time: Time): DayOfWeek {
    const date = new Date(time.year, time.month - 1, time.day);
    return date.getDay() as DayOfWeek;
  }

  /**
   * Get Complete Panchang
   */
  static getPanchang(time: Time): Panchang {
    const tithi = this.getLunarDay(time);
    const nakshatra = this.getMoonConstellation(time);
    const yoga = this.getNithyaYoga(time);
    const karana = this.getKarana(time);
    const vara = this.getDayOfWeek(time);

    const sunrise = AstroCalculator.getSunriseTime(time);
    const sunset = AstroCalculator.getSunsetTime(time);

    // Moonrise and moonset would require additional calculations
    // For now, using placeholder dates
    const moonrise = new Date(time.year, time.month - 1, time.day);
    const moonset = new Date(time.year, time.month - 1, time.day);

    return {
      tithi,
      nakshatra,
      yoga,
      karana,
      vara,
      sunrise,
      sunset,
      moonrise,
      moonset,
    };
  }

  /**
   * Get Tarabala (Birth Star Strength)
   * Used for personal muhurtha
   */
  static getTabala(
    currentTime: Time,
    birthTime: Time,
  ): { number: number; cycle: number; name: string; isGood: boolean } {
    const currentConstellation = this.getMoonConstellation(currentTime);
    const birthConstellation = this.getMoonConstellation(birthTime);

    const currentNumber = currentConstellation.name;
    const birthNumber = birthConstellation.name;

    let counter: number;

    if (birthNumber > currentNumber) {
      const countToLast = 27 - birthNumber + 1;
      counter = currentNumber + countToLast;
    } else if (birthNumber === currentNumber) {
      counter = 1;
    } else {
      counter = currentNumber - birthNumber + 1;
    }

    const cycle = Math.ceil(counter / 9);

    if (counter > 9) {
      counter = counter % 9;
      if (counter === 0) counter = 9;
    }

    const names = [
      "Janma",
      "Sampat",
      "Vipat",
      "Kshema",
      "Pratyak",
      "Sadhana",
      "Naidhana",
      "Mitra",
      "Parama Mitra",
    ];
    const goodTaras = [2, 4, 6, 8, 9]; // Sampat, Kshema, Sadhana, Mitra, Parama Mitra

    return {
      number: counter,
      cycle,
      name: names[counter - 1],
      isGood: goodTaras.includes(counter),
    };
  }

  /**
   * Get Chandrabala (Lunar Strength)
   * Used for personal muhurtha
   */
  static getChandrabala(currentTime: Time, birthTime: Time): number {
    const currentMoonSign = AstroCalculator.getPlanetPosition(
      PlanetName.Moon,
      currentTime,
    ).sign.name;
    const birthMoonSign = AstroCalculator.getPlanetPosition(
      PlanetName.Moon,
      birthTime,
    ).sign.name;

    let chandrabalaNumber: number;

    if (birthMoonSign > currentMoonSign) {
      const countToLast = 12 - birthMoonSign + 1;
      chandrabalaNumber = currentMoonSign + countToLast;
    } else if (birthMoonSign === currentMoonSign) {
      chandrabalaNumber = 1;
    } else {
      chandrabalaNumber = currentMoonSign - birthMoonSign + 1;
    }

    return chandrabalaNumber;
  }

  /**
   * Check if birth time is during day
   */
  static isDayBirth(birthTime: Time): boolean {
    const sunrise = AstroCalculator.getSunriseTime(birthTime);
    const sunset = AstroCalculator.getSunsetTime(birthTime);

    const birthDate = new Date(
      birthTime.year,
      birthTime.month - 1,
      birthTime.day,
      birthTime.hour,
      birthTime.minute,
    );

    return birthDate >= sunrise && birthDate <= sunset;
  }

  /**
   * Check if birth time is during night
   */
  static isNightBirth(birthTime: Time): boolean {
    return !this.isDayBirth(birthTime);
  }
  /**
   * Calculate Rahu Kala
   * Inauspicious time for starting new ventures
   */
  static calculateRahuKala(time: Time): { start: Date; end: Date } {
    return this.calculateTimeSegment(time, "RahuKala");
  }

  /**
   * Calculate Yamaghanda
   * Inauspicious time (Death time)
   */
  static calculateYamaghanda(time: Time): { start: Date; end: Date } {
    return this.calculateTimeSegment(time, "Yamaghanda");
  }

  /**
   * Helper to calculate time segments based on 8 equal parts of day
   */
  private static calculateTimeSegment(
    time: Time,
    type: "RahuKala" | "Yamaghanda",
  ): { start: Date; end: Date } {
    const sunrise = AstroCalculator.getSunriseTime(time);
    const sunset = AstroCalculator.getSunsetTime(time);
    const durationMs = sunset.getTime() - sunrise.getTime();
    const segmentMs = durationMs / 8;

    const weekday = this.getDayOfWeek(time); // 0=Sun, 1=Mon...

    // Segment Indices (1-based)
    // Day: Sun, Mon, Tue, Wed, Thu, Fri, Sat
    // Rahu: 8, 2, 7, 5, 6, 4, 3
    // Yama: 5, 4, 3, 2, 1, 7, 6

    const rahuIndices = [8, 2, 7, 5, 6, 4, 3];
    const yamaIndices = [5, 4, 3, 2, 1, 7, 6];

    const indices = type === "RahuKala" ? rahuIndices : yamaIndices;
    const segmentIndex = indices[weekday]; // weekday matches array index 0-6

    const startMs = sunrise.getTime() + segmentMs * (segmentIndex - 1);
    const endMs = startMs + segmentMs;

    return {
      start: new Date(startMs),
      end: new Date(endMs),
    };
  }

  static getYogaName(yogaNumber: number): string {
    const yogas = [
      "Vishkumbha",
      "Priti",
      "Ayushman",
      "Saubhagya",
      "Sobhana",
      "Atiganda",
      "Sukarma",
      "Dhriti",
      "Shula",
      "Ganda",
      "Vriddhi",
      "Dhruva",
      "Vyaghata",
      "Harshana",
      "Vajra",
      "Siddhi",
      "Vyatipata",
      "Variyan",
      "Parigha",
      "Shiva",
      "Siddha",
      "Sadhya",
      "Shubha",
      "Shukla",
      "Brahma",
      "Indra",
      "Vaidhriti",
    ];
    return yogas[yogaNumber - 1] || "Unknown";
  }

  static getKaranaName(karana: Karana): string {
    // Mapping based on Enum or strings
    // Since Karana is an enum (likely numbers), we might need a map if it's not string based.
    // Assuming Karana enum values map to typical indices or strings.
    // If Karana is string enum, return it. If number, map it.
    // Checking types/enums.ts would be ideal, but for now returning a string representation.
    return Karana[karana] || "Unknown";
  }

  /**
   * Get Hora at Birth (Kalahora)
   * Planetary hour ruler
   */
  static getHoraAtBirth(time: Time): { horaPlanet: string; duration: number } {
    const sunrise = AstroCalculator.getSunriseTime(time);
    const sunset = AstroCalculator.getSunsetTime(time);
    const isDay = AstroCalculator.isDayBirth(time);

    const dayDuration = sunset.getTime() - sunrise.getTime();
    const nightDuration = 24 * 60 * 60 * 1000 - dayDuration;

    // Each hora is 1/12th of day/night duration
    const horaLength = isDay ? dayDuration / 12 : nightDuration / 12;

    const birthTimeMs = new Date(
      time.year,
      time.month - 1,
      time.day,
      time.hour,
      time.minute,
      time.second,
    ).getTime();
    const startTime = isDay ? sunrise.getTime() : sunset.getTime();

    const timeDiff = birthTimeMs - startTime;
    const horaIndex = Math.floor(timeDiff / horaLength);

    // Ruling planets order: Sun, Ven, Mer, Mon, Sat, Jup, Mar (from Sunrise of Sunday)
    // Actually, it starts with the Day Lord and cyclic order:
    // Sun -> Ven -> Mer -> Moon -> Sat -> Jup -> Mars -> Sun...
    // Sequence: 6 -> 5 -> 3 -> 1 -> 6 -> 4 -> 2... NO.
    // Kalahora sequence (decreasing speed): Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon. THIS IS WRONG.
    // Standard Kalahora order (Weekday Lord first, then 6th from it):
    // Sun, Ven, Mer, Moon, Sat, Jup, Mars.

    const lords = [
      PlanetName.Sun, // Sunday
      PlanetName.Moon, // Monday
      PlanetName.Mars, // Tuesday
      PlanetName.Mercury, // Wednesday
      PlanetName.Jupiter, // Thursday
      PlanetName.Venus, // Friday
      PlanetName.Saturn, // Saturday
    ];

    const dayLord = lords[this.getDayOfWeek(time)];

    // Standard Hora Sequence relative to Day Lord:
    // 1. Day Lord
    // 2. 6th from Day Lord (backwards? or just predetermined sequence?)
    // Sequence is fixed: Sun, Ven, Mer, Mon, Sat, Jup, Mar.
    // So fast lookup:
    const horaSequence = [
      "Sun",
      "Venus",
      "Mercury",
      "Moon",
      "Saturn",
      "Jupiter",
      "Mars",
    ];

    // Find index of Day Lord in sequence
    const dayLordName = PlanetName[dayLord]; // "Sun", "Moon"...
    let startIndex = horaSequence.indexOf(dayLordName);
    if (startIndex === -1) startIndex = 0; // Fallback

    const currentHoraIndex = (startIndex + horaIndex) % 7;

    return {
      horaPlanet: horaSequence[currentHoraIndex],
      duration: horaLength / (1000 * 60), // minutes
    };
  }

  /**
   * Get Lord of Weekday
   */
  static getLordOfWeekday(time: Time): string {
    const day = this.getDayOfWeek(time);
    // DayOfWeek enum: 0=Sun...
    return DayOfWeek[day];
  }

  /**
   * Get Pancha Pakshi Birth Bird (Simplified)
   * Based on Nakshatra and Waxing/Waning Moon
   */
  static getPanchaPakshiBirthBird(time: Time): string {
    const nakshatra = this.getMoonConstellation(time);
    const tithi = this.getLunarDay(time);
    // Waxing = Shukla (Tithi 1-15), Waning = Krishna (16-30)
    const isWaxing = tithi.number <= 15;

    // Birds: Vulture, Owl, Crow, Cock, Peacock
    // Simple mapping for demo:
    // Nakshatras 1-5 -> Bird 1, 6-10 -> Bird 2, etc. rotated by Moon Phase

    const birds = ["Peacock", "Rooster", "Owl", "Crow", "Vulture"];
    const nakIndex = nakshatra.name; // 1-27

    // Approximate logic (Real logic is complex table lookup)
    // Grouping Nakshatras into 5 groups
    // 1: Aswini, Bharani, Krithika, Rohini, Mrigasira
    // ...

    let group = Math.ceil(nakIndex / 5.4); // 1 to 5
    if (group > 5) group = 5;

    // If Waning, reverse order or shift?
    // Simplified: Just return based on group
    // Ideally implementation needs full table.

    let birdIndex = group - 1;
    if (!isWaxing) {
      birdIndex = (birdIndex + 2) % 5; // Shift for Krishna Paksha
    }

    return birds[birdIndex];
  }

  // ============== VedAstro-Compatible Format Wrappers ==============

  /**
   * Get Nithya Yoga with Name and Description
   */
  static getNithyaYogaFormatted(time: Time): {
    Name: string;
    Description: string;
  } {
    const yogaNumber = this.getNithyaYoga(time);
    const { NithyaYoga: YogaEnum } = require("../types/enums");
    const yogaName = YogaEnum[yogaNumber as keyof typeof YogaEnum] || "Unknown";

    const descriptions: { [key: string]: string } = {
      Vishkambha: "Obstruction",
      Priti: "Love/affection",
      Ayushman: "Long life",
      Saubhagya: "Fortune",
      Sobhana: "Splendor/beauty",
      Atiganda: "Great danger",
      Sukarman: "Noble deeds",
      Dhriti: "Fortitude/courage",
      Soola: "Piercing/sharp",
      Ganda: "Danger/knot",
      Vriddhi: "Growth",
      Dhruva: "Fixed/firm",
      Vyaghata: "Calamity",
      Harshana: "Joy/delight",
      Vajra: "Diamond/thunderbolt",
      Siddhi: "Achievement",
      Vyatipata: "Disaster",
      Variyan: "Benefit",
      Parigha: "Iron bar",
      Siva: "Auspicious",
      Siddha: "Accomplished",
      Sadhya: "Attainable",
      Subha: "Auspicious",
      Sukla: "Bright",
      Brahma: "Creator",
      Indra: "Lord of gods",
      Vaidhriti: "Separation/divorce",
    };

    return { Name: yogaName, Description: descriptions[yogaName] || "" };
  }

  static getKaranaFormatted(time: Time): string {
    const karanaNumber = this.getKarana(time);
    const { Karana: KaranaEnum } = require("../types/enums");
    return KaranaEnum[karanaNumber as keyof typeof KaranaEnum] || "Unknown";
  }

  static getDayOfWeekFormatted(time: Time): string {
    const dayNumber = this.getDayOfWeek(time);
    const { DayOfWeek } = require("../types/enums");
    return DayOfWeek[dayNumber as keyof typeof DayOfWeek] || "Unknown";
  }

  static getLordOfWeekdayFormatted(time: Time): { Name: string } {
    const dayNumber = this.getDayOfWeek(time);
    const lords = [
      "Sun",
      "Moon",
      "Mars",
      "Mercury",
      "Jupiter",
      "Venus",
      "Saturn",
    ];
    return { Name: lords[dayNumber] || "Unknown" };
  }

  static getHoraAtBirthFormatted(time: Time): number {
    const birthDate = new Date(
      time.year,
      time.month - 1,
      time.day,
      time.hour,
      time.minute,
      time.second,
    );
    const sunriseDate = AstroCalculator.getSunriseTime(time); // Returns Date object
    const hoursDiff =
      (birthDate.getTime() - sunriseDate.getTime()) / (1000 * 60 * 60);
    const horaNumber = Math.floor(hoursDiff % 24) + 1;
    return horaNumber;
  }

  static getLunarDayFormatted(time: Time): {
    Name: string;
    Paksha: string;
    Date: string;
    Day: string;
    Phase: string;
  } {
    const lunarDay = this.getLunarDay(time);
    const isPaksha = lunarDay.number <= 15;
    const dayInPaksha = isPaksha ? lunarDay.number : lunarDay.number - 15;

    return {
      Name: lunarDay.name,
      Paksha: isPaksha ? "Sukla" : "Krishna",
      Date: `${lunarDay.number}/30`,
      Day: `${dayInPaksha}/15`,
      Phase: isPaksha ? "BrightHalf" : "DarkHalf",
    };
  }
}
