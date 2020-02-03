var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

//==========================================================
// Obtener todos los hospitales
//==========================================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre img email')
        .exec(
        (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: err
            });
        }

        Hospital.count({}, (err, conteo)=>{
            res.status(200).json({
                ok: true,
                hospital: hospital,
                total: conteo
            });
        });

    });
});

app.get('/:id', (req, res) => {
    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) =>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al busca hospital',
                    errors: err
                });
            }

            if (!hospital) {
               return res.status(400).json({
                   ok: false,
                   mensaje: 'El hospital con el id ' + id + ' no existe',
                   errors: {message: 'No existe un hospital con ese ID'}
               });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

//==========================================================
// Crear hospital
//==========================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = req.usuario;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });
    });
});

//==========================================================
// Borrar hospital
//==========================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

//==========================================================
// Actualizar hospital
//==========================================================
app.put('/:id', mdAutenticacion.verificaToken,(req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital.',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe.',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        if (body.nombre) {
            hospital.nombre = body.nombre;
        }

        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital.',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
    });
});

module.exports = app;