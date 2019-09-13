angular.module('sharekey.files', ['ui.router','ngFileSaver'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.files', {
      url: '/files',
      templateUrl: 'dashboard/files/files.html',
      controller: 'filesController',
      css: 'files.css'
    });
}])

.controller('filesController', function(FileSaver,Blob,$scope,$http,$localStorage,$state,$window,$stateParams,__env){
    $scope.uid = $localStorage.uid;
    var uid = $localStorage.uid;
    var token = $localStorage.userToken;
    $scope.userKeys = $localStorage[uid + 'keys'];
    $scope.share = false;
    $scope.selected = [];

    
    var decryptContent = async (key,passphrase,content) => {
      try{
          const privKeyObj = (await openpgp.key.readArmored(key)).keys[0]
          await privKeyObj.decrypt(passphrase)
          const options = {
            message: await openpgp.message.readArmored(content),    // parse armored message
            privateKeys: [privKeyObj]                                 // for decryption
        }

        openpgp.decrypt(options).then(plaintext => {
          var data = new Blob([plaintext.data], { type: 'text/plain;charset=utf-8' });
          FileSaver.saveAs(data, $scope.file.name);
          $state.reload()
        })
      }catch(e){
        alert('Error verifique su llave seleccionada y passphrase sean correctos')
      }
    }

    var encryptContent = async (key,content) =>{
      const options = {
          message: openpgp.message.fromText(content),      
          publicKeys: (await openpgp.key.readArmored(key)).keys                              
      }

      openpgp.encrypt(options).then(ciphertext => {
        var data = new Blob([ciphertext.data], { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(data, $scope.file.name);
        $state.reload()
      })
    }

    var decryptKey = function (key,password) {
      var bytes  = CryptoJS.AES.decrypt(key,password);
      var key = bytes.toString(CryptoJS.enc.Utf8);
      return key;
  
    }

    var getPrivateKey = function (name){
      for (var i = 0 ; i < $scope.userKeys.length; i++){
          if ($scope.userKeys[i].keyname ==name){
              return $scope.userKeys[i].privateKey
          }
      }
    }

    var getPublicKey = function (name){
      for (var i = 0 ; i < $scope.userKeys.length; i++){
          if ($scope.userKeys[i].keyname == name){
              return $scope.userKeys[i].publicKey
          }
      }
    }

    readFileDecrypt = function (key,passphrase){
      var aReader = new FileReader();
      aReader.readAsText($scope.file, "UTF-8");
        aReader.onload = function (evt) {
          var fileContent = aReader.result;
          decryptContent(key,passphrase,fileContent)
      }
      aReader.onerror = function (evt) {
          console.log(evt)
      }
    }

    var encryptMultipleKeys = async (pubkeys, message) => {
        pubkeys = pubkeys.map(async (key) => {
          return (await openpgp.key.readArmored(key)).keys[0]
        });
          const options = {
            message: openpgp.message.fromText(message),
            publicKeys: await Promise.all(pubkeys)       				  // for encryption
          }
          return openpgp.encrypt(options).then(ciphertext => {
            var data = new Blob([ciphertext.data], { type: 'text/plain;charset=utf-8' });
            FileSaver.saveAs(data, $scope.file.name);
            $state.reload()
        })
     };

    var readFileEncrypt = function (key){
      var aReader = new FileReader();
      aReader.readAsText($scope.file, "UTF-8");
        aReader.onload = function (evt) {
          var fileContent = aReader.result;
          if ($scope.otherKeys){
            $scope.otherKeys.push(key);
            encryptMultipleKeys($scope.otherKeys,fileContent)
          }else{
            encryptContent(key,fileContent)
          }
      }
      aReader.onerror = function (evt) {
          console.log(evt)
      }
    }

    $scope.decipher = function (){
      if ($scope.operation == 2){
        var key = getPrivateKey($scope.key)
        key = decryptKey(key,$scope.passphrase)
        readFileDecrypt(key,$scope.passphrase)
      }else if ($scope.operation == 1){
        var key = getPublicKey($scope.key)
        readFileEncrypt(key)
      }
    }

    $scope.addId = function (id){
      $scope.exists = false
      for (var i = 0; i < $scope.selected.length; i++){
        if ($scope.selected[i] == id){
          $scope.selected.splice(i,1)
          $scope.exists = true
        }
      }
      if ($scope.exists == false){
        $scope.selected.push(id)
      }
      console.log($scope.selected)
      
    }

    $scope.getContacts = function (){
      $http({
        url: __env.apiUrl + __env.profile + uid + '/contacts',
        method: 'GET',
        headers: {'Authorization':'Bearer: ' + token} 
      }).then(function (response){
          $scope.contacts = response.data.data;
          console.log($scope.contacts)
      }).catch(function (error){
          alert(error.message);
      })
    }

    $scope.deleteContacts = function(){
      $scope.selected = [];
      console.log($scope.selected)
    }

       $scope.getMultipleKeys = async()=>{
        var keyRequest = $.param({
          id: JSON.stringify($scope.selected)
        })
       await $http({
          url: __env.apiUrl + __env.profile + uid + '/getMultipleKeys',
          method: 'POST',
          data: keyRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
            console.log('retrieved public keys from server')
            $scope.otherKeys = response.data.data;
        }).catch(function (error){
            console.log(error);
        })
    }
    

})