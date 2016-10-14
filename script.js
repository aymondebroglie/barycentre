

var map;
var markerBounds; 
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 11
  });
  markerBounds = new google.maps.LatLngBounds();
}	

jQuery(function($){
    // notre code ici

    $('#parti').click(function(){

    	var nbr_amis = parseFloat($('#nbr_amis').val());
    	var message='';
    	for (var i = 1; i <= nbr_amis; i++) {
    	var message =message + '<h4>Coordonées</h4> <h4>Latitude</h4> <input type="text" name="Latitude" id="latitude_' + i.toString() + '"> <h4>Longitude</h4> <input type="text" name="Longitude" id="longitude_'+i.toString() + '"> <br>';

    	}

    $('#usagers').html(message) ;	
    });

    $('#submit').click(function(){
    	var lat_array = [];
    	var long_array = [];
    	var nbr_amis = parseFloat($('#nbr_amis').val());
    	//On récupère les valeurs de longitudes et latitudes
    	for(var i = 1 ; i<=nbr_amis;i++){
    		long_array.push(parseFloat($('#longitude_' + i.toString()).val()));
    		lat_array.push(parseFloat($('#latitude_' + i.toString()).val()));
    	};
    	
    	var lat_bary = 0;
    	var long_bary = 0;
    	//Calcule du barycentre
    	for(var i = 0; i < lat_array.length ; i++){
    		 lat_bary = lat_bary + lat_array[i];
    		 long_bary = long_bary + long_array[i];
    	}
    	
    	 lat_bary = lat_bary/nbr_amis;
    	 long_bary = long_bary/nbr_amis;
    	 console.log(lat_bary)
    	//On les ajoute a la map
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

// On ajoute le barycentre 

	var latlng_bary = new google.maps.LatLng(lat_bary,long_bary);
    		markerBounds.extend(latlng_bary);
    		var marker = new google.maps.Marker({
        		position: latlng_bary,
        		map: map,
        		title : 'Barycentre',
        		label : 'B'
    		});
    // 	 var latLng1 = new google.maps.LatLng(lat1, long1);
    // 	 var latLng2 = new google.maps.LatLng(lat2, long2);
    // 	 var latLng_bary = new google.maps.LatLng(lat_bary,long_bary)
    // 	 markerBounds.extend(latLng1);
    // 	 markerBounds.extend(latLng2);
    // 	 markerBounds.extend(latLng_bary);

    // var Marker1 = new google.maps.Marker({
    //     position: latLng1,
    //     map: map,
    //     title : 'Utilisateur 1',
    //     label : '1'
    // });

    // var Marker2 = new google.maps.Marker({
    //     position: latLng2,
    //     map: map,
    //     title : 'Utilisateur 2',
    //     label : '2'
    // });

    // var Marker3 = new google.maps.Marker({
    //     position: latLng_bary,
    //     map: map,
    //     title : 'Barycentre',
    //     label : 'B'
    // });

	
    map.fitBounds(markerBounds);
    })
});


