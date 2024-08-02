const db = require('../database/connexion');

const searchMessages = async (room, searchTerm) => {
    try {
        const results = await db.collection('messages')
            .find({ room: room, message: { $regex: searchTerm, $options: 'i' } })
            .toArray();
        return results;
    } catch (error) {
        console.error('Error searching messages:', error);
        throw error;
    }
};

module.exports = searchMessages;
