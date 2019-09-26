angular.module('SecureShare.surveys', ['ui.router'])
  
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('dash.surveys', {
      url: '/surveys',
      templateUrl: 'dashboard/surveys/surveys.html',
      controller: 'surveyController',
      css: 'surveys.css'
    })
    $stateProvider.state('dash.survey', {
        url: '/surveys/?surveyId',
        templateUrl: 'dashboard/surveys/survey.html',
        controller: 'surveyController',
        css: 'surveys.css'
      })
    $stateProvider.state('dash.newSurvey',{
      url: '/surveys/newSurvey',
      templateUrl: 'dashboard/surveys/newSurvey.html',
      controller: 'surveyController',
      css: 'surveys.css'
    })
  }])

  .controller('surveyController', function($scope,$http,$localStorage,$state,$window,$sessionStorage,$stateParams,__env,$rootScope){
    $scope.uid = $localStorage.uid;
    var token = $localStorage.userToken;
    var survey = $stateParams.surveyId;
    if ($rootScope.newExists == true){
        $rootScope.newExists = false;
    }
    

    $scope.answers = [
        {},
        {}
    ];

    $scope.answeredQuestions = []


    //function gets the list of surveys

    $scope.getSurveys = function (){
        $http({
            url: __env.apiUrl + __env.surveys,
            method: 'GET',
            headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
            console.log(response.data.message)
            $scope.surveys = response.data.data;
            $localStorage.surveys = $scope.surveys;
        }).catch(function (error){
            console.log(error)
        })
    }

    //function checks if the user has answered a survey or if there are any expired

    var checkSurvey = function (survey){
        var now = new Date();
        if (now < new Date(survey.expires)){
            survey.expired = false
        }else{
            survey.expired = true
        }
        if (survey.answeredBy){
            var ids = Object.keys(survey.answeredBy);
            survey.answered = false
            for (i = 0; i < ids.length;i++){
                if ($scope.uid == ids[i]){
                    survey.answered = true
                }
            }
            return survey
        }else{
            survey.answered = false
            return survey
        }    
    }

    //function gets a single survey

    $scope.getSurvey = function (){
        $http({
            url: __env.apiUrl + __env.surveys + survey,
            method: 'GET',
            headers: {'Authorization':'Bearer: ' + token}
        }).then(function (response){
            surveyData = response.data;
            $scope.survey = checkSurvey(surveyData)
            console.log($scope.survey)
        }).catch(function (error){
            console.log(error)
        })
    }

    //function creates a new answer

    var createAnswers = function (surveyId,questionId) {
        var newAnswers = $.param({
            content: JSON.stringify($scope.answers)
        })
        $http({
            url: __env.apiUrl + __env.surveys + surveyId +'/question/' + questionId + '/answer',
            method: 'POST',
            data: newAnswers,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
            console.log(response.data)
            $state.go('dash.surveys');
        }).catch(function (error){
            console.log(error)
        })
    }

    //function creates new question

    var createQuestion = function (surveyId){
        var newQuestion = $.param({
            content: $scope.question.title
        })
        $http({
            url: __env.apiUrl + __env.surveys + surveyId +'/question',
            method: 'POST',
            data: newQuestion,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
            console.log(response.data)
            createAnswers(surveyId,response.data.id_question)
        }).catch(function (error){
            console.log(error)
        })

    }

    //function starts the flow to create a survey

    $scope.createSurvey = function (){
        var created = new Date();
        var expires_in = new Date();
        expires_in.setDate(expires_in .getDate() + parseInt($scope.expires));
        var newSurvey = $.param({
            title: $scope.surveyTitle,
            id_user: $scope.uid,
            created: created,
            expires_in: expires_in 
        })
        $http({
            url: __env.apiUrl + __env.surveys,
            method: 'POST',
            data: newSurvey,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
            var surveyId = response.data.key;
            console.log('created survey')
            createQuestion(surveyId);
        }).catch(function (error){
            console.log(error)
        })
    }

    //function ads one more answer to array

    $scope.addLenght =  function (){
        answer = {};
        $scope.answers.push(answer)
    }

    //function creates and pushes an array with the questionId and its chosen answer

    $scope.getId = function (questionId,answer){
        var exists = false;
        var answeredQuestion = {
            questionId: questionId,
            answerId: answer.id
        }
        for (var i =0; i < $scope.answeredQuestions.length;i++){
            if ($scope.answeredQuestions[i].questionId == questionId){
                $scope.answeredQuestions[i] = answeredQuestion 
                exists = true
            }
        }
        if (!exists){
            $scope.answeredQuestions.push(answeredQuestion);
        }
    }

    //function starts the fill survey flow

    $scope.fillSurvey = function (){
        console.log($scope.answeredQuestions[0]);
        for (i = 0; i < $scope.answeredQuestions.length;i++){
            $http({
                url: __env.apiUrl + __env.surveys + survey +'/question/' + $scope.answeredQuestions[i].questionId + '/answer/' + $scope.answeredQuestions[i].answerId + '/vote',
                method: 'PUT',
                headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
            }).then(function (response){
                console.log(response.data);
                $state.go('dash.surveys');
            }).catch(function (error){
                console.log(error);
            })

        }
        var updateParam = $.param({
            uid: $scope.uid
        })
        $http.put(__env.apiUrl + __env.surveys + survey + '/updateAnsweredBy',updateParam,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function(response){
            console.log(response)
            console.log('user has answered a survey')
        })
    }

    // function deletes a survey

    $scope.deleteSurvey = function (id){
        $http({
            url: __env.apiUrl + __env.surveys + id,
            method: 'DELETE',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function(response){
            console.log(response.data)
            $state.reload();

        }).catch(function(error){
            console.log(error)
        })

    }

  })