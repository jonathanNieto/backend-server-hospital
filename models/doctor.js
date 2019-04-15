var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var doctorSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es requerido'] },
    lastname: { type: String, required: [true, 'Los apellidos son requeridos'] },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'El hospital es requerido'] },
});

module.exports = mongoose.model('Doctor', doctorSchema);
