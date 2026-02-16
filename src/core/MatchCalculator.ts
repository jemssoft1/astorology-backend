import { AstroCalculator } from "./AstroCalculator";
import { PlanetName, ZodiacName } from "../types/enums";
import { Time, GeoLocation } from "../types/interfaces";
import { PanchangCalculator } from "./PanchangCalculator";
import { BirthChartCalculator } from "./BirthChartCalculator";
import { DoshaCalculator } from "./DoshaCalculator";

/**
 * Match Calculator for Vedic Astrology Compatibility (Ashtakoot Guna Milan)
 */
export class MatchCalculator {
  // Nakshatra Rulers for Tara Kuta
  private static nakshatraRulers = [
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

  // Yoni (Animal Types) for Yoni Kuta
  // 0:Horse, 1:Elephant, 2:Sheep, 3:Serpent, 4:Dog, 5:Cat, 6:Rat, 7:Cow, 8:Buffalo, 9:Tiger, 10:Deer, 11:Monkey, 12:Mongoose, 13:Lion
  private static nakshatraYoni = [
    0,
    1,
    2,
    3,
    3,
    4,
    5,
    2,
    5,
    6,
    6,
    7,
    8,
    9,
    8,
    9,
    10,
    10,
    4,
    11,
    12,
    11,
    13,
    0,
    13,
    1,
    7, // 27 Nakshatras
  ];

  // Gana (Temperament) for Gana Kuta
  // 0:Deva (Divine), 1:Manushya (Human), 2:Rakshasa (Demon)
  private static nakshatraGana = [
    0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 1, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1,
    1, 0,
  ];

  // Nadi (Pulse) for Nadi Kuta
  // 0:Adi (Start/Vata), 1:Madhya (Middle/Pitta), 2:Antya (End/Kapha)
  private static nakshatraNadi = [
    0, 1, 2, 2, 1, 0, 1, 1, 2, 2, 1, 0, 0, 1, 2, 0, 1, 2, 0, 1, 2, 2, 1, 0, 1,
    2, 2,
  ];

  /**
   * Calculate 8 Kutas (Ashtakoot) Compatibility
   */
  static calculateMatch(
    boyNakshatra: number,
    boyRashi: number,
    girlNakshatra: number,
    girlRashi: number,
  ) {
    // Ensure values are 1-based indices if passed, but arrays access is 0-based.
    // Assuming inputs: Nakshatra (1-27), Rashi (1-12)
    const bNak = boyNakshatra - 1;
    const gNak = girlNakshatra - 1;
    const bRash = boyRashi;
    const gRash = girlRashi;

    const varna = this.getVarnaKuta(bRash, gRash); // 1 point
    const vashya = this.getVashyaKuta(bRash, gRash); // 2 points
    const tara = this.getTaraKuta(bNak, gNak); // 3 points
    const yoni = this.getYoniKuta(bNak, gNak); // 4 points
    const grahaMaitri = this.getGrahaMaitriKuta(bRash, gRash); // 5 points
    const gana = this.getGanaKuta(bNak, gNak); // 6 points
    const bhakoot = this.getBhakootKuta(bRash, gRash); // 7 points
    const nadi = this.getNadiKuta(bNak, gNak); // 8 points

    const totalScore =
      varna + vashya + tara + yoni + grahaMaitri + gana + bhakoot + nadi;

    return {
      totalScore,
      maxScore: 36,
      details: {
        varna: { score: varna, max: 1 },
        vashya: { score: vashya, max: 2 },
        tara: { score: tara, max: 3 },
        yoni: { score: yoni, max: 4 },
        grahaMaitri: { score: grahaMaitri, max: 5 },
        gana: { score: gana, max: 6 },
        bhakoot: { score: bhakoot, max: 7 },
        nadi: { score: nadi, max: 8 },
      },
    };
  }

  /**
   * Calculate Varna Kuta for API
   */
  static calculateVarnaKuta(input: { person1: Time; person2: Time }) {
    const { person1, person2 } = input;
    const p1Details = PanchangCalculator.getMoonConstellation(person1);
    const p2Details = PanchangCalculator.getMoonConstellation(person2);

    // Need Rashi for Varna
    const p1MoonPos = AstroCalculator.getPlanetPosition(
      PlanetName.Moon,
      person1,
    );
    const p2MoonPos = AstroCalculator.getPlanetPosition(
      PlanetName.Moon,
      person2,
    );

    const p1Rashi = p1MoonPos.sign;
    const p2Rashi = p2MoonPos.sign;

    const score = this.getVarnaKuta(p1Rashi.name, p2Rashi.name);

    return {
      varna1: p1Rashi.name,
      varna2: p2Rashi.name,
      score,
      maxScore: 1,
    };
  }

  /**
   * Calculate Yoni Kuta for API
   */
  static calculateYoniKuta(input: { person1: Time; person2: Time }) {
    const { person1, person2 } = input;
    const p1Details = PanchangCalculator.getMoonConstellation(person1);
    const p2Details = PanchangCalculator.getMoonConstellation(person2);

    const score = this.getYoniKuta(p1Details.name - 1, p2Details.name - 1);

    return {
      yoni1: this.getAnimalName(p1Details.name - 1),
      yoni2: this.getAnimalName(p2Details.name - 1),
      score,
      maxScore: 4,
    };
  }

  /**
   * Calculate Gana Kuta for API
   */
  static calculateGanaKuta(input: { person1: Time; person2: Time }) {
    const { person1, person2 } = input;
    const p1Details = PanchangCalculator.getMoonConstellation(person1);
    const p2Details = PanchangCalculator.getMoonConstellation(person2);

    const score = this.getGanaKuta(p1Details.name - 1, p2Details.name - 1);

    return {
      gana1: this.getGanaName(p1Details.name - 1),
      gana2: this.getGanaName(p2Details.name - 1),
      score,
      maxScore: 6,
    };
  }

  /**
   * Calculate Nadi Kuta for API
   */
  static calculateNadiKuta(input: { person1: Time; person2: Time }) {
    const { person1, person2 } = input;
    const p1Details = PanchangCalculator.getMoonConstellation(person1);
    const p2Details = PanchangCalculator.getMoonConstellation(person2);

    const score = this.getNadiKuta(p1Details.name - 1, p2Details.name - 1);

    return {
      nadi1: this.getNadiName(p1Details.name - 1),
      nadi2: this.getNadiName(p2Details.name - 1),
      score,
      maxScore: 8,
    };
  }

  // Helpers for names
  private static getAnimalName(nakIndex: number): string {
    const animals = [
      "Horse",
      "Elephant",
      "Sheep",
      "Serpent",
      "Dog",
      "Cat",
      "Rat",
      "Cow",
      "Buffalo",
      "Tiger",
      "Deer",
      "Monkey",
      "Mongoose",
      "Lion",
    ];
    const yoniIndex = this.nakshatraYoni[nakIndex];
    return animals[yoniIndex] || "Unknown";
  }

  private static getGanaName(nakIndex: number): string {
    const ganas = ["Deva", "Manushya", "Rakshasa"];
    return ganas[this.nakshatraGana[nakIndex]] || "Unknown";
  }

  private static getNadiName(nakIndex: number): string {
    const nadis = ["Adi (Vata)", "Madhya (Pitta)", "Antya (Kapha)"];
    return nadis[this.nakshatraNadi[nakIndex]] || "Unknown";
  }

  // 1. Varna Kuta (Work/Class Compatibility) - Max 1
  private static getVarnaKuta(boyRashi: number, girlRashi: number): number {
    // Simplified Logic:
    // Brahmin: Cancer, Scorpio, Pisces (4, 8, 12)
    // Kshatriya: Aries, Leo, Sagittarius (1, 5, 9)
    // Vaishya: Taurus, Virgo, Capricorn (2, 6, 10)
    // Shudra: Gemini, Libra, Aquarius (3, 7, 11)

    const getVarnaRank = (rashi: number) => {
      if ([4, 8, 12].includes(rashi)) return 4; // Brahmin (Highest)
      if ([1, 5, 9].includes(rashi)) return 3; // Kshatriya
      if ([2, 6, 10].includes(rashi)) return 2; // Vaishya
      if ([3, 7, 11].includes(rashi)) return 1; // Shudra
      return 0;
    };

    const bRank = getVarnaRank(boyRashi);
    const gRank = getVarnaRank(girlRashi);

    // If Boy >= Girl, 1 point. Otherwise 0.
    return bRank >= gRank ? 1 : 0;
  }

  // 2. Vashya Kuta (Dominance/Attraction) - Max 2
  private static getVashyaKuta(boyRashi: number, girlRashi: number): number {
    // Detailed lookup table omitted for brevity, using simplified compatible groups
    // Same sign is usually good (except some).
    // Friendly signs get points.
    if (boyRashi === girlRashi) return 2;

    const isCompatible = (r1: number, r2: number) => {
      // Basic compatibility check (Trines are good 5/9, 3/11 good)
      const diff = Math.abs(r1 - r2);
      if (diff === 4 || diff === 8) return true; // Trine
      if (diff === 2 || diff === 10) return true; // 3/11
      return false;
    };

    if (isCompatible(boyRashi, girlRashi)) return 2;
    return 0.5; // Default low score for non-enemy
  }

  // 3. Tara Kuta (Destiny/Star) - Max 3
  private static getTaraKuta(boyNak: number, girlNak: number): number {
    // Count from Girl to Boy
    const count = ((boyNak - girlNak + 27) % 27) + 1;
    const remainder = count % 9;

    // 3, 5, 7 are bad usually.
    // 0 (9), 1, 2, 4, 6, 8 are good.
    if (remainder === 3 || remainder === 5 || remainder === 7) return 0; // Vipat, Pratyak, Naidhana
    return 3; // Sampat, Kshema, Sadhana, Mitra, Param Mitra etc. simplified
    // Note: Real calculation is more nuanced checking both ways, but this is the standard simplified rule.
  }

  // 4. Yoni Kuta (Sexual Compatibility) - Max 4
  private static getYoniKuta(boyNak: number, girlNak: number): number {
    const bYoni = this.nakshatraYoni[boyNak];
    const gYoni = this.nakshatraYoni[girlNak];

    if (bYoni === gYoni) return 4;

    // Hostility matrix simplified (Enemies get 0, Neutrals 2, Friends 3)
    // Enemy Pairs:
    // Horse(0) - Buffalo(8)
    // Elephant(1) - Lion(13)
    // Sheep(2) - Monkey(11)
    // Serpent(3) - Mongoose(12)
    // Dog(4) - Deer(10)
    // Cat(5) - Rat(6)
    // Cow(7) - Tiger(9)

    const isEnemy = (y1: number, y2: number) => {
      if ((y1 === 0 && y2 === 8) || (y1 === 8 && y2 === 0)) return true;
      if ((y1 === 1 && y2 === 13) || (y1 === 13 && y2 === 1)) return true;
      if ((y1 === 2 && y2 === 11) || (y1 === 11 && y2 === 2)) return true;
      if ((y1 === 3 && y2 === 12) || (y1 === 12 && y2 === 3)) return true;
      if ((y1 === 4 && y2 === 10) || (y1 === 10 && y2 === 4)) return true;
      if ((y1 === 5 && y2 === 6) || (y1 === 6 && y2 === 5)) return true;
      if ((y1 === 7 && y2 === 9) || (y1 === 9 && y2 === 7)) return true;
      return false;
    };

    if (isEnemy(bYoni, gYoni)) return 0;
    return 2; // Neutral/Average
  }

  // 5. Graha Maitri Kuta (Planetary Friendship) - Max 5
  private static getGrahaMaitriKuta(
    boyRashi: number,
    girlRashi: number,
  ): number {
    const lords = [
      -1, // 0 index dummy
      PlanetName.Mars, // Aries 1
      PlanetName.Venus, // Taurus 2
      PlanetName.Mercury, // Gemini 3
      PlanetName.Moon, // Cancer 4
      PlanetName.Sun, // Leo 5
      PlanetName.Mercury, // Virgo 6
      PlanetName.Venus, // Libra 7
      PlanetName.Mars, // Scorpio 8
      PlanetName.Jupiter, // Sagittarius 9
      PlanetName.Saturn, // Capricorn 10
      PlanetName.Saturn, // Aquarius 11
      PlanetName.Jupiter, // Pisces 12
    ];

    const bLord = lords[boyRashi];
    const gLord = lords[girlRashi];

    if (bLord === gLord) return 5;

    // Simplified Friendship logic
    // Friends: Sun-Moon-Mars-Jupiter loop. Venus-Mercury-Saturn loop.
    // Enemies crossed.

    // For quick implementation, checking if they belong to same group
    const group1 = [
      PlanetName.Sun,
      PlanetName.Moon,
      PlanetName.Mars,
      PlanetName.Jupiter,
      PlanetName.Ketu,
    ];
    const group2 = [
      PlanetName.Venus,
      PlanetName.Mercury,
      PlanetName.Saturn,
      PlanetName.Rahu,
    ];

    const bG1 = group1.includes(bLord);
    const gG1 = group1.includes(gLord);

    if (bG1 === gG1) return 5; // Same group = Friends
    return 0; // Different group = Enemies (Simplified) - Real logic has neutrals (Score 3 or 4)
  }

  // 6. Gana Kuta (Temperament) - Max 6
  private static getGanaKuta(boyNak: number, girlNak: number): number {
    const bGana = this.nakshatraGana[boyNak];
    const gGana = this.nakshatraGana[girlNak];

    if (bGana === gGana) return 6; // Same Gana = Perfect

    // Order: Deva(0), Manushya(1), Rakshasa(2)
    // Deva - Manushya : Good (5-6)
    // Manushya - Rakshasa : Bad (0) sometimes allowed passing (1)
    // Deva - Rakshasa : Bad (0-1)

    if ((bGana === 0 && gGana === 1) || (bGana === 1 && gGana === 0)) return 6;
    if (gGana === 2) return 0; // Girl Rakshasa generally avoided with non-Rakshasa boy

    return 1; // Low compatibility
  }

  // 7. Bhakoot Kuta (Rashi Compatibility) - Max 7
  private static getBhakootKuta(boyRashi: number, girlRashi: number): number {
    // Count from Boy to Girl ?? Or generally distance.
    // 1-1, 1-7 : Good (7)
    // 2-12 : Bad (0) "Dwirdwadash"
    // 6-8 : Bad (0) "Shadashtaka"
    // 5-9 : Bad (0) "Navam-Pancham" (Sometimes 0 sometimes good depending on lords)
    // 3-11 : Good (7)
    // 4-10 : Good (7)

    // Distance calculation
    let diff = (girlRashi - boyRashi + 12) % 12; // 0 to 11
    if (diff === 0) diff = 0; // Same sign is 1/1 relation effectively distance 0 here?
    // Standard: count inclusive.
    // Same sign (1-1): 7 pts
    if (boyRashi === girlRashi) return 7;

    const count = ((girlRashi - boyRashi + 12) % 12) + 1; // 1 to 12 positions

    if ([2, 12].includes(count)) return 0; // 2-12
    if ([6, 8].includes(count)) return 0; // 6-8
    if ([5, 9].includes(count)) return 0; // 5-9 (Usually considered bad for marriage/progeny in strict calc, some say good for love) - standard Ashtakoot often gives 0 here.

    return 7; // 3-11, 4-10, 1-7 are good
  }

  // 8. Nadi Kuta (Health/Genes) - Max 8
  private static getNadiKuta(boyNak: number, girlNak: number): number {
    const bNadi = this.nakshatraNadi[boyNak];
    const gNadi = this.nakshatraNadi[girlNak];

    if (bNadi === gNadi) return 0; // Same Nadi = Dosha = 0 points
    return 8; // Different Nadi = 8 points
  }

  /**
   * Generates a detailed Match Report matching the requested JSON structure
   */
  /**
   * Generates a detailed Match Report matching the requested JSON structure
   */
  static getMatchReport(
    maleTime: Time,
    femaleTime: Time,
    maleLoc: GeoLocation,
    femaleLoc: GeoLocation,
    maleName: string = "Male",
    femaleName: string = "Female",
  ): any {
    const maleChart = BirthChartCalculator.generateBirthChart(maleTime);
    const femaleChart = BirthChartCalculator.generateBirthChart(femaleTime);

    const maleDetails = PanchangCalculator.getMoonConstellation(maleTime);
    const femaleDetails = PanchangCalculator.getMoonConstellation(femaleTime);

    const maleMoonPos = maleChart.planets.find(
      (p) => p.planet === PlanetName.Moon,
    )!;
    const femaleMoonPos = femaleChart.planets.find(
      (p) => p.planet === PlanetName.Moon,
    )!;

    const bNak = maleDetails.name; // 1-27
    const gNak = femaleDetails.name; // 1-27
    const bRashi = maleMoonPos.sign.name; // 1-12
    const gRashi = femaleMoonPos.sign.name;

    // 2. Calculate Ashtakoot
    const varna = this.getVarnaKuta(bRashi, gRashi);
    const vashya = this.getVashyaKuta(bRashi, gRashi);
    const tara = this.getTaraKuta(bNak - 1, gNak - 1);
    const yoni = this.getYoniKuta(bNak - 1, gNak - 1);
    const grahaMaitri = this.getGrahaMaitriKuta(bRashi - 1, gRashi - 1);
    const gana = this.getGanaKuta(bNak - 1, gNak - 1);
    const bhakoot = this.getBhakootKuta(bRashi, gRashi);
    const nadi = this.getNadiKuta(bNak - 1, gNak - 1);

    const totalScore =
      varna + vashya + tara + yoni + grahaMaitri + gana + bhakoot + nadi;

    // 3. New Kutas Logic
    // Mahendra: Count from Girl to Boy
    const nakCount = ((bNak - gNak + 27) % 27) + 1;
    const isMahendra = [4, 7, 10, 13, 16, 19, 22, 25].includes(nakCount);

    // Stree Deergha: Distance > 9 (some say 13)
    const isStreeDeergha = nakCount > 9;

    // Vedha: Forbidden pairs (Simplified check for common ones)
    // Ashwini(1)-Jyeshta(18), Bharani(2)-Anuradha(17), etc.
    const vedhaPairs = [
      [1, 18],
      [2, 17],
      [3, 16],
      [4, 15],
      [6, 22],
      [7, 21],
      [8, 20],
      [9, 19],
      [10, 27],
      [11, 26],
      [12, 25],
      [13, 24],
      [5, 14],
    ]; // Pairs
    const isVedha = vedhaPairs.some(
      (pair) =>
        (pair[0] === bNak && pair[1] === gNak) ||
        (pair[0] === gNak && pair[1] === bNak),
    );

    // Kuja Dosha
    const maleDosha = DoshaCalculator.calculateMangalDosha(maleTime);
    const femaleDosha = DoshaCalculator.calculateMangalDosha(femaleTime);
    const isDoshaMatch =
      maleDosha.hasDosha === femaleDosha.hasDosha ||
      (maleDosha.severity === "Low" && femaleDosha.severity === "Low");

    // PartnersDeath (Malefics in 2nd/7th)
    // Malefics: Sun, Mars, Saturn, Rahu, Ketu
    const malefics = [
      PlanetName.Sun,
      PlanetName.Mars,
      PlanetName.Saturn,
      PlanetName.Rahu,
      PlanetName.Ketu,
    ];
    const getHousePlanets = (chart: any, houseNum: number) =>
      chart.planets.filter((p: any) => {
        // Simplified Logic: Planet in House X
        // Assuming houses are sorted 1-12
        // Find house object
        const h = chart.houses.find((h: any) => h.number === houseNum);
        if (!h) return false;
        // Check if planet longitude is within house range (simplified sign based check better here)
        // Fallback: Sign based
        const ascSign = chart.lagna.name;
        const planetSign = p.sign.name;
        let hIdx = planetSign - ascSign + 1;
        if (hIdx <= 0) hIdx += 12;
        return hIdx === houseNum;
      });

    const checkMalefics = (chart: any) => {
      const h2 = getHousePlanets(chart, 2).filter((p: any) =>
        malefics.includes(p.planet),
      );
      const h7 = getHousePlanets(chart, 7).filter((p: any) =>
        malefics.includes(p.planet),
      );
      return h2.length > 0 || h7.length > 0;
    };
    const maleMalefics = checkMalefics(maleChart);
    const femaleMalefics = checkMalefics(femaleChart);

    // Bad Constellation (Moola, etc)
    const badNaks = [9, 16, 18, 19]; // Ashlesha, Visakha, Jyeshtha, Moola
    const hasBadNak = badNaks.includes(bNak) || badNaks.includes(gNak);

    // --- New Prediction Logic Implementation ---

    // Helper: Get Planet Sign Index (1-12)
    const getSignIndex = (chart: any, planetName: PlanetName): number => {
      const p = chart.planets.find((x: any) => x.planet === planetName);
      return p ? (p.sign.name as unknown as number) : -1;
    };

    // Helper: Get Planet House (1-12)
    const getHouseNum = (chart: any, planetName: PlanetName): number => {
      const p = chart.planets.find((x: any) => x.planet === planetName);
      if (!p) return -1;
      // Simplified calculation: Planet Sign - Ascendant Sign + 1
      const ascSign = chart.lagna.name as unknown as number;
      const pSign = p.sign.name as unknown as number;
      let h = pSign - ascSign + 1;
      if (h <= 0) h += 12;
      return h;
    };

    // 1. PlanetaryTrineHarmony
    // Check if Male Venus & Female Venus (and Mars, Jupiter) are in trine (1, 5, 9 houses relative / same element).
    const checkTrine = (pName: PlanetName) => {
      const s1 = getSignIndex(maleChart, pName);
      const s2 = getSignIndex(femaleChart, pName);
      // Signs are 1, 5, 9 apart involves distance 0, 4, 8.
      const diff = Math.abs(s1 - s2) % 12;
      return diff === 0 || diff === 4 || diff === 8;
    };
    const trineHarmony =
      checkTrine(PlanetName.Venus) ||
      checkTrine(PlanetName.Mars) ||
      checkTrine(PlanetName.Jupiter);
    const trineInfo = trineHarmony
      ? "Trine alignment detected"
      : "No trine alignment";

    // 2. SunMoonHarmony
    // Sun-Sun or Moon-Moon avoid 2/12 relationship.
    const checkHarmony = (pName: PlanetName) => {
      const s1 = getSignIndex(maleChart, pName);
      const s2 = getSignIndex(femaleChart, pName);
      const dist = ((s2 - s1 + 12) % 12) + 1;
      return dist !== 2 && dist !== 12;
    };
    const sunHarm = checkHarmony(PlanetName.Sun);
    const moonHarm = checkHarmony(PlanetName.Moon);
    const sunMoonHarm = sunHarm && moonHarm;
    const sunMoonInfo = sunMoonHarm ? "Good placement" : "Bad 2/12 placement";

    // 3. MarsSeventhNoBenefic
    // Mars in 7th without benefic aspect.
    // Simplified: Check if Mars is in 7th. If not, Good. If yes, assume bad for now (missing aspect logic).
    const checkMars7 = (chart: any) => {
      const marsHouse = getHouseNum(chart, PlanetName.Mars);
      return marsHouse === 7;
    };
    const mMars7 = checkMars7(maleChart);
    const fMars7 = checkMars7(femaleChart);
    const mars7Result = !mMars7 && !fMars7;

    // 4. SunMoonMarsVenusTwelve
    // Mars-Venus 12th linkage.
    const check12 = (
      p1Owner: any,
      p2Owner: any,
      p1Name: PlanetName,
      p2Name: PlanetName,
    ) => {
      const s1 = getSignIndex(p1Owner, p1Name);
      const s2 = getSignIndex(p2Owner, p2Name);
      const d = ((s2 - s1 + 12) % 12) + 1;
      return d === 2 || d === 12; // 2/12 relation
    };
    const mv12 =
      check12(maleChart, femaleChart, PlanetName.Mars, PlanetName.Venus) ||
      check12(femaleChart, maleChart, PlanetName.Mars, PlanetName.Venus);

    // 5. VenusSaturnConnection
    // Venus in one = Saturn sign in the other.
    const checkVenSat = (c1: any, c2: any) => {
      const vSign = getSignIndex(c1, PlanetName.Venus);
      const sSign = getSignIndex(c2, PlanetName.Saturn);
      return vSign === sSign;
    };
    const venSatConn =
      checkVenSat(maleChart, femaleChart) ||
      checkVenSat(femaleChart, maleChart);

    // 6. SaturnSeventhStabilityWithColdness
    const sat7M = getHouseNum(maleChart, PlanetName.Saturn) === 7;
    const sat7F = getHouseNum(femaleChart, PlanetName.Saturn) === 7;
    const sat7 = sat7M || sat7F;

    // 7. MaleficInFourth
    // Malefics in 4th: Sun, Mars, Sat, Rahu, Ketu.
    const checkMal4 = (chart: any) => {
      const mals = [
        PlanetName.Sun,
        PlanetName.Mars,
        PlanetName.Saturn,
        PlanetName.Rahu,
        PlanetName.Ketu,
      ];
      return mals.some((m) => getHouseNum(chart, m) === 4);
    };
    const mal4 = checkMal4(maleChart) || checkMal4(femaleChart);

    // 8. SaturnEighthAspectedByMars
    const checkSat8Mars = (chart: any) => {
      const satH = getHouseNum(chart, PlanetName.Saturn);
      if (satH !== 8) return false;
      // Mars aspects 8th from 1st (8th aspect), 5th (4th aspect), 2nd (7th aspect - wait Mars is 4,7,8).
      // Mars aspects 7th, 4th, 8th from itself.
      // So for Mars to look at 8th House:
      // Mars in 2nd (aspects 8th - 7th look)
      // Mars in 5th (aspects 8th - 4th look)
      // Mars in 1st (aspects 8th - 8th look)
      const marsH = getHouseNum(chart, PlanetName.Mars);
      return [1, 2, 5].includes(marsH);
    };
    const sat8Mars = checkSat8Mars(maleChart) || checkSat8Mars(femaleChart);

    // Helper to get formatted planet info: "Sun: Aries (1)"
    const getPInfo = (chart: any, pName: PlanetName) => {
      const p = chart.planets.find((x: any) => x.planet === pName);
      if (!p) return "";
      const sign = p.sign.name;
      const house = getHouseNum(chart, pName);
      return `${PlanetName[pName]}: ${sign} (${house})`;
    };

    // Helper for specific items
    const getTrineInfo = (chart: any) =>
      `${getPInfo(chart, PlanetName.Venus)}, ${getPInfo(chart, PlanetName.Mars)}`;
    const getSunMoonInfo = (chart: any) =>
      `${getPInfo(chart, PlanetName.Sun)}, ${getPInfo(chart, PlanetName.Moon)}`;
    const getMarsInfo = (chart: any) => getPInfo(chart, PlanetName.Mars);
    const getMarVenInfo = (chart: any) =>
      `${getPInfo(chart, PlanetName.Mars)}, ${getPInfo(chart, PlanetName.Venus)}`;
    const getVenSatInfo = (chart: any) =>
      `${getPInfo(chart, PlanetName.Venus)}, ${getPInfo(chart, PlanetName.Saturn)}`;
    const getSatInfo = (chart: any) => getPInfo(chart, PlanetName.Saturn);

    // Malefics in 4th INFO helper
    const getMal4Info = (chart: any) => {
      const mals = [
        PlanetName.Sun,
        PlanetName.Mars,
        PlanetName.Saturn,
        PlanetName.Rahu,
        PlanetName.Ketu,
      ];
      const present = mals.filter((m) => getHouseNum(chart, m) === 4);
      return present.length > 0
        ? present.map((p) => PlanetName[p]).join(", ")
        : "None";
    };

    // 4. Build Prediction List (Exact Order requested)
    const predictionList = [
      {
        Name: "Graha Maitram",
        Nature: grahaMaitri > 2.5 ? "Good" : "Bad",
        MaleInfo: `Moon: ${maleMoonPos.sign.name}`,
        FemaleInfo: `Moon: ${femaleMoonPos.sign.name}`,
        Info:
          grahaMaitri === 5
            ? "Friendly"
            : grahaMaitri >= 3
              ? "Neutral"
              : "Enemy",
        Description: "happiness, mental compatibility (important)",
      },
      {
        Name: "Rajju",
        Nature: "Neutral", // Placeholder
        MaleInfo: `Nak: ${bNak}`,
        FemaleInfo: `Nak: ${gNak}`,
        Info: "constellations in different groups (placeholder)",
        Description: "strength/duration of married life (important)",
      },
      {
        Name: "Nadi Kuta",
        Nature: nadi > 0 ? "Good" : "Bad",
        MaleInfo: this.getNadiName(bNak - 1),
        FemaleInfo: this.getNadiName(gNak - 1),
        Info: nadi === 8 ? "agreement good" : "disagreement",
        Description: "nervous energy compatibility (important)",
      },
      {
        Name: "Vasya Kuta",
        Nature: vashya > 0 ? "Good" : "Bad",
        MaleInfo: maleMoonPos.sign.name,
        FemaleInfo: femaleMoonPos.sign.name,
        Info: vashya === 2 ? "good control" : "no control",
        Description: "degree of magnetic control",
      },
      {
        Name: "Dina Kuta",
        Nature: tara > 1.5 ? "Good" : "Bad",
        MaleInfo: `Nak: ${bNak}`,
        FemaleInfo: `Nak: ${gNak}`,
        Info: `Score: ${tara}`,
        Description: "day to day living compatibility",
      },
      {
        Name: "Guna Kuta",
        Nature: gana > 3 ? "Good" : "Bad",
        MaleInfo: this.getGanaName(bNak - 1),
        FemaleInfo: this.getGanaName(gNak - 1),
        Info: gana === 6 ? "Match" : "Mismatch",
        Description: "temperament and character compatibility",
      },
      {
        Name: "Mahendra",
        Nature: isMahendra ? "Good" : "Bad",
        MaleInfo: `${bNak}`,
        FemaleInfo: `${gNak}`,
        Info: isMahendra ? "promotes well-being" : "not optimal",
        Description: "well-being and longevity",
      },
      {
        Name: "Stree Deergha",
        Nature: isStreeDeergha ? "Good" : "Bad",
        MaleInfo: `${nakCount}`,
        FemaleInfo: "Limit 9",
        Info: isStreeDeergha ? "good distance" : "too close",
        Description: "husband well being, longevity and prosperity",
      },
      {
        Name: "Rasi Kuta",
        Nature: bhakoot > 0 ? "Good" : "Bad",
        MaleInfo: `${bRashi}`,
        FemaleInfo: `${gRashi}`,
        Info: bhakoot === 7 ? "Good position" : "Bad position",
        Description: "rasi compatibility",
      },
      {
        Name: "Vedha",
        Nature: !isVedha ? "Good" : "Bad",
        MaleInfo: `Nak: ${bNak}`,
        FemaleInfo: `Nak: ${gNak}`,
        Info: !isVedha ? "no vedha" : "vedha present",
        Description: "birth constellations compatibility",
      },
      {
        Name: "Varna",
        Nature: varna > 0 ? "Good" : "Bad",
        MaleInfo: `${bRashi}`,
        FemaleInfo: `${gRashi}`,
        Info: varna > 0 ? "Good" : "Bad",
        Description: "spiritual/ego compatibility",
      },
      {
        Name: "Yoni Kuta",
        Nature: yoni > 2 ? "Good" : "Bad",
        MaleInfo: this.getAnimalName(bNak - 1),
        FemaleInfo: this.getAnimalName(gNak - 1),
        Info: yoni === 4 ? "Perfect" : "Average/Bad",
        Description: "sex compatibility",
      },
      {
        Name: "Lagna And 7th Good",
        Nature: "Good", // Placeholder default
        MaleInfo: `${maleChart.lagna.name}`,
        FemaleInfo: `${femaleChart.lagna.name}`,
        Info: "marriage stable (placeholder)",
        Description: "special combination",
      },
      {
        Name: "Kuja Dosa",
        Nature: isDoshaMatch ? "Good" : "Bad",
        MaleInfo: maleDosha.hasDosha ? "Yes" : "No",
        FemaleInfo: femaleDosha.hasDosha ? "Yes" : "No",
        Info: isDoshaMatch
          ? "Match is good (dosha cancelled or equal)"
          : "Dosha mismatch",
        Description: "if bad, may cause death/bad health to spouse",
      },
      {
        Name: "Bad Constellation",
        Nature: !hasBadNak ? "Good" : "Bad",
        MaleInfo: `Nak: ${bNak}`,
        FemaleInfo: `Nak: ${gNak}`,
        Info: !hasBadNak
          ? "no evil constellation"
          : "evil constellation present",
        Description: "checks if evil constellation is in chart",
      },
      {
        Name: "Sex Energy",
        Nature: (() => {
          const getEnergy = (chart: any) => {
            const h7Planets = chart.planets.filter(
              (p: any) => getHouseNum(chart, p.planet) === 7,
            );
            if (
              h7Planets.some((p: any) =>
                [PlanetName.Mars, PlanetName.Venus].includes(p.planet),
              )
            )
              return "High";
            if (
              h7Planets.some((p: any) =>
                [PlanetName.Saturn, PlanetName.Ketu, PlanetName.Sun].includes(
                  p.planet,
                ),
              )
            )
              return "Low";
            if (h7Planets.length === 0) return "Normal";
            return "Normal";
          };
          const mEnergy = getEnergy(maleChart);
          const fEnergy = getEnergy(femaleChart);
          if (mEnergy === fEnergy) return "Good";
          if (
            (mEnergy === "High" && fEnergy === "Low") ||
            (mEnergy === "Low" && fEnergy === "High")
          )
            return "Bad";
          return "Neutral";
        })(),
        MaleInfo: (() => {
          const h7Planets = maleChart.planets.filter(
            (p: any) => getHouseNum(maleChart, p.planet) === 7,
          );
          return h7Planets.length > 0
            ? h7Planets.map((p: any) => PlanetName[p.planet]).join(",")
            : "Empty";
        })(),
        FemaleInfo: (() => {
          const h7Planets = femaleChart.planets.filter(
            (p: any) => getHouseNum(femaleChart, p.planet) === 7,
          );
          return h7Planets.length > 0
            ? h7Planets.map((p: any) => PlanetName[p.planet]).join(",")
            : "Empty";
        })(),
        Info: "Checked planets in 7th house",
        Description: "sexual compatibility based on planets in 7th house",
      },
      {
        Name: "PartnersDeath",
        Nature: !maleMalefics && !femaleMalefics ? "Good" : "Neutral",
        MaleInfo: maleMalefics ? "Malefics in 2/7" : "Safe",
        FemaleInfo: femaleMalefics ? "Malefics in 2/7" : "Safe",
        Info: "malefic checking in 2nd/7th",
        Description: "If malefic planets occupy both the 2nd and 7th houses",
      },
      {
        Name: "PlanetaryTrineHarmony",
        Nature: trineHarmony ? "Good" : "Neutral",
        MaleInfo: getTrineInfo(maleChart),
        FemaleInfo: getTrineInfo(femaleChart),
        Info: trineInfo,
        Description:
          "Venus, Mars, Jupiter in trine houses (1/5/9) between charts",
      },
      {
        Name: "SunMoonHarmony",
        Nature: sunMoonHarm ? "Good" : "Bad",
        MaleInfo: getSunMoonInfo(maleChart),
        FemaleInfo: getSunMoonInfo(femaleChart),
        Info: sunMoonInfo,
        Description: "Sun–Sun and Moon–Moon positions (avoid 2nd or 12th)",
      },
      {
        Name: "MarsSeventhNoBenefic",
        Nature: mars7Result ? "Good" : "Neutral",
        MaleInfo: getMarsInfo(maleChart),
        FemaleInfo: getMarsInfo(femaleChart),
        Info: mars7Result
          ? "No un-aspected Mars in 7th"
          : "Mars in 7th present",
        Description: "Mars in 7th without benefic aspects → quarrels",
      },
      {
        Name: "SunMoonMarsVenusTwelve",
        Nature: !mv12 ? "Good" : "Empty",
        MaleInfo: getMarVenInfo(maleChart),
        FemaleInfo: getMarVenInfo(femaleChart),
        Info: !mv12 ? "No 12th linkage" : "12th linkage detected",
        Description: "Mars–Venus 12th linkage vs. Sun–Moon harmony",
      },
      {
        Name: "VenusSaturnConnection",
        Nature: venSatConn ? "Good" : "Neutral",
        MaleInfo: getVenSatInfo(maleChart),
        FemaleInfo: getVenSatInfo(femaleChart),
        Info: venSatConn ? "Connection Found" : "No Connection",
        Description:
          "Venus in one = Saturn sign in the other → serious, industrious",
      },
      {
        Name: "SaturnSeventhStabilityWithColdness",
        Nature: sat7 ? "Neutral" : "Good",
        MaleInfo: getSatInfo(maleChart),
        FemaleInfo: getSatInfo(femaleChart),
        Info: sat7 ? "Saturn detected in 7th" : "No Saturn in 7th",
        Description: "Saturn in 7th → stability + coldness",
      },
      {
        Name: "MaleficInFourth",
        Nature: !mal4 ? "Good" : "Neutral",
        MaleInfo: getMal4Info(maleChart),
        FemaleInfo: getMal4Info(femaleChart),
        Info: !mal4 ? "No malefics in 4th" : "Malefics in 4th detected",
        Description: "Strong malefic in 4th unless neutralised",
      },
      {
        Name: "SaturnEighthAspectedByMars",
        Nature: !sat8Mars ? "Good" : "Bad",
        MaleInfo: `${getSatInfo(maleChart)} | MarsHouse: ${getHouseNum(maleChart, PlanetName.Mars)}`,
        FemaleInfo: `${getSatInfo(femaleChart)} | MarsHouse: ${getHouseNum(femaleChart, PlanetName.Mars)}`,
        Info: !sat8Mars ? "No check positive" : "Condition detected",
        Description:
          "Saturn in 8th aspected by Mars (4th or 8th) → poor understanding",
      },
    ];

    // 4. Construct Response
    return {
      Embeddings: [varna, vashya, tara, yoni, grahaMaitri, gana, bhakoot, nadi],
      KutaScore: totalScore,
      Notes: totalScore > 18 ? "Good Match" : "Below Average Match",
      Male: {
        PersonId: "male",
        Name: maleName,
        Notes: "",
        BirthTime: maleTime,
        Gender: "Male",
        OwnerId: "101",
        LifeEventList: [],
      },
      Female: {
        PersonId: "female",
        Name: femaleName,
        Notes: "",
        BirthTime: femaleTime,
        Gender: "Female",
        OwnerId: "101",
        LifeEventList: [],
      },
      PredictionList: predictionList,
      Summary: {
        HeartIcon: totalScore > 18 ? "mdi:heart-plus" : "mdi:heart-broken",
        ScoreColor: totalScore > 18 ? "#00a702" : "#ff0000",
        ScoreSummary:
          totalScore > 25
            ? "Excellent Match"
            : totalScore > 18
              ? "Good Match"
              : "Bad Match",
      },

      Id: "generated_id",
    };
  }
}
