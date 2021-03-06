
  angular.module('SecureShare.contacts', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.contacts', {
      url: '/contacts',
      templateUrl: 'dashboard/profile/contacts/contacts.html',
      controller: 'contactsController',
      css: 'contacts.css'
    });
    $stateProvider.state('dash.searchContacts', {
      url: '/contacts/search/?user',
      templateUrl: 'dashboard/profile/contacts/search.html',
      controller: 'contactsController',
      css: 'contacts.css'
      })
  }])

  .controller('contactsController', function($scope,$http,$localStorage,$state,$window,$location,$sessionStorage,__env,$stateParams,$filter){
      var uid = $localStorage.uid;
      var token = $localStorage.userToken;
      $scope.uid = $localStorage.uid;

      var translate = $filter('translate')

      //gets user contact list
      
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
              $state.go('dash.login');
            }
        })

      }

      //realizes an user search

      $scope.getUsers = function (){
            $scope.search = $stateParams.user;
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
                      $state.go('login');
                  }
                  else{
                      console.log(error.code);
                      console.log(error.message);
                  }
                }  
            }) 
    }

    //sends a friend request

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
                alert(translate('contacts.sent_request'));
            }
        }).catch(function (error){
                if (error){
                    if (error.status == 401){
                        $state.go('login');
                    }
                    else{
                        console.log(error.code);
                        console.log(error.message);
                    }
                }  
            }) 
    }

    //goes to the message page

    $scope.sendMessage = function (name,id){
        $state.go('dash.messages',{'id_user': id,'name': name});
    }

  })