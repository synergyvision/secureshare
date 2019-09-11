angular.module('sharekey.config', ['ngRoute','ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash.config', {
    url: '/config',
    templateUrl: 'dashboard/profile/config/config.html',
    controller: 'configController',
    css: 'config.css'
  })
}])

.controller('configController', function($scope,$http,$localStorage,$state,$location,$stateParams,$location,$rootScope,$window){
    var token = $localStorage.userToken;
    var uid = $localStorage.uid;
    var username = $localStorage[uid + '-username'];
    var preMessage = 'Verificando. Soy ' + username + ' en Sharekey ';
  
    function makeid() {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < 20; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
   }

   var initObserver = function (){
    FB.Event.subscribe('auth.authResponseChange', function(res) {
      if (res.status === 'connected') {
        console.log(res)
        $scope.faceLogin = true
        $scope.validationMessage = preMessage + makeid();
        $scope.$apply();
      } else {
        alert('Not Connected');
      }
    });
  }

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

    initObserver();
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

    $scope.verify = function (){
        FB.api(
          "me/feed?limit=5",
          function (response) {
            if (response && !response.error) {
              validateFeed(response.data)
            }
          }
      );
    }

   var validateFeed =  function (feed){
    var valid = false
    for (i = 0; i < feed.length; i ++){
        if( feed[i].message == $scope.validationMessage){
          valid = true;
          validateFacebook();
        }
    }
    if (valid == false){
      alert('Ha ocurrido un error, validando el mensaje, revisa que el mensaje se subio en facebook o recarga la pagina para obtener otro mensaje')
    }
   }

   var validateFacebook = function (){
     $http({
       url: __env.apiUrl + __env.config + uid + '/validateFacebook',
       method: 'POST',
       headers: {'Authorization':'Bearer: ' + token}
     }).then(function (response){
        alert('Se ha validado la información de facebook exitosamente')
        $state.reload();
     }).catch(function (error){
        console.log(error)
     })
   }

   $scope.getSocials = function (){
      $http({
        url: __env.apiUrl + __env.config + uid + '/addedSocials',
        method: 'GET',
        headers: {'Authorization':'Bearer: ' + token}
      }).then(function (response){
          $scope.validFacebook = response.data.facebook
          $scope.validTwitter = response.data.twitter
          $scope.validGitHub = response.data.github
      }).catch(function (error){
        console.log(error)
      })
    }

    $scope.showTwitterMessage = function(){
      $scope.showTwitter = true;
      $scope.validationMessage = preMessage + makeid();
      $scope.$apply
    }

    $scope.getTwitterFeed = function(){
      console.log($scope.twitterUsername)
      var user = $.param({
        username: $scope.twitterUsername
      })
      $http({
        url: __env.apiUrl + __env.config + uid + '/getTwitterFeed',
        method: 'POST',
        data: user,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
      }).then(function (response){
          if (response.data.feed.errors){
            alert('No pudimos encontrar tu usuario por favor verifícalo')
          }else{
            validateTweet(response.data.feed)
          }
      }).catch(function (error){
        console.log(error)
      })
    }
    
    var validateTweet = function (feed){
      console.log(feed)
      var valid = false
      for (var i = 0; i < feed.length; i ++){
          if( feed[i].text == $scope.validationMessage){
            valid = true;
            validateTwitter();
          }
      }
      if (valid == false){
        alert('Ha ocurrido un error validando el mensaje, revisa que el mensaje se subio en twitter o recarga la pagina para obtener otro mensaje')
      }
    }

    var validateTwitter = function (){
      $http({
        url: __env.apiUrl + __env.config + uid + '/validateTwitter',
        method: 'POST',
        headers: {'Authorization':'Bearer: ' + token}
      }).then(function (response){
         alert('Se ha validado la información de twitter exitosamente')
         $state.reload();
      }).catch(function (error){
         console.log(error)
      })
    }
})
