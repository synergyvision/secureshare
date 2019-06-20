
  angular.module('sharekey.contacts', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.contacts', {
      url: '/contacts',
      templateUrl: 'dashboard/profile/contacts/contacts.html',
      controller: 'contactsController',
      css: 'contacts.css'
    });
    $stateProvider.state('dash.searchContacts', {
      url: '/contacts/search',
      templateUrl: 'dashboard/profile/contacts/search.html',
      controller: 'contactsController',
      css: 'contacts.css'
      })
  }])

  .controller('contactsController', function($scope,$http,$localStorage,$state,$window,$location,$sessionStorage,__env){
      uid = $localStorage.uid;
      var token = $localStorage.userToken;
      $scope.getContacts = function (){

        $http({
            url: __env.apiUrl + __env.profile + uid + '/contacts',
            method: 'GET',
            headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
            if (response.data.status == 200){
                console.log('contacts received')
                console.log(response.data.data)
                $scope.contacts = response.data.data
            }
        }).catch(function (error){
            if (error.status == 401){
              alert('Su sesion ha vencido')
              $state.go('dash.login');
            }
        })

      }

      $scope.getUsers = function (){
            $scope.search = $localStorage.search
            $http({
                url: __env.apiUrl + __env.contacts + uid + '/users',
                method: 'GET',
                headers: {'Authorization':'Bearer: ' + token}
            }).then(function (response){
                if (response.data.status == 200){
                    $scope.users = response.data.data;
                }
            }).catch(function (error){
                if (error){
                  if (error.status == 401){
                      alert('Su sesion ha vencido')
                      $state.go('login');
                  }
                  else{
                      console.log(error.code);
                      console.log(error.message);
                  }
                }  
            }) 
    }

    $scope.sendRequest =  function(id){
        var request = $.param({
            id_to: id
        })

        $http({
            url: __env.apiUrl + __env.contacts + uid + '/requests',
            method: 'POST',
            data: request,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
            if (response.data.status == 201){
                alert('Se ha enviado una solicitud de amistad');
            }
        }).catch(function (error){
                if (error){
                    if (error.status == 401){
                        alert('Su sesion ha vencido')
                        $state.go('login');
                    }
                    else{
                        console.log(error.code);
                        console.log(error.message);
                    }
                }  
            }) 
    }

    $scope.sendMessage = function (name,id){
        $state.go('dash.messages',{'id_user': id,'name': name});
    }

  })