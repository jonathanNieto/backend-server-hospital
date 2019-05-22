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

/* verify admin role */
exports.verifyRole = function (request, response, next) {
    var user = request.user;
    if (user.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return response.status(401).json({
            OK: false,
            msg: 'invalid role',
            errors: {message: 'You are not an admin'}
        });
    }
}

/* verify admin role or same user */
exports.verifyRoleOrSameUser = function (request, response, next) {
    var user = request.user;
    var id = request.params.id;
    if (user.role === 'ADMIN_ROLE' || user._id === id) {
        next();
        return;
    } else {
        return response.status(401).json({
            OK: false,
            msg: 'invalid user',
            errors: {message: 'You are not this user or you do not have an admin role'}
        });
    }
}