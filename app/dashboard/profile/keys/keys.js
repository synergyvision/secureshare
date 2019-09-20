function success(message){
    alert(message)
  }
  
  
  function error(message){
    alert(message)
  }
  
function encryptKeys(key,seed){
  var ciphertext = CryptoJS.AES.encrypt(key,seed);
  return ciphertext
}

 function translate(phrase){
    var chars={
		"á":"a", "é":"e", "í":"i", "ó":"o", "ú":"u","ñ":"n"}
    var expr=/[áàéèíìóòúù]/ig;
    var text= phrase.replace(expr,function(e){return chars[e]});
    return text;

 }

  angular.module('SecureShare.keys', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.keys', {
      url: '/keys',
      templateUrl: 'dashboard/profile/keys/keys.html',
      controller: 'keysController',
      css: 'keys.css'
    })
  }])
  
  .controller('keysController', function($scope,$http,$localStorage,$state,$window,$sessionStorage,__env,$filter){
    var uid = $localStorage.uid;
    var token = $localStorage.userToken;

    var filter = $filter('translate')

    if ($localStorage[uid + 'keys']){
      $scope.userKeys = $localStorage[uid + 'keys']
    }else{
      $scope.userKeys = [];
    }

    $scope.toggleShowPassword = function() {
      $scope.showPassword = !$scope.showPassword;
    }

    $scope.error = false;


    // receives a random generated 12 words phrase
    $scope.generarPalabras = function (){
      $http({
        url: __env.apiUrl + 'mnemonic',
        method: 'GET'
      }).then(function (response){
        if (response.data.status == 200){
            $scope.phrase = response.data.message;
        }else{
          alert(response.data.message);
        }  
      })
          
    }

    var checkActiveKeys = function (keys){
      for (var i = 0; i < keys.length; i++){
          keys[i].activated = false;
          for (var j = 0; j < $scope.userKeys.length; j++){
              if (keys[i].name == $scope.userKeys[j].keyname ){
                keys[i].activated = true;
              }
          }
          if (i == (keys.length -1)){
              return keys
          }  
      }

    }

    // check the existing keys on the cloud
    $scope.checkKeys = function(){
      $http({
        url: __env.apiUrl + __env.profile + uid + '/getKeys',
        method: 'GET',
        headers: {'Authorization':'Bearer: ' + token}
      }).then(function (response){
            var keys = response.data.data;
            $scope.keys = checkActiveKeys(keys);
            console.log($scope.keys.length)
      }).catch(function (error){
          if (error.status == 401){
            alert(filter('keys.expired_error'))
            $state.go('login');
          }else{
            console.log(error.data);
          }
        })
          
    }

    //changes the default key

    $scope.useKeys = function (name){
      for (var i = 0; i < $scope.userKeys.length;i++){
          $scope.userKeys[i].default = false;
          if ($scope.userKeys[i].keyname == name){
              $scope.userKeys[i].default = true;
          }
          if (i == ($scope.userKeys.length - 1)){
             $localStorage[uid + 'keys'] = $scope.userKeys;
          }
      }
      var updateDefault = $.param({
        name: name
      })
      $http({
        url: __env.apiUrl + __env.profile+ uid + '/updateDefault',
        method: 'PUT',
        data: updateDefault,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
      }).then(function (response){
            console.log('Data updated on the cloud')
            $state.reload();
      }).catch(function (error){
          if (error.status == 401){
            $state.go('login');
          }else{
            console.log(error.data);
          }
        })
    }

    $scope.close = function (){
      var popup = angular.element("#changeKey");
      //for hide model
      popup.modal('hide');
      delete $localStorage.todelete
    }

    //function that sends keypair to the cloud

    var storekeys = function (public,private,name,popup){
        
        var storeRequest = $.param({
          pubkey: public,
          privkey: private,
          keyname: name
        })
          
        $http({
          url: __env.apiUrl + __env.profile + $localStorage.uid + '/storeKeys',
          method: 'POST',
          data: storeRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
            if (response.data.status == 200){
                console.log('keys stored succesfully')
                popup.modal('hide');
                $state.realod();
            }else{
              alert(response.data.message);
            }
        }).catch(function (e){
          if (e.status == 401){
              $state.go('login');
            }
          })
    }

    //store the newly created pair on local storage

    var localStorekeys = function(public,private,name,defecto = false){
      var newKey = {
        keyname: name,
        publicKey: public,
        privateKey: private,
        default: defecto
      }

      $scope.userKeys.push(newKey);
      $localStorage[uid + 'keys'] = $scope.userKeys;
    }

    //funciton that checks form fields

    checkParameters = function (){
        if (($scope.keyname == "")  && ($scope.name == "") && ($scope.email == "") && ($scope.passphrase = "") && ($scope.phrase == "")){
          return false;
        }else{
          return true;
        }
    }


    //function that generates a new key pair
    $scope.generateKeys =  function (){
          if (checkParameters){
            var uid = $localStorage.uid;
            var options = {
                userIds: [{ name: $scope.name, email: $scope.email}],
                numBits: 4096,
                passphrase: $scope.passphrase,
            }
            var popup = angular.element("#keySpinner");
            //for hide model
            popup.modal('show');
            var words = translate($scope.phrase);
            console.log(words)
            console.log("Generating Keys")
            openpgp.generateKey(options).then(function(key){
                var privkey = key.privateKeyArmored;
                var pubkey = key.publicKeyArmored;
                console.log('keys created')
                console.log('keys encrypted');
                // encrypt keys on local storage
                var localPrivateKey = encryptKeys(privkey,$scope.passphrase)
                localPrivateKey = localPrivateKey.toString();
                localStorekeys(pubkey,localPrivateKey,$scope.newName);
                // encrypt keys and send to cloud
                var privateKey = encryptKeys(privkey,words)
                privateKey = privateKey.toString()
                storekeys(pubkey,privateKey,$scope.newName,popup)
                console.log('keys sent to cloud');
              }).catch(function (error){
                console.log(error.code + '\n' + error.message);
              })
            }else{
              alert(filter('keys.error_field'))
            }    
        }
        
    //get a keyname for deletion    

    $scope.getKeyname = function (name){
      $localStorage.keyDelete = name;
      
    }

    //get a keyname to recover

    $scope.getRecover = function (name){
      $scope.error = false;
      $localStorage.KeyRecover = name;
      $scope.recoverKeys();
    }
    
    //deletes a keypair
    
    var localDelete = function(name){
      for (var i = 0 ; i < $scope.userKeys.length; i++){
        if ($scope.userKeys[i].keyname == name){
            $scope.userKeys.splice(i,1);
        }
      }
    }

    $scope.deleteKeys  =  function (){

      var name = $localStorage.keyDelete;
      var deleteRequest = $.param({
        name: name
      })

      $http({
        url: __env.apiUrl + __env.profile + $localStorage.uid + '/deleteKey',
        method: 'DELETE',
        data: deleteRequest,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
      }).then(function (response){
            if (response.status == 200){
              delete $localStorage.keyDelete;
              localDelete(name);
              $state.reload();
            }
        }).catch(function (e){
          if (e.status == 401){
              $state.go('login');
            }else{
              console.log(e)
            }
          })
    }

    $scope.recoverKeys = function (){
      var name = $localStorage.KeyRecover;
      var recoverRequest = $.param({
        name: name
      })

      $http({
        url: __env.apiUrl + __env.profile + $localStorage.uid + '/recoverKey',
        method: 'POST',
        data: recoverRequest,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
      }).then(function (response){
          if (response.data.status == 200){
              console.log('the key has been retrieved from cloud');
              var popup = angular.element("#changeKey");
              //for hide model
              popup.modal('show');
              $localStorage.recoveryKey = response.data.data;
          }else{
            alert(response.data.message);
          }
      }).catch(function (e){
          if (e.status == 401){
              $state.go('login');
            }else{
              console.log(e.data);
            }
          })

    }

    $scope.closeRecover = function (){
      var popup = angular.element("#changeKey");
      //for hide model
      popup.modal('hide');
      $scope.error = false;
      $scope.phraseRecovery = ""
      delete $localStorage.KeyRecover;
      delete $localStorage.recoveryKey;
    }

    $scope.checkWords = function (){
      var words = translate($scope.phraseRecovery)
      var bytes  = CryptoJS.AES.decrypt($localStorage.recoveryKey.PrivKey,words);
      try {
        var priv = bytes.toString(CryptoJS.enc.Utf8);
        $localStorage.recoveryKey.PrivKey = priv;
          var popup = angular.element("#changeKey");
          //for hide model
          popup.modal('hide');
          var popup = angular.element("#appPass");
          //for hide model
          popup.modal('show');
      }catch(e){
       $scope.error = filter('keys.error_pass')
      }
    }

    
    var encryptContent = async (privkey,pubkey,passphrase) =>{
      const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
      await privKeyObj.decrypt(passphrase)
      const options = {
          message: openpgp.message.fromText('hello there'),      
          publicKeys: (await openpgp.key.readArmored(pubkey)).keys                              
      }

      return openpgp.encrypt(options).then(ciphertext => {
        var encrypted = ciphertext.data 
        console.log(encrypted)
        return encrypted

      })
    }    


    $scope.newPassword = function (){
      var words = translate($scope.keyPass)
      if (words){
            a = encryptContent($localStorage.recoveryKey.PrivKey,$localStorage.recoveryKey.PubKey,words)
            a.then(function (){
            var localPrivateKey = encryptKeys($localStorage.recoveryKey.PrivKey,words)
            localPrivateKey = localPrivateKey.toString();
            localStorekeys($localStorage.recoveryKey.PubKey,localPrivateKey,$localStorage.recoveryKey.name,$localStorage.recoveryKey.default);
            var popup = angular.element("#appPass");
            popup.modal('hide');
            alert(filter('keys.success'))
            delete $localStorage.recoveryKey
            $scope.keyPass = ""
            $window.location.reload();
          }).catch(function (error){
            console.log(error)
            $scope.error = filter('keys.error_pass')
          })
      }else{
        alert('inserte passphrase de llave')
      }
    }

    $scope.copy = function(){
      var copyText = document.getElementById('phrase');
      copyText.select(); 
      document.execCommand("copy");
    }


})            