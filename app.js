'use strict';

// Declare app level module which depends on views, and core components
angular.module('sharekey', [
  'ngRoute',
  'ui.router',
  'ngCookies',
  'ngAnimate',
  'ngStorage',
  'sharekey.login',
  'sharekey.reset',
  'sharekey.register',
  'sharekey.navbar',
  'sharekey.sidebar',
  'sharekey.profile',
  'sharekey.keys',
  'sharekey.dashboard',
  'sharekey.contacts',
  'sharekey.message',
  'sharekey.chats'
]).
config(['$locationProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.hashPrefix('!');

}]);
