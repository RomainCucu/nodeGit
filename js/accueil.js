/**
Object acceuil is composed like :
[wallets]
[instrumentValuesNow]
*/

var accueil = {};

accueil.start = function(){		
	getInstrumentValuesNow();
	//getAllWallets();
};

//to get the current value of all instruments 
var getInstrumentValuesNow = function(){
	accueil.post({action:'GETINSTRUMENTVALUESNOW'}, accueil.callback);
}

//we retrieve all wallets
var getAllWallets = function(){
	document.getElementById("displayPortefeuille").innerHTML = '<img class="" src="../images/ajax-loader.gif" width="30" height="30" />';
	accueil.post({action:'GETWALLETS'}, accueil.callback);
}

//we display the line with wallets names
var showWallets = function(arr){
	var string ="";
	for (i in arr){
		string+='<li class="dropdown" onclick="displayInsideWallet('+i+');"><a href="#" data-toggle="collapse" data-target="#one">'+arr[i].name+'</a></li>';
	}
	document.getElementById('displayPortefeuille').innerHTML = string;
}

//we display inside of wallet
var displayInsideWallet = function(i){		
	var sommeValeurAchat = 0;
	var sommeValeurActuelle = 0;
	var sommeFraisAchat = 0;
	var sommeFraisVente = 0;
	var sommePlusMoinsValueSansFrais = 0;
	var sommePlusMoinsValueAvecFrais = 0;	
	var wallet = accueil.wallets[i];
	var instrumentList = accueil.wallets[i].instrumentList;
	var instrumentValuesNow = accueil.instrumentValuesNow;
	//titre portefeuille et bouton modal ajout value
	document.getElementById('affichageTitrePortefeuille').innerHTML='<h1 id="portefeuillesNameSelect" class="col-md-4">'+wallet.name+'</h1>'+	
	'<button type="button" style="margin-top:2%;" class="btn btn-success col-md-3 col-md-offset-3" data-toggle="modal" data-target="#modalAjoutInstrument">'+
	'ajouter un instrument</button>';
	if(!instrumentList){
		document.getElementById('vuePortefeuille').innerHTML = "";
		return;
	}
	//affichage titre colonnes
	var string = '<thead><tr><th>Libellé</th><th>Nombre</th><th>Valeur Achat</th><th>Valeur Actuelle</th><th>Frais A</th><th>Frais V</th>'+
	'<th>+/- value</th><th >évolution pourcentage</th><th>Action</th></tr></thead>';
	string += '<tbody>';
	for (i in instrumentList){
			var instrumentSelected = $.grep(instrumentValuesNow, function(e){ return e.libelle == instrumentList[i].libelle; })
			var valueInstrumentSelected = instrumentSelected[0].valeurActuelle;
			//  +/- value par instrument avec les frais
			var plusMoinsValueInstrument = instrumentList[i].nombreActions*(valueInstrumentSelected-instrumentList[i].valeurAchat)-instrumentList[i].fraisAchat-instrumentList[i].fraisVente;
			//  somme +/- value des instruments AVEC les frais
			sommePlusMoinsValueAvecFrais += plusMoinsValueInstrument;
			//  somme +/- value des instruments SANS les frais
			sommePlusMoinsValueSansFrais += instrumentList[i].nombreActions*(valueInstrumentSelected-instrumentList[i].valeurAchat);
			// somme lors de l'achat des titres sans frais
			sommeValeurAchat += instrumentList[i].nombreActions*instrumentList[i].valeurAchat;
			// somme actuelle des valeurs detenues
			sommeValeurActuelle += instrumentList[i].nombreActions*valueInstrumentSelected;
			// somme des frais achat
			sommeFraisAchat += parseInt(instrumentList[i].fraisAchat);
			// somme des frais vente
			sommeFraisVente += parseInt(instrumentList[i].fraisVente);
			pourcentageParAction = (valueInstrumentSelected-instrumentList[i].valeurAchat)/instrumentList[i].valeurAchat*100;
			string += '<tr><td >'+instrumentList[i].nomCompletAction.trim()+'</td>'+
			'<td >'+instrumentList[i].nombreActions+'</td>'+
			'<td >'+instrumentList[i].valeurAchat+'</td>'+
			'<td >'+valueInstrumentSelected+'</td>'+
			'<td >'+instrumentList[i].fraisAchat+'</td>'+
			'<td >'+instrumentList[i].fraisVente+'</td>'+
			'<td >'+plusMoinsValueInstrument.toFixed(2)+'</td>'+
			'<td >'+pourcentageParAction.toFixed(2)+' %</td>'+
			'<td><span class="glyphicon glyphicon-remove-sign text-danger" style="cursor:pointer;" onclick="supprimerInstrument(\''+instrumentList[i]._id+'\',\''+wallet.name+'\')" aria-hidden="true"></span></td>'+
			'</tr>';
	}	
	string += '<tr><td ><b>TOTAL</b></td>'+
				'<td>&nbsp;</td>'+
				'<td><b>'+sommeValeurAchat.toFixed(2)+'</b></td>'+
				'<td><b>'+sommeValeurActuelle.toFixed(2)+'</b></td>'+
				'<td><b>'+sommeFraisAchat.toFixed(2)+'</b></td>'+
				'<td><b>'+sommeFraisVente.toFixed(2)+'</b></td>'+
				'<td><b>'+sommePlusMoinsValueAvecFrais.toFixed(2)+'</b></td>'+
				'<td><b>'+((sommeValeurActuelle-sommeValeurAchat)/sommeValeurAchat*100).toFixed(2)+' %</b></td>'+
				'<td><b>'+(parseInt(sommeValeurAchat)+parseInt(sommePlusMoinsValueAvecFrais)).toFixed(2)+'</b></td>'+								
				'</tr>';
	string += '</tbody>';
	//document.getElementById('performanceGlobalPortefeuille').innerHTML = (parseInt(sommeValeurAchat)+parseInt(sommePlusMoinsValueAvecFrais)).toFixed(2);
	document.getElementById('vuePortefeuille').innerHTML = string;//affichage tableau
	if(sommeValeurActuelle != 0){// CaD pas de symbole dans le porteuille
		accueil.showPieGraphe(instrumentList, sommeValeurActuelle);
	}else{
		document.getElementById('containerPieChart').innerHTML = "";//on fait disparaitre le pie chart
	}
}

//to delete a line in the wallet
var supprimerInstrument = function(_id,walletName){	
	accueil.post({action:'SUPPRIMERINSTRUMENT',_id:_id,walletName:walletName}, accueil.callback);
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
				if(!r.wallets){
					document.getElementById('displayPortefeuille').innerHTML ='<td class="dropdown">Pas de porteuille !</td>';
				}else{
					console.log('recuperation portefeuilles OK');
					accueil.wallets = r.wallets;									
					showWallets(r.wallets);
				}
			}else if(r.suc_methode == "MAJVALEURSINSTRUMENTS"){
				console.log("instru MAJ OK");
				getAllWallets();
			}else if(r.suc_methode == "SUPPRIMERINSTRUMENT"){
				console.log('suppression OK');
				getAllWallets();
			}else if(r.suc_methode == "GETINSTRUMENTVALUESNOW"){
				console.log('recuperation valeur actuelle OK');
				accueil.instrumentValuesNow = r.data;
				getAllWallets();
			}
		}else{
			alert('ko message : '+r.err_message);	
		} 
	}
};

formatDataPieChart = function(data, sommeValeurActuelle){
	var returnedData = new Array();
	if(data.length > 0){
		for(var i = 0; i < data.length; i++){
			var instrumentSelected = $.grep(accueil.instrumentValuesNow, function(e){ return e.libelle == data[i].libelle; })
			var valueInstrumentSelected = instrumentSelected[0].valeurActuelle;
			var tmpObj = {
				name : data[i].nomCompletAction.slice(0,data[i].nomCompletAction.indexOf('(')),
				y : data[i].nombreActions*valueInstrumentSelected*100/sommeValeurActuelle
			};
			returnedData.push(tmpObj);	
		}
	}
	return returnedData;
}

accueil.showPieGraphe = function(data, sommeValeurActuelle){
	formatedData = formatDataPieChart(data, sommeValeurActuelle);
	 $('#containerPieChart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Répartition du portefeuille'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: formatedData
        }]
    });
};

/*--------------------------------------------------------------------------------------------*/

window.onload = function(){//fonctions qui se lancent au démarrage
	accueil.start();
};
