var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID; // Para manejar adecuadamente el ID de registro en MONGODB
var uuid = require('node-uuid');
function backoffice_router(db){
    var reportes = db.collection("reportes");
    router.get("/", function(req,res){
        res.render('index',{"title":"Monitoreo de Aulas"});
    });

    router.get("/reportes", function(req, res){
        reportes.find().toArray(function(err,reports){
            res.status(200).json(reports);
        });
    })
    return router;
}

module.exports = backoffice_router;
