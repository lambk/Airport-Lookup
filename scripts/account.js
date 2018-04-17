
let account;

$(() => {
  account = new Vue({
    el: '#loginApp',
    data: {
      loggedUser: undefined, //The current logged in username
      loginData: { //Login menu data
        username: undefined,
        password: undefined
      },
      formData: { //Signup menu data
        username: undefined,
        password: undefined
      },
      loginVis: false //Visibility state of the login menu
    },
    methods: {
      //Gets the logged in username based on token (Called on pageload)
      authorizeToken: function() {
        this.$http({
          method: 'POST',
          url: '/user/auth'
        }).then(function(response) { //Success
          this.loggedUser = response.body;
        }, function(response) { //Error - also called if no token was passed
          this.loggedUser = undefined;
        });
      },
      //Opens and closes the login menu. Username and password data is cleared on opening
      toggleLoginMenu: function() {
        this.loginVis = !this.loginVis;
        if (this.loginVis) {
          this.loginData.username = undefined;
          this.loginData.password = undefined;
        }
      },
      //Opens the signup modal dialog
      openSignUpForm: function() {
        $('#signUpMenu').dialog('open');
      },
      //Closes the signup modal dialog
      closeSignUpForm: function() {
        $('#signUpMenu').dialog('close');
      },
      //Submits the login data to the server. If successful login, the server registers the client a token cookie
      loginSubmit: function() {
        this.$http({
          method: 'POST',
          url: '/user/login',
          body: {username: this.loginData.username, password: this.loginData.password}
        }).then(function(response) { //Successful login
          this.loggedUser = response.body;
          this.loginVis = false; //Close the login menu once logged in
        }, function(response) { //Failed login
          if (response.status == 401) $('#loginMenu').effect('shake', {distance: 8, times: 2}); this.loginData.password = undefined;
          console.log(response);
        });
      },
      //Signs the user out. The server clears the token cookie on receiving this request
      signOut: function() {
        this.$http({
          method: 'POST',
          url: '/user/logout'
        }).then(function(response) { //Success
          this.loggedUser = undefined;
        }, function(response) { //Error
          console.log(response);
        });
      },
      //Sends the form data to the server to create a new user account
      signupSubmit: function() {
        this.$http({
          method: 'POST',
          url: '/user/signup',
          body: {username: this.formData.username, password: this.formData.password}
        }).then(function(response) {
          this.closeSignUpForm();
        }, function(response) {
          console.log(response);
        });
      }
    }
  });

  account.authorizeToken(); //Authorize the token on pageload

  //Register the signup menu as a modal dialog
  $('#signUpMenu').dialog({
    dialogClass: 'no-close',
    modal: true,
    autoOpen: false
  }).disableSelection();
});
