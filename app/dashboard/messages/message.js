

  angular.module('sharekey.message', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.messages', {
      url: '/messages',
      templateUrl: '../dashboard/messages/message.html',
      controller: 'messagesController',
      css: 'messages.css'
    })
  }])

.controller('messagesController', function($scope,$http,$localStorage,$state,$window,$location,$sessionStorage){
      uid = $localStorage.uid
      $scope.userKeys = $localStorage[uid + 'keys'];
      $scope.user = $sessionStorage.user;
      if ($localStorage[uid + '-chats']){
        $scope.userChats = $localStorage[uid + '-chats'];
      }else{
        $scope.userChats = [];
      }

  $scope.getPublicKey =  function (idUser){

    if (!$scope.message){
      alert("No puede mandar un mensaje en blanco")
    }else{

      var keyRequest = $.param({
          id: idUser
      })

      $http({
        url: 'https://sharekey.herokuapp.com/profile/' + uid + '/getPublicKey',
        method: 'POST',
        data: keyRequest,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
      }).then(function (response){
        console.log('retrieved public key from server')
        $scope.encrypt(response.data.data,message);
      }).catch(function (error){
          console.log(error);
      })  
    }
  }

  var getPublicKey = function (name){
    for (var i = 0 ; i < $scope.userKeys.length; i++){
        if ($scope.userKeys[i].keyname ==name){
            return $scope.userKeys[i].publicKey
        }
    }
  }

  var getPrivateKey = function (name){
    for (var i = 0 ; i < $scope.userKeys.length; i++){
        if ($scope.userKeys[i].keyname == name){
            return $scope.userKeys[i].privateKey
        }
    }
  }

  var decryptKey = function (key,password) {
    var bytes  = CryptoJS.AES.decrypt(key,password);
    var key = bytes.toString(CryptoJS.enc.Utf8);
    return key;

  }

  var encryptWithMultiplePublicKeys  = async (pubkeys, privkey, passphrase, message) => {

    pubkeys = pubkeys.map(async (key) => {
      return (await openpgp.key.readArmored(key)).keys[0]
    });
    if (passphrase == null){
      const options = {
        message: openpgp.message.fromText(message),
        publicKeys: await Promise.all(pubkeys)       				  // for encryption
      }
      return openpgp.encrypt(options).then(ciphertext => {
        encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        return encrypted
    })
    }else{
      const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
      await privKeyObj.decrypt(passphrase)

      const options = {
          message: openpgp.message.fromText(message),
          publicKeys: await Promise.all(pubkeys),           				  // for encryption
          privateKeys: [privKeyObj]                                 // for signing (optional)
      }
      return openpgp.encrypt(options).then(ciphertext => {
        encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        return encrypted
    })
    }  
   };

  $scope.encrypt = function (key) {

      console.log('begin encription')
      keyPublic = getPublicKey($scope.chatKey);
      keyPrivate = getPrivateKey($scope.chatKey);
      pKeys = [keyPublic,key]
      Private = decryptKey(keyPrivate,$sessionStorage.appKey);
      message = encryptWithMultiplePublicKeys(pKeys,Private,$scope.passphrase,$scope.message);
      message.then( function (encryptedMessage){
        sendMessage(encryptedMessage);
      }).catch(function (error){
        alert(error)
      })
    }

  var sendMessage = function (messageEncrypted){
    messageRequest = $.param({
      id_sender: uid,
      username: $localStorage[uid + '-username'],
      content: messageEncrypted,
      recipient: $sessionStorage.user.id
    })
    $http({
      url: "https://sharekey.herokuapp.com/messages/" + uid,
      method: "POST",
      data: messageRequest,
      headers:  {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).then(function (response){
      console.log(response.data);
      console.log('message sent');
    }).catch(function (error){
      console.log(error);
    })
  }



})