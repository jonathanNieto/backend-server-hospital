var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');

app.post('/', (request, response, next) => {

    var body = request.body;

    User.findOne({ email: body.email }, (error, userDB) => {
        if (error) {
            return response.status(500).json({
                OK: false,
                msg: 'Error finding user',
                errors: error
            })
        }
        if (!userDB) {
            return response.status(400).json({
                OK: false,
                msg: 'Wrong credentials - email',
                errors: error
            });
        }
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return response.status(400).json({
                OK: false,
                msg: 'Wrong credentials - password',
                errors: error
            });
        }

        userDB.password = ':)';
        /* create token */
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 144000 }); //40 hours

        response.status(200).json({
            OK: true,
            user: userDB,
            token: token,
            id: userDB.id
        });
    });
});

module.exports = app;