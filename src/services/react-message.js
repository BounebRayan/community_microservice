const connectToDatabase = require('../database/connexion');
const { ObjectId } = require('mongodb');


const reactMessage = async (messageId, reaction, username) => {
    try {
        const { db, client } = await connectToDatabase();
        const collection = db.collection('messages');
        const id = new ObjectId(messageId);

        const res= await collection.updateOne(
            { _id: id },
            { $push: { reactions: { reaction, username } } }
        );
    } catch (error) {
        console.error('Error reacting to message:', error);
        throw new Error('Reaction failed');
    }
};

module.exports = reactMessage;
