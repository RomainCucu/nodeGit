/**
* message retour ko sur la forme : <nomDeLaFonction>_<l+numeroDeLigne>_<koOUok>
*/

var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
    
var ID_MONGO = process.env.DATABASE_URL;
//collections
var BOURSE_USERS = 'bourse_users';
//messages d'erreur
var ERR_CONNECTION_BASE = 'erreur lors de la connection à la base de données';
var CATEGORIE_ERREUR = 'ERROR';
var CATEGORIE_OK = 'SUCCESS';

/**
* RCU - 09/08/2015 - Ajout fonction sign-in, pour se connecter à son compte
* parametres entres : login et password
* collection DB : bourse_users
************************************************************************************
*
*/
exports.signin = function(login, pwd, res){//fonction pour ajouter un USER
	var NOM_METHODE = "SIGNIN";
	MongoClient.connect(ID_MONGO, function(err, db) {
	    if(err){
	    	throw err;
	    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
	    }		
		var collection = db.collection(BOURSE_USERS);		
		collection.find({login:login, pwd:pwd}).toArray(function(err, results){			
			if (err) {
				throw err;
				res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:ERR_CONNECTION_BASE}));
			}
		if (results[0]){//si on trouve bien le login et le PW associé dans la base de donnée 
			var cookieValue =  login.substring(0,3) + Math.floor(Math.random() * 100000000);//pour cookieName
			cookieValue = pad(20,cookieValue,'0');
			var cookieExpire = new Date(new Date().getTime()+604800000).toUTCString();

			collection.update(
				{login:login, pwd:pwd},
				{$set:
					{					 					 
					 cookieValue: cookieValue
					}
				},
				{upsert: false},function(err){
				if (err){
					throw err;
					res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "3", err_message:'erreur methode update inconnue'}));
				}
			});
			res.writeHead(200, {"Content-Type": "'text/plain'", "Set-Cookie" : 'cookieName='+cookieValue+';expires='+cookieExpire});//on ecrit le cookie chez le client					
			res.end(JSON.stringify({categorie:CATEGORIE_OK,suc_methode:NOM_METHODE}));
		}else{
			res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "4", err_message:'Login or password are false !'}));
		}
		db.close;
		});	    
	});
};
// fin RCU - 09/08/2015 - Ajout fonction sign-in, pour se connecter à son compte

/**
* RCU - 09/08/2015 - Ajout fonction qui verifie l'existence d'un cookie dans la DB
* parametres entree : c : le cookie du client, dans le header, fct : la fct renvoye au routeur
* collection : bourse_users
************************************************************************************
*/
exports.validCookie = function(c, obj, fct){
	var NOM_METHODE = 'VALIDCOOKIE';
	if (c && c.indexOf("cookieName=") != -1){
		MongoClient.connect(ID_MONGO, function(err, db) {
		if(err){
	    	throw err;
	    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
	    }	
		var collection = db.collection(BOURSE_USERS);
		c = c.split("cookieName=");//car cookieName=rom19282839;azeaze" par excemple donc on eneleve le cookieName
		c = c[1];
		c = c.substr(0,20);
		 collection.find({cookieValue: c}).toArray(function(err, results) {
		 if (err){		 	
		 	obj[fct](false);	 
		 }else if (results[0]){		 	
		 	obj[fct](true);	 
		 }else if (!results[0]){		 	
		 	obj[fct](false);	 
		 }		 
	 });	
	})
	}else{
		obj[fct](false);	 
	}
};
// fin RCU - 09/08/2015 - Ajout fonction qui verifie l'existence d'un cookie dans la DB


/**
* RCU - 26/08/2015 - Ajout fonction qui récupère le portefeuille
* parametres entree : la requete et le cookie
* collection : bourse_users
************************************************************************************
*/
exports.getWallets= function(res, c){//fonction pour ajouter un USER
var NOM_METHODE = "GETWALLETS";
MongoClient.connect(ID_MONGO, function(err, db) {
    if(err){
    	throw err;
    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
    }
    var collection = db.collection(BOURSE_USERS);
	c = c.split("cookieName=");//car cookieName=rom19282839;azeaze" par excemple donc on eneleve le cookieName
	c = c[1];
	c = c.substr(0,20);
	collection.find({cookieValue:c}).toArray(function(err, results){
		if (err){
			throw err;
			res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:'erreur methode find get wallet inconnue'}));
		}
		else if(results[0]){			
			res.end(JSON.stringify({categorie:CATEGORIE_OK, suc_methode:NOM_METHODE, wallets:results[0].wallets}));	
		}else{
			res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "3", err_message:'erreur methode find get wallet inconnue'}));
		}
	});    
});
};//fonction qui enregistre ce quon a rentré

/**
* RCU - 29/08/2015 - Ajout fonction qui ajoute un portefeuille
* parametres entree : objet contenant le nom du portefeuille, la requete et le cookie
* collection : bourse_users
************************************************************************************
*/
exports.addWallet = function(data, res, c){
var NOM_METHODE = "ADDWALLET";
	MongoClient.connect(ID_MONGO, function(err, db) {
	    if(err){
	    	throw err;
	    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
	    }		
		var collection = db.collection(BOURSE_USERS);
		c = c.split("cookieName=");//car cookieName=rom19282839;azeaze" par excemple donc on eneleve le cookieName
		c = c[1];
		c = c.substr(0,20);
		var name = data.name.toUpperCase();				
		collection.update({cookieValue:c, 'wallets.name':{$ne:name}},{ $addToSet:{wallets:{name:name}} }, function(err, db) {
			if(err){
	    		throw err;
	    			res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:"err update"}));
	    		}
	    		else if(db == 1){	    			
	    			res.end(JSON.stringify({categorie:CATEGORIE_OK,suc_methode:NOM_METHODE, db:db}));
	    		}else{
	    			res.end(JSON.stringify({categorie:CATEGORIE_OK,suc_methode:NOM_METHODE, db:db}));
	    		}
		});
})
};

/**
* RCU - 09/08/2015 - Ajout fonction qui ajoute une valeur dans un portefeuille
* parametres entree : objet contenant les info de la valeur, la requete et le cookie
* collection : bourse_users
************************************************************************************
*/
exports.addValueToWallet = function(data, walletName, res, c){
var NOM_METHODE = "ADDVALUETOWALLET";
	MongoClient.connect(ID_MONGO, function(err, db) {
	    if(err){
	    	throw err;
	    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
	    }		
		var collection = db.collection(BOURSE_USERS);
		c = c.split("cookieName=");//car cookieName=rom19282839;azeaze" par excemple donc on eneleve le cookieName
		c = c[1];
		c = c.substr(0,20);
		delete data.action;
		functionAdminTabSymbols(collection, data);		
		collection.update({"cookieValue":c, "wallets.name":walletName}
			,
			{$push:
				{					 					 
				 	"wallets.$.instrumentList": data				 					
				 }
			},
			{upsert: false},function(err){
			if (err){
				throw err;
				res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "3", err_message:'erreur methode update inconnue'}));
			}else{
				res.writeHead(200, {"Content-Type": "'text/plain'"});
				res.end(JSON.stringify({categorie:CATEGORIE_OK,suc_methode:NOM_METHODE}));			
			}
		});
		
});
};

/**
* fonction qui ajoute le symbole aussi dans le document adminTabSymbols
*/
functionAdminTabSymbols = function(collection, data){
	collection.update({login:"ALLVALUESARRAY", 'instrumentList.libelle':{$ne:data.libelle}},
		{$push:{
			instrumentList:{libelle:data.libelle,
				nomCompletAction:data.nomCompletAction}
			}
		},function(err, db) {
			if(err){
    			throw err;    			
    		}
    	}
	);//deuxieme update	
};


/**
* RCU - 12/09/2015 - Ajout fonction qui supprime un instrument
* parametres entree : la data et cookie de l'utilisateur
* collection : bourse_users
************************************************************************************
*/
exports.supprimerInstrument = function (id,walletName, res, c){
	var NOM_METHODE = "SUPPRIMERINSTRUMENT";
	MongoClient.connect(ID_MONGO, function(err, db) {
    if(err){
    	throw err;
    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
    }
    var collection = db.collection(BOURSE_USERS);
		c = c.split("cookieName=");//car cookieName=rom19282839;azeaze" par excemple donc on eneleve le cookieName
		c = c[1];
		c = c.substr(0,20);		
	collection.update({cookieValue:c, "wallets.name":walletName},{ $pull: {"wallets.$.instrumentList":{_id:id}}}, function(err, db) {
		if(err){
	    		throw err;
	    		res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:"err update"}));
    	}else{
    		res.end(JSON.stringify({categorie:CATEGORIE_OK,suc_methode:NOM_METHODE}));
    	}
	});
});
};

/**
* fonction qui recupere la valeur d'un instrument sur Yahoo
*/
var getStock = function (symbol, cb){
var https = require("https");//pour recuperer les valeur de la bourse
https.get("https://fr.finance.yahoo.com/q?s="+symbol+"&ql=1", function(res) {
  //console.log("Got response: " + res.statusCode);
  var buff = '';
  res.on("data",function(chunck){
  	buff+=chunck;
  	});
  res.on("end",function(){    		
          var str = buff;
          var str2 = buff;
          //valeur
          var positionofmyvalue = str.indexOf("time_rtq_ticker");          
          str = str.slice(positionofmyvalue,positionofmyvalue+100);
          str = str.split("</span>");
          str = str[0].split(">");
          //date
          var positionofmyvalue2 = str2.indexOf('"yfs_market_time"');
          str2 = str2.slice(positionofmyvalue2,positionofmyvalue2+200);
          str2 = str2.split("</span>");
          str2 = str2[0].split(">");     
          cb(str[2],str2[1]);
    });
}).on('error', function(e) {
  return("err");
  console.log("Got error: " + e.message);
});
};

/**
* RCU - 12/09/2015 - Ajout fonction qui mets à jours toutes les valeurs du doc ALLVALUESARRAY
* parametres entree : rien
* collection : bourse_users
************************************************************************************
*/
exports.MAJVALEURSALLINSTRUMENTS = function(){
	var NOM_METHODE = "MAJVALEURSALLINSTRUMENTS";
	MongoClient.connect(ID_MONGO, function(err, db) {
    if(err){
    	throw err;
    }
    var collection = db.collection(BOURSE_USERS);	

	collection.find({login:"ALLVALUESARRAY"}).toArray(function(err, results){
		if (err){
			throw err;			
		}
		else if(results[0].instrumentList){
			var arr = results[0].instrumentList;
			function iterate(i){
				try{					
					getStock(arr[i].libelle, function(value, date){
						if(value!="err"){							
							var obj = {};							
							var s = "instrumentList."+i+".valeurActuelle";							
							obj[s]=value.replace(",",".");
							collection.update({login:"ALLVALUESARRAY"},{$set:obj},function(err, db) {
								if(err){
						    		throw err;					    		
						    	}				    	
							});
							collection.update({login:"ALLVALUESARRAY"},{$set:{MaJ:date}},function(err, db) {
								if(err){
						    		throw err;					    		
						    	}				    	
							});
						}
					})
				}catch(e){
					console.log(e);
				}
			}for(i in arr) iterate(i);		    	
		}else{
			console.log("err db.MAJVALEURSALLINSTRUMENTS dans le fichier db . js");
		}
	});    
});
};

/**
RCU - 01/07/2016 - on recupere les valeurs de tous les symboles de ALLVALUESARRAY
*/
exports.getInstrumentValuesNow = function(res){
	var NOM_METHODE = "GETINSTRUMENTVALUESNOW";
	MongoClient.connect(ID_MONGO, function(err, db) {
    if(err){
    	throw err;
    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
    }
    var collection = db.collection(BOURSE_USERS);
	collection.find({login:"ALLVALUESARRAY"}).toArray(function(err, results){
		if (err){
			throw err;			
		}
		else if(results[0].instrumentList){
			res.end(JSON.stringify({categorie:CATEGORIE_OK,suc_methode:NOM_METHODE, data:results[0].instrumentList, date:results[0].MaJ}));
		}else{
			res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:"pas de symbol"}));
		}
	});    
});
};

//RCU 29/03/2016
// ajout fonction pad pour que les cookies aient tous la même longueur
function pad(width, string, padding) { 
  return (width <= string.length) ? string : pad(width, padding + string, padding)
}
//fin RCU 29/03/2016
