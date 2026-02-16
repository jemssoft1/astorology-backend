export const externalApiRouters = {
  // --- Panchang Routes ---
  AdvancedPanchang: "/advanced_panchang",
  AdvancedPanchangSunrise: "/advanced_panchang/sunrise",
  ChauhadiyaMuhurta: "/chaughadiya_muhurta",
  HoraMuhurta: "/hora_muhurta",
  HoraMuhurtaDinman: "/hora_muhurta_dinman",
  PanchangChart: "/panchang_chart",
  PanchangChartSunrise: "/panchang_chart/sunrise",
  PanchangLagnaTable: "/panchang_lagna_table",
  TamilPanchangMonthly: "/tamil_month_panchang",
  TamilPanchang: "/tamil_panchang",
  MonthlyPanchang: "/monthly_panchang",
  PanchangFestival: "/panchang_festival",
  BasicPanchang: "/basic_panchang",
  PlanetPanchang: "/planet_panchang",
  BasicPanchangSunrise: "/basic_panchang/sunrise",
  PlanetPanchangSunrise: "/planet_panchang/sunrise",
  PanchangMaitri: "/panchada_maitri",

  // --- Basic Astro Routes ---
  GeoDetails: "/geo_details",
  TimezoneWithDst: "/timezone_with_dst",
  BirthDetails: "/birth_details",
  AstroDetails: "/astro_details",
  Planets: "/planets",
  PlanetsExtended: "/planets/extended",
  BhavMadhya: "/bhav_madhya",
  Ayanamsha: "/ayanamsha",
  GhatChakra: "/ghat_chakra",
  PlanetNature: "/planet_nature",

  // --- Char Dasha Routes ---
  CurrentCharDasha: "/current_chardasha",
  MajorCharDasha: "/major_chardasha",
  SubSubCharDasha: "/sub_sub_chardasha",
  // Note: SubCharDasha is parameterized: /sub_chardasha/:md

  // --- Vimshottari Dasha Routes ---
  CurrentVDasha: "/current_vdasha",
  CurrentVDashaAllSunrise: "/current_vdasha_all",
  MajorVDasha: "/major_vdasha",
  CurrentVDashaDate: "/current_vdasha_date",

  // --- Yogini Dasha ---
  MajorYoginiDasha: "/major_yogini_dasha",
  SubYoginiDasha: "/sub_yogini_dasha",
  CurrentYoginiDasha: "/current_yogini_dasha",

  // --- Biorhythm ---
  Biorhythm: "/biorhythm",
  MoonBiorhythm: "/moon_biorhythm",

  // --- Daily Nakshatra Prediction ---
  DailyNakshatraPrediction: "/daily_nakshatra_prediction",
  DailyNakshatraPredictionNext: "/daily_nakshatra_prediction/next",
  DailyNakshatraPredictionPrev: "/daily_nakshatra_prediction/previous",
  DailyNakshatraPredictionConsolidated: "/daily_nakshatra_consolidated",

  // --- General Report ---
  GeneralNakshatraReport: "/general_nakshatra_report",
  GeneralAscendantReport: "/general_ascendant_report",

  // --- Jaimini  Api ---
  JaiminiDetails: "/jaimini_details",

  // --- KP Astrology ---
  KPPlanets: "/kp_planets",
  KPHouseCusps: "/kp_house_cusps",
  KpBirthChart: "/kp_birth_chart",
  KpHouseSignificator: "/kp_house_significator",
  KpPlanetSignificator: "/kp_planet_significator",
  KpHoroscope: "/kp_horoscope",

  // ---  Lalkitab ---
  LalkitabHoroscope: "/lalkitab_horoscope",
  LalkitabDebts: "/lalkitab_debts",
  LalKitabHouses: "/lalkitab_houses",
  LalKitabPlanets: "/lalkitab_planets",

  // --- Ashtakvarga Routes ---
  Sarvashtak: "/sarvashtak",
  // Note: PlanetAshtak is parameterized: /planet_ashtak/:planet_name

  // --- Charts ---
  HoroChartExtended: "/horo_chart_extended",

  // --- Dosha & Remedies ---
  KalsarpaDetails: "/kalsarpa_details",
  SadhesatiCurrentStatus: "/sadhesati_current_status",
  SadhesatiLifeDetails: "/sadhesati_life_details",
  SadhesatiRemedies: "/sadhesati_remedies",
  PitraDoshaReport: "/pitra_dosha_report",
  BasicGemSuggestion: "/basic_gem_suggestion",
  PujaSuggestion: "/puja_suggestion",
  RudrakshaSuggestion: "/rudraksha_suggestion",

  // --- Vedic Numerology ---
  NumeroTable: "/numero_table",
  NumeroReport: "/numero_report",
  NumeroFavTime: "/numero_fav_time",
  NumeroPlaceVastu: "/numero_place_vastu",
  NumeroFastsReport: "/numero_fasts_report",
  NumeroFavLord: "/numero_fav_lord",
  NumeroFavMantra: "/numero_fav_mantra",
  NumeroPredictionDaily: "/numero_prediction/daily",

  // --- Varshaphal ---
  VarshaphalYearChart: "/varshaphal_year_chart",
  VarshaphalMonthChart: "/varshaphal_month_chart",
  VarshaphalDetails: "/varshaphal_details",
  VarshaphalPlanets: "/varshaphal_planets",
  VarshaphalMuntha: "/varshaphal_muntha",
  VarshaphalMuddaDasha: "/varshaphal_mudda_dasha",
  VarshaphalPanchavargeeyaBala: "/varshaphal_panchavargeeya_bala",
  VarshaphalHarshaBala: "/varshaphal_harsha_bala",
  VarshaphalYoga: "/varshaphal_yoga",
  VarshaphalSahamPoints: "/varshaphal_saham_points",

  // --- Matching ---
  MatchBirthDetails: "/match_birth_details",
  MatchObstructions: "/match_obstructions",
  MatchAstroDetails: "/match_astro_details",
  MatchPlanetDetails: "/match_planet_details",
  MatchManglikReport: "/match_manglik_report",
  MatchAshtakootPoints: "/match_ashtakoot_points",
  MatchDashakootPoints: "/match_dashakoot_points",
  MatchPercentage: "/match_percentage",
  MatchMakingReport: "/match_making_report",
  MatchMakingDetailedReport: "/match_making_detailed_report",

  // ==========================================
  // --- WESTERN ASTROLOGY ROUTES ---
  // ==========================================

  // --- Planets & Houses ---
  PlanetsTropical: "/planets/tropical",
  HouseCuspsTropical: "/house_cusps/tropical",
  WesternHoroscope: "/western_horoscope",
  NatalWheelChart: "/natal_wheel_chart",
  NatalChartInterpretation: "/natal_chart_interpretation",

  // --- Western Reports ---
  HouseCuspsReportTropical: "/house_cusps_report/tropical",
  NatalHouseCuspReport: "/natal_house_cusp_report",
  GeneralAscendantReportTropical: "/general_ascendant_report/tropical",
  MoonPhaseReport: "/moon_phase_report",
  LunarMetrics: "/lunar_metrics",
  WesternChartData: "/western_chart_data",

  // --- Solar Return ---
  SolarReturnDetails: "/solar_return_details",
  SolarReturnPlanets: "/solar_return_planets",
  SolarReturnHouseCusps: "/solar_return_house_cusps",
  SolarReturnPlanetReport: "/solar_return_planet_report",
  SolarReturnPlanetAspects: "/solar_return_planet_aspects",
  SolarReturnAspectsReport: "/solar_return_aspects_report",

  // --- Transits ---
  TropicalTransitsMonthly: "/tropical_transits/monthly",
  TropicalTransitsDaily: "/tropical_transits/daily",
  TropicalTransitsWeekly: "/tropical_transits/weekly",
  NatalTransitsDaily: "/natal_transits/daily",
  NatalTransitsWeekly: "/natal_transits/weekly",

  // --- Western Numerology ---
  NumerologicalNumbers: "/numerological_numbers",
  LifepathNumber: "/lifepath_number",
  PersonalityNumber: "/personality_number",
  ExpressionNumber: "/expression_number",
  SoulUrgeNumber: "/soul_urge_number",
  ChallengeNumbers: "/challenge_numbers",
  SubConsciousSelfNumber: "/sub_conscious_self_number",
  PersonalDayPrediction: "/personal_day_prediction",
  PersonalMonthPrediction: "/personal_month_prediction",
  PersonalYearPrediction: "/personal_year_prediction",

  // --- Personality & Compatibility ---
  PersonalityReportTropical: "/personality_report/tropical",
  RomanticPersonalityReportTropical: "/romantic_personality_report/tropical",
  FriendshipReportTropical: "/friendship_report/tropical",
  RomanticForecastReportTropical: "/romantic_forecast_report/tropical",
  KarmaDestinyReport: "/karma_destiny_report",
  SynastryHoroscope: "/synastry_horoscope",
  CompositeHoroscope: "/composite_horoscope",

  // --- Other ---
  TarotPredictions: "/tarot_predictions",
  YesNoTarot: "/yes_no_tarot",
  ChineseZodiac: "/chinese_zodiac",
  ChineseYearForecast: "/chinese_year_forecast",
};
