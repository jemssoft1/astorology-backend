import { v4 as uuidv4 } from "uuid";
import { ErrorLog, CreateErrorLogDTO } from "../models/ErrorLog.model";
import { Op } from "sequelize";
import { sequelize } from "../sequelize";

export class ErrorLogRepository {
  /**
   * Create a new error log entry
   */
  static async create(logData: CreateErrorLogDTO): Promise<void> {
    const id = uuidv4();

    await ErrorLog.create({
      id,
      endpoint: logData.endpoint,
      errorMessage: logData.errorMessage,
      stackTrace: logData.stackTrace,
      userId: logData.userId || null,
      requestBody: logData.requestBody || null,
      timestamp: new Date(),
    });
  }

  /**
   * Get recent errors
   */
  static async findRecent(limit: number = 100): Promise<ErrorLog[]> {
    return await ErrorLog.findAll({
      order: [["timestamp", "DESC"]],
      limit,
    });
  }

  /**
   * Get errors by endpoint
   */
  static async findByEndpoint(
    endpoint: string,
    limit: number = 100,
  ): Promise<ErrorLog[]> {
    return await ErrorLog.findAll({
      where: { endpoint },
      order: [["timestamp", "DESC"]],
      limit,
    });
  }

  /**
   * Get errors by user
   */
  static async findByUser(
    userId: string,
    limit: number = 100,
  ): Promise<ErrorLog[]> {
    return await ErrorLog.findAll({
      where: { userId },
      order: [["timestamp", "DESC"]],
      limit,
    });
  }

  /**
   * Get errors within date range
   */
  static async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 1000,
  ): Promise<ErrorLog[]> {
    return await ErrorLog.findAll({
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
   * Get error statistics
   */
  static async getStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalErrors: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    topErrors: Array<{ message: string; count: number }>;
  }> {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [startDate, endDate],
      };
    }

    // Get total count
    const totalErrors = await ErrorLog.count({ where: whereClause });

    // Get top endpoints
    const topEndpointsData = await ErrorLog.findAll({
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

    // Get top error messages
    const topErrorsData = await ErrorLog.findAll({
      attributes: [
        ["error_message", "message"],
        [sequelize.fn("COUNT", sequelize.col("error_message")), "count"],
      ],
      where: whereClause,
      group: ["error_message"],
      order: [[sequelize.literal("count"), "DESC"]],
      limit: 10,
    });

    const topErrors = topErrorsData.map((d: any) => ({
      message: d.getDataValue("message"),
      count: parseInt(d.getDataValue("count")),
    }));

    return {
      totalErrors,
      topEndpoints,
      topErrors,
    };
  }

  /**
   * Clean old error logs (keep last N days)
   */
  static async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await ErrorLog.destroy({
      where: {
        timestamp: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    return deletedCount;
  }
}
