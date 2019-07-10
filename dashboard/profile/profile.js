
function success(message){
  alert(message)
}


function error(message){
  alert(message)
}

angular.module('sharekey.profile', ['ngRoute','ui.router'])


.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash.profile', {
    url: '/profile',
    templateUrl: 'dashboard/profile/profile.html',
    controller: 'profileController',
    css: 'profile.css'
  });
  $stateProvider.state('dash.publications',{
    url: '/publications/?user_id',
    templateUrl: 'dashboard/profile/publications.html',
    controller: 'publicationsController',
    css: 'feedback.css'
  })
}])

.directive('file', function () {
  return {
      scope: {
          file: '='
      },
      link: function (scope, el, attrs) {
          el.bind('change', function (event) {
              var file = event.target.files[0];
              scope.file = file ? file : undefined;
              scope.$apply();
          });
      }
  };
})

.controller('profileController', function($scope,$http,$localStorage,$state,$location,$stateParams){
  var token = $localStorage.userToken;

  $scope.requestData = function(){
    $http({
      url: __env.apiUrl + __env.profile + $localStorage.uid,
      method: 'GET',
      headers: {'Authorization':'Bearer: ' + token}
    }).then(function (response){
      if (response.data.status == 200){
          $scope.username = response.data.content.username;
          $scope.name = response.data.content.name;
          $scope.lastname = response.data.content.lastname;
          $scope.phone = response.data.content.phone;
          //$scope.email = response.data.content.email;
          $scope.bio = response.data.content.bio;
          $scope.imgSrc = response.data.content.profileUrl;
        }else{
          error(response.data.message);
        }
    }).catch(function (e){
      if (e.status == 401){
          error('Su sesion ha vencido')
          $state.go('login');
        }
      })
  }

  $scope.updateData =  function(){
    var updateRequest = $.param({
      //email: $scope.email,
      name: $scope.name,
      lastname: $scope.lastname,
      phone: $scope.phone,
      username: $scope.username,
      bio: $scope.bio
    });
    $http({
      url: __env.apiUrl + __env.profile + $localStorage.uid,
      method: 'PUT',
      data: updateRequest,
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
    }).then( function (response){
        if (response.data.status == 200){
            console.log('User data updated');
            $state.reload();
            success('El perfil se ha actualizado exitosamente');
            /*if ($scope.password){
                var updatePassword = $.param({
                  password: $scope.password
                })
                $http({
                  url: __env.apiUrl + __env.profile + $localStorage.uid + '/resetPassword',
                  method: 'PUT',
                  data: updatePassword,
                  headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
                }).then(function (response){
                    if (response.data.status == 200){ 
                      console.log('user password updated')
                      success('El perfil se ha actualizado exitosamente');
                      $state.reload();
                    }else{
                      error(response.data.message);
                    }
                }).catch(function (e){
                  if (e.status == 401){
                      error('Su sesion ha vencido')
                      $state.go('login');
                    }
                  })
              }else{
                $state.reload();
                success('El perfil se ha actualizado exitosamente');
              }*/    
        }else{
          error(response.data.message)
        }
    })
  }

  $scope.uploadPhoto = function (){
       $http({
         method: 'POST',
         url: __env.apiUrl +__env.files + 'images',
         headers: {
             'Content-Type': undefined,
             'Authorization':'Bearer: ' + token
         },
         data: {
             file: $scope.file,
             uid: $localStorage.uid
         },
         transformRequest: function (data, headersGetter) {
             var formData = new FormData();
             angular.forEach(data, function (value, key) {
                 formData.append(key, value);
             });
             return formData;
         }
     })
     .then(function (response) {
       $scope.imgSrc = response.data.link;
       $localStorage.userPicture = response.data.link;
       console.log(response);
       $state.reload();
     })
     .catch(function (error) {
          console.log(error)
     });
  }

})

//feedback tray controller


.controller('publicationsController', function($scope,$http,$localStorage,$state,$location,$stateParams){
   var token = $localStorage.userToken;
   var uid = $localStorage.uid;
   var user_id = $stateParams.user_id;
    $scope.username = $localStorage[uid + '-username'];

    var checkLike = function (reactions){
      if (reactions[uid]){
        return reactions[uid];
      }else{
        return null;
      }
    }
  

    var getDates = function (feedbacks){
    for (i = 0; i < feedbacks.length; i++){
      if (feedbacks[i].data.reactions){
        feedbacks[i].reactions = checkLike(feedbacks[i].data.reactions)
      }else{
        feedbacks[i].reactions = null;
      }
      sent = new Date(feedbacks[i].data.timestamp);
      feedbacks[i].data.timestamp = sent.toLocaleString();
      if (!feedbacks[i].picture){
        feedbacks[i].picture = "../../img/default-user-icon-8.jpg"
      }
    }
    return feedbacks;
  } 

   $scope.getFeedbacks = function(){

    var requestFeedback = $.param({
      user_id: user_id
    })
    var url = __env.apiUrl + __env.messages + uid + '/mail/published'
      $http({
        url: url,
        method: 'POST',
        data: requestFeedback,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
      }).then(function (response){
          console.log(response.data.data)
          feedbacks = response.data.data;
          $scope.feedbacks = getDates(feedbacks);
      }).catch(function(error){
        console.log(error);
      })
   }

   $scope.likeFeedback = function(messageId){
     $http({
       url: __env.apiUrl + __env.messages + uid +'/'+ messageId + '/react',
       method: 'PUT',
       headers: {'Authorization':'Bearer: ' + token}
     }).then(function (response){
        console.log(response.data);
        $state.reload();
     }).catch(function (error){
       console.log(error);
     })
   }

   $scope.getUserData = function (){
      $http({
        url: __env.apiUrl + __env.profile + $stateParams.user_id,
        method: 'GET',
        headers: {'Authorization':'Bearer: ' + token}
      }).then(function (response){
        if (response.data.status == 200){
            $scope.username = response.data.content.username;
            $scope.name = response.data.content.name;
            $scope.lastname = response.data.content.lastname;
            $scope.phone = response.data.content.phone;
            $scope.email = response.data.content.email;
            $scope.bio = response.data.content.bio;
            $scope.userPicture = response.data.content.profileUrl;
          }else{
            error(response.data.message);
          }
      }).catch(function (e){
        if (e.status == 401){
            error('Su sesion ha vencido')
            $state.go('login');
          }
        })    
   }
});