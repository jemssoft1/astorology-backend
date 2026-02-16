
import json

def generate_collection():
    collection = {
        "info": {
            "_postman_id": "vedic-astro-api-compatible",
            "name": "Vedic Astrology API (157 Endpoints - Fixed)",
            "description": "High-compatibility collection with string-based URLs. 157 endpoints.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [],
        "variable": [
            {"key": "base_url", "value": "http://localhost:3000"},
            {"key": "access_token", "value": ""},
            {"key": "refresh_token", "value": ""}
        ]
    }

    # Helper to add item
    def add_req(folder_path, name, method, url, body=None, auth=False):
        parts = folder_path.split("/")
        current_level = collection["item"]
        for part in parts:
            found = False
            for item in current_level:
                if item.get("name") == part and "item" in item:
                    current_level = item["item"]
                    found = True
                    break
            if not found:
                new_folder = {"name": part, "item": []}
                current_level.append(new_folder)
                current_level = new_folder["item"]
        
        req = {
            "name": name,
            "request": {
                "method": method,
                "url": url,
            }
        }
        if auth:
            req["request"]["header"] = [{"key": "Authorization", "value": "Bearer {{access_token}}"}]
        if body:
            req["request"]["body"] = {
                "mode": "raw",
                "raw": json.dumps(body),
                "options": {"raw": {"language": "json"}}
            }
        current_level.append(req)

    # 1. Auth & Account (6)
    add_req("01. Auth & Account", "Register", "POST", "{{base_url}}/api/auth/register", {"username": "testuser", "email": "test@vedic.com", "password": "string"})
    add_req("01. Auth & Account", "Login", "POST", "{{base_url}}/api/auth/login", {"username": "testuser", "password": "string"})
    add_req("01. Auth & Account", "Verify Token", "GET", "{{base_url}}/api/auth/verify", auth=True)
    add_req("01. Auth & Account", "Refresh Token", "POST", "{{base_url}}/api/auth/refresh", {"refreshToken": "{{refresh_token}}"})
    add_req("01. Auth & Account", "Change Password", "POST", "{{base_url}}/api/auth/change-password", {"currentPassword": "s", "newPassword": "n"}, auth=True)
    add_req("01. Auth & Account", "Logout", "POST", "{{base_url}}/api/auth/logout")

    # 2. Person (6)
    for op in ["add", "update"]:
        add_req("02. Person Management", f"{op.capitalize()} Person", "POST", f"{{{{base_url}}}}/api/person/{op}", {"ownerId": "101"}, auth=True)
    add_req("02. Person Management", "Delete Person", "DELETE", "{{base_url}}/api/person/delete/101/personId", auth=True)
    add_req("02. Person Management", "List Persons", "GET", "{{base_url}}/api/person/list/101")
    add_req("02. Person Management", "List Persons Hash", "GET", "{{base_url}}/api/person/list-hash/101")
    add_req("02. Person Management", "Get Detail", "GET", "{{base_url}}/api/person/101/personId")

    # 3. Core REST
    common_body = {"year":2000, "month":1, "day":1, "hour":12, "location":{"name":"Delhi"}}
    for r in ["birth-chart", "planets", "houses", "ascendant", "day-night-birth"]:
        add_req("03. Core REST/Astronomy", r.replace("-", " ").capitalize(), "POST", f"{{{{base_url}}}}/api/{r}", common_body)
    add_req("03. Core REST/Astronomy", "Planet in Watery Sign", "POST", "{{base_url}}/api/planet-in-watery-sign", {"planet": "Moon", **common_body})
    add_req("03. Core REST/Astronomy", "Planet Ownership", "POST", "{{base_url}}/api/planet-ownership", {"planet": "Jupiter", **common_body})
    add_req("03. Core REST/Astronomy", "Sign Lord", "POST", "{{base_url}}/api/sign-lord", {"sign": "Leo"})

    for r in ["panchang", "tithi", "nakshatra", "yoga", "karana", "sunrise-sunset"]:
        add_req("03. Core REST/Panchang", r.capitalize(), "POST", f"{{{{base_url}}}}/api/{r}", common_body)

    add_req("03. Core REST/Muhurtha", "Travel Check", "POST", "{{base_url}}/api/muhurtha/travel/check", {"time":{"year":2024}, "person":{}})
    add_req("03. Core REST/Muhurtha", "Direction Check", "POST", "{{base_url}}/api/muhurtha/travel/direction", {"time":{"year":2024}, "direction":"north"})
    add_req("03. Core REST/Muhurtha", "Marriage Check", "POST", "{{base_url}}/api/muhurtha/marriage/check", common_body)

    for r in ["tarabala", "chandrabala", "dasha", "current-dasha", "dasha-balance"]:
        add_req(f"03. Core REST/{'Matching' if 'bala' in r else 'Dasha'}", r.capitalize(), "POST", f"{{{{base_url}}}}/api/{r}", common_body)

    for r in ["planet-strength", "house-lord", "planets-in-house", "planets-aspecting-house"]:
        add_req("03. Core REST/Strength", r.replace("-", " ").capitalize(), "POST", f"{{{{base_url}}}}/api/{r}", common_body)

    # 4. Specialized
    add_req("04. Specialized/Match", "Calculate Match", "POST", "{{base_url}}/api/match/calculate", {"boyTime":{}, "girlTime":{}})
    add_req("04. Specialized/Match", "Find Matches", "GET", "{{base_url}}/api/match/find/101/personId")
    
    for r in ["predict", "events", "current-period"]:
        add_req("04. Specialized/LifePath", r.capitalize(), "POST", f"{{{{base_url}}}}/api/life-path/{r}", common_body)
    add_req("04. Specialized/LifePath", "LifePath Test", "GET", "{{base_url}}/api/life-path/test")

    for v in ["navamsa", "dasamsa", "hora", "drekkana"]:
        add_req("04. Specialized/Varga", v.capitalize(), "POST", f"{{{{base_url}}}}/api/varga/{v}", common_body)
    add_req("04. Specialized/Varga", "Any Division", "POST", "{{base_url}}/api/varga/9", common_body)
    add_req("04. Specialized/Varga", "Planet Position", "POST", "{{base_url}}/api/varga/planet-position", {"planet":"Jupiter", **common_body})

    for a in ["bindu", "sarva", "transit-score", "analysis"]:
        add_req("04. Specialized/Ashtakavarga", a.capitalize(), "POST", f"{{{{base_url}}}}/api/ashtakavarga/{a}", common_body)

    for d in ["timeline", "bhukti-periods", "relationship", "count-from-birth"]:
        add_req("04. Specialized/EnhancedDasha", d.capitalize(), "POST", f"{{{{base_url}}}}/api/enhanced-dasha/{d}", common_body)
    for p in ["next", "previous"]:
        add_req("04. Specialized/EnhancedDasha", f"{p.capitalize()} Planet", "GET", f"{{{{base_url}}}}/api/enhanced-dasha/{p}-planet/Sun")

    # 5. Visuals
    for r in ["generate", "email"]:
        add_req("05. Visuals", f"Events Chart {r.capitalize()}", "POST", f"{{{{base_url}}}}/api/events-chart/{r}", common_body)
    add_req("05. Visuals", "Saved Charts", "GET", "{{base_url}}/api/events-chart/saved/101/personId")
    add_req("05. Visuals", "Get Chart SVG", "GET", "{{base_url}}/api/events-chart/chartId")
    add_req("05. Visuals", "South Indian SVG", "GET", "{{base_url}}/api/Calculate/SouthIndianChart/Location/Delhi/Time/12:00/01/01/2000/+05:30/ChartType/RasiD1")
    add_req("05. Visuals", "North Indian SVG", "GET", "{{base_url}}/api/Calculate/NorthIndianChart/Location/Delhi/Time/12:00/01/01/2000/+05:30/ChartType/NavamshaD9")

    # 6. Unified Calculators (82)
    methods = [
        "AyanamsaDegree", "LocalMeanTime", "SunriseTime", "SunsetTime", "DayDurationHours", "IsDayBirth", "IsNightBirth", "PlanetPosition", "AllHouses", "AscendantLongitude",
        "DayOfWeek", "LordOfWeekday", "NithyaYoga", "Karana", "LunarDay", "Tithi", "Nakshatra", "Panchang", "HoraAtBirth", "RahuKalam", "YamagandaKalam", "PanchaPakshiBirthBird",
        "LagnaSignName", "MoonSignName", "MoonConstellation", "AllPlanetData", "AllHouseData", "BirthVarna", "AtmaKaraka", "IshtaDevata",
        "YoniKutaAnimal", "KutaScore", "MatchReport", "VarnaKuta", "VashyaKuta", "TaraKuta", "YoniKuta", "GrahaMaitriKuta", "GanaKuta", "BhakootKuta", "NadiKuta",
        "KujaDosaScore", "ManglikDosha", "KaalSarpaDosha", "PitraDosha", "MarakaPlanetList", "ShubKartariPlanets", "PaapaKartariPlanets", "ShubKartariHouses", "PaapaKartariHouses",
        "SarvashtakavargaChart", "BhinnashtakavargaChart", "PrastharashtakavargaChart", "BinduPoints", "TransitScore", "PlanetShadbalaPinda", "HouseStrength", "PlanetStrength",
        "HoroscopePredictions", "LifePredictions", "YearlyPredictions", "CurrentDasha", "CurrentMahadasha", "CurrentAntardasha", "CurrentPratyantardasha", "VimshottariDasha", "DashaPeriods", "Antardashas", "Pratyantardashas", "BalanceOfDasha",
        "ShubhMuhurtha", "TravelMuhurtha", "MarriageMuhurtha", "GulikaKalam", "D1Chart", "D9Chart", "D10Chart", "AllVargaCharts", "VargaPosition", "NameNumberPrediction", "SouthIndianChart", "NorthIndianChart"
    ]
    for m in methods:
        url = f"{{{{base_url}}}}/api/Calculate/{m}/Location/Delhi/Time/12:00/01/01/2000/+05:30"
        if m in ["PlanetPosition", "BhinnashtakavargaChart", "BinduPoints"]: url += "/PlanetName/Jupiter"
        if "Chart" in m and m not in ["AllVargaCharts", "VargaPosition"]: url += "/ChartType/RasiD1"
        if m == "NameNumberPrediction": url = "{{base_url}}/api/Calculate/NameNumberPrediction/FullName/John%20Doe"
        add_req("06. Unified Calculators (82)", m, "GET", url)

    # 7. System & Others
    add_req("07. System", "Health Check", "GET", "{{base_url}}/health")
    add_req("07. System", "JS Hash", "GET", "{{base_url}}/api/js-hash")
    add_req("07. System", "Favicon", "GET", "{{base_url}}/api/favicon")
    add_req("07. System", "Home", "GET", "{{base_url}}/api/home")
    add_req("07. System", "Greet", "GET", "{{base_url}}/api/chat/GetChatGreetMessage")
    add_req("07. System", "Slack Msg", "POST", "{{base_url}}/api/chat/Message", {"msgContent":"hello"})
    add_req("07. System", "Error Log", "POST", "{{base_url}}/api/log/error", {"message":"err"})
    add_req("07. System", "Debug Log", "POST", "{{base_url}}/api/log/debug", {"message":"dbg"})
    add_req("07. System", "Birth Time Rectify", "POST", "{{base_url}}/api/birth-time/find/101/personId", {"events":[]})

    with open("Vedic-Astrology-API.postman_collection.json", "w") as f:
        json.dump(collection, f, indent=4)

generate_collection()
print("Successfully generated 157 endpoints.")
