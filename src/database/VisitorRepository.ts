import { Visitor } from "./models/Visitor.model";
import { Op } from "sequelize";

/**
 * Visitor tracking interface (Keep for compatibility if needed, though model has it)
 */
export interface IVisitor {
  id?: string;
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
  firstVisit: Date;
  lastVisit: Date;
  visitCount: number;
  referrer?: string;
  language?: string;
}

/**
 * Repository for visitor tracking
 */
export class VisitorRepository {
  /**
   * Record a visitor (new or returning)
   */
  async recordVisit(visitorData: IVisitor): Promise<Visitor> {
    // Check if visitor exists
    const existing = await Visitor.findOne({
      where: { ipAddress: visitorData.ipAddress },
    });

    const now = new Date();

    if (existing) {
      // Update existing visitor
      await existing.update({
        lastVisit: now,
        visitCount: existing.visitCount + 1,
        userAgent: visitorData.userAgent || existing.userAgent,
        referrer: visitorData.referrer || existing.referrer,
      });
      return existing;
    } else {
      // Insert new visitor
      return await Visitor.create({
        id: this.generateId(),
        ipAddress: visitorData.ipAddress,
        city: visitorData.city,
        state: visitorData.state,
        country: visitorData.country,
        area: visitorData.area,
        latitude: visitorData.latitude,
        longitude: visitorData.longitude,
        pcName: visitorData.pcName,
        userAgent: visitorData.userAgent,
        browser: visitorData.browser,
        os: visitorData.os,
        device: visitorData.device,
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        referrer: visitorData.referrer,
        language: visitorData.language,
      });
    }
  }

  /**
   * Find visitor by IP address
   */
  async findByIp(ipAddress: string): Promise<Visitor | null> {
    return await Visitor.findOne({ where: { ipAddress } });
  }

  /**
   * Get all visitors
   */
  async getAllVisitors(
    limit: number = 100,
    offset: number = 0,
  ): Promise<Visitor[]> {
    return await Visitor.findAll({
      order: [["lastVisit", "DESC"]],
      limit,
      offset,
    });
  }

  /**
   * Get visitor statistics
   */
  async getStats() {
    const totalVisitors = await Visitor.count();
    const totalVisits = await Visitor.sum("visitCount");
    const newVisitors = await Visitor.count({ where: { visitCount: 1 } });
    const returningVisitors = await Visitor.count({
      where: { visitCount: { [Op.gt]: 1 } },
    });

    return {
      total_visitors: totalVisitors,
      total_visits: totalVisits || 0,
      new_visitors: newVisitors,
      returning_visitors: returningVisitors,
    };
  }

  /**
   * Get visitors by location
   */
  async getVisitorsByLocation(
    city?: string,
    state?: string,
    country?: string,
  ): Promise<Visitor[]> {
    const whereClause: any = {};

    if (city) whereClause.city = city;
    if (state) whereClause.state = state;
    if (country) whereClause.country = country;

    return await Visitor.findAll({
      where: whereClause,
      order: [["lastVisit", "DESC"]],
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
