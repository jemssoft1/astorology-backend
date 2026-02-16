import { Time } from "../types/interfaces";
import { PlanetName, ZodiacName, HouseName } from "../types/enums";
import { BirthChartCalculator } from "./BirthChartCalculator";

/**
 * Prediction Calculator
 * Generates text-based predictions based on planetary positions
 */
export class PredictionCalculator {
  static getHoroscopePredictions(
    time: Time,
    sortByWeight: boolean = true,
  ): any[] {
    const birthChart = BirthChartCalculator.generateBirthChart(time);
    const predictions: any[] = [];

    // 1. Sun Sign Prediction
    const sun = birthChart.planets.find((p) => p.planet === PlanetName.Sun);
    if (sun) {
      predictions.push({
        category: "Personality",
        title: "Sun Sign Analysis",
        description: `With Sun in ${ZodiacName[sun.sign.name]}, your core personality is radiant and confident.`,
        weight: 10,
      });
    }

    // 2. Moon Sign Prediction
    const moon = birthChart.planets.find((p) => p.planet === PlanetName.Moon);
    if (moon) {
      predictions.push({
        category: "Emotions",
        title: "Moon Sign Analysis",
        description: `With Moon in ${ZodiacName[moon.sign.name]}, your emotional nature is instinctive and protective.`,
        weight: 9,
      });
    }

    // 3. Ascendant Prediction
    const asc = birthChart.lagna;
    predictions.push({
      category: "Self",
      title: "Ascendant Analysis",
      description: `Your Ascendant is ${ZodiacName[asc.name]}, indicating your approach to life.`,
      weight: 10,
    });

    // Sort if requested
    if (sortByWeight) {
      predictions.sort((a, b) => b.weight - a.weight);
    }

    return predictions;
  }
}
