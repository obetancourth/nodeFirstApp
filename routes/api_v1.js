var express = require('express');
var router = express.Router();

function api_router(db){
  /* TODO: Ruta para obtener el tocken de autorizacion */
  router.get('/getTocken',function(req,res,next){
      res.status(200).json({tocken:"whenthecatgoesouthtemicepartyallnight"});
    });

  // Ruta para extraer las aulas con clases en la hora y fecha del sistema
  router.get('/getSecciones', function(req, res, next){
    var secciones = db.collection("secciones");
    var date = new Date(), hour = date.getHours(), day = date.getDay();
    var query = {"Inicio":{"$gte": hour},
                 "Final" :{"$lte":hour + 1},
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
        query = {};
    //-------------------------------------------------------------------

    secciones.find(query).sort({"Aula":1}).toArray(function(err, docs){
      if(err) throw err;
      res.status(200).json(docs);
    })
  });

  //Generar nuevo reporte de Docente Ausente
  //para mejor documentación de rutas con parametros REST
  // http://expressjs.com/4x/api.html#app.param
  router.put('/createReport/:seccionId',function(req, res, next){
    //Estructura del Report Document
    //Solo se recibe el _id de la sección
    var reportJsonDocument = {
      "SeccionId":"",
      "FechaReporte":new Date(),
      "UsuarioReporte":""
    };
    //para extraer la variable que en la url se ve
    // como :seccionId , se usa la variable req.params y
    // el nombre que continua despues de los << : >>

    reportJsonDocument.SeccionId = req.params.seccionId; //<<-----

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // TAREA:
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++
    /*
      1) Verificar usando findAndModify si existe el documento
        en la coleccion secciones, si existe agregar al arreglo
        <<reports>> la fecha que se está generado este reporte ($push)
        y crear o aumnetar por 1 el atributo << NumeroReportes >> ($inc).

        http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#findandmodify

      2) Agregue a la colección << reportes >> el documento json donde
        SeccionId es igual al _id del documento de la sección.

        http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#insert

      3) Si existe algun error devolver el status de la familia de los 500
        adecuado y un documento json con los datos del error.

    */
    res.status(200).json({"Reporte":reportJsonDocument,"Error":{}});
  });
  return router;
}
module.exports = api_router;
