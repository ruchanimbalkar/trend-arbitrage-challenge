// import statements
import "dotenv/config";
import mongoose from "mongoose";
import storeNewsFromHacker from "./services/sources/hackernews.js";
//Importing all of our node modules
import express from "express"; // the framework that lets us build webservers
//Import Mongoclient
import { MongoClient } from "mongodb";

//Declare a variable named app and call the express() function to create a new instance of express so we can use all of the methods, fucntions, properties of express
// which will be saved in app
const app = express(); // this gives us access to all of Express's functions, methods, useful superpowers

//Defining out port number
//What port should our server listen to?
const port = 3000; // you can use any port # but developers commonly use 3000. also there are some port numbers you cannot use

//Declaring that this server will be receiving and responding to requests in JSON
app.use(express.json()); // this server will receive and respond to requests with JSON data

//Turn on our server so that it can listen for requests and respond to those requests at our port #
//Hello you are on , listen to requests and respond to those requests
app.listen(port, () => {
  console.log(`Server is listening on port #${port}`);
}); //this method is turning on our server

app.get("/", (req, res) => {
  res.send("Hi, Server is ON!");
});

// Connect to the database :

const main = async () => {
  const uri = process.env.MONGODB_URI;

  const client = new MongoClient(uri);

  try {
    const hackerNewsArray = await storeNewsFromHacker();
    await client.connect();
    //Store fresh hacker news data in collection
    await createCollection(client, hackerNewsArray);

    //await listDatabases(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

// Call main function, that connects to the database and lists it
main().catch(console.error);

// (CRUD) Create collection
const createCollection = async (client, hackerNewsArray) => {
  const results = await client
    .db("hacker_news")
    .collection("hackersNewsTrends")
    .insertMany(hackerNewsArray);
  console.log(`# of listings created : ${results.insertedCount}`);
  console.log("inserted ids : ", results.insertedIds);
};

//Get a list of database - test function to find databases in the cluster
const listDatabases = async (client) => {
  const databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach((db) => {
    console.log(`-${db.name}`);
  });
};
