
HTMLElement.prototype.has_class = function (c) {
    return (this.className.indexOf(c) >= 0);
};

//return attribute value in the URL, given attribute name
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness  
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

//delete all cookie of the webpage
var eraseCookie= function(){
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    document.location.href="../index.html";
};

//set style diplay to 'none' to an element, given his id
var hideElement = function(elementId){
    document.getElementById(elementId).style.display = 'none'; 
};

//set style display to 'inline' to an element, given his id
var showElement = function(elementId){
    document.getElementById(elementId).style.display = '';   
};

//show first element and hide second one, given their id
var hideShowElements = function(elementId_1, elementId_2){
    document.getElementById(elementId_1).style.display = '';
    document.getElementById(elementId_2).style.display = 'none';
};

//return the value of given element id
var getElementValue = function(elementId){
    return document.getElementById(elementId).value;
};

//return the value of given element id
var setElementValue = function(elementId, value){
    document.getElementById(elementId).value = value;
};


//show administrator message at top of the page with text message and type of alert (warning, success...)
var showAdminMessage = function(message, type){
    var str = "";
    type = ""+type;
    str = '<div class="alert alert-'+type+' alert-dismissible" role="alert">'
        +'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
        +'<strong>Message de l\'admin :</strong></br>'+message
        +'</div>';
    document.getElementById('id_afficher_message_admin').innerHTML = str;
}