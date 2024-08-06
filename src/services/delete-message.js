const connectToDatabase = require('../database/connexion');
const { ObjectId } = require('mongodb');

async function editMessage(messageId) {
  try {
    const { db, client } = await connectToDatabase();
    const collection = db.collection('messages');
    const id = new ObjectId(messageId);

    // ! need to fetch user than confirm it's the owner using the token userid
    await collection.deleteOne(
        { _id: id });

    //client.close();
  } catch (error) {
    console.error('Error fetching messages from MongoDB:', error);
    //throw error;
  }
}

module.exports = editMessage;
