const connectToDatabase = require('../config/databaseConfig');

const searchMessages = async (room, searchTerm) => {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('messages');

        const results = await collection.find({ room: room, message: { $regex: searchTerm, $options: 'i' } })
            .sort({ __createdtime__: -1 })
            .toArray();
    
        return results;
    } catch (error) {
        console.error('Error searching messages:', error);
        //throw error;
    }
};

module.exports = searchMessages;
