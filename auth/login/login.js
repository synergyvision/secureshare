'use strict';

function errorLogin(message){
  alert(message)
}

angular.module('sharekey.login', ['ngRoute','ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '../auth/login/login.html',
    controller: 'LoginController',
    css: 'login.css'
  }).when('/login',{
    templateUrl: '../auth/login/login.html',
    controller: 'LoginController',
    css: 'login.css'
  });
}])

.controller('LoginController', function($scope,$http,$location,$cookies,$localStorage) {
  
  $scope.sendData = function(){
    var loginRequest = $.param({
      email: $scope.email,
      password: $scope.password
    });
    $http({
      url : 'http://localhost:3000/login',
      method: 'POST',
      data: loginRequest,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).then(function(response){
      if (response.data.status == 200){
        $localStorage.uid = response.data.uid;
        console.log(response);
        console.log($localStorage.uid);
        $http({
          url: 'http://localhost:3000/profile/' + $localStorage.uid,
          method: 'GET',
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
        }).then(function (response){
          if (response.data.status == 200){
              $localStorage.username = response.data.content.username;
              $location.path('/index');
          }else{
            errorLogin(response.data.message);
          }  
        })
      }else{
        if (response.data.status === 'auth/wrong-password'){
          errorLogin('Su contrasena es incorrecta');
        } else if (response.data.status === 'auth/user-not-found'){
          errorLogin('Su correo es invalido');
        }
      }
    })
  }

});