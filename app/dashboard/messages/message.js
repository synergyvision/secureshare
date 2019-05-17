

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

  $scope.getPublicKey =  function (idUser){

    console.log($scope.passphrase,$scope.message,idUser);
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
        $scope.encrypt(response.data.data);
      }).catch(function (error){
          console.log(error);
      })  
    }
  }

  var getDefaultKey = function (name){
    for (var i = 0 ; i < $scope.userKeys.length; i++){
        if ($scope.userKeys[i].default == true){
            return $scope.userKeys[i].publicKey
        }
    }
  }

  var readPublic = async (key) => {
    public = (await openpgp.key.readArmored(key)).keys;
    return public;
  }

  var decryptKey = function (key,password) {
    var bytes  = CryptoJS.AES.decrypt(key,password);
    var key = bytes.toString(CryptoJS.enc.Utf8);
    return key;

  }

  var encryptWithMultiplePublicKeys  = async (pubkeys, privkey, passphrase, message) => {
    const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
    await privKeyObj.decrypt(passphrase)
    pubkeys = pubkeys.map(async (key) => {
        return (await openpgp.key.readArmored(key)).keys[0]
    });

    const options = {
        message: openpgp.message.fromText(message),
        publicKeys: await Promise.all(pubkeys),           				  // for encryption
        privateKeys: [privKeyObj]                                 // for signing (optional)
    }
    return openpgp.encrypt(options).then(ciphertext => {
        encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        return encrypted
    })
   };

  $scope.encrypt = function (key) {
      console.log('begin encription')
      //defaultPublic = getDefaultKey(name);
      defaultPrivate = getPrivate();
      //pKeys = [defaultPublic,key]
      //publicKeys = readMultiplePublic(pKeys)
      /*publicKey = readPublic(key);
      defaultPrivate = decryptKey(defaultPrivate,'ancestralmite8');
      privateKey = readPrivate(defaultPrivate,passphrase);
      privateKey.then(function (privateKey){
        publicKey.then(function (publicKey) {
            const options = {
              message: openpgp.message.fromText($scope.message),       // input as Message object
              publicKeys: publicKey // for encryption
              //privateKeys: [privateKey]                                 // for signing (optional)
            }
            openpgp.encrypt(options).then(ciphertext => {
              encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
              sendToChat(encrypted);
              console.log('message encrypted');
          }).catch(function (error){
            console.log(error)
          })
        })
      })  
      */
  }

  var sendToChat = function (messageEncripted){
      var chatRequest = $.param({
        title: $sessionStorage.user.name
      })
      $http({
          url: "https://sharekey.herokuapp.com/chats/" + uid + "/checkChat",
          method: "POST",
          data: chatRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
      }).then(function (response){
          if (response.data.id){
            sendMessage(messageEncripted,response.data.id);
          }else{
            createChat(messageEncripted);
          }
      }).catch(function (error){
        console.log(error);
      })
  }

  var createChat = function (messageEncripted){
    chatRequest = $.param({
      title: $sessionStorage.user.name,
      participants: {
        [uid]: true,
        [$sessionStorage.user.id]: true
      }
    })
    $http({
          url: "https://sharekey.herokuapp.com/chats/" + uid,
          method: "POST",
          data: chatRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    }).then(function (response){
        console.log('chat created')
        sendMessage(messageEncripted,response.data.idChat);
    }).catch(function (error){
      console.log(error);
      alert('Something bad happened')
    })

  }

  var sendMessage = function (messageEncrypted,id){
    messageRequest = $.param({
      id_sender: uid,
      message: messageEncrypted,
      id_chat: id
    })
    $http({
      url: "https://sharekey.herokuapp.com/messages",
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