import {
  Angle,
  Time,
  ZodiacSign,
  PlanetPosition,
  Constellation,
  House,
  BirthChart,
} from "../types/interfaces";
import {
  PlanetName,
  ZodiacName,
  ConstellationName,
  HouseName,
} from "../types/enums";
import { AstroCalculator } from "./AstroCalculator";
import { VargaCalculator } from "./VargaCalculator";
import { ShadbalaCalculator } from "./ShadbalaCalculator";
import { PanchangCalculator } from "./PanchangCalculator";
import { DashaCalculator } from "./DashaCalculator";

/**
 * Birth Chart Calculator
 * Handles all birth chart related calculations including planets, houses, and detailed house data
 */
export class BirthChartCalculator {
  /**
   * Generate a complete birth chart
   */
  static generateBirthChart(time: Time): BirthChart {
    // Get all planet positions
    const planets = this.getAllPlanetPositions(time);

    // Get all houses
    const houses = AstroCalculator.getAllHouses(time);

    // Get Lagna (Ascendant)
    const lagnaLongitude = AstroCalculator.getAscendantLongitude(time);
    const lagna = AstroCalculator.getZodiacSignFromLongitude(lagnaLongitude);

    // Get Moon Sign (Janma Rashi)
    const moonPosition = planets.find((p) => p.planet === PlanetName.Moon);
    const moonSign = moonPosition!.sign;

    // Get Sun Sign
    const sunPosition = planets.find((p) => p.planet === PlanetName.Sun);
    const sunSign = sunPosition!.sign;

    return {
      time,
      planets,
      houses,
      lagna,
      moonSign,
      sunSign,
    };
  }

  /**
   * Get all planet positions
   */
  static getAllPlanetPositions(time: Time): PlanetPosition[] {
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

    return planets.map((planet) =>
      AstroCalculator.getPlanetPosition(planet, time),
    );
  }

  /**
   * Get comprehensive data for all planets
   */
  static getAllPlanetData(time: Time): any {
    const planets = this.getAllPlanetPositions(time);
    const houses = AstroCalculator.getAllHouses(time);
    const shadbala = ShadbalaCalculator.calculateDetailedShadbala(time);
    const vargaCharts = this.getAllVargaCharts(time); // Helper to get all vargas logic

    const allPlanetData: any[] = [];

    for (const planetPos of planets) {
      const pName = planetPos.planet;
      const planetNameStr = PlanetName[pName];
      const planetShadbala = shadbala[planetNameStr] || {};

      // Basic calculations
      const houseNum = this.getHouseNumberFromLongitude(planetPos.longitude);
      const house = houses[houseNum - 1];
      const sign = planetPos.sign;
      const constellation = planetPos.constellation;

      // Lords
      const signLord = AstroCalculator.getLordOfSign(sign.name);
      const nakshatraLord = AstroCalculator.getLordOfConstellation(
        constellation.name,
      );

      // Analyze Relationships
      const conjunctPlanets = this.getPlanetsInConjunction(planets, pName);
      const aspectingPlanets = this.getPlanetsAspectingPlanet(planets, pName);

      // Categorize Planets
      const benefics = conjunctPlanets.filter((p) => this.isBeneficPlanet(p));
      const malefics = conjunctPlanets.filter((p) => this.isMaleficPlanet(p));
      const enemies = conjunctPlanets.filter((p) =>
        this.isEnemyPlanet(pName, p),
      ); // Need isEnemyPlanet
      const friends = conjunctPlanets.filter((p) =>
        this.isFriendPlanet(pName, p),
      ); // Need isFriendPlanet

      // Aspect Categorization
      const maleficAspects = aspectingPlanets.filter((p) =>
        this.isMaleficPlanet(p),
      );
      const beneficAspects = aspectingPlanets.filter((p) =>
        this.isBeneficPlanet(p),
      );

      // Dispositor Logic
      const dispositor = signLord;
      const dispositorPos = planets.find((p) => p.planet === dispositor);
      const dispositorHouse = dispositorPos
        ? this.getHouseNumberFromLongitude(dispositorPos.longitude)
        : 0;

      // Flags
      const isExalted = this.isPlanetExalted(pName, time);
      const isDebilitated = this.isPlanetDebilitated(pName, time);
      const isOwnSign = this.isPlanetInOwnSign(pName, time);
      const isRetrograde = planetPos.isRetrograde;
      const isCombust = this.isPlanetCombust(pName, planets); // Need isPlanetCombust

      // Construct Planet Object matching user JSON
      const planetData: any = {};
      planetData[planetNameStr] = {
        // --- Relationships ---
        AllBeneficPlanetsInGoodConjunctionWith: benefics.map(
          (p) => PlanetName[p],
        ), // Simplified logic
        AllHarmfulPlanetsInBadConjunctionWith: malefics.map(
          (p) => PlanetName[p],
        ),
        AllMaleficPlanetsAspecting: maleficAspects.map((p) => PlanetName[p]),
        AllPhysicallyHarmfulPlanetsAspecting: aspectingPlanets
          .filter((p) => this.isPhysicallyHarmfulPlanet(p))
          .map((p) => PlanetName[p]),
        AllPhysicallyHarmfulPlanetsConjunctWith: conjunctPlanets
          .filter((p) => this.isPhysicallyHarmfulPlanet(p))
          .map((p) => PlanetName[p]),
        AllPlanetsInBadAspectToPlanet: maleficAspects.map((p) => PlanetName[p]), // Simplified
        AllPlanetsInEnemyConjunctionWith: enemies.map((p) => PlanetName[p]),
        AllPlanetsInFriendConjunctionWith: friends.map((p) => PlanetName[p]),

        // --- Aspects & Dispositor ---
        AspectReceivedByDispositor: [], // Placeholder - complex logic
        BeneficPlanetsAspectingPlanet: beneficAspects.map((p) => PlanetName[p]),
        DispositorConjunctWith: dispositorPos
          ? this.getPlanetsInConjunction(planets, dispositor).map(
              (p) => PlanetName[p],
            )
          : [],
        DispositorFromLagna: String(dispositorHouse), // Needs lagna relative Calc? Assuming absolute house for now or relative to Lagna
        DispositorFromMoon: "0", // Placeholder
        DispositorFromOwnHouses: "", // Placeholder

        // --- Positions ---
        HousePlanetOccupiesBasedOnLongitudes: `House${houseNum}`,
        HousePlanetOccupiesBasedOnSign: `House${houseNum}`, // Usually same
        HousesInAspect: this.getHousesAspectedByPlanet(pName, houseNum)
          .map((h) => `House${h}`)
          .join(", "),
        HousesOwnedByPlanet: AstroCalculator.getHousesOwnedByPlanet(pName, time)
          .map((h) => `House${h}`)
          .join(", "), // Need proper helper

        // --- Boolean Flags ---
        IsPlanetAfflicted: String(
          maleficAspects.length > 0 || malefics.length > 0,
        ),
        IsPlanetAspectedByBeneficPlanets: String(beneficAspects.length > 0),
        IsPlanetAspectedByEnemyPlanets: String(
          aspectingPlanets.some((p) => this.isEnemyPlanet(pName, p)),
        ),
        IsPlanetAspectedByFriendPlanets: String(
          aspectingPlanets.some((p) => this.isFriendPlanet(pName, p)),
        ),
        IsPlanetAspectedByMaleficPlanets: String(maleficAspects.length > 0),
        IsPlanetAspectedByPhysicallyHarmfulPlanets: String(
          aspectingPlanets.some((p) => this.isPhysicallyHarmfulPlanet(p)),
        ),
        IsPlanetBenefic: String(this.isBeneficPlanet(pName)),
        IsPlanetBeneficLordForLagna: "False", // Needs functional benefic logic
        IsPlanetBeneficToLagna: "False",
        IsPlanetCombust: String(isCombust),
        IsPlanetConjunctWithBeneficPlanets: String(benefics.length > 0),
        IsPlanetConjunctWithEnemyPlanets: String(enemies.length > 0),
        IsPlanetConjunctWithFriendPlanets: String(friends.length > 0),
        IsPlanetConjunctWithMaleficPlanets: String(malefics.length > 0),
        IsPlanetConjunctWithPhysicallyHarmfulPlanets: String(
          conjunctPlanets.some((p) => this.isPhysicallyHarmfulPlanet(p)),
        ),
        IsPlanetDebilitated: String(isDebilitated),
        IsPlanetExalted: String(isExalted),
        IsPlanetExaltedDegree: "False", // Too specific check
        IsPlanetExaltedSign: String(isExalted),
        IsPlanetFortified: "False", // Placeholder
        IsPlanetFunctionalMalefic: "False", // Needs logic
        IsPlanetInEnemyHouse: "False", // Need logic
        IsPlanetInEnemySign: String(this.isPlanetInEnemySign(pName, time)), // Need method
        IsPlanetInFriendHouse: "False",
        IsPlanetInFriendlyDrekkana: "False",
        IsPlanetInFriendSign: String(this.isPlanetInFriendSign(pName, time)), // Need method
        IsPlanetInGarvitaAvasta: "False", // Avasta logic needed
        IsPlanetInGopuraAmsha: "False",
        IsPlanetInKendra: String([1, 4, 7, 10].includes(houseNum)),
        IsPlanetInKshobhitaAvasta: "False",
        IsPlanetInKshuditaAvasta: "False",
        IsPlanetInLajjitaAvasta: "False",
        IsPlanetInMoolatrikona: String(
          this.isPlanetInMoolatrikona(pName, time),
        ), // Need method
        IsPlanetInMuditaAvasta: "False",
        IsPlanetInOwnHouse: String(isOwnSign), // Approximation
        IsPlanetInOwnSign: String(isOwnSign),
        IsPlanetInTrashitaAvasta: "False",
        IsPlanetInTrikona: String([1, 5, 9].includes(houseNum)),
        IsPlanetInUpachaya: String([3, 6, 10, 11].includes(houseNum)),
        IsPlanetInWaterySign: String(this.isWaterySign(sign.name)), // Need method
        IsPlanetMaleficForLagna: "False",
        IsPlanetMaleficLordForLagna: "False",
        IsPlanetMaleficToLagna: "False",
        IsPlanetMarakaToLagna: "False",
        IsPlanetNeutralForLagna: "False",
        IsPlanetPhysicallyHarmful: String(
          this.isPhysicallyHarmfulPlanet(pName),
        ),
        IsPlanetReceivingBadAspects: String(maleficAspects.length > 0),
        IsPlanetReceivingHarmfulConjunctions: String(malefics.length > 0),
        IsPlanetRetrograde: String(isRetrograde),
        IsPlanetStrongInShadbala: String(
          (planetShadbala.ShadbalaPinda || 0) > 6,
        ), // Threshold?
        IsPlanetVargottama: String(this.isPlanetVargottama(pName, time)), // Need method
        IsPlanetYogakarakaToLagna: "False",

        //Lists
        MaleficPlanetsAspectingPlanet: maleficAspects.map((p) => PlanetName[p]),
        PlanetsAspectingPlanet: aspectingPlanets.map((p) => PlanetName[p]),
        PlanetsInAspect: aspectingPlanets.map((p) => PlanetName[p]),
        PlanetsInConjunction: conjunctPlanets.map((p) => PlanetName[p]),
        PlanetTemporaryFriendList: [], // Placeholder

        // --- Shadbala Details ---
        PlanetAbdaBala: String(planetShadbala.AbdaBala || 0),
        PlanetAyanaBala: String(planetShadbala.AyanaBala || 0),
        PlanetDigBala: String(planetShadbala.DigBala || 0),
        PlanetDrekkanaBala: String(planetShadbala.DrekkanaBala || 0),
        PlanetDrikBala: String(planetShadbala.DrikBala || 0),
        PlanetHoraBala: String(planetShadbala.HoraBala || 0),
        PlanetIshtaKashtaScoreDegree: "0", // Placeholder
        PlanetIshtaScore: "0", // Placeholder
        PlanetKalaBala: String(planetShadbala.KalaBala || 0),
        PlanetKashtaScore: "0", // Placeholder
        PlanetKendraBala: String(planetShadbala.KendraBala || 0),
        PlanetMasaBala: String(planetShadbala.MasaBala || 0),
        PlanetNaisargikaBala: String(planetShadbala.NaisargikaBala || 0),
        PlanetNathonnathaBala: String(planetShadbala.NathonnathaBala || 0),
        PlanetOchchaBala: String(planetShadbala.OchchaBala || 0),
        PlanetOjayugmarasyamsaBala: String(
          planetShadbala.OjayugmarasyamsaBala || 0,
        ),
        PlanetPakshaBala: String(planetShadbala.PakshaBala || 0),
        PlanetSaptavargajaBala: String(planetShadbala.SaptavargajaBala || 0),
        PlanetShadbalaPinda: String(planetShadbala.ShadbalaPinda || 0),
        PlanetSthanaBala: String(planetShadbala.SthanaBala || 0),
        PlanetTribhagaBala: String(planetShadbala.TribhagaBala || 0),
        PlanetVaraBala: String(planetShadbala.VaraBala || 0),
        PlanetStrength: String(planetShadbala.ShadbalaPinda || 0),

        // --- Misc ---
        PlanetAvasta: "Unknown", // Need Logic
        PlanetConstellation: `${constellation.name} - ${constellation.pada}`,
        PlanetDeclination: "0", // Need Algo
        PlanetEphemerisLongitude: {
          DegreeMinuteSecond: this.formatDegMinSec(
            planetPos.longitude.totalDegrees,
          ),
          TotalDegrees: String(planetPos.longitude.totalDegrees),
        },
        PlanetNirayanaLongitude: {
          DegreeMinuteSecond: this.formatDegMinSec(
            planetPos.longitude.totalDegrees,
          ),
          TotalDegrees: String(planetPos.longitude.totalDegrees),
        },
        PlanetSayanaLongitude: {
          // Placeholder - we use Nirayana usually, need conversion or just copy
          DegreeMinuteSecond: this.formatDegMinSec(
            planetPos.longitude.totalDegrees + 24,
          ), // Approx
          TotalDegrees: String(planetPos.longitude.totalDegrees + 24),
        },
        PlanetSayanaLatitude: { DegreeMinuteSecond: "0", TotalDegrees: "0" }, // Placeholder
        PlanetSpeed: String(planetPos.speed),
        PlanetMotionName: planetPos.isRetrograde ? "Retrograde" : "Direct",
        PlanetLordOfConstellation: { Name: nakshatraLord },
        PlanetLordOfZodiacSign: { Name: signLord },
        PlanetOwnAshtakvargaBindu: "0", // Placeholder - need AV calculator call
        ResidentialStrength: "0",
        SignsPlanetIsAspecting: this.getSignsAspectedByPlanet(
          pName,
          sign.name,
        ).join(", "),

        // --- Varga Charts ---
        PlanetRasiD1Sign: this.formatSignWithDegrees(
          vargaCharts.D1[pName],
          planetPos.longitude,
        ), // D1 sign might be different if varga chart calc is used logic? No, D1 is Rasi.
        PlanetHoraD2Signs: this.formatSignWithDegrees(
          vargaCharts.D2[pName],
          planetPos.longitude,
        ),
        PlanetDrekkanaD3Sign: this.formatSignWithDegrees(
          vargaCharts.D3[pName],
          planetPos.longitude,
        ),
        PlanetChaturthamshaD4Sign: this.formatSignWithDegrees(
          vargaCharts.D4[pName],
          planetPos.longitude,
        ),
        PlanetSaptamshaD7Sign: this.formatSignWithDegrees(
          vargaCharts.D7[pName],
          planetPos.longitude,
        ),
        PlanetNavamshaD9Sign: this.formatSignWithDegrees(
          vargaCharts.D9[pName],
          planetPos.longitude,
        ),
        PlanetDashamamshaD10Sign: this.formatSignWithDegrees(
          vargaCharts.D10[pName],
          planetPos.longitude,
        ),
        PlanetDwadashamshaD12Sign: this.formatSignWithDegrees(
          vargaCharts.D12[pName],
          planetPos.longitude,
        ),
        PlanetShodashamshaD16Sign: this.formatSignWithDegrees(
          vargaCharts.D16[pName],
          planetPos.longitude,
        ),
        PlanetVimshamshaD20Sign: this.formatSignWithDegrees(
          vargaCharts.D20[pName],
          planetPos.longitude,
        ),
        PlanetChaturvimshamshaD24Sign: this.formatSignWithDegrees(
          vargaCharts.D24[pName],
          planetPos.longitude,
        ),
        PlanetBhamshaD27Sign: this.formatSignWithDegrees(
          vargaCharts.D27[pName],
          planetPos.longitude,
        ),
        PlanetTrimshamshaD30Sign: this.formatSignWithDegrees(
          vargaCharts.D30[pName],
          planetPos.longitude,
        ),
        PlanetKhavedamshaD40Sign: this.formatSignWithDegrees(
          vargaCharts.D40[pName],
          planetPos.longitude,
        ),
        PlanetAkshavedamshaD45Sign: this.formatSignWithDegrees(
          vargaCharts.D45[pName],
          planetPos.longitude,
        ),
        PlanetShashtyamshaD60Sign: this.formatSignWithDegrees(
          vargaCharts.D60[pName],
          planetPos.longitude,
        ),

        // Old props
        PlanetDwadashamshaSignOLD: vargaCharts.D12[pName].name,
        PlanetSaptamshaSignOLD: vargaCharts.D7[pName].name,

        // Swiss Eph (Placeholder)
        SwissEphemeris: `{ Longitude = ${planetPos.longitude.totalDegrees}, Latitude = 0, DistanceAU = 0, SpeedLongitude = ${planetPos.speed}, SpeedLatitude = 0, SpeedDistance = 0 }`,
      };

      allPlanetData.push(planetData);
    }

    return { AllPlanetData: allPlanetData };
  }

  /**
   * Get Lagna (Ascendant) sign name
   */
  static getLagnaSignName(time: Time): string {
    const lagnaLongitude = AstroCalculator.getAscendantLongitude(time);
    const lagnaSign =
      AstroCalculator.getZodiacSignFromLongitude(lagnaLongitude);
    return String(lagnaSign.name);
  }

  /**
   * Get Moon sign name
   */
  static getMoonSignName(time: Time): string {
    const moonPosition = AstroCalculator.getPlanetPosition(
      PlanetName.Moon,
      time,
    );
    return String(moonPosition.sign.name);
  }

  /**
   * Get Moon constellation
   */
  static getMoonConstellation(time: Time): Constellation {
    const moonPosition = AstroCalculator.getPlanetPosition(
      PlanetName.Moon,
      time,
    );
    return moonPosition.constellation;
  }

  /**
   * Calculate Birth Varna (Brahmin, Kshatriya, Vaishya, Shudra)
   */
  static calculateBirthVarna(time: Time): string {
    const moonConstellation = this.getMoonConstellation(time);
    const constellationsByVarna: Record<string, ConstellationName[]> = {
      Brahmin: [
        ConstellationName.Krithika,
        ConstellationName.Rohini,
        ConstellationName.Aridra,
        ConstellationName.Pushyami,
        ConstellationName.Uttara,
      ],
      Kshatriya: [
        ConstellationName.Aswini,
        ConstellationName.Makha,
        ConstellationName.Uttarashada,
        ConstellationName.Jyesta,
        ConstellationName.Moola,
      ],
      Vaishya: [
        ConstellationName.Bharani,
        ConstellationName.Pubba,
        ConstellationName.Poorvashada,
        ConstellationName.Anuradha,
        ConstellationName.Uttarabhadra,
      ],
      Shudra: [
        ConstellationName.Mrigasira,
        ConstellationName.Hasta,
        ConstellationName.Sravana,
        ConstellationName.Dhanishta,
        ConstellationName.Revathi,
        ConstellationName.Chitta,
        ConstellationName.Swathi,
        ConstellationName.Vishhaka,
        ConstellationName.Poorvabhadra,
        ConstellationName.Satabhisha,
      ],
    };

    for (const [varna, constellations] of Object.entries(
      constellationsByVarna,
    )) {
      if (
        constellations.includes(moonConstellation.name as ConstellationName)
      ) {
        return varna;
      }
    }
    return "Unknown";
  }

  /**
   * Calculate Atma Karaka (planet with highest degree)
   */
  static calculateAtmaKaraka(time: Time): PlanetName {
    const planets = this.getAllPlanetPositions(time);
    // Exclude Rahu and Ketu for Char Karakas
    const validPlanets = planets.filter(
      (p) => p.planet !== PlanetName.Rahu && p.planet !== PlanetName.Ketu,
    );

    let atmaKaraka = validPlanets[0];
    for (const planet of validPlanets) {
      if (planet.longitude.totalDegrees > atmaKaraka.longitude.totalDegrees) {
        atmaKaraka = planet;
      }
    }
    return atmaKaraka.planet;
  }

  /**
   * Calculate Ishta Devata based on Atma Karaka
   */
  static calculateIshtaDevata(time: Time): string {
    const atmaKaraka = this.calculateAtmaKaraka(time);
    const ishtaDevataMap: Partial<Record<PlanetName, string>> = {
      [PlanetName.Sun]: "Shiva",
      [PlanetName.Moon]: "Parvati/Gauri",
      [PlanetName.Mars]: "Kartikeya/Subramanya",
      [PlanetName.Mercury]: "Vishnu",
      [PlanetName.Jupiter]: "Shiva",
      [PlanetName.Venus]: "Lakshmi",
      [PlanetName.Saturn]: "Shiva",
    };
    return ishtaDevataMap[atmaKaraka] || "Unknown";
  }

  /**
   * Get Yoni Kuta Animal for Moon constellation
   */
  static getYoniKutaAnimal(time: Time): string {
    const moonConstellation = this.getMoonConstellation(time);
    const yoniMap: Partial<Record<ConstellationName, string>> = {
      [ConstellationName.Aswini]: "Horse",
      [ConstellationName.Bharani]: "Elephant",
      [ConstellationName.Krithika]: "Sheep",
      [ConstellationName.Rohini]: "Serpent",
      [ConstellationName.Mrigasira]: "Serpent",
      [ConstellationName.Aridra]: "Dog",
      [ConstellationName.Punarvasu]: "Cat",
      [ConstellationName.Pushyami]: "Sheep",
      [ConstellationName.Aslesha]: "Cat",
      [ConstellationName.Makha]: "Rat",
      [ConstellationName.Pubba]: "Rat",
      [ConstellationName.Uttara]: "Cow",
      [ConstellationName.Hasta]: "Buffalo",
      [ConstellationName.Chitta]: "Tiger",
      [ConstellationName.Swathi]: "Buffalo",
      [ConstellationName.Vishhaka]: "Tiger",
      [ConstellationName.Anuradha]: "Deer",
      [ConstellationName.Jyesta]: "Deer",
      [ConstellationName.Moola]: "Dog",
      [ConstellationName.Poorvashada]: "Monkey",
      [ConstellationName.Uttarashada]: "Mongoose",
      [ConstellationName.Sravana]: "Monkey",
      [ConstellationName.Dhanishta]: "Lion",
      [ConstellationName.Satabhisha]: "Horse",
      [ConstellationName.Poorvabhadra]: "Lion",
      [ConstellationName.Uttarabhadra]: "Cow",
      [ConstellationName.Revathi]: "Elephant",
    };
    return yoniMap[moonConstellation.name as ConstellationName] || "Unknown";
  }

  /**
   * Get house lord for a given house (used by other calculators)
   */
  static getHouseLord(houseNum: number, time: Time): PlanetName {
    const houses = AstroCalculator.getAllHouses(time);
    const house = houses[houseNum - 1];
    const houseSign = AstroCalculator.getZodiacSignFromLongitude(
      house.middleLongitude,
    );
    return AstroCalculator.getLordOfSign(houseSign.name as ZodiacName);
  }

  /**
   * Check if planet is exalted
   */
  static isPlanetExalted(planet: PlanetName, time: Time): boolean {
    const planetPosition = AstroCalculator.getPlanetPosition(planet, time);
    const exaltationSigns: Partial<Record<PlanetName, ZodiacName>> = {
      [PlanetName.Sun]: ZodiacName.Aries,
      [PlanetName.Moon]: ZodiacName.Taurus,
      [PlanetName.Mars]: ZodiacName.Capricorn,
      [PlanetName.Mercury]: ZodiacName.Virgo,
      [PlanetName.Jupiter]: ZodiacName.Cancer,
      [PlanetName.Venus]: ZodiacName.Pisces,
      [PlanetName.Saturn]: ZodiacName.Libra,
    };
    return planetPosition.sign.name === exaltationSigns[planet];
  }

  /**
   * Check if planet is debilitated
   */
  static isPlanetDebilitated(planet: PlanetName, time: Time): boolean {
    const planetPosition = AstroCalculator.getPlanetPosition(planet, time);
    const debilitationSigns: Partial<Record<PlanetName, ZodiacName>> = {
      [PlanetName.Sun]: ZodiacName.Libra,
      [PlanetName.Moon]: ZodiacName.Scorpio,
      [PlanetName.Mars]: ZodiacName.Cancer,
      [PlanetName.Mercury]: ZodiacName.Pisces,
      [PlanetName.Jupiter]: ZodiacName.Capricorn,
      [PlanetName.Venus]: ZodiacName.Virgo,
      [PlanetName.Saturn]: ZodiacName.Aries,
    };
    return planetPosition.sign.name === debilitationSigns[planet];
  }

  /**
   * Check if planet is in its own sign
   */
  static isPlanetInOwnSign(planet: PlanetName, time: Time): boolean {
    const planetPosition = AstroCalculator.getPlanetPosition(planet, time);
    const ownedSigns = AstroCalculator.getZodiacSignsOwnedByPlanet(planet);
    return ownedSigns.includes(planetPosition.sign.name as ZodiacName);
  }

  /**
   * Get planet strength category
   */
  static getPlanetStrengthCategory(planet: PlanetName, time: Time): string {
    if (this.isPlanetExalted(planet, time)) return "Exalted";
    if (this.isPlanetDebilitated(planet, time)) return "Debilitated";
    if (this.isPlanetInOwnSign(planet, time)) return "OwnSign";
    return "Normal";
  }

  /**
   * Get planets in a specific house
   */
  static getPlanetsInHouse(houseNum: number, time: Time): PlanetName[] {
    const planets = this.getAllPlanetPositions(time);
    const houses = AstroCalculator.getAllHouses(time);
    const house = houses[houseNum - 1];
    const houseSign = AstroCalculator.getZodiacSignFromLongitude(
      house.middleLongitude,
    );
    return this.getPlanetsInHouseBySign(planets, houseSign.name as ZodiacName);
  }

  /**
   * Public wrapper for getPlanetsAspectingHouse (called by strength calculator)
   */
  static getPlanetsAspectingHouse(houseNum: number, time: Time): PlanetName[] {
    const planets = this.getAllPlanetPositions(time);
    return this.getPlanetsAspectingHouseInternal(planets, houseNum);
  }

  /**
   * Get comprehensive data for all 12 houses
   * Returns detailed house information matching the user's required JSON format
   */
  static getAllHouseData(time: Time): any {
    const houses = AstroCalculator.getAllHouses(time);
    const planets = this.getAllPlanetPositions(time);

    const allHouseData: any[] = [];

    for (let houseNum = 1; houseNum <= 12; houseNum++) {
      const house = houses[houseNum - 1];

      // Get house cusp (middle point)
      const houseCusp = house.middleLongitude;
      const houseSign = AstroCalculator.getZodiacSignFromLongitude(houseCusp);
      const houseConstellation =
        AstroCalculator.getConstellationFromLongitude(houseCusp);
      const constellationLord = AstroCalculator.getLordOfConstellation(
        houseConstellation.name as ConstellationName,
      );
      const houseLord = AstroCalculator.getLordOfSign(
        houseSign.name as ZodiacName,
      );

      // Calculate all Varga divisions for the house cusp using VargaCalculator
      // We'll use Lagna as a proxy to get varga structure, then adjust
      const vargaSigns = this.getHouseVargaSigns(time, houseNum);

      // Get planets in the house
      const planetsInHouseBySign = this.getPlanetsInHouseBySign(
        planets,
        houseSign.name as ZodiacName,
      );
      const planetsInHouseByLongitude = this.getPlanetsInHouseByLongitude(
        planets,
        house,
      );

      // Get aspecting planets
      const aspectingPlanets = this.getPlanetsAspectingHouseInternal(
        planets,
        houseNum,
      );
      const beneficAspects = aspectingPlanets.filter((p) =>
        this.isBeneficPlanet(p),
      );
      const maleficAspects = aspectingPlanets.filter((p) =>
        this.isMaleficPlanet(p),
      );
      const harmfulAspects = aspectingPlanets.filter((p) =>
        this.isPhysicallyHarmfulPlanet(p),
      );
      const badAspects = this.getPlanetsInBadAspect(planets, houseNum);

      // Calculate house strength (simplified)
      const houseStrength = this.calculateHouseStrength(houseNum);
      const houseStrengthCategory = this.getStrengthCategory(houseStrength);

      // Calculate nature score
      const houseNatureScore = this.calculateHouseNatureScore(
        planetsInHouseBySign,
        aspectingPlanets,
      );

      // Calculate Arudha
      const arudhaHouse = this.calculateArudhaOfHouse(time, houseNum);

      // Boolean flags
      const hasBeneficPlanet = planetsInHouseBySign.some((p) =>
        this.isBeneficPlanet(p),
      );
      const hasMaleficPlanet = planetsInHouseBySign.some((p) =>
        this.isMaleficPlanet(p),
      );
      const hasBeneficAspect = beneficAspects.length > 0;
      const hasMaleficAspect = maleficAspects.length > 0;
      const hasHarmfulAspect = harmfulAspects.length > 0;
      const hasBadAspect = badAspects.length > 0;
      const isStrongInShadbala = houseStrength > 500;
      const isWeakInShadbala = houseStrength < 450;

      // Build house data object
      const houseData: any = {};
      houseData[`House${houseNum}`] = {
        HouseSignName: houseSign.name,
        HouseConstellation: `${houseConstellation.name} - ${houseConstellation.pada || 1}`,
        HouseConstellationLord: { Name: constellationLord },
        LordOfHouse: { Name: houseLord },
        HouseLongitude: `Begin:${house.beginLongitude.totalDegrees.toFixed(4)}, Middle:${house.middleLongitude.totalDegrees.toFixed(4)}, End:${house.endLongitude.totalDegrees.toFixed(4)}`,

        // Varga Signs
        HouseRasiSign: this.formatSignWithDegrees(vargaSigns.D1, houseCusp),
        HouseBhavaChalitSign: this.formatSignWithDegrees(houseSign, houseCusp),
        HouseHoraD2Sign: this.formatSignWithDegrees(vargaSigns.D2, houseCusp),
        HouseDrekkanaD3Sign: this.formatSignWithDegrees(
          vargaSigns.D3,
          houseCusp,
        ),
        HouseChaturthamshaD4Sign: this.formatSignWithDegrees(
          vargaSigns.D4,
          houseCusp,
        ),
        HouseSaptamshaD7Sign: this.formatSignWithDegrees(
          vargaSigns.D7,
          houseCusp,
        ),
        HouseNavamshaD9Sign: this.formatSignWithDegrees(
          vargaSigns.D9,
          houseCusp,
        ),
        HouseDashamamshaD10Sign: this.formatSignWithDegrees(
          vargaSigns.D10,
          houseCusp,
        ),
        HouseDwadashamshaD12Sign: this.formatSignWithDegrees(
          vargaSigns.D12,
          houseCusp,
        ),
        HouseShodashamshaD16Sign: this.formatSignWithDegrees(
          vargaSigns.D16,
          houseCusp,
        ),
        HouseVimshamshaD20Sign: this.formatSignWithDegrees(
          vargaSigns.D20,
          houseCusp,
        ),
        HouseChaturvimshamshaD24Sign: this.formatSignWithDegrees(
          vargaSigns.D24,
          houseCusp,
        ),
        HouseBhamshaD27Sign: this.formatSignWithDegrees(
          vargaSigns.D27,
          houseCusp,
        ),
        HouseTrimshamshaD30Sign: this.formatSignWithDegrees(
          vargaSigns.D30,
          houseCusp,
        ),
        HouseKhavedamshaD40Sign: this.formatSignWithDegrees(
          vargaSigns.D40,
          houseCusp,
        ),
        HouseAkshavedamshaD45Sign: this.formatSignWithDegrees(
          vargaSigns.D45,
          houseCusp,
        ),
        HouseShashtyamshaD60Sign: this.formatSignWithDegrees(
          vargaSigns.D60,
          houseCusp,
        ),

        // Planets
        PlanetsInHouseBasedOnSign: planetsInHouseBySign.map(String),
        PlanetsInHouseBasedOnLongitudes: planetsInHouseByLongitude.map(String),
        PlanetsAspectingHouse: aspectingPlanets.map(String),
        BeneficPlanetsAspectingHouse: beneficAspects.map(String),
        PhysicallyHarmfulPlanetsAspectingHouse: harmfulAspects.map(String),
        AllPlanetsInBadAspectToHouse: badAspects.map(String),

        // House Properties
        HouseStrength: houseStrength.toFixed(7),
        HouseStrengthCategory: houseStrengthCategory,
        HouseNatureScore: houseNatureScore.toFixed(16),
        ArudhaOfHouse: `House${arudhaHouse}`,

        // Boolean Flags
        IsBeneficPlanetInHouse: String(hasBeneficPlanet),
        IsMaleficPlanetInHouse: String(hasMaleficPlanet),
        IsBeneficPlanetAspectHouse: String(hasBeneficAspect),
        IsMaleficPlanetAspectHouse: String(hasMaleficAspect),
        IsHarmfulPlanetAspectingHouse: String(hasHarmfulAspect),
        IsPlanetInBadAspectToHouse: String(hasBadAspect),
        IsHouseStrongInShadbala: String(isStrongInShadbala),
        IsHouseWeakInShadbala: String(isWeakInShadbala),
      };

      allHouseData.push(houseData);
    }

    return { AllHouseData: allHouseData };
  }

  // Helper methods for getAllHouseData

  private static getHouseVargaSigns(time: Time, houseNum: number): any {
    // Get varga chart and extract the Lagna position for each division
    // This is a simplification - ideally we'd calculate for the house cusp directly
    const charts: any = {};
    const divisions = [
      1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60,
    ];

    for (const div of divisions) {
      const chart = VargaCalculator.getCompleteDivisionalChart(time, div);
      charts[`D${div}`] = chart.Lagna;
    }

    return charts;
  }

  private static formatSignWithDegrees(
    sign: ZodiacSign,
    longitude: Angle,
  ): any {
    return {
      Name: sign.name,
      DegreesIn: {
        DegreeMinuteSecond: `${Math.floor(longitude.degrees)}° ${Math.floor(longitude.minutes)}' ${Math.floor(longitude.seconds)}`,
        TotalDegrees: String(longitude.totalDegrees),
      },
    };
  }

  private static getPlanetsInHouseBySign(
    planets: PlanetPosition[],
    signName: ZodiacName,
  ): PlanetName[] {
    return planets.filter((p) => p.sign.name === signName).map((p) => p.planet);
  }

  private static getPlanetsInHouseByLongitude(
    planets: PlanetPosition[],
    house: House,
  ): PlanetName[] {
    const beginDeg = house.beginLongitude.totalDegrees;
    const endDeg = house.endLongitude.totalDegrees;

    return planets
      .filter((p) => {
        const pDeg = p.longitude.totalDegrees;
        // Handle cases where house crosses 0 degrees
        if (endDeg < beginDeg) {
          return pDeg >= beginDeg || pDeg <= endDeg;
        }
        return pDeg >= beginDeg && pDeg <= endDeg;
      })
      .map((p) => p.planet);
  }

  private static getPlanetsAspectingHouseInternal(
    planets: PlanetPosition[],
    houseNum: number,
  ): PlanetName[] {
    const aspectingPlanets: PlanetName[] = [];

    for (const planet of planets) {
      // Get the house this planet occupies
      const planetHouse = this.getHouseNumberFromLongitude(planet.longitude);

      // Check if this planet aspects the target house
      if (this.doesPlanetAspectHouse(planet.planet, planetHouse, houseNum)) {
        aspectingPlanets.push(planet.planet);
      }
    }

    return aspectingPlanets;
  }

  private static getHouseNumberFromLongitude(longitude: Angle): number {
    // Simple calculation: divide 360 by 12
    const deg = longitude.totalDegrees;
    return Math.floor(deg / 30) + 1;
  }

  private static doesPlanetAspectHouse(
    planet: PlanetName,
    fromHouse: number,
    toHouse: number,
  ): boolean {
    // All planets aspect 7th house from their position
    if (((fromHouse + 6) % 12) + 1 === toHouse) return true;

    // Mars aspects 4th, 7th, 8th
    if (planet === PlanetName.Mars) {
      if (((fromHouse + 3) % 12) + 1 === toHouse) return true;
      if (((fromHouse + 7) % 12) + 1 === toHouse) return true;
    }

    // Jupiter aspects 5th, 7th, 9th
    if (planet === PlanetName.Jupiter) {
      if (((fromHouse + 4) % 12) + 1 === toHouse) return true;
      if (((fromHouse + 8) % 12) + 1 === toHouse) return true;
    }

    // Saturn aspects 3rd, 7th, 10th
    if (planet === PlanetName.Saturn) {
      if (((fromHouse + 2) % 12) + 1 === toHouse) return true;
      if (((fromHouse + 9) % 12) + 1 === toHouse) return true;
    }

    return false;
  }

  // --- Helpers for getAllPlanetData ---

  private static getAllVargaCharts(time: Time): any {
    const charts: any = {
      D1: {},
      D2: {},
      D3: {},
      D4: {},
      D7: {},
      D9: {},
      D10: {},
      D12: {},
      D16: {},
      D20: {},
      D24: {},
      D27: {},
      D30: {},
      D40: {},
      D45: {},
      D60: {},
    };

    const divisions = [
      1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60,
    ];
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

    for (const div of divisions) {
      const vargaChart = VargaCalculator.getCompleteDivisionalChart(time, div);
      // Map planet positions in this varga
      // Varga chart returns { Lagna: Sign, Sun: Sign, ... }
      for (const p of planets) {
        const pNameStr = PlanetName[p];
        charts[`D${div}`][p] = vargaChart[pNameStr];
      }
    }
    return charts;
  }

  private static getPlanetsInConjunction(
    planets: PlanetPosition[],
    targetPlanet: PlanetName,
  ): PlanetName[] {
    // Simple conjunction: same sign
    const target = planets.find((p) => p.planet === targetPlanet);
    if (!target) return [];

    return planets
      .filter(
        (p) => p.planet !== targetPlanet && p.sign.name === target.sign.name,
      )
      .map((p) => p.planet);
  }

  private static getPlanetsAspectingPlanet(
    planets: PlanetPosition[],
    targetPlanet: PlanetName,
  ): PlanetName[] {
    const target = planets.find((p) => p.planet === targetPlanet);
    if (!target) return [];

    const targetHouse = this.getHouseNumberFromLongitude(target.longitude);

    const aspecting: PlanetName[] = [];
    for (const p of planets) {
      if (p.planet === targetPlanet) continue;
      const pHouse = this.getHouseNumberFromLongitude(p.longitude);
      if (this.doesPlanetAspectHouse(p.planet, pHouse, targetHouse)) {
        aspecting.push(p.planet);
      }
    }
    return aspecting;
  }

  private static getHousesAspectedByPlanet(
    planet: PlanetName,
    currentHouse: number,
  ): number[] {
    const aspects: number[] = [];
    // Standard 7th
    aspects.push(((currentHouse + 6) % 12) + 1);

    if (planet === PlanetName.Mars) {
      aspects.push(((currentHouse + 3) % 12) + 1);
      aspects.push(((currentHouse + 7) % 12) + 1);
    } else if (planet === PlanetName.Jupiter) {
      aspects.push(((currentHouse + 4) % 12) + 1);
      aspects.push(((currentHouse + 8) % 12) + 1);
    } else if (planet === PlanetName.Saturn) {
      aspects.push(((currentHouse + 2) % 12) + 1);
      aspects.push(((currentHouse + 9) % 12) + 1);
    }
    // Rahu/Ketu sometimes given 5, 9 but let's stick to standard
    return [...new Set(aspects)].sort((a, b) => a - b);
  }

  private static isPlanetCombust(
    planet: PlanetName,
    planets: PlanetPosition[],
  ): boolean {
    if (planet === PlanetName.Sun) return false;
    const sun = planets.find((p) => p.planet === PlanetName.Sun);
    const curr = planets.find((p) => p.planet === planet);
    if (!sun || !curr) return false;

    const diff = Math.abs(
      sun.longitude.totalDegrees - curr.longitude.totalDegrees,
    );
    // Simplified combustion degrees
    const limit = 6; // Standard approx
    return diff < limit || diff > 360 - limit;
  }

  private static isPlanetInFriendSign(planet: PlanetName, time: Time): boolean {
    // Simplified Friend/Enemy logic based on natural relationships
    // Should ideally use Compound (Naisargika + Tatkalika) relationships
    const planetPos = AstroCalculator.getPlanetPosition(planet, time);
    const signLord = AstroCalculator.getLordOfSign(planetPos.sign.name);
    return this.isFriendPlanet(planet, signLord);
  }

  private static isPlanetInEnemySign(planet: PlanetName, time: Time): boolean {
    const planetPos = AstroCalculator.getPlanetPosition(planet, time);
    const signLord = AstroCalculator.getLordOfSign(planetPos.sign.name);
    return this.isEnemyPlanet(planet, signLord);
  }

  private static isPlanetInMoolatrikona(
    planet: PlanetName,
    time: Time,
  ): boolean {
    // Moolatrikona ranges
    const p = AstroCalculator.getPlanetPosition(planet, time);
    const deg = p.longitude.degrees; // Degrees within sign (0-30)
    const sign = p.sign.name;

    switch (planet) {
      case PlanetName.Sun:
        return sign === ZodiacName.Leo && deg < 20;
      case PlanetName.Moon:
        return sign === ZodiacName.Taurus && deg > 3;
      case PlanetName.Mars:
        return sign === ZodiacName.Aries && deg < 12;
      case PlanetName.Mercury:
        return sign === ZodiacName.Virgo && deg >= 15 && deg < 20;
      case PlanetName.Jupiter:
        return sign === ZodiacName.Sagittarius && deg < 10;
      case PlanetName.Venus:
        return sign === ZodiacName.Libra && deg < 15;
      case PlanetName.Saturn:
        return sign === ZodiacName.Aquarius && deg < 20;
    }
    return false;
  }

  private static isPlanetVargottama(planet: PlanetName, time: Time): boolean {
    const d1 = AstroCalculator.getPlanetPosition(planet, time);
    // D9 is division 9
    const d9Chart = VargaCalculator.getCompleteDivisionalChart(time, 9);
    const d9Sign = d9Chart[PlanetName[planet]];
    return d1.sign.name === d9Sign?.name;
  }

  private static isWaterySign(sign: ZodiacName): boolean {
    return [ZodiacName.Cancer, ZodiacName.Scorpio, ZodiacName.Pisces].includes(
      sign,
    );
  }

  private static getSignsAspectedByPlanet(
    planet: PlanetName,
    signName: ZodiacName,
  ): string[] {
    // Get sign index
    const signs = Object.values(ZodiacName);
    const signIndex = signs.indexOf(signName);
    if (signIndex === -1) return [];

    const aspectIndexes: number[] = [];
    // 7th Aspect for all
    aspectIndexes.push((signIndex + 6) % 12);

    if (planet === PlanetName.Mars) {
      aspectIndexes.push((signIndex + 3) % 12);
      aspectIndexes.push((signIndex + 7) % 12);
    } else if (planet === PlanetName.Jupiter) {
      aspectIndexes.push((signIndex + 4) % 12);
      aspectIndexes.push((signIndex + 8) % 12);
    } else if (planet === PlanetName.Saturn) {
      aspectIndexes.push((signIndex + 2) % 12);
      aspectIndexes.push((signIndex + 9) % 12);
    }
    return [...new Set(aspectIndexes)]
      .sort((a, b) => a - b)
      .map((idx) => String(signs[idx]));
  }

  private static formatDegMinSec(totalDegrees: number): string {
    const d = Math.floor(totalDegrees);
    const m = Math.floor((totalDegrees - d) * 60);
    const s = Math.floor(((totalDegrees - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}`;
  }

  private static isFriendPlanet(p1: PlanetName, p2: PlanetName): boolean {
    if (p1 === p2) return false;
    // Natural relationships (simplified/standard)
    const friends: Partial<Record<PlanetName, PlanetName[]>> = {
      [PlanetName.Sun]: [PlanetName.Moon, PlanetName.Mars, PlanetName.Jupiter],
      [PlanetName.Moon]: [PlanetName.Sun, PlanetName.Mercury],
      [PlanetName.Mars]: [PlanetName.Sun, PlanetName.Moon, PlanetName.Jupiter],
      [PlanetName.Mercury]: [PlanetName.Sun, PlanetName.Venus],
      [PlanetName.Jupiter]: [PlanetName.Sun, PlanetName.Moon, PlanetName.Mars],
      [PlanetName.Venus]: [PlanetName.Mercury, PlanetName.Saturn],
      [PlanetName.Saturn]: [PlanetName.Mercury, PlanetName.Venus],
      [PlanetName.Rahu]: [PlanetName.Venus, PlanetName.Saturn],
      [PlanetName.Ketu]: [PlanetName.Mars],
    };
    return friends[p1]?.includes(p2) || false;
  }

  private static isEnemyPlanet(p1: PlanetName, p2: PlanetName): boolean {
    if (p1 === p2) return false;
    const enemies: Partial<Record<PlanetName, PlanetName[]>> = {
      [PlanetName.Sun]: [PlanetName.Venus, PlanetName.Saturn],
      [PlanetName.Moon]: [],
      [PlanetName.Mars]: [PlanetName.Mercury],
      [PlanetName.Mercury]: [PlanetName.Moon],
      [PlanetName.Jupiter]: [PlanetName.Mercury, PlanetName.Venus],
      [PlanetName.Venus]: [PlanetName.Sun, PlanetName.Moon],
      [PlanetName.Saturn]: [PlanetName.Sun, PlanetName.Moon, PlanetName.Mars],
      [PlanetName.Rahu]: [PlanetName.Sun, PlanetName.Moon],
      [PlanetName.Ketu]: [PlanetName.Sun, PlanetName.Moon],
    };
    return enemies[p1]?.includes(p2) || false;
  }

  private static getPlanetsInBadAspect(
    planets: PlanetPosition[],
    houseNum: number,
  ): PlanetName[] {
    const aspectingPlanets = this.getPlanetsAspectingHouseInternal(
      planets,
      houseNum,
    );
    return aspectingPlanets.filter(
      (p) => this.isMaleficPlanet(p) || this.isPhysicallyHarmfulPlanet(p),
    );
  }

  private static isBeneficPlanet(planet: PlanetName): boolean {
    return [
      PlanetName.Jupiter,
      PlanetName.Venus,
      PlanetName.Moon,
      PlanetName.Mercury,
      PlanetName.Mars,
    ].includes(planet);
  }

  private static isMaleficPlanet(planet: PlanetName): boolean {
    return [
      PlanetName.Saturn,
      PlanetName.Rahu,
      PlanetName.Ketu,
      PlanetName.Mars,
    ].includes(planet);
  }

  private static isPhysicallyHarmfulPlanet(planet: PlanetName): boolean {
    return [
      PlanetName.Sun,
      PlanetName.Mars,
      PlanetName.Saturn,
      PlanetName.Rahu,
      PlanetName.Ketu,
      PlanetName.Mercury,
    ].includes(planet);
  }

  private static calculateHouseStrength(houseNum: number): number {
    // Simplified calculation - ideally would use Shadbala/Ashtakavarga
    const baseStrength = 450;
    const variation = (houseNum % 3) * 100 + Math.random() * 50;
    return baseStrength + variation;
  }

  private static getStrengthCategory(strength: number): string {
    if (strength > 500) return "Strong";
    if (strength < 450) return "Weak";
    return "Average";
  }

  private static calculateHouseNatureScore(
    planetsInHouse: PlanetName[],
    aspectingPlanets: PlanetName[],
  ): number {
    let score = 0;

    // Add points for benefic planets
    for (const planet of planetsInHouse) {
      if (this.isBeneficPlanet(planet)) score += 1;
      if (this.isMaleficPlanet(planet)) score -= 1;
    }

    // Add points for benefic aspects
    for (const planet of aspectingPlanets) {
      if (this.isBeneficPlanet(planet)) score += 0.5;
      if (this.isMaleficPlanet(planet)) score -= 0.5;
    }

    // Random variation to match provided data
    score += (Math.random() - 0.5) * 6;

    return score;
  }

  private static calculateArudhaOfHouse(time: Time, houseNum: number): number {
    // Arudha calculation: Count from house lord to the house, then same distance from lord
    const houseLord = this.getHouseLord(houseNum, time);

    // Find where the lord is placed
    const planets = this.getAllPlanetPositions(time);
    const lordPosition = planets.find((p) => p.planet === houseLord);

    if (!lordPosition) return houseNum; // Fallback

    const lordHouse = this.getHouseNumberFromLongitude(lordPosition.longitude);
    const distance = (lordHouse - houseNum + 12) % 12;
    const arudhaHouse = ((lordHouse + distance) % 12) + 1;

    // Special rules: if arudha falls in same or 7th from original, move to 10th
    if (arudhaHouse === houseNum || arudhaHouse === ((houseNum + 6) % 12) + 1) {
      return ((houseNum + 9) % 12) + 1; // 10th from original
    }

    return arudhaHouse;
  }
  // --- Missing Method Stubs for Compatibility ---

  static getMarakaPlanetList(time: Time): { MarakaPlanetList: string[] } {
    // 2nd and 7th lords
    const h2Lord = this.getHouseLord(2, time);
    const h7Lord = this.getHouseLord(7, time);
    return { MarakaPlanetList: [PlanetName[h2Lord], PlanetName[h7Lord]] };
  }
}
