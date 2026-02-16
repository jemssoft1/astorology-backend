import { Time, PlanetPosition, House } from "../types/interfaces";
import { PlanetName, HouseName, ZodiacName } from "../types/enums";
import { BirthChartCalculator } from "./BirthChartCalculator";
import { AstroCalculator } from "./AstroCalculator";

export class ShadbalaCalculator {
  /**
   * Calculate Shadbala Pinda (Total Strength) for all planets
   * Returns strength in Rupas (or decimal)
   */
  static calculateShadbalaPinda(time: Time): Record<string, number> {
    const details = this.calculateDetailedShadbala(time);
    const strengths: Record<string, number> = {};
    Object.keys(details).forEach((key) => {
      strengths[key] = details[key].ShadbalaPinda;
    });
    return strengths;
  }

  /**
   * Calculate detailed Shadbala components
   */
  static calculateDetailedShadbala(time: Time): Record<string, any> {
    const birthChart = BirthChartCalculator.generateBirthChart(time);
    const results: Record<string, any> = {};

    // Base strengths (Natural) - Naisargika
    const naturalStrength: Record<string, number> = {
      [PlanetName[PlanetName.Sun]]: 60,
      [PlanetName[PlanetName.Moon]]: 51.43,
      [PlanetName[PlanetName.Venus]]: 42.85,
      [PlanetName[PlanetName.Jupiter]]: 34.28,
      [PlanetName[PlanetName.Mercury]]: 25.7,
      [PlanetName[PlanetName.Mars]]: 17.14,
      [PlanetName[PlanetName.Saturn]]: 8.57,
      [PlanetName[PlanetName.Rahu]]: 10,
      [PlanetName[PlanetName.Ketu]]: 10,
    };

    birthChart.planets.forEach((p) => {
      const planetNameStr = PlanetName[p.planet];

      // 1. Sthana Bala (Positional)
      let ochchaBala = 0; // Exaltation
      // Simplified Ochcha Bala
      if (BirthChartCalculator.isPlanetExalted(p.planet, time)) ochchaBala = 60;
      else if (BirthChartCalculator.isPlanetDebilitated(p.planet, time))
        ochchaBala = 0;
      else ochchaBala = 30; // Average

      let saptavargajaBala = 100; // 7-varga simplified
      if (BirthChartCalculator.isPlanetInOwnSign(p.planet, time))
        saptavargajaBala = 120;

      let ojayugmarasyamsaBala = 15; // Odd/Even sign placement
      let kendraBala = 60; // Center houses
      let drekkanaBala = 15; // Decanate

      const sthanaBala =
        ochchaBala +
        saptavargajaBala +
        ojayugmarasyamsaBala +
        kendraBala +
        drekkanaBala;

      // 2. Dig Bala (Directional)
      // Sun/Mars (South/10th), Moon/Venus (North/4th), Mer/Jup (East/1st), Sat (West/7th)
      const digBala = 30; // Placeholder average

      // 3. Kaala Bala (Temporal)
      const nathonnathaBala = 30; // Day/Night
      const pakshaBala = 30; // Lunar phase
      const tribhagaBala = 20; // Part of day
      const abdaBala = 15; // Year lord
      const masaBala = 30; // Month lord
      const varaBala = 45; // Day lord
      const horaBala = 60; // Hour lord
      const ayanaBala = 30; // Solstice
      const yuddhaBala = 0; // Planetary war

      const kalaBala =
        nathonnathaBala +
        pakshaBala +
        tribhagaBala +
        abdaBala +
        masaBala +
        varaBala +
        horaBala +
        ayanaBala +
        yuddhaBala;

      // 4. Chestha Bala (Motional)
      const chesthaBala = p.isRetrograde ? 60 : 30;

      // 5. Naisargika Bala (Natural)
      const naisargikaBala = naturalStrength[planetNameStr] || 10;

      // 6. Drik Bala (Aspectual)
      const drikBala = 0; // Simplified

      const totalShadbala =
        sthanaBala +
        digBala +
        kalaBala +
        chesthaBala +
        naisargikaBala +
        drikBala;

      results[planetNameStr] = {
        Planet: p.planet,
        ShadbalaPinda: parseFloat(totalShadbala.toFixed(2)),
        SthanaBala: sthanaBala,
        DigBala: digBala,
        KalaBala: kalaBala,
        ChesthaBala: chesthaBala,
        NaisargikaBala: naisargikaBala,
        DrikBala: drikBala,
        OchchaBala: ochchaBala,
        SaptavargajaBala: saptavargajaBala,
        OjayugmarasyamsaBala: ojayugmarasyamsaBala,
        KendraBala: kendraBala,
        DrekkanaBala: drekkanaBala,
        NathonnathaBala: nathonnathaBala,
        PakshaBala: pakshaBala,
        TribhagaBala: tribhagaBala,
        AbdaBala: abdaBala,
        MasaBala: masaBala,
        VaraBala: varaBala,
        HoraBala: horaBala,
        AyanaBala: ayanaBala,
        YuddhaBala: yuddhaBala,
      };
    });

    return results;
  }

  /**
   * Calculate House Strength (Bhava Bala)
   */
  static calculateHouseStrength(time: Time): Record<string, number> {
    // Bhava Bala depends on Lord Strength, Aspect Strength, and Directional Strength
    const birthChart = BirthChartCalculator.generateBirthChart(time);
    const houseStrengths: Record<string, number> = {};

    const planetStrengths = this.calculateShadbalaPinda(time);

    birthChart.houses.forEach((h) => {
      const lord = BirthChartCalculator.getHouseLord(h.number, time);
      const lordStrength = planetStrengths[PlanetName[lord]] || 0;

      // Simplified: House Strength approx Lord Strength + Aspect modifiers
      houseStrengths[`House${h.number}`] = parseFloat(
        (lordStrength * 1.1).toFixed(2),
      );
    });

    return houseStrengths;
  }
}
