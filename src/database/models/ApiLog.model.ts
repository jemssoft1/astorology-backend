import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
} from "sequelize-typescript";

/**
 * API Log Model - Tracks API usage and analytics
 */
@Table({
  tableName: "api_logs",
  timestamps: false, // Only createdAt is needed, managed manually or via decorator
})
export class ApiLog extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column({ type: DataType.STRING, field: "user_id" })
  userId?: string;

  @Column(DataType.STRING)
  endpoint!: string;

  @Column(DataType.STRING)
  method!: string;

  @Column({ type: DataType.STRING, field: "ip_address" })
  ipAddress!: string;

  @Column({ type: DataType.STRING, field: "user_agent" })
  userAgent!: string;

  @Column({ type: DataType.INTEGER, field: "response_time" })
  responseTime!: number; // in milliseconds

  @Column({ type: DataType.INTEGER, field: "status_code" })
  statusCode!: number;

  @CreatedAt
  @Column(DataType.DATE)
  timestamp!: Date;
}

export interface CreateApiLogDTO {
  userId?: string;
  endpoint: string;
  method: string;
  ipAddress: string;
  userAgent: string;
  responseTime: number;
  statusCode: number;
}

export interface ApiLogResponse {
  id: string;
  userId?: string;
  endpoint: string;
  method: string;
  ipAddress: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
}

/**
 * Convert ApiLog to response format
 */
export const toApiLogResponse = (log: ApiLog): ApiLogResponse => {
  return {
    id: log.id,
    userId: log.userId,
    endpoint: log.endpoint,
    method: log.method,
    ipAddress: log.ipAddress,
    responseTime: log.responseTime,
    statusCode: log.statusCode,
    timestamp:
      log.timestamp instanceof Date
        ? log.timestamp.toISOString()
        : log.timestamp,
  };
};
