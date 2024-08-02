const connectToDatabase = require('../database/connexion');

async function getMessages(room) {
  try {
    const { db, client } = await connectToDatabase();
    const collection = db.collection('messages');

    const messages = await collection.find({ room })
      .sort({ __createdtime__: -1 })
      .limit(100)
      .toArray();

    return messages;
  } catch (error) {
    console.error('Error fetching messages from MongoDB:', error);
    throw error;
  }
}

module.exports = getMessages;
