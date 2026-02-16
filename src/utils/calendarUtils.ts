import dayjs from "dayjs";
import { PanchangCalculator } from "../core/PanchangCalculator";
import { Time } from "../types/interfaces";

export interface CalendarDate {
  date: string; // ISO format: YYYY-MM-DD
  day: string; // Day name: Monday, Tuesday, etc.
  dayNumber: number; // 1-31
  active: boolean; // true if today
  isCurrentMonth: boolean; // true if belongs to current month
  panchang: {
    tithi: {
      name: string;
      paksha: string;
      completeName: string; // e.g., "Krishna Ekadashi"
    };
    nakshatra: {
      name: string;
      pada: number;
    };
    yoga: {
      name: string;
    };
    karana: {
      name: string;
    };
    sunrise: string;
    sunset: string;
    vara: {
      name: string;
      lord: string;
    };
  };
}

export interface CalendarWeek {
  dates: CalendarDate[];
}

export interface MonthCalendar {
  month: string; // Month name: January, February, etc.
  monthNumber: number; // 1-12
  year: number;
  currentDate: string; // Today's date in ISO format
  totalDays: number;
  firstDayOfWeek: string; // Sunday, Monday, etc.
  previousMonth: {
    month: number;
    year: number;
  };
  nextMonth: {
    month: number;
    year: number;
  };
  dates: CalendarDate[]; // All dates in a single array
}

/**
 * Generate a month-wise calendar with Hindu Panchang details
 * @param month - Month number (1-12), defaults to current month
 * @param year - Year (e.g., 2026), defaults to current year
 * @returns MonthCalendar object
 */
export function generateMonthCalendar(
  month?: number,
  year?: number,
): MonthCalendar {
  // Get current date
  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");

  // Use provided month/year or default to current
  const targetMonth = month ?? today.month() + 1; // dayjs months are 0-indexed
  const targetYear = year ?? today.year();

  // Create date object for the target month
  const targetDate = dayjs(`${targetYear}-${targetMonth}-01`);

  // Get month details
  const monthName = targetDate.format("MMMM");
  const totalDays = targetDate.daysInMonth();
  const firstDayOfWeek = targetDate.format("dddd");

  // Calculate previous and next month
  const prevMonth = targetDate.subtract(1, "month");
  const nextMonth = targetDate.add(1, "month");

  // Create array to store all dates
  const allDates: CalendarDate[] = [];

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayIndex = targetDate.day();

  // Add all days of the current month only
  for (let day = 1; day <= totalDays; day++) {
    const date = dayjs(`${targetYear}-${targetMonth}-${day}`);
    const dateStr = date.format("YYYY-MM-DD");

    // Calculate Panchang for this date
    // Defaulting to 6:00 AM for calculation standard
    // Using New Delhi coordinates as default location
    const time: Time = {
      year: date.year(),
      month: date.month() + 1,
      day: date.date(),
      hour: 6,
      minute: 0,
      second: 0,
      location: {
        name: "New Delhi",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
      },
    };

    let panchangData;
    try {
      const panchang = PanchangCalculator.getPanchang(time);
      const tithiFormatted = PanchangCalculator.getLunarDayFormatted(time);
      const yogaFormatted = PanchangCalculator.getNithyaYogaFormatted(time);
      const karanaFormatted = PanchangCalculator.getKaranaFormatted(time);
      const varaFormatted = PanchangCalculator.getDayOfWeekFormatted(time);
      const lordFormatted = PanchangCalculator.getLordOfWeekdayFormatted(time);

      // Nakshatra Name Helper (simple mapping or from calculator if available as string)
      const getNakshatraName = (num: number) => {
        const names = [
          "Ashwini",
          "Bharani",
          "Krittika",
          "Rohini",
          "Mrigashira",
          "Ardra",
          "Punarvasu",
          "Pushya",
          "Ashlesha",
          "Magha",
          "Purva Phalguni",
          "Uttara Phalguni",
          "Hasta",
          "Chitra",
          "Swati",
          "Vishakha",
          "Anuradha",
          "Jyeshtha",
          "Mula",
          "Purva Ashadha",
          "Uttara Ashadha",
          "Shravana",
          "Dhanishta",
          "Shatabhisha",
          "Purva Bhadrapada",
          "Uttara Bhadrapada",
          "Revati",
        ];
        return names[num - 1] || `Nakshatra ${num}`;
      };

      panchangData = {
        tithi: {
          name: tithiFormatted.Name,
          paksha: tithiFormatted.Paksha,
          completeName: `${tithiFormatted.Paksha} ${tithiFormatted.Name}`,
        },
        nakshatra: {
          name: getNakshatraName(panchang.nakshatra.name),
          pada: panchang.nakshatra.pada,
        },
        yoga: {
          name: yogaFormatted.Name,
        },
        karana: {
          name: karanaFormatted,
        },
        sunrise: panchang.sunrise.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sunset: panchang.sunset.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        vara: {
          name: varaFormatted,
          lord: lordFormatted.Name,
        },
      };
    } catch (e) {
      console.error(`Error calculating panchang for ${dateStr}`, e);
      // Fallback or partial data could go here
      panchangData = {
        tithi: { name: "Unknown", paksha: "", completeName: "" },
        nakshatra: { name: "Unknown", pada: 0 },
        yoga: { name: "Unknown" },
        karana: { name: "Unknown" },
        sunrise: "",
        sunset: "",
        vara: { name: date.format("dddd"), lord: "" },
      };
    }

    allDates.push({
      date: dateStr,
      day: date.format("dddd"),
      dayNumber: day,
      active: dateStr === todayStr,
      isCurrentMonth: true,
      panchang: panchangData,
    });
  }

  return {
    month: monthName,
    monthNumber: targetMonth,
    year: targetYear,
    currentDate: todayStr,
    totalDays,
    firstDayOfWeek,
    previousMonth: {
      month: prevMonth.month() + 1,
      year: prevMonth.year(),
    },
    nextMonth: {
      month: nextMonth.month() + 1,
      year: nextMonth.year(),
    },
    dates: allDates,
  };
}

/**
 * Get day name from day number (0-6)
 */
export function getDayName(dayNumber: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber] || "Unknown";
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(monthNumber: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber - 1] || "Unknown";
}
