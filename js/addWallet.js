var addWallet = {};

addWallet.start = function(){
	addWallet.addWalletForm();//
};

addWallet.addWalletForm = function(){
	document.getElementById('addWalletForm').onsubmit = function(event){
		hideElement('addWalletButton');
		showElement('addWalletButtonLoader');
		var addWalletCheckName = getElementValue('addWalletCheckName');
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
		if (r.categorie == "SUCCESS"){
			if (r.suc_methode == "ADDWALLET") {
				showElement('addWalletButton');
		 		hideElement('addWalletButtonLoader');
		 		showElement('alertAddWalletSuccess');
		 		getAllWallets();
		 		//$('#modalAjoutPortefeuille').modal('hide');		 		
			}else {
				document.getElementById('alertAddWalletFail').style.display = "";
			}
		}
	}
};

addWallet.start();
