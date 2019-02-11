'use strict';

// Declare app level module which depends on views, and core components
angular.module('sharekey', [
  'ngRoute',
  'sharekey.login',

]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/'});
}]);

