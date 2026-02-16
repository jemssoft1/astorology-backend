import { Time } from "../types/interfaces";

/**
 * Utility for normalizing Time and Location data
 */
export class TimeUtil {
  /**
   * City coordinates mapping
   */
  private static readonly CITY_COORDS: { [key: string]: [number, number] } = {
    delhi: [28.61, 77.23],
    mumbai: [19.08, 72.88],
    chennai: [13.08, 80.27],
    kolkata: [22.57, 88.36],
    surat: [21.17, 72.83],
    bangalore: [12.97, 77.59],
    bengaluru: [12.97, 77.59],
    hyderabad: [17.39, 78.49],
    pune: [18.52, 73.86],
    ahmedabad: [23.02, 72.57],
    jaipur: [26.91, 75.79],
  };

  /**
   * Normalizes a partial Time object from request body
   */
  static normalizeTime(input: any): Time {
    if (!input) {
      throw new Error("Input data is missing");
    }

    // 🆕 Handle string input (YYYY-MM-DD HH:mm:ss)
    let timeObj = input;
    if (typeof input === "string") {
      // Check for ISO-like or SQL-like format
      const date = new Date(input);
      if (!isNaN(date.getTime())) {
        timeObj = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: date.getSeconds(),
        };
      }
    }

    // Default time fields
    const year = parseInt(timeObj.year) || new Date().getFullYear();
    const month = parseInt(timeObj.month) || new Date().getMonth() + 1;
    const day = parseInt(timeObj.day) || new Date().getDate();
    const hour = parseInt(timeObj.hour ?? 0);
    const minute = parseInt(timeObj.minute ?? 0);
    const second = parseInt(timeObj.second ?? 0);

    // Location handling
    const locationName = timeObj.location?.name || "Delhi";
    let latitude = parseFloat(timeObj.location?.latitude);
    let longitude = parseFloat(timeObj.location?.longitude);
    let timezone = timeObj.location?.timezone;

    // Resolve coordinates if missing
    if (isNaN(latitude) || isNaN(longitude)) {
      const lowerCity = locationName.toLowerCase();
      let found = false;
      for (const [city, coords] of Object.entries(this.CITY_COORDS)) {
        if (lowerCity.includes(city)) {
          [latitude, longitude] = coords;
          found = true;
          break;
        }
      }

      if (!found) {
        // Default to Delhi if not found and not provided
        if (isNaN(latitude)) latitude = 28.61;
        if (isNaN(longitude)) longitude = 77.23;
      }
    }

    // Resolve timezone offset if missing
    let timezoneOffset = 5.5; // Default to India
    if (timezone !== undefined && timezone !== null) {
      if (typeof timezone === "string") {
        const tzMatch = timezone.match(/([+-]?)(\d{1,2}):?(\d{2})?/);
        if (tzMatch) {
          const sign = tzMatch[1] === "-" ? -1 : 1;
          const hours = parseInt(tzMatch[2]);
          const minutes = parseInt(tzMatch[3] || "0");
          timezoneOffset = sign * (hours + minutes / 60);
        } else {
          timezoneOffset = parseFloat(timezone) || 5.5;
        }
      } else {
        timezoneOffset = timezone;
      }
    }

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      location: {
        name: locationName,
        latitude,
        longitude,
        timezone: timezoneOffset,
      },
    };
  }

  /**
   * Parses time from standard format: "HH:mm DD/MM/YYYY +HH:mm"
   * Example: "05:15 18/02/1997 +05:30"
   */
  static parseStdTime(stdTime: string, locationCtx: any): Time {
    try {
      if (!stdTime) throw new Error("StdTime is missing");

      // Check if ISO string (e.g. 2026-02-09T18:30:00.000Z)
      if (
        stdTime.includes("T") &&
        stdTime.includes("-") &&
        (stdTime.endsWith("Z") ||
          stdTime.includes("+") ||
          stdTime.includes("-"))
      ) {
        const date = new Date(stdTime);
        if (!isNaN(date.getTime())) {
          // It's a valid date
          // If it ends in Z, it's UTC. Components:
          // But VedAstro Time expects "Local Time" relative to "Timezone".
          // If we return UTC components, we must set timezone 0.
          // However, usually users might provide ISO string of LOCAL time?
          // "2026-02-09T18:30:00.000Z" IS UTC.
          // So we return UTC time and timezone 0.

          // Logic: Use UTC components and Timezone 0.
          return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            second: date.getUTCSeconds(),
            location: {
              name: locationCtx?.Name || locationCtx?.name || "Unknown",
              latitude: locationCtx?.Latitude || locationCtx?.latitude || 0,
              longitude: locationCtx?.Longitude || locationCtx?.longitude || 0,
              timezone: 0, // UTC
            },
          };
        }
      }

      // stdTime: "05:15 18/02/1997 +05:30"
      const parts = stdTime.trim().split(" ");
      if (parts.length < 3) throw new Error("Invalid StdTime format");

      const [timeStr, dateStr, tzStr] = parts;
      const [hour, minute] = timeStr.split(":").map(Number);
      const [day, month, year] = dateStr.split("/").map(Number);

      // Parse Timezone
      // +05:30 -> 5.5
      let timezone = 0;
      const tzMatch = tzStr.match(/([+-]?)(\d{1,2}):?(\d{2})?/);
      if (tzMatch) {
        const sign = tzMatch[1] === "-" ? -1 : 1;
        const h = parseInt(tzMatch[2]);
        const m = parseInt(tzMatch[3] || "0");
        timezone = sign * (h + m / 60);
      }

      return {
        year,
        month,
        day,
        hour,
        minute,
        second: 0,
        location: {
          name: locationCtx?.Name || locationCtx?.name || "Unknown",
          latitude: locationCtx?.Latitude || locationCtx?.latitude || 0,
          longitude: locationCtx?.Longitude || locationCtx?.longitude || 0,
          timezone: timezone,
        },
      };
    } catch (e) {
      console.error("Error parsing StdTime:", e);
      return this.normalizeTime({}); // fallback
    }
  }
}
