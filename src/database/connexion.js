const { MongoClient } = require('mongodb');

const dbUrl = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB_NAME;

if (!dbUrl || !dbName) {
  throw new Error('Please define the MONGODB_URL and MONGODB_DB_NAME environment variables.');
}

const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log('Successfully connected to database');
    return { db, client };
  } catch (error) {
    console.error('Error connecting to database', error);
    throw error;
  }
}

module.exports = connectToDatabase;
