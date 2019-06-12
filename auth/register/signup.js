'use strict';

function successRegister(message){
    alert(message)
}

function error(message){
  alert(message)
}

angular.module('sharekey.register', ['ngRoute'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('signup', {
    url: '/signup',
    templateUrl: 'auth/register/signup.html',
    controller: 'SignUpController',
    css: 'signup.css'
  });
}])

.controller('SignUpController', function($scope,$http,$location) {
  
  $scope.sendData = function(){
    var signUpRequest = $.param({
      email: $scope.email,
      password: $scope.password,
      nombre: $scope.name,
      apellido: $scope.lastname,
      telefono: $scope.phone,
      usuario: $scope.username
    });
    $http({
      url : 'https://sharekey.herokuapp.com/signup',
      method: 'POST',
      data: signUpRequest,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).then(function(response){
      if (response.data.status == 201){
        console.log(response);
        successRegister('Usuario se ha creado exitosamente');
        $location.path('/login');
      }else{
        if (response.data.status == 400){
          error('El nombre de usuario no esta disponible');
        } else if (response.data.status === 'auth/email-already-in-use'){
          errorLogin('Su correo ya se encuentra asociado a una cuenta');
        }
      }
    })
  }

});