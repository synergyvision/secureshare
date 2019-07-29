angular.module('sharekey.config', ['ngRoute','ui.router'])


.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash.config', {
    url: '/config',
    templateUrl: 'dashboard/profile/config/config.html',
    controller: 'configController',
    css: 'config.css'
  })
}])

.controller('configController', function($scope,$http,$localStorage,$state,$location,$stateParams,$location){
    var token = $localStorage.userToken;
    var uid = $localStorage.uid;

    $scope.getLocation = function(){
      url = $location.absUrl();
      console.log(url);
      path = $location.path();
      console.log(path)
    }

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
