const { MongoClient } = require('mongodb');

const dbUrl = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB_NAME;

let dbInstance = null;

if (!dbUrl || !dbName) {
  throw new Error('Please define the MONGODB_URL and MONGODB_DB_NAME environment variables.');
}

const client = new MongoClient(dbUrl);

async function connectToDatabase() {
  if (dbInstance) {
    return dbInstance;
  }
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log('Successfully connected to database');
    dbInstance = { db, client };
    return dbInstance;
  } catch (error) {
    console.error('Error connecting to database', error);
    throw error;
  }
}

module.exports = connectToDatabase;
