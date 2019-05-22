var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');

var mdAuthentication = require('../middlewares/authentication');

/* rebew token */
app.get('/renewtoken', mdAuthentication.verifyToken , (request, response) => {
    /* create token */
    var token = jwt.sign({ user: request.user }, SEED, { expiresIn: 14400 }); //4 hours
    response.status(200).json({
        OK: true,
        user: request.user,
        token: token
    });
})

/* normmal authentication */
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
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); //4 hours

        response.status(200).json({
            OK: true,
            user: userDB,
            token: token,
            id: userDB.id,
            menu: getMenu(userDB.role)
        });
    });
});


/* google authentication */
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    /* const userid = payload['sub']; */
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    /* console.log({ payload }); */
    return {
        name: payload.given_name,
        lastname: payload.family_name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
/* verify().catch(console.error); */

app.post('/google', async (request, response) => {

    var token = request.body.token;
    var googleUser = await verify(token)
        .catch((error) => {
            return response.status(403).json({
                OK: false,
                msg: 'verify token: Invalid token ---- ' + error
            });
        });

    /* console.log({ googleUser }); */

    User.findOne({ email: googleUser.email }, (error, userDB) => {
        if (error) {
            return response.status(500).json({
                OK: false,
                msg: 'Error finding user',
                errors: error
            })
        }
        if (userDB) {
            if (!userDB.google) {
                return response.status(400).json({
                    OK: false,
                    msg: 'Should use normal authentication',
                });
            } else {
                /* create token */
                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); //4 hours

                response.status(200).json({
                    OK: true,
                    user: userDB,
                    token: token,
                    id: userDB.id,
                    menu: getMenu(userDB.role)
                });
            }
        } else {
            /* user does not exist ... let's create it */
            var user = new User();
            user.name = googleUser.name;
            user.lastname = googleUser.lastname;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':(';

            user.save((error, userSaved) => {
                if (error) {
                    return response.status(400).json({
                        OK: false,
                        msg: 'error creating an user',
                        errors: error
                    });
                }

                /* create token */
                var token = jwt.sign({ user: userSaved }, SEED, { expiresIn: 14400 }); //4 hours

                response.status(200).json({
                    OK: true,
                    user: userSaved,
                    token: token,
                    id: userSaved.id,
                    menu: getMenu(userSaved.role)
                });
            });
        }
    });
});

function getMenu(ROLE) {
    menu = [
        {
            title: 'Principal',
            icon: 'mdi mdi-gauge',
            subMenu: [
                { title: 'Dashborad', url: '/dashboard' },
                { title: 'ProggresBar', url: '/progress' },
                { title: 'Graficas', url: '/graph1' },
                { title: 'Promesas', url: '/promises' },
                { title: 'Rxjs', url: '/rxjs' },
            ]
        },
        {
            title: 'Mantenimientos',
            icon: 'mdi mdi-folder-lock',
            subMenu: [
                /* { title: 'Usuarios', url: '/users' }, */
                { title: 'Hospitales', url: '/hospitals' },
                { title: 'Médicos', url: '/doctors' },
            ]
        }
    ];
    if (ROLE === 'ADMIN_ROLE') {
        menu[1].subMenu.unshift({ title: 'Usuarios', url: '/users' });
    }
    return menu;
}


module.exports = app;