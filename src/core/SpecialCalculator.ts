import { BaseCalculator, CalculatorInput } from "./BaseCalculator";
import { BirthChartCalculator } from "./BirthChartCalculator";
import { Time } from "../types/interfaces";
import { PlanetName, ConstellationName } from "../types/enums";

// Pancha Pakshi Birds
const PAKSHI_BIRDS = ["Vulture", "Owl", "Crow", "Cock", "Peacock"];

// Nakshatra to Bird mapping (based on birth nakshatra and day/night)
const NAKSHATRA_PAKSHI_MAP: { [key: string]: { day: string; night: string } } =
  {
    Ashwini: { day: "Vulture", night: "Owl" },
    Bharani: { day: "Owl", night: "Crow" },
    Krittika: { day: "Crow", night: "Cock" },
    Rohini: { day: "Cock", night: "Peacock" },
    Mrigashira: { day: "Peacock", night: "Vulture" },
    Ardra: { day: "Vulture", night: "Owl" },
    Punarvasu: { day: "Owl", night: "Crow" },
    Pushya: { day: "Crow", night: "Cock" },
    Ashlesha: { day: "Cock", night: "Peacock" },
    Magha: { day: "Peacock", night: "Vulture" },
    PurvaPhalguni: { day: "Vulture", night: "Owl" },
    UttaraPhalguni: { day: "Owl", night: "Crow" },
    Hasta: { day: "Crow", night: "Cock" },
    Chitra: { day: "Cock", night: "Peacock" },
    Swati: { day: "Peacock", night: "Vulture" },
    Vishakha: { day: "Vulture", night: "Owl" },
    Anuradha: { day: "Owl", night: "Crow" },
    Jyeshtha: { day: "Crow", night: "Cock" },
    Mula: { day: "Cock", night: "Peacock" },
    PurvaAshadha: { day: "Peacock", night: "Vulture" },
    UttaraAshadha: { day: "Vulture", night: "Owl" },
    Shravana: { day: "Owl", night: "Crow" },
    Dhanishta: { day: "Crow", night: "Cock" },
    Shatabhisha: { day: "Cock", night: "Peacock" },
    PurvaBhadrapada: { day: "Peacock", night: "Vulture" },
    UttaraBhadrapada: { day: "Vulture", night: "Owl" },
    Revati: { day: "Owl", night: "Crow" },
  };

export class SpecialCalculator extends BaseCalculator {
  /**
   * Get Pancha Pakshi Birth Bird
   * Based on Moon Nakshatra at birth and whether birth was day or night
   */
  static async getPanchaPakshiBirthBird(input: CalculatorInput): Promise<any> {
    // Convert CalculatorInput to Time format
    const birthTime: Time = {
      year: input.datetime.year,
      month: input.datetime.month,
      day: input.datetime.day,
      hour: input.datetime.hour,
      minute: input.datetime.minute,
      second: input.datetime.second || 0,
      location: {
        name: input.location.name || "",
        latitude: input.location.latitude || 0,
        longitude: input.location.longitude || 0,
        timezone: input.datetime.timezone || 5.5,
      },
    };

    const chart = BirthChartCalculator.generateBirthChart(birthTime);

    // Get Moon's nakshatra
    const moon = chart.planets.find((p: any) => p.planet === PlanetName.Moon);
    const constellationEnum =
      moon?.constellation?.name || ConstellationName.Aswini;

    // Determine if birth was during day or night
    const birthHour = input.datetime.hour;
    const isDayBirth = birthHour >= 6 && birthHour < 18;

    // Convert constellation enum to nakshatra name string for NAKSHATRA_PAKSHI_MAP lookup
    const nakshatraName = ConstellationName[constellationEnum];
    const pakshiInfo = NAKSHATRA_PAKSHI_MAP[nakshatraName] || {
      day: "Vulture",
      night: "Owl",
    };

    const birthBird = isDayBirth ? pakshiInfo.day : pakshiInfo.night;

    return {
      birthBird: birthBird,
      nakshatra: ConstellationName[constellationEnum],
      birthTime: isDayBirth ? "Day" : "Night",
      allBirds: PAKSHI_BIRDS,
      description: this.getBirdDescription(birthBird),
    };
  }

  /**
   * Get bird description and characteristics
   */
  private static getBirdDescription(bird: string): string {
    const descriptions: { [key: string]: string } = {
      Vulture:
        "Vulture represents death, transformation, and the ability to see through illusions. People with Vulture as birth bird are patient and observant.",
      Owl: "Owl represents wisdom, intuition, and the ability to see in darkness. Owl natives are intelligent and have deep insight.",
      Crow: "Crow represents intelligence, adaptability, and communication. Crow natives are clever and resourceful.",
      Cock: "Cock represents courage, alertness, and punctuality. Cock natives are brave and disciplined.",
      Peacock:
        "Peacock represents beauty, grace, and pride. Peacock natives are attractive and have artistic abilities.",
    };
    return descriptions[bird] || "";
  }

  /**
   * Get current Pancha Pakshi activity
   */
  static async getCurrentPanchaPakshiActivity(
    input: CalculatorInput,
  ): Promise<any> {
    const birthBirdInfo = await this.getPanchaPakshiBirthBird(input);

    // Activities cycle: Rule, Eat, Walk, Sleep, Die
    const activities = ["Rule", "Eat", "Walk", "Sleep", "Die"];

    // Calculate current activity based on time
    const hour = input.datetime.hour;
    const activityIndex = Math.floor(hour / 4.8) % 5;

    return {
      birthBird: birthBirdInfo.birthBird,
      currentActivity: activities[activityIndex],
      activityStrength: this.getActivityStrength(activities[activityIndex]),
      favorableFor: this.getFavorableActions(activities[activityIndex]),
    };
  }

  private static getActivityStrength(activity: string): string {
    const strengths: { [key: string]: string } = {
      Rule: "Very Strong - Best for important decisions",
      Eat: "Strong - Good for material gains",
      Walk: "Moderate - Good for travel and movement",
      Sleep: "Weak - Rest and recuperation",
      Die: "Very Weak - Avoid important activities",
    };
    return strengths[activity] || "Unknown";
  }

  private static getFavorableActions(activity: string): string[] {
    const actions: { [key: string]: string[] } = {
      Rule: [
        "Business decisions",
        "Leadership activities",
        "Starting new ventures",
      ],
      Eat: ["Financial transactions", "Acquiring property", "Investments"],
      Walk: ["Travel", "Meeting people", "Exercise", "Moving residence"],
      Sleep: ["Rest", "Meditation", "Healing", "Recuperation"],
      Die: ["Avoid important activities", "Spiritual practices", "Letting go"],
    };
    return actions[activity] || [];
  }
}
