// server/services/harper-save-message.js
const connectToDatabase = require('../config/databaseConfig');

async function saveMessage(userId, message, username, room, createdtime) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('messages');

    const result = await collection.insertOne({
      userId,
      message,
      username,
      room,
      createdtime
    });

    return result.insertedId;
  } catch (error) {
    console.error('Error saving message to MongoDB:', error);
    //throw error;
  }
}

module.exports = saveMessage;
