import client from "../models/trend.js";

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

export default getLatestTrends;
