angular.module('sharekey.navbar', ['ngRoute','ngStorage'])

.component('navbar',{
    templateUrl: '../dashboard/navbar/navbar.html',
    css: '../css/sb-admin-2.css',
    controller: 'navbarController'
})

.controller('navbarController', function ($scope,$localStorage){
    $scope.user = $localStorage.username
});