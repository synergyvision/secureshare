'use strict';

function errorLogin(message){
  alert(message)
}

angular.module('sharekey.login', ['ngRoute','ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'login/login.html',
    controller: 'LoginController'
  });
}])

.controller('LoginController', function($scope,$http,$location,$cookies) {
  
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
        $cookies.id = response.data.uid;
        console.log(response);
      }else{
        if (response.data.status === 'auth/wrong-password'){
          errorLogin('Su contrasena es incorrecta');
        } else if (response.data.status === 'auth/auth/user-not-found'){
          errorLogin('Su correo es invaludo');
        }
      }
    })
  }

});