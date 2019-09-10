angular.module('sharekey.surveys', ['ui.router'])
  
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
    survey = $stateParams.surveyId;
    if ($rootScope.newExists == true){
        $rootScope.newExists = false;
    }
    

    $scope.answers = [
        {},
        {}
    ];

    $scope.answeredQuestions = []

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

    var checkSurvey = function (survey){
        now = new Date();
        if (now < new Date(survey.expires)){
            survey.expired = false
        }else{
            survey.expired = true
        }
        if (survey.answeredBy){
            ids = Object.keys(survey.answeredBy);
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

    var createAnswers = function (surveyId,questionId) {
        var newAnswers = $.param({
            content: JSON.stringify($scope.answers)
        })
        console.log(newAnswers);
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

    var createQuestion = function (surveyId){
        newQuestion = $.param({
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

    $scope.createSurvey = function (){
        created = new Date();
        expires_in = new Date();
        expires_in .setDate(expires_in .getDate() + parseInt($scope.expires));
        var newSurvey = $.param({
            title: $scope.surveyTitle,
            id_user: uid,
            created: created,
            expires_in: expires_in 
        })
        $http({
            url: __env.apiUrl + __env.surveys,
            method: 'POST',
            data: newSurvey,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8','Authorization':'Bearer: ' + token}
        }).then(function (response){
            surveyId = response.data.key;
            console.log('created survey')
            createQuestion(surveyId);
        }).catch(function (error){
            console.log(error)
        })
    }

    $scope.addLenght =  function (){
        answer = {};
        $scope.answers.push(answer)
    }

    $scope.getId = function (questionId,answer){
        var exists = false;
        answeredQuestion = {
            questionId: questionId,
            answerId: answer.id
        }
        for (i =0; i < $scope.answeredQuestions.length;i++){
            if ($scope.answeredQuestions[i].questionId == questionId){
                $scope.answeredQuestions[i] = answeredQuestion 
                exists = true
            }
        }
        if (!exists){
            $scope.answeredQuestions.push(answeredQuestion);
        }
    }

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