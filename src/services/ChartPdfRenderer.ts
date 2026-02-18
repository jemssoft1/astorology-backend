import PDFDocument from "pdfkit";

/**
 * Service to render Astrological Charts on PDF using PDFKit
 */
export class ChartPdfRenderer {
  // --- North Indian Chart Layout ---
  // Diamond chart logic ported from ChartSvgGenerator
  
  /**
   * Draw North Indian Chart on PDF
   */
  public static drawNorthIndianChart(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
    data: any,
    lagnaSign: number = 1
  ) {
    const mid = size / 2;
    const quarter = size / 4;
    
    // Save state
    doc.save();
    doc.translate(x, y);

    // 1. Draw Grid (Diamond Pattern)
    doc.lineWidth(1).strokeColor("#D84315"); // Orange-Red border
    
    // Outer Box
    doc.rect(0, 0, size, size).stroke();
    
    // Diagonals (forming the inner diamond)
    doc.moveTo(0, 0).lineTo(size, size).stroke();
    doc.moveTo(size, 0).lineTo(0, size).stroke();
    
    // Middle Diamonds (connecting midpoints of sides)
    doc.moveTo(mid, 0).lineTo(size, mid).stroke(); // Top-Right edge
    doc.moveTo(size, mid).lineTo(mid, size).stroke(); // Bottom-Right edge
    doc.moveTo(mid, size).lineTo(0, mid).stroke(); // Bottom-Left edge
    doc.moveTo(0, mid).lineTo(mid, 0).stroke(); // Top-Left edge
    
    // 2. Draw Signs (Numbers)
    // House 1 is top Middle Diamond.
    // Fixed House Positions relative to top-left (0,0) of the chart box.
    // Using relative coordinates scaled by size.
    
    const houseCenters = this.getNorthIndianHouseCenters(size);
    
    // Draw House Numbers (Signs)
    doc.fontSize(size * 0.04).fillColor("#E65100"); // Dark Orange
    
    for (let house = 1; house <= 12; house++) {
        // Sign Number = (Lagna + House - 1 - 1) % 12 + 1
        const signNum = ((lagnaSign - 1 + (house - 1)) % 12) + 1;
        const pos = houseCenters[house];
        
        // Offset for sign number (usually centered or slightly off-center)
        // In visual representations, sign number is often in a corner of the house triangle/rhombus.
        // Let's place it slightly towards the center from the true center of the house, or just center it for simplicity first.
        // Actually, usually centered is fine, planets stack around it.
        
        // Let's look at standard NI chart: sign number is prominent.
        doc.text(signNum.toString(), pos.x - 5, pos.y - 5, { width: 10, align: "center", lineBreak: false });
    }
    
    // 3. Draw Planets
    doc.fontSize(size * 0.035).fillColor("#000000"); // Black for planets
    
    const houseHasPlanets: Record<number, number> = {};
    for (let h = 1; h <= 12; h++) houseHasPlanets[h] = 0;

    // Add Ascendant (Lagna) Label in House 1
    const ascPos = houseCenters[1];
    doc.text("Asc", ascPos.x - 10, ascPos.y + (size * 0.05)); // Below sign number
    houseHasPlanets[1]++;

    if (data) {
        Object.entries(data).forEach(([planet, value]: [string, any]) => {
            if (planet === "Ascendant" || planet === "Lagna") return;
            
            let signName: string | number = "";
            if (typeof value === "string") signName = value;
            else if (typeof value === "number") signName = value;
            else if (value.name) signName = value.name;
            else if (value.sign) {
                 if (typeof value.sign === "object" && value.sign.name) signName = value.sign.name;
                 else signName = value.sign;
            }
            else if (value.Sign?.Name) signName = value.Sign.Name;
            
            if (!signName) return;
            
            const signNum = this.getSignNumber(signName);
            if (signNum === 0) return;
            
            // Calculate House Number (1-12)
            let houseNum = signNum - lagnaSign + 1;
            if (houseNum <= 0) houseNum += 12;
            
            // Draw Planet
            const count = houseHasPlanets[houseNum] || 0;
            const pos = houseCenters[houseNum];
            
            // Stack planets below the sign number
            const yOffset = (size * 0.05) + (count * (size * 0.04)); 
            
            const symbol = planet.substring(0, 2); // Su, Mo, Ma...
            
            // Color logic
            if (["Saturn", "Rahu", "Ketu", "Mars"].includes(planet)) doc.fillColor("#B71C1C");
            else doc.fillColor("#000000");
            
            doc.text(symbol, pos.x - 10, pos.y + yOffset, { width: 20, align: "center" });
            
            houseHasPlanets[houseNum]++;
        });
    }

    doc.restore();
  }
  
  private static getNorthIndianHouseCenters(size: number): Record<number, {x: number, y: number}> {
      const mid = size / 2;
      const q = size / 4;
      
      // Coordinates largely estimated to center of each house area
      return {
          1: { x: mid, y: q },       // Top Diamond (Lagna)
          2: { x: q, y: q/2 },       // Top Left Triangle
          3: { x: q/2, y: q },       // Left Top Triangle
          4: { x: q, y: mid },       // Left Diamond
          5: { x: q/2, y: size - q },// Left Bottom Triangle
          6: { x: q, y: size - q/2 },// Bottom Left Triangle
          7: { x: mid, y: size - q },// Bottom Diamond
          8: { x: size - q, y: size - q/2 }, // Bottom Right Triangle
          9: { x: size - q/2, y: size - q }, // Right Bottom Triangle
          10: { x: size - q, y: mid },       // Right Diamond
          11: { x: size - q/2, y: q },       // Right Top Triangle
          12: { x: size - q, y: q/2 }        // Top Right Triangle
      };
  }

  // --- South Indian Chart Layout ---
  // Square chart, clockwise signs fixed
  
  public static drawSouthIndianChart(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
    data: any
  ) {
    doc.save();
    doc.translate(x, y);
    
    doc.lineWidth(1).strokeColor("#B35123");
    doc.rect(0, 0, size, size).stroke();
    
    // Inner Square (void)
    // In South Indian chart, the center is usually empty or has chart info.
    // The signs are the border squares.
    const boxSize = size / 4; // Each sign box is 1/4th? No, 12 boxes around.
    // Usually 4x4 grid, but center 2x2 is merged?
    // Let's assume standard layout:
    // Row 1: Pisces, Aries, Taurus, Gemini
    // Row 2: Aquarius, [Center], [Center], Cancer
    // Row 3: Capricorn, [Center], [Center], Leo
    // Row 4: Sagittarius, Scorpio, Libra, Virgo
    
    // Draw Grid
    // Horizontal Lines
    doc.moveTo(0, boxSize).lineTo(size, boxSize).stroke();
    doc.moveTo(0, size - boxSize).lineTo(size, size - boxSize).stroke();
    // Vertical Lines
    doc.moveTo(boxSize, 0).lineTo(boxSize, size).stroke();
    doc.moveTo(size - boxSize, 0).lineTo(size - boxSize, size).stroke();
    
    // Center hole borders
    doc.moveTo(boxSize, boxSize * 2).lineTo(boxSize, boxSize * 3).stroke(); // Not needed if we draw full grid and clear center?
    // Actually, simple grid of whole 4x4, then clear center? 
    // Let's just draw the 12 boxes.
    
    // Draw the 4x4 grid lines fully first? NO, center is empty.
    // Top Row
    doc.rect(0, 0, boxSize, boxSize).stroke(); // Pisces (12)
    doc.rect(boxSize, 0, boxSize, boxSize).stroke(); // Aries (1)
    doc.rect(boxSize*2, 0, boxSize, boxSize).stroke(); // Taurus (2)
    doc.rect(boxSize*3, 0, boxSize, boxSize).stroke(); // Gemini (3)
    
    // Right Col
    doc.rect(boxSize*3, boxSize, boxSize, boxSize).stroke(); // Cancer (4)
    doc.rect(boxSize*3, boxSize*2, boxSize, boxSize).stroke(); // Leo (5)
    
    // Bottom Row
    doc.rect(boxSize*3, boxSize*3, boxSize, boxSize).stroke(); // Virgo (6)
    doc.rect(boxSize*2, boxSize*3, boxSize, boxSize).stroke(); // Libra (7)
    doc.rect(boxSize, boxSize*3, boxSize, boxSize).stroke(); // Scorpio (8)
    doc.rect(0, boxSize*3, boxSize, boxSize).stroke(); // Sagittarius (9)
    
    // Left Col
    doc.rect(0, boxSize*2, boxSize, boxSize).stroke(); // Capricorn (10)
    doc.rect(0, boxSize, boxSize, boxSize).stroke(); // Aquarius (11)
    
    // Sign Names (Fixed)
    const signMap: Record<number, {r: number, c: number, name: string}> = {
        12: {r:0, c:0, name: "Pisces"}, 1: {r:0, c:1, name: "Aries"}, 2: {r:0, c:2, name: "Taurus"}, 3: {r:0, c:3, name: "Gemini"},
        4: {r:1, c:3, name: "Cancer"}, 5: {r:2, c:3, name: "Leo"},
        6: {r:3, c:3, name: "Virgo"}, 7: {r:3, c:2, name: "Libra"}, 8: {r:3, c:1, name: "Scorpio"}, 9: {r:3, c:0, name: "Sagit"},
        10: {r:2, c:0, name: "Capri"}, 11: {r:1, c:0, name: "Aqua"}
    };
    
    // Occupancy for stacking
    const occupancy: Record<number, number> = {};
    for(let i=1; i<=12; i++) occupancy[i] = 0;

    // Draw Static Sign Names (Small, corner)
    doc.fontSize(size * 0.025).fillColor("#888888");
    Object.entries(signMap).forEach(([num, pos]) => {
        const sx = pos.c * boxSize + 2;
        const sy = pos.r * boxSize + 2;
        doc.text(pos.name, sx, sy);
    });
    
    // Draw Planets
    doc.fontSize(size * 0.035).fillColor("#000000");
    if (data) {
        Object.entries(data).forEach(([planet, value]: [string, any]) => {
             let signName: string | number = "";
            if (typeof value === "string") signName = value;
            else if (typeof value === "number") signName = value;
            else if (value.name) signName = value.name;
            else if (value.sign) {
                 if (typeof value.sign === "object" && value.sign.name) signName = value.sign.name;
                 else signName = value.sign;
            }
            else if (value.Sign?.Name) signName = value.Sign.Name;
            
            if (!signName) return;
            
            const signNum = this.getSignNumber(signName);
            if (signNum === 0) return;
            
            const pos = signMap[signNum];
            if (!pos) return;
            
            const count = occupancy[signNum];
            occupancy[signNum]++;
            
            // Stack planets
            // Check if we need to wrap? boxSize is usually small.
            // Let's assume 2 cols in box if needed, or just vertical list.
            
            const symbol = planet.substring(0, 2);
             // Color
            if (["Saturn", "Rahu", "Ketu", "Mars"].includes(planet)) doc.fillColor("#B71C1C");
            else doc.fillColor("#000000");

            // Simple vertical stacking + offset
            const px = pos.c * boxSize + 10;
            const py = pos.r * boxSize + 15 + (count * 12);
            
            doc.text(symbol, px, py);
        });
    }

    doc.restore();
  }
  
  public static getSignNumber(signName: string | number): number {
      if (typeof signName === 'number') return signName;
      const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
      return signs.indexOf(signName.toLowerCase()) + 1;
  }
}
