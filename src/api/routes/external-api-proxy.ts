import express, { Request, Response } from "express";
import axios from "axios";
import { Time } from "../../types/interfaces";
import { TimeUtil } from "../../utils/TimeUtil";
import { externalApiRouters } from "../../utils/externalApiRouters";
import { apiCache } from "../../utils/cache";
import { ErrorLogRepository } from "../../database/repositories/ErrorLogRepository";

const router = express.Router();

/**
 * Generic handler to proxy requests to the external Astrology API
 */
const handleExternalProxy = async (
  req: Request,
  res: Response,
  endpoint: string,
) => {
  let externalParams: any = {};
  try {
    // 1. Parse and normalize time
    const time: Time = TimeUtil.normalizeTime(req.body.time || req.body);

    // 2. Map internal Time to external API params
    externalParams = {
      day: time.day,
      month: time.month,
      year: time.year,
      hour: time.hour,
      min: time.minute,
      lat: time.location.latitude,
      lon: time.location.longitude,
      tzone: time.location.timezone,
      ...req.body, // Merge any extra parameters (e.g., dasha_date)
    };

    // Log full request for kalsarpa_details debugging
    if (endpoint.includes("kalsarpa_details")) {
      console.log(
        `📋 [DEBUG kalsarpa] req.body:`,
        JSON.stringify(req.body, null, 2),
      );
      console.log(
        `📋 [DEBUG kalsarpa] externalParams:`,
        JSON.stringify(externalParams, null, 2),
      );
    }

    // 3. Check cache first
    const cacheKey = apiCache.generateKey(endpoint, externalParams);
    const cachedResponse = apiCache.get(cacheKey);

    if (cachedResponse) {
      console.log(`⚡ [CACHE] Returning cached response for: ${endpoint}`);
      if (endpoint.includes("kalsarpa_details")) {
        console.log(
          `⚡ [CACHE kalsarpa] Cached data:`,
          JSON.stringify(cachedResponse, null, 2),
        );
      }
      return res.json(cachedResponse);
    }

    // 4. Make the API request
    const API_URL = process.env.API_LINK;
    const API_TOKEN = process.env.API_TOKEN;

    if (!API_URL || !API_TOKEN) {
      console.error(
        `❌ [CONFIG ERROR] Missing env vars - API_LINK: ${!!API_URL}, API_TOKEN: ${!!API_TOKEN}`,
      );
      return res.status(500).json({
        success: false,
        error:
          "External API configuration is missing. Check API_LINK and API_TOKEN in .env",
      });
    }

    // Ensure no double slash and handle leading slash in endpoint
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const fullUrl = `${baseUrl}${cleanEndpoint}`;

    console.log(`🔄 [EXTERNAL API] Calling: ${fullUrl}`);
    console.log(
      `📦 [EXTERNAL API] Params:`,
      JSON.stringify(externalParams, null, 2),
    );

    const response = await axios.post(fullUrl, externalParams, {
      headers: {
        Authorization: `Basic ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 120000, // 120 second timeout
    });

    console.log(`✅ [EXTERNAL API] Success: ${fullUrl}`);

    // Log full response for specific endpoints
    if (endpoint.includes("kalsarpa_details")) {
      console.log(
        `📋 [EXTERNAL API] Response for ${endpoint}:`,
        JSON.stringify(response.data, null, 2),
      );
    }

    // 5. Cache the response
    apiCache.set(cacheKey, response.data);

    // 6. Return the external API response
    res.json(response.data);
  } catch (error: any) {
    console.error(`❌ Error in external proxy [${endpoint}]:`);
    console.error(`Code: ${error.code}`);
    console.error(`Status: ${error.response?.status}`);
    console.error(`Message: ${error.message}`);

    // Check if it's a timeout error
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error(`⏱️ Request timed out after 60 seconds`);
      return res.status(504).json({
        success: false,
        error:
          "External API request timed out. The calculation is taking too long.",
        code: "TIMEOUT",
      });
    }

    if (error.response?.data) {
      console.error(
        `Response Data: ${JSON.stringify(error.response.data, null, 2)}`,
      );
    }

    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message;

    // Log to Database
    ErrorLogRepository.create({
      endpoint: `EXT: ${endpoint}`,
      errorMessage: `External API Error: ${errorMessage}`,
      stackTrace: error.stack || "",
      userId: (req as any).user?.id,
      requestBody: JSON.stringify(externalParams),
    }).catch((e) => console.error("Failed to log external error to DB:", e));

    res.status(status).json({ success: false, error: errorMessage });
  }
};

// ============ DYNAMIC EXTERNAL PROXY ROUTES ============
// Register all routes from externalApiRouters dynamically
Object.values(externalApiRouters).forEach((endpointPath) => {
  router.post(endpointPath, (req, res) =>
    handleExternalProxy(req, res, endpointPath),
  );
});

// ============ SPECIAL PARAMETERIZED ROUTES ============

/**
 * Endpoint to get Planet Ashtakvarga from external Astrology API
 * Route: POST /api/planet_ashtak/:planet_name
 */
router.post(
  "/planet_ashtak/:planet_name",
  async (req: Request, res: Response) => {
    const { planet_name } = req.params;
    return handleExternalProxy(req, res, `/planet_ashtak/${planet_name}`);
  },
);

/**
 * Endpoint to get Sub Char Dasha from external Astrology API
 * Route: POST /api/sub_chardasha/:md
 */
router.post("/sub_chardasha/:md", async (req: Request, res: Response) => {
  const { md } = req.params;
  return handleExternalProxy(req, res, `/sub_chardasha/${md}`);
});

/**
 * Endpoint to get Sub Sub Char Dasha from external Astrology API
 * Route: POST /api/sub_sub_chardasha/:md/:ad
 */
router.post(
  "/sub_sub_chardasha/:md/:ad",
  async (req: Request, res: Response) => {
    const { md, ad } = req.params;
    return handleExternalProxy(req, res, `/sub_sub_chardasha/${md}/${ad}`);
  },
);

/**
 * Endpoint to get Sub Sub Sub Char Dasha from external Astrology API
 * Route: POST /api/sub_sub_sub_chardasha/:md/:ad/:pd
 */
router.post(
  "/sub_sub_sub_chardasha/:md/:ad/:pd",
  async (req: Request, res: Response) => {
    const { md, ad, pd } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/sub_sub_sub_chardasha/${md}/${ad}/${pd}`,
    );
  },
);
router.post("/sub_vdasha/:md", async (req: Request, res: Response) => {
  const { md } = req.params;
  return handleExternalProxy(req, res, `/sub_vdasha/${md}`);
});
router.post("/sub_sub_vdasha/:md/:ad", async (req: Request, res: Response) => {
  const { md, ad } = req.params;
  return handleExternalProxy(req, res, `/sub_sub_vdasha/${md}/${ad}`);
});
router.post(
  "/sub_sub_sub_vdasha/:md/:ad/:pd",
  async (req: Request, res: Response) => {
    const { md, ad, pd } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/sub_sub_sub_vdasha/${md}/${ad}/${pd}`,
    );
  },
);
router.post(
  "/sub_sub_sub_sub_vdasha/:md/:ad/:pd/:sd",
  async (req: Request, res: Response) => {
    const { md, ad, pd, sd } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/sub_sub_sub_sub_vdasha/${md}/${ad}/${pd}/${sd}`,
    );
  },
);
router.post(
  "/sub_yogini_dasha/:dashaCycle/:dashaName",
  async (req: Request, res: Response) => {
    const { dashaCycle, dashaName } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/sub_yogini_dasha/${dashaCycle}/${dashaName}`,
    );
  },
);
router.post(
  "/general_house_report/:planet_name",
  async (req: Request, res: Response) => {
    const { planet_name } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/general_house_report/${planet_name}`,
    );
  },
);
router.post(
  "/general_rashi_report/:planet_name",
  async (req: Request, res: Response) => {
    const { planet_name } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/general_rashi_report/${planet_name}`,
    );
  },
);
router.post(
  "/lalkitab_remedies/:planet_name",
  async (req: Request, res: Response) => {
    const { planet_name } = req.params;
    return handleExternalProxy(req, res, `/lalkitab_remedies/${planet_name}`);
  },
);

router.post("/horo_chart/:chartId", async (req: Request, res: Response) => {
  const { chartId } = req.params;
  return handleExternalProxy(req, res, `/horo_chart/${chartId}`);
});

router.post(
  "/horo_chart_image/:chartId",
  async (req: Request, res: Response) => {
    const { chartId } = req.params;
    return handleExternalProxy(req, res, `/horo_chart_image/${chartId}`);
  },
);

router.post(
  "/general_sign_report/tropical/:planetName",
  async (req: Request, res: Response) => {
    const { planetName } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/general_sign_report/tropical/${planetName}`,
    );
  },
);

router.post(
  "/general_house_report/tropical/:planetName",
  async (req: Request, res: Response) => {
    const { planetName } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/general_house_report/tropical/${planetName}`,
    );
  },
);

router.post(
  "/zodiac_compatibility/:zodiacName/:partnerZodiacName",
  async (req: Request, res: Response) => {
    const { zodiacName, partnerZodiacName } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/zodiac_compatibility/${zodiacName}/${partnerZodiacName}`,
    );
  },
);

router.post(
  "/sun_sign_prediction/daily/:zodiacName",
  async (req: Request, res: Response) => {
    const { zodiacName } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/sun_sign_prediction/daily/${zodiacName}`,
    );
  },
);

router.post(
  "/sun_sign_prediction/next/:zodiacName",
  async (req: Request, res: Response) => {
    const { zodiacName } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/sun_sign_prediction/daily/next/${zodiacName}`,
    );
  },
);

router.post(
  "/sun_sign_prediction/previous/:zodiacName",
  async (req: Request, res: Response) => {
    const { zodiacName } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/sun_sign_prediction/daily/previous/${zodiacName}`,
    );
  },
);

router.post(
  "/sun_sign_consolidated/daily/:zodiacName",
  async (req: Request, res: Response) => {
    const { zodiacName } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/sun_sign_consolidated/daily/${zodiacName}`,
    );
  },
);

router.post(
  "/horoscope_prediction/monthly/:zodiacName",
  async (req: Request, res: Response) => {
    const { zodiacName } = req.params;
    return handleExternalProxy(
      req,
      res,
      `/horoscope_prediction/monthly/${zodiacName}`,
    );
  },
);

// ============ CACHE MANAGEMENT ROUTES ============

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
router.get("/cache/stats", (req: Request, res: Response) => {
  const stats = apiCache.getStats();
  res.json({
    success: true,
    stats,
  });
});

/**
 * DELETE /api/cache/clear
 * Clear all cache
 */
router.delete("/cache/clear", (req: Request, res: Response) => {
  apiCache.clear();
  res.json({
    success: true,
    message: "Cache cleared successfully",
  });
});

export default router;
