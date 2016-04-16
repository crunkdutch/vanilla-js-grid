var songlistURL = 'https://shielded-island-48078.herokuapp.com/music-direct/songs/list';
var itunesURL = 'https://shielded-island-48078.herokuapp.com/itunes/songs/list';
var amazonURL = 'https://shielded-island-48078.herokuapp.com/amazon/songs/list';

var loadedCounter = 0;
var gridArray = [];

var interval;
var songsResponse;
var itunesResponse;
var amazonResponse;

window.onload = function() {
	loader.getData(songlistURL); 
	loader.getData(itunesURL); 
	loader.getData(amazonURL); 
	
	interval = window.setInterval(app.checkIfLoaded, 100);
}

var loader = {
	getData : function(path){
		var xhrRequest = new XMLHttpRequest();
		xhrRequest.open('GET', path);
		xhrRequest.send(null);

		xhrRequest.onreadystatechange = function() {
			if (xhrRequest.readyState === 4){
				if (xhrRequest.status === 200){
			      	if (xhrRequest.responseURL === songlistURL){
				      	songsResponse = JSON.parse(xhrRequest.responseText);
				      	loadedCounter++;
			    	}
			    	if (xhrRequest.responseURL === itunesURL){
				      	itunesResponse = JSON.parse(xhrRequest.responseText);
				      	loadedCounter++;
			    	}
			    	if (xhrRequest.responseURL === amazonURL){
				      	amazonResponse = JSON.parse(xhrRequest.responseText);
				      	loadedCounter++;
			    	}
				} 
				else {
					//show some fail state
					grid.innerHTML = 'Service failed to load. Try again later.';
					window.clearInterval(interval);
				}
			}
		}
	}
}

var app = {
	initGrid : function(dataObject) {
		for (var i = 0; i < dataObject.length; i++){
			if (app.checkItunesPrice(dataObject[i].sku) === undefined) {
				price = "N/A";
			}
			else{
				price = '$' + app.checkItunesPrice(dataObject[i].sku);
			}

			var gridObject = new Object();
			gridObject.track = dataObject[i].name;
			gridObject.artist = dataObject[i].artist;
			gridObject.amazonPrice = app.checkAmazonPrice(dataObject[i].sku);
			gridObject.itunesPrice = price;
			gridArray.push(gridObject);
		}

		app.setGridArray(gridArray);

		price_box.addEventListener('change', app.showSortedPrices);
		btn_search.addEventListener('click', app.filterByArtist)
	},

	setGridArray : function(arr){
		for (var i = 0; i < arr.length; i++){
			var theGrid = "<div class='row' id="+i+">" + 
				"<p class='bold'>" + Number(Number(i)+1) + ".</p>" + 
				"<p>track name : </p>" + "<p class='bold'>" + arr[i].track + "</p>" + 
				"<p>artist name : </p>" + "<p class='bold'>" + arr[i].artist + "</p>" +
				"<p>itunes prices : </p>" +  "<p class='bold'>" + arr[i].itunesPrice + "</p>" +
				"<p>amazon prices : </p>" + "<p class='bold'>$" + arr[i].amazonPrice + "</p>" +
				"</div>";	

			grid.innerHTML += theGrid;
		}
	},

	checkIfLoaded : function(){
        if (loadedCounter === 3){ 
           	window.clearInterval(interval);
           	loading_info.style.display = 'none';
           	app.initGrid(songsResponse['songs']);   
        }
    },

	checkAmazonPrice : function(val) {
		for (var i = 0; i < amazonResponse['songs'].length; i++){
			if (val === amazonResponse['songs'][i].sku){
				return Number(amazonResponse['songs'][i].price);
			}		
		}
	},

	checkItunesPrice : function(val) {
		for (var i = 0; i < itunesResponse['songs'].length; i++){
			if (val === itunesResponse['songs'][i].sku){
				return Number(itunesResponse['songs'][i].price); 
			}
		}
	},

	showSortedPrices : function() {
		var value = document.getElementById('price_box').value;
		if (value === 'low'){ 
			gridArray.sort(function(a, b){
				if (a.itunesPrice > b.itunesPrice) {
					return 1;
				}
				if (a.itunesPrice < b.itunesPrice) {
				    return -1;
				}
				  // a must be equal to b
				return 0;
			});	
		}

		while (grid.firstChild) {
			grid.removeChild(grid.firstChild);
		}

		app.setGridArray(gridArray);
	},

	filterByArtist : function(event) {
		while (grid.firstChild) {
			grid.removeChild(grid.firstChild);
		}

		if (filter_box.value.length < 1 || filter_box.value === 'ENTER AN ARTIST NAME'){
			filter_box.value = 'ENTER AN ARTIST NAME';
			app.setGridArray(gridArray);
			return;	
		}

		var tester = filter_box.value.toLowerCase();

		for (var i = 0; i < gridArray.length; i++){
			var checker = gridArray[i].artist.toLowerCase();
			if (tester === checker){
				var theGrid = "<div class='row' id="+i+">" + 
					"<p class='bold'>" + Number(Number(i)+1) + ".</p>" + 
					"<p>track name : </p>" + "<p class='bold'>" + gridArray[i].track + "</p>" + 
					"<p>artist name : </p>" + "<p class='bold'>" + gridArray[i].artist + "</p>" +
					"<p>itunes prices : </p>" +  "<p class='bold'>" + gridArray[i].itunesPrice + "</p>" +
					"<p>amazon prices : </p>" + "<p class='bold'>$" + gridArray[i].amazonPrice + "</p>" +
					"</div>";	

				grid.innerHTML += theGrid;
			}
		}
	}
}