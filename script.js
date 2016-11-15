
// La map a afficher 
var map;	
// Les markers  afficher à l'écran 
var markerBounds; 


//Cette fonction initialise la map 
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 11
  });
  markerBounds = new google.maps.LatLngBounds();
}	

// Cette fonction permet de calculer la distance entre deux points, prend des Latlng google maps en entrée 
function distance(point_a,point_b){
	console.log(Math.pow(point_a.lat() - point_b.lat(),2) + Math.pow(point_a.lng() - point_b.lng(),2));
	return Math.pow(point_a.lat() - point_b.lat(),2) + Math.pow(point_a.lng() - point_b.lng(),2); 
}

function calcul_bary(lat_array,long_array,nbr_amis,poids){
	//Calcule du barycentre
    	var lat_bary = 0;
    	var long_bary = 0;
    	
    	for(var i = 0; i < lat_array.length ; i++){
    		pd_temp = poids[i];
    		lat_bary = lat_bary + pd_temp*lat_array[i];
    		long_bary = long_bary + pd_temp*long_array[i];
    	};
    	
    	lat_bary = lat_bary/nbr_amis;
    	long_bary = long_bary/nbr_amis;
    	var origin = new google.maps.LatLng(lat_bary,long_bary);
    	return origin;
}


// Si on clique sur c'est parti affiche un formulaire par participant
    $('#parti').click(function(){

    	var nbr_amis = parseFloat($('#nbr_amis').val());
    	var message='';

    	for (var i = 1; i <= nbr_amis; i++) {
    		var message =message + '<h4>Coordonées</h4> <h4>Latitude</h4> <input type="text" name="Latitude" id="latitude_' + i.toString() + '"> <h4>Longitude</h4> <input type="text" name="Longitude" id="longitude_'+i.toString() + '"> <br>';
    		message = message + '<select name="moyens_de_transport" id="transport_' + i.toString() + '"> <option> Marche </option> <option> Voiture </option> <option> Transport en commun </option>  </select>'
    		}

    	$('#usagers').html(message);

    	});

    // Tout le déroulement quand on appuis sur submit  
    $('#submit').click(function(){

    	var lat_array = [];
    	var long_array = [];
    	var moyen_transport = [];
    	var nbr_amis = parseFloat($('#nbr_amis').val());
    	var poids = [];
    	// On crée le tableau des poids 
    	for (var i =0; i < nbr_amis; i++){
    		poids.push(1);
    	};
    	//On récupère les valeurs de longitudes et latitudes ainsi que les moyens de transport
    	
    	for(var i = 1 ; i<=nbr_amis;i++){
    		long_array.push(parseFloat($('#longitude_' + i.toString()).val()));
    		lat_array.push(parseFloat($('#latitude_' + i.toString()).val()));
    		var text = $('#transport_' + i.toString()).val();
    		moyen_transport.push(text);;
    	};

    	//On ajoute chque utilisateur à la map
    	var tab_markers = [];

    	for(var i =0; i <lat_array.length;i++){
    		var latlng = new google.maps.LatLng(lat_array[i],long_array[i]);
    		markerBounds.extend(latlng);
    		var marker = new google.maps.Marker({
        		position: latlng,
        		map: map,
        		title : 'Utilisateur ' + (i+1).toString(),
        		label : (i + 1).toString()
    		});
    	};


    	
    	
    	var origin = calcul_bary(lat_array,long_array,nbr_amis,poids);
		var latlng_bary = origin;
 
    	

// On cherche la station de métro la plus proche si elle existe 
	
	
		var request = {
    	location: latlng_bary,
    	radius: '2000',
    	types: ['subway_station']
  		};

  		var service = new google.maps.places.PlacesService(map);
  	
  		service.nearbySearch(request, function(results, status) {

    		if (status == google.maps.places.PlacesServiceStatus.OK) {
    		//On choisist la station de metro la plus proche
    			var dist_min = Number.MAX_VALUE;
    			var temp;
    			for(var i =0; i < results.length ; i++){
    				temp = results[i].geometry.location;
    				var distance_temp = distance(origin,temp);

    				if( distance_temp < dist_min){
    					latlng_bary = temp;
    					dist_min = distance_temp;
    					}
        
       
    				};
      			}
      // On ajoute le barycentre 

      		markerBounds.extend(latlng_bary);
    			var marker = new google.maps.Marker({
        			position: latlng_bary,
        			map: map,
        			title : 'Barycentre',
        			label : 'B'
    			});
     		map.fitBounds(markerBounds);
    }
  );



	

    })


