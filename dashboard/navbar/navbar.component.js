angular.module('sharekey.navbar', ['ngRoute','ngStorage'])

.component('navbar',{
    templateUrl: '../dashboard/navbar/navbar.html',
    css: '../css/sb-admin-2.css',
    controller: 'navbarController'
})

.directive('menu', function() {

    function link (scope, element, attrs){
        angular.element("#sidebarToggleTop").on('click', function() {
        angular.element("body").toggleClass("sidebar-toggled");
        angular.element(".sidebar").toggleClass("toggled");
        if (angular.element(".sidebar").hasClass("toggled")) {
        angular.element('.sidebar .collapse').collapse('hide');
        };
    })
    }

    return {
        restrict: 'A',
        link: link,
    }
})

.controller('navbarController', function ($scope,$localStorage){
    $scope.user = $localStorage[$localStorage.uid + '-username']
});