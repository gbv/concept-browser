/**
 * Web Interface to browse through concepts of several Knowledge Organization Systems.
 */
var browse = angular.module('Browser', ['ngSKOS', 'ui.bootstrap']);

// configuration
browse.constant('CONFIG', {
    baseURL: 'http://localhost:8080/'
});

// initalization
browse.run(['$rootScope','$http','CONFIG',function($rootScope,$http,CONFIG) {
}]);

browse.controller('conceptBrowserController', ['$scope','$http','$q','CONFIG', function ($scope, $http, $q, CONFIG){

    $scope.loading = true;
    $scope.schemes = []; 
    $http.get('schemes.json').then(function(response){
        $scope.schemes = response.data;      
        
        $scope.baseURL = CONFIG.baseURL; //?
        $scope.selectScheme($scope.schemes[0]);
    }, function(response) {
        // TODO: show error
        $scope.loading = false;
    }).finally(function() {
        $scope.loading = false;
    });

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
    $scope.loading = true;
    $http.get(CONFIG.baseURL + $scope.activeScheme.php, { 
        params: { uri: uri },
    }).success(function(data, status, headers) {
      if(data.length){
        var concept = data[0];
        angular.forEach(concept.prefLabel, function(label, lang){
          if(angular.isArray(label)){
            concept.prefLabel[lang] = label[0];
          }
        });
        var deferred = $q.defer();
        if(concept.broader){
          angular.forEach(concept.broader, function(br){
            $http.get(CONFIG.baseURL + $scope.activeScheme.php + "?uri=" + br.uri).then(function(response){
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
        if(concept.narrower){
          angular.forEach(concept.narrower, function(na){
            if(!na.prefLabel){
              $http.get(CONFIG.baseURL + $scope.activeScheme.php + "?uri=" + na.uri).then(function(response){
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
