angular.module('SecureShare.repos', ['ui.router','ngFileSaver'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.repos', {
      url: '/repos',
      templateUrl: 'dashboard/repos/repos.html',
      controller: 'reposController',
      css: 'repos.css'
    });
    $stateProvider.state('dash.repo', {
      url: '/repos/?dir',
      templateUrl: 'dashboard/repos/repo.html',
      controller: 'reposController',
      css: 'repos.css'
    });
    $stateProvider.state('dash.newRepo', {
      url: '/repos/new',
      templateUrl: 'dashboard/repos/newRepo.html',
      controller: 'reposController',
      css: 'repos.css'
    });
    $stateProvider.state('dash.newFile', {
      url: '/repos/createFile/?repo/?directory',
      templateUrl: 'dashboard/repos/newFile.html',
      controller: 'reposController',
      css: 'repos.css'
    });

    

  }])

  .controller('reposController', function(FileSaver,Blob,$scope,$http,$localStorage,$state,$window,$stateParams,__env,$filter){
    $scope.uid = $localStorage.uid;
    var uid = $localStorage.uid;
    var token = $localStorage.userToken;
    var dir = $stateParams.dir; 
     $scope.directory = $stateParams.directory
     $scope.repository = $stateParams.repo;
     $scope.userKeys = $localStorage[uid + 'keys'];

     var translate = $filter('translate')

    //function cheks if the user has created a github token by signing in with the app 

    $scope.checkToken = function (){
        $http({
          url: __env.apiUrl + __env.repos + uid + '/checkToken',
          method: 'GET',
          headers: {'Authorization':'Bearer: ' + token} 
      }).then(function (response){
          $scope.tokenExists = response.data.tokenExists
          if ($scope.tokenExists == true){
            getRepoList()
          }else{
            console.log('here')
            $state.go('dash.config')
          }
      }).catch(function (error){
          console.log(error)
      })
    }

    //function gets the user lists of repositories

    var getRepoList = function (){
        $http({
            url: __env.apiUrl + __env.repos + uid + '/listRepos',
            method: 'GET',
            headers: {'Authorization':'Bearer: ' + token} 
        }).then(function (response){
          console.log(response.data.repoList)
            $scope.repoList = response.data.repoList
        }).catch(function (error){
            console.log(error)
        })
    }

    //retrieves the server public key

   var getServerKey = function (){
      return $http({
        url: __env.apiUrl + 'config/serverKeys',
        method: 'GET'
      }).then(function(response){
        return response.data.publickey
      }).catch(function (error){
        console.log(error)
      })
    }

    //function retrieves basic data of a repo
  
    $scope.getRepo = function (){
        $http({
          url: __env.apiUrl + __env.repos + uid + '/getRepo/' + dir,
          method: 'GET',
          headers: {'Authorization':'Bearer: ' + token} 
        }).then(function (response){
            console.log(response.data)
            $scope.repo = response.data.repoData;
        }).catch(function (error){
          console.log(error)
        })

    }

    //function gets the content of the given path of a repo

    $scope.getContents = function (path = null){
      if (path != null){
        directory = $.param({
          dir: path
        })
      }else{
        directory = null;
      }
      $http({
        url: __env.apiUrl + __env.repos + uid + '/getContents/' + dir,
        method: 'POST',
        data: directory,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token} 
      }).then(function (response){
          $scope.path =path;
          $scope.empty = false;
          $scope.repoFiles = response.data.data;
          $scope.size =  $scope.repoFiles.length;
          if ($scope.repoFiles.message == 'This repository is empty.' || $scope.size == 0){
            $scope.empty = true;
          }
          else if (!$scope.size){
            content = atob($scope.repoFiles.content)
            $scope.repoFiles.content = content.toString()
          }
      }).catch(function (error){
        console.log(error)
      })
    }

    //function creates a new repo

    $scope.createRepo = function(){
      var newRepo = {
        name: $scope.name,
        description: $scope.description
      }
      if ($scope.privateRepo && $scope.privateRepo == true){
        newRepo.private = $scope.privateRepo
      }
      newRepo = $.param(newRepo);
      $http({
        url: __env.apiUrl + __env.repos + uid + '/createRepo',
        method: 'POST',
        data: newRepo,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token} 
      }).then(function (response){
          console.log('Repo created succesfully'),
          $state.go('dash.repos');
      }).catch(function (error){
        console.log(error)
      })
    }

    //function goes to the new file page

    $scope.goToNewFile = function (path = null){
      $state.go('dash.newFile',{'repo':dir ,'directory': path});
    }

    //function gets the user chosen public key

    var getPublicKey = function (name){
      for (var i = 0 ; i < $scope.userKeys.length; i++){
          if ($scope.userKeys[i].keyname ==name){
              return $scope.userKeys[i].publicKey
          }
      }
    }

    //function gets the user chosen private key

    var getPrivateKey = function (name){
      for (var i = 0 ; i < $scope.userKeys.length; i++){
          if ($scope.userKeys[i].keyname ==name){
              return $scope.userKeys[i].privateKey
          }
      }
    }

    //function encripts the content of a file with the given key

    encrypt = async (content,pubkey) => {
        const options = {
          message: openpgp.message.fromText(content),       // input as Message object
          publicKeys: (await openpgp.key.readArmored(pubkey)).keys, // for encryption
      }
 
     return openpgp.encrypt(options).then(ciphertext => {
          encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
          return encrypted
      })
    }

    //function reads an uploaded file

    $scope.readFile = function (){
      if ($scope.publicFile){
        var aReader = new FileReader();
        aReader.readAsText($scope.file, "UTF-8");
         aReader.onload = function (evt) {
            fileContent = aReader.result;
            pubKey = getPublicKey($scope.repoKey)
            encryptedContent = encrypt(fileContent,pubKey)
            encryptedContent.then(function (encryptedContent){
              var blob = new Blob([encryptedContent], {type: 'application/x-javascript'});
              createFile(blob);
            })
        }
        aReader.onerror = function (evt) {
           console.log(evt)
        }
      }else{
        createFile($scope.file)
      }  
    }

    //function creates a new file and uploads it to the repo

    createFile = function (file){
      if ($scope.directory){
       var path = $scope.directory + '/' + $scope.fileName
      }else{
       var path = $scope.fileName
      }
        var newFile = {
          dir: path,
          commit: $scope.commit,
          file: file
        }
      $http({
        url: __env.apiUrl + __env.repos + uid + '/pushFile/' + $scope.repository,
        method: 'PUT',
        data: newFile,
        headers: {'Content-Type': undefined,'Authorization':'Bearer: ' + token},
        transformRequest: function (data, headersGetter) {
          var formData = new FormData();
          angular.forEach(data, function (value, key) {
              formData.append(key, value);
          });
          return formData;
        }
      }).then(function (response){  
          console.log(response.data);
          $state.go('dash.repo',{'dir':  $scope.repository})

      }).catch(function (error){
        console.log(error)
      })
    }

    //function deletes a file from the repo

    $scope.deleteFile = function(sha,name){
      var fileDelete = $.param({
        sha: sha,
        dir:  $scope.path
      })
      $http({
        url: __env.apiUrl + __env.repos + uid + '/deleteFile/' + dir,
        method: 'DELETE',
        data: fileDelete,
        headers:{'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
      }).then(function (response){
          console.log(response.data);
          $state.reload();
      }).catch(function (error){
        console.log(error)
      })
    }

    //function downloads a new file

    $scope.downloadFile = function (name,content){
      var data = new Blob([content], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, name);
    }


    //deciphering modal

    $scope.openModal = function(){
      var popup = angular.element('#decipher')
      popup.modal('show')
    }

    //decrypts the content of a filre

    decryptContent = async (key,passphrase) => {
      try {
          const privKeyObj = (await openpgp.key.readArmored(key)).keys[0]
          await privKeyObj.decrypt(passphrase)
          console.log($scope.repoFiles.content)
          const options = {
            message: await openpgp.message.readArmored($scope.repoFiles.content),    // parse armored message
            privateKeys: [privKeyObj]                                 // for decryption
          }

          openpgp.decrypt(options).then(plaintext => {
            var data = new Blob([plaintext.data], { type: 'text/plain;charset=utf-8' });
            FileSaver.saveAs(data, $scope.repoFiles.name);
            var popup = angular.element('#decipher')
            popup.modal('hide')
          })
      }catch(error){
        alert(translate('repositories.error'))
      }  

    }

    //decrypts the private key to be used

    var decryptKey = function (key,password) {
      var bytes  = CryptoJS.AES.decrypt(key,password);
      var key = bytes.toString(CryptoJS.enc.Utf8);
      return key;
  
    }

    //reads and encrypted file from the repo

    $scope.decipherDownload = function (){
      var key = getPrivateKey($scope.repoKey)
      key = decryptKey(key,$scope.keyPass)
      decryptContent(key,$scope.keyPass)
    }

    //push modals

    $scope.openPush = function (){
      var popup = angular.element('#update')
      popup.modal("show")
    }

    //function updates an existing file from the repo

    updateFile = function (file){
      var pushFile = {
        dir: $scope.path,
        commit: $scope.commit,
        file: file,
        sha: $scope.repoFiles.sha
      }
      $http({
          url: __env.apiUrl + __env.repos + uid + '/pushFile/' + dir,
          method: 'PUT',
          data: pushFile,
          headers: {'Content-Type': undefined,'Authorization':'Bearer: ' + token},
          transformRequest: function (data, headersGetter) {
            var formData = new FormData();
            angular.forEach(data, function (value, key) {
                formData.append(key, value);
            });
            return formData;
          }
        }).then(function (response){  
            console.log(response.data);
            var popup = angular.element('#update')
            popup.modal('hide')
            $state.reload()
        }).catch(function (error){
          console.log(error)
        })
      }

    //reads encripted file from the repo to be updated  

    readEncrypted = function (){
      var aReader = new FileReader();
      aReader.readAsText($scope.file, "UTF-8");
        aReader.onload = function (evt) {
          var fileContent = aReader.result;
          var pubKey = getPublicKey($scope.repoKey)
          var encryptedContent = encrypt(fileContent,pubKey)
          encryptedContent.then(function (encryptedContent){
            var blob = new Blob([encryptedContent], {type: 'application/x-javascript'});
            updateFile(blob);
          })
      }
      aReader.onerror = function (evt) {
          console.log(evt)
      }
    }

    // if the file is not encripted it uploads it if not dit decrypt it

    $scope.pushFile = function(){
        if(!$scope.publicFile){
          updateFile($scope.file)
        }else{
          readEncrypted($scope.file)
        }

    }

    //returns to home path of the repo

    $scope.homeRepo = function(){
      $state.reload()
    }

  })