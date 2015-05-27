// Ejemplo de como establecer una conexíon a MONGO DB
var mongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/uchMonitor";

mongoClient.connect(url,function(err, db){
    if(err){
      console.log("error");
    }else{
      console.log("hurra! Con Established!");
      console.log("Cargando documento Json con Secciones");
      var jsonDocs = require("../resources/DatosSeccionesEdificioF.json");
      console.log(jsonDocs.length);

      console.log("Obteniendo Coleccion secciones");
      var secciones = db.collection("secciones");

      secciones.insert(jsonDocs,{w:1},function(err, records){
          console.log(records.length);
      });
    }
});
