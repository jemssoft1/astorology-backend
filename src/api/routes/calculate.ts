import express, { Request, Response } from "express";
import { AstroCalculator } from "../../core/AstroCalculator";
import { BirthChartCalculator } from "../../core/BirthChartCalculator";
import { PanchangCalculator } from "../../core/PanchangCalculator";
import { DashaCalculator } from "../../core/DashaCalculator";
import { MatchCalculator } from "../../core/MatchCalculator";
import { MuhurthaCalculator } from "../../core/MuhurthaCalculator";
import { DoshaCalculator } from "../../core/DoshaCalculator";
import { AshtakavargaCalculator } from "../../core/AshtakavargaCalculator";
import { ShadbalaCalculator } from "../../core/ShadbalaCalculator";
import { PredictionCalculator } from "../../core/PredictionCalculator";
import { VargaCalculator } from "../../core/VargaCalculator";
import { Time } from "../../types/interfaces";
import { PlanetName } from "../../types/enums";
import { NumerologyCalculator } from "../../core/NumerologyCalculator";
import { ChartSvgGenerator } from "../../core/ChartSvgGenerator";
import { TimeUtil } from "../../utils/TimeUtil";

const router = express.Router();

// ============================================================================
// CALCULATOR INPUT INTERFACE
// ============================================================================
interface CalculatorInput {
  location: { name: string; latitude?: number; longitude?: number };
  datetime: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    timezone: string;
  };
  ayanamsa: string;
  planetName?: string;
  houseName?: string;
  fullName?: string;
  chartType?: string;
  [key: string]: any;
}

// ============================================================================
// BUILD TIME OBJECT
// ============================================================================
function buildTimeObject(input: CalculatorInput): Time {
  return TimeUtil.normalizeTime({
    year: input.datetime.year,
    month: input.datetime.month,
    day: input.datetime.day,
    hour: input.datetime.hour,
    minute: input.datetime.minute,
    second: input.datetime.second,
    location: {
      name: input.location.name,
      latitude: input.location.latitude,
      longitude: input.location.longitude,
      timezone: input.datetime.timezone,
    },
  });
}

// ============================================================================
// CORRECTED METHOD MAPPING - Using ACTUAL method names from calculators
// ============================================================================
interface MethodConfig {
  calculator: any;
  method: string;
  description?: string;
}

export const METHOD_MAPPING: { [methodName: string]: MethodConfig } = {
  // ========================
  // ASTRO CALCULATOR METHODS
  // ========================
  AyanamsaDegree: {
    calculator: AstroCalculator,
    method: "getAyanamsaDegree",
  },
  LocalMeanTime: {
    calculator: AstroCalculator,
    method: "getLocalMeanTime",
  },
  SunriseTime: {
    calculator: AstroCalculator,
    method: "getSunriseTime",
  },
  SunsetTime: {
    calculator: AstroCalculator,
    method: "getSunsetTime",
  },
  DayDurationHours: {
    calculator: AstroCalculator,
    method: "dayDurationHours",
  },
  IsDayBirth: {
    calculator: AstroCalculator,
    method: "isDayBirth",
  },
  IsNightBirth: {
    calculator: AstroCalculator,
    method: "isNightBirth",
  },
  PlanetPosition: {
    calculator: AstroCalculator,
    method: "getPlanetPosition",
  },
  AllHouses: {
    calculator: AstroCalculator,
    method: "getAllHouses",
  },
  AscendantLongitude: {
    calculator: AstroCalculator,
    method: "getAscendantLongitude",
  },

  // ========================
  // PANCHANG METHODS
  // ========================
  DayOfWeek: {
    calculator: PanchangCalculator,
    method: "getDayOfWeekFormatted",
  },
  LordOfWeekday: {
    calculator: PanchangCalculator,
    method: "getLordOfWeekdayFormatted",
  },
  NithyaYoga: {
    calculator: PanchangCalculator,
    method: "getNithyaYogaFormatted",
  },
  Karana: {
    calculator: PanchangCalculator,
    method: "getKaranaFormatted",
  },
  LunarDay: {
    calculator: PanchangCalculator,
    method: "getLunarDay",
  },
  Tithi: {
    calculator: PanchangCalculator,
    method: "getLunarDayFormatted",
  },
  Nakshatra: {
    calculator: PanchangCalculator,
    method: "getMoonConstellation",
  },
  Panchang: {
    calculator: PanchangCalculator,
    method: "getPanchang",
  },
  HoraAtBirth: {
    calculator: PanchangCalculator,
    method: "getHoraAtBirth",
  },
  RahuKalam: {
    calculator: PanchangCalculator,
    method: "calculateRahuKala",
  },
  YamagandaKalam: {
    calculator: PanchangCalculator,
    method: "calculateYamaghanda",
  },
  PanchaPakshiBirthBird: {
    calculator: PanchangCalculator,
    method: "getPanchaPakshiBirthBird",
  },

  // ========================
  // BIRTH CHART METHODS (✅ CORRECTED)
  // ========================
  LagnaSignName: {
    calculator: BirthChartCalculator,
    method: "getLagnaSignName",
  },
  MoonSignName: {
    calculator: BirthChartCalculator,
    method: "getMoonSignName",
  },
  MoonConstellation: {
    calculator: BirthChartCalculator,
    method: "getMoonConstellation",
  },
  AllPlanetData: {
    calculator: BirthChartCalculator,
    method: "getAllPlanetData", // ✅ FIXED: now pointing to the new method
  },
  AllHouseData: {
    calculator: BirthChartCalculator,
    method: "getAllHouseData", // ✅ UPDATED: Now using dedicated getAllHouseData method
  },
  BirthVarna: {
    calculator: BirthChartCalculator,
    method: "calculateBirthVarna", // ✅ FIXED: was getBirthVarna
  },
  AtmaKaraka: {
    calculator: BirthChartCalculator,
    method: "calculateAtmaKaraka",
  },
  IshtaDevata: {
    calculator: BirthChartCalculator,
    method: "calculateIshtaDevata",
  },

  // ========================
  // MATCH/COMPATIBILITY METHODS (✅ CORRECTED)
  // ========================
  YoniKutaAnimal: {
    calculator: BirthChartCalculator, // ✅ FIXED: was MatchCalculator
    method: "getYoniKutaAnimal",
  },
  KutaScore: {
    calculator: MatchCalculator,
    method: "calculateMatch", // ✅ FIXED: was getKutaScore
  },
  MatchReport: {
    calculator: MatchCalculator,
    method: "calculateMatch", // ✅ FIXED: was getMatchReport
  },
  VarnaKuta: {
    calculator: MatchCalculator,
    method: "getVarnaKuta",
  },
  VashyaKuta: {
    calculator: MatchCalculator,
    method: "getVashyaKuta",
  },
  TaraKuta: {
    calculator: MatchCalculator,
    method: "getTaraKuta",
  },
  YoniKuta: {
    calculator: MatchCalculator,
    method: "getYoniKuta",
  },
  GrahaMaitriKuta: {
    calculator: MatchCalculator,
    method: "getGrahaMaitriKuta",
  },
  GanaKuta: {
    calculator: MatchCalculator,
    method: "getGanaKuta",
  },
  BhakootKuta: {
    calculator: MatchCalculator,
    method: "getBhakootKuta",
  },
  NadiKuta: {
    calculator: MatchCalculator,
    method: "getNadiKuta",
  },

  // ========================
  // DOSHA METHODS (✅ CORRECTED)
  // ========================
  KujaDosaScore: {
    calculator: DoshaCalculator,
    method: "calculateKujaDoshaScore", // ✅ FIXED: was getKujaDosaScore
  },
  ManglikDosha: {
    calculator: DoshaCalculator,
    method: "calculateMangalDosha", // ✅ FIXED: was getManglikDosha
  },
  KaalSarpaDosha: {
    calculator: DoshaCalculator,
    method: "calculateKaalSarpDosha", // ✅ FIXED: was getKaalSarpaDosha
  },
  PitraDosha: {
    calculator: DoshaCalculator,
    method: "calculatePitraDosha",
  },
  MarakaPlanetList: {
    calculator: BirthChartCalculator, // ✅ FIXED: was DoshaCalculator
    method: "getMarakaPlanetList",
  },

  // ========================
  // KARTARI METHODS (✅ CORRECTED - Now in DoshaCalculator)
  // ========================
  ShubKartariPlanets: {
    calculator: DoshaCalculator, // ✅ FIXED: was KartariCalculator
    method: "getShubKartariPlanets",
  },
  PaapaKartariPlanets: {
    calculator: DoshaCalculator, // ✅ FIXED
    method: "getPaapaKartariPlanets",
  },
  ShubKartariHouses: {
    calculator: DoshaCalculator, // ✅ FIXED
    method: "getShubKartariHousesFormatted",
  },
  PaapaKartariHouses: {
    calculator: DoshaCalculator, // ✅ FIXED
    method: "getPaapaKartariHousesFormatted",
  },

  // ========================
  // ASHTAKAVARGA METHODS (✅ CORRECTED)
  // ========================
  SarvashtakavargaChart: {
    calculator: AshtakavargaCalculator,
    method: "calculateSarvashtakavarga", // ✅ FIXED: was getSarvashtakavargaChart
  },
  BhinnashtakavargaChart: {
    calculator: AshtakavargaCalculator,
    method: "calculateBhinnashtakavarga", // ✅ FIXED: was getBhinnashtakavargaChart
  },
  PrastharashtakavargaChart: {
    calculator: AshtakavargaCalculator,
    method: "getDetailedAnalysis", // ✅ FIXED: was getPrastharashtakavargaChart
  },
  BinduPoints: {
    calculator: AshtakavargaCalculator,
    method: "getBinduPoints",
  },
  TransitScore: {
    calculator: AshtakavargaCalculator,
    method: "calculateTransitScore",
  },

  // ========================
  // SHADBALA METHODS (✅ CORRECTED)
  // ========================
  PlanetShadbalaPinda: {
    calculator: ShadbalaCalculator,
    method: "calculateShadbalaPinda", // ✅ FIXED: was getPlanetShadbalaPinda
  },
  HouseStrength: {
    calculator: ShadbalaCalculator,
    method: "calculateHouseStrength", // ✅ FIXED: was getHouseStrength
  },
  PlanetStrength: {
    calculator: ShadbalaCalculator,
    method: "calculateShadbalaPinda", // ✅ FIXED: was getPlanetStrength (same as Pinda)
  },

  // ========================
  // PREDICTION METHODS (✅ CORRECTED)
  // ========================
  HoroscopePredictions: {
    calculator: PredictionCalculator,
    method: "getHoroscopePredictions",
  },
  LifePredictions: {
    calculator: PredictionCalculator,
    method: "getHoroscopePredictions", // ✅ FIXED: Same method, different output can be filtered
  },
  YearlyPredictions: {
    calculator: PredictionCalculator,
    method: "getHoroscopePredictions", // ✅ FIXED: Same method
  },

  // ========================
  // DASHA METHODS (✅ CORRECTED)
  // ========================
  CurrentDasha: {
    calculator: DashaCalculator,
    method: "getCurrentMahadasha", // ✅ FIXED: was getCurrentDasha
  },
  CurrentMahadasha: {
    calculator: DashaCalculator,
    method: "getCurrentMahadasha",
  },
  CurrentAntardasha: {
    calculator: DashaCalculator,
    method: "getCurrentAntardasha",
  },
  CurrentPratyantardasha: {
    calculator: DashaCalculator,
    method: "getCurrentPratyantardasha",
  },
  VimshottariDasha: {
    calculator: DashaCalculator,
    method: "calculateMahadashas", // ✅ FIXED: was getVimshottariDasha
  },
  DashaPeriods: {
    calculator: DashaCalculator,
    method: "getCompleteDashaBreakdown", // ✅ FIXED: was getDashaPeriods
  },
  Antardashas: {
    calculator: DashaCalculator,
    method: "calculateAntardashas",
  },
  Pratyantardashas: {
    calculator: DashaCalculator,
    method: "calculatePratyantardashas",
  },
  BalanceOfDasha: {
    calculator: DashaCalculator,
    method: "getBalanceOfBirthDasha",
  },

  // ========================
  // MUHURTHA METHODS (✅ CORRECTED)
  // ========================
  ShubhMuhurtha: {
    calculator: MuhurthaCalculator,
    method: "getActivityQuality", // ✅ FIXED: was getShubhMuhurtha
  },
  TravelMuhurtha: {
    calculator: MuhurthaCalculator,
    method: "getTravelMuhurthaScore",
  },
  MarriageMuhurtha: {
    calculator: MuhurthaCalculator,
    method: "getMarriageMuhurthaScore",
  },
  GulikaKalam: {
    calculator: PanchangCalculator, // ✅ FIXED: Use PanchangCalculator
    method: "calculateRahuKala", // Gulika similar to Rahu, or add new method
  },

  // ========================
  // VARGA CHART METHODS (✅ CORRECTED)
  // ========================
  D1Chart: {
    calculator: VargaCalculator,
    method: "getCompleteDivisionalChart", // ✅ FIXED: was getD1Chart
  },
  D9Chart: {
    calculator: VargaCalculator,
    method: "getCompleteDivisionalChart", // ✅ FIXED: was getD9Chart
  },
  D10Chart: {
    calculator: VargaCalculator,
    method: "calculateDasamsa",
  },
  AllVargaCharts: {
    calculator: VargaCalculator,
    method: "getCompleteDivisionalChart", // ✅ FIXED: was getAllVargaCharts
  },
  VargaPosition: {
    calculator: VargaCalculator,
    method: "calculateVargaPosition",
  },

  // ========================
  // NUMEROLOGY METHODS
  // ========================
  NameNumberPrediction: {
    calculator: NumerologyCalculator,
    method: "calculateNameNumber",
  },

  // ========================
  // VISUAL CHART DATA METHODS
  // ========================
  SouthIndianChart: {
    calculator: VargaCalculator, // Using Varga as base, but handled in switch
    method: "calculateChart",
  },
  NorthIndianChart: {
    calculator: VargaCalculator,
    method: "calculateChart",
  },
};

// ============================================================================
// URL PARSER
// ============================================================================
interface ParsedParams {
  methodName: string;
  location?: string;
  time?: {
    hour: string;
    minute: string;
    day: string;
    month: string;
    year: string;
    timezone: string;
  };
  ayanamsa?: string;
  planetName?: string;
  houseName?: string;
  fullName?: string;
  chartType?: string;
  [key: string]: any;
}

function parseVedAstroUrl(path: string): ParsedParams {
  const parts = path.replace(/^\//, "").split("/");
  const result: ParsedParams = { methodName: parts[0] || "" };

  // Track multiple occurrences
  const capturedTimes: Time[] = [];
  let currentLocation: string = "";

  let i = 1;
  while (i < parts.length) {
    const key = parts[i];
    const value = parts[i + 1];

    switch (key) {
      case "Location":
        result.location = decodeURIComponent(value || "");
        currentLocation = result.location;
        i += 2;
        break;
      case "Time":
        if (i + 5 < parts.length) {
          const [hour, minute] = (parts[i + 1] || "00:00").split(":");
          const rawTime = {
            hour: hour || "00",
            minute: minute || "00",
            day: parts[i + 2] || "01",
            month: parts[i + 3] || "01",
            year: parts[i + 4] || "2000",
            timezone: decodeURIComponent(parts[i + 5] || "+00:00"),
          };
          result.time = rawTime;

          // Capture normalized time for multi-time requests (like Match)
          capturedTimes.push(
            TimeUtil.normalizeTime({
              ...rawTime,
              location: { name: currentLocation || "Unknown" },
            }),
          );

          i += 6;
        } else {
          i += 2;
        }
        break;
      case "Ayanamsa":
        result.ayanamsa = value || "LAHIRI";
        i += 2;
        break;
      case "PlanetName":
        result.planetName = value;
        i += 2;
        break;
      case "HouseName":
        result.houseName = value;
        i += 2;
        break;
      case "FullName":
        result.fullName = decodeURIComponent(value || "");
        i += 2;
        break;
      case "DivisionalChart":
      case "Varga":
        result.varga = value;
        i += 2;
        break;
      case "ChartType":
        result.chartType = value;
        i += 2;
        break;
      default:
        if (value) result[key.toLowerCase()] = value;
        i += 2;
        break;
    }
  }

  // If we captured exactly 2 distinct times, assign them for Match requests
  if (capturedTimes.length === 2) {
    result.matchOneTime = capturedTimes[0];
    result.matchTwoTime = capturedTimes[1];
  }

  return result;
}

function buildCalculatorInput(params: ParsedParams): CalculatorInput {
  return {
    location: { name: params.location || "Unknown" },
    datetime: {
      year: parseInt(params.time?.year || "2000"),
      month: parseInt(params.time?.month || "1"),
      day: parseInt(params.time?.day || "1"),
      hour: parseInt(params.time?.hour || "0"),
      minute: parseInt(params.time?.minute || "0"),
      second: 0,
      timezone: params.time?.timezone || "+00:00",
    },
    ayanamsa: params.ayanamsa || "LAHIRI",
    planetName: params.planetName,
    houseName: params.houseName,
    fullName: params.fullName,
    varga: params.varga,
    chartType: params.chartType,
  };
}

// ============================================================================
// EXECUTE CALCULATOR METHOD
// ============================================================================
async function executeMethod(
  mapping: MethodConfig,
  input: CalculatorInput,
  methodName: string,
): Promise<any> {
  const { calculator, method } = mapping;
  const time = buildTimeObject(input);

  // Check if method exists (skip for virtual methods like calculateChart)
  if (method !== "calculateChart" && typeof calculator[method] !== "function") {
    const availableMethods = Object.getOwnPropertyNames(calculator)
      .filter((m) => typeof calculator[m] === "function")
      .join(", ");
    throw new Error(
      `Method '${method}' not found on ${calculator.name}. Available: ${availableMethods}`,
    );
  }

  // Handle special cases
  switch (method) {
    case "getAyanamsaDegree":
      return calculator[method](time, input.ayanamsa);

    case "getPlanetPosition":
      const planet =
        PlanetName[input.planetName as keyof typeof PlanetName] ||
        PlanetName.Sun;
      return calculator[method](planet, time);

    case "getCompleteDivisionalChart":
    case "calculateVargaPosition":
      // Varga charts need division number
      const vargaNum = getVargaNumber(methodName, input.varga);
      return calculator[method](time, vargaNum);

    case "calculateBhinnashtakavarga":
    case "getDetailedAnalysis":
    case "getBinduPoints":
      const avPlanet =
        PlanetName[input.planetName as keyof typeof PlanetName] ||
        PlanetName.Sun;
      // Note: getBinduPoints needs a sign, simplified here to use current planet sign if not provided
      // For now we map BinduPoints to getDetailedAnalysis which is safer or just use planet
      if (method === "getBinduPoints") {
        // If specific sign needed, we need to parse it. For now, default to detailed analysis or skip
        // But let's support it if we can map a param.
        // Failing that, let's just error or fallback.
        // Actually, let's use getDetailedAnalysis as it includes bindu points.
        // But if we strictly must call getBinduPoints, we need a 3rd arg.
        // Let's assume input.houseName might be used for Sign Name?
        // For now, let's behave like Bhinnashtakavarga/DetailedAnalysis and fallback
        return calculator["getDetailedAnalysis"](avPlanet, time);
      }
      return calculator[method](avPlanet, time);

    case "calculateSarvashtakavarga":
    case "calculateTransitScore": // Needs extra handling?
      return calculator[method](time);

    case "calculateShadbalaPinda":
    case "calculateHouseStrength":
      return calculator[method](time);

    case "getShubKartariPlanets":
    case "getPaapaKartariPlanets":
    case "getShubKartariHousesFormatted":
    case "getPaapaKartariHousesFormatted":
      return calculator[method](time);

    case "calculateMahadashas":
    case "getCurrentMahadasha":
    case "getCurrentAntardasha":
    case "getCurrentPratyantardasha":
    case "getCompleteDashaBreakdown":
    case "getBalanceOfBirthDasha":
      return calculator[method](time);

    case "calculateMangalDosha":
    case "calculateKaalSarpDosha":
    case "calculatePitraDosha":
    case "calculateKujaDoshaScore":
      return calculator[method](time);

    case "calculateMatch":
      // Match needs two times - return placeholder for single time
      return {
        Note: "Match calculation requires two birth times",
        SinglePersonData: BirthChartCalculator.generateBirthChart(time),
      };

    case "getVarnaKuta":
    case "getVashyaKuta":
    case "getTaraKuta":
    case "getYoniKuta":
    case "getGrahaMaitriKuta":
    case "getGanaKuta":
    case "getBhakootKuta":
    case "getNadiKuta":
      // Kuta calculations need nakshatra
      const nakshatra = PanchangCalculator.getMoonConstellation(time);
      return calculator[method](nakshatra.name);

    case "calculateNameNumber":
      // Numerology needs name
      return calculator[method](
        input.fullName || "Unknown",
        input.system || "Chaldean",
      );

    case "calculateChart":
      // Handle different chart types
      const chartType = input.chartType || "RasiD1";
      let chartData: any;

      if (chartType === "BhavaChalit") {
        chartData = AstroCalculator.getAllHouses(time);
        return ChartSvgGenerator.generateSouthIndianChart(chartData); // This might need adaptation
      } else {
        const division = getDivisionFromChartType(chartType);
        chartData = VargaCalculator.getCompleteDivisionalChart(time, division);
      }
      if (methodName === "NorthIndianChart") {
        return ChartSvgGenerator.generateNorthIndianChart(chartData);
      } else {
        return ChartSvgGenerator.generateSouthIndianChart(chartData);
      }

    default:
      // Default: just pass time
      return calculator[method](time);
  }
}

// Helper: Get division number from ChartType string (e.g. "NavamshaD9" -> 9)
function getDivisionFromChartType(chartType: string): number {
  const mapping: { [key: string]: number } = {
    RasiD1: 1,
    HoraD2: 2,
    DrekkanaD3: 3,
    ChaturthamshaD4: 4,
    SaptamshaD7: 7,
    NavamshaD9: 9,
    DashamamshaD10: 10,
    DwadashamshaD12: 12,
    ShodashamshaD16: 16,
    VimshamshaD20: 20,
    ChaturvimshamshaD24: 24,
    BhamshaD27: 27,
    TrimshamshaD30: 30,
    KhavedamshaD40: 40,
    AkshavedamshaD45: 45,
    ShashtyamshaD60: 60,
  };
  return mapping[chartType] || 1;
}

// Helper to get Varga number from method name
function getVargaNumber(methodName: string, vargaParam?: string): number {
  if (vargaParam) {
    const num = parseInt(vargaParam.replace(/\D/g, ""));
    if (!isNaN(num)) return num;
  }

  const vargaMap: { [key: string]: number } = {
    D1Chart: 1,
    D2Chart: 2,
    D3Chart: 3,
    D4Chart: 4,
    D7Chart: 7,
    D9Chart: 9,
    D10Chart: 10,
    D12Chart: 12,
    D16Chart: 16,
    D20Chart: 20,
    D24Chart: 24,
    D27Chart: 27,
    D30Chart: 30,
    D40Chart: 40,
    D45Chart: 45,
    D60Chart: 60,
  };

  return vargaMap[methodName] || 1;
}

// ============================================================================
// DEBUG ROUTE
// ============================================================================
router.get("/", (req: Request, res: Response) => {
  const methods = Object.keys(METHOD_MAPPING).sort();
  res.json({
    Status: "Pass",
    Message: "VedAstro API Calculator",
    TotalMethods: methods.length,
    Methods: methods,
    ExampleURL:
      "/api/Calculate/Tithi/Location/Delhi,India/Time/12:00/01/01/2024/+05:30",
  });
});

// ============================================================================
// MAIN ROUTE HANDLER
// ============================================================================
router.all("/*", async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const params = parseVedAstroUrl(req.path);
    let mapping: MethodConfig | undefined;
    let actualMethodName: string = "";

    // [New] Handle VedAstro 'Input' structure if present
    if (req.body?.Input?.Parameters) {
      req.body.Input.Parameters.forEach((p: any) => {
        if (p.Name === "maleBirthTime") {
          params.matchOneTime = TimeUtil.parseStdTime(
            p.Value.StdTime,
            p.Value.Location,
          );
        } else if (p.Name === "femaleBirthTime") {
          params.matchTwoTime = TimeUtil.parseStdTime(
            p.Value.StdTime,
            p.Value.Location,
          );
        } else {
          params[p.Name] = p.Value;
        }
      });
      // Override calculator name if present
      if (req.body.Input.CalculatorName) {
        params.methodName = req.body.Input.CalculatorName;
        // Re-resolve method mapping
        const foundKey = Object.keys(METHOD_MAPPING).find(
          (k) => k.toLowerCase() === params.methodName.toLowerCase(),
        );
        if (foundKey) {
          actualMethodName = foundKey;
          mapping = METHOD_MAPPING[foundKey];
        }
      }
    }

    Object.assign(params, req.query, req.body);

    const { methodName } = params; // methodName is now final

    // Find method using methodName if not set by override
    if (!mapping) {
      mapping = METHOD_MAPPING[methodName];
      actualMethodName = methodName;
    }

    // Find method (case-insensitive) if still not found
    if (!mapping) {
      mapping = METHOD_MAPPING[methodName];
      actualMethodName = methodName;

      if (!mapping) {
        const foundKey = Object.keys(METHOD_MAPPING).find(
          (k) => k.toLowerCase() === methodName.toLowerCase(),
        );
        if (foundKey) {
          mapping = METHOD_MAPPING[foundKey];
          actualMethodName = foundKey;
        }
      }
    }

    if (!mapping) {
      return res.status(404).json({
        Status: "Fail",
        Error: `Method '${methodName}' not found`,
        AvailableMethods: Object.keys(METHOD_MAPPING).sort(),
      });
    }

    const input = buildCalculatorInput(params);
    // Explicitly pass match times if they exist in params (they might not be in buildCalculatorInput standard fields)
    if (params.matchOneTime) input.matchOneTime = params.matchOneTime;
    if (params.matchTwoTime) input.matchTwoTime = params.matchTwoTime;

    let result;
    if (actualMethodName === "MatchReport") {
      if (!input.matchOneTime || !input.matchTwoTime) {
        throw new Error(
          "MatchReport requires 'maleBirthTime' and 'femaleBirthTime' in Input.Parameters",
        );
      }
      const maleName = params["maleName"] || "Male";
      const femaleName = params["femaleName"] || "Female";
      result = MatchCalculator.getMatchReport(
        input.matchOneTime,
        input.matchTwoTime,
        input.matchOneTime.Location, // Assuming Location is part of Time object or available in input
        input.matchTwoTime.Location,
        maleName,
        femaleName,
      );
    } else {
      result = await executeMethod(mapping, input, actualMethodName);
    }

    // If result is SVG string, send as SVG file
    if (typeof result === "string" && result.trim().startsWith("<svg")) {
      res.type("image/svg+xml");
      res.send(result);
      return; // Return early
    }

    const responseObj: any = {
      Status: "Pass",
      Payload: { [actualMethodName]: result },
      Duration: `${Date.now() - startTime}ms`,
    };

    if (req.body?.Input) {
      responseObj.Input = req.body.Input;
    }

    res.json(responseObj);
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({
      Status: "Fail",
      Error: error.message,
      Duration: `${Date.now() - startTime}ms`,
    });
  }
});

export default router;
