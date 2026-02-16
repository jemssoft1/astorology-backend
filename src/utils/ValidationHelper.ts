// src/utils/ValidationHelper.ts
import { Time, PlanetPosition, Angle } from "../types/interfaces";

export class ValidationHelper {
  /**
   * Validates that the Time object has all required properties
   */
  static validateTime(time: Time): void {
    if (!time) {
      throw new Error("Time object is required");
    }

    if (time.year === undefined || time.year === null) {
      throw new Error("Time.year is required");
    }

    if (time.month === undefined || time.month === null) {
      throw new Error("Time.month is required");
    }

    if (time.day === undefined || time.day === null) {
      throw new Error("Time.day is required");
    }

    if (time.hour === undefined || time.hour === null) {
      throw new Error("Time.hour is required");
    }

    if (time.minute === undefined || time.minute === null) {
      throw new Error("Time.minute is required");
    }

    if (!time.location) {
      throw new Error("Time.location is required");
    }

    if (
      time.location.longitude === undefined ||
      time.location.longitude === null
    ) {
      throw new Error("Time.location.longitude is required");
    }

    if (
      time.location.latitude === undefined ||
      time.location.latitude === null
    ) {
      throw new Error("Time.location.latitude is required");
    }
  }

  /**
   * Validates a planet position object
   */
  static validatePlanetPosition(
    position: PlanetPosition | undefined,
    planetName: string,
  ): asserts position is PlanetPosition {
    if (!position) {
      throw new Error(`Planet position for ${planetName} is undefined`);
    }

    if (!position.longitude) {
      throw new Error(`Longitude for ${planetName} is undefined`);
    }

    if (position.longitude.totalDegrees === undefined) {
      throw new Error(`Longitude.totalDegrees for ${planetName} is undefined`);
    }

    if (!position.sign) {
      throw new Error(`Sign for ${planetName} is undefined`);
    }
  }

  /**
   * Validates an Angle object
   */
  static validateAngle(
    angle: Angle | undefined,
    context: string,
  ): asserts angle is Angle {
    if (!angle) {
      throw new Error(`Angle is undefined in ${context}`);
    }

    if (angle.totalDegrees === undefined) {
      throw new Error(`Angle.totalDegrees is undefined in ${context}`);
    }
  }
}
