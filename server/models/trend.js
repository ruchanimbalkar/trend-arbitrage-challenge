// MongoDB Schema
//Import Mongoclient
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

//Get a list of database - test function to find databases in the cluster
const listDatabases = async (client) => {
  const databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach((db) => {
    console.log(`-${db.name}`);
  });
};

await listDatabases(client);

export default client;
