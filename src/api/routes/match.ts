// src/api/routes/match.ts
import { Router, Request, Response } from "express";
import { MatchCalculator } from "../../core/MatchCalculator";
import { BirthChartCalculator } from "../../core/BirthChartCalculator";
import { PersonRepository } from "../../database/PersonRepository";
import { Time, Person, PlanetPosition } from "../../types/interfaces";
import { PlanetName, ZodiacName, ConstellationName } from "../../types/enums";
import { Gender } from "../../types/person";
import { TimeUtil } from "../../utils/TimeUtil";

const router = Router();
const personRepo = new PersonRepository();

// Define the match result interface for the array
interface MatchDetails {
  varna: { score: number; max: number };
  vashya: { score: number; max: number };
  tara: { score: number; max: number };
  yoni: { score: number; max: number };
  grahaMaitri: { score: number; max: number };
  gana: { score: number; max: number };
  bhakoot: { score: number; max: number };
  nadi: { score: number; max: number };
}

interface CandidateMatch {
  person: Person & { id: string; ownerId: string };
  score: number;
  details: MatchDetails;
}

/**
 * POST /api/match/calculate
 * Calculate compatibility between two birth times
 */
router.post("/calculate", (req: Request, res: Response) => {
  try {
    const boyTime = TimeUtil.normalizeTime(req.body.boyTime);
    const girlTime = TimeUtil.normalizeTime(req.body.girlTime);

    if (!boyTime || !girlTime) {
      return res
        .status(400)
        .json({ success: false, error: "Missing boyTime or girlTime" });
    }

    // Get Nakshatra and Rashi for Boy
    const boyPlanets = BirthChartCalculator.getAllPlanetPositions(boyTime);
    const boyMoon = boyPlanets.find((p) => p.planet === PlanetName.Moon);

    // Get Nakshatra and Rashi for Girl
    const girlPlanets = BirthChartCalculator.getAllPlanetPositions(girlTime);
    const girlMoon = girlPlanets.find((p) => p.planet === PlanetName.Moon);

    if (!boyMoon || !girlMoon) {
      return res
        .status(500)
        .json({ success: false, error: "Could not calculate Moon position" });
    }

    // Access constellation.name and sign.name from the interfaces
    const boyNak = boyMoon.constellation.name;
    const boyRash = boyMoon.sign.name;
    const girlNak = girlMoon.constellation.name;
    const girlRash = girlMoon.sign.name;

    // Calculate Kutas
    const result = MatchCalculator.calculateMatch(
      boyNak,
      boyRash,
      girlNak,
      girlRash,
    );

    res.json({
      success: true,
      data: {
        score: result.totalScore,
        maxScore: result.maxScore,
        percent: (result.totalScore / result.maxScore) * 100,
        details: result.details,
        boyInfo: { nakshatra: boyNak, rashi: boyRash },
        girlInfo: { nakshatra: girlNak, rashi: girlRash },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/match/find/:ownerId/:personId
 * Find compatible matches for a person from existing list
 */
router.get("/find/:ownerId/:personId", async (req: Request, res: Response) => {
  try {
    const { ownerId, personId } = req.params;

    // Get Main Person
    const mainPerson = await personRepo.getPersonById(ownerId, personId);
    if (!mainPerson)
      return res
        .status(404)
        .json({ success: false, error: "Person not found" });

    // Get Potential Matches
    const allPersons = await personRepo.getPersonsByOwner(ownerId);

    // Explicitly type the matches array
    const matches: CandidateMatch[] = [];

    // Pre-calculate main person details
    const mainPlanets = BirthChartCalculator.getAllPlanetPositions(
      mainPerson.birthTime,
    );
    const mainMoon = mainPlanets.find((p) => p.planet === PlanetName.Moon);
    if (!mainMoon) throw new Error("Moon calc failed");

    const mainNak = mainMoon.constellation.name;
    const mainRash = mainMoon.sign.name;
    const isMale = mainPerson.gender === Gender.Male;

    for (const candidate of allPersons) {
      if (candidate.id === mainPerson.id) continue;
      if (candidate.gender === mainPerson.gender) continue;

      const candPlanets = BirthChartCalculator.getAllPlanetPositions(
        candidate.birthTime,
      );
      const candMoon = candPlanets.find((p) => p.planet === PlanetName.Moon);
      if (!candMoon) continue;

      const candNak = candMoon.constellation.name;
      const candRash = candMoon.sign.name;

      const boyNak = isMale ? mainNak : candNak;
      const boyRash = isMale ? mainRash : candRash;
      const girlNak = isMale ? candNak : mainNak;
      const girlRash = isMale ? candRash : mainRash;

      const matchResult = MatchCalculator.calculateMatch(
        boyNak,
        boyRash,
        girlNak,
        girlRash,
      );

      matches.push({
        person: candidate,
        score: matchResult.totalScore,
        details: matchResult.details,
      });
    }

    // Sort by Score Descending
    matches.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: matches,
      count: matches.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
