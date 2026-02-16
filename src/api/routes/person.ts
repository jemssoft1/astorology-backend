import { Router, Request, Response } from "express";
import { PersonRepository } from "../../database/repositories/PersonRepository";
import {
  Gender,
  parseBirthTime,
  toPersonResponse,
} from "../../database/models/Person.model";
import { TimeUtil } from "../../utils/TimeUtil";
import { asyncHandler } from "../middleware/errorHandler.middleware";

const router = Router();

// Debug middleware for all person routes
router.use((req: Request, res: Response, next) => {
  console.log("\n=== PERSON API DEBUG ===");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Full URL:", req.originalUrl);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Query Params:", JSON.stringify(req.query, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("========================\n");
  next();
});

/**
 * POST /api/person/add
 * Add new person - Matches C# PersonAPI.AddPerson
 */
router.post(
  "/add",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      ownerId = "visitor_temp",
      personName,
      birthTime,
      gender,
      notes = "",
      failIfDuplicate = false,
      // 🆕 New Location Fields
      birthLocation,
      latitude,
      longitude,
      timezoneOffset = "+05:30",
    } = req.body;

    // Don't allow add for public persons
    if (ownerId === "101") {
      console.log("❌ [ADD PERSON] Rejected: Public profile ID 101");
      return res.status(403).json({
        Status: "Fail",
        error: "You cannot add/edit public profiles with ID 101",
      });
    }

    // Validation - Basic Fields
    if (!personName || !birthTime || !gender) {
      console.log("❌ [ADD PERSON] Validation failed:", {
        hasPersonName: !!personName,
        hasBirthTime: !!birthTime,
        hasGender: !!gender,
      });
      return res.status(400).json({
        Status: "Fail",
        error: "Missing required fields: personName, birthTime, gender",
        details: {
          personName: personName ? "✓" : "✗ Missing",
          birthTime: birthTime ? "✓" : "✗ Missing",
          gender: gender ? "✓" : "✗ Missing",
        },
      });
    }

    // 🆕 Validation - Location Fields
    if (!birthLocation || latitude === undefined || longitude === undefined) {
      console.log("❌ [ADD PERSON] Location validation failed:", {
        hasBirthLocation: !!birthLocation,
        hasLatitude: latitude !== undefined,
        hasLongitude: longitude !== undefined,
      });
      return res.status(400).json({
        Status: "Fail",
        error:
          "Missing required location fields: birthLocation, latitude, longitude",
        details: {
          birthLocation: birthLocation ? "✓" : "✗ Missing",
          latitude: latitude !== undefined ? "✓" : "✗ Missing",
          longitude: longitude !== undefined ? "✓" : "✗ Missing",
          timezoneOffset: timezoneOffset ? "✓" : "⚠️ Using default +05:30",
        },
      });
    }

    // 🆕 Validate latitude & longitude ranges
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        Status: "Fail",
        error: "Invalid latitude. Must be between -90 and 90",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        Status: "Fail",
        error: "Invalid longitude. Must be between -180 and 180",
      });
    }

    try {
      const normalizedBirthTime = TimeUtil.normalizeTime(birthTime);

      const birthDate = new Date(
        normalizedBirthTime.year,
        normalizedBirthTime.month - 1,
        normalizedBirthTime.day,
        normalizedBirthTime.hour,
        normalizedBirthTime.minute,
        normalizedBirthTime.second,
      );

      const personData = {
        ownerId,
        name: personName,
        birthTime: birthDate,
        gender: gender as Gender,
        notes,
        // 🆕 Location Data
        birthLocation,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timezoneOffset: timezoneOffset?.toString() || "+05:30",
      };

      console.log("📍 [ADD PERSON] Creating with location:", {
        birthLocation,
        latitude,
        longitude,
        timezoneOffset,
      });

      const person = await PersonRepository.create(personData, failIfDuplicate);

      const response = {
        Payload: person.id,
        Status: "Pass",
      };

      console.log("✅ [ADD PERSON] Success:", person.id);
      res.json(response);
    } catch (error: any) {
      console.error("❌ [ADD PERSON] Error:", error.message);
      res.status(500).json({
        Status: "Fail",
        error: error.message || "Failed to create person",
        details:
          process.env.NODE_ENV === "development"
            ? {
                stack: error.stack,
                name: error.name,
              }
            : undefined,
      });
    }
  }),
);

/**
 * POST /api/person/update
 * Update person - Matches C# PersonAPI.UpdatePerson
 */
router.post(
  "/update",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      ownerId,
      personId,
      personName,
      birthTime,
      gender,
      notes = "",
      // 🆕 New Location Fields
      birthLocation,
      latitude,
      longitude,
      timezoneOffset,
    } = req.body;

    // Validation
    if (!ownerId || !personId) {
      return res.status(400).json({
        Status: "Fail",
        error: "ownerId and personId are required",
      });
    }

    // 🆕 Validate latitude & longitude if provided
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
      return res.status(400).json({
        Status: "Fail",
        error: "Invalid latitude. Must be between -90 and 90",
      });
    }

    if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
      return res.status(400).json({
        Status: "Fail",
        error: "Invalid longitude. Must be between -180 and 180",
      });
    }

    try {
      let birthDate: Date | undefined = undefined;
      if (birthTime) {
        const normalizedTime = TimeUtil.normalizeTime(birthTime);

        birthDate = new Date(
          normalizedTime.year,
          normalizedTime.month - 1,
          normalizedTime.day,
          normalizedTime.hour,
          normalizedTime.minute,
          normalizedTime.second,
        );
      }

      const updateData = {
        name: personName,
        birthTime: birthDate,
        gender: gender as Gender,
        notes,
        // 🆕 Location Data (only if provided)
        ...(birthLocation && { birthLocation }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(timezoneOffset && { timezoneOffset: timezoneOffset.toString() }),
      };

      console.log("📍 [UPDATE PERSON] Updating with data:", updateData);

      const person = await PersonRepository.update(
        personId,
        ownerId,
        updateData,
      );

      if (!person) {
        throw new Error("Failed to update person");
      }

      console.log("✅ [UPDATE PERSON] Success:", personId);

      res.json({
        Payload: toPersonResponse(person),
        Status: "Pass",
      });
    } catch (error: any) {
      console.error("❌ [UPDATE PERSON] Error:", error.message);
      console.error("Stack:", error.stack);
      throw error;
    }
  }),
);

// ... rest of the routes remain same (delete, list, list-hash, get)

/**
 * DELETE /api/person/delete/:ownerId/:personId
 */
router.delete(
  "/delete/:ownerId/:personId",
  asyncHandler(async (req: Request, res: Response) => {
    const { ownerId, personId } = req.params;

    try {
      const deleted = await PersonRepository.delete(personId, ownerId);

      if (!deleted) {
        return res.status(404).json({
          Status: "Fail",
          Payload: "Person not found",
        });
      }

      res.json({
        Payload: "Deleted! Person ID: " + personId,
        Status: "Pass",
      });
    } catch (error: any) {
      console.error("❌ [DELETE PERSON] Error:", error.message);
      throw error;
    }
  }),
);

/**
 * GET /api/person/list/:ownerId
 */
router.get(
  "/list/:ownerId",
  asyncHandler(async (req: Request, res: Response) => {
    const { ownerId } = req.params;

    try {
      console.log(`📋 [GET LIST] Fetching persons for ownerId: ${ownerId}`);
      const persons = await PersonRepository.getPersonListWithSwap(ownerId);
      console.log(`📋 [GET LIST] Found ${persons.length} persons`);

      const personsJson = persons.map((p) => toPersonResponse(p));
      console.log(`📋 [GET LIST] Mapped to JSON response format`);

      res.json({
        Payload: personsJson,
        Status: "Pass",
      });
    } catch (error: any) {
      console.error("❌ [GET PERSON LIST] Error:", error.message);
      throw error;
    }
  }),
);

/**
 * GET /api/person/list-hash/:ownerId
 */
router.get(
  "/list-hash/:ownerId",
  asyncHandler(async (req: Request, res: Response) => {
    const { ownerId } = req.params;

    try {
      const hash = await PersonRepository.getPersonListHash(ownerId);

      res.json({
        Payload: hash,
        Status: "Pass",
      });
    } catch (error: any) {
      console.error("❌ [GET LIST HASH] Error:", error.message);
      throw error;
    }
  }),
);

/**
 * GET /api/person/:ownerId/:personId
 */
router.get(
  "/:ownerId/:personId",
  asyncHandler(async (req: Request, res: Response) => {
    const { ownerId, personId } = req.params;

    try {
      const person = await PersonRepository.findByIdAndOwner(personId, ownerId);

      if (!person) {
        return res.status(404).json({
          Status: "Fail",
          Payload: "Person not found",
        });
      }

      res.json({
        Payload: toPersonResponse(person),
        Status: "Pass",
      });
    } catch (error: any) {
      console.error("❌ [GET PERSON] Error:", error.message);
      throw error;
    }
  }),
);

export default router;
