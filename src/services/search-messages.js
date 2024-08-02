const room = require('../models/Room');

const searchMessages = async (room, searchTerm) => {
    try {
        const roomData = await room.findOne({ name: room });
        if (!roomData) throw new Error('Room not found');
        
        const messages = roomData.messages.filter(message =>
            message.content.includes(searchTerm)
        );
        return messages;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = searchMessages;

