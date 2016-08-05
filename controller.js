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

  // load concepts without labels or notations
  var loadLabels = function(concepts) {
    if (!concepts || !concepts.length) return;
    angular.forEach(concepts, function(c) {
      if (!c.uri) return;

      if (c.prefLabel) return; // TODO: check language tags first!
      if (c.notation && c.notation.length && c.notation[0] !== null) return;

      $http.get( $scope.activeScheme.concepts + "?uri=" + c.uri + "&properties=prefLabel,notation")
      .then(function(response) {
        var got = response.data[0];
        if (!got) return; // not found
        // TODO: better merge instead of overwriting
        c.prefLabel = got.prefLabel;
        c.notation  = got.notation;
      });
    });
  };

  $scope.getConcept = function(uri){
    $http.get( $scope.activeScheme.concepts, { 
        params: { uri: uri },
    }).success(function(data, status, headers) {
      var concept = data[0];
      if (concept) {
        var deferred = $q.defer();

        ['broader','narrower','related','previous','next','relatedPlace'].forEach(function(field) {
          loadLabels(concept[field]);
        });

        // TODO: get depiction
        // TODO: what about altLabel and other literals?
        // TODO: what about ancestors?
        // TODO: what about subjectOf?

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

