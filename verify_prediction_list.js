const axios = require("axios");

async function testMatchPredictionList() {
  const url =
    "http://localhost:3000/api/Calculate/MatchReport/Location/Surat,%20Gujarat,%20India/Time/18:30/08/02/2026/+05:30/Location/Kentucky,%20United%20States/Time/07:32/12/02/1998/-05:43";

  try {
    console.log(`Testing Prediction List...`);
    const response = await axios.get(url);

    const data = response.data;
    if (
      data.Payload &&
      data.Payload.MatchReport &&
      data.Payload.MatchReport.PredictionList
    ) {
      console.log("Prediction List Items:");
      data.Payload.MatchReport.PredictionList.forEach((item, index) => {
        console.log(
          `${index + 1}. ${item.Name} - Nature: ${item.Nature}, Info: ${item.Info}`,
        );
      });
    } else {
      console.log("PredictionList not found in response");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message,
    );
  }
}

testMatchPredictionList();
