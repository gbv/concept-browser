/**
 * Web interface des Normdatendienst.
 */
var normdatendienst = angular.module('terminologiesUI',
    ['ngSKOS', 'ui.bootstrap', 'angular-loading-bar']);

// configure
normdatendienst.config(
  ['$httpProvider','cfpLoadingBarProvider','$locationProvider',
  function($httpProvider, cfpLoadingBarProvider, $locationProvider) {

  // TODO: explain this
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  // loading bar, shown during each HTTP request
  cfpLoadingBarProvider.includeSpinner = false;
  cfpLoadingBarProvider.parentSelector = '#loading-bar-container';

  // use query parameter URLs in browsing history
  $locationProvider.html5Mode({enabled:true,requireBase:false});
}]);

/**
 * Show license information in short form.
 **/
normdatendienst.directive('licenseButton', function() {
  // TODO: load from another service
  var licenses = {
    'http://creativecommons.org/publicdomain/zero/1.0/': {
        img: 'http://mirrors.creativecommons.org/presskit/buttons/80x15/svg/publicdomain.svg', 
        notation: ['CC 0']
    },
    'http://creativecommons.org/licenses/by/3.0/': {
        img: 'http://mirrors.creativecommons.org/presskit/buttons/80x15/svg/by.svg',
        notation: ['CC BY']
    }
  };

  return {
    restrict: 'A',
    templateUrl: 'templates/license.html',
    scope: {
      uri: '=licenseButton',
    },
    link: function(scope) {
      function updateLicense() {
        scope.license = licenses[scope.uri];
        // TODO: handle unknown license
      }
      scope.$watch('licenses', updateLicense);
      scope.$watch('uri', updateLicense);
    }
  };
});

normdatendienst.directive('schemeInfo', function() {
  return {
    restrict: 'A',
    templateUrl: 'templates/scheme.html',
    scope: {
      scheme: '=schemeInfo',
    }
  };
});

normdatendienst.controller('ConceptBrowserController',
  ['$scope','$http','$httpParamSerializer','$location','$q', '$sce','$timeout',
  function ($scope, $http, $httpParamSerializer, $location, $q, $sce, $timeout) {

  // configure base URL
  if (!$scope.baseURL) {
    $scope.baseURL = 'http://localhost:8080/';
  }

  var statusMessage = function(html) {
     $scope.$parent.status = $sce.trustAsHtml(html);
  }

  $scope.schemeInfo = false;
  $scope.showSchemeInfo = function(){
    $scope.schemeInfo = !$scope.schemeInfo;
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
    $scope.selectScheme(searchedScheme(), $location.search().concept);

    statusMessage("got list of concept schemes from <a href='"+schemesURL+"'>"+schemesURL+"</a>");
  }, function(response) {
    statusMessage("failed to load list of concept schemes");
  });

  // further initalization of controller
  $scope.activeConcept = null;
  $scope.schemeDetails = null;
  $scope.status = {
    isopen: false
  };
  $scope.language = "de";

  $scope.selectURI = function(uri){
    $scope.activeURI = angular.copy(uri);
  }

  // select a(nother) concept scheme
  $scope.selectScheme = function(scheme, example) {
    if (!scheme) scheme = $scope.schemes[0];
    if (!scheme || $scope.activeScheme === scheme) return;

    $scope.schemeDetails = null;
    $scope.activeScheme  = scheme;
    $scope.activeConcept = null;
    $scope.getSchemeDetails(scheme.uri);

    if (!example) example = scheme.example;    

    // update location
    $timeout(function () {
      $location.search({scheme:scheme.uri, concept: example});
    });
  }

  $scope.$on('$locationChangeSuccess', function() {
    $scope.selectScheme(searchedScheme());
    $scope.activeURI = $location.search().concept;
  });
   
  function searchedScheme() {
    var search = $location.search();
    return $scope.schemes.find(function(s) {
      return s.uri == search.scheme;
    });
  }

  // load concepts without labels or notations
  var loadLabels = function(concepts) {
    if (!concepts || !concepts.length) return;
    angular.forEach(concepts, function(c) {
      if (!c.uri) return;

      if (c.prefLabel) return; // TODO: check language tags first!
      if (c.notation && c.notation.length && c.notation[0] !== null) return;

      var url = $scope.activeScheme.concepts + "?uri=" + c.uri + "&properties=prefLabel,notation";
      $http.get( url )
      .then(function(response) {
        var got = response.data[0];
        if (!got) return; // not found
        // TODO: better merge instead of overwriting
        c.prefLabel = got.prefLabel;
        c.notation  = got.notation;
      });
    });
  };

  $scope.getConcept = function(uri) {

    // update location
    var scheme = $location.search().scheme;
    $location.search({scheme:scheme, concept:uri});

    var url = $scope.activeScheme.concepts + '?' + $httpParamSerializer({ uri:uri });
    $scope.apiURL = url;
    $http.get(url).success(function(data, status, headers) {
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
      if($scope.activeConcept){
        statusMessage("Konzept geladen");
      }else{
        statusMessage("Konzept nicht gefunden");
      }
    }).error(function(data, status, headers){
      statusMessage("HTTP-Anfrage fehlgeschlagen!");
    });
  }
  
  $scope.getSchemeDetails = function(uri){
    var url = $scope.baseURL + "BARTOC.php?" + $httpParamSerializer({ uri:uri });
    $http.get(url).success(function(data) {
      var scheme = data[0];
      if (scheme) {
        $scope.schemeDetails = scheme;
      }
    });
  }

  $scope.browseConcept = function(concept){
    $scope.getConcept(concept.uri);
  }

}]);

