var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID; // Para manejar adecuadamente el ID de registro en MONGODB
var uuid = require('node-uuid');
function backoffice_router(db){
    var reportes = db.collection("reportes");
    var secciones = db.collection("secciones");

    router.get("/", function(req,res){
        secciones.find({"Reportes.Status":"Reportado"}).toArray(
            function(err, reportes){
                for(var i= 0; i<reportes.length; i++){
                    for(var j=0; j<reportes[i].Reportes.length;j++){
                        console.log(reportes[i].Reportes[j].FechaReporte);
                        var d = new Date(reportes[i].Reportes[j].FechaReporte)
                        reportes[i].Reportes[j].FechaReporte = d.getDay() + "/" + (d.getMonth() + 1)+ "/" + d.getFullYear();
                        console.log(reportes[i].Reportes[j].FechaReporte);
                    }
                }
                res.render('index',{"title":"Monitoreo de Aulas", "reportes":reportes});
            }
        );

    });

    router.get("/reportes", function(req, res){
        reportes.find().toArray(function(err,reports){
            res.status(200).json(reports);
        });
    })


    return router;
}

module.exports = backoffice_router;
