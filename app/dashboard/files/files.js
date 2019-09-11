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

    var readFileEncrypt = function (key){
      var aReader = new FileReader();
      aReader.readAsText($scope.file, "UTF-8");
        aReader.onload = function (evt) {
          var fileContent = aReader.result;
          encryptContent(key,fileContent)
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


})