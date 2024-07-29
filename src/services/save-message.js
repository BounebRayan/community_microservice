// server/services/harper-save-message.js
const connectToDatabase = require('../database/connexion');

async function saveMessage(message, username, room) {
  try {
    const { db, client } = await connectToDatabase();
    const collection = db.collection('messages');

    const result = await collection.insertOne({
      message,
      username,
      room,
      createdAt: new Date(), // Optionally add a timestamp
    });

    return result.insertedId;
  } catch (error) {
    console.error('Error saving message to MongoDB:', error);
    throw error;
  }
}

module.exports = saveMessage;
