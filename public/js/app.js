
var currentAddr = "";
var amount; 
var reason;
var jsondata;
var api = "";
var host = "";
var callbackurl = "";
var hystory = [];
var currentTransactions = null;
var progressbar ;
var err = true;
var id = 0;
var items = { "Apple" : 300, "Banana" : 200, "Chocolate" : 600 , "Beer" : 100, "Carrot" : 100, "Lattuce": 100 };

function sendData() {

  if(err) {
	alert("there is an error");
	return;
  }
  
  //random id for transaction
  id = Math.random().toString(36).substring(3);
  
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
	  var data = JSON.parse( this.responseText);
	  //get QR Code
      document.getElementById("result").innerHTML ="<img src ="+data.qrCode+"/></img>";
	  document.getElementById("result").innerHTML+= "<h6> PaymentID: "+ id+"</h6>"; 
	  document.getElementById("result").innerHTML+= "<h5>"+ "You will be paying "+ amount + "TRTL </h5><h6>Payment Reason:"+reason+"</h6>";
	  document.getElementById("result").innerHTML+= "<button class='btn btn-primary btn-block pay' onclick='resetScreen()'>New Payment</button>"
	  //hystory
	  var transaction = { "id" : id , "reason" : reason, "amount" : amount} ;
	  hystory.push( transaction );
	  sendTransaction( transaction );
	  progressbar.style.width="0%";
    }
  };
  progressbar =  document.getElementById("progress_bar");
  progressbar.style.width="50%";
  amount = document.getElementById("amount").value;
  reason = document.getElementById("reason").value;
  jsondata = { "address" : currentAddr , "amount" : amount, "name" : id, callback : host+callbackurl};
  xhttp.open("POST", api , true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send(JSON.stringify(jsondata));
}

function getEnvData(){
var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        envdata = JSON.parse( this.responseText);
		if(envdata !=null ) { 
			err = false;
			currentAddr = envdata.address;
			host = envdata.host;
			callbackurl = envdata.callback;
			api = envdata.api;
		}
		else{
			err = true;
		}
    }
  };
  xhttp.open("GET", "/env", true);
  xhttp.send();
}

function getTransactions(){
var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        currentTransactions = JSON.parse( this.responseText);
		var tkeys = Object.keys( currentTransactions );
		document.getElementById("tran-pending").innerHTML = "";
		document.getElementById("tran-successful").innerHTML = "";
		
		for( t=0 ; t< tkeys.length ; t++)
		{
			if(currentTransactions[tkeys[t]] == 1){
				//confirmed transaction 
				document.getElementById("tran-successful").innerHTML+= "<button id='"+tkeys[t]+"' class='btn btn-success'>"+tkeys[t]+"</button>";
			}
			else{
				//pending
				document.getElementById("tran-pending").innerHTML+= "<button id='"+tkeys[t]+"' class='btn btn-secondary'>"+tkeys[t]+"</button>";
			}
		}
		
    }
  };
  xhttp.open("GET", "/transactions", true);
  xhttp.send();
}
function sendTransaction(tran) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    }
  };
  xhttp.open("GET", "/save?name="+tran.id, true);
  xhttp.send();
}

function numHit(num)
{
	var current= document.getElementById("amount").value;
	if(parseInt(num) >= 0){
		document.getElementById("amount").value = current + num;
	}
	if(parseInt(num) == -1){
		document.getElementById("amount").value = current.substring(0, current.length - 1);
	}
}

function buildItems(){
	var itemcontainer = document.getElementById("item-container");
	var keys = Object.keys( items );
	for(i = 0; i< keys.length; i++){
		itemcontainer.innerHTML += "<button id='available"+i+"' onclick='addItem("+i+")' class='btn btn-success items'>"+keys[i]+" [+] </button>";
	}
}

function addItem(itemId){
	var current = document.getElementById("amount").value;
	var keys = Object.keys( items );
	var price = items[keys[itemId]];
	
	if( current.length == 0  ){
		document.getElementById("amount").value = price;
	}
	else{
		current = parseInt( current );
		document.getElementById("amount").value = current + price;
	}
	
	//add the item	
	var currentcontainer = document.getElementById("current-items");
	currentcontainer.innerHTML += "<button id='added"+itemId+"' onclick='removeItem("+itemId+")' class='btn btn-warning items'>"+keys[itemId]+" [-] </button>";
}

function removeItem(itemId){
	var current = document.getElementById("amount").value;
	var keys = Object.keys( items );
	var price = items[keys[itemId]];
	
	if( current.length == 0  ){
	}
	else{
		current = parseInt( current );
		if(current >= 0)
		{
			document.getElementById("amount").value = current - price;
			if(current - price < 0 ){
			document.getElementById("amount").value = 0;
			}
		}
		
	}
	
	//add the item	
	var id_to_be_removed = "added"+itemId;
	var currentcontainer = document.getElementById(id_to_be_removed).remove();
}

function resetScreen(){
	document.getElementById("amount").value = 0;
	document.getElementById("current-items").innerHTML = "";
	document.getElementById("result").innerHTML ="<img  height='150px' width='150px' src ='/images/turtle.png'/></img>";
}


document.addEventListener("DOMContentLoaded", function() {
	buildItems();
	getEnvData();
	//main loop 
	setInterval( function(){ 
		getTransactions();
		getEnvData();
	} , 10000);

});



