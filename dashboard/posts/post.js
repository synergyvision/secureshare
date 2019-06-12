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
        }).catch(function (error){
            console.log(error)
        })
      }

      $scope.getPosts = function (){
        $http({
          url: 'https://sharekey.herokuapp.com/posts',
          method: 'GET',
        }).then(function (response){
            console.log(response.data.data);
            $scope.posts = response.data.data;
        }).catch(function (error){
            console.log(error)
        })
      }


  })