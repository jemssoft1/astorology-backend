import {
  ZodiacName,
  PlanetName,
  HouseName,
  ConstellationName,
  DayOfWeek,
  Karana,
  NithyaYoga,
} from "./enums";
import { Gender } from "./person";

/**
 * Geographic Location
 */
export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string | number;
}

/**
 * Time with location
 */
export interface Time {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  location: GeoLocation;
}

/**
 * Angle in degrees
 */
export interface Angle {
  degrees: number;
  minutes: number;
  seconds: number;
  totalDegrees: number;
}

/**
 * Zodiac Sign
 */
export interface ZodiacSign {
  name: ZodiacName;
  degreesInSign: Angle;
  longitude: Angle;
}

/**
 * Planet Position
 */
export interface PlanetPosition {
  planet: PlanetName;
  longitude: Angle;
  latitude: number;
  speed: number;
  sign: ZodiacSign;
  constellation: Constellation;
  isRetrograde: boolean;
}

/**
 * House Position
 */
export interface House {
  number: HouseName;
  sign: ZodiacSign;
  middleLongitude: Angle;
  beginLongitude: Angle;
  endLongitude: Angle;
}

/**
 * Constellation (Nakshatra)
 */
export interface Constellation {
  name: ConstellationName;
  lord: PlanetName;
  pada: number; // 1-4
}

/**
 * Lunar Day (Tithi)
 */
export interface LunarDay {
  number: number; // 1-30
  name: string;
  percentage: number; // 0-100
}

/**
 * Panchang (5 limbs of time)
 */
export interface Panchang {
  tithi: LunarDay;
  nakshatra: Constellation;
  yoga: NithyaYoga;
  karana: Karana;
  vara: DayOfWeek;
  sunrise: Date;
  sunset: Date;
  moonrise: Date;
  moonset: Date;
}

/**
 * Birth Chart
 */
export interface BirthChart {
  time: Time;
  planets: PlanetPosition[];
  houses: House[];
  lagna: ZodiacSign;
  moonSign: ZodiacSign;
  sunSign: ZodiacSign;
}

/**
 * Dasha Period
 */
export interface DashaPeriod {
  planet: PlanetName;
  startDate: Date;
  endDate: Date;
  level: number; // 1=Mahadasha, 2=Antardasha, 3=Pratyantardasha
  subPeriods?: DashaPeriod[];
}

/**
 * Tarabala Result
 */
export interface Tarabala {
  number: number;
  cycle: number;
  name: string;
  isGood: boolean;
}

/**
 * Person Details
 */
export interface Person {
  name: string;
  birthTime: Time;
  gender?: Gender;
}

// ... existing code

/**
 * Calculator Input
 */
export interface CalculatorInput {
  methodName?: string;
  time?: Time;
  vargaNum?: number;
  planetName?: string;
  houseName?: string;
  signName?: string;
  targetTime?: Time;
  matchOneTime?: Time;
  matchTwoTime?: Time;
  birthChart?: BirthChart;
  fullName?: string;
}
