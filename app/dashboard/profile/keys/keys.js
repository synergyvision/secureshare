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
    $scope.key = $localStorage[uid + '-pubkey'];
    $scope.keyname = $localStorage[uid + '-keyname'];

    $scope.toggleShowPassword = function() {
      $scope.showPassword = !$scope.showPassword;
    }

    $scope.generarPalabras = function (){
      console.log('fetching')
      $http({
        url: 'https://sharekey.herokuapp.com/mnemonic',
        method: 'GET',
      }).then(function (response){
        if (response.data.status == 200){
            $scope.words = response.data.message;
        }else{
          error(response.data.message);
        }  
      })
          
    }

    storekeys = function (public,private,pass){
        
        var storeRequest = $.param({
          pubkey: public,
          privkey: private,
          pass: pass
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
              error(response.data.message);
            }
        }).catch(function (e){
          if (e.status == 401){
              error('Su sesion ha vencido por inactividad')
              $location.path('/login');
            }
          })
    }

    checkParameters = function (){
        if (($scope.keyname == "")  && ($scope.name == "") && ($scope.email == "") && ($scope.passphrase = "") && ($scope.phrase == "")){
          return false;
        }else{
          return true;
        }
    }

    $scope.generateKeys =  function (){
          if (checkParameters){
            var uid = $localStorage.uid;
            var options = {
                userIds: [{ name: $scope.name, email: $scope.email}],
                numBits: 4096,
                passphrase: $scope.passphrase,
            }
            words = translate($scope.phrase);
            console.log("Generating Keys")
            $localStorage[uid + '-keyname'] = $scope.keyname
            openpgp.generateKey(options).then(function(key){
                var privkey = key.privateKeyArmored;
                var pubkey = key.publicKeyArmored;
                console.log('keys created')
                var privateKey = encryptKeys(privkey,words)
                var pass = encryptKeys($scope.passphrase,words)
                privateKey = privateKey.toString()
                pass = pass.toString();
                $localStorage[uid + '-pubkey'] = pubkey;
                $localStorage[uid + '-privateKey'] = privateKey;
                $localStorage[uid + '-pass'] = pass;
                console.log('keys encrypted');
                storekeys(pubkey,privateKey,pass)
              }).catch(function (error){
                console.log(error.code + '\n' + error.message);
              })
            }else{
              error('Por favor llene todos los campos')
            }    
        }
    
        
    $scope.deleteKeys  =  function (){
      delete $localStorage[uid + '-pubkey'];
      delete $localStorage[uid + '-privateKey'];
      delete $localStorage[uid + '-pass'];
      delete $localStorage[uid + '-keyname'];
      $window.location.reload();
    }

    $scope.recoverKeys = function (){
      $http({
        url: 'https://sharekey.herokuapp.com/profile/' + $localStorage.uid + '/getKeys',
          method: 'GET',
        }).then(function (response){
            if (response.status == 200){
              $localStorage[uid + '-pubkey'] = response.data.publicKey;
              $localStorage[uid + '-privateKey'] = response.data.privateKey;
              $localStorage[uid + '-pass'] = response.data.passphrase;
              success('Keys retrieved')
              console.log('got here');
              $state.reload();
            }else{
              error(response.data.message);
            }
        }).catch(function (e){
          if (e.status == 401){
              error('Su sesion ha vencido por inactividad')
              $location.path('/login');
            }
          })
    }
        
  })            