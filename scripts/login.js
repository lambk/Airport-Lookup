

var app = angular.module('login-app', []);
app.controller('login-ctrl', function($scope, $http) {

  $scope.authToken = function() {
    $http({
      method: 'GET',
      url: '/auth',
    }).then(function(response) { //Success
      if (response.data != '') $scope.loggedUser = response.data;
    }, function(response) { //Failure
      console.log(`Error on ajax token verification. Response: ${response}`);
    });
  };
  $scope.authToken();

  $scope.openLogin = function() {
    $('#loginMenu').slideToggle(600);
  }

  $scope.postLogin = function() {
    let loginData = {username: $scope.username, password: $scope.password};
    $http({
      method: 'POST',
      url: '/login',
      data: loginData,
    }).then(function(response) { //Success
      $scope.loggedUser = response.data;
      $('#loginMenu').slideUp(600); //Hide login menu
    },function(response) { //Failure
      if (response.status == 401) $('#loginMenu').effect('shake', {distance: 8, times: 2}); $scope.password = '';
      console.log('Error on ajax response to login. Response: ')
      console.log(response);
    });
  };

  $scope.signUp = function() {
    console.log('test');
  };

  $scope.signOut = function() {
    $scope.loggedUser = undefined;
  };
});
