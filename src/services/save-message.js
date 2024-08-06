// server/services/harper-save-message.js
const connectToDatabase = require('../database/connexion');

async function saveMessage(message, username, room, __createdtime__) {
  try {
    const { db, client } = await connectToDatabase();
    const collection = db.collection('messages');

    const result = await collection.insertOne({
      message,
      username,
      room,
      __createdtime__
    });

    return result.insertedId;
  } catch (error) {
    console.error('Error saving message to MongoDB:', error);
    //throw error;
  }
}

module.exports = saveMessage;
