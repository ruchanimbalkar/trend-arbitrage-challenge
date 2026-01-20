import client from "../models/trend.js";
import calculateTrends from "../services/scoring.js";
//Helper Functions:
const getLatestData = async () => {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  //Get data from db
  const rawData = await client
    .db("emerging_trends")
    .collection("trends")
    .find({})
    .toArray();

  // process the data
  const processedData = await calculateTrends(rawData);

  return processedData;
};

export default getLatestData;
