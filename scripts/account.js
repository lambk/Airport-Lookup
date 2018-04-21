
Vue.component('loginbanner', {
  props: ['banner'],
  template: `
    <transition name="fade">
      <span v-show="banner.show" v-bind:class="['banner', banner.type == 0 ? 'success' : 'failure']">{{ banner.message }}</span>
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
  props: ['user'],
  template: `
    <div class="login-controls">
      <a class="link" v-show="user == undefined" @click="onLoginClick">Log In</a>
      <a class="link" v-show="user != undefined">{{ user }}</a>
      <span style="margin: 0 3px">|</span>
      <a class="link" v-show="user == undefined" @click="onSignupClick">Sign Up</a>
      <a class="link" v-show="user != undefined" @click="onSignoutClick">Sign Out</a>
    </div>
  `,
  methods: {
    onLoginClick: function(e) {
      this.$emit('login:click');
    },
    onSignupClick: function(e) {
      this.$emit('signup:click');
    },
    onSignoutClick: function(e) {
      this.$emit('signout:click');
    }
  }
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
  props: ['loginData'],
  template: `
    <form style="margin: 0" @submit.prevent="onFormSubmit">
      <h2>Username</h2>
      <input type="text" class="text-field" :value="loginData.username" @input="onUserInput" />
      <h2 style="margin-top: 15px">Password</h2>
      <input type="password" class="text-field" :value="loginData.password" @input="onPassInput" />
      <input type="submit" class="button" value="Login" style="margin-top: 15px" />
    </form>
  `,
  methods: {
    onUserInput: function(e) {
      this.$emit('user:input', e.target.value);
    },
    onPassInput: function(e) {
      this.$emit('pass:input', e.target.value);
    },
    onFormSubmit: function(e) {
      this.$emit('form:submit');
    }
  }
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
  props: ['formData'],
  template: `
    <form @submit.prevent="onFormSubmit">
      <h2 style="margin-top: 15px">Username</h2>
      <input type="text" class="text-field" v-bind:value="formData.username" @input="onUserInput($event)" />
      <slot name="user-tooltip"></slot>
      <h2 style="margin-top: 15px">Password</h2>
      <input type="password" class="text-field" v-bind:value="formData.password" @input="onPassInput($event)" />
      <slot name="pass-tooltip"></slot>
      <input type="button" class="button button-cancel" value="Cancel" @click="onCancelClick" />
      <input type="submit" class="button" value="Create" style="margin-top: 20px; margin-left: 30px" />
    </form>
  `,
  methods: {
    onUserInput: function(e) {
      this.$emit('user:input', e.target.value);
    },
    onPassInput: function(e) {
      this.$emit('pass:input', e.target.value);
    },
    onCancelClick: function(e) {
      this.$emit('cancel:click');
    },
    onFormSubmit: function(e) {
      this.$emit('form:submit');
    }
  }
});

let BANNER_TYPE = {
  success: 0,
  failure: 1
};

let account = new Vue({
  el: '#loginApp',
  data: {
    test: 'saduhasdasd',
    loggedUser: undefined, //The current logged in username
    loginData: { //Login menu data
      username: undefined,
      password: undefined
    },
    formData: { //Signup menu data
      username: undefined,
      password: undefined
    },
    tooltips: {
      username: {
        show: true,
        message: 'hello'
      },
      password: {
        show: true,
        message: 'there'
      }
    },
    loginVis: false, //Visibility state of the login menu
    banner: {
      show: false,
      type: BANNER_TYPE.success,
      message: undefined
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
        if (response.status == 401) $('.login-menu').effect('shake', {distance: 8, times: 2}); this.loginData.password = undefined;
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
      this.banner.show = true;
      this.banner.type = type;
      this.banner.message = msg;
      let banner = this.banner;
      setTimeout(function() {
        banner.show = false;
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
