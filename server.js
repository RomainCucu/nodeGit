var http = require("http");
var util = require("util");
var db = require("./private/db.js");

var server = {}; //Server object. This object is use to stock everything owned by the server.
server.r = require("./router.js"); server.port = (process.env.PORT || 8080);
server.address = "0.0.0.0";


/**
* This method is called each times a request arrives on the server * @param req (Object) request object for this request
* @param resp (Object) response object for this request
*/
server.receive_request = function (req, resp) { server.r.router(req, resp);
};
http.createServer(server.receive_request).listen(server.port, server.address);
util.log("INFO - Server started, listening " + server.address + ":" + server.port);

try{
	db.MAJVALEURSALLINSTRUMENTS();
	setInterval(db.MAJVALEURSALLINSTRUMENTS, 60000);//900000
}catch(e){
	console.log("srver : err maj all instru");
}


