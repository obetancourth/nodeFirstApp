var Application = function(){
    this._geoEnabled = false;
    this._localStorage = false;
    this._secciones = new Array();
    // referencia circular a si mismo para
    //mantener el contexto de llamado
    // sin conflicto con el cambio
    // que hace jquery a la variable this
    var _self = this;

    this.init = function(){
      this.checkgeoData();
      this.checkLocalStorage();

    }

    this.checkgeoData = function(){
      this._geoEnabled = navigator.geolocation && true;
    }
    this.checkLocalStorage = function(){
      this._localStorage = (typeof(Storage) !== "undefined");
    }

    this.loadSecciones = function(){
      $.get(
        "/api/getSecciones",
        {},
        function(data, successStr, xrh){
          //console.log(data);
          var htmlstr = "";
          if(Array.isArray(data)){
            _self._secciones = data;
            for(var i =0 ; i<data.length;i++){
              var seccion = data[i];
              htmlstr += '<li><a href="#pag2" data_id="'+i+'">Edificio: '+seccion.Edificio+' Aula: '+seccion.Aula+'<p>'+seccion.NombreCurso+'</p></a></li>';
            }
          }
          $("#pag1_lstScn").html(htmlstr)
            .listview()
            .find("a")
            .click(function(e){
              console.log($(this).attr("data_id"));
              console.log(_self);
              var itemIndex = parseInt($(this).attr("data_id"));
              var item = _self.loadSeccionByIndex(itemIndex);
              console.log(item);
            });
        },
        "json"
      ).fail(function(xrh, failStr, error){
        console.log(error);
      });
    }

    this.loadSeccionByIndex = function(index){
      if( index < _self._secciones.length && index >= 0){
        return _self._secciones[index];
      }
      return null;
    }
}

var app = new Application();

$("#pag1").on("pagecreate", function(e){
    app.init();
    console.log("geocheck",app._geoEnabled);
    console.log("localcheck", app._localStorage);
    app.loadSecciones();
})
