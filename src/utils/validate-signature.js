const jwt = require('jsonwebtoken');

module.exports.ValidateSignature = async (socket) => {
    try {
      const token = socket.handshake.headers.authorization.substring(7);
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log(decoded);
      socket.decoded = decoded;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
};