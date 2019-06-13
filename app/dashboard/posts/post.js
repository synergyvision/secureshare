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

      $scope.newPost = function (){
        if (!$scope.public){
          $scope.public = false;
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
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
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
          headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
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
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
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
        }).then(function (response){
          console.log(response.data);
          $state.reload();
        }).catch(function (error){
          console.log(error)
        })
      }


  })