var express = require('express');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

//==========================================================
// Obtener todos los usuarios
//==========================================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo)=>{
                    
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });

            });
});
//==========================================================
// Validar Token
//==========================================================
// Forma para bloquear todas las peticiones debajo de esta.
//==========================================================
// app.use('/', (req, res, next)=>{
//     var token = req.query.token;

//     jwt.verify(token, SEED, (err, decoded)=>{
//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: 'Token no válido.',
//                 errors: err
//             });
//         }

//         next();
//     });
// });

//==========================================================
// Actualizar usuario
//==========================================================
app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaUsuarioOAdministrador], (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe.',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        if (body.nombre) {
            usuario.nombre = body.nombre;
        }
        if (body.email) {
            usuario.email = body.email;
        }
        if (body.role) {
            usuario.role = body.role;
        }

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario.',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });
});

//==========================================================
// Crear usuario
//==========================================================
app.post('/', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin], (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});

//==========================================================
// Borrar un usuario por el id
//==========================================================

app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin], (req, res)=>{
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: {message: 'No existe un usuario con ese ID'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});

module.exports = app;