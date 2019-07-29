'use strict';

var env = {};

// Import variables if present (from env.js)
if(window){  
  Object.assign(env, window.__env);
}


// Declare app level module which depends on views, and core components
var ngModule = angular.module('sharekey', [
  'ngRoute',
  'ui.router',
  'ngCookies',
  'ngAnimate',
  'ngStorage',
  'ngFileSaver',
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
  'sharekey.chats',
  'sharekey.posts',
  'sharekey.surveys',
  'sharekey.repos',
  'sharekey.files',
  'sharekey.config'
]).
config(['$locationProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.hashPrefix('!')
}])
.constant('__env', env);

ngModule.run(['$rootScope', '$window','$localStorage','$http',function($rootScope, $window,$localStorage,$http,$scope){
  var user = $localStorage.userToken;
  var id = $localStorage.uid;

  $window.fbAsyncInit = function() {
      // Executed when the SDK is loaded
  
      FB.init({
  
        /*
         The app id of the web app;
         To register a new app visit Facebook App Dashboard
         ( https://developers.facebook.com/apps/ )
        */
  
        appId: '355312722034019',
        /*
         Set if you want to check the authentication status
         at the start up of the app
        */
  
        status: true,
  
        /*
         Enable cookies to allow the server to access
         the session
        */
  
        cookie: true,
  
        /* Parse XFBML */
  
        xfbml: true,

        version: 'v2.4'
      });
  
    };
  
    (function(d){
      // load the Facebook javascript SDK
  
      var js,
      id = 'facebook-jssdk',
      ref = d.getElementsByTagName('script')[0];
  
      if (d.getElementById(id)) {
        return;
      }
  
      js = d.createElement('script');
      js.id = id;
      js.async = true;
      js.src = "https://connect.facebook.net/en_US/all.js";
  
      ref.parentNode.insertBefore(js, ref);
  
    }(document));

}])
