angular.module('sharekey.repos', ['ui.router','ngFileSaver'])
  
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

  .controller('reposController', function(FileSaver,Blob,$scope,$http,$localStorage,$state,$window,$sessionStorage,$stateParams,__env){
    $scope.uid = $localStorage.uid;
    var token = $localStorage.userToken;
    var dir = $stateParams.dir; 
     $scope.directory = $stateParams.directory
     $scope.repository = $stateParams.repo;
     $scope.userKeys = $localStorage[uid + 'keys'];

    $scope.checkToken = function (){
      $http({
        url: __env.apiUrl + __env.repos + uid + '/checkToken',
        method: 'GET',
        headers: {'Authorization':'Bearer: ' + token} 
    }).then(function (response){
        $scope.tokenExists = response.data.tokenExists
        if ($scope.tokenExists == true){
          getRepoList()
        }
    }).catch(function (error){
        console.log(error)
    })

    }
    getRepoList = function (){
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

   getServerKey = function (){
      return $http({
        url: __env.apiUrl + 'configkeys/',
        method: 'GET'
      }).then(function(response){
        return response.data.publickey
      }).catch(function (error){
        console.log(error)
      })
    }
  
    encryptPassword = async (password) =>{
      var publicKey = getServerKey()
      return publicKey.then(async (publicKey) => {
        publicKey = publicKey.replace(/(?:\\[r])+/g, "");
        const options = {
          message: openpgp.message.fromText(password),      
          publicKeys: (await openpgp.key.readArmored(publicKey)).keys 
        }
        return openpgp.encrypt(options).then(ciphertext => {
            var encrypted = ciphertext.data
            return encrypted
        })
      })
    }

    $scope.getToken = function (){
      password = encryptPassword($scope.password)
      password.then(function (password){
        var loginGit = $.param({
          username: $scope.username,
          password: password
        }) 
        $http({
          url: __env.apiUrl + __env.repos + uid + '/getToken',
          method: 'POST',
          data: loginGit,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token} 
        }).then(function (response){
            console.log(response.data)
        }).catch(function (error){
            console.log(error)
        })
      })  
    }

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

    $scope.goToNewFile = function (path = null){
      $state.go('dash.newFile',{'repo':dir ,'directory': path});
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
          if ($scope.userKeys[i].keyname ==name){
              return $scope.userKeys[i].privateKey
          }
      }
    }

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

    createFile = function (file){
      if ($scope.directory){
        path = $scope.directory + '/' + $scope.fileName
      }else{
        path = $scope.fileName
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

    $scope.deleteFile = function(sha,name){
      fileDelete = $.param({
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

    $scope.downloadFile = function (name,content){
      var data = new Blob([content], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, name);
    }


    $scope.openModal = function(){
      var popup = angular.element('#decipher')
      popup.modal('show')
    }

    decryptContent = async (key,passphrase) => {
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

    }

    var decryptKey = function (key,password) {
      var bytes  = CryptoJS.AES.decrypt(key,password);
      var key = bytes.toString(CryptoJS.enc.Utf8);
      return key;
  
    }

    $scope.decipherDownload = function (){
      key = getPrivateKey($scope.repoKey)
      key = decryptKey(key,$sessionStorage.appKey)
      decryptContent(key,$scope.keyPass)
    }

    $scope.openPush = function (){
      var popup = angular.element('#update')
      popup.modal("show")
    }

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

    readEncrypted = function (){
      var aReader = new FileReader();
      aReader.readAsText($scope.file, "UTF-8");
        aReader.onload = function (evt) {
          fileContent = aReader.result;
          pubKey = getPublicKey($scope.repoKey)
          encryptedContent = encrypt(fileContent,pubKey)
          encryptedContent.then(function (encryptedContent){
            var blob = new Blob([encryptedContent], {type: 'application/x-javascript'});
            updateFile(blob);
          })
      }
      aReader.onerror = function (evt) {
          console.log(evt)
      }
    }

    $scope.pushFile = function(){
        if(!$scope.publicFile){
          updateFile($scope.file)
        }else{
          readEncrypted($scope.file)
        }

    }


  })