$(function() {
  $('#signUpMenu').dialog({
    dialogClass: 'no-close',
    modal: true,
    autoOpen: false
  }).disableSelection();

  $('#newUsername').on('keyup change', function(e) {
    if (e.keyCode != 13) $('#newUsernameTT .tooltip').hide(200);
  });

  $('#newPassword').on('keyup change', function(e) {
    if (e.keyCode != 13) $('#newPasswordTT .tooltip').hide(200);
  });
});

let BANNER = {
  SUCCESS: 0,
  FAILURE: 1
};

function displayBanner(type, msg) {
  $('#banner').html(msg);
  if (type == BANNER.SUCCESS) {
    $('#banner').removeClass('failure').addClass('success');
  } else {
    $('#banner').removeClass('success').addClass('failure');
  }
  $('#banner').slideDown(200);
  setTimeout(function() {
    $('#banner').slideUp(200);
  }, 3000);
}

var app = angular.module('account', []);
app.controller('account-ctrl', function($scope, $http) {
  $scope.icao = $('#title').html().split('-')[0].trim();

  $scope.authToken = function() {
    $http({
      method: 'GET',
      url: '/auth',
    }).then(function(response) { //Success
      if (response.data != '') $scope.loggedUser = response.data;
      $scope.loadFavourites();
    }, function(response) { //Failure
      console.log('Error authorizing token');
    });
  };

  $scope.loadFavourites = function() {
    if ($scope.loggedUser != undefined) {
      $http({
        method: 'GET',
        url: '/user/' + $scope.loggedUser + '/favourites',
      }).then(function(response) {
        console.log(response);
        $scope.favourites = response.data;
      }, function(response) {
        console.log('Error checking favourite state');
      });
    }
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
      data: loginData
    }).then(function(response) { //Success
      $scope.loggedUser = response.data;
      $scope.loadFavourites();
      $('#loginMenu').slideUp(600); //Hide login menu
    },function(response) { //Failure
      if (response.status == 401) $('#loginMenu').effect('shake', {distance: 8, times: 2}); $scope.password = '';
    });
  };

  $scope.openSignUp = function() {
    $('#signUpMenu').dialog('open');
  };

  $scope.closeSignUp = function() {
    $('#signUpMenu').dialog('close');
    $('#signUpMenu input[type=text], #signUpMenu input[type=password]').val('');
  };

  $scope.postSignUp = function() {
    let signupData = {username: $scope.newUsername, password: $scope.newPassword};
    if (!/^[A-Za-z0-9]{3,50}$/.test(signupData.username)) {
      $('#newUsernameTT .tooltip-container').html('Invalid Username (Must be atleast 3 characters)');
      $('#newUsernameTT .tooltip').show(200);
      return;
    }
    if (signupData.password.length < 8) {
      $('#newPasswordTT .tooltip-container').html('Password must be atleast 8 characters');
      $('#newPasswordTT .tooltip').show(200);
      return;
    }
    $http({
      method: 'POST',
      url: '/create',
      data: signupData
    }).then(function(response) { //Success
      displayBanner(BANNER.SUCCESS, "Account created");
      $('#signUpMenu').dialog('close');
    }, function(response) { //Failure
      displayBanner(BANNER.FAILURE, response.data);
    });
  };

  $scope.signOut = function() {
    $http({
      method: 'POST',
      url: '/logout'
    }).then(function(response) { //Success
      $scope.loggedUser = undefined;
    }, function(response) {
      console.log('Error logging out')
    });
  };
});
