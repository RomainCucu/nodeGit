var signin = {};//objet pour afficher les entreprise

signin.start = function(){
	signin.formAction();
};

signin.formAction = function(){
	document.getElementById('formSignin').onsubmit = function(event){
		document.getElementById('signinAjaxLoader').innerHTML ='<img class="col-md-offset-6" src="../images/ajax-loader.gif" width="60" height="60" />';
		var formLogin = document.getElementById('formLogin').value;
		var formPassword = document.getElementById('formPassword').value;
		var formRememberMe = document.getElementById('formRememberMe').checked;
		signin.post({action:'signin',formLogin:formLogin,formPassword:formPassword, formRememberMe:formRememberMe}, signin.log_callback);
		event.preventDefault();
	};
};

signin.post = function (data, callback) {	
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/");
    xhr.onreadystatechange = callback;
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
};

signin.log_callback = function () {
	if (this.readyState == 4 && this.status == 200) {
		var r = JSON.parse(this.responseText);		
		if (r.categorie == "SUCCESS"){
			if(r.suc_methode == "SIGNIN"){
				console.log('connected !');
				window.location = "/html/accueil.html";
			}			
		}else if(r.categorie == "ERROR"){
			if(r.err_methode == "SIGNIN"){
				console.log(r.err_message);
				console.log(r.err_ligne);
				document.getElementById("signinAjaxLoader").innerHTML='<button class="btn btn-lg btn-primary btn-block" type="submit" id="signinButton" >Sign in</button><div id="signinError" class="text-danger"></div>';
				document.getElementById("signinError").innerHTML="Your login or password are false.";
			}			
		}
	}
};

window.onload = function(){
	signin.start();
};