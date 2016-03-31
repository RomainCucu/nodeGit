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
exports.signin = function(data, res){//fonction pour ajouter un USER
	var NOM_METHODE = "SIGNIN";
	MongoClient.connect(ID_MONGO, function(err, db) {
	    if(err){
	    	throw err;
	    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
	    }		
		var collection = db.collection(BOURSE_USERS);
		collection.find({login:data.formLogin, pwd:data.formPassword}).toArray(function(err, results){			
			if (err) {
				throw err;
				res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:ERR_CONNECTION_BASE}));
			}
		if (results[0]){//si on trouve bien le login et le PW associé dans la base de donnée 
			var cookieValue =  data.formLogin.substring(0,3) + Math.floor(Math.random() * 100000000);//pour cookieName
			if (data.formRememberMe == true){//si la case rememberme est cochée
				var cookieExpire = new Date(new Date().getTime()+604800000).toUTCString();
			}
			else{
				var cookieExpire = new Date(new Date().getTime()+900000).toUTCString();//si rememberme pas cochee
			}			
			collection.update(
				{login:data.formLogin, pwd:data.formPassword},
				{$set:
					{					 					 
					 rememberme: data.formRememberMe,
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
exports.valid_cookie = function(c, obj, fct){
	var NOM_METHODE = 'valid_cookie';
	if (c){
		MongoClient.connect(ID_MONGO, function(err, db) {
		if(err){
	    	throw err;
	    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "71", err_message:ERR_CONNECTION_BASE}));
	    }	
		var collection = db.collection(BOURSE_USERS);
		c = c.split("cookieName=");//car cookieName=rom19282839" par excemple donc on eneleve le cookieName
		 collection.find({cookieValue: c[1]}).toArray(function(err, results) {
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
* RCU - 09/08/2015 - Ajout fonction qui ajoute une valeur dans un portefeuille
* parametres entree : objet contenant les info de la valeur, la requete et le cookie
* collection : bourse_users
************************************************************************************
*/
exports.addValueToDB = function(data, res, c){
var NOM_METHODE = "ADDVALUETODB";
	MongoClient.connect(ID_MONGO, function(err, db) {
	    if(err){
	    	throw err;
	    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
	    }		
		var collection = db.collection(BOURSE_USERS);
		c = c.split("cookieName=");//car cookieName=rom19282839" par excemple donc on eneleve le cookieName
		delete data.action;
		functionAdminTabSymbols(collection, data);
		collection.update(
			{cookieValue:c[1]},
			{$push:
				{					 					 
				 	"instrumentList": data				 					
				 }
			},
			{upsert: false},function(err){
			if (err){
				throw err;
				res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "3", err_message:'erreur methode update inconnue'}));
			}
			res.writeHead(200, {"Content-Type": "'text/plain'"});
			res.end(JSON.stringify({categorie:CATEGORIE_OK,suc_methode:NOM_METHODE}));
		});
		
});
};

/**
* fonction qui ajoute le symbole aussi dans le document adminTabSymbols
*/
functionAdminTabSymbols = function(collection, data){
	collection.find({login:"adminTabSymbols"},
		{instrumentList:{$elemMatch: { libelle: data.libelle}}}).toArray(function(err, results){
			if (err){
				throw err;
				res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:'erreur methode find get wallet inconnue'}));
			}
			else if(results[0].instrumentList){				
				return;
		}else{
			collection.update({login:"adminTabSymbols"},
			 { $push: { instrumentList: data  } },
			 function(err){
			 	if (err){
					throw err;
					//res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:'erreur methode update inconnue'}));
				}
				}
			);
		}
		})
	
};

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
	c = c.split("cookieName=");//car cookieName=rom19282839" par excemple donc on eneleve le cookieName	

	collection.find({cookieValue:c[1]}).toArray(function(err, results){
		if (err){
			throw err;
			res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:'erreur methode find get wallet inconnue'}));
		}
		else if(results[0]){			
			res.end(JSON.stringify({categorie:CATEGORIE_OK, suc_methode:NOM_METHODE, portefeuillesNames:results[0].portefeuilles,
				instrumentList:results[0].instrumentList}));	
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
		c = c.split("cookieName=");//car cookieName=rom19282839" par excemple donc on eneleve le cookieName
		var name = data.name;
		var update ={};
		update["portefeuilles."+name] = new Array();		
		collection.update({cookieValue:c[1]},{ $set:update }, function(err, db) {
			if(err){
	    		throw err;
	    		res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:"err update"}));
	    	}else{
	    		res.end(JSON.stringify({categorie:CATEGORIE_OK,suc_methode:NOM_METHODE}));
	    	}
		});//collection update
});
};

/**
* RCU - 12/09/2015 - Ajout fonction qui mets à jours les valeurs des instru d'un compte
* parametres entree : le cookie de l'utilisateur
* collection : bourse_users
************************************************************************************
*/
exports.MAJVALEURSINSTRUMENTS = function(res, c){
	var NOM_METHODE = "MAJVALEURSINSTRUMENTS";
	MongoClient.connect(ID_MONGO, function(err, db) {
    if(err){
    	throw err;
    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
    }
    var collection = db.collection(BOURSE_USERS);
	c = c.split("cookieName=");//car cookieName=rom19282839" par excemple donc on eneleve le cookieName	

	collection.find({cookieValue:c[1]}).toArray(function(err, results){
		if (err){
			throw err;
			res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:'erreur methode find get wallet inconnue'}));
		}
		else if(results[0]){
			var arr = results[0].instrumentList;
			function iterate(i){
				try{					
					getStock(arr[i].libelle, function(value){
					if(value!="err"){
						var obj = {};
						var s = "instrumentList."+i+".valeurActuelle";						
						obj[s]=value[0].replace(",",".");
						collection.update({cookieValue:c[1]},{$set:obj},function(err, db) {
							if(err){
					    		throw err;
					    		res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "2", err_message:"err update"}));
					    	}					    	
					});
					}})
				}catch(e){
					console.log(e);
				}
			}for(i in arr) iterate(i);
			res.end(JSON.stringify({categorie:CATEGORIE_OK, suc_methode:NOM_METHODE}));				    	
		}else{
			res.end(JSON.stringify({categorie:CATEGORIE_OK, suc_methode:NOM_METHODE}));				    	
		}
	});    
});
};

/**
* RCU - 12/09/2015 - Ajout fonction qui supprime un instrument
* parametres entree : la data et cookie de l'utilisateur
* collection : bourse_users
************************************************************************************
*/
exports.supprimerInstrument = function (data, res, c){
	var NOM_METHODE = "SUPPRIMERINSTRUMENT";
	MongoClient.connect(ID_MONGO, function(err, db) {
    if(err){
    	throw err;
    	res.end(JSON.stringify({categorie:CATEGORIE_ERREUR,err_methode: NOM_METHODE, err_ligne: "1", err_message:ERR_CONNECTION_BASE}));
    }
    var collection = db.collection(BOURSE_USERS);
	c = c.split("cookieName=");//car cookieName=rom19282839" par excemple donc on eneleve le cookieName
	collection.update({cookieValue:c[1]},{ $pull: {instrumentList: {_id:data._id}}}, function(err, db) {
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
          var positionofmyvalue2 = str2.indexOf('"time_rtq"');
          str2 = str2.slice(positionofmyvalue2,positionofmyvalue2+200);
          str2 = str2.split("</span>");
          str2 = str2[0].split(">");                
          cb([str[2],str2[2]]);
    });
}).on('error', function(e) {
  return("err");
  console.log("Got error: " + e.message);
});
};

/**
* RCU - 12/09/2015 - Ajout fonction qui mets à jours toutes les valeurs du doc adminTabSymbols
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

	collection.find({login:"adminTabSymbols"}).toArray(function(err, results){
		if (err){
			throw err;			
		}
		else if(results[0]){
			var arr = results[0].instrumentList;
			function iterate(i){
				try{					
					getStock(arr[i].libelle, function(value){
						if(value!="err"){							
							var obj = {};							
							var obj3 = {};
							var s = "instrumentList."+i+".valeurActuelle";							
							var sAllDays = "instrumentList."+i+".tableauAllDays";
							obj[s]=value[0].replace(",",".");							
							collection.update({login:"adminTabSymbols"},{$set:obj},function(err, db) {
								if(err){
						    		throw err;					    		
						    	}				    	
							});
							MAJINTRADAYVALUES(collection,value,i);
							//DELETEINTRADAYTAB(collection,value,i);
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
* fonction qui met à jour les valeurs intraday en fonction de l'heure
*/
var MAJINTRADAYVALUES = function(collection,value,i){

	var obj2 = {};
	var sIntraday = "instrumentList."+i+".tableauIntraday";
	obj2[sIntraday]=[value[0].replace(",","."),value[1]];
	collection.update({login:"adminTabSymbols"},{$push:obj2},function(err, db) {
		if(err){
			throw err;			
			return;		    		
		}else{
			return;
		}			    	
	});
};

/**
* fonction qui supprime les valeurs intraday en fonction de l'heure
*/
var DELETEINTRADAYTAB = function(collection,value,i){

	var obj2 = {};
	var sIntraday = "instrumentList."+i+".tableauIntraday";
	obj2[sIntraday]=[];
	collection.update({login:"adminTabSymbols"},{$set:obj2},function(err, db) {
		if(err){
			throw err;			
			return;		    		
		}else{			
			return;
		}			    	
	});
};

