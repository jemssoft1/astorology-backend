import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
} from "sequelize-typescript";

/**
 * Match Model - Represents compatibility match results
 */
@Table({
  tableName: "matches",
  timestamps: false,
})
export class Match extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column({ type: DataType.STRING, field: "person1_id" })
  person1Id!: string;

  @Column({ type: DataType.STRING, field: "person2_id" })
  person2Id!: string;

  @Column({ type: DataType.FLOAT, field: "kuta_score" })
  kutaScore!: number;

  @Column({ type: DataType.JSON, field: "details" })
  details!: MatchDetails;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;
}

export interface MatchDetails {
  varna?: number;
  vashya?: number;
  tara?: number;
  yoni?: number;
  graha?: number;
  gana?: number;
  rashi?: number;
  nadi?: number;
  totalScore?: number;
  maxScore?: number;
  percentage?: number;
  [key: string]: any; // Allow additional compatibility metrics
}

export interface CreateMatchDTO {
  person1Id: string;
  person2Id: string;
  kutaScore: number;
  details: MatchDetails;
}

export interface MatchResponse {
  id: string;
  person1: PersonKutaScore;
  person2: PersonKutaScore;
  kutaScore: number;
  details: MatchDetails;
  createdAt: string;
}

export interface PersonKutaScore {
  id: string;
  name: string;
  gender: string;
  age?: number;
  kutaScore: number;
}

/**
 * Convert Match to API response format
 */
export const toMatchResponse = (
  match: Match,
  person1?: any,
  person2?: any,
): MatchResponse => {
  return {
    id: match.id,
    person1: person1 || {
      id: match.person1Id,
      name: "",
      gender: "",
      kutaScore: match.kutaScore,
    },
    person2: person2 || {
      id: match.person2Id,
      name: "",
      gender: "",
      kutaScore: match.kutaScore,
    },
    kutaScore: match.kutaScore,
    details: match.details,
    createdAt:
      match.createdAt instanceof Date
        ? match.createdAt.toISOString()
        : match.createdAt,
  };
};
