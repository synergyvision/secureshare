angular.module('sharekey.files', ['ui.router','ngFileSaver'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.files', {
      url: '/files',
      templateUrl: 'dashboard/files/files.html',
      controller: 'filesController',
      css: 'files.css'
    });
}])

.controller('filesController', function(FileSaver,Blob,$scope,$http,$localStorage,$state,$window,$sessionStorage,$stateParams,__env){
    $scope.uid = $localStorage.uid;
    var token = $localStorage.userToken;
    $scope.userKeys = $localStorage[uid + 'keys'];

    
    decryptContent = async (key,passphrase,content) => {
      const privKeyObj = (await openpgp.key.readArmored(key)).keys[0]
      await privKeyObj.decrypt(passphrase)
      const options = {
        message: await openpgp.message.readArmored(content),    // parse armored message
        privateKeys: [privKeyObj]                                 // for decryption
    }

    openpgp.decrypt(options).then(plaintext => {
      var data = new Blob([plaintext.data], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, $scope.file.name);
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

    readFile = function (key,passphrase){
      var aReader = new FileReader();
      aReader.readAsText($scope.file, "UTF-8");
        aReader.onload = function (evt) {
          fileContent = aReader.result;
          decryptContent(key,passphrase,fileContent)
      }
      aReader.onerror = function (evt) {
          console.log(evt)
      }
    }

    $scope.decipher = function (){
      key = getPrivateKey($scope.privateKey)
      key = decryptKey(key,$sessionStorage.appKey)
      readFile(key,$scope.passphrase)
    }


})