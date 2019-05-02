
  angular.module('sharekey.message', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.messages', {
      url: '/messages',
      templateUrl: '../dashboard/messages/message.html',
      controller: 'messagesController',
      css: 'messages.css'
    })
  }])

.controller('messagesController', function($scope,$http,$localStorage,$state,$window,$location){
      uid = $localStorage.uid
      $scope.userKeys = $localStorage[uid + 'keys'];

  var getDefaultKey = function (){
    for (var i = 0 ; i < $scope.userKeys.length; i++){
        if ($scope.userKeys[i].default == true){
            return $scope.userKeys[i].publicKey
        }
    }
  }

  var getDefaultPrivate = function (){
    for (var i = 0 ; i < $scope.userKeys.length; i++){
        if ($scope.userKeys[i].default == true){
            return $scope.userKeys[i].privateKey
        }
    }
  }

  var getDefaultPassphrase = function (){
    for (var i = 0 ; i < $scope.userKeys.length; i++){
        if ($scope.userKeys[i].default == true){
            return $scope.userKeys[i].passphrase
        }
    }
  }

  var readPublic = async (key) => {
    public = (await openpgp.key.readArmored(key)).keys;
    return public;
  }

  var decryptKey = function (password) {
    var bytes  = CryptoJS.AES.decrypt($localStorage.recoveryKey.passphrase,words);
    var pass = bytes.toString(CryptoJS.enc.Utf8);
  }

  /*var readPrivate = async (key,password) => {
    privateKey = 
  }*/

  $scope.encrypt = function () {

      defaultPublic = getDefaultKey();
      defaultPrivate = getDefaultPrivate();
      defaultPass = getDefaultPassphrase();
      publicKey = readPublic(defaultPublic);
      privateKey = decryptKey(defaultPrivate,'secretkey');
      publicKey.then(function (publicKey) {
          const options = {
            message: openpgp.message.fromText($scope.message),       // input as Message object
            publicKeys: publicKey // for encryption
            //privateKeys: [privKeyObj]                                 // for signing (optional)
          }
          openpgp.encrypt(options).then(ciphertext => {
            encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
            console.log(encrypted);
        })
      })

  }

})