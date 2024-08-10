// server/services/getMessages.js
const connectToDatabase = require('../config/databaseConfig');

async function getMessages(room) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('messages');

    const messages = await collection.find({ room })
      .sort({ createdtime: -1 }) // Sort by createdAt in descending order
      .limit(100) // Limit to 100 messages
      .toArray();

    return messages;
  } catch (error) {
    console.error('Error fetching messages from MongoDB:', error);
    //throw error;
  }
}

module.exports = getMessages;
