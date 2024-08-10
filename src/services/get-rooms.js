
const connectToDatabase = require('../config/databaseConfig');
async function getUserRooms(userId) {
    const { db } = await connectToDatabase();
    try {
        const user = await db.collection('user_rooms').findOne({ userId });
        if (user && user.rooms) {return user.rooms}
        return []; // Return an empty array if the user has no rooms
    } catch (error) {
        console.error('Error fetching user rooms:', error);
        throw error;
    }
}


module.exports = getUserRooms;