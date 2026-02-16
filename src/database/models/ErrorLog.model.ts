import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
} from "sequelize-typescript";

/**
 * Error Log Model - Tracks API errors for debugging and monitoring
 */
@Table({
  tableName: "error_logs",
  timestamps: false,
})
export class ErrorLog extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  endpoint!: string;

  @Column({ type: DataType.TEXT, field: "error_message" })
  errorMessage!: string;

  @Column({ type: DataType.TEXT, field: "stack_trace" })
  stackTrace!: string;

  @Column({ type: DataType.STRING, field: "user_id" })
  userId?: string;

  @Column({ type: DataType.TEXT, field: "request_body" })
  requestBody?: string;

  @CreatedAt
  @Column(DataType.DATE)
  timestamp!: Date;
}

export interface CreateErrorLogDTO {
  endpoint: string;
  errorMessage: string;
  stackTrace: string;
  userId?: string;
  requestBody?: string;
}

export interface ErrorLogResponse {
  id: string;
  endpoint: string;
  errorMessage: string;
  userId?: string;
  timestamp: string;
}

/**
 * Convert ErrorLog to response format (hides stack trace for security)
 */
export const toErrorLogResponse = (
  log: ErrorLog,
  includeStackTrace: boolean = false,
): ErrorLogResponse & { stackTrace?: string } => {
  const response: any = {
    id: log.id,
    endpoint: log.endpoint,
    errorMessage: log.errorMessage,
    userId: log.userId,
    timestamp:
      log.timestamp instanceof Date
        ? log.timestamp.toISOString()
        : log.timestamp,
  };

  if (includeStackTrace) {
    response.stackTrace = log.stackTrace;
  }

  return response;
};
