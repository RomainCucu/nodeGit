var addWallet = {};

addWallet.start = function(){
	addWallet.addWalletForm();//
};

addWallet.addWalletForm = function(){
	document.getElementById('addWalletForm').onsubmit = function(event){
		document.getElementById('addWalletButton').style.display = "none";
		document.getElementById('addWalletButtonLoader').style.display = "";
		var addWalletCheckName = document.getElementById('addWalletCheckName').value;
		addWallet.post({action:'ADDWALLET',name:addWalletCheckName}, addWallet.callback);
		event.preventDefault();
	}
};

addWallet.post = function (data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/");
    xhr.onreadystatechange = callback;
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
};

addWallet.callback = function () {
	if (this.readyState == 4 && this.status == 200) {
		var r = JSON.parse(this.responseText);
		console.log(r);
		if (r.categorie == "SUCCESS"){
			if (r.suc_methode == "ADDWALLET") {
				document.getElementById('addWalletButton').style.display = "";
		 		document.getElementById('addWalletButtonLoader').style.display = "none";
		 		document.getElementById('alertAddWalletSuccess').style.display = "";
		 		//$('#modalAjoutPortefeuille').modal('hide');		 		
			}else {
				document.getElementById('alertAddWalletFail').style.display = "";
			}
		}
	}
};

addWallet.start();

//window.onload = function(){//fonctions qui se lancent au démarrage
//	addWallet.start();
//};

