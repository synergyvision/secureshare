'use strict';

function error(message){
  alert(message)
}

function message(message){
    alert(message)
}


angular.module('sharekey.reset', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/checkEmail', {
    templateUrl: '../auth/forgotPassword/checkEmail.html',
    controller: 'CheckEmailController',
    css: 'forgotPassword.css'
  }).when('/resetPassword',{
    templateUrl: '../auth/forgotPassword/resetPassword.html',
    controller: 'ResetPasswordController',
    css: 'forgotPassword.css'
  });
}])

.controller('CheckEmailController', function($scope,$http) {
  
  $scope.sendEmail = function(){
    var emailRequest = $.param({
      email: $scope.email,
    });
    console.log('doing shit');
    $http({
      url : 'http://localhost:3000/login/sendEmail',
      method: 'POST',
      data: emailRequest,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).then(function(response){
      if (response.data.status == 200){
        message(response.data.message);
      }else {
          error('Su correo es invalido o no se encuentra registrado')
      }
    })
  }

})

.controller('ResetPasswordController', function($scope,$http){
    if ($scope.password == $scope.confirmPassword){
        $scope.resetPassword = function() {
            var passwordRequest = $.param({
                password : $scope.password,
            });
            console.log('doing shit');
            $http({
                url : 'http://localhost:3000/login/resetPassword',
                method: 'POST',
                data: passwordRequest,
                headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
            }).then(function(response){
                if (response.data.status == 200){
                    message(response.data.message);
                }else{
                    error(response.data.message);
                }
            })
        }
    } else {
        error('Su contraseña debe ser igual a la confirmacion');
    }
});