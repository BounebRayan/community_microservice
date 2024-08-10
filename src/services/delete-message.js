const connectToDatabase = require('../config/databaseConfig');
const { ObjectId } = require('mongodb');

async function deleteMessage(messageId, userId) {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('messages');
        const id = new ObjectId(messageId);

        // Fetch the message to confirm ownership
        const message = await collection.findOne({ _id: id });
        //console.log(message);

        if (!message) {
            throw new Error('Message not found');
        }

        if (message.userId !== userId) {
            throw new Error('User not authorized to delete this message');
        }

        const res = await collection.deleteOne({ _id: id });

        return res;
    } catch (error) {
        console.error('Error deleting message from MongoDB:', error);
        throw error;
    }
}

module.exports = deleteMessage;
