/* Requires: importación de bibliotecas de terceros o personalizadas */
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


/* Inicializar variables */
var app = express();

/* body parser */
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


/* importar rutas */
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var doctorRoutes = require('./routes/doctor');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/images');

/* conexion a la base de datos */
/* mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {
    if (error) {
        throw error;
    }
    console.log('DB online: \x1b[32m%s\x1b[0m', 'online');
}); */

mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true, useCreateIndex: true }, (mongoError) => {
    if (mongoError) {
        throw mongoError;
    }
    console.log('DB online: \x1b[32m%s\x1b[0m', 'online');
});


/* solo es una prueba despues lo tengo que quitar */
/* var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads')); */

/* rutas */
app.use('/user', userRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/doctor', doctorRoutes);
app.use('/login', loginRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagesRoutes);
app.use('/', appRoutes);

/* escuchar peticiones */
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});