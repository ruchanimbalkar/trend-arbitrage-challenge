import client from "./models/trend.js";

//Helper Functions:
//getAllUsers()
const getAllTrends = async () => {
  //Get trends from mongoDb
  const results = await client
    .db("emerging_trends")
    .collection("hackerNewsTrends");
  if (results) {
    console.log("Found all trends : ");
    return results;
  } else {
    console.log("No trends found");
  }
};

export default getAllTrends;
