var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

/* searching  via collection */
app.get('/collection/:table/:search', (request, response, next) => {

    var table = request.params.table;
    var search = request.params.search;
    var regex = new RegExp(search, 'i');
    var promise;
    switch (table) {
        case 'hospitals':
            promise = searchHospitals(regex);
            break;
        case 'doctors':
            promise = searchDoctors(regex);
            break;
        case 'users':
            promise = searchUsers(regex);
            break;

        default:
            return response.status(400).json({
                OK: true,
                msg: `Collection: ${table} does not exist`,
                errors: { message: `Collection does not exist` },
            });
            break;
    }

    promise.then((data) => {
        response.status(200).json({
            OK: true,
            [table]: data,
        });
    });
});

/* searching  hospital collection */
app.get('/hospital/:search', (request, response, next) => {

    var search = request.params.search;
    var regex = new RegExp(search, 'i');

    searchHospitals(regex)
        .then((hospitals) => {
            response.status(200).json({
                OK: true,
                hospitals: hospitals,
            });
        });
});

/* searching  doctor collection */
app.get('/doctor/:search', (request, response, next) => {

    var search = request.params.search;
    var regex = new RegExp(search, 'i');

    searchDoctors(regex)
        .then((doctors) => {
            response.status(200).json({
                OK: true,
                doctors: doctors,
            });
        });
});

/* searching  user collection */
app.get('/user/:search', (request, response, next) => {

    var search = request.params.search;
    var regex = new RegExp(search, 'i');

    searchUsers(regex)
        .then((users) => {
            response.status(200).json({
                OK: true,
                users: users,
            });
        });
});

/* searching in all collections */
app.get('/all/:search', (request, response, next) => {

    var search = request.params.search;
    var regex = new RegExp(search, 'i');

    Promise.all([searchHospitals(regex), searchDoctors(regex), searchUsers(regex)])
        .then((data) => {
            response.status(200).json({
                OK: true,
                hospitals: data[0],
                doctors: data[1],
                users: data[2],
            });
        });
});

function searchHospitals(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex })
            .populate({ path: 'user', select: 'name lastname email img' })
            .exec(
                (error, hospitals) => {
                    if (error) {
                        reject('Error loading hospitals', error);
                    } else {
                        resolve(hospitals);
                    }
                });
    });
}

function searchDoctors(regex) {
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regex })
            .populate({ path: 'user', select: 'name lastname email img' })
            .populate({ path: 'hospital', select: 'name' })
            .exec(
                (error, doctors) => {
                    if (error) {
                        reject('Error loading doctors', error);
                    } else {
                        resolve(doctors);
                    }
                });
    });
}

/* make searches with name or email */
function searchUsers(regex) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name lastname email img')
            .or([
                { name: regex },
                { email: regex }])
            .exec((error, users) => {
                if (error) {
                    reject('Error loading users', error);
                } else {
                    resolve(users);
                }
            });
    });
}

module.exports = app;