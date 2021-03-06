'use strict';

function errorLogin(message){
  alert(message)
}

angular.module('SecureShare.login', ['ui.router','ngCookies'])

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

.controller('LoginController', function($scope,$http,$location,$cookies,$localStorage,$state,__env,$filter,$translate) {
  
  var translate = $filter('translate')

  $scope.loginIn = false;

  //gets the server public key

  var getServerKey = function (){
    return $http({
      url: __env.apiUrl + 'config/serverKeys',
      method: 'GET'
    }).then(function(response){
      return response.data.publickey
    }).catch(function (error){
      console.log(error)
    })
  }

  //gets encrypts the user password

  var encryptPassword = function(password){
    var publicKey = getServerKey()
    return publicKey.then(async (publicKey) => {
      publicKey = publicKey.replace(/(?:\\[r])+/g, "");
      const options = {
        message: openpgp.message.fromText(password),      
        publicKeys: (await openpgp.key.readArmored(publicKey)).keys 
      }
      return openpgp.encrypt(options).then(ciphertext => {
          var encrypted = ciphertext.data
          return encrypted
      })
    })
  }

  //sends the user log in credentials and then gets the users token

  $scope.sendData = function(){
    $scope.loginIn = true;
    var password = encryptPassword($scope.password)
    password.then(function (password){
        var loginRequest = $.param({
          email: $scope.email,
          password: password
        });
        $http({
          url : __env.apiUrl + 'login',
          method: 'POST',
          data: loginRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
        }).then(function(response){
          if (response.data.status == 200){
            $localStorage.uid = response.data.uid;
            $localStorage.userToken = response.data.token
            $http({
              url: __env.apiUrl +  __env.profile + $localStorage.uid,
              method: 'GET',
              headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization': 'Bearer: ' + $localStorage.userToken}
            }).then(function (response){
              if (response.data.status == 200){
                  $localStorage[$localStorage.uid + '-username'] = response.data.content.username;
                  $localStorage.userPicture = response.data.content.profileUrl;
                  $state.go('dash.posts');
              }else{
                errorLogin(translate('login.error'));
              }  
            })
          }else{
            if (response.data.status === 'auth/wrong-password'){
              errorLogin(translate('login.password_error'));
              $scope.loginIn = false;
            } else if (response.data.status === 'auth/user-not-found'){
              errorLogin(translate('login.email_error'));
              $scope.loginIn = false;
            }
          }
        }).catch(function (error){
          alert(translate('login.error'))
          $scope.loginIn = false;
        })
      })  
    }

});
