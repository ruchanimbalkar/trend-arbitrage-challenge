// import statements
import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
//import hackernews.js
import storeNewsFromHacker from "./services/sources/hackernews.js";
//import lobster.js
import getDataFromLobster from "./services/sources/lobster.js";
//Importing all of our node modules
// the framework that lets us build webservers
import client from "./models/trend.js";
import storeDataFromReddit from "./services/sources/reddit.js";
import apiEndPoints from "../routes/trends.js";

//First start the server
const app = express();
const port = 3000;
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is listening on port #${port}`);
}); //this method is turning on our server

app.get("/", (req, res) => {
  res.send("Hi, Server is ON!");
});
// Connect to the database and store API data :
const main = async () => {
  try {
    const hackerNewsArray = await storeNewsFromHacker();
    await client.connect();
    //Store fresh hacker news data in collection
    await createCollection(client, hackerNewsArray, "hackerNewsTrends");
    const lobsterData = await getDataFromLobster();
    //console.log("lobsterData", lobsterData);
    //Then store lobster data in collection
    await createCollection(client, lobsterData, "lobsterDataTrends");
    const redditData = await storeDataFromReddit();
    //Then store lobster data in collection
    await createCollection(client, redditData, "redditDataTrends");
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

// Call main function, that connects to the database
main().catch(console.error);

// (CRUD) Create collection
const createCollection = async (client, dataArray, collectionName) => {
  const results = await client
    .db("emerging_trends")
    .collection(collectionName)
    .insertMany(dataArray);
  console.log(
    `# of records created : ${results.insertedCount} in ${collectionName}`
  );
  console.log("inserted ids : ", results.insertedIds);
};

export default app;
