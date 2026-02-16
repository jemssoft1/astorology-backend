/**
 * Base Calculator Class
 * Provides common functionality for all calculator classes
 */

// CalculatorInput interface - standardized input for all calculators
export interface CalculatorInput {
  location: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
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
  sortByWeight?: boolean;
  [key: string]: any;
}

/**
 * BaseCalculator - Abstract base class for all calculator classes
 * Provides common utility methods that can be shared across calculators
 */
export abstract class BaseCalculator {
  /**
   * Validate calculator input
   * Can be overridden by child classes for specific validation
   */
  protected static validateInput(input: CalculatorInput): boolean {
    if (!input) {
      throw new Error("Input cannot be null or undefined");
    }

    if (!input.location) {
      throw new Error("Location is required");
    }

    if (!input.datetime) {
      throw new Error("Datetime is required");
    }

    // Validate datetime fields
    const { year, month, day, hour, minute } = input.datetime;
    if (
      year === undefined ||
      month === undefined ||
      day === undefined ||
      hour === undefined ||
      minute === undefined
    ) {
      throw new Error("All datetime fields are required");
    }

    return true;
  }

  /**
   * Parse timezone string to offset in hours
   * e.g., "+05:30" => 5.5, "-08:00" => -8
   */
  protected static parseTimezone(timezone: string): number {
    const match = timezone.match(/([+-])(\d{1,2}):(\d{2})/);
    if (!match) {
      return 0;
    }

    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);

    return sign * (hours + minutes / 60);
  }

  /**
   * Format timezone offset to string
   * e.g., 5.5 => "+05:30", -8 => "-08:00"
   */
  protected static formatTimezone(offset: number): string {
    const sign = offset >= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset);
    const minutes = Math.round((absOffset - hours) * 60);

    return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
}
