var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID; // Para manejar adecuadamente el ID de registro en MONGODB
var uuid = require('node-uuid');
function backoffice_router(db){
    var reportes = db.collection("reportes");
    var secciones = db.collection("secciones");

    router.get("/", function(req,res){
        secciones.find({"Estado":"ACT","Reportes.Status":"Reportado"},{sort:[["FechaReporte",1]]}).toArray(
            function(err, reportes){
                var finalReport = new Array();
                for(var i= 0; i<reportes.length; i++){
                    for(var j=0; j<reportes[i].Reportes.length;j++){
                        var d = new Date(reportes[i].Reportes[j].FechaReporte)
                        d =  d.getDate() + "/" + (d.getMonth() + 1)+ "/" + d.getFullYear();
                        finalReport.push({  "FechaReporte":d,
                                            "NombreCurso": reportes[i].NombreCurso,
                                            "Seccion": reportes[i].Seccion,
                                            "NombreDocente": reportes[i].NombreDocente,
                                            "Status": reportes[i].Reportes[j].Status,
                                            "sortFecha": new Date(reportes[i].Reportes[j].FechaReporte)
                                        });
                    }
                }
                finalReport.sort(function(obj1, obj2){
                    if(obj1.sortFecha.getTime() < obj2.sortFecha.getTime()) return -1;
                    if(obj1.sortFecha.getTime() > obj2.sortFecha.getTime()) return 1;
                    return 0;
                });
                res.render('index',{"title":"Monitoreo de Aulas", "reportes":finalReport});
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
