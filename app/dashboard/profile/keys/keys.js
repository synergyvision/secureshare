
function success(message){
    alert(message)
  }
  
  
  function error(message){
    alert(message)
  }
  
  angular.module('sharekey.keys', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.keys', {
      url: '/keys',
      templateUrl: '../dashboard/profile/keys/keys.html',
      controller: 'keysController',
      css: 'keys.css'
    })
  }])
  
  .controller('keysController', function($scope,$http,$localStorage,$state){

    $scope.checkKeys = function (){

    }

    $scope.generateKeys =  function (){
            var uid = $localStorage.uid;
            var options = {
                userIds: [{ name: 'luis', email: 'ana@gmail.com'}],
                numBits: 2048,
                passphrase: 'hola',
            }
            console.log("Generating Keys")
            openpgp.generateKey(options).then(function(key){
                var privkey = key.privateKeyArmored;
                var pubkey = key.publicKeyArmored;
                var revocationCertificate = key.revocationCertificate;
                $localStorage.privkey = privkey;
                $localStorage.pubkey = pubkey;
                $localStorage.passphrase = 'hola';
              })
            }
    })            