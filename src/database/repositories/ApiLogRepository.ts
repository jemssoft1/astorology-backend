import { v4 as uuidv4 } from "uuid";
import { ApiLog, CreateApiLogDTO } from "../models/ApiLog.model";
import { Op } from "sequelize";
import { sequelize } from "../sequelize";

export class ApiLogRepository {
  /**
   * Create a new API log entry
   */
  static async create(logData: CreateApiLogDTO): Promise<void> {
    const id = uuidv4();

    await ApiLog.create({
      id,
      userId: logData.userId || null,
      endpoint: logData.endpoint,
      method: logData.method,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      responseTime: logData.responseTime,
      statusCode: logData.statusCode,
      timestamp: new Date(),
    });
  }

  /**
   * Get logs by user ID
   */
  static async findByUser(
    userId: string,
    limit: number = 100,
  ): Promise<ApiLog[]> {
    return await ApiLog.findAll({
      where: { userId },
      order: [["timestamp", "DESC"]],
      limit,
    });
  }

  /**
   * Get logs by endpoint
   */
  static async findByEndpoint(
    endpoint: string,
    limit: number = 100,
  ): Promise<ApiLog[]> {
    return await ApiLog.findAll({
      where: { endpoint },
      order: [["timestamp", "DESC"]],
      limit,
    });
  }

  /**
   * Get logs within date range
   */
  static async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 1000,
  ): Promise<ApiLog[]> {
    return await ApiLog.findAll({
      where: {
        timestamp: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["timestamp", "DESC"]],
      limit,
    });
  }

  /**
   * Get analytics summary
   */
  static async getAnalytics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalRequests: number;
    avgResponseTime: number;
    successRate: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  }> {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [startDate, endDate],
      };
    }

    // Total requests
    const totalRequests = await ApiLog.count({ where: whereClause });

    // Avg response time
    const avgResponseTime: any = await ApiLog.sum("responseTime", {
      where: whereClause,
    });
    const avgTime = totalRequests > 0 ? avgResponseTime / totalRequests : 0;

    // Success count
    const successCount = await ApiLog.count({
      where: {
        ...whereClause,
        statusCode: {
          [Op.lt]: 400,
        },
      },
    });

    // Top endpoints (using raw query for aggregation as it's cleaner than Sequelize aggregation syntax sometimes)
    // But let's try Sequelize way or keep it simple.
    // Sequelize groupBy:
    const topEndpointsData = await ApiLog.findAll({
      attributes: [
        "endpoint",
        [sequelize.fn("COUNT", sequelize.col("endpoint")), "count"],
      ],
      where: whereClause,
      group: ["endpoint"],
      order: [[sequelize.literal("count"), "DESC"]],
      limit: 10,
    });

    const topEndpoints = topEndpointsData.map((d: any) => ({
      endpoint: d.endpoint,
      count: parseInt(d.getDataValue("count")),
    }));

    return {
      totalRequests,
      avgResponseTime: avgTime,
      successRate: totalRequests ? (successCount / totalRequests) * 100 : 0,
      topEndpoints,
    };
  }

  /**
   * Clean old logs (keep last N days)
   */
  static async cleanOldLogs(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await ApiLog.destroy({
      where: {
        timestamp: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    return deletedCount;
  }
}
