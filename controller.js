/**
 * Web Interface to browse through concepts of several Knowledge Organization Systems.
 */
var browse = angular.module('Browser', ['ngSKOS', 'ui.bootstrap']);

browse.constant('CONFIG', {
    baseURL: 'https://jskos-php-examples.herokuapp.com/'
});

browse.run(['$rootScope','$http','CONFIG',function($rootScope,$http,CONFIG) {
    $rootScope.baseURL = CONFIG.baseURL;
    $http.get(CONFIG.baseURL).success(function(data){
        $rootScope.database = data;
    });
}]);

browse.controller('conceptBrowserController', ['$scope','$http','$q','CONFIG', function ($scope, $http, $q, CONFIG){
  $scope.schemes = [ 
    { prefLabel: { de:"Gemeinsame Normdatei"}, bartoc: "http://bartoc.org/en/node/430", url:"http://www.dnb.de/DE/Standardisierung/GND/gnd_node.html", php: "GND.php"},
    { prefLabel: { de:"Wikidata"}, bartoc: "http://bartoc.org/en/node/1940", url:"https://www.wikidata.org/", example:"http://www.wikidata.org/entity/Q36578", php: "Wikidata.php"}
  ];
  $scope.activeScheme = {};
    
  $scope.status = {
    isopen: false
  };
  $scope.selectScheme = function(scheme){
    $scope.activeScheme = scheme;
    $scope.activeURI = scheme.example;
  }
  $scope.activeURI = "";
  $scope.activeConcept = {};
  
  $scope.getConcept = function(uri){
    var concept = { uri: uri };
    var deferred = $q.defer();
    var promise = $http.get(CONFIG.baseURL + $scope.activeScheme.php, { 
        params: { uri: $scope.activeURI },
    }).success(function(data, status, headers) {
        $scope.retrievedConcept = data;
        if(data.broader){
          angular.forEach(data.broader, function(br){
            if(!br.prefLabel){
              $http.get(CONFIG.baseURL + $scope.activeScheme.php + br.uri).success(function(cbr){
                br.prefLabel = angular.copy(cbr.prefLabel);
              });
            }
          });
        }
        if(data.narrower){
          angular.forEach(data.narrower, function(na){
            if(!na.prefLabel){
              $http.get(CONFIG.baseURL + $scope.activeScheme.php + br.uri).success(function(cna){
                na.prefLabel = angular.copy(cna.prefLabel);
              });
            }
          });
        }
        deferred.resolve(concept);
    }).error(function(data, status, headers){
        $scope.httpError = data ? data : {
            message: "HTTP request failed."
        };
    });
  }
  
  
  
  
  
  $scope.toggled = function(open) {
    $log.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };
}])
