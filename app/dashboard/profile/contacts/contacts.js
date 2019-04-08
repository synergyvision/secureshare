
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
  
  })