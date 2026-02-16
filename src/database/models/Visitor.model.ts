import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "visitors",
  timestamps: true, // adds createdAt, updatedAt
})
export class Visitor extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Unique
  @Column({ type: DataType.STRING, field: "ip_address" })
  ipAddress!: string;

  @Column(DataType.STRING)
  city?: string;

  @Column(DataType.STRING)
  state?: string;

  @Column(DataType.STRING)
  country?: string;

  @Column(DataType.STRING)
  area?: string;

  @Column(DataType.FLOAT)
  latitude?: number;

  @Column(DataType.FLOAT)
  longitude?: number;

  @Column({ type: DataType.STRING, field: "pc_name" })
  pcName?: string;

  @Column({ type: DataType.STRING, field: "user_agent" })
  userAgent?: string;

  @Column(DataType.STRING)
  browser?: string;

  @Column(DataType.STRING)
  os?: string;

  @Column(DataType.STRING)
  device?: string;

  @Column({ type: DataType.DATE, field: "first_visit" })
  firstVisit!: Date;

  @Column({ type: DataType.DATE, field: "last_visit" })
  lastVisit!: Date;

  @Default(1)
  @Column({ type: DataType.INTEGER, field: "visit_count" })
  visitCount!: number;

  @Column(DataType.STRING)
  referrer?: string;

  @Column(DataType.STRING)
  language?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
