var accueil = {};


var portefeuillesNamesArray = [];//objet à remplir des informations rentrées par l'utilisateur
var instrumentList = [];//objet qui contient les instruments d'un portefueilles

accueil.start = function(){	
	accueil.post({action:'MAJVALEURSINSTRUMENTS'}, accueil.callback);
};

var getAllWallets = function(){
	document.getElementById("displayPortefeuille").innerHTML = '<img class="" src="../images/ajax-loader.gif" width="30" height="30" />';
	accueil.post({action:'GETWALLETS'}, accueil.callback);
}

var afficherPortefeuille = function(index){		
	var sommeValeurAchat = 0;
	var sommeValeurActuelle = 0;
	var sommeFraisAchat = 0;
	var sommeFraisVente = 0;
	var sommePlusMoinsValueSansFrais = 0;
	var sommePlusMoinsValueAvecFrais = 0;
	document.getElementById('affichageTitrePortefeuille').innerHTML='<h1 id="portefeuillesNameSelect" class="col-md-4">'+portefeuillesNamesArray[index]+'</h1>'+	
	'<button type="button" style="margin-top:2%;" class="btn btn-success col-md-3 col-md-offset-3" data-toggle="modal" data-target="#modalAjoutInstrument">'+
	'ajouter un instrument</button>';
	var string = '<thead><tr><th>Libellé</th><th>Nombre</th><th>Valeur Achat</th><th>Valeur Actuelle</th><th>Frais A</th><th>Frais V</th>'+
	'<th>+/- value</th><th>Action</th></tr></thead>';
	string += '<tbody>';
	for (i in instrumentList){
		if(instrumentList[i].nomPortefeuille == portefeuillesNamesArray[index]){
			var plusMoinsValueInstrument = instrumentList[i].nombreActions*(instrumentList[i].valeurActuelle-instrumentList[i].valeurAchat)-instrumentList[i].fraisAchat-instrumentList[i].fraisVente;
			sommePlusMoinsValueAvecFrais += plusMoinsValueInstrument;
			sommePlusMoinsValueSansFrais += instrumentList[i].nombreActions*(instrumentList[i].valeurActuelle-instrumentList[i].valeurAchat);
			sommeValeurAchat += instrumentList[i].nombreActions*instrumentList[i].valeurAchat;
			sommeValeurActuelle += instrumentList[i].nombreActions*instrumentList[i].valeurActuelle;
			sommeFraisAchat += parseInt(instrumentList[i].fraisAchat);
			sommeFraisVente += parseInt(instrumentList[i].fraisVente);
			string += '<tr><td >'+instrumentList[i].nomCompletAction+'</td>'+
			'<td >'+instrumentList[i].nombreActions+'</td>'+
			'<td >'+instrumentList[i].valeurAchat+'</td>'+
			'<td >'+instrumentList[i].valeurActuelle+'</td>'+
			'<td >'+instrumentList[i].fraisAchat+'</td>'+
			'<td >'+instrumentList[i].fraisVente+'</td>'+
			'<td >'+plusMoinsValueInstrument.toFixed(2)+'</td>'+
			'<td><span class="glyphicon glyphicon-remove-sign text-danger" style="cursor:pointer;" onclick="supprimerInstrument('+instrumentList[i]._id+')" aria-hidden="true"></span></td>'+
			'</tr>';
		}
	}
	string += '<tr><td ><b>TOTAL</b></td>'+
				'<td>&nbsp;</td>'+
				'<td><b>'+sommeValeurAchat.toFixed(2)+'</b></td>'+
				'<td><b>'+sommeValeurActuelle.toFixed(2)+'</b></td>'+
				'<td><b>'+sommeFraisAchat.toFixed(2)+'</b></td>'+
				'<td><b>'+sommeFraisVente.toFixed(2)+'</b></td>'+
				'<td><b>'+sommePlusMoinsValueAvecFrais.toFixed(2)+'</b></td>'+
				'<td><b>'+(parseInt(sommeValeurAchat)+parseInt(sommePlusMoinsValueAvecFrais)).toFixed(2)+'</b></td>'+
				'</tr>';
	string += '</tbody>';
	//document.getElementById('performanceGlobalPortefeuille').innerHTML = (parseInt(sommeValeurAchat)+parseInt(sommePlusMoinsValueAvecFrais)).toFixed(2);
	document.getElementById('vuePortefeuille').innerHTML = string;//affichage tableau
}

var supprimerInstrument = function(_id){
	accueil.post({action:'SUPPRIMERINSTRUMENT',_id:_id}, accueil.callback);
}

accueil.post = function (data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/");
    xhr.onreadystatechange = callback;
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
};

accueil.callback = function () {
	if (this.readyState == 4 && this.status == 200) {
		var r = JSON.parse(this.responseText);
		if (r.categorie == "SUCCESS"){
			if (r.suc_methode == "GETWALLETS") {
				if(!r.portefeuillesNamesArray){
					document.getElementById('displayPortefeuille').innerHTML ='<td class="dropdown" onclick="redirect();"><a href="#" data-toggle="collapse" data-target="#one">Ajouter un portefeuille</a></td>';
				}else{
					console.log(r);
					instrumentList = r.instrumentList;
					portefeuillesNamesArray = r.portefeuillesNamesArray;;
					var string ="";
					for (i in portefeuillesNamesArray){
						string+='<li class="dropdown" onclick="afficherPortefeuille('+i+');"><a href="#" data-toggle="collapse" data-target="#one">'+portefeuillesNamesArray[i]+'</a></li>';
					}
					document.getElementById('displayPortefeuille').innerHTML = string;
				}
				}else if (r.suc_methode == "ADDVALUETODB") {
					document.getElementById('formAddValueButton').style.display = "";
			 		document.getElementById('formAddValueButtonLoader').style.display = "none";
			 		alert('ok');
				}else if(r.suc_methode == "MAJVALEURSINSTRUMENTS"){
					console.log("instru MAJ");
					getAllWallets();
				}else if(r.suc_methode == "SUPPRIMERINSTRUMENT"){
					console.log('suppression OK');
					getAllWallets();
				}
		}else alert('ko');
	}
};



/*--------------------------------------------------------------------------------------------*/

window.onload = function(){//fonctions qui se lancent au démarrage
	accueil.start();
};

HTMLElement.prototype.has_class = function (c) {
	return (this.className.indexOf(c) >= 0);
};

var redirect = function(){
	window.location.href="./addWallet.html";
}


