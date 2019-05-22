var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var User = require('../models/user');

/* rutas */

/* get all users */
app.get('/', (request, response, next) => {

    var offset = request.query.offset || 0;
    offset = Number(offset);
    offset = (typeof Number(offset) === 'number') ? offset : 0;

    User.find({}, 'name lastname email img role google')
        .skip(offset)
        .limit(5)
        .exec(
            (error, users) => {
                if (error) {
                    return response.status(500).json({
                        OK: false,
                        msg: 'error loading users',
                        errors: error
                    });
                }
                User.countDocuments({}, (error, count) => {
                    if (error) {
                        return response.status(500).json({
                            OK: false,
                            msg: 'error loading users - count',
                            errors: error
                        });
                    }
                    response.status(200).json({
                        OK: true,
                        length: count,
                        users: users,
                    });
                });

            })
});

/* create a new user */
app.post('/', (request, response, next) => {
    var body = request.body;
    var user = new User({
        name: body.name,
        lastname: body.lastname,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });

    user.save((error, userSaved) => {
        if (error) {
            return response.status(400).json({
                OK: false,
                msg: 'error creating an user',
                errors: error
            });
        }
        userSaved.password = ':(';
        response.status(200).json({
            OK: true,
            user: userSaved,
            userToken: request.user
        });
    });
});

/* update an user */
app.put('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyRoleOrSameUser], (request, response, next) => {
    var id = request.params.id;
    var body = request.body;
    User.findById(id, (error, user) => {
        if (error) {
            return response.status(500).json({
                OK: false,
                msg: 'error finding an user',
                errors: error
            });
        }
        if (!user) {
            return response.status(400).json({
                OK: false,
                msg: `user with id: ${id} does not exist`,
                errors: { message: 'user does not exist' }
            });
        }
        user.name = body.name;
        user.lastname = body.lastname;
        user.email = body.email;
        user.role = body.role;

        user.save((error, userUpdated) => {
            if (error) {
                return response.status(400).json({
                    OK: false,
                    msg: 'Error al actualizar usuario',
                    errors: error
                });
            }
            userUpdated.password = ':)';
            response.status(200).json({
                OK: true,
                user: userUpdated
            })
        });
    });
});

/* delete an user by id*/
app.delete('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyRole], (request, response, next) => {
    var id = request.params.id;

    User.findByIdAndRemove(id, (error, userDeleted) => {
        if (error) {
            return response.status(500).json({
                OK: false,
                msg: 'Error al borrar usuario',
                errors: error
            });
        }

        if (!userDeleted) {
            return response.status(400).json({
                OK: false,
                msg: `user with id: ${id} does not exist`,
                errors: { message: 'user does not exist' }
            });
        }

        response.status(200).json({
            OK: true,
            user: userDeleted
        })
    });
});

module.exports = app;