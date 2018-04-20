
Vue.component('loginbanner', {
  props: ['banner'],
  template: `
    <transition name="fade">
      <span v-show="banner.vis" v-bind:class="['banner', banner.type == 0 ? 'success' : 'failure']">{{ banner.msg }}</span>
    </transition>
  `
});

Vue.component('logincontainer', {
  template: `
  <div>
    <slot name="login-nav"></slot>
    <slot name="login-menu"></slot>
    <slot name="signup-menu"></slot>
  </div>
  `
});

Vue.component('loginnav', {
  props: ['user', 'loginClick', 'signupClick', 'signoutClick'],
  template: `
    <div class="login-controls">
      <a class="link" v-show="user == undefined" v-on:click="loginClick">Log In</a>
      <a class="link" v-show="user != undefined">{{ user }}</a>
      <span style="margin: 0 3px">|</span>
      <a class="link" v-show="user == undefined" v-on:click="signupClick">Sign Up</a>
      <a class="link" v-show="user != undefined" v-on:click="signoutClick">Sign Out</a>
    </div>
  `
});

Vue.component('loginmenu', {
  props: ['enabled'],
  template: `
    <transition name="fall">
      <div class="login-menu" v-show="enabled">
        <div class="popup-arrow"></div>
        <div class="popup-content">
          <slot name="login-form"></slot>
        </div>
      </div>
    </transition>
  `
});

Vue.component('loginform', {
  props: ['formSubmit', 'loginData'],
  template: `
    <form style="margin: 0" v-on:submit.prevent="formSubmit">
      <h2>Username</h2>
      <input type="text" class="text-field" v-model="loginData.username" />
      <h2 style="margin-top: 15px">Password</h2>
      <input type="password" class="text-field" v-model="loginData.password" />
      <input type="submit" class="button" value="Login" style="margin-top: 15px" />
    </form>
  `
});

Vue.component('signupmenu', {
  template: `
    <div class="signup-menu">
      <h2 style="font-size: 1.8em">Create Account</h2>
      <hr style="color: #aaa" ></hr>
      <div style="padding: 0 45px">
        <slot name="signup-form"></slot>
      </div>
    </div>
  `
});

Vue.component('signupform', {
  props: ['formSubmit', 'formData', 'cancelClick'],
  template: `
    <form v-on:submit.prevent="formSubmit">
      <h2 style="margin-top: 15px">Username</h2>
      <input type="text" class="text-field" v-model="formData.username" />
      <h2 style="margin-top: 15px">Password</h2>
      <input type="password" class="text-field" v-model="formData.password" />
      <input type="button" class="button button-cancel" value="Cancel" v-on:click="cancelClick" />
      <input type="submit" class="button" value="Create" style="margin-top: 20px; margin-left: 30px" />
    </form>
  `
});

let BANNER_TYPE = {
  success: 0,
  failure: 1
};

let account = new Vue({
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
    loginVis: false, //Visibility state of the login menu
    banner: {
      vis: false,
      type: BANNER_TYPE.success,
      msg: undefined
    }
  },
  methods: {
    //Gets the logged in username based on token (Called on pageload)
    authorizeToken: function() {
      this.$http({
        method: 'POST',
        url: '/auth'
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
      $('.signup-menu').dialog('open');
      this.formData.username = undefined;
      this.formData.password = undefined;
    },
    //Closes the signup modal dialog
    closeSignUpForm: function() {
      $('.signup-menu').dialog('close');
    },
    //Submits the login data to the server. If successful login, the server registers the client a token cookie
    loginSubmit: function() {
      this.$http({
        method: 'POST',
        url: '/login',
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
        url: '/logout'
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
        url: '/users',
        body: {username: this.formData.username, password: this.formData.password}
      }).then(function(response) {
        this.closeSignUpForm();
        this.showBanner(BANNER_TYPE.success, `Account ${this.formData.username} created`)
      }, function(response) {
        this.showBanner(BANNER_TYPE.failure, response.body);
        console.log(response);
      });
    },
    showBanner: function(type, msg) {
      this.banner.vis = true;
      this.banner.type = type;
      this.banner.msg = msg;
      let banner = this.banner;
      setTimeout(function() {
        banner.vis = false;
      }, 3000);
    }
  }
});

account.authorizeToken(); //Authorize the token on pageload

$(() => {
  //Register the signup menu as a modal dialog
  $('.signup-menu').dialog({
    show: 'fade',
    hide: 'fade',
    dialogClass: 'no-close',
    modal: true,
    autoOpen: false
  }).disableSelection();
});
