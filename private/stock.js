var https = require("https");//pour recuperer les valeur de la bourse

var getStock = function (obj, fn){

https.get("https://fr.finance.yahoo.com/q?s="+obj.b.symbol+"&ql=1", function(res) {
  //console.log("Got response: " + res.statusCode);
  var buff = '';
  res.on("data",function(chunck){
  	buff+=chunck;
  	});
  res.on("end",function(){
    
          var str = buff;
          var str2 = buff;

          var positionofmyvalue = str.indexOf("time_rtq_ticker");
          str = str.slice(positionofmyvalue,positionofmyvalue+100);
          str = str.split("</span>");
          str = str[0].split(">");

          var positionofmyvalue2 = str2.indexOf("yfi_rt_quote_summary");
          str2 = str2.slice(positionofmyvalue2,positionofmyvalue2+200);
          str2 = str2.split("<h2>");
          if(str2[1]){
            str2 = str2[1].split("</h2");
            }else{
              obj[fn](false);
            }
          var ret = new Array(str[2],str2[0], new Date())

          obj[fn](ret);
    });
}).on('error', function(e) {
  return("erreur");
  console.log("Got error: " + e.message);
});
};


exports.getStock = getStock;