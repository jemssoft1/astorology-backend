import crypto from "crypto";
import {
  Person,
  CreatePersonDTO,
  UpdatePersonDTO,
  parseBirthTime,
} from "../models/Person.model";

export class PersonRepository {
  /**
   * Generate unique person ID
   */
  static async generatePersonId(
    ownerId: string,
    personName: string,
    birthYear: string,
    failIfDuplicate: boolean = false,
  ): Promise<string> {
    const baseName = personName.replace(/\s+/g, "_").toLowerCase();
    const baseId = `${ownerId}_${baseName}_${birthYear}`;

    console.log("🆔 [PersonRepository.generatePersonId] Base ID:", baseId);

    // Fail check moved to create() for better accuracy
    // if (failIfDuplicate) { ... }

    const uniqueHash = crypto.randomBytes(4).toString("hex");
    return `${baseId}_${uniqueHash}`;
  }

  /**
   * Create new person
   */
  static async create(
    personData: CreatePersonDTO,
    failIfDuplicate: boolean = false,
  ): Promise<Person> {
    const birthTime = parseBirthTime(personData.birthTime);
    const birthYear = birthTime.getFullYear().toString();

    console.log("🛠️ [PersonRepository.create] Input Data:", {
      ...personData,
      birthTimeParsed: birthTime.toString(),
      birthYear,
    });

    const id = await this.generatePersonId(
      personData.ownerId,
      personData.name,
      birthYear,
      false, // failIfDuplicate logic moved to create()
    );

    if (failIfDuplicate) {
      const existing = await Person.findOne({
        where: {
          ownerId: personData.ownerId,
          name: personData.name,
          birthTime: birthTime,
          gender: personData.gender,
        },
      });

      if (existing) {
        throw new Error(
          `Person with similar details already exists. ID: ${existing.id}`,
        );
      }
    }

    const newPerson = await Person.create({
      id,
      ownerId: personData.ownerId,
      name: personData.name,
      birthTime,
      gender: personData.gender,
      notes: personData.notes || "",
      birthLocation: personData.birthLocation,
      latitude: personData.latitude,
      longitude: personData.longitude,
      timezoneOffset: personData.timezoneOffset || "+05:30",
    });

    console.log("✅ [PersonRepository.create] Created Person:", newPerson.id);

    return newPerson;
  }

  /**
   * Update person
   */
  static async update(
    personId: string,
    ownerId: string,
    personData: UpdatePersonDTO,
  ): Promise<Person | null> {
    const existing = await Person.findOne({
      where: { id: personId, ownerId },
    });

    if (!existing) {
      throw new Error("Person not found or access denied");
    }

    // Prepare update object
    const updatePayload: any = {};
    if (personData.name) updatePayload.name = personData.name;
    if (personData.birthTime)
      updatePayload.birthTime = parseBirthTime(personData.birthTime);
    if (personData.gender) updatePayload.gender = personData.gender;
    if (personData.notes !== undefined) updatePayload.notes = personData.notes;
    if (personData.birthLocation !== undefined)
      updatePayload.birthLocation = personData.birthLocation;
    if (personData.latitude !== undefined)
      updatePayload.latitude = personData.latitude;
    if (personData.longitude !== undefined)
      updatePayload.longitude = personData.longitude;
    if (personData.timezoneOffset !== undefined)
      updatePayload.timezoneOffset = personData.timezoneOffset;

    await existing.update(updatePayload);
    return existing;
  }

  /**
   * Delete person
   */
  static async delete(personId: string, ownerId: string): Promise<boolean> {
    const deletedCount = await Person.destroy({
      where: { id: personId, ownerId },
    });
    return deletedCount > 0;
  }

  /**
   * Find person by ID
   */
  static async findById(id: string): Promise<Person | null> {
    return await Person.findByPk(id);
  }

  /**
   * Find person by ID with owner verification
   */
  static async findByIdAndOwner(
    id: string,
    ownerId: string,
  ): Promise<Person | null> {
    return await Person.findOne({
      where: { id, ownerId },
    });
  }

  /**
   * Find all persons by owner
   */
  static async findByOwner(ownerId: string): Promise<Person[]> {
    return await Person.findAll({
      where: { ownerId },
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Find all persons
   */
  static async findAll(limit: number = 1000): Promise<Person[]> {
    return await Person.findAll({
      limit,
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Get person list with visitor swap
   */
  static async getPersonListWithSwap(ownerId: string): Promise<Person[]> {
    return this.findByOwner(ownerId);
  }

  /**
   * Generate hash of person list for cache validation
   */
  static async getPersonListHash(ownerId: string): Promise<string> {
    const persons = await this.getPersonListWithSwap(ownerId);

    // 🆕 Include location in hash
    const dataToHash = persons
      .map(
        (p) =>
          `${p.id}${p.name}${p.birthTime instanceof Date ? p.birthTime.toISOString() : p.birthTime}${p.notes}${p.birthLocation}${p.latitude}${p.longitude}`,
      )
      .join("");

    return crypto.createHash("sha256").update(dataToHash).digest("hex");
  }
}
