const connectToDatabase = require('../config/databaseConfig');
async function deleteUserRoom(userId, room) {
    const { db } = await connectToDatabase();
    try {
        await db.collection('user_rooms').updateOne(
            { userId },
            { $pull: { rooms: room } } // Remove the room from the rooms array
        );
    } catch (error) {
        console.error('Error deleting user room:', error);
        throw error;
    }
}

module.exports = deleteUserRoom;