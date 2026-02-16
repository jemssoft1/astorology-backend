import { ChartSvgGenerator } from "./core/ChartSvgGenerator";
import { ZodiacName } from "./types/enums";

async function testFix() {
  console.log(
    "Testing ChartSvgGenerator.generateNorthIndianChart with numeric ZodiacName...",
  );

  const mockChartData = {
    Lagna: {
      name: ZodiacName.Cancer, // This is a number (4)
      degreesInSign: { totalDegrees: 15 },
      longitude: { totalDegrees: 105 },
    },
    Sun: {
      name: ZodiacName.Leo, // This is a number (5)
      degreesInSign: { totalDegrees: 10 },
      longitude: { totalDegrees: 130 },
    },
  };

  try {
    const svg = ChartSvgGenerator.generateNorthIndianChart(mockChartData);
    console.log("SVG generated successfully!");
    if (svg.includes("<svg") && svg.includes("</svg>")) {
      console.log("Result contains valid SVG tags.");
    } else {
      console.error("Result missing SVG tags!");
    }
  } catch (error) {
    console.error("Error during SVG generation:", error);
    process.exit(1);
  }
}

testFix();
