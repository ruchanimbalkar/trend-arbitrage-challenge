import client from "../models/trend.js";
import calculateTrends from "../services/scoring.js";
//Helper Functions:
const getLatestData = async () => {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  //Get data from db
  const distinctDocs = await client
    .db("emerging_trends")
    .collection("trends")
    .aggregate([
      {
        $group: {
          _id: "$title", // Group by the title field
          doc: { $first: "$$ROOT" }, // Keep the first full document found for each title
        },
      },
      {
        $replaceRoot: { newRoot: "$doc" }, // Flatten the result so it looks like a normal document
      },
    ])
    .toArray(); // .aggregate() DOES require .toArray()

  //print on console
  console.log("rawData", distinctDocs);
  // process the data
  const processedData = await calculateTrends(distinctDocs);

  return processedData;
};

export default getLatestData;
