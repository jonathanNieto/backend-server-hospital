/* Requires: importación de bibliotecas de terceros o personalizadas */
var express = require('express');
var mongoose = require('mongoose');


/* Inicializar variables */
var app = express();

/* conexion a la base de datos */
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {
    if (error) {
        throw error;
    }
    console.log('DB online: \x1b[32m%s\x1b[0m', 'online');
});


/* rutas */
app.get('/', (request, response, next) => {
    response.status(200).json({
        OK: true,
        msg: 'correctly accomplished request'
    })
})

/* escuchar peticiones */
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});