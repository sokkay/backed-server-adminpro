var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValido = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = Schema({
    nombre: {type: String, require: [true, 'El nombre es necesario']},
    email: {type: String, unique: true, require: [true, 'El email es necesario']},
    password: {type: String, require: [true, 'La contraseña es necesaria']},
    img: {type: String, require: false},
    role: {type: String, require: true, default: 'USER_ROLE', enum: rolesValido},
    google: {type: Boolean, default: false}
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);