var express = require('express');
var app = express();


/* rutas */
app.get('/', (request, response, next) => {
    response.status(200).json({
        OK: true,
        msg: 'correctly accomplished request'
    })
});

module.exports = app;