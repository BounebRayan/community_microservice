const connectToDatabase = require('../config/databaseConfig');
const { ObjectId } = require('mongodb');

async function editMessage(messageId, newMessage, userId) {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('messages');
        const id = new ObjectId(messageId);

        // Fetch the message to confirm ownership
        const message = await collection.findOne({ _id: id });

        if (!message) {
            throw new Error('Message not found');
        }

        if (message.userId !== userId) {
            throw new Error('User not authorized to edit this message');
        }

        const res = await collection.updateOne(
            { _id: id },
            { $set: { message: newMessage } }
        );

        return res;
    } catch (error) {
        console.error('Error editing message in MongoDB:', error);
        throw error;
    }
}

module.exports = editMessage;
