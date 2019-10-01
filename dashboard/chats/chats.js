 angular.module('SecureShare.chats', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.chats',{
        url: '/chats',
        templateUrl: 'dashboard/chats/chats.html',
        css: 'dashboard/chats/chats.css',
        controller: 'chatController'
      });

  }])

  .controller('chatController', function($scope,$http,$localStorage,$state,$sessionStorage,$stateParams,$location,__env,$filter){
      var uid = $localStorage.uid
      var token = $localStorage.userToken;
      $scope.uid =$localStorage.uid;
      $scope.keys = $localStorage[uid + 'keys'];
      var decrypted = [];
      $scope.show = false;
      $scope.userChats = [];

      $scope.seeButton = true;

      var translate = $filter('translate')

      //gets the user list of chats with at leats ine message
      
      $scope.getUserChats = async () => {
       $http({
          url:  __env.apiUrl + __env.profile +uid+ '/chats',
          method: 'GET',
          headers: {'Authorization':'Bearer: ' + token} 
        }).then(function (response){
          if (response.data.data){
            var userChats = response.data.data
            for (var i = 0; i < userChats.length; i++){
              storeLocalChats(userChats[i].chatID,userChats[i].title,userChats[i].members,userChats[i].last_modified)
            }
          }else{
            $scope.userChats = []
          }
        }).catch(function(error){
          console.log(error);
        })
      }

      //gets user list of contacts

      $scope.getContacts = function (){
        $http({
          url: __env.apiUrl + __env.profile + uid + '/contacts',
          method: 'GET',
          headers: {'Authorization':'Bearer: ' + token} 
        }).then(function (response){
            $scope.contacts = response.data.data;
        }).catch(function (error){
            alert(error.message);
        })
      }

      //stores a chat locally

      var storeLocalChats = function (id,title,participants){
        var chat = {
            chatID: id,
            title: title,
            members: participants
        }
        $scope.userChats.push(chat)
        $localStorage[uid + '-chats'] = $scope.userChats

      }

      //creates a new chat

      $scope.createChat = function (){
        var participants = {}
        for (i = 0; i < $scope.name.length; i++){
            participants[$scope.name[i]] = 'default'
        }
        participants[uid] = $scope.keyname;
        var chatRequest = $.param({
          title: $scope.title,
          participants: JSON.stringify(participants)
        })
        $http({
                  url: __env.apiUrl + __env.chats + uid,
                  method: "POST",
                  data: chatRequest,
                  headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', 'Authorization':'Bearer: ' + token}
            }).then(function (response){
                console.log('chat created')
                storeLocalChats(response.data.Id,$scope.title,participants); 
                $scope.getChat(response.data.Id)
            }).catch(function (error){
              console.log(error);
              alert(translate('chats.chat_error'))
            })
      }

      //gets the info of a chat

      $scope.getChat = function (id){
        $scope.seeButton =true
        $scope.idChat = id;
        $scope.chatInfo(id);
        $scope.getMessages()
      }

      //search the local chats for the desired one

      $scope.chatInfo = function (id_chat){
          for (i = 0; i < $localStorage[uid + '-chats'].length; i++){
              if ($localStorage[uid + '-chats'][i].chatID == id_chat){
                $scope.infoChat = $localStorage[uid + '-chats'][i]
              }
          }
      }

      //deletes the users copy of a chat

      $scope.deleteChat = function(){
        $http({
          url: __env.apiUrl + __env.profile  + uid + '/chats/' + $scope.idChat,
          method: 'DELETE',
          headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
            console.log(response.data);
            localDeleteChat($scope.idChat);
            $state.go('dash.chats');
        }).catch(function (error){
            alert(error.message);
        })
      }

      //local deletes chat

      var localDeleteChat = function(id){
        for (var i = 0 ; i < $localStorage[uid + '-chats'].length; i++){
          if ($localStorage[uid + '-chats'][i].chatID == id){
              return $localStorage[uid + '-chats'].splice(i,1);
          }
        }
      }

      //gets id of chat participants

      var getRecipientId = function(){
          var ids = Object.keys($scope.infoChat.members)
          for (i = 0; i < ids.length; i++){
            if (ids[i] == uid){
                ids.splice(i,1);
                return ids;
            }
          }
      }

      //gets public key of an user

      var getRecipientKey =  async (idUser) => {
            var keyRequest = $.param({
              id: idUser
            })
            return await $http({
            url: __env.apiUrl + __env.profile  + uid + '/getPublicKey',
            method: 'POST',
            data: keyRequest,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', 'Authorization':'Bearer: ' + token}
          }).then(function (response){
            console.log('retrieved public key from server')
            var key = response.data.data;
            return key.toString();
          }).catch(function (error){
              console.log(error);
          })
        
      }

      //gets my key

      var getMyKey = function (name){
        if (name != 'default'){  
          for (var i = 0 ; i < $scope.keys.length; i++){
              if ($scope.keys[i].keyname ==name){
                  return $scope.keys[i].publicKey
              }
          }
        }else{
          for (var i = 0 ; i < $scope.keys.length; i++){
            if ($scope.keys[i].default == true){
                return $scope.keys[i].publicKey
            }
          }
        }  
      }

      //gets my private public key

      var getMyPrivateKey = function (name){
        if (name != 'default'){
          for (var i = 0 ; i < $scope.keys.length; i++){
              if ($scope.keys[i].keyname ==name){
                  return $scope.keys[i].privateKey
              }
          }
        }else{
          for (var i = 0 ; i < $scope.keys.length; i++){
            if ($scope.keys[i].default == true){
                return $scope.keys[i].privateKey
            }
          }
        }  
      }

      //encrypts a chat message

      var encryptMessage = async (pubkeys, message) => {
        pubkeys = pubkeys.map(async (key) => {
          return (await openpgp.key.readArmored(key)).keys[0]
        });
          const options = {
            message: openpgp.message.fromText(message),
            publicKeys: await Promise.all(pubkeys)       				  // for encryption
          }
          return openpgp.encrypt(options).then(ciphertext => {
            var encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
            return encrypted
        })
       };

       //sends chat message

       var sendRequest = function(request){
         $http({
           url: __env.apiUrl + __env.messages + uid + '/' + $scope.idChat+ '/messages',
           method: 'POST',
           data: request,
           headers:  {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', 'Authorization':'Bearer: ' + token}
         }).then(function (response){
            console.log(response.data);
            $scope.chatMessage = "";
            $scope.getMessages()
         }).catch(function (error){
           console.log(error);
           alert(error);
         })
       }

       //gets public keys of several users

      var getMultipleKeys = async(keys)=>{
          var keyRequest = $.param({
            id: JSON.stringify(keys)
          })
         return await $http({
            url: __env.apiUrl + __env.profile + uid + '/getMultipleKeys',
            method: 'POST',
            data: keyRequest,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
          }).then(function (response){
              console.log('retrieved public keys from server')
              var key = response.data.data;
              return key;
          }).catch(function (error){
              console.log(error);
          })
      }

      //commences the flow of sending a message, getting content, getting keys, and encrypt it

      $scope.sendToChat = function (){
        var recipientId = getRecipientId($scope.idChat);
        var myPublicKey = getMyKey($scope.infoChat.members[uid]);
        if (recipientId.length > 1){
          var recipientKey = getMultipleKeys(recipientId);
        }else{
          var recipientKey = getRecipientKey(recipientId[0]);
        }
        recipientKey.then(function (recipientKey){
          var publicKeys = [recipientKey,myPublicKey]
          var message = encryptMessage(publicKeys,$scope.chatMessage);
          message.then(function (message){
            console.log(message)
            var ids = Object.keys($scope.infoChat.members);
            var messageRequest = $.param({
              id_sender: uid,
              message: message,
              id_chat: $scope.idChat,
              recipients: JSON.stringify(ids),
              username: $localStorage[uid +'-username']
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

      //decrypts a message
  
      var decriptMessage = async (privateKey,passphrase,mensaje) => {
        try{
          const privKeyObj = (await openpgp.key.readArmored(privateKey)).keys[0]
          await privKeyObj.decrypt(passphrase)
    
          const options = {
              message: await openpgp.message.readArmored(mensaje),    // parse armored message
              //publicKeys: (await openpgp.key.readArmored(pubkey)).keys, // for verification (optional)
              privateKeys: [privKeyObj]                                 // for decryption
          }
    
          return openpgp.decrypt(options).then(plaintext => {
              decrypted = plaintext.data;
              return decrypted
          })
        }catch(error){
          alert(translate('chats.chat_pass_error'))
        }  
    }

    //decrypts a key

      var decryptKey = function (key,password) {
        var bytes  = CryptoJS.AES.decrypt(key,password);
        var key = bytes.toString(CryptoJS.enc.Utf8);
        return key;
    
      }

      //decrypts the list of messages

      var decryptMessages = async (messages) => {
        var private = getMyPrivateKey($scope.infoChat.members[uid]);
        var privateKey = decryptKey(private,$scope.passphraseChat);
        var popup = angular.element("#decryptingSpinner");
        popup.modal('show');
        for (var i = 0; i < messages.length; i++){
            message = await decriptMessage(privateKey,$scope.passphraseChat,messages[i].data.content)
            messages[i].data.content = message;
            messages[i].decripted = true;
            var sent = new Date(messages[i].data.date_sent);
            messages[i].sent = sent.toLocaleString();
        }
        var popup = angular.element("#decryptingSpinner");
        popup.modal('hide');
        return messages
      } 

      //gets chats list of messages

      $scope.getMessages =  function (){
        $http({
          url: __env.apiUrl + __env.messages + uid + '/chat/' + $scope.idChat,
          method: 'GET',
          headers:  {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
           $scope.chatMessages = response.data.data;
        }).catch(function (error){
          if (error){
            if (error.status == 401){
                $state.go('dash.login');
            }
            else{
                console.log(error.code);
                console.log(error.message);
            }
        } 
        })
      }

      //opens modal

      $scope.savePass = function (){
        var popup2 = angular.element("#addPassphrase");
        //for hide model
        popup2.modal('hide');
        var decripted = decryptMessages($scope.chatMessages)
        decripted.then(function (decripted){
          $scope.show = true;
          $scope.chatMessages = decripted;
          $scope.passphraseChat = "";
          $scope.seeButton = false;
          var popup = angular.element("#decryptingSpinner");
          popup.modal('hide');
          $scope.$apply();
        }).catch(function(error){
          var popup = angular.element("#decryptingSpinner");
          popup.modal('hide');
          $scope.passphraseChat = "";
          alert(translate('chats.pass_error'))
        })

      }
  })