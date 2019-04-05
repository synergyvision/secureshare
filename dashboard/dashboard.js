angular.module('sharekey.dashboard', ['ngRoute','ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash',{
    abstract: true,
    templateUrl: '../dashboard/dashboard.html',
    css: 'css/sb-admin-2.css'
  });
  $stateProvider.state('dash.index',{
    url:'/index',
    template: '<strong>Post will be here</strong>'
  })
}])

.controller('dashboardController', function($scope){

});
