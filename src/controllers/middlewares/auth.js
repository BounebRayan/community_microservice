const { ValidateSignature } = require('../../utils/validate-signature');

module.exports = async (socket, next) => {
    const isAuthorized = await ValidateSignature(socket);
    if(isAuthorized){
        return next();
    }
    return next(new Error("NOT AUTHORIZED"));
}