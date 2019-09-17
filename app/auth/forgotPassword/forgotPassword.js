'use strict';

function error(message){
  alert(message)
}

function message(message){
    alert(message)
}


angular.module('sharekey.reset', ['ngRoute'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('checkEmail', {
    url: '/checkEmail',
    templateUrl: 'auth/forgotPassword/checkEmail.html',
    controller: 'CheckEmailController',
    css: 'forgotPassword.css'
  }).state('resetPassword',{
    url: '/resetPassword',
    templateUrl: 'auth/forgotPassword/resetPassword.html',
    controller: 'ResetPasswordController',
    css: 'forgotPassword.css'
  });
}])

.controller('CheckEmailController', function($scope,$http,__env,$filter) {

  var translate = $filter('translate')
  
  $scope.sendEmail = function(){
    var emailRequest = $.param({
      email: $scope.email,
    });
    console.log('doing shit');
    $http({
      url :  __env.apiUrl + 'login/sendEmail',
      method: 'POST',
      data: emailRequest,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).then(function(response){
      if (response.data.status == 200){
        alert(response.data.message);
      }else {
          error(translate('recoverPassword.error_not_found'))
      }
    })
  }

})
