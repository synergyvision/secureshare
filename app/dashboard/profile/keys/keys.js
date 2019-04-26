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

  angular.module('sharekey.keys', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.keys', {
      url: '/keys',
      templateUrl: '../dashboard/profile/keys/keys.html',
      controller: 'keysController',
      css: 'keys.css'
    })
  }])
  
  .controller('keysController', function($scope,$http,$localStorage,$state,$window){
    var uid = $localStorage.uid;
    if ($localStorage[uid + 'keys']){
      $scope.userKeys = $localStorage[uid + 'keys']
    }else{
      $scope.userKeys = [];
    }

    $scope.toggleShowPassword = function() {
      $scope.showPassword = !$scope.showPassword;
    }


    // receives a random generated 12 words phrase
    $scope.generarPalabras = function (){
      $http({
        url: 'https://sharekey.herokuapp.com/mnemonic',
        method: 'GET',
      }).then(function (response){
        if (response.data.status == 200){
            $scope.words = response.data.message;
        }else{
          alert(response.data.message);
        }  
      })
          
    }

    var checkActiveKeys = function (keys){
      for (i = 0; i < keys.length; i++){
          keys[i].activated = false;
          for (j = 0; j < $scope.userKeys.length; j++){
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
        url: 'https://sharekey.herokuapp.com/profile/' + uid + '/getKeys',
        method: 'GET'
      }).then(function (response){
            var keys = response.data.data;
            $scope.keys = checkActiveKeys(keys);
      }).catch(function (error){
          if (error.status == 401){
            alert('Su sesion ha vencido por inactividad')
            $state.go('login');
          }else{
            console.log(error.data);
          }
        })
          
    }

    //changes the default key

    $scope.useKeys = function (name){
      for (i = 0; i < $scope.userKeys.length;i++){
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
        url: 'https://sharekey.herokuapp.com/profile/' + uid + '/updateDefault',
        method: 'PUT',
        data: updateDefault,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
      }).then(function (response){
            console.log('Data updated on the cloud')
            $state.reload();
      }).catch(function (error){
          if (error.status == 401){
            alert('Su sesion ha vencido por inactividad')
            $location.path('/login');
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

    storekeys = function (public,private,pass,name){
        
        var storeRequest = $.param({
          pubkey: public,
          privkey: private,
          pass: pass,
          keyname: name
        })
          
        $http({
          url: 'https://sharekey.herokuapp.com/profile/' + $localStorage.uid + '/storeKeys',
          method: 'POST',
          data: storeRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
        }).then(function (response){
            if (response.data.status == 200){
                console.log('keys stored succesfully')
                $window.location.reload();
            }else{
              alert(response.data.message);
            }
        }).catch(function (e){
          if (e.status == 401){
              alert('Su sesion ha vencido por inactividad')
              $location.path('/login');
            }
          })
    }

    //store the newly created pair on local storage

    var localStorekeys = function(public,private,pass,name){
      var newKey = {
        keyname: name,
        publicKey: public,
        privateKey: private,
        passphrase: pass,
        default: false
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
            words = translate($scope.phrase);
            password = translate($scope.password);
            console.log("Generating Keys")
            openpgp.generateKey(options).then(function(key){
                var privkey = key.privateKeyArmored;
                var pubkey = key.publicKeyArmored;
                console.log('keys created')
                console.log('keys encrypted');
                // encrypt keys on local storage
                var localPrivateKey = encryptKeys(privkey,password)
                var localPass = encryptKeys($scope.passphrase,password)
                localPrivateKey = localPrivateKey.toString();
                localPass = localPass.toString();
                localStorekeys(pubkey,localPrivateKey,localPass,$scope.newName);
                // encrypt keys and send to cloud
                var privateKey = encryptKeys(privkey,words)
                var pass = encryptKeys($scope.passphrase,words)
                privateKey = privateKey.toString()
                pass = pass.toString();
                storekeys(pubkey,privateKey,pass,$scope.newName)
                console.log('keys sent to cloud');
              }).catch(function (error){
                console.log(error.code + '\n' + error.message);
              })
            }else{
              alert('Por favor llene todos los campos')
            }    
        }
        
    //get a keyname for deletion    

    $scope.getKeyname = function (name){
      $localStorage.keyDelete = name;
      
    }

    //get a keyname to recover

    $scope.getRecover = function (name){
      $localStorage.KeyRecover = name;
      console.log(name);
      $scope.recoverKeys();
    }
    
    //deletes a keypair
    
    $scope.deleteKeys  =  function (){

      name = $localStorage.keyDelete;
      var deleteRequest = $.param({
        name: name
      })

      $http({
        url: 'https://sharekey.herokuapp.com/profile/' + $localStorage.uid + '/deleteKey',
        method: 'DELETE',
        data: deleteRequest,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
      }).then(function (response){
            if (response.status == 200){
              alert('Se ha borrado una llave');
              delete $localStorage.keyDelete;
              $state.reload();
            }
        }).catch(function (e){
          if (e.status == 401){
              alert('Su sesion ha vencido por inactividad')
              $location.path('/login');
            }else{
              console.log(e.data)
            }
          })
    }

    $scope.recoverKeys = function (){
      name = $localStorage.KeyRecover;
      var recoverRequest = $.param({
        name: name
      })

      $http({
        url: 'https://sharekey.herokuapp.com/profile/' + $localStorage.uid + '/recoverKey',
        method: 'POST',
        data: recoverRequest,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
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
              alert('Su sesion ha vencido por inactividad')
              $location.path('/login');
            }else{
              console.log(e.data);
            }
          })

    }

    $scope.closeRecover = function (){
      var popup = angular.element("#changeKey");
      //for hide model
      popup.modal('hide');
      delete $localStorage.KeyRecover;
      delete $localStorage.recoveryKey;
    }

    $scope.checkWords = function (){
      console.log($localStorage.recoveryKey.passphrase);
      words = translate($scope.phraseRecovery)
      var bytes  = CryptoJS.AES.decrypt($localStorage.recoveryKey.passphrase,words);
      var pass = bytes.toString(CryptoJS.enc.Utf8);
      if (pass != ""){
          $localStorage.recoveryKey.passphrase = pass;
          var bytes  = CryptoJS.AES.decrypt($localStorage.recoveryKey.PrivKey,words);
           $localStorage.recoveryKey.PrivKey = bytes.toString(CryptoJS.enc.Utf8);
          var popup = angular.element("#changeKey");
          //for hide model
          popup.modal('hide');
          var popup = angular.element("#newPassword");
          //for hide model
          popup.modal('show');
          
      }else{
        alert("La clave insertada no es correcta")
      }
      
    }

    $scope.newPassword = function (){
      words = translate($scope.newPass)
      var localPrivateKey = encryptKeys($localStorage.recoveryKey.PrivKey,words)
      var localPass = encryptKeys($localStorage.recoveryKey.passphrase,words)
      localPrivateKey = localPrivateKey.toString();
      localPass = localPass.toString();
      localStorekeys($localStorage.recoveryKey.PubKey,localPrivateKey,localPass,$localStorage.recoveryKey.name);
      var popup = angular.element("#newPassword");
      //for hide model
      popup.modal('hide');
      alert("LLave activada exitosamente");
      delete $localStorage.recoveryKey
      $window.location.reload();
      
    }





})            