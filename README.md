# Vedic Astrology Calculator - Node.js Library

🌟 **Comprehensive Vedic Astrology Calculation Library** converted from C# to Node.js/TypeScript

## Features

✨ **Core Calculations**

- Planet positions (Sidereal/Nirayana)
- House calculations (Bhava)
- Zodiac signs (Rashi)
- Constellations (Nakshatra)
- Ascendant (Lagna)

📅 **Panchang (5 Limbs of Time)**

- Tithi (Lunar Day)
- Nakshatra (Constellation)
- Yoga (Nithya Yoga)
- Karana
- Vara (Day of Week)
- Sunrise/Sunset times

🎯 **Birth Chart (Kundali)**

- Complete birth chart generation
- Planet positions with signs
- House cusps
- Aspects
- Exaltation/Debilitation status

⏰ **Vimshottari Dasha**

- Mahadasha (Major periods)
- Antardasha (Sub-periods)
- Pratyantardasha (Sub-sub-periods)
- Current running Dasha

🔮 **Muhurtha Tools**

- Tarabala (Birth star strength)
- Chandrabala (Lunar strength)
- Day/Night birth detection

## Installation

```bash
# Clone or copy the project
cd NodeJS-Astrology

# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Quick Start

### As a Library

```typescript
import {
  AstroCalculator,
  BirthChartCalculator,
  PanchangCalculator,
  DashaCalculator,
  Time,
} from "./src/index";

// Define birth details
const birthTime: Time = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  second: 0,
  location: {
    latitude: 28.6139, // Delhi
    longitude: 77.209,
    timezone: "Asia/Kolkata",
  },
};

// Get Birth Chart
const birthChart = BirthChartCalculator.generateBirthChart(birthTime);
console.log("Lagna:", birthChart.lagna);
console.log("Moon Sign:", birthChart.moonSign);

// Get Panchang
const panchang = PanchangCalculator.getPanchang(birthTime);
console.log("Tithi:", panchang.tithi);
console.log("Nakshatra:", panchang.nakshatra);

// Get Dasha
const dashas = DashaCalculator.calculateMahadashas(birthTime);
console.log("First Mahadasha:", dashas[0]);
```

### As an API Server

```bash
# Start the API server
npm run api
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Birth Chart

```bash
POST /api/birth-chart
Content-Type: application/json

{
    "year": 1990,
    "month": 5,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "second": 0,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": "Asia/Kolkata"
}
```

### 2. Panchang

```bash
POST /api/panchang
Content-Type: application/json

{
    "year": 2024,
    "month": 2,
    "day": 4,
    "hour": 10,
    "minute": 0,
    "second": 0,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": "Asia/Kolkata"
}
```

### 3. Planet Positions

```bash
POST /api/planets
```

### 4. Vimshottari Dasha

```bash
POST /api/dasha

{
    "year": 1990,
    "month": 5,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "second": 0,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "yearsToCalculate": 120
}
```

### 5. Current Running Dasha

```bash
POST /api/current-dasha
```

### 6. Tarabala

```bash
POST /api/tarabala

{
    "birthTime": {
        "year": 1990,
        "month": 5,
        "day": 15,
        "hour": 14,
        "minute": 30,
        "latitude": 28.6139,
        "longitude": 77.2090
    },
    "currentTime": {
        "year": 2024,
        "month": 2,
        "day": 4,
        "hour": 10,
        "minute": 0,
        "latitude": 28.6139,
        "longitude": 77.2090
    }
}
```

### 7. Houses

```bash
POST /api/houses
```

### 8. Ascendant (Lagna)

```bash
POST /api/ascendant
```

## Project Structure

```
NodeJS-Astrology/
├── src/
│   ├── types/
│   │   ├── enums.ts          # All enumerations
│   │   └── interfaces.ts     # TypeScript interfaces
│   ├── core/
│   │   ├── AstroCalculator.ts      # Core astronomical calculations
│   │   ├── PanchangCalculator.ts   # Panchang calculations
│   │   ├── BirthChartCalculator.ts # Birth chart calculations
│   │   └── DashaCalculator.ts      # Dasha calculations
│   ├── api/
│   │   └── server.ts         # Express API server
│   └── index.ts              # Main entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

- **swisseph**: Swiss Ephemeris for astronomical calculations
- **express**: Web framework for API
- **typescript**: TypeScript compiler
- **cors**: CORS middleware

## Conversion from C# Library

This library is a faithful conversion of a C# astrology library with the following mappings:

| C# Component             | Node.js Component       |
| ------------------------ | ----------------------- |
| `Calculate` class        | `AstroCalculator` class |
| `SwissEphNet`            | `swisseph` npm package  |
| Enums (ZodiacName, etc.) | TypeScript enums        |
| Data classes             | TypeScript interfaces   |
| Static methods           | Static class methods    |

## Key Calculations Implemented

### From Core.cs

- ✅ Planet Nirayana Longitude
- ✅ Zodiac Sign from Longitude
- ✅ Constellation from Longitude
- ✅ Lord of Constellation
- ✅ Ascendant Longitude
- ✅ All Houses
- ✅ Sunrise/Sunset times

### From Panchang

- ✅ Lunar Day (Tithi)
- ✅ Nakshatra
- ✅ Nithya Yoga
- ✅ Karana
- ✅ Tarabala
- ✅ Chandrabala

### From Dasha

- ✅ Vimshottari Dasha
- ✅ Mahadasha calculation
- ✅ Antardasha calculation
- ✅ Pratyantardasha calculation
- ✅ Current running Dasha

## Usage Examples

See `examples/` folder for more detailed examples:

- Basic calculations
- Birth chart generation
- Panchang for a date
- Dasha periods
- API usage examples

## Testing

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Credits

Converted from a C# astrology library to Node.js/TypeScript.

## Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for Vedic Astrology enthusiasts
