import { DashaCalculator } from './DashaCalculator';
import { Time } from '../types/interfaces';
import { AstroCalculator } from './AstroCalculator';

/**
 * Events Chart Generator
 * Generates visualization of Dasha periods and planetary transits
 */
export class EventsChartGenerator {

    /**
     * Generate Events Chart SVG
     * Visualizes 100 years of Vimshottari Dasha
     */
    static generateEventsChartSvg(birthTime: Time): string {
        // Get Dasha Periods for next 100 years
        // This is a simplified logic. Real implementation would traverse nested Dashas.
        
        // Calculate Moon Longitude for Dasha
        const moonPos = AstroCalculator.getPlanetPosition(1, birthTime); // Moon
        const moonLong = moonPos.longitude.totalDegrees;
        
        // Get Current Major Dasha info to start
        // Accessing private/internal logic of DashaCalculator would be needed to get full list.
        // For now, let's replicate basic Mahadasha sequence.
        
        const dashas = this.getLifeDashas(moonLong, birthTime);
        
        const width = 800;
        const height = 200;
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Background
        svg += `<rect width="100%" height="100%" fill="#f0f0f0" />`;
        
        // Title
        svg += `<text x="10" y="20" font-family="Arial" font-size="14">Life Events Chart (Vimshottari Dasha)</text>`;
        
        // Timeline
        let x = 10;
        const scale = (width - 20) / 120; // 120 years total cycle roughly
        
        dashas.forEach(dasha => {
            const dashaWidth = dasha.duration * scale;
            const color = this.getPlanetColor(dasha.planet);
            
            svg += `<rect x="${x}" y="40" width="${dashaWidth}" height="50" fill="${color}" stroke="white" />`;
            svg += `<text x="${x + 2}" y="60" font-family="Arial" font-size="10" fill="white">${dasha.name}</text>`;
            svg += `<text x="${x + 2}" y="80" font-family="Arial" font-size="9" fill="white">${dasha.duration}y</text>`;
            
            x += dashaWidth;
        });

        svg += `</svg>`;
        return svg;
    }

    private static getLifeDashas(moonLong: number, birthTime: Time) {
        // Simplified Dasha sequence
        const periods = [
            { name: 'Ketu', duration: 7, planet: 8 },
            { name: 'Venus', duration: 20, planet: 5 },
            { name: 'Sun', duration: 6, planet: 0 },
            { name: 'Moon', duration: 10, planet: 1 },
            { name: 'Mars', duration: 7, planet: 2 },
            { name: 'Rahu', duration: 18, planet: 7 },
            { name: 'Jupiter', duration: 16, planet: 4 },
            { name: 'Saturn', duration: 19, planet: 6 },
            { name: 'Mercury', duration: 17, planet: 3 }
        ];

        // determine starting dasha based on Nakshatra
        // ... (Logic to shift array based on start)
        // Returning default sequence for visualization demo
        return periods;
    }

    private static getPlanetColor(planet: number): string {
        const colors = [
            '#FFD700', // Sun
            '#C0C0C0', // Moon
            '#FF4500', // Mars
            '#32CD32', // Mercury
            '#FFA500', // Jupiter
            '#FF69B4', // Venus
            '#00008B', // Saturn
            '#4B0082', // Rahu
            '#808080'  // Ketu
        ];
        return colors[planet] || 'black';
    }
}
