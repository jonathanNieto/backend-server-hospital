var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

/* models */
var User = require('../models/user');
var Doctor = require('../models/doctor');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

/* rutas */
app.put('/:collection/:id', (request, response, next) => {
    var id = request.params.id;
    var collection = request.params.collection;

    if (!request.files) {
        return response.status(400).json({
            OK: false,
            msg: 'No files to upload',
            errors: { message: 'nothing to upload, you have to choose an image to upload' }
        });
    }

    /* get filename */
    var filename = request.files.image;
    var arrayName = filename.name.split('.');
    var fileExt = arrayName[arrayName.length - 1];

    /* we accept only next collections*/
    var allowedColections = ['hospitals', 'doctors', 'users'];

    if (allowedColections.indexOf(collection) < 0) {
        return response.status(400).json({
            OK: false,
            msg: 'collection no allowed',
            errors: { message: 'Allowed collections are: ' + allowedColections.join(', ') }
        });
    }

    /* we accept only next ext*/
    var allowedExts = ['png', 'jpg', 'jpeg', 'gif'];

    if (allowedExts.indexOf(fileExt) < 0) {
        return response.status(400).json({
            OK: false,
            msg: 'file ext no allowed',
            errors: { message: 'Allowed exts are: ' + allowedExts.join(', ') }
        });
    }

    /* custom filename */
    var customFilename = `${id}-${new Date().getMilliseconds()}.${fileExt}`;

    // Use the mv() method to place the file somewhere on your server
    var path = `./uploads/${collection}/${customFilename}`;

    filename.mv(path, (error) => {
        if (error) {
            return response.status(500).json({
                OK: false,
                msg: 'Error moving file',
                errors: error
            });
        }

        uploadByCollection(collection, id, customFilename, response);


    });

});

function uploadByCollection(collection, id, customFilename, response) {
    if (collection === 'users') {
        User.findById(id, (error, user) => {
            if (error) {
                return response.status(500).json({
                    OK: false,
                    msg: 'an error has happened - finding',
                    errors: error
                });
            }

            if (user === null) {
                return response.status(404).json({
                    OK: false,
                    msg: `user with id: ${id} does not exist`,
                    errors: { message: 'user does not exist' }
                });
            }

            var oldPath = './uploads/users/' + user.img;
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (error) => {
                    if (error) {
                        throw error;
                    }
                    console.log('successfully deleted \x1b[41m%s\x1b[0m', oldPath);
                });
            }

            user.img = customFilename;

            user.save((error, userUpdated) => {
                if (error) {
                    return response.status(500).json({
                        OK: false,
                        msg: 'an error has happened - saving',
                        errors: error
                    });
                }
                userUpdated.password = ':(';
                return response.status(200).json({
                    OK: true,
                    msg: 'image successfully uploaded',
                    user: userUpdated
                });
            });
        });
    }
    if (collection === 'doctors') {
        Doctor.findById(id, (error, doctor) => {
            if (error) {
                return response.status(500).json({
                    OK: false,
                    msg: 'an error has happened - finding',
                    errors: error
                });
            }

            if (doctor === null) {
                return response.status(400).json({
                    OK: false,
                    msg: `doctor with id: ${id} does not exist`,
                    errors: { message: 'doctor does not exist' }
                });
            }

            var oldPath = './uploads/doctors/' + doctor.img;
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (error) => {
                    if (error) {
                        throw error;
                    }
                    console.log('successfully deleted \x1b[41m%s\x1b[0m', oldPath);
                });
            }

            doctor.img = customFilename;

            doctor.save((error, doctorUpdated) => {
                if (error) {
                    return response.status(500).json({
                        OK: false,
                        msg: 'an error has happened - saving',
                        errors: error
                    });
                }
                return response.status(200).json({
                    OK: true,
                    msg: 'image successfully uploaded',
                    doctor: doctorUpdated
                });
            });
        });
    }
    if (collection === 'hospitals') {
        Hospital.findById(id, (error, hospital) => {
            if (error) {
                return response.status(500).json({
                    OK: false,
                    msg: 'an error has happened - finding',
                    errors: error
                });
            }

            if (hospital === null) {
                return response.status(400).json({
                    OK: false,
                    msg: `hospital with id: ${id} does not exist`,
                    errors: { message: 'hospital does not exist' }
                });
            }

            var oldPath = './uploads/hospitals/' + hospital.img;
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (error) => {
                    if (error) {
                        throw error;
                    }
                    console.log('successfully deleted \x1b[41m%s\x1b[0m', oldPath);
                });
            }

            hospital.img = customFilename;

            hospital.save((error, hospitalUpdated) => {
                if (error) {
                    return response.status(500).json({
                        OK: false,
                        msg: 'an error has happened - saving',
                        errors: error
                    });
                }
                return response.status(200).json({
                    OK: true,
                    msg: 'image successfully uploaded',
                    hospital: hospitalUpdated
                });
            });
        });
    }
}

module.exports = app;