
function success(message){
  alert(message)
}


function error(message){
  alert(message)
}

angular.module('sharekey.profile', ['ngRoute','ui.router'])


.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash.profile', {
    url: '/profile',
    templateUrl: 'dashboard/profile/profile.html',
    controller: 'profileController',
    css: 'profile.css'
  })
}])

.controller('profileController', function($scope,$http,$localStorage,$state,$location){

  $scope.requestData = function(){
    $http({
      url: 'https://sharekey.herokuapp.com/profile/' + $localStorage.uid,
      method: 'GET',
    }).then(function (response){
      if (response.data.status == 200){
          $scope.username = response.data.content.username;
          $scope.name = response.data.content.name;
          $scope.lastname = response.data.content.lastname;
          $scope.phone = response.data.content.phone;
          $scope.email = response.data.content.email;
          $scope.bio = response.data.content.bio;
        }else{
          error(response.data.message);
        }
    }).catch(function (e){
      if (e.status == 401){
          error('Su sesion ha vencido por inactividad')
          $location.path('/login');
        }
      })
  }

  $scope.updateData =  function(){
    var updateRequest = $.param({
      email: $scope.email,
      name: $scope.name,
      lastname: $scope.lastname,
      phone: $scope.phone,
      username: $scope.username,
      bio: $scope.bio
    });
    $http({
      url: 'https://sharekey.herokuapp.com/profile/' + $localStorage.uid,
      method: 'PUT',
      data: updateRequest,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).then( function (response){
        if (response.data.status == 200){
            console.log('User data updated');
            if ($scope.password){
                var updatePassword = $.param({
                  password: $scope.password
                })
                $http({
                  url: 'https://sharekey.herokuapp.com/profile/' + $localStorage.uid + '/resetPassword',
                  method: 'PUT',
                  data: updatePassword,
                  headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
                }).then(function (response){
                    if (response.data.status == 200){ 
                      console.log('user password updated')
                      success('El perfil se ha actualizado exitosamente');
                      $state.reload();
                    }else{
                      error(response.data.message);
                    }
                }).catch(function (e){
                  if (e.status == 401){
                      error('Su sesion ha vencido por inactividad')
                      $location.path('/login');
                    }
                  })
              }else{
                $state.reload();
                success('El perfil se ha actualizado exitosamente');
              }    
        }else{
          error(response.data.message)
        }
    })
  }

});