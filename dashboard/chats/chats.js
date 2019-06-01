 angular.module('sharekey.chats', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.chats',{
        url: '/chats',
        templateUrl: '../dashboard/chats/chats.html',
        css: 'css/sb-admin-2.css',
        controller: 'chatController'
      });
    $stateProvider.state('dash.chats.messages',{
      url: '?id_chat',
      templateUrl: '../dashboard/chats/chatMessages.html',
      css: 'css/sb-admin-2.css',
      controller: 'chatController'
    })  

  }])

  .controller('chatController', function($scope,$http,$localStorage,$state,$sessionStorage,$stateParams){
      uid = $localStorage.uid
      $scope.keys = $localStorage[uid + 'keys'];
      var id_chat = $stateParams.id_chat; 
    
      if ($localStorage[uid + '-chats']){
        $scope.userChats = $localStorage[uid + '-chats'];
      }else{
        $scope.userChats = [];
      }

      $scope.getContacts = function (){
        $http({
          url: 'https://sharekey.herokuapp.com/profile/' + uid + '/contacts',
          method: 'GET'
        }).then(function (response){
            $scope.contacts = response.data.data;
        }).catch(function (error){
            alert(error.message);
        })
      }

      var storeLocalChats = function (id,title,participants){
        chat = {
            id: id,
            title: title,
            participants: participants
        }
        $scope.userChats.push(chat)
        $localStorage[uid + '-chats'] = $scope.userChats

      }

      $scope.createChat = function (){
        participants = {
            [uid]: $scope.keyname,
            [$scope.name]: 'default'
        }
        chatRequest = $.param({
          title: $scope.title,
          participants: JSON.stringify(participants)
        })
     $http({
              url: "https://sharekey.herokuapp.com/chats/" + uid,
              method: "POST",
              data: chatRequest,
              headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
        }).then(function (response){
            console.log('chat created')
            storeLocalChats(response.data.Id,$scope.title,participants); 
        }).catch(function (error){
          console.log(error);
          alert('Error en la creacion de chat intenta de nuevo')
        })
      }

      $scope.getChat = function (id){
        $state.go('dash.chats.messages',{'id_chat': id});
      }

      $scope.chatInfo = function (){
          for (i = 0; i < $scope.userChats.length; i++){
              if ($scope.userChats[i].id == id_chat){
                $scope.infoChat = $scope.userChats[i]
              }
          }
      }

      $scope.deleteChat = function(){
        $http({
          url: "https://sharekey.herokuapp.com/profile/" + uid + '/chats/' + id_chat,
          method: 'DELETE',
        }).then(function (response){
            console.log(response.data);
            localDeleteChat(id_chat);
            $state.go('dash.chats');
        }).catch(function (error){
            alert(error.message);
        })
      }

      var localDeleteChat = function(id){
        for (var i = 0 ; i < $scope.userChats.length; i++){
          if ($scope.userChats[i].id == id){
              console.log($scope.userChats[i])
              return $scope.userChats.splice(i,1);
          }
        }
      }

      var getRecipientId = function(){
          ids = Object.keys($scope.infoChat.participants)
          for (i = 0; i < ids.length; i++){
            if (ids[i] != uid){
              return ids[i]
            }
          }
      }

      var getRecipientKey =  async (idUser) => {
        if (!$scope.chatMessage){
          alert("No puede mandar un mensaje en blanco")
        }else{
    
          var keyRequest = $.param({
              id: idUser
          })
    
            return await $http({
            url: 'https://sharekey.herokuapp.com/profile/' + uid + '/getPublicKey',
            method: 'POST',
            data: keyRequest,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
          }).then(function (response){
            console.log('retrieved public key from server')
            key = response.data.data;
            return key.toString();
          }).catch(function (error){
              console.log(error);
          })  
        }
      }

      var getMyKey = function (name){
        for (var i = 0 ; i < $scope.keys.length; i++){
            if ($scope.keys[i].keyname ==name){
                return $scope.keys[i].publicKey
            }
        }
      }


      var encryptMessage = async (pubkeys, message) => {

        pubkeys = pubkeys.map(async (key) => {
          return (await openpgp.key.readArmored(key)).keys[0]
        });
          const options = {
            message: openpgp.message.fromText(message),
            publicKeys: await Promise.all(pubkeys)       				  // for encryption
          }
          return openpgp.encrypt(options).then(ciphertext => {
            encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
            return encrypted
        })
       };

       var sendRequest = function(request){
         $http({
           url: 'https://sharekey.herokuapp.com/messages/' + uid + '/' + id_chat + '/messages',
           method: 'POST',
           data: request,
           headers:  {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
         }).then(function (response){
            console.log(response.data);
            $scope.chatMessage = "";
         }).catch(function (error){
           console.log(error);
           alert(error);
         })
       }

      $scope.sendToChat = function (){
        recipientId = getRecipientId($stateParams.id_chat);
        myPublicKey = getMyKey($scope.infoChat.participants[uid]);
        recipientKey = getRecipientKey(recipientId);
        recipientKey.then(function (recipientKey){
          publicKeys = [recipientKey,myPublicKey]
          message = encryptMessage(publicKeys,$scope.chatMessage);
          message.then(function (message){
            ids = Object.keys($scope.infoChat.participants);
            var messageRequest = $.param({
              id_sender: uid,
              message: message,
              id_chat: id_chat,
              recipients: JSON.stringify(ids)
            })
            sendRequest(messageRequest);
          }).catch(function (error){
            console.log(error)
            alert(error)
          })
        }).catch(function (error){
          console.log(error)
          alert(error)
        })
      }
  

  })