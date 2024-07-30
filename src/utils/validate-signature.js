const jwt = require('jsonwebtoken');

module.exports.ValidateSignature = async (socket) => {
    try {
      const token = socket.handshake.headers.authorization.substring(7);
      console.log(token);
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      socket.decoded = decoded;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
};