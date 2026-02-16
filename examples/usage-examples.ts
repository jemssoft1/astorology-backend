import { 
    AstroCalculator, 
    BirthChartCalculator, 
    PanchangCalculator,
    DashaCalculator,
    Time,
    PlanetName 
} from '../src/index';

/**
 * Example: Complete Birth Chart Analysis
 */
function exampleBirthChart() {
    console.log('\n=== Birth Chart Example ===\n');
    
    // Birth details
    const birthTime: Time = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
        location: {
            latitude: 28.6139,  // Delhi, India
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
        }
    };
    
    // Generate birth chart
    const chart = BirthChartCalculator.generateBirthChart(birthTime);
    
    console.log('Birth Details:');
    console.log(`Date: ${birthTime.day}/${birthTime.month}/${birthTime.year}`);
    console.log(`Time: ${birthTime.hour}:${birthTime.minute}`);
    console.log(`Location: ${birthTime.location.latitude}, ${birthTime.location.longitude}\n`);
    
    console.log('Lagna (Ascendant):', PlanetName[chart.lagna.name], 
                `${chart.lagna.degreesInSign.degrees}°${chart.lagna.degreesInSign.minutes}'`);
    
    console.log('Moon Sign (Janma Rashi):', PlanetName[chart.moonSign.name],
                `${chart.moonSign.degreesInSign.degrees}°${chart.moonSign.degreesInSign.minutes}'`);
    
    console.log('Sun Sign:', PlanetName[chart.sunSign.name],
                `${chart.sunSign.degreesInSign.degrees}°${chart.sunSign.degreesInSign.minutes}'`);
    
    console.log('\nPlanet Positions:');
    chart.planets.forEach(planet => {
        const signName = PlanetName[planet.sign.name];
        const degrees = planet.sign.degreesInSign.degrees;
        const minutes = planet.sign.degreesInSign.minutes;
        const retrograde = planet.isRetrograde ? ' (R)' : '';
        
        console.log(`${PlanetName[planet.planet]}: ${signName} ${degrees}°${minutes}'${retrograde}`);
    });
    
    console.log('\nHouses:');
    chart.houses.forEach(house => {
        const signName = PlanetName[house.sign.name];
        console.log(`House ${house.number}: ${signName}`);
    });
}

/**
 * Example: Panchang for a Date
 */
function examplePanchang() {
    console.log('\n=== Panchang Example ===\n');
    
    const time: Time = {
        year: 2024,
        month: 2,
        day: 4,
        hour: 10,
        minute: 0,
        second: 0,
        location: {
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
        }
    };
    
    const panchang = PanchangCalculator.getPanchang(time);
    
    console.log(`Date: ${time.day}/${time.month}/${time.year}\n`);
    
    console.log('Tithi:', panchang.tithi.name, `(${panchang.tithi.number})`);
    console.log('Nakshatra:', panchang.nakshatra.name, `- Lord: ${PlanetName[panchang.nakshatra.lord]}`);
    console.log('Yoga:', panchang.yoga);
    console.log('Karana:', panchang.karana);
    console.log('Vara (Day):', panchang.vara);
    console.log('Sunrise:', panchang.sunrise.toLocaleTimeString());
    console.log('Sunset:', panchang.sunset.toLocaleTimeString());
}

/**
 * Example: Vimshottari Dasha
 */
function exampleDasha() {
    console.log('\n=== Vimshottari Dasha Example ===\n');
    
    const birthTime: Time = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
        location: {
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
        }
    };
    
    // Get birth star lord
    const birthStarLord = DashaCalculator.getBirthStarLord(birthTime);
    console.log('Birth Star Lord:', PlanetName[birthStarLord]);
    
    // Get balance of birth dasha
    const balance = DashaCalculator.getBalanceOfBirthDasha(birthTime);
    console.log(`Balance of ${PlanetName[birthStarLord]} Dasha: ${balance.toFixed(2)} years\n`);
    
    // Get first 5 Mahadashas
    const mahadashas = DashaCalculator.calculateMahadashas(birthTime, 50);
    
    console.log('Mahadasha Periods:\n');
    mahadashas.slice(0, 5).forEach((dasha, index) => {
        console.log(`${index + 1}. ${PlanetName[dasha.planet]} Dasha`);
        console.log(`   From: ${dasha.startDate.toLocaleDateString()}`);
        console.log(`   To: ${dasha.endDate.toLocaleDateString()}\n`);
    });
    
    // Get current running dasha
    const currentMaha = DashaCalculator.getCurrentMahadasha(birthTime);
    const currentAntar = DashaCalculator.getCurrentAntardasha(birthTime);
    
    if (currentMaha && currentAntar) {
        console.log('Currently Running:');
        console.log(`Mahadasha: ${PlanetName[currentMaha.planet]}`);
        console.log(`Antardasha: ${PlanetName[currentAntar.planet]}`);
    }
}

/**
 * Example: Muhurtha - Tarabala and Chandrabala
 */
function exampleMuhurtha() {
    console.log('\n=== Muhurtha Example (Tarabala & Chandrabala) ===\n');
    
    const birthTime: Time = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
        location: {
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
        }
    };
    
    const eventTime: Time = {
        year: 2024,
        month: 2,
        day: 4,
        hour: 10,
        minute: 0,
        second: 0,
        location: {
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
        }
    };
    
    // Calculate Tarabala
    const tarabala = PanchangCalculator.getTabala(eventTime, birthTime);
    console.log('Tarabala Analysis:');
    console.log(`Tara: ${tarabala.name} (${tarabala.number})`);
    console.log(`Cycle: ${tarabala.cycle}`);
    console.log(`Result: ${tarabala.isGood ? '✅ Good' : '❌ Not Favorable'}\n`);
    
    // Calculate Chandrabala
    const chandrabala = PanchangCalculator.getChandrabala(eventTime, birthTime);
    console.log('Chandrabala:', chandrabala);
    
    // Good chandrabala: 1, 3, 6, 7, 10, 11
    const goodChandrabala = [1, 3, 6, 7, 10, 11];
    const isChandrabalaGood = goodChandrabala.includes(chandrabala);
    console.log(`Result: ${isChandrabalaGood ? '✅ Good' : '❌ Avoid 6th, 8th, 12th'}`);
}

/**
 * Example: Planet Strength Analysis
 */
function examplePlanetStrength() {
    console.log('\n=== Planet Strength Example ===\n');
    
    const time: Time = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
        location: {
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
        }
    };
    
    const planets = [
        PlanetName.Sun,
        PlanetName.Moon,
        PlanetName.Mars,
        PlanetName.Mercury,
        PlanetName.Jupiter,
        PlanetName.Venus,
        PlanetName.Saturn
    ];
    
    console.log('Planet Strength Analysis:\n');
    
    planets.forEach(planet => {
        const strength = BirthChartCalculator.getPlanetStrengthCategory(planet, time);
        const isExalted = BirthChartCalculator.isPlanetExalted(planet, time);
        const isDebilitated = BirthChartCalculator.isPlanetDebilitated(planet, time);
        const isOwnSign = BirthChartCalculator.isPlanetInOwnSign(planet, time);
        
        let status = '●';
        if (isExalted) status = '⭐';
        if (isDebilitated) status = '⚠️';
        if (isOwnSign) status = '🏠';
        
        console.log(`${status} ${PlanetName[planet]}: ${strength}`);
    });
    
    console.log('\nLegend:');
    console.log('⭐ = Exalted (Strongest)');
    console.log('🏠 = Own Sign (Strong)');
    console.log('● = Normal');
    console.log('⚠️ = Debilitated (Weak)');
}

// Run all examples
console.log('╔════════════════════════════════════════════╗');
console.log('║   Vedic Astrology Calculator Examples     ║');
console.log('╚════════════════════════════════════════════╝');

try {
    exampleBirthChart();
    examplePanchang();
    exampleDasha();
    exampleMuhurtha();
    examplePlanetStrength();
    
    console.log('\n✅ All examples completed successfully!\n');
} catch (error) {
    console.error('\n❌ Error running examples:', error);
} finally {
    // Clean up
    AstroCalculator.close();
}
