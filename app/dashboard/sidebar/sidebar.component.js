angular.module('sharekey.sidebar', ['ngRoute'])

.component('sidebar',{
    templateUrl: '../dashboard/sidebar/sidebar.html',
    css: '../css/sb-admin-2.css'
})

.controller('sidebarController', function($scope,$window){
   
})


.directive('toogle', function() {

    function link (scope, element, attrs){
        angular.element("#sidebarToggle").on('click', function() {
        angular.element("body").toggleClass("sidebar-toggled");
        angular.element(".sidebar").toggleClass("toggled");
        if (angular.element(".sidebar").hasClass("toggled")) {
        angular.element('.sidebar .collapse').collapse('hide');
        };
    })
    }

    return {
        restrict: 'A',
        link: link
    }
})

.directive('preventHover', function (){
    // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
    function link (scope, element, attrs){
      angular.element('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
        if (angular.element(window).width() > 768) {
          var e0 = e.originalEvent,
            delta = e0.wheelDelta || -e0.detail;
          this.scrollTop += (delta < 0 ? 1 : -1) * 30;
          e.preventDefault();
        }
      });
    }
  
    return {
      restric: 'A',
      link: link
    }
  
  })

.directive('close', function(){
    // Close any open menu accordions when window is resized below 768px
    function link (scope,element,attrs){
        angular.element(window).resize(function() {
            if (angular.element(window).width() < 768) {
              element('.sidebar .collapse').collapse('hide');
            };
          });
    }

    return {
        restrict: 'A',
        link: link
    }
});
