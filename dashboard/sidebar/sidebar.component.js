angular.module('sharekey.sidebar', ['ngRoute','ngStorage'])

.component('sidebar',{
    templateUrl: '../dashboard/sidebar/sidebar.html',
    css: '../css/sb-admin-2.css',
    controller: 'sidebarController'
})

.controller('sidebarController', function ($scope,$localStorage){
    
    $scope.user = $localStorage.username
});