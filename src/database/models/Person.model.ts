import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

/**
 * Person Model - Represents person profiles for astrological calculations
 */

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
}

@Table({
  tableName: "persons",
  timestamps: true,
})
export class Person extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column({ type: DataType.STRING, field: "ownerId" })
  ownerId!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column({ type: DataType.DATE, field: "birthTime" })
  birthTime!: Date;

  @Column(DataType.STRING)
  gender!: Gender;

  @Column(DataType.STRING)
  notes?: string;

  // 🆕 Location fields
  @Column({ type: DataType.STRING, field: "birthLocation" })
  birthLocation?: string;

  @Column(DataType.FLOAT)
  latitude?: number;

  @Column(DataType.FLOAT)
  longitude?: number;

  @Column({ type: DataType.STRING, field: "timezoneOffset" })
  timezoneOffset?: string;

  @CreatedAt
  @Column({ field: "createdAt" })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: "updatedAt" })
  updatedAt!: Date;
}

export interface CreatePersonDTO {
  ownerId: string;
  name: string;
  birthTime: Date | string;
  gender: Gender;
  notes?: string;
  birthLocation?: string;
  latitude?: number;
  longitude?: number;
  timezoneOffset?: string;
}

export interface UpdatePersonDTO {
  name?: string;
  birthTime?: Date | string;
  gender?: Gender;
  notes?: string;
  birthLocation?: string;
  latitude?: number;
  longitude?: number;
  timezoneOffset?: string;
}

export interface PersonResponse {
  PersonId: string; // Matches C# API naming
  OwnerId: string;
  Name: string;
  BirthTime: string; // ISO format
  Gender: string;
  Notes: string;
  BirthLocation: string;
  Latitude: number;
  Longitude: number;
  TimezoneOffset: string;
  CreatedAt: string;
  UpdatedAt: string;
}

/**
 * Convert Person to API response format (matches C# API structure)
 */
export const toPersonResponse = (person: Person): PersonResponse => {
  return {
    PersonId: person.id,
    OwnerId: person.ownerId,
    Name: person.name,
    BirthTime:
      person.birthTime instanceof Date
        ? person.birthTime.toISOString()
        : person.birthTime,
    Gender: person.gender,
    Notes: person.notes || "",
    BirthLocation: person.birthLocation || "",
    Latitude: person.latitude || 0,
    Longitude: person.longitude || 0,
    TimezoneOffset: person.timezoneOffset || "+00:00",
    CreatedAt:
      person.createdAt instanceof Date
        ? person.createdAt.toISOString()
        : person.createdAt,
    UpdatedAt:
      person.updatedAt instanceof Date
        ? person.updatedAt.toISOString()
        : person.updatedAt,
  };
};

/**
 * Parse birth time from various formats
 */
export const parseBirthTime = (birthTime: Date | string): Date => {
  if (birthTime instanceof Date) {
    return birthTime;
  }
  return new Date(birthTime);
};

/**
 * Format Date to SQL DateTime string (UTC)
 * @deprecated Sequelize handles this automatically now
 */
export const toSqlDateTime = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace("T", " ");
};
