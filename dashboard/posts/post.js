angular.module('SecureShare.posts', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.posts', {
      url: '/posts',
      templateUrl: 'dashboard/posts/posts.html',
      controller: 'postsController',
      css: 'post.scss'
    })
    $stateProvider.state('dash.post',{
      url: '/posts/?post_id',
      templateUrl: 'dashboard/posts/post.html',
      controller: 'postsController',
      css: 'post.css'
    })
  }])
  
  .controller('postsController', function($scope,$http,$localStorage,$state,$window,$stateParams,__env,$filter){
      $scope.uid = $localStorage.uid;
      var uid = $localStorage.uid;
      var userKeys = $localStorage[uid + 'keys'];
      var token = $localStorage.userToken;
      var post = $stateParams.post_id;
      $scope.username = $localStorage[uid + '-username'];
      $scope.edit = false;

      var translate = $filter('translate')


      //retrieves locally stored user default public key

      var getMyDefaultKey = function (){
        for (var i = 0 ; i < userKeys.length; i++){
            if (userKeys[i].default == true){
                return userKeys[i].publicKey
            }
        }
      }

         //retrieves locally stored user default private key

      var getMyDefaultPrivateKey = function (){
        for (var i = 0 ; i < userKeys.length; i++){
            if (userKeys[i].default == true){
                return userKeys[i].privateKey
            }
        }
      }

      //encryots the content of a post

      var encryptStatus = async (status) => {
          //const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
          //await privKeyObj.decrypt(passphrase)
          var pubkey = await getMyDefaultKey();

          const options = {
              message: openpgp.message.fromText(status),       // input as Message object
              publicKeys: (await openpgp.key.readArmored(pubkey)).keys // for encryption
             // privateKeys: [privKeyObj]                                 // for signing (optional)
          }
      
          return openpgp.encrypt(options).then(ciphertext => {
              var encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
              return encrypted
          })
        }

      //creates a new post  

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
          url: __env.apiUrl + __env.posts,
          method: 'POST',
          data: postRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
          console.log(response);
          $scope.getPosts();
        }).catch(function (error){
            console.log(error)
        })
      }

      //checks which publications had been liked or disliked by the user

        var checkLike = function (reactions){
          if (reactions[uid]){
            return reactions[uid];
          }else{
            return null;
          }
        }

        //converts posts timestamps to dates

      var getDates = function (posts){
        for (i = 0; i < posts.length; i++){
          if (posts[i].data.reactions){
            posts[i].reactions = checkLike(posts[i].data.reactions)
          }else{
            posts[i].reactions = null;
          }
          if (!posts[i].userPicture){
            posts[i].userPicture = 'img/default-user-icon-8.jpg'
          }
          var sent = new Date(posts[i].data.timestamp);
          posts[i].data.posted= sent.toLocaleString(); 
        }
        return posts
      } 

      //retrieves the list of posts

      $scope.getPosts = function (){
        $http({
          url: __env.apiUrl + __env.posts,
          method: 'GET',
          headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
            var posts = response.data.data;
            console.log(posts)
            $scope.posts = getDates(posts);
            console.log($scope.posts)
        }).catch(function (error){
            console.log(error)
        })
      }

      //changes the user reactios to the posts on the local scope

      var changeReaction = function(post_id,status){
        for (var i = 0; i < $scope.posts.length; i++){
          if ($scope.posts[i].id == post_id){
            if (!$scope.posts[i].reactions){
              if (status == 'like'){
                $scope.posts[i].reactions = 'liked'
                $scope.posts[i].data.likes += 1;
              }else{
                $scope.posts[i].reactions = 'disliked'
                $scope.posts[i].data.dislikes += 1;
              }
            } else if ($scope.posts[i].reactions == 'liked' && status != 'like') {
                $scope.posts[i].reactions = 'disliked'
                $scope.posts[i].data.likes -= 1;
                $scope.posts[i].data.dislikes += 1;
            } else if ($scope.posts[i].reactions == 'disliked' && status == 'like'){
              $scope.posts[i].reactions = 'liked'
              $scope.posts[i].data.likes += 1;
              $scope.posts[i].data.dislikes -= 1;
            }
          }
        }
      }

      //functions updates the likes of a publication

      $scope.likeStatus = function (status,post_id){
        if (status == 'like'){
            var statusRequest = $.param({
              likes: 1,
              likedBy: uid
            })
        }else{
          var statusRequest = $.param({
            dislikes: 1,
            likedBy: uid
          })
        }
        $http({
          url: __env.apiUrl + __env.posts + post_id + '/likes',
          method: 'PUT',
          data: statusRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
          console.log(response.data);
          changeReaction(post_id,status);
        }).catch(function (error){
          console.log(error)
        })
      }

      //function edits a post

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
            url: __env.apiUrl + __env.posts + $scope.editedPost,
            method: 'PUT',
            data: editRequest,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
          }).then(function (response){
            console.log(response.data);
            popup.modal('hide');
            $scope.editedContent = "";
            $scope.editedPost = "";
            $scope.getPosts();
          }).catch(function (error){
            console.log(error)
          })
        }

      }

      //function deletes a post

      $scope.deletePost = function (id){
        $http({
          url: __env.apiUrl + __env.posts + id,
          method: 'DELETE',
          headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
          console.log(response.data);
          $scope.getPosts();
        }).catch(function (error){
          console.log(error)
        })
      }

      //moves screen to a post

      $scope.goToPost = function (id){
        $state.go('dash.post',{'post_id': id})
      }

      //gets data of a single post

      $scope.loadPost = function (){
        $http({
          url: __env.apiUrl + __env.posts + uid + '/' + post,
          method: 'GET',
          headers: {'Authorization':'Bearer: ' + token} 
        }).then(function (response){
           $scope.$parent.post = response.data.data;
           console.log(response)
        }).catch (function (error){
          console.log(error.code)
          console.log(error.message)
        })
      }

      //ask passphrase modal opens

      $scope.askPassphrase = function (content){
        console.log(content)
        $scope.$parent.postContent = content;
        var popup = angular.element('#Passphrase');
        popup.modal('show')
      }

      //decrypts the private key

      var decryptKey = function (key,passphrase) {
        var bytes  = CryptoJS.AES.decrypt(key,passphrase);
        var key = bytes.toString(CryptoJS.enc.Utf8);
        return key;
    
      }

      //decrypts the users private key

      var decryptPost = async (privateKey,passphrase,mensaje) => {
        const privKeyObj = (await openpgp.key.readArmored(privateKey)).keys[0]
        await privKeyObj.decrypt(passphrase)
  
        const options = {
            message: await openpgp.message.readArmored(mensaje),    // parse armored message
            //publicKeys: (await openpgp.key.readArmored(pubkey)).keys, // for verification (optional)
            privateKeys: [privKeyObj]                                 // for decryption
        }
  
        return openpgp.decrypt(options).then(plaintext => {
            var decrypted = plaintext.data;
            return decrypted
        })
    }

      //commences the decrypt post flow

      $scope.decryptPost = function (passphrase){
        var privateKey = getMyDefaultPrivateKey();
        privateKey = decryptKey(privateKey,passphrase);
        console.log($scope.postContent)
        post = decryptPost(privateKey,passphrase,$scope.postContent)
        post.then (function (content){
          var popup = angular.element('#Passphrase');
          popup.modal('hide')
          $scope.post.data.content = content;
          $scope.$apply();
        }).catch(function (error){
            alert(translate('posts.error_passphrase'))
        })
      }

      //retrieves a posts list of comments

      $scope.getComments = function(){
        $http({
          url: __env.apiUrl + __env.comments + $scope.uid + '/' + post,
          method: 'GET',
          headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
            console.log(response.data);
            $scope.comments = response.data.data
        }).catch(function (error){
          console.log(error)
        })
      }

      //sends a comments to a post

      $scope.sendComment = function(){
        var commentRequest = $.param({
          content: $scope.newComment,
          user_id: $scope.uid,
          post_id: post
        })
        $http({
          url: __env.apiUrl + __env.comments + '/',
          method: 'POST',
          data: commentRequest,
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
          console.log(response.data);
          $scope.getComments(); 
        }).catch(function (error){
            console.log(error);
        })
      } 

      //commences the process of edit posts

      $scope.editComment = function(id,content){
        console.log(id,content);
        var popup = angular.element("#editComment");
        if (!$scope.editedCommentContent){
          //for hide model
          $scope.$parent.editedCommentContent = content;
          $scope.$parent.editedCommentId = id;
          popup.modal('show');
        }else{
          var editRequest = $.param({
            content: $scope.editedCommentContent
          })
          $http({
            url: __env.apiUrl + __env.comments + $scope.editedCommentId,
            method: 'PUT',
            data: editRequest,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
          }).then(function (response){
            console.log(response.data)
            $scope.editedCommentContent = "";
            $scope.editedCommentId = "";
            $scope.getComments() 
          }).catch(function (error){
            console.log(error)
          })
        }  
      }

      //deletes a comment

      $scope.deleteComment = function (id){
        $http({
          url: __env.apiUrl  + __env.comments + id,
          method: 'DELETE',
          headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
          console.log(response.data);
          $scope.getComments(); 
        }).catch(function (error){
          console.log(error)
        })
      }

  })