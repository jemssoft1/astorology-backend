import axios from "axios";
import { Request } from "express";

/**
 * Service to get geolocation from IP address
 */
export class GeoLocationService {
  /**
   * Get IP address from request
   */
  static getIpAddress(req: Request): string {
    // Check various headers for real IP (useful behind proxies/load balancers)
    const ip =
      (req.headers["x-forwarded-for"] as string) ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      req.ip ||
      "unknown";

    // If multiple IPs (proxy chain), take the first one
    return ip.split(",")[0].trim();
  }

  /**
   * Get location details from IP using free IP geolocation API
   */
  static async getLocationFromIp(ipAddress: string): Promise<{
    city?: string;
    state?: string;
    country?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
  }> {
    try {
      // Skip for localhost/private IPs
      if (
        ipAddress === "unknown" ||
        ipAddress === "::1" ||
        ipAddress === "127.0.0.1" ||
        ipAddress.startsWith("192.168.") ||
        ipAddress.startsWith("10.") ||
        ipAddress.startsWith("172.")
      ) {
        return {
          city: "Localhost",
          state: "Development",
          country: "Local",
          area: "Local Development",
        };
      }

      // Use free IP geolocation API (ip-api.com - 45 requests/minute)
      const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
        timeout: 3000, // 3 second timeout
      });

      if (response.data.status === "success") {
        return {
          city: response.data.city,
          state: response.data.regionName,
          country: response.data.country,
          area: `${response.data.city}, ${response.data.regionName}`,
          latitude: response.data.lat,
          longitude: response.data.lon,
        };
      }

      return {};
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      return {};
    }
  }

  /**
   * Parse user agent to get browser, OS, device info
   */
  static parseUserAgent(userAgent: string): {
    browser?: string;
    os?: string;
    device?: string;
    pcName?: string;
  } {
    if (!userAgent) return {};

    const result: any = {};

    // Detect Browser
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      result.browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      result.browser = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      result.browser = "Safari";
    } else if (userAgent.includes("Edg")) {
      result.browser = "Edge";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
      result.browser = "Opera";
    } else {
      result.browser = "Other";
    }

    // Detect OS
    if (userAgent.includes("Windows NT 10.0")) {
      result.os = "Windows 10";
    } else if (userAgent.includes("Windows NT 6.3")) {
      result.os = "Windows 8.1";
    } else if (userAgent.includes("Windows NT 6.2")) {
      result.os = "Windows 8";
    } else if (userAgent.includes("Windows NT 6.1")) {
      result.os = "Windows 7";
    } else if (userAgent.includes("Windows NT")) {
      result.os = "Windows";
    } else if (userAgent.includes("Mac OS X")) {
      result.os = "macOS";
    } else if (userAgent.includes("Linux")) {
      result.os = "Linux";
    } else if (userAgent.includes("Android")) {
      result.os = "Android";
    } else if (
      userAgent.includes("iOS") ||
      userAgent.includes("iPhone") ||
      userAgent.includes("iPad")
    ) {
      result.os = "iOS";
    } else {
      result.os = "Other";
    }

    // Detect Device Type
    if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
      result.device = "Mobile";
    } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
      result.device = "Tablet";
    } else {
      result.device = "Desktop";
    }

    // PC Name - try to extract from user agent (limited info available)
    // Most browsers don't expose PC name for security reasons
    // You can only get it if client explicitly sends it
    result.pcName = "Unknown";

    return result;
  }

  /**
   * Get comprehensive visitor info from request
   */
  static async getVisitorInfo(req: Request): Promise<{
    ipAddress: string;
    city?: string;
    state?: string;
    country?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
    pcName?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
    device?: string;
    referrer?: string;
    language?: string;
  }> {
    const ipAddress = this.getIpAddress(req);
    const userAgent = req.headers["user-agent"] || "";
    const referrerHeader = req.headers["referer"] || req.headers["referrer"];
    const referrer = Array.isArray(referrerHeader)
      ? referrerHeader[0]
      : referrerHeader || "";

    const languageHeader = req.headers["accept-language"];
    const language =
      (Array.isArray(languageHeader)
        ? languageHeader[0]
        : languageHeader
      )?.split(",")[0] || "";

    // Get location from IP
    const location = await this.getLocationFromIp(ipAddress);

    // Parse user agent
    const agentInfo = this.parseUserAgent(userAgent);

    // Check if client sent PC name in custom header
    const pcNameHeader = req.headers["x-pc-name"];
    const pcName = Array.isArray(pcNameHeader)
      ? pcNameHeader[0]
      : pcNameHeader || agentInfo.pcName;

    return {
      ipAddress,
      ...location,
      pcName,
      userAgent,
      ...agentInfo,
      referrer,
      language,
    };
  }
}
