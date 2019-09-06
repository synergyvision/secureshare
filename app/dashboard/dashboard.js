
 function translate(phrase){
  var chars={
  "á":"a", "é":"e", "í":"i", "ó":"o", "ú":"u","ñ":"n"}
  var expr=/[áàéèíìóòúù]/ig;
  var text= phrase.replace(expr,function(e){return chars[e]});
  return text;

}

angular.module('sharekey.dashboard', ['ngRoute','ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash',{
    abstract: true,
    templateUrl: 'dashboard/dashboard.html',
    css: 'css/sb-admin-2.css'
  });
  $stateProvider.state('dash.index',{
    url:'/index'
  })
}])

.controller('dashboardController', function($scope,$state,$sessionStorage,$localStorage,$window,$http){
  var uid = $localStorage.uid
  $scope.id = uid;
  $scope.storedKeys = $localStorage[uid+'keys'];
  var token = $localStorage.userToken;

  $scope.keysExists = function (){
    if (!$scope.storedKeys){
      alert('Por favor cree o active una llave')
      $state.go('dash.keys')
    }
  }

  
});

