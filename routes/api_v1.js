var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID; // Para manejar adecuadamente el ID de registro en MONGODB
var uuid = require('node-uuid'); //para hashes de tocken
function api_router(db){
  /* TODO: Ruta para obtener el tocken de autorizacion */

  var secciones = db.collection("secciones");
  var reportes = db.collection("reportes");
  var users = db.collection("usuarios");

  router.post('/verifyTocken', function(req,res,next){
      console.log(req.body);
      var query = {user:req.body.user,tocken:req.body.hashdata, expires:Number(req.body.expires)};
      users.findOne(query, function(err, userDoc){
          if(err){
              res.status(500).json({error:"Error Interno"});
              return;
          };
          if(!userDoc){
              res.status(500).json({error:"No se encontró tocken!"});
              return;
          }
          res.status(200).json(req.body);
        }
      );
  });

  router.post('/getTocken',function(req,res,next){
      var query = {"user":req.body.user};
      var expires = new Date();
      expires.setDate(expires.getDate() + 32);
      var tocken = uuid.v4().replace(/-/gi,'');
      //var tocken ="whenthecatgoesoutthemicepartyallnight";
      users.findAndModify(query,
                          {},
                          {"$set":{"tocken":tocken,
                                   "expires":expires.getTime()}
                          },
                          function(err, doc){
                                if(err || (!doc)){
                                  console.log(err);
                                  res.status(500).json({"error":"No se encuentra Dato"});
                                }else{
                                    console.log(doc);
                                    res.status(200).json({hashdata:tocken,
                                                        "expires":expires.getTime(),
                                                        "user":doc.user});
                                }
                              });
    }); //end /getTocken

  // Ruta para extraer las aulas con clases en la hora y fecha del sistema
  router.get('/getSecciones/:edificio', function(req, res, next){
    var edificio = req.params.edificio;
    var date = new Date(), hour = date.getHours(), day = date.getDay();
    var query = {"Estado":"ACT", "Inicio":{"$not":{"$gt": hour}},
                 "Final" :{"$not":{"$lt":hour + 1}},
                 "Edificio":edificio,
                 "$or":[{"Lns":(day==1)?1:false},
                        {"Mrt":(day==2)?1:false},
                        {"Mrc":(day==3)?1:false},
                        {"Jvs":(day==4)?1:false},
                        {"Vrn":(day==5)?1:false},
                        {"Sbd":(day==6)?1:false}
                       ]
                };
    //Para poder probar sin tener que cambiar la hora del servidor virtual
    //Ya en produccion comentar la siguiente linea
    //    query = {};
    //-------------------------------------------------------------------

    secciones.find(query).sort({"Aula":1}).toArray(function(err, docs){
      if(err) throw err;
      res.status(200).json(docs);
    })
  });


  router.get('/getEdificios', function(req, res, next){
  //obteniendo los edificios de las secciones en el momentos
    var date = new Date(), hour = date.getHours(), day = date.getDay();
    var query = {"Estado":"ACT","Inicio":{"$not":{"$gt": hour}},
                 "Final" :{"$not":{"$lt":hour + 1}},
                 "$or":[{"Lns":(day==1)?1:false},
                        {"Mrt":(day==2)?1:false},
                        {"Mrc":(day==3)?1:false},
                        {"Jvs":(day==4)?1:false},
                        {"Vrn":(day==5)?1:false},
                        {"Sbd":(day==6)?1:false}
                       ]
                };
    //Para poder probar sin tener que cambiar la hora del servidor virtual
    //Ya en produccion comentar la siguiente linea
    //    query = {};
    //-------------------------------------------------------------------

    //secciones.distinct("Edificio", query, function(err, docs){
    secciones.aggregate([ {"$match":query},
                          {"$group":{"_id":"$Edificio", "Secciones":{"$sum":1}}}
                        ], function(err , docs){
      res.status(200).json(docs);
    });
  });
  //Generar nuevo reporte de Docente Ausente
  //para mejor documentación de rutas con parametros REST
  // http://expressjs.com/4x/api.html#app.param
  router.put('/createReport/:seccionId/:tocken',function(req, res, next){
    //Estructura del Report Document
    //Solo se recibe el _id de la sección
    var userDocQ = {"tocken": req.params.tocken};
    users.findOne(userDocQ, function(err, userDoc){
        if(err){
            res.status(500).json({"Reporte":{},"Error":err});
            return;
        }
        if(!userDoc){
            res.status(500).json({"Reporte":{},"Error":"Tocken Enviado a Caducado o no es valido!"});
            return;
        }
        var reportJsonDocument = {
          "SeccionId":"",
          "FechaReporte":new Date(),
          "UsuarioReporte":""
        };

        reportJsonDocument.SeccionId = new ObjectID(req.params.seccionId); //<<-----
        reportJsonDocument.UsuarioReporte = userDoc.user;


        //insertando el documento en la colleccion de reportes
        reportes.insert(reportJsonDocument,{w:1}, function(err, insdoc){
          if(err) res.status(500).json({"Reporte":{},"Error":err});
          console.log(insdoc);
          secciones.findAndModify({"_id":new ObjectID(reportJsonDocument.SeccionId)}, //query
                                {}, // sort
                                {"$inc":{"NumeroReportes":1},
                                 "$push":{"Reportes":{"FechaReporte":reportJsonDocument.FechaReporte,
                                                      "ReporteID":insdoc[0]._id,
                                                      "Status":"Reportado",
                                                      "Usuario":insdoc[0].UsuarioReporte}
                                         }
                                 }, //modificaciones
                                 {"new":true}, //opciones
                                 function(err, doc){
                                  if(err) res.status(500).json({"Reporte":{},"Error":err});
                                  res.status(200).json({"Reporte":insdoc[0],"Error":{}});
                                 }//
                                );
        });

    });

  });
  return router;
}
module.exports = api_router;
