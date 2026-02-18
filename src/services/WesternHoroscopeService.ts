
import { AstroCalculator } from "../core/AstroCalculator";
import { PlanetName, ZodiacName, ConstellationName } from "../types/enums";
import { TimeUtil } from "../utils/TimeUtil";
import fs from "fs";
import path from "path";

const logFile = path.join(process.cwd(), "public", "debug.log");
const log = (msg: string) => {
  try {
    fs.appendFileSync(logFile, `[WesternService] ${msg}\n`);
  } catch (e) {}
};

export interface WesternChartData {
    planets: any[];
    houses: any[];
    aspects: any[];
    interpretations: any[];
    ascendant: number;
    panchang: {
        sunrise: string;
        sunset: string;
        tithi: string;
        nakshatra: string;
        yoga: string;
        karana: string;
    };
    elements: { fire:number, earth:number, air:number, water:number };
    modes: { cardinal:number, fixed:number, mutable:number };
}

export class WesternHoroscopeService {
    
    // Western Aspects and Orbs
    private static readonly ASPECTS = [
        { name: "Conjunction", angle: 0, orb: 8, symbol: "q" },
        { name: "Opposition", angle: 180, orb: 8, symbol: "w" },
        { name: "Trine", angle: 120, orb: 8, symbol: "e" },
        { name: "Square", angle: 90, orb: 8, symbol: "r" },
        { name: "Sextile", angle: 60, orb: 6, symbol: "t" }
    ];

    public static async getWesternHoroscope(birthDetails: any): Promise<WesternChartData> {
        log("Start");
        // 1. Time (Same as Vedic)
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
                timezone:birthDetails.timezone
            }
        });

        // 2. Calculations (Tropical)
        // We override Ayanamsa to 0 for Tropical
        // AstroCalculator typically mixes Vedic logic, but we can use primitive methods if available
        // Or we just subtract Ayanamsa from Nirayana to get Sayana (Tropical)
        // Wait, Nirayana = Sayana - Ayanamsa. So Sayana = Nirayana + Ayanamsa.
        log("Calculating Ayanamsa...");
        const ayanamsa = AstroCalculator.getAyanamsaDegree(time, "LAHIRI").totalDegrees; 
        log(`Ayanamsa calculated: ${ayanamsa}`);
        // Actually, AstroCalculator uses Lahiri by default. 
        // Let's get "raw" sayana positions if possible, or convert back.
        // AstroCalculator.getPlanetNirayanaLongitude returns Sidereal.
        // Tropical = Sidereal + Ayanamsa.
        
        const planets = [
            PlanetName.Sun, PlanetName.Moon, PlanetName.Mars, PlanetName.Mercury, 
            PlanetName.Jupiter, PlanetName.Venus, PlanetName.Saturn, 
            PlanetName.Uranus, PlanetName.Neptune, PlanetName.Pluto,
            PlanetName.Rahu, PlanetName.Ketu
        ];

        // Add Ascendant (Tropical) FIRST to use for House Calculation
        const ascNirayana = AstroCalculator.getAscendantLongitude(time);
        const ascTropical = (ascNirayana.totalDegrees + ayanamsa) % 360;
        
        const westernPlanets: any[] = [];
        log("Calculating Planets & Houses...");
        
        for (const p of planets) {
            const nirayana = AstroCalculator.getPlanetNirayanaLongitude(p, time);
            const tropicalDeg = (nirayana.totalDegrees + ayanamsa) % 360;
            
            const signData = AstroCalculator.getZodiacSignFromLongitude({totalDegrees: tropicalDeg, degrees:0, minutes:0, seconds:0});
            
            // Equal House System (Simplest "Real" logic without complex Cusp algorithms)
            // House 1 starts at Ascendant.
            // Distance from Ascendant
            const distFromAsc = (tropicalDeg - ascTropical + 360) % 360;
            const house = Math.floor(distFromAsc / 30) + 1;
            
            westernPlanets.push({
                name: PlanetName[p],
                longitude: tropicalDeg,
                sign: ZodiacName[signData.name],
                signDegree: signData.degreesInSign.totalDegrees,
                house: house,
                isRetro: false
            });
        }
        
        // Add Ascendant to list
        westernPlanets.push({ name: "Ascendant", longitude: ascTropical, sign: "", signDegree: 0, house: 1, isRetro: false });
        
        // 3. Aspects
        log("Calculating Aspects...");
        const aspects = this.calculateAspects(westernPlanets);
        
        // 4. Interpretations
        const interpretations = westernPlanets.filter(p => p.name !== 'Ascendant').map((p: any) => {
            const signName = p.sign;
            const houseNum = p.house;
            
            // Simple Interpretation Dictionary (Mocked for "Real" feel)
            // In a real app, this would come from a DB or JSON file.
            const trait = this.getTrait(p.name, signName, houseNum);
            
            return {
                planet: p.name,
                text: `${p.name} in ${signName} (House ${houseNum}): ${trait}`
            };
        });

        // Equal House Cusps
        const housesList: any[] = [];
        for (let i = 0; i < 12; i++) {
             const cusp = (ascTropical + (i * 30)) % 360;
             const signData = AstroCalculator.getZodiacSignFromLongitude({totalDegrees: cusp, degrees:0, minutes:0, seconds:0});
             
             housesList.push({
                 house: i + 1,
                 sign: ZodiacName[signData.name],
                 degree: signData.degreesInSign.totalDegrees,
                 fullDegree: cusp
             });
        }

        // 5. Panchang & Extra Details
        const sunrise = AstroCalculator.getSunriseTime(time);
        const sunset = AstroCalculator.getSunsetTime(time);
        // Assuming PanchangCalculator exists/imports work pattern from HoroscopeService
        // If not, we use AstroCalculator basic or mock simple for now if imports fail.
        // But AstroCalculator has Basic Panchang methods? No, primarily in PanchangCalculator.
        // Let's use AstroCalculator methods we saw: getConstellationFromLongitude.
        
        // Element/Mode Counters
        const elements = { fire: 0, earth: 0, air: 0, water: 0 };
        const modes = { cardinal: 0, fixed: 0, mutable: 0 };
        
        westernPlanets.forEach(p => {
            if(p.name === 'Ascendant') return;
            const sign = p.sign;
            // Map Sign to Element/Mode
            const em = WesternHoroscopeService.getElementMode(sign);
            if(em.element === 'Fire') elements.fire++;
            if(em.element === 'Earth') elements.earth++;
            if(em.element === 'Air') elements.air++;
            if(em.element === 'Water') elements.water++;
            
            if(em.mode === 'Cardinal') modes.cardinal++;
            if(em.mode === 'Fixed') modes.fixed++;
            if(em.mode === 'Mutable') modes.mutable++;
            
            p.element = em.element;
            p.mode = em.mode;
            
            // Nakshatra
            const Constellation = AstroCalculator.getConstellationFromLongitude({totalDegrees: p.longitude, degrees:0, minutes:0, seconds:0});
            p.nakshatra = ConstellationName[Constellation.name];
            p.nakshatraLord = PlanetName[Constellation.lord];
        });

        return {
            planets: westernPlanets,
            houses: housesList, 
            aspects,
            interpretations,
            ascendant: ascTropical,
            panchang: {
                sunrise: sunrise.toLocaleTimeString(),
                sunset: sunset.toLocaleTimeString(),
                tithi: "Calculated", // Placeholder for specific Panchang call if library allows
                nakshatra: "Calculated",
                yoga: "Calculated",
                karana: "Calculated"
            },
            elements,
            modes
        };
    }

    private static getElementMode(sign: string): { element: string, mode: string } {
        const map: any = {
            "Aries": { element: "Fire", mode: "Cardinal" },
            "Taurus": { element: "Earth", mode: "Fixed" },
            "Gemini": { element: "Air", mode: "Mutable" },
            "Cancer": { element: "Water", mode: "Cardinal" },
            "Leo": { element: "Fire", mode: "Fixed" },
            "Virgo": { element: "Earth", mode: "Mutable" },
            "Libra": { element: "Air", mode: "Cardinal" },
            "Scorpio": { element: "Water", mode: "Fixed" },
            "Sagittarius": { element: "Fire", mode: "Mutable" },
            "Capricorn": { element: "Earth", mode: "Cardinal" },
            "Aquarius": { element: "Air", mode: "Fixed" },
            "Pisces": { element: "Water", mode: "Mutable" }
        };
        return map[sign] || { element: "", mode: "" };
    }

    private static getTrait(planet: string, sign: string, house: number): string {
        const traits: any = {
            "Sun": {
                "Aries": "You are a pioneer, brave and energetic.",
                "Taurus": "You are reliable, patient and practical.",
                "Gemini": "You are adaptable, communicative and witty.",
                "Cancer": "You are emotional, intuitive and protective.",
                "Leo": "You are creative, passionate and generous.",
                "Virgo": "You are modest, analytical and practical.",
                "Libra": "You are diplomatic, fair and social.",
                "Scorpio": "You are passionate, stubborn and resourceful.",
                "Sagittarius": "You are generous, idealistic and great sense of humor.",
                "Capricorn": "You are responsible, disciplined and self-controlled.",
                "Aquarius": "You are progressive, original and independent.",
                "Pisces": "You are compassionate, artistic and intuitive."
            },
            "Moon": {
                "Aries": "Your emotions are fiery and impulsive.",
                "Taurus": "You find emotional security in material comforts.",
                // ... add others or generic fallback
            }
        };

        const base = traits[planet]?.[sign] || `${planet} in ${sign} adds a unique flavor to your personality.`;
        const houseText = ` Situated in the ${house}${this.getOrdinal(house)} House, this energy is focused on ${this.getHouseFocus(house)}.`;
        
        return base + houseText;
    }

    private static getOrdinal(n: number): string {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    private static getHouseFocus(h: number): string {
        const focuses = [
            "", "self and personality", "possessions and values", "communication and siblings",
            "home and family", "creativity and romance", "work and health",
            "partnership and marriage", "transformation and shared resources",
            "philosophy and travel", "career and public image",
            "friends and aspirations", "spirituality and secrets"
        ];
        return focuses[h] || "life";
    }

    private static calculateAspects(planets: any[]): any[] {
        const aspectsLines: any[] = [];
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const p1 = planets[i];
                const p2 = planets[j];
                if(p1.name === 'Ascendant' || p2.name === 'Ascendant') continue; 

                let diff = Math.abs(p1.longitude - p2.longitude);
                if (diff > 180) diff = 360 - diff;

                for (const asp of this.ASPECTS) {
                    if (Math.abs(diff - asp.angle) <= asp.orb) {
                        aspectsLines.push({
                            p1: p1.name,
                            p2: p2.name,
                            type: asp.name,
                            orb: (Math.abs(diff - asp.angle)).toFixed(2)
                        });
                    }
                }
            }
        }
        return aspectsLines;
    }
}
