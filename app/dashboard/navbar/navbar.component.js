

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

.controller('navbarController', function ($scope,$localStorage,$http,$location,$state){
    $scope.user = $localStorage[$localStorage.uid + '-username']
    uid = $localStorage.uid;

    $scope.getUsers = function (){
        $http({
            url: 'https://sharekey.herokuapp.com/contacts/users',
            method: 'GET'
        }).then(function (response){
            if (response.data.status == 200){
                $scope.users = response.data.data;
                console.log($scope.users);
            }
        }).catch(function (error){
            if (error.status == 401){
                alert('Su sesion ha vencido por inactividad')
                $location.path('/login');
              }
            else{
                console.log(error.code);
                console.log(error.message);
            }
        })
    }

    $scope.getFriendRequest = function (){
        $http({
            url: 'https://sharekey.herokuapp.com/contacts/' + uid + '/requests',
            method: 'GET'
        }).then(function (response){
            if (response.data.status == 200){
                console.log('request retrived');
                $scope.requests = response.data.data;
                $scope.quantity = response.data.data.length;
                console.log($scope.quantity);
                console.log($scope.requests);
            }
        }).catch(function (error){
            console.log(error);
            if (error.status == 401){
              alert('Su sesion ha vencido por inactividad')
              $location.path('/login');
            }
        })
    }

    $scope.acceptRequest = function (id,rStatus){
        updateStatus = $.param({
            status: true
        })
        sendStatus(id,updateStatus)
    }

    $scope.rejectRequest = function (id,rStatus){
        updateStatus = $.param({
            status: false
        })
        sendStatus(id,updateStatus)
    }

    sendStatus = function (id,status){ 
        console.log(status);
        $http({
            url: 'https://sharekey.herokuapp.com/contacts/' + uid + '/requests/' + id,
            method: 'PUT',
            data: status,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
        }).then(function (response){
            console.log(response.data)
            if (response.data.status == 200){
                if (response.data.accepted == true){
                    alert('Has aceptado la solicitud de amistad')
                    $state.reload();
                }else{
                    alert('Has rechazado la soliciud');
                    $state.reload();
                }
            }
        }).catch(function (error){
            if (error.status == 401){
                alert('Su sesion ha vencido por inactividad')
                $location.path('/login');
              }
        })
    }

    $scope.logout = function(){
        $http({
            url: 'https://sharekey.herokuapp.com/logout',
            method: 'POST'
        }).then(function (response){
            if (response.data.status == 200){
                console.log('Users has logged out')
                $location.path('/login');
            }
        })
    }

});