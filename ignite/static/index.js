var Module = angular.module('testApp', []);

Module.controller('MyController',['$scope',     
function($scope) {   
    var myCtrl = this;
    myCtrl.tab = 'home';
    console.log($scope)

    myCtrl.isSet = function(checkTab) {        
        return myCtrl.tab === checkTab;
    };

    myCtrl.setTab = function(setTab) {
        console.log('MapPage directive loaded');
        myCtrl.tab = setTab;
    };
    
    myCtrl.initMap = function() {
        console.log('myCtrl.initMap() - map initialised as window load event has been fired');       
        
        var mapOptions = {
            zoom: 12,
            center: {lat: 12.9356, lng: 77.7023},
        };

        myCtrl.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

       
          var directionsService = new google.maps.DirectionsService;
          var directionsDisplay = new google.maps.DirectionsRenderer;
          directionsDisplay.setMap(myCtrl.map);

          var origin_input = document.getElementById('origin-input');
          var destination_input = document.getElementById('destination-input');
          var modes = document.getElementById('mode-selector');

          myCtrl.map.controls[google.maps.ControlPosition.TOP_LEFT].push(origin_input);
          myCtrl.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destination_input);
          myCtrl.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modes);

          var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
          origin_autocomplete.bindTo('bounds', myCtrl.map);
          var destination_autocomplete =
              new google.maps.places.Autocomplete(destination_input);
          destination_autocomplete.bindTo('bounds', myCtrl.map);


    }
        
    google.maps.event.addDomListener(window, 'click', myCtrl.initMap);
    console.log('google.maps.event.addDomListener() - listener configured for window load event');
}]);

Module.directive('mapPage', function() {
    return {
        restrict: 'E',
        template: '<div id="map-canvas"></div>'
    };
});
