const connectToDatabase = require('../config/databaseConfig');
const { ObjectId } = require('mongodb');


const reactMessage = async (messageId, userId, reaction, username) => {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('messages');
        const Id = new ObjectId(messageId);

        const res = await collection.updateOne(
            { _id: Id },
            { $push: { reactions: { reaction, username, userId } } }
        );
    } catch (error) {
        console.error('Error reacting to message:', error);
        //throw new Error('Reaction failed');
    }
};

module.exports = reactMessage;
