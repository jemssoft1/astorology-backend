import { v4 as uuidv4 } from "uuid";
import { Match, CreateMatchDTO } from "../models/Match.model";
import { Op } from "sequelize";
import { sequelize } from "../sequelize";

export class MatchRepository {
  /**
   * Create a new match record
   */
  static async create(matchData: CreateMatchDTO): Promise<Match> {
    const id = uuidv4();

    // Upsert logic: Sequelize's upsert or findOrCreate can be used,
    // but here we are inserting a new record mostly.
    // The previous SQL had ON DUPLICATE KEY UPDATE.
    // Let's assume unique constraint is on (person1_id, person2_id)?
    // Actually, SQL didn't specify unique keys, but uuid is unique.
    // "ON DUPLICATE KEY UPDATE" works if there's a unique index violation.
    // If there is no unique index on p1/p2, it just inserts.
    // Let's check logic: usage seems to be creating a match calculation result.
    // Usually we want to save a history or update existing?
    // Assuming we want to save a new record or update if ID clashes (less likely with UUID).
    // Or maybe update if p1+p2 exists?
    // Let's stick to simple create for now as UUID implies new record.
    // If we want to emulate "Update if p1+p2 exists", we should check existence first or use upsert.

    // Let's define upsert based on p1Id and p2Id if we want to avoid duplicates for same pair?
    // But specific SQL used `id` in INSERT... values (?,...), so DUPLICATE KEY probably referred to ID (which is UUID, so unlikely) OR p1+p2 composite unique?
    // Let's safe-bet on Create new for now, or Upsert if we had p1+p2 unique index.
    // Looking at SQL: INSERT ... ON DUPLICATE KEY UPDATE kuta_score...
    // This implies we DO want to update if it exists.
    // Let's check if p1/p2 combo exists first.

    const existing = await Match.findOne({
      where: {
        [Op.or]: [
          { person1Id: matchData.person1Id, person2Id: matchData.person2Id },
          { person1Id: matchData.person2Id, person2Id: matchData.person1Id },
        ],
      },
    });

    if (existing) {
      await existing.update({
        kutaScore: matchData.kutaScore,
        details: matchData.details,
        createdAt: new Date(), // updated timestamp
      });
      return existing;
    }

    return await Match.create({
      id,
      person1Id: matchData.person1Id,
      person2Id: matchData.person2Id,
      kutaScore: matchData.kutaScore,
      details: matchData.details,
      createdAt: new Date(),
    });
  }

  /**
   * Find match by ID
   */
  static async findById(id: string): Promise<Match | null> {
    return await Match.findByPk(id);
  }

  /**
   * Find match between two persons
   */
  static async findByPersons(
    person1Id: string,
    person2Id: string,
  ): Promise<Match | null> {
    return await Match.findOne({
      where: {
        [Op.or]: [
          { person1Id: person1Id, person2Id: person2Id },
          { person1Id: person2Id, person2Id: person1Id },
        ],
      },
    });
  }

  /**
   * Get all matches for a person
   */
  static async findByPerson(
    personId: string,
    minScore: number = 0,
  ): Promise<Match[]> {
    return await Match.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [{ person1Id: personId }, { person2Id: personId }],
          },
          {
            kutaScore: { [Op.gte]: minScore },
          },
        ],
      },
      order: [["kutaScore", "DESC"]],
    });
  }

  /**
   * Get top matches for a person
   */
  static async findTopMatches(
    personId: string,
    limit: number = 10,
    minScore: number = 70,
  ): Promise<Match[]> {
    return await Match.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [{ person1Id: personId }, { person2Id: personId }],
          },
          {
            kutaScore: { [Op.gte]: minScore },
          },
        ],
      },
      order: [["kutaScore", "DESC"]],
      limit,
    });
  }

  /**
   * Delete match
   */
  static async delete(id: string): Promise<boolean> {
    const count = await Match.destroy({ where: { id } });
    return count > 0;
  }

  /**
   * Delete all matches for a person
   */
  static async deleteByPerson(personId: string): Promise<number> {
    return await Match.destroy({
      where: {
        [Op.or]: [{ person1Id: personId }, { person2Id: personId }],
      },
    });
  }

  /**
   * Get match statistics
   */
  static async getStats(personId: string): Promise<{
    totalMatches: number;
    avgKutaScore: number;
    highestScore: number;
    lowestScore: number;
  }> {
    const whereClause = {
      [Op.or]: [{ person1Id: personId }, { person2Id: personId }],
    };

    const totalMatches = await Match.count({ where: whereClause });
    const avgKutaScore: any = await Match.aggregate("kutaScore", "AVG", {
      where: whereClause,
    });
    const highestScore: any = await Match.max("kutaScore", {
      where: whereClause,
    });
    const lowestScore: any = await Match.min("kutaScore", {
      where: whereClause,
    });

    return {
      totalMatches,
      avgKutaScore: avgKutaScore || 0,
      highestScore: highestScore || 0,
      lowestScore: lowestScore || 0,
    };
  }
}
