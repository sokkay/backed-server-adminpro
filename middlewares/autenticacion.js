var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

//==========================================================
// Validar Token
//==========================================================
exports.verificaToken = function (req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no válido.',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
};

//==========================================================
// Validar Admin
//==========================================================
exports.verificaAdmin = function (req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no válido.',
            errors: err
        });
    }
};
//==========================================================
// Validar Usuario
//==========================================================
exports.verificaUsuarioOAdministrador = function (req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no válido.',
            errors: err
        });
    }
};