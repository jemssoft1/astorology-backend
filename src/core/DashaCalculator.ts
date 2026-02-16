import { AstroCalculator } from "./AstroCalculator";
import { Time, DashaPeriod } from "../types/interfaces";
import { PlanetName } from "../types/enums";

export class DashaCalculator {
  private static readonly DASHA_YEARS: { [key in PlanetName]?: number } = {
    [PlanetName.Ketu]: 7,
    [PlanetName.Venus]: 20,
    [PlanetName.Sun]: 6,
    [PlanetName.Moon]: 10,
    [PlanetName.Mars]: 7,
    [PlanetName.Rahu]: 18,
    [PlanetName.Jupiter]: 16,
    [PlanetName.Saturn]: 19,
    [PlanetName.Mercury]: 17,
  };

  private static readonly DASHA_SEQUENCE: PlanetName[] = [
    PlanetName.Ketu,
    PlanetName.Venus,
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.Mars,
    PlanetName.Rahu,
    PlanetName.Jupiter,
    PlanetName.Saturn,
    PlanetName.Mercury,
  ];

  // ✅ CRITICAL: This method MUST exist
  private static timeToDate(time: Time): Date {
    console.log("[timeToDate] Converting:", time.year, time.month, time.day);
    return new Date(
      time.year,
      time.month - 1,
      time.day,
      time.hour || 0,
      time.minute || 0,
      time.second || 0,
    );
  }

  static getBirthStarLord(birthTime: Time): PlanetName {
    const moonLongitude = AstroCalculator.getPlanetNirayanaLongitude(
      PlanetName.Moon,
      birthTime,
    );
    const constellation =
      AstroCalculator.getConstellationFromLongitude(moonLongitude);
    return constellation.lord;
  }

  static getBalanceOfBirthDasha(birthTime: Time): number {
    const moonLongitude = AstroCalculator.getPlanetNirayanaLongitude(
      PlanetName.Moon,
      birthTime,
    );
    const totalDegrees = moonLongitude.totalDegrees % 360;
    const nakshatraSpan = 360 / 27;
    const degreesInNakshatra = totalDegrees % nakshatraSpan;
    const percentageCompleted = degreesInNakshatra / nakshatraSpan;
    const birthStarLord = this.getBirthStarLord(birthTime);
    const totalYears = this.DASHA_YEARS[birthStarLord] || 0;
    return totalYears * (1 - percentageCompleted);
  }

  static calculateMahadashas(
    birthTime: Time,
    yearsToCalculate: number = 120,
  ): DashaPeriod[] {
    const birthStarLord = this.getBirthStarLord(birthTime);
    const balanceYears = this.getBalanceOfBirthDasha(birthTime);
    const startIndex = this.DASHA_SEQUENCE.indexOf(birthStarLord);

    const mahadashas: DashaPeriod[] = [];
    let currentDate = new Date(
      birthTime.year,
      birthTime.month - 1,
      birthTime.day,
    );
    let totalYearsCalculated = 0;

    const firstDasha: DashaPeriod = {
      planet: birthStarLord,
      startDate: new Date(currentDate),
      endDate: this.addYears(currentDate, balanceYears),
      level: 1,
    };
    mahadashas.push(firstDasha);

    currentDate = firstDasha.endDate;
    totalYearsCalculated += balanceYears;

    let sequenceIndex = (startIndex + 1) % this.DASHA_SEQUENCE.length;

    while (totalYearsCalculated < yearsToCalculate) {
      const planet = this.DASHA_SEQUENCE[sequenceIndex];
      const years = this.DASHA_YEARS[planet] || 0;

      const dasha: DashaPeriod = {
        planet,
        startDate: new Date(currentDate),
        endDate: this.addYears(currentDate, years),
        level: 1,
      };

      mahadashas.push(dasha);
      currentDate = dasha.endDate;
      totalYearsCalculated += years;
      sequenceIndex = (sequenceIndex + 1) % this.DASHA_SEQUENCE.length;
    }

    return mahadashas;
  }

  static calculateAntardashas(mahadasha: DashaPeriod): DashaPeriod[] {
    const mahaPlanet = mahadasha.planet;
    const totalDays = this.dateDiffInDays(
      mahadasha.startDate,
      mahadasha.endDate,
    );
    const startIndex = this.DASHA_SEQUENCE.indexOf(mahaPlanet);

    const antardashas: DashaPeriod[] = [];
    let currentDate = new Date(mahadasha.startDate);

    for (let i = 0; i < this.DASHA_SEQUENCE.length; i++) {
      const sequenceIndex = (startIndex + i) % this.DASHA_SEQUENCE.length;
      const antarPlanet = this.DASHA_SEQUENCE[sequenceIndex];
      const antarYears = this.DASHA_YEARS[antarPlanet] || 0;
      const antarDurationDays = (totalDays * antarYears) / 120;

      const antardasha: DashaPeriod = {
        planet: antarPlanet,
        startDate: new Date(currentDate),
        endDate: this.addDays(currentDate, antarDurationDays),
        level: 2,
      };

      antardashas.push(antardasha);
      currentDate = antardasha.endDate;
    }

    return antardashas;
  }

  static calculatePratyantardashas(
    antardasha: DashaPeriod,
    mahadasha?: DashaPeriod,
  ): DashaPeriod[] {
    const antarPlanet = antardasha.planet;
    const totalDays = this.dateDiffInDays(
      antardasha.startDate,
      antardasha.endDate,
    );
    const startIndex = this.DASHA_SEQUENCE.indexOf(antarPlanet);

    const pratyantardashas: DashaPeriod[] = [];
    let currentDate = new Date(antardasha.startDate);

    for (let i = 0; i < this.DASHA_SEQUENCE.length; i++) {
      const sequenceIndex = (startIndex + i) % this.DASHA_SEQUENCE.length;
      const pratyPlanet = this.DASHA_SEQUENCE[sequenceIndex];
      const pratyYears = this.DASHA_YEARS[pratyPlanet] || 0;
      const pratyDurationDays = (totalDays * pratyYears) / 120;

      const pratyantardasha: DashaPeriod = {
        planet: pratyPlanet,
        startDate: new Date(currentDate),
        endDate: this.addDays(currentDate, pratyDurationDays),
        level: 3,
      };

      pratyantardashas.push(pratyantardasha);
      currentDate = pratyantardasha.endDate;
    }

    return pratyantardashas;
  }

  // ✅ FIXED METHOD
  static getCurrentMahadasha(
    birthTime: Time,
    currentTime?: Time,
  ): DashaPeriod | null {
    console.log("[getCurrentMahadasha] Called");

    let checkDate: Date;

    if (currentTime) {
      // ✅ USE timeToDate to convert Time to Date
      checkDate = this.timeToDate(currentTime);
      console.log("[getCurrentMahadasha] Converted to Date:", checkDate);
    } else {
      checkDate = new Date();
    }

    const mahadashas = this.calculateMahadashas(birthTime);
    console.log("[getCurrentMahadasha] Total mahadashas:", mahadashas.length);

    for (const dasha of mahadashas) {
      if (checkDate >= dasha.startDate && checkDate <= dasha.endDate) {
        console.log("[getCurrentMahadasha] Found:", dasha.planet);
        return dasha;
      }
    }

    console.log("[getCurrentMahadasha] No match found");
    return null;
  }

  // ✅ FIXED METHOD
  static getCurrentAntardasha(
    birthTime: Time,
    currentTime?: Time,
  ): DashaPeriod | null {
    const mahadasha = this.getCurrentMahadasha(birthTime, currentTime);
    if (!mahadasha) return null;

    let checkDate: Date;

    if (currentTime) {
      checkDate = this.timeToDate(currentTime);
    } else {
      checkDate = new Date();
    }

    const antardashas = this.calculateAntardashas(mahadasha);

    for (const dasha of antardashas) {
      if (checkDate >= dasha.startDate && checkDate <= dasha.endDate) {
        console.log("[getCurrentAntardasha] Found:", dasha.planet);
        return dasha;
      }
    }

    return antardashas.length > 0 ? antardashas[0] : null;
  }

  // ✅ NEW METHOD
  static getCurrentPratyantardasha(
    birthTime: Time,
    currentTime?: Time,
  ): DashaPeriod | null {
    const antardasha = this.getCurrentAntardasha(birthTime, currentTime);
    if (!antardasha) return null;

    let checkDate: Date;
    if (currentTime) {
      checkDate = this.timeToDate(currentTime);
    } else {
      checkDate = new Date();
    }

    const mahadasha = this.getCurrentMahadasha(birthTime, currentTime);
    const pratyantardashas = this.calculatePratyantardashas(
      antardasha,
      mahadasha || undefined,
    );

    for (const dasha of pratyantardashas) {
      if (checkDate >= dasha.startDate && checkDate <= dasha.endDate) {
        return dasha;
      }
    }

    return pratyantardashas.length > 0 ? pratyantardashas[0] : null;
  }

  static getCompleteDashaBreakdown(
    birthTime: Time,
    yearsToCalculate: number = 120,
  ): DashaPeriod[] {
    const mahadashas = this.calculateMahadashas(birthTime, yearsToCalculate);
    for (const mahadasha of mahadashas) {
      mahadasha.subPeriods = this.calculateAntardashas(mahadasha);
    }
    return mahadashas;
  }

  private static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + Math.floor(years));
    const remainingDays = (years - Math.floor(years)) * 365.25;
    result.setDate(result.getDate() + Math.floor(remainingDays));
    return result;
  }

  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + Math.floor(days));
    return result;
  }

  private static dateDiffInDays(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
