
import { PlanetName, ConstellationName } from '../types/enums';
import { Time, DashaPeriod, Constellation } from '../types/interfaces';
import { BirthChartCalculator } from './BirthChartCalculator';

/**
 * Internal interface for dasa calculation
 */
interface DasaInfo {
  planet: PlanetName;
  startDate: Date;
  endDate: Date;
  balance: number; // days remaining
}

/**
 * Enhanced Vimshottari Dasa Calculator
 */
export class EnhancedDashaCalculator {

  /**
   * Dasa periods for Vedic planets only (in years)
   */
  private static readonly DASA_PERIODS: Map<PlanetName, number> = new Map([
    [PlanetName.Sun, 6],
    [PlanetName.Moon, 10],
    [PlanetName.Mars, 7],
    [PlanetName.Mercury, 17],
    [PlanetName.Jupiter, 16],
    [PlanetName.Venus, 20],
    [PlanetName.Saturn, 19],
    [PlanetName.Rahu, 18],
    [PlanetName.Ketu, 7]
  ]);

  /**
   * Nakshatra to Dasa lord mapping
   */
  private static readonly NAKSHATRA_LORDS: Map<ConstellationName, PlanetName> = new Map([
    [ConstellationName.Aswini, PlanetName.Ketu],
    [ConstellationName.Bharani, PlanetName.Venus],
    [ConstellationName.Krithika, PlanetName.Sun],
    [ConstellationName.Rohini, PlanetName.Moon],
    [ConstellationName.Mrigasira, PlanetName.Mars],
    [ConstellationName.Aridra, PlanetName.Rahu],
    [ConstellationName.Punarvasu, PlanetName.Jupiter],
    [ConstellationName.Pushyami, PlanetName.Saturn],
    [ConstellationName.Aslesha, PlanetName.Mercury],
    [ConstellationName.Makha, PlanetName.Ketu],
    [ConstellationName.Pubba, PlanetName.Venus],
    [ConstellationName.Uttara, PlanetName.Sun],
    [ConstellationName.Hasta, PlanetName.Moon],
    [ConstellationName.Chitta, PlanetName.Mars],
    [ConstellationName.Swathi, PlanetName.Rahu],
    [ConstellationName.Vishhaka, PlanetName.Jupiter],
    [ConstellationName.Anuradha, PlanetName.Saturn],
    [ConstellationName.Jyesta, PlanetName.Mercury],
    [ConstellationName.Moola, PlanetName.Ketu],
    [ConstellationName.Poorvashada, PlanetName.Venus],
    [ConstellationName.Uttarashada, PlanetName.Sun],
    [ConstellationName.Sravana, PlanetName.Moon],
    [ConstellationName.Dhanishta, PlanetName.Mars],
    [ConstellationName.Satabhisha, PlanetName.Rahu],
    [ConstellationName.Poorvabhadra, PlanetName.Jupiter],
    [ConstellationName.Uttarabhadra, PlanetName.Saturn],
    [ConstellationName.Revathi, PlanetName.Mercury]
  ]);

  /**
   * Dasa sequence (cyclic order)
   */
  private static readonly DASA_SEQUENCE: PlanetName[] = [
    PlanetName.Ketu,
    PlanetName.Venus,
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.Mars,
    PlanetName.Rahu,
    PlanetName.Jupiter,
    PlanetName.Saturn,
    PlanetName.Mercury
  ];

  /**
   * Get period for a planet (with fallback)
   */
  private static getPeriod(planet: PlanetName): number {
    return this.DASA_PERIODS.get(planet) ?? 0;
  }

  /**
   * Get Dasa lord from Nakshatra
   */
  private static getDasaLord(nakshatra: ConstellationName): PlanetName {
    return this.NAKSHATRA_LORDS.get(nakshatra) ?? PlanetName.Ketu;
  }

  /**
   * Get Dasa-Bhukti relationship and prediction
   */
  static getDasaBhuktiRelationship(majorPlanet: PlanetName, minorPlanet: PlanetName): {
    nature: 'Good' | 'Bad' | 'Neutral';
    description: string;
  } {
    // Create key using enum names
    const majorKey = PlanetName[majorPlanet];
    const minorKey = PlanetName[minorPlanet];
    const key = `${majorKey}-${minorKey}`;
    
    const relationships: Record<string, { nature: 'Good' | 'Bad' | 'Neutral'; description: string }> = {
      // SUN MAJOR PERIOD
      'Sun-Sun': {
        nature: 'Bad',
        description: 'Unpleasantness with relatives and superiors, anxieties, headache, pain in the ear.'
      },
      'Sun-Moon': {
        nature: 'Good',
        description: 'Winning favour from superiors, increase in business, fresh enterprises.'
      },
      'Sun-Mars': {
        nature: 'Bad',
        description: 'Rheumatic and similar troubles, quarrels, danger of enteric fever.'
      },
      'Sun-Mercury': {
        nature: 'Neutral',
        description: 'Gain in money, good reputation, acquisition of new clothes.'
      },
      'Sun-Jupiter': {
        nature: 'Good',
        description: 'Benefits from friends, increase in education, employment in high circles.'
      },
      'Sun-Venus': {
        nature: 'Good',
        description: 'Gain of money, respect by rulers, likelihood of marriage.'
      },
      'Sun-Saturn': {
        nature: 'Bad',
        description: 'Constant sickness to family members, new enemies, loss of property.'
      },
      'Sun-Rahu': {
        nature: 'Bad',
        description: 'Many troubles, family disputes, journeys, fear of death.'
      },
      'Sun-Ketu': {
        nature: 'Bad',
        description: 'Loss of money, affliction of mind, nervous exhaustion.'
      },

      // MOON MAJOR PERIOD
      'Moon-Sun': {
        nature: 'Neutral',
        description: 'Feverish complaints, pains in eyes, success or failure according to positions.'
      },
      'Moon-Moon': {
        nature: 'Good',
        description: 'Devoted attention to learning, love of music, good clothing.'
      },
      'Moon-Mars': {
        nature: 'Bad',
        description: 'Quarrels and litigation, danger of disputes between husband and wife.'
      },
      'Moon-Mercury': {
        nature: 'Good',
        description: 'Acquisition of wealth from maternal relatives, new clothes.'
      },
      'Moon-Jupiter': {
        nature: 'Good',
        description: 'Increase of property, plenty of food and comforts, prosperous.'
      },
      'Moon-Venus': {
        nature: 'Good',
        description: 'Sudden gain from wife, enjoys comforts, birth of children.'
      },
      'Moon-Saturn': {
        nature: 'Bad',
        description: 'Wife\'s death or separation, mental anguish, loss of property.'
      },
      'Moon-Rahu': {
        nature: 'Bad',
        description: 'Distress of risks, dangerous diseases, waste of wealth.'
      },
      'Moon-Ketu': {
        nature: 'Bad',
        description: 'Illness to wife, loss of relatives, suffering from stomach ache.'
      },
    };

    return relationships[key] || {
      nature: 'Neutral',
      description: 'Effects depend on planetary positions and strengths.'
    };
  }

  /**
   * Get next Dasa planet in sequence
   */
  static getNextDasaPlanet(currentPlanet: PlanetName): PlanetName {
    const currentIndex = this.DASA_SEQUENCE.indexOf(currentPlanet);
    if (currentIndex === -1) return PlanetName.Ketu;
    const nextIndex = (currentIndex + 1) % this.DASA_SEQUENCE.length;
    return this.DASA_SEQUENCE[nextIndex];
  }

  /**
   * Get previous Dasa planet in sequence
   */
  static getPreviousDasaPlanet(currentPlanet: PlanetName): PlanetName {
    const currentIndex = this.DASA_SEQUENCE.indexOf(currentPlanet);
    if (currentIndex === -1) return PlanetName.Ketu;
    const prevIndex = (currentIndex - 1 + this.DASA_SEQUENCE.length) % this.DASA_SEQUENCE.length;
    return this.DASA_SEQUENCE[prevIndex];
  }

  /**
   * Calculate the balance of dasa at birth based on Moon's position in nakshatra
   */
  private static calculateDasaBalance(moonConstellation: Constellation): { lord: PlanetName; balanceDays: number } {
    const lord = this.getDasaLord(moonConstellation.name);
    const totalPeriodYears = this.getPeriod(lord);
    const totalPeriodDays = totalPeriodYears * 365.25;
    
    // Each nakshatra has 4 padas, each pada is 25% of the nakshatra
    // The pada tells us how much of the nakshatra has passed
    const pada = moonConstellation.pada;
    const portionPassed = (pada - 1) * 0.25 + 0.125; // Approximate mid-point of pada
    const portionRemaining = 1 - portionPassed;
    
    const balanceDays = totalPeriodDays * portionRemaining;
    
    return { lord, balanceDays };
  }

  /**
   * Get current Dasa info
   */
  private static getCurrentDasa(birthTime: Time, currentTime: Time): DasaInfo {
    // Get Moon's position at birth
    const positions = BirthChartCalculator.getAllPlanetPositions(birthTime);
    const moonPos = positions.find(p => p.planet === PlanetName.Moon);
    
    if (!moonPos) {
      throw new Error('Could not calculate Moon position');
    }

    // Get dasa balance at birth
    const { lord: birthDasaLord, balanceDays: birthBalance } = this.calculateDasaBalance(moonPos.constellation);
    
    const birthDate = new Date(birthTime.year, birthTime.month - 1, birthTime.day);
    const currentDate = new Date(currentTime.year, currentTime.month - 1, currentTime.day);
    
    const daysSinceBirth = Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate which dasa we're in
    let daysAccumulated = 0;
    let currentDasa = birthDasaLord;
    let currentDasaStart = birthDate;
    
    // First check if we're still in the birth dasa
    if (daysSinceBirth < birthBalance) {
      return {
        planet: currentDasa,
        startDate: birthDate,
        endDate: new Date(birthDate.getTime() + birthBalance * 24 * 60 * 60 * 1000),
        balance: birthBalance - daysSinceBirth
      };
    }
    
    daysAccumulated = birthBalance;
    currentDasa = this.getNextDasaPlanet(currentDasa);
    
    // Iterate through subsequent dasas
    for (let i = 0; i < 9; i++) {
      const dasaDays = this.getPeriod(currentDasa) * 365.25;
      
      if (daysAccumulated + dasaDays > daysSinceBirth) {
        const startDate = new Date(birthDate.getTime() + daysAccumulated * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + dasaDays * 24 * 60 * 60 * 1000);
        const balance = dasaDays - (daysSinceBirth - daysAccumulated);
        
        return {
          planet: currentDasa,
          startDate,
          endDate,
          balance
        };
      }
      
      daysAccumulated += dasaDays;
      currentDasa = this.getNextDasaPlanet(currentDasa);
    }

    // Fallback (should not reach here in normal cases)
    return {
      planet: currentDasa,
      startDate: birthDate,
      endDate: currentDate,
      balance: 0
    };
  }

  /**
   * Calculate Dasa count from birth
   */
  static calculateDasaCountFromBirth(birthTime: Time, currentTime: Time): number {
    const birthDasa = this.getCurrentDasa(birthTime, birthTime);
    const currentDasa = this.getCurrentDasa(birthTime, currentTime);

    let count = 1;
    let checkPlanet = birthDasa.planet;

    while (checkPlanet !== currentDasa.planet && count < 10) {
      checkPlanet = this.getNextDasaPlanet(checkPlanet);
      count++;
    }

    return count;
  }

  /**
   * Get complete Dasa timeline for a person
   */
  static getDasaTimeline(birthTime: Time, years: number = 120): DashaPeriod[] {
    const timeline: DashaPeriod[] = [];

    // Get Moon's position at birth
    const positions = BirthChartCalculator.getAllPlanetPositions(birthTime);
    const moonPos = positions.find(p => p.planet === PlanetName.Moon);
    
    if (!moonPos) {
      throw new Error('Could not calculate Moon position');
    }

    const { lord: birthDasaLord, balanceDays } = this.calculateDasaBalance(moonPos.constellation);
    
    let currentPlanet = birthDasaLord;
    let currentDate = new Date(birthTime.year, birthTime.month - 1, birthTime.day);
    const balanceYears = balanceDays / 365.25;

    // Add first (partial) Dasa
    const firstEndDate = new Date(currentDate.getTime() + balanceDays * 24 * 60 * 60 * 1000);
    
    timeline.push({
      planet: currentPlanet,
      startDate: new Date(currentDate),
      endDate: firstEndDate,
      level: 1
    });

    currentDate = firstEndDate;
    currentPlanet = this.getNextDasaPlanet(currentPlanet);

    // Add remaining Dasas
    let totalYears = balanceYears;
    while (totalYears < years) {
      const dasaPeriod = this.getPeriod(currentPlanet);
      const dasaDays = dasaPeriod * 365.25;
      const endDate = new Date(currentDate.getTime() + dasaDays * 24 * 60 * 60 * 1000);

      timeline.push({
        planet: currentPlanet,
        startDate: new Date(currentDate),
        endDate: endDate,
        level: 1
      });

      totalYears += dasaPeriod;
      currentDate = endDate;
      currentPlanet = this.getNextDasaPlanet(currentPlanet);
    }

    return timeline;
  }

  /**
   * Get Dasa-Bhukti periods for a specific Maha Dasa
   */
  static getBhuktiPeriods(majorPlanet: PlanetName, startDate: Date): DashaPeriod[] {
    const periods: DashaPeriod[] = [];

    const totalDasaDays = this.getPeriod(majorPlanet) * 365.25;
    let currentDate = new Date(startDate);
    let currentPlanet = majorPlanet;

    // Bhukti starts with the Maha Dasa lord itself
    for (let i = 0; i < 9; i++) {
      const bhuktiPlanet = currentPlanet;
      const bhuktiDuration = (this.getPeriod(bhuktiPlanet) / 120) * totalDasaDays;
      
      const endDate = new Date(currentDate.getTime() + bhuktiDuration * 24 * 60 * 60 * 1000);

      periods.push({
        planet: bhuktiPlanet,
        startDate: new Date(currentDate),
        endDate: endDate,
        level: 2
      });

      currentDate = endDate;
      currentPlanet = this.getNextDasaPlanet(currentPlanet);
    }

    return periods;
  }
}