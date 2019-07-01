

angular.module('sharekey.navbar', ['ngRoute','ngStorage'])

.component('navbar',{
    templateUrl: 'dashboard/navbar/navbar.html',
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

.controller('navbarController', function ($scope,$localStorage,$http,$location,$state,$window,$sessionStorage,__env){
    $scope.user = $localStorage[$localStorage.uid + '-username']
    uid = $localStorage.uid;
    $scope.profilePicture = $localStorage.userPicture;
    var token = $localStorage.userToken;
    
    if ($localStorage.search){
        $scope.search = $localStorage.search;
    }
    if (!uid){
        alert('Inicie sesión para disfrutar de la aplicación')
        $state.go('login');
    }

    $scope.getSearch = function (){
        if ($scope.search){
            if ($state.current.name == 'dash.searchContacts'){
                $window.location.reload();
            }
            $localStorage.search = $scope.search;
            $location.path('/contacts/search') 
        }
    }

    var updateStatus = function(id){
        $http({
            url: __env.apiUrl + __env.messages + uid + '/' + id,
            method: 'PUT',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
            console.log(response.data)
        }).catch(function (error){
            alert(error)
        })
    }

    $scope.readMessage =  function (id, status){
        if (status == 'unread'){
            updateStatus(id);
        }
        $state.go('dash.read',{'id': id})
    }

    $scope.getFriendRequest = function (){
        $http({
            url: __env.apiUrl + __env.contacts + uid + '/requests',
            method: 'GET',
            headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
            if (response.data.status == 200){
                $scope.requests = response.data.data;
                $scope.quantity = response.data.data.length;
            }
        }).catch(function (error){
            console.log(error);
            if (error.status == 401){
              alert('Su sesion ha vencido por inactividad')
              $state.go('dash.login');
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
            url: __env.apiUrl + __env.contacts + uid + '/requests/' + id,
            method: 'PUT',
            data: status,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
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
                alert('Su sesion ha vencido')
                $state.go('login');
              }
        })
    }

    var countUnread = function (messages){
        var count = 0;
        for (var i = 0; i < messages.length; i++){
            if (messages[i].data.status == 'unread'){
                count++
            }
            if (i == (messages.length -1)){
                return count
            }
        }
    }

    $scope.getMessages = function (){
        $http({
            url: __env.apiUrl + __env.messages + uid,
            method: 'GET',
            headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
            if (response.data.status == 200){
                $scope.messages = response.data.data;
                $scope.unreadMessages = countUnread(response.data.data);
            }
        }).catch(function (error){
            console.log(error);
            if (error.status == 401){
              alert('Su sesion ha vencido')
              $state.go('login');
            }
        })
    }

    $scope.deleteMessage = function (id){
        $http({
            url: __env.apiUrl + __env.messages + uid + '/' + id,
            method: 'DELETE',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
            if (response.data.status == 200){
                alert('se ha eliminado un mensaje')
                $state.reload();
            }
        }).catch(function (error){
            alert(error)
        })
    }

    $scope.logout = function(){
        $http({
            url: __env.apiUrl + 'logout',
            method: 'GET'
        }).then(function (response){
            if (response.data.status == 200){
                delete $localStorage.uid;
                delete $localStorage.search;
                delete $sessionStorage.appKey;
                delete $localStorage.userToken;
                console.log('Users has logged out')
                $state.go('login');
            }
        })
    }

});