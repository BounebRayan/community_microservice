const connectToDatabase = require('../config/databaseConfig');

async function saveUserRoom(userId, room) {
    const { db } = await connectToDatabase();
    try {
        // Assuming you have a 'user_rooms' collection where you store user rooms
        await db.collection('user_rooms').updateOne(
            { userId },
            { $addToSet: { rooms: room } }, // Add room to the rooms array if it doesn't already exist
            { upsert: true } // Create the document if it doesn't exist
        );
    } catch (error) {
        console.error('Error saving user room:', error);
        throw error;
    }
}


module.exports = saveUserRoom;
