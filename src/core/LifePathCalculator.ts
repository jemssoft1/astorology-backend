// import { Time } from "../types/interfaces";
// import {
//   LifeEvent,
//   TimeSlice,
//   LifePathPrediction,
//   LifePathConfiguration,
//   LifePathRequest,
// } from "../types/lifepath";
// import { EnhancedDashaCalculator } from "./EnhancedDashaCalculator";
// import { DashaCalculator } from "./DashaCalculator";
// import { PlanetName } from "../types/enums";
// import { v4 as uuidv4 } from "uuid";

// /**
//  * Life Path Calculator
//  * Generates comprehensive life predictions based on Dasha periods
//  */
// export class LifePathCalculator {
//   // Dasha description templates
//   private static readonly DASHA_EFFECTS: Record<
//     string,
//     Record<string, { good: string; bad: string; score: number }>
//   > = {
//     Sun: {
//       Sun: {
//         score: 2.72,
//         good: "Authority, leadership, success, vitality, father\u0027s blessings, government favors, promotion",
//         bad: "Ego issues, conflicts with authority, health problems related to heart/eyes, disputes with father",
//       },
//       Moon: {
//         score: 1.5,
//         good: "Mental peace, emotional stability, mother\u0027s support, property gains, public recognition",
//         bad: "Mental stress, mood swings, relationship issues with mother, water-related problems",
//       },
//       Mars: {
//         score: 0.9,
//         good: "Energy, courage, property gains, sibling support, victory over enemies",
//         bad: "Accidents, injuries, blood disorders, conflicts, impulsiveness, brother disputes",
//       },
//       Rahu: {
//         score: -1.5,
//         good: "Foreign gains, unconventional success, technology gains",
//         bad: "Confusion, deception, sudden losses, legal issues, health issues",
//       },
//       Jupiter: {
//         score: 3.2,
//         good: "Wisdom, spiritual growth, children\u0027s success, wealth, learning, teacher\u0027s guidance",
//         bad: "Over-optimism, weight gain, disputes with advisors",
//       },
//       Saturn: {
//         score: -4.72,
//         good: "Hard work pays off, discipline, long-term gains",
//         bad: "Delays, obstacles, chronic health issues, depression, father issues",
//       },
//       Mercury: {
//         score: 1.72,
//         good: "Business success, communication skills, learning, trade gains, writing success",
//         bad: "Speech issues, nervous disorders, business losses, skin problems",
//       },
//       Ketu: {
//         score: -2.1,
//         good: "Spiritual insights, moksha, detachment, occult knowledge",
//         bad: "Losses, separations, accidents, unclear thinking, health issues",
//       },
//       Venus: {
//         score: 0.63,
//         good: "Luxury, marriage, artistic success, vehicle gains, comfort, romance",
//         bad: "Relationship troubles, expenses on luxury, diabetes, urinary issues",
//       },
//     },
//     Moon: {
//       Sun: {
//         score: 1.5,
//         good: "Recognition, authority through emotions, creative success, mental clarity",
//         bad: "Conflict between heart and ego, stress",
//       },
//       Moon: {
//         score: 2.1,
//         good: "Mental peace, mother\u0027s blessings, property gains, emotional happiness",
//         bad: "Over-sensitivity, mood disorders, sleep issues",
//       },
//       Mars: {
//         score: 0.5,
//         good: "Emotional courage, protective instincts, real estate gains",
//         bad: "Emotional outbursts, blood pressure, digestive issues",
//       },
//       Rahu: {
//         score: -2,
//         good: "Imagination, foreign travel, mass appeal",
//         bad: "Mental confusion, illusions, phobias, mother\u0027s health",
//       },
//       Jupiter: {
//         score: 2.8,
//         good: "Peace of mind, spiritual growth, children, wealth, wisdom",
//         bad: "Over-emotional, weight gain",
//       },
//       Saturn: {
//         score: -3.5,
//         good: "Emotional maturity, patience, long-term gains",
//         bad: "Depression, separations, delays, mother\u0027s health issues",
//       },
//       Mercury: {
//         score: 1.9,
//         good: "Emotional intelligence, communication, business through women",
//         bad: "Nervous tension, indecisiveness",
//       },
//       Ketu: {
//         score: -1.8,
//         good: "Spiritual insights, intuition, meditation",
//         bad: "Emotional detachment, losses through mother",
//       },
//       Venus: {
//         score: 0.9,
//         good: "Luxury, comfort, marriage, artistic talents, happiness",
//         bad: "Excessive emotions, relationship issues",
//       },
//     },
//     Mars: {
//       Sun: {
//         score: 0.9,
//         good: "Courage, victory, leadership in action, property through father",
//         bad: "Accidents, conflicts, aggression",
//       },
//       Moon: {
//         score: 0.5,
//         good: "Emotional strength, protective nature, real estate",
//         bad: "Anger issues, blood pressure",
//       },
//       Mars: {
//         score: 1.2,
//         good: "Immense energy, sports success, victory, property, siblings support",
//         bad: "Accidents prone, surgeries, violence, fights",
//       },
//       Rahu: {
//         score: -2.2,
//         good: "Technical skills, foreign connections, unconventional gains",
//         bad: "Sudden accidents, deception, legal troubles",
//       },
//       Jupiter: {
//         score: 2.1,
//         good: "Righteous action, protection, property, wisdom in action",
//         bad: "Over-confidence, recklessness",
//       },
//       Saturn: {
//         score: -4.1,
//         good: "Disciplined hard work, real estate through effort",
//         bad: "Chronic pain, injuries, obstacles, frustration",
//       },
//       Mercury: {
//         score: 1.1,
//         good: "Business skills, strategic thinking, technical abilities",
//         bad: "Conflicts in communication, nervous energy",
//       },
//       Ketu: {
//         score: -1.5,
//         good: "Spiritual warrior, occult powers, detached action",
//         bad: "Injuries, separation from siblings, unclear goals",
//       },
//       Venus: {
//         score: -0.2,
//         good: "Luxury vehicles, artistic expression, passion",
//         bad: "Relationship conflicts, excessive desires",
//       },
//     },
//     Rahu: {
//       Sun: {
//         score: -1.5,
//         good: "Unconventional authority, foreign success, technology",
//         bad: "Ego battles, deception, father\u0027s health",
//       },
//       Moon: {
//         score: -2,
//         good: "Imagination, psychology, mass appeal, foreign residence",
//         bad: "Mental confusion, phobias, addictions, mother\u0027s issues",
//       },
//       Mars: {
//         score: -2.2,
//         good: "Technical expertise, foreign military, engineering",
//         bad: "Accidents, sudden events, violence, legal issues",
//       },
//       Rahu: {
//         score: -3,
//         good: "Foreign gains, technology boom, unconventional success, research",
//         bad: "Extreme confusion, addictions, scandals, sudden falls, health mysteries",
//       },
//       Jupiter: {
//         score: 0.5,
//         good: "Foreign education, unorthodox wisdom, research success",
//         bad: "Confusion in beliefs, guru conflicts",
//       },
//       Saturn: {
//         score: -5,
//         good: "Long-term foreign gains, technical mastery",
//         bad: "Chronic mysterious illnesses, extreme delays, fear, scandals",
//       },
//       Mercury: {
//         score: -1,
//         good: "Technology business, foreign trade, writing about mysteries",
//         bad: "Communication troubles, nervous disorders, cheating",
//       },
//       Ketu: {
//         score: -3.5,
//         good: "Moksha, spiritual breakthroughs, occult mastery",
//         bad: "Extreme confusion, total loss, separations, health crises",
//       },
//       Venus: {
//         score: -2.82,
//         good: "Foreign romance, unusual comforts, artistic innovation",
//         bad: "Relationship deception, unusual diseases, scandal",
//       },
//     },
//     Jupiter: {
//       Sun: {
//         score: 3.2,
//         good: "Authority with wisdom, spiritual leadership, success, children, teaching",
//         bad: "Over-confidence, father\u0027s pride issues",
//       },
//       Moon: {
//         score: 2.8,
//         good: "Mental peace, wisdom, children, property, mother\u0027s blessings, intuition",
//         bad: "Over-attachment, emotional excess",
//       },
//       Mars: {
//         score: 2.1,
//         good: "Righteous action, property, courage with wisdom, victory",
//         bad: "Over-aggression, conflicts with mentors",
//       },
//       Rahu: {
//         score: 0.5,
//         good: "Unconventional wisdom, foreign teaching, research, technology with ethics",
//         bad: "Confusion in beliefs, guru conflicts, legal troubles",
//       },
//       Jupiter: {
//         score: 3.9,
//         good: "Peak wisdom, wealth, children, spiritual growth, teaching, success",
//         bad: "Excessive optimism, weight gain, liver issues",
//       },
//       Saturn: {
//         score: -1.2,
//         good: "Patient wisdom, long-term learning, mature decisions",
//         bad: "Delayed education, obstacles in growth, guru troubles",
//       },
//       Mercury: {
//         score: 2.5,
//         good: "Business wisdom, teaching, writing, communication success, learning",
//         bad: "Over-intellectualization",
//       },
//       Ketu: {
//         score: 0.8,
//         good: "Spiritual wisdom, moksha, ancient knowledge, meditation",
//         bad: "Detachment from family, losses despite wisdom",
//       },
//       Venus: {
//         score: 1.5,
//         good: "Wealth, luxury, happy marriage, artistic success, comfort, children",
//         bad: "Excessive indulgence, diabetes",
//       },
//     },
//     Saturn: {
//       Sun: {
//         score: -4.72,
//         good: "Hard-earned authority, discipline, long-term success",
//         bad: "Conflicts with authority, delays, health issues, father troubles",
//       },
//       Moon: {
//         score: -3.5,
//         good: "Emotional maturity, patience, practical mindset",
//         bad: "Depression, separations, mother\u0027s health, mental stress",
//       },
//       Mars: {
//         score: -4.1,
//         good: "Disciplined action, hard work on property, endurance",
//         bad: "Chronic pain, injuries, obstacles, frustration, sibling issues",
//       },
//       Rahu: {
//         score: -5,
//         good: "Long-term foreign gains, patience in research",
//         bad: "Extreme obstacles, mysterious chronic illnesses, fear",
//       },
//       Jupiter: {
//         score: -1.2,
//         good: "Patient learning, mature wisdom, slow but steady growth",
//         bad: "Delayed education, obstacles with children/teachers",
//       },
//       Saturn: {
//         score: -6.47,
//         good: "Mastery through hardship, long-term gains, discipline",
//         bad: "Extreme delays, chronic illness, depression, isolation, career blocks",
//       },
//       Mercury: {
//         score: 0.72,
//         good: "Systematic business, technical skills, long-term planning, slow success",
//         bad: "Communication delays, skin issues, nervous tension",
//       },
//       Ketu: {
//         score: -4.75,
//         good: "Spiritual discipline, detachment, ancient wisdom",
//         bad: "Extreme hardship, losses, separation, mysterious illnesses",
//       },
//       Venus: {
//         score: -0.37,
//         good: "Late marriage success, mature relationships, artistic skill with discipline",
//         bad: "Relationship delays, diabetes, urinary chronic issues",
//       },
//     },
//     Mercury: {
//       Sun: {
//         score: 1.72,
//         good: "Intelligence in authority, communication success, business with government",
//         bad: "Over-analytical ego, nervous stress",
//       },
//       Moon: {
//         score: 1.9,
//         good: "Emotional intelligence, business with women/public, writing, trade",
//         bad: "Over-thinking, nervous tension, mood swings",
//       },
//       Mars: {
//         score: 1.1,
//         good: "Strategic action, business courage, technical skills, engineering",
//         bad: "Conflicts in communication, impatience",
//       },
//       Rahu: {
//         score: -1,
//         good: "Technology business, foreign trade, innovative communication",
//         bad: "Deception in business, nervous disorders, scandals",
//       },
//       Jupiter: {
//         score: 2.5,
//         good: "Wise business, teaching, writing, spiritual communication, success",
//         bad: "Over-complexity in thought",
//       },
//       Saturn: {
//         score: 0.72,
//         good: "Systematic business, long-term planning, technical mastery, patience",
//         bad: "Business delays, skin issues, nervous stress",
//       },
//       Mercury: {
//         score: 1.72,
//         good: "Peak business success, communication mastery, learning, writing, trade",
//         bad: "Over-intellectualization, nervous exhaustion",
//       },
//       Ketu: {
//         score: -0.5,
//         good: "Intuitive business, spiritual writing, occult learning",
//         bad: "Business losses, speech issues, unclear communication",
//       },
//       Venus: {
//         score: 0.9,
//         good: "Artistic business, luxury trade, marriage negotiations, creativity",
//         bad: "Easy money leading to excess",
//       },
//     },
//     Ketu: {
//       Sun: {
//         score: -2.1,
//         good: "Spiritual authority, detachment from ego, occult knowledge",
//         bad: "Identity crisis, father separation, unclear direction",
//       },
//       Moon: {
//         score: -1.8,
//         good: "Spiritual intuition, meditation, psychic abilities",
//         bad: "Mental confusion, mother separation, emotional detachment",
//       },
//       Mars: {
//         score: -1.5,
//         good: "Spiritual warrior, detached action, occult power",
//         bad: "Accidents, sudden events, sibling separation, anger",
//       },
//       Rahu: {
//         score: -3.5,
//         good: "Deep moksha, spiritual breakthroughs, liberation",
//         bad: "Extreme confusion, total uncertainty, mysterious losses",
//       },
//       Jupiter: {
//         score: 0.8,
//         good: "Spiritual wisdom, moksha, past life merits, natural knowledge",
//         bad: "Detachment from children, unconventional beliefs",
//       },
//       Saturn: {
//         score: -4.75,
//         good: "Spiritual discipline, karmic clearing, deep meditation",
//         bad: "Extreme hardship, health mysteries, isolation, depression",
//       },
//       Mercury: {
//         score: -0.5,
//         good: "Intuitive learning, spiritual writing, occult communication",
//         bad: "Business uncertainty, speech issues, nervous problems",
//       },
//       Ketu: {
//         score: -2.8,
//         good: "Peak moksha, ultimate detachment, spiritual liberation",
//         bad: "Total loss, extreme separation, identity loss, health crises",
//       },
//       Venus: {
//         score: -1.7,
//         good: "Spiritual art, detachment from luxury, yoga, tantra",
//         bad: "Relationship separation, mysterious diseases, loss of comforts",
//       },
//     },
//     Venus: {
//       Sun: {
//         score: 0.63,
//         good: "Creative authority, artistic success, luxury, charm in leadership",
//         bad: "Ego in relationships, excessive spending",
//       },
//       Moon: {
//         score: 0.9,
//         good: "Emotional happiness, artistic expression, comfort, mother\u0027s support",
//         bad: "Over attachment to comfort, mood-dependent",
//       },
//       Mars: {
//         score: -0.2,
//         good: "Passionate action, luxury vehicles, artistic energy, romance",
//         bad: "Relationship conflicts, impulsive spending, heated passion",
//       },
//       Rahu: {
//         score: -2.82,
//         good: "Foreign romance, unconventional art, technology in beauty",
//         bad: "Relationship deception, unusual diseases, scandals, lust",
//       },
//       Jupiter: {
//         score: 1.5,
//         good: "Blessed marriage, wealth, luxury, children, wisdom in relationships",
//         bad: "Excessive indulgence, diabetes, weight",
//       },
//       Saturn: {
//         score: -0.37,
//         good: "Late marriage success, artistic discipline, mature love, patience",
//         bad: "Relationship delays, chronic urinary/diabetes issues, separation",
//       },
//       Mercury: {
//         score: 0.9,
//         good: "Artistic business, luxury trade, creative communication, success",
//         bad: "Analysis paralysis in love, skin issues",
//       },
//       Ketu: {
//         score: -1.7,
//         good: "Spiritual art, detachment from materialism, tantra, yoga",
//         bad: "Separation in relationships, loss of comfort, mysterious diseases",
//       },
//       Venus: {
//         score: 0.63,
//         good: "Peak luxury, marriage bliss, artistic mastery, beauty, wealth",
//         bad: "Excessive indulgence, diabetes, relationship dependency",
//       },
//     },
//   };

//   /**
//    * Generate life path prediction for a given birth time and date range
//    */
//   public static generateLifePathPrediction(
//     request: LifePathRequest,
//   ): LifePathPrediction {
//     const {
//       birthTime,
//       startDate,
//       endDate,
//       daysPerPixel = 0.73,
//       precisionHours = 17.52,
//     } = request;

//     // Calculate date range
//     const start = startDate || new Date();
//     const end =
//       endDate || new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year default

//     // Generate configuration
//     const config: LifePathConfiguration = {
//       SvgWidth: 1001,
//       DaysPerPixel: daysPerPixel,
//       WidthPerSlice: 1,
//       SingleRowHeight: 15,
//       SummaryRowHeight: 22,
//       DescriptionBackgroundWidth: 100,
//       EventsPrecisionHours: precisionHours,
//       RemovedShortEventsCount: 0,
//       TotalEventsCount: 0,
//     };

//     // Generate time slices
//     const timeSlices = this.generateTimeSlices(
//       birthTime,
//       start,
//       end,
//       precisionHours,
//     );
//     config.TotalEventsCount = timeSlices.reduce(
//       (sum, slice) => sum + slice.Events.length,
//       0,
//     );

//     // Format person info
//     const person = {
//       BirthTime: this.formatTimeString(birthTime),
//       BirthLocation: `${birthTime.location.latitude.toFixed(4)}, ${birthTime.location.longitude.toFixed(4)}`,
//     };

//     return {
//       ChartId: uuidv4().replace(/-/g, ""),
//       Person: person,
//       Configuration: config,
//       TimeSlices: timeSlices,
//     };
//   }

//   /**
//    * Generate time slices with events
//    */
//   private static generateTimeSlices(
//     birthTime: Time,
//     startDate: Date,
//     endDate: Date,
//     precisionHours: number,
//   ): TimeSlice[] {
//     const slices: TimeSlice[] = [];
//     const sliceInterval = precisionHours * 60 * 60 * 1000; // Convert to milliseconds

//     let currentTime = new Date(startDate);
//     let index = 0;

//     while (currentTime <= endDate) {
//       const events = this.generateEventsForTime(birthTime, currentTime);

//       if (events.length > 0) {
//         slices.push({
//           Index: index++,
//           StdTime:
//             currentTime.toISOString().replace("T", " ").slice(0, -5) +
//             " +00:00",
//           Year: currentTime.getFullYear(),
//           Month: currentTime.getMonth() + 1,
//           Date: currentTime.getDate(),
//           Hour: currentTime.getHours(),
//           Events: events,
//         });
//       }

//       currentTime = new Date(currentTime.getTime() + sliceInterval);
//     }

//     return slices;
//   }

//   /**
//    * Generate events for a specific time
//    */
//   private static generateEventsForTime(
//     birthTime: Time,
//     currentTime: Date,
//   ): LifeEvent[] {
//     const events: LifeEvent[] = [];

//     // Convert current time to Time format
//     const queryTime: Time = {
//       year: currentTime.getFullYear(),
//       month: currentTime.getMonth() + 1,
//       day: currentTime.getDate(),
//       hour: currentTime.getHours(),
//       minute: currentTime.getMinutes(),
//       second: currentTime.getSeconds(),
//       location: birthTime.location,
//     };

//     // Get current Dasha periods
//     const currentMahadasha = DashaCalculator.getCurrentMahadasha(
//       birthTime,
//       queryTime,
//     );
//     const currentAntardasha = DashaCalculator.getCurrentAntardasha(
//       birthTime,
//       queryTime,
//     );

//     // Calculate age
//     const age = this.calculateAge(birthTime, queryTime);

//     // Get all running dashas
//     const dashaHierarchy = this.getCurrentDashaHierarchy(birthTime, queryTime);

//     // Generate events for each level
//     dashaHierarchy.forEach((dasha, level) => {
//       const effect = this.DASHA_EFFECTS[dasha.major]?.[dasha.minor];
//       if (effect) {
//         events.push({
//           Name: `${dasha.major} ${dasha.minor} PD${level + 1}`,
//           Description:
//             dasha.major === dasha.minor ? effect.good : `${effect.bad}`,
//           NatureScore: effect.score,
//           DurationHour: dasha.durationHours,
//           DurationMin: dasha.durationHours * 60,
//           Age: age,
//           MinNatureScore: Math.min(
//             ...dashaHierarchy.map(
//               (d) => this.DASHA_EFFECTS[d.major]?.[d.minor]?.score || 0,
//             ),
//           ),
//           MaxNatureScore: Math.max(
//             ...dashaHierarchy.map(
//               (d) => this.DASHA_EFFECTS[d.major]?.[d.minor]?.score || 0,
//             ),
//           ),
//         });
//       }
//     });

//     return events;
//   }

//   /**
//    * Get current dasha hierarchy (Mahadasha -> Antardasha -> Pratyantardasha -> etc)
//    */
//   private static getCurrentDashaHierarchy(
//     birthTime: Time,
//     currentTime: Time,
//   ): Array<{ major: string; minor: string; durationHours: number }> {
//     const mahadasha = DashaCalculator.getCurrentMahadasha(
//       birthTime,
//       currentTime,
//     );
//     const antardasha = DashaCalculator.getCurrentAntardasha(
//       birthTime,
//       currentTime,
//     );

//     if (!mahadasha || !antardasha) {
//       return [];
//     }

//     const maharashi = mahadasha.planet as unknown as string;
//     const antarashi = antardasha.planet as unknown as string;
//     const mahaDuration =
//       mahadasha.endDate && mahadasha.startDate
//         ? (new Date(mahadasha.endDate).getTime() -
//             new Date(mahadasha.startDate).getTime()) /
//           (1000 * 60 * 60)
//         : 0;
//     const antarDuration =
//       antardasha.endDate && antardasha.startDate
//         ? (new Date(antardasha.endDate).getTime() -
//             new Date(antardasha.startDate).getTime()) /
//           (1000 * 60 * 60)
//         : 0;

//     return [
//       { major: maharashi, minor: maharashi, durationHours: mahaDuration },
//       { major: maharashi, minor: antarashi, durationHours: antarDuration },
//       // Can add more levels (Pratyantardasha, etc.) here
//     ];
//   }

//   /**
//    * Calculate age from birth time to current time
//    */
//   private static calculateAge(birthTime: Time, currentTime: Time): number {
//     const birthDate = new Date(
//       birthTime.year,
//       birthTime.month - 1,
//       birthTime.day,
//     );
//     const currentDate = new Date(
//       currentTime.year,
//       currentTime.month - 1,
//       currentTime.day,
//     );
//     const ageMillis = currentDate.getTime() - birthDate.getTime();
//     return Math.floor(ageMillis / (365.25 * 24 * 60 * 60 * 1000));
//   }

//   /**
//    * Format time as string
//    */
//   private static formatTimeString(time: Time): string {
//     const pad = (n: number) => n.toString().padStart(2, "0");
//     return `${pad(time.hour)}:${pad(time.minute)} ${pad(time.day)}/${pad(time.month)}/${time.year} +05:30`;
//   }
// }

// src/core/LifePathCalculator.ts
import { Time } from "../types/interfaces";
import {
  LifeEvent,
  TimeSlice,
  LifePathPrediction,
  LifePathConfiguration,
  LifePathRequest,
} from "../types/lifepath";
import { DashaCalculator } from "./DashaCalculator";
import { PlanetName } from "../types/enums";
import { v4 as uuidv4 } from "uuid";

export class LifePathCalculator {
  private static readonly DASHA_EFFECTS: Record<
    string,
    Record<string, { good: string; bad: string; score: number }>
  > = {
    Sun: {
      Sun: {
        score: 2.72,
        good: "Authority, leadership, success, vitality, government favors",
        bad: "Ego issues, conflicts with authority, health problems",
      },
      Moon: {
        score: 1.5,
        good: "Mental peace, emotional stability, mother's support, property gains",
        bad: "Mental stress, mood swings, mother issues",
      },
      Mars: {
        score: 0.9,
        good: "Energy, courage, property gains, sibling support",
        bad: "Accidents, injuries, conflicts, impulsiveness",
      },
      Rahu: {
        score: -1.5,
        good: "Foreign gains, unconventional success, technology",
        bad: "Confusion, deception, sudden losses",
      },
      Jupiter: {
        score: 3.2,
        good: "Wisdom, spiritual growth, wealth, learning",
        bad: "Over-optimism, weight gain",
      },
      Saturn: {
        score: -4.72,
        good: "Hard work pays off, discipline, long-term gains",
        bad: "Delays, obstacles, chronic health issues",
      },
      Mercury: {
        score: 1.72,
        good: "Business success, communication skills, learning",
        bad: "Speech issues, nervous disorders",
      },
      Ketu: {
        score: -2.1,
        good: "Spiritual insights, moksha, detachment",
        bad: "Losses, separations, accidents",
      },
      Venus: {
        score: 0.63,
        good: "Luxury, marriage, artistic success, comfort",
        bad: "Relationship troubles, expenses",
      },
    },
    Moon: {
      Sun: {
        score: 1.5,
        good: "Recognition, creative success, mental clarity",
        bad: "Conflict between heart and ego",
      },
      Moon: {
        score: 2.1,
        good: "Mental peace, mother's blessings, property gains",
        bad: "Over-sensitivity, mood disorders",
      },
      Mars: {
        score: 0.5,
        good: "Emotional courage, protective instincts",
        bad: "Emotional outbursts, blood pressure",
      },
      Rahu: {
        score: -2,
        good: "Imagination, foreign travel, mass appeal",
        bad: "Mental confusion, phobias",
      },
      Jupiter: {
        score: 2.8,
        good: "Peace of mind, spiritual growth, wealth",
        bad: "Over-emotional, weight gain",
      },
      Saturn: {
        score: -3.5,
        good: "Emotional maturity, patience",
        bad: "Depression, separations, delays",
      },
      Mercury: {
        score: 1.9,
        good: "Emotional intelligence, communication",
        bad: "Nervous tension, indecisiveness",
      },
      Ketu: {
        score: -1.8,
        good: "Spiritual insights, intuition",
        bad: "Emotional detachment, losses",
      },
      Venus: {
        score: 0.9,
        good: "Luxury, comfort, marriage, artistic talents",
        bad: "Excessive emotions",
      },
    },
    Mars: {
      Sun: {
        score: 0.9,
        good: "Courage, victory, leadership in action",
        bad: "Accidents, conflicts, aggression",
      },
      Moon: {
        score: 0.5,
        good: "Emotional strength, protective nature",
        bad: "Anger issues, blood pressure",
      },
      Mars: {
        score: 1.2,
        good: "Immense energy, sports success, victory",
        bad: "Accidents, surgeries, violence",
      },
      Rahu: {
        score: -2.2,
        good: "Technical skills, foreign connections",
        bad: "Sudden accidents, legal troubles",
      },
      Jupiter: {
        score: 2.1,
        good: "Righteous action, protection, property",
        bad: "Over-confidence, recklessness",
      },
      Saturn: {
        score: -4.1,
        good: "Disciplined hard work, endurance",
        bad: "Chronic pain, injuries, obstacles",
      },
      Mercury: {
        score: 1.1,
        good: "Business skills, strategic thinking",
        bad: "Conflicts in communication",
      },
      Ketu: {
        score: -1.5,
        good: "Spiritual warrior, occult powers",
        bad: "Injuries, separation from siblings",
      },
      Venus: {
        score: -0.2,
        good: "Luxury vehicles, artistic expression",
        bad: "Relationship conflicts",
      },
    },
    Rahu: {
      Sun: {
        score: -1.5,
        good: "Unconventional authority, foreign success",
        bad: "Ego battles, deception",
      },
      Moon: {
        score: -2,
        good: "Imagination, psychology, mass appeal",
        bad: "Mental confusion, phobias",
      },
      Mars: {
        score: -2.2,
        good: "Technical expertise, engineering",
        bad: "Accidents, sudden events",
      },
      Rahu: {
        score: -3,
        good: "Foreign gains, technology boom",
        bad: "Extreme confusion, addictions",
      },
      Jupiter: {
        score: 0.5,
        good: "Foreign education, research success",
        bad: "Confusion in beliefs",
      },
      Saturn: {
        score: -5,
        good: "Long-term foreign gains",
        bad: "Chronic mysterious illnesses",
      },
      Mercury: {
        score: -1,
        good: "Technology business, foreign trade",
        bad: "Communication troubles",
      },
      Ketu: {
        score: -3.5,
        good: "Moksha, spiritual breakthroughs",
        bad: "Extreme confusion, total loss",
      },
      Venus: {
        score: -2.82,
        good: "Foreign romance, artistic innovation",
        bad: "Relationship deception",
      },
    },
    Jupiter: {
      Sun: {
        score: 3.2,
        good: "Authority with wisdom, spiritual leadership",
        bad: "Over-confidence",
      },
      Moon: {
        score: 2.8,
        good: "Mental peace, wisdom, children, property",
        bad: "Over-attachment",
      },
      Mars: {
        score: 2.1,
        good: "Righteous action, property, victory",
        bad: "Over-aggression",
      },
      Rahu: {
        score: 0.5,
        good: "Unconventional wisdom, foreign teaching",
        bad: "Confusion in beliefs",
      },
      Jupiter: {
        score: 3.9,
        good: "Peak wisdom, wealth, spiritual growth",
        bad: "Excessive optimism",
      },
      Saturn: {
        score: -1.2,
        good: "Patient wisdom, long-term learning",
        bad: "Delayed education",
      },
      Mercury: {
        score: 2.5,
        good: "Business wisdom, teaching, writing",
        bad: "Over-intellectualization",
      },
      Ketu: {
        score: 0.8,
        good: "Spiritual wisdom, moksha, meditation",
        bad: "Detachment from family",
      },
      Venus: {
        score: 1.5,
        good: "Wealth, luxury, happy marriage",
        bad: "Excessive indulgence",
      },
    },
    Saturn: {
      Sun: {
        score: -4.72,
        good: "Hard-earned authority, discipline",
        bad: "Conflicts with authority, delays",
      },
      Moon: {
        score: -3.5,
        good: "Emotional maturity, patience",
        bad: "Depression, separations",
      },
      Mars: {
        score: -4.1,
        good: "Disciplined action, hard work",
        bad: "Chronic pain, injuries",
      },
      Rahu: {
        score: -5,
        good: "Long-term foreign gains",
        bad: "Extreme obstacles, fear",
      },
      Jupiter: {
        score: -1.2,
        good: "Patient learning, mature wisdom",
        bad: "Delayed education",
      },
      Saturn: {
        score: -6.47,
        good: "Mastery through hardship",
        bad: "Extreme delays, chronic illness",
      },
      Mercury: {
        score: 0.72,
        good: "Systematic business, technical skills",
        bad: "Communication delays",
      },
      Ketu: {
        score: -4.75,
        good: "Spiritual discipline, detachment",
        bad: "Extreme hardship, losses",
      },
      Venus: {
        score: -0.37,
        good: "Late marriage success, mature love",
        bad: "Relationship delays",
      },
    },
    Mercury: {
      Sun: {
        score: 1.72,
        good: "Intelligence in authority, communication success",
        bad: "Over-analytical",
      },
      Moon: {
        score: 1.9,
        good: "Emotional intelligence, business with women",
        bad: "Over-thinking",
      },
      Mars: {
        score: 1.1,
        good: "Strategic action, business courage",
        bad: "Conflicts in communication",
      },
      Rahu: {
        score: -1,
        good: "Technology business, foreign trade",
        bad: "Deception in business",
      },
      Jupiter: {
        score: 2.5,
        good: "Wise business, teaching, writing",
        bad: "Over-complexity",
      },
      Saturn: {
        score: 0.72,
        good: "Systematic business, long-term planning",
        bad: "Business delays",
      },
      Mercury: {
        score: 1.72,
        good: "Peak business success, communication mastery",
        bad: "Nervous exhaustion",
      },
      Ketu: {
        score: -0.5,
        good: "Intuitive business, spiritual writing",
        bad: "Business losses",
      },
      Venus: {
        score: 0.9,
        good: "Artistic business, luxury trade",
        bad: "Easy money leading to excess",
      },
    },
    Ketu: {
      Sun: {
        score: -2.1,
        good: "Spiritual authority, detachment from ego",
        bad: "Identity crisis",
      },
      Moon: {
        score: -1.8,
        good: "Spiritual intuition, meditation",
        bad: "Mental confusion",
      },
      Mars: {
        score: -1.5,
        good: "Spiritual warrior, detached action",
        bad: "Accidents, sudden events",
      },
      Rahu: {
        score: -3.5,
        good: "Deep moksha, spiritual breakthroughs",
        bad: "Extreme confusion",
      },
      Jupiter: {
        score: 0.8,
        good: "Spiritual wisdom, past life merits",
        bad: "Detachment from children",
      },
      Saturn: {
        score: -4.75,
        good: "Spiritual discipline, karmic clearing",
        bad: "Extreme hardship",
      },
      Mercury: {
        score: -0.5,
        good: "Intuitive learning, occult communication",
        bad: "Business uncertainty",
      },
      Ketu: {
        score: -2.8,
        good: "Peak moksha, ultimate detachment",
        bad: "Total loss, identity loss",
      },
      Venus: {
        score: -1.7,
        good: "Spiritual art, detachment from luxury",
        bad: "Relationship separation",
      },
    },
    Venus: {
      Sun: {
        score: 0.63,
        good: "Creative authority, artistic success, luxury",
        bad: "Ego in relationships",
      },
      Moon: {
        score: 0.9,
        good: "Emotional happiness, artistic expression",
        bad: "Over attachment",
      },
      Mars: {
        score: -0.2,
        good: "Passionate action, luxury vehicles",
        bad: "Relationship conflicts",
      },
      Rahu: {
        score: -2.82,
        good: "Foreign romance, unconventional art",
        bad: "Relationship deception",
      },
      Jupiter: {
        score: 1.5,
        good: "Blessed marriage, wealth, luxury",
        bad: "Excessive indulgence",
      },
      Saturn: {
        score: -0.37,
        good: "Late marriage success, artistic discipline",
        bad: "Relationship delays",
      },
      Mercury: {
        score: 0.9,
        good: "Artistic business, luxury trade",
        bad: "Analysis paralysis",
      },
      Ketu: {
        score: -1.7,
        good: "Spiritual art, detachment from materialism",
        bad: "Separation in relationships",
      },
      Venus: {
        score: 0.63,
        good: "Peak luxury, marriage bliss, artistic mastery",
        bad: "Excessive indulgence",
      },
    },
  };

  /**
   * Generate life path prediction
   */
  public static generateLifePathPrediction(
    request: LifePathRequest,
  ): LifePathPrediction {
    const {
      birthTime,
      startDate,
      endDate,
      daysPerPixel = 0.73,
      precisionHours = 17.52,
    } = request;

    const start = startDate || new Date();
    const end =
      endDate || new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);

    // ✅ Debug logging
    console.log("=== LifePathCalculator Debug ===");
    console.log("Birth Time:", JSON.stringify(birthTime));
    console.log("Start Date:", start.toISOString());
    console.log("End Date:", end.toISOString());

    const config: LifePathConfiguration = {
      SvgWidth: 1001,
      DaysPerPixel: daysPerPixel,
      WidthPerSlice: 1,
      SingleRowHeight: 15,
      SummaryRowHeight: 22,
      DescriptionBackgroundWidth: 100,
      EventsPrecisionHours: precisionHours,
      RemovedShortEventsCount: 0,
      TotalEventsCount: 0,
    };

    const timeSlices = this.generateTimeSlices(
      birthTime,
      start,
      end,
      precisionHours,
    );
    config.TotalEventsCount = timeSlices.reduce(
      (sum, slice) => sum + slice.Events.length,
      0,
    );

    console.log("Generated TimeSlices:", timeSlices.length);
    console.log("Total Events:", config.TotalEventsCount);
    console.log("================================");

    const person = {
      BirthTime: this.formatTimeString(birthTime),
      BirthLocation: `${birthTime.location.latitude.toFixed(4)}, ${birthTime.location.longitude.toFixed(4)}`,
    };

    return {
      ChartId: uuidv4().replace(/-/g, ""),
      Person: person,
      Configuration: config,
      TimeSlices: timeSlices,
    };
  }

  /**
   * Generate time slices with events
   */
  private static generateTimeSlices(
    birthTime: Time,
    startDate: Date,
    endDate: Date,
    precisionHours: number,
  ): TimeSlice[] {
    const slices: TimeSlice[] = [];
    const sliceInterval = precisionHours * 60 * 60 * 1000;

    let currentTime = new Date(startDate);
    let index = 0;

    while (currentTime <= endDate) {
      const events = this.generateEventsForTime(birthTime, currentTime);

      // ✅ Add slice even with events for debugging
      slices.push({
        Index: index++,
        StdTime:
          currentTime.toISOString().replace("T", " ").slice(0, -5) + " +00:00",
        Year: currentTime.getFullYear(),
        Month: currentTime.getMonth() + 1,
        Date: currentTime.getDate(),
        Hour: currentTime.getHours(),
        Events: events,
      });

      currentTime = new Date(currentTime.getTime() + sliceInterval);
    }

    return slices;
  }

  /**
   * Generate events for a specific time
   */
  private static generateEventsForTime(
    birthTime: Time,
    currentDate: Date,
  ): LifeEvent[] {
    const events: LifeEvent[] = [];

    const queryTime: Time = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
      hour: currentDate.getHours(),
      minute: currentDate.getMinutes(),
      second: currentDate.getSeconds(),
      location: birthTime.location,
    };

    const age = this.calculateAge(birthTime, queryTime);
    const dashaHierarchy = this.getCurrentDashaHierarchy(birthTime, queryTime);

    if (dashaHierarchy.length === 0) {
      console.warn("No dasha hierarchy found for:", currentDate.toISOString());
      return events;
    }

    // Calculate min/max scores
    const allScores = dashaHierarchy.map((d) => {
      const effect = this.DASHA_EFFECTS[d.major]?.[d.minor];
      return effect?.score || 0;
    });
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);

    // Generate events for each level
    dashaHierarchy.forEach((dasha, level) => {
      const effect = this.DASHA_EFFECTS[dasha.major]?.[dasha.minor];
      if (effect) {
        const description = effect.score >= 0 ? effect.good : effect.bad;

        events.push({
          Name: `${dasha.major}-${dasha.minor} PD${level + 1}`,
          Description: description,
          NatureScore: effect.score,
          DurationHour: dasha.durationHours,
          DurationMin: Math.round(dasha.durationHours * 60),
          Age: age,
          MinNatureScore: minScore,
          MaxNatureScore: maxScore,
        });
      }
    });

    return events;
  }

  /**
   * ✅ FIXED: Get current dasha hierarchy
   */
  private static getCurrentDashaHierarchy(
    birthTime: Time,
    currentTime: Time,
  ): Array<{ major: string; minor: string; durationHours: number }> {
    const result: Array<{
      major: string;
      minor: string;
      durationHours: number;
    }> = [];

    try {
      const mahadasha = DashaCalculator.getCurrentMahadasha(
        birthTime,
        currentTime,
      );

      if (!mahadasha) {
        console.warn("No mahadasha found");
        return result;
      }

      // ✅ Convert PlanetName enum to string properly
      const mahaLord = String(mahadasha.planet);
      const mahaDuration =
        (mahadasha.endDate.getTime() - mahadasha.startDate.getTime()) /
        (1000 * 60 * 60);

      // PD1: Mahadasha
      result.push({
        major: mahaLord,
        minor: mahaLord,
        durationHours: mahaDuration,
      });

      const antardasha = DashaCalculator.getCurrentAntardasha(
        birthTime,
        currentTime,
      );

      if (antardasha) {
        const antarLord = String(antardasha.planet);
        const antarDuration =
          (antardasha.endDate.getTime() - antardasha.startDate.getTime()) /
          (1000 * 60 * 60);

        // PD2: Mahadasha-Antardasha
        result.push({
          major: mahaLord,
          minor: antarLord,
          durationHours: antarDuration,
        });

        const pratyantardasha = DashaCalculator.getCurrentPratyantardasha(
          birthTime,
          currentTime,
        );

        if (pratyantardasha) {
          const pratLord = String(pratyantardasha.planet);
          const pratDuration =
            (pratyantardasha.endDate.getTime() -
              pratyantardasha.startDate.getTime()) /
            (1000 * 60 * 60);

          // PD3: Antardasha-Pratyantardasha
          result.push({
            major: antarLord,
            minor: pratLord,
            durationHours: pratDuration,
          });
        }
      }
    } catch (error) {
      console.error("Error getting dasha hierarchy:", error);
    }

    return result;
  }

  /**
   * Calculate age
   */
  private static calculateAge(birthTime: Time, currentTime: Time): number {
    const birthDate = new Date(
      birthTime.year,
      birthTime.month - 1,
      birthTime.day,
    );
    const currentDate = new Date(
      currentTime.year,
      currentTime.month - 1,
      currentTime.day,
    );
    return Math.floor(
      (currentDate.getTime() - birthDate.getTime()) /
        (365.25 * 24 * 60 * 60 * 1000),
    );
  }

  /**
   * Format time string
   */
  private static formatTimeString(time: Time): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(time.hour)}:${pad(time.minute)} ${pad(time.day)}/${pad(time.month)}/${time.year} +05:30`;
  }
}
