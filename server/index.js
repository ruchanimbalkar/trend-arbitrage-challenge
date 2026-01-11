// import statements
import "dotenv/config";
// the framework that lets us build webservers
import express from "express";
//import hackernews.js
import storeNewsFromHacker from "./services/sources/hackernews.js";
//import lobster.js
import storeDataFromLobster from "./services/sources/lobster.js";
import client from "./models/trend.js";
import storeDataFromReddit from "./services/sources/reddit.js";
//Helper Functions for API
import getLatestTrends from "./routes/trends.js";

//First start the server
const app = express();
const port = 3000;
app.use(express.json());

const startServer = async () => {
  app.listen(port, () => {
    console.log(`Server is listening on port #${port}`);
  }); //this method is turning on our server

  app.get("/", (req, res) => {
    res.send("Hi, Server is ON!");
  });

  //Client should be connected before running the operations
  await client.connect();
};

startServer();
// Connect to the database and store API data :
const main = async () => {
  try {
    const hackerNewsArray = await storeNewsFromHacker();
    //Store fresh hacker news data in collection
    await createCollection(client, hackerNewsArray);
    const lobsterData = await storeDataFromLobster();
    //console.log("lobsterData", lobsterData);
    //Then store lobster data in collection
    await createCollection(client, lobsterData);
    const redditData = await storeDataFromReddit();
    //Then store reddit data in collection
    await createCollection(client, redditData);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

// Call main function, that connects to the database and stores data
main().catch(console.error);

// (CRUD) Create collection
const createCollection = async (client, dataArray) => {
  const results = await client
    .db("emerging_trends")
    .collection("trends")
    .insertMany(dataArray);
  console.log(
    `# of records created : ${results.insertedCount} in trends collection`
  );
  console.log("inserted ids : ", results.insertedIds);
};

//API endpoints

//	GET	get-latest-trends
app.get("/get-latest-trends", async (req, res) => {
  //call helper function
  try {
    let trends = await getLatestTrends();
    res.json(trends);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
