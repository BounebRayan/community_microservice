const searchMessagesService = require('../services/search-messages');

async function searchMessages(socket, data) {
    const { room, searchTerm } = data;
    try {
        const results = await searchMessagesService(room, searchTerm);
        socket.emit('search_results', results);
    } catch (error) {
        socket.emit('error', 'Could not perform search');
    }
}

module.exports = searchMessages;
