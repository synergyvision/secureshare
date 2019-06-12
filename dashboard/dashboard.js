
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
    css: 'css/sb-admin-2.css',
  });
  $stateProvider.state('dash.index',{
    url:'/index',
  })
}])

.controller('dashboardController', function($scope,$sessionStorage,$localStorage,$window){
  uid = $localStorage.uid
  $scope.storedKeys = $localStorage[uid+'keys'];
  //$scope.message = 'hola'
  var requestAppkey = function (){
    var popup = angular.element("#appPassword");
        popup.modal('show');
     }

  if (!$sessionStorage.appKey){
     requestAppkey();
  }
  

  $scope.setAppKey = function (){
    if ($localStorage[uid+'keys']){
      words = translate($scope.appKey);
      try {
      var bytes  = CryptoJS.AES.decrypt($localStorage[uid+'keys'][0].privateKey,words);
      var pass = bytes.toString(CryptoJS.enc.Utf8);
          $sessionStorage.appKey = $scope.appKey;
          popup = angular.element("#appPassword");
          popup.modal('hide');

      }
      catch (e){
        console.log(e);
        $scope.message = 'La clave de aplicación es incorrecta'
      }
    }else{
      $sessionStorage.appKey = $scope.appKey;
      popup = angular.element("#appPassword");
      popup.modal('hide');
    }
  }

  $scope.requestConfirm = function (){
      var popup = angular.element("#appPassword");
      popup.modal("hide");
      var popup = angular.element("#confirmReset");
      popup.modal("show");
  }

  $scope.cancel = function (){
    var popup = angular.element("#confirmReset");
      popup.modal("show");
      var popup = angular.element("#appPassword");
      popup.modal("hide");
  }

  $scope.resetAppKey = function (){
    delete $localStorage[uid + 'keys'];
    delete $sessionStorage.appKey;
    $window.location.reload();
  }

});

