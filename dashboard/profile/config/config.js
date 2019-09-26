angular.module('SecureShare.config', ['ngRoute','ui.router'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('dash.config', {
    url: '/config',
    templateUrl: 'dashboard/profile/config/config.html',
    controller: 'configController',
    css: 'config.css'
  })
}])

.controller('configController', function($scope,$http,$localStorage,$state,$location,$stateParams,$location,$rootScope,$window,$filter){
    var token = $localStorage.userToken;
    var uid = $localStorage.uid;
    var username = $localStorage[uid + '-username'];
    var preMessage = 'Soy ' + username + ' en Sharekey ';
  
    var translate = $filter('translate')

    //generates the random string message for verification

    function makeid() {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < 20; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
   }

   //inits fb observer

    initObserver = function (){
    FB.Event.subscribe('auth.authResponseChange', function(res) {
      if (res.status === 'connected') {
        console.log(res)
        $scope.faceLogin = true
        $scope.validationMessage = preMessage + makeid();
        $scope.$apply();
      } else {
        alert(translate('networks.not_connected'));
      }
    });
  }

  $window.fbAsyncInit = function() {
    // Executed when the SDK is loaded
    FB.init({

      /*
       The app id of the web app;
       To register a new app visit Facebook App Dashboard
       ( https://developers.facebook.com/apps/ )
      */

      appId: '355312722034019',

      /*
       Adding a Channel File improves the performance
       of the javascript SDK, by addressing issues
       with cross-domain communication in certain browsers.
      */

      channelUrl: 'app/channel.html',

      /*
       Set if you want to check the authentication status
       at the start up of the app
      */

      status: true,

      /*
       Enable cookies to allow the server to access
       the session
      */

      cookie: true,

      /* Parse XFBML */

      xfbml: true,

      version: 'v2.4'
    })

    initObserver();
  };

  (function(d){
    // load the Facebook javascript SDK
    console.log('here')
    var js,
    id = 'facebook-jssdk',
    ref = d.getElementsByTagName('script')[0];

    if (d.getElementById(id)) {
      return;
    }

    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src =  "https://connect.facebook.net/es_LA/sdk.js";

    ref.parentNode.insertBefore(js, ref);

  }(document));

  //connects to the fb api and retrieves the user 5 last publications

    $scope.verify = function (){
        FB.api(
          "me/feed?limit=5",
          function (response) {
            if (response && !response.error) {
              validateFeed(response.data)
            }
          }
      );
    }

    //compares the user publications to the string message

   var validateFeed =  function (feed){
    var valid = false
    for (i = 0; i < feed.length; i ++){
        if( feed[i].message == $scope.validationMessage){
          valid = true;
          validateFacebook();
        }
    }
    if (valid == false){
      alert(translate('networks.invalid_feed'))
    }
   }

   //sens notification to the server that the user has succesfully validated fb

   var validateFacebook = function (){
     $http({
       url: __env.apiUrl + __env.config + uid + '/validateFacebook',
       method: 'POST',
       headers: {'Authorization':'Bearer: ' + token}
     }).then(function (response){
        alert(translate('networks.valid_feed'))
        $state.reload();
     }).catch(function (error){
        console.log(error)
     })
   }

   //retrieves the user active social networks

   $scope.getSocials = function (){
      $http({
        url: __env.apiUrl + __env.config + uid + '/addedSocials',
        method: 'GET',
        headers: {'Authorization':'Bearer: ' + token}
      }).then(function (response){
          $scope.validFacebook = response.data.facebook
          $scope.validTwitter = response.data.twitter
          $scope.validGitHub = response.data.github
      }).catch(function (error){
        console.log(error)
      })
    }

    //shows twitter validation string form

    $scope.showTwitterMessage = function(){
      $scope.showTwitter = true;
      $scope.validationMessage = preMessage + makeid();
      $scope.$apply
    }

    //gets user last 2 tweets to validate the string

    $scope.getTwitterFeed = function(){
      console.log($scope.twitterUsername)
      var user = $.param({
        username: $scope.twitterUsername
      })
      $http({
        url: __env.apiUrl + __env.config + uid + '/getTwitterFeed',
        method: 'POST',
        data: user,
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
      }).then(function (response){
          if (response.data.feed.errors){
            alert(translate('networks.tw_user_404'))
          }else{
            validateTweet(response.data.feed)
          }
      }).catch(function (error){
        console.log(error)
      })
    }
    
    //compares twitter feed with the validation message

    var validateTweet = function (feed){
      console.log(feed)
      var valid = false
      for (var i = 0; i < feed.length; i ++){
          if( feed[i].text == $scope.validationMessage){
            valid = true;
            validateTwitter();
          }
      }
      if (valid == false){
        alert(translate('networks.tw_invalid'))
      }
    }

    //updates the database by marking twitter with verified

    var validateTwitter = function (){
      $http({
        url: __env.apiUrl + __env.config + uid + '/validateTwitter',
        method: 'POST',
        headers: {'Authorization':'Bearer: ' + token}
      }).then(function (response){
         alert(translate('networks.tw_valid'))
         $state.reload();
      }).catch(function (error){
         console.log(error)
      })
    }

    //retrieves server key

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

    //encripts the github password to be sent to the server

    var encryptPassword = async (password) =>{
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

    //signs the user in with github and retrieves the ouath2 token

    $scope.getToken = function (){
      console.log($scope.username,$scope.password)
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
            alert(translate('networks.gh_valid'))
            $scope.getSocials()
        }).catch(function (error){
            console.log(error)
            alert(translate('networks.gh_invalid'))
        })
      })  
    }

    //function to copy the validation message

    $scope.copy = function(){
      var copyText = document.getElementById('validationMessage');
      copyText.select(); 
      document.execCommand("copy");
    }    
})
