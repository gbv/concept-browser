/**
 * Web interface des Normdatendienst.
 */
var app = angular.module('terminologiesUI',
    ['ngSKOS', 'ui.bootstrap', 'angular-loading-bar', 'ngMessages']);

// configure
app.config(
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
 * Load list of licenses from static JSKOS file.
 */
app.run(['$rootScope','$http', function($rootScope, $http) {
  $http.get('lib/licenses.json').then(function(response) {
    $rootScope.licenses = {};
    angular.forEach( response.data.concepts, function(license) {
      $rootScope.licenses[license.uri] = license;
    });
  });
}]);

/**
 * Show license information in short form.
 **/
app.directive('licenseButton', function() {
  return {
    restrict: 'A',
    templateUrl: 'templates/license.html',
    scope: { license: '=licenseButton' }
  };
});

/**
 * Show concept scheme information in long form.
 */
app.directive('schemeInfo', function() {
  return {
    restrict: 'A',
    templateUrl: 'templates/scheme.html',
    scope: {
      scheme: '=schemeInfo',
    }
  };
});

app.controller('ConceptBrowserController',
  ['$scope','$http','$httpParamSerializer','$location','$q', '$timeout',
  function ($scope, $http, $httpParamSerializer, $location, $q, $timeout) {

  // configure base URL
  if (!$scope.baseURL) {
    $scope.baseURL = 'http://localhost:8080/';
  }

  $scope.schemeInfo = false;
  $scope.toggleSchemeInfo = function(){
    $scope.schemeInfo = !$scope.schemeInfo;
  }

  $scope.conceptInfo = false;

  // load list of known concept schemes
  $scope.schemes = [];
  var schemesURL = 'schemes.json';
  $http.get(schemesURL).then(function(response){
    response.data.forEach(function(scheme) {
	  scheme.concepts = $scope.baseURL + scheme.concepts;
    });
    $scope.schemes = response.data;
    $scope.selectScheme(searchedScheme(), $location.search().concept);
  }, function(response) {
    // TODO: show error message
  });

  // further initalization of controller
  $scope.activeConcept = null;
  $scope.schemeDetails = null;
  $scope.status = {
    isopen: false
  };
  $scope.language = "de,en";

  $scope.selectURI = function(uri){
    $scope.activeURI = angular.copy(uri);
  }

  // error handling
  $scope.error = { };
  $scope.reportError = function(type) {
    $scope.error[type] = true;
  }
  $scope.clearErrors = function() {
    $scope.error = {};
  }
  $scope.hasError = function() {
    for (var key in $scope.error) {
      if ($scope.error[key] === true) return true;
    }
    return false;
  }

  // select a(nother) concept scheme
  $scope.selectScheme = function(scheme, example) {
    // TODO: if errors.schemeDetailsMissing: try again
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
      $http.get( url ).then(function(response) {
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

    $scope.clearErrors();
    
    // retrieve concept
    var url = $scope.activeScheme.concepts + '?' + $httpParamSerializer({ uri:uri });
    $scope.apiURL = url;
    $http.get(url).then(
      function(response) {
        var concept = response.data[0];
        if (concept) {
          var deferred = $q.defer();

          ['broader','narrower','related','previous','next','relatedPlace'].forEach(function(field) {
            loadLabels(concept[field]);
          });

          // TODO: get depiction with attribution
          // TODO: what about altLabel and other literals?
          // TODO: what about ancestors?
          // TODO: what about subjectOf?

          deferred.resolve(concept);
        } else {
          $scope.reportError('conceptNotFound');
        }
        $scope.activeConcept = concept;
      },
      function() {
        $scope.reportError('conceptServiceFailed');
      }
    );
  }
  
  $scope.getSchemeDetails = function(uri){
    $scope.clearErrors();
    var url = $scope.baseURL + "BARTOC.php?" + $httpParamSerializer({ uri:uri });
    $http.get(url).then(
      function(response) {
        $scope.schemeDetails = response.data[0];
      },
      function() {
        $scope.reportError('schemeDetailsMissing');
      }
    );
  }

  $scope.browseConcept = function(concept){
    $scope.getConcept(concept.uri);
  };

}]);

 
app.filter('prettyJSON', function () {
  return function(json) { return angular.toJson(json, true); }
});
