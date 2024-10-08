const jwt = require('jsonwebtoken');

module.exports.ValidateSignature = async (socket) => {
    try {
      const token = socket.handshake.headers.authorization.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      //console.log(decoded);
      socket.user = decoded;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
};