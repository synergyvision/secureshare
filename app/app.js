'use strict';

var env = {};

// Import variables if present (from env.js)
if(window){  
  Object.assign(env, window.__env);
}


// Declare app level module which depends on views, and core components
var ngModule = angular.module('SecureShare', [
  'ngRoute',
  'toaster',
  'ui.router',
  'ngCookies',
  'ngAnimate',
  'ngStorage',
  'ngFileSaver',
  'SecureShare.login',
  'SecureShare.reset',
  'SecureShare.register',
  'SecureShare.navbar',
  'SecureShare.sidebar',
  'SecureShare.profile',
  'SecureShare.keys',
  'SecureShare.dashboard',
  'SecureShare.contacts',
  'SecureShare.message',
  'SecureShare.chats',
  'SecureShare.posts',
  'SecureShare.surveys',
  'SecureShare.repos',
  'SecureShare.files',
  'SecureShare.config',
  'pascalprecht.translate'//,
  //'btford.socket-io'
]).
config(['$locationProvider', '$urlRouterProvider','$translateProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.hashPrefix('!')

}])

ngModule.constant('__env', env)


/*ngModule.service('SocketService', ['socketFactory', function SocketService(socketFactory) {
   return socketFactory({
       ioSocket: io.connect(__env.apiUrl)
   });
}]);*/