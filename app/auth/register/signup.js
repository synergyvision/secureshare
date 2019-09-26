'use strict';

function successRegister(message){
    alert(message)
}

function error(message){
  alert(message)
}

angular.module('SecureShare.register', ['ngRoute'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('signup', {
    url: '/signup',
    templateUrl: 'auth/register/signup.html',
    controller: 'SignUpController',
    css: '../css/sb-admin-2.css'
  });
}])

.controller('SignUpController', function($scope,$http,$location,$state,__env,$filter) {
  
  var translate = $filter('translate')

  //sends the user data for signing up

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
      url : __env.apiUrl + 'signup',
      method: 'POST',
      data: signUpRequest,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).then(function(response){
      if (response.data.status == 201){
        console.log(response);
        successRegister('Su usuario se ha creado exitosamente.');
        $state.go('login');
      }else{
        if (response.data.status == 400){
          error(translate('register.username_error'));
        } else if (response.data.status === 'auth/email-already-in-use'){
          errorLogin(translate('register.email_error'));
        }
      }
    })
  }

});