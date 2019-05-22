var express = require('express');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Doctor = require('../models/doctor');

/* get all doctors */
app.get('/', (request, response, next) => {
    var offset = request.query.offset || 0;
    offset = Number(offset);
    offset = (typeof Number(offset) === 'number') ? offset : 0;

    Doctor.find({})
        .skip(offset)
        .limit(5)
        .populate({ path: 'user', select: 'name lastname email' })
        .populate({ path: 'hospital', select: 'name' })
        .exec(
            (error, doctors) => {
                if (error) {
                    return response.status(500).json({
                        OK: false,
                        msg: 'error loading doctors',
                        errors: error
                    });
                }
                Doctor.countDocuments({}, (error, count) => {
                    if (error) {
                        return response.status(500).json({
                            OK: false,
                            msg: 'error loading doctors -counting',
                            errors: error
                        });
                    }
                    response.status(200).json({
                        OK: true,
                        length: count,
                        doctors: doctors,
                    });
                })

            });
});

/* get one doctor */
app.get('/:id', (request, response, next) => {
    var id = request.params.id;
    Doctor.findById(id)
        .populate({ path: 'user', select: 'name lastname email' })
        .populate({ path: 'hospital'})
        .exec(
            (error, doctor) => {
                if (error) {
                    return response.status(500).json({
                        OK: false,
                        msg: 'error finding an doctor',
                        errors: error
                    });
                }

                if (!doctor) {
                    return response.status(400).json({
                        OK: false,
                        msg: `doctor with id: ${id} does not exist`,
                        errors: { message: 'doctor does not exist' }
                    });
                }

                response.status(200).json({
                    OK: true,
                    doctor
                });

            });
});

/* create a new doctor */
app.post('/', mdAuthentication.verifyToken, (request, response, next) => {
    var body = request.body;
    var doctor = new Doctor({
        name: body.name,
        lastname: body.lastname,
        user: request.user._id,
        hospital: body.hospitalId 
    });

    doctor.save((error, doctorSaved) => {
        if (error) {
            return response.status(400).json({
                OK: false,
                msg: 'error creating an doctor',
                errors: error
            });
        }
        response.status(200).json({
            OK: true,
            doctor: doctorSaved,
            doctorToken: request.doctor
        });
    });
});

/* update an doctor */
app.put('/:id', mdAuthentication.verifyToken, (request, response, next) => {
    var id = request.params.id;
    var body = request.body;
    Doctor.findById(id, (error, doctor) => {
        if (error) {
            return response.status(500).json({
                OK: false,
                msg: 'error finding an doctor',
                errors: error
            });
        }

        if (!doctor) {
            return response.status(400).json({
                OK: false,
                msg: `doctor with id: ${id} does not exist`,
                errors: { message: 'doctor does not exist' }
            });
        }

        doctor.name = body.name;
        doctor.lastname = body.lastname;
        doctor.user = request.user._id;
        doctor.hospital = body.hospitalId;

        doctor.save((error, doctorUpdated) => {
            if (error) {
                return response.status(400).json({
                    OK: false,
                    msg: 'Error updating a doctor',
                    errors: error
                });
            }

            response.status(200).json({
                OK: true,
                doctor: doctorUpdated
            })
        });

    });
});

/* delete an doctor by id*/
app.delete('/:id', mdAuthentication.verifyToken, (request, response, next) => {
    var id = request.params.id;

    Doctor.findByIdAndRemove(id, (error, doctorDeleted) => {
        if (error) {
            return response.status(500).json({
                OK: false,
                msg: 'Error deleting a doctor',
                errors: error
            });
        }

        if (!doctorDeleted) {
            return response.status(400).json({
                OK: false,
                msg: `doctor with id: ${id} does not exist`,
                errors: { message: 'doctor does not exist' }
            });
        }

        response.status(200).json({
            OK: true,
            doctor: doctorDeleted
        })
    });
});

module.exports = app;