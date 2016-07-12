/**
 * Web Interface to browse through concepts of several Knowledge Organization Systems.
 */
var browse = angular.module('Browser', ['ngSKOS', 'ui.bootstrap']);

browse.constant('CONFIG', {
    baseURL: 'http://lvh.me:8080/'
});

browse.run(['$rootScope','$http','CONFIG',function($rootScope,$http,CONFIG) {
    $rootScope.baseURL = CONFIG.baseURL;
    $http.get(CONFIG.baseURL).success(function(data){
        $rootScope.database = data;
    });
}]);

browse.controller('conceptBrowserController', ['$scope','$http','$q','CONFIG', function ($scope, $http, $q, CONFIG){
  $scope.schemes = [ 
    { prefLabel: { de:"Gemeinsame Normdatei"}, bartoc: "http://bartoc.org/en/node/430", url:"http://www.dnb.de/DE/Standardisierung/GND/gnd_node.html", example:"http://d-nb.info/gnd/4189143-0", php: "GND.php"},
    { prefLabel: { en:"Wikidata"}, bartoc: "http://bartoc.org/en/node/1940", url:"https://www.wikidata.org/", example:"http://www.wikidata.org/entity/Q36578", php: "Wikidata.php"},
    { prefLabel: { en:"Iconclass"}, bartoc: "http://bartoc.org/en/node/459", url:"http://www.iconclass.nl/home", example:"http://iconclass.org/25F23(LION)(%2B46)", php:"Iconclass.php"},
    { prefLabel: { en:"Melvil Decimal Classification"}, bartoc:"http://bartoc.org/en/node/2040", url:"https://www.librarything.com/mds/", example:"http://www.librarything.com/mds/569.8", php: "MDS.php"},
    { prefLabel: { en:"VIAF"}, url:"http://www.viaf.org/", example:"http://viaf.org/viaf/87772061", php:"VIAF.php"},
    { prefLabel: { en:"Europeana OpenSKOS API"}, example:"http://id.loc.gov/authorities/subjects/sh2007003224", url:"http://skos.europeana.eu/api", php: "OpenSKOS.php"},
    { prefLabel: { en:"Geonames"}, example:"http://sws.geonames.org/2918632/", url:"http://www.geonames.org/", bartoc:"http://bartoc.org/en/node/1674", php:"Geonames.php"},
    { prefLabel: { de:"BARTOC"}, example:"http://bartoc.org/en/node/109", url:"http://bartoc.org/", php:"BARTOC.php"}
  ];
  $scope.activeScheme = $scope.schemes[3];
  $scope.activeURI = $scope.schemes[3].example;
  $scope.activeConcept = null;
  $scope.loading = false;
  $scope.status = {
    isopen: false
  };
  $scope.language = "en";
  $scope.selectURI = function(uri){
    $scope.activeURI = angular.copy(uri);
  }
  $scope.selectScheme = function(scheme){
    $scope.activeScheme = scheme;
    $scope.activeConcept = null;
    $scope.activeURI = "";
    if(scheme.example){
      $scope.activeURI = angular.copy(scheme.example);
    }
  }
  
  $scope.getConcept = function(uri){
    $scope.loading = true;
    $http.get(CONFIG.baseURL + $scope.activeScheme.php, { 
        params: { uri: uri },
    }).success(function(data, status, headers) {
      if(data.length){
        var concept = data[0];
        var deferred = $q.defer();
        if(concept.broader){
          angular.forEach(concept.broader, function(br){
            $http.get(CONFIG.baseURL + $scope.activeScheme.php + "?uri=" + br.uri).then(function(response){
              br.prefLabel = angular.copy(response.data[0].prefLabel);
            });
          });
        }
        if(concept.narrower){
          angular.forEach(concept.narrower, function(na){
            if(!na.prefLabel){
              $http.get(CONFIG.baseURL + $scope.activeScheme.php + "?uri=" + na.uri).then(function(response){
                na.prefLabel = angular.copy(response.data[0].prefLabel);
              });
            }
          });
        }
        deferred.resolve(concept);
        $scope.activeConcept = concept;
      }
    }).error(function(data, status, headers){
        $scope.httpError = data ? data : {
            message: "HTTP request failed."
        };
    }).finally(function(){
      $scope.loading = false;
    });
  }
  $scope.browseConcept = function(concept){
    $scope.activeConcept = null;
    $scope.getConcept(concept.uri);
  }
  
  $scope.toggled = function(open) {
    $log.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };
}]);

browse.config(['$httpProvider', function($httpProvider) {

  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);
