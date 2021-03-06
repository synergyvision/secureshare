
 function translate(phrase){
  var chars={
  "á":"a", "é":"e", "í":"i", "ó":"o", "ú":"u","ñ":"n"}
  var expr=/[áàéèíìóòúù]/ig;
  var text= phrase.replace(expr,function(e){return chars[e]});
  return text;

}

angular.module('SecureShare.dashboard', ['ngRoute','ui.router'])

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

.controller('dashboardController', function($scope,$state,$sessionStorage,$localStorage,$window,$http,$filter){
  var uid = $localStorage.uid
  $scope.id = uid;
  $scope.storedKeys = $localStorage[uid+'keys'];
  var token = $localStorage.userToken;
  var translate = $filter('translate')

  //check if there is any keys activated

  $scope.keysExists = function (){
    if (!$scope.storedKeys){
      alert(translate('sidebar.keys_message'))
      $state.go('dash.keys')
    }
  }

  
});

