import client from "../models/trend.js";
import calculateTrends from "../services/scoring.js";
//Helper Functions:
//getLatestTrends
const getLatestTrends = async () => {
  console.log("inside function get all trends");
  //check for trends
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  //Get trends
  const results = await client
    .db("emerging_trends")
    .collection("trends")
    .find({})
    .toArray();
  if (results) {
    console.log("Found all trends : ");
    return results;
  } else {
    console.log("No trends found");
  }
};

export const getLatestData = async () => {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  //Get data from db
  const rawData = await client
    .db("emerging_trends")
    .collection("trends")
    .find({})
    .toArray();

  // process it using Gemini API
  const processedData = await calculateTrends(rawData);

  return processedData;
};

export default getLatestTrends;
