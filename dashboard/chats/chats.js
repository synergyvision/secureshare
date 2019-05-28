 angular.module('sharekey.chats', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.chats',{
        templateUrl: '../dashboard/chats/chats.html',
        css: 'css/sb-admin-2.css',
      });
  }])