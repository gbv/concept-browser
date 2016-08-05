/**
 * Web interface des Normdatendienst.
 */
var normdatendienst = angular.module('Normdatendienst', 
    ['ngSKOS', 'ui.bootstrap', 'angular-loading-bar']);

// configure
normdatendienst.config(['$httpProvider','cfpLoadingBarProvider', function($httpProvider, cfpLoadingBarProvider) {

  // TODO: explain this
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  // loading bar, shown during each HTTP request
  cfpLoadingBarProvider.includeSpinner = false;
  cfpLoadingBarProvider.parentSelector = '#loading-bar-container';

}]);

normdatendienst.controller('conceptBrowserController', ['$scope','$http','$q', '$sce', function ($scope, $http, $q, $sce) {

  // configure base URL
  if (!$scope.baseURL) {
    $scope.baseURL = 'http://localhost:8080/';
  }

  var statusMessage = function(html) {
     $scope.$parent.status = $sce.trustAsHtml(html);
  }

  // load list of known concept schemes
  statusMessage("initializing...");
  $scope.schemes = [];
  var schemesURL = 'schemes.json';
  $http.get(schemesURL).then(function(response){
    response.data.forEach(function(scheme) {
	  scheme.concepts = $scope.baseURL + scheme.concepts;
    });
    $scope.schemes = response.data;      
    $scope.selectScheme($scope.schemes[0]);
    statusMessage("got list of concept schemes from <a href='"+schemesURL+"'>"+schemesURL+"</a>");
  }, function(response) {
    statusMessage("failed to load list of concept schemes");
  });

  // further initalization of controller
  $scope.activeConcept = null;
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
    $http.get( $scope.activeScheme.concepts, { 
        params: { uri: uri },
    }).success(function(data, status, headers) {
      var concept = data[0];
      if (concept) {
        var deferred = $q.defer();
        if (concept.broader){
          angular.forEach(concept.broader, function(br){
            $http.get( $scope.activeScheme.concepts + "?uri=" + br.uri).then(function(response){
              if(response.data[0].prefLabel){
                br.prefLabel = angular.copy(response.data[0].prefLabel);
                angular.forEach(br.prefLabel, function(label, lang){
                  if(angular.isArray(label)){
                    br.prefLabel[lang] = label[0];
                  }
                });
              }
              if(response.data[0].notation){
                br.notation = angular.copy(response.data[0].notation);
              }
            });
          });
        }
        if (concept.narrower){
          angular.forEach(concept.narrower, function(na){
            if(!na.prefLabel){
              $http.get( $scope.activeScheme.concepts + "?uri=" + na.uri).then(function(response){
                if(response.data[0].prefLabel){
                  na.prefLabel = angular.copy(response.data[0].prefLabel);
                  angular.forEach(na.prefLabel, function(label, lang){
                    if(angular.isArray(label)){
                      na.prefLabel[lang] = label[0];
                    }
                  });
                }
                if(response.data[0].notation){
                  na.notation = angular.copy(response.data[0].notation);
                }
              });
            }
          });
        }
        deferred.resolve(concept);
      }
      $scope.activeConcept = concept;
      statusMessage("Konzept geladen");
    }).error(function(data, status, headers){
      statusMessage("HTTP-Anfrage fehlgeschlagen!");
    });
  }

  $scope.browseConcept = function(concept){
    $scope.getConcept(concept.uri);
  }
  
}]);

