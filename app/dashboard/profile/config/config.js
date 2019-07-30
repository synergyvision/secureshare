angular.module('sharekey.config', ['ngRoute','ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash.config', {
    url: '/config',
    templateUrl: 'dashboard/profile/config/config.html',
    controller: 'configController',
    css: 'config.css'
  })
}])

.run(['$rootScope','$window',
  function($rootScope,$window) {
    console.log('aca')
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
         Adding a Channel File improves the performance
         of the javascript SDK, by addressing issues
         with cross-domain communication in certain browsers.
        */
  
        channelUrl: 'app/channel.html',
  
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
      })
  
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
      js.src =  "https://connect.facebook.net/es_LA/sdk.js";
  
      ref.parentNode.insertBefore(js, ref);
  
    }(document));
  

}])

.controller('configController', function($scope,$http,$localStorage,$state,$location,$stateParams,$location,$rootScope){
    var token = $localStorage.userToken;
    var uid = $localStorage.uid;
    var username = $localStorage[uid + '-username'];
    $scope.showFacebook = false;
    $scope.validationMessage = 'Verificando. Soy ' + username + ' en Sharekey ';
  
    function makeid() {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < 20; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
   }

    $scope.initObserver = function (){
      $scope.showFacebook = true
      FB.Event.subscribe('auth.authResponseChange', function(res) {
        if (res.status === 'connected') {
          console.log(res)
          $scope.faceLogin = true
          $scope.validationMessage= $scope.validationMessage + makeid();
          $scope.$apply();
        } else {
          alert('Not Connected');
        }
      });
    }

    $scope.verify = function (){
        FB.api(
          "me/feed?limit=5",
          function (response) {
            if (response && !response.error) {
              console.log(response)
                validateFeed(response.data)
            }
          }
      );
    }

   var validateFeed =  function (feed){
     console.log('validate functionw')
      console.log(feed)
   }
 
})
