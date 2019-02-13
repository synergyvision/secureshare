'use strict';

// Declare app level module which depends on views, and core components
angular.module('sharekey', [
  'ngRoute',
  'ngCookies',
  'sharekey.register',
  'sharekey.login',
  'sharekey.reset'

]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/'});
}]);

