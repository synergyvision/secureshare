angular.module('sharekey.dashboard', ['ngRoute','sharekey.sidebar'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/index', {
    templateUrl: '../dashboard/dashboard.html',
    css: 'css/sb-admin-2.css'
  });
}])

.controller('dashboardController', function($scope){

});
