'use strict';

function errorLogin(message){
  alert(message)
}

angular.module('sharekey.login', ['ui.router','ngCookies'])

.config(['$stateProvider','$urlRouterProvider', function($stateProvider,$urlRouterProvider) {
  $stateProvider.state('/', {
    url: '/', 
    templateUrl: 'auth/login/login.html',
    controller: 'LoginController',
    css: '../css/sb-admin-2.css'
  });
  $stateProvider.state('login',{
    url: '/', 
    templateUrl: 'auth/login/login.html',
    controller: 'LoginController',
    css: '../css/sb-admin-2.css'
  })
  $urlRouterProvider.otherwise('/');
}])

.controller('LoginController', function($scope,$http,$location,$cookies,$localStorage,$state,__env) {
  
  $scope.sendData = function(){
    var loginRequest = $.param({
      email: $scope.email,
      password: $scope.password
    });
    $http({
      url : __env.apiUrl + 'login',
      method: 'POST',
      data: loginRequest,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).then(function(response){
      if (response.status == 200){
        $localStorage.uid = response.data.uid;
        $localStorage.userToken = response.data.token
        $http({
          url: __env.apiUrl +  __env.profile + $localStorage.uid,
          method: 'GET',
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization': 'Bearer: ' + $localStorage.userToken}
        }).then(function (response){
          if (response.data.status == 200){
              $localStorage[$localStorage.uid + '-username'] = response.data.content.username;
              $state.go('dash.posts');
          }else{
            errorLogin(response.data.message);
          }  
        })
      }else{
        if (response.data.status === 'auth/wrong-password'){
          errorLogin('Su contraseña es incorrecta');
        } else if (response.data.status === 'auth/user-not-found'){
          errorLogin('Su correo es inválido');
        }
      }
    })
  }

});
