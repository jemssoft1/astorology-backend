
import { TimeUtil } from "../utils/TimeUtil";
import { AstroCalculator } from "../core/AstroCalculator";
import { BirthChartCalculator } from "../core/BirthChartCalculator";
import { PanchangCalculator } from "../core/PanchangCalculator";
import { VargaCalculator } from "../core/VargaCalculator";
import { DashaCalculator } from "../core/DashaCalculator";
import { PlanetName } from "../types/enums";

import { ShadbalaCalculator } from "../core/ShadbalaCalculator";

export interface FullHoroscopeData {
  planets: any[];
  charts: {
    d1: any;
    d9: any;
  };
  panchang: {
    sunrise: string;
    sunset: string;
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
  };
  dasha: {
    current: string;
    balance: string;
  };
  avakahada: {
    varna: string;
    vashya: string;
    yoni: string;
    gan: string;
    nadi: string;
  };
  shadbala: Record<string, any>;
  bhava: any[];
}

export class HoroscopeService {
  /**
   * Generates comprehensive horoscope data based on birth details.
   */
  public static async getHoroscopeData(birthDetails: any): Promise<FullHoroscopeData> {
      
    // 1. Prepare Time Object
    const time = TimeUtil.normalizeTime({
        year: parseInt(birthDetails.year),
        month: parseInt(birthDetails.month),
        day: parseInt(birthDetails.day),
        hour: parseInt(birthDetails.hour),
        minute: parseInt(birthDetails.minute),
        second: 0,
        location: {
            name: birthDetails.place,
            latitude: parseFloat(birthDetails.latitude),
            longitude: parseFloat(birthDetails.longitude),
            timezone: birthDetails.timezone.toString()
        }
    });

    // 2. Fetch Basic Planetary Positions & Details
    const planetPositions = BirthChartCalculator.getAllPlanetData(time);
    
    // 3. Generate D1 (Rasi) & D9 (Navamsa) Charts
    const d1Chart = VargaCalculator.getCompleteDivisionalChart(time, 1);
    const d9Chart = VargaCalculator.getCompleteDivisionalChart(time, 9);
    
    // 4. Panchang Details
    const sunrise = AstroCalculator.getSunriseTime(time);
    const sunset = AstroCalculator.getSunsetTime(time);
    const tithiObj = PanchangCalculator.getLunarDayFormatted(time);
    const nakshatraObj = PanchangCalculator.getMoonConstellation(time);
    const yogaObj = PanchangCalculator.getNithyaYogaFormatted(time);
    const karanaObj = PanchangCalculator.getKaranaFormatted(time);
    
    // 5. Dasha Details
    const currentMahadasha = DashaCalculator.getCurrentMahadasha(time);
    const currentAntardasha = DashaCalculator.getCurrentAntardasha(time);
    const balanceDasha = DashaCalculator.getBalanceOfBirthDasha(time); 
    const birthStarLord = DashaCalculator.getBirthStarLord(time); 
    
    // Calculate full balance string: Planet + Years
    const balanceYears = balanceDasha; 
    const balanceYearPart = Math.floor(balanceYears);
    const balanceMonthPart = Math.floor((balanceYears - balanceYearPart) * 12);
    const balanceDayPart = Math.floor(((balanceYears - balanceYearPart) * 12 - balanceMonthPart) * 30);

    // 6. Avakahada Chakra
    const varna = BirthChartCalculator.calculateBirthVarna(time);
    const yoni = BirthChartCalculator.getYoniKutaAnimal(time);
    
    // 7. Shadbala & Bhava
    const shadbala = ShadbalaCalculator.calculateDetailedShadbala(time);
    const bhava = AstroCalculator.getAllHouses(time);

    // Helper to safely get names
    const mahadashaName = currentMahadasha ? PlanetName[currentMahadasha.planet] || currentMahadasha.planet : "Unknown";
    const antardashaName = currentAntardasha ? PlanetName[currentAntardasha.planet] || currentAntardasha.planet : "Unknown";
    const balancePlanet = PlanetName[birthStarLord] || birthStarLord;
    
    // Safe Karana - check if object or string
    const karana = typeof karanaObj === 'string' ? karanaObj : (karanaObj as any).Name || "Unknown";

    return {
        planets: planetPositions,
        charts: {
            d1: d1Chart,
            d9: d9Chart
        },
        panchang: {
            sunrise: sunrise.toLocaleTimeString(),
            sunset: sunset.toLocaleTimeString(),
            tithi: tithiObj.Name,
            nakshatra: nakshatraObj.name.toString(),
            yoga: yogaObj.Name,
            karana: karana
        },
        dasha: {
            current: `${mahadashaName} - ${antardashaName}`,
            balance: `${balancePlanet} ${balanceYearPart}y ${balanceMonthPart}m ${balanceDayPart}d`
        },
        avakahada: {
            varna: varna,
            vashya: "Manav",
            yoni: yoni,
            gan: "Deva",
            nadi: "Adi"
        },
        shadbala,
        bhava
    };
  }
}

