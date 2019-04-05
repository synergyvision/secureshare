angular.module('sharekey.sidebar', ['ngRoute'])

.component('sidebar',{
    templateUrl: '../dashboard/sidebar/sidebar.html',
    css: '../css/sb-admin-2.css'
})

.controller('sidebarController', function($scope,$window){
   
})


.directive('alert', function() {

    function link (scope, element, attrs){
        console.log('here')
        angular.element("#sidebarToggle, #sidebarToggleTop").on('click', function() {
        angular.element("body").toggleClass("sidebar-toggled");
        angular.element(".sidebar").toggleClass("toggled");
        if (angular.element(".sidebar").hasClass("toggled")) {
        angular.element('.sidebar .collapse').collapse('hide');
        };
    })
    }

    return {
        restrict: 'E',
        templateUrl: '../dashboard/sidebar/sidebarToogle.html',
        controller: function ($scope){
            alert('workds');
        },
        link: link,
    }
});