var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


/* verify token */
exports.verifyToken = function (request, response, next) {
    var token = request.query.token;

    jwt.verify(token, SEED, (error, decoded) => {
        if (error) {
            return response.status(401).json({
                OK: false,
                msg: 'invalid token',
                errors: error
            });
        }
        request.user = decoded.user;
        next();
        /* response.status(200).json({
            OK: true,
            decoded: decoded
        }); */
    });
}