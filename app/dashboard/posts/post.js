angular.module('sharekey.posts', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.posts', {
      url: '/posts',
      templateUrl: 'dashboard/posts/post.html',
      controller: 'postsController',
      css: 'post.css'
    })
  }])
  
  .controller('postsController', function($scope,$http,$localStorage,$state,$window,$sessionStorage){
      $scope.uid = $localStorage.uid;
      var userKeys = $localStorage[uid + 'keys'];
      var token = $localStorage.userToken;

      var getMyDefaultKey = function (){
        for (var i = 0 ; i < userKeys.length; i++){
            if (userKeys[i].default == true){
                return userKeys[i].publicKey
            }
        }
      }

      var encryptStatus = async (status) => {
          //const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
          //await privKeyObj.decrypt(passphrase)
          pubkey = await getMyDefaultKey();

          const options = {
              message: openpgp.message.fromText(status),       // input as Message object
              publicKeys: (await openpgp.key.readArmored(pubkey)).keys // for encryption
             // privateKeys: [privKeyObj]                                 // for signing (optional)
          }
      
          return openpgp.encrypt(options).then(ciphertext => {
              encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
              return encrypted
          })
        }

      $scope.newPost = async () =>{
        if (!$scope.public){
          $scope.public = false;
          $scope.status = await encryptStatus($scope.status);
        }
        var postRequest = $.param({
          uid: uid,
          content: $scope.status,
          public: $scope.public
        }) 
        $http({
          url: 'https://sharekey.herokuapp.com/posts',
          method: 'POST',
          data: postRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
          console.log(response);
          $state.reload();
        }).catch(function (error){
            console.log(error)
        })
      }

      var getDates = function (posts){
        for (i = 0; i < posts.length; i++){
          sent = new Date(posts[i].data.timestamp);
          posts[i].data.timestamp = sent.toLocaleString();
        }
        return posts
      } 

      $scope.getPosts = function (){
        $http({
          url: 'https://sharekey.herokuapp.com/posts',
          method: 'GET',
          headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
            console.log(response.data.data);
            posts = response.data.data;
            $scope.posts = getDates(posts);
        }).catch(function (error){
            console.log(error)
        })
      }

      $scope.likeStatus = function (status,post_id){
        if (status == 'like'){
            statusRequest = $.param({
              likes: 1
            })
        }else{
          statusRequest = $.param({
            dislikes: 1
          })
        }
        $http({
          url: 'https://sharekey.herokuapp.com/posts/' + post_id + '/likes',
          method: 'PUT',
          data: statusRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
          console.log(response.data);
          $state.reload();
        }).catch(function (error){
          console.log(error)
        })
      }

      $scope.editPost =  function (id,content){
        var popup = angular.element("#edit");
        if (!$scope.editedContent){
          //for hide model
          $scope.editedContent = content;
          $scope.editedPost = id;
          popup.modal('show');
        }else{
          var editRequest = $.param({
            content: $scope.editedContent
          })
          $http({
            url: 'https://sharekey.herokuapp.com/posts/' + $scope.editedPost,
            method: 'PUT',
            data: editRequest,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
          }).then(function (response){
            console.log(response.data);
            popup.modal('hide');
            $scope.editedContent = "";
            $scope.editedPost = "";
            $state.reload();
          }).catch(function (error){
            console.log(error)
          })
        }

      }

      $scope.deletePost = function (id){
        $http({
          url: 'https://sharekey.herokuapp.com/posts/' + id,
          method: 'DELETE',
          headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
          console.log(response.data);
          $state.reload();
        }).catch(function (error){
          console.log(error)
        })
      }


  })