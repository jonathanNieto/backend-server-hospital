var express = require('express');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Hospital = require('../models/hospital');

/* get all hospitals via offset */
app.get('/', (request, response) => {
    var offset = request.query.offset || 0;
    offset = Number(offset);
    offset = (typeof Number(offset) === 'number') ? offset : 0;

    Hospital.find({})
        .skip(offset)
        .limit(5)
        .populate({ path: 'user', select: 'name lastname email' })
        .exec(
            (error, hospitals) => {
                if (error) {
                    return response.status(500).json({
                        OK: false,
                        msg: 'error loading hospitals',
                        errors: error
                    });
                }
                Hospital.estimatedDocumentCount({}, (error, count) => {
                    if (error) {
                        return response.status(500).json({
                            OK: false,
                            msg: 'error loading hospitals - counting',
                            errors: error
                        });
                    }
                    response.status(200).json({
                        OK: true,
                        length: count,
                        hospitals: hospitals,
                    });
                });
            }
        );
});

/* get all hospitals */
app.get('/all', (request, response) => {

    Hospital.find({})
        .populate({ path: 'user', select: 'name lastname email' })
        .exec(
            (error, hospitals) => {
                if (error) {
                    return response.status(500).json({
                        OK: false,
                        msg: 'error loading hospitals',
                        errors: error
                    });
                }
                Hospital.estimatedDocumentCount({}, (error, count) => {
                    if (error) {
                        return response.status(500).json({
                            OK: false,
                            msg: 'error loading hospitals - counting',
                            errors: error
                        });
                    }
                    response.status(200).json({
                        OK: true,
                        length: count,
                        hospitals: hospitals,
                    });
                });
            }
        );
});

/* get one hospital */
app.get('/:id', (request, response) => {
    var id = request.params.id;
    Hospital.findById(id)
        .populate({ path: 'user', select: 'name lastname email' })
        .exec(
            (error, hospital) => {
                if (error) {
                    return response.status(500).json({
                        OK: false,
                        msg: 'error finding hospital',
                        errors: error
                    });
                }
                if (!hospital) {
                    return response.status(400).json({
                        OK: false,
                        msg: `error finding hospital, id: ${id} does not exist`,
                        errors: { message: 'hospital does not exist' }
                    });
                }
                response.status(200).json({
                    OK: true,
                    hospital: hospital,
                });
            }
        );
});

/* create a new hospital */
app.post('/', mdAuthentication.verifyToken, (request, response) => {
    var body = request.body;
    var hospital = new Hospital({
        name: body.name,
        user: request.user._id
    });

    hospital.save((error, hospitalSaved) => {
        if (error) {
            return response.status(400).json({
                OK: false,
                msg: 'error creating a hospital',
                errors: error
            });
        }

        response.status(200).json({
            OK: true,
            hospital: hospitalSaved
        });
    });
});

/* update a hospital */
app.put('/:id', mdAuthentication.verifyToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;
    Hospital.findById(id, (error, hospital) => {
        if (error) {
            return response.status(500).json({
                OK: false,
                msg: 'error finding an user',
                errors: error
            });
        }

        if (!hospital) {
            return response.status(400).json({
                OK: false,
                msg: `hospital with id: ${id} does not exist`,
                errors: { message: 'hospital does not exist' }
            });
        }

        hospital.name = body.name;
        hospital.user = request.user._id;

        hospital.save((error, hospitalUpdated) => {
            if (error) {
                return response.status(400).json({
                    OK: false,
                    msg: 'Error updating hospital',
                    errors: error
                });
            }

            response.status(200).json({
                OK: true,
                hospital: hospitalUpdated
            });
        });
    });
});

/* delete an user by id */
app.delete('/:id', mdAuthentication.verifyToken, (request, response) => {
    var id = request.params.id;

    Hospital.findByIdAndRemove(id, (error, hospitalDeleted) => {
        if (error) {
            return response.status(500).json({
                OK: false,
                msg: 'Error deleting hospital',
                errors: error
            });
        }

        if (!hospitalDeleted) {
            return response.status(400).json({
                OK: false,
                msg: `hospital with id: ${id} does not exist`,
                errors: error
            });
        }

        response.status(200).json({
            OK: true,
            hospital: hospitalDeleted
        });
    });
});
module.exports = app;