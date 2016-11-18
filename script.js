
// La map a afficher 
var map;	
// Les markers  affich à l'écran 
var markerBounds; 

var tab_markers =[];


//Cette fonction initialise la map 
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 11
  });

}	

// Cette fonction permet de calculer la distance entre deux points, prend des Latlng google maps en entrée 
function distance(point_a,point_b){
	return Math.pow(point_a.lat() - point_b.lat(),2) + Math.pow(point_a.lng() - point_b.lng(),2); 
}

//Cette fonction enlève les markers du tableau de lamap 
function clean(tab_markers){
	for (var i = 0; i < tab_markers.length; i++) {
    tab_markers[i].setMap(null);
  }
}

// Cette fonction permet de calculer un barycentre elle prend en parametre un tableau de latitude, de longitude, le nbr d'amis et les poids à attribuer
function calcul_bary(users_array,poids){
	//Calcule du barycentre
    	var lat_bary = 0;
    	var long_bary = 0;
    	
    	for(var i = 0; i < users_array.length ; i++){
    		pd_temp = poids[i];
    		lat_bary = lat_bary + pd_temp*users_array[i].lat();
    		long_bary = long_bary + pd_temp*users_array[i].lng();
    	};
    	var sum = somme(poids);
    	lat_bary = lat_bary/sum;
    	long_bary = long_bary/sum;
    	var origin = new google.maps.LatLng(lat_bary,long_bary);
    	return origin;
}

//Cette fonction calcule la moyenne d'un tableau
function moyenne(tab){
	var mean=0;
	for(var i = 0; i < tab.length ; i++){
		mean = mean + tab[i];
	}
	return mean/tab.length;
}
//Cette fonction retourne la somme d'un tableau 

function somme(tab){
	var sum = 0;
	for (var i = 0; i < tab.length; i++){
		sum = sum + tab[i];
	}
	return sum;
}

//Cette fonction test si le tableau des temps de trajets est suffisamment lisse
function test_tableau(tab){
	//On calcule la moyenne
	
	mean = moyenne(tab);
	for(var i = 0; i < tab.length ; i++){
		if(tab[i] > 1.2*mean ){
			return false
		}
	}
	return true;
}


//Cette fonction v, à partir du tableau des temps de trajet,calculer un nouveau tableau de poids 

function calcul_poids(tab){
		var poids = [];
		mean = moyenne(tab);
	for(var i = 0; i < tab.length ; i++){
		if(tab[i] > 1.2*mean ){
			poids.push(1 + (tab[i] -mean)/mean)
		}
		else{
			poids.push(1);
		}

	}
	return poids;
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
    	markerBounds = new google.maps.LatLngBounds();
    	var users_array = [];
    	var moyen_transport = [];
    	var nbr_amis = parseFloat($('#nbr_amis').val());
    	var poids = [];

    	// On nettoie la map si on a déja utilisé le site 
    	clean(tab_markers);
    	tab_markers = [];
    	// On crée le tableau des poids 
    	for (var i =0; i < nbr_amis; i++){
    		poids.push(1);
    	};
    	//On récupère les valeurs de longitudes et latitudes ainsi que les moyens de transport
    	
    	for(var i = 1 ; i<=nbr_amis;i++){
    		users_array.push(new google.maps.LatLng(parseFloat($('#latitude_' + i.toString()).val()),parseFloat($('#longitude_' + i.toString()).val())));
    		var text = $('#transport_' + i.toString()).val();
    		moyen_transport.push(text);;
    	};

    	//On ajoute chque utilisateur à la map
    	

    	for(var i =0; i <users_array.length;i++){
    		var latlng = users_array[i];
    		markerBounds.extend(latlng);
    		var marker = new google.maps.Marker({
        		position: latlng,
        		map: map,
        		title : 'Utilisateur ' + (i+1).toString(),
        		label : (i + 1).toString()
    		});

    	tab_markers.push(marker);
    	};

    	
    	
    	var latlng_bary = calcul_bary(users_array,poids);
		//Evite les boucles infinies si erreur de code 
 		var compteur = 0;
		//

 //Ici on va calculer les temps de trajet 

		
 
		var service = new google.maps.DistanceMatrixService();
		
		service.getDistanceMatrix(
  			{
    			origins: users_array,
    			destinations: [latlng_bary],
    			travelMode: google.maps.TravelMode.DRIVING,
  			}, callback);


 		function callback(response, status) {
 			//On récupère le tableau des temps de trajet 
 			compteur = compteur +1 ;
  			if (status == google.maps.DistanceMatrixStatus.OK) {
  				console.log(response);
  				var temps_trajet = [];
    			var origins = response.originAddresses.length;
    			var destinations = response.destinationAddresses;

    			for (var i = 0; i < origins; i++) {
      				var results = response.rows[i].elements;
      				for (var j = 0; j < results.length; j++) {
        				var element = results[j];        				
        				var duration = element.duration.value;
        				temps_trajet.push(duration);
		      				}
    			}
    			console.log(temps_trajet);
    			console.log(test_tableau(temps_trajet));
    			if(!test_tableau(temps_trajet)){
    			//Dans ce cas il faut caluler un nouveau barycentre 
    			//On commence par calculer le nouveau tableau de poids  
    			poids = calcul_poids(temps_trajet);
    			console.log(poids);
    			console.log(latlng_bary.lat());
    			console.log(latlng_bary.lng());
    			//On calcul le nouveau barycentre 
    			latlng_bary = calcul_bary(users_array,poids);

    			console.log(latlng_bary.lat());
    			console.log(latlng_bary.lng());
    			console.log("salut");
    			}
 
				    		
  			}

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
    				var distance_temp = distance(latlng_bary,temp);

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
     		tab_markers.push(marker);
    }
  );
		}







	

    })


