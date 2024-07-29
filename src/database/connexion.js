const { MongoClient } = require('mongodb');

const dbUrl = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB_NAME;

if (!dbUrl || !dbName) {
  throw new Error('Please define the MONGODB_URL and MONGODB_DB_NAME environment variables.');
}

const client = new MongoClient(dbUrl);

async function connectToDatabase() {

  await client.connect();
  const db = client.db(dbName);
  return { db, client };
}

module.exports = connectToDatabase;
