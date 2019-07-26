angular.module('sharekey.config', ['ngRoute','ui.router'])


.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash.config', {
    url: '/config',
    templateUrl: 'dashboard/profile/config/config.html',
    controller: 'configController',
    css: 'config.css'
  })
}])

.run(['$rootScope', '$window','$localStorage','$http',function($rootScope, $window,$localStorage,$http,$scope){
    var user = $localStorage.userToken;
    var id = $localStorage.uid;

    getId = function (){
        $http({
            url: __env.apiUrl + 'config/facebookId',
            method: 'POST',
            data: $.param({
                uid: id
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded','Authorization':'Bearer: ' + user},
        }).then(function (response){
            id = response.data.id
            fbAsyncInit(id);
        }).catch(function (error){
            console.log(error)
        })
    }

    getId();


    $window.fbAsyncInit = function(id) {
        // Executed when the SDK is loaded
    
        FB.init({
    
          /*
           The app id of the web app;
           To register a new app visit Facebook App Dashboard
           ( https://developers.facebook.com/apps/ )
          */
    
          appId: id,
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


.controller('configController', function($scope,$http,$localStorage,$state,$location,$stateParams){
    var token = $localStorage.userToken;
    var uid = $localStorage.uid;

    $scope.fblogin = function(){
      FB.login(function (response) {
        if (response.status === 'connected') {
          // You can now do what you want with the data fb gave you.
          $scope.userId = response.authResponse.userID;
        }
      },{scope: 'public_profile,email,user_posts'});
    }

    $scope.checkPermissions = function(){
      FB.api(
        "/" + $scope.userId + "/permissions",
        function (response) {
          if (response && !response.error) {
            console.log(response)
          }
        }
    );
    }
    
})
