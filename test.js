// Ejemplo de como establecer una conexíon a MONGO DB
var mongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/SW2015";

mongoClient.connect(url,function(err, db){
    if(err){
      console.log("error");
    }else{
      console.log("hurra! Con Established!");
    }
});
