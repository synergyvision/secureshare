'use strict';

// Declare app level module which depends on views, and core components
angular.module('sharekey', [
  'ngRoute',
  'ngCookies',
  'ngAnimate',
  'ngStorage',
  'sharekey.login',
  'sharekey.reset',
  'sharekey.register',
  'sharekey.sidebar',
  'sharekey.dashboard'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/login'});
}]);
