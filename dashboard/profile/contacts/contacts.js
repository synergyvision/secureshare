
  angular.module('sharekey.contacts', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.contacts', {
      url: '/contacts',
      templateUrl: '../dashboard/profile/contacts/contacts.html',
      controller: 'contactsController',
      css: 'contacts.css'
    })
  }])

  .controller('contactsController', function($scope,$http,$localStorage,$state,$window){
      uid = $localStorage.uid;

      $scope.getContacts = function (){

        $http({
            url: 'https://sharekey.herokuapp.com/profile/' + uid + '/contacts',
            method: 'GET'
        }).then(function (response){
            if (response.data.status == 200){
                console.log('contacts received')
                console.log(response.data.data)
                $scope.contacts = response.data.data
            }
        }).catch(function (error){
            if (error.status == 401){
              alert('Su sesion ha vencido por inactividad')
              $location.path('/login');
            }
        })

      }

  })