

var app = angular.module('login-app', []);
app.controller('login-ctrl', function($scope) {
  
  $scope.authToken = function() {
    $.ajax({
      type: 'GET',
      url: '/auth',
      success: (username) => {
        if (username != '') {
          $scope.$apply(() => {
            $scope.loggedUser = username;
          });
        }
      },
      error: (response) => {
        console.log('Error on ajax token verification');
      }
    });
  };
  $scope.authToken();


  $scope.openLogin = function() {
    $('.popup').slideToggle(600);
  }

  $scope.postLogin = function() {
    let loginData = {username: $scope.username, password: $scope.password};
    $.ajax({
      type: 'POST',
      url: '/login',
      contentType: 'application/json',
      data: JSON.stringify(loginData),
      success: (username) => {
        $scope.$apply(() => {
          $scope.loggedUser = username;
        });
        $('.popup').slideUp(600);
      },
      error: (response) => {
        console.log('Error on ajax response to login. Response: ' + response);
      }
    });
  };

  $scope.signUp = function() {
    console.log('test');
  };

  $scope.signOut = function() {
    $scope.loggedUser = undefined;
  };
});
