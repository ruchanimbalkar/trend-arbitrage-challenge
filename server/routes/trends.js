import client from "./models/trend.js";
import app from "../index.js";
const apiEndPoints = () => {
  // API Endpoints

  //	GET	get-latest-trends
  app.get("/get-latest-trends", async (req, res) => {
    //call helper function
    let trends = await getAllTrends();
    res.json(trends);
  });

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
};

export default apiEndPoints;
