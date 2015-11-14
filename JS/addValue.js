var addValue = {};

var addValueData = {};//objet à remplir des informations rentrées par l'utilisateur

addValue.start = function(){
	addValue.formCheckSymbol();//
	addValue.addValueToDB();
	//document.addEventListener('keydown', index.on_key_down);
	//setInterval(function(){index.post({action:"checkSession"}, index._callback)},5000);
};

/*-------------------------------------pour envoyer addValueData au router----------------------------------------------*/

addValue.formCheckSymbol = function(){
	document.getElementById('formCheckSymbol').onsubmit = function(event){
		document.getElementById('formCheckSymbolButton').style.display = "none";
		document.getElementById('formCheckSymbolButtonLoader').style.display = "";
		var formCheckSymbolValue = document.getElementById('formCheckSymbolValue').value;
		addValue.post({action:'FORMCHECKSYMBOL',symbol:formCheckSymbolValue}, addValue.addValue_callback);
		event.preventDefault();
	}
}

addValue.addValueToDB = function(){
	document.getElementById('addValueToDB').onsubmit = function(event){
		document.getElementById('formAddValueButton').style.display = "none";
		document.getElementById('formAddValueButtonLoader').style.display = "";
		addValue.remplissage();
		addValue.post(addValueData, addValue.addValue_callback);
		event.preventDefault();
	}
}

addValue.remplissage = function(){
	addValueData.action = "ADDVALUETODB";
	addValueData.libelle = document.getElementById('formCheckSymbolValue').value;
	addValueData.nomCompletAction = document.getElementById('nomCompletAction').innerHTML;
	addValueData.nombreActions = document.getElementById('nombreAction').value;
	addValueData.valeurAchat = document.getElementById('valeurAchat').value.replace(",", ".");
	addValueData.fraisAchat = document.getElementById('fraisAchat').value.replace(",", ".");
	addValueData.fraisVente = document.getElementById('fraisVente').value.replace(",", ".");
	addValueData.valeurActuelle = document.getElementById('resultStockValue').innerHTML.replace(",", ".");
	addValueData.nomPortefeuille = document.getElementById('portefeuillesNameSelect').innerHTML;
	addValueData._id = addValueData.nombreActions*addValueData.valeurAchat*addValueData.fraisAchat*Math.floor((Math.random() * 100000) + 1);
};//fonction qui prend toutes les valeurs rentrées

addValue.post = function (addValueData, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/");
    xhr.onreadystatechange = callback;
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(addValueData));
};

addValue.addValue_callback = function () {
	if (this.readyState == 4 && this.status == 200) {
		var r = JSON.parse(this.responseText);
		if (r.categorie == "SUCCESS"){
			if (r.suc_methode == "FORMCHECKSYMBOL") {
				document.getElementById('formCheckSymbolButton').style.display = "";
		 		document.getElementById('formCheckSymbolButtonLoader').style.display = "none";
		 		document.getElementById("displayResultSymbol").innerHTML = '<span id="resultStockValue" class="text-primary col-md-3" style="padding:0">'+r.formCheckSymbolResponse[0]+'</span><br><span class="col-md-offset-0" id="nomCompletAction">'+r.formCheckSymbolResponse[1]+'</span><br><span class="col-md-offset-0">'+addValue.traitementDate(r.formCheckSymbolResponse[2])+'</span>';
			}else if (r.suc_methode == "ADDVALUETODB") {
				document.getElementById('formAddValueButton').style.display = "";
		 		document.getElementById('formAddValueButtonLoader').style.display = "none";
		 		document.getElementById('alertAddInstruSuccess').style.display = "";		 		
			}
		}else {
			document.getElementById('alertAddInstruFail').style.display = "";			
		}
	}
};

/*--------------------------------------------------------------------------------------------*/



HTMLElement.prototype.has_class = function (c) {
	return (this.className.indexOf(c) >= 0);
};

// fonction pour le format de la date
addValue.traitementDate = function(n){
	var date = new Date(n);
	date += '';
	date = date.split(" ");
	return(date[2]+" "+date[1]+" "+date[3]+" à "+date[4]);
};

addValue.traitementDonnees = function(coursActuel, coursAchat, nombreAction, fraisAchat, fraisVente){
	coursActuel = coursActuel.replace(/,/g, ".");
	coursActuel = parseFloat(coursActuel);
	coursAchat = parseFloat(coursAchat);
	nombreAction = parseFloat(nombreAction);
	fraisAchat = parseFloat(fraisAchat);
	fraisVente = parseFloat(fraisVente);

	return((coursActuel*nombreAction-coursAchat*nombreAction-fraisAchat-fraisVente).toString());	
};

addValue.start();

