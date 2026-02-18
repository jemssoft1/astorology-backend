import puppeteer from "puppeteer";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { WesternHoroscopeService, WesternChartData } from "./WesternHoroscopeService";

const logFile = path.join(process.cwd(), "public", "debug.log");
const log = (msg: string) => {
  try {
    fs.appendFileSync(logFile, `[PdfService] ${msg}\n`);
  } catch (e) {}
};

interface PdfData {
  name: string;
  birthDetails: {
    dob: string;
    tob: string;
    place: string;
    lat: number;
    lon: number;
    timezone: number;
  };
  horoscope: WesternChartData;
  company: {
    name: string;
    info: string;
    email: string;
    landline: string;
    mobile: string;
    logoUrl?: string;
    domainUrl: string;
    footerLink: string;
  };
}

interface MiniPdfData {
  name: string;
  gender: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  min: number;
  lat: number;
  lon: number;
  language: string;
  tzone: number;
  place: string;
  chart_style: string;
  footer_link: string;
  logo_url: string;
  company_name: string;
  company_info: string;
  domain_url: string;
  company_email: string;
  company_landline: string;
  company_mobile: string;
  
  // Computed Data passed to EJS
  planets: any[];
  ascendant: any;
}

export class PdfService {

  public static async generateMiniPdf(data: any): Promise<string> {
    log("Start Mini PDF Generation (Page-by-Page Match)");

    // Fetch real report data from WesternHoroscopeService
    const reportData = await WesternHoroscopeService.getWesternHoroscope({
        year: data.year,
        month: data.month,
        day: data.day,
        hour: data.hour,
        minute: data.min,
        place: data.place,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.tzone
    });

    // Split interpretations for multiple pages if needed
    const allInterpretations = reportData.interpretations.map(i => i.text).join('<br><br>');
    const halfLen = Math.floor(allInterpretations.length / 2);
    const reportPage1 = allInterpretations.substring(0, allInterpretations.lastIndexOf(' ', halfLen));
    const reportPage2 = allInterpretations.substring(reportPage1.length);

    // Transform raw data into the exact structure expected by the newest mini_horoscope.ejs
    const transformedData = {
      title: `${data.name}'s Horoscope Report`,
      fonts: [
        { family: "Baloo-Regular_53", src: "https://fonts.gstatic.com/s/baloo2/v16/wXstE306zTP4zGPWvUCX7A.woff" },
        { family: "Laila", src: "https://fonts.gstatic.com/s/laila/v11/S6uyw4XVs_9Wp0W6SjA.woff" },
        { family: "Open Sans", src: "https://fonts.gstatic.com/s/opensans/v40/memvYaGs126MiZpBA-UvWbX2vVnXBbObj2OVTS-muw.woff" },
        { family: "Laila-Bold_4z", src: "https://fonts.gstatic.com/s/laila/v11/S6uyw4XVs_9Wp0W6SjA.woff" },
        { family: "OpenSans-Regular_4p", src: "https://fonts.gstatic.com/s/opensans/v40/memvYaGs126MiZpBA-UvWbX2vVnXBbObj2OVTS-muw.woff" }
      ],
      page1: {
        bgImage: this.getMiniBackgroundSvg(data, 'cover'),
        userName: data.name,
        dob: `${data.day}-${data.month}-${data.year}`,
        tob: `${data.hour}:${data.min}`,
        pob: data.place
      },
      page2: {
        bgImage: this.getMiniBackgroundSvg(data, 'inner'),
        basicDetails: [
          { key: "Name", value: data.name },
          { key: "Date of Birth", value: `${data.day}-${data.month}-${data.year}` },
          { key: "Time of Birth", value: `${data.hour}:${data.min}` },
          { key: "Place of Birth", value: data.place },
          { key: "Latitude", value: data.lat },
          { key: "Longitude", value: data.lon },
          { key: "Timezone", value: data.tzone }
        ]
      },
      page3: {
        bgImage: this.getMiniBackgroundSvg(data, 'inner'),
        chartSvg: this.getChartSvg(data),
        chartTitle: `Lagna Chart (${data.chart_style || 'SOUTH_INDIAN'})`
      },
      page4: {
        bgImage: this.getMiniBackgroundSvg(data, 'inner'),
        planets: reportData.planets.map((p: any) => ({
          name: p.name,
          rasi: p.sign,
          degree: `${Math.floor(p.signDegree)}° ${Math.floor((p.signDegree % 1) * 60)}'`,
          nakshatra: p.nakshatra || "N/A"
        }))
      },
      page5: {
        bgImage: this.getMiniBackgroundSvg(data, 'inner'),
        dasha: [
            { planet: "Ketu", start: "15-08-1990", end: "15-08-1997" },
            { planet: "Venus", start: "15-08-1997", end: "15-08-2017" },
            { planet: "Sun", start: "15-08-2017", end: "15-08-2023" },
            { planet: "Moon", start: "15-08-2023", end: "15-08-2033" }
        ]
      },
      page6: {
        bgImage: this.getMiniBackgroundSvg(data, 'inner'),
        reportText: reportPage1 || `Your ascendant report suggests that you have a dynamic personality...`
      },
      page7: {
        bgImage: this.getMiniBackgroundSvg(data, 'inner'),
        reportText: reportPage2 || `In terms of career and finances, the planetary positions indicate...`
      },
      page8: {
        bgImage: this.getMiniBackgroundSvg(data, 'inner'),
        positiveTraits: ["Confident", "Analytical", "Loyal", "Ambitious"],
        negativeTraits: ["Impulsive", "Stubborn", "Over-sensitive"]
      },
      page9: {
        bgImage: this.getMiniBackgroundSvg(data, 'inner'),
        reportText: `Your ascendant is at ${reportData.ascendant.toFixed(2)}°. This indicates a life journey focused on self-realization and achievement.`
      }
    };

    // 1. Render EJS
    const templatePath = path.join(process.cwd(), "src", "templates", "mini_horoscope.ejs");
    const templateContent = fs.readFileSync(templatePath, "utf-8");
    const htmlContent = ejs.render(templateContent, { data: transformedData });

    // 2. Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const fileName = `mini-report-${uuidv4()}.pdf`;
      const reportsDir = path.join(process.cwd(), "public", "pdfs");
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

      const filePath = path.join(reportsDir, fileName);
      await page.pdf({
        path: filePath,
        width: "935px",
        height: "1210px",
        printBackground: true,
      });

      await browser.close();
      return `/pdfs/${fileName}`;
    } catch (err) {
      await browser.close();
      throw err;
    }
  }

  private static getMiniBackgroundSvg(data: any, type: 'cover' | 'inner'): string {
    const width = 935;
    const height = 1210;
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="#fff"/>`;
    
    // Decorative borders
    svg += `<rect x="40" y="40" width="${width-80}" height="${height-80}" fill="none" stroke="#F57C00" stroke-width="2"/>`;
    svg += `<rect x="45" y="45" width="${width-90}" height="${height-90}" fill="none" stroke="#F57C00" stroke-width="4"/>`;
    
    if (type === 'cover') {
        svg += `<circle cx="${width/2}" cy="300" r="100" fill="#FFF3E0" stroke="#F57C00" stroke-width="2"/>`;
        svg += `<text x="${width/2}" y="315" font-family="serif" font-size="60" text-anchor="middle" fill="#F57C00">🕉️</text>`;
    } else {
        svg += `<line x1="80" y1="100" x2="${width-80}" y2="100" stroke="#eee" stroke-width="1"/>`;
    }
    
    svg += `</svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  private static getChartSvg(data: any): string {
    const size = 400;
    const chartX = 267;
    const chartY = 300;
    const box = size / 4;
    const stroke = "#F57C00";
    
    let svg = `<svg x="${chartX}" y="${chartY}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    if (data.chart_style === 'NORTH_INDIAN') {
        svg += `<rect x="0" y="0" width="${size}" height="${size}" fill="none" stroke="${stroke}" stroke-width="2"/>`;
        svg += `<line x1="0" y1="0" x2="${size}" y2="${size}" stroke="${stroke}" stroke-width="2"/>`;
        svg += `<line x1="0" y1="${size}" x2="${size}" y2="0" stroke="${stroke}" stroke-width="2"/>`;
        svg += `<line x1="${size/2}" y1="0" x2="0" y2="${size/2}" stroke="${stroke}" stroke-width="2"/>`;
        svg += `<line x1="${size/2}" y1="0" x2="${size}" y2="${size/2}" stroke="${stroke}" stroke-width="2"/>`;
        svg += `<line x1="0" y1="${size/2}" x2="${size/2}" y2="${size}" stroke="${stroke}" stroke-width="2"/>`;
        svg += `<line x1="${size}" y1="${size/2}" x2="${size/2}" y2="${size}" stroke="${stroke}" stroke-width="2"/>`;
    } else {
        svg += `<rect x="0" y="0" width="${size}" height="${size}" fill="none" stroke="${stroke}" stroke-width="2"/>`;
        for(let i=1; i<4; i++) {
            svg += `<line x1="${i*box}" y1="0" x2="${i*box}" y2="${size}" stroke="${stroke}"/>`;
            svg += `<line x1="0" y1="${i*box}" x2="${size}" y2="${i*box}" stroke="${stroke}"/>`;
        }
    }
    svg += `</svg>`;
    return svg;
  }

  public static async generateHoroscopePdf(data: PdfData): Promise<string> {
    log("Start Generation (Puppeteer)");

    // 1. Render HTML from EJS
    const templatePath = path.join(process.cwd(), "src", "templates", "horoscope.ejs");
    log(`Template Path: ${templatePath}`);
    
    if (!fs.existsSync(templatePath)) {
        log("Template file not found!");
        throw new Error("Template file not found");
    }

    const templateContent = fs.readFileSync(templatePath, "utf-8");
    const htmlContent = ejs.render(templateContent, data);
    
    // 2. Launch Puppeteer
    log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Safer for server environments
    });
    
    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // 3. Generate PDF
        const fileName = `natal-report-${uuidv4()}.pdf`;
        const reportsDir = path.join(process.cwd(), "public", "reports");
        
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }

        const filePath = path.join(reportsDir, fileName);
        log(`Writing PDF to: ${filePath}`);
        
        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false,
            margin: {
                top: '0px',
                bottom: '0px',
                left: '0px',
                right: '0px'
            }
        });

        log("PDF Generated Successfully");
        await browser.close();
        
        return `/reports/${fileName}`;

    } catch (err) {
        log(`Error generating PDF: ${err}`);
        await browser.close();
        throw err;
    }
  }
}
