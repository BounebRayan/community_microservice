const db = require('../database/connexion'); // Adjust the path if necessary

const reactMessage = async (messageId, reaction, username) => {
    try {
        await db.collection('messages').updateOne(
            { _id: messageId },
            { $push: { reactions: { reaction, username } } }
        );
    } catch (error) {
        console.error('Error reacting to message:', error);
        throw new Error('Reaction failed');
    }
};

module.exports = reactMessage;
