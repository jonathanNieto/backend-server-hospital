var express = require('express');
var app = express();

const path = require('path');
const fs = require('fs');


/* rutas */
app.get('/:collection/:img', (request, response, next) => {

    var collection = request.params.collection;
    var img = request.params.img;

    var pathImage = path.resolve(__dirname, `../uploads/${collection}/${img}`);

    if (fs.existsSync(pathImage)) {
        response.sendFile(pathImage);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        response.sendFile(pathNoImage);
    }
});

module.exports = app;