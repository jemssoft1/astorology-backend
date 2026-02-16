import express, { Request, Response } from "express";
import cors from "cors";
import { AstroCalculator } from "./core/AstroCalculator";

// Route Imports
import personRoutes from "./api/routes/person";
import matchRoutes from "./api/routes/match";
import generalRoutes from "./api/routes/general";
import eventsChartRoutes from "./api/routes/events-chart";
import birthTimeRoutes from "./api/routes/birth-time";
import ashtakavargaRoutes from "./api/routes/ashtakavarga";
import vargaRoutes from "./api/routes/varga";
import enhancedDashaRoutes from "./api/routes/enhanced-dasha";
import authRoutes from "./api/routes/auth";
import lifePathRoutes from "./api/routes/life-path";
import chatRoutes from "./api/routes/chat";
import calculateRoutes, { METHOD_MAPPING } from "./api/routes/calculate";

// Extracted Core Routes
import astroCoreRoutes from "./api/routes/astro-core";
import panchangCoreRoutes from "./api/routes/panchang-core";
import dashaCoreRoutes from "./api/routes/dasha-core";
import muhurthaCoreRoutes from "./api/routes/muhurtha-core";
import matchingCoreRoutes from "./api/routes/matching-core";
import strengthCoreRoutes from "./api/routes/strength-core";
import trackingRoutes from "./api/routes/tracking"; // New tracking API
import externalApiProxyRoutes from "./api/routes/external-api-proxy";
import calendarRoutes from "./routes/calendar.routes"; // Calendar API

import { initDB } from "./database/sequelize";

const app = express();
const PORT = process.env.PORT || 3000;

// Helper: Count routes recursively from Express router stack
function countRoutes(stack: any[]): number {
  let count = 0;
  stack.forEach((layer) => {
    if (layer.route) {
      count++;
    } else if (layer.name === "router" && layer.handle.stack) {
      count += countRoutes(layer.handle.stack);
    }
  });
  return count;
}

// Middleware
app.use(cors());
app.use(express.json());

// Custom Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize calculator
try {
  AstroCalculator.initialize();
} catch (err) {
  console.error("Failed to initialize AstroCalculator:", err);
}

// Mount Routes
app.use("/api/person", personRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/events-chart", eventsChartRoutes);
app.use("/api/birth-time", birthTimeRoutes);
app.use("/api/ashtakavarga", ashtakavargaRoutes);
app.use("/api/varga", vargaRoutes);
app.use("/api/enhanced-dasha", enhancedDashaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/life-path", lifePathRoutes);
app.use("/api/Calculate", calculateRoutes); // Unified Calculator

// Mount Extracted Core Routes
// These were previously inline in server.ts under /api base usually
app.use("/api", astroCoreRoutes);
app.use("/api", panchangCoreRoutes);
app.use("/api", dashaCoreRoutes);
app.use("/api", muhurthaCoreRoutes);
app.use("/api", matchingCoreRoutes);
app.use("/api", strengthCoreRoutes);
app.use("/api", externalApiProxyRoutes);

// Tracking & Analytics
app.use("/api/tracking", trackingRoutes);

// Calendar API
app.use("/api/calendar", calendarRoutes);

// Chat & General Routes
app.use("/api", chatRoutes);
app.use("/api", generalRoutes);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "Vedic Astrology API is running" });
});

// 404 Fallback for API
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API Endpoint Not Found" });
});

// Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    const totalRoutes = countRoutes(app._router.stack);
    const unifiedCalculators = Object.keys(METHOD_MAPPING).length;
    const grandTotal = totalRoutes + unifiedCalculators;

    console.log(`\n🚀 Vedic Astrology API Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
    console.log(`\n📊 API STATISTICS:`);
    console.log(`   - Dedicated Direct Routes: ${totalRoutes}`);
    console.log(`   - Unified Calculators: ${unifiedCalculators}`);
    console.log(`   - TOTAL API ENDPOINTS: ${grandTotal}`);
    console.log(`\n✨ Core Services Loaded & Routes Structured.`);
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down gracefully...");
  AstroCalculator.close();
  process.exit(0);
});
