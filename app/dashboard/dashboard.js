angular.module('sharekey.dashboard', ['ngRoute','ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash',{
    abstract: true,
    templateUrl: '../dashboard/dashboard.html',
    css: 'css/sb-admin-2.css'
  });
  $stateProvider.state('dash.index',{
    url:'/index',
  })
}])

.controller('dashboardController', function($scope){

});

